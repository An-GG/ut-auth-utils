import * as puppeteer from 'puppeteer';
import * as repl from 'repl';
import * as proc from 'process';
import { URL } from 'url';
import { JSDOM } from 'jsdom'

export const UTAustinDestinations = {
    UT_DIRECT_URL:'https://utdirect.utexas.edu/',
    UT_CANVAS_URL:'https://utexas.instructure.com/'
}


/**
 * Login graphically with Google Chrome.
 * @param relay_url The location from which the login request originates, ex. UT Direct or Canvas
 */
export async function chromeGUIAuthentication(relay_url: string, cookies?: {name:string, value:string, [k:string]:any}[]) {
    let chrome = await puppeteer.launch({
        headless: false
    });
    let page = await chrome.newPage();
    if (cookies) {
        for (let c of cookies) {
            page.setCookie({
                ...c,
                domain: "duosecurity.com"
            }); 

            page.setCookie({
                ...c,
                domain: "utexas.edu"
            }); 
        }
    }
    await page.goto(relay_url);

    return _waitForCookies(page, chrome, relay_url);
}

async function _waitForCookies(page: puppeteer.Page, chrome: puppeteer.Browser, final_destination: string) {
    return new Promise<puppeteer.Protocol.Network.Cookie[]>(async (resolve, reject) => {
        await page.on('framenavigated', async (event) => {
            if ((new URL(page.url())).host == (new URL(final_destination)).host) {
                let res = await page.cookies();
                await chrome.close();
                resolve(res);
            }
        });
    });
}

