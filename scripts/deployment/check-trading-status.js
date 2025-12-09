// Check Trading Status on Mainnet
const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
    console.log("\n" + "=".repeat(80));
    console.log("🔍 TRADING STATUS CHECK");
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

    // Check trading status
    console.log("📊 Current Status:");
    console.log("-".repeat(80));

    try {
        const isTradingEnabled = await token.isTradingEnabled();
        console.log("Trading Enabled:", isTradingEnabled ? "✅ YES" : "❌ NO");
    } catch (error) {
        console.log("Trading Enabled: ⚠️  Cannot check (function may not exist)");
    }

    try {
        const isPaused = await token.isPaused();
        console.log("Contract Paused:", isPaused ? "⚠️  YES" : "✅ NO");
    } catch (error) {
        console.log("Contract Paused: ⚠️  Cannot check (function may not exist)");
    }

    const owner = await token.owner();
    console.log("Owner:", owner);
    console.log("Is Deployer Owner:", owner.toLowerCase() === deployer.address.toLowerCase() ? "✅ YES" : "❌ NO");

    console.log("-".repeat(80) + "\n");

    // Check balances
    console.log("💰 Key Balances:");
    console.log("-".repeat(80));

    const deployerBalance = await token.balanceOf(deployer.address);
    console.log("Deployer Balance:", ethers.utils.formatEther(deployerBalance), "SYL");

    const totalSupply = await token.totalSupply();
    console.log("Total Supply:", ethers.utils.formatEther(totalSupply), "SYL");

    console.log("-".repeat(80) + "\n");

    console.log("=".repeat(80) + "\n");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("\n❌ Check failed:");
        console.error(error);
        process.exit(1);
    });
