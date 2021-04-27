const Web3 = require("web3")

const infura_id  = "2ccb8bad21b9427d8510a60a83d2ea77"
const web3 = new Web3(`https://ropsten.infura.io/v3/${infura_id}`)

const walletSecret = "3f44daea91e01c31d6424987e5282a8084e28a940472ddc2804d51c2ec761110"

web3.eth.accounts.wallet.add(walletSecret)
const walletAddress = web3.eth.accounts.wallet[0].address

const addressToCall = "0xcbbfbafedb0eb83016d2a96a4e80d30b20fa3e30"
const abi = [{"constant": false,"inputs": [{"name": "hash","type": "bytes32"}],"name": "apply","outputs": [],"payable": false,"stateMutability": "nonpayable","type": "function"},{"constant": true,"inputs": [{"name": "email","type": "string"}],"name": "getApplicationID","outputs": [{"name": "","type": "uint256"}],"payable": false,"stateMutability": "view","type": "function"}]

const contractToCall = new web3.eth.Contract(abi, addressToCall)

const fromWallet = {
  from: walletAddress,
  //value: web3.utils.toWei("1", "ether").toString(),
  gasLimit: web3.utils.toHex(5000000),
  gasPrice: web3.utils.toHex(20000000000), // use ethgasstation.info (mainnet only)
}

const main = async () => {

//   let result = await contractToCall.methods.apply(web3.utils.keccak256("culda@protonmail.com")).send(fromWallet)
//   const res = web3.utils.fromWei(result)
//   console.log(res)

  let id = await contractToCall.methods.getApplicationID("culda@protonmail.com").call()
  let res = web3.utils.fromWei(id)
  console.log(res)

}

main().catch((err) => {
  console.error(err)
})
