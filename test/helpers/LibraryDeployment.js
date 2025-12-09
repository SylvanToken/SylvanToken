const { ethers } = require("hardhat");

/**
 * Helper function to get SylvanToken factory
 * Note: Libraries are now internal to SylvanToken - no external linking needed
 */
async function deployLibrariesAndGetFactory() {
    // Get SylvanToken factory (no library linking needed)
    const SylvanToken = await ethers.getContractFactory("SylvanToken");
    
    return {
        SylvanToken,
        libraries: {} // No external libraries needed
    };
}

/**
 * Helper function to deploy SylvanToken with standard parameters
 */
async function deploySylvanTokenWithLibraries(feeWallet, donationWallet, initialExemptAccounts = []) {
    const { SylvanToken } = await deployLibrariesAndGetFactory();
    
    const token = await SylvanToken.deploy(
        feeWallet,
        donationWallet,
        initialExemptAccounts
    );
    
    return token;
}

module.exports = {
    deployLibrariesAndGetFactory,
    deploySylvanTokenWithLibraries
};