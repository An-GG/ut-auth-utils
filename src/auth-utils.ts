import * as puppeteer from 'puppeteer';
import * as repl from 'repl';
import * as proc from 'process';
import { URL } from 'url';
import { JSDOM } from 'jsdom'

export const UT_DIRECT_URL = 'https://utdirect.utexas.edu/';
export const UT_CANVAS_URL = 'https://utexas.instructure.com/';


/**
 * Login graphically with Google Chrome.
 * @param relay_url The location from which the login request originates, ex. UT Direct or Canvas
 */
export async function chromeGUIAuthentication(relay_url: string) {
    let chrome = await puppeteer.launch({
        //channel: 'chrome',
        headless: false
        //defaultViewport: null
    });
    let page = await chrome.newPage();
    await page.goto(relay_url);

    return _waitForCookies(page, chrome, relay_url);
}

var dbg = {
    dbgmode: true,
    delay: (n:number)=>{ return new Promise((resolve)=>{
        setTimeout(resolve, n);
    })},
    activeREPL: {} as repl.REPLServer,
    ctx: {} as { [k:string]:any }
}
var msg = (s:string)=>{
   if (dbg.dbgmode) { console.log(s); } 
}

var util: any = {}

var injectREPL = async (context?:typeof dbg.ctx)=>{
    dbg.activeREPL = repl.start({ useGlobal: true, input: proc.stdin, output: proc.stdout });
    dbg.ctx = context ? context : {}

    let getctx = (passThis:{ [k:string]:string })=>{
        for (let k in dbg.ctx) {
            passThis[k]=dbg.ctx[k];
        }
    }
    dbg.activeREPL.write('let getctx = ' + getctx.toString() + '\n');
    dbg.activeREPL.write('getctx(this)\n');
    await dbg.delay(99000000);
}

util.getSrc = async (page: puppeteer.Page) => {
    let src = await page.evaluate("(()=>{return window.document.body.outerHTML})();");
    return (src as string);
}

util.getOtherOptionsButton = async (page: puppeteer.Page) => {
    let btns = await page.$$('button')
    let opts = []
    for (let b of btns) {
        let p = (await (await b.getProperty('textContent')).jsonValue())
        if ('Other options' == p) {
            opts.push(b)
        }
    }
    return opts
}

(global as any).dbg = dbg

/**
 * Login programmatically with Google Chrome.
 * 
 * Choose between phone call, text message, or duo push as preferred Duo 2 factor authentication method
 * By default, will use phone call as fallback.
 */
export async function chromeProgrammaticAuthentication(username: string, password: string, relay_url: string, preferred_2fa_name?: 'Phone call' | 'Text message passcode' | 'Duo Push') {

    let chrome = await puppeteer.launch({
        channel: 'chrome',
        headless: false,
    });
    let page = await chrome.newPage();
    await page.goto(relay_url);
    await page.waitForNavigation();
    await page.waitForSelector('.loginForm');
    await page.type('#username', username);
    await page.type('#password', password);
    await page.click('input[type=submit]');

    // form error watchdog
    let err_watch = ((async () => {
        let err_element = await page.waitForSelector('.form-error', { timeout: 0 });
        let err_text = await err_element.evaluate(el => el.textContent, err_element);
        throw new Error('Login failed. Maybe invalid credentials?\n\tUT Direct Error Message: \'' + err_text + '\'\n\n');
    })());

    msg('waiting for duo frame')
    await page.waitForFrame(async (f) => {
        return f.url().includes('frame/v4/auth/prompt');
    }, { timeout: 0 });
    msg('done waiting for duo frame')
   

    await dbg.delay(1000); 

    let ctx = {} as any

    ctx.findOtherOptionsButton = () => {
        for (const a of document.querySelectorAll("a")) {
            if (a.textContent.includes("Other options")) {
                console.log("found!!");
                return ('abnnmm' + a.textContent)

            }
        }
    }
    ctx.findOtherOptionsButtonRunner = async ()=>{await page.evaluate(ctx.findOtherOptionsButton.toString())}

    
    await ctx.findOtherOptionsButtonRunner(); 

    await injectREPL({ chrome, page, ctx });
    

    //let elm = parser(src as string);
   
    
    /*msg('waiting for auth mode')
    let linkelms = await duoframe.$$('a'); 
    
    for (let e of linkelms) {
        console.log(await e.getProperty('textContent'));
    }
    await duoframe.$eval('#auth_methods > fieldset:nth-child(1) > div.row-label.push-label > button', (el) => {
        (el as HTMLButtonElement).click();
    });
    msg('done waiting for auth mode')

    return _waitForCookies(page, chrome, relay_url);
    */
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

