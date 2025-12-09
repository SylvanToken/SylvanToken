const hre = require("hardhat");

async function main() {
    console.log("\n🔍 Verifying SylvanToken on BSCScan...\n");

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
        // First verify WalletManager library
        console.log("📚 Verifying WalletManager Library...");
        try {
            await hre.run("verify:verify", {
                address: walletManagerAddress,
                constructorArguments: []
            });
            console.log("✅ WalletManager verified!");
        } catch (error) {
            if (error.message.includes("Already Verified")) {
                console.log("✅ WalletManager already verified!");
            } else {
                console.log("⚠️  WalletManager verification failed:", error.message);
            }
        }
        console.log();

        // Then verify main contract with library
        console.log("📦 Verifying SylvanToken Contract...");
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
            console.log("\n✅ Contract is already verified!");
            console.log("🔗 View on BSCScan:", `https://bscscan.com/address/${contractAddress}#code`);
        } else {
            console.error("\n❌ Verification failed:");
            console.error(error.message);
            
            console.log("\n📋 Manual Verification Info:");
            console.log("-".repeat(80));
            console.log("Contract Address:", contractAddress);
            console.log("Compiler Version: v0.8.24+commit.e11b9ed9");
            console.log("Optimization: Yes (200 runs)");
            console.log("EVM Version: shanghai");
            console.log("License: MIT");
            console.log();
            console.log("Constructor Arguments (ABI-encoded):");
            const abiCoder = new hre.ethers.utils.AbiCoder();
            const encoded = abiCoder.encode(
                ["address", "address", "address[]"],
                [feeWallet, donationWallet, initialExemptAccounts]
            );
            console.log(encoded.slice(2)); // Remove 0x prefix
            console.log();
            console.log("Library:");
            console.log("  WalletManager:", walletManagerAddress);
            console.log("-".repeat(80));
        }
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
