const hre = require("hardhat");
const { ethers } = hre;
const deploymentConfig = require("../../config/deployment.config.js");
const securityConfig = require("../../config/security.config.js");
const environmentConfig = require("../../config/environment.config.js");
const fs = require("fs");
const path = require("path");

/**
 * @title Local Deployment Script
 * @dev Deploy SylvanToken to localhost network for testing
 * Requirements: 3.1, 3.2, 3.3, 3.5
 */

async function main() {
    console.log("🚀 Local Deployment - Enhanced Sylvan Token");
    console.log("=".repeat(70));

    const startTime = Date.now();
    const [deployer] = await ethers.getSigners();
    
    console.log("📋 Deployment Information:");
    console.log(`  Network: ${hre.network.name}`);
    console.log(`  Deployer: ${deployer.address}`);
    console.log(`  Balance: ${ethers.utils.formatEther(await deployer.getBalance())} ETH`);
    console.log(`  Timestamp: ${new Date().toISOString()}`);

    // Load configuration
    const config = loadConfiguration();
    displayConfiguration(config);

    // Deploy libraries
    console.log("\n📚 Deploying Libraries...");
    const libraries = await deployAllLibraries();
    
    // Deploy main contract
    console.log("\n🪙 Deploying SylvanToken...");
    const token = await deployMainContract(config, libraries);
    
    // Configure contract
    console.log("\n⚙️ Configuring Contract...");
    await configureContract(token, config);
    
    // Validate deployment
    console.log("\n🔍 Validating Deployment...");
    const validation = await validateDeployment(token, config);
    
    // Calculate gas costs
    const gasCosts = await calculateGasCosts(token, libraries);
    
    // Generate deployment report
    const deploymentTime = Date.now() - startTime;
    const report = generateDeploymentReport(token, libraries, config, validation, gasCosts, deploymentTime);
    
    // Save deployment report
    saveDeploymentReport(report);
    
    console.log("\n🎉 Local Deployment Completed Successfully!");
    console.log(`⏱️  Total Time: ${(deploymentTime / 1000).toFixed(2)}s`);
    console.log("=".repeat(70));

    return {
        token,
        libraries,
        report
    };
}

/**
 * Load and validate configuration from config files
 */
function loadConfiguration() {
    console.log("\n📋 Loading Configuration...");
    
    // Validate environment configuration
    try {
        environmentConfig.validateConfiguration();
        console.log("  ✓ Environment configuration validated");
    } catch (error) {
        console.warn(`  ⚠️ Environment validation warning: ${error.message}`);
    }
    
    const config = {
        // System wallets
        feeWallet: deploymentConfig.wallets.system.fee.address,
        donationWallet: deploymentConfig.wallets.system.donation.address,
        founderWallet: deploymentConfig.wallets.system.founder.address,
        sylvanTokenWallet: deploymentConfig.wallets.system.sylvanToken.address,
        lockedWallet: deploymentConfig.wallets.system.locked.address,
        
        // Admin wallets - extract addresses from admins object
        adminWallets: {
            mad: deploymentConfig.wallets.admins.mad.address,
            leb: deploymentConfig.wallets.admins.leb.address,
            cnk: deploymentConfig.wallets.admins.cnk.address,
            kdr: deploymentConfig.wallets.admins.kdr.address
        },
        
        // Token allocations
        allocations: {
            founder: deploymentConfig.allocations.founder,
            sylvanToken: deploymentConfig.allocations.sylvanToken,
            locked: deploymentConfig.allocations.locked,
            adminMad: deploymentConfig.allocations.admins.mad,
            adminLeb: deploymentConfig.allocations.admins.leb,
            adminCnk: deploymentConfig.allocations.admins.cnk,
            adminKdr: deploymentConfig.allocations.admins.kdr
        },
        
        // Lock parameters
        lockParams: deploymentConfig.lockParameters,
        
        // Security parameters
        security: securityConfig
    };
    
    // Validate addresses
    validateAddresses(config);
    
    console.log("  ✓ Configuration loaded successfully");
    return config;
}

/**
 * Validate all wallet addresses
 */
function validateAddresses(config) {
    const requiredWallets = [
        { name: 'Fee Wallet', address: config.feeWallet },
        { name: 'Donation Wallet', address: config.donationWallet },
        { name: 'Founder Wallet', address: config.founderWallet },
        { name: 'Sylvan Token Wallet', address: config.sylvanTokenWallet },
        { name: 'Locked Wallet', address: config.lockedWallet }
    ];
    
    for (const wallet of requiredWallets) {
        if (!wallet.address || !ethers.utils.isAddress(wallet.address)) {
            throw new Error(`Invalid ${wallet.name} address: ${wallet.address}`);
        }
    }
    
    // Validate admin wallets
    for (const [name, address] of Object.entries(config.adminWallets)) {
        if (!address || !ethers.utils.isAddress(address)) {
            throw new Error(`Invalid admin wallet address for ${name}: ${address}`);
        }
    }
}

/**
 * Display configuration for verification
 */
function displayConfiguration(config) {
    console.log("\n📝 Deployment Configuration:");
    console.log("\n  System Wallets:");
    console.log(`    Fee: ${config.feeWallet}`);
    console.log(`    Donation: ${config.donationWallet}`);
    console.log(`    Founder: ${config.founderWallet}`);
    console.log(`    Sylvan Token: ${config.sylvanTokenWallet}`);
    console.log(`    Locked: ${config.lockedWallet}`);
    
    console.log("\n  Admin Wallets:");
    Object.entries(config.adminWallets).forEach(([name, address]) => {
        console.log(`    ${name.toUpperCase()}: ${address}`);
    });
    
    console.log("\n  Token Allocations:");
    console.log(`    Total Supply: 1,000,000,000 SYL`);
    console.log(`    Founder: ${config.allocations.founder} SYL`);
    console.log(`    Sylvan Token: ${config.allocations.sylvanToken} SYL`);
    console.log(`    Locked: ${config.allocations.locked} SYL`);
    console.log(`    Admin (each): ${config.allocations.adminMad} SYL`);
}

/**
 * Deploy all required libraries
 * Requirements: 3.2 - Library deployment and linking
 */
async function deployAllLibraries() {
    const libraries = {};
    let totalGasUsed = ethers.BigNumber.from(0);
    
    // Deploy WalletManager library
    console.log("  Deploying WalletManager...");
    const WalletManager = await ethers.getContractFactory("contracts/libraries/WalletManager.sol:WalletManager");
    const walletManager = await WalletManager.deploy();
    await walletManager.deployed();
    
    const wmReceipt = await walletManager.deployTransaction.wait();
    totalGasUsed = totalGasUsed.add(wmReceipt.gasUsed);
    
    libraries.WalletManager = walletManager.address;
    console.log(`    ✓ WalletManager: ${walletManager.address}`);
    console.log(`    Gas Used: ${wmReceipt.gasUsed.toString()}`);
    
    console.log(`\n  ✓ All libraries deployed`);
    console.log(`  Total Gas Used: ${totalGasUsed.toString()}`);
    
    return libraries;
}

/**
 * Deploy main contract with library linking
 * Requirements: 3.1, 3.2 - Contract deployment with libraries
 */
async function deployMainContract(config, libraries) {
    // Prepare initial exempt accounts (system wallets only, no admin wallets)
    const initialExemptAccounts = [
        config.founderWallet,
        config.sylvanTokenWallet,
        config.lockedWallet
    ].filter(addr => addr && ethers.utils.isAddress(addr));
    
    console.log(`  Initial Exempt Accounts: ${initialExemptAccounts.length}`);
    initialExemptAccounts.forEach(addr => console.log(`    ${addr}`));
    
    // Deploy contract with library linking
    const SylvanToken = await ethers.getContractFactory("SylvanToken", {
        libraries: libraries
    });
    
    const token = await SylvanToken.deploy(
        config.feeWallet,
        config.donationWallet,
        initialExemptAccounts
    );
    
    await token.deployed();
    const receipt = await token.deployTransaction.wait();
    
    console.log(`  ✓ SylvanToken: ${token.address}`);
    console.log(`  Block Number: ${receipt.blockNumber}`);
    console.log(`  Gas Used: ${receipt.gasUsed.toString()}`);
    console.log(`  Transaction Hash: ${receipt.transactionHash}`);
    
    return token;
}

/**
 * Configure contract with initial settings
 * Requirements: 3.3 - Initial configuration
 */
async function configureContract(token, config) {
    let configSteps = 0;
    
    // Configure admin wallets
    console.log("\n  Configuring Admin Wallets...");
    const adminConfigs = [
        { name: 'MAD', address: config.adminWallets.mad, allocation: config.allocations.adminMad },
        { name: 'LEB', address: config.adminWallets.leb, allocation: config.allocations.adminLeb },
        { name: 'CNK', address: config.adminWallets.cnk, allocation: config.allocations.adminCnk },
        { name: 'KDR', address: config.adminWallets.kdr, allocation: config.allocations.adminKdr }
    ];
    
    for (const admin of adminConfigs) {
        const tx = await token.configureAdminWallet(
            admin.address,
            ethers.utils.parseEther(admin.allocation)
        );
        await tx.wait();
        console.log(`    ✓ ${admin.name} configured`);
        configSteps++;
    }
    
    // Configure locked wallet vesting
    console.log("\n  Configuring Locked Wallet Vesting...");
    const lockedTx = await token.createVestingSchedule(
        config.lockedWallet,
        ethers.utils.parseEther(config.allocations.locked),
        parseInt(config.lockParams.locked.cliffDays),
        parseInt(config.lockParams.locked.durationMonths),
        parseInt(config.lockParams.locked.monthlyRelease),
        parseInt(config.lockParams.locked.burnPercentage),
        false // isAdmin = false
    );
    await lockedTx.wait();
    console.log(`    ✓ Locked wallet vesting configured`);
    configSteps++;
    
    // Process initial releases for admin wallets
    console.log("\n  Processing Initial Releases...");
    for (const admin of adminConfigs) {
        const tx = await token.processInitialRelease(admin.address);
        await tx.wait();
        console.log(`    ✓ ${admin.name} initial release processed`);
        configSteps++;
    }
    
    // Distribute tokens
    console.log("\n  Distributing Tokens...");
    const distributions = [
        { name: 'Founder', address: config.founderWallet, amount: config.allocations.founder },
        { name: 'Sylvan Token', address: config.sylvanTokenWallet, amount: config.allocations.sylvanToken }
    ];
    
    for (const dist of distributions) {
        const tx = await token.transfer(dist.address, ethers.utils.parseEther(dist.amount));
        await tx.wait();
        console.log(`    ✓ ${dist.name} tokens distributed`);
        configSteps++;
    }
    
    console.log(`\n  ✓ Configuration completed (${configSteps} steps)`);
}

/**
 * Validate deployment configuration
 * Requirements: 3.4, 3.5 - Deployment validation
 */
async function validateDeployment(token, config) {
    const validation = {
        passed: true,
        checks: [],
        errors: []
    };
    
    // Check 1: Contract deployed
    console.log("  Checking contract deployment...");
    try {
        const code = await ethers.provider.getCode(token.address);
        if (code === "0x") {
            throw new Error("No contract code at address");
        }
        validation.checks.push({ name: "Contract Deployed", status: "✓" });
    } catch (error) {
        validation.passed = false;
        validation.errors.push(`Contract deployment: ${error.message}`);
        validation.checks.push({ name: "Contract Deployed", status: "✗" });
    }
    
    // Check 2: Total supply
    console.log("  Checking total supply...");
    try {
        const totalSupply = await token.totalSupply();
        const expectedSupply = ethers.utils.parseEther("1000000000");
        if (!totalSupply.eq(expectedSupply)) {
            throw new Error(`Expected ${ethers.utils.formatEther(expectedSupply)}, got ${ethers.utils.formatEther(totalSupply)}`);
        }
        validation.checks.push({ name: "Total Supply", status: "✓", value: "1,000,000,000 SYL" });
    } catch (error) {
        validation.passed = false;
        validation.errors.push(`Total supply: ${error.message}`);
        validation.checks.push({ name: "Total Supply", status: "✗" });
    }
    
    // Check 3: Fee wallet configured
    console.log("  Checking fee wallet...");
    try {
        const feeWallet = await token.feeWallet();
        if (feeWallet !== config.feeWallet) {
            throw new Error(`Expected ${config.feeWallet}, got ${feeWallet}`);
        }
        validation.checks.push({ name: "Fee Wallet", status: "✓", value: feeWallet });
    } catch (error) {
        validation.passed = false;
        validation.errors.push(`Fee wallet: ${error.message}`);
        validation.checks.push({ name: "Fee Wallet", status: "✗" });
    }
    
    // Check 4: Donation wallet configured
    console.log("  Checking donation wallet...");
    try {
        const donationWallet = await token.donationWallet();
        if (donationWallet !== config.donationWallet) {
            throw new Error(`Expected ${config.donationWallet}, got ${donationWallet}`);
        }
        validation.checks.push({ name: "Donation Wallet", status: "✓", value: donationWallet });
    } catch (error) {
        validation.passed = false;
        validation.errors.push(`Donation wallet: ${error.message}`);
        validation.checks.push({ name: "Donation Wallet", status: "✗" });
    }
    
    // Check 5: Exemptions configured
    console.log("  Checking exemptions...");
    try {
        const exemptCount = await token.getExemptWalletCount();
        if (exemptCount.lt(3)) {
            throw new Error(`Expected at least 3 exempt wallets, got ${exemptCount}`);
        }
        validation.checks.push({ name: "Exempt Wallets", status: "✓", value: exemptCount.toString() });
    } catch (error) {
        validation.passed = false;
        validation.errors.push(`Exemptions: ${error.message}`);
        validation.checks.push({ name: "Exempt Wallets", status: "✗" });
    }
    
    // Check 6: Admin wallets configured
    console.log("  Checking admin wallets...");
    try {
        let adminCount = 0;
        for (const [name, address] of Object.entries(config.adminWallets)) {
            const isConfigured = await token.isAdminConfigured(address);
            if (isConfigured) {
                adminCount++;
            }
        }
        if (adminCount !== 4) {
            throw new Error(`Expected 4 admin wallets, got ${adminCount}`);
        }
        validation.checks.push({ name: "Admin Wallets", status: "✓", value: `${adminCount} configured` });
    } catch (error) {
        validation.passed = false;
        validation.errors.push(`Admin wallets: ${error.message}`);
        validation.checks.push({ name: "Admin Wallets", status: "✗" });
    }
    
    // Check 7: Locked wallet vesting
    console.log("  Checking locked wallet vesting...");
    try {
        const hasVesting = await token.hasVestingSchedule(config.lockedWallet);
        if (!hasVesting) {
            throw new Error("Locked wallet vesting not configured");
        }
        validation.checks.push({ name: "Locked Wallet Vesting", status: "✓" });
    } catch (error) {
        validation.passed = false;
        validation.errors.push(`Locked wallet vesting: ${error.message}`);
        validation.checks.push({ name: "Locked Wallet Vesting", status: "✗" });
    }
    
    // Display validation results
    console.log("\n  Validation Results:");
    validation.checks.forEach(check => {
        const value = check.value ? ` (${check.value})` : '';
        console.log(`    ${check.status} ${check.name}${value}`);
    });
    
    if (!validation.passed) {
        console.log("\n  ⚠️ Validation Errors:");
        validation.errors.forEach(error => console.log(`    - ${error}`));
    } else {
        console.log("\n  ✓ All validation checks passed");
    }
    
    return validation;
}

/**
 * Calculate gas costs for deployment
 * Requirements: 3.5 - Gas cost reporting
 */
async function calculateGasCosts(token, libraries) {
    console.log("\n💰 Calculating Gas Costs...");
    
    const gasCosts = {
        libraries: {},
        mainContract: {},
        total: ethers.BigNumber.from(0)
    };
    
    // Get library deployment costs
    for (const [name, address] of Object.entries(libraries)) {
        try {
            const contract = await ethers.getContractAt("contracts/libraries/WalletManager.sol:WalletManager", address);
            const receipt = await ethers.provider.getTransactionReceipt(contract.deployTransaction.hash);
            gasCosts.libraries[name] = {
                gasUsed: receipt.gasUsed.toString(),
                gasPrice: receipt.effectiveGasPrice.toString()
            };
            gasCosts.total = gasCosts.total.add(receipt.gasUsed);
        } catch (error) {
            console.warn(`    ⚠️ Could not get gas cost for ${name}`);
        }
    }
    
    // Get main contract deployment cost
    try {
        const receipt = await ethers.provider.getTransactionReceipt(token.deployTransaction.hash);
        gasCosts.mainContract = {
            gasUsed: receipt.gasUsed.toString(),
            gasPrice: receipt.effectiveGasPrice.toString()
        };
        gasCosts.total = gasCosts.total.add(receipt.gasUsed);
    } catch (error) {
        console.warn(`    ⚠️ Could not get gas cost for main contract`);
    }
    
    console.log(`  Total Gas Used: ${gasCosts.total.toString()}`);
    
    return gasCosts;
}

/**
 * Generate deployment report
 * Requirements: 3.5 - Deployment report generation
 */
function generateDeploymentReport(token, libraries, config, validation, gasCosts, deploymentTime) {
    const report = {
        deployment: {
            network: hre.network.name,
            timestamp: new Date().toISOString(),
            deploymentTime: `${(deploymentTime / 1000).toFixed(2)}s`,
            deployer: token.deployTransaction.from,
            blockNumber: token.deployTransaction.blockNumber
        },
        
        contracts: {
            token: {
                address: token.address,
                transactionHash: token.deployTransaction.hash,
                gasUsed: gasCosts.mainContract.gasUsed || "N/A"
            },
            libraries: {}
        },
        
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
        
        validation: {
            passed: validation.passed,
            checks: validation.checks,
            errors: validation.errors
        },
        
        gasCosts: {
            total: gasCosts.total.toString(),
            libraries: gasCosts.libraries,
            mainContract: gasCosts.mainContract
        }
    };
    
    // Add library details
    for (const [name, address] of Object.entries(libraries)) {
        report.contracts.libraries[name] = {
            address: address,
            gasUsed: gasCosts.libraries[name]?.gasUsed || "N/A"
        };
    }
    
    return report;
}

/**
 * Save deployment report to JSON file
 * Requirements: 3.5 - Generate deployment report JSON
 */
function saveDeploymentReport(report) {
    const deploymentsDir = path.join(__dirname, "../../deployments");
    
    // Ensure deployments directory exists
    if (!fs.existsSync(deploymentsDir)) {
        fs.mkdirSync(deploymentsDir, { recursive: true });
    }
    
    const filename = `local-deployment-${Date.now()}.json`;
    const filepath = path.join(deploymentsDir, filename);
    
    fs.writeFileSync(filepath, JSON.stringify(report, null, 2));
    
    console.log(`\n💾 Deployment Report Saved:`);
    console.log(`  File: ${filename}`);
    console.log(`  Path: ${filepath}`);
}

/**
 * Error handling wrapper
 */
async function deployWithErrorHandling() {
    try {
        return await main();
    } catch (error) {
        console.error("\n❌ Local Deployment Failed:");
        console.error(`  Error: ${error.message}`);
        
        if (error.stack) {
            console.error("\n  Stack Trace:");
            console.error(error.stack);
        }
        
        // Provide helpful suggestions
        if (error.message.includes("insufficient funds")) {
            console.error("\n💡 Suggestion: Ensure deployer account has sufficient ETH");
        } else if (error.message.includes("revert")) {
            console.error("\n💡 Suggestion: Check contract constructor parameters");
        } else if (error.message.includes("Invalid address")) {
            console.error("\n💡 Suggestion: Verify all wallet addresses in config files");
        }
        
        process.exit(1);
    }
}

// Execute deployment if script is run directly
if (require.main === module) {
    deployWithErrorHandling()
        .then(() => process.exit(0))
        .catch((error) => {
            console.error(error);
            process.exit(1);
        });
}

module.exports = { 
    main, 
    deployWithErrorHandling,
    deployAllLibraries,
    deployMainContract,
    validateDeployment
};

