const hre = require("hardhat");

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log("❌ Please provide contract address");
    console.log("Usage: node scripts/interact.js <CONTRACT_ADDRESS>");
    process.exit(1);
  }

  const contractAddress = args[0];

  console.log("🔗 Interacting with BaseVault at:", contractAddress);
  console.log("🌐 Network:", hre.network.name, "\n");

  // Get signer
  const [signer] = await hre.ethers.getSigners();
  console.log("👤 Using account:", signer.address);

  const balance = await hre.ethers.provider.getBalance(signer.address);
  console.log("💰 Balance:", hre.ethers.formatEther(balance), "ETH\n");

  // Connect to contract
  const BaseVault = await hre.ethers.getContractFactory("BaseVault");
  const baseVault = BaseVault.attach(contractAddress);

  // Example interactions
  console.log("=".repeat(60));
  console.log("📊 CONTRACT INFORMATION");
  console.log("=".repeat(60));

  try {
    // Get total vaults
    const totalVaults = await baseVault.getTotalVaults();
    console.log("Total vaults:", totalVaults.toString());

    // Get total proposals
    const totalProposals = await baseVault.getTotalProposals();
    console.log("Total proposals:", totalProposals.toString());

    // Get constants
    const approvalThreshold = await baseVault.APPROVAL_THRESHOLD();
    console.log("Approval threshold:", approvalThreshold.toString() + "%");

    const minContribution = await baseVault.MIN_CONTRIBUTION();
    console.log("Min contribution:", hre.ethers.formatEther(minContribution), "ETH");

    console.log("\n" + "=".repeat(60));
    console.log("🔧 EXAMPLE OPERATIONS");
    console.log("=".repeat(60));

    // Example: Create a vault
    console.log("\n1️⃣  Creating example vault...");
    const goal = hre.ethers.parseEther("1.0"); // 1 ETH goal
    const durationDays = 30;

    const createTx = await baseVault.createVault(
      "Test Vault",
      "Testing BaseVault contract",
      goal,
      durationDays
    );

    console.log("⏳ Tx hash:", createTx.hash);
    const receipt = await createTx.wait();
    console.log("✅ Vault created in block:", receipt.blockNumber);

    // Get the vault ID from the event
    const vaultId = totalVaults;
    console.log("📝 Vault ID:", vaultId.toString());

    // Get vault details
    console.log("\n2️⃣  Fetching vault details...");
    const vault = await baseVault.getVault(vaultId);
    console.log("Vault info:");
    console.log("  Name:", vault.name);
    console.log("  Description:", vault.description);
    console.log("  Creator:", vault.creator);
    console.log("  Goal:", hre.ethers.formatEther(vault.goal), "ETH");
    console.log("  Current amount:", hre.ethers.formatEther(vault.currentAmount), "ETH");
    console.log("  Deadline:", new Date(Number(vault.deadline) * 1000).toLocaleString());
    console.log("  Status:", ["Active", "GoalReached", "Closed"][vault.status]);

    // Example: Contribute to vault
    console.log("\n3️⃣  Contributing to vault...");
    const contributionAmount = hre.ethers.parseEther("0.1"); // 0.1 ETH

    const contributeTx = await baseVault.contribute(vaultId, {
      value: contributionAmount,
    });

    console.log("⏳ Tx hash:", contributeTx.hash);
    await contributeTx.wait();
    console.log("✅ Contributed:", hre.ethers.formatEther(contributionAmount), "ETH");

    // Check contribution
    const myContribution = await baseVault.getContribution(vaultId, signer.address);
    console.log("Your total contribution:", hre.ethers.formatEther(myContribution), "ETH");

    // Check vault progress
    const progress = await baseVault.getVaultProgress(vaultId);
    console.log("Vault progress:", progress.toString() + "%");

    console.log("\n" + "=".repeat(60));
    console.log("✨ Interaction complete!");
    console.log("=".repeat(60));

    // Display useful commands
    console.log("\n📝 Useful commands:");
    console.log(`- Get vault: baseVault.getVault(${vaultId})`);
    console.log(`- Contribute: baseVault.contribute(${vaultId}, { value: amount })`);
    console.log(`- Create proposal: baseVault.createProposal(${vaultId}, recipient, amount, reason)`);
    console.log(`- Vote: baseVault.vote(proposalId, true/false)`);
    console.log(`- Execute: baseVault.executeProposal(proposalId)`);

    if (hre.network.name === "base" || hre.network.name === "baseSepolia") {
      const explorerUrl =
        hre.network.name === "base"
          ? `https://basescan.org/address/${contractAddress}`
          : `https://sepolia.basescan.org/address/${contractAddress}`;
      console.log("\n🔗 View on Basescan:", explorerUrl);
    }
  } catch (error) {
    console.error("\n❌ Error:", error.message);
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
