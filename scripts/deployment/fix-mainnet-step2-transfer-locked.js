// Step 2: Transfer 300M SYL to Locked Reserve
// This script transfers the locked tokens to the locked reserve wallet

const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
    console.log("\n" + "=".repeat(80));
    console.log("🔧 STEP 2: TRANSFER LOCKED RESERVE TOKENS");
    console.log("=".repeat(80) + "\n");

    // Load deployment info
    const deploymentFile = path.join(__dirname, "../../deployments/mainnet-deployment.json");
    if (!fs.existsSync(deploymentFile)) {
        console.error("❌ Deployment file not found!");
        process.exit(1);
    }

    const deploymentInfo = JSON.parse(fs.readFileSync(deploymentFile, "utf8"));
    const TOKEN_ADDRESS = deploymentInfo.contractAddress;

    console.log("Contract Address:", TOKEN_ADDRESS);
    console.log();

    // Get contract
    const token = await ethers.getContractAt("SylvanToken", TOKEN_ADDRESS);
    const [deployer] = await ethers.getSigners();

    console.log("Deployer:", deployer.address);
    console.log();

    // Load configuration
    const config = require("../../config/deployment.config.js");
    const wallets = config.wallets;

    // Check deployer balance
    const deployerBalance = await token.balanceOf(deployer.address);
    console.log("Deployer Balance:", ethers.utils.formatEther(deployerBalance), "SYL");
    console.log();

    // Check locked reserve balance
    const lockedBalance = await token.balanceOf(wallets.system.locked.address);
    console.log("Locked Reserve Current Balance:", ethers.utils.formatEther(lockedBalance), "SYL");
    console.log();

    // Amount to transfer
    const transferAmount = ethers.utils.parseEther("300000000"); // 300M SYL

    // Check if already transferred
    if (lockedBalance.gte(transferAmount)) {
        console.log("✅ Locked Reserve already has sufficient balance!");
        console.log("No transfer needed.");
        console.log();
        process.exit(0);
    }

    // Calculate actual amount to transfer
    const amountToTransfer = transferAmount.sub(lockedBalance);

    console.log("📋 Transfer Plan:");
    console.log("-".repeat(80));
    console.log("From: Deployer");
    console.log("To: Locked Reserve");
    console.log("Address:", wallets.system.locked.address);
    console.log("Amount:", ethers.utils.formatEther(amountToTransfer), "SYL");
    console.log("-".repeat(80) + "\n");

    // Verify sufficient balance
    if (deployerBalance.lt(amountToTransfer)) {
        console.error("❌ Insufficient balance!");
        console.error("Required:", ethers.utils.formatEther(amountToTransfer), "SYL");
        console.error("Available:", ethers.utils.formatEther(deployerBalance), "SYL");
        process.exit(1);
    }

    console.log("⚠️  WARNING: You are about to transfer tokens on MAINNET!");
    console.log("⚠️  This will transfer 300M SYL to Locked Reserve!");
    console.log("\nPress Ctrl+C to cancel, or wait 10 seconds to continue...\n");
    
    await new Promise(resolve => setTimeout(resolve, 10000));

    // Execute transfer
    console.log("📤 Executing Transfer...\n");

    try {
        const tx = await token.transfer(wallets.system.locked.address, amountToTransfer);
        console.log("TX:", tx.hash);
        console.log("Waiting for confirmation...");
        await tx.wait();
        console.log("✅ Transfer completed successfully!");
        console.log();
    } catch (error) {
        console.error("❌ Transfer failed:", error.message);
        process.exit(1);
    }

    // Verify transfer
    console.log("🔍 Verifying Transfer...\n");

    const newDeployerBalance = await token.balanceOf(deployer.address);
    const newLockedBalance = await token.balanceOf(wallets.system.locked.address);

    console.log("Deployer Balance:");
    console.log("  Before:", ethers.utils.formatEther(deployerBalance), "SYL");
    console.log("  After:", ethers.utils.formatEther(newDeployerBalance), "SYL");
    console.log("  Difference:", ethers.utils.formatEther(deployerBalance.sub(newDeployerBalance)), "SYL");
    console.log();

    console.log("Locked Reserve Balance:");
    console.log("  Before:", ethers.utils.formatEther(lockedBalance), "SYL");
    console.log("  After:", ethers.utils.formatEther(newLockedBalance), "SYL");
    console.log("  Difference:", ethers.utils.formatEther(newLockedBalance.sub(lockedBalance)), "SYL");
    console.log();

    // Verify vesting schedule
    console.log("🔒 Vesting Schedule:");
    console.log("-".repeat(80));
    try {
        const vestingInfo = await token.getVestingInfo(wallets.system.locked.address);
        console.log("Total Amount:", ethers.utils.formatEther(vestingInfo.totalAmount), "SYL");
        console.log("Released:", ethers.utils.formatEther(vestingInfo.releasedAmount), "SYL");
        console.log("Burned:", ethers.utils.formatEther(vestingInfo.burnedAmount), "SYL");
        console.log("Start Time:", new Date(vestingInfo.startTime * 1000).toISOString());
        console.log("Cliff Duration:", vestingInfo.cliffDuration / 86400, "days");
        console.log("Vesting Duration:", vestingInfo.vestingDuration / 2629746, "months");
        console.log("Release Percentage:", vestingInfo.releasePercentage / 100, "%");
        console.log("Burn Percentage:", vestingInfo.burnPercentage / 100, "%");
        console.log("Active:", vestingInfo.isActive ? "✅" : "❌");
    } catch (error) {
        console.log("⚠️  Unable to get vesting info:", error.message);
    }
    console.log();

    console.log("=".repeat(80));
    console.log("✅ STEP 2 COMPLETED!");
    console.log("=".repeat(80) + "\n");

    console.log("📋 Next Steps:");
    console.log("-".repeat(80));
    console.log("1. Verify final distribution:");
    console.log("   npx hardhat run scripts/deployment/check-mainnet-status.js --network bscMainnet");
    console.log();
    console.log("2. Verify contract on BSCScan:");
    console.log("   npx hardhat verify --network bscMainnet", TOKEN_ADDRESS);
    console.log();
    console.log("3. Update deployment report:");
    console.log("   npx hardhat run scripts/deployment/fix-mainnet-step3-update-report.js --network bscMainnet");
    console.log("-".repeat(80) + "\n");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("\n❌ Transfer failed:");
        console.error(error);
        process.exit(1);
    });
