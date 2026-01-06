const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Deploying BaseVault to", hre.network.name, "...\n");

  // Get deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log("📝 Deploying with account:", deployer.address);

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", hre.ethers.formatEther(balance), "ETH\n");

  // Deploy BaseVault
  console.log("⏳ Deploying BaseVault contract...");
  const BaseVault = await hre.ethers.getContractFactory("BaseVault");
  const baseVault = await BaseVault.deploy();

  await baseVault.waitForDeployment();
  const contractAddress = await baseVault.getAddress();

  console.log("✅ BaseVault deployed to:", contractAddress);
  console.log("📊 Deployment tx:", baseVault.deploymentTransaction().hash);

  // Wait for confirmations on mainnet/testnet
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("\n⏳ Waiting for 5 confirmations...");
    await baseVault.deploymentTransaction().wait(5);
    console.log("✅ Confirmed!\n");
  }

  // Save deployment info
  const deploymentInfo = {
    network: hre.network.name,
    chainId: hre.network.config.chainId,
    contract: "BaseVault",
    address: contractAddress,
    deployer: deployer.address,
    deploymentTx: baseVault.deploymentTransaction().hash,
    timestamp: new Date().toISOString(),
    blockNumber: await hre.ethers.provider.getBlockNumber(),
  };

  const deploymentsDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  const filename = `${hre.network.name}-${Date.now()}.json`;
  const filepath = path.join(deploymentsDir, filename);
  fs.writeFileSync(filepath, JSON.stringify(deploymentInfo, null, 2));

  console.log("💾 Deployment info saved to:", filepath);

  // Update latest deployment
  const latestPath = path.join(deploymentsDir, `${hre.network.name}-latest.json`);
  fs.writeFileSync(latestPath, JSON.stringify(deploymentInfo, null, 2));

  // Display summary
  console.log("\n" + "=".repeat(60));
  console.log("📋 DEPLOYMENT SUMMARY");
  console.log("=".repeat(60));
  console.log("Network:", hre.network.name);
  console.log("Contract:", contractAddress);
  console.log("Deployer:", deployer.address);
  console.log("Block:", deploymentInfo.blockNumber);
  console.log("=".repeat(60));

  // Next steps
  console.log("\n📝 NEXT STEPS:");
  console.log("1. Verify contract on Basescan:");
  console.log(`   npx hardhat verify --network ${hre.network.name} ${contractAddress}`);
  console.log("\n2. Update frontend .env:");
  console.log(`   VITE_CONTRACT_ADDRESS=${contractAddress}`);
  console.log("\n3. Test the contract:");
  console.log(`   node scripts/interact.js ${contractAddress}`);

  if (hre.network.name === "base" || hre.network.name === "baseSepolia") {
    console.log("\n4. View on Basescan:");
    const explorerUrl =
      hre.network.name === "base"
        ? `https://basescan.org/address/${contractAddress}`
        : `https://sepolia.basescan.org/address/${contractAddress}`;
    console.log(`   ${explorerUrl}`);
  }

  console.log("\n✨ Deployment complete!\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:");
    console.error(error);
    process.exit(1);
  });
