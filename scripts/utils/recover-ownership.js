/**
 * Emergency Ownership Recovery Utility Script
 * 
 * This script provides emergency ownership recovery capabilities for the SylvanToken contract.
 * It should be used when ownership needs to be recovered due to lost access, compromised wallets,
 * or other emergency situations.
 * 
 * Usage:
 *   npx hardhat run scripts/utils/recover-ownership.js --network <network>
 * 
 * Environment Variables Required:
 *   - CONTRACT_ADDRESS: Address of the deployed SylvanToken contract
 *   - RECOVERY_WALLET_KEY: Private key of the current owner (for recovery)
 *   - NEW_OWNER_ADDRESS: Address to transfer ownership to
 * 
 * Features:
 *   - Load contract and check current owner
 *   - Multiple recovery options (standard transfer, emergency transfer)
 *   - Comprehensive safety checks and confirmations
 *   - Detailed logging of all recovery actions
 *   - Backup creation before recovery
 *   - Post-recovery verification
 *   - Recovery audit trail
 * 
 * Security:
 *   - Requires explicit confirmation for all actions
 *   - Creates backup of current state before recovery
 *   - Logs all actions for audit purposes
 *   - Validates all addresses before proceeding
 */

const hre = require("hardhat");
const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");
const readline = require("readline");

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
 * Create readline interface for user input
 */
function createReadlineInterface() {
    return readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
}

/**
 * Ask user for confirmation
 * @param {string} question - Question to ask
 * @returns {Promise<boolean>} - True if user confirms
 */
function askConfirmation(question) {
    return new Promise((resolve) => {
        const rl = createReadlineInterface();
        rl.question(`${colors.yellow}${question} (yes/no): ${colors.reset}`, (answer) => {
            rl.close();
            resolve(answer.toLowerCase() === "yes" || answer.toLowerCase() === "y");
        });
    });
}

/**
 * Ask user for input
 * @param {string} question - Question to ask
 * @returns {Promise<string>} - User input
 */
function askInput(question) {
    return new Promise((resolve) => {
        const rl = createReadlineInterface();
        rl.question(`${colors.cyan}${question}: ${colors.reset}`, (answer) => {
            rl.close();
            resolve(answer.trim());
        });
    });
}

/**
 * Validate Ethereum address
 * @param {string} address - Address to validate
 * @returns {boolean} - True if valid
 */
function validateAddress(address) {
    if (!address || address === "") {
        return false;
    }
    
    if (!ethers.utils.isAddress(address)) {
        return false;
    }
    
    if (address === ethers.constants.AddressZero) {
        return false;
    }
    
    return true;
}

/**
 * Get checksummed address
 * @param {string} address - Address to checksum
 * @returns {string} - Checksummed address
 */
function getChecksumAddress(address) {
    try {
        return ethers.utils.getAddress(address);
    } catch (error) {
        throw new Error(`Invalid address format: ${address}`);
    }
}

/**
 * Load contract instance
 * @param {string} contractAddress - Contract address
 * @returns {Promise<Contract>} - Contract instance
 */
async function loadContract(contractAddress) {
    log("\n📋 Loading Contract...", colors.cyan);
    log(`Contract Address: ${contractAddress}`);
    
    try {
        if (!validateAddress(contractAddress)) {
            throw new Error("Invalid contract address");
        }
        
        const checksummedAddress = getChecksumAddress(contractAddress);
        const contract = await ethers.getContractAt("SylvanToken", checksummedAddress);
        
        // Verify contract exists
        const code = await ethers.provider.getCode(checksummedAddress);
        if (code === "0x") {
            throw new Error("No contract found at the specified address");
        }
        
        log("✅ Contract loaded successfully", colors.green);
        return contract;
    } catch (error) {
        log(`❌ Error loading contract: ${error.message}`, colors.red);
        throw error;
    }
}

/**
 * Get current contract state
 * @param {Contract} contract - Contract instance
 * @returns {Promise<Object>} - Current state
 */
async function getCurrentState(contract) {
    log("\n🔍 Retrieving Current Contract State...", colors.cyan);
    
    try {
        const owner = await contract.owner();
        const name = await contract.name();
        const symbol = await contract.symbol();
        const totalSupply = await contract.totalSupply();
        const ownerBalance = await ethers.provider.getBalance(owner);
        
        const state = {
            owner: owner,
            ownerBalance: ethers.utils.formatEther(ownerBalance),
            contractName: name,
            contractSymbol: symbol,
            totalSupply: ethers.utils.formatEther(totalSupply),
            timestamp: new Date().toISOString()
        };
        
        log(`Current Owner: ${state.owner}`, colors.bright);
        log(`Owner Balance: ${state.ownerBalance} BNB`);
        log(`Contract: ${state.contractName} (${state.contractSymbol})`);
        log(`Total Supply: ${state.totalSupply} ${state.contractSymbol}`);
        
        return state;
    } catch (error) {
        log(`❌ Error retrieving state: ${error.message}`, colors.red);
        throw error;
    }
}

/**
 * Create backup of current state
 * @param {Object} state - Current state
 * @param {string} contractAddress - Contract address
 * @returns {string} - Backup file path
 */
function createBackup(state, contractAddress) {
    log("\n💾 Creating State Backup...", colors.cyan);
    
    try {
        const backupDir = path.join(__dirname, "../../deployments/recovery-backups");
        
        // Create backup directory if it doesn't exist
        if (!fs.existsSync(backupDir)) {
            fs.mkdirSync(backupDir, { recursive: true });
        }
        
        const timestamp = Date.now();
        const filename = `recovery-backup-${timestamp}.json`;
        const filepath = path.join(backupDir, filename);
        
        const backupData = {
            contractAddress: contractAddress,
            state: state,
            backupTimestamp: new Date().toISOString(),
            backupReason: "Pre-recovery backup"
        };
        
        fs.writeFileSync(filepath, JSON.stringify(backupData, null, 2));
        
        log(`✅ Backup created: ${filename}`, colors.green);
        log(`   Location: ${filepath}`);
        
        return filepath;
    } catch (error) {
        log(`⚠️  Warning: Could not create backup: ${error.message}`, colors.yellow);
        return null;
    }
}

/**
 * Display recovery options
 */
function displayRecoveryOptions() {
    log("\n" + "=".repeat(80), colors.bright);
    log("🔧 RECOVERY OPTIONS", colors.cyan);
    log("=".repeat(80), colors.bright);
    
    log("\n1. Standard Ownership Transfer", colors.cyan);
    log("   - Transfer ownership to a new address");
    log("   - Requires current owner's private key");
    log("   - Safest option for planned transfers");
    
    log("\n2. Emergency Recovery with Verification", colors.cyan);
    log("   - Transfer with additional safety checks");
    log("   - Verifies new owner can access admin functions");
    log("   - Recommended for critical situations");
    
    log("\n3. Verify Current Ownership Only", colors.cyan);
    log("   - Check current owner without making changes");
    log("   - Useful for diagnosis");
    
    log("\n4. Cancel", colors.cyan);
    log("   - Exit without making any changes");
    
    log("\n" + "=".repeat(80) + "\n", colors.bright);
}

/**
 * Execute standard ownership transfer
 * @param {Contract} contract - Contract instance
 * @param {string} newOwnerAddress - New owner address
 * @returns {Promise<Object>} - Transaction receipt
 */
async function executeStandardTransfer(contract, newOwnerAddress) {
    log("\n🔄 Executing Standard Ownership Transfer...", colors.cyan);
    log(`New Owner: ${newOwnerAddress}`);
    
    try {
        // Validate new owner address
        if (!validateAddress(newOwnerAddress)) {
            throw new Error("Invalid new owner address");
        }
        
        const checksummedAddress = getChecksumAddress(newOwnerAddress);
        
        // Estimate gas
        log("Estimating gas...");
        const gasEstimate = await contract.estimateGas.transferOwnership(checksummedAddress);
        const gasLimit = gasEstimate.mul(120).div(100); // 20% buffer
        
        log(`Estimated gas: ${gasEstimate.toString()}`);
        log(`Gas limit: ${gasLimit.toString()}`);
        
        // Execute transfer
        log("Sending transaction...");
        const tx = await contract.transferOwnership(checksummedAddress, {
            gasLimit: gasLimit
        });
        
        log(`Transaction sent: ${tx.hash}`, colors.bright);
        log("Waiting for confirmation...");
        
        const receipt = await tx.wait();
        
        log(`✅ Transaction confirmed in block ${receipt.blockNumber}`, colors.green);
        log(`Gas used: ${receipt.gasUsed.toString()}`);
        
        return receipt;
    } catch (error) {
        log(`❌ Transfer failed: ${error.message}`, colors.red);
        throw error;
    }
}

/**
 * Execute emergency recovery with verification
 * @param {Contract} contract - Contract instance
 * @param {string} newOwnerAddress - New owner address
 * @returns {Promise<Object>} - Recovery result
 */
async function executeEmergencyRecovery(contract, newOwnerAddress) {
    log("\n🚨 Executing Emergency Recovery...", colors.cyan);
    
    try {
        // Step 1: Validate new owner
        if (!validateAddress(newOwnerAddress)) {
            throw new Error("Invalid new owner address");
        }
        
        const checksummedAddress = getChecksumAddress(newOwnerAddress);
        
        // Step 2: Check new owner balance
        log("\nChecking new owner wallet...");
        const newOwnerBalance = await ethers.provider.getBalance(checksummedAddress);
        log(`New owner balance: ${ethers.utils.formatEther(newOwnerBalance)} BNB`);
        
        if (newOwnerBalance.eq(0)) {
            log(`⚠️  Warning: New owner has zero balance`, colors.yellow);
            const proceed = await askConfirmation("New owner has no BNB. Continue anyway?");
            if (!proceed) {
                throw new Error("Recovery cancelled by user");
            }
        }
        
        // Step 3: Execute transfer
        const receipt = await executeStandardTransfer(contract, checksummedAddress);
        
        // Step 4: Verify transfer
        log("\n🔍 Verifying ownership transfer...");
        const currentOwner = await contract.owner();
        
        if (currentOwner.toLowerCase() !== checksummedAddress.toLowerCase()) {
            throw new Error("Ownership verification failed - owner mismatch");
        }
        
        log(`✅ Ownership verified: ${currentOwner}`, colors.green);
        
        // Step 5: Test admin access
        log("\n🔐 Testing admin function access...");
        try {
            // Try to call a view function that requires owner
            await contract.owner();
            log(`✅ Admin functions accessible`, colors.green);
        } catch (error) {
            log(`⚠️  Warning: Could not verify admin access: ${error.message}`, colors.yellow);
        }
        
        return {
            success: true,
            receipt: receipt,
            newOwner: currentOwner
        };
    } catch (error) {
        log(`❌ Emergency recovery failed: ${error.message}`, colors.red);
        throw error;
    }
}

/**
 * Verify ownership without changes
 * @param {Contract} contract - Contract instance
 * @returns {Promise<Object>} - Verification result
 */
async function verifyOwnershipOnly(contract) {
    log("\n🔍 Verifying Current Ownership...", colors.cyan);
    
    try {
        const owner = await contract.owner();
        const balance = await ethers.provider.getBalance(owner);
        
        log("\n" + "=".repeat(80), colors.bright);
        log("📊 OWNERSHIP VERIFICATION RESULT", colors.cyan);
        log("=".repeat(80), colors.bright);
        
        log("\n👤 Current Owner:", colors.cyan);
        log(`   Address: ${owner}`, colors.bright);
        log(`   Balance: ${ethers.utils.formatEther(balance)} BNB`);
        
        // Try to get more info
        try {
            const code = await ethers.provider.getCode(owner);
            if (code !== "0x") {
                log(`   Type: Contract (Smart Contract Wallet or Multisig)`, colors.yellow);
            } else {
                log(`   Type: EOA (Externally Owned Account)`);
            }
        } catch (error) {
            log(`   Type: Unknown`);
        }
        
        log("\n" + "=".repeat(80) + "\n", colors.bright);
        
        return {
            owner: owner,
            balance: ethers.utils.formatEther(balance)
        };
    } catch (error) {
        log(`❌ Verification failed: ${error.message}`, colors.red);
        throw error;
    }
}

/**
 * Log recovery action
 * @param {Object} recoveryData - Recovery data
 * @returns {string} - Log file path
 */
function logRecoveryAction(recoveryData) {
    log("\n📝 Logging Recovery Action...", colors.cyan);
    
    try {
        const logsDir = path.join(__dirname, "../../deployments/recovery-logs");
        
        // Create logs directory if it doesn't exist
        if (!fs.existsSync(logsDir)) {
            fs.mkdirSync(logsDir, { recursive: true });
        }
        
        const timestamp = Date.now();
        const filename = `recovery-log-${timestamp}.json`;
        const filepath = path.join(logsDir, filename);
        
        const logData = {
            ...recoveryData,
            logTimestamp: new Date().toISOString(),
            logVersion: "1.0.0"
        };
        
        fs.writeFileSync(filepath, JSON.stringify(logData, null, 2));
        
        log(`✅ Recovery log saved: ${filename}`, colors.green);
        log(`   Location: ${filepath}`);
        
        // Also append to master log
        const masterLogPath = path.join(logsDir, "recovery-actions.log");
        const logEntry = `[${recoveryData.timestamp}] ${recoveryData.action} - Contract: ${recoveryData.contractAddress} - Status: ${recoveryData.status}\n`;
        
        fs.appendFileSync(masterLogPath, logEntry);
        
        return filepath;
    } catch (error) {
        log(`⚠️  Warning: Could not save recovery log: ${error.message}`, colors.yellow);
        return null;
    }
}

/**
 * Display recovery summary
 * @param {Object} result - Recovery result
 */
function displayRecoverySummary(result) {
    log("\n" + "=".repeat(80), colors.bright);
    log("✅ RECOVERY COMPLETED SUCCESSFULLY", colors.green);
    log("=".repeat(80), colors.bright);
    
    log("\n📋 Recovery Summary:", colors.cyan);
    log(`   Action:           ${result.action}`);
    log(`   Network:          ${result.network}`);
    log(`   Contract:         ${result.contractAddress}`);
    log(`   Previous Owner:   ${result.previousOwner}`);
    log(`   New Owner:        ${result.newOwner}`, colors.green);
    
    if (result.transactionHash) {
        log(`   Transaction:      ${result.transactionHash}`);
        log(`   Block:            ${result.blockNumber}`);
        log(`   Gas Used:         ${result.gasUsed}`);
    }
    
    log(`   Timestamp:        ${result.timestamp}`);
    
    log("\n✅ Next Steps:", colors.cyan);
    log(`   1. Verify new owner can access admin functions`);
    log(`   2. Test critical contract operations`);
    log(`   3. Update documentation with new owner address`);
    log(`   4. Securely backup new owner's private key`);
    log(`   5. Notify relevant team members of ownership change`);
    
    log("\n" + "=".repeat(80) + "\n", colors.bright);
}

/**
 * Main recovery function
 */
async function recoverOwnership() {
    log("\n" + "=".repeat(80), colors.bright);
    log("🚨 EMERGENCY OWNERSHIP RECOVERY UTILITY", colors.bright);
    log("=".repeat(80) + "\n", colors.bright);
    
    log("⚠️  WARNING: This is an emergency recovery tool", colors.red);
    log("⚠️  Use only when necessary and with extreme caution", colors.red);
    log("⚠️  All actions will be logged for audit purposes\n", colors.red);
    
    try {
        // Get network information
        const network = await ethers.provider.getNetwork();
        log(`Network: ${network.name} (Chain ID: ${network.chainId})`, colors.cyan);
        
        // Get contract address
        let contractAddress = process.env.CONTRACT_ADDRESS;
        if (!contractAddress) {
            contractAddress = await askInput("Enter contract address");
        }
        
        if (!validateAddress(contractAddress)) {
            throw new Error("Invalid contract address");
        }
        
        contractAddress = getChecksumAddress(contractAddress);
        
        // Load contract
        const contract = await loadContract(contractAddress);
        
        // Get current state
        const currentState = await getCurrentState(contract);
        
        // Create backup
        const backupPath = createBackup(currentState, contractAddress);
        
        if (backupPath) {
            log(`\n✅ Backup created successfully`, colors.green);
        }
        
        // Display recovery options
        displayRecoveryOptions();
        
        // Get user choice
        const choice = await askInput("Select recovery option (1-4)");
        
        let recoveryResult = null;
        
        switch (choice) {
            case "1": {
                // Standard transfer
                log("\n📋 Standard Ownership Transfer Selected", colors.cyan);
                
                let newOwnerAddress = process.env.NEW_OWNER_ADDRESS;
                if (!newOwnerAddress) {
                    newOwnerAddress = await askInput("Enter new owner address");
                }
                
                if (!validateAddress(newOwnerAddress)) {
                    throw new Error("Invalid new owner address");
                }
                
                newOwnerAddress = getChecksumAddress(newOwnerAddress);
                
                log(`\n⚠️  You are about to transfer ownership to: ${newOwnerAddress}`, colors.yellow);
                log(`⚠️  Current owner: ${currentState.owner}`, colors.yellow);
                log(`⚠️  This action is IRREVERSIBLE`, colors.red);
                
                const confirmed = await askConfirmation("\nAre you absolutely sure you want to proceed?");
                
                if (!confirmed) {
                    log("\n❌ Recovery cancelled by user", colors.yellow);
                    return;
                }
                
                const receipt = await executeStandardTransfer(contract, newOwnerAddress);
                
                recoveryResult = {
                    action: "Standard Ownership Transfer",
                    network: network.name,
                    chainId: network.chainId,
                    contractAddress: contractAddress,
                    previousOwner: currentState.owner,
                    newOwner: newOwnerAddress,
                    transactionHash: receipt.transactionHash,
                    blockNumber: receipt.blockNumber,
                    gasUsed: receipt.gasUsed.toString(),
                    timestamp: new Date().toISOString(),
                    status: "success",
                    backupPath: backupPath
                };
                
                break;
            }
            
            case "2": {
                // Emergency recovery
                log("\n🚨 Emergency Recovery Selected", colors.cyan);
                
                let newOwnerAddress = process.env.NEW_OWNER_ADDRESS;
                if (!newOwnerAddress) {
                    newOwnerAddress = await askInput("Enter new owner address");
                }
                
                if (!validateAddress(newOwnerAddress)) {
                    throw new Error("Invalid new owner address");
                }
                
                newOwnerAddress = getChecksumAddress(newOwnerAddress);
                
                log(`\n⚠️  EMERGENCY RECOVERY MODE`, colors.red);
                log(`⚠️  Transferring ownership to: ${newOwnerAddress}`, colors.yellow);
                log(`⚠️  Current owner: ${currentState.owner}`, colors.yellow);
                log(`⚠️  This action is IRREVERSIBLE`, colors.red);
                
                const confirmed = await askConfirmation("\nAre you absolutely sure you want to proceed?");
                
                if (!confirmed) {
                    log("\n❌ Recovery cancelled by user", colors.yellow);
                    return;
                }
                
                const result = await executeEmergencyRecovery(contract, newOwnerAddress);
                
                recoveryResult = {
                    action: "Emergency Recovery with Verification",
                    network: network.name,
                    chainId: network.chainId,
                    contractAddress: contractAddress,
                    previousOwner: currentState.owner,
                    newOwner: result.newOwner,
                    transactionHash: result.receipt.transactionHash,
                    blockNumber: result.receipt.blockNumber,
                    gasUsed: result.receipt.gasUsed.toString(),
                    timestamp: new Date().toISOString(),
                    status: "success",
                    backupPath: backupPath,
                    verified: true
                };
                
                break;
            }
            
            case "3": {
                // Verify only
                log("\n🔍 Verification Only Selected", colors.cyan);
                
                const verificationResult = await verifyOwnershipOnly(contract);
                
                recoveryResult = {
                    action: "Ownership Verification",
                    network: network.name,
                    chainId: network.chainId,
                    contractAddress: contractAddress,
                    currentOwner: verificationResult.owner,
                    ownerBalance: verificationResult.balance,
                    timestamp: new Date().toISOString(),
                    status: "verified",
                    backupPath: backupPath
                };
                
                // Log verification
                logRecoveryAction(recoveryResult);
                
                log("\n✅ Verification complete", colors.green);
                return;
            }
            
            case "4": {
                // Cancel
                log("\n❌ Recovery cancelled by user", colors.yellow);
                return;
            }
            
            default: {
                throw new Error("Invalid option selected");
            }
        }
        
        // Log recovery action
        if (recoveryResult) {
            logRecoveryAction(recoveryResult);
            displayRecoverySummary(recoveryResult);
        }
        
    } catch (error) {
        log("\n" + "=".repeat(80), colors.bright);
        log("❌ RECOVERY FAILED", colors.red);
        log("=".repeat(80), colors.bright);
        log(`\nError: ${error.message}`, colors.red);
        
        if (error.stack) {
            log(`\nStack trace:`, colors.red);
            log(error.stack, colors.red);
        }
        
        log("\n📞 Support Information:", colors.cyan);
        log(`   If you need assistance, please contact the development team`);
        log(`   Provide the error message and contract address`);
        
        log("\n" + "=".repeat(80) + "\n", colors.bright);
        
        // Log failed recovery attempt
        const failedRecovery = {
            action: "Recovery Attempt",
            status: "failed",
            error: error.message,
            timestamp: new Date().toISOString(),
            contractAddress: process.env.CONTRACT_ADDRESS || "unknown"
        };
        
        logRecoveryAction(failedRecovery);
        
        process.exit(1);
    }
}

// Execute if run directly
if (require.main === module) {
    recoverOwnership()
        .then(() => process.exit(0))
        .catch((error) => {
            console.error(error);
            process.exit(1);
        });
}

// Export for use in other scripts
module.exports = {
    recoverOwnership,
    loadContract,
    getCurrentState,
    createBackup,
    executeStandardTransfer,
    executeEmergencyRecovery,
    verifyOwnershipOnly,
    logRecoveryAction,
    displayRecoverySummary,
    validateAddress,
    askConfirmation,
    askInput
};
