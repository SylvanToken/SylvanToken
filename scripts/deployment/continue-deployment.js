const { ethers } = require("hardhat");
const deploymentConfig = require("../../config/deployment.config.js");
require("dotenv").config();

/**
 * @title Continue Deployment Script
 * @dev Continue deployment from where it stopped
 * Contract: 0xc66404C3fa3E01378027b4A4411812D3a8D458F5
 * Status: BRK admin configured, need to configure ERH, GRK, CNK, locked wallet, and distribute tokens
 */

const CONTRACT_ADDRESS = "0xc66404C3fa3E01378027b4A4411812D3a8D458F5";

async function main() {
    console.log("🔄 Continuing SylvanToken Deployment");
    console.log("=".repeat(70));

    const [deployer] = await ethers.getSigners();
    console.log("Deployer account:", deployer.address);
    console.log("Account balance:", ethers.utils.formatEther(await deployer.getBalance()), "BNB");

    // Connect to deployed contract
    const SylvanToken = await ethers.getContractFactory("SylvanToken");
    const contract = SylvanToken.attach(CONTRACT_ADDRESS);
    console.log("\n📋 Connected to contract:", CONTRACT_ADDRESS);

    // Verify contract connection
    const totalSupply = await contract.totalSupply();
    console.log("Total Supply:", ethers.utils.formatEther(totalSupply), "SYL");
    console.log("Owner:", await contract.owner());

    // Load config
    const config = {
        adminWallets: {
            brk: deploymentConfig.wallets.admins.brk.address,
            erh: deploymentConfig.wallets.admins.erh.address,
            grk: deploymentConfig.wallets.admins.grk.address,
            cnk: deploymentConfig.wallets.admins.cnk.address
        },
        lockedWallet: deploymentConfig.wallets.system.locked.address,
        founderWallet: deploymentConfig.wallets.system.founder.address,
        sylvanTokenWallet: deploymentConfig.wallets.system.sylvanToken.address,
        allocations: deploymentConfig.allocations,
        lockParams: deploymentConfig.lockParameters
    };

    // Check current status
    console.log("\n📊 Checking Current Status...");
    await checkStatus(contract, config);

    // Configure remaining admin wallets
    await configureRemainingAdmins(contract, config);

    // Configure locked wallet
    await configureLockedWallet(contract, config);

    // Process initial releases
    await processInitialReleases(contract, config);

    // Distribute tokens
    await distributeTokens(contract, config);

    // Final verification
    await verifyFinalState(contract, config);

    console.log("\n🎉 Deployment Continuation Completed!");
    console.log("=".repeat(70));
}

async function checkStatus(contract, config) {
    const admins = ['brk', 'erh', 'grk', 'cnk'];
    
    console.log("\n🔒 Admin Wallet Status:");
    for (const name of admins) {
        const address = config.adminWallets[name];
        const isConfigured = await contract.isAdminConfigured(address);
        console.log(`  ${name.toUpperCase()}: ${isConfigured ? '✓ CONFIGURED' : '✗ NOT CONFIGURED'}`);
    }

    console.log("\n🔐 Locked Wallet Status:");
    const hasVesting = await contract.hasVestingSchedule(config.lockedWallet);
    console.log(`  Locked Wallet: ${hasVesting ? '✓ CONFIGURED' : '✗ NOT CONFIGURED'}`);
}

async function configureRemainingAdmins(contract, config) {
    console.log("\n🔒 Configuring Remaining Admin Wallets...");
    
    const adminConfigs = [
        { name: 'ERH', address: config.adminWallets.erh, allocation: config.allocations.admins.erh },
        { name: 'GRK', address: config.adminWallets.grk, allocation: config.allocations.admins.grk },
        { name: 'CNK', address: config.adminWallets.cnk, allocation: config.allocations.admins.cnk }
    ];
    
    for (const adminConfig of adminConfigs) {
        const isConfigured = await contract.isAdminConfigured(adminConfig.address);
        
        if (isConfigured) {
            console.log(`\n  ℹ️ ${adminConfig.name} already configured, skipping...`);
            continue;
        }
        
        console.log(`\n  Configuring ${adminConfig.name} Admin Wallet...`);
        console.log(`    Address: ${adminConfig.address}`);
        console.log(`    Allocation: ${adminConfig.allocation} SYL`);
        
        try {
            const tx = await contract.configureAdminWallet(
                adminConfig.address,
                ethers.utils.parseEther(adminConfig.allocation)
            );
            
            console.log(`    Transaction: ${tx.hash}`);
            const receipt = await tx.wait();
            console.log(`    ✓ Configured in block ${receipt.blockNumber}`);
            
            // Verify configuration
            const adminInfo = await contract.getAdminConfig(adminConfig.address);
            console.log(`    Immediate Release: ${ethers.utils.formatEther(adminInfo.immediateRelease)} SYL (10%)`);
            console.log(`    Locked Amount: ${ethers.utils.formatEther(adminInfo.lockedAmount)} SYL (90%)`);
            
        } catch (error) {
            console.error(`    ✗ Failed to configure ${adminConfig.name}: ${error.message}`);
            throw error;
        }
    }
}

async function configureLockedWallet(contract, config) {
    console.log("\n🔐 Configuring Locked Wallet Vesting...");
    
    const hasVesting = await contract.hasVestingSchedule(config.lockedWallet);
    if (hasVesting) {
        console.log("  ℹ️ Locked wallet already configured, skipping...");
        return;
    }
    
    const lockedAllocation = ethers.utils.parseEther(config.allocations.locked);
    const cliffDays = parseInt(config.lockParams.locked.cliffDays);
    const vestingMonths = parseInt(config.lockParams.locked.durationMonths);
    const releasePercentage = parseInt(config.lockParams.locked.monthlyRelease);
    const burnPercentage = parseInt(config.lockParams.locked.burnPercentage);
    
    console.log(`  Address: ${config.lockedWallet}`);
    console.log(`  Allocation: ${ethers.utils.formatEther(lockedAllocation)} SYL`);
    console.log(`  Cliff Period: ${cliffDays} days`);
    console.log(`  Vesting Duration: ${vestingMonths} months`);
    console.log(`  Monthly Release: ${releasePercentage / 100}%`);
    console.log(`  Burn Percentage: ${burnPercentage / 100}%`);
    
    try {
        const tx = await contract.createVestingSchedule(
            config.lockedWallet,
            lockedAllocation,
            cliffDays,
            vestingMonths,
            releasePercentage,
            burnPercentage,
            false
        );
        
        console.log(`  Transaction: ${tx.hash}`);
        const receipt = await tx.wait();
        console.log(`  ✓ Locked wallet vesting configured in block ${receipt.blockNumber}`);
        
    } catch (error) {
        console.error(`  ✗ Failed to configure locked wallet: ${error.message}`);
        throw error;
    }
}

async function processInitialReleases(contract, config) {
    console.log("\n💰 Processing Initial Releases for Admin Wallets...");
    
    const adminWallets = [
        { name: 'BRK', address: config.adminWallets.brk },
        { name: 'ERH', address: config.adminWallets.erh },
        { name: 'GRK', address: config.adminWallets.grk },
        { name: 'CNK', address: config.adminWallets.cnk }
    ];
    
    for (const admin of adminWallets) {
        const adminInfo = await contract.getAdminConfig(admin.address);
        
        if (adminInfo.immediateReleased) {
            console.log(`\n  ℹ️ ${admin.name} initial release already processed, skipping...`);
            continue;
        }
        
        console.log(`\n  Processing initial release for ${admin.name}...`);
        
        try {
            const tx = await contract.processInitialRelease(admin.address);
            console.log(`    Transaction: ${tx.hash}`);
            
            const receipt = await tx.wait();
            console.log(`    ✓ Initial release processed in block ${receipt.blockNumber}`);
            
            const events = receipt.events?.filter(e => e.event === 'InitialReleaseProcessed');
            if (events && events.length > 0 && events[0].args && events[0].args.amount) {
                const releaseAmount = events[0].args.amount;
                console.log(`    Released Amount: ${ethers.utils.formatEther(releaseAmount)} SYL`);
            } else {
                // Get release amount from admin config
                const adminInfo = await contract.getAdminConfig(admin.address);
                console.log(`    Released Amount: ${ethers.utils.formatEther(adminInfo.immediateRelease)} SYL`);
            }
            
        } catch (error) {
            console.error(`    ✗ Failed to process initial release for ${admin.name}: ${error.message}`);
            throw error;
        }
    }
}

async function distributeTokens(contract, config) {
    console.log("\n📊 Distributing Tokens...");
    
    const distributions = [
        { name: 'Founder', address: config.founderWallet, amount: config.allocations.founder },
        { name: 'Sylvan Token', address: config.sylvanTokenWallet, amount: config.allocations.sylvanToken }
    ];
    
    for (const dist of distributions) {
        const currentBalance = await contract.balanceOf(dist.address);
        const targetAmount = ethers.utils.parseEther(dist.amount);
        
        if (currentBalance.gte(targetAmount)) {
            console.log(`\n  ℹ️ ${dist.name} already has sufficient balance, skipping...`);
            continue;
        }
        
        console.log(`\n  Distributing to ${dist.name}...`);
        console.log(`    Address: ${dist.address}`);
        console.log(`    Amount: ${dist.amount} SYL`);
        
        try {
            const tx = await contract.transfer(dist.address, targetAmount);
            console.log(`    Transaction: ${tx.hash}`);
            
            const receipt = await tx.wait();
            console.log(`    ✓ Distribution completed in block ${receipt.blockNumber}`);
            
        } catch (error) {
            console.error(`    ✗ Failed to distribute to ${dist.name}: ${error.message}`);
            throw error;
        }
    }
}

async function verifyFinalState(contract, config) {
    console.log("\n🔍 Final Verification...");
    
    console.log("\n📋 Contract Information:");
    console.log(`  Contract Address: ${contract.address}`);
    console.log(`  Total Supply: ${ethers.utils.formatEther(await contract.totalSupply())} SYL`);
    console.log(`  Owner: ${await contract.owner()}`);
    
    console.log("\n💰 Wallet Balances:");
    const wallets = [
        { name: 'Founder', address: config.founderWallet },
        { name: 'Sylvan Token', address: config.sylvanTokenWallet },
        { name: 'BRK', address: config.adminWallets.brk },
        { name: 'ERH', address: config.adminWallets.erh },
        { name: 'GRK', address: config.adminWallets.grk },
        { name: 'CNK', address: config.adminWallets.cnk }
    ];
    
    for (const wallet of wallets) {
        const balance = await contract.balanceOf(wallet.address);
        console.log(`  ${wallet.name}: ${ethers.utils.formatEther(balance)} SYL`);
    }
    
    console.log("\n🔒 Admin Configurations:");
    for (const [name, address] of Object.entries(config.adminWallets)) {
        const adminInfo = await contract.getAdminConfig(address);
        console.log(`  ${name.toUpperCase()}:`);
        console.log(`    Total Allocation: ${ethers.utils.formatEther(adminInfo.totalAllocation)} SYL`);
        console.log(`    Immediate Released: ${adminInfo.immediateReleased ? 'YES' : 'NO'}`);
    }
    
    console.log("\n🔐 Locked Wallet:");
    const vestingInfo = await contract.getVestingInfo(config.lockedWallet);
    console.log(`  Total Amount: ${ethers.utils.formatEther(vestingInfo.totalAmount)} SYL`);
    console.log(`  Is Active: ${vestingInfo.isActive ? 'YES' : 'NO'}`);
    
    console.log("\n📊 Vesting Summary:");
    console.log(`  Total Vested: ${ethers.utils.formatEther(await contract.getTotalVestedAmount())} SYL`);
    console.log(`  Total Released: ${ethers.utils.formatEther(await contract.getTotalReleasedAmount())} SYL`);
    console.log(`  Total Burned: ${ethers.utils.formatEther(await contract.getTotalBurnedAmount())} SYL`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("\n❌ Deployment continuation failed:");
        console.error(error);
        process.exit(1);
    });
