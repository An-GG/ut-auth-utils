import { chromeProgrammaticAuthentication, UT_DIRECT_URL } from "../auth-utils"
import { createInterface } from 'node:readline'
import * as proc from 'process'


async function main() {
    let cookies = await chromeProgrammaticAuthentication('ag75935', 'tAdve8-tazzyq', UT_DIRECT_URL);
    console.log(JSON.stringify(cookies))
}

let getUserInput = ()=>{ return new Promise<string>((resolve) => {
    createInterface(proc.stdin, proc.stdout).question('> ', (a)=>{
        resolve(a)
    });
})}

main();
