//import //für den "run"-command von hardhat oder js für die automatische verifizierung
const { run } = require("hardhat")

const verify = async (contractAddress, args) => {
    console.log("verifying contract! PLEASE WAIT...")
    try {
        await run("verify:verify", {
            address: contractAddress,
            constructorArguments: args
        })
    } catch (e) {
        if (e.message.toLowerCase().includes("already verified")) {
            console.log("already verified!!!")
        } else {
            console.log(e)
        }
    }
}

module.exports = { verify }

/*const { run } = require("hardhat")

const verify = async (contractAddress, args) => {
  console.log("Verifying contract...")
  try {
    await run("verify:verify", {
      address: contractAddress,
      constructorArguments: args,
    })
  } catch (e) {
    if (e.message.toLowerCase().includes("already verified")) {
      console.log("Already verified!")
    } else {
      console.log(e)
    }
  }
}

module.exports = { verify }
*/
