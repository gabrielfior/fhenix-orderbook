import { Orderbook } from "../types/contracts/Orderbook";
import { FhenixClient, EncryptedUint8 } from 'fhenixjs';


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


    const provider = new hre.ethers.JsonRpcProvider('https://test01.fhenix.zone/evm');
    console.log('after provider');
    const client = new FhenixClient({ provider });
    console.log('after client');
    //const permit = await getPermit(orderbookAddress, provider);
    console.log('after permit');
    //client.storePermit(permit);

    // ToDo - Place 2 buy orders
    console.log('before buy order');
    const price = 10;
    const amount = 10;
    const encryptedPrice = await client.encrypt_uint32(price);
    const encryptedAmount = await client.encrypt_uint32(price);
    await orderbook.placeBuyOrder(encryptedPrice, encryptedAmount);
    console.log('after buy order');

    const [
        buyOrdersInStepCounter,
        steps,
    ] = await Promise.all([
        orderbook.buyOrdersInStepCounter(123),
        orderbook.buySteps(123),
    ]);

    console.log("# of buy orders ", steps.length);
    console.log('finish');

}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
}).finally(() => {
    console.log("finally");
});