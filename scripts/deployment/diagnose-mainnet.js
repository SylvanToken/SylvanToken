// Diagnose Mainnet Contract State
const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
    console.log("\n" + "=".repeat(80));
    console.log("🔍 MAINNET CONTRACT DIAGNOSIS");
    console.log("=".repeat(80) + "\n");

    // Load deployment info
    const deploymentFile = path.join(__dirname, "../../deployments/mainnet-deployment.json");
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

    // STEP 1: Check Total Supply vs Distributed
    console.log("=" + "=".repeat(79));
    console.log("STEP 1: SUPPLY ANALYSIS");
    console.log("=" + "=".repeat(79) + "\n");

    const totalSupply = await token.balanceOf(TOKEN_ADDRESS);
    console.log("Total Supply:", ethers.utils.formatEther(totalSupply), "SYL");

    // Note: Deployer and Sylvan Token Wallet are the same address
    const walletsToCheck = [
        { name: "Deployer/Sylvan Token Wallet", address: deployer.address },
        { name: "Founder", address: wallets.system.founder.address },
        { name: "Fee Collection", address: wallets.system.fee.address },
        { name: "Donation", address: wallets.system.donation.address },
        { name: "Locked Reserve", address: wallets.system.locked.address },
        { name: "MAD", address: wallets.admins.mad.address },
        { name: "LEB", address: wallets.admins.leb.address },
        { name: "CNK", address: wallets.admins.cnk.address },
        { name: "KDR", address: wallets.admins.kdr.address },
        { name: "Dead Address", address: wallets.system.dead.address }
    ];

    let totalDistributed = ethers.BigNumber.from(0);
    const balances = {};

    console.log("Wallet Balances:");
    console.log("-".repeat(80));

    for (const wallet of walletsToCheck) {
        const balance = await token.balanceOf(wallet.address);
        balances[wallet.name] = balance;
        totalDistributed = totalDistributed.add(balance);
        
        console.log(`${wallet.name}:`);
        console.log(`  Address: ${wallet.address}`);
        console.log(`  Balance: ${ethers.utils.formatEther(balance)} SYL`);
        console.log();
    }

    console.log("-".repeat(80));
    console.log("Total Distributed:", ethers.utils.formatEther(totalDistributed), "SYL");
    console.log("Expected Total:", "1,000,000,000 SYL");
    console.log("-".repeat(80) + "\n");

    // STEP 2: Check Admin Wallet Configurations
    console.log("=" + "=".repeat(79));
    console.log("STEP 2: ADMIN WALLET CONFIGURATION CHECK");
    console.log("=" + "=".repeat(79) + "\n");

    const adminWallets = [
        { name: "MAD", address: wallets.admins.mad.address },
        { name: "LEB", address: wallets.admins.leb.address },
        { name: "CNK", address: wallets.admins.cnk.address },
        { name: "KDR", address: wallets.admins.kdr.address }
    ];

    for (const admin of adminWallets) {
        console.log(`${admin.name}:`);
        console.log(`  Address: ${admin.address}`);
        
        try {
            // Check if configured
            const isConfigured = await token.isAdminConfigured(admin.address);
            console.log(`  Is Configured: ${isConfigured ? "✅ YES" : "❌ NO"}`);
            
            if (isConfigured) {
                const adminConfig = await token.getAdminConfig(admin.address);
                console.log(`  Total Allocation: ${ethers.utils.formatEther(adminConfig.totalAllocation)} SYL`);
                console.log(`  Immediate Release: ${ethers.utils.formatEther(adminConfig.immediateRelease)} SYL`);
                console.log(`  Locked Amount: ${ethers.utils.formatEther(adminConfig.lockedAmount)} SYL`);
                console.log(`  Released Amount: ${ethers.utils.formatEther(adminConfig.releasedAmount)} SYL`);
                console.log(`  Immediate Released: ${adminConfig.immediateReleased ? "✅" : "❌"}`);
            }
        } catch (error) {
            console.log(`  Error: ${error.message}`);
        }
        
        // Check vesting
        try {
            const vestingInfo = await token.getVestingInfo(admin.address);
            console.log(`  Vesting Active: ${vestingInfo.isActive ? "✅ YES" : "❌ NO"}`);
            
            if (vestingInfo.isActive) {
                console.log(`  Vesting Total: ${ethers.utils.formatEther(vestingInfo.totalAmount)} SYL`);
                console.log(`  Vesting Released: ${ethers.utils.formatEther(vestingInfo.releasedAmount)} SYL`);
            }
        } catch (error) {
            console.log(`  Vesting Error: ${error.message}`);
        }
        
        console.log();
    }

    // STEP 3: Check Locked Reserve
    console.log("=" + "=".repeat(79));
    console.log("STEP 3: LOCKED RESERVE CHECK");
    console.log("=" + "=".repeat(79) + "\n");

    const lockedAddress = wallets.system.locked.address;
    console.log("Locked Reserve Address:", lockedAddress);
    console.log("Balance:", ethers.utils.formatEther(balances["Locked Reserve"]), "SYL");
    
    try {
        const vestingInfo = await token.getVestingInfo(lockedAddress);
        console.log("Vesting Active:", vestingInfo.isActive ? "✅ YES" : "❌ NO");
        
        if (vestingInfo.isActive) {
            console.log("Vesting Total:", ethers.utils.formatEther(vestingInfo.totalAmount), "SYL");
            console.log("Vesting Released:", ethers.utils.formatEther(vestingInfo.releasedAmount), "SYL");
            console.log("Vesting Duration:", vestingInfo.vestingDuration / (30 * 24 * 60 * 60), "months");
        }
    } catch (error) {
        console.log("Vesting Error:", error.message);
    }
    console.log();

    // STEP 4: Problem Analysis
    console.log("=" + "=".repeat(79));
    console.log("STEP 4: PROBLEM ANALYSIS");
    console.log("=" + "=".repeat(79) + "\n");

    const problems = [];
    const solutions = [];

    // Check supply mismatch
    const expectedSupply = ethers.utils.parseEther("1000000000");
    if (totalDistributed.gt(expectedSupply)) {
        problems.push(`❌ Total distributed (${ethers.utils.formatEther(totalDistributed)} SYL) exceeds total supply (1B SYL)`);
        solutions.push("This indicates duplicate transfers or incorrect distribution");
    }

    // Check admin configurations
    let configuredCount = 0;
    for (const admin of adminWallets) {
        try {
            const isConfigured = await token.isAdminConfigured(admin.address);
            if (isConfigured) configuredCount++;
        } catch (error) {
            // Not configured
        }
    }

    if (configuredCount === 0) {
        problems.push("❌ No admin wallets are configured");
        solutions.push("Run: npx hardhat run scripts/deployment/complete-mainnet-setup.js --network bscMainnet");
    } else if (configuredCount < 4) {
        problems.push(`⚠️  Only ${configuredCount}/4 admin wallets configured`);
        solutions.push("Complete the configuration for remaining admin wallets");
    }

    // Check locked reserve
    try {
        const vestingInfo = await token.getVestingInfo(lockedAddress);
        if (!vestingInfo.isActive) {
            problems.push("❌ Locked reserve vesting not configured");
            solutions.push("Configure locked reserve vesting");
        }
    } catch (error) {
        problems.push("❌ Locked reserve vesting not configured");
        solutions.push("Configure locked reserve vesting");
    }

    if (problems.length > 0) {
        console.log("🚨 PROBLEMS FOUND:");
        console.log("-".repeat(80));
        problems.forEach((problem, index) => {
            console.log(`${index + 1}. ${problem}`);
        });
        console.log();

        console.log("💡 RECOMMENDED SOLUTIONS:");
        console.log("-".repeat(80));
        solutions.forEach((solution, index) => {
            console.log(`${index + 1}. ${solution}`);
        });
        console.log();
    } else {
        console.log("✅ NO PROBLEMS FOUND");
        console.log();
    }

    console.log("=" + "=".repeat(79) + "\n");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("\n❌ Diagnosis failed:");
        console.error(error);
        process.exit(1);
    });
