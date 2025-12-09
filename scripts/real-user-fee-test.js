// Real user fee test - Test with non-exempt wallet
const { ethers } = require("hardhat");

async function main() {
    const [owner] = await ethers.getSigners();
    const TOKEN_ADDRESS = "0x2016Fd055810ef5e9F7C753c24ae4b2C2B414B9E";
    const token = await ethers.getContractAt("SylvanToken", TOKEN_ADDRESS);
    
    console.log("\n=== Real User Fee Test ===\n");
    
    // Create a new test wallet (non-exempt user)
    const testWallet = ethers.Wallet.createRandom().connect(ethers.provider);
    console.log("📍 Test Wallet:", testWallet.address);
    console.log("Owner:", owner.address);
    
    // Check if test wallet is exempt (should be false)
    const isExempt = await token.isExempt(testWallet.address);
    console.log("Is test wallet exempt?", isExempt);
    
    if (isExempt) {
        console.log("⚠️ Test wallet is exempt! This shouldn't happen.");
        return;
    }
    
    console.log("\n📝 Step 1: Send tokens from owner to test wallet");
    const sendAmount = ethers.utils.parseEther("10000");
    const tx1 = await token.transfer(testWallet.address, sendAmount);
    await tx1.wait();
    
    const testBalance = await token.balanceOf(testWallet.address);
    console.log("✅ Test wallet received:", ethers.utils.formatEther(testBalance), "SYL");
    
    // Now send some BNB for gas
    console.log("\n📝 Step 2: Send BNB for gas");
    const bnbTx = await owner.sendTransaction({
        to: testWallet.address,
        value: ethers.utils.parseEther("0.01")
    });
    await bnbTx.wait();
    console.log("✅ Sent 0.01 BNB for gas");
    
    // Now test transfer from non-exempt wallet
    console.log("\n📝 Step 3: Transfer from non-exempt wallet (should have 1% fee)");
    
    const transferAmount = ethers.utils.parseEther("1000");
    const recipientAddress = "0x9999999999999999999999999999999999999999";
    
    // Get balances before
    const balanceBefore = await token.balanceOf(testWallet.address);
    const recipientBalanceBefore = await token.balanceOf(recipientAddress);
    
    console.log("\nBefore transfer:");
    console.log("- Sender:", ethers.utils.formatEther(balanceBefore), "SYL");
    console.log("- Recipient:", ethers.utils.formatEther(recipientBalanceBefore), "SYL");
    
    // Transfer from test wallet
    const tokenWithTestWallet = token.connect(testWallet);
    const tx2 = await tokenWithTestWallet.transfer(recipientAddress, transferAmount);
    await tx2.wait();
    
    // Get balances after
    const balanceAfter = await token.balanceOf(testWallet.address);
    const recipientBalanceAfter = await token.balanceOf(recipientAddress);
    
    console.log("\nAfter transfer:");
    console.log("- Sender:", ethers.utils.formatEther(balanceAfter), "SYL");
    console.log("- Recipient:", ethers.utils.formatEther(recipientBalanceAfter), "SYL");
    
    // Calculate fee
    const sent = balanceBefore.sub(balanceAfter);
    const received = recipientBalanceAfter.sub(recipientBalanceBefore);
    const fee = sent.sub(received);
    const feePercent = fee.mul(10000).div(sent).toNumber() / 100;
    
    console.log("\n📊 Fee Analysis:");
    console.log("- Sent:", ethers.utils.formatEther(sent), "SYL");
    console.log("- Received:", ethers.utils.formatEther(received), "SYL");
    console.log("- Fee:", ethers.utils.formatEther(fee), "SYL");
    console.log("- Fee %:", feePercent, "%");
    
    // Check fee distribution
    console.log("\n📈 Fee Distribution:");
    const config = require("../config/deployment.config.js");
    const operationsWallet = config.wallets.system.fee;
    const donationsWallet = config.wallets.system.donations;
    const deadWallet = "0x000000000000000000000000000000000000dEaD";
    
    const operationsBalance = await token.balanceOf(operationsWallet);
    const donationsBalance = await token.balanceOf(donationsWallet);
    const burnedBalance = await token.balanceOf(deadWallet);
    
    console.log("- Operations:", ethers.utils.formatEther(operationsBalance), "SYL");
    console.log("- Donations:", ethers.utils.formatEther(donationsBalance), "SYL");
    console.log("- Burned:", ethers.utils.formatEther(burnedBalance), "SYL");
    
    // Verify fee is 1%
    if (feePercent >= 0.99 && feePercent <= 1.01) {
        console.log("\n✅ SUCCESS: Fee is correctly 1%!");
    } else {
        console.log("\n❌ ERROR: Fee should be 1% but is", feePercent, "%");
    }
    
    console.log("\n🔗 View on BSCScan:");
    console.log("https://testnet.bscscan.com/tx/" + tx2.hash);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("\n❌ Error:", error);
        process.exit(1);
    });
