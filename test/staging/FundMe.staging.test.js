// diese tests werden gemacht BEVOR WIR AUF EINER MAINNET (ETH BITCOIN XRP etc) deployen
// hier sicherstellen das ALLES RICHTIG LÄUFT
//tests sehen genauso aus wie auf localtest server

const { getNamedAccounts, ethers, network } = require("hardhat")
const { assert, expect } = require("chai")
const { developmentChains } = require("../../helper-hardhat-config")

developmentChains.includes(network.name)
    ? describe.skip
    : describe("FundMe", async function() {
          let deployer
          let fundme
          const wertgesendet = ethers.utils.parseEther("0.04")

          beforeEach(async function() {
              deployer = (await getNamedAccounts()).deployer
              fundme = await ethers.getContract("BitteSpenden", deployer)
          })
          it("erlaubt leute zu spenden und abzuheben", async function() {
              await fundme.spenden({ value: wertgesendet })
              await fundme.abzuheben()
              const endBalance = await fundme.provider.getBalance(
                  fundme.address
              )
              assert.equal(endBalance.toString(), "0")
          })
      })
