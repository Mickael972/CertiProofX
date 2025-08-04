const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

/**
 * Deploy script for CertiProofNFT contract
 * Author: Kai Zenjiro (0xGenesis) - certiproofx@protonmail.me
 * 
 * This script deploys the CertiProofNFT contract to the specified network
 * and saves the deployment information for future reference.
 */

async function main() {
  console.log("🚀 Starting CertiProofNFT deployment...\n");
  
  // Get network info
  const network = await ethers.provider.getNetwork();
  console.log(`📡 Network: ${network.name} (Chain ID: ${network.chainId})`);
  
  // Get deployer account
  const [deployer] = await ethers.getSigners();
  const deployerAddress = await deployer.getAddress();
  const deployerBalance = await deployer.getBalance();
  
  console.log(`👤 Deployer: ${deployerAddress}`);
  console.log(`💰 Balance: ${ethers.utils.formatEther(deployerBalance)} ETH\n`);
  
  // Contract parameters
  const TOKEN_NAME = "CertiProof X";
  const TOKEN_SYMBOL = "CERTX";
  
  console.log(`📝 Contract Parameters:`);
  console.log(`   Name: ${TOKEN_NAME}`);
  console.log(`   Symbol: ${TOKEN_SYMBOL}\n`);
  
  // Deploy contract
  console.log("🔨 Deploying CertiProofNFT contract...");
  
  const CertiProofNFT = await ethers.getContractFactory("CertiProofNFT");
  
  // Estimate deployment gas
  const deploymentData = CertiProofNFT.getDeployTransaction(TOKEN_NAME, TOKEN_SYMBOL, deployerAddress);
  const estimatedGas = await ethers.provider.estimateGas(deploymentData);
  const gasPrice = await ethers.provider.getGasPrice();
  const estimatedCost = estimatedGas.mul(gasPrice);
  
  console.log(`⛽ Estimated Gas: ${estimatedGas.toString()}`);
  console.log(`💸 Estimated Cost: ${ethers.utils.formatEther(estimatedCost)} ETH`);
  
  // Deploy
  const contract = await CertiProofNFT.deploy(TOKEN_NAME, TOKEN_SYMBOL, deployerAddress);
  await contract.deployed();
  
  console.log(`✅ Contract deployed to: ${contract.address}`);
  console.log(`🔗 Transaction hash: ${contract.deployTransaction.hash}\n`);
  
  // Wait for confirmations
  const confirmations = network.chainId === 1 || network.chainId === 137 ? 5 : 2;
  console.log(`⏳ Waiting for ${confirmations} confirmations...`);
  
  await contract.deployTransaction.wait(confirmations);
  console.log(`✅ Confirmed with ${confirmations} confirmations\n`);
  
  // Verify contract info
  console.log("🔍 Contract Verification:");
  console.log(`   Version: ${await contract.VERSION()}`);
  console.log(`   Author: ${await contract.AUTHOR()}`);
  console.log(`   Contact: ${await contract.CONTACT()}`);
  console.log(`   Wallet: ${await contract.WALLET()}`);
  console.log(`   Owner: ${await contract.owner()}`);
  console.log(`   Name: ${await contract.name()}`);
  console.log(`   Symbol: ${await contract.symbol()}\n`);
  
  // Save deployment info
  const deploymentInfo = {
    network: network.name,
    chainId: network.chainId,
    contractAddress: contract.address,
    deployerAddress: deployerAddress,
    transactionHash: contract.deployTransaction.hash,
    blockNumber: contract.deployTransaction.blockNumber,
    gasUsed: (await contract.deployTransaction.wait()).gasUsed.toString(),
    gasPrice: gasPrice.toString(),
    timestamp: new Date().toISOString(),
    contractName: TOKEN_NAME,
    contractSymbol: TOKEN_SYMBOL,
    version: "1.0.0",
    author: "Kai Zenjiro (0xGenesis)",
    contact: "certiproofx@protonmail.me"
  };
  
  // Create deployments directory if it doesn't exist
  const deploymentsDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }
  
  // Save deployment info to file
  const deploymentFile = path.join(deploymentsDir, `${network.name}-${network.chainId}.json`);
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
  
  console.log(`💾 Deployment info saved to: ${deploymentFile}`);
  
  // Generate environment variables
  console.log("\n📋 Environment Variables:");
  console.log(`CERTIPROOF_NFT_${network.name.toUpperCase()}=${contract.address}`);
  
  // Verification command
  if (network.chainId !== 31337) { // Not local network
    console.log("\n🔍 To verify the contract on block explorer, run:");
    console.log(`npx hardhat verify --network ${network.name} ${contract.address} "${TOKEN_NAME}" "${TOKEN_SYMBOL}" "${deployerAddress}"`);
  }
  
  console.log("\n🎉 Deployment completed successfully!");
  
  return {
    contract,
    address: contract.address,
    deploymentInfo
  };
}

// Execute deployment
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("❌ Deployment failed:");
      console.error(error);
      process.exit(1);
    });
}

module.exports = main;