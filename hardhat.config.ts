import * as dotenv from 'dotenv'
dotenv.config()

import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomiclabs/hardhat-web3";
import "@typechain/hardhat";
import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-etherscan";
import "@nomicfoundation/hardhat-chai-matchers";
import "hardhat-contract-sizer"
import "@nomiclabs/hardhat-truffle5";

const config: HardhatUserConfig = {
  defaultNetwork: 'hardhat',
  networks: {
    hardhat: {
      chainId: 56,
      forking: {
        url: `https://rpc.ankr.com/bsc`,
      },
      accounts: { mnemonic: process.env.MNEMONIC }
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      timeout: 1400000,
      gasPrice: 10000000000,
      accounts: { mnemonic: process.env.MNEMONIC }
    },
    mainnet: {
      url: `https://rpc.ankr.com/bsc`,
      accounts: { mnemonic: process.env.MNEMONIC }
    },
  },
  solidity: {
    compilers: [
      {
        version: '0.8.17',
        settings: {
          outputSelection: {
            "*": {
              "*": ["storageLayout"]
            }
          }
        }
      },
    ],
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
}

export default config;
