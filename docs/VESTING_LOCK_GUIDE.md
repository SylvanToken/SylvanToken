# 🔒 Vesting Lock Mechanism - Usage Guide

**Version:** 1.0  
**Date:** November 8, 2025  
**Contract:** SylvanToken

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [How It Works](#how-it-works)
3. [Usage Examples](#usage-examples)
4. [Security](#security)
5. [Frequently Asked Questions](#frequently-asked-questions)
6. [Troubleshooting](#troubleshooting)

---

## Overview

### What is Vesting Lock?

Vesting lock is a mechanism that allows token holders to lock a certain amount of their tokens for a specific period. This is used to control token distribution and prevent sudden sell-offs.

### Key Features

- ✅ **Automatic Protection:** Locked tokens cannot be transferred automatically
- ✅ **Gradual Release:** Tokens are released in specific periods
- ✅ **Transparent:** All vesting information is visible on the blockchain
- ✅ **Secure:** Protected against attack vectors

---

## How It Works

### 1. Creating Vesting Schedule

```solidity
function createVestingSchedule(
    address beneficiary,      // Token recipient
    uint256 amount,          // Amount to be locked
    uint256 cliffDays,       // Initial waiting period (days)
    uint256 vestingMonths,   // Total vesting duration (months)
    uint256 releasePercentage, // Monthly release percentage (basis points)
    uint256 burnPercentage,  // Burn percentage (basis points)
    bool isAdmin             // Is admin wallet?
) external onlyOwner
```

**Example:**
```javascript
// 10M tokens, 30 days cliff, 16 months vesting, 5% monthly release
await token.createVestingSchedule(
    "0xUserAddress",
    ethers.utils.parseEther("10000000"),
    30,    // 30 days cliff
    16,    // 16 months
    500,   // 5% (500 basis points)
    0,     // No burn
    true   // Admin wallet
);
```

### 2. Available Balance Calculation

```
Available Balance = Total Balance - Locked Amount

Locked Amount = Total Vested - Released Amount
```

**Example:**
```
Total Balance:     10,000,000 SYL
Vested Amount:      8,000,000 SYL
Released Amount:            0 SYL
─────────────────────────────────
Locked Amount:      8,000,000 SYL
Available Balance:  2,000,000 SYL ✅ Transferable
```

### 3. Transfer Control

On each transfer:

1. **Does vesting schedule exist?** → Check
2. **If yes:**
   - Get current balance
   - Calculate locked amount
   - Calculate available balance
   - Transfer amount > available? → **ERROR**
3. **If no:** → Normal transfer

```solidity
// In _transfer function
if (vestingSchedules[from].isActive) {
    uint256 currentBalance = balanceOf(from);
    uint256 lockedAmount = vestingSchedules[from].totalAmount 
                         - vestingSchedules[from].releasedAmount;
    uint256 availableBalance = currentBalance > lockedAmount 
                              ? currentBalance - lockedAmount 
                              : 0;
    
    if (amount > availableBalance) {
        revert InsufficientUnlockedBalance(from, amount, availableBalance);
    }
}
```

### 4. Vesting Release

```javascript
// After cliff period passes
await token.releaseVestedTokens("0xBeneficiaryAddress");
```

**Release Calculation:**
```
Monthly Release = Total Vested × Release Percentage
Burn Amount = Monthly Release × Burn Percentage
Net Release = Monthly Release - Burn Amount
```

---

## Usage Examples

### Example 1: Admin Wallet (80% Locked)

```javascript
// Setup
const totalAmount = ethers.utils.parseEther("10000000"); // 10M
const lockedAmount = ethers.utils.parseEther("8000000");  // 8M (80%)

// Transfer tokens
await token.transfer(adminAddress, totalAmount);

// Create vesting
await token.createVestingSchedule(
    adminAddress,
    lockedAmount,
    30,   // 30 days cliff
    16,   // 16 months
    500,  // 5% monthly
    0,    // No burn
    true  // Admin
);

// Initial state
// Available: 2M SYL ✅
// Locked: 8M SYL ❌

// Transfer attempts
await token.connect(admin).transfer(user, ethers.utils.parseEther("2000000")); // ✅ Success
await token.connect(admin).transfer(user, ethers.utils.parseEther("3000000")); // ❌ Error!
```

### Example 2: Locked Reserve (100% Locked, 10% Burn)

```javascript
// Setup
const totalAmount = ethers.utils.parseEther("300000000"); // 300M

// Transfer tokens
await token.transfer(lockedAddress, totalAmount);

// Create vesting
await token.createVestingSchedule(
    lockedAddress,
    totalAmount,
    30,    // 30 days cliff
    34,    // 34 months
    300,   // 3% monthly
    1000,  // 10% burn
    false  // Not admin
);

// Initial state
// Available: 0 SYL
// Locked: 300M SYL ❌

// Transfer attempt
await token.connect(locked).transfer(user, 1); // ❌ Error!

// Release after 1 month
await time.increase(32 * 24 * 60 * 60);
await token.releaseVestedTokens(lockedAddress);

// After release
// Monthly Release: 9M SYL (300M × 3%)
// Burn: 900K SYL (9M × 10%)
// Net Release: 8.1M SYL
// Available: 8.1M SYL ✅
```

### Example 3: Available Increase with Token Receipt

```javascript
// Initial
// Balance: 10M SYL
// Locked: 8M SYL
// Available: 2M SYL

// New tokens received
await token.transfer(userAddress, ethers.utils.parseEther("5000000"));

// New state
// Balance: 15M SYL
// Locked: 8M SYL (unchanged)
// Available: 7M SYL ✅ (increased!)

// Now 7M can be transferred
await token.connect(user).transfer(recipient, ethers.utils.parseEther("7000000")); // ✅
```

---

## Security

### Protected Attack Vectors

#### 1. ✅ Direct Transfer Bypass
```javascript
// ❌ Won't work
await token.connect(user).transfer(recipient, lockedAmount);
// Error: InsufficientUnlockedBalance
```

#### 2. ✅ Approve/TransferFrom Bypass
```javascript
// ❌ Won't work
await token.connect(user).approve(attacker, lockedAmount);
await token.connect(attacker).transferFrom(user, attacker, lockedAmount);
// Error: InsufficientUnlockedBalance
```

#### 3. ✅ Self-Transfer Bypass
```javascript
// ❌ Won't work
await token.connect(user).transfer(user, lockedAmount);
// Error: InsufficientUnlockedBalance
```

#### 4. ✅ Multiple Small Transfer Bypass
```javascript
// ❌ Won't work
await token.connect(user).transfer(recipient, availableAmount / 2); // ✅
await token.connect(user).transfer(recipient, availableAmount / 2); // ✅
await token.connect(user).transfer(recipient, 1); // ❌ Error!
```

### Security Features

- **Automatic Check:** Automatic lock check on every transfer
- **Bypass Protection:** All transfer methods are protected
- **Transparency:** All vesting information is visible
- **Immutable Lock:** Locked tokens cannot be changed

---

## Frequently Asked Questions

### Q: How can I see my locked tokens?

```javascript
const vestingInfo = await token.getVestingInfo(myAddress);
console.log("Total Vested:", ethers.utils.formatEther(vestingInfo.totalAmount));
console.log("Released:", ethers.utils.formatEther(vestingInfo.releasedAmount));

const locked = vestingInfo.totalAmount.sub(vestingInfo.releasedAmount);
console.log("Locked:", ethers.utils.formatEther(locked));
```

### Q: How do I calculate my available balance?

```javascript
const balance = await token.balanceOf(myAddress);
const vestingInfo = await token.getVestingInfo(myAddress);
const locked = vestingInfo.totalAmount.sub(vestingInfo.releasedAmount);
const available = balance.sub(locked);

console.log("Available:", ethers.utils.formatEther(available));
```

### Q: When can I release tokens?

```javascript
const vestingInfo = await token.getVestingInfo(myAddress);
const cliffEnd = vestingInfo.startTime.add(vestingInfo.cliffDuration);
const now = Math.floor(Date.now() / 1000);

if (now < cliffEnd) {
    const waitTime = cliffEnd - now;
    console.log(`Wait ${waitTime} seconds (${waitTime / 86400} days)`);
} else {
    console.log("You can release now!");
    await token.releaseVestedTokens(myAddress);
}
```

### Q: Can I cancel my vesting schedule?

No. Once a vesting schedule is created, it cannot be cancelled. This is designed for security and transparency.

### Q: Does my available balance increase when I receive new tokens?

Yes! New incoming tokens are not locked, only tokens in the vesting schedule are locked.

```
Example:
- Locked: 8M SYL
- Balance: 10M SYL → Available: 2M SYL
- +5M new tokens received
- Balance: 15M SYL → Available: 7M SYL ✅
```

---

## Troubleshooting

### Error: InsufficientUnlockedBalance

**Reason:** Transfer amount exceeds available balance.

**Solution:**
```javascript
// Check available balance
const balance = await token.balanceOf(myAddress);
const vestingInfo = await token.getVestingInfo(myAddress);
const locked = vestingInfo.totalAmount.sub(vestingInfo.releasedAmount);
const available = balance.sub(locked);

console.log("You can transfer:", ethers.utils.formatEther(available));

// Transfer only available amount
await token.transfer(recipient, available);
```

### Error: NoTokensToRelease

**Reason:** Cliff period hasn't passed yet or no tokens to release.

**Solution:**
```javascript
const vestingInfo = await token.getVestingInfo(myAddress);
const now = Math.floor(Date.now() / 1000);
const cliffEnd = vestingInfo.startTime.add(vestingInfo.cliffDuration).toNumber();

if (now < cliffEnd) {
    console.log("Cliff period not passed yet");
    console.log(`Wait ${(cliffEnd - now) / 86400} more days`);
} else {
    console.log("Check if you already released all tokens");
}
```

### Wei Level Precision

**Issue:** Very small amounts may have 1 wei difference.

**Solution:**
```javascript
// Transfer slightly less than full available
const available = balance.sub(locked);
const safeAmount = available.sub(ethers.utils.parseEther("0.000000000000000001"));
await token.transfer(recipient, safeAmount);
```

---

## API Reference

### Creating Vesting Schedule

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

### Getting Vesting Information

```solidity
function getVestingInfo(address beneficiary) 
    external 
    view 
    returns (VestingSchedule memory)
```

### Token Release

```solidity
function releaseVestedTokens(address beneficiary) external
```

### Vesting Statistics

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

---

## Examples

### Hardhat Console

```javascript
// Connect to contract
const token = await ethers.getContractAt("SylvanToken", "0xContractAddress");

// Check vesting info
const info = await token.getVestingInfo("0xMyAddress");
console.log("Total:", ethers.utils.formatEther(info.totalAmount));
console.log("Released:", ethers.utils.formatEther(info.releasedAmount));

// Calculate available
const balance = await token.balanceOf("0xMyAddress");
const locked = info.totalAmount.sub(info.releasedAmount);
const available = balance.sub(locked);
console.log("Available:", ethers.utils.formatEther(available));

// Transfer available
await token.transfer("0xRecipient", available);

// Release vested tokens (after cliff)
await token.releaseVestedTokens("0xMyAddress");
```

### Web3.js

```javascript
const web3 = new Web3(window.ethereum);
const token = new web3.eth.Contract(ABI, contractAddress);

// Get vesting info
const info = await token.methods.getVestingInfo(myAddress).call();
console.log("Locked:", web3.utils.fromWei(
    (info.totalAmount - info.releasedAmount).toString()
));

// Transfer
await token.methods.transfer(recipient, amount).send({ from: myAddress });
```

---

## Support

**Technical Questions:**
- Email: dev@sylvantoken.org
- Telegram: t.me/sylvantoken
- GitHub: github.com/sylvantoken

**Contract:**
- BSC Testnet: 0x2016Fd055810ef5e9F7C753c24ae4b2C2B414B9E
- BSCScan: https://testnet.bscscan.com/address/0x2016Fd055810ef5e9F7C753c24ae4b2C2B414B9E

---

**Document Version:** 1.0  
**Last Updated:** November 8, 2025  
**Prepared by:** Kiro AI Assistant
