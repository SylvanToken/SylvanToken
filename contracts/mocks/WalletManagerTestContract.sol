// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "../libraries/WalletManager.sol";

/**
 * @title WalletManagerTestContract
 * @dev Test contract to expose WalletManager library functions for testing
 */
contract WalletManagerTestContract {
    using WalletManager for WalletManager.WalletData;

    WalletManager.WalletData private walletData;
    address public owner;
    address public contractAddress;

    event TestEvent(string message);

    constructor(address _owner) {
        owner = _owner;
        contractAddress = address(this);
    }

    // Initialize wallets
    function initializeWallets(
        address _feeWallet,
        address _donationWallet,
        address[] memory _initialExemptAccounts
    ) external {
        walletData.initializeWallets(
            _feeWallet,
            _donationWallet,
            owner,
            contractAddress,
            _initialExemptAccounts
        );
    }

    // Update fee wallet
    function updateFeeWallet(address newFeeWallet) external {
        walletData.updateFeeWallet(newFeeWallet, owner, contractAddress);
    }

    // Update donation wallet
    function updateDonationWallet(address newDonationWallet) external {
        walletData.updateDonationWallet(newDonationWallet, owner, contractAddress);
    }

    // Update both wallets
    function updateBothWallets(
        address newFeeWallet,
        address newDonationWallet
    ) external {
        walletData.updateBothWallets(
            newFeeWallet,
            newDonationWallet,
            owner,
            contractAddress
        );
    }

    // Update tax exemption
    function updateTaxExemption(
        address account,
        bool isExempt
    ) external {
        walletData.updateTaxExemption(account, isExempt, owner, contractAddress);
    }

    // Validate single wallet
    function validateSingleWallet(address wallet) external view {
        WalletManager.validateSingleWallet(wallet, contractAddress);
    }

    // Validate wallet pair
    function validateWalletPair(
        address feeWallet,
        address donationWallet
    ) external view {
        WalletManager.validateWalletPair(feeWallet, donationWallet, contractAddress);
    }

    // Check if exempt from tax
    function isExemptFromTax(address account) external view returns (bool) {
        return WalletManager.isExemptFromTax(walletData, account);
    }

    // Get wallets
    function getWallets() external view returns (address feeWallet, address donationWallet) {
        return walletData.getWallets();
    }

    // Validate AMM pair wallet
    function validateAMMPairWallet(address pair) external view {
        walletData.validateAMMPairWallet(pair, owner);
    }

    // Get fee wallet
    function getFeeWallet() external view returns (address) {
        (address feeWallet, ) = walletData.getWallets();
        return feeWallet;
    }

    // Get donation wallet
    function getDonationWallet() external view returns (address) {
        (, address donationWallet) = walletData.getWallets();
        return donationWallet;
    }

    // Get burn wallet constant
    function getBurnWallet() external pure returns (address) {
        return WalletManager.BURN_WALLET;
    }

    // Helper to change owner for testing
    function setOwner(address newOwner) external {
        owner = newOwner;
    }
}
