// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract TestAMM {
    // Simple contract to simulate AMM behavior for testing
    
    function getAddress() external view returns (address) {
        return address(this);
    }
    
    // Accept any token transfers
    receive() external payable {}
}