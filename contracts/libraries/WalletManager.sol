// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title WalletManager
 * @dev Library for managing wallet addresses with validation and tax exemption handling
 * @notice This library provides secure wallet management with proper validation and cooldown controls
 */
library WalletManager {
    
    // Constants
    address public constant BURN_WALLET = 0x000000000000000000000000000000000000dEaD;
    
    /**
     * @dev Wallet data structure for managing wallet addresses and exemptions
     */
    struct WalletData {
        address feeWallet;                           // Address receiving fee portion of tax
        address donationWallet;                      // Address receiving donation portion of tax
        mapping(address => bool) isExemptFromTax;    // Tax exemption mapping
        mapping(bytes4 => uint256) lastAdminAction;  // Cooldown tracking for admin actions
    }

    // Events
    event FeeWalletUpdated(address indexed oldWallet, address indexed newWallet);
    event DonationWalletUpdated(address indexed oldWallet, address indexed newWallet);
    event BatchWalletUpdate(
        address indexed oldFeeWallet, 
        address indexed newFeeWallet, 
        address indexed oldDonationWallet, 
        address newDonationWallet
    );
    event TaxExemptionUpdated(address indexed account, bool isExempt);

    /**
     * @dev Initialize wallet data with initial addresses
     * @param data Wallet data storage reference
     * @param _feeWallet Initial fee wallet address
     * @param _donationWallet Initial donation wallet address
     * @param _owner Contract owner address
     * @param _contractAddress Contract address
     * @param _initialExemptAccounts Array of initially exempt accounts
     */
    function initializeWallets(
        WalletData storage data,
        address _feeWallet,
        address _donationWallet,
        address _owner,
        address _contractAddress,
        address[] memory _initialExemptAccounts
    ) external {
        // Validate initial wallet addresses
        validateWalletPair(_feeWallet, _donationWallet, _contractAddress);
        
        // Set wallet addresses
        data.feeWallet = _feeWallet;
        data.donationWallet = _donationWallet;
        
        // Set initial tax exemptions
        data.isExemptFromTax[_owner] = true;
        data.isExemptFromTax[_contractAddress] = true;
        data.isExemptFromTax[_feeWallet] = true;
        data.isExemptFromTax[_donationWallet] = true;
        data.isExemptFromTax[BURN_WALLET] = true;
        
        // Set additional exempt accounts
        for (uint256 i = 0; i < _initialExemptAccounts.length; i++) {
            if (_initialExemptAccounts[i] != address(0)) {
                data.isExemptFromTax[_initialExemptAccounts[i]] = true;
            }
        }
    }

    /**
     * @dev Update fee wallet address with validation
     * @param data Wallet data storage reference
     * @param newFeeWallet New fee wallet address
     * @param owner Contract owner address
     * @param contractAddress Contract address
     */
    function updateFeeWallet(
        WalletData storage data,
        address newFeeWallet,
        address owner,
        address contractAddress
    ) external {
        // Validate new wallet
        validateSingleWallet(newFeeWallet, contractAddress);
        require(newFeeWallet != data.feeWallet, "Same as current fee wallet");
        require(newFeeWallet != data.donationWallet, "Cannot be same as donation wallet");
        require(newFeeWallet != BURN_WALLET, "Cannot be burn wallet");
        
        address oldWallet = data.feeWallet;
        
        // Remove tax exemption from old wallet (if it's not a critical address)
        if (oldWallet != owner && 
            oldWallet != contractAddress && 
            oldWallet != data.donationWallet) {
            data.isExemptFromTax[oldWallet] = false;
        }
        
        // Update wallet and set exemption
        data.feeWallet = newFeeWallet;
        data.isExemptFromTax[newFeeWallet] = true;
        
        emit FeeWalletUpdated(oldWallet, newFeeWallet);
    }

    /**
     * @dev Update donation wallet address with validation
     * @param data Wallet data storage reference
     * @param newDonationWallet New donation wallet address
     * @param owner Contract owner address
     * @param contractAddress Contract address
     */
    function updateDonationWallet(
        WalletData storage data,
        address newDonationWallet,
        address owner,
        address contractAddress
    ) external {
        // Validate new wallet
        validateSingleWallet(newDonationWallet, contractAddress);
        require(newDonationWallet != data.donationWallet, "Same as current donation wallet");
        require(newDonationWallet != data.feeWallet, "Cannot be same as fee wallet");
        require(newDonationWallet != BURN_WALLET, "Cannot be burn wallet");
        
        address oldWallet = data.donationWallet;
        
        // Remove tax exemption from old wallet (if it's not a critical address)
        if (oldWallet != owner && 
            oldWallet != contractAddress && 
            oldWallet != data.feeWallet) {
            data.isExemptFromTax[oldWallet] = false;
        }
        
        // Update wallet and set exemption
        data.donationWallet = newDonationWallet;
        data.isExemptFromTax[newDonationWallet] = true;
        
        emit DonationWalletUpdated(oldWallet, newDonationWallet);
    }

    /**
     * @dev Update both wallets simultaneously with validation
     * @param data Wallet data storage reference
     * @param newFeeWallet New fee wallet address
     * @param newDonationWallet New donation wallet address
     * @param owner Contract owner address
     * @param contractAddress Contract address
     */
    function updateBothWallets(
        WalletData storage data,
        address newFeeWallet,
        address newDonationWallet,
        address owner,
        address contractAddress
    ) external {
        // Validate both wallets
        validateWalletPair(newFeeWallet, newDonationWallet, contractAddress);
        
        // Store old addresses
        address oldFeeWallet = data.feeWallet;
        address oldDonationWallet = data.donationWallet;
        
        // Remove tax exemption from old wallets (if they're not critical addresses)
        if (oldFeeWallet != owner && 
            oldFeeWallet != contractAddress && 
            oldFeeWallet != newDonationWallet) {
            data.isExemptFromTax[oldFeeWallet] = false;
        }
        
        if (oldDonationWallet != owner && 
            oldDonationWallet != contractAddress && 
            oldDonationWallet != newFeeWallet) {
            data.isExemptFromTax[oldDonationWallet] = false;
        }
        
        // Update wallets
        data.feeWallet = newFeeWallet;
        data.donationWallet = newDonationWallet;
        
        // Set tax exemptions for new wallets
        data.isExemptFromTax[newFeeWallet] = true;
        data.isExemptFromTax[newDonationWallet] = true;
        
        // Emit events
        emit BatchWalletUpdate(oldFeeWallet, newFeeWallet, oldDonationWallet, newDonationWallet);
        emit FeeWalletUpdated(oldFeeWallet, newFeeWallet);
        emit DonationWalletUpdated(oldDonationWallet, newDonationWallet);
    }

    /**
     * @dev Update tax exemption status for an account
     * @param data Wallet data storage reference
     * @param account Account to update exemption for
     * @param isExempt New exemption status
     * @param owner Contract owner address
     * @param contractAddress Contract address
     */
    function updateTaxExemption(
        WalletData storage data,
        address account,
        bool isExempt,
        address owner,
        address contractAddress
    ) external {
        require(account != address(0), "Invalid account address");
        
        // Prevent removing exemption from critical addresses
        if (!isExempt) {
            require(account != contractAddress, "Contract must remain tax exempt");
            require(account != owner, "Owner must remain tax exempt");
            require(account != data.feeWallet, "Fee wallet must remain tax exempt");
            require(account != data.donationWallet, "Donation wallet must remain tax exempt");
            require(account != BURN_WALLET, "Burn wallet must remain tax exempt");
        }
        
        data.isExemptFromTax[account] = isExempt;
        emit TaxExemptionUpdated(account, isExempt);
    }

    /**
     * @dev Validate a single wallet address
     * @param wallet Wallet address to validate
     * @param contractAddress Contract address to check against
     */
    function validateSingleWallet(address wallet, address contractAddress) public pure {
        require(wallet != address(0), "Invalid wallet address");
        require(wallet != contractAddress, "Cannot be contract address");
    }

    /**
     * @dev Validate a pair of wallet addresses
     * @param feeWallet Fee wallet address
     * @param donationWallet Donation wallet address
     * @param contractAddress Contract address to check against
     */
    function validateWalletPair(
        address feeWallet,
        address donationWallet,
        address contractAddress
    ) public pure {
        validateSingleWallet(feeWallet, contractAddress);
        validateSingleWallet(donationWallet, contractAddress);
        require(feeWallet != donationWallet, "Wallets cannot be the same");
    }

    /**
     * @dev Check if an address is exempt from tax
     * @param data Wallet data storage reference
     * @param account Account to check
     * @return isExempt Whether the account is exempt from tax
     */
    function isExemptFromTax(WalletData storage data, address account) 
        external 
        view 
        returns (bool) 
    {
        return data.isExemptFromTax[account];
    }

    /**
     * @dev Get current wallet addresses
     * @param data Wallet data storage reference
     * @return feeWallet Current fee wallet address
     * @return donationWallet Current donation wallet address
     */
    function getWallets(WalletData storage data) 
        external 
        view 
        returns (address feeWallet, address donationWallet) 
    {
        return (data.feeWallet, data.donationWallet);
    }

    /**
     * @dev Validate wallet for AMM pair setting
     * @param data Wallet data storage reference
     * @param pair Address to validate
     * @param owner Contract owner address
     */
    function validateAMMPairWallet(
        WalletData storage data,
        address pair,
        address owner
    ) external view {
        require(pair != owner, "Cannot set owner as AMM pair");
        require(pair != data.feeWallet, "Cannot set fee wallet as AMM pair");
        require(pair != data.donationWallet, "Cannot set donation wallet as AMM pair");
        require(pair != BURN_WALLET, "Cannot set burn wallet as AMM pair");
    }
}