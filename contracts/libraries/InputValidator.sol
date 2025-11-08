// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title InputValidator
 * @dev Library for comprehensive input validation and security checks
 * @notice This library provides reusable validation functions for addresses, amounts, and arrays
 */
library InputValidator {
    
    // Constants for validation
    uint256 public constant MAX_ARRAY_LENGTH = 100;
    uint256 public constant MIN_TRANSFER_AMOUNT = 1;
    
    /**
     * @dev Validate a single address with custom message
     * @param addr Address to validate
     * @param errorMessage Custom error message
     */
    function validateAddressWithMessage(address addr, string memory errorMessage) external pure {
        require(addr != address(0), errorMessage);
    }

    /**
     * @dev Validate address is not zero
     * @param addr Address to validate
     */
    function validateAddress(address addr) external pure {
        require(addr != address(0), "Invalid address: cannot be zero");
    }

    /**
     * @dev Validate address is not contract address
     * @param addr Address to validate
     * @param contractAddress Contract address to check against
     */
    function validateNotContract(address addr, address contractAddress) external pure {
        require(addr != contractAddress, "Invalid address: cannot be contract address");
    }

    /**
     * @dev Validate wallet pair addresses
     * @param wallet1 First wallet address
     * @param wallet2 Second wallet address
     * @param contractAddress Contract address to check against
     */
    function validateWalletPair(
        address wallet1,
        address wallet2,
        address contractAddress
    ) external pure {
        require(wallet1 != address(0), "Invalid first wallet address");
        require(wallet2 != address(0), "Invalid second wallet address");
        require(wallet1 != contractAddress, "First wallet cannot be contract address");
        require(wallet2 != contractAddress, "Second wallet cannot be contract address");
        require(wallet1 != wallet2, "Wallets cannot be the same");
    }

    /**
     * @dev Validate transfer amount
     * @param amount Amount to validate
     */
    function validateAmount(uint256 amount) external pure {
        require(amount > 0, "Amount must be greater than zero");
    }

    /**
     * @dev Validate transfer amount with minimum threshold
     * @param amount Amount to validate
     * @param minAmount Minimum allowed amount
     */
    function validateAmountWithMin(uint256 amount, uint256 minAmount) external pure {
        require(amount >= minAmount, "Amount below minimum threshold");
    }

    /**
     * @dev Validate transfer addresses
     * @param from Sender address
     * @param to Recipient address
     */
    function validateTransferAddresses(address from, address to) external pure {
        require(from != address(0), "ERC20: transfer from the zero address");
        require(to != address(0), "ERC20: transfer to the zero address");
        require(from != to, "Cannot transfer to self");
    }

    /**
     * @dev Validate array length
     * @param arrayLength Length of array to validate
     */
    function validateArrayLength(uint256 arrayLength) external pure {
        require(arrayLength > 0, "Array cannot be empty");
        require(arrayLength <= MAX_ARRAY_LENGTH, "Array too large");
    }

    /**
     * @dev Validate two arrays have same length
     * @param array1Length Length of first array
     * @param array2Length Length of second array
     */
    function validateArrayLengths(uint256 array1Length, uint256 array2Length) external pure {
        require(array1Length == array2Length, "Array lengths must match");
        require(array1Length > 0, "Array cannot be empty");
        require(array1Length <= MAX_ARRAY_LENGTH, "Array too large");
    }

    /**
     * @dev Validate address array for duplicates and zero addresses
     * @param addresses Array of addresses to validate
     */
    function validateAddressArray(address[] memory addresses) external pure {
        require(addresses.length > 0, "Array cannot be empty");
        require(addresses.length <= MAX_ARRAY_LENGTH, "Array too large");
        
        for (uint256 i = 0; i < addresses.length; i++) {
            require(addresses[i] != address(0), "Invalid address in array");
            
            // Check for duplicates
            for (uint256 j = i + 1; j < addresses.length; j++) {
                require(addresses[i] != addresses[j], "Duplicate address in array");
            }
        }
    }

    /**
     * @dev Validate ownership transfer parameters
     * @param newOwner New owner address
     * @param currentOwner Current owner address
     * @param contractAddress Contract address
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

    /**
     * @dev Validate wallet update parameters
     * @param newWallet New wallet address
     * @param currentWallet Current wallet address
     * @param contractAddress Contract address
     */
    function validateWalletUpdate(
        address newWallet,
        address currentWallet,
        address contractAddress
    ) external pure {
        require(newWallet != address(0), "Invalid wallet address");
        require(newWallet != contractAddress, "Cannot be contract address");
        require(newWallet != currentWallet, "Same as current wallet");
    }

    /**
     * @dev Validate AMM pair setting
     * @param pair AMM pair address
     * @param contractAddress Contract address
     * @param owner Owner address
     * @param feeWallet Fee wallet address
     * @param donationWallet Donation wallet address
     */
    function validateAMMPair(
        address pair,
        address contractAddress,
        address owner,
        address feeWallet,
        address donationWallet
    ) external pure {
        require(pair != address(0), "Invalid pair address");
        require(pair != contractAddress, "Cannot set contract as AMM pair");
        require(pair != owner, "Cannot set owner as AMM pair");
        require(pair != feeWallet, "Cannot set fee wallet as AMM pair");
        require(pair != donationWallet, "Cannot set donation wallet as AMM pair");
    }

    /**
     * @dev Validate emergency withdraw parameters
     * @param token Token address (can be zero for ETH)
     * @param amount Amount to withdraw
     * @param recipient Recipient address
     */
    function validateEmergencyWithdraw(
        address token,
        uint256 amount,
        address recipient
    ) external pure {
        require(amount > 0, "Amount must be greater than zero");
        require(recipient != address(0), "Invalid recipient address");
        // Note: token can be address(0) for ETH, so we don't validate it
    }

    /**
     * @dev Validate tax exemption parameters
     * @param account Account address
     * @param exempt Exemption status
     * @param owner Owner address
     * @param contractAddress Contract address
     * @param feeWallet Fee wallet address
     * @param donationWallet Donation wallet address
     */
    function validateTaxExemption(
        address account,
        bool exempt,
        address owner,
        address contractAddress,
        address feeWallet,
        address donationWallet
    ) external pure {
        require(account != address(0), "Invalid account address");
        
        // Prevent removing exemption from critical addresses
        if (!exempt) {
            require(account != contractAddress, "Contract must remain tax exempt");
            require(account != owner, "Owner must remain tax exempt");
            require(account != feeWallet, "Fee wallet must remain tax exempt");
            require(account != donationWallet, "Donation wallet must remain tax exempt");
        }
    }

    /**
     * @dev Validate percentage value (0-10000 basis points)
     * @param percentage Percentage in basis points
     * @param maxPercentage Maximum allowed percentage
     */
    function validatePercentage(uint256 percentage, uint256 maxPercentage) external pure {
        require(percentage <= maxPercentage, "Percentage exceeds maximum");
    }

    /**
     * @dev Validate timelock parameters
     * @param unlockTime Unlock timestamp
     * @param currentTime Current timestamp
     * @param minDelay Minimum delay required
     */
    function validateTimelock(
        uint256 unlockTime,
        uint256 currentTime,
        uint256 minDelay
    ) external pure {
        require(unlockTime > currentTime, "Unlock time must be in future");
        require(unlockTime >= currentTime + minDelay, "Insufficient delay");
    }

    /**
     * @dev Validate cooldown period
     * @param lastAction Timestamp of last action
     * @param currentTime Current timestamp
     * @param cooldownPeriod Required cooldown period
     */
    function validateCooldown(
        uint256 lastAction,
        uint256 currentTime,
        uint256 cooldownPeriod
    ) external pure {
        require(
            currentTime >= lastAction + cooldownPeriod,
            "Cooldown period not elapsed"
        );
    }

    /**
     * @dev Validate balance sufficiency
     * @param balance Available balance
     * @param amount Required amount
     */
    function validateBalance(uint256 balance, uint256 amount) external pure {
        require(balance >= amount, "Insufficient balance");
    }

    /**
     * @dev Validate contract state for operations
     * @param isPaused Whether contract is paused
     * @param tradingEnabled Whether trading is enabled
     * @param requireTrading Whether operation requires trading to be enabled
     */
    function validateContractState(
        bool isPaused,
        bool tradingEnabled,
        bool requireTrading
    ) external pure {
        require(!isPaused, "Contract is paused");
        if (requireTrading) {
            require(tradingEnabled, "Trading not enabled");
        }
    }

    /**
     * @dev Comprehensive validation for constructor parameters
     * @param feeWallet Fee wallet address
     * @param donationWallet Donation wallet address
     * @param contractAddress Contract address
     * @param initialExemptAccounts Array of initially exempt accounts
     */
    function validateConstructorParams(
        address feeWallet,
        address donationWallet,
        address contractAddress,
        address[] memory initialExemptAccounts
    ) external pure {
        require(feeWallet != address(0), "Invalid fee wallet address");
        require(donationWallet != address(0), "Invalid donation wallet address");
        require(feeWallet != contractAddress, "Fee wallet cannot be contract address");
        require(donationWallet != contractAddress, "Donation wallet cannot be contract address");
        require(feeWallet != donationWallet, "Wallets cannot be the same");
        
        if (initialExemptAccounts.length > 0) {
            require(initialExemptAccounts.length <= MAX_ARRAY_LENGTH, "Array too large");
            
            for (uint256 i = 0; i < initialExemptAccounts.length; i++) {
                require(initialExemptAccounts[i] != address(0), "Invalid address in array");
                
                // Check for duplicates
                for (uint256 j = i + 1; j < initialExemptAccounts.length; j++) {
                    require(initialExemptAccounts[i] != initialExemptAccounts[j], "Duplicate address in array");
                }
            }
        }
    }
}