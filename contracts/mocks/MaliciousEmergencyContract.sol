// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title MaliciousEmergencyContract
 * @dev Contract to test unauthorized access and reentrancy attacks on EmergencyManager
 */
contract MaliciousEmergencyContract {
    address public targetContract;
    bool public reentrancyAttempted = false;
    
    constructor(address _targetContract) {
        targetContract = _targetContract;
    }
    
    // Attempt to call emergency functions without proper authorization
    function attemptUnauthorizedEnable() external {
        // Try to call the target contract's emergency enable function
        (bool success,) = targetContract.call(
            abi.encodeWithSignature("enableEmergencyWithdraw()")
        );
        require(success, "Unauthorized call failed");
    }
    
    function attemptUnauthorizedCancel() external {
        // Try to call the target contract's emergency cancel function
        (bool success,) = targetContract.call(
            abi.encodeWithSignature("cancelEmergencyWithdraw()")
        );
        require(success, "Unauthorized call failed");
    }
    
    function attemptUnauthorizedWithdraw(address token, uint256 amount) external {
        // Try to call the target contract's emergency withdraw function
        (bool success,) = targetContract.call(
            abi.encodeWithSignature("emergencyWithdraw(address,uint256)", token, amount)
        );
        require(success, "Unauthorized call failed");
    }
    
    // Reentrancy attack attempt
    receive() external payable {
        if (!reentrancyAttempted && address(this).balance > 0) {
            reentrancyAttempted = true;
            // Try to call emergency withdraw again during the transfer
            try this.attemptReentrancy() {
                // Reentrancy succeeded
            } catch {
                // Reentrancy failed (expected)
            }
        }
    }
    
    function attemptReentrancy() external {
        if (targetContract != address(0)) {
            // Try to call the target contract's emergency function
            (bool success,) = targetContract.call(
                abi.encodeWithSignature("emergencyWithdraw(address,uint256)", address(0), 1 ether)
            );
        }
    }
    
    function resetReentrancyFlag() external {
        reentrancyAttempted = false;
    }
}