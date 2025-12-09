// Verify Mainnet Contract on BSCScan
const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
    console.log("\n" + "=".repeat(80));
    console.log("🔍 VERIFYING CONTRACT ON BSCSCAN");
    console.log("=".repeat(80) + "\n");

    // Load deployment info
    const deploymentFile = path.join(__dirname, "../../deployments/mainnet-deployment.json");
    if (!fs.existsSync(deploymentFile)) {
        console.error("❌ Deployment file not found!");
        console.error("Please run deploy-mainnet.js first");
        process.exit(1);
    }

    const deploymentInfo = JSON.parse(fs.readFileSync(deploymentFile, "utf8"));
    
    const CONTRACT_ADDRESS = deploymentInfo.contractAddress;
    const WALLET_MANAGER_ADDRESS = deploymentInfo.walletManagerLibrary;
    const FEE_WALLET = deploymentInfo.configuration.feeWallet;
    const DONATION_WALLET = deploymentInfo.configuration.donationWallet;

    console.log("📋 Verification Information:");
    console.log("-".repeat(80));
    console.log("Contract Address:", CONTRACT_ADDRESS);
    console.log("WalletManager Library:", WALLET_MANAGER_ADDRESS);
    console.log("Fee Wallet:", FEE_WALLET);
    console.log("Donation Wallet:", DONATION_WALLET);
    console.log("-".repeat(80) + "\n");

    // Prepare constructor arguments
    const constructorArguments = [
        FEE_WALLET,
        DONATION_WALLET,
        [
            deploymentInfo.deployer,
            FEE_WALLET,
            DONATION_WALLET,
            "0x000000000000000000000000000000000000dEaD"
        ]
    ];

    console.log("🔧 Constructor Arguments:");
    console.log(JSON.stringify(constructorArguments, null, 2));
    console.log();

    console.log("📚 Libraries:");
    console.log("WalletManager:", WALLET_MANAGER_ADDRESS);
    console.log();

    console.log("⏳ Starting verification...\n");

    try {
        await hre.run("verify:verify", {
            address: CONTRACT_ADDRESS,
            constructorArguments: constructorArguments,
            libraries: {
                WalletManager: WALLET_MANAGER_ADDRESS
            }
        });

        console.log("\n✅ Contract verified successfully!");
        console.log();
        console.log("🔗 View on BSCScan:");
        console.log(`https://bscscan.com/address/${CONTRACT_ADDRESS}#code`);
        console.log();

    } catch (error) {
        if (error.message.includes("Already Verified")) {
            console.log("\n✅ Contract is already verified!");
            console.log();
            console.log("🔗 View on BSCScan:");
            console.log(`https://bscscan.com/address/${CONTRACT_ADDRESS}#code`);
            console.log();
        } else {
            console.error("\n❌ Verification failed:");
            console.error(error.message);
            console.log();
            console.log("💡 Manual Verification:");
            console.log("-".repeat(80));
            console.log("1. Visit:", `https://bscscan.com/verifyContract?a=${CONTRACT_ADDRESS}`);
            console.log("2. Compiler Type: Solidity (Single file)");
            console.log("3. Compiler Version: v0.8.24+commit.e11b9ed9");
            console.log("4. License: MIT");
            console.log("5. Optimization: Yes (200 runs)");
            console.log();
            console.log("Constructor Arguments (ABI-encoded):");
            console.log("You'll need to encode these manually or use the Hardhat plugin");
            console.log();
            console.log("Libraries:");
            console.log(`WalletManager: ${WALLET_MANAGER_ADDRESS}`);
            console.log("-".repeat(80));
            console.log();
            
            process.exit(1);
        }
    }

    console.log("=".repeat(80));
    console.log("✅ VERIFICATION COMPLETED!");
    console.log("=".repeat(80) + "\n");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("\n❌ Verification script failed:");
        console.error(error);
        process.exit(1);
    });
