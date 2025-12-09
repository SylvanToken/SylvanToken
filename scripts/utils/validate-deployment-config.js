/**
 * Pre-Deployment Validation Script
 * 
 * This script validates deployment configuration before executing deployment.
 * It checks deployer address format and balance, owner address format,
 * network-specific requirements, and role separation on mainnet.
 * 
 * Usage:
 *   npx hardhat run scripts/utils/validate-deployment-config.js --network <network>
 * 
 * Environment Variables:
 *   - DEPLOYER_ADDRESS: Address of the deployer wallet (optional)
 *   - OWNER_ADDRESS: Address of the owner wallet (optional)
 *   - OWNER_WALLET_TYPE: Type of owner wallet (hardware|multisig|standard)
 * 
 * Features:
 *   - Validates deployer address format and balance
 *   - Validates owner address format
 *   - Checks network-specific requirements
 *   - Verifies role separation on mainnet
 *   - Provides detailed validation report
 *   - Returns exit code 0 for success, 1 for failure
 */

const { ethers } = require("hardhat");
const deploymentConfig = require("../../config/deployment.config.js");
const environmentConfig = require("../../config/environment.config.js");

// Color codes for console output
const colors = {
    reset: "\x1b[0m",
    bright: "\x1b[1m",
    red: "\x1b[31m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    blue: "\x1b[34m",
    cyan: "\x1b[36m",
    magenta: "\x1b[35m"
};

/**
 * Log with color formatting
 */
function log(message, color = colors.reset) {
    console.log(`${color}${message}${colors.reset}`);
}

/**
 * Validation result class
 */
class ValidationResult {
    constructor() {
        this.errors = [];
        this.warnings = [];
        this.info = [];
        this.passed = true;
    }

    addError(message) {
        this.errors.push(message);
        this.passed = false;
    }

    addWarning(message) {
        this.warnings.push(message);
    }

    addInfo(message) {
        this.info.push(message);
    }

    hasErrors() {
        return this.errors.length > 0;
    }

    hasWarnings() {
        return this.warnings.length > 0;
    }
}

/**
 * Validate Ethereum address format
 * @param {string} address - Address to validate
 * @returns {boolean} - True if valid
 */
function isValidAddress(address) {
    if (!address || address === "") {
        return false;
    }
    return ethers.utils.isAddress(address);
}

/**
 * Check if address is zero address
 * @param {string} address - Address to check
 * @returns {boolean} - True if zero address
 */
function isZeroAddress(address) {
    return address === ethers.constants.AddressZero;
}

/**
 * Validate deployer address format
 * @param {string} deployerAddress - Deployer address
 * @param {ValidationResult} result - Validation result object
 */
function validateDeployerAddressFormat(deployerAddress, result) {
    log("\n📋 Validating Deployer Address Format...", colors.cyan);
    
    if (!deployerAddress) {
        result.addInfo("Deployer address not configured - will use default signer");
        return;
    }

    if (!isValidAddress(deployerAddress)) {
        result.addError(`Invalid deployer address format: ${deployerAddress}`);
        return;
    }

    if (isZeroAddress(deployerAddress)) {
        result.addError("Deployer address cannot be zero address");
        return;
    }

    // Get checksummed address
    const checksummed = ethers.utils.getAddress(deployerAddress);
    if (checksummed !== deployerAddress) {
        result.addWarning(`Deployer address is not checksummed. Use: ${checksummed}`);
    }

    log(`✅ Deployer address format is valid: ${deployerAddress}`, colors.green);
}

/**
 * Validate deployer balance
 * @param {string} deployerAddress - Deployer address
 * @param {string} networkName - Network name
 * @param {ValidationResult} result - Validation result object
 */
async function validateDeployerBalance(deployerAddress, networkName, result) {
    log("\n💰 Validating Deployer Balance...", colors.cyan);
    
    if (!deployerAddress) {
        result.addInfo("Skipping balance check - deployer address not configured");
        return;
    }

    try {
        const balance = await ethers.provider.getBalance(deployerAddress);
        const balanceInBNB = ethers.utils.formatEther(balance);
        
        log(`Current Balance: ${balanceInBNB} BNB`);

        // Get minimum balance requirement from config
        const roleConfig = deploymentConfig.roles;
        let minBalance = "0.1"; // Default

        if (roleConfig && roleConfig.validation && roleConfig.validation.networkRequirements) {
            const networkReq = roleConfig.validation.networkRequirements[networkName];
            if (networkReq && networkReq.minDeployerBalance) {
                minBalance = networkReq.minDeployerBalance;
            }
        } else if (roleConfig && roleConfig.deployer && roleConfig.deployer.minimumBalance) {
            minBalance = roleConfig.deployer.minimumBalance;
        }

        const minBalanceWei = ethers.utils.parseEther(minBalance);

        if (balance.lt(minBalanceWei)) {
            result.addError(
                `Insufficient deployer balance: ${balanceInBNB} BNB (minimum required: ${minBalance} BNB)`
            );
        } else {
            log(`✅ Deployer has sufficient balance (minimum: ${minBalance} BNB)`, colors.green);
        }

        // Additional warnings for low balance
        const warningThreshold = ethers.utils.parseEther((parseFloat(minBalance) * 1.5).toString());
        if (balance.lt(warningThreshold) && balance.gte(minBalanceWei)) {
            result.addWarning(
                `Deployer balance is close to minimum (${balanceInBNB} BNB). Consider adding more BNB for safety.`
            );
        }

    } catch (error) {
        result.addError(`Failed to check deployer balance: ${error.message}`);
    }
}

/**
 * Validate owner address format
 * @param {string} ownerAddress - Owner address
 * @param {ValidationResult} result - Validation result object
 */
function validateOwnerAddressFormat(ownerAddress, result) {
    log("\n👑 Validating Owner Address Format...", colors.cyan);
    
    if (!ownerAddress) {
        result.addInfo("Owner address not configured - deployer will remain as owner");
        return;
    }

    if (!isValidAddress(ownerAddress)) {
        result.addError(`Invalid owner address format: ${ownerAddress}`);
        return;
    }

    if (isZeroAddress(ownerAddress)) {
        result.addError("Owner address cannot be zero address");
        return;
    }

    // Get checksummed address
    const checksummed = ethers.utils.getAddress(ownerAddress);
    if (checksummed !== ownerAddress) {
        result.addWarning(`Owner address is not checksummed. Use: ${checksummed}`);
    }

    log(`✅ Owner address format is valid: ${ownerAddress}`, colors.green);
}

/**
 * Check network-specific requirements
 * @param {string} deployerAddress - Deployer address
 * @param {string} ownerAddress - Owner address
 * @param {string} networkName - Network name
 * @param {ValidationResult} result - Validation result object
 */
function checkNetworkRequirements(deployerAddress, ownerAddress, networkName, result) {
    log("\n🌐 Checking Network-Specific Requirements...", colors.cyan);
    log(`Network: ${networkName}`);

    const roleConfig = deploymentConfig.roles;
    
    // Check if we have network requirements
    if (!roleConfig || !roleConfig.validation || !roleConfig.validation.networkRequirements) {
        result.addWarning("Network requirements not found in configuration");
        return;
    }

    const networkReq = roleConfig.validation.networkRequirements[networkName];
    
    if (!networkReq) {
        result.addWarning(`No specific requirements defined for network: ${networkName}`);
        return;
    }

    // Check if same address is allowed
    if (deployerAddress && ownerAddress) {
        const sameAddress = deployerAddress.toLowerCase() === ownerAddress.toLowerCase();
        
        if (sameAddress && !networkReq.allowSameAddress) {
            result.addError(
                `Network ${networkName} requires different deployer and owner addresses`
            );
        } else if (sameAddress && networkReq.allowSameAddress) {
            result.addWarning(
                `Deployer and owner are the same address (allowed on ${networkName})`
            );
        }
    }

    // Check hardware wallet requirement
    if (networkReq.requireHardwareWallet) {
        const ownerWalletType = environmentConfig.getOwnerWalletType();
        if (ownerWalletType !== "hardware" && ownerWalletType !== "multisig") {
            result.addError(
                `Network ${networkName} requires hardware wallet or multisig for owner (current: ${ownerWalletType})`
            );
        }
    }

    // Check multisig requirement
    if (networkReq.requireMultisig) {
        const ownerWalletType = environmentConfig.getOwnerWalletType();
        if (ownerWalletType !== "multisig") {
            result.addError(
                `Network ${networkName} requires multisig wallet for owner (current: ${ownerWalletType})`
            );
        }
    }

    // Display network warnings if any
    if (networkReq.warnings && networkReq.warnings.length > 0) {
        log(`\n⚠️  Network Warnings:`, colors.yellow);
        networkReq.warnings.forEach(warning => {
            log(`   • ${warning}`, colors.yellow);
            result.addWarning(warning);
        });
    }

    log(`✅ Network requirements checked`, colors.green);
}

/**
 * Verify role separation on mainnet
 * @param {string} deployerAddress - Deployer address
 * @param {string} ownerAddress - Owner address
 * @param {string} networkName - Network name
 * @param {ValidationResult} result - Validation result object
 */
function verifyRoleSeparationMainnet(deployerAddress, ownerAddress, networkName, result) {
    log("\n🔐 Verifying Role Separation...", colors.cyan);

    // Check if this is mainnet
    const isMainnet = networkName === "bscMainnet" || networkName === "mainnet";
    
    if (!isMainnet) {
        log(`Network ${networkName} is not mainnet - role separation not strictly required`, colors.cyan);
        result.addInfo(`Role separation is recommended but not required on ${networkName}`);
        return;
    }

    log(`⚠️  MAINNET DEPLOYMENT - Strict role separation required`, colors.yellow);

    // Both addresses must be configured for mainnet
    if (!deployerAddress || !ownerAddress) {
        result.addError(
            "MAINNET: Both DEPLOYER_ADDRESS and OWNER_ADDRESS must be configured"
        );
        return;
    }

    // Addresses must be different on mainnet
    if (deployerAddress.toLowerCase() === ownerAddress.toLowerCase()) {
        result.addError(
            "MAINNET SECURITY VIOLATION: Deployer and owner MUST be different addresses on mainnet"
        );
        result.addError(
            "This is a critical security requirement. Use a hardware wallet or multisig for owner."
        );
        return;
    }

    // Check owner wallet type
    const ownerWalletType = environmentConfig.getOwnerWalletType();
    if (ownerWalletType === "standard") {
        result.addWarning(
            "MAINNET SECURITY: Owner wallet type is 'standard'. Consider using 'hardware' or 'multisig' for better security."
        );
    }

    log(`✅ Role separation verified for mainnet`, colors.green);
    log(`   Deployer: ${deployerAddress}`, colors.cyan);
    log(`   Owner:    ${ownerAddress}`, colors.cyan);
    log(`   Owner Wallet Type: ${ownerWalletType}`, colors.cyan);
}

/**
 * Validate wallet configuration
 * @param {ValidationResult} result - Validation result object
 */
function validateWalletConfiguration(result) {
    log("\n💼 Validating Wallet Configuration...", colors.cyan);

    try {
        // Validate all wallet addresses in deployment config
        const wallets = deploymentConfig.wallets;
        
        if (!wallets) {
            result.addError("Wallet configuration not found in deployment config");
            return;
        }

        let validCount = 0;
        let invalidCount = 0;

        // Validate system wallets
        if (wallets.system) {
            Object.entries(wallets.system).forEach(([key, wallet]) => {
                if (wallet.address) {
                    if (isValidAddress(wallet.address)) {
                        validCount++;
                    } else {
                        invalidCount++;
                        result.addError(`Invalid system wallet address for ${key}: ${wallet.address}`);
                    }
                }
            });
        }

        // Validate admin wallets
        if (wallets.admins) {
            Object.entries(wallets.admins).forEach(([key, wallet]) => {
                if (wallet.address) {
                    if (isValidAddress(wallet.address)) {
                        validCount++;
                    } else {
                        invalidCount++;
                        result.addError(`Invalid admin wallet address for ${key}: ${wallet.address}`);
                    }
                }
            });
        }

        log(`✅ Validated ${validCount} wallet addresses`, colors.green);
        if (invalidCount > 0) {
            log(`❌ Found ${invalidCount} invalid wallet addresses`, colors.red);
        }

    } catch (error) {
        result.addError(`Failed to validate wallet configuration: ${error.message}`);
    }
}

/**
 * Display validation report
 * @param {ValidationResult} result - Validation result
 * @param {string} networkName - Network name
 */
function displayValidationReport(result, networkName) {
    log("\n" + "=".repeat(70), colors.bright);
    log("📊 DEPLOYMENT VALIDATION REPORT", colors.cyan);
    log("=".repeat(70), colors.bright);
    
    log(`\nNetwork: ${networkName}`, colors.cyan);
    log(`Timestamp: ${new Date().toISOString()}`, colors.cyan);

    // Display info messages
    if (result.info.length > 0) {
        log(`\n📌 Information (${result.info.length}):`, colors.blue);
        result.info.forEach((msg, index) => {
            log(`   ${index + 1}. ${msg}`, colors.blue);
        });
    }

    // Display warnings
    if (result.warnings.length > 0) {
        log(`\n⚠️  Warnings (${result.warnings.length}):`, colors.yellow);
        result.warnings.forEach((msg, index) => {
            log(`   ${index + 1}. ${msg}`, colors.yellow);
        });
    }

    // Display errors
    if (result.errors.length > 0) {
        log(`\n❌ Errors (${result.errors.length}):`, colors.red);
        result.errors.forEach((msg, index) => {
            log(`   ${index + 1}. ${msg}`, colors.red);
        });
    }

    // Display final result
    log("\n" + "=".repeat(70), colors.bright);
    if (result.passed) {
        log("✅ VALIDATION PASSED", colors.green);
        log("=".repeat(70), colors.bright);
        log("\n✓ All validation checks passed successfully", colors.green);
        log("✓ Configuration is ready for deployment", colors.green);
        
        if (result.warnings.length > 0) {
            log(`\n⚠️  Note: ${result.warnings.length} warning(s) found - review before proceeding`, colors.yellow);
        }
    } else {
        log("❌ VALIDATION FAILED", colors.red);
        log("=".repeat(70), colors.bright);
        log(`\n✗ Found ${result.errors.length} error(s) that must be fixed`, colors.red);
        log("✗ Cannot proceed with deployment until errors are resolved", colors.red);
    }
    
    log("\n" + "=".repeat(70) + "\n", colors.bright);
}

/**
 * Main validation function
 */
async function validateDeploymentConfig() {
    log("\n" + "=".repeat(70), colors.bright);
    log("🔍 PRE-DEPLOYMENT CONFIGURATION VALIDATION", colors.bright);
    log("=".repeat(70) + "\n", colors.bright);

    const result = new ValidationResult();

    try {
        // Get network information
        const network = await ethers.provider.getNetwork();
        const networkName = network.name === "unknown" ? "localhost" : network.name;
        
        log(`Network: ${networkName} (Chain ID: ${network.chainId})`, colors.cyan);

        // Get deployer address
        const [signer] = await ethers.getSigners();
        const deployerAddress = environmentConfig.getDeployerAddress() || signer.address;
        
        log(`Deployer Address: ${deployerAddress}`, colors.cyan);

        // Get owner address
        const ownerAddress = environmentConfig.getOwnerAddress();
        if (ownerAddress) {
            log(`Owner Address: ${ownerAddress}`, colors.cyan);
        } else {
            log(`Owner Address: Not configured (will use deployer)`, colors.yellow);
        }

        // Get owner wallet type
        const ownerWalletType = environmentConfig.getOwnerWalletType();
        log(`Owner Wallet Type: ${ownerWalletType}`, colors.cyan);

        // Run validation checks
        validateDeployerAddressFormat(deployerAddress, result);
        await validateDeployerBalance(deployerAddress, networkName, result);
        validateOwnerAddressFormat(ownerAddress, result);
        checkNetworkRequirements(deployerAddress, ownerAddress, networkName, result);
        verifyRoleSeparationMainnet(deployerAddress, ownerAddress, networkName, result);
        validateWalletConfiguration(result);

        // Display validation report
        displayValidationReport(result, networkName);

        // Return appropriate exit code
        if (result.passed) {
            return 0;
        } else {
            return 1;
        }

    } catch (error) {
        log("\n" + "=".repeat(70), colors.bright);
        log("❌ VALIDATION ERROR", colors.red);
        log("=".repeat(70), colors.bright);
        log(`\nError: ${error.message}`, colors.red);
        
        if (error.stack) {
            log(`\nStack trace:`, colors.red);
            log(error.stack, colors.red);
        }
        
        log("\n" + "=".repeat(70) + "\n", colors.bright);
        
        return 1;
    }
}

// Execute if run directly
if (require.main === module) {
    validateDeploymentConfig()
        .then((exitCode) => process.exit(exitCode))
        .catch((error) => {
            console.error(error);
            process.exit(1);
        });
}

// Export for use in other scripts
module.exports = {
    validateDeploymentConfig,
    ValidationResult,
    isValidAddress,
    isZeroAddress,
    validateDeployerAddressFormat,
    validateDeployerBalance,
    validateOwnerAddressFormat,
    checkNetworkRequirements,
    verifyRoleSeparationMainnet,
    validateWalletConfiguration,
    displayValidationReport
};
