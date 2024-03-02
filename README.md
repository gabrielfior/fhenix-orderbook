# Fhenix Orderbook

An orderbook implementation on the Fhenix blockchain, leveraging FHE for private balances and trade history. 

## The problem it solves

Private orderbooks have a few interesting features:
- Private history of trades (visible only to user that completed trades)
- Private balances of encrypted ERC20 tokens (base & trade tokens)
- Absence of slippage thus impermanent loss
- Absence of MEV


## What was implemented

This project implements a private orderbook on the Fhenix blockchain leveraging FHE. We forked a [publicy available repo](https://github.com/sondotpin/orderbook) and adapted that to use Fhenix's [FHE Solidity library](https://docs.fhenix.zone/).
The Solidity contract compiles and accepts buy orders and sell orders. We also incorporated the encrypted ERC20 template (FHERC20) into the contract.

### Contracts

- [FHERC20](./contracts/FHERC20.sol): Encrypted ERC20, allowing for private balances and transfers
- [Orderbook](./contracts/Orderbook.sol): Private Orderbook, having features described previously.

### Scripts
- Buy orders (incomplete)
- Sell orders (incomplete)

## Plans for future implementation

We antecipate the following steps to bring this idea from hackathon project to a proper MVP:

- Sanitize `Orderbook.sol` and confirm that no data leaks are present
- Clean-up Hardhat usage (add hardhat-deploy for reproducible deployments)
- Write tests