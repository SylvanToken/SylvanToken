// Quick check if owner is fee exempt
const { ethers } = require("hardhat");

async function main() {
    const [owner] = await ethers.getSigners();
    const TOKEN_ADDRESS = "0x2016Fd055810ef5e9F7C753c24ae4b2C2B414B9E";
    const token = await ethers.getContractAt("SylvanToken", TOKEN_ADDRESS);
    
    console.log("Checking fee exemption status...\n");
    console.log("Owner address:", owner.address);
    
    const isExempt = await token.isExempt(owner.address);
    console.log("Is owner exempt?", isExempt);
    
    if (!isExempt) {
        console.log("\n🔴 PROBLEM: Owner is NOT fee exempt!");
        console.log("This is why 100% fee was charged!");
        console.log("\nSolution: Add owner to exempt list");
    } else {
        console.log("\n✅ Owner is fee exempt");
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
