const { run } = require("hardhat");
const fs = require("fs");
const path = require("path");

/**
 * Verification script for CertiProofNFT contract
 * Author: Kai Zenjiro (0xGenesis) - certiproofx@protonmail.me
 * 
 * This script verifies the deployed contract on block explorers
 */

async function main() {
  console.log("🔍 Starting contract verification...\n");
  
  const network = await hre.network.name;
  const chainId = await hre.network.config.chainId;
  
  console.log(`📡 Network: ${network} (Chain ID: ${chainId})`);
  
  // Load deployment info
  const deploymentFile = path.join(__dirname, "..", "deployments", `${network}-${chainId}.json`);
  
  if (!fs.existsSync(deploymentFile)) {
    console.error(`❌ Deployment file not found: ${deploymentFile}`);
    console.error("Please deploy the contract first using: npx hardhat run scripts/deploy.js");
    process.exit(1);
  }
  
  const deploymentInfo = JSON.parse(fs.readFileSync(deploymentFile, 'utf8'));
  const contractAddress = deploymentInfo.contractAddress;
  
  console.log(`📄 Contract Address: ${contractAddress}`);
  console.log(`🔨 Deployed at: ${deploymentInfo.timestamp}\n`);
  
  // Contract constructor arguments
  const TOKEN_NAME = deploymentInfo.contractName || "CertiProof X";
  const TOKEN_SYMBOL = deploymentInfo.contractSymbol || "CERTX";
  
  console.log("📝 Constructor Arguments:");
  console.log(`   Name: ${TOKEN_NAME}`);
  console.log(`   Symbol: ${TOKEN_SYMBOL}\n`);
  
  try {
    console.log("🚀 Verifying contract...");
    
    await run("verify:verify", {
      address: contractAddress,
      constructorArguments: [TOKEN_NAME, TOKEN_SYMBOL],
    });
    
    console.log("✅ Contract verified successfully!");
    
    // Update deployment info with verification status
    deploymentInfo.verified = true;
    deploymentInfo.verifiedAt = new Date().toISOString();
    
    fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
    
    console.log("\n🔗 Block Explorer Links:");
    
    if (chainId === 80001) { // Mumbai
      console.log(`   Polygonscan: https://mumbai.polygonscan.com/address/${contractAddress}`);
    } else if (chainId === 137) { // Polygon
      console.log(`   Polygonscan: https://polygonscan.com/address/${contractAddress}`);
    } else if (chainId === 5) { // Goerli
      console.log(`   Etherscan: https://goerli.etherscan.io/address/${contractAddress}`);
    } else if (chainId === 1) { // Mainnet
      console.log(`   Etherscan: https://etherscan.io/address/${contractAddress}`);
    }
    
  } catch (error) {
    if (error.message.toLowerCase().includes("already verified")) {
      console.log("✅ Contract is already verified!");
    } else {
      console.error("❌ Verification failed:");
      console.error(error.message);
      
      console.log("\n🔧 Troubleshooting tips:");
      console.log("1. Make sure the contract is deployed and confirmed");
      console.log("2. Check if the constructor arguments are correct");
      console.log("3. Ensure you have the correct API key in your .env file");
      console.log("4. Wait a few minutes after deployment before verifying");
      
      process.exit(1);
    }
  }
  
  console.log("\n🎉 Verification process completed!");
}

// Execute verification
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("❌ Verification failed:");
      console.error(error);
      process.exit(1);
    });
}

module.exports = main;