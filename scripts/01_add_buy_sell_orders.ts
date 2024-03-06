import { Orderbook } from "../types/contracts/Orderbook";
import { FhenixClient, EncryptedUint8 } from 'fhenixjs';
import { config } from 'dotenv';
import { ethers } from "hardhat";
import { BigNumberish } from "ethers";
config();


// const orderbookAddress = "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9";
// const baseTokenAddress = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";
// const tradeTokenAddress = "0xe0c1EF638eE5679A82C9153465BbF0C4d52F75Bc";
let orderbookAddress: String;
let baseTokenAddress: String;
let tradeTokenAddress: String;


async function deployContracts() {
    const [deployer] = hre.ethers.getSigners();
    console.log("Funding deployer");
    await hre.fhenixjs.getFunds(deployer.address);
    // console.log("Deploying contracts with the account:", deployer.address);
    // const account = deployer.connect(ethers.getDefaultProvider());


    const token1 = await ethers.deployContract("FHERC20", ["token1", "token1"]);
    console.log("deployed token 1", await token1.getAddress());
    const token2 = await ethers.deployContract("FHERC20", ["token2", "token2"]);
    //const orderbook = await ethers.deployContract("Orderbook", [await token1.getAddress(), await token2.getAddress()]) as Orderbook;

    // orderbookAddress = await orderbook.getAddress();
    // console.log("orderbook", orderbookAddress);
    // baseTokenAddress = await orderbook.baseToken();
    // console.log("baseToken", baseTokenAddress);
    // tradeTokenAddress = await orderbook.tradeToken();
    // console.log("tradeToken", tradeTokenAddress);
}

async function getBuyOrdersAndSteps(orderbook: Orderbook, price: BigNumberish) {
    return Promise.all([
        orderbook.buyOrdersInStepCounter(price),
        orderbook.buySteps(price),
    ]);
}

async function getSellOrdersAndSteps(orderbook: Orderbook, price: BigNumberish) {
    return Promise.all([
        orderbook.sellOrdersInStepCounter(price),
        orderbook.sellSteps(price),
    ]);
}

async function main() {



    await deployContracts();

    const orderbook = await hre.ethers.getContractAt("Orderbook", orderbookAddress) as Orderbook;
    console.log("myContract ", await orderbook.tradeToken(), await orderbook.maxBuyPrice());

    // Todo - This provider only views
    // ToDo - When using signature, get Metamask provider (when signing)
    const provider = new hre.ethers.JsonRpcProvider('https://test01.fhenix.zone/evm');
    console.log('after provider');
    const client = new FhenixClient({ provider });
    console.log('after client');
    //const permit = await getPermit(orderbookAddress, provider);
    console.log('after permit');
    //client.storePermit(permit);

    // Place 2 buy orders
    console.log('before buy order');
    const price1 = 10;
    const price2 = 20;
    const amount = 10;
    const encryptedPrice = await client.encrypt_uint32(123);
    //const encryptedAmount = await client.encrypt_uint32(price);
    await orderbook.placeBuyOrder(price1, amount);
    await orderbook.placeBuyOrder(price2, amount);
    await orderbook.placeSellOrder(price1, amount);
    console.log('after buy order');

    const [
        buyOrdersInStepCounter1,
        buySteps1,
    ] = await getBuyOrdersAndSteps(orderbook, price1);

    console.log("buyOrdersInStepCounter ", buyOrdersInStepCounter1, "price", price1);
    console.log("# of buy orders ", buySteps1.length, "price", price1);

    const [
        buyOrdersInStepCounter2,
        buySteps2,
    ] = await getBuyOrdersAndSteps(orderbook, price2);

    console.log("buyOrdersInStepCounter ", buyOrdersInStepCounter2, "price", price2);
    console.log("# of buy orders ", buySteps2.length, "price ", price2);

    const [
        sellOrdersInStepCounter1,
        sellSteps1,
    ] = await getBuyOrdersAndSteps(orderbook, price1);

    console.log("buyOrdersInStepCounter ", sellOrdersInStepCounter1, "price", price1);
    console.log("# of buy orders ", sellSteps1.length, "price ", price1);

    console.log('finish');

}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
}).finally(() => {
    console.log("finally");
    process.exit(0);
});