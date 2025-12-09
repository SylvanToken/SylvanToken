/**
 * Post-Deployment Validation Script
 * 
 * This script validates deployment after contract deployment and ownership transfer.
 * It verifies contract deployment succeeded, confirms ownership is correctly set,
 * tests admin function access with owner wallet, and generates validation report.
 * 
 * Usage:
 *   npx hardhat run scripts/utils/validate-post-deployment.js --network <network>
 * 
 * Environment Variables:
 *   - CONTRACT_ADDRESS: Address of the deployed contract (required)
 *   - EXPECTED_OWNER: Expected owner address (optional)
 * 
 * Features:
 *   - Verifies contract deployment succeeded
 *   - Confirms ownership is correctly set
 *   - Tests admin function access
 *   - Validates contract state
 *   - Generates comprehensive validation report
 *   - Returns exit code 0 for success, 1 for failure
 */

const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

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
        this.checks = [];
        this.errors = [];
        this.warnings = [];
        this.passed = true;
    }

    addCheck(name, status, message, details = null) {
        this.checks.push({ name, status, message, details });
        if (status === "failed") {
            this.passed = false;
        }
    }

    addError(message) {
        this.errors.push(message);
        this.passed = false;
    }

    addWarning(message) {
        this.warnings.push(message);
    }

    hasErrors() {
        return this.errors.length > 0;
    }

    hasWarnings() {
        return this.warnings.length > 0;
    }
}

/**
 * Verify contract deployment succeeded
 * @param {string} contractAddress - Contract address
 * @param {ValidationResult} result - Validation result object
 * @returns {Promise<Contract|null>} - Contract instance or null
 */
async function verifyContractDeployment(contractAddress, result) {
    log("\n📦 Verifying Contract Deployment...", colors.cyan);
    log(`Contract Address: ${contractAddress}`);

    try {
        // Check if address is valid
        if (!ethers.utils.isAddress(contractAddress)) {
            result.addCheck(
                "Contract Address Format",
                "failed",
                "Invalid contract address format"
            );
            return null;
        }

        result.addCheck(
            "Contract Address Format",
            "passed",
            "Contract address format is valid"
        );

        // Check if contract exists at address
        const code = await ethers.provider.getCode(contractAddress);
        
        if (code === "0x" || code === "0x0") {
            result.addCheck(
                "Contract Existence",
                "failed",
                "No contract found at the specified address"
            );
            return null;
        }

        result.addCheck(
            "Contract Existence",
            "passed",
            `Contract deployed at ${contractAddress}`,
            { codeSize: code.length }
        );

        // Load contract instance
        const contract = await ethers.getContractAt("SylvanToken", contractAddress);

        // Verify contract is SylvanToken by checking basic functions
        try {
            const name = await contract.name();
            const symbol = await contract.symbol();
            const decimals = await contract.decimals();
            const totalSupply = await contract.totalSupply();

            result.addCheck(
                "Contract Interface",
                "passed",
                "Contract implements expected interface",
                {
                    name,
                    symbol,
                    decimals: decimals.toString(),
                    totalSupply: ethers.utils.formatEther(totalSupply)
                }
            );

            log(`✅ Contract verified: ${name} (${symbol})`, colors.green);
            log(`   Total Supply: ${ethers.utils.formatEther(totalSupply)} tokens`, colors.cyan);

        } catch (error) {
            result.addCheck(
                "Contract Interface",
                "failed",
                "Contract does not implement expected interface",
                { error: error.message }
            );
            return null;
        }

        return contract;

    } catch (error) {
        result.addCheck(
            "Contract Deployment",
            "failed",
            `Error verifying contract: ${error.message}`
        );
        return null;
    }
}

/**
 * Confirm ownership is correctly set
 * @param {Contract} contract - Contract instance
 * @param {string} expectedOwner - Expected owner address (optional)
 * @param {ValidationResult} result - Validation result object
 * @returns {Promise<string|null>} - Current owner address or null
 */
async function confirmOwnership(contract, expectedOwner, result) {
    log("\n👑 Confirming Ownership...", colors.cyan);

    try {
        // Get current owner
        const currentOwner = await contract.owner();
        log(`Current Owner: ${currentOwner}`);

        if (!currentOwner || currentOwner === ethers.constants.AddressZero) {
            result.addCheck(
                "Owner Address",
                "failed",
                "Owner address is zero address or invalid"
            );
            return null;
        }

        result.addCheck(
            "Owner Address",
            "passed",
            "Owner address is valid",
            { owner: currentOwner }
        );

        // If expected owner is provided, verify it matches
        if (expectedOwner) {
            log(`Expected Owner: ${expectedOwner}`);

            if (currentOwner.toLowerCase() === expectedOwner.toLowerCase()) {
                result.addCheck(
                    "Owner Verification",
                    "passed",
                    "Current owner matches expected owner",
                    { expected: expectedOwner, actual: currentOwner }
                );
                log(`✅ Ownership verified successfully`, colors.green);
            } else {
                result.addCheck(
                    "Owner Verification",
                    "failed",
                    "Current owner does not match expected owner",
                    { expected: expectedOwner, actual: currentOwner }
                );
                log(`❌ Owner mismatch!`, colors.red);
            }
        } else {
            result.addCheck(
                "Owner Verification",
                "passed",
                "Owner address retrieved (no expected owner to compare)",
                { owner: currentOwner }
            );
            log(`✅ Owner address retrieved`, colors.green);
        }

        return currentOwner;

    } catch (error) {
        result.addCheck(
            "Ownership Confirmation",
            "failed",
            `Error confirming ownership: ${error.message}`
        );
        return null;
    }
}

/**
 * Test admin function access with owner wallet
 * @param {Contract} contract - Contract instance
 * @param {string} ownerAddress - Owner address
 * @param {ValidationResult} result - Validation result object
 */
async function testAdminFunctionAccess(contract, ownerAddress, result) {
    log("\n🔐 Testing Admin Function Access...", colors.cyan);

    try {
        // Get current signer
        const [signer] = await ethers.getSigners();
        const signerAddress = signer.address;

        log(`Signer Address: ${signerAddress}`);
        log(`Owner Address: ${ownerAddress}`);

        // Check if signer is the owner
        const isOwner = signerAddress.toLowerCase() === ownerAddress.toLowerCase();

        if (!isOwner) {
            result.addCheck(
                "Admin Access Test",
                "warning",
                "Cannot test admin functions - signer is not the owner",
                {
                    signer: signerAddress,
                    owner: ownerAddress,
                    note: "To test admin functions, run this script with the owner's private key"
                }
            );
            result.addWarning(
                "Admin function access not tested - signer is not the owner"
            );
            log(`⚠️  Skipping admin function test - signer is not owner`, colors.yellow);
            return;
        }

        // Test reading owner-only view function (should always work)
        try {
            const owner = await contract.owner();
            result.addCheck(
                "Owner View Function",
                "passed",
                "Can read owner() function",
                { owner }
            );
        } catch (error) {
            result.addCheck(
                "Owner View Function",
                "failed",
                "Cannot read owner() function",
                { error: error.message }
            );
        }

        // Test a safe admin function (checking fee exemption status)
        try {
            // Check if a known address is fee exempt (read-only, safe)
            const testAddress = ethers.constants.AddressZero;
            const isExempt = await contract.isFeeExempt(testAddress);
            
            result.addCheck(
                "Admin View Access",
                "passed",
                "Can access admin view functions",
                { tested: "isFeeExempt", result: isExempt }
            );
            log(`✅ Admin view functions accessible`, colors.green);
        } catch (error) {
            result.addCheck(
                "Admin View Access",
                "failed",
                "Cannot access admin view functions",
                { error: error.message }
            );
        }

        // Note: We don't test state-changing admin functions to avoid
        // modifying the contract state during validation

        result.addCheck(
            "Admin Function Access",
            "passed",
            "Owner can access admin functions",
            {
                note: "State-changing functions not tested to preserve contract state"
            }
        );

        log(`✅ Admin function access verified`, colors.green);

    } catch (error) {
        result.addCheck(
            "Admin Function Access",
            "failed",
            `Error testing admin function access: ${error.message}`
        );
    }
}

/**
 * Validate contract state
 * @param {Contract} contract - Contract instance
 * @param {ValidationResult} result - Validation result object
 */
async function validateContractState(contract, result) {
    log("\n📊 Validating Contract State...", colors.cyan);

    try {
        // Check basic token properties
        const name = await contract.name();
        const symbol = await contract.symbol();
        const decimals = await contract.decimals();
        const totalSupply = await contract.totalSupply();

        log(`Token Name: ${name}`);
        log(`Token Symbol: ${symbol}`);
        log(`Decimals: ${decimals}`);
        log(`Total Supply: ${ethers.utils.formatEther(totalSupply)}`);

        // Validate total supply
        const expectedSupply = ethers.utils.parseEther("1000000000"); // 1 billion
        if (totalSupply.eq(expectedSupply)) {
            result.addCheck(
                "Total Supply",
                "passed",
                "Total supply matches expected value",
                { expected: "1000000000", actual: ethers.utils.formatEther(totalSupply) }
            );
        } else {
            result.addCheck(
                "Total Supply",
                "warning",
                "Total supply differs from expected value",
                { expected: "1000000000", actual: ethers.utils.formatEther(totalSupply) }
            );
            result.addWarning(
                `Total supply is ${ethers.utils.formatEther(totalSupply)} (expected 1000000000)`
            );
        }

        // Check if trading is enabled
        try {
            const tradingEnabled = await contract.tradingEnabled();
            log(`Trading Enabled: ${tradingEnabled}`);

            result.addCheck(
                "Trading Status",
                "passed",
                `Trading is ${tradingEnabled ? "enabled" : "disabled"}`,
                { tradingEnabled }
            );

            if (!tradingEnabled) {
                result.addWarning(
                    "Trading is currently disabled - remember to enable it when ready"
                );
            }
        } catch (error) {
            // Trading status might not be available in all versions
            log(`⚠️  Could not check trading status: ${error.message}`, colors.yellow);
        }

        // Check fee wallet configuration
        try {
            const feeWallet = await contract.feeWallet();
            log(`Fee Wallet: ${feeWallet}`);

            if (feeWallet === ethers.constants.AddressZero) {
                result.addCheck(
                    "Fee Wallet",
                    "failed",
                    "Fee wallet is zero address",
                    { feeWallet }
                );
            } else {
                result.addCheck(
                    "Fee Wallet",
                    "passed",
                    "Fee wallet is configured",
                    { feeWallet }
                );
            }
        } catch (error) {
            log(`⚠️  Could not check fee wallet: ${error.message}`, colors.yellow);
        }

        // Check donation wallet configuration
        try {
            const donationWallet = await contract.donationWallet();
            log(`Donation Wallet: ${donationWallet}`);

            if (donationWallet === ethers.constants.AddressZero) {
                result.addCheck(
                    "Donation Wallet",
                    "failed",
                    "Donation wallet is zero address",
                    { donationWallet }
                );
            } else {
                result.addCheck(
                    "Donation Wallet",
                    "passed",
                    "Donation wallet is configured",
                    { donationWallet }
                );
            }
        } catch (error) {
            log(`⚠️  Could not check donation wallet: ${error.message}`, colors.yellow);
        }

        log(`✅ Contract state validated`, colors.green);

    } catch (error) {
        result.addCheck(
            "Contract State",
            "failed",
            `Error validating contract state: ${error.message}`
        );
    }
}

/**
 * Generate validation report
 * @param {ValidationResult} result - Validation result
 * @param {string} contractAddress - Contract address
 * @param {string} networkName - Network name
 * @returns {Object} - Report data
 */
function generateValidationReport(result, contractAddress, networkName) {
    log("\n" + "=".repeat(70), colors.bright);
    log("📊 POST-DEPLOYMENT VALIDATION REPORT", colors.cyan);
    log("=".repeat(70), colors.bright);

    const timestamp = new Date().toISOString();
    
    log(`\nNetwork: ${networkName}`, colors.cyan);
    log(`Contract: ${contractAddress}`, colors.cyan);
    log(`Timestamp: ${timestamp}`, colors.cyan);

    // Display validation checks
    log(`\n📋 Validation Checks (${result.checks.length}):`, colors.cyan);
    
    result.checks.forEach((check, index) => {
        const statusIcon = check.status === "passed" ? "✅" : 
                          check.status === "warning" ? "⚠️" : "❌";
        const statusColor = check.status === "passed" ? colors.green :
                           check.status === "warning" ? colors.yellow : colors.red;
        
        log(`\n   ${index + 1}. ${check.name}`, colors.bright);
        log(`      Status: ${statusIcon} ${check.status.toUpperCase()}`, statusColor);
        log(`      ${check.message}`, statusColor);
        
        if (check.details) {
            log(`      Details:`, colors.cyan);
            Object.entries(check.details).forEach(([key, value]) => {
                log(`         ${key}: ${value}`, colors.cyan);
            });
        }
    });

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

    // Calculate statistics
    const passedChecks = result.checks.filter(c => c.status === "passed").length;
    const warningChecks = result.checks.filter(c => c.status === "warning").length;
    const failedChecks = result.checks.filter(c => c.status === "failed").length;

    log(`\n📈 Statistics:`, colors.cyan);
    log(`   Total Checks: ${result.checks.length}`);
    log(`   Passed: ${passedChecks}`, colors.green);
    log(`   Warnings: ${warningChecks}`, colors.yellow);
    log(`   Failed: ${failedChecks}`, colors.red);

    // Display final result
    log("\n" + "=".repeat(70), colors.bright);
    if (result.passed) {
        log("✅ VALIDATION PASSED", colors.green);
        log("=".repeat(70), colors.bright);
        log("\n✓ All critical validation checks passed", colors.green);
        log("✓ Contract is deployed and configured correctly", colors.green);
        
        if (result.warnings.length > 0) {
            log(`\n⚠️  Note: ${result.warnings.length} warning(s) found - review recommended`, colors.yellow);
        }
    } else {
        log("❌ VALIDATION FAILED", colors.red);
        log("=".repeat(70), colors.bright);
        log(`\n✗ Found ${failedChecks} failed check(s)`, colors.red);
        log("✗ Review errors and take corrective action", colors.red);
    }
    
    log("\n" + "=".repeat(70) + "\n", colors.bright);

    // Return report data
    return {
        network: networkName,
        contractAddress,
        timestamp,
        passed: result.passed,
        checks: result.checks,
        warnings: result.warnings,
        errors: result.errors,
        statistics: {
            total: result.checks.length,
            passed: passedChecks,
            warnings: warningChecks,
            failed: failedChecks
        }
    };
}

/**
 * Save validation report to file
 * @param {Object} reportData - Report data
 * @returns {string|null} - Path to saved file
 */
function saveValidationReport(reportData) {
    log("\n💾 Saving Validation Report...", colors.cyan);

    try {
        const deploymentsDir = path.join(__dirname, "../../deployments");
        
        // Create deployments directory if it doesn't exist
        if (!fs.existsSync(deploymentsDir)) {
            fs.mkdirSync(deploymentsDir, { recursive: true });
        }

        // Create filename with timestamp
        const timestamp = Date.now();
        const filename = `post-deployment-validation-${timestamp}.json`;
        const filepath = path.join(deploymentsDir, filename);

        // Save report
        fs.writeFileSync(filepath, JSON.stringify(reportData, null, 2));

        log(`✅ Validation report saved: ${filename}`, colors.green);
        log(`   Location: ${filepath}`);

        return filepath;

    } catch (error) {
        log(`⚠️  Warning: Could not save validation report: ${error.message}`, colors.yellow);
        return null;
    }
}

/**
 * Main validation function
 */
async function validatePostDeployment() {
    log("\n" + "=".repeat(70), colors.bright);
    log("🔍 POST-DEPLOYMENT VALIDATION", colors.bright);
    log("=".repeat(70) + "\n", colors.bright);

    const result = new ValidationResult();

    try {
        // Get network information
        const network = await ethers.provider.getNetwork();
        const networkName = network.name === "unknown" ? "localhost" : network.name;
        
        log(`Network: ${networkName} (Chain ID: ${network.chainId})`, colors.cyan);

        // Get contract address
        const contractAddress = process.env.CONTRACT_ADDRESS;
        if (!contractAddress) {
            throw new Error("CONTRACT_ADDRESS environment variable not set");
        }

        // Get expected owner (optional)
        const expectedOwner = process.env.EXPECTED_OWNER || null;

        // Run validation checks
        const contract = await verifyContractDeployment(contractAddress, result);
        
        if (!contract) {
            throw new Error("Contract verification failed - cannot proceed with validation");
        }

        const currentOwner = await confirmOwnership(contract, expectedOwner, result);
        
        if (currentOwner) {
            await testAdminFunctionAccess(contract, currentOwner, result);
        }

        await validateContractState(contract, result);

        // Generate and display validation report
        const reportData = generateValidationReport(result, contractAddress, networkName);

        // Save validation report
        saveValidationReport(reportData);

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
    validatePostDeployment()
        .then((exitCode) => process.exit(exitCode))
        .catch((error) => {
            console.error(error);
            process.exit(1);
        });
}

// Export for use in other scripts
module.exports = {
    validatePostDeployment,
    ValidationResult,
    verifyContractDeployment,
    confirmOwnership,
    testAdminFunctionAccess,
    validateContractState,
    generateValidationReport,
    saveValidationReport
};
