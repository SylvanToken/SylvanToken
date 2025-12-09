// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract TestHelpers {
    // Event for testing event emission
    event TestEvent(address indexed user, uint256 value, string message);
    
    // State variables for testing
    uint256 public counter;
    mapping(address => uint256) public userBalances;
    address[] public users;
    
    // Modifier for testing access control
    modifier onlyEvenCounter() {
        require(counter % 2 == 0, "Counter must be even");
        _;
    }
    
    function incrementCounter() external {
        counter++;
        emit TestEvent(msg.sender, counter, "Counter incremented");
    }
    
    function setUserBalance(address user, uint256 balance) external onlyEvenCounter {
        if (userBalances[user] == 0 && balance > 0) {
            users.push(user);
        }
        userBalances[user] = balance;
        emit TestEvent(user, balance, "Balance set");
    }
    
    function getUserCount() external view returns (uint256) {
        return users.length;
    }
    
    function getAllUsers() external view returns (address[] memory) {
        return users;
    }
    
    // Function to test gas consumption
    function expensiveOperation(uint256 iterations) external {
        for (uint256 i = 0; i < iterations; i++) {
            counter += i;
        }
    }
    
    // Function to test revert conditions
    function testRevert(bool shouldRevert, string memory message) external pure {
        if (shouldRevert) {
            revert(message);
        }
    }
    
    // Function to test different return types
    function getMultipleValues() external view returns (
        uint256 number,
        string memory text,
        bool flag,
        address addr
    ) {
        return (counter, "test", counter > 0, address(this));
    }
    
    // Function to test array operations
    function processArray(uint256[] memory numbers) external pure returns (uint256 sum, uint256 max) {
        sum = 0;
        max = 0;
        
        for (uint256 i = 0; i < numbers.length; i++) {
            sum += numbers[i];
            if (numbers[i] > max) {
                max = numbers[i];
            }
        }
    }
    
    // Function to test struct operations
    struct TestStruct {
        uint256 id;
        string name;
        bool active;
    }
    
    mapping(uint256 => TestStruct) public testStructs;
    uint256 public structCount;
    
    function createStruct(string memory name, bool active) external returns (uint256) {
        uint256 id = structCount++;
        testStructs[id] = TestStruct(id, name, active);
        return id;
    }
    
    function updateStruct(uint256 id, string memory name, bool active) external {
        require(id < structCount, "Invalid struct ID");
        testStructs[id].name = name;
        testStructs[id].active = active;
    }
    
    // Function to test token interactions
    function transferTokens(address token, address to, uint256 amount) external {
        IERC20(token).transfer(to, amount);
    }
    
    function transferTokensFrom(address token, address from, address to, uint256 amount) external {
        IERC20(token).transferFrom(from, to, amount);
    }
    
    // Function to test time-based operations
    uint256 public lastActionTime;
    
    function timeBasedAction() external {
        require(block.timestamp > lastActionTime + 1 hours, "Too soon");
        lastActionTime = block.timestamp;
        counter++;
    }
    
    // Function to test ETH handling
    function depositETH() external payable {
        userBalances[msg.sender] += msg.value;
        emit TestEvent(msg.sender, msg.value, "ETH deposited");
    }
    
    function withdrawETH(uint256 amount) external {
        require(userBalances[msg.sender] >= amount, "Insufficient balance");
        userBalances[msg.sender] -= amount;
        payable(msg.sender).transfer(amount);
        emit TestEvent(msg.sender, amount, "ETH withdrawn");
    }
    
    // Function to test complex calculations
    function complexCalculation(uint256 a, uint256 b, uint256 c) external pure returns (uint256) {
        // Simulate complex mathematical operations
        uint256 result = (a * b) / (c + 1);
        result = (result ** 2) % 1000000;
        return result;
    }
    
    receive() external payable {
        userBalances[msg.sender] += msg.value;
        emit TestEvent(msg.sender, msg.value, "ETH received");
    }
}