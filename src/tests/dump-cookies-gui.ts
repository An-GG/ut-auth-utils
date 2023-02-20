import { Protocol } from "puppeteer";
import { chromeGUIAuthentication, UT_DIRECT_URL } from "../auth-utils"

async function main() {
    let cookies = await chromeGUIAuthentication(UT_DIRECT_URL)
    console.log(JSON.stringify(cookies))
}

main();
