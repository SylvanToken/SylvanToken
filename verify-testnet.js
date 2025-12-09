const hre = require("hardhat");

async function main() {
    console.log("\n🔍 Verifying SylvanToken on BSC Testnet...\n");

    const contractAddress = "0x890E1e779d1665974688cd0aCE8a2cc5dE7bb161";
    const walletManagerAddress = "0xa5d9e7bcFdC22835A4c2A6D2a28a68208FE22184";
    
    const feeWallet = "0x3e13b113482bCbCcfCd0D8517174EFF81b36a740";
    const donationWallet = "0x9Df4B945cef88E42c78522BB26621bBF2DCd10ef";
    const initialExemptAccounts = [
        "0xea8e945F7Cd6faC08dD5e369B55e04E7a8c3e28a",
        "0x3e13b113482bCbCcfCd0D8517174EFF81b36a740",
        "0x9Df4B945cef88E42c78522BB26621bBF2DCd10ef",
        "0x000000000000000000000000000000000000dEaD"
    ];

    try {
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
        
        console.log("✅ Contract verified successfully!");
    } catch (error) {
        if (error.message.includes("Already Verified")) {
            console.log("✅ Contract already verified!");
        } else {
            console.error("❌ Verification failed:", error.message);
        }
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
