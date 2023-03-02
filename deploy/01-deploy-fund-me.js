//ALLE SCRIPTS DIE ICH IM DEPLOY-FOLDER HABE WERDEN GERUNT, BEI BEFEHL IN TERMINAL

//SIE WERDEN SO GERUNT WIE SIE NUMERIERT SIND

//IM SCRIPT SELBER DEFINIERE ICH WIE DEN FUNDME-CONTRACT DEPLOYED HABEN WILL
//BEI BEFEHLCALL" hardhat deploy" WIRD HARDHAT DIE FUNKTION CALLEN DIE ICH HIER SPEZIFIZIERE
//KEINE KLASSISCHE AUFTEILUNG IN 1.IMPORT; 2. MAINFUNCTION; 3. CALLING MAIN FUNCTION
//DEFINIEREN EINE FUNKTION UND EXPORTIEREN DIESE FUNKTION ALS STANDARD FUNKTION DIE "HARDHEAD DEPLOY" gucken soll (IM SCRIPT DANN: "module.exports.default")

// IM PRINZIP IST DER SCRIPT SINTAX SO AUFGEBAUT:
/* function deployFunc(hre) {   <- hre = hardhead runtime environment; als ein parameter
    console.log("hi")
}
module.exports.default = deployFunc
*/

//STATT ES WIE OBEN ZU DEFINIEREN UND ZU BENENNEN, WERDE ICH
//DIE FUNKTION ALS NAMENLOSE ASYNC FUNCTION SCRIPTEN
// ALSO: module.exports = async(hre) => {}  ::: HIER module.exports gleichstellen mit der async function die folgt!!!

//IMPORTS

const { network, deployments, getNamedAccounts } = require("hardhat")
const { networkConfig, developmentChains } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")
require("dotenv").config()

/*
module.exports = async(hre) => {  //"hre" steht für "hardhat runtime environment" und ist eine INSTANZ / OBJEKT welches ALLE FUNKTIONEN,VARIABEL UND OBJEKTE/SCRIPTE MIT WEITEREN FUNKTIONEN beinhaltet wenn ich ein test/script oder task laufen lasse. ES IST DIE INSZANZ DAS OBJEKT WELCHES DURCH HARDHAT AUSGEFÜHRT WIRD!!!
    const {getNamedAccounts, deployments} = hre //DIESE ZWEI VARIABEL/FUNKTIONEN/OBJEKTE WERDEN AUS hre gezogen und als PARAMETER für diese funktion genutzt... SIE BEINHALTET WEITER FUNKTIONEN/SCRIPTE ETC.
}

 DAS HIER IST DAS GLEICHE IST DAS GLEICHE WIE LINE 37 NUR AUSEINANDER geschrieben zum verständnis

*/

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments // ICH NUTZE "deployments" um 2 funktionen  rauszuzihene und zu kriegen: "deploy" und "log"
    const { deployer } = await getNamedAccounts() // "deployer" ist ein "account"/addresse welche ich aus der funktion "getNamendAccounts()" kriege... DAZU MUSS ICH WARTEN mit "await"
    const chainId = network.config.chainId
    /* "getNamendAccounts" ist eine funktion diese verschiedenen ADDRESSEN einen NAMEN/VARIABEL zuordnet ...aus dem array/liste der jeweiligen networks
                                                  dazu configuriere ich das bei "hardhat.config.js bei den jeweiligen networks indem ich scripte,
                                                    dass der deployer bei default/standart IMMER der 0te in dem array ist" */

    //const ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"] // IN JS: "[]"-klammern  bedeuten "at" also "von" oder "in"

    // HIER WIRD DEFINIERT WELCHE PRICEFEED ADDRESSE BENUTZT WERDEN SOLL UM DIE RICHTIGE OBJEKT/CONTRACT ZU KRIEGEN
    // FALLS AUF LOCALHOST/HARDHAT DANN MOCK durch "MOCKV3AGGREGATOR" , ANSONSTEN DURCH RICHTIGEN PRICEFEED AGGREGATOR
    let ethUsdPriceFeedAddress
    if (developmentChains.includes(network.name)) {
        const ethUsdAggregator = await deployments.get("MockV3Aggregator") // DURCH "get" kriege ich den zu letzt deployten contract HIER der "mockv3aggregator"
        ethUsdPriceFeedAddress = ethUsdAggregator.address
    } else {
        ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"]
    }

    /*AUF LOCALTESTING wie zb auf HARDHAT-> KEIN CONTRACT FÜR PRICEFEED
--> DAHER "MOCKS", DIESE HABEN MINIMAL FUNKTIONEN VON DEM CONTRACT/OBJEKT: */

    //UM ein vertrag zu deployen => Durch hardhat nur "deploy()" funktion nötig:
    const args = [ethUsdPriceFeedAddress]
    const fundMe = await deploy("BitteSpenden", {
        from: deployer,
        args: args, //Pricefeed addresse um durch das refactoring den price zu kriegen DA: ABI + ADDRESSE = interagierbarer contract!!!
        log: true,
        waitConfirmations: network.config.blockConfirmation || 1
    })

    /* hier kommt  der code part für die autoverifizierung
    hier will ich dass er es verifiziert WENN NICHT auf local network ("developmenChains")
    ABER STATT DEN CODE HIER ZU HABEN, WERDE ICH ES IM FOLDER "UTILS" EINFÜGEN    */
    if (
        !developmentChains.includes(network.name) &&
        process.env.ETHERSCAN_API_KEY
    ) {
        await verify(fundMe.address, args)
    }

    log("deployed Bitte Spenden")
    log("-------------------------------------------------")
}
module.exports.tags = ["all", "fundme"]

/*AB HIER VIELEICHT EIN TEST AUF LOCAL NETWORK: 
DAHER EMPFEHLENSWERT EIN MOCKS ZU SCRIPTEN.
"MOCKS" werden genutzt für "UNIT TESTINg"/ TESTEN EINER FUNKTION/
 EIN MOCKS KANN AUCH EIN ANDERE CONTRACT SEIN DER AUF DER LOCKAL 
 NETWORK NICHT EXISTIERT... z.b der ETH/USD Data Feed Contract,
 der den wechselkurs von ETH zu USD ausgibt... 
 diese CONTRACT/OBJEKT ist auf jeder blockchain ander -> daher immer neue addresse kopieren...

  KURZ: OBJEKT,KANN einfluss auf ges. Script haben-> um das testen zu können werden ALLE ANDEREN objekte/codes/contracts mit "mocks" ersetzt,
  welche das verhalten von den REALEN objekten simulieren. 
  ==> WIR KREIEREN HIER EINEN FAKE PRICE FEED CONTRACT   */

/*
//HIER WIE OBEN  in line 5 - 19 BESCHRIEBEN
module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId

    let ethUsdPriceFeedAddress
    if (chainId == 31337) {
        const ethUsdAggregator = await deployments.get("MockV3Aggregator")
        ethUsdPriceFeedAddress = ethUsdAggregator.address
    } else {
        ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"]
    }
    log("----------------------------------------------------")
    log("Deploying FundMe and waiting for confirmations...")
    const fundMe = await deploy("FundMe", {
        from: deployer,
        args: [ethUsdPriceFeedAddress],
        log: true,
        // we need to wait if on a live network so we can verify properly
        waitConfirmations: network.config.blockConfirmations || 1
    })
    log(`FundMe deployed at ${fundMe.address}`)

    if (
        !developmentChains.includes(network.name) &&
        process.env.ETHERSCAN_API_KEY
    ) {
        await verify(fundMe.address, [ethUsdPriceFeedAddress])
    }
}

module.exports.tags = ["all", "fundme"]
*/
