// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

/**
 * @title IVestingManager
 * @dev Interface for managing token vesting schedules with proportional burning
 */
interface IVestingManager {
    /**
     * @dev Vesting schedule structure
     */
    struct VestingSchedule {
        uint256 totalAmount;        // Total amount to be vested
        uint256 releasedAmount;     // Amount already released
        uint256 burnedAmount;       // Amount burned during releases
        uint256 startTime;          // Vesting start timestamp
        uint256 cliffDuration;      // Cliff period in seconds
        uint256 vestingDuration;    // Total vesting duration in seconds
        uint256 releasePercentage;  // Monthly release percentage (basis points)
        uint256 burnPercentage;     // Burn percentage of releases (basis points)
        bool isAdmin;               // Whether this is an admin wallet
        bool isActive;              // Whether the vesting schedule is active
    }
    
    /**
     * @dev Create a new vesting schedule
     * @param beneficiary The address that will receive vested tokens
     * @param amount Total amount to be vested
     * @param cliffDays Cliff period in days
     * @param vestingMonths Total vesting period in months
     * @param releasePercentage Monthly release percentage (basis points)
     * @param burnPercentage Burn percentage of releases (basis points)
     * @param isAdmin Whether this is an admin wallet
     */
    function createVestingSchedule(
        address beneficiary,
        uint256 amount,
        uint256 cliffDays,
        uint256 vestingMonths,
        uint256 releasePercentage,
        uint256 burnPercentage,
        bool isAdmin
    ) external;
    
    /**
     * @dev Release vested tokens for a beneficiary
     * @param beneficiary The address to release tokens for
     * @return releasedAmount Amount of tokens released
     * @return burnedAmount Amount of tokens burned
     */
    function releaseVestedTokens(address beneficiary) external returns (uint256 releasedAmount, uint256 burnedAmount);
    
    /**
     * @dev Get vesting information for a beneficiary
     * @param beneficiary The address to get vesting info for
     * @return VestingSchedule The vesting schedule data
     */
    function getVestingInfo(address beneficiary) external view returns (VestingSchedule memory);
    
    /**
     * @dev Calculate releasable amount for a beneficiary
     * @param beneficiary The address to calculate for
     * @return releasableAmount Amount that can be released
     * @return burnAmount Amount that will be burned
     */
    function calculateReleasableAmount(address beneficiary) external view returns (uint256 releasableAmount, uint256 burnAmount);
    
    /**
     * @dev Check if vesting schedule exists for beneficiary
     * @param beneficiary The address to check
     * @return bool True if vesting schedule exists
     */
    function hasVestingSchedule(address beneficiary) external view returns (bool);
    
    /**
     * @dev Get total vested amount across all schedules
     * @return uint256 Total amount being vested
     */
    function getTotalVestedAmount() external view returns (uint256);
    
    /**
     * @dev Get total released amount across all schedules
     * @return uint256 Total amount released
     */
    function getTotalReleasedAmount() external view returns (uint256);
    
    /**
     * @dev Get total burned amount across all schedules
     * @return uint256 Total amount burned
     */
    function getTotalBurnedAmount() external view returns (uint256);
    
    // Events
    event VestingScheduleCreated(
        address indexed beneficiary,
        uint256 amount,
        uint256 cliffDuration,
        uint256 vestingDuration,
        bool isAdmin
    );
    event TokensReleased(
        address indexed beneficiary,
        uint256 releasedAmount,
        uint256 burnedAmount,
        uint256 totalReleased
    );
    event VestingScheduleRevoked(address indexed beneficiary, uint256 unreleased);
}