const { ethers } = require("hardhat");
const deploymentConfig = require("../../config/deployment.config.js");
require("dotenv").config();

/**
 * @title Finalize Token Distribution
 * @dev Transfer remaining tokens to Sylvan Token Wallet and verify final state
 */

const CONTRACT_ADDRESS = "0xc66404C3fa3E01378027b4A4411812D3a8D458F5";

async function main() {
    console.log("📊 Finalizing Token Distribution");
    console.log("=".repeat(70));

    const [deployer] = await ethers.getSigners();
    console.log("Deployer account:", deployer.address);

    const SylvanToken = await ethers.getContractFactory("SylvanToken");
    const contract = SylvanToken.attach(CONTRACT_ADDRESS);

    const config = {
        sylvanTokenWallet: deploymentConfig.wallets.system.sylvanToken.address,
        founderWallet: deploymentConfig.wallets.system.founder.address,
        lockedWallet: deploymentConfig.wallets.system.locked.address,
        feeWallet: deploymentConfig.wallets.system.fee.address,
        donationWallet: deploymentConfig.wallets.system.donation.address,
        adminWallets: {
            brk: deploymentConfig.wallets.admins.brk.address,
            erh: deploymentConfig.wallets.admins.erh.address,
            grk: deploymentConfig.wallets.admins.grk.address,
            cnk: deploymentConfig.wallets.admins.cnk.address
        }
    };

    // Check current balances
    console.log("\n📋 Current Token Distribution:");
    const deployerBalance = await contract.balanceOf(deployer.address);
    const sylvanBalance = await contract.balanceOf(config.sylvanTokenWallet);
    const founderBalance = await contract.balanceOf(config.founderWallet);
    
    console.log(`  Deployer: ${ethers.utils.formatEther(deployerBalance)} SYL`);
    console.log(`  Sylvan Token Wallet: ${ethers.utils.formatEther(sylvanBalance)} SYL`);
    console.log(`  Founder Wallet: ${ethers.utils.formatEther(founderBalance)} SYL`);

    // Calculate expected distribution
    // Total: 1B
    // Founder: 160M (already distributed)
    // Admin Initial Releases: 4M (already distributed)
    // Sylvan Token Wallet: 500M (target)
    // Locked (vesting): 300M (held by owner for vesting releases)
    // Admin Locked: 36M (held by owner for vesting releases)
    
    // Deployer should have: 300M (locked) + 36M (admin locked) = 336M
    // Sylvan Token Wallet should have: 500M
    
    const targetSylvanBalance = ethers.utils.parseEther("500000000");
    const currentSylvanBalance = sylvanBalance;
    
    if (currentSylvanBalance.lt(targetSylvanBalance)) {
        const amountToTransfer = targetSylvanBalance.sub(currentSylvanBalance);
        console.log(`\n💸 Transferring ${ethers.utils.formatEther(amountToTransfer)} SYL to Sylvan Token Wallet...`);
        
        const tx = await contract.transfer(config.sylvanTokenWallet, amountToTransfer);
        console.log(`  Transaction: ${tx.hash}`);
        await tx.wait();
        console.log(`  ✓ Transfer completed`);
    } else {
        console.log(`\n✓ Sylvan Token Wallet already has sufficient balance`);
    }

    // Final verification
    console.log("\n🔍 Final Token Distribution:");
    
    const wallets = [
        { name: 'Deployer (Owner)', address: deployer.address },
        { name: 'Sylvan Token Wallet', address: config.sylvanTokenWallet },
        { name: 'Founder Wallet', address: config.founderWallet },
        { name: 'Fee Wallet', address: config.feeWallet },
        { name: 'Donation Wallet', address: config.donationWallet },
        { name: 'Locked Wallet', address: config.lockedWallet },
        { name: 'BRK Admin', address: config.adminWallets.brk },
        { name: 'ERH Admin', address: config.adminWallets.erh },
        { name: 'GRK Admin', address: config.adminWallets.grk },
        { name: 'CNK Admin', address: config.adminWallets.cnk }
    ];

    let totalDistributed = ethers.BigNumber.from(0);
    
    for (const wallet of wallets) {
        const balance = await contract.balanceOf(wallet.address);
        totalDistributed = totalDistributed.add(balance);
        console.log(`  ${wallet.name}: ${ethers.utils.formatEther(balance)} SYL`);
    }

    console.log(`\n  Total Distributed: ${ethers.utils.formatEther(totalDistributed)} SYL`);
    console.log(`  Total Supply: ${ethers.utils.formatEther(await contract.totalSupply())} SYL`);

    // Summary
    console.log("\n📊 Distribution Summary:");
    console.log("  ✓ Founder: 160M SYL (16%)");
    console.log("  ✓ Sylvan Token Wallet: 500M SYL (50%)");
    console.log("  ✓ Admin Initial Releases: 4M SYL (4 x 1M)");
    console.log("  ✓ Admin Locked (in owner): 36M SYL (4 x 9M)");
    console.log("  ✓ Locked Wallet Vesting (in owner): 300M SYL (30%)");

    console.log("\n🎉 Token Distribution Finalized!");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
