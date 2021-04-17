#%%
from web3 import Web3
import json
from eth_utils import to_bytes
from eth_abi import encode_single, encode_abi

#kovan
infura_url = "https://rinkeby.infura.io/v3/2ccb8bad21b9427d8510a60a83d2ea77"

#local
# infura_url = "http://127.0.0.1:9545"

web3 = Web3(Web3.HTTPProvider(infura_url))
web3.isConnected()

#kovan
wallet_address = "0xAf6cd7b41224a9F2c0350932FbDAFDbe1E636Cd2"
wallet_secret = "3f44daea91e01c31d6424987e5282a8084e28a940472ddc2804d51c2ec761110"

#local
# wallet_address = web3.toChecksumAddress("0x949efdf3f90bf5671059cb2d825264079609213b")
# wallet_secret = "bf8a1120851793ff141c6ddeaa61ff3580c2bc57139c2a22e974d0ed7f89abd9"

#kovan
contract_address = "0xe4aB17A1b0c29491eC61A96977cA952a5CCBBE9f"

#local
# contract_address = "0xca694C521825e20c4127e0ffe8c7c9a164B3E7E8"

with open('build/contracts/AaveFlash.json') as f:
    contract_abi = json.load(f)['abi']

contract = web3.eth.contract(address = contract_address, abi = contract_abi)
nonce = web3.eth.get_transaction_count(wallet_address)

myDataEncoded = encode_abi(["address", "uint"],["0x0000000000000000000000000000000000000000", 42])

tx = contract.functions.startFlashLoan(
	web3.toChecksumAddress("0xc4375b7de8af5a38a93548eb8453a498222c4ff2"),
	1000000000000000000,
    myDataEncoded
).buildTransaction({
    'chainId': 4,
    'gas': 70000,
    'gasPrice': web3.toWei('1', 'gwei'),
    'nonce': nonce
})

signed_tx = web3.eth.account.sign_transaction(tx, private_key=wallet_secret)

print(signed_tx.hash)
print(web3.toHex(web3.keccak(signed_tx.rawTransaction)))

web3.eth.send_raw_transaction(signed_tx.rawTransaction)


