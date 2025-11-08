// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title TaxManager
 * @dev Library for managing tax calculations and distributions
 * @notice This library provides tax calculation and distribution mechanisms for token transfers
 */
library TaxManager {
    
    // Constants
    uint256 public constant TAX_RATE = 100;           // 1% = 100/10000
    uint256 public constant TAX_DENOMINATOR = 10000;
    uint256 public constant FEE_SHARE = 5000;         // 50%
    uint256 public constant BURN_SHARE = 2500;        // 25%
    uint256 public constant DONATION_SHARE = 2500;    // 25%
    address public constant BURN_WALLET = 0x000000000000000000000000000000000000dEaD;
    
    /**
     * @dev Tax data structure for managing tax-related state
     */
    struct TaxData {
        mapping(address => bool) isAMMPair;      // AMM pair addresses
        bool tradingEnabled;                     // Whether trading is enabled
    }

    // Events
    event TradingEnabled();
    event AMMPairUpdated(address indexed pair, bool status);
    event TaxDistributed(uint256 feeAmount, uint256 burnAmount, uint256 donationAmount);
    event TransferAnalytics(address indexed user, uint256 amount, uint256 timestamp);

    /**
     * @dev Enable trading
     * @param data Tax data storage reference
     */
    function enableTrading(TaxData storage data) external {
        require(!data.tradingEnabled, "Trading already enabled");
        data.tradingEnabled = true;
        emit TradingEnabled();
    }

    /**
     * @dev Set AMM pair status
     * @param data Tax data storage reference
     * @param pair Address to set as AMM pair
     * @param isPair Whether the address is an AMM pair
     * @param owner Contract owner address
     * @param feeWallet Fee wallet address
     * @param donationWallet Donation wallet address
     */
    function setAMMPair(
        TaxData storage data,
        address pair,
        bool isPair,
        address owner,
        address feeWallet,
        address donationWallet
    ) external {
        require(pair != address(0), "Invalid pair address");
        
        if (isPair) {
            require(pair != owner, "Cannot set owner as AMM pair");
            require(pair != feeWallet, "Cannot set fee wallet as AMM pair");
            require(pair != donationWallet, "Cannot set donation wallet as AMM pair");
            require(pair != BURN_WALLET, "Cannot set burn wallet as AMM pair");
        }
        
        data.isAMMPair[pair] = isPair;
        emit AMMPairUpdated(pair, isPair);
    }

    /**
     * @dev Calculate tax amount for a given transfer amount
     * @param amount Transfer amount
     * @return taxAmount Calculated tax amount
     */
    function calculateTaxAmount(uint256 amount) external pure returns (uint256) {
        return (amount * TAX_RATE) / TAX_DENOMINATOR;
    }

    /**
     * @dev Calculate tax distribution amounts
     * @param taxAmount Total tax amount to distribute
     * @return feeAmount Amount going to fee wallet
     * @return burnAmount Amount going to burn wallet
     * @return donationAmount Amount going to donation wallet
     */
    function calculateDistribution(uint256 taxAmount)
        external
        pure
        returns (
            uint256 feeAmount,
            uint256 burnAmount,
            uint256 donationAmount
        )
    {
        feeAmount = (taxAmount * FEE_SHARE) / TAX_DENOMINATOR;
        burnAmount = (taxAmount * BURN_SHARE) / TAX_DENOMINATOR;
        donationAmount = taxAmount - feeAmount - burnAmount; // Ensures no rounding errors
    }

    /**
     * @dev Determine if tax should be applied to a transfer
     * @param data Tax data storage reference
     * @param from Sender address
     * @param to Recipient address
     * @param isFromExempt Whether sender is exempt from tax
     * @param isToExempt Whether recipient is exempt from tax
     * @return shouldApply Whether tax should be applied
     */
    function shouldApplyTax(
        TaxData storage data,
        address from,
        address to,
        bool isFromExempt,
        bool isToExempt
    ) external view returns (bool shouldApply) {
        // Tax only applies when trading is enabled
        if (!data.tradingEnabled) {
            return false;
        }
        
        // No tax if either party is exempt
        if (isFromExempt || isToExempt) {
            return false;
        }
        
        // Tax applies only for AMM pair transactions (buy/sell)
        return (data.isAMMPair[from] || data.isAMMPair[to]);
    }

    /**
     * @dev Validate trading conditions for a transfer
     * @param data Tax data storage reference
     * @param from Sender address
     * @param to Recipient address
     * @param isFromExempt Whether sender is exempt from tax
     * @param isToExempt Whether recipient is exempt from tax
     */
    function validateTrading(
        TaxData storage data,
        address from,
        address to,
        bool isFromExempt,
        bool isToExempt
    ) external view {
        if (!data.tradingEnabled) {
            require(isFromExempt || isToExempt, "Trading not enabled");
        }
    }

    /**
     * @dev Process tax distribution and emit events
     * @param from Sender address (for transfer execution)
     * @param taxAmount Total tax amount
     * @param feeWallet Fee wallet address
     * @param donationWallet Donation wallet address
     * @return feeAmount Amount distributed to fee wallet
     * @return burnAmount Amount distributed to burn wallet
     * @return donationAmount Amount distributed to donation wallet
     */
    function distributeTax(
        address from,
        uint256 taxAmount,
        address feeWallet,
        address donationWallet
    ) external returns (
        uint256 feeAmount,
        uint256 burnAmount,
        uint256 donationAmount
    ) {
        feeAmount = (taxAmount * FEE_SHARE) / TAX_DENOMINATOR;
        burnAmount = (taxAmount * BURN_SHARE) / TAX_DENOMINATOR;
        donationAmount = taxAmount - feeAmount - burnAmount; // Ensures no rounding errors
        
        // Note: Actual transfers are handled by the main contract
        // This function only calculates and emits events
        
        emit TaxDistributed(feeAmount, burnAmount, donationAmount);
        
        return (feeAmount, burnAmount, donationAmount);
    }

    /**
     * @dev Log transfer analytics for AMM transactions
     * @param data Tax data storage reference
     * @param from Sender address
     * @param to Recipient address
     * @param amount Transfer amount
     */
    function logTransferAnalytics(
        TaxData storage data,
        address from,
        address to,
        uint256 amount
    ) external {
        if (data.isAMMPair[from] || data.isAMMPair[to]) {
            address user = data.isAMMPair[from] ? to : from;
            emit TransferAnalytics(user, amount, block.timestamp);
        }
    }

    /**
     * @dev Get tax information
     * @return buyTax Tax rate for buy transactions
     * @return sellTax Tax rate for sell transactions
     */
    function getTaxInfo() external pure returns (uint256 buyTax, uint256 sellTax) {
        return (TAX_RATE, TAX_RATE);
    }

    /**
     * @dev Check if an address is an AMM pair
     * @param data Tax data storage reference
     * @param pair Address to check
     * @return isAMM Whether the address is an AMM pair
     */
    function isAMMPair(TaxData storage data, address pair) external view returns (bool) {
        return data.isAMMPair[pair];
    }

    /**
     * @dev Check if trading is enabled
     * @param data Tax data storage reference
     * @return enabled Whether trading is enabled
     */
    function isTradingEnabled(TaxData storage data) external view returns (bool) {
        return data.tradingEnabled;
    }

    /**
     * @dev Calculate effective transfer amount after tax
     * @param amount Original transfer amount
     * @param shouldTax Whether tax should be applied
     * @return transferAmount Amount to transfer to recipient
     * @return taxAmount Tax amount to be distributed
     */
    function calculateTransferAmounts(uint256 amount, bool shouldTax)
        external
        pure
        returns (uint256 transferAmount, uint256 taxAmount)
    {
        if (shouldTax && amount > 0) {
            taxAmount = (amount * TAX_RATE) / TAX_DENOMINATOR;
            transferAmount = amount - taxAmount;
        } else {
            transferAmount = amount;
            taxAmount = 0;
        }
    }

    /**
     * @dev Validate AMM pair setting parameters
     * @param pair Address to validate
     * @param owner Contract owner address
     * @param feeWallet Fee wallet address
     * @param donationWallet Donation wallet address
     */
    function validateAMMPairSetting(
        address pair,
        address owner,
        address feeWallet,
        address donationWallet
    ) external pure {
        require(pair != address(0), "Invalid pair address");
        require(pair != owner, "Cannot set owner as AMM pair");
        require(pair != feeWallet, "Cannot set fee wallet as AMM pair");
        require(pair != donationWallet, "Cannot set donation wallet as AMM pair");
        require(pair != BURN_WALLET, "Cannot set burn wallet as AMM pair");
    }

    /**
     * @dev Get comprehensive tax status for an address pair
     * @param data Tax data storage reference
     * @param from Sender address
     * @param to Recipient address
     * @param isFromExempt Whether sender is exempt
     * @param isToExempt Whether recipient is exempt
     * @return willApplyTax Whether tax will be applied
     * @return isFromAMM Whether sender is AMM pair
     * @return isToAMM Whether recipient is AMM pair
     * @return tradingActive Whether trading is enabled
     */
    function getTaxStatus(
        TaxData storage data,
        address from,
        address to,
        bool isFromExempt,
        bool isToExempt
    ) external view returns (
        bool willApplyTax,
        bool isFromAMM,
        bool isToAMM,
        bool tradingActive
    ) {
        isFromAMM = data.isAMMPair[from];
        isToAMM = data.isAMMPair[to];
        tradingActive = data.tradingEnabled;
        
        // Inline shouldApplyTax logic
        if (!data.tradingEnabled) {
            willApplyTax = false;
        } else if (isFromExempt || isToExempt) {
            willApplyTax = false;
        } else {
            willApplyTax = (data.isAMMPair[from] || data.isAMMPair[to]);
        }
    }
}