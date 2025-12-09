// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title AccessControlLib
 * @dev Library for managing access control, cooldowns, and security features
 * @notice This library provides secure access control mechanisms with cooldown periods and ownership transfers
 */
library AccessControlLib {
    
    // Constants
    uint256 public constant ADMIN_COOLDOWN = 1 hours;
    uint256 public constant OWNERSHIP_TIMELOCK = 24 hours;
    
    /**
     * @dev Access control data structure
     */
    struct AccessData {
        bool contractPaused;                         // Contract pause state
        uint256 ownershipTransferInitiatedAt;        // Timestamp when ownership transfer was initiated
        address pendingOwner;                        // Address of pending new owner
        mapping(bytes4 => uint256) lastAdminAction;  // Cooldown tracking for admin actions
    }

    // Events
    event ContractPaused(address indexed admin);
    event ContractUnpaused(address indexed admin);
    event OwnershipTransferInitiated(address indexed currentOwner, address indexed pendingOwner, uint256 timestamp);
    event OwnershipTransferCompleted(address indexed previousOwner, address indexed newOwner);
    event OwnershipTransferCancelled(address indexed owner, address indexed cancelledPendingOwner);
    event AdminCooldownTriggered(bytes4 indexed functionSig, uint256 timestamp);

    /**
     * @dev Check owner permissions with cooldown enforcement
     * @param data Access control data storage reference
     * @param functionSig Function signature for cooldown tracking
     * @param caller Address of the caller
     * @param owner Address of the contract owner
     */
    function checkOwnerWithCooldown(
        AccessData storage data,
        bytes4 functionSig,
        address caller,
        address owner
    ) external {
        require(owner == caller, "Ownable: caller is not the owner");
        require(
            block.timestamp >= data.lastAdminAction[functionSig] + ADMIN_COOLDOWN,
            "Cooldown period not elapsed"
        );
        
        data.lastAdminAction[functionSig] = block.timestamp;
        emit AdminCooldownTriggered(functionSig, block.timestamp);
    }

    /**
     * @dev Check if contract is not paused
     * @param data Access control data storage reference
     */
    function requireNotPaused(AccessData storage data) external view {
        require(!data.contractPaused, "Contract is paused");
    }

    /**
     * @dev Check if caller is the pending owner
     * @param data Access control data storage reference
     * @param caller Address of the caller
     */
    function requirePendingOwner(AccessData storage data, address caller) external view {
        require(caller == data.pendingOwner, "Caller is not the pending owner");
    }

    /**
     * @dev Pause the contract
     * @param data Access control data storage reference
     * @param admin Address of the admin pausing the contract
     */
    function pauseContract(AccessData storage data, address admin) external {
        require(!data.contractPaused, "Contract already paused");
        data.contractPaused = true;
        emit ContractPaused(admin);
    }

    /**
     * @dev Unpause the contract
     * @param data Access control data storage reference
     * @param admin Address of the admin unpausing the contract
     */
    function unpauseContract(AccessData storage data, address admin) external {
        require(data.contractPaused, "Contract not paused");
        data.contractPaused = false;
        emit ContractUnpaused(admin);
    }

    /**
     * @dev Initiate ownership transfer with timelock
     * @param data Access control data storage reference
     * @param newOwner Address of the new owner
     * @param currentOwner Address of the current owner
     */
    function initiateOwnershipTransfer(
        AccessData storage data,
        address newOwner,
        address currentOwner
    ) external {
        require(newOwner != address(0), "New owner cannot be zero address");
        require(newOwner != currentOwner, "New owner cannot be current owner");
        require(data.pendingOwner == address(0), "Ownership transfer already initiated");
        
        data.pendingOwner = newOwner;
        data.ownershipTransferInitiatedAt = block.timestamp;
        
        emit OwnershipTransferInitiated(currentOwner, newOwner, block.timestamp);
    }

    /**
     * @dev Complete ownership transfer after timelock
     * @param data Access control data storage reference
     * @param caller Address attempting to complete the transfer
     * @return previousOwner Address of the previous owner
     * @return newOwner Address of the new owner
     */
    function completeOwnershipTransfer(
        AccessData storage data,
        address caller
    ) external returns (address previousOwner, address newOwner) {
        require(caller == data.pendingOwner, "Caller is not the pending owner");
        require(data.ownershipTransferInitiatedAt != 0, "Ownership transfer not initiated");
        require(
            block.timestamp >= data.ownershipTransferInitiatedAt + OWNERSHIP_TIMELOCK,
            "Ownership transfer timelock not elapsed"
        );
        
        previousOwner = data.pendingOwner; // This will be updated by the main contract
        newOwner = data.pendingOwner;
        
        // Reset transfer state
        data.pendingOwner = address(0);
        data.ownershipTransferInitiatedAt = 0;
        
        emit OwnershipTransferCompleted(previousOwner, newOwner);
    }

    /**
     * @dev Cancel pending ownership transfer
     * @param data Access control data storage reference
     * @param owner Address of the current owner
     */
    function cancelOwnershipTransfer(AccessData storage data, address owner) external {
        require(data.pendingOwner != address(0), "No pending ownership transfer");
        
        address cancelledPendingOwner = data.pendingOwner;
        data.pendingOwner = address(0);
        data.ownershipTransferInitiatedAt = 0;
        
        emit OwnershipTransferCancelled(owner, cancelledPendingOwner);
    }

    /**
     * @dev Get ownership transfer status
     * @param data Access control data storage reference
     * @return isPending Whether there is a pending ownership transfer
     * @return pendingOwner Address of the pending owner
     * @return initiatedAt Timestamp when transfer was initiated
     * @return canComplete Whether the transfer can be completed now
     */
    function getOwnershipTransferStatus(AccessData storage data)
        external
        view
        returns (
            bool isPending,
            address pendingOwner,
            uint256 initiatedAt,
            bool canComplete
        )
    {
        isPending = data.pendingOwner != address(0);
        pendingOwner = data.pendingOwner;
        initiatedAt = data.ownershipTransferInitiatedAt;
        
        if (isPending) {
            canComplete = block.timestamp >= data.ownershipTransferInitiatedAt + OWNERSHIP_TIMELOCK;
        } else {
            canComplete = false;
        }
    }

    /**
     * @dev Get contract pause status
     * @param data Access control data storage reference
     * @return isPaused Whether the contract is currently paused
     */
    function isPaused(AccessData storage data) external view returns (bool) {
        return data.contractPaused;
    }

    /**
     * @dev Get last admin action timestamp for a function
     * @param data Access control data storage reference
     * @param functionSig Function signature to check
     * @return timestamp Last time the function was called
     */
    function getLastAdminAction(AccessData storage data, bytes4 functionSig)
        external
        view
        returns (uint256)
    {
        return data.lastAdminAction[functionSig];
    }

    /**
     * @dev Check if cooldown period has elapsed for a function
     * @param data Access control data storage reference
     * @param functionSig Function signature to check
     * @return canExecute Whether the function can be executed now
     * @return timeRemaining Time remaining in cooldown (0 if can execute)
     */
    function checkCooldown(AccessData storage data, bytes4 functionSig)
        external
        view
        returns (bool canExecute, uint256 timeRemaining)
    {
        uint256 lastAction = data.lastAdminAction[functionSig];
        uint256 nextAllowedTime = lastAction + ADMIN_COOLDOWN;
        
        if (block.timestamp >= nextAllowedTime) {
            canExecute = true;
            timeRemaining = 0;
        } else {
            canExecute = false;
            timeRemaining = nextAllowedTime - block.timestamp;
        }
    }

    /**
     * @dev Validate ownership transfer parameters
     * @param newOwner Address of the proposed new owner
     * @param currentOwner Address of the current owner
     * @param contractAddress Address of the contract
     */
    function validateOwnershipTransfer(
        address newOwner,
        address currentOwner,
        address contractAddress
    ) external pure {
        require(newOwner != address(0), "New owner cannot be zero address");
        require(newOwner != currentOwner, "New owner cannot be current owner");
        require(newOwner != contractAddress, "New owner cannot be contract address");
    }
}