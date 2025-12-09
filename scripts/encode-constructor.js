const { ethers } = require("hardhat");

async function main() {
    const feeWallet = "0x46a4AF3bdAD67d3855Af42Ba0BBe9248b54F7915";
    const donationWallet = "0xa697645Fdfa5d9399eD18A6575256F81343D4e17";
    const initialExemptAccounts = [
        "0xf949f50B3C32bD4cDa7D2192ff8f51dd9db4A469",
        "0x46a4AF3bdAD67d3855Af42Ba0BBe9248b54F7915",
        "0xa697645Fdfa5d9399eD18A6575256F81343D4e17",
        "0x000000000000000000000000000000000000dEaD"
    ];

    // Encode constructor arguments
    const encoded = ethers.utils.defaultAbiCoder.encode(
        ["address", "address", "address[]"],
        [feeWallet, donationWallet, initialExemptAccounts]
    );

    console.log("\n=== Constructor Arguments (ABI-encoded) ===");
    console.log(encoded);
    console.log("\n=== Remove '0x' prefix for BSCScan ===");
    console.log(encoded.slice(2));
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
