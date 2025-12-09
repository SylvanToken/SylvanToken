/**
 * @title Centralized Test Fixture System
 * @dev Reusable deployment fixtures for EnhancedSylvanToken tests
 * @notice Uses loadFixture from @nomicfoundation/hardhat-network-helpers for efficient test execution
 */

const { ethers } = require("hardhat");
const deploymentConfig = require("../../config/deployment.config");

/**
 * Test Configuration Constants
 */
const TEST_CONFIG = {
    // Token amounts
    INITIAL_SUPPLY: ethers.utils.parseEther("1000000000"), // 1B tokens
    SMALL_AMOUNT: ethers.utils.parseEther("100"),
    MEDIUM_AMOUNT: ethers.utils.parseEther("10000"),
    LARGE_AMOUNT: ethers.utils.parseEther("1000000"),
    
    // Admin wallet allocations
    ADMIN_ALLOCATION: ethers.utils.parseEther("10000000"), // 10M tokens
    LOCKED_ALLOCATION: ethers.utils.parseEther("300000000"), // 300M tokens
    
    // Time constants (matching contract constants)
    SECONDS_PER_MONTH: 2629746, // Average seconds per month
    SECONDS_PER_DAY: 86400,
    CLIFF_DAYS: 30,
    
    // Fee parameters
    TAX_RATE: 100, // 1% (100 basis points)
    TAX_DENOMINATOR: 10000,
    FEE_SHARE: 5000, // 50%
    BURN_SHARE: 2500, // 25%
    DONATION_SHARE: 2500, // 25%
    
    // Lock parameters
    ADMIN_LOCK_PERCENTAGE: 9000, // 90%
    ADMIN_IMMEDIATE_RELEASE: 1000, // 10%
    ADMIN_MONTHLY_RELEASE: 500, // 5%
    LOCKED_MONTHLY_RELEASE: 300, // 3%
    BURN_PERCENTAGE: 1000, // 10%
    
    // Addresses
    DEAD_WALLET: "0x000000000000000000000000000000000000dEaD",
    ZERO_ADDRESS: ethers.constants.AddressZero,
};

/**
 * Deploy all required libraries for SylvanToken
 * @returns {Promise<Object>} Object containing library addresses (empty - no linking needed)
 * @deprecated SylvanToken no longer requires external library linking
 */
async function deployLibraries() {
    // Libraries are now internal to SylvanToken - no deployment needed
    return {};
}

/**
 * Main deployment fixture for SylvanToken
 * @dev This is the primary fixture that should be used in most tests
 * @returns {Promise<Object>} Complete test environment with token and accounts
 */
async function deployTokenFixture() {
    // Get signers
    const [owner, user1, user2, user3, feeWallet, donationWallet, adminWallet, lockedWallet, ...otherAccounts] = await ethers.getSigners();
    
    // Deploy SylvanToken (no library linking needed)
    const SylvanToken = await ethers.getContractFactory("SylvanToken");
    
    const initialExemptAccounts = [user3.address]; // user3 is exempt by default
    
    const token = await SylvanToken.deploy(
        feeWallet.address,
        donationWallet.address,
        initialExemptAccounts
    );
    
    await token.deployed();
    
    return {
        token,
        libraries: {},
        accounts: {
            owner,
            user1,
            user2,
            user3,
            feeWallet,
            donationWallet,
            adminWallet,
            lockedWallet,
            otherAccounts
        },
        config: TEST_CONFIG
    };
}

/**
 * Deployment fixture with trading enabled
 * @dev Use this fixture when tests require trading to be active
 * @note EnhancedSylvanToken doesn't have enableTrading() - trading is always enabled
 * @returns {Promise<Object>} Test environment with trading enabled
 */
async function deployTokenWithTradingFixture() {
    const fixture = await deployTokenFixture();
    
    // EnhancedSylvanToken doesn't require enableTrading() - it's always enabled
    // This fixture exists for consistency with test patterns
    
    return fixture;
}

/**
 * Deployment fixture with configured admin wallet
 * @dev Use this fixture when testing admin wallet functionality
 * @returns {Promise<Object>} Test environment with configured admin wallet
 */
async function deployTokenWithAdminFixture() {
    const fixture = await deployTokenWithTradingFixture();
    const { token, accounts, config } = fixture;
    
    // Configure admin wallet
    await token.configureAdminWallet(accounts.adminWallet.address, config.ADMIN_ALLOCATION);
    
    // Process initial 10% release
    await token.processInitialRelease(accounts.adminWallet.address);
    
    return fixture;
}

/**
 * Deployment fixture with locked wallet vesting
 * @dev Use this fixture when testing locked wallet functionality
 * @returns {Promise<Object>} Test environment with locked wallet vesting
 */
async function deployTokenWithLockedWalletFixture() {
    const fixture = await deployTokenWithTradingFixture();
    const { token, accounts, config } = fixture;
    
    // Create locked wallet vesting
    await token.createLockedWalletVesting(
        accounts.lockedWallet.address,
        config.LOCKED_ALLOCATION,
        config.CLIFF_DAYS
    );
    
    return fixture;
}

/**
 * Deployment fixture with multiple exempt wallets
 * @dev Use this fixture when testing exemption management
 * @returns {Promise<Object>} Test environment with multiple exempt wallets
 */
async function deployTokenWithExemptionsFixture() {
    const fixture = await deployTokenWithTradingFixture();
    const { token, accounts } = fixture;
    
    // Add multiple exempt wallets
    await token.addExemptWallet(accounts.user1.address);
    await token.addExemptWallet(accounts.user2.address);
    
    return fixture;
}

/**
 * Deployment fixture with AMM pair configured
 * @dev EnhancedSylvanToken doesn't have AMM-specific functionality
 * @note This fixture exists for compatibility but doesn't configure AMM
 * @returns {Promise<Object>} Test environment
 */
async function deployTokenWithAMMFixture() {
    const fixture = await deployTokenWithTradingFixture();
    
    // EnhancedSylvanToken doesn't have setAMMPair functionality
    // This fixture exists for test pattern consistency
    
    return fixture;
}

/**
 * Deployment fixture with distributed tokens
 * @dev Use this fixture when tests need tokens already distributed to users
 * @returns {Promise<Object>} Test environment with tokens distributed
 */
async function deployTokenWithDistributionFixture() {
    const fixture = await deployTokenWithTradingFixture();
    const { token, accounts, config } = fixture;
    
    // Distribute tokens to test users
    await token.transfer(accounts.user1.address, config.MEDIUM_AMOUNT);
    await token.transfer(accounts.user2.address, config.MEDIUM_AMOUNT);
    await token.transfer(accounts.user3.address, config.MEDIUM_AMOUNT);
    
    return fixture;
}

/**
 * Deployment fixture with full configuration
 * @dev Use this fixture for comprehensive integration tests
 * @returns {Promise<Object>} Fully configured test environment
 */
async function deployTokenFullyConfiguredFixture() {
    const fixture = await deployTokenWithTradingFixture();
    const { token, accounts, config } = fixture;
    
    // Configure admin wallet
    await token.configureAdminWallet(accounts.adminWallet.address, config.ADMIN_ALLOCATION);
    await token.processInitialRelease(accounts.adminWallet.address);
    
    // Create locked wallet vesting
    await token.createLockedWalletVesting(
        accounts.lockedWallet.address,
        config.LOCKED_ALLOCATION,
        config.CLIFF_DAYS
    );
    
    // Add exempt wallets
    await token.addExemptWallet(accounts.user1.address);
    
    // Distribute tokens
    await token.transfer(accounts.user1.address, config.MEDIUM_AMOUNT);
    await token.transfer(accounts.user2.address, config.MEDIUM_AMOUNT);
    
    return fixture;
}

/**
 * Helper function to advance time in tests
 * @param {number} seconds - Number of seconds to advance
 */
async function advanceTime(seconds) {
    await ethers.provider.send("evm_increaseTime", [seconds]);
    await ethers.provider.send("evm_mine");
}

/**
 * Helper function to advance time by months
 * @param {number} months - Number of months to advance
 */
async function advanceTimeByMonths(months) {
    await advanceTime(TEST_CONFIG.SECONDS_PER_MONTH * months);
}

/**
 * Helper function to advance time by days
 * @param {number} days - Number of days to advance
 */
async function advanceTimeByDays(days) {
    await advanceTime(TEST_CONFIG.SECONDS_PER_DAY * days);
}

/**
 * Helper function to get current block timestamp
 * @returns {Promise<number>} Current block timestamp
 */
async function getCurrentTimestamp() {
    const block = await ethers.provider.getBlock("latest");
    return block.timestamp;
}

/**
 * Helper function to calculate expected fee
 * @param {BigNumber} amount - Transfer amount
 * @returns {BigNumber} Expected fee amount
 */
function calculateExpectedFee(amount) {
    return amount.mul(TEST_CONFIG.TAX_RATE).div(TEST_CONFIG.TAX_DENOMINATOR);
}

/**
 * Helper function to calculate expected fee distribution
 * @param {BigNumber} feeAmount - Total fee amount
 * @returns {Object} Distribution breakdown
 */
function calculateFeeDistribution(feeAmount) {
    const feeWalletAmount = feeAmount.mul(TEST_CONFIG.FEE_SHARE).div(TEST_CONFIG.TAX_DENOMINATOR);
    const donationAmount = feeAmount.mul(TEST_CONFIG.DONATION_SHARE).div(TEST_CONFIG.TAX_DENOMINATOR);
    const burnAmount = feeAmount.sub(feeWalletAmount).sub(donationAmount);
    
    return {
        feeWalletAmount,
        donationAmount,
        burnAmount,
        total: feeAmount
    };
}

/**
 * Helper function to calculate expected admin release amounts
 * @param {BigNumber} allocation - Total admin allocation
 * @returns {Object} Release amounts breakdown
 */
function calculateAdminReleaseAmounts(allocation) {
    const immediateRelease = allocation.mul(TEST_CONFIG.ADMIN_IMMEDIATE_RELEASE).div(TEST_CONFIG.TAX_DENOMINATOR);
    const lockedAmount = allocation.sub(immediateRelease);
    const monthlyRelease = allocation.mul(TEST_CONFIG.ADMIN_MONTHLY_RELEASE).div(TEST_CONFIG.TAX_DENOMINATOR);
    const monthlyBurn = monthlyRelease.mul(TEST_CONFIG.BURN_PERCENTAGE).div(TEST_CONFIG.TAX_DENOMINATOR);
    const monthlyToAdmin = monthlyRelease.sub(monthlyBurn);
    
    return {
        immediateRelease,
        lockedAmount,
        monthlyRelease,
        monthlyBurn,
        monthlyToAdmin
    };
}

/**
 * Helper function to calculate expected locked wallet release amounts
 * @param {BigNumber} allocation - Total locked allocation
 * @returns {Object} Release amounts breakdown
 */
function calculateLockedReleaseAmounts(allocation) {
    const monthlyRelease = allocation.mul(TEST_CONFIG.LOCKED_MONTHLY_RELEASE).div(TEST_CONFIG.TAX_DENOMINATOR);
    const monthlyBurn = monthlyRelease.mul(TEST_CONFIG.BURN_PERCENTAGE).div(TEST_CONFIG.TAX_DENOMINATOR);
    const monthlyToBeneficiary = monthlyRelease.sub(monthlyBurn);
    
    return {
        monthlyRelease,
        monthlyBurn,
        monthlyToBeneficiary
    };
}

/**
 * Helper function to get balance snapshot for multiple accounts
 * @param {Contract} token - Token contract instance
 * @param {Array<string>} addresses - Array of addresses to snapshot
 * @returns {Promise<Object>} Balance snapshot
 */
async function getBalanceSnapshot(token, addresses) {
    const snapshot = {};
    
    for (const address of addresses) {
        snapshot[address] = await token.balanceOf(address);
    }
    
    return snapshot;
}

/**
 * Helper function to compare balance changes
 * @param {Object} before - Balance snapshot before
 * @param {Object} after - Balance snapshot after
 * @returns {Object} Balance changes
 */
function calculateBalanceChanges(before, after) {
    const changes = {};
    
    for (const address in before) {
        changes[address] = after[address].sub(before[address]);
    }
    
    return changes;
}

module.exports = {
    // Configuration
    TEST_CONFIG,
    
    // Main fixtures
    deployTokenFixture,
    deployTokenWithTradingFixture,
    deployTokenWithAdminFixture,
    deployTokenWithLockedWalletFixture,
    deployTokenWithExemptionsFixture,
    deployTokenWithAMMFixture,
    deployTokenWithDistributionFixture,
    deployTokenFullyConfiguredFixture,
    
    // Library deployment
    deployLibraries,
    
    // Time helpers
    advanceTime,
    advanceTimeByMonths,
    advanceTimeByDays,
    getCurrentTimestamp,
    
    // Calculation helpers
    calculateExpectedFee,
    calculateFeeDistribution,
    calculateAdminReleaseAmounts,
    calculateLockedReleaseAmounts,
    
    // Balance helpers
    getBalanceSnapshot,
    calculateBalanceChanges,
};
