/**
 * Check and Burn Tokens Script
 * 
 * This script checks token balances and provides options to burn tokens.
 * 
 * Usage:
 * npx hardhat run scripts/management/check-and-burn-tokens.js --network bscMainnet
 */

const hre = require("hardhat");
const { ethers } = require("hardhat");

// Configuration
const DEAD_WALLET = "0x000000000000000000000000000000000000dEaD";
const CONTRACT_ADDRESS = "0xc66404C3fa3E01378027b4A4411812D3a8D458F5";

async function main() {
    console.log("\n🔍 Token Balance Check & Burn Tool\n");
    console.log("=".repeat(70));
    
    // Get signer
    const [signer] = await ethers.getSigners();
    console.log(`\n📝 Connected Wallet: ${signer.address}`);
    
    // Get BNB balance
    const bnbBalance = await signer.getBalance();
    console.log(`💵 BNB Balance: ${ethers.utils.formatEther(bnbBalance)} BNB`);
    
    // Get contract
    const token = await ethers.getContractAt("SylvanToken", CONTRACT_ADDRESS);
    console.log(`\n📄 Contract: ${CONTRACT_ADDRESS}`);
    
    // Get owner
    const owner = await token.owner();
    console.log(`👤 Owner: ${owner}`);
    
    const isOwner = signer.address.toLowerCase() === owner.toLowerCase();
    console.log(`🔐 Is Owner: ${isOwner ? "✅ Yes" : "❌ No"}`);
    
    console.log("\n" + "=".repeat(70));
    console.log("📊 TOKEN BALANCES");
    console.log("=".repeat(70));
    
    // Check various balances
    const balances = {
        "Contract": CONTRACT_ADDRESS,
        "Owner/Deployer": owner,
        "Connected Wallet": signer.address,
        "Dead Wallet": DEAD_WALLET,
        "Fee Wallet": "0x46a4AF3bdAD67d3855Af42Ba0BBe9248b54F7915",
        "Donation Wallet": "0xa697645Fdfa5d9399eD18A6575256F81343D4e17"
    };
    
    let contractBalance = ethers.BigNumber.from(0);
    
    for (const [name, address] of Object.entries(balances)) {
        const balance = await token.balanceOf(address);
        const formatted = ethers.utils.formatEther(balance);
        console.log(`\n${name}:`);
        console.log(`  Address: ${address}`);
        console.log(`  Balance: ${formatted} SYL`);
        
        if (address === CONTRACT_ADDRESS) {
            contractBalance = balance;
        }
    }
    
    // Get total supply
    const totalSupply = await token.totalSupply();
    const totalSupplyFormatted = ethers.utils.formatEther(totalSupply);
    console.log(`\n📈 Total Supply: ${totalSupplyFormatted} SYL`);
    
    console.log("\n" + "=".repeat(70));
    console.log("🔥 BURN OPTIONS");
    console.log("=".repeat(70));
    
    if (contractBalance.gt(0)) {
        console.log(`\n⚠️  Contract has ${ethers.utils.formatEther(contractBalance)} SYL`);
        console.log("\n💡 To burn these tokens, you have these options:");
        console.log("\n   Option 1: Transfer from Owner to Dead Wallet");
        console.log("   -----------------------------------------");
        console.log("   If you are the owner and have tokens in your wallet:");
        console.log("   Run: npx hardhat run scripts/management/burn-owner-tokens.js --network bscMainnet");
        
        console.log("\n   Option 2: Use Contract's Internal Burn");
        console.log("   -----------------------------------------");
        console.log("   If contract has a burn function, call it directly.");
        console.log("   Check contract for: burn(), burnFrom(), or similar functions.");
        
        console.log("\n   Option 3: Emergency Rescue (if available)");
        console.log("   -----------------------------------------");
        console.log("   If contract has rescue/withdraw function for stuck tokens.");
        console.log("   This would require a specific function in the contract.");
        
    } else {
        console.log("\n✅ Contract balance is zero. No tokens to burn.");
    }
    
    // Check owner balance
    const ownerBalance = await token.balanceOf(owner);
    if (ownerBalance.gt(0) && isOwner) {
        console.log(`\n💰 You have ${ethers.utils.formatEther(ownerBalance)} SYL in your wallet.`);
        console.log("\n   To burn your tokens:");
        console.log("   Run: npx hardhat run scripts/management/burn-owner-tokens.js --network bscMainnet");
    }
    
    console.log("\n" + "=".repeat(70));
    console.log("\n✅ Balance check completed.\n");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
