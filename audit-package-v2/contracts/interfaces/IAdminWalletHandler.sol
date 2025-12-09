// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

/**
 * @title IAdminWalletHandler
 * @dev Interface for managing admin wallet configurations with immediate access
 */
interface IAdminWalletHandler {
    /**
     * @dev Admin wallet configuration structure
     * @custom:optimization monthlyRelease field removed - calculated dynamically to save gas
     */
    struct AdminWalletConfig {
        uint256 totalAllocation;     // Total token allocation
        uint256 immediateRelease;    // 10% immediate release amount
        uint256 lockedAmount;        // 90% locked amount
        uint256 releasedAmount;      // Amount already released
        uint256 burnedAmount;        // Amount burned during releases
        bool isConfigured;           // Whether admin wallet is configured
        bool immediateReleased;      // Whether immediate release was processed
    }
    
    /**
     * @dev Configure an admin wallet with allocation
     * @param admin The admin wallet address
     * @param allocation Total token allocation for the admin
     */
    function configureAdminWallet(address admin, uint256 allocation) external;
    
    /**
     * @dev Get admin wallet configuration
     * @param admin The admin wallet address
     * @return AdminWalletConfig The admin configuration data
     */
    function getAdminConfig(address admin) external view returns (AdminWalletConfig memory);
    
    /**
     * @dev Process initial 10% release for admin wallet
     * @param admin The admin wallet address
     * @return releasedAmount Amount released immediately
     */
    function processInitialRelease(address admin) external returns (uint256 releasedAmount);
    
    /**
     * @dev Process monthly release for admin wallet
     * @param admin The admin wallet address
     * @return releasedAmount Amount released to admin (90% of calculated)
     * @return burnedAmount Amount burned (10% of calculated)
     */
    function processMonthlyRelease(address admin) external returns (uint256 releasedAmount, uint256 burnedAmount);
    
    /**
     * @dev Check if admin wallet is configured
     * @param admin The admin wallet address
     * @return bool True if admin wallet is configured
     */
    function isAdminConfigured(address admin) external view returns (bool);
    
    /**
     * @dev Calculate available release amount for admin
     * @param admin The admin wallet address
     * @return availableAmount Amount available for release
     * @return burnAmount Amount that will be burned
     */
    function calculateAvailableRelease(address admin) external view returns (uint256 availableAmount, uint256 burnAmount);
    
    /**
     * @dev Get all configured admin wallets
     * @return address[] Array of configured admin wallet addresses
     */
    function getConfiguredAdmins() external view returns (address[] memory);
    
    /**
     * @dev Get total admin allocations
     * @return uint256 Total amount allocated to all admin wallets
     */
    function getTotalAdminAllocations() external view returns (uint256);
    
    // Events
    event AdminWalletConfigured(
        address indexed admin,
        uint256 totalAllocation,
        uint256 immediateRelease,
        uint256 lockedAmount
    );
    event InitialReleaseProcessed(address indexed admin, uint256 amount);
    event MonthlyReleaseProcessed(
        address indexed admin,
        uint256 releasedAmount,
        uint256 burnedAmount,
        uint256 totalReleased
    );
}