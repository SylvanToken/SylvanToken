# 📖 Sylvan Token API Reference

**Version 2.0 | December 2025**

---

## 📋 Overview

This document provides complete API reference for the SylvanToken smart contract.

---

## 🔧 Contract Information

| Parameter | Value |
|-----------|-------|
| Contract | SylvanToken |
| Standard | BEP-20 (ERC-20 Compatible) |
| Solidity | 0.8.24 |
| Network | BSC Mainnet |

---

## 📝 Read Functions

### Token Information

#### `name()`
Returns the token name.
```solidity
function name() external view returns (string memory)
// Returns: "Sylvan Token"
```

#### `symbol()`
Returns the token symbol.
```solidity
function symbol() external view returns (string memory)
// Returns: "SYL"
```

#### `decimals()`
Returns the number of decimals.
```solidity
function decimals() external view returns (uint8)
// Returns: 18
```

#### `totalSupply()`
Returns the total token supply.
```solidity
function totalSupply() external view returns (uint256)
// Returns: 1000000000000000000000000000 (1B with 18 decimals)
```

### Balance & Allowance

#### `balanceOf(address)`
Returns the token balance of an account.
```solidity
function balanceOf(address account) external view returns (uint256)
```

#### `allowance(address, address)`
Returns the remaining allowance.
```solidity
function allowance(address owner, address spender) external view returns (uint256)
```

### Ownership

#### `owner()`
Returns the contract owner address.
```solidity
function owner() external view returns (address)
```

### Fee System

#### `isExemptFromFee(address)`
Checks if an address is exempt from fees.
```solidity
function isExemptFromFee(address account) external view returns (bool)
```

#### `feeWallet()`
Returns the fee wallet address.
```solidity
function feeWallet() external view returns (address)
```

#### `donationWallet()`
Returns the donation wallet address.
```solidity
function donationWallet() external view returns (address)
```

### Vesting Information

#### `getVestingInfo(address)`
Returns vesting schedule information for a beneficiary.
```solidity
function getVestingInfo(address beneficiary) external view returns (
    uint256 totalAmount,
    uint256 releasedAmount,
    uint256 burnedAmount,
    uint256 startTime,
    uint256 cliffDuration,
    uint256 vestingDuration,
    uint256 releasePercentage,
    uint256 burnPercentage,
    bool isActive,
    bool isAdmin
)
```

#### `getLockedWalletInfo(address)`
Returns locked wallet vesting information.
```solidity
function getLockedWalletInfo(address lockedWallet) external view returns (
    uint256 totalAmount,
    uint256 releasedAmount,
    uint256 burnedAmount,
    uint256 remainingAmount,
    uint256 nextReleaseTime,
    uint256 monthsElapsed,
    uint256 monthsRemaining,
    bool canRelease
)
```

#### `getAdminWalletInfo(address)`
Returns admin wallet configuration.
```solidity
function getAdminWalletInfo(address admin) external view returns (
    uint256 allocation,
    uint256 releasedAmount,
    uint256 burnedAmount,
    uint256 remainingAmount,
    bool initialReleaseProcessed,
    bool isConfigured
)
```

#### `calculateAvailableRelease(address)`
Calculates available release amount for admin wallet.
```solidity
function calculateAvailableRelease(address admin) external view returns (
    uint256 availableAmount,
    uint256 burnAmount
)
```

#### `calculateReleasableAmount(address)`
Calculates releasable amount for locked wallet.
```solidity
function calculateReleasableAmount(address lockedWallet) external view returns (
    uint256 releasableAmount,
    uint256 burnAmount
)
```

---

## ✍️ Write Functions

### Standard ERC-20

#### `transfer(address, uint256)`
Transfers tokens to a recipient.
```solidity
function transfer(address to, uint256 amount) external returns (bool)
```
**Note**: 1% fee applied unless sender or receiver is exempt.

#### `approve(address, uint256)`
Approves spender to transfer tokens.
```solidity
function approve(address spender, uint256 amount) external returns (bool)
```

#### `transferFrom(address, address, uint256)`
Transfers tokens from one address to another.
```solidity
function transferFrom(address from, address to, uint256 amount) external returns (bool)
```
**Note**: 1% fee applied unless sender or receiver is exempt.

### Owner Functions

#### `addExemptWallet(address)`
Adds an address to fee exemption list.
```solidity
function addExemptWallet(address wallet) external onlyOwner
```

#### `removeExemptWallet(address)`
Removes an address from fee exemption list.
```solidity
function removeExemptWallet(address wallet) external onlyOwner
```

#### `addExemptWalletsBatch(address[])`
Batch adds addresses to fee exemption list.
```solidity
function addExemptWalletsBatch(address[] calldata wallets) external onlyOwner
```

#### `configureAdminWallet(address, uint256)`
Configures an admin wallet with vesting.
```solidity
function configureAdminWallet(address admin, uint256 allocation) external onlyOwner
```
**Parameters:**
- `admin`: Admin wallet address
- `allocation`: Total allocation (e.g., 10M tokens)

#### `processInitialRelease(address)`
Processes initial 10% release for admin wallet.
```solidity
function processInitialRelease(address admin) external onlyOwner returns (uint256 releasedAmount)
```

#### `processMonthlyRelease(address)`
Processes monthly vesting release for admin wallet.
```solidity
function processMonthlyRelease(address admin) external onlyOwner returns (
    uint256 releasedAmount,
    uint256 burnedAmount
)
```

#### `createLockedWalletVesting(address, uint256, uint256)`
Creates vesting schedule for locked wallet.
```solidity
function createLockedWalletVesting(
    address lockedWallet,
    uint256 amount,
    uint256 cliffDays
) external onlyOwner
```

#### `processLockedWalletRelease(address)`
Processes monthly release for locked wallet.
```solidity
function processLockedWalletRelease(address lockedWallet) external onlyOwner returns (
    uint256 releasedAmount,
    uint256 burnedAmount
)
```

#### `releaseVestedTokens(address)`
Releases vested tokens for any beneficiary.
```solidity
function releaseVestedTokens(address beneficiary) external returns (
    uint256 releasedAmount,
    uint256 burnedAmount
)
```

#### `setAMMPair(address, bool)`
Sets or unsets an address as AMM pair.
```solidity
function setAMMPair(address pair, bool status) external onlyOwner
```

#### `transferOwnership(address)`
Transfers contract ownership.
```solidity
function transferOwnership(address newOwner) external onlyOwner
```

---

## 📡 Events

### ERC-20 Events

```solidity
event Transfer(address indexed from, address indexed to, uint256 value);
event Approval(address indexed owner, address indexed spender, uint256 value);
```

### Fee Events

```solidity
event FeeCollected(address indexed from, uint256 feeAmount, uint256 toFeeWallet, uint256 toDonation, uint256 burned);
event WalletExempted(address indexed wallet, bool status);
```

### Vesting Events

```solidity
event AdminWalletConfigured(address indexed admin, uint256 allocation);
event InitialReleaseProcessed(address indexed admin, uint256 amount);
event TokensReleased(address indexed beneficiary, uint256 releasedAmount, uint256 burnedAmount);
event LockedWalletVestingCreated(address indexed wallet, uint256 amount, uint256 cliffDays);
```

### Ownership Events

```solidity
event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
```

---

## ❌ Errors

```solidity
error ZeroAddress();
error InvalidAmount();
error InsufficientBalance();
error NotConfigured();
error AlreadyConfigured();
error CliffNotReached();
error NoTokensToRelease();
error TransferFailed();
```

---

## 📊 Constants

| Constant | Value | Description |
|----------|-------|-------------|
| `TAX_RATE` | 100 | 1% (basis points) |
| `FEE_WALLET_SHARE` | 5000 | 50% (basis points) |
| `DONATION_SHARE` | 2500 | 25% (basis points) |
| `BURN_SHARE` | 2500 | 25% (basis points) |
| `ADMIN_IMMEDIATE_RELEASE` | 1000 | 10% (basis points) |
| `ADMIN_MONTHLY_RELEASE` | 450 | 4.5% (basis points) |
| `LOCKED_MONTHLY_RELEASE` | 300 | 3% (basis points) |
| `VESTING_BURN_RATE` | 1000 | 10% (basis points) |
| `SECONDS_PER_MONTH` | 2629746 | ~30.44 days |

---

## 🔗 Related Documentation

- [Vesting Guide](./VESTING_LOCK_GUIDE.md)
- [Security Guide](../SECURITY.md)
- [Safe Wallet Guide](./MULTISIG_WALLET_SETUP_GUIDE.md)

---

<div align="center">

**Sylvan Token API Reference**

Last Updated: December 2025

</div>
