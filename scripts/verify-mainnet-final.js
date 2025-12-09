const hre = require("hardhat");

async function main() {
    console.log("\n🔍 Verifying SylvanToken on BSC Mainnet (Final Attempt)...\n");

    const contractAddress = "0xc66404C3fa3E01378027b4A4411812D3a8D458F5";
    const walletManagerAddress = "0xa2406B88002caD138a9d5BBcf22D3638efE9F819";
    
    const feeWallet = "0x46a4AF3bdAD67d3855Af42Ba0BBe9248b54F7915";
    const donationWallet = "0xa697645Fdfa5d9399eD18A6575256F81343D4e17";
    const initialExemptAccounts = [
        "0xf949f50B3C32bD4cDa7D2192ff8f51dd9db4A469",
        "0x46a4AF3bdAD67d3855Af42Ba0BBe9248b54F7915",
        "0xa697645Fdfa5d9399eD18A6575256F81343D4e17",
        "0x000000000000000000000000000000000000dEaD"
    ];

    console.log("Contract Address:", contractAddress);
    console.log("WalletManager Library:", walletManagerAddress);
    console.log("Fee Wallet:", feeWallet);
    console.log("Donation Wallet:", donationWallet);
    console.log("Initial Exempt Accounts:", initialExemptAccounts.length);
    console.log();

    try {
        console.log("📤 Submitting verification to BSCScan...");
        
        await hre.run("verify:verify", {
            address: contractAddress,
            constructorArguments: [
                feeWallet,
                donationWallet,
                initialExemptAccounts
            ],
            libraries: {
                WalletManager: walletManagerAddress
            }
        });
        
        console.log("\n✅ Contract verified successfully!");
        console.log("🔗 View on BSCScan:", `https://bscscan.com/address/${contractAddress}#code`);
        
    } catch (error) {
        if (error.message.includes("Already Verified")) {
            console.log("\n✅ Contract already verified!");
            console.log("🔗 View on BSCScan:", `https://bscscan.com/address/${contractAddress}#code`);
        } else {
            console.error("\n❌ Verification failed:");
            console.error("Error:", error.message);
            
            console.log("\n📋 Troubleshooting:");
            console.log("1. Check if BSCScan API is working");
            console.log("2. Verify BSCSCAN_API_KEY in .env file");
            console.log("3. Try again in a few minutes (API rate limit)");
            console.log("4. Check BSCScan status: https://bscscan.com/");
            
            console.log("\n💡 Alternative: Manual Verification");
            console.log("If automated verification continues to fail, you can:");
            console.log("1. Contact BSCScan support");
            console.log("2. Use the contract without verification (fully functional)");
            console.log("3. Wait for BSCScan API v2 migration to complete");
        }
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
