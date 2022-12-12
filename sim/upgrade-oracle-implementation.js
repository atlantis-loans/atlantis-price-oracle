/*
  npx hardhat run sim/upgrade-oracle-implementation.js --network localhost
*/

const { expect, web3, ethers } = require("hardhat");
const { ATLANTIS_PRICE_ORACLE_PROXY_MAINNET_ADDRESS } = require("../constants");

async function main() {
  [admin, add2] = await ethers.getSigners()

  const atlantisPriceOracleProxy = await ethers.getContractAt("AtlantisPriceOracleProxy", ATLANTIS_PRICE_ORACLE_PROXY_MAINNET_ADDRESS)

  let atlantisPriceOracle = await ethers.deployContract("AtlantisPriceOracle", [])

  let tx = await atlantisPriceOracleProxy._setPendingImplementation(atlantisPriceOracle.address)
  await tx.wait()

  tx = await atlantisPriceOracle._become(atlantisPriceOracleProxy.address)
  await tx.wait()

  // await hre.run("verify:verify", {
  //   address: atlantisPriceOracle.address
  // })

  console.log("Oracle implementation upgrade is done!")
}
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });