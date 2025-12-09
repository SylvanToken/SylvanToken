/**
 * Burn Owner Tokens Script
 * 
 * Burns tokens from the owner's wallet by transferring them to the dead wallet.
 * 
 * Usage:
 * npx hardhat run scripts/management/burn-owner-tokens.js --network bscMainnet
 * 
 * Or specify amount:
 * BURN_AMOUNT=1000000 npx hardhat run scripts/management/burn-owner-tokens.js --network bscMainnet
 */

const hre = require("hardhat");
const { ethers } = require("hardhat");

// Configuration
const DEAD_WALLET = "0x000000000000000000000000000000000000dEaD";
const CONTRACT_ADDRESS = "0xc66404C3fa3E01378027b4A4411812D3a8D458F5";

async function main() {
    console.log("\n🔥 Burn Owner Tokens\n");
    console.log("=".repeat(70));
    
    // Get signer
    const [signer] = await ethers.getSigners();
    console.log(`\n📝 Wallet: ${signer.address}`);
    
    // Get contract
    const token = await ethers.getContractAt("SylvanToken", CONTRACT_ADDRESS);
    
    // Check if signer is owner
    const owner = await token.owner();
    if (signer.address.toLowerCase() !== owner.toLowerCase()) {
        console.log(`\n❌ Error: You are not the owner!`);
        console.log(`   Your address: ${signer.address}`);
        console.log(`   Owner address: ${owner}`);
        return;
    }
    
    console.log(`✅ Confirmed: You are the owner`);
    
    // Get current balance
    const balance = await token.balanceOf(signer.address);
    const balanceFormatted = ethers.utils.formatEther(balance);
    
    console.log(`\n💰 Your Balance: ${balanceFormatted} SYL`);
    
    if (balance.eq(0)) {
        console.log(`\n❌ No tokens to burn. Balance is zero.`);
        return;
    }
    
    // Determine burn amount
    let burnAmount;
    const envAmount = process.env.BURN_AMOUNT;
    
    if (envAmount) {
        burnAmount = ethers.utils.parseEther(envAmount);
        if (burnAmount.gt(balance)) {
            console.log(`\n❌ Error: Burn amount (${envAmount}) exceeds balance (${balanceFormatted})`);
            return;
        }
    } else {
        // Burn all tokens
        burnAmount = balance;
    }
    
    const burnAmountFormatted = ethers.utils.formatEther(burnAmount);
    
    console.log(`\n🔥 Burn Amount: ${burnAmountFormatted} SYL`);
    console.log(`📍 Destination: ${DEAD_WALLET}`);
    
    // Confirm
    console.log(`\n⚠️  WARNING: This action is IRREVERSIBLE!`);
    console.log(`   ${burnAmountFormatted} SYL will be permanently burned.`);
    
    // Execute burn
    console.log(`\n🔥 Initiating burn transaction...`);
    
    try {
        const tx = await token.transfer(DEAD_WALLET, burnAmount, {
            gasLimit: 150000
        });
        
        console.log(`\n⏳ Transaction submitted: ${tx.hash}`);
        console.log(`   BSCScan: https://bscscan.com/tx/${tx.hash}`);
        console.log(`   Waiting for confirmation...`);
        
        const receipt = await tx.wait();
        
        console.log(`\n✅ Burn successful!`);
        console.log(`   Block: ${receipt.blockNumber}`);
        console.log(`   Gas Used: ${receipt.gasUsed.toString()}`);
        
        // Verify
        const newBalance = await token.balanceOf(signer.address);
        const newBalanceFormatted = ethers.utils.formatEther(newBalance);
        
        const deadBalance = await token.balanceOf(DEAD_WALLET);
        const deadBalanceFormatted = ethers.utils.formatEther(deadBalance);
        
        console.log(`\n📊 Updated Balances:`);
        console.log(`   Your Balance: ${newBalanceFormatted} SYL`);
        console.log(`   Dead Wallet: ${deadBalanceFormatted} SYL`);
        console.log(`   Burned: ${burnAmountFormatted} SYL ✅`);
        
        // Calculate total burned
        const totalSupply = await token.totalSupply();
        const totalBurned = ethers.BigNumber.from("1000000000").mul(ethers.utils.parseEther("1")).sub(totalSupply);
        const totalBurnedFormatted = ethers.utils.formatEther(totalBurned);
        
        console.log(`\n🔥 Total Burned (from supply): ${totalBurnedFormatted} SYL`);
        
    } catch (error) {
        console.error(`\n❌ Error: ${error.message}`);
        
        if (error.message.includes("insufficient funds")) {
            console.log(`\n💡 Tip: Make sure you have enough BNB for gas fees.`);
        }
    }
    
    console.log(`\n${"=".repeat(70)}`);
    console.log(`🔥 Burn process completed.\n`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
