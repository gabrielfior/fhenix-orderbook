import { ethers } from "hardhat";
import { ERC20, Orderbook } from "../types";
import "hardhat";


// ToDo - Integrate hardhat-deploy for reproducable deployments

async function main() {
    const [deployer] = await ethers.getSigners();
  
    console.log("Deploying contracts with the account:", deployer.address);
  
    const token1 = await ethers.deployContract("ERC20",["token1","token1"]);
    const token2 = await ethers.deployContract("ERC20",["token2","token2"]);
    const orderbook = await ethers.deployContract("Orderbook",[await token1.getAddress(),await token2.getAddress()]) as Orderbook;
    console.log("orderbook", await orderbook.getAddress());
    const baseToken =  await orderbook.getBaseToken();
    console.log("baseToken", baseToken);
    const tradeToken =  await orderbook.getTradeToken();
    console.log("tradeToken", tradeToken);
    
  }
  
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });