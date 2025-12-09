// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

/**
 * @title IEnhancedFeeManager
 * @dev Interface for managing dynamic fee exemptions with environment-based configuration
 */
interface IEnhancedFeeManager {
    /**
     * @dev Check if a wallet is exempt from fees
     * @param wallet The wallet address to check
     * @return bool True if wallet is exempt from fees
     */
    function isExempt(address wallet) external view returns (bool);
    
    /**
     * @dev Add a wallet to the fee exemption list
     * @param wallet The wallet address to add
     */
    function addExemptWallet(address wallet) external;
    
    /**
     * @dev Remove a wallet from the fee exemption list
     * @param wallet The wallet address to remove
     */
    function removeExemptWallet(address wallet) external;
    
    /**
     * @dev Get all exempt wallets
     * @return address[] Array of exempt wallet addresses
     */
    function getExemptWallets() external view returns (address[] memory);
    
    /**
     * @dev Load exemptions from configuration
     */
    function loadExemptionsFromConfig() external;
    
    /**
     * @dev Load exemptions from configuration data
     * @param configWallets Array of wallet addresses to configure
     * @param exemptStatuses Array of exemption statuses (true = exempt, false = not exempt)
     */
    function loadExemptionsFromConfig(
        address[] calldata configWallets,
        bool[] calldata exemptStatuses
    ) external;
    
    /**
     * @dev Add multiple wallets to exemption list in batch
     * @param wallets Array of wallet addresses to add
     */
    function addExemptWalletsBatch(address[] calldata wallets) external;
    
    /**
     * @dev Remove multiple wallets from exemption list in batch
     * @param wallets Array of wallet addresses to remove
     */
    function removeExemptWalletsBatch(address[] calldata wallets) external;
    
    /**
     * @dev Get the count of exempt wallets
     * @return uint256 Number of exempt wallets
     */
    function getExemptWalletCount() external view returns (uint256);
    
    // Events
    event FeeExemptionChanged(address indexed wallet, bool exempt);
    event BatchExemptionUpdate(address[] wallets, bool exempt);
    event ExemptionConfigLoaded(uint256 walletCount);
}