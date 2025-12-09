const { ethers } = require("hardhat");

async function main() {
    console.log("Testing network connection...");
    
    try {
        const signers = await ethers.getSigners();
        console.log("✅ Signers found:", signers.length);
        
        if (signers.length > 0) {
            const deployer = signers[0];
            console.log("Deployer address:", deployer.address);
            const balance = await deployer.getBalance();
            console.log("Balance:", ethers.utils.formatEther(balance), "BNB");
        }
    } catch (error) {
        console.error("❌ Error:", error.message);
    }
}

main();
