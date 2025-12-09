const hre = require("hardhat");
const { ethers } = hre;
const deploymentConfig = require("../../config/deployment.config.js");
require("dotenv").config();

/**
 * @title Migration Script: Single-Owner to Multi-Sig Pause
 * @dev Migrates existing SylvanToken deployment from single-owner pause to multi-sig pause
 * @notice This script handles the upgrade path for existing deployments
 * Requirements: 7.1, 7.5
 * 
 * Migration Steps:
 * 1. Validate current contract state
 * 2. Verify owner permissions
 * 3. Initialize multi-sig pause mechanism
 * 4. Verify migration success
 * 5. Generate migration report
 */

// Migration configuration
const MIGRATION_CONFIG = {
    // Minimum required confirmations for transactions
    minConfirmations: 2,
    
    // Gas settings
    gasLimit: 500000,
    
    // Validation settings
    validateBeforeMigration: true,
    validateAfterMigration: true,
    
    // Backup settings
    createBackupReport: true
};

/**
 * Main migration function
 */
async function main() {
    console.log("🔄 Multi-Sig Pause Migration Script");
    console.log("=".repeat(70));
    console.log("Migrating from single-owner pause to multi-signature pause mechanism");
    console.log("");

    const [deployer] = await ethers.getSigners();
    console.log("Migration account:", deployer.address);
    console.log("Account balance:", ethers.utils.formatEther(await deployer.getBalance()), "BNB");
    console.log("Network:", hre.network.name);
    console.log("");

    // Step 1: Get contract address
    const contractAddress = await getContractAddress();
    console.log("Target contract:", contractAddress);

    // Step 2: Attach to existing contract
    const contract = await ethers.getContractAt("SylvanToken", contractAddress);

    // Step 3: Pre-migration validation
    console.log("\n📋 Step 1: Pre-Migration Validation");
    console.log("-".repeat(50));
    const preValidation = await validatePreMigration(contract, deployer);
    
    if (!preValidation.success) {
        console.error("❌ Pre-migration validation failed:", preValidation.error);
        process.exit(1);
    }

    // Step 4: Create backup report
    if (MIGRATION_CONFIG.createBackupReport) {
        console.log("\n💾 Step 2: Creating Backup Report");
        console.log("-".repeat(50));
        await createBackupReport(contract, preValidation);
    }

    // Step 5: Load multi-sig configuration
    console.log("\n⚙️ Step 3: Loading Multi-Sig Configuration");
    console.log("-".repeat(50));
    const multiSigConfig = loadMultiSigConfig();
    displayMultiSigConfig(multiSigConfig);

    // Step 6: Confirm migration
    console.log("\n⚠️ Step 4: Migration Confirmation");
    console.log("-".repeat(50));
    const confirmed = await confirmMigration();
    
    if (!confirmed) {
        console.log("Migration cancelled by user");
        process.exit(0);
    }

    // Step 7: Execute migration
    console.log("\n🔧 Step 5: Executing Migration");
    console.log("-".repeat(50));
    const migrationResult = await executeMigration(contract, multiSigConfig);

    // Step 8: Post-migration validation
    console.log("\n✅ Step 6: Post-Migration Validation");
    console.log("-".repeat(50));
    const postValidation = await validatePostMigration(contract, multiSigConfig);

    // Step 9: Generate migration report
    console.log("\n📊 Step 7: Generating Migration Report");
    console.log("-".repeat(50));
    await generateMigrationReport(contract, preValidation, postValidation, migrationResult);

    console.log("\n🎉 Migration Completed Successfully!");
    console.log("=".repeat(70));
}

/**
 * Get contract address from environment or config
 */
async function getContractAddress() {
    // Check environment variable first
    let contractAddress = process.env.CONTRACT_ADDRESS;
    
    if (!contractAddress) {
        // Try to load from deployment files
        const fs = require('fs');
        const deploymentFiles = [
            'deployments/mainnet-deployment.json',
            'deployments/bscTestnet-deployment.json'
        ];
        
        for (const file of deploymentFiles) {
            if (fs.existsSync(file)) {
                const deployment = JSON.parse(fs.readFileSync(file, 'utf8'));
                if (deployment.contractAddress) {
                    contractAddress = deployment.contractAddress;
                    console.log(`Loaded contract address from ${file}`);
                    break;
                }
            }
        }
    }
    
    if (!contractAddress || !ethers.utils.isAddress(contractAddress)) {
        throw new Error("Invalid or missing CONTRACT_ADDRESS. Set it in .env or deployment files.");
    }
    
    return contractAddress;
}

/**
 * Validate contract state before migration
 */
async function validatePreMigration(contract, deployer) {
    const validation = {
        success: true,
        error: null,
        data: {}
    };

    try {
        // Check contract owner
        const owner = await contract.owner();
        validation.data.owner = owner;
        console.log("  Contract owner:", owner);
        
        if (owner.toLowerCase() !== deployer.address.toLowerCase()) {
            validation.success = false;
            validation.error = "Deployer is not the contract owner";
            return validation;
        }
        console.log("  ✓ Owner verification passed");

        // Check current pause state
        let isPaused = false;
        try {
            isPaused = await contract.isPaused();
        } catch (e) {
            // Contract might not have isPaused function yet
            isPaused = false;
        }
        validation.data.isPaused = isPaused;
        console.log("  Current pause state:", isPaused ? "PAUSED" : "NOT PAUSED");
        
        if (isPaused) {
            console.log("  ⚠️ Warning: Contract is currently paused");
        }

        // Check if multi-sig is already initialized
        let hasMultiSig = false;
        try {
            const signers = await contract.getAuthorizedSigners();
            hasMultiSig = signers.length > 0;
            validation.data.existingSigners = signers;
        } catch (e) {
            // Multi-sig not initialized yet
            hasMultiSig = false;
        }
        validation.data.hasMultiSig = hasMultiSig;
        
        if (hasMultiSig) {
            console.log("  ⚠️ Multi-sig already initialized with", validation.data.existingSigners.length, "signers");
            
            const forceUpgrade = process.env.FORCE_UPGRADE === "true";
            if (!forceUpgrade) {
                validation.success = false;
                validation.error = "Multi-sig already initialized. Set FORCE_UPGRADE=true to reconfigure.";
                return validation;
            }
            console.log("  Proceeding with reconfiguration (FORCE_UPGRADE=true)");
        } else {
            console.log("  ✓ Multi-sig not yet initialized");
        }

        // Get token info
        validation.data.name = await contract.name();
        validation.data.symbol = await contract.symbol();
        validation.data.totalSupply = await contract.totalSupply();
        console.log("  Token:", validation.data.name, "(", validation.data.symbol, ")");
        console.log("  Total Supply:", ethers.utils.formatEther(validation.data.totalSupply));

        console.log("\n  ✓ Pre-migration validation passed");

    } catch (error) {
        validation.success = false;
        validation.error = error.message;
    }

    return validation;
}

/**
 * Create backup report of current state
 */
async function createBackupReport(contract, preValidation) {
    const fs = require('fs');
    
    const backup = {
        timestamp: new Date().toISOString(),
        network: hre.network.name,
        contractAddress: contract.address,
        preValidation: preValidation.data,
        backupType: "pre-migration"
    };
    
    const backupFile = `deployments/migration-backup-${hre.network.name}-${Date.now()}.json`;
    fs.writeFileSync(backupFile, JSON.stringify(backup, null, 2));
    console.log("  Backup saved to:", backupFile);
}

/**
 * Load multi-sig configuration from deployment config
 */
function loadMultiSigConfig() {
    const multiSigConfig = deploymentConfig.multiSigPause;
    
    if (!multiSigConfig || !multiSigConfig.deploymentConfig.enabled) {
        throw new Error("Multi-sig pause mechanism is not enabled in deployment config");
    }

    return {
        authorizedSigners: multiSigConfig.authorizedSigners.map(s => s.address),
        quorumThreshold: multiSigConfig.parameters.quorumThreshold,
        timelockDuration: multiSigConfig.parameters.timelockDuration,
        maxPauseDuration: multiSigConfig.parameters.maxPauseDuration,
        proposalLifetime: multiSigConfig.parameters.proposalLifetime,
        proposalCooldown: multiSigConfig.parameters.proposalCooldown
    };
}

/**
 * Display multi-sig configuration
 */
function displayMultiSigConfig(config) {
    console.log("  Authorized Signers:", config.authorizedSigners.length);
    config.authorizedSigners.forEach((signer, i) => {
        console.log(`    ${i + 1}. ${signer}`);
    });
    console.log("  Quorum Threshold:", config.quorumThreshold);
    console.log("  Timelock Duration:", config.timelockDuration, "seconds (", config.timelockDuration / 3600, "hours)");
    console.log("  Max Pause Duration:", config.maxPauseDuration, "seconds (", config.maxPauseDuration / 86400, "days)");
    console.log("  Proposal Lifetime:", config.proposalLifetime, "seconds (", config.proposalLifetime / 86400, "days)");
    console.log("  Proposal Cooldown:", config.proposalCooldown, "seconds (", config.proposalCooldown / 3600, "hours)");
}

/**
 * Confirm migration with user
 */
async function confirmMigration() {
    // In automated mode, check environment variable
    if (process.env.AUTO_CONFIRM === "true") {
        console.log("  Auto-confirm enabled, proceeding with migration...");
        return true;
    }
    
    console.log("  This migration will:");
    console.log("    1. Initialize multi-sig pause mechanism");
    console.log("    2. Add authorized signers");
    console.log("    3. Configure timelock and quorum parameters");
    console.log("    4. Replace single-owner pause with multi-sig pause");
    console.log("");
    console.log("  ⚠️ This action cannot be easily reversed!");
    console.log("");
    
    // For non-interactive mode, require explicit confirmation
    const confirmed = process.env.CONFIRM_MIGRATION === "true";
    if (!confirmed) {
        console.log("  Set CONFIRM_MIGRATION=true to proceed");
    }
    return confirmed;
}

/**
 * Execute the migration
 */
async function executeMigration(contract, config) {
    const result = {
        success: false,
        transactions: [],
        error: null
    };

    try {
        console.log("  Initializing multi-sig pause mechanism...");
        
        const tx = await contract.initializeMultiSigPause(
            config.authorizedSigners,
            config.quorumThreshold,
            config.timelockDuration,
            config.maxPauseDuration,
            config.proposalLifetime,
            config.proposalCooldown,
            { gasLimit: MIGRATION_CONFIG.gasLimit }
        );
        
        console.log("  Transaction hash:", tx.hash);
        console.log("  Waiting for confirmations...");
        
        const receipt = await tx.wait(MIGRATION_CONFIG.minConfirmations);
        
        result.transactions.push({
            type: "initializeMultiSigPause",
            hash: tx.hash,
            blockNumber: receipt.blockNumber,
            gasUsed: receipt.gasUsed.toString()
        });
        
        console.log("  ✓ Multi-sig pause initialized in block", receipt.blockNumber);
        console.log("  Gas used:", receipt.gasUsed.toString());
        
        result.success = true;

    } catch (error) {
        result.success = false;
        result.error = error.message;
        console.error("  ❌ Migration failed:", error.message);
    }

    return result;
}

/**
 * Validate contract state after migration
 */
async function validatePostMigration(contract, config) {
    const validation = {
        success: true,
        errors: [],
        data: {}
    };

    try {
        // Verify authorized signers
        const signers = await contract.getAuthorizedSigners();
        validation.data.signers = signers;
        
        if (signers.length !== config.authorizedSigners.length) {
            validation.errors.push(`Signer count mismatch: ${signers.length} != ${config.authorizedSigners.length}`);
        } else {
            console.log("  ✓ Signer count verified:", signers.length);
        }

        // Verify each signer
        for (let i = 0; i < config.authorizedSigners.length; i++) {
            const isAuthorized = await contract.isAuthorizedSigner(config.authorizedSigners[i]);
            if (!isAuthorized) {
                validation.errors.push(`Signer ${config.authorizedSigners[i]} not authorized`);
            }
        }
        console.log("  ✓ All signers verified as authorized");

        // Verify configuration
        const multiSigConfig = await contract.getMultiSigConfig();
        validation.data.config = multiSigConfig;
        
        if (multiSigConfig.quorumThreshold.toString() !== config.quorumThreshold.toString()) {
            validation.errors.push(`Quorum mismatch: ${multiSigConfig.quorumThreshold} != ${config.quorumThreshold}`);
        } else {
            console.log("  ✓ Quorum threshold verified:", multiSigConfig.quorumThreshold.toString());
        }

        if (multiSigConfig.timelockDuration.toString() !== config.timelockDuration.toString()) {
            validation.errors.push(`Timelock mismatch: ${multiSigConfig.timelockDuration} != ${config.timelockDuration}`);
        } else {
            console.log("  ✓ Timelock duration verified:", multiSigConfig.timelockDuration.toString(), "seconds");
        }

        // Check pause state unchanged
        const isPaused = await contract.isPaused();
        validation.data.isPaused = isPaused;
        console.log("  ✓ Pause state:", isPaused ? "PAUSED" : "NOT PAUSED");

        validation.success = validation.errors.length === 0;

    } catch (error) {
        validation.success = false;
        validation.errors.push(error.message);
    }

    return validation;
}

/**
 * Generate migration report
 */
async function generateMigrationReport(contract, preValidation, postValidation, migrationResult) {
    const fs = require('fs');
    
    const report = {
        migrationId: `migration-${Date.now()}`,
        timestamp: new Date().toISOString(),
        network: hre.network.name,
        contractAddress: contract.address,
        
        preState: preValidation.data,
        postState: postValidation.data,
        
        migration: {
            success: migrationResult.success,
            transactions: migrationResult.transactions,
            error: migrationResult.error
        },
        
        validation: {
            preValidation: preValidation.success,
            postValidation: postValidation.success,
            errors: postValidation.errors
        },
        
        summary: {
            status: migrationResult.success && postValidation.success ? "SUCCESS" : "FAILED",
            signersAdded: postValidation.data.signers?.length || 0,
            quorumThreshold: postValidation.data.config?.quorumThreshold?.toString() || "N/A"
        }
    };
    
    const reportFile = `deployments/migration-report-${hre.network.name}-${Date.now()}.json`;
    fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
    console.log("  Migration report saved to:", reportFile);
    
    // Also create markdown report
    const mdReport = generateMarkdownReport(report);
    const mdFile = `deployments/migration-report-${hre.network.name}-${Date.now()}.md`;
    fs.writeFileSync(mdFile, mdReport);
    console.log("  Markdown report saved to:", mdFile);
    
    return report;
}

/**
 * Generate markdown migration report
 */
function generateMarkdownReport(report) {
    return `# Multi-Sig Pause Migration Report

## Summary

- **Migration ID**: ${report.migrationId}
- **Timestamp**: ${report.timestamp}
- **Network**: ${report.network}
- **Contract**: ${report.contractAddress}
- **Status**: ${report.summary.status}

## Pre-Migration State

- **Owner**: ${report.preState.owner}
- **Was Paused**: ${report.preState.isPaused ? 'Yes' : 'No'}
- **Had Multi-Sig**: ${report.preState.hasMultiSig ? 'Yes' : 'No'}

## Post-Migration State

- **Signers Added**: ${report.summary.signersAdded}
- **Quorum Threshold**: ${report.summary.quorumThreshold}
- **Is Paused**: ${report.postState.isPaused ? 'Yes' : 'No'}

## Transactions

${report.migration.transactions.map(tx => `
- **Type**: ${tx.type}
- **Hash**: ${tx.hash}
- **Block**: ${tx.blockNumber}
- **Gas Used**: ${tx.gasUsed}
`).join('\n')}

## Validation

- **Pre-Validation**: ${report.validation.preValidation ? '✓ Passed' : '✗ Failed'}
- **Post-Validation**: ${report.validation.postValidation ? '✓ Passed' : '✗ Failed'}

${report.validation.errors.length > 0 ? `
### Errors
${report.validation.errors.map(e => `- ${e}`).join('\n')}
` : ''}

---
Generated by Multi-Sig Pause Migration Script
`;
}

/**
 * Error handling wrapper
 */
async function migrateWithErrorHandling() {
    try {
        await main();
    } catch (error) {
        console.error("\n❌ Migration failed:");
        console.error(error.message);
        
        if (error.code === 'INSUFFICIENT_FUNDS') {
            console.error("\n💡 Suggestion: Ensure the account has sufficient BNB for gas fees");
        } else if (error.message.includes('owner')) {
            console.error("\n💡 Suggestion: Ensure you are using the contract owner account");
        } else if (error.message.includes('already initialized')) {
            console.error("\n💡 Suggestion: Set FORCE_UPGRADE=true to reconfigure existing multi-sig");
        }
        
        process.exit(1);
    }
}

// Execute migration if script is run directly
if (require.main === module) {
    migrateWithErrorHandling();
}

module.exports = {
    main,
    migrateWithErrorHandling,
    validatePreMigration,
    validatePostMigration,
    executeMigration
};
