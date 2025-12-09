const { ethers } = require("hardhat");
const { loadExemptionsFromConfig, parseExemptionConfig, validateExemptionConfig } = require("../management/exemption-config-loader");
const deploymentConfig = require("../../config/deployment.config.js");
const securityConfig = require("../../config/security.config.js");
const environmentConfig = require("../../config/environment.config.js");
require("dotenv").config();

/**
 * @title Enhanced Complete Deployment Script
 * @dev Deploy SylvanToken with fee exemption configuration and lock mechanisms
 * Requirements: 1.1, 1.2, 2.1, 2.2, 5.1
 */

async function main() {
    console.log("🚀 Enhanced Sylvan Token Complete Deployment");
    console.log("=".repeat(70));

    const [deployer] = await ethers.getSigners();
    console.log("Deploying with account:", deployer.address);
    console.log("Account balance:", ethers.utils.formatEther(await deployer.getBalance()), "ETH");

    // Load environment configuration
    const config = loadEnvironmentConfig();
    validateEnvironmentConfig(config);

    console.log("\n📋 Deployment Configuration:");
    displayConfiguration(config);

    // Parse exemption configuration
    console.log("\n🚫 Loading Exemption Configuration...");
    const exemptionConfig = parseExemptionConfig();
    
    if (exemptionConfig.validateConfig) {
        console.log("Validating exemption configuration...");
        if (!validateExemptionConfig(exemptionConfig)) {
            throw new Error("Invalid exemption configuration");
        }
        console.log("✓ Exemption configuration validation passed");
    }

    // Prepare initial exempt accounts for constructor
    const initialExemptAccounts = prepareInitialExemptAccounts(config);
    console.log(`\n📝 Initial Exempt Accounts (${initialExemptAccounts.length}):`);
    initialExemptAccounts.forEach(addr => console.log(`  ${addr}`));

    // Deploy the contract
    console.log("\n🔨 Deploying SylvanToken...");
    const contract = await deployContract(config, initialExemptAccounts);

    // Wait for confirmations
    console.log("⏳ Waiting for confirmations...");
    await contract.deployTransaction.wait(3);

    // Load additional exemption configuration
    await loadAdditionalExemptions(contract, exemptionConfig);

    // Configure admin wallets with lock mechanisms
    await configureAdminWallets(contract, config);

    // Configure locked wallet vesting
    await configureLockedWallet(contract, config);

    // Process initial releases for admin wallets
    await processInitialReleases(contract, config);

    // Remove admin wallets from exemption (they should pay fees)
    await removeAdminExemptions(contract, config);

    // Distribute tokens according to allocation
    await distributeTokens(contract, config);

    // Verify final configuration
    await verifyDeployment(contract, config);

    // Save deployment information
    const deploymentInfo = await saveDeploymentInfo(contract, config, exemptionConfig);

    console.log("\n🎉 Enhanced Complete Deployment Completed Successfully!");
    console.log("=".repeat(70));

    return {
        contract,
        deploymentInfo
    };
}

/**
 * Load and validate environment configuration
 */
function loadEnvironmentConfig() {
    // Validate environment configuration
    environmentConfig.validateConfiguration();
    
    const config = {
        // Wallet addresses from deployment config
        feeWallet: deploymentConfig.wallets.system.fee.address,
        donationWallet: deploymentConfig.wallets.system.donation.address,
        founderWallet: deploymentConfig.wallets.system.founder.address,
        sylvanTokenWallet: deploymentConfig.wallets.system.sylvanToken.address,
        lockedWallet: deploymentConfig.wallets.system.locked.address,
        
        // Admin wallets
        adminWallets: {
            brk: deploymentConfig.wallets.admins.brk.address,
            erh: deploymentConfig.wallets.admins.erh.address,
            grk: deploymentConfig.wallets.admins.grk.address,
            cnk: deploymentConfig.wallets.admins.cnk.address
        },
        
        // Token allocations
        allocations: deploymentConfig.allocations,
        
        // Lock parameters
        lockParams: {
            adminLockPercentage: deploymentConfig.lockParameters.admin.lockPercentage,
            adminInitialRelease: deploymentConfig.lockParameters.admin.initialRelease,
            adminMonthlyRelease: deploymentConfig.lockParameters.admin.monthlyRelease,
            adminCliffDays: deploymentConfig.lockParameters.admin.cliffDays,
            adminDurationMonths: deploymentConfig.lockParameters.admin.durationMonths,
            
            lockedLockPercentage: deploymentConfig.lockParameters.locked.lockPercentage,
            lockedMonthlyRelease: deploymentConfig.lockParameters.locked.monthlyRelease,
            lockedBurnPercentage: deploymentConfig.lockParameters.locked.burnPercentage,
            lockedCliffDays: deploymentConfig.lockParameters.locked.cliffDays,
            lockedDurationMonths: deploymentConfig.lockParameters.locked.durationMonths
        },
        
        // Security parameters
        security: securityConfig
    };

    return config;
}

/**
 * Validate environment configuration
 */
function validateEnvironmentConfig(config) {
    const requiredWallets = [
        'feeWallet', 'donationWallet', 'founderWallet', 'sylvanTokenWallet', 'lockedWallet'
    ];
    
    for (const wallet of requiredWallets) {
        if (!config[wallet] || !ethers.utils.isAddress(config[wallet])) {
            throw new Error(`Invalid or missing ${wallet} address`);
        }
    }
    
    // Validate admin wallets
    for (const [name, address] of Object.entries(config.adminWallets)) {
        if (!address || !ethers.utils.isAddress(address)) {
            throw new Error(`Invalid or missing admin wallet address for ${name}`);
        }
    }
}

/**
 * Display configuration for verification
 */
function displayConfiguration(config) {
    console.log(`  Fee Wallet: ${config.feeWallet}`);
    console.log(`  Donation Wallet: ${config.donationWallet}`);
    console.log(`  Founder Wallet: ${config.founderWallet}`);
    console.log(`  Sylvan Token Wallet: ${config.sylvanTokenWallet}`);
    console.log(`  Locked Wallet: ${config.lockedWallet}`);
    
    console.log("\n  Admin Wallets:");
    Object.entries(config.adminWallets).forEach(([name, address]) => {
        console.log(`    ${name.toUpperCase()}: ${address}`);
    });
    
    console.log("\n  Token Allocations:");
    console.log(`    Total: ${config.allocations.total} SYL`);
    console.log(`    Founder: ${config.allocations.founder} SYL`);
    console.log(`    Sylvan Token: ${config.allocations.sylvanToken} SYL`);
    console.log(`    Locked: ${config.allocations.locked} SYL`);
    console.log(`    Admin BRK: ${config.allocations.admins.brk} SYL`);
    console.log(`    Admin ERH: ${config.allocations.admins.erh} SYL`);
    console.log(`    Admin GRK: ${config.allocations.admins.grk} SYL`);
    console.log(`    Admin CNK: ${config.allocations.admins.cnk} SYL`);
}

/**
 * Prepare initial exempt accounts for constructor
 */
function prepareInitialExemptAccounts(config) {
    // Only include system wallets in initial exemption - NO ADMIN WALLETS
    const initialExemptAccounts = [
        config.founderWallet,        // Founder wallet
        config.sylvanTokenWallet,    // Sylvan token wallet
        config.lockedWallet,         // Locked wallet
        // NOTE: Admin wallets are NOT included - they will pay fees
    ].filter(addr => addr && ethers.utils.isAddress(addr));

    console.log("\n📝 Initial Exempt Accounts (Admin wallets EXCLUDED):");
    initialExemptAccounts.forEach(addr => console.log(`  ${addr}`));
    console.log("\n⚠️ Admin wallets will pay fees from deployment:");
    Object.entries(config.adminWallets).forEach(([name, address]) => {
        console.log(`  ${name.toUpperCase()}: ${address} - FEE CHARGED`);
    });

    return initialExemptAccounts;
}

/**
 * Deploy the contract
 * Note: SylvanToken uses internal libraries, no external linking required
 */
async function deployContract(config, initialExemptAccounts) {
    console.log("📚 SylvanToken uses internal libraries - no external linking required");
    
    // Deploy contract directly (no library linking needed)
    const SylvanToken = await ethers.getContractFactory("SylvanToken");
    
    const contract = await SylvanToken.deploy(
        config.feeWallet,
        config.donationWallet,
        initialExemptAccounts
    );

    await contract.deployed();
    console.log("✓ SylvanToken deployed to:", contract.address);
    
    return contract;
}

/**
 * Load additional exemption configuration
 */
async function loadAdditionalExemptions(contract, exemptionConfig) {
    if (exemptionConfig.autoLoad && exemptionConfig.exemptWallets.length > 0) {
        console.log("\n🔧 Loading Additional Exemption Configuration...");
        
        const success = await loadExemptionsFromConfig(contract, exemptionConfig);
        if (success) {
            console.log("✓ Exemption configuration loaded successfully");
        } else {
            console.warn("⚠️ Some exemption configurations may not have loaded correctly");
        }
    }
}

/**
 * Configure admin wallets with lock mechanisms
 * Requirements: 2.1, 2.2, 2.3, 5.1, 5.2
 */
async function configureAdminWallets(contract, config) {
    console.log("\n🔒 Configuring Admin Wallets with Lock Mechanisms...");
    
    const adminConfigs = [
        { name: 'BRK', address: config.adminWallets.brk, allocation: config.allocations.admins.brk },
        { name: 'ERH', address: config.adminWallets.erh, allocation: config.allocations.admins.erh },
        { name: 'GRK', address: config.adminWallets.grk, allocation: config.allocations.admins.grk },
        { name: 'CNK', address: config.adminWallets.cnk, allocation: config.allocations.admins.cnk }
    ];
    
    for (const adminConfig of adminConfigs) {
        console.log(`\n  Configuring ${adminConfig.name} Admin Wallet...`);
        console.log(`    Address: ${adminConfig.address}`);
        console.log(`    Allocation: ${ethers.utils.formatEther(ethers.utils.parseEther(adminConfig.allocation))} SYL`);
        
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
            // Monthly release is calculated dynamically (5% of total allocation)
            const monthlyRelease = adminInfo.totalAllocation.mul(500).div(10000);
            console.log(`    Monthly Release: ${ethers.utils.formatEther(monthlyRelease)} SYL (5%)`);
            
        } catch (error) {
            console.error(`    ✗ Failed to configure ${adminConfig.name}: ${error.message}`);
            throw error;
        }
    }
}

/**
 * Configure locked wallet vesting
 * Requirements: 5.1, 5.2
 */
async function configureLockedWallet(contract, config) {
    console.log("\n🔐 Configuring Locked Wallet Vesting...");
    
    const lockedAllocation = ethers.utils.parseEther(config.allocations.locked);
    const cliffDays = parseInt(config.lockParams.lockedCliffDays);
    const vestingMonths = parseInt(config.lockParams.lockedDurationMonths);
    const releasePercentage = parseInt(config.lockParams.lockedMonthlyRelease); // 3%
    const burnPercentage = parseInt(config.lockParams.lockedBurnPercentage); // 10%
    
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
            false // isAdmin = false for locked wallet
        );
        
        console.log(`  Transaction: ${tx.hash}`);
        const receipt = await tx.wait();
        console.log(`  ✓ Locked wallet vesting configured in block ${receipt.blockNumber}`);
        
        // Verify configuration
        const vestingInfo = await contract.getVestingInfo(config.lockedWallet);
        console.log(`  Total Amount: ${ethers.utils.formatEther(vestingInfo.totalAmount)} SYL`);
        console.log(`  Cliff Duration: ${vestingInfo.cliffDuration} seconds`);
        console.log(`  Vesting Duration: ${vestingInfo.vestingDuration} seconds`);
        
    } catch (error) {
        console.error(`  ✗ Failed to configure locked wallet: ${error.message}`);
        throw error;
    }
}

/**
 * Process initial releases for admin wallets
 * Requirements: 2.1 - 10% immediate access
 */
async function processInitialReleases(contract, config) {
    console.log("\n💰 Processing Initial Releases for Admin Wallets...");
    
    const adminWallets = [
        { name: 'BRK', address: config.adminWallets.brk },
        { name: 'ERH', address: config.adminWallets.erh },
        { name: 'GRK', address: config.adminWallets.grk },
        { name: 'CNK', address: config.adminWallets.cnk }
    ];
    
    for (const admin of adminWallets) {
        console.log(`\n  Processing initial release for ${admin.name}...`);
        
        try {
            const tx = await contract.processInitialRelease(admin.address);
            console.log(`    Transaction: ${tx.hash}`);
            
            const receipt = await tx.wait();
            console.log(`    ✓ Initial release processed in block ${receipt.blockNumber}`);
            
            // Get release amount from events
            const events = receipt.events?.filter(e => e.event === 'InitialReleaseProcessed');
            if (events && events.length > 0) {
                const releaseAmount = events[0].args.releasedAmount;
                console.log(`    Released Amount: ${ethers.utils.formatEther(releaseAmount)} SYL`);
            }
            
        } catch (error) {
            console.error(`    ✗ Failed to process initial release for ${admin.name}: ${error.message}`);
            throw error;
        }
    }
}

/**
 * Remove admin wallets from fee exemption
 * Requirements: Admin wallets should pay fees and have no special privileges
 */
async function removeAdminExemptions(contract, config) {
    console.log("\n🚫 Removing Admin Wallets from Fee Exemption...");
    console.log("⚠️ Admin wallets will now pay standard 1% fees on all transactions");
    
    const adminWallets = [
        { name: 'BRK', address: config.adminWallets.brk },
        { name: 'ERH', address: config.adminWallets.erh },
        { name: 'GRK', address: config.adminWallets.grk },
        { name: 'CNK', address: config.adminWallets.cnk }
    ];
    
    for (const admin of adminWallets) {
        console.log(`\n  Removing exemption for ${admin.name}...`);
        console.log(`    Address: ${admin.address}`);
        
        try {
            // Check if wallet is currently exempt
            const isExempt = await contract.isExempt(admin.address);
            
            if (isExempt) {
                const tx = await contract.removeExemptWallet(admin.address);
                console.log(`    Transaction: ${tx.hash}`);
                
                const receipt = await tx.wait();
                console.log(`    ✓ Exemption removed in block ${receipt.blockNumber}`);
                console.log(`    💸 ${admin.name} will now pay 1% fees on all transactions`);
            } else {
                console.log(`    ℹ️ ${admin.name} was already non-exempt`);
            }
            
        } catch (error) {
            console.error(`    ✗ Failed to remove exemption for ${admin.name}: ${error.message}`);
            // Continue with other admins even if one fails
        }
    }
    
    console.log("\n✅ Admin exemption removal completed");
    console.log("📊 Admin wallets are now standard users:");
    console.log("   - Pay 1% fee on all transactions");
    console.log("   - No admin privileges or approvals");
    console.log("   - Standard user-level authority");
}

/**
 * Distribute tokens according to allocation
 */
async function distributeTokens(contract, config) {
    console.log("\n📊 Distributing Tokens According to Allocation...");
    
    const distributions = [
        { name: 'Founder', address: config.founderWallet, amount: config.allocations.founder },
        { name: 'Sylvan Token', address: config.sylvanTokenWallet, amount: config.allocations.sylvanToken }
    ];
    
    for (const dist of distributions) {
        console.log(`\n  Distributing to ${dist.name}...`);
        console.log(`    Address: ${dist.address}`);
        console.log(`    Amount: ${ethers.utils.formatEther(ethers.utils.parseEther(dist.amount))} SYL`);
        
        try {
            const tx = await contract.transfer(dist.address, ethers.utils.parseEther(dist.amount));
            console.log(`    Transaction: ${tx.hash}`);
            
            const receipt = await tx.wait();
            console.log(`    ✓ Distribution completed in block ${receipt.blockNumber}`);
            
        } catch (error) {
            console.error(`    ✗ Failed to distribute to ${dist.name}: ${error.message}`);
            throw error;
        }
    }
}

/**
 * Verify final deployment configuration
 */
async function verifyDeployment(contract, config) {
    console.log("\n🔍 Verifying Final Deployment Configuration...");
    
    // Verify contract information
    console.log("\n📋 Contract Information:");
    console.log(`  Contract Address: ${contract.address}`);
    console.log(`  Total Supply: ${ethers.utils.formatEther(await contract.totalSupply())} SYL`);
    console.log(`  Owner: ${await contract.owner()}`);
    console.log(`  Fee Wallet: ${await contract.feeWallet()}`);
    console.log(`  Donation Wallet: ${await contract.donationWallet()}`);
    
    // Verify exemption status
    console.log("\n🚫 Exemption Status:");
    const exemptWallets = await contract.getExemptWallets();
    const exemptCount = await contract.getExemptWalletCount();
    console.log(`  Total exempt wallets: ${exemptCount}`);
    
    // Verify admin configurations
    console.log("\n🔒 Admin Wallet Configurations:");
    const adminWallets = Object.entries(config.adminWallets);
    for (const [name, address] of adminWallets) {
        const isConfigured = await contract.isAdminConfigured(address);
        const adminConfig = await contract.getAdminConfig(address);
        console.log(`  ${name.toUpperCase()}: ${isConfigured ? 'CONFIGURED ✓' : 'NOT CONFIGURED ✗'}`);
        if (isConfigured) {
            console.log(`    Total Allocation: ${ethers.utils.formatEther(adminConfig.totalAllocation)} SYL`);
            console.log(`    Immediate Released: ${adminConfig.immediateReleased ? 'YES' : 'NO'}`);
        }
    }
    
    // Verify locked wallet vesting
    console.log("\n🔐 Locked Wallet Vesting:");
    const hasVesting = await contract.hasVestingSchedule(config.lockedWallet);
    console.log(`  Locked Wallet Vesting: ${hasVesting ? 'CONFIGURED ✓' : 'NOT CONFIGURED ✗'}`);
    if (hasVesting) {
        const vestingInfo = await contract.getVestingInfo(config.lockedWallet);
        console.log(`    Total Amount: ${ethers.utils.formatEther(vestingInfo.totalAmount)} SYL`);
        console.log(`    Is Active: ${vestingInfo.isActive ? 'YES' : 'NO'}`);
    }
    
    // Verify total vested amounts
    const totalVested = await contract.getTotalVestedAmount();
    const totalReleased = await contract.getTotalReleasedAmount();
    const totalBurned = await contract.getTotalBurnedAmount();
    
    console.log("\n📊 Vesting Summary:");
    console.log(`  Total Vested: ${ethers.utils.formatEther(totalVested)} SYL`);
    console.log(`  Total Released: ${ethers.utils.formatEther(totalReleased)} SYL`);
    console.log(`  Total Burned: ${ethers.utils.formatEther(totalBurned)} SYL`);
}

/**
 * Save deployment information
 */
async function saveDeploymentInfo(contract, config, exemptionConfig) {
    const exemptWallets = await contract.getExemptWallets();
    const exemptCount = await contract.getExemptWalletCount();
    
    const deploymentInfo = {
        contractAddress: contract.address,
        deploymentBlock: contract.deployTransaction.blockNumber,
        deploymentHash: contract.deployTransaction.hash,
        deployer: (await ethers.getSigners())[0].address,
        timestamp: new Date().toISOString(),
        network: hre.network.name,
        
        configuration: {
            wallets: {
                fee: config.feeWallet,
                donation: config.donationWallet,
                founder: config.founderWallet,
                sylvanToken: config.sylvanTokenWallet,
                locked: config.lockedWallet,
                admins: config.adminWallets
            },
            allocations: config.allocations,
            lockParameters: config.lockParams
        },
        
        exemptions: {
            exemptWalletCount: exemptCount,
            exemptWallets: exemptWallets,
            autoLoadExemptions: exemptionConfig.autoLoad,
            validateConfig: exemptionConfig.validateConfig
        },
        
        adminConfigurations: {},
        vestingConfiguration: {
            lockedWallet: config.lockedWallet,
            totalVested: ethers.utils.formatEther(await contract.getTotalVestedAmount()),
            totalReleased: ethers.utils.formatEther(await contract.getTotalReleasedAmount()),
            totalBurned: ethers.utils.formatEther(await contract.getTotalBurnedAmount())
        }
    };
    
    // Add admin configuration details
    for (const [name, address] of Object.entries(config.adminWallets)) {
        const adminConfig = await contract.getAdminConfig(address);
        // Monthly release is calculated dynamically (5% of total allocation)
        const monthlyRelease = adminConfig.totalAllocation.mul(500).div(10000);
        deploymentInfo.adminConfigurations[name] = {
            address: address,
            totalAllocation: ethers.utils.formatEther(adminConfig.totalAllocation),
            immediateRelease: ethers.utils.formatEther(adminConfig.immediateRelease),
            lockedAmount: ethers.utils.formatEther(adminConfig.lockedAmount),
            monthlyRelease: ethers.utils.formatEther(monthlyRelease),
            immediateReleased: adminConfig.immediateReleased
        };
    }
    
    // Write deployment info to file
    const fs = require('fs');
    const deploymentFile = `deployments/enhanced-complete-deployment-${hre.network.name}.json`;
    fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
    console.log(`\n💾 Deployment information saved to: ${deploymentFile}`);
    
    return deploymentInfo;
}

// Error handling wrapper
async function deployWithErrorHandling() {
    try {
        return await main();
    } catch (error) {
        console.error("\n❌ Enhanced Complete Deployment failed:");
        console.error(error.message);
        
        if (error.code === 'INSUFFICIENT_FUNDS') {
            console.error("\n💡 Suggestion: Ensure the deployer account has sufficient ETH for gas fees");
        } else if (error.code === 'NETWORK_ERROR') {
            console.error("\n💡 Suggestion: Check your network connection and RPC endpoint");
        } else if (error.message.includes('revert')) {
            console.error("\n💡 Suggestion: Check contract constructor parameters and requirements");
        } else if (error.message.includes('already configured')) {
            console.error("\n💡 Suggestion: Admin wallet may already be configured, check deployment state");
        }
        
        process.exit(1);
    }
}

// Execute deployment if script is run directly
if (require.main === module) {
    deployWithErrorHandling();
}

module.exports = { main, deployWithErrorHandling };
