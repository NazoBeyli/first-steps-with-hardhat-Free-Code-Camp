// DIESER "MOCKS"-SCRIPT WIRD BENÖTIGT UM BEIM TESTEN DES GESAMTEN PROJECTES,
//  EIN PRICEFEED CONTRACT ZU SIMULIEREN DA : ->
//-> AUF LOCALHOST ODER HARDHAT KEIN PRICEFEED EXESTIERT.

//IMPORTS:
const { network } = require("hardhat")
const {
    developmentChains,
    DECIMALS,
    INITIAL_ANSWER
} = require("../helper-hardhat-config")

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()

    if (developmentChains.includes(network.name)) {
        log("local network detected!!! MOCKS WIRD DEPLOYED...")
        await deploy("MockV3Aggregator", {
            contract: "MockV3Aggregator",
            from: deployer,
            log: true,
            args: [DECIMALS, INITIAL_ANSWER] // BEI DEN ARGUMENTS MÜSSEN CONSTRUCTOR PARAMETER  FÜR MOCKV3Aggegator gepasst werden
        })
        log("MOCK WURDE DEPLOYED!!!")
        log("----------------------------------------------------")
    }
}

module.exports.tags = ["all", "mocks"]

/* 
const { network } = require("hardhat")

const DECIMALS = "8"
const INITIAL_PRICE = "200000000000" // 2000
module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId
    // If we are on a local development network, we need to deploy mocks!
    if (chainId == 31337) {
        log("Local network detected! Deploying mocks...")
        await deploy("MockV3Aggregator", {
            contract: "MockV3Aggregator",
            from: deployer,
            log: true,
            args: [DECIMALS, INITIAL_PRICE]
        })
        log("Mocks Deployed!")
        log("------------------------------------------------")
        log(
            "You are deploying to a local network, you'll need a local network running to interact"
        )
        log(
            "Please run `npx hardhat console` to interact with the deployed smart contracts!"
        )
        log("------------------------------------------------")
    }
}
module.exports.tags = ["all", "mocks"]
*/
