const Web3 = require("web3")
const fs = require('fs');

const infura_id  = "2ccb8bad21b9427d8510a60a83d2ea77"
const web3 = new Web3(`https://rinkeby.infura.io/v3/${infura_id}`)

const wallet_secret = "3f44daea91e01c31d6424987e5282a8084e28a940472ddc2804d51c2ec761110"

// Add your Ethereum wallet to the Web3 object
web3.eth.accounts.wallet.add(wallet_secret)
const myWalletAddress = web3.eth.accounts.wallet[0].address

// `myContractAddress` is logged when running the deploy script in the root
// directory of the project. Run the deploy script prior to running this one.
const myContractAddress = "0xe4aB17A1b0c29491eC61A96977cA952a5CCBBE9f"
const myAbi = JSON.parse(fs.readFileSync('/home/bigdab/web3/build/contracts/AaveFlash.json')).abi;
const myContract = new web3.eth.Contract(myAbi, myContractAddress)

// Mainnet address of the underlying token contract. Example: Dai.
const underlyingMainnetAddress = "0x6b175474e89094c44da98b954eedeac495271d0f"
const underlyingAssetName = "DAI" // for the log output lines
const underlyingDecimals = 18 // Number of decimals defined in this ERC20 token's contract

// Web3 transaction information, we'll use this for every transaction we'll send
const fromMyWallet = {
  from: myWalletAddress,
  //value: web3.utils.toWei("1", "ether").toString(),
  gasLimit: web3.utils.toHex(5000000),
  gasPrice: web3.utils.toHex(20000000000), // use ethgasstation.info (mainnet only)
}

const main = async () => {

  const daiToSend = web3.utils.toWei("1000", "ether").toString()
  const assetArray = [underlyingMainnetAddress]
  const amountArray = [daiToSend]
  const modeArray = [0]

  // await myContract.methods.setAmountsToSwap(amountArray).send(fromMyWallet)
  // await myContract.methods.approvals().send(fromMyWallet)
  await myContract.methods
    .startFlashLoan(assetArray, amountArray, modeArray)
    .send(fromMyWallet)
  console.log("Started flash loan")

  let result = await myContract.methods.flashLoanedAmount().call()
  const dada = web3.utils.fromWei(result)
  console.log(`I flash loaned and borrowed ${dada} dai from Aave!`)

  let ra = await myContract.methods.ethBalance().call()
  const raForReading = web3.utils.fromWei(ra)
  console.log(`I swapped ${dada} for ${raForReading} amount of Eth`)

  let rasss = await myContract.methods.estimatedTokens().call()
  const rasssForReading = web3.utils.fromWei(rasss)
  console.log(
    `I swapped ${raForReading} for ${rasssForReading} amount of dai to repay AAVE`
  )

  //web3.eth.getBalance(myContractAddress).then(console.log)
}

main().catch((err) => {
  console.error(err)
})
