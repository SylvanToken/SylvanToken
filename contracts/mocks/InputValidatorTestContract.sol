// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "../libraries/InputValidator.sol";

/**
 * @title InputValidatorTestContract
 * @dev Test contract to expose InputValidator library functions for testing
 */
contract InputValidatorTestContract {
    using InputValidator for *;

    // Test wrapper functions for InputValidator library
    function testValidateAddressWithMessage(address addr, string memory errorMessage) external pure {
        InputValidator.validateAddressWithMessage(addr, errorMessage);
    }

    function testValidateAddress(address addr) external pure {
        InputValidator.validateAddress(addr);
    }

    function testValidateNotContract(address addr, address contractAddress) external pure {
        InputValidator.validateNotContract(addr, contractAddress);
    }

    function testValidateWalletPair(
        address wallet1,
        address wallet2,
        address contractAddress
    ) external pure {
        InputValidator.validateWalletPair(wallet1, wallet2, contractAddress);
    }

    function testValidateAmount(uint256 amount) external pure {
        InputValidator.validateAmount(amount);
    }

    function testValidateAmountWithMin(uint256 amount, uint256 minAmount) external pure {
        InputValidator.validateAmountWithMin(amount, minAmount);
    }

    function testValidateTransferAddresses(address from, address to) external pure {
        InputValidator.validateTransferAddresses(from, to);
    }

    function testValidateArrayLength(uint256 arrayLength) external pure {
        InputValidator.validateArrayLength(arrayLength);
    }

    function testValidateArrayLengths(uint256 array1Length, uint256 array2Length) external pure {
        InputValidator.validateArrayLengths(array1Length, array2Length);
    }

    function testValidateAddressArray(address[] memory addresses) external pure {
        InputValidator.validateAddressArray(addresses);
    }

    function testValidateOwnershipTransfer(
        address newOwner,
        address currentOwner,
        address contractAddress
    ) external pure {
        InputValidator.validateOwnershipTransfer(newOwner, currentOwner, contractAddress);
    }

    function testValidateWalletUpdate(
        address newWallet,
        address currentWallet,
        address contractAddress
    ) external pure {
        InputValidator.validateWalletUpdate(newWallet, currentWallet, contractAddress);
    }

    function testValidateAMMPair(
        address pair,
        address contractAddress,
        address owner,
        address feeWallet,
        address donationWallet
    ) external pure {
        InputValidator.validateAMMPair(pair, contractAddress, owner, feeWallet, donationWallet);
    }

    function testValidateEmergencyWithdraw(
        address token,
        uint256 amount,
        address recipient
    ) external pure {
        InputValidator.validateEmergencyWithdraw(token, amount, recipient);
    }

    function testValidateTaxExemption(
        address account,
        bool exempt,
        address owner,
        address contractAddress,
        address feeWallet,
        address donationWallet
    ) external pure {
        InputValidator.validateTaxExemption(account, exempt, owner, contractAddress, feeWallet, donationWallet);
    }

    function testValidatePercentage(uint256 percentage, uint256 maxPercentage) external pure {
        InputValidator.validatePercentage(percentage, maxPercentage);
    }

    function testValidateTimelock(
        uint256 unlockTime,
        uint256 currentTime,
        uint256 minDelay
    ) external pure {
        InputValidator.validateTimelock(unlockTime, currentTime, minDelay);
    }

    function testValidateCooldown(
        uint256 lastAction,
        uint256 currentTime,
        uint256 cooldownPeriod
    ) external pure {
        InputValidator.validateCooldown(lastAction, currentTime, cooldownPeriod);
    }

    function testValidateBalance(uint256 balance, uint256 amount) external pure {
        InputValidator.validateBalance(balance, amount);
    }

    function testValidateContractState(
        bool isPaused,
        bool tradingEnabled,
        bool requireTrading
    ) external pure {
        InputValidator.validateContractState(isPaused, tradingEnabled, requireTrading);
    }

    function testValidateConstructorParams(
        address feeWallet,
        address donationWallet,
        address contractAddress,
        address[] memory initialExemptAccounts
    ) external pure {
        InputValidator.validateConstructorParams(feeWallet, donationWallet, contractAddress, initialExemptAccounts);
    }

    // Helper function to get constants for testing
    function getMaxArrayLength() external pure returns (uint256) {
        return InputValidator.MAX_ARRAY_LENGTH;
    }

    function getMinTransferAmount() external pure returns (uint256) {
        return InputValidator.MIN_TRANSFER_AMOUNT;
    }
}