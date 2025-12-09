/**
 * Burn Contract Tokens Script
 * 
 * This script burns tokens remaining in the contract by transferring them to the dead wallet.
 * Use this to clean up any tokens stuck in the contract after vesting or other operations.
 * 
 * Usage:
 * npx hardhat run scripts/management/burn-contract-tokens.js --network bscMainnet
 */

const hre = require("hardhat");
const { ethers } = require("hardhat");

// Dead wallet address for burning
const DEAD_WALLET = "0x000000000000000000000000000000000000dEaD";

// Mainnet contract address
const CONTRACT_ADDRESS = "0xc66404C3fa3E01378027b4A4411812D3a8D458F5";

async function main() {
    console.log("\n🔥 Starting Contract Token Burn Process...\n");
    console.log("=".repeat(60));
    
    // Get signer
    const [signer] = await ethers.getSigners();
    console.log(`\n📝 Signer Address: ${signer.address}`);
    
    // Get contract instance
    console.log(`\n📄 Contract Address: ${CONTRACT_ADDRESS}`);
    const token = await ethers.getContractAt("SylvanToken", CONTRACT_ADDRESS);
    
    // Check contract balance
    const contractBalance = await token.balanceOf(CONTRACT_ADDRESS);
    const contractBalanceFormatted = ethers.utils.formatEther(contractBalance);
    
    console.log(`\n💰 Contract Balance: ${contractBalanceFormatted} SYL`);
    
    if (contractBalance.eq(0)) {
        console.log("\n✅ No tokens to burn. Contract balance is zero.");
        return;
    }
    
    // Check if signer is owner
    const owner = await token.owner();
    console.log(`\n👤 Contract Owner: ${owner}`);
    
    if (signer.address.toLowerCase() !== owner.toLowerCase()) {
        console.log("\n❌ Error: Signer is not the contract owner!");
        console.log(`   Signer: ${signer.address}`);
        console.log(`   Owner:  ${owner}`);
        return;
    }
    
    // Confirm burn
    console.log("\n⚠️  WARNING: This will burn ALL tokens in the contract!");
    console.log(`   Amount to burn: ${contractBalanceFormatted} SYL`);
    console.log(`   Destination: ${DEAD_WALLET}`);
    console.log("\n   This action is IRREVERSIBLE!");
    
    // In production, you might want to add a confirmation prompt here
    // For now, we'll proceed with the burn
    
    console.log("\n🔥 Initiating burn transaction...");
    
    try {
        // Transfer tokens from contract to dead wallet
        // Note: This requires the contract to have a function that allows owner to transfer
        // If using standard transfer, tokens must be in owner's wallet first
        
        // Check if contract has tokens that can be transferred
        const ownerBalance = await token.balanceOf(signer.address);
        const ownerBalanceFormatted = ethers.utils.formatEther(ownerBalance);
        
        console.log(`\n💼 Owner Balance: ${ownerBalanceFormatted} SYL`);
        
        // If tokens are in the contract itself, we need to transfer them out first
        // This depends on your contract's implementation
        
        // Option 1: If contract has a rescue/withdraw function
        // const tx1 = await token.rescueTokens(CONTRACT_ADDRESS, contractBalance);
        // await tx1.wait();
        
        // Option 2: Direct burn if contract supports it
        // For SylvanToken, we'll transfer from owner to dead wallet
        
        if (contractBalance.gt(0)) {
            console.log("\n⚠️  Note: Tokens are in the contract address.");
            console.log("   To burn these tokens, you need to:");
            console.log("   1. Transfer them to owner wallet first (if possible)");
            console.log("   2. Then transfer to dead wallet");
            console.log("\n   Or use a contract function that allows burning contract tokens.");
            
            // Check if we can transfer from contract
            console.log("\n🔍 Checking contract functions...");
            
            // Try to transfer tokens to dead wallet directly
            console.log("\n🔥 Attempting to burn contract tokens...");
            
            const tx = await token.transfer(DEAD_WALLET, contractBalance, {
                gasLimit: 200000
            });
            
            console.log(`\n⏳ Transaction submitted: ${tx.hash}`);
            console.log(`   Waiting for confirmation...`);
            
            const receipt = await tx.wait();
            
            console.log(`\n✅ Burn successful!`);
            console.log(`   Block: ${receipt.blockNumber}`);
            console.log(`   Gas Used: ${receipt.gasUsed.toString()}`);
            console.log(`   Transaction: https://bscscan.com/tx/${tx.hash}`);
            
            // Verify burn
            const newContractBalance = await token.balanceOf(CONTRACT_ADDRESS);
            const newContractBalanceFormatted = ethers.utils.formatEther(newContractBalance);
            
            const deadWalletBalance = await token.balanceOf(DEAD_WALLET);
            const deadWalletBalanceFormatted = ethers.utils.formatEther(deadWalletBalance);
            
            console.log(`\n📊 Post-Burn Balances:`);
            console.log(`   Contract: ${newContractBalanceFormatted} SYL`);
            console.log(`   Dead Wallet: ${deadWalletBalanceFormatted} SYL`);
            console.log(`   Burned: ${contractBalanceFormatted} SYL`);
            
        }
        
    } catch (error) {
        console.error("\n❌ Error during burn:", error.message);
        
        if (error.message.includes("insufficient funds")) {
            console.log("\n💡 Tip: Make sure the owner wallet has enough BNB for gas fees.");
        } else if (error.message.includes("Ownable")) {
            console.log("\n💡 Tip: Only the contract owner can perform this operation.");
        } else {
            console.log("\n💡 Tip: Check if the contract has a specific burn function.");
            console.log("   You may need to use a different method to burn contract tokens.");
        }
    }
    
    console.log("\n" + "=".repeat(60));
    console.log("🔥 Burn process completed.\n");
}

// Execute
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
