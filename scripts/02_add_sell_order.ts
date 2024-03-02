import { FhenixClient, getPermit } from "fhenixjs";
import { Orderbook } from "../types/contracts/Orderbook";


const orderbookAddress = "0xcA1a03729A8639a33358d2E085e837AfD302038C";
const baseTokenAddress = "0x140979a2d63Aa5e3C1a11078dfa981428A1E80aA";
const tradeTokenAddress = "0xe0c1EF638eE5679A82C9153465BbF0C4d52F75Bc";

async function main() {

    const accounts = await ethers.getSigners();

    for (const account of accounts) {
        console.log(`account ${account.address}`);
    }

    const orderbook = await hre.ethers.getContractAt("Orderbook", orderbookAddress) as Orderbook;
    console.log("myContract ", await orderbook.tradeToken(), await orderbook.maxBuyPrice());

    // ToDo - Place 2 buy orders
    console.log('before buy order');
    const price = "10";
    await orderbook.placeSellOrder(price, "456");
    console.log('after buy order');

    const provider = new ethers.JsonRpcProvider('https://test01.fhenix.zone/evm');
    console.log('after provider');
    const client = new FhenixClient({ provider });
    console.log('after client');
    //const permit = await getPermit(orderbookAddress, provider);
    console.log('after permit');
    //client.storePermit(permit);


    const [
        buyOrdersInStepCounter,
        step,
    ] = await Promise.all([
        orderbook.sellOrdersInStepCounter(10),
        orderbook.sellSteps(10),
    ]);


    console.log("buyOrdersInStepCounter ", buyOrdersInStepCounter);
    console.log('finish');

}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
}).finally(() => {
    console.log("finally");
});