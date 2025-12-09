const hre = require("hardhat");

async function main() {
    console.log("\n🔍 Verifying Contracts on BSCScan Testnet...");
    console.log("=".repeat(70));

    const WALLET_MANAGER_ADDRESS = "0x4f7715024F9A4DCd0774e4d7575eae22A8C12ddd";
    const TOKEN_ADDRESS = "0xc4dBA24a5D8F9f23cd989E5af5231952fD64CE70";
    
    const feeWallet = "0x3e13b113482bCbCcfCd0D8517174EFF81b36a740";
    const donationWallet = "0x9Df4B945cef88E42c78522BB26621bBF2DCd10ef";
    const initialExemptAccounts = [
        "0xea8e945F7Cd6faC08dD5e369B55e04E7a8c3e28a",
        "0x3e13b113482bCbCcfCd0D8517174EFF81b36a740",
        "0x9Df4B945cef88E42c78522BB26621bBF2DCd10ef",
        "0x000000000000000000000000000000000000dEaD"
    ];

    // Verify WalletManager Library
    console.log("\n📚 Verifying WalletManager Library...");
    try {
        await hre.run("verify:verify", {
            address: WALLET_MANAGER_ADDRESS,
            constructorArguments: []
        });
        console.log("  ✓ WalletManager verified!");
    } catch (error) {
        if (error.message.includes("Already Verified")) {
            console.log("  ✓ WalletManager already verified!");
        } else {
            console.error("  ✗ Error:", error.message);
        }
    }

    // Verify SylvanToken with library
    console.log("\n🪙 Verifying SylvanToken...");
    try {
        await hre.run("verify:verify", {
            address: TOKEN_ADDRESS,
            constructorArguments: [
                feeWallet,
                donationWallet,
                initialExemptAccounts
            ],
            libraries: {
                WalletManager: WALLET_MANAGER_ADDRESS
            }
        });
        console.log("  ✓ SylvanToken verified!");
    } catch (error) {
        if (error.message.includes("Already Verified")) {
            console.log("  ✓ SylvanToken already verified!");
        } else {
            console.error("  ✗ Error:", error.message);
        }
    }

    console.log("\n✅ Verification Complete!");
    console.log("\n📋 Contract Addresses:");
    console.log("  WalletManager:", WALLET_MANAGER_ADDRESS);
    console.log("  SylvanToken:", TOKEN_ADDRESS);
    console.log("\n🔗 View on BSCScan:");
    console.log(`  https://testnet.bscscan.com/address/${TOKEN_ADDRESS}`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("\n❌ Verification Failed:");
        console.error(error);
        process.exit(1);
    });
