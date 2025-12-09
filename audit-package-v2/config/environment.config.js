/**
 * @title Environment Configuration Manager
 * @dev Manages environment-specific configurations and secrets
 * 
 * SECURITY NOTES:
 * - This file does NOT contain real private keys or API keys
 * - All sensitive data is loaded from environment variables (process.env)
 * - The hardcoded Hardhat test key is ONLY for local development
 * - For deployment, use .env file with your actual keys
 * 
 * CONFIGURATION PRIORITY:
 * 1. Production: Uses process.env variables (from .env file)
 * 2. Development: Tries .secrets.json, falls back to Hardhat test account
 * 3. Test: Uses Hardhat test accounts
 * 
 * SAFE TO COMMIT: Yes, this file contains no sensitive information
 */

const path = require('path');
const fs = require('fs');

class EnvironmentConfig {
    constructor() {
        this.environment = process.env.NODE_ENV || 'development';
        this.loadEnvironmentConfig();
    }

    loadEnvironmentConfig() {
        // Load base configuration
        this.config = {
            environment: this.environment,
            isDevelopment: this.environment === 'development',
            isProduction: this.environment === 'production',
            isTest: this.environment === 'test'
        };

        // Load environment-specific secrets
        this.loadSecrets();
    }

    loadSecrets() {
        // In production, use environment variables or secure vault
        if (this.isProduction) {
            this.secrets = {
                deployerPrivateKey: process.env.DEPLOYER_PRIVATE_KEY,
                bscscanApiKey: process.env.BSCSCAN_API_KEY,
                infuraApiKey: process.env.INFURA_API_KEY,
                alchemyApiKey: process.env.ALCHEMY_API_KEY
            };
        } else {
            // For development/testing, use local secure file or hardhat accounts
            this.secrets = this.loadDevelopmentSecrets();
        }

        // Load role configuration (deployer and owner separation)
        this.loadRoleConfiguration();
    }

    loadRoleConfiguration() {
        // Load role addresses from environment variables
        this.roles = {
            deployer: {
                address: process.env.DEPLOYER_ADDRESS || null,
                privateKey: this.secrets.deployerPrivateKey || null
            },
            owner: {
                address: process.env.OWNER_ADDRESS || null,
                walletType: process.env.OWNER_WALLET_TYPE || 'standard'
            }
        };

        // Validate wallet types
        const validWalletTypes = ['hardware', 'multisig', 'standard'];
        if (!validWalletTypes.includes(this.roles.owner.walletType)) {
            console.warn(`Invalid OWNER_WALLET_TYPE: ${this.roles.owner.walletType}. Using 'standard' as default.`);
            this.roles.owner.walletType = 'standard';
        }
    }

    loadDevelopmentSecrets() {
        // Check for local secrets file (should be in .gitignore)
        const secretsPath = path.join(__dirname, '..', '.secrets.json');
        
        if (fs.existsSync(secretsPath)) {
            try {
                const secretsFile = fs.readFileSync(secretsPath, 'utf8');
                return JSON.parse(secretsFile);
            } catch (error) {
                console.warn('Failed to load secrets file:', error.message);
            }
        }

        // Fallback to Hardhat's default test account for LOCAL development ONLY
        // WARNING: This is a well-known test key - NEVER use on mainnet or testnet!
        // For actual deployment, use .env file with your real private key
        return {
            deployerPrivateKey: "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80", // Hardhat test account #0
            bscscanApiKey: "test_api_key",
            testMode: true
        };
    }

    getDeployerPrivateKey() {
        if (!this.secrets.deployerPrivateKey) {
            throw new Error('Deployer private key not configured');
        }
        return this.secrets.deployerPrivateKey;
    }

    getBscscanApiKey() {
        return this.secrets.bscscanApiKey || '';
    }

    getNetworkConfig(networkName) {
        const deploymentConfig = require('./deployment.config.js');
        const networkConfig = deploymentConfig.networks[networkName];
        
        if (!networkConfig) {
            throw new Error(`Network configuration not found for: ${networkName}`);
        }

        // Add private key for non-localhost networks
        if (networkName !== 'localhost' && !this.secrets.testMode) {
            networkConfig.accounts = [this.getDeployerPrivateKey()];
        }

        return networkConfig;
    }

    validateConfiguration() {
        const errors = [];

        // Validate required secrets for production
        if (this.isProduction) {
            if (!this.secrets.deployerPrivateKey) {
                errors.push('DEPLOYER_PRIVATE_KEY is required in production');
            }
            if (!this.secrets.bscscanApiKey) {
                errors.push('BSCSCAN_API_KEY is required in production');
            }
        }

        // Validate wallet addresses
        const deploymentConfig = require('./deployment.config.js');
        const { ethers } = require('ethers');
        
        Object.entries(deploymentConfig.wallets).forEach(([key, value]) => {
            if (typeof value === 'string') {
                if (!ethers.utils.isAddress(value)) {
                    errors.push(`Invalid wallet address for ${key}: ${value}`);
                }
            } else if (typeof value === 'object') {
                Object.entries(value).forEach(([subKey, subValue]) => {
                    if (typeof subValue === 'object' && subValue.address) {
                        if (!ethers.utils.isAddress(subValue.address)) {
                            errors.push(`Invalid wallet address for ${key}.${subKey}: ${subValue.address}`);
                        }
                    } else if (typeof subValue === 'string') {
                        if (!ethers.utils.isAddress(subValue)) {
                            errors.push(`Invalid wallet address for ${key}.${subKey}: ${subValue}`);
                        }
                    }
                });
            }
        });

        // Validate role addresses if provided
        if (this.roles.deployer.address && !ethers.utils.isAddress(this.roles.deployer.address)) {
            errors.push(`Invalid DEPLOYER_ADDRESS: ${this.roles.deployer.address}`);
        }
        if (this.roles.owner.address && !ethers.utils.isAddress(this.roles.owner.address)) {
            errors.push(`Invalid OWNER_ADDRESS: ${this.roles.owner.address}`);
        }

        if (errors.length > 0) {
            throw new Error(`Configuration validation failed:\n${errors.join('\n')}`);
        }

        return true;
    }

    /**
     * Validate role configuration for a specific network
     * @param {string} networkName - Network name (mainnet, testnet, localhost)
     * @returns {object} Validation result with warnings and errors
     */
    validateRoleConfiguration(networkName) {
        const { ethers } = require('ethers');
        const warnings = [];
        const errors = [];

        // Check if role addresses are configured
        if (!this.roles.deployer.address) {
            warnings.push('DEPLOYER_ADDRESS not configured - will use signer address');
        }
        if (!this.roles.owner.address) {
            warnings.push('OWNER_ADDRESS not configured - deployer will remain as owner');
        }

        // Validate addresses if provided
        if (this.roles.deployer.address) {
            if (!ethers.utils.isAddress(this.roles.deployer.address)) {
                errors.push(`Invalid DEPLOYER_ADDRESS: ${this.roles.deployer.address}`);
            }
        }

        if (this.roles.owner.address) {
            if (!ethers.utils.isAddress(this.roles.owner.address)) {
                errors.push(`Invalid OWNER_ADDRESS: ${this.roles.owner.address}`);
            }

            // Check for zero address
            if (this.roles.owner.address === ethers.constants.AddressZero) {
                errors.push('OWNER_ADDRESS cannot be zero address');
            }
        }

        // Network-specific validation
        if (networkName === 'bscMainnet' || networkName === 'mainnet') {
            // Mainnet requires role separation
            if (this.roles.deployer.address && this.roles.owner.address) {
                if (this.roles.deployer.address.toLowerCase() === this.roles.owner.address.toLowerCase()) {
                    errors.push('MAINNET SECURITY: Deployer and owner MUST be different addresses on mainnet');
                }
            }

            // Mainnet should use hardware wallet or multisig
            if (this.roles.owner.walletType === 'standard') {
                warnings.push('MAINNET SECURITY: Consider using hardware wallet or multisig for owner on mainnet');
            }
        } else if (networkName === 'bscTestnet' || networkName === 'testnet' || networkName === 'localhost') {
            // Testnet/localhost can have same address
            if (this.roles.deployer.address && this.roles.owner.address) {
                if (this.roles.deployer.address.toLowerCase() === this.roles.owner.address.toLowerCase()) {
                    warnings.push('Deployer and owner are the same address (acceptable for testnet/localhost)');
                }
            }
        }

        return {
            valid: errors.length === 0,
            errors,
            warnings
        };
    }

    /**
     * Get deployer address (from config or signer)
     * @returns {string|null} Deployer address
     */
    getDeployerAddress() {
        return this.roles.deployer.address;
    }

    /**
     * Get owner address (from config)
     * @returns {string|null} Owner address
     */
    getOwnerAddress() {
        return this.roles.owner.address;
    }

    /**
     * Get owner wallet type
     * @returns {string} Wallet type (hardware, multisig, standard)
     */
    getOwnerWalletType() {
        return this.roles.owner.walletType;
    }

    /**
     * Check if ownership transfer is needed
     * @param {string} deployerAddress - Actual deployer address
     * @returns {boolean} True if transfer is needed
     */
    shouldTransferOwnership(deployerAddress) {
        if (!this.roles.owner.address) {
            return false; // No owner address configured
        }

        // Transfer if addresses are different (case-insensitive)
        return deployerAddress.toLowerCase() !== this.roles.owner.address.toLowerCase();
    }

    /**
     * Get role configuration summary
     * @returns {object} Role configuration details
     */
    getRoleConfiguration() {
        return {
            deployer: {
                address: this.roles.deployer.address || 'Not configured',
                hasPrivateKey: !!this.roles.deployer.privateKey
            },
            owner: {
                address: this.roles.owner.address || 'Not configured',
                walletType: this.roles.owner.walletType
            },
            separationEnabled: !!(this.roles.deployer.address && this.roles.owner.address)
        };
    }

    // Security check for sensitive data exposure
    sanitizeForLogging() {
        return {
            environment: this.environment,
            isDevelopment: this.isDevelopment,
            isProduction: this.isProduction,
            isTest: this.isTest,
            hasDeployerKey: !!this.secrets.deployerPrivateKey,
            hasBscscanKey: !!this.secrets.bscscanApiKey,
            testMode: this.secrets.testMode || false,
            roles: {
                deployer: {
                    address: this.roles.deployer.address || 'Not configured',
                    hasPrivateKey: !!this.roles.deployer.privateKey
                },
                owner: {
                    address: this.roles.owner.address || 'Not configured',
                    walletType: this.roles.owner.walletType
                }
            }
        };
    }
}

module.exports = new EnvironmentConfig();