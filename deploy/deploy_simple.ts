import { ethers } from "hardhat";
import { ERC20, FHERC20__factory, Orderbook } from "../types";


// ToDo - Integrate hardhat-deploy for reproducable deployments

async function main() {
  //const [deployer] = await ethers.getSigners();
  //const deployer = new ethers.Wallet(process.env.KEY!);
  const deployer = new ethers.Wallet(process.env.KEY_DEV!);
  console.log("Deploying contracts with the account:", deployer.address);
  const account = deployer.connect(ethers.getDefaultProvider());

  //const token1 = await new FHERC20__factory().deploy("token1", "token1");
  //console.log("token1 addr", await token1.getAddress());


  const token1 = await ethers.deployContract("FHERC20", ["token1", "token1"]);
  console.log("deployed token 1", await token1.getAddress());
  const token2 = await ethers.deployContract("FHERC20", ["token2", "token2"]);
  const orderbook = await ethers.deployContract("Orderbook", [await token1.getAddress(), await token2.getAddress()]) as Orderbook;
  console.log("orderbook", await orderbook.getAddress());
  const baseToken = await orderbook.baseToken();
  console.log("baseToken", baseToken);
  const tradeToken = await orderbook.tradeToken();
  console.log("tradeToken", tradeToken);

}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });