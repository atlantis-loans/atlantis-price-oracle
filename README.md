# Atlantis-Price-Oracle
Atlantis Price Oracle is a multi-price oracle solution using a combination of Chainlink and Binance price oracle sources to return a recent average price of an asset on BSC.

This oracle is used inside the Atlantis Comptroller contract and is responsible for getting the latest aggregated asset price for all existing Atlantis lending markets.

When only a single feed is set for an asset, this contract will return the actual price (without aggregation) received by the single oracle provider.

# About Multi-price oracle
A multi-price oracle is a type of oracle that provides multiple price feeds for the same asset from different sources. 
By aggregating data from multiple sources, multi-price oracles can also provide more accurate pricing information, which can be especially important for applications such as smart contracts that require precise and up-to-date data. Additionally, using a multi-price oracle can help increase the security of a system by making it more difficult for attackers to manipulate the price of an asset.

## Run standalone tests

```shell
git clone https://github.com/atlantis-loans/atlantis-price-oracle.git
cdatlantis-price-oracle
cp .env.example .env
yarn install
yarn test
```

## Run simulation

```shell
git clone https://github.com/atlantis-loans/atlantis-price-oracle.git
cdatlantis-price-oracle
cp .env.example .env
yarn install
npx hardhat run sim/get-underlying-price.js --network localhost
```

