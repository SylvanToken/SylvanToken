// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract EnhancedTestAMM is ReentrancyGuard {
    IERC20 public token;
    uint256 public constant FEE_RATE = 30; // 0.3%
    uint256 public constant FEE_DENOMINATOR = 10000;
    
    mapping(address => uint256) public liquidityProviders;
    uint256 public totalLiquidity;
    uint256 public ethReserve;
    uint256 public tokenReserve;
    
    event LiquidityAdded(address indexed provider, uint256 ethAmount, uint256 tokenAmount);
    event LiquidityRemoved(address indexed provider, uint256 ethAmount, uint256 tokenAmount);
    event Swap(address indexed user, uint256 ethIn, uint256 tokenOut, uint256 tokenIn, uint256 ethOut);
    
    constructor() {
        // No token set initially - can be set later
    }
    
    function setToken(address _token) external {
        require(address(token) == address(0), "Token already set");
        token = IERC20(_token);
    }
    
    function addLiquidity(uint256 tokenAmount) external payable nonReentrant {
        require(msg.value > 0, "Must send ETH");
        require(tokenAmount > 0, "Must send tokens");
        require(address(token) != address(0), "Token not set");
        
        require(token.transferFrom(msg.sender, address(this), tokenAmount), "Token transfer failed");
        
        liquidityProviders[msg.sender] += msg.value;
        totalLiquidity += msg.value;
        ethReserve += msg.value;
        tokenReserve += tokenAmount;
        
        emit LiquidityAdded(msg.sender, msg.value, tokenAmount);
    }
    
    function removeLiquidity(uint256 ethAmount) external nonReentrant {
        require(liquidityProviders[msg.sender] >= ethAmount, "Insufficient liquidity");
        require(ethReserve >= ethAmount, "Insufficient ETH reserve");
        
        uint256 tokenAmount = (tokenReserve * ethAmount) / ethReserve;
        
        liquidityProviders[msg.sender] -= ethAmount;
        totalLiquidity -= ethAmount;
        ethReserve -= ethAmount;
        tokenReserve -= tokenAmount;
        
        require(token.transfer(msg.sender, tokenAmount), "Token transfer failed");
        payable(msg.sender).transfer(ethAmount);
        
        emit LiquidityRemoved(msg.sender, ethAmount, tokenAmount);
    }
    
    function swapETHForTokens() external payable nonReentrant {
        require(msg.value > 0, "Must send ETH");
        require(tokenReserve > 0, "No token liquidity");
        
        uint256 fee = (msg.value * FEE_RATE) / FEE_DENOMINATOR;
        uint256 ethAfterFee = msg.value - fee;
        
        // Simple AMM formula: tokenOut = (tokenReserve * ethAfterFee) / (ethReserve + ethAfterFee)
        uint256 tokenOut = (tokenReserve * ethAfterFee) / (ethReserve + ethAfterFee);
        
        require(tokenOut > 0, "Insufficient output amount");
        require(tokenReserve >= tokenOut, "Insufficient token reserve");
        
        ethReserve += msg.value;
        tokenReserve -= tokenOut;
        
        require(token.transfer(msg.sender, tokenOut), "Token transfer failed");
        
        emit Swap(msg.sender, msg.value, tokenOut, 0, 0);
    }
    
    function swapTokensForETH(uint256 tokenAmount) external nonReentrant {
        require(tokenAmount > 0, "Must send tokens");
        require(ethReserve > 0, "No ETH liquidity");
        
        require(token.transferFrom(msg.sender, address(this), tokenAmount), "Token transfer failed");
        
        uint256 fee = (tokenAmount * FEE_RATE) / FEE_DENOMINATOR;
        uint256 tokenAfterFee = tokenAmount - fee;
        
        // Simple AMM formula: ethOut = (ethReserve * tokenAfterFee) / (tokenReserve + tokenAfterFee)
        uint256 ethOut = (ethReserve * tokenAfterFee) / (tokenReserve + tokenAfterFee);
        
        require(ethOut > 0, "Insufficient output amount");
        require(ethReserve >= ethOut, "Insufficient ETH reserve");
        
        tokenReserve += tokenAmount;
        ethReserve -= ethOut;
        
        payable(msg.sender).transfer(ethOut);
        
        emit Swap(msg.sender, 0, 0, tokenAmount, ethOut);
    }
    
    function getReserves() external view returns (uint256 _ethReserve, uint256 _tokenReserve) {
        return (ethReserve, tokenReserve);
    }
    
    function getAmountOut(uint256 amountIn, bool ethToToken) external view returns (uint256) {
        if (ethToToken) {
            if (tokenReserve == 0) return 0;
            uint256 fee = (amountIn * FEE_RATE) / FEE_DENOMINATOR;
            uint256 amountAfterFee = amountIn - fee;
            return (tokenReserve * amountAfterFee) / (ethReserve + amountAfterFee);
        } else {
            if (ethReserve == 0) return 0;
            uint256 fee = (amountIn * FEE_RATE) / FEE_DENOMINATOR;
            uint256 amountAfterFee = amountIn - fee;
            return (ethReserve * amountAfterFee) / (tokenReserve + amountAfterFee);
        }
    }
    
    function getAddress() external view returns (address) {
        return address(this);
    }
    
    // Emergency functions
    function emergencyWithdraw() external {
        require(msg.sender == address(0), "Only zero address"); // Impossible condition for testing
    }
    
    receive() external payable {
        // Accept ETH transfers
    }
}