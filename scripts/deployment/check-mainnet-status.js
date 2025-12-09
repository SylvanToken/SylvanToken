// Check Mainnet Deployment Status and Holder Information
const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
    console.log("\n" + "=".repeat(80));
    console.log("🔍 MAINNET DEPLOYMENT STATUS CHECK");
    console.log("=".repeat(80) + "\n");

    // Load deployment info
    const deploymentFile = path.join(__dirname, "../../deployments/mainnet-deployment.json");
    if (!fs.existsSync(deploymentFile)) {
        console.error("❌ Deployment file not found!");
        process.exit(1);
    }

    const deploymentInfo = JSON.parse(fs.readFileSync(deploymentFile, "utf8"));
    const TOKEN_ADDRESS = deploymentInfo.contractAddress;

    console.log("📋 Deployment Information:");
    console.log("-".repeat(80));
    console.log("Contract Address:", TOKEN_ADDRESS);
    console.log("Network:", deploymentInfo.network);
    console.log("Chain ID:", deploymentInfo.chainId);
    console.log("Deployer:", deploymentInfo.deployer);
    console.log("Deployment TX:", deploymentInfo.deploymentTx);
    console.log("Block Number:", deploymentInfo.blockNumber);
    console.log("Timestamp:", deploymentInfo.timestamp);
    console.log("-".repeat(80) + "\n");

    // Get contract
    console.log("🔗 Connecting to contract...");
    const token = await ethers.getContractAt("SylvanToken", TOKEN_ADDRESS);
    console.log("✅ Connected successfully\n");

    // Get basic info
    console.log("📊 Token Information:");
    console.log("-".repeat(80));
    const name = await token.name();
    const symbol = await token.symbol();
    const decimals = await token.decimals();
    const totalSupply = await token.totalSupply();
    const owner = await token.owner();

    console.log("Name:", name);
    console.log("Symbol:", symbol);
    console.log("Decimals:", decimals);
    console.log("Total Supply:", ethers.utils.formatEther(totalSupply), "SYL");
    console.log("Owner:", owner);
    console.log("-".repeat(80) + "\n");

    // Load configuration
    const config = require("../../config/deployment.config.js");
    const wallets = config.wallets;

    // Check all wallet balances
    console.log("💰 Wallet Balances:");
    console.log("-".repeat(80));

    // Note: Deployer and Sylvan Token Wallet are the same address
    const walletsToCheck = [
        { name: "Deployer/Sylvan Token Wallet", address: deploymentInfo.deployer },
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
    const holders = [];

    for (const wallet of walletsToCheck) {
        const balance = await token.balanceOf(wallet.address);
        const balanceFormatted = ethers.utils.formatEther(balance);
        
        if (balance.gt(0)) {
            holders.push({
                name: wallet.name,
                address: wallet.address,
                balance: balanceFormatted
            });
            totalDistributed = totalDistributed.add(balance);
        }

        const icon = balance.gt(0) ? "✅" : "⚠️ ";
        console.log(`${icon} ${wallet.name}:`);
        console.log(`   Address: ${wallet.address}`);
        console.log(`   Balance: ${balanceFormatted} SYL`);
        console.log();
    }

    console.log("-".repeat(80));
    console.log("Total Distributed:", ethers.utils.formatEther(totalDistributed), "SYL");
    console.log("Total Holders:", holders.length);
    console.log("-".repeat(80) + "\n");

    // Check fee exemptions
    console.log("🚫 Fee Exemption Status:");
    console.log("-".repeat(80));

    for (const wallet of walletsToCheck) {
        try {
            const isExempt = await token.isExempt(wallet.address);
            const icon = isExempt ? "✅" : "❌";
            console.log(`${icon} ${wallet.name}: ${isExempt ? "EXEMPT" : "NOT EXEMPT"}`);
        } catch (error) {
            console.log(`⚠️  ${wallet.name}: Unable to check (${error.message})`);
        }
    }
    console.log("-".repeat(80) + "\n");

    // Check vesting status for admin wallets
    console.log("🔒 Vesting Status (Admin Wallets):");
    console.log("-".repeat(80));

    const adminWallets = [
        { name: "MAD", address: wallets.admins.mad.address },
        { name: "LEB", address: wallets.admins.leb.address },
        { name: "CNK", address: wallets.admins.cnk.address },
        { name: "KDR", address: wallets.admins.kdr.address }
    ];

    for (const admin of adminWallets) {
        try {
            const vestingInfo = await token.getVestingInfo(admin.address);
            
            if (!vestingInfo.isActive) {
                console.log(`${admin.name}: ⚠️  No active vesting schedule`);
                console.log();
                continue;
            }
            
            console.log(`${admin.name}:`);
            console.log(`   Total Amount: ${ethers.utils.formatEther(vestingInfo.totalAmount)} SYL`);
            console.log(`   Released: ${ethers.utils.formatEther(vestingInfo.releasedAmount)} SYL`);
            console.log(`   Burned: ${ethers.utils.formatEther(vestingInfo.burnedAmount)} SYL`);
            console.log(`   Start Time: ${new Date(vestingInfo.startTime * 1000).toISOString()}`);
            console.log(`   Cliff Duration: ${vestingInfo.cliffDuration / (24 * 60 * 60)} days`);
            console.log(`   Vesting Duration: ${vestingInfo.vestingDuration / (30 * 24 * 60 * 60)} months`);
            console.log(`   Release %: ${vestingInfo.releasePercentage / 100}%`);
            console.log(`   Is Admin: ${vestingInfo.isAdmin ? "✅" : "❌"}`);
            console.log();
        } catch (error) {
            console.log(`${admin.name}: ⚠️  No vesting info (${error.message})`);
            console.log();
        }
    }
    console.log("-".repeat(80) + "\n");

    // Check locked reserve vesting
    console.log("🔒 Locked Reserve Vesting Status:");
    console.log("-".repeat(80));
    try {
        const lockedInfo = await token.getVestingInfo(wallets.system.locked.address);
        
        if (!lockedInfo.isActive) {
            console.log(`⚠️  No active vesting schedule`);
        } else {
            console.log(`Total Amount: ${ethers.utils.formatEther(lockedInfo.totalAmount)} SYL`);
            console.log(`Released: ${ethers.utils.formatEther(lockedInfo.releasedAmount)} SYL`);
            console.log(`Burned: ${ethers.utils.formatEther(lockedInfo.burnedAmount)} SYL`);
            console.log(`Start Time: ${new Date(lockedInfo.startTime * 1000).toISOString()}`);
            console.log(`Cliff Duration: ${lockedInfo.cliffDuration / (24 * 60 * 60)} days`);
            console.log(`Vesting Duration: ${lockedInfo.vestingDuration / (30 * 24 * 60 * 60)} months`);
            console.log(`Release %: ${lockedInfo.releasePercentage / 100}%`);
        }
    } catch (error) {
        console.log(`⚠️  No vesting info: ${error.message}`);
    }
    console.log("-".repeat(80) + "\n");

    // Check contract verification status
    console.log("🔍 Contract Verification Status:");
    console.log("-".repeat(80));
    console.log("BSCScan Link:", `https://bscscan.com/address/${TOKEN_ADDRESS}`);
    console.log("Token Tracker:", `https://bscscan.com/token/${TOKEN_ADDRESS}`);
    console.log("Holders Page:", `https://bscscan.com/token/${TOKEN_ADDRESS}#balances`);
    console.log("-".repeat(80) + "\n");

    // Summary
    console.log("📊 SUMMARY:");
    console.log("-".repeat(80));
    console.log(`✅ Contract Deployed: ${TOKEN_ADDRESS}`);
    console.log(`✅ Total Supply: ${ethers.utils.formatEther(totalSupply)} SYL`);
    console.log(`✅ Total Distributed: ${ethers.utils.formatEther(totalDistributed)} SYL`);
    console.log(`✅ Active Holders: ${holders.length}`);
    console.log(`✅ Owner: ${owner}`);
    console.log("-".repeat(80) + "\n");

    // Potential issues
    console.log("⚠️  POTENTIAL ISSUES TO CHECK:");
    console.log("-".repeat(80));
    
    const issues = [];

    // Check if contract is verified
    console.log("1. Contract Verification:");
    console.log("   - Visit:", `https://bscscan.com/address/${TOKEN_ADDRESS}#code`);
    console.log("   - If not verified, holders may not show up properly");
    console.log("   - Run: npx hardhat verify --network bscMainnet", TOKEN_ADDRESS);
    console.log();

    // Check if tokens are distributed
    if (totalDistributed.eq(0)) {
        issues.push("No tokens distributed yet");
        console.log("2. Token Distribution:");
        console.log("   ❌ No tokens have been distributed");
        console.log("   - Run: npx hardhat run scripts/deployment/distribute-mainnet.js --network bscMainnet");
        console.log();
    } else if (totalDistributed.lt(totalSupply)) {
        console.log("2. Token Distribution:");
        console.log("   ⚠️  Not all tokens distributed");
        console.log("   - Distributed:", ethers.utils.formatEther(totalDistributed), "SYL");
        console.log("   - Remaining:", ethers.utils.formatEther(totalSupply.sub(totalDistributed)), "SYL");
        console.log();
    } else {
        console.log("2. Token Distribution:");
        console.log("   ✅ All tokens distributed");
        console.log();
    }

    // Check if admin wallets are configured
    let adminConfigured = 0;
    for (const admin of adminWallets) {
        try {
            const vestingInfo = await token.getVestingInfo(admin.address);
            if (vestingInfo.isActive && vestingInfo.totalAmount.gt(0)) {
                adminConfigured++;
            }
        } catch (error) {
            // Not configured
        }
    }

    console.log("3. Admin Wallet Configuration:");
    if (adminConfigured === 0) {
        issues.push("Admin wallets not configured");
        console.log("   ❌ No admin wallets configured");
        console.log("   - Run: npx hardhat run scripts/deployment/configure-mainnet.js --network bscMainnet");
    } else if (adminConfigured < 4) {
        console.log(`   ⚠️  Only ${adminConfigured}/4 admin wallets configured`);
    } else {
        console.log("   ✅ All admin wallets configured");
    }
    console.log();

    // Check BSCScan API
    console.log("4. BSCScan Indexing:");
    console.log("   - BSCScan may take 5-10 minutes to index new contracts");
    console.log("   - Holders page:", `https://bscscan.com/token/${TOKEN_ADDRESS}#balances`);
    console.log("   - If holders don't show, wait a few minutes and refresh");
    console.log();

    console.log("-".repeat(80) + "\n");

    if (issues.length > 0) {
        console.log("❌ ISSUES FOUND:");
        issues.forEach((issue, index) => {
            console.log(`   ${index + 1}. ${issue}`);
        });
        console.log();
    } else {
        console.log("✅ NO CRITICAL ISSUES FOUND");
        console.log();
        console.log("If holders still don't show on BSCScan:");
        console.log("1. Wait 10-15 minutes for BSCScan to index");
        console.log("2. Verify contract on BSCScan");
        console.log("3. Check if you're looking at the correct address");
        console.log("4. Try refreshing the page or clearing cache");
        console.log();
    }

    console.log("=".repeat(80) + "\n");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("\n❌ Check failed:");
        console.error(error);
        process.exit(1);
    });
