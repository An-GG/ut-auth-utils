import * as puppeteer from 'puppeteer';
import { URL } from 'url';
import { readFileSync, writeFileSync, existsSync } from 'fs';

export const UTAustinDestinations = {
    UT_DIRECT_URL:'https://utdirect.utexas.edu/',
    UT_CANVAS_URL:'https://utexas.instructure.com/'
}

export const DEFAULT_COOKIE_FILE = '/tmp/ut-auth-utils.cookies.json'

/**
 * Login graphically with Google Chrome.
 * @param relay_url The location from which the login request originates, ex. UT Direct or Canvas
 */
export async function chromeGUIAuthentication(relay_url: string, cookie_file?:string) {
    cookie_file = cookie_file ? cookie_file : DEFAULT_COOKIE_FILE;

    let old_cookies:puppeteer.Protocol.Network.Cookie[] = [];
    if (existsSync(cookie_file)) { old_cookies = JSON.parse(readFileSync(cookie_file).toString()) } 
    
    let chrome = await puppeteer.launch({ headless: false });
    let page = await chrome.newPage();
    
    
    await page.setCookie(...old_cookies);
    await page.goto(relay_url);

    let c = await _waitForCookies(page, chrome, relay_url);
    writeFileSync(cookie_file, JSON.stringify(c));
    return c;

}

async function _waitForCookies(page: puppeteer.Page, chrome: puppeteer.Browser, final_destination: string) {
    return new Promise<puppeteer.Protocol.Network.Cookie[]>(async (resolve, reject) => {
        await page.on('framenavigated', async (event) => {
            if ((new URL(page.url())).host == (new URL(final_destination)).host) {
                let res = await (await page.target().createCDPSession()).send('Network.getAllCookies');
                await chrome.close();
                resolve(res.cookies);
            }
        });
    });
}

