import { browserStorageService } from "@pages/background/services/browser-storage";
import { configService } from "@pages/background/services/config";
import { userService } from "@pages/background/services/user";
import { signifyService } from "@pages/background/services/signify";
import { IMessage, IIdentifier, ICredential } from "@config/types";
import { senderIsPopup } from "@pages/background/utils";
import { removeSlash, getCurrentDomain } from "@pages/background/utils";
import {
  updateDomainAutoSigninByIndex,
  getSigninsByDomain,
  deleteSigninByIndex,
} from "@pages/background/signins-utils";

console.log("Background script loaded");

chrome.runtime.onInstalled.addListener(function (object) {
  if (object.reason === chrome.runtime.OnInstalledReason.INSTALL) {
    console.log("Signify Browser Extension installed");
  }
});

// Listener to handle internal messages from content scripts from active tab and popup
chrome.runtime.onMessage.addListener(function (
  message: IMessage<any>,
  sender,
  sendResponse
) {
  (async () => {
    // Handle mesages from content script on active tab
    if (sender.tab && sender.tab.active) {
      console.log(
        "Message received from content script at " +
          sender.tab.url +
          " " +
          message.type +
          ":" +
          message.subtype
      );

      if (
        message.type === "vendor-info" &&
        message.subtype === "get-vendor-data"
      ) {
        const vendorData = await configService.getData();
        sendResponse({ data: { vendorData } });
      }

      if (
        message.type === "authentication" &&
        message.subtype === "check-agent-connection"
      ) {
        const isConnected = await signifyService.isConnected();
        sendResponse({ data: { isConnected, tabUrl: sender?.tab.url } });
      }

      if (
        message.type === "authentication" &&
        message.subtype === "get-signed-headers"
      ) {
        const origin = sender.tab.url!;
        console.log(message.data.signin);

        const signedHeaders = await signifyService.signHeaders(
          message.data.signin.identifier
            ? message.data.signin.identifier.name
            : message.data.signin.credential.issueeName,
          origin
        );
        let jsonHeaders: { [key: string]: string } = {};
        for (const pair of signedHeaders.entries()) {
          jsonHeaders[pair[0]] = pair[1];
        }
        sendResponse({
          data: {
            headers: jsonHeaders,
            credential: message.data.signin.credential
              ? message.data.signin.credential
              : null,
          },
        });
      }

      if (
        message.type === "fetch-resource" &&
        message.subtype === "tab-signin"
      ) {
        const signins = await getSigninsByDomain(removeSlash(sender.url));
        const autoSigninObj = signins?.find((signin) => signin.autoSignin);
        sendResponse({ data: { signins: signins ?? [], autoSigninObj } });
      }

      // Handle messages from Popup
    } else if (senderIsPopup(sender)) {
      console.log(
        "Message received from browser extension: " +
          message.type +
          "-" +
          message.subtype
      );

      if (
        message.type === "authentication" &&
        message.subtype === "check-agent-connection"
      ) {
        const isConnected = await signifyService.isConnected();
        sendResponse({ data: { isConnected } });
      }

      if (
        message.type === "authentication" &&
        message.subtype === "disconnect-agent"
      ) {
        await signifyService.disconnect();
        await userService.removePasscode();
        sendResponse({ data: { isConnected: false } });
      }

      if (
        message.type === "authentication" &&
        message.subtype === "connect-agent"
      ) {
        const resp = await signifyService.connect(
          message.data.agentUrl,
          message.data.passcode
        ) as any;
        if (resp?.error) {
          // TODO: improve error messages
          // Current messages are not descrptive enough e.g
          // bran must be 21 characters
          // agent does not exist for controller <controller-id>
          // using custom error message for now instead of resp?.error?.message

          sendResponse({
            error: {
              code: 404,
              message: resp?.error?.message,
            },
          });
        } else {
          await userService.setPasscode(message.data.passcode);
          sendResponse({ data: { success: true } });
        }
      }
    }

    if (message.type === "create-resource" && message.subtype === "signin") {
      const signins = (await browserStorageService.getValue(
        "signins"
      )) as any[];
      const currentDomain = await getCurrentDomain();

      const { identifier, credential } = message.data;
      const signinObj = {
        identifier,
        credential,
        createdAt: new Date().getTime(),
        updatedAt: new Date().getTime(),
        domain: currentDomain!.origin,
      };
      if (signins && signins?.length) {
        await browserStorageService.setValue("signins", [
          ...signins,
          signinObj,
        ]);
      } else {
        await browserStorageService.setValue("signins", [signinObj]);
      }
      const storageSignins = await browserStorageService.getValue("signins");
      sendResponse({ data: { signins: storageSignins } });
    }
    if (
      message.type === "create-resource" &&
      message.subtype === "identifier"
    ) {
      try {
        const resp = await signifyService.createAID(message.data.name);
        sendResponse({ data: { ...(resp ?? {}) } });
      } catch (error: any) {
        const errorMsg = JSON.parse(error?.message ?? "");
        sendResponse({
          error: { code: 404, message: errorMsg?.title },
        });
      }
    }
    if (
      message.type === "fetch-resource" &&
      message.subtype === "identifiers"
    ) {
      const identifiers = await signifyService.listIdentifiers();
      sendResponse({ data: { aids: identifiers?.aids ?? [] } });
    }

    if (message.type === "fetch-resource" && message.subtype === "signins") {
      const signins = await browserStorageService.getValue("signins");
      sendResponse({
        data: {
          signins: signins ?? [],
        },
      });
    }

    if (
      message.type === "update-resource" &&
      message.subtype === "auto-signin"
    ) {
      const resp = await updateDomainAutoSigninByIndex(
        message?.data?.index,
        message?.data?.signin
      );
      sendResponse({
        data: {
          ...resp,
        },
      });
    }

    if (message.type === "delete-resource" && message.subtype === "signins") {
      const resp = await deleteSigninByIndex(message?.data?.index);
      sendResponse({
        data: {
          ...resp,
        },
      });
    }

    if (
      message.type === "fetch-resource" &&
      message.subtype === "credentials"
    ) {
      var credentials = await signifyService.listCredentials();
      const indentifiers = await signifyService.listIdentifiers();
      console.log(indentifiers.aids);
      // Add holder name to credential
      credentials?.forEach((credential: ICredential) => {
        const issueePrefix = credential.sad.a.i;
        const aidIssuee = indentifiers.aids.find((aid: IIdentifier) => {
          return aid.prefix === issueePrefix;
        });
        credential.issueeName = aidIssuee.name;
      });

      sendResponse({ data: { credentials: credentials ?? [] } });
    }
  })();

  // return true to indicate chrome api to send a response asynchronously
  return true;
});

// Listener to handle external messages from allowed web pages with auto signin
chrome.runtime.onMessageExternal.addListener(function (
  message,
  sender,
  sendResponse
) {
  (async () => {
    console.log("Message received from external source: ", sender);
    console.log("Message received from external request: ", message);

    if (
      message.type === "fetch-resource" &&
      message.subtype === "auto-signin-signature"
    ) {
      // Validate that message comes from a page that has a signin
      const origin = removeSlash(sender.url);
      const signins = await getSigninsByDomain(origin);
      console.log("signins", signins);
      const autoSignin = signins?.find((signin) => signin.autoSignin);
      if (!signins?.length || !autoSignin) {
        sendResponse({
          error: { code: 404, message: "auto signin not found" },
        });
        return;
      }

      const signedHeaders = await signifyService.signHeaders(
        // sigin can either have identifier or credential
        autoSignin?.identifier
          ? autoSignin?.identifier?.name
          : autoSignin?.credential?.issueeName,
        origin
      );
      let jsonHeaders: { [key: string]: string } = {};
      for (const pair of signedHeaders.entries()) {
        jsonHeaders[pair[0]] = pair[1];
      }
      sendResponse({ data: { headers: jsonHeaders } });
    }
  })();

  // return true to indicate chrome api to send a response asynchronously
  return true;
});
