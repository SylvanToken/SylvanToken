// Complete Mainnet Setup - Distribution + Admin Configuration
const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
    console.log("\n" + "=".repeat(80));
    console.log("🚀 COMPLETE MAINNET SETUP - DISTRIBUTION + CONFIGURATION");
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

    // Get contract and signer
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
        console.error("This script requires owner privileges to:");
        console.error("  • Distribute tokens");
        console.error("  • Configure admin wallets");
        console.error("  • Set up vesting schedules");
        console.error("  • Manage fee exemptions");
        console.error("\n📝 To fix this:");
        console.error("  1. Use the owner wallet's private key");
        console.error("  2. Update your .env file with PRIVATE_KEY from owner wallet");
        console.error("  3. Or use hardware wallet if owner is a hardware wallet");
        console.error("\nExpected Owner:", currentOwner);
        console.error("Your Signer:  ", signer.address);
        console.error("-".repeat(80));
        process.exit(1);
    }
    
    console.log("✅ Ownership verified - signer is the owner");
    console.log("-".repeat(80) + "\n");
    
    // Check if ownership transfer was completed
    if (deploymentInfo.ownershipTransfer) {
        if (deploymentInfo.ownershipTransfer.executed) {
            console.log("✅ Ownership Transfer Status: Completed");
            console.log("   Previous Owner:", deploymentInfo.ownershipTransfer.previousOwner);
            console.log("   Current Owner: ", deploymentInfo.ownershipTransfer.newOwner);
        } else {
            console.error("⚠️  WARNING: Ownership transfer was not completed during deployment!");
            console.error("   This should have been resolved before running this script.");
        }
        console.log();
    }

    // Load configuration
    const config = require("../../config/deployment.config.js");
    const wallets = config.wallets;
    const allocations = config.allocations;

    // Check current state
    console.log("📊 Current State Check:");
    console.log("-".repeat(80));
    
    const ownerBalance = await token.balanceOf(signer.address);
    const totalSupply = await token.totalSupply();
    
    console.log("Total Supply:", ethers.utils.formatEther(totalSupply), "SYL");
    console.log("Owner Balance:", ethers.utils.formatEther(ownerBalance), "SYL");
    console.log("-".repeat(80) + "\n");

    if (ownerBalance.eq(0)) {
        console.error("❌ Owner has no tokens! Cannot proceed with distribution.");
        console.error("Please ensure tokens are minted to owner first.");
        console.error("\nNote: If tokens were minted to the deployer wallet,");
        console.error("you need to transfer them to the owner wallet first.");
        process.exit(1);
    }

    console.log("⚠️  WARNING: This will perform the following actions:");
    console.log("-".repeat(80));
    console.log("1. Distribute tokens to all wallets");
    console.log("2. Configure admin wallets with vesting");
    console.log("3. Configure locked reserve with vesting");
    console.log("4. Set up fee exemptions");
    console.log("-".repeat(80));
    console.log("\nPress Ctrl+C to cancel, or wait 10 seconds to continue...\n");
    
    await new Promise(resolve => setTimeout(resolve, 10000));

    // STEP 1: Initial Token Distribution
    console.log("=" + "=".repeat(79));
    console.log("STEP 1: TOKEN DISTRIBUTION");
    console.log("=" + "=".repeat(79) + "\n");

    const distributions = [
        {
            name: "Founder",
            address: wallets.system.founder.address,
            amount: ethers.utils.parseEther(allocations.founder)
        },
        {
            name: "Sylvan Token Wallet",
            address: wallets.system.sylvanToken.address,
            amount: ethers.utils.parseEther(allocations.sylvanToken)
        },
        {
            name: "Locked Reserve",
            address: wallets.system.locked.address,
            amount: ethers.utils.parseEther(allocations.locked)
        },
        {
            name: "MAD",
            address: wallets.admins.mad.address,
            amount: ethers.utils.parseEther(allocations.admins.mad)
        },
        {
            name: "LEB",
            address: wallets.admins.leb.address,
            amount: ethers.utils.parseEther(allocations.admins.leb)
        },
        {
            name: "CNK",
            address: wallets.admins.cnk.address,
            amount: ethers.utils.parseEther(allocations.admins.cnk)
        },
        {
            name: "KDR",
            address: wallets.admins.kdr.address,
            amount: ethers.utils.parseEther(allocations.admins.kdr)
        }
    ];

    let distributionSuccess = 0;
    let distributionSkipped = 0;

    for (const dist of distributions) {
        console.log(`Distributing to ${dist.name}...`);
        console.log(`Address: ${dist.address}`);
        console.log(`Amount: ${ethers.utils.formatEther(dist.amount)} SYL`);

        try {
            const currentBalance = await token.balanceOf(dist.address);
            
            if (currentBalance.gte(dist.amount)) {
                console.log(`⚠️  Already has sufficient balance (${ethers.utils.formatEther(currentBalance)} SYL), skipping...`);
                distributionSkipped++;
                console.log();
                continue;
            }

            const amountToSend = dist.amount.sub(currentBalance);
            console.log(`Sending ${ethers.utils.formatEther(amountToSend)} SYL...`);
            
            const tx = await token.transfer(dist.address, amountToSend);
            console.log(`TX: ${tx.hash}`);
            
            const receipt = await tx.wait();
            console.log(`✅ Distributed successfully (Block: ${receipt.blockNumber})`);
            distributionSuccess++;
            
            const newBalance = await token.balanceOf(dist.address);
            console.log(`New Balance: ${ethers.utils.formatEther(newBalance)} SYL`);
            console.log();

        } catch (error) {
            console.error(`❌ Failed to distribute to ${dist.name}:`);
            console.error(`Error: ${error.message}`);
            console.log();
        }
    }

    console.log("-".repeat(80));
    console.log(`✅ Distributed: ${distributionSuccess}`);
    console.log(`⚠️  Skipped: ${distributionSkipped}`);
    console.log(`❌ Failed: ${distributions.length - distributionSuccess - distributionSkipped}`);
    console.log("-".repeat(80) + "\n");

    // STEP 2: Configure Admin Wallets
    console.log("=" + "=".repeat(79));
    console.log("STEP 2: CONFIGURE ADMIN WALLETS");
    console.log("=" + "=".repeat(79) + "\n");

    const adminWallets = [
        { name: "MAD", address: wallets.admins.mad.address },
        { name: "LEB", address: wallets.admins.leb.address },
        { name: "CNK", address: wallets.admins.cnk.address },
        { name: "KDR", address: wallets.admins.kdr.address }
    ];

    let configSuccess = 0;
    let configSkipped = 0;

    for (const admin of adminWallets) {
        console.log(`Configuring ${admin.name}...`);
        console.log(`Address: ${admin.address}`);

        try {
            // Check if already configured
            const isConfigured = await token.isAdminConfigured(admin.address);
            
            if (isConfigured) {
                console.log(`⚠️  Already configured, skipping...`);
                configSkipped++;
                console.log();
                continue;
            }

            const allocation = ethers.utils.parseEther("10000000"); // 10M SYL
            console.log(`Allocation: ${ethers.utils.formatEther(allocation)} SYL`);
            console.log("Sending configuration transaction...");
            
            const tx = await token.configureAdminWallet(admin.address, allocation);
            console.log(`TX: ${tx.hash}`);
            
            const receipt = await tx.wait();
            console.log(`✅ Configured successfully (Block: ${receipt.blockNumber})`);
            configSuccess++;
            
            // Verify configuration
            const adminConfig = await token.getAdminConfig(admin.address);
            console.log(`Verified - Total: ${ethers.utils.formatEther(adminConfig.totalAllocation)} SYL`);
            console.log(`Immediate: ${ethers.utils.formatEther(adminConfig.immediateRelease)} SYL`);
            console.log(`Locked: ${ethers.utils.formatEther(adminConfig.lockedAmount)} SYL`);
            console.log();

        } catch (error) {
            console.error(`❌ Failed to configure ${admin.name}:`);
            console.error(`Error: ${error.message}`);
            console.log();
        }
    }

    console.log("-".repeat(80));
    console.log(`✅ Configured: ${configSuccess}`);
    console.log(`⚠️  Skipped: ${configSkipped}`);
    console.log(`❌ Failed: ${adminWallets.length - configSuccess - configSkipped}`);
    console.log("-".repeat(80) + "\n");

    // STEP 3: Process Initial Releases for Admin Wallets
    console.log("=" + "=".repeat(79));
    console.log("STEP 3: PROCESS INITIAL RELEASES");
    console.log("=" + "=".repeat(79) + "\n");

    let releaseSuccess = 0;
    let releaseSkipped = 0;

    for (const admin of adminWallets) {
        console.log(`Processing initial release for ${admin.name}...`);

        try {
            const adminConfig = await token.getAdminConfig(admin.address);
            
            if (adminConfig.immediateReleased) {
                console.log(`⚠️  Initial release already processed, skipping...`);
                releaseSkipped++;
                console.log();
                continue;
            }

            console.log("Sending release transaction...");
            const tx = await token.processInitialRelease(admin.address);
            console.log(`TX: ${tx.hash}`);
            
            const receipt = await tx.wait();
            console.log(`✅ Initial release processed (Block: ${receipt.blockNumber})`);
            releaseSuccess++;
            
            const balance = await token.balanceOf(admin.address);
            console.log(`Current Balance: ${ethers.utils.formatEther(balance)} SYL`);
            console.log();

        } catch (error) {
            console.error(`❌ Failed to process release for ${admin.name}:`);
            console.error(`Error: ${error.message}`);
            console.log();
        }
    }

    console.log("-".repeat(80));
    console.log(`✅ Processed: ${releaseSuccess}`);
    console.log(`⚠️  Skipped: ${releaseSkipped}`);
    console.log(`❌ Failed: ${adminWallets.length - releaseSuccess - releaseSkipped}`);
    console.log("-".repeat(80) + "\n");

    // STEP 4: Configure Locked Reserve
    console.log("=" + "=".repeat(79));
    console.log("STEP 4: CONFIGURE LOCKED RESERVE");
    console.log("=" + "=".repeat(79) + "\n");

    try {
        const lockedAddress = wallets.system.locked.address;
        console.log("Locked Reserve Address:", lockedAddress);

        // Check if already configured
        try {
            const vestingInfo = await token.getVestingInfo(lockedAddress);
            if (vestingInfo.totalAllocation.gt(0)) {
                console.log("⚠️  Locked reserve already configured");
                console.log(`Total Allocation: ${ethers.utils.formatEther(vestingInfo.totalAllocation)} SYL`);
                console.log();
            } else {
                throw new Error("Not configured");
            }
        } catch (error) {
            console.log("Configuring locked reserve vesting...");
            const allocation = ethers.utils.parseEther(allocations.locked);
            console.log(`Allocation: ${ethers.utils.formatEther(allocation)} SYL`);
            
            const tx = await token.configureLockedWallet(lockedAddress, allocation);
            console.log(`TX: ${tx.hash}`);
            
            const receipt = await tx.wait();
            console.log(`✅ Locked reserve configured (Block: ${receipt.blockNumber})`);
            
            const vestingInfo = await token.getVestingInfo(lockedAddress);
            console.log(`Verified - Total: ${ethers.utils.formatEther(vestingInfo.totalAllocation)} SYL`);
            console.log();
        }
    } catch (error) {
        console.error("❌ Failed to configure locked reserve:");
        console.error(`Error: ${error.message}`);
        console.log();
    }

    // Final Summary
    console.log("=" + "=".repeat(79));
    console.log("📊 FINAL SUMMARY");
    console.log("=" + "=".repeat(79) + "\n");

    console.log("Distribution Results:");
    console.log(`  ✅ Success: ${distributionSuccess}/${distributions.length}`);
    console.log();

    console.log("Admin Configuration Results:");
    console.log(`  ✅ Success: ${configSuccess}/${adminWallets.length}`);
    console.log();

    console.log("Initial Release Results:");
    console.log(`  ✅ Success: ${releaseSuccess}/${adminWallets.length}`);
    console.log();

    // Verify final state
    console.log("🔍 Final State Verification:");
    console.log("-".repeat(80));

    for (const admin of adminWallets) {
        const balance = await token.balanceOf(admin.address);
        const config = await token.getAdminConfig(admin.address);
        console.log(`${admin.name}:`);
        console.log(`  Balance: ${ethers.utils.formatEther(balance)} SYL`);
        console.log(`  Total Allocation: ${ethers.utils.formatEther(config.totalAllocation)} SYL`);
        console.log(`  Locked: ${ethers.utils.formatEther(config.lockedAmount)} SYL`);
        console.log(`  Released: ${ethers.utils.formatEther(config.releasedAmount)} SYL`);
        console.log();
    }

    console.log("-".repeat(80) + "\n");

    console.log("✅ MAINNET SETUP COMPLETED!");
    console.log();
    console.log("📋 Next Steps:");
    console.log("-".repeat(80));
    console.log("1. Verify status:");
    console.log("   npm run mainnet:check");
    console.log();
    console.log("2. Verify contract on BSCScan:");
    console.log("   npx hardhat run scripts/deployment/verify-mainnet.js --network bscMainnet");
    console.log();
    console.log("3. Check holders on BSCScan:");
    console.log(`   https://bscscan.com/token/${TOKEN_ADDRESS}#balances`);
    console.log("-".repeat(80) + "\n");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("\n❌ Setup failed:");
        console.error(error);
        process.exit(1);
    });
