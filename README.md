# signify-browser-extension (to be renamed)
Initial outline to be discussed this week

## Goals
* Be the only place to share secrets (passcode)
* Secure and simple codebase that can be audited to validate that the secret never leaves the extension and cannot be accessed by malicious web sites
* Connection with KERIA instances by configuration
* Communication with web pages
* Exposed features conditional to domain:
  * Untrusted domains: Only for authentication
  * Trusted domains: richer featureset
* Simple UI 

## Benefits
* No js injection into the extension
* Isolated execution environment
* Deplyment through stores provides:
  * Integrity guarantee
  * Publisher reputation
* Access to browser API

## Project organization
* This github repo
  * Issue, PRs, Discussions
* Discord channel
* Meetings
  * We will review things in the weekly KERI meetings
 
## Architecture
More info and diagram coming soon
* Browser Extension
  * background scripts (service worker)
  * signify-ts
    * leverages KERIA agent
  * UI/UX popup
  * manifest
* Web Pages
  * Page DOM
  * Injected content script (isolated execution env)
  * HTML-JS
 
## Features
* Connect to KERIA
* AuthenticateX (based on AID+VC)
  * List AIDs
  * List Credentials
