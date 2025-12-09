// Step 1: Configure Admin Wallets and Locked Reserve Vesting
// This script sets up vesting schedules for admin wallets and locked reserve

const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
    console.log("\n" + "=".repeat(80));
    console.log("🔧 STEP 1: CONFIGURE VESTING SCHEDULES");
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

    console.log("⚠️  WARNING: You are about to configure vesting on MAINNET!");
    console.log("⚠️  This will set up vesting schedules for admin wallets and locked reserve!");
    console.log("\nPress Ctrl+C to cancel, or wait 10 seconds to continue...\n");
    
    await new Promise(resolve => setTimeout(resolve, 10000));

    // Admin wallet configurations
    const adminWallets = [
        { 
            name: "MAD", 
            address: wallets.admins.mad.address,
            allocation: ethers.utils.parseEther("10000000") // 10M SYL
        },
        { 
            name: "LEB", 
            address: wallets.admins.leb.address,
            allocation: ethers.utils.parseEther("10000000") // 10M SYL
        },
        { 
            name: "CNK", 
            address: wallets.admins.cnk.address,
            allocation: ethers.utils.parseEther("10000000") // 10M SYL
        },
        { 
            name: "KDR", 
            address: wallets.admins.kdr.address,
            allocation: ethers.utils.parseEther("10000000") // 10M SYL
        }
    ];

    console.log("📋 Admin Wallet Vesting Configuration:");
    console.log("-".repeat(80));
    console.log("Total Allocation per Admin: 10M SYL");
    console.log("Immediate Release: 10% (1M SYL) - Already done");
    console.log("Locked Amount: 90% (9M SYL)");
    console.log("Vesting Duration: 18 months");
    console.log("Monthly Release: 5% (500K SYL)");
    console.log("Burn Rate: 10% of each release");
    console.log("Cliff: 0 days (immediate start)");
    console.log("-".repeat(80) + "\n");

    // Configure admin wallets
    console.log("🔧 Configuring Admin Wallets...\n");

    for (const admin of adminWallets) {
        console.log(`Configuring ${admin.name}...`);
        console.log(`Address: ${admin.address}`);
        console.log(`Allocation: ${ethers.utils.formatEther(admin.allocation)} SYL`);

        try {
            // Check if already configured
            const isConfigured = await token.isAdminConfigured(admin.address);
            
            if (isConfigured) {
                console.log(`⚠️  ${admin.name} already configured, skipping...`);
                console.log();
                continue;
            }

            // Configure admin wallet
            const tx = await token.configureAdminWallet(admin.address, admin.allocation);
            console.log(`TX: ${tx.hash}`);
            await tx.wait();
            console.log(`✅ ${admin.name} configured successfully`);
            console.log();
        } catch (error) {
            console.error(`❌ Failed to configure ${admin.name}:`, error.message);
            console.log();
        }
    }

    // Locked reserve configuration
    console.log("📋 Locked Reserve Vesting Configuration:");
    console.log("-".repeat(80));
    console.log("Total Allocation: 300M SYL");
    console.log("Immediate Release: 0%");
    console.log("Locked Amount: 100% (300M SYL)");
    console.log("Vesting Duration: 34 months");
    console.log("Monthly Release: 3% (~9M SYL)");
    console.log("Burn Rate: 10% of each release");
    console.log("Cliff: 30 days");
    console.log("-".repeat(80) + "\n");

    console.log("🔧 Configuring Locked Reserve...\n");

    const lockedReserve = {
        address: wallets.system.locked.address,
        amount: ethers.utils.parseEther("300000000"), // 300M SYL
        cliffDays: 30,
        vestingMonths: 34,
        releasePercentage: 300, // 3% monthly
        burnPercentage: 1000, // 10% burn
        isAdmin: false
    };

    try {
        // Check if vesting schedule already exists
        const hasVesting = await token.hasVestingSchedule(lockedReserve.address);
        
        if (hasVesting) {
            console.log("⚠️  Locked Reserve already has vesting schedule, skipping...");
        } else {
            // Create vesting schedule
            const tx = await token.createVestingSchedule(
                lockedReserve.address,
                lockedReserve.amount,
                lockedReserve.cliffDays,
                lockedReserve.vestingMonths,
                lockedReserve.releasePercentage,
                lockedReserve.burnPercentage,
                lockedReserve.isAdmin
            );
            console.log(`TX: ${tx.hash}`);
            await tx.wait();
            console.log("✅ Locked Reserve vesting configured successfully");
        }
    } catch (error) {
        console.error("❌ Failed to configure Locked Reserve:", error.message);
    }

    console.log();

    // Verify configurations
    console.log("🔍 Verifying Configurations...\n");

    console.log("Admin Wallets:");
    console.log("-".repeat(80));
    for (const admin of adminWallets) {
        try {
            const config = await token.getAdminConfig(admin.address);
            console.log(`${admin.name}:`);
            console.log(`   Total Allocation: ${ethers.utils.formatEther(config.totalAllocation)} SYL`);
            console.log(`   Immediate Release: ${ethers.utils.formatEther(config.immediateRelease)} SYL`);
            console.log(`   Locked Amount: ${ethers.utils.formatEther(config.lockedAmount)} SYL`);
            console.log(`   Monthly Release: ${ethers.utils.formatEther(config.monthlyRelease)} SYL`);
            console.log(`   Released: ${ethers.utils.formatEther(config.releasedAmount)} SYL`);
            console.log(`   Configured: ${config.isConfigured ? "✅" : "❌"}`);
            console.log();
        } catch (error) {
            console.log(`${admin.name}: ❌ Not configured`);
            console.log();
        }
    }

    console.log("Locked Reserve:");
    console.log("-".repeat(80));
    try {
        const vestingInfo = await token.getVestingInfo(lockedReserve.address);
        console.log(`Total Amount: ${ethers.utils.formatEther(vestingInfo.totalAmount)} SYL`);
        console.log(`Released: ${ethers.utils.formatEther(vestingInfo.releasedAmount)} SYL`);
        console.log(`Burned: ${ethers.utils.formatEther(vestingInfo.burnedAmount)} SYL`);
        console.log(`Start Time: ${new Date(vestingInfo.startTime * 1000).toISOString()}`);
        console.log(`Cliff Duration: ${vestingInfo.cliffDuration / 86400} days`);
        console.log(`Vesting Duration: ${vestingInfo.vestingDuration / 2629746} months`);
        console.log(`Active: ${vestingInfo.isActive ? "✅" : "❌"}`);
    } catch (error) {
        console.log("❌ Not configured:", error.message);
    }

    console.log();
    console.log("=".repeat(80));
    console.log("✅ STEP 1 COMPLETED!");
    console.log("=".repeat(80) + "\n");

    console.log("📋 Next Steps:");
    console.log("-".repeat(80));
    console.log("1. Transfer 300M SYL to Locked Reserve:");
    console.log("   npx hardhat run scripts/deployment/fix-mainnet-step2-transfer-locked.js --network bscMainnet");
    console.log();
    console.log("2. Verify contract on BSCScan:");
    console.log("   npx hardhat verify --network bscMainnet", TOKEN_ADDRESS);
    console.log("-".repeat(80) + "\n");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("\n❌ Configuration failed:");
        console.error(error);
        process.exit(1);
    });
