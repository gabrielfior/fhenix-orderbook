import { ethers } from "hardhat";
import chai, { expect } from "chai";
import asPromised from "chai-as-promised";
import { FhenixClient, getPermit } from 'fhenixjs';
chai.use(asPromised);
import { Orderbook, ERC20, ERC20__factory, Orderbook__factory, ERC20PresetMinterPauser, ERC20PresetMinterPauser__factory } from "../../types";
import { BigNumberish, Signer, Wallet, parseEther } from "ethers";
import { FHERC20__factory, SimpleOrderbook } from "../types";

describe('Token', () => {

    let deployer: Signer;
    let acc1: Signer;
    let acc2: Signer;
    let acc3: Signer;
    let acc4: Signer;
    let acc5: Signer;
    let baseToken: ERC20PresetMinterPauser;
    let tradeToken: ERC20PresetMinterPauser;
    let orderbook: SimpleOrderbook;
    let amountToAdd = 10;

    const { fhenixjs, ethers, deployments } = hre;

    before(async () => {
        const [deployer] = await ethers.getSigners();
        console.log("Funding deployer");
        if ((await ethers.provider.getBalance(deployer.address)).toString() === "0") {
            await fhenixjs.getFunds(deployer.address);
        }


        console.log("Deploying contracts with the account:", deployer.address);

        baseToken = await ethers.deployContract("FHERC20", ["token1", "token1"]);
        tradeToken = await ethers.deployContract("FHERC20", ["token2", "token2"]);
        orderbook = await ethers.deployContract("SimpleOrderbook", [await tradeToken.getAddress(), await baseToken.getAddress()]);
        console.log(`baseToken ${await baseToken.getAddress()} tradeToken ${tradeToken.address} orderbook ${orderbook.address}`);
    });


    async function mintToAddress(token: ERC20PresetMinterPauser, recipientAddress: string, amount: BigNumberish) {
        await token.connect(deployer).mint(recipientAddress, amount);
    }

    xit('testing addresses', async function () {
        expect(await orderbook.baseToken()).to.equal(await baseToken.getAddress());
        expect(await orderbook.tradeToken()).to.equal(await tradeToken.getAddress());
    });

    xit('test adding orders to array', async () => {
        // assert number of elements = 0
        let initialCounter = await orderbook.numberOfBuyOrders();
        expect(initialCounter.toString() === '0');
        // place buy order
        const encyrptedPrice = await fhenixjs.encrypt_uint32(amountToAdd);
        const encyrptedAmount = await fhenixjs.encrypt_uint32(amountToAdd);
        await orderbook.placeBuyOrder(encyrptedPrice, encyrptedAmount);
        // assert value = 10
        let finalCounter = await orderbook.numberOfBuyOrders();
        expect(finalCounter.toString() === '1');
    });

    it('inspect single order', async () => {
        // add buy order
        const encyrptedPrice = await fhenixjs.encrypt_uint32(amountToAdd);
        const encyrptedAmount = await fhenixjs.encrypt_uint32(amountToAdd);
        await orderbook.placeBuyOrder(encyrptedPrice, encyrptedAmount);
        // fetch order object
        //let order = await orderbook.buyOrders('10', 0);
        // let [maker, amount] = order;
        // // assert price is correct
        // console.log('encrypted amount ', encyrptedAmount.toString());
        // console.log('order', order);
        // ToDo - How to do RPC non-read only, i.e. also write within a Node Hardhat environment?
        //const provider = new ethers.JsonRpcProvider('http://localhost:42069');
        const provider = ethers.provider;
        const client = new FhenixClient({ provider });
        const orderbookAddr = await orderbook.getAddress();

        const permit = await getPermit(orderbookAddr, provider);
        client.storePermit(permit);

        const permission = client.extractPermitPermission(permit);
        let response = await orderbook.getBuyOrdersFromUserForPrice('1', permission);
        let [a, b] = response;
        const plaintext = client.unseal(orderbookAddr, a);
        console.log(`My Balance: ${plaintext}`)

        const plaintext2 = client.unseal(orderbookAddr, b);
        console.log(`My Balance: ${plaintext2}`)
    });


});