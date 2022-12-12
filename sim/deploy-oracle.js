/*
  npx hardhat run sim/deploy-oracle.js --network localhost
*/

const { expect, web3, ethers } = require("hardhat");

async function main() {
  [admin, add2] = await ethers.getSigners()

  const atlantisPriceOracleProxy = await ethers.deployContract("AtlantisPriceOracleProxy", [])
  console.log("AtlantisPriceOracleProxy", atlantisPriceOracleProxy.address)

  let atlantisPriceOracle = await ethers.deployContract("AtlantisPriceOracle", [])
  console.log(atlantisPriceOracle.address)

  // Add vault to vault proxy
  let tx = await atlantisPriceOracleProxy._setPendingImplementation(atlantisPriceOracle.address)
  await tx.wait()

  tx = await atlantisPriceOracle._become(atlantisPriceOracleProxy.address)
  await tx.wait()

  await hre.run("verify:verify", {
    address: atlantisPriceOracleProxy.address
  })

  await hre.run("verify:verify", {
    address: atlantisPriceOracle.address
  })

  console.log("Atlantis price oracle proxy", atlantisPriceOracleProxy.address)
}
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });