// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "../libraries/EmergencyManager.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title EmergencyManagerLibraryTestContract
 * @dev Test contract for EmergencyManager library functions
 */
contract EmergencyManagerLibraryTestContract {
    using EmergencyManager for EmergencyManager.EmergencyData;
    
    EmergencyManager.EmergencyData private emergencyData;
    
    // Expose constants for testing
    function getEmergencyTimelock() external pure returns (uint256) {
        return EmergencyManager.EMERGENCY_TIMELOCK;
    }
    
    function getEmergencyWindow() external pure returns (uint256) {
        return EmergencyManager.EMERGENCY_WINDOW;
    }
    
    // Test functions for EmergencyManager library
    function testEnableEmergencyWithdraw() external {
        EmergencyManager.enableEmergencyWithdraw(emergencyData);
    }
    
    function testCancelEmergencyWithdraw() external {
        EmergencyManager.cancelEmergencyWithdraw(emergencyData);
    }
    
    function testExecuteEmergencyWithdraw(
        address token,
        uint256 amount,
        address payable recipient
    ) external {
        EmergencyManager.executeEmergencyWithdraw(emergencyData, token, amount, recipient);
    }
    
    function testGetEmergencyStatus() external view returns (
        bool isEnabled,
        uint256 unlockTime,
        bool canWithdraw,
        bool hasExpired
    ) {
        return EmergencyManager.getEmergencyStatus(emergencyData);
    }
    
    function testGetEmergencyStats(address token) external view returns (
        uint256 withdrawnAmount,
        uint256 totalWithdrawn,
        uint256 contractBalance
    ) {
        return EmergencyManager.getEmergencyStats(emergencyData, token);
    }
    
    function testValidateEmergencyWithdraw(
        address token,
        uint256 amount
    ) external view returns (bool isValid, string memory errorMessage) {
        return EmergencyManager.validateEmergencyWithdraw(emergencyData, token, amount);
    }
    
    // Helper functions for testing
    receive() external payable {}
    
    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }
    
    function getTokenBalance(address token) external view returns (uint256) {
        return IERC20(token).balanceOf(address(this));
    }
}