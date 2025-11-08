// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title EmergencyManagerTestContract
 * @dev Test contract that implements EmergencyManager library functionality for testing
 */
contract EmergencyManagerTestContract {
    using SafeERC20 for IERC20;

    // Constants from EmergencyManager library
    uint256 public constant EMERGENCY_TIMELOCK = 2 days;
    uint256 public constant EMERGENCY_WINDOW = 1 hours;

    // Emergency data structure
    struct EmergencyData {
        uint256 unlockTime;
        mapping(address => uint256) withdrawHistory;
        uint256 totalWithdrawn;
    }

    EmergencyData private emergencyData;

    // Events
    event EmergencyWithdrawEnabled(uint256 unlockTime);
    event EmergencyWithdrawCancelled();
    event EmergencyWithdraw(address indexed token, uint256 amount);
    event EmergencyWithdrawHistoryUpdated(address indexed token, uint256 amount, uint256 totalWithdrawn);

    // Test functions that implement library functionality
    function testEnableEmergencyWithdraw() external {
        require(emergencyData.unlockTime == 0, "Emergency withdraw already enabled");
        
        emergencyData.unlockTime = block.timestamp + EMERGENCY_TIMELOCK;
        
        emit EmergencyWithdrawEnabled(emergencyData.unlockTime);
    }

    function testCancelEmergencyWithdraw() external {
        require(emergencyData.unlockTime != 0, "Emergency withdraw not enabled");
        require(block.timestamp < emergencyData.unlockTime, "Emergency withdraw timelock already passed");
        
        emergencyData.unlockTime = 0;
        emit EmergencyWithdrawCancelled();
    }

    function testExecuteEmergencyWithdraw(
        address token,
        uint256 amount,
        address payable recipient
    ) external {
        // Validate timelock conditions
        require(emergencyData.unlockTime != 0 && block.timestamp >= emergencyData.unlockTime, 
            "Emergency withdraw timelock not passed");
        require(block.timestamp <= emergencyData.unlockTime + EMERGENCY_WINDOW,
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
        emergencyData.withdrawHistory[token] += amount;
        emergencyData.totalWithdrawn += amount;
        emergencyData.unlockTime = 0; // Reset timelock after successful withdrawal
        
        emit EmergencyWithdraw(token, amount);
        emit EmergencyWithdrawHistoryUpdated(token, amount, emergencyData.withdrawHistory[token]);
    }

    function testGetEmergencyStatus() external view returns (
        bool isEnabled,
        uint256 unlockTime,
        bool canWithdraw,
        bool hasExpired
    ) {
        isEnabled = emergencyData.unlockTime != 0;
        unlockTime = emergencyData.unlockTime;
        
        if (isEnabled) {
            canWithdraw = block.timestamp >= emergencyData.unlockTime && 
                         block.timestamp <= emergencyData.unlockTime + EMERGENCY_WINDOW;
            hasExpired = block.timestamp > emergencyData.unlockTime + EMERGENCY_WINDOW;
        } else {
            canWithdraw = false;
            hasExpired = false;
        }
    }

    function testGetEmergencyStats(address token) external view returns (
        uint256 withdrawnAmount,
        uint256 totalWithdrawn,
        uint256 contractBalance
    ) {
        withdrawnAmount = emergencyData.withdrawHistory[token];
        totalWithdrawn = emergencyData.totalWithdrawn;
        
        if (token == address(0)) {
            contractBalance = address(this).balance;
        } else {
            contractBalance = IERC20(token).balanceOf(address(this));
        }
    }

    function testValidateEmergencyWithdraw(
        address token,
        uint256 amount
    ) external view returns (bool isValid, string memory errorMessage) {
        // Check timelock conditions
        if (emergencyData.unlockTime == 0) {
            return (false, "Emergency withdraw not enabled");
        }
        
        if (block.timestamp < emergencyData.unlockTime) {
            return (false, "Emergency withdraw timelock not passed");
        }
        
        if (block.timestamp > emergencyData.unlockTime + EMERGENCY_WINDOW) {
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

    // Helper functions for testing
    function getEmergencyTimelock() external pure returns (uint256) {
        return EMERGENCY_TIMELOCK;
    }
    
    function getEmergencyWindow() external pure returns (uint256) {
        return EMERGENCY_WINDOW;
    }
    
    // Function to receive ETH for testing
    receive() external payable {}
    
    // Function to check contract ETH balance
    function getETHBalance() external view returns (uint256) {
        return address(this).balance;
    }
    
    // Function to check token balance
    function getTokenBalance(address token) external view returns (uint256) {
        return IERC20(token).balanceOf(address(this));
    }
}