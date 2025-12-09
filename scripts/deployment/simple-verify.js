// Simple Contract Verification for BSCScan
const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

async function main() {
    console.log("\n" + "=".repeat(80));
    console.log("🔍 SIMPLE CONTRACT VERIFICATION");
    console.log("=".repeat(80) + "\n");

    // Load deployment info
    const deploymentFile = path.join(__dirname, "../../deployments/mainnet-deployment.json");
    const deploymentInfo = JSON.parse(fs.readFileSync(deploymentFile, "utf8"));
    
    const CONTRACT_ADDRESS = deploymentInfo.contractAddress;
    const FEE_WALLET = deploymentInfo.configuration.feeWallet;
    const DONATION_WALLET = deploymentInfo.configuration.donationWallet;
    const DEPLOYER = deploymentInfo.deployer;

    console.log("📋 Contract Information:");
    console.log("-".repeat(80));
    console.log("Contract:", CONTRACT_ADDRESS);
    console.log("Fee Wallet:", FEE_WALLET);
    console.log("Donation Wallet:", DONATION_WALLET);
    console.log("Deployer:", DEPLOYER);
    console.log("-".repeat(80) + "\n");

    // Build the verification command
    const cmd = `npx hardhat verify --network bscMainnet ${CONTRACT_ADDRESS} "${FEE_WALLET}" "${DONATION_WALLET}"`;
    
    console.log("🔧 Running verification command:");
    console.log(cmd);
    console.log();

    console.log("⏳ Please wait, this may take a few minutes...\n");

    exec(cmd, (error, stdout, stderr) => {
        if (error) {
            if (stdout.includes("Already Verified") || stderr.includes("Already Verified")) {
                console.log("✅ Contract is already verified!");
                console.log();
                console.log("🔗 View on BSCScan:");
                console.log(`https://bscscan.com/address/${CONTRACT_ADDRESS}#code`);
                console.log();
                process.exit(0);
            } else {
                console.error("❌ Verification failed:");
                console.error(stderr || error.message);
                console.log();
                console.log("💡 Try manual verification:");
                console.log("-".repeat(80));
                console.log("1. Visit:", `https://bscscan.com/verifyContract?a=${CONTRACT_ADDRESS}`);
                console.log("2. Compiler: Solidity (Single file)");
                console.log("3. Version: v0.8.24+commit.e11b9ed9");
                console.log("4. License: MIT");
                console.log("5. Optimization: Yes (200 runs)");
                console.log();
                console.log("Constructor Arguments:");
                console.log(`Fee Wallet: ${FEE_WALLET}`);
                console.log(`Donation Wallet: ${DONATION_WALLET}`);
                console.log(`Initial Exempt: [${DEPLOYER}, ${FEE_WALLET}, ${DONATION_WALLET}, 0x000000000000000000000000000000000000dEaD]`);
                console.log("-".repeat(80));
                console.log();
                process.exit(1);
            }
        }

        console.log(stdout);
        
        if (stdout.includes("Successfully verified") || stdout.includes("Already Verified")) {
            console.log("\n✅ Verification successful!");
            console.log();
            console.log("🔗 View on BSCScan:");
            console.log(`https://bscscan.com/address/${CONTRACT_ADDRESS}#code`);
            console.log();
        }
    });
}

main().catch((error) => {
    console.error("\n❌ Script failed:");
    console.error(error);
    process.exit(1);
});
