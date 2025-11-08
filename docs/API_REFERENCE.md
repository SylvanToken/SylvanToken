# 📘 Sylvan Token - API Reference

**Version:** 1.0  
**Contract:** SylvanToken  
**Solidity:** 0.8.24  
**Standard:** BEP-20 (ERC-20 Compatible)

---

## 📋 Table of Contents

1. [Contract Overview](#contract-overview)
2. [ERC20 Functions](#erc20-functions)
3. [Vesting Functions](#vesting-functions)
4. [Fee Management](#fee-management)
5. [Admin Functions](#admin-functions)
6. [View Functions](#view-functions)
7. [Events](#events)
8. [Errors](#errors)

---

## Contract Overview

### Inheritance

```solidity
contract SylvanToken is 
    ERC20,
    Ownable,
    ReentrancyGuard,
    IEnhancedFeeManager,
    IVestingManager,
    IAdminWalletHandler
```

### Constants

```solidity
uint256 public constant TOTAL_SUPPLY = 1_000_000_000 * 10**18;
uint256 public constant UNIVERSAL_FEE_RATE = 100; // 1%
uint256 public constant FEE_DENOMINATOR = 10000;
address public constant DEAD_WALLET = 0x000000000000000000000000000000000000dEaD;
```

---

## ERC20 Functions

### transfer

```solidity
function transfer(address to, uint256 amount) 
    public 
    override 
    returns (bool)
```

**Description:** Token transfer operation (with fee and vesting lock check)

**Parameters:**
- `to`: Recipient address
- `amount`: Transfer amount (wei)

**Returns:** `bool` - Success status

**Revert Conditions:**
- `ZeroAddress()` - to == address(0)
- `InvalidAmount()` - amount == 0
- `InsufficientUnlockedBalance()` - Attempting to transfer locked tokens

**Events:** `Transfer`, `UniversalFeeApplied`, `FeeDistributed`

**Example:**
```javascript
await token.transfer("0xRecipient", ethers.utils.parseEther("1000"));
```

---

### transferFrom

```solidity
function transferFrom(
    address from,
    address to,
    uint256 amount
) public override returns (bool)
```

**Description:** Approved token transfer (using allowance)

**Parameters:**
- `from`: Sender address
- `to`: Recipient address
- `amount`: Transfer amount

**Returns:** `bool` - Success status

**Revert Conditions:**
- All `transfer` conditions
- `ERC20InsufficientAllowance` - Insufficient allowance

**Example:**
```javascript
await token.approve(spender, amount);
await token.connect(spender).transferFrom(owner, recipient, amount);
```

---

### approve

```solidity
function approve(address spender, uint256 amount) 
    public 
    override 
    returns (bool)
```

**Description:** Grant spending authority to spender

**Parameters:**
- `spender`: Address to be authorized
- `amount`: Authorization amount

**Returns:** `bool` - Success status

**Events:** `Approval`

---

### balanceOf

```solidity
function balanceOf(address account) 
    public 
    view 
    override 
    returns (uint256)
```

**Description:** Query account balance

**Parameters:**
- `account`: Address to query

**Returns:** `uint256` - Balance (wei)

---

## Vesting Functions

### createVestingSchedule

```solidity
function createVestingSchedule(
    address beneficiary,
    uint256 amount,
    uint256 cliffDays,
    uint256 vestingMonths,
    uint256 releasePercentage,
    uint256 burnPercentage,
    bool isAdmin
) external onlyOwner
```

**Description:** Create new vesting schedule

**Parameters:**
- `beneficiary`: Address to receive tokens
- `amount`: Amount to be locked
- `cliffDays`: Initial waiting period (days)
- `vestingMonths`: Total vesting duration (months)
- `releasePercentage`: Monthly release percentage (basis points)
- `burnPercentage`: Burn percentage (basis points)
- `isAdmin`: Is admin wallet?

**Access:** Owner only

**Revert Conditions:**
- `ZeroAddress()` - beneficiary == address(0)
- `InvalidAmount()` - amount == 0
- `VestingAlreadyExists()` - Schedule already exists

**Events:** `VestingScheduleCreated`

**Example:**
```javascript
// 10M tokens, 30 days cliff, 16 months, 5% monthly, no burn, admin
await token.createVestingSchedule(
    beneficiary,
    ethers.utils.parseEther("10000000"),
    30,
    16,
    500,
    0,
    true
);
```

---

### releaseVestedTokens

```solidity
function releaseVestedTokens(address beneficiary) 
    external
```

**Description:** Release vested tokens

**Parameters:**
- `beneficiary`: Address to release for

**Access:** Anyone (for beneficiary)

**Revert Conditions:**
- `NoVestingSchedule()` - No schedule exists
- `VestingNotStarted()` - Not started yet
- `CliffPeriodActive()` - Cliff period ongoing
- `NoTokensToRelease()` - No tokens to release

**Events:** `TokensReleased`, `ProportionalBurn`

**Example:**
```javascript
await token.releaseVestedTokens(beneficiary);
```

---

### getVestingInfo

```solidity
function getVestingInfo(address beneficiary) 
    external 
    view 
    returns (VestingSchedule memory)
```

**Description:** Query vesting information

**Parameters:**
- `beneficiary`: Address to query

**Returns:** `VestingSchedule` struct
```solidity
struct VestingSchedule {
    uint256 totalAmount;
    uint256 releasedAmount;
    uint256 burnedAmount;
    uint256 startTime;
    uint256 cliffDuration;
    uint256 vestingDuration;
    uint256 releasePercentage;
    uint256 burnPercentage;
    bool isAdmin;
    bool isActive;
}
```

**Example:**
```javascript
const schedule = await token.getVestingInfo(beneficiary);
console.log("Total:", ethers.utils.formatEther(schedule.totalAmount));
console.log("Released:", ethers.utils.formatEther(schedule.releasedAmount));
```

---

## Fee Management

### isExempt

```solidity
function isExempt(address wallet) 
    public 
    view 
    returns (bool)
```

**Description:** Check fee exemption status

**Parameters:**
- `wallet`: Address to check

**Returns:** `bool` - Is exempt?

---

### addExemptWallet

```solidity
function addExemptWallet(address wallet) 
    external 
    onlyOwner
```

**Description:** Add to fee exemption list

**Parameters:**
- `wallet`: Address to add

**Access:** Owner only

**Revert Conditions:**
- `ZeroAddress()` - wallet == address(0)
- `WalletAlreadyExempt()` - Already exempt

**Events:** `FeeExemptionChanged`

---

### removeExemptWallet

```solidity
function removeExemptWallet(address wallet) 
    external 
    onlyOwner
```

**Description:** Remove from fee exemption list

**Parameters:**
- `wallet`: Address to remove

**Access:** Owner only

**Revert Conditions:**
- `WalletNotExempt()` - Not exempt already

**Events:** `FeeExemptionChanged`

---

### getExemptWallets

```solidity
function getExemptWallets() 
    external 
    view 
    returns (address[] memory)
```

**Description:** List all exempt wallets

**Returns:** `address[]` - Exempt addresses

---

## Admin Functions

### configureAdminWallet

```solidity
function configureAdminWallet(
    address admin,
    uint256 totalAllocation,
    uint256 immediateRelease,
    uint256 lockedAmount
) external onlyOwner
```

**Description:** Admin wallet configuration

**Parameters:**
- `admin`: Admin address
- `totalAllocation`: Total allocation
- `immediateRelease`: Initial release
- `lockedAmount`: Locked amount

**Access:** Owner only

---

### processInitialRelease

```solidity
function processInitialRelease(address admin) 
    external 
    onlyOwner
```

**Description:** Process initial release for admin

**Parameters:**
- `admin`: Admin address

**Access:** Owner only

---

## View Functions

### getFeeStats

```solidity
function getFeeStats() 
    external 
    view 
    returns (
        uint256 _totalFeesCollected,
        uint256 _totalTokensBurned,
        uint256 _totalDonations
    )
```

**Description:** Get fee statistics

**Returns:**
- `_totalFeesCollected`: Total fees collected
- `_totalTokensBurned`: Total tokens burned
- `_totalDonations`: Total donations

---

### getVestingStats

```solidity
function getVestingStats() 
    external 
    view 
    returns (
        uint256 _totalVested,
        uint256 _totalReleased,
        uint256 _totalBurned,
        uint256 _activeSchedules
    )
```

**Description:** Get vesting statistics

**Returns:**
- `_totalVested`: Total vested
- `_totalReleased`: Total released
- `_totalBurned`: Total burned
- `_activeSchedules`: Number of active schedules

---

## Events

### Transfer

```solidity
event Transfer(
    address indexed from,
    address indexed to,
    uint256 value
)
```

**Description:** Token transfer event (ERC20 standard)

---

### UniversalFeeApplied

```solidity
event UniversalFeeApplied(
    address indexed from,
    address indexed to,
    uint256 amount,
    uint256 feeAmount
)
```

**Description:** Emitted when fee is applied

---

### FeeDistributed

```solidity
event FeeDistributed(
    uint256 feeAmount,
    uint256 donationAmount,
    uint256 burnAmount
)
```

**Description:** Emitted when fee is distributed

---

### VestingScheduleCreated

```solidity
event VestingScheduleCreated(
    address indexed beneficiary,
    uint256 amount,
    uint256 cliffDays,
    bool isAdmin
)
```

**Description:** Emitted when new vesting schedule is created

---

### TokensReleased

```solidity
event TokensReleased(
    address indexed beneficiary,
    uint256 releasedAmount,
    uint256 totalReleased
)
```

**Description:** Emitted when tokens are released

---

### FeeExemptionChanged

```solidity
event FeeExemptionChanged(
    address indexed wallet,
    bool exempt
)
```

**Description:** Emitted when fee exemption changes

---

## Errors

### ZeroAddress

```solidity
error ZeroAddress()
```

**Description:** When zero address is used

---

### InvalidAmount

```solidity
error InvalidAmount()
```

**Description:** Invalid amount (0 or negative)

---

### InsufficientUnlockedBalance

```solidity
error InsufficientUnlockedBalance(
    address account,
    uint256 requested,
    uint256 available
)
```

**Description:** Attempting to transfer locked tokens

**Parameters:**
- `account`: Account address
- `requested`: Requested amount
- `available`: Available amount

---

### VestingAlreadyExists

```solidity
error VestingAlreadyExists(address beneficiary)
```

**Description:** Vesting schedule already exists

---

### NoVestingSchedule

```solidity
error NoVestingSchedule(address beneficiary)
```

**Description:** Vesting schedule not found

---

### NoTokensToRelease

```solidity
error NoTokensToRelease(address beneficiary)
```

**Description:** No tokens to release

---

## 📞 Support

**Technical Questions:**
- Email: dev@sylvantoken.org
- Telegram: t.me/sylvantoken

**Contract:**
- BSC Testnet: 0x2016Fd055810ef5e9F7C753c24ae4b2C2B414B9E

---

**Prepared by:** Kiro AI Assistant  
**Date:** November 8, 2025  
**Version:** 1.0
