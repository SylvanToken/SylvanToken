// Enable Trading on Mainnet
const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
    console.log("\n" + "=".repeat(80));
    console.log("🚀 ENABLE TRADING ON MAINNET");
    console.log("=".repeat(80) + "\n");

    // Load deployment info
    const deploymentFile = path.join(__dirname, "../../deployments/mainnet-deployment.json");
    const deploymentInfo = JSON.parse(fs.readFileSync(deploymentFile, "utf8"));
    const TOKEN_ADDRESS = deploymentInfo.contractAddress;

    console.log("Contract Address:", TOKEN_ADDRESS);
    console.log();

    // Get contract
    const token = await ethers.getContractAt("SylvanToken", TOKEN_ADDRESS);
    const [signer] = await ethers.getSigners();

    console.log("Signer:", signer.address);
    console.log();

    // Check current status
    console.log("📊 Current Status:");
    console.log("-".repeat(80));
    
    const isTradingEnabled = await token.isTradingEnabled();
    console.log("Trading Enabled:", isTradingEnabled ? "✅ YES" : "❌ NO");
    
    const owner = await token.owner();
    console.log("Contract Owner:", owner);
    console.log("Signer Address:", signer.address);
    console.log("Is Signer Owner:", owner.toLowerCase() === signer.address.toLowerCase() ? "✅ YES" : "❌ NO");
    
    console.log("-".repeat(80) + "\n");

    if (isTradingEnabled) {
        console.log("✅ Trading is already enabled!");
        console.log();
        console.log("=".repeat(80) + "\n");
        return;
    }

    if (owner.toLowerCase() !== signer.address.toLowerCase()) {
        console.error("❌ ERROR: Signer is not the contract owner!");
        console.error("-".repeat(80));
        console.error("Only the owner can enable trading.");
        console.error("\n📝 To fix this:");
        console.error("  • Use the owner wallet's private key (not deployer)");
        console.error("  • Update PRIVATE_KEY in .env with owner wallet's key");
        console.error("\nExpected Owner:", owner);
        console.error("Your Signer:  ", signer.address);
        console.error("-".repeat(80));
        process.exit(1);
    }

    console.log("⚠️  WARNING: You are about to enable trading on MAINNET!");
    console.log("⚠️  Once enabled, trading CANNOT be disabled!");
    console.log("\nPress Ctrl+C to cancel, or wait 10 seconds to continue...\n");
    
    await new Promise(resolve => setTimeout(resolve, 10000));

    console.log("🔧 Enabling trading...\n");

    try {
        const tx = await token.enableTrading();
        console.log("Transaction Hash:", tx.hash);
        console.log("Waiting for confirmation...");
        
        const receipt = await tx.wait();
        console.log("✅ Trading enabled successfully!");
        console.log("Block Number:", receipt.blockNumber);
        console.log("Gas Used:", receipt.gasUsed.toString());
        console.log();

        // Verify
        const isNowEnabled = await token.isTradingEnabled();
        console.log("Verification:");
        console.log("Trading Enabled:", isNowEnabled ? "✅ YES" : "❌ NO");
        console.log();

        if (isNowEnabled) {
            console.log("=".repeat(80));
            console.log("🎉 TRADING IS NOW LIVE ON MAINNET!");
            console.log("=".repeat(80) + "\n");

            console.log("📋 Next Steps:");
            console.log("-".repeat(80));
            console.log("1. Create liquidity pool on PancakeSwap");
            console.log("2. Add liquidity (SYL/BNB pair)");
            console.log("3. Announce to community");
            console.log("4. Monitor transactions on BSCScan");
            console.log();
            console.log("🔗 BSCScan:");
            console.log(`   https://bscscan.com/address/${TOKEN_ADDRESS}`);
            console.log();
            console.log("🔗 PancakeSwap:");
            console.log(`   https://pancakeswap.finance/add/BNB/${TOKEN_ADDRESS}`);
            console.log("-".repeat(80) + "\n");
        } else {
            console.error("⚠️  WARNING: Trading may not be enabled properly!");
            console.error("Please check the contract manually.");
        }

    } catch (error) {
        console.error("\n❌ Failed to enable trading:");
        console.error(error.message);
        
        if (error.message.includes("Trading already enabled")) {
            console.log("\n✅ Trading is already enabled!");
        } else if (error.message.includes("Ownable: caller is not the owner")) {
            console.error("\n❌ ERROR: Only the owner can enable trading!");
        } else {
            console.error("\nPlease check the error and try again.");
        }
        
        process.exit(1);
    }

    console.log("=".repeat(80) + "\n");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("\n❌ Script failed:");
        console.error(error);
        process.exit(1);
    });
