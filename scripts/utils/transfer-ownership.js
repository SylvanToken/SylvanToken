/**
 * Ownership Transfer Utility Script
 * 
 * This script provides a standalone utility for transferring ownership of the SylvanToken contract
 * to a new owner address. It includes comprehensive validation, error handling, and logging.
 * 
 * Usage:
 *   npx hardhat run scripts/utils/transfer-ownership.js --network <network>
 * 
 * Environment Variables Required:
 *   - CONTRACT_ADDRESS: Address of the deployed SylvanToken contract
 *   - NEW_OWNER_ADDRESS: Address of the new owner
 * 
 * Features:
 *   - Contract loading and current owner retrieval
 *   - Address validation (zero address check, checksum validation)
 *   - Transaction execution with gas estimation
 *   - Post-transfer verification
 *   - Detailed logging for each step
 *   - Error handling with retry logic
 *   - Transaction record saving
 */

const hre = require("hardhat");
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
    cyan: "\x1b[36m"
};

/**
 * Log with color formatting
 */
function log(message, color = colors.reset) {
    console.log(`${color}${message}${colors.reset}`);
}

/**
 * Validate Ethereum address
 * @param {string} address - Address to validate
 * @returns {boolean} - True if valid, false otherwise
 */
function validateAddress(address) {
    // Check if address is defined and not empty
    if (!address || address === "") {
        return false;
    }
    
    // Check if it's a valid Ethereum address format
    if (!ethers.utils.isAddress(address)) {
        return false;
    }
    
    // Check if it's not the zero address
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
 * @param {string} contractAddress - Address of the deployed contract
 * @returns {Promise<Contract>} - Contract instance
 */
async function loadContract(contractAddress) {
    log("\n📋 Loading Contract...", colors.cyan);
    log(`Contract Address: ${contractAddress}`);
    
    try {
        // Validate contract address
        if (!validateAddress(contractAddress)) {
            throw new Error("Invalid contract address");
        }
        
        // Get checksummed address
        const checksummedAddress = getChecksumAddress(contractAddress);
        
        // Load contract
        const contract = await ethers.getContractAt("SylvanToken", checksummedAddress);
        
        // Verify contract exists by checking code
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
 * Get current owner of the contract
 * @param {Contract} contract - Contract instance
 * @returns {Promise<string>} - Current owner address
 */
async function getCurrentOwner(contract) {
    log("\n🔍 Retrieving Current Owner...", colors.cyan);
    
    try {
        const currentOwner = await contract.owner();
        log(`Current Owner: ${currentOwner}`, colors.bright);
        return currentOwner;
    } catch (error) {
        log(`❌ Error retrieving current owner: ${error.message}`, colors.red);
        throw error;
    }
}

/**
 * Validate new owner address
 * @param {string} newOwnerAddress - New owner address to validate
 * @param {string} currentOwner - Current owner address
 * @returns {string} - Validated and checksummed new owner address
 */
function validateNewOwner(newOwnerAddress, currentOwner) {
    log("\n✅ Validating New Owner Address...", colors.cyan);
    log(`New Owner Address: ${newOwnerAddress}`);
    
    // Check if address is valid
    if (!validateAddress(newOwnerAddress)) {
        throw new Error("Invalid new owner address: Cannot be zero address or invalid format");
    }
    
    // Get checksummed address
    const checksummedAddress = getChecksumAddress(newOwnerAddress);
    
    // Check if new owner is different from current owner
    if (checksummedAddress.toLowerCase() === currentOwner.toLowerCase()) {
        log("⚠️  Warning: New owner is the same as current owner", colors.yellow);
        log("No transfer needed", colors.yellow);
        return null;
    }
    
    log("✅ New owner address is valid", colors.green);
    return checksummedAddress;
}

/**
 * Handle specific transfer errors with user-friendly messages
 * @param {Error} error - Error object
 * @returns {Object} - Error details with retry flag
 */
function handleTransferError(error) {
    const errorMessage = error.message || error.toString();
    
    // Zero address rejection
    if (errorMessage.includes("Ownable: new owner is the zero address") || 
        errorMessage.includes("zero address")) {
        return {
            type: "ZERO_ADDRESS",
            message: "Cannot transfer ownership to zero address (0x0000...0000)",
            userMessage: "The new owner address cannot be the zero address. Please provide a valid address.",
            shouldRetry: false,
            critical: true
        };
    }
    
    // Non-owner caller rejection
    if (errorMessage.includes("Ownable: caller is not the owner") || 
        errorMessage.includes("not the owner")) {
        return {
            type: "NOT_OWNER",
            message: "Current signer is not the contract owner",
            userMessage: "Only the current contract owner can transfer ownership. Please use the owner's private key.",
            shouldRetry: false,
            critical: true
        };
    }
    
    // Insufficient gas
    if (errorMessage.includes("out of gas") || 
        errorMessage.includes("gas required exceeds allowance")) {
        return {
            type: "INSUFFICIENT_GAS",
            message: "Transaction ran out of gas",
            userMessage: "The transaction failed due to insufficient gas. Retrying with higher gas limit...",
            shouldRetry: true,
            critical: false
        };
    }
    
    // Network errors
    if (errorMessage.includes("network") || 
        errorMessage.includes("timeout") || 
        errorMessage.includes("connection")) {
        return {
            type: "NETWORK_ERROR",
            message: "Network connection issue",
            userMessage: "Network connection failed. Retrying...",
            shouldRetry: true,
            critical: false
        };
    }
    
    // Nonce errors
    if (errorMessage.includes("nonce") || 
        errorMessage.includes("replacement transaction underpriced")) {
        return {
            type: "NONCE_ERROR",
            message: "Transaction nonce issue",
            userMessage: "Transaction nonce conflict detected. Retrying with updated nonce...",
            shouldRetry: true,
            critical: false
        };
    }
    
    // Insufficient funds
    if (errorMessage.includes("insufficient funds") || 
        errorMessage.includes("insufficient balance")) {
        return {
            type: "INSUFFICIENT_FUNDS",
            message: "Insufficient funds for transaction",
            userMessage: "The signer wallet does not have enough BNB to pay for gas fees.",
            shouldRetry: false,
            critical: true
        };
    }
    
    // Transaction reverted
    if (errorMessage.includes("reverted") || 
        errorMessage.includes("execution reverted")) {
        return {
            type: "TRANSACTION_REVERTED",
            message: "Transaction was reverted by the contract",
            userMessage: "The transaction was reverted. This may indicate a contract-level restriction.",
            shouldRetry: false,
            critical: true
        };
    }
    
    // Generic error
    return {
        type: "UNKNOWN_ERROR",
        message: errorMessage,
        userMessage: "An unexpected error occurred. Check the error details below.",
        shouldRetry: true,
        critical: false
    };
}

/**
 * Execute ownership transfer transaction with comprehensive error handling
 * @param {Contract} contract - Contract instance
 * @param {string} newOwnerAddress - New owner address
 * @param {number} maxRetries - Maximum number of retry attempts
 * @returns {Promise<Object>} - Transaction receipt
 */
async function executeTransfer(contract, newOwnerAddress, maxRetries = 3) {
    log("\n🔄 Executing Ownership Transfer...", colors.cyan);
    log(`Transferring to: ${newOwnerAddress}`);
    
    let attempt = 0;
    let lastError;
    let gasMultiplier = 120; // Start with 20% buffer
    
    while (attempt < maxRetries) {
        try {
            attempt++;
            if (attempt > 1) {
                log(`\nRetry attempt ${attempt}/${maxRetries}...`, colors.yellow);
                // Increase gas buffer on retries
                gasMultiplier += 10;
            }
            
            // Estimate gas for the transaction
            log("Estimating gas...");
            const gasEstimate = await contract.estimateGas.transferOwnership(newOwnerAddress);
            const gasLimit = gasEstimate.mul(gasMultiplier).div(100);
            log(`Estimated gas: ${gasEstimate.toString()}`);
            log(`Gas limit (with ${gasMultiplier - 100}% buffer): ${gasLimit.toString()}`);
            
            // Execute transfer
            log("Sending transaction...");
            const tx = await contract.transferOwnership(newOwnerAddress, {
                gasLimit: gasLimit
            });
            
            log(`Transaction sent: ${tx.hash}`, colors.bright);
            log("Waiting for confirmation...");
            
            // Wait for transaction confirmation
            const receipt = await tx.wait();
            
            log(`✅ Transaction confirmed in block ${receipt.blockNumber}`, colors.green);
            log(`Gas used: ${receipt.gasUsed.toString()}`);
            
            return receipt;
            
        } catch (error) {
            lastError = error;
            
            // Handle error with detailed analysis
            const errorDetails = handleTransferError(error);
            
            log(`\n❌ Error Type: ${errorDetails.type}`, colors.red);
            log(`📝 ${errorDetails.userMessage}`, colors.yellow);
            
            if (errorDetails.critical) {
                log(`\n🚨 Critical Error - Cannot proceed`, colors.red);
                log(`Details: ${errorDetails.message}`, colors.red);
                throw new Error(errorDetails.userMessage);
            }
            
            if (!errorDetails.shouldRetry || attempt >= maxRetries) {
                if (attempt >= maxRetries) {
                    log(`\n❌ Maximum retry attempts (${maxRetries}) reached`, colors.red);
                }
                break;
            }
            
            // Wait before retry with exponential backoff
            const waitTime = Math.min(5000 * attempt, 15000); // Max 15 seconds
            log(`⏳ Waiting ${waitTime / 1000} seconds before retry...`, colors.yellow);
            await new Promise(resolve => setTimeout(resolve, waitTime));
        }
    }
    
    // All retries failed
    log(`\n❌ Transfer failed after ${attempt} attempt(s)`, colors.red);
    const finalErrorDetails = handleTransferError(lastError);
    log(`\nFinal Error: ${finalErrorDetails.message}`, colors.red);
    log(`\nTroubleshooting Tips:`, colors.yellow);
    log(`  1. Verify you are using the correct owner private key`, colors.yellow);
    log(`  2. Ensure the new owner address is valid and not zero address`, colors.yellow);
    log(`  3. Check that your wallet has sufficient BNB for gas fees`, colors.yellow);
    log(`  4. Verify network connectivity and RPC endpoint`, colors.yellow);
    
    throw lastError;
}

/**
 * Verify ownership transfer
 * @param {Contract} contract - Contract instance
 * @param {string} expectedOwner - Expected new owner address
 * @returns {Promise<boolean>} - True if verification successful
 */
async function verifyTransfer(contract, expectedOwner) {
    log("\n🔍 Verifying Ownership Transfer...", colors.cyan);
    
    try {
        const currentOwner = await contract.owner();
        log(`Current Owner: ${currentOwner}`);
        log(`Expected Owner: ${expectedOwner}`);
        
        if (currentOwner.toLowerCase() === expectedOwner.toLowerCase()) {
            log("✅ Ownership transfer verified successfully!", colors.green);
            return true;
        } else {
            log("❌ Ownership verification failed!", colors.red);
            log(`Owner mismatch: expected ${expectedOwner}, got ${currentOwner}`, colors.red);
            return false;
        }
    } catch (error) {
        log(`❌ Error verifying ownership: ${error.message}`, colors.red);
        throw error;
    }
}

/**
 * Display transfer confirmation details
 * @param {string} currentOwner - Current owner address
 * @param {string} newOwner - New owner address
 * @param {string} contractAddress - Contract address
 */
function displayTransferConfirmation(currentOwner, newOwner, contractAddress) {
    log("\n" + "=".repeat(70), colors.bright);
    log("📋 OWNERSHIP TRANSFER CONFIRMATION", colors.cyan);
    log("=".repeat(70), colors.bright);
    
    log("\n📍 Contract Information:", colors.cyan);
    log(`   Contract Address: ${contractAddress}`);
    
    log("\n👤 Ownership Change:", colors.cyan);
    log(`   Current Owner:  ${currentOwner}`, colors.yellow);
    log(`   ↓`);
    log(`   New Owner:      ${newOwner}`, colors.green);
    
    log("\n⚠️  Important Notes:", colors.yellow);
    log(`   • This action is irreversible`);
    log(`   • Only the new owner will be able to call admin functions`);
    log(`   • The current owner will lose all administrative privileges`);
    log(`   • Make sure you have verified the new owner address`);
    
    log("\n" + "=".repeat(70) + "\n", colors.bright);
}

/**
 * Display transaction details
 * @param {Object} receipt - Transaction receipt
 * @param {string} newOwner - New owner address
 */
function displayTransactionDetails(receipt, newOwner) {
    log("\n" + "=".repeat(70), colors.bright);
    log("📊 TRANSACTION DETAILS", colors.cyan);
    log("=".repeat(70), colors.bright);
    
    log("\n✅ Status: SUCCESS", colors.green);
    
    log("\n🔗 Transaction Information:", colors.cyan);
    log(`   Transaction Hash: ${receipt.transactionHash}`);
    log(`   Block Number:     ${receipt.blockNumber}`);
    log(`   Gas Used:         ${receipt.gasUsed.toString()}`);
    
    // Calculate effective gas price if available
    if (receipt.effectiveGasPrice) {
        const gasCost = receipt.gasUsed.mul(receipt.effectiveGasPrice);
        log(`   Gas Price:        ${ethers.utils.formatUnits(receipt.effectiveGasPrice, "gwei")} Gwei`);
        log(`   Total Cost:       ${ethers.utils.formatEther(gasCost)} BNB`);
    }
    
    log("\n👤 New Owner:", colors.cyan);
    log(`   Address: ${newOwner}`, colors.green);
    
    // Check for OwnershipTransferred event
    if (receipt.events && receipt.events.length > 0) {
        const ownershipEvent = receipt.events.find(e => e.event === "OwnershipTransferred");
        if (ownershipEvent) {
            log("\n📢 Events Emitted:", colors.cyan);
            log(`   ✓ OwnershipTransferred`);
            log(`     Previous Owner: ${ownershipEvent.args.previousOwner}`);
            log(`     New Owner:      ${ownershipEvent.args.newOwner}`);
        }
    }
    
    log("\n" + "=".repeat(70) + "\n", colors.bright);
}

/**
 * Save transfer record to deployment logs with comprehensive details
 * @param {Object} transferData - Transfer data to save
 * @returns {string} - Path to saved file
 */
function saveTransferRecord(transferData) {
    log("\n💾 Saving Transfer Record...", colors.cyan);
    
    try {
        const deploymentsDir = path.join(__dirname, "../../deployments");
        
        // Create deployments directory if it doesn't exist
        if (!fs.existsSync(deploymentsDir)) {
            fs.mkdirSync(deploymentsDir, { recursive: true });
        }
        
        // Create filename with timestamp
        const timestamp = Date.now();
        const filename = `ownership-transfer-${timestamp}.json`;
        const filepath = path.join(deploymentsDir, filename);
        
        // Enhance transfer data with additional metadata
        const enhancedData = {
            ...transferData,
            recordType: "ownership-transfer",
            version: "1.0.0",
            savedAt: new Date().toISOString(),
            status: "completed"
        };
        
        // Save transfer data
        fs.writeFileSync(filepath, JSON.stringify(enhancedData, null, 2));
        
        log(`✅ Transfer record saved: ${filename}`, colors.green);
        log(`   Location: ${filepath}`);
        
        // Also append to a master log file
        const masterLogPath = path.join(deploymentsDir, "ownership-transfers.log");
        const logEntry = `[${transferData.timestamp}] ${transferData.contractAddress}: ${transferData.previousOwner} → ${transferData.newOwner} (TX: ${transferData.transactionHash})\n`;
        
        fs.appendFileSync(masterLogPath, logEntry);
        log(`✅ Entry added to master log`, colors.green);
        
        return filepath;
    } catch (error) {
        log(`⚠️  Warning: Could not save transfer record: ${error.message}`, colors.yellow);
        log(`   Transfer was successful, but record saving failed`, colors.yellow);
        // Don't throw - this is not critical
        return null;
    }
}

/**
 * Display success summary
 * @param {Object} transferData - Transfer data
 */
function displaySuccessSummary(transferData) {
    log("\n" + "=".repeat(70), colors.bright);
    log("✅ OWNERSHIP TRANSFER COMPLETED SUCCESSFULLY", colors.green);
    log("=".repeat(70), colors.bright);
    
    log("\n📋 Summary:", colors.cyan);
    log(`   Network:          ${transferData.network} (Chain ID: ${transferData.chainId})`);
    log(`   Contract:         ${transferData.contractAddress}`);
    log(`   Previous Owner:   ${transferData.previousOwner}`);
    log(`   New Owner:        ${transferData.newOwner}`, colors.green);
    log(`   Transaction:      ${transferData.transactionHash}`);
    log(`   Block:            ${transferData.blockNumber}`);
    log(`   Gas Used:         ${transferData.gasUsed}`);
    log(`   Timestamp:        ${transferData.timestamp}`);
    
    log("\n✅ Next Steps:", colors.cyan);
    log(`   1. Verify the new owner can access admin functions`);
    log(`   2. Test an admin function call with the new owner wallet`);
    log(`   3. Ensure the previous owner no longer has access`);
    log(`   4. Update your documentation with the new owner address`);
    log(`   5. Backup the new owner's private key securely`);
    
    log("\n" + "=".repeat(70) + "\n", colors.bright);
}

/**
 * Main transfer ownership function
 */
async function transferOwnership() {
    log("\n" + "=".repeat(70), colors.bright);
    log("🔐 SYLVANTOKEN OWNERSHIP TRANSFER UTILITY", colors.bright);
    log("=".repeat(70) + "\n", colors.bright);
    
    try {
        // Get network information
        const network = await ethers.provider.getNetwork();
        log(`Network: ${network.name} (Chain ID: ${network.chainId})`, colors.cyan);
        
        // Get signer
        const [signer] = await ethers.getSigners();
        log(`Signer Address: ${signer.address}`, colors.cyan);
        
        const balance = await signer.getBalance();
        log(`Signer Balance: ${ethers.utils.formatEther(balance)} BNB\n`, colors.cyan);
        
        // Get contract address from environment or command line
        const contractAddress = process.env.CONTRACT_ADDRESS;
        if (!contractAddress) {
            throw new Error("CONTRACT_ADDRESS environment variable not set");
        }
        
        // Get new owner address from environment or command line
        const newOwnerAddress = process.env.NEW_OWNER_ADDRESS;
        if (!newOwnerAddress) {
            throw new Error("NEW_OWNER_ADDRESS environment variable not set");
        }
        
        // Step 1: Load contract
        const contract = await loadContract(contractAddress);
        
        // Step 2: Get current owner
        const currentOwner = await getCurrentOwner(contract);
        
        // Step 3: Validate new owner address
        const validatedNewOwner = validateNewOwner(newOwnerAddress, currentOwner);
        
        // If new owner is same as current owner, exit
        if (!validatedNewOwner) {
            log("\n✅ No action needed - already correct owner", colors.green);
            return;
        }
        
        // Step 4: Verify signer is current owner
        if (signer.address.toLowerCase() !== currentOwner.toLowerCase()) {
            throw new Error(
                `Signer (${signer.address}) is not the current owner (${currentOwner}). ` +
                `Only the current owner can transfer ownership.`
            );
        }
        
        // Step 5: Display transfer confirmation
        displayTransferConfirmation(currentOwner, validatedNewOwner, contractAddress);
        
        // Step 6: Execute transfer
        const receipt = await executeTransfer(contract, validatedNewOwner);
        
        // Step 7: Display transaction details
        displayTransactionDetails(receipt, validatedNewOwner);
        
        // Step 8: Verify transfer
        const verified = await verifyTransfer(contract, validatedNewOwner);
        
        if (!verified) {
            throw new Error("Ownership transfer verification failed");
        }
        
        // Step 9: Save transfer record
        const transferData = {
            network: network.name,
            chainId: network.chainId,
            timestamp: new Date().toISOString(),
            contractAddress: contractAddress,
            previousOwner: currentOwner,
            newOwner: validatedNewOwner,
            transactionHash: receipt.transactionHash,
            blockNumber: receipt.blockNumber,
            gasUsed: receipt.gasUsed.toString(),
            effectiveGasPrice: receipt.effectiveGasPrice ? receipt.effectiveGasPrice.toString() : null,
            signer: signer.address,
            events: receipt.events ? receipt.events.map(e => ({
                event: e.event,
                args: e.args ? Object.keys(e.args).reduce((acc, key) => {
                    if (isNaN(key)) acc[key] = e.args[key].toString();
                    return acc;
                }, {}) : {}
            })) : []
        };
        
        saveTransferRecord(transferData);
        
        // Step 10: Display success summary
        displaySuccessSummary(transferData);
        
    } catch (error) {
        log("\n" + "=".repeat(70), colors.bright);
        log("❌ OWNERSHIP TRANSFER FAILED", colors.red);
        log("=".repeat(70), colors.bright);
        log(`\nError: ${error.message}`, colors.red);
        
        if (error.stack) {
            log(`\nStack trace:`, colors.red);
            log(error.stack, colors.red);
        }
        
        log("\n" + "=".repeat(70) + "\n", colors.bright);
        
        process.exit(1);
    }
}

// Execute if run directly
if (require.main === module) {
    transferOwnership()
        .then(() => process.exit(0))
        .catch((error) => {
            console.error(error);
            process.exit(1);
        });
}

// Export for use in other scripts
module.exports = {
    transferOwnership,
    loadContract,
    getCurrentOwner,
    validateAddress,
    validateNewOwner,
    executeTransfer,
    verifyTransfer,
    saveTransferRecord,
    handleTransferError,
    displayTransferConfirmation,
    displayTransactionDetails,
    displaySuccessSummary
};
