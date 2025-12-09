# Enhanced API Reference

## 🎯 Overview

This comprehensive API reference covers all enhanced functions and interfaces for EnhancedSylvanToken, including fee exemption management, lock mechanisms, and vesting systems.

## 📋 Contract Interfaces

### IEnhancedFeeManager
```solidity
interface IEnhancedFeeManager {
    // Fee exemption management
    function isExempt(address wallet) external view returns (bool);
    function addExemptWallet(address wallet) external;
    function removeExemptWallet(address wallet) external;
    function getExemptWallets() external view returns (address[] memory);
    function loadExemptionsFromConfig() external;
    
    // Batch operations
    function batchAddExemptions(address[] calldata wallets) external;
    function batchRemoveExemptions(address[] calldata wallets) external;
    function batchUpdateExemptions(address[] calldata wallets, bool[] calldata exemptions) external;
    
    // Events
    event FeeExemptionChanged(address indexed wallet, bool exempt);
    event BatchExemptionUpdate(address[] wallets, bool[] exemptions);
}
```

### IVestingManager
```solidity
interface IVestingManager {
    // Vesting schedule management
    function createVestingSchedule(
        address beneficiary,
        uint256 amount,
        uint256 cliffDays,
        uint256 vestingMonths,
        uint256 releasePercentage,
        bool isAdmin
    ) external;
    
    function releaseVestedTokens(address beneficiary) external;
    function getVestingInfo(address beneficiary) external view returns (VestingSchedule memory);
    function calculateReleasableAmount(address beneficiary) external view returns (uint256, uint256);
    
    // Batch operations
    function batchCreateVestingSchedules(
        address[] calldata beneficiaries,
        uint256[] calldata amounts,
        uint256[] calldata cliffDays,
        uint256[] calldata vestingMonths,
        uint256[] calldata releasePercentages,
        bool[] calldata isAdmin
    ) external;
    
    function batchReleaseVestedTokens(address[] calldata beneficiaries) external;
    
    // Events
    event VestingScheduleCreated(address indexed beneficiary, uint256 amount);
    event TokensReleased(address indexed beneficiary, uint256 amount, uint256 burned);
    event ProportionalBurn(uint256 amount, uint256 totalBurned);
}
```

### IAdminWalletHandler
```solidity
interface IAdminWalletHandler {
    // Admin wallet configuration
    function configureAdminWallet(address admin, uint256 allocation) external;
    function getAdminConfig(address admin) external view returns (AdminWalletConfig memory);
    function processInitialRelease(address admin) external;
    
    // Admin wallet management
    function updateAdminAllocation(address admin, uint256 newAllocation) external;
    function getAdminWallets() external view returns (address[] memory);
    function isAdminWallet(address wallet) external view returns (bool);
    
    // Events
    event AdminWalletConfigured(address indexed admin, uint256 allocation);
    event InitialReleaseProcessed(address indexed admin, uint256 amount);
    event AdminAllocationUpdated(address indexed admin, uint256 oldAllocation, uint256 newAllocation);
}
```

## 🏦 Enhanced Fee Management Functions

### Fee Exemption Functions

#### `isExempt(address wallet) → bool`
```solidity
/**
 * @dev Check if a wallet is exempt from fees
 * @param wallet Address to check exemption status
 * @return bool True if wallet is exempt from fees
 */
function isExempt(address wallet) external view returns (bool);
```

**Usage Example:**
```javascript
const isExempt = await token.isExempt("0xAddress");
console.log(`Wallet exempt: ${isExempt}`);
```

#### `addExemptWallet(address wallet)`
```solidity
/**
 * @dev Add a wallet to fee exemption list
 * @param wallet Address to add to exemption list
 * Requirements:
 * - Only owner can call this function
 * - Wallet must not already be exempt
 */
function addExemptWallet(address wallet) external onlyOwner;
```

**Usage Example:**
```javascript
await token.addExemptWallet("0xNewExemptAddress");
```

#### `removeExemptWallet(address wallet)`
```solidity
/**
 * @dev Remove a wallet from fee exemption list
 * @param wallet Address to remove from exemption list
 * Requirements:
 * - Only owner can call this function
 * - Wallet must currently be exempt
 * - Cannot remove critical system wallets
 */
function removeExemptWallet(address wallet) external onlyOwner;
```

**Usage Example:**
```javascript
await token.removeExemptWallet("0xAddressToRemove");
```

#### `getExemptWallets() → address[]`
```solidity
/**
 * @dev Get list of all exempt wallets
 * @return address[] Array of all exempt wallet addresses
 */
function getExemptWallets() external view returns (address[] memory);
```

**Usage Example:**
```javascript
const exemptWallets = await token.getExemptWallets();
console.log(`Exempt wallets: ${exemptWallets.join(', ')}`);
```

### Batch Exemption Functions

#### `batchAddExemptions(address[] wallets)`
```solidity
/**
 * @dev Add multiple wallets to exemption list in single transaction
 * @param wallets Array of addresses to add to exemption list
 * Requirements:
 * - Only owner can call this function
 * - All wallets must not already be exempt
 */
function batchAddExemptions(address[] calldata wallets) external onlyOwner;
```

**Usage Example:**
```javascript
const walletsToAdd = ["0xAddress1", "0xAddress2", "0xAddress3"];
await token.batchAddExemptions(walletsToAdd);
```

#### `batchUpdateExemptions(address[] wallets, bool[] exemptions)`
```solidity
/**
 * @dev Update exemption status for multiple wallets
 * @param wallets Array of wallet addresses
 * @param exemptions Array of exemption statuses (true/false)
 * Requirements:
 * - Only owner can call this function
 * - Arrays must have same length
 */
function batchUpdateExemptions(
    address[] calldata wallets, 
    bool[] calldata exemptions
) external onlyOwner;
```

**Usage Example:**
```javascript
const wallets = ["0xAddress1", "0xAddress2"];
const exemptions = [true, false];
await token.batchUpdateExemptions(wallets, exemptions);
```

## 🔐 Lock Mechanism Functions

### Vesting Schedule Functions

#### `createVestingSchedule(...)`
```solidity
/**
 * @dev Create a vesting schedule for a beneficiary
 * @param beneficiary Address that will receive vested tokens
 * @param amount Total amount of tokens to vest
 * @param cliffDays Number of days before vesting starts
 * @param vestingMonths Total vesting period in months
 * @param releasePercentage Monthly release percentage (basis points)
 * @param isAdmin Whether this is an admin wallet (affects immediate release)
 */
function createVestingSchedule(
    address beneficiary,
    uint256 amount,
    uint256 cliffDays,
    uint256 vestingMonths,
    uint256 releasePercentage,
    bool isAdmin
) external onlyOwner;
```

**Usage Example:**
```javascript
// Create admin wallet vesting (10% immediate, 90% vested)
await token.createVestingSchedule(
    "0xAdminWallet",
    ethers.parseEther("10000000"), // 10M tokens
    0,                             // No cliff
    18,                            // 18 months
    500,                           // 5% monthly (basis points)
    true                           // Is admin wallet
);
```

#### `releaseVestedTokens(address beneficiary)`
```solidity
/**
 * @dev Release vested tokens for a beneficiary
 * @param beneficiary Address to release tokens for
 * Requirements:
 * - Vesting schedule must exist
 * - Cliff period must have passed
 * - Tokens must be available for release
 */
function releaseVestedTokens(address beneficiary) external;
```

**Usage Example:**
```javascript
await token.releaseVestedTokens("0xBeneficiaryAddress");
```

#### `getVestingInfo(address beneficiary) → VestingSchedule`
```solidity
/**
 * @dev Get complete vesting information for a beneficiary
 * @param beneficiary Address to get vesting info for
 * @return VestingSchedule Complete vesting schedule data
 */
function getVestingInfo(address beneficiary) 
    external view returns (VestingSchedule memory);
```

**Usage Example:**
```javascript
const vestingInfo = await token.getVestingInfo("0xBeneficiaryAddress");
console.log(`Total: ${vestingInfo.totalAmount}`);
console.log(`Released: ${vestingInfo.releasedAmount}`);
console.log(`Burned: ${vestingInfo.burnedAmount}`);
```

#### `calculateReleasableAmount(address beneficiary) → (uint256, uint256)`
```solidity
/**
 * @dev Calculate releasable amount and burn amount for beneficiary
 * @param beneficiary Address to calculate for
 * @return releaseAmount Amount available for release
 * @return burnAmount Amount that will be burned
 */
function calculateReleasableAmount(address beneficiary) 
    external view returns (uint256 releaseAmount, uint256 burnAmount);
```

**Usage Example:**
```javascript
const [releaseAmount, burnAmount] = await token.calculateReleasableAmount("0xAddress");
console.log(`Releasable: ${ethers.formatEther(releaseAmount)} SYL`);
console.log(`Will burn: ${ethers.formatEther(burnAmount)} SYL`);
```

### Admin Wallet Functions

#### `configureAdminWallet(address admin, uint256 allocation)`
```solidity
/**
 * @dev Configure an admin wallet with allocation and lock parameters
 * @param admin Admin wallet address
 * @param allocation Total token allocation for admin
 * Requirements:
 * - Only owner can call this function
 * - Admin wallet must not already be configured
 */
function configureAdminWallet(address admin, uint256 allocation) external onlyOwner;
```

**Usage Example:**
```javascript
await token.configureAdminWallet(
    "0xAdminAddress",
    ethers.parseEther("10000000") // 10M tokens
);
```

#### `processInitialRelease(address admin)`
```solidity
/**
 * @dev Process 10% immediate release for admin wallet
 * @param admin Admin wallet address
 * Requirements:
 * - Admin wallet must be configured
 * - Initial release must not have been processed
 */
function processInitialRelease(address admin) external onlyOwner;
```

**Usage Example:**
```javascript
await token.processInitialRelease("0xAdminAddress");
```

#### `getAdminConfig(address admin) → AdminWalletConfig`
```solidity
/**
 * @dev Get admin wallet configuration
 * @param admin Admin wallet address
 * @return AdminWalletConfig Complete admin configuration
 */
function getAdminConfig(address admin) 
    external view returns (AdminWalletConfig memory);
```

**Usage Example:**
```javascript
const adminConfig = await token.getAdminConfig("0xAdminAddress");
console.log(`Total allocation: ${adminConfig.totalAllocation}`);
console.log(`Immediate release: ${adminConfig.immediateRelease}`);
console.log(`Locked amount: ${adminConfig.lockedAmount}`);
```

## 📊 Analytics and Monitoring Functions

### System Information Functions

#### `getTotalLocked() → uint256`
```solidity
/**
 * @dev Get total amount of locked tokens across all schedules
 * @return uint256 Total locked token amount
 */
function getTotalLocked() external view returns (uint256);
```

#### `getTotalReleased() → uint256`
```solidity
/**
 * @dev Get total amount of tokens released from all schedules
 * @return uint256 Total released token amount
 */
function getTotalReleased() external view returns (uint256);
```

#### `getTotalBurned() → uint256`
```solidity
/**
 * @dev Get total amount of tokens burned from releases
 * @return uint256 Total burned token amount
 */
function getTotalBurned() external view returns (uint256);
```

#### `getActiveVestingSchedules() → address[]`
```solidity
/**
 * @dev Get all addresses with active vesting schedules
 * @return address[] Array of beneficiary addresses
 */
function getActiveVestingSchedules() external view returns (address[] memory);
```

### Statistics Functions

#### `getVestingStatistics() → VestingStats`
```solidity
/**
 * @dev Get comprehensive vesting statistics
 * @return VestingStats Complete statistics structure
 */
struct VestingStats {
    uint256 totalSchedules;
    uint256 totalLocked;
    uint256 totalReleased;
    uint256 totalBurned;
    uint256 adminSchedules;
    uint256 lockedSchedules;
    uint256 nextReleaseTime;
}

function getVestingStatistics() external view returns (VestingStats memory);
```

#### `getFeeStatistics() → FeeStats`
```solidity
/**
 * @dev Get comprehensive fee statistics
 * @return FeeStats Complete fee statistics structure
 */
struct FeeStats {
    uint256 totalExemptWallets;
    uint256 totalFeesCollected;
    uint256 exemptTransactions;
    uint256 taxedTransactions;
    uint256 exemptionRate; // Percentage in basis points
}

function getFeeStatistics() external view returns (FeeStats memory);
```

## 🔔 Events Reference

### Fee Management Events

#### `FeeExemptionChanged(address indexed wallet, bool exempt)`
```solidity
/**
 * @dev Emitted when fee exemption status changes
 * @param wallet Address whose exemption status changed
 * @param exempt New exemption status
 */
event FeeExemptionChanged(address indexed wallet, bool exempt);
```

#### `BatchExemptionUpdate(address[] wallets, bool[] exemptions)`
```solidity
/**
 * @dev Emitted when batch exemption update occurs
 * @param wallets Array of wallet addresses updated
 * @param exemptions Array of new exemption statuses
 */
event BatchExemptionUpdate(address[] wallets, bool[] exemptions);
```

### Vesting Events

#### `VestingScheduleCreated(address indexed beneficiary, uint256 amount)`
```solidity
/**
 * @dev Emitted when new vesting schedule is created
 * @param beneficiary Address of the beneficiary
 * @param amount Total amount of tokens in schedule
 */
event VestingScheduleCreated(address indexed beneficiary, uint256 amount);
```

#### `TokensReleased(address indexed beneficiary, uint256 amount, uint256 burned)`
```solidity
/**
 * @dev Emitted when tokens are released from vesting
 * @param beneficiary Address receiving the tokens
 * @param amount Net amount released (after burn)
 * @param burned Amount burned during release
 */
event TokensReleased(address indexed beneficiary, uint256 amount, uint256 burned);
```

#### `ProportionalBurn(uint256 amount, uint256 totalBurned)`
```solidity
/**
 * @dev Emitted when proportional burn occurs
 * @param amount Amount burned in this transaction
 * @param totalBurned Total amount burned to date
 */
event ProportionalBurn(uint256 amount, uint256 totalBurned);
```

### Admin Wallet Events

#### `AdminWalletConfigured(address indexed admin, uint256 allocation)`
```solidity
/**
 * @dev Emitted when admin wallet is configured
 * @param admin Admin wallet address
 * @param allocation Total token allocation
 */
event AdminWalletConfigured(address indexed admin, uint256 allocation);
```

#### `InitialReleaseProcessed(address indexed admin, uint256 amount)`
```solidity
/**
 * @dev Emitted when initial 10% release is processed for admin
 * @param admin Admin wallet address
 * @param amount Amount released immediately
 */
event InitialReleaseProcessed(address indexed admin, uint256 amount);
```

## 🧮 Data Structures

### VestingSchedule
```solidity
struct VestingSchedule {
    uint256 totalAmount;        // Total tokens allocated
    uint256 releasedAmount;     // Tokens already released
    uint256 burnedAmount;       // Tokens burned during releases
    uint256 startTime;          // Vesting start timestamp
    uint256 cliffDuration;      // Cliff period in seconds
    uint256 vestingDuration;    // Total vesting period in seconds
    uint256 releasePercentage;  // Monthly release percentage (basis points)
    uint256 burnPercentage;     // Burn percentage of releases (basis points)
    bool isAdmin;               // Admin wallet flag
}
```

### AdminWalletConfig
```solidity
struct AdminWalletConfig {
    uint256 totalAllocation;    // Total token allocation
    uint256 immediateRelease;   // 10% immediate release amount
    uint256 lockedAmount;       // 90% locked amount
    uint256 monthlyRelease;     // Monthly release amount
    bool isConfigured;          // Configuration status
    bool initialReleaseProcessed; // Initial release status
}
```

### FeeExemptionData
```solidity
struct FeeExemptionData {
    mapping(address => bool) exemptWallets;  // Exemption status mapping
    address[] exemptList;                    // List of exempt addresses
    uint256 exemptCount;                     // Count of exempt wallets
}
```

## 🔧 Error Codes

### Fee Management Errors
```solidity
error UnauthorizedExemptionChange();
error WalletAlreadyExempt(address wallet);
error WalletNotExempt(address wallet);
error InvalidExemptionConfiguration();
error CannotRemoveCriticalWallet(address wallet);
```

### Vesting Errors
```solidity
error VestingAlreadyExists(address beneficiary);
error NoVestingSchedule(address beneficiary);
error VestingNotStarted(address beneficiary);
error CliffPeriodActive(address beneficiary);
error NoTokensToRelease(address beneficiary);
error InvalidVestingParameters();
error InsufficientContractBalance();
```

### Admin Wallet Errors
```solidity
error AdminWalletAlreadyConfigured(address admin);
error AdminWalletNotConfigured(address admin);
error InvalidAdminAllocation(uint256 amount);
error ImmediateReleaseAlreadyProcessed(address admin);
error InvalidAdminParameters();
```

## 📝 Usage Examples

### Complete Fee Management Example
```javascript
// Deploy and setup fee management
const token = await ethers.getContractAt("EnhancedSylvanToken", contractAddress);

// Add single exemption
await token.addExemptWallet("0xNewExemptAddress");

// Add multiple exemptions
const walletsToAdd = ["0xAddress1", "0xAddress2", "0xAddress3"];
await token.batchAddExemptions(walletsToAdd);

// Check exemption status
const isExempt = await token.isExempt("0xAddress1");

// Get all exempt wallets
const exemptWallets = await token.getExemptWallets();

// Remove exemption
await token.removeExemptWallet("0xAddress1");
```

### Complete Vesting Management Example
```javascript
// Create admin wallet vesting
await token.createVestingSchedule(
    "0xAdminWallet",
    ethers.parseEther("10000000"), // 10M tokens
    0,                             // No cliff
    18,                            // 18 months
    500,                           // 5% monthly
    true                           // Is admin
);

// Process initial release for admin
await token.processInitialRelease("0xAdminWallet");

// Check releasable amount
const [releaseAmount, burnAmount] = await token.calculateReleasableAmount("0xAdminWallet");

// Release vested tokens
await token.releaseVestedTokens("0xAdminWallet");

// Get vesting info
const vestingInfo = await token.getVestingInfo("0xAdminWallet");
```

---

**Enhanced API Reference Version**: 1.0.0  
**Last Updated**: November 2024  
**Compatible With**: EnhancedSylvanToken v1.0.0  
**Coverage**: Complete API with Examples and Error Handling