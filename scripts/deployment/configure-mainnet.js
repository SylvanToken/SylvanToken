// Configure Admin Wallets and Locked Reserve on Mainnet
const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
    console.log("\n🔧 Configuring Mainnet Deployment...\n");

    // Load deployment info
    const deploymentFile = path.join(__dirname, "../../deployments/mainnet-deployment.json");
    if (!fs.existsSync(deploymentFile)) {
        console.error("❌ Deployment file not found!");
        console.error("Please run deploy-mainnet.js first");
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
    const adminWallets = config.wallets.admins;
    const lockedReserve = config.wallets.system.locked;

    // Configure admin wallets
    console.log("📝 Configuring Admin Wallets...\n");

    const adminAddresses = [
        { name: "MAD", address: adminWallets.mad.address },
        { name: "LEB", address: adminWallets.leb.address },
        { name: "CNK", address: adminWallets.cnk.address },
        { name: "KDR", address: adminWallets.kdr.address }
    ];

    for (const admin of adminAddresses) {
        console.log(`Configuring ${admin.name} wallet...`);
        console.log(`Address: ${admin.address}`);

        // Check if already configured
        const isConfigured = await token.isAdminConfigured(admin.address);
        if (isConfigured) {
            console.log(`✅ ${admin.name} already configured\n`);
            continue;
        }

        try {
            const tx = await token.configureAdminWallet(
                admin.address,
                ethers.utils.parseEther("10000000") // 10M SYL
            );

            console.log(`TX: ${tx.hash}`);
            await tx.wait();
            console.log(`✅ ${admin.name} configured successfully\n`);
        } catch (error) {
            console.error(`❌ Failed to configure ${admin.name}:`, error.message);
            process.exit(1);
        }
    }

    // Configure locked reserve
    console.log("📝 Configuring Locked Reserve...\n");
    console.log(`Address: ${lockedReserve.address}`);

    // Check if already configured
    const hasVesting = await token.hasVestingSchedule(lockedReserve.address);
    if (hasVesting) {
        console.log(`✅ Locked reserve already configured\n`);
    } else {
        try {
            const tx = await token.createLockedWalletVesting(
                lockedReserve.address,
                ethers.utils.parseEther("300000000"), // 300M SYL
                30    // 30 days cliff
            );

            console.log(`TX: ${tx.hash}`);
            await tx.wait();
            console.log(`✅ Locked reserve configured successfully\n`);
        } catch (error) {
            console.error(`❌ Failed to configure locked reserve:`, error.message);
            process.exit(1);
        }
    }

    // Process initial releases for admin wallets
    console.log("📝 Processing Initial Releases (20% each)...\n");

    for (const admin of adminAddresses) {
        console.log(`Processing initial release for ${admin.name}...`);

        // Check current balance
        const balanceBefore = await token.balanceOf(admin.address);
        if (balanceBefore.gt(0)) {
            console.log(`✅ ${admin.name} already received: ${ethers.utils.formatEther(balanceBefore)} SYL\n`);
            continue;
        }

        try {
            const tx = await token.processInitialRelease(admin.address);
            console.log(`TX: ${tx.hash}`);
            await tx.wait();

            const balance = await token.balanceOf(admin.address);
            console.log(`✅ ${admin.name} received: ${ethers.utils.formatEther(balance)} SYL\n`);
        } catch (error) {
            console.error(`❌ Failed to process initial release for ${admin.name}:`, error.message);
            process.exit(1);
        }
    }

    // Verify configuration
    console.log("🔍 Verifying Configuration...\n");

    for (const admin of adminAddresses) {
        const config = await token.getAdminConfig(admin.address);
        const balance = await token.balanceOf(admin.address);
        console.log(`${admin.name}:`);
        console.log(`  Total Allocation: ${ethers.utils.formatEther(config.totalAllocation)} SYL`);
        console.log(`  Current Balance: ${ethers.utils.formatEther(balance)} SYL`);
        console.log(`  Is Configured: ${config.isConfigured}`);
        console.log();
    }

    const reserveSchedule = await token.getVestingInfo(lockedReserve.address);
    console.log(`Locked Reserve:`);
    console.log(`  Total Amount: ${ethers.utils.formatEther(reserveSchedule.totalAmount)} SYL`);
    console.log(`  Is Active: ${reserveSchedule.isActive}`);
    console.log();

    console.log("✅ Configuration completed successfully!\n");

    console.log("📋 Next Steps:");
    console.log("-".repeat(80));
    console.log("1. Distribute tokens to main wallets:");
    console.log("   npx hardhat run scripts/deployment/distribute-mainnet.js --network bscMainnet");
    console.log();
    console.log("2. Set fee exemptions:");
    console.log("   npx hardhat run scripts/deployment/set-exemptions.js --network bscMainnet");
    console.log("-".repeat(80) + "\n");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("\n❌ Configuration failed:");
        console.error(error);
        process.exit(1);
    });
