// Plugins
// Tasks
import "@nomicfoundation/hardhat-toolbox";
import { config as dotenvConfig } from "dotenv";
import "fhenix-hardhat-docker";
import "fhenix-hardhat-plugin";
//import "hardhat-deploy";
import { HardhatUserConfig } from "hardhat/config";
import { resolve } from "path";

// DOTENV_CONFIG_PATH is used to specify the path to the .env file for example in the CI
const dotenvConfigPath: string = process.env.DOTENV_CONFIG_PATH || "./.env";
dotenvConfig({ path: resolve(__dirname, dotenvConfigPath) });


//const TESTNET_RPC_URL = "https://api.testnet.fhenix.zone:7747";
const TESTNET_RPC_URL = "http://localhost:42069";
const dev_account = process.env.KEY_DEV;


const config: HardhatUserConfig = {
  solidity: "0.8.20",
  // Optional: defaultNetwork is already being set to "localfhenix" by fhenix-hardhat-plugin
  defaultNetwork: "localfhenix",
  networks: {
    localfhenix: {
      chainId: 412346,
      url: "http://localhost:42069",
      accounts: ["0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"] // hardhat
    },
    testnet: {
      chainId: 42069,
      url: "https://api.testnet.fhenix.zone:7747",
      accounts: [dev_account!]
    },//testnetConfig,
  },
  typechain: {
    outDir: "types",
    target: "ethers-v6",
  },
};

export default config;