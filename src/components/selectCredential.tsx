import { useState, useEffect } from "react";
import { CredentialCard } from "@components/credentialCard";
import { IMessage } from "@pages/background/types";

export function SelectCredential(): JSX.Element {
  const [credentials, setCredentials] = useState([]);
  const fetchCredentials = async () => {
    const { data } = await chrome.runtime.sendMessage<IMessage<void>>({
      type: "fetch-resource",
      subtype: "credentials",
    });
    setCredentials(data.credentials);
  };

  const createSigninWithCredential = async (credential: any) => {
    await chrome.runtime.sendMessage<IMessage<any>>({
      type: "create-resource",
      subtype: "signin",
      data: {
        credential,
      },
    });
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.sendMessage(
        tabs[0].id!,
        { type: "tab", subtype: "reload-state" });
    });
    window.close();
  };

  useEffect(() => {
    fetchCredentials();
  }, []);

  return (
    <>
      {credentials.map((credential, index) => (
        <div key={index} className="my-2 mx-4">
          <div className=" relative opacity-80 hover:opacity-100">
            <CredentialCard credential={credential} />
            <button
              type="button"
              onClick={() => createSigninWithCredential(credential)}
              className=" absolute right-0 bottom-0 text-white bg-green font-medium rounded-full text-xs px-2 py-1 text-center me-2 mb-2"
            >
              {"Select >"}
            </button>
          </div>
        </div>
      ))}
    </>
  );
}