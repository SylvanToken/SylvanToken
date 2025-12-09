// Configure Admin Wallets on Mainnet with Vesting
const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
    console.log("\n" + "=".repeat(80));
    console.log("🔧 ADMIN WALLET CONFIGURATION - MAINNET");
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
    const [signer] = await ethers.getSigners();

    console.log("Signer:", signer.address);
    
    // Verify ownership
    console.log("\n🔍 Verifying Ownership...");
    console.log("-".repeat(80));
    
    const currentOwner = await token.owner();
    console.log("Current Owner:", currentOwner);
    console.log("Signer Address:", signer.address);
    
    if (currentOwner.toLowerCase() !== signer.address.toLowerCase()) {
        console.error("\n❌ ERROR: Signer is not the contract owner!");
        console.error("-".repeat(80));
        console.error("This script requires owner privileges to configure admin wallets.");
        console.error("\n📝 To fix this:");
        console.error("  • Use the owner wallet's private key (not deployer)");
        console.error("  • Update PRIVATE_KEY in .env with owner wallet's key");
        console.error("\nExpected Owner:", currentOwner);
        console.error("Your Signer:  ", signer.address);
        console.error("-".repeat(80));
        process.exit(1);
    }
    
    console.log("✅ Ownership verified - proceeding with configuration");
    console.log("-".repeat(80) + "\n");

    // Load configuration
    const config = require("../../config/deployment.config.js");
    const wallets = config.wallets;

    // Admin wallets to configure
    const adminWallets = [
        { 
            name: "MAD", 
            address: wallets.admins.mad.address,
            allocation: ethers.utils.parseEther("10000000") // 10M SYL
        },
        { 
            name: "LEB", 
            address: wallets.admins.leb.address,
            allocation: ethers.utils.parseEther("10000000")
        },
        { 
            name: "CNK", 
            address: wallets.admins.cnk.address,
            allocation: ethers.utils.parseEther("10000000")
        },
        { 
            name: "KDR", 
            address: wallets.admins.kdr.address,
            allocation: ethers.utils.parseEther("10000000")
        }
    ];

    console.log("📋 Admin Wallet Configuration Plan:");
    console.log("-".repeat(80));
    console.log("Total Allocation per Admin: 10M SYL");
    console.log("Immediate Release: 10% (1M SYL)");
    console.log("Locked Amount: 90% (9M SYL)");
    console.log("Vesting Duration: 18 months");
    console.log("Monthly Release: 5% (500K SYL)");
    console.log("Burn Rate: 10% of each release");
    console.log("-".repeat(80) + "\n");

    console.log("⚠️  WARNING: You are about to configure admin wallets on MAINNET!");
    console.log("⚠️  This will set up vesting schedules that cannot be changed!");
    console.log("\nPress Ctrl+C to cancel, or wait 10 seconds to continue...\n");
    
    await new Promise(resolve => setTimeout(resolve, 10000));

    // Configure each admin wallet
    console.log("🔧 Configuring Admin Wallets...\n");

    let successCount = 0;
    let skippedCount = 0;

    for (const admin of adminWallets) {
        console.log(`Configuring ${admin.name}...`);
        console.log(`Address: ${admin.address}`);
        console.log(`Allocation: ${ethers.utils.formatEther(admin.allocation)} SYL`);

        try {
            // Check if already configured
            const isConfigured = await token.isAdminConfigured(admin.address);
            
            if (isConfigured) {
                console.log(`⚠️  ${admin.name} already configured, skipping...`);
                skippedCount++;
                console.log();
                continue;
            }

            // Check current balance
            const currentBalance = await token.balanceOf(admin.address);
            console.log(`Current Balance: ${ethers.utils.formatEther(currentBalance)} SYL`);

            // Configure admin wallet
            console.log("Sending configuration transaction...");
            const tx = await token.configureAdminWallet(admin.address, admin.allocation);
            console.log(`TX: ${tx.hash}`);
            
            console.log("Waiting for confirmation...");
            const receipt = await tx.wait();
            console.log(`✅ ${admin.name} configured successfully (Block: ${receipt.blockNumber})`);
            successCount++;
            
            // Verify configuration
            const config = await token.getAdminConfig(admin.address);
            console.log(`Verified - Total Allocation: ${ethers.utils.formatEther(config.totalAllocation)} SYL`);
            console.log();

        } catch (error) {
            console.error(`❌ Failed to configure ${admin.name}:`);
            console.error(`Error: ${error.message}`);
            console.log();
        }
    }

    // Summary
    console.log("=".repeat(80));
    console.log("📊 CONFIGURATION SUMMARY");
    console.log("=".repeat(80));
    console.log(`✅ Successfully Configured: ${successCount}`);
    console.log(`⚠️  Skipped (Already Configured): ${skippedCount}`);
    console.log(`❌ Failed: ${4 - successCount - skippedCount}`);
    console.log("=".repeat(80) + "\n");

    // Verify all configurations
    console.log("🔍 Verifying All Admin Configurations...\n");

    for (const admin of adminWallets) {
        try {
            const config = await token.getAdminConfig(admin.address);
            console.log(`${admin.name}:`);
            console.log(`   Total Allocation: ${ethers.utils.formatEther(config.totalAllocation)} SYL`);
            console.log(`   Immediate Release: ${ethers.utils.formatEther(config.immediateRelease)} SYL`);
            console.log(`   Locked Amount: ${ethers.utils.formatEther(config.lockedAmount)} SYL`);
            console.log(`   Monthly Release: ${ethers.utils.formatEther(config.monthlyRelease)} SYL`);
            console.log(`   Released: ${ethers.utils.formatEther(config.releasedAmount)} SYL`);
            console.log(`   Burned: ${ethers.utils.formatEther(config.burnedAmount)} SYL`);
            console.log(`   Configured: ${config.isConfigured ? "✅" : "❌"}`);
            console.log(`   Initial Released: ${config.immediateReleased ? "✅" : "❌"}`);
            console.log();
        } catch (error) {
            console.log(`${admin.name}: ❌ Not configured or error reading config`);
            console.log();
        }
    }

    console.log("=".repeat(80));
    console.log("✅ ADMIN WALLET CONFIGURATION COMPLETED!");
    console.log("=".repeat(80) + "\n");

    console.log("📋 Next Steps:");
    console.log("-".repeat(80));
    console.log("1. Process initial releases (1M SYL each):");
    console.log("   npx hardhat run scripts/deployment/process-initial-releases.js --network bscMainnet");
    console.log();
    console.log("2. Configure locked reserve:");
    console.log("   npx hardhat run scripts/deployment/configure-locked-reserve.js --network bscMainnet");
    console.log();
    console.log("3. Verify final status:");
    console.log("   npm run mainnet:check");
    console.log("-".repeat(80) + "\n");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("\n❌ Configuration failed:");
        console.error(error);
        process.exit(1);
    });
