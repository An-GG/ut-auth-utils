# ut-auth-utils

Authenticate into UT Austin applications and retreive session cookies so you can make your own programatic API requests.

> **Note:** Google Chrome must be installed. 

A local copy of Chrome is not installed to keep things lean. 

**TODO**: Optionally allow installation of local Chrome binary.

## Install

```sh
$ npm i ut-auth-utils
```

## Usage

```ts
import { chromeProgrammaticAuthentication, UT_DIRECT_URL } from 'ut-auth-utils'

let cookies = await chromeProgrammaticAuthentication('UT EID', 'password', UT_DIRECT_URL);
// You will get 2FA request. Programmatic auth always picks 'Duo Push' as factor


// Now you can use the cookies to make your own API calls.
import fetch from 'node-fetch';

let serialized_cookies = cookies.map(ck=>ck.name+'='+ck.value).join('; ')
let result = await fetch('https://utdirect.utexas.edu/registration/classlist.WBX', { headers: { cookie:serialized_cookies } });
```

Alternatively, you can also authenticate graphically from a Chrome window. This method is simpler and more secure, as your node script never has to handle raw user credentials.

```ts
...

let cookies = await chromeGUIAuthentication(UT_DIRECT_URL);

```


