const { ethers } = require("hardhat");

/**
 * @title Library Deployment Helper
 * @dev Helper functions for deploying libraries in tests
 */

/**
 * Deploy all required libraries for SylvanToken
 * @returns {Promise<Object>} Object containing library addresses (empty - no linking needed)
 * @deprecated SylvanToken no longer requires external library linking
 */
async function deployLibraries() {
    console.log("📚 Libraries are now internal to SylvanToken - no deployment needed");
    return {};
}

/**
 * Deploy SylvanToken with libraries
 * @param {string} feeWallet - Fee wallet address
 * @param {string} donationWallet - Donation wallet address
 * @param {string[]} initialExemptAccounts - Initial exempt accounts
 * @returns {Promise<Contract>} Deployed contract instance
 */
async function deploySylvanTokenWithLibraries(feeWallet, donationWallet, initialExemptAccounts = []) {
    // No library linking needed - libraries are used internally
    const SylvanToken = await ethers.getContractFactory("SylvanToken");
    
    const token = await SylvanToken.deploy(
        feeWallet,
        donationWallet,
        initialExemptAccounts
    );
    
    await token.deployed();
    console.log("✅ SylvanToken deployed");
    
    return token;
}

module.exports = {
    deployLibraries,
    deploySylvanTokenWithLibraries
};