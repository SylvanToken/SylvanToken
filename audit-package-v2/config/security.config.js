const { ethers } = require("hardhat");

/**
 * @title Security Configuration for SylvanToken
 * @dev Centralized security parameters and limits
 */
module.exports = {
    // Contract Security Limits
    contract: {
        maxTaxRate: 500, // 5% maximum tax rate
        minLockDuration: 30 * 24 * 60 * 60, // 30 days minimum lock
        maxExemptAccounts: 50, // Maximum exempt accounts
        emergencyWithdrawLimit: ethers.utils.parseEther("1000000"), // 1M token emergency limit
        maxTransferAmount: ethers.utils.parseEther("50000000"), // 50M token max transfer
        cooldownPeriod: 24 * 60 * 60 // 24 hours cooldown
    },

    // Economic Security Parameters
    economics: {
        maxSingleTransfer: ethers.utils.parseEther("10000000"), // 10M token max single transfer
        minLiquidityLock: 365 * 24 * 60 * 60, // 1 year minimum liquidity lock
        whaleThreshold: ethers.utils.parseEther("10000000"), // 10M token whale threshold
        rapidTradeLimit: 10, // Maximum trades per block
        maxSlippage: 1000, // 10% maximum slippage
        minLiquidity: ethers.utils.parseEther("100000") // 100K minimum liquidity
    },

    // Operational Security
    operations: {
        adminMultiSig: true, // Require multi-sig for admin operations
        timelockDuration: 3 * 24 * 60 * 60, // 3 days timelock
        maxOwnershipChange: 10, // Maximum ownership changes per day
        emergencyResponseTime: 24 * 60 * 60, // 24 hours emergency response
        maxBatchSize: 100, // Maximum batch operation size
        adminCooldown: 1 * 60 * 60 // 1 hour admin cooldown
    },

    // Validation Rules
    validation: {
        minAddressLength: 42, // Ethereum address length
        maxArrayLength: 100, // Maximum array length for batch operations
        minAmount: ethers.utils.parseEther("0.000001"), // Minimum transfer amount
        maxPercentage: 10000, // 100% in basis points
        minPercentage: 0, // 0% minimum
        maxDecimals: 18 // Maximum token decimals
    },

    // Emergency Protocols
    emergency: {
        pauseDuration: 7 * 24 * 60 * 60, // 7 days maximum pause
        emergencyWithdrawWindow: 48 * 60 * 60, // 48 hours withdrawal window
        maxEmergencyActions: 5, // Maximum emergency actions per day
        emergencyMultiSig: true, // Require multi-sig for emergency
        autoUnpauseTime: 24 * 60 * 60 // 24 hours auto-unpause
    }
};