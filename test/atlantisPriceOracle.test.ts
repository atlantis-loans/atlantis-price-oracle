import { ethers } from "hardhat";
import { smock, MockContract, FakeContract } from "@defi-wonderland/smock";
import { AddressZero } from "../utils/address-zero";
import BigNumber from "bignumber.js";
import { TYPE_CHAINLINK, TYPE_BINANCE, BNBUSD_BINANCE_FEED_MAINNET_ADDRESS, BNBUSD_CHAINLINK_FEED_MAINNET_ADDRESS, ABNB_ADDRESS, AATL_ADDRESS, ATL_ADDRESS, ABTC_ADDRESS, BTCUSD_CHAINLINK_FEED_MAINNET_ADDRESS, BTC_ADDRESS, BTCUSD_BINANCE_FEED_MAINNET_ADDRESS } from "../constants";
import chai from "chai";

const { expect } = chai;
chai.use(smock.matchers);

import {
  AtlantisPriceOracle,
  AtlantisPriceOracle__factory,
  AggregatorV2V3Interface,
  IAToken,
  IERC20
} from "../typechain-types"
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

describe("Test Atlantis Price Oracle", () => {
  let admin: SignerWithAddress;
  let atlantisPriceOracle: MockContract<AtlantisPriceOracle>;
  let bnbBinanceFeed: FakeContract<AggregatorV2V3Interface>;
  let bnbChainlinkFeed: FakeContract<AggregatorV2V3Interface>;
  let btcChainlinkFeed: FakeContract<AggregatorV2V3Interface>;
  let btcBinanceFeed: FakeContract<AggregatorV2V3Interface>;
  let aBNB: FakeContract<IAToken>;
  let aATL: FakeContract<IAToken>;
  let atl: FakeContract<IERC20>;
  let aBTC: FakeContract<IAToken>;

  before(async () => {
    [admin] = await ethers.getSigners();

    const atlantisPriceOracleFactory = await smock.mock<AtlantisPriceOracle__factory>('AtlantisPriceOracle');
    atlantisPriceOracle = await atlantisPriceOracleFactory.deploy();
    await atlantisPriceOracle.setVariable('admin', admin.address);

    await atlantisPriceOracle.connect(admin).setFeed(TYPE_BINANCE, "BNB", BNBUSD_BINANCE_FEED_MAINNET_ADDRESS)
    await atlantisPriceOracle.connect(admin).setFeed(TYPE_CHAINLINK, "BNB", BNBUSD_CHAINLINK_FEED_MAINNET_ADDRESS)
    await atlantisPriceOracle.connect(admin).setFeed(TYPE_BINANCE, "BTC", BTCUSD_BINANCE_FEED_MAINNET_ADDRESS)
    await atlantisPriceOracle.connect(admin).setFeed(TYPE_CHAINLINK, "BTC", BTCUSD_CHAINLINK_FEED_MAINNET_ADDRESS)

    bnbBinanceFeed = await smock.fake<AggregatorV2V3Interface>('AggregatorV2V3Interface', { address: BNBUSD_BINANCE_FEED_MAINNET_ADDRESS });
    bnbBinanceFeed.decimals.returns(18)

    bnbChainlinkFeed = await smock.fake<AggregatorV2V3Interface>('AggregatorV2V3Interface', { address: BNBUSD_CHAINLINK_FEED_MAINNET_ADDRESS });
    bnbChainlinkFeed.decimals.returns(18)

    btcChainlinkFeed = await smock.fake<AggregatorV2V3Interface>('AggregatorV2V3Interface', { address: BTCUSD_CHAINLINK_FEED_MAINNET_ADDRESS });
    btcChainlinkFeed.decimals.returns(18)

    btcBinanceFeed = await smock.fake<AggregatorV2V3Interface>('AggregatorV2V3Interface', { address: BTCUSD_BINANCE_FEED_MAINNET_ADDRESS });
    btcBinanceFeed.decimals.returns(18)

    aBNB = await smock.fake<IAToken>("IAToken", { address: ABNB_ADDRESS })
    aBNB.symbol.returns("aBNB")

    aATL = await smock.fake<IAToken>("IAToken", { address: AATL_ADDRESS })
    aATL.symbol.returns("aATL")
    aATL.underlying.returns(ATL_ADDRESS)

    aBTC = await smock.fake<IAToken>("IAToken", { address: ABTC_ADDRESS })
    aBTC.symbol.returns("aBTC")
    aBTC.underlying.returns(BTC_ADDRESS)

    atl = await smock.fake<IERC20>("IERC20", { address: ATL_ADDRESS })
    atl.symbol.returns("ATL")
    atl.decimals.returns(18)

    atl = await smock.fake<IERC20>("IERC20", { address: BTC_ADDRESS })
    atl.symbol.returns("BTC")
    atl.decimals.returns(18)
  });

  it("revert if the address of a feed is empty or from the caller contract", async () => {
    await expect(
      atlantisPriceOracle.connect(admin).setFeed(TYPE_BINANCE, "BNB", AddressZero()),
    ).to.be.revertedWith("invalid feed address");

    await expect(
      atlantisPriceOracle.connect(admin).setFeed(TYPE_BINANCE, "BNB", atlantisPriceOracle.address),
    ).to.be.revertedWith("invalid feed address");
  });

  describe("Test getOraclePrice method", () => {
    it("return price of BNB from only single feed", async () => {
      bnbBinanceFeed.latestRoundData.returns({ roundId: 0, answer: new BigNumber(280).toString(), startedAt: 0, updatedAt: 0, answeredInRound: 0 })

      expect(await atlantisPriceOracle.getOraclePrice("BNB"))
        .to.equal(new BigNumber(280).toString());
    });

    it("return corract average price based on two different oracle prices", async () => {
      bnbBinanceFeed.latestRoundData.returns({ roundId: 0, answer: new BigNumber(280).toString(), startedAt: 0, updatedAt: 0, answeredInRound: 0 })
      bnbChainlinkFeed.latestRoundData.returns({ roundId: 0, answer: new BigNumber(290).toString(), startedAt: 0, updatedAt: 0, answeredInRound: 0 })

      expect(await atlantisPriceOracle.getOraclePrice("BNB"))
        .to.equal(new BigNumber(285).toString());
    });

    it("return corract average price based on one oracle price", async () => {
      bnbBinanceFeed.latestRoundData.returns({ roundId: 0, answer: 0, startedAt: 0, updatedAt: 0, answeredInRound: 0 })
      bnbChainlinkFeed.latestRoundData.returns({ roundId: 0, answer: new BigNumber(290).toString(), startedAt: 0, updatedAt: 0, answeredInRound: 0 })

      expect(await atlantisPriceOracle.getOraclePrice("BNB"))
        .to.equal(new BigNumber(290).toString());
    });

    it("revert if average price can't be calculated #1", async () => {
      bnbBinanceFeed.latestRoundData.returns({ roundId: 0, answer: 0, startedAt: 0, updatedAt: 0, answeredInRound: 0 })
      bnbChainlinkFeed.latestRoundData.returns({ roundId: 0, answer: 0, startedAt: 0, updatedAt: 0, answeredInRound: 0 })

      await expect(
        atlantisPriceOracle.getOraclePrice("BNB"),
      ).to.be.revertedWith("Can't calculate average price");
    });

    it("revert if average price can't be calculated #2", async () => {
      btcBinanceFeed.latestRoundData.reverts("No read access")
      btcChainlinkFeed.latestRoundData.reverts("No read access")

      await expect(
        atlantisPriceOracle.getOraclePrice("BTC"),
      ).to.be.revertedWith("Can't calculate average price");
    });
  });

  describe("Test getUnderlyingPrice method", () => {
    it("return underlying price of aBNB", async () => {
      bnbBinanceFeed.latestRoundData.returns({ roundId: 0, answer: new BigNumber(280).toString(), startedAt: 0, updatedAt: 0, answeredInRound: 0 })
      bnbChainlinkFeed.latestRoundData.returns({ roundId: 0, answer: new BigNumber(290).toString(), startedAt: 0, updatedAt: 0, answeredInRound: 0 })

      expect(await atlantisPriceOracle.getUnderlyingPrice(ABNB_ADDRESS))
        .to.equal(285);
    });

    it("return underlying price of aATL without feed (using direct price)", async () => {
      const atlPrice = new BigNumber(2).toString();
      await atlantisPriceOracle.connect(admin).setDirectPrice(ATL_ADDRESS, atlPrice)

      expect(await atlantisPriceOracle.getUnderlyingPrice(AATL_ADDRESS))
        .to.equal(atlPrice.toString());
    });

    it("return underlying price of aBTC with only using chainlink feed", async () => {
      btcChainlinkFeed.latestRoundData.returns({ roundId: 0, answer: new BigNumber(20000).toString(), startedAt: 0, updatedAt: 0, answeredInRound: 0 })

      expect(await atlantisPriceOracle.getUnderlyingPrice(ABTC_ADDRESS))
        .to.equal(new BigNumber(20000).toString());
    });

    it("return underlying price of aBTC without access rights to Binance feed", async () => {
      btcBinanceFeed.latestRoundData.reverts("No read access")
      btcChainlinkFeed.latestRoundData.returns({ roundId: 0, answer: new BigNumber(21000).toString(), startedAt: 0, updatedAt: 0, answeredInRound: 0 })

      expect(await atlantisPriceOracle.getUnderlyingPrice(ABTC_ADDRESS))
        .to.equal(21000);
    });

  })
})