// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Address.sol";

// Interface imports
import "./interfaces/IEnhancedFeeManager.sol";
import "./interfaces/IVestingManager.sol";
import "./interfaces/IAdminWalletHandler.sol";

// Library imports for existing functionality
import "./libraries/WalletManager.sol";
import "./libraries/AccessControl.sol";
import "./libraries/TaxManager.sol";
import "./libraries/InputValidator.sol";

/**
 * @title SylvanToken
 * @author Sylvan Team
 * @notice BEP-20 token with advanced vesting, fee distribution, and lock mechanisms
 * @dev Implements ERC20 standard with additional features:
 *      - Universal 1% transaction fee (50% operations, 25% donations, 25% burn)
 *      - Advanced vesting system with cliff periods and proportional burning
 *      - Dynamic fee exemption management
 *      - Reentrancy protection on all state-changing functions
 *      - Gas-optimized storage access patterns
 * @custom:security-contact security@sylvantoken.org
 */
contract SylvanToken is ERC20, Ownable, ReentrancyGuard, IEnhancedFeeManager, IVestingManager, IAdminWalletHandler {
    using Address for address;
    
    // Library using statements
    using WalletManager for WalletManager.WalletData;
    using AccessControlLib for AccessControlLib.AccessData;
    using TaxManager for TaxManager.TaxData;
    
    // 🪙 Token Constants
    uint256 public constant TOTAL_SUPPLY = 1_000_000_000 * 10**18;
    
    // Enhanced Fee System Constants
    uint256 public constant UNIVERSAL_FEE_RATE = 100; // 1% in basis points
    uint256 public constant FEE_DENOMINATOR = 10000;
    uint256 public constant FEE_DISTRIBUTION_FEE = 5000; // 50%
    uint256 public constant FEE_DISTRIBUTION_DONATION = 2500; // 25%
    uint256 public constant FEE_DISTRIBUTION_BURN = 2500; // 25%
    
    // Vesting Constants
    uint256 public constant ADMIN_IMMEDIATE_RELEASE = 1000; // 10%
    uint256 public constant ADMIN_LOCK_PERCENTAGE = 9000; // 90%
    uint256 public constant ADMIN_MONTHLY_RELEASE = 500; // 5%
    uint256 public constant LOCKED_MONTHLY_RELEASE = 300; // 3%
    uint256 public constant PROPORTIONAL_BURN = 1000; // 10%
    uint256 public constant BASIS_POINTS = 10000;
    
    // Time Constants
    uint256 public constant SECONDS_PER_DAY = 86400;
    uint256 public constant SECONDS_PER_MONTH = 2629746; // Average month in seconds
    
    // Dead wallet for burning
    address public constant DEAD_WALLET = 0x000000000000000000000000000000000000dEaD;
    
    // 📚 Library Data Structures
    WalletManager.WalletData private walletData;
    AccessControlLib.AccessData private accessData;
    TaxManager.TaxData private taxData;
    
    // 🔧 Enhanced Fee Exemption Data Structures
    struct FeeExemptionData {
        mapping(address => bool) exemptWallets;
        address[] exemptList;
        uint256 exemptCount;
    }
    
    FeeExemptionData private feeExemptionData;
    
    // 🔒 Vesting Data Structures
    mapping(address => VestingSchedule) private vestingSchedules;
    mapping(address => AdminWalletConfig) private adminConfigs;
    address[] private configuredAdmins;
    
    // Global vesting tracking
    uint256 private totalVestedAmount;
    uint256 private totalReleasedAmount;
    uint256 private totalBurnedAmount;
    
    // 📊 Enhanced tracking
    uint256 public totalFeesCollected;
    uint256 public totalTokensBurned;
    
    // 🔗 Wallet addresses
    address public feeWallet;
    address public donationWallet;
    
    // 🎯 Trading and AMM
    bool private tradingEnabled;
    mapping(address => bool) private ammPairs;
    bool private contractPaused;
    
    // 🎯 Enhanced Events
    event UniversalFeeApplied(address indexed from, address indexed to, uint256 amount, uint256 feeAmount);
    event FeeDistributed(uint256 feeAmount, uint256 donationAmount, uint256 burnAmount);
    event ProportionalBurn(address indexed beneficiary, uint256 burnAmount, uint256 totalBurned);
    
    // Custom errors for enhanced functionality
    error UnauthorizedExemptionChange();
    error WalletAlreadyExempt(address wallet);
    error WalletNotExempt(address wallet);
    error InvalidExemptionConfiguration();
    error VestingAlreadyExists(address beneficiary);
    error NoVestingSchedule(address beneficiary);
    error VestingNotStarted(address beneficiary);
    error CliffPeriodActive(address beneficiary);
    error NoTokensToRelease(address beneficiary);
    error InvalidVestingParameters();
    error InsufficientUnlockedBalance(address account, uint256 requested, uint256 available);
    error AdminWalletAlreadyConfigured(address admin);
    error AdminWalletNotConfigured(address admin);
    error InvalidAdminAllocation(uint256 amount);
    error ImmediateReleaseAlreadyProcessed(address admin);
    error ZeroAddress();
    error InvalidAmount();
    
    constructor(
        address _feeWallet,
        address _donationWallet,
        address[] memory _initialExemptAccounts
    ) ERC20("Sylvan Token", "SYL") {
        // Validate constructor parameters
        if (_feeWallet == address(0) || _donationWallet == address(0)) {
            revert ZeroAddress();
        }
        
        // Set wallet addresses
        feeWallet = _feeWallet;
        donationWallet = _donationWallet;
        
        // Initialize wallet data using existing library
        walletData.initializeWallets(
            _feeWallet,
            _donationWallet,
            owner(),
            address(this),
            _initialExemptAccounts
        );
        
        // Initialize fee exemptions with initial accounts
        _initializeFeeExemptions(_initialExemptAccounts);
        
        // Mint total supply to owner
        _mint(owner(), TOTAL_SUPPLY);
    }
    
    /**
     * @dev Initialize fee exemptions with initial accounts
     * @param _initialExemptAccounts Array of initially exempt accounts
     */
    function _initializeFeeExemptions(address[] memory _initialExemptAccounts) private {
        // Always exempt contract itself, owner, fee wallet, and donation wallet
        feeExemptionData.exemptWallets[address(this)] = true;
        feeExemptionData.exemptWallets[owner()] = true;
        feeExemptionData.exemptWallets[feeWallet] = true;
        feeExemptionData.exemptWallets[donationWallet] = true;
        feeExemptionData.exemptWallets[DEAD_WALLET] = true;
        
        feeExemptionData.exemptList.push(address(this));
        feeExemptionData.exemptList.push(owner());
        feeExemptionData.exemptList.push(feeWallet);
        feeExemptionData.exemptList.push(donationWallet);
        feeExemptionData.exemptList.push(DEAD_WALLET);
        feeExemptionData.exemptCount = 5;
        
        // Add initial exempt accounts
        for (uint256 i = 0; i < _initialExemptAccounts.length; i++) {
            address account = _initialExemptAccounts[i];
            if (account != address(0) && !feeExemptionData.exemptWallets[account]) {
                feeExemptionData.exemptWallets[account] = true;
                feeExemptionData.exemptList.push(account);
                feeExemptionData.exemptCount++;
            }
        }
    }
    
    // ============================================================================
    // ENHANCED FEE MANAGER IMPLEMENTATION
    // ============================================================================
    
    /**
     * @dev Check if a wallet is exempt from fees
     */
    function isExempt(address wallet) public view override returns (bool) {
        return feeExemptionData.exemptWallets[wallet];
    }
    
    /**
     * @dev Add a wallet to the fee exemption list
     */
    function addExemptWallet(address wallet) external override onlyOwner {
        if (wallet == address(0)) revert ZeroAddress();
        if (feeExemptionData.exemptWallets[wallet]) revert WalletAlreadyExempt(wallet);
        
        feeExemptionData.exemptWallets[wallet] = true;
        feeExemptionData.exemptList.push(wallet);
        feeExemptionData.exemptCount++;
        
        emit FeeExemptionChanged(wallet, true);
    }
    
    /**
     * @dev Remove a wallet from the fee exemption list
     */
    function removeExemptWallet(address wallet) external override onlyOwner {
        if (!feeExemptionData.exemptWallets[wallet]) revert WalletNotExempt(wallet);
        
        feeExemptionData.exemptWallets[wallet] = false;
        
        // Remove from exemptList array
        for (uint256 i = 0; i < feeExemptionData.exemptList.length; i++) {
            if (feeExemptionData.exemptList[i] == wallet) {
                feeExemptionData.exemptList[i] = feeExemptionData.exemptList[feeExemptionData.exemptList.length - 1];
                feeExemptionData.exemptList.pop();
                break;
            }
        }
        
        feeExemptionData.exemptCount--;
        emit FeeExemptionChanged(wallet, false);
    }
    
    /**
     * @dev Get all exempt wallets
     */
    function getExemptWallets() external view override returns (address[] memory) {
        address[] memory activeExempt = new address[](feeExemptionData.exemptCount);
        uint256 activeIndex = 0;
        
        for (uint256 i = 0; i < feeExemptionData.exemptList.length; i++) {
            if (feeExemptionData.exemptWallets[feeExemptionData.exemptList[i]]) {
                activeExempt[activeIndex] = feeExemptionData.exemptList[i];
                activeIndex++;
            }
        }
        
        return activeExempt;
    }
    
    /**
     * @dev Load exemptions from configuration data
     * @param configWallets Array of wallet addresses to configure
     * @param exemptStatuses Array of exemption statuses (true = exempt, false = not exempt)
     */
    function loadExemptionsFromConfig(
        address[] calldata configWallets,
        bool[] calldata exemptStatuses
    ) external onlyOwner {
        if (configWallets.length != exemptStatuses.length) {
            revert InvalidExemptionConfiguration();
        }
        
        for (uint256 i = 0; i < configWallets.length; i++) {
            address wallet = configWallets[i];
            bool shouldExempt = exemptStatuses[i];
            
            if (wallet == address(0)) continue;
            
            // Current exemption status
            bool currentlyExempt = feeExemptionData.exemptWallets[wallet];
            
            if (shouldExempt && !currentlyExempt) {
                // Add to exemption
                feeExemptionData.exemptWallets[wallet] = true;
                feeExemptionData.exemptList.push(wallet);
                feeExemptionData.exemptCount++;
                emit FeeExemptionChanged(wallet, true);
            } else if (!shouldExempt && currentlyExempt) {
                // Remove from exemption
                feeExemptionData.exemptWallets[wallet] = false;
                
                // Remove from exemptList array
                for (uint256 j = 0; j < feeExemptionData.exemptList.length; j++) {
                    if (feeExemptionData.exemptList[j] == wallet) {
                        feeExemptionData.exemptList[j] = feeExemptionData.exemptList[feeExemptionData.exemptList.length - 1];
                        feeExemptionData.exemptList.pop();
                        break;
                    }
                }
                
                feeExemptionData.exemptCount--;
                emit FeeExemptionChanged(wallet, false);
            }
        }
        
        emit ExemptionConfigLoaded(feeExemptionData.exemptCount);
    }
    
    /**
     * @dev Load exemptions from configuration (overloaded for backward compatibility)
     */
    function loadExemptionsFromConfig() external override onlyOwner {
        // Emit event to indicate config loading was called
        emit ExemptionConfigLoaded(feeExemptionData.exemptCount);
    }
    
    /**
     * @dev Add multiple wallets to exemption list in batch
     */
    function addExemptWalletsBatch(address[] calldata wallets) external override onlyOwner {
        for (uint256 i = 0; i < wallets.length; i++) {
            address wallet = wallets[i];
            if (wallet != address(0) && !feeExemptionData.exemptWallets[wallet]) {
                feeExemptionData.exemptWallets[wallet] = true;
                feeExemptionData.exemptList.push(wallet);
                feeExemptionData.exemptCount++;
            }
        }
        
        emit BatchExemptionUpdate(wallets, true);
    }
    
    /**
     * @dev Remove multiple wallets from exemption list in batch
     */
    function removeExemptWalletsBatch(address[] calldata wallets) external override onlyOwner {
        for (uint256 i = 0; i < wallets.length; i++) {
            address wallet = wallets[i];
            if (feeExemptionData.exemptWallets[wallet]) {
                feeExemptionData.exemptWallets[wallet] = false;
                
                // Remove from exemptList array
                for (uint256 j = 0; j < feeExemptionData.exemptList.length; j++) {
                    if (feeExemptionData.exemptList[j] == wallet) {
                        feeExemptionData.exemptList[j] = feeExemptionData.exemptList[feeExemptionData.exemptList.length - 1];
                        feeExemptionData.exemptList.pop();
                        break;
                    }
                }
                
                feeExemptionData.exemptCount--;
            }
        }
        
        emit BatchExemptionUpdate(wallets, false);
    }
    
    /**
     * @dev Get the count of exempt wallets
     */
    function getExemptWalletCount() external view override returns (uint256) {
        return feeExemptionData.exemptCount;
    }
    
    // ============================================================================
    // VESTING MANAGER IMPLEMENTATION (Basic Structure)
    // ============================================================================
    
    /**
     * @dev Create a new vesting schedule
     */
    function createVestingSchedule(
        address beneficiary,
        uint256 amount,
        uint256 cliffDays,
        uint256 vestingMonths,
        uint256 releasePercentage,
        uint256 burnPercentage,
        bool isAdmin
    ) external override onlyOwner {
        if (beneficiary == address(0)) revert ZeroAddress();
        if (amount == 0) revert InvalidAmount();
        if (vestingSchedules[beneficiary].isActive) revert VestingAlreadyExists(beneficiary);
        
        vestingSchedules[beneficiary] = VestingSchedule({
            totalAmount: amount,
            releasedAmount: 0,
            burnedAmount: 0,
            startTime: block.timestamp,
            cliffDuration: cliffDays * SECONDS_PER_DAY,
            vestingDuration: vestingMonths * SECONDS_PER_MONTH,
            releasePercentage: releasePercentage,
            burnPercentage: burnPercentage,
            isAdmin: isAdmin,
            isActive: true
        });
        
        totalVestedAmount += amount;
        
        emit VestingScheduleCreated(
            beneficiary,
            amount,
            cliffDays * SECONDS_PER_DAY,
            vestingMonths * SECONDS_PER_MONTH,
            isAdmin
        );
    }
    
    /**
     * @dev Release vested tokens for locked wallet with 3% monthly releases
     * Requirements: 5.1, 5.2, 5.3, 5.4, 5.5
     */
    function releaseVestedTokens(address beneficiary) external override returns (uint256 releasedAmount, uint256 burnedAmount) {
        VestingSchedule storage schedule = vestingSchedules[beneficiary];
        
        if (!schedule.isActive) revert NoVestingSchedule(beneficiary);
        
        // Check if vesting has started
        if (block.timestamp < schedule.startTime) revert VestingNotStarted(beneficiary);
        
        // Check if cliff period has passed
        if (block.timestamp < schedule.startTime + schedule.cliffDuration) revert CliffPeriodActive(beneficiary);
        
        // Calculate available release amount
        (uint256 availableAmount, uint256 burnAmount) = _calculateLockedWalletRelease(beneficiary);
        
        if (availableAmount == 0) revert NoTokensToRelease(beneficiary);
        
        // Update schedule tracking
        schedule.releasedAmount += availableAmount;
        schedule.burnedAmount += burnAmount;
        
        // Calculate actual amounts: 10% burn, 90% to beneficiary
        burnedAmount = burnAmount;
        releasedAmount = availableAmount - burnedAmount;
        
        // Transfer burn amount to dead wallet (Requirement 5.2)
        _transfer(owner(), DEAD_WALLET, burnedAmount);
        
        // Transfer remaining 90% to beneficiary (Requirement 5.3)
        _transfer(owner(), beneficiary, releasedAmount);
        
        // Update global tracking
        totalReleasedAmount += availableAmount;
        totalBurnedAmount += burnedAmount;
        totalTokensBurned += burnedAmount;
        
        emit TokensReleased(beneficiary, releasedAmount, burnedAmount, schedule.releasedAmount);
        emit ProportionalBurn(beneficiary, burnedAmount, totalBurnedAmount);
        
        return (releasedAmount, burnedAmount);
    }
    
    /**
     * @dev Get vesting information for a beneficiary
     */
    function getVestingInfo(address beneficiary) external view override returns (VestingSchedule memory) {
        return vestingSchedules[beneficiary];
    }
    
    /**
     * @dev Calculate releasable amount for locked wallet with 3% monthly releases
     * Requirements: 5.1, 5.2, 5.3, 5.4, 5.5
     */
    function calculateReleasableAmount(address beneficiary) external view override returns (uint256 releasableAmount, uint256 burnAmount) {
        return _calculateLockedWalletRelease(beneficiary);
    }
    
    /**
     * @dev Check if vesting schedule exists
     */
    function hasVestingSchedule(address beneficiary) external view override returns (bool) {
        return vestingSchedules[beneficiary].isActive;
    }
    
    /**
     * @dev Get total vested amount
     */
    function getTotalVestedAmount() external view override returns (uint256) {
        return totalVestedAmount;
    }
    
    /**
     * @dev Get total released amount
     */
    function getTotalReleasedAmount() external view override returns (uint256) {
        return totalReleasedAmount;
    }
    
    /**
     * @dev Get total burned amount
     */
    function getTotalBurnedAmount() external view override returns (uint256) {
        return totalBurnedAmount;
    }
    
    // ============================================================================
    // ADMIN WALLET HANDLER IMPLEMENTATION
    // ============================================================================
    
    /**
     * @dev Configure an admin wallet with 10% immediate access and 90% vesting
     * Requirements: 2.1, 2.2, 2.3, 2.4, 2.5
     */
    function configureAdminWallet(address admin, uint256 allocation) external override onlyOwner {
        if (admin == address(0)) revert ZeroAddress();
        if (allocation == 0) revert InvalidAmount();
        if (adminConfigs[admin].isConfigured) revert AdminWalletAlreadyConfigured(admin);
        
        // Calculate 10% immediate release and 90% locked amount (Requirements 2.1, 2.2)
        uint256 immediateRelease = (allocation * ADMIN_IMMEDIATE_RELEASE) / BASIS_POINTS;
        uint256 lockedAmount = allocation - immediateRelease;
        uint256 monthlyRelease = (allocation * ADMIN_MONTHLY_RELEASE) / BASIS_POINTS;
        
        adminConfigs[admin] = AdminWalletConfig({
            totalAllocation: allocation,
            immediateRelease: immediateRelease,
            lockedAmount: lockedAmount,
            monthlyRelease: monthlyRelease,
            releasedAmount: 0,
            burnedAmount: 0,
            isConfigured: true,
            immediateReleased: false
        });
        
        configuredAdmins.push(admin);
        
        // Create vesting schedule for the locked portion (90%)
        // Cliff period: 0 days (immediate start after initial release)
        // Vesting duration: 18 months (to release 5% monthly for 18 months = 90% of total allocation)
        // Release percentage: 500 basis points (5% of total allocation monthly, calculated on locked amount)
        // Burn percentage: 1000 basis points (10% of each release)
        // Note: 18 months × 5% of locked = 90% of locked amount
        vestingSchedules[admin] = VestingSchedule({
            totalAmount: lockedAmount,
            releasedAmount: 0,
            burnedAmount: 0,
            startTime: block.timestamp,
            cliffDuration: 0, // No cliff for admin wallets after initial release
            vestingDuration: 18 * SECONDS_PER_MONTH, // 18 months total vesting (18 × 5% = 90%)
            releasePercentage: ADMIN_MONTHLY_RELEASE, // 5% monthly of total allocation
            burnPercentage: PROPORTIONAL_BURN, // 10% burn
            isAdmin: true,
            isActive: true
        });
        
        totalVestedAmount += lockedAmount;
        
        emit AdminWalletConfigured(admin, allocation, immediateRelease, lockedAmount);
        emit VestingScheduleCreated(admin, lockedAmount, 0, 18 * SECONDS_PER_MONTH, true);
    }
    
    /**
     * @dev Get admin configuration
     */
    function getAdminConfig(address admin) external view override returns (AdminWalletConfig memory) {
        return adminConfigs[admin];
    }
    
    /**
     * @dev Process initial 10% release for admin wallet
     * Requirements: 2.1 - 10% immediate access
     */
    function processInitialRelease(address admin) external override onlyOwner returns (uint256 releasedAmount) {
        AdminWalletConfig storage config = adminConfigs[admin];
        
        if (!config.isConfigured) revert AdminWalletNotConfigured(admin);
        if (config.immediateReleased) revert ImmediateReleaseAlreadyProcessed(admin);
        
        releasedAmount = config.immediateRelease;
        
        // Mark immediate release as processed
        config.immediateReleased = true;
        config.releasedAmount += releasedAmount;
        
        // Transfer 10% immediately to admin wallet
        _transfer(owner(), admin, releasedAmount);
        
        totalReleasedAmount += releasedAmount;
        
        emit InitialReleaseProcessed(admin, releasedAmount);
        
        return releasedAmount;
    }
    
    /**
     * @dev Process monthly release for admin wallet with proportional burning
     * Requirements: 2.4, 2.5, 3.1, 3.2, 3.3, 3.4, 3.5
     */
    function processMonthlyRelease(address admin) external override onlyOwner returns (uint256 releasedAmount, uint256 burnedAmount) {
        AdminWalletConfig storage config = adminConfigs[admin];
        VestingSchedule storage schedule = vestingSchedules[admin];
        
        if (!config.isConfigured) revert AdminWalletNotConfigured(admin);
        if (!schedule.isActive) revert NoVestingSchedule(admin);
        
        // Calculate available release amount using internal function
        (uint256 availableAmount, uint256 burnAmount) = _calculateAvailableRelease(admin);
        
        if (availableAmount == 0) revert NoTokensToRelease(admin);
        
        // Update tracking
        schedule.releasedAmount += availableAmount;
        schedule.burnedAmount += burnAmount;
        config.releasedAmount += availableAmount;
        config.burnedAmount += burnAmount;
        
        // Calculate actual amounts: 10% burn, 90% to admin (Requirements 3.1, 3.2, 3.3)
        burnedAmount = burnAmount;
        releasedAmount = availableAmount - burnedAmount;
        
        // Transfer burn amount to dead wallet (Requirement 3.2)
        _transfer(owner(), DEAD_WALLET, burnedAmount);
        
        // Transfer remaining 90% to admin wallet (Requirement 3.3)
        _transfer(owner(), admin, releasedAmount);
        
        // Update global tracking
        totalReleasedAmount += availableAmount;
        totalBurnedAmount += burnedAmount;
        totalTokensBurned += burnedAmount;
        
        emit MonthlyReleaseProcessed(admin, releasedAmount, burnedAmount, config.releasedAmount);
        emit ProportionalBurn(admin, burnedAmount, totalBurnedAmount);
        
        return (releasedAmount, burnedAmount);
    }
    
    /**
     * @dev Check if admin is configured
     */
    function isAdminConfigured(address admin) external view override returns (bool) {
        return adminConfigs[admin].isConfigured;
    }
    
    /**
     * @dev Internal function to calculate available release amount for admin wallet
     * Requirements: 2.4, 2.5 - Monthly 5% release calculation
     */
    function _calculateAvailableRelease(address admin) internal view returns (uint256 availableAmount, uint256 burnAmount) {
        AdminWalletConfig storage config = adminConfigs[admin];
        VestingSchedule storage schedule = vestingSchedules[admin];
        
        if (!config.isConfigured || !schedule.isActive) {
            return (0, 0);
        }
        
        // Check if cliff period has passed (should be 0 for admin wallets)
        if (block.timestamp < schedule.startTime + schedule.cliffDuration) {
            return (0, 0);
        }
        
        // Calculate months elapsed since start
        uint256 timeElapsed = block.timestamp - schedule.startTime;
        uint256 monthsElapsed = timeElapsed / SECONDS_PER_MONTH;
        
        // Cap at maximum vesting duration
        if (timeElapsed >= schedule.vestingDuration) {
            monthsElapsed = schedule.vestingDuration / SECONDS_PER_MONTH;
        }
        
        // Calculate total amount that should be released by now
        // Monthly release is 5% of original allocation (Requirements 2.4, 2.5)
        // Calculate based on the locked amount (schedule.totalAmount) since that's what's being vested
        uint256 totalReleasableAmount = (schedule.totalAmount * schedule.releasePercentage * monthsElapsed) / BASIS_POINTS;
        
        // Subtract what has already been released
        if (totalReleasableAmount <= schedule.releasedAmount) {
            return (0, 0);
        }
        
        availableAmount = totalReleasableAmount - schedule.releasedAmount;
        
        // Calculate burn amount (10% of available amount) (Requirements 3.1, 3.4, 3.5)
        burnAmount = (availableAmount * schedule.burnPercentage) / BASIS_POINTS;
        
        return (availableAmount, burnAmount);
    }
    
    /**
     * @dev Calculate available release amount for admin wallet
     * Requirements: 2.4, 2.5 - Monthly 5% release calculation
     */
    function calculateAvailableRelease(address admin) external view override returns (uint256 availableAmount, uint256 burnAmount) {
        return _calculateAvailableRelease(admin);
    }
    
    /**
     * @dev Get configured admins
     */
    function getConfiguredAdmins() external view override returns (address[] memory) {
        return configuredAdmins;
    }
    
    /**
     * @dev Get total admin allocations
     */
    function getTotalAdminAllocations() external view override returns (uint256) {
        uint256 total = 0;
        for (uint256 i = 0; i < configuredAdmins.length; i++) {
            total += adminConfigs[configuredAdmins[i]].totalAllocation;
        }
        return total;
    }
    
    /**
     * @dev Get admin wallet release status
     */
    function getAdminReleaseStatus(address admin) external view returns (
        uint256 totalAllocation,
        uint256 immediateReleased,
        uint256 monthlyReleased,
        uint256 totalBurned,
        uint256 remainingLocked,
        bool immediateProcessed
    ) {
        AdminWalletConfig storage config = adminConfigs[admin];
        
        if (!config.isConfigured) {
            return (0, 0, 0, 0, 0, false);
        }
        
        totalAllocation = config.totalAllocation;
        immediateReleased = config.immediateReleased ? config.immediateRelease : 0;
        monthlyReleased = config.releasedAmount - immediateReleased;
        totalBurned = config.burnedAmount;
        remainingLocked = config.lockedAmount - monthlyReleased - totalBurned;
        immediateProcessed = config.immediateReleased;
        
        return (totalAllocation, immediateReleased, monthlyReleased, totalBurned, remainingLocked, immediateProcessed);
    }
    
    // ============================================================================
    // ENHANCED TRANSFER LOGIC
    // ============================================================================
    
    /**
     * @dev Enhanced transfer function with universal 1% fee
     */
    function _transfer(address from, address to, uint256 amount) internal override nonReentrant {
        if (from == address(0) || to == address(0)) revert ZeroAddress();
        if (amount == 0) revert InvalidAmount();
        
        // Check vesting lock - prevent transfer of locked tokens
        // Gas optimization: Cache storage reads
        VestingSchedule storage schedule = vestingSchedules[from];
        if (schedule.isActive) {
            uint256 currentBalance = balanceOf(from);
            
            // Gas optimization: Use unchecked for safe math operations
            uint256 lockedAmount;
            unchecked {
                lockedAmount = schedule.totalAmount - schedule.releasedAmount;
            }
            
            // Calculate available balance with 1 wei tolerance for rounding
            uint256 availableBalance = currentBalance > lockedAmount ? currentBalance - lockedAmount : 0;
            
            // Wei tolerance: Allow 1 wei difference for rounding errors
            if (amount > availableBalance + 1) {
                revert InsufficientUnlockedBalance(from, amount, availableBalance);
            }
        }
        
        // Check if either sender OR receiver is exempt (Requirements 6.2, 6.3)
        bool isFromExempt = isExempt(from);
        bool isToExempt = isExempt(to);
        bool shouldApplyFee = !isFromExempt && !isToExempt;
        
        if (shouldApplyFee && amount > 0) {
            // Calculate 1% universal fee (Requirement 6.1)
            uint256 feeAmount = (amount * UNIVERSAL_FEE_RATE) / FEE_DENOMINATOR;
            uint256 transferAmount = amount - feeAmount;
            
            if (feeAmount > 0) {
                // Distribute fee: 50% fee wallet, 25% donation, 25% burn (Requirement 6.4)
                _distributeFee(from, feeAmount);
                emit UniversalFeeApplied(from, to, amount, feeAmount);
            }
            
            super._transfer(from, to, transferAmount);
        } else {
            super._transfer(from, to, amount);
        }
    }
    
    /**
     * @dev Distribute collected fees according to requirements
     */
    function _distributeFee(address from, uint256 feeAmount) private {
        uint256 feeWalletAmount = (feeAmount * FEE_DISTRIBUTION_FEE) / BASIS_POINTS;
        uint256 donationAmount = (feeAmount * FEE_DISTRIBUTION_DONATION) / BASIS_POINTS;
        uint256 burnAmount = feeAmount - feeWalletAmount - donationAmount; // Remaining amount to handle rounding
        
        // Transfer to fee wallet (50%)
        super._transfer(from, feeWallet, feeWalletAmount);
        
        // Transfer to donation wallet (25%)
        super._transfer(from, donationWallet, donationAmount);
        
        // Transfer to dead wallet for burning (25%)
        super._transfer(from, DEAD_WALLET, burnAmount);
        
        // Update tracking
        totalFeesCollected += feeWalletAmount;
        totalTokensBurned += burnAmount;
        
        emit FeeDistributed(feeWalletAmount, donationAmount, burnAmount);
    }
    
    // ============================================================================
    // VIEW FUNCTIONS
    // ============================================================================
    
    /**
     * @dev Get fee system statistics
     */
    function getFeeStats() external view returns (
        uint256 _totalFeesCollected,
        uint256 _totalTokensBurned,
        uint256 _totalDonations
    ) {
        return (
            totalFeesCollected,
            totalTokensBurned,
            balanceOf(donationWallet)
        );
    }
    
    /**
     * @dev Get vesting system statistics
     */
    function getVestingStats() external view returns (
        uint256 _totalVested,
        uint256 _totalReleased,
        uint256 _totalBurned,
        uint256 _activeSchedules
    ) {
        return (
            totalVestedAmount,
            totalReleasedAmount,
            totalBurnedAmount,
            configuredAdmins.length
        );
    }
    
    /**
     * @dev Internal function to calculate available release amount for locked wallet
     * Requirements: 5.1, 5.2, 5.3, 5.4, 5.5 - 3% monthly release with 34-month vesting
     */
    function _calculateLockedWalletRelease(address beneficiary) internal view returns (uint256 availableAmount, uint256 burnAmount) {
        VestingSchedule storage schedule = vestingSchedules[beneficiary];
        
        if (!schedule.isActive) {
            return (0, 0);
        }
        
        // Check if vesting has started
        if (block.timestamp < schedule.startTime) {
            return (0, 0);
        }
        
        // Check if cliff period has passed
        if (block.timestamp < schedule.startTime + schedule.cliffDuration) {
            return (0, 0);
        }
        
        // Calculate months elapsed since cliff period ended
        uint256 timeElapsed = block.timestamp - (schedule.startTime + schedule.cliffDuration);
        uint256 monthsElapsed = timeElapsed / SECONDS_PER_MONTH;
        
        // For locked wallets: 34-month vesting schedule (Requirement 5.5)
        // Cap at maximum vesting duration
        uint256 maxMonths = schedule.vestingDuration / SECONDS_PER_MONTH;
        if (monthsElapsed > maxMonths) {
            monthsElapsed = maxMonths;
        }
        
        // Calculate total amount that should be released by now
        // For locked wallets: 3% monthly release (Requirement 5.1)
        uint256 totalReleasableAmount;
        
        if (schedule.isAdmin) {
            // Admin wallets: 5% of original allocation monthly
            totalReleasableAmount = (schedule.totalAmount * schedule.releasePercentage * monthsElapsed) / BASIS_POINTS;
        } else {
            // Locked wallets: 3% of original allocation monthly (Requirement 5.1)
            totalReleasableAmount = (schedule.totalAmount * LOCKED_MONTHLY_RELEASE * monthsElapsed) / BASIS_POINTS;
        }
        
        // Ensure we don't exceed total amount
        if (totalReleasableAmount > schedule.totalAmount) {
            totalReleasableAmount = schedule.totalAmount;
        }
        
        // Subtract what has already been released
        if (totalReleasableAmount <= schedule.releasedAmount) {
            return (0, 0);
        }
        
        availableAmount = totalReleasableAmount - schedule.releasedAmount;
        
        // Calculate burn amount (10% of available amount) (Requirements 5.2, 5.3, 5.4)
        burnAmount = (availableAmount * PROPORTIONAL_BURN) / BASIS_POINTS;
        
        return (availableAmount, burnAmount);
    }
    
    /**
     * @dev Create locked wallet vesting schedule with 34-month duration
     * Requirements: 5.1, 5.2, 5.3, 5.4, 5.5
     */
    function createLockedWalletVesting(
        address lockedWallet,
        uint256 amount,
        uint256 cliffDays
    ) external onlyOwner {
        if (lockedWallet == address(0)) revert ZeroAddress();
        if (amount == 0) revert InvalidAmount();
        if (vestingSchedules[lockedWallet].isActive) revert VestingAlreadyExists(lockedWallet);
        
        // Create 33-month vesting schedule for locked wallet (Requirement 5.5)
        // Changed from 34 to 33 months to match 3% monthly release (33 × 3% = 99%)
        vestingSchedules[lockedWallet] = VestingSchedule({
            totalAmount: amount,
            releasedAmount: 0,
            burnedAmount: 0,
            startTime: block.timestamp,
            cliffDuration: cliffDays * SECONDS_PER_DAY,
            vestingDuration: 33 * SECONDS_PER_MONTH, // 33-month vesting (33 × 3% = 99%)
            releasePercentage: LOCKED_MONTHLY_RELEASE, // 3% monthly (Requirement 5.1)
            burnPercentage: PROPORTIONAL_BURN, // 10% burn (Requirements 5.2, 5.3, 5.4)
            isAdmin: false,
            isActive: true
        });
        
        totalVestedAmount += amount;
        
        emit VestingScheduleCreated(
            lockedWallet,
            amount,
            cliffDays * SECONDS_PER_DAY,
            33 * SECONDS_PER_MONTH,
            false
        );
    }
    
    /**
     * @dev Process locked wallet monthly release with proportional burning
     * Requirements: 5.1, 5.2, 5.3, 5.4, 5.5
     */
    function processLockedWalletRelease(address lockedWallet) external onlyOwner returns (uint256 releasedAmount, uint256 burnedAmount) {
        VestingSchedule storage schedule = vestingSchedules[lockedWallet];
        
        if (!schedule.isActive) revert NoVestingSchedule(lockedWallet);
        if (schedule.isAdmin) revert InvalidVestingParameters(); // This function is for locked wallets only
        
        // Check if vesting has started
        if (block.timestamp < schedule.startTime) revert VestingNotStarted(lockedWallet);
        
        // Check if cliff period has passed
        if (block.timestamp < schedule.startTime + schedule.cliffDuration) revert CliffPeriodActive(lockedWallet);
        
        // Calculate available release amount using locked wallet logic
        (uint256 availableAmount, uint256 burnAmount) = _calculateLockedWalletRelease(lockedWallet);
        
        if (availableAmount == 0) revert NoTokensToRelease(lockedWallet);
        
        // Update schedule tracking
        schedule.releasedAmount += availableAmount;
        schedule.burnedAmount += burnAmount;
        
        // Calculate actual amounts: 10% burn, 90% to locked wallet (Requirements 5.2, 5.3, 5.4)
        burnedAmount = burnAmount;
        releasedAmount = availableAmount - burnedAmount;
        
        // Transfer burn amount to dead wallet (Requirement 5.2)
        _transfer(owner(), DEAD_WALLET, burnedAmount);
        
        // Transfer remaining 90% to locked wallet (Requirements 5.3, 5.4)
        _transfer(owner(), lockedWallet, releasedAmount);
        
        // Update global tracking
        totalReleasedAmount += availableAmount;
        totalBurnedAmount += burnedAmount;
        totalTokensBurned += burnedAmount;
        
        emit TokensReleased(lockedWallet, releasedAmount, burnedAmount, schedule.releasedAmount);
        emit ProportionalBurn(lockedWallet, burnedAmount, totalBurnedAmount);
        
        return (releasedAmount, burnedAmount);
    }
    
    /**
     * @dev Calculate proportional burn amount for locked wallet release
     * Requirements: 5.2, 5.3, 5.4 - 10% burn of released amount
     */
    function calculateProportionalBurn(address lockedWallet) external view returns (uint256 burnAmount, uint256 netReleaseAmount) {
        (uint256 availableAmount, uint256 calculatedBurnAmount) = _calculateLockedWalletRelease(lockedWallet);
        
        burnAmount = calculatedBurnAmount;
        netReleaseAmount = availableAmount - burnAmount;
        
        return (burnAmount, netReleaseAmount);
    }
    
    /**
     * @dev Get locked wallet vesting information
     * Requirements: 5.1, 5.2, 5.3, 5.4, 5.5
     */
    function getLockedWalletInfo(address lockedWallet) external view returns (
        uint256 totalAmount,
        uint256 releasedAmount,
        uint256 burnedAmount,
        uint256 remainingAmount,
        uint256 nextReleaseTime,
        uint256 monthsElapsed,
        uint256 monthsRemaining,
        bool canRelease
    ) {
        VestingSchedule storage schedule = vestingSchedules[lockedWallet];
        
        if (!schedule.isActive) {
            return (0, 0, 0, 0, 0, 0, 0, false);
        }
        
        totalAmount = schedule.totalAmount;
        releasedAmount = schedule.releasedAmount;
        burnedAmount = schedule.burnedAmount;
        remainingAmount = totalAmount - releasedAmount;
        
        // Calculate time-based information
        uint256 cliffEndTime = schedule.startTime + schedule.cliffDuration;
        uint256 vestingEndTime = schedule.startTime + schedule.cliffDuration + schedule.vestingDuration;
        
        if (block.timestamp < cliffEndTime) {
            // Still in cliff period
            nextReleaseTime = cliffEndTime;
            monthsElapsed = 0;
            monthsRemaining = schedule.vestingDuration / SECONDS_PER_MONTH;
            canRelease = false;
        } else if (block.timestamp >= vestingEndTime) {
            // Vesting completed
            monthsElapsed = schedule.vestingDuration / SECONDS_PER_MONTH;
            monthsRemaining = 0;
            nextReleaseTime = 0;
            (uint256 available,) = _calculateLockedWalletRelease(lockedWallet);
            canRelease = available > 0;
        } else {
            // In vesting period
            uint256 timeElapsed = block.timestamp - cliffEndTime;
            monthsElapsed = timeElapsed / SECONDS_PER_MONTH;
            monthsRemaining = (schedule.vestingDuration / SECONDS_PER_MONTH) - monthsElapsed;
            
            // Next release time is at the start of next month
            uint256 nextMonthStart = cliffEndTime + ((monthsElapsed + 1) * SECONDS_PER_MONTH);
            nextReleaseTime = nextMonthStart;
            
            (uint256 available,) = _calculateLockedWalletRelease(lockedWallet);
            canRelease = available > 0;
        }
        
        return (totalAmount, releasedAmount, burnedAmount, remainingAmount, nextReleaseTime, monthsElapsed, monthsRemaining, canRelease);
    }
    
    // ============================================
    // Trading and AMM Management
    // ============================================
    
    /**
     * @dev Enable trading
     */
    function enableTrading() external onlyOwner {
        require(!tradingEnabled, "Trading already enabled");
        tradingEnabled = true;
    }
    
    /**
     * @dev Check if trading is enabled
     */
    function isTradingEnabled() external view returns (bool) {
        return tradingEnabled;
    }
    
    /**
     * @dev Set AMM pair status
     */
    function setAMMPair(address pair, bool isAMM) external onlyOwner {
        require(pair != address(0), "Invalid pair address");
        ammPairs[pair] = isAMM;
    }
    
    /**
     * @dev Check if address is AMM pair
     */
    function isAMMPair(address pair) external view returns (bool) {
        return ammPairs[pair];
    }
    
    // ============================================
    // Emergency Functions
    // ============================================
    
    /**
     * @dev Pause contract
     */
    function pauseContract() external onlyOwner {
        require(!contractPaused, "Contract already paused");
        contractPaused = true;
    }
    
    /**
     * @dev Unpause contract
     */
    function unpauseContract() external onlyOwner {
        require(contractPaused, "Contract not paused");
        contractPaused = false;
    }
    
    /**
     * @dev Check if contract is paused
     */
    function isContractPaused() external view returns (bool) {
        return contractPaused;
    }
    
    /**
     * @dev Override transfer to respect pause
     */
    function transfer(address to, uint256 amount) public override returns (bool) {
        require(!contractPaused, "Contract is paused");
        return super.transfer(to, amount);
    }
    
    /**
     * @dev Override transferFrom to respect pause
     */
    function transferFrom(address from, address to, uint256 amount) public override returns (bool) {
        require(!contractPaused, "Contract is paused");
        return super.transferFrom(from, to, amount);
    }
}
