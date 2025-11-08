// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "../libraries/AccessControl.sol";

/**
 * @title AccessControlTestContract
 * @dev Test contract for AccessControl library functions
 */
contract AccessControlTestContract {
    using AccessControlLib for AccessControlLib.AccessData;
    
    AccessControlLib.AccessData private accessData;
    address public owner;
    
    constructor() {
        owner = msg.sender;
    }
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Ownable: caller is not the owner");
        _;
    }
    
    // Test functions for AccessControl library
    
    function testCheckOwnerWithCooldown(bytes4 functionSig) external {
        accessData.checkOwnerWithCooldown(functionSig, msg.sender, owner);
    }
    
    function testRequireNotPaused() external view {
        accessData.requireNotPaused();
    }
    
    function testRequirePendingOwner() external view {
        accessData.requirePendingOwner(msg.sender);
    }
    
    function testPauseContract() external onlyOwner {
        accessData.pauseContract(msg.sender);
    }
    
    function testUnpauseContract() external onlyOwner {
        accessData.unpauseContract(msg.sender);
    }
    
    function testInitiateOwnershipTransfer(address newOwner) external onlyOwner {
        accessData.initiateOwnershipTransfer(newOwner, owner);
    }
    
    function testCompleteOwnershipTransfer() external returns (address previousOwner, address newOwner) {
        (previousOwner, newOwner) = accessData.completeOwnershipTransfer(msg.sender);
        owner = newOwner;
    }
    
    function testCancelOwnershipTransfer() external onlyOwner {
        accessData.cancelOwnershipTransfer(owner);
    }
    
    function testGetOwnershipTransferStatus() external view returns (
        bool isPending,
        address pendingOwner,
        uint256 initiatedAt,
        bool canComplete
    ) {
        return accessData.getOwnershipTransferStatus();
    }
    
    function testIsPaused() external view returns (bool) {
        return accessData.isPaused();
    }
    
    function testGetLastAdminAction(bytes4 functionSig) external view returns (uint256) {
        return accessData.getLastAdminAction(functionSig);
    }
    
    function testCheckCooldown(bytes4 functionSig) external view returns (bool canExecute, uint256 timeRemaining) {
        return accessData.checkCooldown(functionSig);
    }
    
    function testValidateOwnershipTransfer(address newOwner, address currentOwner, address contractAddress) external pure {
        AccessControlLib.validateOwnershipTransfer(newOwner, currentOwner, contractAddress);
    }
    
    // Helper functions for testing
    function getCurrentOwner() external view returns (address) {
        return owner;
    }
    
    function setOwner(address newOwner) external {
        owner = newOwner;
    }
    
    // Get constants for testing
    function getAdminCooldown() external pure returns (uint256) {
        return AccessControlLib.ADMIN_COOLDOWN;
    }
    
    function getOwnershipTimelock() external pure returns (uint256) {
        return AccessControlLib.OWNERSHIP_TIMELOCK;
    }
}