import puppeteer from 'puppeteer-core';
import { URL } from 'url';


export const UT_DIRECT_URL = 'https://utdirect.utexas.edu/';
export const UT_CANVAS_URL = 'https://utexas.instructure.com/';


/**
 * Login graphically with Google Chrome.
 * @param relay_url The location from which the login request originates, ex. UT Direct or Canvas
 */
export async function chromeGUIAuthentication(relay_url:string) {
    let chrome = await puppeteer.launch({
        channel: 'chrome',
        headless: false,
        defaultViewport: null
    });
    let page = await chrome.newPage();
    await page.goto(relay_url);

    return _waitForCookies(page, chrome, relay_url);
}

/**
 * Login programmatically with Google Chrome.
 * Note: Duo 2FA will still require user input.
 */
export async function chromeProgrammaticAuthentication(username:string, password:string, relay_url:string) {

   let chrome = await puppeteer.launch({
      channel: 'chrome',
   });
   let page = await chrome.newPage();
   await page.goto(relay_url);
   await page.waitForNavigation();
   await page.waitForSelector('.loginForm');
   await page.type('#username', username);
   await page.type('#password', password);
   await page.click('input[type=submit]');
   
   // form error watchdog
   (async ()=>{
       let err_element = await page.waitForSelector('.form-error')
       let err_text = await err_element.evaluate(el => el.textContent, err_element);
       throw new Error('Login failed. Maybe invalid credentials?\n\nClient Message: \''+err_text+'\'\n\n');
    })();

   await page.waitForFrame(async (f)=>{
      return f.url().match(/https:\/\/.+\.duosecurity\.com\/frame\/prompt/) != null;
   });
   
   let duoframe = page.frames()[1];
   await duoframe.$eval('#auth_methods > fieldset:nth-child(1) > div.row-label.push-label > button', (el)=>{
     (el as HTMLButtonElement).click(); 
   });

   return _waitForCookies(page, chrome, relay_url);
}

async function _waitForCookies(page:puppeteer.Page, chrome:puppeteer.Browser, final_destination: string) {
    return new Promise<puppeteer.Protocol.Network.Cookie[]>(async (resolve, reject)=>{
        await page.on('framenavigated', async (event)=>{
            if ((new URL(page.url())).host == (new URL(final_destination)).host) {
                let res = await page.cookies();
                await chrome.close();
                resolve(res);
            }
        });
    });
}




