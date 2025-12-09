# 🔒 Vesting & Lock Mechanism Guide

**Version 2.0 | December 2025**

---

## 📋 Overview

Sylvan Token implements a sophisticated vesting system with proportional burning to ensure long-term commitment and deflationary pressure.

---

## 🏦 Vesting Types

### 1. Locked Reserve Wallet

| Parameter | Value |
|-----------|-------|
| Address | `[LOCKED_RESERVE_ADDRESS]` |
| Total Amount | 300,000,000 SYL |
| Lock Percentage | 100% |
| Initial Release | 0 SYL |
| Cliff Period | 30 days |
| Vesting Duration | 34 months |
| Monthly Release | 3% (9,000,000 SYL) |
| Burn on Release | 10% (900,000 SYL/month) |
| Net to Beneficiary | 90% (8,100,000 SYL/month) |

**Release Function**: `processLockedWalletRelease(address)`

### 2. Admin Wallets (4 wallets)

| Parameter | Value |
|-----------|-------|
| Total Each | 10,000,000 SYL |
| Initial Release | 10% (1,000,000 SYL) |
| Locked Amount | 90% (9,000,000 SYL) |
| Cliff Period | 30 days |
| Vesting Duration | 20 months |
| Monthly Release | 4.5% (450,000 SYL) |
| Burn on Release | 10% (45,000 SYL/month) |
| Net to Beneficiary | 90% (405,000 SYL/month) |

**Admin Wallets:**
| Name | Address |
|------|---------|
| BRK | `[ADMIN_BRK_ADDRESS]` |
| ERH | `[ADMIN_ERH_ADDRESS]` |
| GRK | `[ADMIN_GRK_ADDRESS]` |
| CNK | `[ADMIN_CNK_ADDRESS]` |

**Release Functions**: 
- `processInitialRelease(address)` - Initial 10%
- `processMonthlyRelease(address)` - Monthly releases

### 3. Founder Wallet

| Parameter | Value |
|-----------|-------|
| Address | `[FOUNDER_ADDRESS]` |
| Total Amount | 160,000,000 SYL |
| Initial Release | 20% (32,000,000 SYL) |
| Locked Amount | 80% (128,000,000 SYL) |
| Cliff Period | 30 days |
| Vesting Duration | 16 months |
| Monthly Release | 5% (8,000,000 SYL) |
| Burn on Release | 0% |

---

## 📅 Release Schedule

### Monthly Timeline

| Month | Locked Reserve | Founder | 4 Admins | Total | Burned |
|-------|----------------|---------|----------|-------|--------|
| 0 | 0 | 32M | 4M | 36M | 0 |
| 1 | 9M | 8M | 1.8M | 18.8M | 1.08M |
| 2-16 | 9M/mo | 8M/mo | 1.8M/mo | 18.8M/mo | 1.08M/mo |
| 17-20 | 9M/mo | 0 | 1.8M/mo | 10.8M/mo | 1.08M/mo |
| 21-34 | 9M/mo | 0 | 0 | 9M/mo | 0.9M/mo |

### Total Burns

| Source | Amount |
|--------|--------|
| Admin Vesting (4 wallets) | 3,600,000 SYL |
| Locked Reserve | 30,600,000 SYL |
| **Total Minimum** | **34,200,000 SYL** |

---

## 🔧 How to Process Releases

### Via Safe App

1. Open Safe App at `https://app.safe.global`
2. Navigate to "Vesting Release" tab
3. Select wallet type (Admin or Locked)
4. Click "Process Release"
5. Confirm with 2/3 signers

### Via BSCScan

1. Go to contract Write functions
2. Connect with Safe Wallet
3. Call appropriate function:
   - `processInitialRelease(adminAddress)` - First release
   - `processMonthlyRelease(adminAddress)` - Monthly admin
   - `processLockedWalletRelease(lockedAddress)` - Monthly locked

### Via Script

```bash
npx hardhat run scripts/management/process-vesting-release.js --network bscMainnet
```

---

## 📊 Checking Vesting Status

### Admin Wallet Info

```javascript
const info = await contract.getAdminWalletInfo(adminAddress);
// Returns:
// - allocation: Total allocation
// - releasedAmount: Already released
// - burnedAmount: Already burned
// - remainingAmount: Still locked
// - initialReleaseProcessed: Boolean
// - isConfigured: Boolean
```

### Locked Wallet Info

```javascript
const info = await contract.getLockedWalletInfo(lockedAddress);
// Returns:
// - totalAmount: Total locked
// - releasedAmount: Already released
// - burnedAmount: Already burned
// - remainingAmount: Still locked
// - nextReleaseTime: Unix timestamp
// - monthsElapsed: Months since start
// - monthsRemaining: Months left
// - canRelease: Boolean
```

### Calculate Available Release

```javascript
// For admin wallets
const [available, burn] = await contract.calculateAvailableRelease(adminAddress);

// For locked wallets
const [available, burn] = await contract.calculateReleasableAmount(lockedAddress);
```

---

## ⚠️ Important Notes

### Cliff Period
- All vesting schedules have a 30-day cliff
- No releases possible before cliff ends
- First release available after cliff + 1 month

### Proportional Burning
- 10% of every release is burned
- Burns sent to `0x000...dEaD`
- Reduces circulating supply

### Release Timing
- Releases calculated based on `SECONDS_PER_MONTH` (2,629,746 seconds)
- Approximately 30.44 days per month
- Multiple months can be released at once if missed

### Who Can Release
- Owner (or Safe Wallet after transfer) can process releases
- Anyone can call `releaseVestedTokens()` for any beneficiary

---

## 🔐 Security Considerations

1. **Reentrancy Protection**: All release functions protected
2. **Input Validation**: All addresses and amounts validated
3. **State Updates**: State updated before transfers
4. **Event Logging**: All releases emit events

---

## 📈 Vesting Progress Tracking

### Safe App Dashboard
- Real-time vesting status
- Progress bars for each wallet
- Countdown to next release
- Historical release data

### BSCScan Events
- `TokensReleased` events show all releases
- `InitialReleaseProcessed` for first admin releases
- Filter by wallet address

---

## 🔗 Related Documentation

- [API Reference](./API_REFERENCE.md)
- [Safe Wallet Guide](./MULTISIG_WALLET_SETUP_GUIDE.md)
- [Security Guide](../SECURITY.md)

---

<div align="center">

**Sylvan Token Vesting Guide**

Last Updated: December 2025

</div>
