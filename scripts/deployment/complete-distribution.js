const { ethers } = require("hardhat");
const deploymentConfig = require("../../config/deployment.config.js");
require("dotenv").config();

/**
 * @title Complete Token Distribution
 * @dev Transfer full allocations to all wallets (tokens will be locked in their wallets)
 * Contract: 0xc66404C3fa3E01378027b4A4411812D3a8D458F5
 */

const CONTRACT_ADDRESS = "0xc66404C3fa3E01378027b4A4411812D3a8D458F5";

async function main() {
    console.log("📊 Completing Token Distribution");
    console.log("=".repeat(70));

    const [deployer] = await ethers.getSigners();
    console.log("Deployer:", deployer.address);
    console.log("Balance:", ethers.utils.formatEther(await deployer.getBalance()), "BNB");

    const SylvanToken = await ethers.getContractFactory("SylvanToken");
    const contract = SylvanToken.attach(CONTRACT_ADDRESS);

    // Current balances
    console.log("\n📋 Current Balances:");
    const deployerBalance = await contract.balanceOf(deployer.address);
    console.log(`  Deployer: ${ethers.utils.formatEther(deployerBalance)} SYL`);

    // Config
    const config = {
        lockedWallet: deploymentConfig.wallets.system.locked.address,
        adminWallets: {
            brk: deploymentConfig.wallets.admins.brk.address,
            erh: deploymentConfig.wallets.admins.erh.address,
            grk: deploymentConfig.wallets.admins.grk.address,
            cnk: deploymentConfig.wallets.admins.cnk.address
        }
    };

    // Distributions needed:
    // Locked Wallet: 300M (currently 0)
    // Admin wallets: Each should have 10M total (currently 1M each from initial release)
    // So we need to send 9M more to each admin (the locked portion)

    console.log("\n💸 Distributing Locked Tokens to Wallets...");

    // 1. Transfer 300M to Locked Wallet
    console.log("\n  1. Locked Wallet (300M)...");
    const lockedAmount = ethers.utils.parseEther("300000000");
    const lockedBalance = await contract.balanceOf(config.lockedWallet);
    
    if (lockedBalance.lt(lockedAmount)) {
        const toTransfer = lockedAmount.sub(lockedBalance);
        console.log(`     Address: ${config.lockedWallet}`);
        console.log(`     Amount: ${ethers.utils.formatEther(toTransfer)} SYL`);
        
        const tx = await contract.transfer(config.lockedWallet, toTransfer);
        console.log(`     Transaction: ${tx.hash}`);
        await tx.wait();
        console.log(`     ✓ Transferred`);
    } else {
        console.log(`     ✓ Already has sufficient balance`);
    }

    // 2. Transfer remaining 9M to each admin wallet (locked portion)
    const adminConfigs = [
        { name: 'BRK', address: config.adminWallets.brk, totalAllocation: "10000000" },
        { name: 'ERH', address: config.adminWallets.erh, totalAllocation: "10000000" },
        { name: 'GRK', address: config.adminWallets.grk, totalAllocation: "10000000" },
        { name: 'CNK', address: config.adminWallets.cnk, totalAllocation: "10000000" }
    ];

    for (const admin of adminConfigs) {
        console.log(`\n  2. ${admin.name} Admin Wallet...`);
        const targetAmount = ethers.utils.parseEther(admin.totalAllocation);
        const currentBalance = await contract.balanceOf(admin.address);
        
        console.log(`     Address: ${admin.address}`);
        console.log(`     Current: ${ethers.utils.formatEther(currentBalance)} SYL`);
        console.log(`     Target: ${ethers.utils.formatEther(targetAmount)} SYL`);
        
        if (currentBalance.lt(targetAmount)) {
            const toTransfer = targetAmount.sub(currentBalance);
            console.log(`     Transferring: ${ethers.utils.formatEther(toTransfer)} SYL`);
            
            const tx = await contract.transfer(admin.address, toTransfer);
            console.log(`     Transaction: ${tx.hash}`);
            await tx.wait();
            console.log(`     ✓ Transferred`);
        } else {
            console.log(`     ✓ Already has sufficient balance`);
        }
    }

    // Final verification
    console.log("\n🔍 Final Distribution:");
    
    const wallets = [
        { name: 'Deployer', address: deployer.address },
        { name: 'Locked Wallet', address: config.lockedWallet },
        { name: 'BRK', address: config.adminWallets.brk },
        { name: 'ERH', address: config.adminWallets.erh },
        { name: 'GRK', address: config.adminWallets.grk },
        { name: 'CNK', address: config.adminWallets.cnk }
    ];

    let total = ethers.BigNumber.from(0);
    for (const wallet of wallets) {
        const balance = await contract.balanceOf(wallet.address);
        total = total.add(balance);
        console.log(`  ${wallet.name}: ${ethers.utils.formatEther(balance)} SYL`);
    }

    // Also check founder
    const founderBalance = await contract.balanceOf(deploymentConfig.wallets.system.founder.address);
    total = total.add(founderBalance);
    console.log(`  Founder: ${ethers.utils.formatEther(founderBalance)} SYL`);

    console.log(`\n  Total Distributed: ${ethers.utils.formatEther(total)} SYL`);

    console.log("\n🎉 Distribution Complete!");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
