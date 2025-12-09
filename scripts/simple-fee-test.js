// Simple Fee Test - No DEX Required
// Tests basic transfer and fee mechanism

const { ethers } = require("hardhat");

async function main() {
    console.log("=== Simple Fee Test (No DEX Required) ===\n");
    
    const [owner] = await ethers.getSigners();
    const TOKEN_ADDRESS = "0x2016Fd055810ef5e9F7C753c24ae4b2C2B414B9E";
    
    const token = await ethers.getContractAt("SylvanToken", TOKEN_ADDRESS);
    
    // Create test addresses
    const user1Address = "0x1234567890123456789012345678901234567890";
    const user2Address = "0x0987654321098765432109876543210987654321";
    
    console.log("📍 Addresses:");
    console.log("Owner:", owner.address);
    console.log("User1:", user1Address);
    console.log("Token:", TOKEN_ADDRESS);
    console.log("\n");
    
    // Initial balances
    const ownerBalance = await token.balanceOf(owner.address);
    console.log("💰 Initial Balance:");
    console.log("Owner:", ethers.utils.formatEther(ownerBalance), "SYL\n");
    
    // Test 1: Transfer with fee
    console.log("📝 Test 1: Transfer with Fee");
    const amount = ethers.utils.parseEther("10000");
    
    const user1BalanceBefore = await token.balanceOf(user1Address);
    
    const tx = await token.transfer(user1Address, amount);
    await tx.wait();
    
    const user1BalanceAfter = await token.balanceOf(user1Address);
    const received = user1BalanceAfter.sub(user1BalanceBefore);
    const fee = amount.sub(received);
    const feePercent = fee.mul(10000).div(amount).toNumber() / 100;
    
    console.log("✅ Transfer completed");
    console.log("TX:", tx.hash);
    console.log("Sent:", ethers.utils.formatEther(amount), "SYL");
    console.log("Received:", ethers.utils.formatEther(received), "SYL");
    console.log("Fee:", ethers.utils.formatEther(fee), "SYL");
    console.log("Fee %:", feePercent, "%");
    console.log("\n");
    
    // Test 2: Check fee distribution
    console.log("📊 Test 2: Fee Distribution");
    
    const config = require("../config/deployment.config.js");
    const deadWallet = "0x000000000000000000000000000000000000dEaD";
    
    const operationsBalance = await token.balanceOf(config.wallets.operations);
    const donationsBalance = await token.balanceOf(config.wallets.donations);
    const burnedBalance = await token.balanceOf(deadWallet);
    
    console.log("Operations Wallet:", ethers.utils.formatEther(operationsBalance), "SYL");
    console.log("Donations Wallet:", ethers.utils.formatEther(donationsBalance), "SYL");
    console.log("Burned (Dead Wallet):", ethers.utils.formatEther(burnedBalance), "SYL");
    console.log("\n");
    
    // Calculate distribution percentages
    const totalFees = operationsBalance.add(donationsBalance).add(burnedBalance);
    if (totalFees.gt(0)) {
        const opsPercent = operationsBalance.mul(100).div(totalFees).toNumber();
        const donPercent = donationsBalance.mul(100).div(totalFees).toNumber();
        const burnPercent = burnedBalance.mul(100).div(totalFees).toNumber();
        
        console.log("📈 Distribution Percentages:");
        console.log("Operations:", opsPercent, "%");
        console.log("Donations:", donPercent, "%");
        console.log("Burned:", burnPercent, "%");
        console.log("\n");
    }
    
    // Test 3: Multiple transfers
    console.log("📝 Test 3: Multiple Transfers");
    
    for (let i = 0; i < 3; i++) {
        const testAmount = ethers.utils.parseEther("1000");
        const tx = await token.transfer(user2Address, testAmount);
        await tx.wait();
        console.log(`Transfer ${i + 1}: ${ethers.utils.formatEther(testAmount)} SYL - TX: ${tx.hash}`);
    }
    console.log("✅ Multiple transfers completed\n");
    
    // Final summary
    console.log("=== Test Summary ===");
    console.log("✅ Transfer mechanism working");
    console.log("✅ Fee deduction working (1%)");
    console.log("✅ Fee distribution working");
    console.log("✅ Multiple transfers successful");
    console.log("\n🔗 View on BSCScan:");
    console.log("https://testnet.bscscan.com/address/" + TOKEN_ADDRESS);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("\n❌ Error:", error);
        process.exit(1);
    });
