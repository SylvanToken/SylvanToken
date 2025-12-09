// Set fee exemptions for system wallets
const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
    console.log("\n🔓 Setting Fee Exemptions...\n");

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
    const wallets = config.wallets;

    // Exemption list
    const exemptions = [
        { name: "Owner/Deployer", address: deployer.address },
        { name: "Founder", address: wallets.system.founder.address },
        { name: "Sylvan Token Wallet", address: wallets.system.sylvanToken.address },
        { name: "Fee Collection Wallet", address: wallets.system.fee.address },
        { name: "Donations Wallet", address: wallets.system.donation.address },
        { name: "MAD Admin", address: wallets.admins.mad.address },
        { name: "LEB Admin", address: wallets.admins.leb.address },
        { name: "CNK Admin", address: wallets.admins.cnk.address },
        { name: "KDR Admin", address: wallets.admins.kdr.address },
        { name: "Locked Reserve", address: wallets.system.locked.address }
    ];

    console.log("📋 Exemption List:");
    console.log("-".repeat(80));
    for (const exempt of exemptions) {
        console.log(`${exempt.name}: ${exempt.address}`);
    }
    console.log("-".repeat(80) + "\n");

    // Add exemptions
    console.log("📝 Adding Exemptions...\n");

    for (const exempt of exemptions) {
        // Check if already exempt
        const isExempt = await token.isExempt(exempt.address);
        
        if (isExempt) {
            console.log(`✅ ${exempt.name} is already exempt`);
            continue;
        }

        console.log(`Adding ${exempt.name}...`);
        
        try {
            const tx = await token.addExemptWallet(exempt.address);
            console.log(`TX: ${tx.hash}`);
            await tx.wait();
            console.log(`✅ ${exempt.name} added to exempt list\n`);
        } catch (error) {
            console.error(`❌ Failed to add ${exempt.name}:`, error.message);
            process.exit(1);
        }
    }

    // Verify exemptions
    console.log("🔍 Verifying Exemptions...\n");

    let allExempt = true;
    for (const exempt of exemptions) {
        const isExempt = await token.isExempt(exempt.address);
        const status = isExempt ? "✅" : "❌";
        console.log(`${status} ${exempt.name}: ${isExempt ? "Exempt" : "NOT Exempt"}`);
        
        if (!isExempt) {
            allExempt = false;
        }
    }
    console.log();

    if (!allExempt) {
        console.error("❌ Some wallets are not exempt!");
        process.exit(1);
    }

    console.log("✅ All exemptions set successfully!\n");

    console.log("📋 Next Steps:");
    console.log("-".repeat(80));
    console.log("1. Transfer ownership to multi-sig (if ready):");
    console.log("   npx hardhat run scripts/deployment/transfer-ownership.js --network bscMainnet");
    console.log();
    console.log("2. Enable trading (when ready):");
    console.log("   npx hardhat run scripts/deployment/enable-trading.js --network bscMainnet");
    console.log("-".repeat(80) + "\n");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("\n❌ Setting exemptions failed:");
        console.error(error);
        process.exit(1);
    });
