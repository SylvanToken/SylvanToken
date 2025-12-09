const hre = require("hardhat");
const { ethers } = hre;
const deploymentConfig = require("../../config/deployment.config.js");
const securityConfig = require("../../config/security.config.js");
require("dotenv").config();

/**
 * @title Multi-Signature Pause Mechanism Deployment Script
 * @dev Deploy or upgrade SylvanToken with decentralized pause mechanism
 * @notice Addresses Security Audit Issue #3 (Medium): "The owner can lock token transfer"
 * Requirements: 5.1, 5.2, 5.3, 5.4, 5.5
 */

/**
 * Main deployment function
 */
async function main() {
    console.log("🚀 Multi-Signature Pause Mechanism Deployment");
    console.log("=".repeat(70));

    const [deployer] = await ethers.getSigners();
    console.log("Deploying with account:", deployer.address);
    console.log("Account balance:", ethers.utils.formatEther(await deployer.getBalance()), "BNB");

    // Load and validate configuration
    const config = loadMultiSigConfig();
    validateMultiSigConfig(config);

    console.log("\n📋 Multi-Sig Pause Configuration:");
    displayMultiSigConfig(config);

    // Check if this is a new deployment or upgrade
    const deploymentMode = process.env.DEPLOYMENT_MODE || "new"; // "new" or "upgrade"
    
    if (deploymentMode === "new") {
        // Deploy new contract with multi-sig pause
        return await deployNewContract(config, deployer);
    } else if (deploymentMode === "upgrade") {
        // Upgrade existing contract to use multi-sig pause
        return await upgradeExistingContract(config, deployer);
    } else {
        throw new Error(`Invalid deployment mode: ${deploymentMode}. Use "new" or "upgrade"`);
    }
}

/**
 * Load multi-sig pause configuration
 * Requirements: 5.1, 5.2, 5.3, 5.4
 */
function loadMultiSigConfig() {
    const multiSigConfig = deploymentConfig.multiSigPause;
    
    if (!multiSigConfig || !multiSigConfig.deploymentConfig.enabled) {
        throw new Error("Multi-sig pause mechanism is not enabled in deployment config");
    }

    // Extract configuration
    const config = {
        // Authorized signers
        authorizedSigners: multiSigConfig.authorizedSigners.map(s => s.address),
        
        // Parameters
        quorumThreshold: multiSigConfig.parameters.quorumThreshold,
        timelockDuration: multiSigConfig.parameters.timelockDuration,
        maxPauseDuration: multiSigConfig.parameters.maxPauseDuration,
        proposalLifetime: multiSigConfig.parameters.proposalLifetime,
        proposalCooldown: multiSigConfig.parameters.proposalCooldown,
        
        // Bounds for validation
        bounds: multiSigConfig.parameters.bounds,
        
        // Deployment settings
        deploymentSettings: multiSigConfig.deploymentConfig,
        
        // Security settings
        security: multiSigConfig.security,
        
        // Network
        network: hre.network.name
    };

    return config;
}

/**
 * Validate multi-sig configuration
 * Requirements: 5.5
 */
function validateMultiSigConfig(config) {
    console.log("\n🔍 Validating Multi-Sig Configuration...");
    
    // Validate authorized signers
    if (!config.authorizedSigners || config.authorizedSigners.length === 0) {
        throw new Error("No authorized signers configured");
    }
    
    if (config.authorizedSigners.length < config.bounds.minSigners) {
        throw new Error(`Insufficient signers: ${config.authorizedSigners.length} < ${config.bounds.minSigners}`);
    }
    
    if (config.authorizedSigners.length > config.bounds.maxSigners) {
        throw new Error(`Too many signers: ${config.authorizedSigners.length} > ${config.bounds.maxSigners}`);
    }
    
    // Validate all signer addresses
    for (const signer of config.authorizedSigners) {
        if (!signer || !ethers.utils.isAddress(signer)) {
            throw new Error(`Invalid signer address: ${signer}`);
        }
        if (signer === ethers.constants.AddressZero) {
            throw new Error("Cannot use zero address as signer");
        }
    }
    
    // Check for duplicate signers
    const uniqueSigners = new Set(config.authorizedSigners);
    if (uniqueSigners.size !== config.authorizedSigners.length) {
        throw new Error("Duplicate signer addresses detected");
    }
    
    // Validate quorum threshold
    if (config.quorumThreshold < 2) {
        throw new Error(`Quorum threshold too low: ${config.quorumThreshold} < 2`);
    }
    
    if (config.quorumThreshold > config.authorizedSigners.length) {
        throw new Error(`Quorum threshold exceeds signer count: ${config.quorumThreshold} > ${config.authorizedSigners.length}`);
    }
    
    // Validate timelock duration
    if (config.timelockDuration < config.bounds.minTimelock) {
        throw new Error(`Timelock duration too short: ${config.timelockDuration} < ${config.bounds.minTimelock}`);
    }
    
    if (config.timelockDuration > config.bounds.maxTimelock) {
        throw new Error(`Timelock duration too long: ${config.timelockDuration} > ${config.bounds.maxTimelock}`);
    }
    
    // Validate max pause duration
    if (config.maxPauseDuration < config.bounds.minMaxPauseDuration) {
        throw new Error(`Max pause duration too short: ${config.maxPauseDuration} < ${config.bounds.minMaxPauseDuration}`);
    }
    
    if (config.maxPauseDuration > config.bounds.maxMaxPauseDuration) {
        throw new Error(`Max pause duration too long: ${config.maxPauseDuration} > ${config.bounds.maxMaxPauseDuration}`);
    }
    
    // Validate proposal lifetime
    if (config.proposalLifetime < config.bounds.minProposalLifetime) {
        throw new Error(`Proposal lifetime too short: ${config.proposalLifetime} < ${config.bounds.minProposalLifetime}`);
    }
    
    if (config.proposalLifetime > config.bounds.maxProposalLifetime) {
        throw new Error(`Proposal lifetime too long: ${config.proposalLifetime} > ${config.bounds.maxProposalLifetime}`);
    }
    
    // Validate proposal cooldown
    if (config.proposalCooldown < config.bounds.minProposalCooldown) {
        throw new Error(`Proposal cooldown too short: ${config.proposalCooldown} < ${config.bounds.minProposalCooldown}`);
    }
    
    if (config.proposalCooldown > config.bounds.maxProposalCooldown) {
        throw new Error(`Proposal cooldown too long: ${config.proposalCooldown} > ${config.bounds.maxProposalCooldown}`);
    }
    
    console.log("✓ Multi-sig configuration validation passed");
}

/**
 * Display multi-sig configuration
 */
function displayMultiSigConfig(config) {
    console.log(`  Network: ${config.network}`);
    console.log(`  Authorized Signers (${config.authorizedSigners.length}):`);
    config.authorizedSigners.forEach((signer, index) => {
        console.log(`    ${index + 1}. ${signer}`);
    });
    
    console.log(`\n  Parameters:`);
    console.log(`    Quorum Threshold: ${config.quorumThreshold} of ${config.authorizedSigners.length} signers`);
    console.log(`    Timelock Duration: ${config.timelockDuration}s (${config.timelockDuration / 3600}h)`);
    console.log(`    Max Pause Duration: ${config.maxPauseDuration}s (${config.maxPauseDuration / 86400}d)`);
    console.log(`    Proposal Lifetime: ${config.proposalLifetime}s (${config.proposalLifetime / 86400}d)`);
    console.log(`    Proposal Cooldown: ${config.proposalCooldown}s (${config.proposalCooldown / 3600}h)`);
    
    console.log(`\n  Security Features:`);
    console.log(`    Multiple Approvals Required: ${config.security.requireMultipleApprovals ? 'YES' : 'NO'}`);
    console.log(`    Timelock Enforced: ${config.security.enforceTimelock ? 'YES' : 'NO'}`);
    console.log(`    Emergency Bypass Allowed: ${config.security.allowEmergencyBypass ? 'YES' : 'NO'}`);
    console.log(`    Auto-Unpause Enabled: ${config.security.autoUnpauseEnabled ? 'YES' : 'NO'}`);
    console.log(`    Proposal Expiration: ${config.security.proposalExpirationEnabled ? 'YES' : 'NO'}`);
}

/**
 * Deploy new contract with multi-sig pause
 * Requirements: 5.1, 5.2, 5.3, 5.4, 5.5
 */
async function deployNewContract(config, deployer) {
    console.log("\n🔨 Deploying New Contract with Multi-Sig Pause...");
    
    // Deploy libraries first
    console.log("\n📚 Deploying required libraries...");
    const libraries = await deployLibraries();
    
    // Get wallet addresses from deployment config
    const feeWallet = deploymentConfig.wallets.system.fee.address;
    const donationWallet = deploymentConfig.wallets.system.donation.address;
    
    // Prepare initial exempt accounts (only technical exemptions)
    const initialExemptAccounts = [
        feeWallet,
        donationWallet,
        ethers.constants.AddressZero // Will be replaced with actual burn address
    ].filter(addr => addr && ethers.utils.isAddress(addr));
    
    console.log("\n🪙 Deploying SylvanToken with Multi-Sig Pause...");
    const SylvanToken = await ethers.getContractFactory("SylvanToken", {
        libraries: libraries
    });
    
    const contract = await SylvanToken.deploy(
        feeWallet,
        donationWallet,
        initialExemptAccounts
    );
    
    await contract.deployed();
    console.log("✓ SylvanToken deployed to:", contract.address);
    
    // Wait for confirmations
    console.log("⏳ Waiting for confirmations...");
    await contract.deployTransaction.wait(3);
    
    // Initialize multi-sig pause mechanism
    await initializeMultiSigPause(contract, config);
    
    // Verify deployment
    await verifyMultiSigDeployment(contract, config);
    
    // Save deployment information
    const deploymentInfo = await saveDeploymentInfo(contract, config, libraries, "new");
    
    console.log("\n🎉 New Contract Deployment with Multi-Sig Pause Completed!");
    console.log("=".repeat(70));
    
    return {
        contract,
        deploymentInfo,
        mode: "new"
    };
}

/**
 * Upgrade existing contract to use multi-sig pause
 * Requirements: 5.1, 5.2, 5.3, 5.4
 */
async function upgradeExistingContract(config, deployer) {
    console.log("\n🔄 Upgrading Existing Contract to Multi-Sig Pause...");
    
    // Get existing contract address
    const existingAddress = process.env.EXISTING_CONTRACT_ADDRESS;
    if (!existingAddress || !ethers.utils.isAddress(existingAddress)) {
        throw new Error("Invalid or missing EXISTING_CONTRACT_ADDRESS in environment");
    }
    
    console.log(`  Existing Contract: ${existingAddress}`);
    
    // Attach to existing contract
    const contract = await ethers.getContractAt("SylvanToken", existingAddress);
    
    // Verify contract owner
    const owner = await contract.owner();
    console.log(`  Current Owner: ${owner}`);
    console.log(`  Deployer: ${deployer.address}`);
    
    if (owner.toLowerCase() !== deployer.address.toLowerCase()) {
        throw new Error("Deployer is not the contract owner. Cannot upgrade.");
    }
    
    // Check if contract already has multi-sig pause
    try {
        const existingSigners = await contract.getAuthorizedSigners();
        if (existingSigners.length > 0) {
            console.log("⚠️  Contract already has multi-sig pause configured");
            console.log(`  Existing Signers: ${existingSigners.length}`);
            
            const proceed = process.env.FORCE_UPGRADE === "true";
            if (!proceed) {
                throw new Error("Contract already configured. Set FORCE_UPGRADE=true to reconfigure");
            }
            console.log("  Proceeding with reconfiguration (FORCE_UPGRADE=true)");
        }
    } catch (error) {
        // Contract doesn't have multi-sig pause yet, proceed with upgrade
        console.log("  Contract does not have multi-sig pause, proceeding with upgrade");
    }
    
    // Initialize multi-sig pause mechanism
    await initializeMultiSigPause(contract, config);
    
    // Verify upgrade
    await verifyMultiSigDeployment(contract, config);
    
    // Save deployment information
    const deploymentInfo = await saveDeploymentInfo(contract, config, {}, "upgrade");
    
    console.log("\n🎉 Contract Upgrade to Multi-Sig Pause Completed!");
    console.log("=".repeat(70));
    
    return {
        contract,
        deploymentInfo,
        mode: "upgrade"
    };
}

/**
 * Deploy required libraries
 */
async function deployLibraries() {
    const libraries = {};
    
    // Deploy WalletManager library
    const WalletManager = await ethers.getContractFactory("contracts/libraries/WalletManager.sol:WalletManager");
    const walletManager = await WalletManager.deploy();
    await walletManager.deployed();
    libraries.WalletManager = walletManager.address;
    console.log("✓ WalletManager library deployed to:", walletManager.address);
    
    // Deploy MultiSigPauseManager library
    const MultiSigPauseManager = await ethers.getContractFactory("contracts/libraries/MultiSigPauseManager.sol:MultiSigPauseManager");
    const multiSigPauseManager = await MultiSigPauseManager.deploy();
    await multiSigPauseManager.deployed();
    libraries.MultiSigPauseManager = multiSigPauseManager.address;
    console.log("✓ MultiSigPauseManager library deployed to:", multiSigPauseManager.address);
    
    return libraries;
}

/**
 * Initialize multi-sig pause mechanism
 * Requirements: 5.1, 5.2, 5.3, 5.4
 */
async function initializeMultiSigPause(contract, config) {
    console.log("\n🔧 Initializing Multi-Sig Pause Mechanism...");
    
    // Initialize multi-sig configuration
    console.log("\n  Step 1: Initializing multi-sig configuration...");
    try {
        const tx = await contract.initializeMultiSigPause(
            config.authorizedSigners,
            config.quorumThreshold,
            config.timelockDuration,
            config.maxPauseDuration,
            config.proposalLifetime,
            config.proposalCooldown
        );
        
        console.log(`    Transaction: ${tx.hash}`);
        const receipt = await tx.wait();
        console.log(`    ✓ Multi-sig pause initialized in block ${receipt.blockNumber}`);
        
    } catch (error) {
        console.error(`    ✗ Failed to initialize multi-sig pause: ${error.message}`);
        throw error;
    }
    
    // Verify initialization
    console.log("\n  Step 2: Verifying initialization...");
    const multiSigConfig = await contract.getMultiSigConfig();
    console.log(`    Authorized Signers: ${multiSigConfig.authorizedSigners.length}`);
    console.log(`    Quorum Threshold: ${multiSigConfig.quorumThreshold}`);
    console.log(`    Timelock Duration: ${multiSigConfig.timelockDuration}s`);
    console.log(`    Max Pause Duration: ${multiSigConfig.maxPauseDuration}s`);
    
    console.log("\n✓ Multi-sig pause mechanism initialized successfully");
}

/**
 * Verify multi-sig deployment
 */
async function verifyMultiSigDeployment(contract, config) {
    console.log("\n🔍 Verifying Multi-Sig Pause Deployment...");
    
    // Get multi-sig configuration
    const multiSigConfig = await contract.getMultiSigConfig();
    
    // Verify authorized signers
    console.log("\n  Authorized Signers:");
    const signers = await contract.getAuthorizedSigners();
    if (signers.length !== config.authorizedSigners.length) {
        throw new Error(`Signer count mismatch: ${signers.length} != ${config.authorizedSigners.length}`);
    }
    
    for (let i = 0; i < signers.length; i++) {
        console.log(`    ${i + 1}. ${signers[i]}`);
        if (signers[i].toLowerCase() !== config.authorizedSigners[i].toLowerCase()) {
            throw new Error(`Signer mismatch at index ${i}`);
        }
        
        // Verify signer is authorized
        const isAuthorized = await contract.isAuthorizedSigner(signers[i]);
        if (!isAuthorized) {
            throw new Error(`Signer ${signers[i]} is not authorized`);
        }
    }
    console.log(`    ✓ All ${signers.length} signers verified`);
    
    // Verify parameters
    console.log("\n  Parameters:");
    console.log(`    Quorum Threshold: ${multiSigConfig.quorumThreshold} (expected: ${config.quorumThreshold})`);
    if (multiSigConfig.quorumThreshold.toString() !== config.quorumThreshold.toString()) {
        throw new Error("Quorum threshold mismatch");
    }
    
    console.log(`    Timelock Duration: ${multiSigConfig.timelockDuration}s (expected: ${config.timelockDuration}s)`);
    if (multiSigConfig.timelockDuration.toString() !== config.timelockDuration.toString()) {
        throw new Error("Timelock duration mismatch");
    }
    
    console.log(`    Max Pause Duration: ${multiSigConfig.maxPauseDuration}s (expected: ${config.maxPauseDuration}s)`);
    if (multiSigConfig.maxPauseDuration.toString() !== config.maxPauseDuration.toString()) {
        throw new Error("Max pause duration mismatch");
    }
    
    console.log("\n✓ Multi-sig pause deployment verification passed");
}

/**
 * Save deployment information
 */
async function saveDeploymentInfo(contract, config, libraries, mode) {
    const fs = require('fs');
    
    const deploymentInfo = {
        mode: mode,
        contractAddress: contract.address,
        deploymentBlock: contract.deployTransaction?.blockNumber || "N/A",
        deploymentHash: contract.deployTransaction?.hash || "N/A",
        deployer: (await ethers.getSigners())[0].address,
        timestamp: new Date().toISOString(),
        network: hre.network.name,
        
        multiSigPause: {
            enabled: true,
            authorizedSigners: config.authorizedSigners,
            quorumThreshold: config.quorumThreshold,
            timelockDuration: config.timelockDuration,
            maxPauseDuration: config.maxPauseDuration,
            proposalLifetime: config.proposalLifetime,
            proposalCooldown: config.proposalCooldown,
            security: config.security
        },
        
        libraries: libraries,
        
        verification: {
            verified: false,
            verificationDate: null,
            bscscanUrl: null
        }
    };
    
    // Write deployment info to file
    const deploymentFile = `deployments/multisig-pause-deployment-${hre.network.name}-${Date.now()}.json`;
    fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
    console.log(`\n💾 Deployment information saved to: ${deploymentFile}`);
    
    return deploymentInfo;
}

/**
 * Error handling wrapper
 */
async function deployWithErrorHandling() {
    try {
        return await main();
    } catch (error) {
        console.error("\n❌ Multi-Sig Pause Deployment failed:");
        console.error(error.message);
        
        if (error.code === 'INSUFFICIENT_FUNDS') {
            console.error("\n💡 Suggestion: Ensure the deployer account has sufficient BNB for gas fees");
        } else if (error.code === 'NETWORK_ERROR') {
            console.error("\n💡 Suggestion: Check your network connection and RPC endpoint");
        } else if (error.message.includes('revert')) {
            console.error("\n💡 Suggestion: Check contract parameters and requirements");
        } else if (error.message.includes('signer')) {
            console.error("\n💡 Suggestion: Verify authorized signer addresses in config");
        } else if (error.message.includes('quorum')) {
            console.error("\n💡 Suggestion: Ensure quorum threshold is valid for signer count");
        }
        
        process.exit(1);
    }
}

// Execute deployment if script is run directly
if (require.main === module) {
    deployWithErrorHandling();
}

module.exports = { 
    main, 
    deployWithErrorHandling,
    loadMultiSigConfig,
    validateMultiSigConfig,
    deployNewContract,
    upgradeExistingContract
};
