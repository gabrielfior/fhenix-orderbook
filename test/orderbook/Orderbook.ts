import { ethers } from "hardhat";
import chai, { expect } from "chai";
import asPromised from "chai-as-promised";
chai.use(asPromised);
import { Orderbook, ERC20, ERC20__factory, Orderbook__factory, ERC20PresetMinterPauser, ERC20PresetMinterPauser__factory } from "../../types";
import { BigNumberish, Signer, Wallet, parseEther } from "ethers";

describe('Token', () => {

  let deployer: Signer;
  let acc1: Signer;
  let acc2: Signer;
  let acc3: Signer;
  let acc4: Signer;
  let acc5: Signer;
  let baseToken: ERC20PresetMinterPauser;
  let tradeToken: ERC20PresetMinterPauser;
  let orderbook: Orderbook;

  before(async () => {
    const [deployer] = await ethers.getSigners();

    console.log("Deploying contracts with the account:", deployer.address);

    baseToken = await ethers.deployContract("FHERC20", ["token1", "token1"]);
    tradeToken = await ethers.deployContract("FHERC20", ["token2", "token2"]);
    orderbook = await ethers.deployContract("Orderbook", [await tradeToken.getAddress(), await baseToken.getAddress()]);
  });

  // We make ERC20 mintable for convenience
  async function deployMintableErc20(name: string, symbol: string) {
    const token = await new ERC20PresetMinterPauser__factory(deployer).deploy(name, symbol);
    return token;
  }

  async function deploy() {
    baseToken = await deployMintableErc20('baseToken', 'baseToken');
    tradeToken = await deployMintableErc20('tradeToken', 'tradeToken');

    await Promise.all([baseToken.waitForDeployment(), tradeToken.waitForDeployment()]);

    orderbook = await new Orderbook__factory(deployer).deploy(await tradeToken.getAddress(), await baseToken.getAddress());
    await orderbook.waitForDeployment();
  }

  async function mintToAddress(token: ERC20PresetMinterPauser, recipientAddress: string, amount: BigNumberish) {
    await token.connect(deployer).mint(recipientAddress, amount);
  }

  beforeEach(async () => {
    [deployer, acc1, acc2, acc3, acc4, acc5] = await ethers.getSigners();
    await deploy();
    const amount = ethers.parseEther("100");
    const [acc1Address, acc2Address, acc3Address, acc4Address, acc5Address] = await Promise.all([acc1.getAddress(),
    acc2.getAddress(),
    acc3.getAddress(),
    acc4.getAddress(),
    acc5.getAddress(),
    ]);

    await mintToAddress(baseToken, acc1Address, amount);
    await mintToAddress(baseToken, acc2Address, amount);
    await mintToAddress(baseToken, acc3Address, amount);
    await mintToAddress(baseToken, acc4Address, amount);

    await mintToAddress(tradeToken, acc1Address, amount);
    await mintToAddress(tradeToken, acc2Address, amount);
    await mintToAddress(tradeToken, acc3Address, amount);
    await mintToAddress(tradeToken, acc4Address, amount);

    const orderbookAddress = await orderbook.getAddress();

    await baseToken.connect(acc1).approve(orderbookAddress, amount);
    await baseToken.connect(acc2).approve(orderbookAddress, amount);
    await baseToken.connect(acc3).approve(orderbookAddress, amount);
    await baseToken.connect(acc4).approve(orderbookAddress, amount);

    await tradeToken.connect(acc1).approve(orderbookAddress, amount);
    await tradeToken.connect(acc2).approve(orderbookAddress, amount);
    await tradeToken.connect(acc3).approve(orderbookAddress, amount);
    await tradeToken.connect(acc4).approve(orderbookAddress, amount);
  });

  it('testing 1 2 3', async function () {
    const [owner] = await ethers.getSigners();

    expect(await orderbook.baseToken()).to.equal(await baseToken.getAddress());
    expect(await orderbook.tradeToken()).to.equal(await tradeToken.getAddress());
  });

  describe("#place buy order not matching", () => {

    it("should place first buy", async () => {
      await orderbook.connect(acc1).placeBuyOrder(1, parseEther("10"));

      const [
        buyOrdersInStepCounter,
        step,
      ] = await Promise.all([
        orderbook.buyOrdersInStepCounter(1),
        orderbook.buySteps(1),
      ]);

      expect(buyOrdersInStepCounter).to.eq(1);
      expect(step.amount.toString()).to.eq(ethers.parseEther("10").toString());
      expect(step.lowerPrice).to.eq(0);
    });


  });

});