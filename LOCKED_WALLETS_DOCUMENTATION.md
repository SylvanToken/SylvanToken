# 🔒 Sylvan Token - Locked Wallets Documentation (Current)

**Project:** Sylvan Token (SYL)  
**Updated:** November 2025  
**Status:** Active  
**Version:** 2.0 (New Structure)

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Locked Reserve Wallet](#locked-reserve-wallet)
3. [Founder Wallet](#founder-wallet)
4. [Admin Wallets](#admin-wallets)
5. [Vesting Mechanism](#vesting-mechanism)
6. [Burn Mechanism](#burn-mechanism)
7. [Timeline](#timeline)

---

## 🎯 Overview

Sylvan Token project has **6 locked wallets**:

### Locked Wallet Summary

| Wallet | Amount | Initial Release | Locked | Monthly Release | Burn | Status |
|--------|--------|-----------------|--------|-----------------|------|--------|
| **Locked Reserve** | 300M SYL | 0 | 100% (300M) | 3% (9M) | ✅ 10% | 🔒 Active |
| **Founder Wallet** | 160M SYL | 20% (32M) | 80% (128M) | 5% (8M) | ❌ No | 🔒 Active |
| **MAD Admin** | 10M SYL | 20% (2M) | 80% (8M) | 5% (500K) | ❌ No | 🔒 Active |
| **LEB Admin** | 10M SYL | 20% (2M) | 80% (8M) | 5% (500K) | ❌ No | 🔒 Active |
| **CNK Admin** | 10M SYL | 20% (2M) | 80% (8M) | 5% (500K) | ❌ No | 🔒 Active |
| **KDR Admin** | 10M SYL | 20% (2M) | 80% (8M) | 5% (500K) | ❌ No | 🔒 Active |
| **TOTAL** | **500M SYL** | **40M** | **460M** | **27M/month** | **900K/month** | **50%** |

### Important Changes

**New Structure:**
- ✅ Founder Wallet added (160M SYL)
- ✅ Admin wallets 80% locked (20% initial release)
- ✅ Founder wallet 80% locked (20% initial release)
- ✅ Locked Reserve 100% locked (no initial release)
- ✅ Only Locked Reserve has burn (10%)

---

## 🏦 Locked Reserve Wallet

### Basic Information

**Wallet Address:** `0xE56ab5861f2B1C8dC185ecF8881242256CdB4c17`

**Features:**
- 💰 **Total Amount:** 300,000,000 SYL (30% of Total Supply)
- 🔒 **Lock Percentage:** 100% (Fully locked)
- 💎 **Initial Release:** 0 SYL (No initial release)
- ⏱️ **Vesting Duration:** 34 months
- 📅 **Cliff Period:** 30 days
- 📊 **Monthly Release:** 3% (9,000,000 SYL)
- 🔥 **Burn Rate:** 10% (On each release)
- 💎 **To Beneficiary:** 90% (On each release)

### Vesting Details

#### Monthly Release Structure
```
Each Month Release: 9,000,000 SYL
├─ Burned: 900,000 SYL (10%) → 0x000...dEaD
└─ Beneficiary: 8,100,000 SYL (90%) → Transfer
```

#### Monthly Release Table

| Month | Release | Burned | Beneficiary | Remaining Locked |
|-------|---------|--------|-------------|------------------|
| 1 | 9,000,000 | 900,000 | 8,100,000 | 291,000,000 |
| 6 | 9,000,000 | 900,000 | 8,100,000 | 246,000,000 |
| 12 | 9,000,000 | 900,000 | 8,100,000 | 192,000,000 |
| 24 | 9,000,000 | 900,000 | 8,100,000 | 84,000,000 |
| 34 | 9,000,000 | 900,000 | 8,100,000 | 0 |

#### Total Distribution (34 Months)

```
Start: 300,000,000 SYL (100% locked)

34 Month Release:
├─ Total Release: 306,000,000 SYL (34 × 9M)
├─ Total Burned: 30,600,000 SYL (10%)
└─ To Beneficiary: 275,400,000 SYL (90%)

🔥 Deflationary Effect: 30.6M SYL permanently burned
```

---

## 👔 Founder Wallet

### Basic Information

**Wallet Address:** `0x1109B6aDB60dB170139f00bA2490fCA0F8BE7A8C`

**Features:**
- 💰 **Total Amount:** 160,000,000 SYL (16% of Total Supply)
- 🔒 **Lock Percentage:** 80% (128,000,000 SYL)
- 💎 **Initial Release:** 20% (32,000,000 SYL - Immediate)
- ⏱️ **Vesting Duration:** 16 months
- 📅 **Cliff Period:** 30 days
- 📊 **Monthly Release:** 5% (8,000,000 SYL)
- 🔥 **Burn Rate:** 0% (No burn)
- 💳 **Transaction Fee:** ✅ Exempt (Fee exempt)

### Vesting Details

#### Initial State (Deployment)
```
At Deployment:
├─ Initial Release: 32,000,000 SYL (20%)
└─ Locked: 128,000,000 SYL (80%)
```

#### Monthly Release Table

| Month | Release | Remaining Locked | Total Received | Percentage |
|-------|---------|------------------|----------------|------------|
| 0 | 32,000,000 | 128,000,000 | 32,000,000 | 20% |
| 1 | 8,000,000 | 120,000,000 | 40,000,000 | 25% |
| 6 | 8,000,000 | 80,000,000 | 80,000,000 | 50% |
| 12 | 8,000,000 | 32,000,000 | 128,000,000 | 80% |
| 16 | 8,000,000 | 0 | 160,000,000 | 100% |

#### Total Distribution (16 Months)

```
Start: 160,000,000 SYL
├─ Initial Release: 32,000,000 SYL (20%)
├─ 16 Month Release: 128,000,000 SYL (80%)
└─ Burn: 0 SYL

✅ All tokens go to founder, no burn
```

---

## 👥 Admin Wallets

### General Information

**4 Admin Wallets:** MAD, LEB, CNK, KDR

**Common Features:**
- 💰 **Each:** 10,000,000 SYL
- 💰 **Total:** 40,000,000 SYL (4% of Total Supply)
- 🔒 **Lock Percentage:** 80% (8,000,000 SYL)
- 💎 **Initial Release:** 20% (2,000,000 SYL - Immediate)
- ⏱️ **Vesting Duration:** 16 months
- 📅 **Cliff Period:** 30 days
- 📊 **Monthly Release:** 5% (500,000 SYL)
- 🔥 **Burn Rate:** 0% (No burn)
- 💳 **Transaction Fee:** ✅ Fee charged

### 1. MAD Admin Wallet

**Wallet Address:** `0xC4FB112cF0Ee27b33F112A9e3c20F8090a246902`

#### Vesting Table

| Month | Release | Remaining Locked | Total Received |
|-------|---------|------------------|----------------|
| 0 | 2,000,000 | 8,000,000 | 2,000,000 |
| 1 | 500,000 | 7,500,000 | 2,500,000 |
| 6 | 500,000 | 5,000,000 | 5,000,000 |
| 12 | 500,000 | 2,000,000 | 8,000,000 |
| 16 | 500,000 | 0 | 10,000,000 |

### 2. LEB Admin Wallet

**Wallet Address:** `0x9063f65823EE4343c014Ef048B0d916b1bD99108`

**Vesting:** Same structure as MAD

### 3. CNK Admin Wallet

**Wallet Address:** `0x591Ec181Db349615b1b2d41BA39a49E43209d890`

**Vesting:** Same structure as MAD

### 4. KDR Admin Wallet

**Wallet Address:** `0xf9Ea1726Df5cBbbecC1812754C96de8Fd246351c`

**Vesting:** Same structure as MAD

### Admin Wallets Total

```
4 Admin Wallets:
├─ Total Amount: 40,000,000 SYL
├─ Initial Release (Total): 8,000,000 SYL (20%)
├─ Locked (Total): 32,000,000 SYL (80%)
├─ Monthly Release (Total): 2,000,000 SYL
├─ Vesting Duration: 16 months
└─ Burn: 0 SYL

✅ All tokens go to admins, no burn
```

---

## ⚙️ Vesting Mechanism

### At Deployment (Month 0)

```
Total Locked: 500,000,000 SYL

Initial Release (Immediate):
├─ Founder: 32,000,000 SYL (20%)
├─ MAD: 2,000,000 SYL (20%)
├─ LEB: 2,000,000 SYL (20%)
├─ CNK: 2,000,000 SYL (20%)
├─ KDR: 2,000,000 SYL (20%)
├─ Locked Reserve: 0 SYL (0%)
└─ Total Initial Release: 40,000,000 SYL

Remaining Locked:
├─ Founder: 128,000,000 SYL
├─ Admins: 32,000,000 SYL
├─ Locked Reserve: 300,000,000 SYL
└─ Total Locked: 460,000,000 SYL
```

### Cliff Period (First 30 Days)

```
Day 1-30: Waiting Period
├─ No monthly releases
├─ Only initial 20% releases active
└─ All locked tokens waiting
```

### Monthly Release (From Day 31)

```
Each Month Release:
├─ Locked Reserve: 9,000,000 SYL
│  ├─ Burned: 900,000 SYL (10%)
│  └─ Beneficiary: 8,100,000 SYL (90%)
│
├─ Founder: 8,000,000 SYL
│  └─ No burn, all to founder
│
└─ Each Admin: 500,000 SYL
   └─ No burn, all to admin

Total Monthly Release: 27,000,000 SYL
Total Monthly Burn: 900,000 SYL
```

---

## 🔥 Burn Mechanism

### Only Locked Reserve Has Burn

#### Proportional Burning

```
Each Monthly Release: 9,000,000 SYL
├─ Burned: 900,000 SYL (10%) → 0x000...dEaD
└─ Beneficiary: 8,100,000 SYL (90%) → Transfer
```

#### Total Burn (34 Months)

```
34 Months × 900,000 SYL = 30,600,000 SYL

Deflationary Effect:
├─ Starting Supply: 1,000,000,000 SYL
├─ Locked Reserve Burn: 30,600,000 SYL
├─ Transaction Fee Burn: ~20,000,000 SYL (estimated, 5 years)
└─ Total Burned: ~50,600,000 SYL

📉 Supply Reduction: ~5% (over 5+ years)
```

### No Burn in Founder and Admin Wallets

```
Founder Wallet:
├─ Total Release: 160,000,000 SYL
├─ Burned: 0 SYL
└─ To Founder: 160,000,000 SYL (100%)

Admin Wallets (4 total):
├─ Total Release: 40,000,000 SYL
├─ Burned: 0 SYL
└─ To Admins: 40,000,000 SYL (100%)

✅ Burn only applies to Locked Reserve
```

---

## 📅 Timeline

### Month 0 (Deployment)

```
✅ Contract Deployed
✅ Vesting Schedule Created

Initial Release (Immediate):
├─ Founder: 32M SYL
├─ MAD: 2M SYL
├─ LEB: 2M SYL
├─ CNK: 2M SYL
├─ KDR: 2M SYL
└─ Total: 40M SYL

Remaining Locked: 460M SYL
```

### Month 1 (First Monthly Release)

```
⏳ Cliff Period Ended (30 days)

First Monthly Release:
├─ Locked Reserve: 9M SYL (900K burned)
├─ Founder: 8M SYL
├─ Admins: 2M SYL (4 × 500K)
└─ Total: 19M SYL (900K burned)

Remaining Locked: 433M SYL
```

### Month 6

```
6th Monthly Release:
├─ Locked Reserve: 9M SYL (900K burned)
├─ Founder: 8M SYL
├─ Admins: 2M SYL
└─ Total: 19M SYL (900K burned)

Total Release (6 months):
├─ Initial + 6 Monthly: 154M SYL
├─ Total Burned: 5.4M SYL
└─ Remaining Locked: 306M SYL
```

### Month 12

```
12th Monthly Release:
├─ Locked Reserve: 9M SYL (900K burned)
├─ Founder: 8M SYL
├─ Admins: 2M SYL
└─ Total: 19M SYL (900K burned)

Total Release (12 months):
├─ Initial + 12 Monthly: 268M SYL
├─ Total Burned: 10.8M SYL
└─ Remaining Locked: 192M SYL
```

### Month 16 (Founder & Admin Vesting Complete)

```
✅ Founder and Admin Vesting Completed

Founder:
├─ Total Received: 160M SYL
└─ Status: All tokens unlocked

Admins (4 total):
├─ Total Received: 40M SYL
└─ Status: All tokens unlocked

⏳ Locked Reserve Continuing:
├─ Remaining Time: 18 months
├─ Remaining Locked: 138M SYL
```

### Month 34 (All Vesting Complete)

```
✅ Locked Reserve Vesting Completed

Locked Reserve:
├─ Total Release: 306M SYL
├─ Burned: 30.6M SYL
├─ Beneficiary: 275.4M SYL
└─ Status: All vesting completed

🎉 All Locked Wallets Unlocked
📊 Total Burned: 30.6M SYL
```

---

## 📊 Summary Tables

### All Wallets Comparison

| Feature | Locked Reserve | Founder | Admin (Each) |
|---------|----------------|---------|--------------|
| **Total Amount** | 300M SYL | 160M SYL | 10M SYL |
| **Initial Release** | 0 (0%) | 32M (20%) | 2M (20%) |
| **Locked** | 300M (100%) | 128M (80%) | 8M (80%) |
| **Vesting Duration** | 34 months | 16 months | 16 months |
| **Monthly Release** | 9M (3%) | 8M (5%) | 500K (5%) |
| **Burn** | ✅ 10% | ❌ No | ❌ No |
| **Transaction Fee** | Exempt | Exempt | Charged |

### Monthly Release Summary

| Month | Locked Reserve | Founder | 4 Admins | Total | Burned |
|-------|----------------|---------|----------|-------|--------|
| 0 | 0 | 32M | 8M | 40M | 0 |
| 1 | 9M | 8M | 2M | 19M | 900K |
| 6 | 9M | 8M | 2M | 19M | 900K |
| 12 | 9M | 8M | 2M | 19M | 900K |
| 16 | 9M | 8M | 2M | 19M | 900K |
| 17+ | 9M | 0 | 0 | 9M | 900K |
| 34 | 9M | 0 | 0 | 9M | 900K |

### Total Distribution (After All Vesting)

```
Starting Locked: 500,000,000 SYL

Distribution:
├─ Founder: 160,000,000 SYL (100%)
├─ Admins: 40,000,000 SYL (100%)
├─ Locked Reserve Beneficiary: 275,400,000 SYL (90%)
├─ Total Distributed: 475,400,000 SYL
└─ Total Burned: 30,600,000 SYL (10%)

Deflationary Effect: 6.1% (30.6M / 500M)
```

---

## 🔐 Security Features

### 1. Reentrancy Protection
- ✅ ReentrancyGuard used
- ✅ All release functions protected

### 2. Access Control
- ✅ Only owner can create vesting schedules
- ✅ Beneficiary can only release own tokens

### 3. Cliff Period
- ✅ Early withdrawal prevented
- ✅ 30 days waiting mandatory

### 4. Proportional Burning
- ✅ Only active in Locked Reserve
- ✅ Automatic burning
- ✅ Irreversible

---

## 📝 Important Notes

### New Structure Features

✅ **Founder Wallet Added:**
- 160M SYL (16% of supply)
- 20% initial release (32M)
- 80% locked (128M)
- 16 months vesting
- No burn

✅ **Admin Wallets Updated:**
- Each 10M SYL
- 20% initial release (2M)
- 80% locked (8M)
- 16 months vesting
- No burn

✅ **Locked Reserve:**
- 300M SYL
- 100% locked (no initial release)
- 34 months vesting
- 10% burn (only this wallet)

### Frequently Asked Questions

**Q: Why no burn in founder and admin wallets?**
A: In the new structure, burn only applies to Locked Reserve. Founder and admin tokens go fully to their owners.

**Q: Why 20% initial release?**
A: 20% initial release allows founders and admins to use immediately. Remaining 80% unlocks monthly at 5% over 16 months.

**Q: Why is Locked Reserve 100% locked?**
A: Locked Reserve is long-term reserve, so no initial release. It's fully locked and unlocks monthly at 3% over 34 months.

---

**Document Version:** 2.0 (New Structure)  
**Last Updated:** November 2025  
**Status:** ✅ Active and Current
