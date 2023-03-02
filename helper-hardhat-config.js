/* IN DIESEM SCRIPT SPEICHERE ICH VERSCHIEDENE NETWORKS 
MIT IHRER DAZUGEHÖRIGEN CHAINID UND DIE ADDRRESE 
DIE FÜR DIE ERMITTLUNG DES PRICEFEEDS BENÖTIGT WIRD */

const networkConfig = {
    5: {
        name: "goerli",
        ethUsdPriceFeed: "0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e"
    }
}

const developmentChains = ["hardhat", "localhost"]
const DECIMALS = 8 // BENÖTIGT FÜR "00-deploy-mocks-js" DA DIE BEIDEN VARIABEL PARAMETER des constructors für "MockV3Aggegator" sind
const INITIAL_ANSWER = 200000000

//HIER DRUNTER DER CODE UM DEN SCRIPT EXPORTIEREN ZU KÖNNEN
// DAMIT DER REST MEINES PROJECTES DAMIT ARBEITEN KANN:::

module.exports = {
    networkConfig,
    developmentChains,
    DECIMALS,
    INITIAL_ANSWER
}

/*const networkConfig = {
    31337: {
        name: "localhost",
    },
    // Price Feed Address, values can be obtained at https://docs.chain.link/docs/reference-contracts
    5: {
        name: "goerli",
        ethUsdPriceFeed: "0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e",
    },
}

const developmentChains = ["hardhat", "localhost"]

module.exports = {
    networkConfig,
    developmentChains,
}
*/
