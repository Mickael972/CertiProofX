require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-verify");
require("hardhat-gas-reporter");
require("solidity-coverage");
require("hardhat-contract-sizer");

// Load environment variables
require("dotenv").config();

const PRIVATE_KEY = process.env.PRIVATE_KEY || "0x" + "1".repeat(64);
const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY || "";
const POLYGONSCAN_API_KEY = process.env.POLYGONSCAN_API_KEY || "";
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "";

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      viaIR: true,
    },
  },
  
  networks: {
    // Local development
    hardhat: {
      chainId: 31337,
      gas: 12000000,
      blockGasLimit: 12000000,
    },
    
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337,
    },
    
    // Polygon Mumbai Testnet
    mumbai: {
      url: `https://polygon-mumbai.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
      accounts: [PRIVATE_KEY],
      chainId: 80001,
      gas: 2100000,
      gasPrice: 8000000000, // 8 gwei
      blockConfirmations: 2,
    },
    
    // Polygon Mainnet
    polygon: {
      url: `https://polygon-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
      accounts: [PRIVATE_KEY],
      chainId: 137,
      gas: 2100000,
      gasPrice: 40000000000, // 40 gwei
      blockConfirmations: 5,
    },
    
    // Ethereum Goerli Testnet
    goerli: {
      url: `https://eth-goerli.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
      accounts: [PRIVATE_KEY],
      chainId: 5,
      gas: 2100000,
      gasPrice: 20000000000, // 20 gwei
      blockConfirmations: 2,
    },
    
    // Ethereum Mainnet
    mainnet: {
      url: `https://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
      accounts: [PRIVATE_KEY],
      chainId: 1,
      gas: 2100000,
      gasPrice: 30000000000, // 30 gwei
      blockConfirmations: 5,
    },
  },
  
  etherscan: {
    apiKey: {
      polygon: POLYGONSCAN_API_KEY,
      polygonMumbai: POLYGONSCAN_API_KEY,
      mainnet: ETHERSCAN_API_KEY,
      goerli: ETHERSCAN_API_KEY,
    },
  },
  
  sourcify: {
    enabled: true
  },
  
  gasReporter: {
    enabled: process.env.REPORT_GAS === "true",
    currency: "USD",
    gasPrice: 30,
    coinmarketcap: process.env.COINMARKETCAP_API_KEY,
    showTimeSpent: true,
    showMethodSig: true,
  },
  
  contractSizer: {
    alphaSort: true,
    runOnCompile: false,
    disambiguatePaths: false,
  },
  
  mocha: {
    timeout: 60000,
  },
  
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
};