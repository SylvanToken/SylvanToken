// Distribute tokens to main wallets on Mainnet
const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
    console.log("\n💰 Distributing Tokens on Mainnet...\n");

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

    // Check deployer balance
    const deployerBalance = await token.balanceOf(deployer.address);
    console.log("Deployer Balance:", ethers.utils.formatEther(deployerBalance), "SYL");
    console.log();

    // Distribution plan
    const distributions = [
        {
            name: "Founder",
            address: wallets.system.founder.address,
            amount: ethers.utils.parseEther("160000000") // 160M SYL
        },
        {
            name: "Sylvan Token Wallet",
            address: wallets.system.sylvanToken.address,
            amount: ethers.utils.parseEther("500000000") // 500M SYL
        }
    ];

    console.log("📋 Distribution Plan:");
    console.log("-".repeat(80));
    for (const dist of distributions) {
        console.log(`${dist.name}: ${ethers.utils.formatEther(dist.amount)} SYL`);
        console.log(`  Address: ${dist.address}`);
    }
    console.log("-".repeat(80) + "\n");

    // Calculate total
    const totalDistribution = distributions.reduce(
        (sum, dist) => sum.add(dist.amount),
        ethers.BigNumber.from(0)
    );

    console.log("Total Distribution:", ethers.utils.formatEther(totalDistribution), "SYL");
    console.log();

    // Verify sufficient balance
    if (deployerBalance.lt(totalDistribution)) {
        console.error("❌ Insufficient balance for distribution!");
        console.error("Required:", ethers.utils.formatEther(totalDistribution), "SYL");
        console.error("Available:", ethers.utils.formatEther(deployerBalance), "SYL");
        process.exit(1);
    }

    // Confirm distribution
    console.log("⚠️  WARNING: You are about to distribute tokens on MAINNET!");
    console.log("⚠️  Please verify all addresses are correct!");
    console.log("\nPress Ctrl+C to cancel, or wait 10 seconds to continue...\n");
    
    await new Promise(resolve => setTimeout(resolve, 10000));

    // Execute distributions
    console.log("📤 Executing Distributions...\n");

    for (const dist of distributions) {
        console.log(`Sending to ${dist.name}...`);
        console.log(`Address: ${dist.address}`);
        console.log(`Amount: ${ethers.utils.formatEther(dist.amount)} SYL`);

        try {
            const tx = await token.transfer(dist.address, dist.amount);
            console.log(`TX: ${tx.hash}`);
            await tx.wait();

            const balance = await token.balanceOf(dist.address);
            console.log(`✅ Balance: ${ethers.utils.formatEther(balance)} SYL\n`);
        } catch (error) {
            console.error(`❌ Failed to send to ${dist.name}:`, error.message);
            process.exit(1);
        }
    }

    // Verify final balances
    console.log("🔍 Verifying Final Balances...\n");

    console.log("Main Wallets:");
    console.log("-".repeat(80));
    for (const dist of distributions) {
        const balance = await token.balanceOf(dist.address);
        const expected = dist.amount;
        const match = balance.eq(expected) ? "✅" : "❌";
        console.log(`${match} ${dist.name}: ${ethers.utils.formatEther(balance)} SYL`);
    }
    console.log();

    console.log("Admin Wallets (Initial Releases):");
    console.log("-".repeat(80));
    const adminWallets = [
        { name: "MAD", address: wallets.admins.mad.address },
        { name: "LEB", address: wallets.admins.leb.address },
        { name: "CNK", address: wallets.admins.cnk.address },
        { name: "KDR", address: wallets.admins.kdr.address }
    ];

    for (const admin of adminWallets) {
        const balance = await token.balanceOf(admin.address);
        console.log(`${admin.name}: ${ethers.utils.formatEther(balance)} SYL`);
    }
    console.log();

    console.log("Contract Balance:");
    console.log("-".repeat(80));
    const contractBalance = await token.balanceOf(TOKEN_ADDRESS);
    console.log(`Remaining in Contract: ${ethers.utils.formatEther(contractBalance)} SYL`);
    console.log("(This includes vested tokens for admin wallets and locked reserve)");
    console.log();

    // Calculate total distributed
    const totalSupply = await token.totalSupply();
    let totalAccountedFor = ethers.BigNumber.from(0);

    // Add main distributions
    for (const dist of distributions) {
        const balance = await token.balanceOf(dist.address);
        totalAccountedFor = totalAccountedFor.add(balance);
    }

    // Add admin balances
    for (const admin of adminWallets) {
        const balance = await token.balanceOf(admin.address);
        totalAccountedFor = totalAccountedFor.add(balance);
    }

    // Add contract balance
    totalAccountedFor = totalAccountedFor.add(contractBalance);

    console.log("Total Supply Verification:");
    console.log("-".repeat(80));
    console.log(`Total Supply: ${ethers.utils.formatEther(totalSupply)} SYL`);
    console.log(`Total Accounted: ${ethers.utils.formatEther(totalAccountedFor)} SYL`);
    console.log(`Match: ${totalSupply.eq(totalAccountedFor) ? "✅" : "❌"}`);
    console.log();

    console.log("✅ Distribution completed successfully!\n");

    console.log("📋 Next Steps:");
    console.log("-".repeat(80));
    console.log("1. Set fee exemptions:");
    console.log("   npx hardhat run scripts/deployment/set-exemptions.js --network bscMainnet");
    console.log();
    console.log("2. Transfer ownership to multi-sig (if ready):");
    console.log("   npx hardhat run scripts/deployment/transfer-ownership.js --network bscMainnet");
    console.log();
    console.log("3. Enable trading (when ready):");
    console.log("   npx hardhat run scripts/deployment/enable-trading.js --network bscMainnet");
    console.log("-".repeat(80) + "\n");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("\n❌ Distribution failed:");
        console.error(error);
        process.exit(1);
    });
