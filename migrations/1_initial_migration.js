const Migrations = artifacts.require("Migrations");
const AaveFlash = artifacts.require("AaveFlash");

module.exports = async function (deployer, network) {
  deployer.deploy(Migrations);
  try {
      let lendingPoolAddressesProviderAddress;

      switch(network) {
          case "mainnet": lendingPoolAddressesProviderAddress = "0xB53C1a33016B2DC2fF3653530bfF1848a515c8c5"; break
          case "mainnetFork":
          case "development": // For Ganache mainnet forks
              lendingPoolAddressesProviderAddress = "0xB53C1a33016B2DC2fF3653530bfF1848a515c8c5"; break
          case "ropsten":
          case "ropsten-fork":
              lendingPoolAddressesProviderAddress = "0x1c8756FD2B28e9426CDBDcC7E3c4d64fa9A54728"; break
          case "kovan":
          case "kovan-fork":
              lendingPoolAddressesProviderAddress = "0x506B0B2CF20FAA8f38a4E2B524EE43e1f4458Cc5"; break
          default:
              //throw Error(`Are you deploying to the correct network? (network selected: ${network})`)
              lendingPoolAddressesProviderAddress = "0xB53C1a33016B2DC2fF3653530bfF1848a515c8c5"; break
      }

      console.log(lendingPoolAddressesProviderAddress)

    //   await deployer.deploy(AaveFlash, lendingPoolAddressesProviderAddress)
  } catch (e) {
      console.log(`Error in migration: ${e.message}`)
  }
}