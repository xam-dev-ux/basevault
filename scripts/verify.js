const hre = require("hardhat");

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log("❌ Please provide contract address");
    console.log("Usage: node scripts/verify.js <CONTRACT_ADDRESS>");
    process.exit(1);
  }

  const contractAddress = args[0];

  console.log("🔍 Verifying BaseVault on", hre.network.name, "...\n");
  console.log("📝 Contract address:", contractAddress);

  try {
    await hre.run("verify:verify", {
      address: contractAddress,
      constructorArguments: [],
      contract: "contracts/BaseVault.sol:BaseVault",
    });

    console.log("\n✅ Contract verified successfully!");

    const explorerUrl =
      hre.network.name === "base"
        ? `https://basescan.org/address/${contractAddress}#code`
        : `https://sepolia.basescan.org/address/${contractAddress}#code`;

    console.log("🔗 View on Basescan:", explorerUrl);
  } catch (error) {
    if (error.message.includes("Already Verified")) {
      console.log("✅ Contract already verified!");
    } else {
      console.error("❌ Verification failed:");
      console.error(error.message);
      process.exit(1);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
