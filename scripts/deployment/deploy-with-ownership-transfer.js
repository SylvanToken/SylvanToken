/**
 * @title Enhanced Deployment Script with Ownership Transfer
 * @dev Deploys SylvanToken contract and optionally transfers ownership to a secure wallet
 * 
 * Features:
 * - Deploys contract with deployer wallet (pays gas fees)
 * - Validates deployer and owner addresses
 * - Transfers ownership to secure wallet (hardware wallet or multisig)
 * - Verifies ownership transfer succeeded
 * - Saves complete deployment record
 * 
 * Usage:
 *   npx hardhat run scripts/deployment/deploy-with-ownership-transfer.js --network <network>
 * 
 * Environment Variables:
 *   DEPLOYER_ADDRESS - Address of deployer wallet (optional, uses signer if not set)
 *   OWNER_ADDRESS - Address of owner wallet (optional, uses deployer if not set)
 *   OWNER_WALLET_TYPE - Type of owner wallet: hardware, multisig, or standard
 */

const { ethers } = require("hardhat");
const deploymentConfig = require("../../config/deployment.config.js");
const fs = require("fs");
const path = require("path");

/**
 * Validates an Ethereum address
 * @param {string} address - Address to validate
 * @param {string} name - Name of the address for error messages
 * @returns {boolean} True if valid
 * @throws {Error} If address is invalid
 */
function validateAddress(address, name) {
    if (!address) {
        throw new Error(`${name} address is not provided`);
    }
    
    if (address === ethers.constants.AddressZero) {
        throw new Error(`${name} cannot be the zero address`);
    }
    
    if (!ethers.utils.isAddress(address)) {
        throw new Error(`${name} is not a valid Ethereum address: ${address}`);
    }
    
    // Validate checksum
    try {
        const checksumAddress = ethers.utils.getAddress(address);
        if (checksumAddress !== address) {
            console.log(`  ⚠️  ${name} checksum corrected: ${address} -> ${checksumAddress}`);
        }
    } catch (error) {
        throw new Error(`${name} has invalid checksum: ${address}`);
    }
    
    return true;
}

/**
 * Validates deployer and owner addresses based on network
 * @param {string} deployerAddress - Deployer wallet address
 * @param {string} ownerAddress - Owner wallet address
 * @param {string} networkName - Network name (localhost, bscTestnet, bscMainnet)
 * @throws {Error} If validation fails
 */
function validateRoles(deployerAddress, ownerAddress, networkName) {
    console.log("\n🔍 Validating Role Configuration...");
    console.log("  Network:", networkName);
    
    // Validate both addresses
    validateAddress(deployerAddress, "Deployer");
    validateAddress(ownerAddress, "Owner");
    
    // Get network-specific requirements
    const validation = deploymentConfig.roles.validation;
    const networkReqs = validation.networkRequirements[networkName] || {};
    
    // Check if addresses are the same
    const sameAddress = deployerAddress.toLowerCase() === ownerAddress.toLowerCase();
    
    // Network-specific validation
    if (networkName === "bscMainnet") {
        console.log("\n  🔒 MAINNET SECURITY CHECKS:");
        
        // Enforce different addresses on mainnet
        if (sameAddress && validation.requireDifferentForMainnet) {
            console.error("\n  ❌ CRITICAL SECURITY ERROR:");
            console.error("  Deployer and Owner MUST be different addresses on mainnet!");
            console.error("\n  Security Rationale:");
            console.error("  - Deployer wallet is exposed during deployment (hot wallet)");
            console.error("  - Owner wallet should remain in cold storage (hardware wallet/multisig)");
            console.error("  - Using same wallet creates single point of failure");
            console.error("\n  Required Actions:");
            console.error("  1. Set OWNER_ADDRESS environment variable to a different address");
            console.error("  2. Use a hardware wallet (Ledger/Trezor) or multisig for owner");
            console.error("  3. Keep owner wallet in cold storage");
            console.error("\n  Example:");
            console.error("  export OWNER_ADDRESS=0x... (your hardware wallet address)");
            console.error("  export OWNER_WALLET_TYPE=hardware");
            
            throw new Error(
                "SECURITY ERROR: Deployer and Owner MUST be different addresses on mainnet. " +
                "This is a critical security requirement."
            );
        }
        
        if (sameAddress) {
            console.log("  ⚠️  WARNING: Using same address for deployer and owner on mainnet");
            console.log("  ⚠️  This is NOT recommended for production deployments");
        }
        
        // Check owner wallet type
        const ownerWalletType = process.env.OWNER_WALLET_TYPE || "standard";
        
        if (networkReqs.requireHardwareWallet && ownerWalletType === "standard" && !sameAddress) {
            console.log("\n  ⚠️  SECURITY WARNING:");
            console.log("  Owner wallet type is 'standard' on mainnet");
            console.log("  STRONGLY RECOMMENDED: Use 'hardware' or 'multisig' wallet");
            console.log("\n  To set hardware wallet:");
            console.log("  export OWNER_WALLET_TYPE=hardware");
            console.log("\n  To set multisig wallet:");
            console.log("  export OWNER_WALLET_TYPE=multisig");
        }
        
        if (ownerWalletType === "hardware") {
            console.log("  ✓ Owner wallet type: hardware (SECURE)");
            console.log("  ✓ Excellent security choice for mainnet");
        } else if (ownerWalletType === "multisig") {
            console.log("  ✓ Owner wallet type: multisig (HIGHLY SECURE)");
            console.log("  ✓ Best security choice for mainnet");
        } else {
            console.log("  ⚠️  Owner wallet type: standard (NOT RECOMMENDED for mainnet)");
        }
        
        // Display mainnet warnings
        if (networkReqs.warnings && networkReqs.warnings.length > 0) {
            console.log("\n  ⚠️  MAINNET SECURITY WARNINGS:");
            networkReqs.warnings.forEach((warning, index) => {
                console.log(`  ${index + 1}. ${warning}`);
            });
        }
        
    } else if (networkName === "bscTestnet") {
        console.log("\n  🧪 TESTNET CONFIGURATION:");
        
        if (sameAddress) {
            console.log("  ℹ️  Deployer and Owner are the same address");
            console.log("  ℹ️  This is acceptable for testnet");
        } else {
            console.log("  ✓ Deployer and Owner are different addresses");
            console.log("  ✓ Good practice - testing production configuration");
        }
        
        console.log("  ℹ️  Testnet allows flexible configuration for testing");
        
    } else if (networkName === "localhost") {
        console.log("\n  🏠 LOCALHOST CONFIGURATION:");
        
        if (sameAddress) {
            console.log("  ℹ️  Deployer and Owner are the same address");
            console.log("  ℹ️  This is normal for local development");
        } else {
            console.log("  ✓ Deployer and Owner are different addresses");
            console.log("  ✓ Testing production-like configuration locally");
        }
        
    } else {
        console.log("\n  ℹ️  UNKNOWN NETWORK:");
        console.log("  ℹ️  Applying default validation rules");
    }
    
    // Final validation summary
    if (sameAddress) {
        console.log("\n  📋 Configuration Summary:");
        console.log("  - Deployer and Owner: SAME address");
        console.log("  - Address:", deployerAddress);
        console.log("  - Ownership transfer: Will be SKIPPED");
    } else {
        console.log("\n  📋 Configuration Summary:");
        console.log("  - Deployer and Owner: DIFFERENT addresses");
        console.log("  - Deployer:", deployerAddress);
        console.log("  - Owner:", ownerAddress);
        console.log("  - Ownership transfer: Will be EXECUTED after deployment");
    }
    
    console.log("\n  ✓ Role validation passed");
}

/**
 * Prompts for confirmation on risky configurations
 * @param {string} networkName - Network name
 * @param {boolean} sameAddress - Whether deployer and owner are the same
 * @returns {Promise<boolean>} True if user confirms
 */
async function confirmRiskyConfiguration(networkName, sameAddress) {
    if (networkName !== "bscMainnet" || !sameAddress) {
        return true; // No confirmation needed
    }
    
    console.log("\n⚠️  RISKY CONFIGURATION DETECTED");
    console.log("=".repeat(70));
    console.log("\nYou are deploying to MAINNET with the SAME address for deployer and owner.");
    console.log("This is NOT recommended for production deployments.");
    console.log("\nSecurity Risks:");
    console.log("  - Single point of failure");
    console.log("  - Deployer wallet exposed during deployment");
    console.log("  - No separation between deployment and admin privileges");
    console.log("\nRecommended Actions:");
    console.log("  1. Cancel this deployment (Ctrl+C)");
    console.log("  2. Set OWNER_ADDRESS to a hardware wallet or multisig");
    console.log("  3. Re-run deployment with proper role separation");
    console.log("\nIf you understand the risks and wish to proceed anyway,");
    console.log("set CONFIRM_RISKY_DEPLOYMENT=true in your environment.");
    console.log("=".repeat(70));
    
    const confirmed = process.env.CONFIRM_RISKY_DEPLOYMENT === "true";
    
    if (!confirmed) {
        throw new Error(
            "Risky configuration not confirmed. " +
            "Set CONFIRM_RISKY_DEPLOYMENT=true to proceed (not recommended)."
        );
    }
    
    console.log("\n⚠️  Risky configuration confirmed by user. Proceeding...");
    return true;
}

/**
 * Checks deployer balance
 * @param {ethers.Signer} deployer - Deployer signer
 * @param {string} networkName - Network name
 * @returns {Promise<ethers.BigNumber>} Deployer balance
 * @throws {Error} If balance is insufficient
 */
async function checkDeployerBalance(deployer, networkName) {
    const balance = await deployer.getBalance();
    const balanceEth = ethers.utils.formatEther(balance);
    
    console.log("  Balance:", balanceEth, "BNB");
    
    // Get minimum balance requirement
    const validation = deploymentConfig.roles.validation;
    const networkReqs = validation.networkRequirements[networkName] || {};
    const minBalance = networkReqs.minDeployerBalance || validation.minDeployerBalance || "0.1";
    
    if (balance.lt(ethers.utils.parseEther(minBalance))) {
        throw new Error(
            `Insufficient deployer balance. Need at least ${minBalance} BNB, have ${balanceEth} BNB`
        );
    }
    
    console.log(`  ✓ Balance sufficient (minimum: ${minBalance} BNB)`);
    
    return balance;
}

/**
 * Gets owner address from config or environment
 * @param {string} deployerAddress - Deployer address (fallback)
 * @returns {string} Owner address
 */
function getOwnerAddress(deployerAddress) {
    // Priority: Environment variable > Config file > Deployer address
    let ownerAddress = process.env.OWNER_ADDRESS || 
                      deploymentConfig.roles.owner.address || 
                      deployerAddress;
    
    // Normalize to checksum address
    if (ownerAddress && ethers.utils.isAddress(ownerAddress)) {
        ownerAddress = ethers.utils.getAddress(ownerAddress);
    }
    
    return ownerAddress;
}

/**
 * Deploys the SylvanToken contract
 * @param {ethers.Signer} deployer - Deployer signer
 * @returns {Promise<Object>} Deployed contract and library addresses
 */
async function deployContract(deployer) {
    console.log("\n📚 Deploying WalletManager Library...");
    
    const WalletManager = await ethers.getContractFactory(
        "contracts/libraries/WalletManager.sol:WalletManager",
        deployer
    );
    const walletManager = await WalletManager.deploy();
    await walletManager.deployed();
    
    console.log("  ✓ WalletManager deployed:", walletManager.address);
    
    // Get wallet addresses from config
    const feeWallet = deploymentConfig.wallets.system.fee.address;
    const donationWallet = deploymentConfig.wallets.system.donation.address;
    
    // Initial exempt accounts
    const initialExemptAccounts = [
        deployer.address,
        feeWallet,
        donationWallet,
        deploymentConfig.wallets.system.dead.address
    ];
    
    console.log("\n🪙 Deploying SylvanToken...");
    console.log("  Fee Wallet:", feeWallet);
    console.log("  Donation Wallet:", donationWallet);
    console.log("  Initial Exempt Accounts:", initialExemptAccounts.length);
    
    const SylvanToken = await ethers.getContractFactory("SylvanToken", {
        libraries: {
            WalletManager: walletManager.address
        },
        signer: deployer
    });
    
    const token = await SylvanToken.deploy(
        feeWallet,
        donationWallet,
        initialExemptAccounts
    );
    
    console.log("  ⏳ Waiting for deployment...");
    await token.deployed();
    
    const receipt = await token.deployTransaction.wait();
    
    console.log("  ✓ SylvanToken deployed:", token.address);
    console.log("  Transaction Hash:", token.deployTransaction.hash);
    console.log("  Block Number:", receipt.blockNumber);
    console.log("  Gas Used:", receipt.gasUsed.toString());
    
    return {
        token,
        walletManager,
        receipt,
        feeWallet,
        donationWallet,
        initialExemptAccounts
    };
}

async function main() {
    console.log("\n🚀 Enhanced Deployment with Ownership Transfer");
    console.log("=".repeat(70));
    
    // Get network name
    const networkName = hre.network.name;
    console.log("\n🌐 Network:", networkName);
    
    // Get deployer wallet
    const [deployer] = await ethers.getSigners();
    const deployerAddress = deployer.address;
    
    console.log("\n📋 Deployer Information:");
    console.log("  Address:", deployerAddress);
    
    // Check deployer balance
    await checkDeployerBalance(deployer, networkName);
    
    // Get owner address
    const ownerAddress = getOwnerAddress(deployerAddress);
    
    console.log("\n👑 Owner Information:");
    console.log("  Address:", ownerAddress);
    console.log("  Wallet Type:", process.env.OWNER_WALLET_TYPE || "standard");
    
    // Validate addresses and roles
    validateRoles(deployerAddress, ownerAddress, networkName);
    
    // Check for risky configuration and require confirmation
    const sameAddress = deployerAddress.toLowerCase() === ownerAddress.toLowerCase();
    await confirmRiskyConfiguration(networkName, sameAddress);
    
    // Deploy contract
    const deployment = await deployContract(deployer);
    const { token, walletManager, receipt, feeWallet, donationWallet, initialExemptAccounts } = deployment;
    
    // Verify initial deployment
    console.log("\n🔍 Verifying Initial Deployment...");
    const name = await token.name();
    const symbol = await token.symbol();
    const totalSupply = await token.totalSupply();
    const decimals = await token.decimals();
    const initialOwner = await token.owner();
    
    console.log("  Name:", name);
    console.log("  Symbol:", symbol);
    console.log("  Total Supply:", ethers.utils.formatEther(totalSupply), "SYL");
    console.log("  Decimals:", decimals);
    console.log("  Initial Owner:", initialOwner);
    
    // Verify initial owner is deployer
    if (initialOwner.toLowerCase() !== deployerAddress.toLowerCase()) {
        throw new Error(
            `Initial owner mismatch! Expected ${deployerAddress}, got ${initialOwner}`
        );
    }
    console.log("  ✓ Initial owner is deployer (as expected)");
    
    // Prepare deployment info
    const deploymentInfo = {
        network: networkName,
        timestamp: new Date().toISOString(),
        deployer: {
            address: deployerAddress,
            role: "deployer"
        },
        owner: {
            address: ownerAddress,
            walletType: process.env.OWNER_WALLET_TYPE || "standard",
            role: "owner"
        },
        contracts: {
            walletManager: walletManager.address,
            token: token.address
        },
        deployment: {
            transactionHash: token.deployTransaction.hash,
            blockNumber: receipt.blockNumber,
            gasUsed: receipt.gasUsed.toString()
        },
        configuration: {
            feeWallet,
            donationWallet,
            initialExemptAccounts
        },
        ownershipTransfer: null // Will be updated if transfer occurs
    };
    
    // Save deployment info
    const deploymentsDir = path.join(__dirname, "../../deployments");
    if (!fs.existsSync(deploymentsDir)) {
        fs.mkdirSync(deploymentsDir, { recursive: true });
    }
    
    const deploymentPath = path.join(
        deploymentsDir,
        `${networkName}-deployment-${Date.now()}.json`
    );
    fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
    
    console.log("\n💾 Deployment info saved to:", deploymentPath);
    
    console.log("\n✅ Deployment Complete!");
    console.log("  Contract Address:", token.address);
    console.log("  Current Owner:", initialOwner);
    
    // Check if ownership transfer is needed
    const needsTransfer = deployerAddress.toLowerCase() !== ownerAddress.toLowerCase();
    
    if (needsTransfer) {
        console.log("\n🔄 Ownership Transfer Required");
        console.log("  From:", deployerAddress);
        console.log("  To:", ownerAddress);
        
        // Transfer ownership
        const transferResult = await transferOwnership(token, ownerAddress, deployerAddress, networkName);
        
        // Update deployment info with transfer details
        deploymentInfo.ownershipTransfer = transferResult;
        
        // Save updated deployment info
        fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
        console.log("\n💾 Deployment info updated with ownership transfer details");
    } else {
        console.log("\n⏭️  Ownership Transfer Skipped");
        console.log("  Reason: Deployer and Owner are the same address");
        
        if (networkName === "bscMainnet") {
            console.log("\n⚠️  SECURITY WARNING:");
            console.log("  Using the same wallet for deployer and owner on mainnet is NOT recommended!");
            console.log("  Consider transferring ownership to a hardware wallet or multisig.");
            console.log("  You can use the transfer-ownership.js script later:");
            console.log(`  npx hardhat run scripts/utils/transfer-ownership.js --network ${networkName}`);
        }
        
        deploymentInfo.ownershipTransfer = {
            executed: false,
            reason: "Deployer and owner are the same address",
            skippedAt: new Date().toISOString()
        };
        
        // Save updated deployment info
        fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
    }
    
    // Post-deployment verification
    await postDeploymentVerification(token, ownerAddress, deploymentInfo);
    
    // Display next steps
    displayNextSteps(token.address, ownerAddress, networkName, needsTransfer);
    
    // Return deployment info
    return {
        token,
        deploymentInfo,
        deploymentPath,
        networkName
    };
}

/**
 * Performs post-deployment verification
 * @param {ethers.Contract} token - Token contract instance
 * @param {string} expectedOwner - Expected owner address
 * @param {Object} deploymentInfo - Deployment information
 */
async function postDeploymentVerification(token, expectedOwner, deploymentInfo) {
    console.log("\n🔍 Post-Deployment Verification");
    console.log("=".repeat(70));
    
    try {
        // Verify contract deployment
        console.log("\n1️⃣ Contract Deployment Verification:");
        const code = await ethers.provider.getCode(token.address);
        if (code === "0x" || code === "0x0") {
            throw new Error("Contract not deployed - no code at address");
        }
        console.log("  ✓ Contract code exists at address");
        
        // Verify token properties
        console.log("\n2️⃣ Token Properties Verification:");
        const name = await token.name();
        const symbol = await token.symbol();
        const decimals = await token.decimals();
        const totalSupply = await token.totalSupply();
        
        console.log("  Name:", name);
        console.log("  Symbol:", symbol);
        console.log("  Decimals:", decimals);
        console.log("  Total Supply:", ethers.utils.formatEther(totalSupply), "SYL");
        
        if (name !== "Sylvan Token") {
            throw new Error(`Unexpected token name: ${name}`);
        }
        if (symbol !== "SYL") {
            throw new Error(`Unexpected token symbol: ${symbol}`);
        }
        if (decimals !== 18) {
            throw new Error(`Unexpected decimals: ${decimals}`);
        }
        console.log("  ✓ Token properties verified");
        
        // Verify ownership
        console.log("\n3️⃣ Ownership Verification:");
        const currentOwner = await token.owner();
        console.log("  Current Owner:", currentOwner);
        console.log("  Expected Owner:", expectedOwner);
        
        if (currentOwner.toLowerCase() !== expectedOwner.toLowerCase()) {
            throw new Error(
                `Owner mismatch! Expected ${expectedOwner}, got ${currentOwner}`
            );
        }
        console.log("  ✓ Ownership verified");
        
        // Verify fee configuration
        console.log("\n4️⃣ Fee Configuration Verification:");
        const feeWallet = await token.feeWallet();
        const donationWallet = await token.donationWallet();
        const taxRate = await token.taxRate();
        
        console.log("  Fee Wallet:", feeWallet);
        console.log("  Donation Wallet:", donationWallet);
        console.log("  Tax Rate:", taxRate.toString(), "basis points (1%)");
        
        if (feeWallet !== deploymentInfo.configuration.feeWallet) {
            throw new Error(`Fee wallet mismatch`);
        }
        if (donationWallet !== deploymentInfo.configuration.donationWallet) {
            throw new Error(`Donation wallet mismatch`);
        }
        if (taxRate.toString() !== "100") {
            throw new Error(`Tax rate mismatch: expected 100, got ${taxRate}`);
        }
        console.log("  ✓ Fee configuration verified");
        
        // Verify exemptions
        console.log("\n5️⃣ Fee Exemption Verification:");
        const exemptCount = deploymentInfo.configuration.initialExemptAccounts.length;
        console.log(`  Checking ${exemptCount} initial exempt accounts...`);
        
        for (const account of deploymentInfo.configuration.initialExemptAccounts) {
            const isExempt = await token.isFeeExempt(account);
            if (!isExempt) {
                throw new Error(`Account ${account} should be exempt but is not`);
            }
        }
        console.log(`  ✓ All ${exemptCount} exempt accounts verified`);
        
        console.log("\n✅ All Verification Checks Passed!");
        
    } catch (error) {
        console.error("\n❌ Verification Failed:");
        console.error(error.message);
        throw error;
    }
}

/**
 * Displays next steps after deployment
 * @param {string} tokenAddress - Token contract address
 * @param {string} ownerAddress - Owner address
 * @param {string} networkName - Network name
 * @param {boolean} ownershipTransferred - Whether ownership was transferred
 */
function displayNextSteps(tokenAddress, ownerAddress, networkName, ownershipTransferred) {
    console.log("\n📝 Next Steps:");
    console.log("=".repeat(70));
    
    console.log("\n1️⃣ Verify Contract on BSCScan:");
    console.log(`   npx hardhat verify --network ${networkName} ${tokenAddress}`);
    
    if (ownershipTransferred) {
        console.log("\n2️⃣ Configure Vesting Schedules (using owner wallet):");
        console.log("   - Connect your owner wallet (hardware wallet/multisig)");
        console.log("   - Run vesting configuration scripts");
        console.log("   - Verify vesting parameters");
        
        console.log("\n3️⃣ Distribute Initial Tokens (using owner wallet):");
        console.log("   - Review distribution plan");
        console.log("   - Execute token distributions");
        console.log("   - Verify balances");
        
        console.log("\n4️⃣ Enable Trading (using owner wallet):");
        console.log("   - Ensure all configurations are complete");
        console.log("   - Enable trading when ready");
        console.log("   - Monitor initial transactions");
    } else {
        console.log("\n2️⃣ Transfer Ownership (RECOMMENDED for mainnet):");
        console.log(`   npx hardhat run scripts/utils/transfer-ownership.js --network ${networkName}`);
        console.log("   Set OWNER_ADDRESS environment variable to your secure wallet");
        
        console.log("\n3️⃣ Configure Vesting Schedules:");
        console.log("   Run vesting configuration scripts");
        
        console.log("\n4️⃣ Distribute Initial Tokens:");
        console.log("   Execute token distribution");
        
        console.log("\n5️⃣ Enable Trading:");
        console.log("   Enable trading when ready");
    }
    
    console.log("\n💡 Security Reminders:");
    if (ownershipTransferred) {
        console.log("  ✓ Ownership transferred to secure wallet");
        console.log("  ✓ Keep owner wallet private key/recovery phrase secure");
        console.log("  ✓ Test admin functions with owner wallet before mainnet operations");
    } else {
        console.log("  ⚠️  Consider transferring ownership to a hardware wallet or multisig");
        console.log("  ⚠️  Never expose deployer private key");
        console.log("  ⚠️  Test all operations on testnet first");
    }
}

/**
 * Transfers ownership of the contract to a new owner
 * @param {ethers.Contract} token - Token contract instance
 * @param {string} newOwnerAddress - New owner address
 * @param {string} currentOwnerAddress - Current owner address
 * @param {string} networkName - Network name
 * @returns {Promise<Object>} Transfer details
 */
async function transferOwnership(token, newOwnerAddress, currentOwnerAddress, networkName) {
    console.log("\n🔐 Initiating Ownership Transfer...");
    
    try {
        // Verify current owner
        const currentOwner = await token.owner();
        if (currentOwner.toLowerCase() !== currentOwnerAddress.toLowerCase()) {
            throw new Error(
                `Current owner mismatch! Expected ${currentOwnerAddress}, got ${currentOwner}`
            );
        }
        console.log("  ✓ Current owner verified:", currentOwner);
        
        // Validate new owner address
        validateAddress(newOwnerAddress, "New Owner");
        console.log("  ✓ New owner address validated:", newOwnerAddress);
        
        // Execute transfer
        console.log("  ⏳ Executing transferOwnership transaction...");
        const tx = await token.transferOwnership(newOwnerAddress);
        console.log("  Transaction Hash:", tx.hash);
        
        // Wait for confirmation
        console.log("  ⏳ Waiting for confirmation...");
        const receipt = await tx.wait();
        console.log("  ✓ Transaction confirmed in block:", receipt.blockNumber);
        console.log("  Gas Used:", receipt.gasUsed.toString());
        
        // Verify transfer succeeded
        const verifiedOwner = await token.owner();
        if (verifiedOwner.toLowerCase() !== newOwnerAddress.toLowerCase()) {
            throw new Error(
                `Ownership transfer verification failed! Expected ${newOwnerAddress}, got ${verifiedOwner}`
            );
        }
        
        console.log("\n✅ Ownership Transfer Successful!");
        console.log("  Previous Owner:", currentOwnerAddress);
        console.log("  New Owner:", verifiedOwner);
        
        // Log transfer details
        const transferDetails = {
            executed: true,
            previousOwner: currentOwnerAddress,
            newOwner: verifiedOwner,
            transactionHash: tx.hash,
            blockNumber: receipt.blockNumber,
            gasUsed: receipt.gasUsed.toString(),
            timestamp: new Date().toISOString(),
            network: networkName
        };
        
        return transferDetails;
        
    } catch (error) {
        console.error("\n❌ Ownership Transfer Failed:");
        console.error(error.message);
        
        // Log failure details
        const transferDetails = {
            executed: false,
            error: error.message,
            previousOwner: currentOwnerAddress,
            attemptedNewOwner: newOwnerAddress,
            timestamp: new Date().toISOString(),
            network: networkName
        };
        
        throw new Error(`Ownership transfer failed: ${error.message}`);
    }
}

// Execute deployment
if (require.main === module) {
    main()
        .then(() => process.exit(0))
        .catch((error) => {
            console.error("\n❌ Deployment Failed:");
            console.error(error);
            process.exit(1);
        });
}

module.exports = { 
    main, 
    validateAddress, 
    validateRoles, 
    getOwnerAddress, 
    transferOwnership,
    postDeploymentVerification,
    displayNextSteps,
    confirmRiskyConfiguration
};
