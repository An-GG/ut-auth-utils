# ut-auth-utils

Authenticate into UT Austin applications and retrieve session cookies so you can make your own programmatic API requests.

> **Warning:** Chromium is installed as a required dependency as part of the puppeteer module.

## Install

```sh
$ npm i ut-auth-utils
```

## Usage

```ts
import { chromeGUIAuthentication, UTAustinDestinations } from 'ut-auth-utils'

let cookies = await chromeGUIAuthentication(UUTAustinDestinations.UT_DIRECT_URL);

// Now you can use the cookies to make your own API calls.
import fetch from 'node-fetch';

let serialized_cookies = cookies.map(ck=>ck.name+'='+ck.value).join('; ')
let result = await fetch('https://utdirect.utexas.edu/registration/classlist.WBX', { headers: { cookie:serialized_cookies } });
```

A previous version of this module offered `chromeProgrammaticAuthentication` for headless, automated login. This has been removed in favor of GUI authentication for improved security and robustness. 

To avoid having to enter your credentials every time you perform `chromeGUIAuthentication`, use the optional `cookies` parameter to preload cookies from a past, recent session.
