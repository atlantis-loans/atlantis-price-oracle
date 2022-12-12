/*
  npx hardhat run sim/get-underlying-price.js --network localhost
*/

const { expect, web3, ethers } = require("hardhat");
const {
    ATLANTIS_PRICE_ORACLE_PROXY_MAINNET_ADDRESS,
    BNBUSD_CHAINLINK_FEED_MAINNET_ADDRESS,
    BNBUSD_BINANCE_FEED_MAINNET_ADDRESS,
    TYPE_CHAINLINK, TYPE_BINANCE, ABNB_ADDRESS
} = require("../constants");

async function sim() {
    await hre.run("compile");
    const parseEther = ethers.utils.parseEther
    const [admin] = await ethers.getSigners();

    const atlantisPriceOracle = await ethers.getContractAt("AtlantisPriceOracle", ATLANTIS_PRICE_ORACLE_PROXY_MAINNET_ADDRESS)

    tx = await atlantisPriceOracle.setFeed(TYPE_CHAINLINK, "BNB", BNBUSD_CHAINLINK_FEED_MAINNET_ADDRESS)
    await tx.wait()

    tx = await atlantisPriceOracle.setFeed(TYPE_BINANCE, "BNB", BNBUSD_BINANCE_FEED_MAINNET_ADDRESS)
    await tx.wait()

    tx = await atlantisPriceOracle.setFeed(TYPE_BINANCE, "BTCB", "0x2AA284793B5b665302B3bF3e13Bd6Eac1F0ac2CF")
    await tx.wait()
    tx = await atlantisPriceOracle.setFeed(TYPE_CHAINLINK, "BTCB", "0x264990fbd0A4796A3E3d8E37C4d5F87a3aCa5Ebf")
    await tx.wait()

    console.log(await atlantisPriceOracle.getUnderlyingPrice(ABNB_ADDRESS))
    console.log(await atlantisPriceOracle.getUnderlyingPrice("0x59123a930E52b52EdB27F91135253331F36cd87c"))
}

sim()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
