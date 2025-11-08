const { ethers } = require("hardhat");

/**
 * @title Library Deployment Helper
 * @dev Helper functions for deploying libraries in tests
 */

/**
 * Deploy all required libraries for SylvanToken
 * @returns {Promise<Object>} Object containing library addresses
 */
async function deployLibraries() {
    console.log("📚 Deploying libraries for testing...");
    
    // Only deploy WalletManager as it's the only library actually used
    const WalletManager = await ethers.getContractFactory("contracts/libraries/WalletManager.sol:WalletManager");
    const walletManager = await WalletManager.deploy();
    await walletManager.deployed();
    
    const libraries = {
        WalletManager: walletManager.address,
    };
    
    console.log("✅ Libraries deployed successfully");
    return libraries;
}

/**
 * Deploy SylvanToken with libraries
 * @param {string} feeWallet - Fee wallet address
 * @param {string} donationWallet - Donation wallet address
 * @param {string[]} initialExemptAccounts - Initial exempt accounts
 * @returns {Promise<Contract>} Deployed contract instance
 */
async function deploySylvanTokenWithLibraries(feeWallet, donationWallet, initialExemptAccounts = []) {
    const libraries = await deployLibraries();
    
    const SylvanToken = await ethers.getContractFactory("SylvanToken", {
        libraries: libraries
    });
    
    const token = await SylvanToken.deploy(
        feeWallet,
        donationWallet,
        initialExemptAccounts
    );
    
    await token.deployed();
    console.log("✅ SylvanToken deployed with libraries");
    
    return token;
}

module.exports = {
    deployLibraries,
    deploySylvanTokenWithLibraries
};