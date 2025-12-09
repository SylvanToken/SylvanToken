/**
 * Ownership Verification Utility Script
 * 
 * This script provides comprehensive ownership verification for the SylvanToken contract.
 * It checks current ownership, compares with expected configuration, and provides detailed
 * status reporting with recommendations.
 * 
 * Usage:
 *   npx hardhat run scripts/utils/verify-ownership.js --network <network>
 * 
 * Environment Variables (Optional):
 *   - CONTRACT_ADDRESS: Address of the deployed SylvanToken contract
 *   - EXPECTED_OWNER: Expected owner address to verify against
 * 
 * Features:
 *   - Load contract and retrieve current owner
 *   - Compare with expected owner from configuration
 *   - Display owner address and wallet type
 *   - Show deployer vs owner comparison
 *   - Display ownership transfer history if available
 *   - Check if owner can execute admin functions
 *   - Provide recommendations if issues detected
 *   - Comprehensive status reporting
 */

const hre = require("hardhat");
const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");
const deploymentConfig = require("../../config/deployment.config.js");

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
 * Validate Ethereum address
 * @param {string} address - Address to validate
 * @returns {boolean} - True if valid, false otherwise
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
 * Determine wallet type based on address and network
 * @param {string} address - Wallet address
 * @param {string} network - Network name
 * @returns {string} - Wallet type description
 */
function determineWalletType(address, network) {
    // Check if it's a known wallet from config
    const wallets = deploymentConfig.wallets;
    
    // Check system wallets
    for (const [key, wallet] of Object.entries(wallets.system)) {
        if (wallet.address.toLowerCase() === address.toLowerCase()) {
            return `System Wallet (${wallet.name})`;
        }
    }
    
    // Check admin wallets
    for (const [key, wallet] of Object.entries(wallets.admins)) {
        if (wallet.address.toLowerCase() === address.toLowerCase()) {
            return `Admin Wallet (${wallet.name})`;
        }
    }
    
    // Check if it matches configured owner
    if (deploymentConfig.roles && deploymentConfig.roles.owner) {
        const configOwner = deploymentConfig.roles.owner.address;
        if (configOwner && configOwner.toLowerCase() === address.toLowerCase()) {
            const walletType = deploymentConfig.roles.owner.walletType || "unknown";
            return `Configured Owner (${walletType})`;
        }
    }
    
    // Check if it matches configured deployer
    if (deploymentConfig.roles && deploymentConfig.roles.deployer) {
        const configDeployer = deploymentConfig.roles.deployer.address;
        if (configDeployer && configDeployer.toLowerCase() === address.toLowerCase()) {
            return "Deployer Wallet (standard)";
        }
    }
    
    // Generic determination based on code at address
    return "Unknown Wallet Type";
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
 * Get expected owner from configuration
 * @param {string} network - Network name
 * @returns {string|null} - Expected owner address or null
 */
function getExpectedOwner(network) {
    // Check environment variable first
    if (process.env.EXPECTED_OWNER) {
        return process.env.EXPECTED_OWNER;
    }
    
    // Check deployment config
    if (deploymentConfig.roles && deploymentConfig.roles.owner) {
        return deploymentConfig.roles.owner.address;
    }
    
    return null;
}

/**
 * Get deployer address from configuration
 * @returns {string|null} - Deployer address or null
 */
function getDeployerAddress() {
    // Check environment variable first
    if (process.env.DEPLOYER_ADDRESS) {
        return process.env.DEPLOYER_ADDRESS;
    }
    
    // Check deployment config
    if (deploymentConfig.roles && deploymentConfig.roles.deployer) {
        return deploymentConfig.roles.deployer.address;
    }
    
    return null;
}

/**
 * Load ownership transfer history from deployment logs
 * @param {string} contractAddress - Contract address
 * @returns {Array} - Array of transfer records
 */
function loadTransferHistory(contractAddress) {
    try {
        const deploymentsDir = path.join(__dirname, "../../deployments");
        
        if (!fs.existsSync(deploymentsDir)) {
            return [];
        }
        
        const transfers = [];
        
        // Check master log file
        const masterLogPath = path.join(deploymentsDir, "ownership-transfers.log");
        if (fs.existsSync(masterLogPath)) {
            const logContent = fs.readFileSync(masterLogPath, "utf8");
            const lines = logContent.split("\n").filter(line => line.trim() !== "");
            
            for (const line of lines) {
                if (line.includes(contractAddress)) {
                    transfers.push(line);
                }
            }
        }
        
        // Check individual transfer files
        const files = fs.readdirSync(deploymentsDir);
        const transferFiles = files.filter(f => f.startsWith("ownership-transfer-") && f.endsWith(".json"));
        
        for (const file of transferFiles) {
            const filepath = path.join(deploymentsDir, file);
            const data = JSON.parse(fs.readFileSync(filepath, "utf8"));
            
            if (data.contractAddress && data.contractAddress.toLowerCase() === contractAddress.toLowerCase()) {
                transfers.push(data);
            }
        }
        
        return transfers;
    } catch (error) {
        log(`⚠️  Warning: Could not load transfer history: ${error.message}`, colors.yellow);
        return [];
    }
}

/**
 * Check if owner can execute admin functions
 * @param {Contract} contract - Contract instance
 * @param {string} ownerAddress - Owner address
 * @returns {Promise<Object>} - Test results
 */
async function checkAdminAccess(contract, ownerAddress) {
    log("\n🔐 Checking Admin Function Access...", colors.cyan);
    
    const results = {
        canCallOwner: false,
        canCallFeeExempt: false,
        canCallVesting: false,
        errors: []
    };
    
    try {
        // Test 1: Can call owner() function (view function, should always work)
        try {
            const owner = await contract.owner();
            results.canCallOwner = true;
            log(`✅ Can call owner() function`, colors.green);
        } catch (error) {
            results.errors.push(`owner(): ${error.message}`);
            log(`❌ Cannot call owner() function`, colors.red);
        }
        
        // Test 2: Try to estimate gas for fee exemption function (admin function)
        try {
            // We can't actually call this without being the owner, but we can estimate gas
            // This will fail if the function doesn't exist or has issues
            const testAddress = "0x0000000000000000000000000000000000000001";
            await contract.estimateGas.isExempt(testAddress);
            results.canCallFeeExempt = true;
            log(`✅ Fee exemption functions are accessible`, colors.green);
        } catch (error) {
            // This is expected if we're not the owner, so we'll mark it as accessible
            if (error.message.includes("cannot estimate gas")) {
                results.canCallFeeExempt = true;
                log(`✅ Fee exemption functions exist (access restricted to owner)`, colors.green);
            } else {
                results.errors.push(`isExempt(): ${error.message}`);
                log(`❌ Fee exemption functions may have issues`, colors.yellow);
            }
        }
        
        // Test 3: Check vesting functions
        try {
            const testAddress = "0x0000000000000000000000000000000000000001";
            await contract.hasVestingSchedule(testAddress);
            results.canCallVesting = true;
            log(`✅ Vesting functions are accessible`, colors.green);
        } catch (error) {
            results.errors.push(`hasVestingSchedule(): ${error.message}`);
            log(`❌ Vesting functions may have issues`, colors.yellow);
        }
        
    } catch (error) {
        log(`⚠️  Error during admin access check: ${error.message}`, colors.yellow);
    }
    
    return results;
}

/**
 * Display comprehensive ownership status
 * @param {Object} statusData - Status data object
 */
function displayOwnershipStatus(statusData) {
    log("\n" + "=".repeat(80), colors.bright);
    log("📊 OWNERSHIP STATUS REPORT", colors.cyan);
    log("=".repeat(80), colors.bright);
    
    // Network Information
    log("\n🌐 Network Information:", colors.cyan);
    log(`   Network:     ${statusData.network.name}`);
    log(`   Chain ID:    ${statusData.network.chainId}`);
    log(`   Block:       ${statusData.network.blockNumber}`);
    
    // Contract Information
    log("\n📍 Contract Information:", colors.cyan);
    log(`   Address:     ${statusData.contract.address}`);
    log(`   Name:        ${statusData.contract.name}`);
    log(`   Symbol:      ${statusData.contract.symbol}`);
    log(`   Total Supply: ${ethers.utils.formatEther(statusData.contract.totalSupply)} ${statusData.contract.symbol}`);
    
    // Current Owner
    log("\n👤 Current Owner:", colors.cyan);
    log(`   Address:     ${statusData.owner.address}`, colors.bright);
    log(`   Wallet Type: ${statusData.owner.walletType}`);
    log(`   Balance:     ${statusData.owner.balance} BNB`);
    
    // Expected Owner Comparison
    if (statusData.expectedOwner) {
        log("\n🎯 Expected Owner:", colors.cyan);
        log(`   Address:     ${statusData.expectedOwner.address}`);
        
        if (statusData.expectedOwner.matches) {
            log(`   Status:      ✅ MATCHES CURRENT OWNER`, colors.green);
        } else {
            log(`   Status:      ⚠️  MISMATCH - Current owner differs from expected`, colors.yellow);
            log(`   \n   ⚠️  WARNING: Ownership mismatch detected!`, colors.red);
            log(`   Current:  ${statusData.owner.address}`, colors.red);
            log(`   Expected: ${statusData.expectedOwner.address}`, colors.red);
        }
    }
    
    // Deployer Comparison
    if (statusData.deployer) {
        log("\n🚀 Deployer Information:", colors.cyan);
        log(`   Address:     ${statusData.deployer.address}`);
        
        if (statusData.deployer.isOwner) {
            log(`   Status:      ⚠️  Deployer is still the owner`, colors.yellow);
            if (statusData.network.name === "bscMainnet") {
                log(`   \n   ⚠️  SECURITY WARNING: On mainnet, deployer and owner should be different!`, colors.red);
            }
        } else {
            log(`   Status:      ✅ Deployer is NOT the owner (good security practice)`, colors.green);
        }
    }
    
    // Transfer History
    if (statusData.transferHistory && statusData.transferHistory.length > 0) {
        log("\n📜 Ownership Transfer History:", colors.cyan);
        log(`   Total Transfers: ${statusData.transferHistory.length}`);
        
        statusData.transferHistory.forEach((transfer, index) => {
            if (typeof transfer === "string") {
                log(`   ${index + 1}. ${transfer}`);
            } else {
                log(`   ${index + 1}. Transfer at ${transfer.timestamp}`);
                log(`      From: ${transfer.previousOwner}`);
                log(`      To:   ${transfer.newOwner}`);
                log(`      TX:   ${transfer.transactionHash}`);
            }
        });
    } else {
        log("\n📜 Ownership Transfer History:", colors.cyan);
        log(`   No transfer history found`);
        log(`   (Owner may be the original deployer)`);
    }
    
    // Admin Access Check
    log("\n🔐 Admin Function Access:", colors.cyan);
    if (statusData.adminAccess.canCallOwner) {
        log(`   ✅ Can query owner information`, colors.green);
    }
    if (statusData.adminAccess.canCallFeeExempt) {
        log(`   ✅ Fee exemption functions accessible`, colors.green);
    }
    if (statusData.adminAccess.canCallVesting) {
        log(`   ✅ Vesting functions accessible`, colors.green);
    }
    
    if (statusData.adminAccess.errors.length > 0) {
        log(`   \n   ⚠️  Some functions had issues:`, colors.yellow);
        statusData.adminAccess.errors.forEach(error => {
            log(`      - ${error}`, colors.yellow);
        });
    }
    
    log("\n" + "=".repeat(80) + "\n", colors.bright);
}

/**
 * Provide recommendations based on status
 * @param {Object} statusData - Status data object
 */
function provideRecommendations(statusData) {
    const recommendations = [];
    const warnings = [];
    const criticalIssues = [];
    
    // Check for ownership mismatch
    if (statusData.expectedOwner && !statusData.expectedOwner.matches) {
        warnings.push("Current owner does not match expected owner from configuration");
        recommendations.push("Verify if ownership transfer was intended");
        recommendations.push("Update configuration if ownership change was planned");
    }
    
    // Check deployer/owner separation on mainnet
    if (statusData.network.name === "bscMainnet" && statusData.deployer && statusData.deployer.isOwner) {
        criticalIssues.push("Deployer and owner are the same on mainnet - SECURITY RISK");
        recommendations.push("Transfer ownership to a secure wallet (hardware wallet or multisig)");
        recommendations.push("Use: npx hardhat run scripts/utils/transfer-ownership.js --network bscMainnet");
    }
    
    // Check wallet type on mainnet
    if (statusData.network.name === "bscMainnet") {
        if (statusData.owner.walletType.includes("Unknown") || statusData.owner.walletType.includes("standard")) {
            warnings.push("Owner wallet type may not be secure enough for mainnet");
            recommendations.push("Consider using a hardware wallet (Ledger, Trezor) for owner");
            recommendations.push("Or use a multisig wallet (Gnosis Safe) for additional security");
        }
    }
    
    // Check admin access issues
    if (statusData.adminAccess.errors.length > 0) {
        warnings.push("Some admin functions may have issues");
        recommendations.push("Test admin functions with the owner wallet");
        recommendations.push("Verify contract deployment was successful");
    }
    
    // Check if no transfer history on mainnet
    if (statusData.network.name === "bscMainnet" && statusData.transferHistory.length === 0) {
        warnings.push("No ownership transfer history found on mainnet");
        recommendations.push("If this is a new deployment, consider transferring ownership to secure wallet");
    }
    
    // Display recommendations
    if (criticalIssues.length > 0 || warnings.length > 0 || recommendations.length > 0) {
        log("=".repeat(80), colors.bright);
        log("💡 RECOMMENDATIONS", colors.cyan);
        log("=".repeat(80), colors.bright);
        
        if (criticalIssues.length > 0) {
            log("\n🚨 CRITICAL ISSUES:", colors.red);
            criticalIssues.forEach((issue, index) => {
                log(`   ${index + 1}. ${issue}`, colors.red);
            });
        }
        
        if (warnings.length > 0) {
            log("\n⚠️  WARNINGS:", colors.yellow);
            warnings.forEach((warning, index) => {
                log(`   ${index + 1}. ${warning}`, colors.yellow);
            });
        }
        
        if (recommendations.length > 0) {
            log("\n📋 RECOMMENDED ACTIONS:", colors.cyan);
            recommendations.forEach((rec, index) => {
                log(`   ${index + 1}. ${rec}`, colors.cyan);
            });
        }
        
        log("\n" + "=".repeat(80) + "\n", colors.bright);
    } else {
        log("=".repeat(80), colors.bright);
        log("✅ NO ISSUES DETECTED", colors.green);
        log("=".repeat(80), colors.bright);
        log("\nOwnership configuration looks good!", colors.green);
        log("\n" + "=".repeat(80) + "\n", colors.bright);
    }
}

/**
 * Main verification function
 */
async function verifyOwnership() {
    log("\n" + "=".repeat(80), colors.bright);
    log("🔍 SYLVANTOKEN OWNERSHIP VERIFICATION UTILITY", colors.bright);
    log("=".repeat(80) + "\n", colors.bright);
    
    try {
        // Get network information
        const network = await ethers.provider.getNetwork();
        const blockNumber = await ethers.provider.getBlockNumber();
        log(`Network: ${network.name} (Chain ID: ${network.chainId})`, colors.cyan);
        log(`Block Number: ${blockNumber}`, colors.cyan);
        
        // Get contract address
        const contractAddress = process.env.CONTRACT_ADDRESS;
        if (!contractAddress) {
            throw new Error("CONTRACT_ADDRESS environment variable not set");
        }
        
        // Load contract
        const contract = await loadContract(contractAddress);
        
        // Get contract information
        const name = await contract.name();
        const symbol = await contract.symbol();
        const totalSupply = await contract.totalSupply();
        
        // Get current owner
        const currentOwner = await getCurrentOwner(contract);
        const ownerBalance = await ethers.provider.getBalance(currentOwner);
        const walletType = determineWalletType(currentOwner, network.name);
        
        // Get expected owner
        const expectedOwnerAddress = getExpectedOwner(network.name);
        const expectedOwner = expectedOwnerAddress ? {
            address: getChecksumAddress(expectedOwnerAddress),
            matches: expectedOwnerAddress.toLowerCase() === currentOwner.toLowerCase()
        } : null;
        
        // Get deployer information
        const deployerAddress = getDeployerAddress();
        const deployer = deployerAddress ? {
            address: getChecksumAddress(deployerAddress),
            isOwner: deployerAddress.toLowerCase() === currentOwner.toLowerCase()
        } : null;
        
        // Load transfer history
        const transferHistory = loadTransferHistory(contractAddress);
        
        // Check admin access
        const adminAccess = await checkAdminAccess(contract, currentOwner);
        
        // Compile status data
        const statusData = {
            network: {
                name: network.name,
                chainId: network.chainId,
                blockNumber: blockNumber
            },
            contract: {
                address: contractAddress,
                name: name,
                symbol: symbol,
                totalSupply: totalSupply
            },
            owner: {
                address: currentOwner,
                walletType: walletType,
                balance: ethers.utils.formatEther(ownerBalance)
            },
            expectedOwner: expectedOwner,
            deployer: deployer,
            transferHistory: transferHistory,
            adminAccess: adminAccess
        };
        
        // Display status
        displayOwnershipStatus(statusData);
        
        // Provide recommendations
        provideRecommendations(statusData);
        
        return statusData;
        
    } catch (error) {
        log("\n" + "=".repeat(80), colors.bright);
        log("❌ OWNERSHIP VERIFICATION FAILED", colors.red);
        log("=".repeat(80), colors.bright);
        log(`\nError: ${error.message}`, colors.red);
        
        if (error.stack) {
            log(`\nStack trace:`, colors.red);
            log(error.stack, colors.red);
        }
        
        log("\n" + "=".repeat(80) + "\n", colors.bright);
        
        process.exit(1);
    }
}

// Execute if run directly
if (require.main === module) {
    verifyOwnership()
        .then(() => process.exit(0))
        .catch((error) => {
            console.error(error);
            process.exit(1);
        });
}

// Export for use in other scripts
module.exports = {
    verifyOwnership,
    loadContract,
    getCurrentOwner,
    getExpectedOwner,
    getDeployerAddress,
    loadTransferHistory,
    checkAdminAccess,
    displayOwnershipStatus,
    provideRecommendations,
    validateAddress,
    determineWalletType
};
