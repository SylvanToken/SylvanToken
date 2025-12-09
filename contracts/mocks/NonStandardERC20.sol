// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

/**
 * @title NonStandardERC20
 * @dev Mock ERC20 token that doesn't return boolean values (like USDT)
 * Used for testing SafeERC20 compatibility
 */
contract NonStandardERC20 {
    string public name = "Non-Standard Token";
    string public symbol = "NST";
    uint8 public decimals = 6; // Like USDT
    uint256 public totalSupply = 1000000 * 10**6;
    
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;
    
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    
    constructor() {
        balanceOf[msg.sender] = totalSupply;
    }
    
    // Non-standard: doesn't return boolean
    function transfer(address to, uint256 amount) external {
        require(balanceOf[msg.sender] >= amount, "Insufficient balance");
        require(to != address(0), "Invalid recipient");
        
        balanceOf[msg.sender] -= amount;
        balanceOf[to] += amount;
        
        emit Transfer(msg.sender, to, amount);
        // Note: No return value (like USDT)
    }
    
    // Non-standard: doesn't return boolean
    function transferFrom(address from, address to, uint256 amount) external {
        require(balanceOf[from] >= amount, "Insufficient balance");
        require(allowance[from][msg.sender] >= amount, "Insufficient allowance");
        require(to != address(0), "Invalid recipient");
        
        balanceOf[from] -= amount;
        balanceOf[to] += amount;
        allowance[from][msg.sender] -= amount;
        
        emit Transfer(from, to, amount);
        // Note: No return value (like USDT)
    }
    
    // Non-standard: doesn't return boolean
    function approve(address spender, uint256 amount) external {
        allowance[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        // Note: No return value (like USDT)
    }
    
    // Helper function for testing
    function mint(address to, uint256 amount) external {
        balanceOf[to] += amount;
        totalSupply += amount;
        emit Transfer(address(0), to, amount);
    }
    
    // Simulate transfer failure for testing
    bool public shouldFailTransfer = false;
    
    function setShouldFailTransfer(bool _shouldFail) external {
        shouldFailTransfer = _shouldFail;
    }
    
    function failingTransfer(address to, uint256 amount) external {
        require(!shouldFailTransfer, "Transfer intentionally failed");
        require(balanceOf[msg.sender] >= amount, "Insufficient balance");
        require(to != address(0), "Invalid recipient");
        
        balanceOf[msg.sender] -= amount;
        balanceOf[to] += amount;
        
        emit Transfer(msg.sender, to, amount);
    }
}