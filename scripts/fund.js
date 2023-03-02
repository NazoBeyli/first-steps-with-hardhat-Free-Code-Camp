// ein scirpt welches erlaubt meinem CODE zu interagieren/
//nützlich in der zukunft, wenn ich eines meiner contracts funden/reinspenden möchte

const { getnamedAccounts, ethers } = require("hardhat")

async function main() {
    const { deployer } = await getNamedAccounts()
    const fundMe = await ethers.getContract("BitteSpenden", deployer)
    console.log("Funding Contract...")
    const transactionResponse = await fundMe.spenden({
        value: ethers.utils.parseEther("100")
    })
    await transactionResponse.wait(1)
    console.log("FUNDED")
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error)
        process.exit(1)
    })

/*
const { ethers, getNamedAccounts } = require("hardhat")

async function main() {
  const { deployer } = await getNamedAccounts()
  const fundMe = await ethers.getContract("FundMe", deployer)
  console.log(`Got contract FundMe at ${fundMe.address}`)
  console.log("Funding contract...")
  const transactionResponse = await fundMe.fund({
    value: ethers.utils.parseEther("0.1"),
  })
  await transactionResponse.wait()
  console.log("Funded!")
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
*/
