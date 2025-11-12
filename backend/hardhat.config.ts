// hardhat.config.ts

import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-ignition-viem"; // <-- IMPORT THIS FIRST
import "@nomicfoundation/hardhat-toolbox-viem"; // <-- IMPORT THIS SECOND
import "dotenv/config";

// Get the variables from your .env file
const { SEPOLIA_RPC_URL, PRIVATE_KEY } = process.env;

// Check if the required environment variables are set
if (!SEPOLIA_RPC_URL) {
  console.warn("Missing SEPOLIA_RPC_URL. Please add it to your .env file.");
}
if (!PRIVATE_KEY) {
  console.warn("Missing PRIVATE_KEY. Please add it to your .env file.");
}

const config: HardhatUserConfig = {
  // Use the exact Solidity version from your contract
  solidity: "0.8.19",
  
  networks: {
    hardhat: {
      chainId: 1337,
      type: "edr-simulated",
    },
    sepolia: {
      type: "http",
      url: SEPOLIA_RPC_URL || "", 
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [], 
    },
  },
};

export default config;