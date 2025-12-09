const { ethers } = require("hardhat");
require("dotenv").config();

/**
 * @title Exemption Configuration Loader
 * @dev Utility script to load fee exemptions from environment configuration
 * Requirements: 1.1, 1.2, 1.3, 4.1, 4.2
 */

/**
 * Parse fee exemption configuration from environment variables
 * @returns {Object} Parsed exemption configuration
 */
function parseExemptionConfig() {
    const config = {
        exemptWallets: [],
        exemptStatuses: [],
        additionalExempt: [],
        autoLoad: process.env.AUTO_LOAD_EXEMPTIONS === 'true',
        validateConfig: process.env.VALIDATE_EXEMPTION_CONFIG === 'true'
    };

    // Parse FEE_EXEMPT_WALLETS format: address:status,address:status
    if (process.env.FEE_EXEMPT_WALLETS) {
        const exemptPairs = process.env.FEE_EXEMPT_WALLETS.split(',');
        
        for (const pair of exemptPairs) {
            const [address, status] = pair.trim().split(':');
            if (address && status !== undefined) {
                if (ethers.utils.isAddress(address)) {
                    config.exemptWallets.push(address);
                    config.exemptStatuses.push(status.toLowerCase() === 'true');
                } else {
                    console.warn(`Invalid address in FEE_EXEMPT_WALLETS: ${address}`);
                }
            }
        }
    }

    // Parse ADDITIONAL_EXEMPT_WALLETS format: address,address,address
    if (process.env.ADDITIONAL_EXEMPT_WALLETS) {
        const additionalAddresses = process.env.ADDITIONAL_EXEMPT_WALLETS.split(',');
        
        for (const address of additionalAddresses) {
            const cleanAddress = address.trim();
            if (ethers.utils.isAddress(cleanAddress)) {
                config.additionalExempt.push(cleanAddress);
                // Add to main config as exempt=true
                config.exemptWallets.push(cleanAddress);
                config.exemptStatuses.push(true);
            } else {
                console.warn(`Invalid address in ADDITIONAL_EXEMPT_WALLETS: ${cleanAddress}`);
            }
        }
    }

    return config;
}

/**
 * Validate exemption configuration
 * @param {Object} config - Parsed configuration
 * @returns {boolean} True if configuration is valid
 */
function validateExemptionConfig(config) {
    if (config.exemptWallets.length !== config.exemptStatuses.length) {
        console.error("Mismatch between exempt wallets and statuses arrays");
        return false;
    }

    // Check for duplicate addresses
    const uniqueAddresses = new Set(config.exemptWallets.map(addr => addr.toLowerCase()));
    if (uniqueAddresses.size !== config.exemptWallets.length) {
        console.error("Duplicate addresses found in exemption configuration");
        return false;
    }

    // Validate all addresses
    for (const address of config.exemptWallets) {
        if (!ethers.utils.isAddress(address)) {
            console.error(`Invalid address format: ${address}`);
            return false;
        }
    }

    return true;
}

/**
 * Load exemptions into contract from environment configuration
 * @param {Contract} contract - Enhanced Sylvan Token contract instance
 * @param {Object} config - Parsed exemption configuration
 * @returns {Promise<boolean>} True if loading was successful
 */
async function loadExemptionsFromConfig(contract, config = null) {
    try {
        if (!config) {
            config = parseExemptionConfig();
        }

        if (config.validateConfig && !validateExemptionConfig(config)) {
            throw new Error("Invalid exemption configuration");
        }

        console.log("Loading exemption configuration...");
        console.log(`Found ${config.exemptWallets.length} wallets to configure`);

        if (config.exemptWallets.length === 0) {
            console.log("No exemption configuration found");
            return true;
        }

        // Load exemptions using the contract's loadExemptionsFromConfig function
        const tx = await contract.loadExemptionsFromConfig(
            config.exemptWallets,
            config.exemptStatuses
        );

        console.log(`Loading exemptions transaction: ${tx.hash}`);
        const receipt = await tx.wait();
        console.log(`Transaction confirmed in block ${receipt.blockNumber}`);

        // Verify the configuration was loaded correctly
        const exemptCount = await contract.getExemptWalletCount();
        console.log(`Total exempt wallets after loading: ${exemptCount}`);

        // Display loaded exemptions
        console.log("\nLoaded exemption configuration:");
        for (let i = 0; i < config.exemptWallets.length; i++) {
            const address = config.exemptWallets[i];
            const status = config.exemptStatuses[i];
            const isExempt = await contract.isExempt(address);
            
            console.log(`  ${address}: ${status ? 'EXEMPT' : 'NOT EXEMPT'} ${isExempt === status ? '✓' : '✗'}`);
            
            if (isExempt !== status) {
                console.warn(`    Warning: Expected ${status}, but contract shows ${isExempt}`);
            }
        }

        return true;

    } catch (error) {
        console.error("Error loading exemption configuration:", error.message);
        return false;
    }
}

/**
 * Get current exemption status from contract
 * @param {Contract} contract - Enhanced Sylvan Token contract instance
 * @returns {Promise<Object>} Current exemption status
 */
async function getCurrentExemptionStatus(contract) {
    try {
        const exemptWallets = await contract.getExemptWallets();
        const exemptCount = await contract.getExemptWalletCount();

        console.log(`\nCurrent exemption status (${exemptCount} wallets):`);
        for (const wallet of exemptWallets) {
            const isExempt = await contract.isExempt(wallet);
            console.log(`  ${wallet}: ${isExempt ? 'EXEMPT' : 'NOT EXEMPT'}`);
        }

        return {
            exemptWallets,
            exemptCount
        };

    } catch (error) {
        console.error("Error getting current exemption status:", error.message);
        return null;
    }
}

/**
 * Add individual exempt wallet with validation
 * @param {Contract} contract - Enhanced Sylvan Token contract instance
 * @param {string} walletAddress - Address to add as exempt
 * @returns {Promise<boolean>} True if successful
 */
async function addExemptWallet(contract, walletAddress) {
    try {
        if (!ethers.utils.isAddress(walletAddress)) {
            throw new Error(`Invalid address format: ${walletAddress}`);
        }

        const isAlreadyExempt = await contract.isExempt(walletAddress);
        if (isAlreadyExempt) {
            console.log(`Wallet ${walletAddress} is already exempt`);
            return true;
        }

        console.log(`Adding exempt wallet: ${walletAddress}`);
        const tx = await contract.addExemptWallet(walletAddress);
        console.log(`Transaction: ${tx.hash}`);
        
        const receipt = await tx.wait();
        console.log(`Transaction confirmed in block ${receipt.blockNumber}`);

        // Verify the wallet was added
        const isNowExempt = await contract.isExempt(walletAddress);
        if (isNowExempt) {
            console.log(`✓ Wallet ${walletAddress} successfully added as exempt`);
            return true;
        } else {
            console.error(`✗ Failed to add wallet ${walletAddress} as exempt`);
            return false;
        }

    } catch (error) {
        console.error(`Error adding exempt wallet ${walletAddress}:`, error.message);
        return false;
    }
}

/**
 * Remove individual exempt wallet with validation
 * @param {Contract} contract - Enhanced Sylvan Token contract instance
 * @param {string} walletAddress - Address to remove from exempt list
 * @returns {Promise<boolean>} True if successful
 */
async function removeExemptWallet(contract, walletAddress) {
    try {
        if (!ethers.utils.isAddress(walletAddress)) {
            throw new Error(`Invalid address format: ${walletAddress}`);
        }

        const isCurrentlyExempt = await contract.isExempt(walletAddress);
        if (!isCurrentlyExempt) {
            console.log(`Wallet ${walletAddress} is not currently exempt`);
            return true;
        }

        console.log(`Removing exempt wallet: ${walletAddress}`);
        const tx = await contract.removeExemptWallet(walletAddress);
        console.log(`Transaction: ${tx.hash}`);
        
        const receipt = await tx.wait();
        console.log(`Transaction confirmed in block ${receipt.blockNumber}`);

        // Verify the wallet was removed
        const isStillExempt = await contract.isExempt(walletAddress);
        if (!isStillExempt) {
            console.log(`✓ Wallet ${walletAddress} successfully removed from exempt list`);
            return true;
        } else {
            console.error(`✗ Failed to remove wallet ${walletAddress} from exempt list`);
            return false;
        }

    } catch (error) {
        console.error(`Error removing exempt wallet ${walletAddress}:`, error.message);
        return false;
    }
}

/**
 * Batch add exempt wallets with validation
 * @param {Contract} contract - Enhanced Sylvan Token contract instance
 * @param {string[]} walletAddresses - Array of addresses to add as exempt
 * @returns {Promise<boolean>} True if successful
 */
async function addExemptWalletsBatch(contract, walletAddresses) {
    try {
        // Validate all addresses first
        const validAddresses = [];
        for (const address of walletAddresses) {
            if (!ethers.utils.isAddress(address)) {
                console.warn(`Skipping invalid address: ${address}`);
                continue;
            }
            
            const isAlreadyExempt = await contract.isExempt(address);
            if (isAlreadyExempt) {
                console.log(`Wallet ${address} is already exempt, skipping`);
                continue;
            }
            
            validAddresses.push(address);
        }

        if (validAddresses.length === 0) {
            console.log("No valid addresses to add");
            return true;
        }

        console.log(`Adding ${validAddresses.length} exempt wallets in batch...`);
        const tx = await contract.addExemptWalletsBatch(validAddresses);
        console.log(`Transaction: ${tx.hash}`);
        
        const receipt = await tx.wait();
        console.log(`Transaction confirmed in block ${receipt.blockNumber}`);

        // Verify all wallets were added
        let successCount = 0;
        for (const address of validAddresses) {
            const isNowExempt = await contract.isExempt(address);
            if (isNowExempt) {
                console.log(`✓ ${address} successfully added`);
                successCount++;
            } else {
                console.error(`✗ ${address} failed to add`);
            }
        }

        console.log(`Batch add completed: ${successCount}/${validAddresses.length} successful`);
        return successCount === validAddresses.length;

    } catch (error) {
        console.error("Error in batch add exempt wallets:", error.message);
        return false;
    }
}

module.exports = {
    parseExemptionConfig,
    validateExemptionConfig,
    loadExemptionsFromConfig,
    getCurrentExemptionStatus,
    addExemptWallet,
    removeExemptWallet,
    addExemptWalletsBatch
};

// If script is run directly, execute configuration loading
if (require.main === module) {
    async function main() {
        try {
            console.log("🚫 Enhanced Fee Exemption Configuration Loader");
            console.log("=".repeat(50));

            // Parse configuration from environment
            const config = parseExemptionConfig();
            
            if (config.validateConfig) {
                console.log("Validating configuration...");
                if (!validateExemptionConfig(config)) {
                    process.exit(1);
                }
                console.log("✓ Configuration validation passed");
            }

            console.log("\nParsed exemption configuration:");
            console.log(`  Auto-load enabled: ${config.autoLoad}`);
            console.log(`  Validation enabled: ${config.validateConfig}`);
            console.log(`  Wallets to configure: ${config.exemptWallets.length}`);
            console.log(`  Additional exempt wallets: ${config.additionalExempt.length}`);

            if (config.exemptWallets.length > 0) {
                console.log("\nConfiguration details:");
                for (let i = 0; i < config.exemptWallets.length; i++) {
                    console.log(`  ${config.exemptWallets[i]}: ${config.exemptStatuses[i] ? 'EXEMPT' : 'NOT EXEMPT'}`);
                }
            }

            console.log("\n✓ Configuration parsing completed successfully");
            console.log("\nTo load this configuration into a deployed contract, use:");
            console.log("  const { loadExemptionsFromConfig } = require('./exemption-config-loader');");
            console.log("  await loadExemptionsFromConfig(contractInstance);");

        } catch (error) {
            console.error("Error:", error.message);
            process.exit(1);
        }
    }

    main().catch(console.error);
}