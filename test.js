let utils = require("./")

async function main() {
	let cookies = await utils.chromeGUIAuthentication(utils.UTAustinDestinations.UT_DIRECT_URL);
	console.table(cookies)
}

main()
