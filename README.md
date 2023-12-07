# signify-browser-extension
Initial overview presented at the 2023-12-07 Thursday KERI dev meeting by Rodolpho Miranda. See slides are [here](https://docs.google.com/presentation/d/1zRbctFqH19HRYA2SRCrlyGZZ7KR830wUobjylHst3SY/edit?usp=sharing).

## Support
Funding for the initial work was provided by [Provenant](https://provenant.net/) in their [PB311.1 bounty](https://docs.google.com/document/d/1mq82RDRGfoOMCs8sR8Cuj_hMC5i1_aP7e6DVqp8o13g/edit?usp=sharing)

## Goals
* Be the only place to share secrets (passcode)
* Secure and simple codebase that can be audited to validate that the secret never leaves the extension and cannot be accessed by malicious web sites
* Adopt latest manifest v3
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
* This Github repo
  * Issue, PRs, Discussions
* Discord channel
* Meetings
  * We will review progress in the weekly KERI dev meetings
 
## Architecture
<img width="1063" alt="image" src="https://github.com/2byrds/signify-browser-extension/assets/681493/23bb6d6f-7e3a-46c7-a5be-6e46cd27f0c5">

* Browser Extension
  * background scripts (service worker)
  * signify-ts
    * leverages KERIA agent
  * UI/UX popup
  * manifest v3
* Web Pages
  * Page DOM
  * Injected content script (isolated execution env)
  * HTML-JS
 
## Features
* Connect to KERIA
 * configuration URL
* AuthenticateX (based on AID+VC)
  * List AIDs
  * List Credentials
  * Persistence of web associations
  * Management UI override (tbd)
