// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "../libraries/TaxManager.sol";

/**
 * @title TaxManagerTestContract
 * @dev Test contract for TaxManager library functions
 */
contract TaxManagerTestContract {
    using TaxManager for TaxManager.TaxData;
    
    TaxManager.TaxData private taxData;
    
    // Expose constants for testing
    function TAX_RATE() external pure returns (uint256) {
        return TaxManager.TAX_RATE;
    }
    
    function TAX_DENOMINATOR() external pure returns (uint256) {
        return TaxManager.TAX_DENOMINATOR;
    }
    
    function FEE_SHARE() external pure returns (uint256) {
        return TaxManager.FEE_SHARE;
    }
    
    function BURN_SHARE() external pure returns (uint256) {
        return TaxManager.BURN_SHARE;
    }
    
    function DONATION_SHARE() external pure returns (uint256) {
        return TaxManager.DONATION_SHARE;
    }
    
    function BURN_WALLET() external pure returns (address) {
        return TaxManager.BURN_WALLET;
    }
    
    // Test functions for TaxManager library
    function testEnableTrading() external {
        TaxManager.enableTrading(taxData);
    }
    
    function testSetAMMPair(
        address pair,
        bool isPair,
        address owner,
        address feeWallet,
        address donationWallet
    ) external {
        TaxManager.setAMMPair(taxData, pair, isPair, owner, feeWallet, donationWallet);
    }
    
    function testCalculateTaxAmount(uint256 amount) external pure returns (uint256) {
        return TaxManager.calculateTaxAmount(amount);
    }
    
    function testCalculateDistribution(uint256 taxAmount) external pure returns (
        uint256 feeAmount,
        uint256 burnAmount,
        uint256 donationAmount
    ) {
        return TaxManager.calculateDistribution(taxAmount);
    }
    
    function testShouldApplyTax(
        address from,
        address to,
        bool isFromExempt,
        bool isToExempt
    ) external view returns (bool) {
        return TaxManager.shouldApplyTax(taxData, from, to, isFromExempt, isToExempt);
    }
    
    function testValidateTrading(
        address from,
        address to,
        bool isFromExempt,
        bool isToExempt
    ) external view {
        TaxManager.validateTrading(taxData, from, to, isFromExempt, isToExempt);
    }
    
    function testDistributeTax(
        address from,
        uint256 taxAmount,
        address feeWallet,
        address donationWallet
    ) external returns (
        uint256 feeAmount,
        uint256 burnAmount,
        uint256 donationAmount
    ) {
        return TaxManager.distributeTax(from, taxAmount, feeWallet, donationWallet);
    }
    
    function testLogTransferAnalytics(
        address from,
        address to,
        uint256 amount
    ) external {
        TaxManager.logTransferAnalytics(taxData, from, to, amount);
    }
    
    function testGetTaxInfo() external pure returns (uint256 buyTax, uint256 sellTax) {
        return TaxManager.getTaxInfo();
    }
    
    function testIsAMMPair(address pair) external view returns (bool) {
        return TaxManager.isAMMPair(taxData, pair);
    }
    
    function testIsTradingEnabled() external view returns (bool) {
        return TaxManager.isTradingEnabled(taxData);
    }
    
    function testCalculateTransferAmounts(uint256 amount, bool shouldTax) external pure returns (
        uint256 transferAmount,
        uint256 taxAmount
    ) {
        return TaxManager.calculateTransferAmounts(amount, shouldTax);
    }
    
    function testValidateAMMPairSetting(
        address pair,
        address owner,
        address feeWallet,
        address donationWallet
    ) external pure {
        TaxManager.validateAMMPairSetting(pair, owner, feeWallet, donationWallet);
    }
    
    function testGetTaxStatus(
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
        return TaxManager.getTaxStatus(taxData, from, to, isFromExempt, isToExempt);
    }
}