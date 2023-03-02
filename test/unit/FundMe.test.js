//im "unit test" teste ich einzelne funktionen meines scriptes
//durch den befehl "yarn hardhat test" teste ich
//durch den befehl "yarn hardhat coverage" kann ich checken, welche objekte und welche lines noch getestet werden müssen

//imports
const { assert, expect } = require("chai")
const { deployments, ethers, getNamedAccounts, network } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")

//testen des ges."FundMe"-Contracts

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("FundMe", async function() {
          let fundme
          let deployer
          let mockV3Aggregator
          let getFunder
          const gesendeterWert = ethers.utils.parseEther("100") //variabel speichert durch ethers utility 1 ETH
          //beforeEach = was muss VOR einem test gemacht werden => hier: deployen test contracts
          beforeEach(async function() {
              //deploy fundMe-contract
              //using hardhat-deploy=> brauche "deployments"-Object von "hardhat"

              /*eine weitere mögichkeit den deployer account zu kriegen,
        ist über "ethers.getSigners()"... dieser befehl/funktion zieht aus "hardhat.config"
         BEI DER JEWEILIGEN NETWORKS die Addresse aus "[PRIVATE_KEY]" 
        const accounts = await ethers.getSigners()
        const accountZero = accounts[0] */

              deployer = (await getNamedAccounts()).deployer // AUS "hardhat.config" kriege ich den deployer, welcher and der NULLTEN stellen der "namend Accounts"  gelistet ist
              await deployments.fixture(["all"]) //fixture = eine funktion=> erlaubt mir alle scripts/codes in deploy folder zu runen, wewlche "all" als tags haben

              // weise der variabel den gerade deployten contract von line 17 zu
              // durch "getContract"- befehl erhalte ich den zu letzt deployten contract.
              // "ethers" kommt hier durch "hardhat"... funktion "getContract" kommt von "ethers"
              fundMe = await ethers.getContract("BitteSpenden", deployer)
              mockV3Aggregator = await ethers.getContract(
                  "MockV3Aggregator",
                  deployer
              )
          })

          //testen des constructors
          describe("constructor", async function() {
              it("setzt die priceFeed addresse richtig", async function() {
                  const antwort = await fundMe.welcherPreis()
                  assert.equal(antwort, mockV3Aggregator.address)
              })
          })
          describe("Spenden", async function() {
              it("soll fehlermeldung zeigen, falls zu wenig gespenden", async function() {
                  //testen: erwarten dass gewissen meldung reverted wird.
                  await expect(fundMe.spenden()).to.be.revertedWith(
                      "nicht genug gespendet"
                  )
              })
              it("updated  die gesendete menge im datastruktur getAddressezupeicherterMenge", async function() {
                  await fundMe.spenden({ value: gesendeterWert }) // spenden funktion mit einem wert callen
                  //variabel = die deployer addresse, welche in der liste mit dem gesendeten wert gespeichert ist
                  const response = await fundMe.getAddressezuGefundeterMenge(
                      deployer
                  )
                  //annehmen, dass die antwort von der gecallten funktion die gleiche ist, wie gespendete menge... to String macht aus einer "BigNumber" einen "string" mit einer zahl gespeichert
                  assert.equal(response.toString(), gesendeterWert.toString())
              })
              it("soll einen spender zum array hinzufügen", async function() {
                  await fundMe.spenden({ value: gesendeterWert })
                  const SPENDER = await fundMe.getFunder(0) //HIER CALLE ICH den ARRAY SPENDER in der 0ten stelle
                  assert.equal(SPENDER, deployer) //vergleiche ob der spender der gleiche wie der deployer ist
              })
          })
          describe("abzuheben", async function() {
              //DAMIT ich was abheben kann MUSS ich erstmal was in den contract spenden... ich brauche ja auch adressen im array UND für die mapping für die jewweilige addresse die gespendete menge
              beforeEach(async function() {
                  await fundMe.spenden({ value: gesendeterWert })
              })

              it("abheben ETH haben von einem einzigen spender", async function() {
                  //-------------------------------------------
                  //arangieren des test
                  //checken ob wir von einem einzigen spender abheben

                  /*ALS INFO: getBalance ist ein callbefehl auf die blockchain
            ==>der promise wird also type "BigNumber" sein. 
             => DAHER STATT + IMMER add() nutzen ...AU?ERDEM IMMER ".toString() dahinter schreiben*/

                  //contract kontostand ... provider =>datastore für benötigte info...getBalance=> befehl für die funktion für callen des kontostandes
                  const anfangsbalancevonContract = await fundMe.provider.getBalance(
                      fundMe.address
                  )
                  //deployer kontostand
                  const anfangsbalancevonDeployer = await fundMe.provider.getBalance(
                      deployer
                  )
                  //--------------------------------------------

                  //funktion/code/akt  des test
                  const zwischenspeicher = await fundMe.abzuheben() //callen des abzuheben funktion
                  const Receipt = await zwischenspeicher.wait(1) // AB HIER SOLLTE VON CONTRACT GELD ABGEHOBEN UND ZU DEPLOYER GESENDET WORDEN SEIN!
                  //DURCH BREAKPOINTS UND RUN AND DEBUG VIA JS => IN RECEIPT(TRANSACTIONRECEIPT) KANN ICH INFORMATIONEN GEWINNEN; DIE ICH DAFÜR NUTZEN KANN UM DIE GAS FEES ZU BESTIMMEN
                  const { gasUsed, effectiveGasPrice } = Receipt //HIER MIT DEN "{}"-syntax , kann ich OBJEKTE aus einer ANDEREN OBJEKt ziehen... das bedeutet diese line auch
                  const gaskosten = gasUsed.mul(effectiveGasPrice) //HIER WIEDER::: DA BIGNUMBER HIER INVOLVIERT STATT "*" das word "mul()"

                  const endBalancevondeployer = await fundMe.provider.getBalance(
                      // fundMe-contract hat einen objekt namens "provider"==> DIESER hat UNTER ANDEREM eine funktion namens "getBalance" ==> ausgabe des kontostandes der addresse ... ich hätte auch "ethers.provider" schreiben können
                      deployer
                  )
                  const endBalancevoncontract = await fundMe.provider.getBalance(
                      fundMe.address
                  )
                  //----------------------------------------------
                  //gascost

                  //annahme / vergleich des test
                  //annahme, dass endkontostand = 0, da alle überwiesen
                  assert.equal(endBalancevoncontract, 0)
                  //annahme, dass deployer kontostand = anfangskontostand von contract UND AUCH von DEPLOYER, da dieser ja geld drauf hatte.
                  assert.equal(
                      anfangsbalancevonContract
                          .add(anfangsbalancevonDeployer)
                          .toString(),
                      endBalancevondeployer.add(gaskosten).toString() //gaskosten mitkalkulieren , da beim abheben fee ensteht
                  )
              })

              /*it("soll receive/fallback ausführen, wenn keine daten behinhaltet werden.", async function() {
            const tx = deployer.sendTransaction({
                to: fundMe.address,
                data: "0x"
            })
            await expect(tx)
                .to.emit(fundMe, "Error")
                .withArgs("call of a non-existens function")
        })*/

              /* in diesem test werde ich mehrere spender haben 
        und werde testen ob ich mit mehreren spender abheben kann */
              it("erlaubt uns abzuheben von mehreren spendern", async function() {
                  //arangieren des test
                  const accounts = await ethers.getSigners() //getSigners => künstliche erschaffene ETH accounts
                  for (let i = 1; i < 6; i++) {
                      // HIER  durch den loop bis zu 6 accounts geschaffen... STARTEN MIT "1" WEIL "0" ist ja schon der deployer des contracts
                      const fundMeConnectedContract = await fundMe.connect(
                          //HIER: da der contract noch mit dem deployer connected ist,MUSS ich diesen mit den anderen künstlich geschaffenen accounts verbinden... es connected sich durch den loop mit der jeweiligen private key des accounts
                          accounts[i]
                      )
                      await fundMeConnectedContract.spenden({
                          value: gesendeterWert
                      }) // JETZT erst die funktion spenden, da jeder account nun mit dem contract verbunden ist
                  }
                  const anfangsbalancevonContract = await fundMe.provider.getBalance(
                      fundMe.address
                  )
                  //deployer kontostand
                  const anfangsbalancevonDeployer = await fundMe.provider.getBalance(
                      deployer
                  )

                  //act//action
                  const transactionResponse = await fundMe.abzuheben()
                  const Receipt = await transactionResponse.wait(1)
                  const { gasUsed, effectiveGasPrice } = Receipt
                  const gaskosten = gasUsed.mul(effectiveGasPrice)

                  //annahme/assert/expect
                  const endBalancevondeployer = await fundMe.provider.getBalance(
                      deployer
                  )
                  const endBalancevoncontract = await fundMe.provider.getBalance(
                      fundMe.address
                  )
                  assert.equal(endBalancevoncontract, 0)
                  assert.equal(
                      anfangsbalancevonContract
                          .add(anfangsbalancevonDeployer)
                          .toString(),
                      endBalancevondeployer.add(gaskosten).toString()
                  )

                  // SICHERSTELLEN dass die spender sich zurücksetzen wenn funds abgehoben.
                  await expect(fundMe.getFunder(0)).to.be.reverted // das hier soll einen fehler ausgeben

                  // hier soll er nach dem abheben einmal durch den loop wieder gehen und während des loops gucken ob wirklich alle indexstellen des spender mappings zurückgesetzt worden ist.
                  for (i = 1; i < 6; i++) {
                      assert.equal(
                          await fundMe.getAddressezuGefundeterMenge(
                              accounts[i].address
                          ),
                          0
                      )
                  }
              })

              it("erlaubt NUR den besitzer das geld abzuheben", async function() {
                  const accounts = await ethers.getSigners() //erschafft einen eth-acc
                  const attacker = accounts[1] //an der 1 stelle der beannten accs steht der attacker
                  const attackerconnectedcontract = await fundMe.connect(
                      attacker
                  ) //verbinden des contracts mit der adresse des attackierers
                  await expect(
                      attackerconnectedcontract.abzuheben()
                  ).to.be.revertedWith("BitteSpenden__NichtBesitzer") // ==> BEDEUTET WENN jemand andere versucht geld abzuheben, wird es automatische zurückgegeben
              })

              it("günstigeres gaseffizientes abheben", async function() {
                  //arangieren des test
                  const accounts = await ethers.getSigners() //getSigners => künstliche erschaffene ETH accounts
                  for (let i = 1; i < 6; i++) {
                      // HIER  durch den loop bis zu 6 accounts geschaffen... STARTEN MIT "1" WEIL "0" ist ja schon der deployer des contracts
                      const fundMeConnectedContract = await fundMe.connect(
                          //HIER: da der contract noch mit dem deployer connected ist,MUSS ich diesen mit den anderen künstlich geschaffenen accounts verbinden... es connected sich durch den loop mit der jeweiligen private key des accounts
                          accounts[i]
                      )
                      await fundMeConnectedContract.spenden({
                          value: gesendeterWert
                      }) // JETZT erst die funktion spenden, da jeder account nun mit dem contract verbunden ist
                  }
                  const anfangsbalancevonContract = await fundMe.provider.getBalance(
                      fundMe.address
                  )
                  //deployer kontostand
                  const anfangsbalancevonDeployer = await fundMe.provider.getBalance(
                      deployer
                  )

                  //act//action
                  const transactionResponse = await fundMe.guenstigeresAbheben()
                  const Receipt = await transactionResponse.wait(1)
                  const { gasUsed, effectiveGasPrice } = Receipt
                  const gaskosten = gasUsed.mul(effectiveGasPrice)

                  //annahme/assert/expect
                  const endBalancevondeployer = await fundMe.provider.getBalance(
                      deployer
                  )
                  const endBalancevoncontract = await fundMe.provider.getBalance(
                      fundMe.address
                  )
                  assert.equal(endBalancevoncontract, 0)
                  assert.equal(
                      anfangsbalancevonContract
                          .add(anfangsbalancevonDeployer)
                          .toString(),
                      endBalancevondeployer.add(gaskosten).toString()
                  )

                  // SICHERSTELLEN dass die spender sich zurücksetzen wenn funds abgehoben.
                  await expect(fundMe.getFunder(0)).to.be.reverted // das hier soll einen fehler ausgeben

                  // hier soll er nach dem abheben einmal durch den loop wieder gehen und während des loops gucken ob wirklich alle indexstellen des spender mappings zurückgesetzt worden ist.
                  for (i = 1; i < 6; i++) {
                      assert.equal(
                          await fundMe.getAddressezuGefundeterMenge(
                              accounts[i].address
                          ),
                          0
                      )
                  }
              })
          })
      })
