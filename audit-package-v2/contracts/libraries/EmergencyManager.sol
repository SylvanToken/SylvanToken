// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title EmergencyManager
 * @dev Library for handling emergency withdraw functionality with timelock security
 * @notice This library provides secure emergency withdrawal mechanisms with proper validation
 */
library EmergencyManager {
    using SafeERC20 for IERC20;

    // Constants
    uint256 public constant EMERGENCY_TIMELOCK = 2 days;
    uint256 public constant EMERGENCY_WINDOW = 1 hours;

    /**
     * @dev Emergency data structure for managing withdrawal state
     */
    struct EmergencyData {
        uint256 unlockTime;                           // When emergency withdraw becomes available
        mapping(address => uint256) withdrawHistory;  // History of withdrawals per token
        uint256 totalWithdrawn;                      // Total amount withdrawn across all tokens
    }

    // Events
    event EmergencyWithdrawEnabled(uint256 unlockTime);
    event EmergencyWithdrawCancelled();
    event EmergencyWithdraw(address indexed token, uint256 amount);
    event EmergencyWithdrawHistoryUpdated(address indexed token, uint256 amount, uint256 totalWithdrawn);

    /**
     * @dev Enable emergency withdraw with timelock
     * @param data Emergency data storage reference
     */
    function enableEmergencyWithdraw(EmergencyData storage data) external {
        require(data.unlockTime == 0, "Emergency withdraw already enabled");
        
        data.unlockTime = block.timestamp + EMERGENCY_TIMELOCK;
        
        emit EmergencyWithdrawEnabled(data.unlockTime);
    }

    /**
     * @dev Cancel emergency withdraw before timelock expires
     * @param data Emergency data storage reference
     */
    function cancelEmergencyWithdraw(EmergencyData storage data) external {
        require(data.unlockTime != 0, "Emergency withdraw not enabled");
        require(block.timestamp < data.unlockTime, "Emergency withdraw timelock already passed");
        
        data.unlockTime = 0;
        emit EmergencyWithdrawCancelled();
    }

    /**
     * @dev Execute emergency withdrawal of tokens or ETH
     * @param data Emergency data storage reference
     * @param token Token address (address(0) for ETH)
     * @param amount Amount to withdraw
     * @param recipient Address to receive the withdrawn funds
     */
    function executeEmergencyWithdraw(
        EmergencyData storage data,
        address token,
        uint256 amount,
        address payable recipient
    ) external {
        // Validate timelock conditions
        require(data.unlockTime != 0 && block.timestamp >= data.unlockTime, 
            "Emergency withdraw timelock not passed");
        require(block.timestamp <= data.unlockTime + EMERGENCY_WINDOW,
            "Emergency withdraw window expired");
        
        // Validate inputs
        require(amount > 0, "Amount must be greater than zero");
        require(recipient != address(0), "Invalid recipient address");
        
        // Check balance and execute withdrawal
        if (token == address(0)) {
            // ETH withdrawal
            require(address(this).balance >= amount, "Insufficient ETH balance");
            recipient.transfer(amount);
        } else {
            // ERC20 token withdrawal
            IERC20 tokenContract = IERC20(token);
            require(tokenContract.balanceOf(address(this)) >= amount, "Insufficient token balance");
            tokenContract.safeTransfer(recipient, amount);
        }
        
        // Update history and reset state
        data.withdrawHistory[token] += amount;
        data.totalWithdrawn += amount;
        data.unlockTime = 0; // Reset timelock after successful withdrawal
        
        emit EmergencyWithdraw(token, amount);
        emit EmergencyWithdrawHistoryUpdated(token, amount, data.withdrawHistory[token]);
    }

    /**
     * @dev Get current emergency withdraw status
     * @param data Emergency data storage reference
     * @return isEnabled Whether emergency withdraw is enabled
     * @return unlockTime When the timelock expires
     * @return canWithdraw Whether withdrawal is currently possible
     * @return hasExpired Whether the withdrawal window has expired
     */
    function getEmergencyStatus(EmergencyData storage data) 
        external 
        view 
        returns (
            bool isEnabled,
            uint256 unlockTime,
            bool canWithdraw,
            bool hasExpired
        ) 
    {
        isEnabled = data.unlockTime != 0;
        unlockTime = data.unlockTime;
        
        if (isEnabled) {
            canWithdraw = block.timestamp >= data.unlockTime && 
                         block.timestamp <= data.unlockTime + EMERGENCY_WINDOW;
            hasExpired = block.timestamp > data.unlockTime + EMERGENCY_WINDOW;
        } else {
            canWithdraw = false;
            hasExpired = false;
        }
    }

    /**
     * @dev Get emergency withdraw statistics for a specific token
     * @param data Emergency data storage reference
     * @param token Token address to check (address(0) for ETH)
     * @return withdrawnAmount Total amount withdrawn for this token
     * @return totalWithdrawn Total amount withdrawn across all tokens
     * @return contractBalance Current contract balance for this token
     */
    function getEmergencyStats(EmergencyData storage data, address token)
        external
        view
        returns (
            uint256 withdrawnAmount,
            uint256 totalWithdrawn,
            uint256 contractBalance
        )
    {
        withdrawnAmount = data.withdrawHistory[token];
        totalWithdrawn = data.totalWithdrawn;
        
        if (token == address(0)) {
            contractBalance = address(this).balance;
        } else {
            contractBalance = IERC20(token).balanceOf(address(this));
        }
    }

    /**
     * @dev Validate emergency withdraw conditions without executing
     * @param data Emergency data storage reference
     * @param token Token address to validate
     * @param amount Amount to validate
     * @return isValid Whether the withdrawal would be valid
     * @return errorMessage Error message if not valid
     */
    function validateEmergencyWithdraw(
        EmergencyData storage data,
        address token,
        uint256 amount
    ) external view returns (bool isValid, string memory errorMessage) {
        // Check timelock conditions
        if (data.unlockTime == 0) {
            return (false, "Emergency withdraw not enabled");
        }
        
        if (block.timestamp < data.unlockTime) {
            return (false, "Emergency withdraw timelock not passed");
        }
        
        if (block.timestamp > data.unlockTime + EMERGENCY_WINDOW) {
            return (false, "Emergency withdraw window expired");
        }
        
        // Check amount
        if (amount == 0) {
            return (false, "Amount must be greater than zero");
        }
        
        // Check balance
        uint256 balance;
        if (token == address(0)) {
            balance = address(this).balance;
        } else {
            balance = IERC20(token).balanceOf(address(this));
        }
        
        if (balance < amount) {
            return (false, "Insufficient balance");
        }
        
        return (true, "");
    }
}