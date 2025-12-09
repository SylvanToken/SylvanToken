# 📊 SYLVAN TOKEN - COMPREHENSIVE WALLET & DISTRIBUTION REPORT

**Contract Address:** `0xc66404C3fa3E01378027b4A4411812D3a8D458F5`  
**Network:** BSC Mainnet (Chain ID: 56)  
**Total Supply:** 1,000,000,000 SYL  
**Report Date:** December 8, 2025

---

## 1. CONTRACT OWNERSHIP

| Role | Address | Description |
|------|---------|-------------|
| **Contract Owner** | `0x465b54282e4885f61df7eB7CcDc2493DB35C9501` | Full administrative control over contract |
| **Deployer** | `0xf949f50B3C32bD4cDa7D2192ff8f51dd9db4A469` | Deployed the contract, no admin privileges after deployment |

### Owner Privileges
- Manage fee exemptions (add/remove/bulk)
- Create and manage vesting schedules
- Configure admin wallets
- Process token releases (initial and monthly)
- Set/unset AMM pairs
- Transfer ownership to new address

### Removed Privileges (Security Enhancement)
- ❌ Pause token transfers - **REMOVED**
- ❌ Unpause token transfers - **REMOVED**

---

## 2. TOKEN DISTRIBUTION OVERVIEW

| Category | Amount | Percentage | Status |
|----------|--------|------------|--------|
| Sylvan Token Wallet | 500,000,000 SYL | 50% | ✅ Active |
| Locked Reserve | 300,000,000 SYL | 30% | 🔒 Locked |
| Founder Wallet | 160,000,000 SYL | 16% | 🔒 Partially Locked |
| Admin Wallets (4x) | 40,000,000 SYL | 4% | 🔒 Partially Locked |
| **TOTAL** | **1,000,000,000 SYL** | **100%** | - |

---

## 3. SYSTEM WALLETS (Core Infrastructure)

| Wallet | Address | Amount | Fee Status | Role |
|--------|---------|--------|------------|------|
| **Sylvan Token Wallet** | `0xf949f50B3C32bD4cDa7D2192ff8f51dd9db4A469` | 500M SYL | ❌ NOT Exempt | Main Operations |
| **Founder Wallet** | `0x465b54282e4885f61df7eB7CcDc2493DB35C9501` | 160M SYL | ❌ NOT Exempt | Strategic Operations |
| **Locked Token Wallet** | `0x687A2c7E494c3818c20AD2856d453514970d6aac` | 300M SYL | ❌ NOT Exempt | 34-month vesting |
| **Fee Collection Wallet** | `0x46a4AF3bdAD67d3855Af42Ba0BBe9248b54F7915` | - | ✅ EXEMPT | Receives 50% of fees |
| **Donation Wallet** | `0xa697645Fdfa5d9399eD18A6575256F81343D4e17` | - | ✅ EXEMPT | Receives 25% of fees |
| **Burn Address** | `0x000000000000000000000000000000000000dEaD` | - | ✅ EXEMPT | Receives 25% of fees |

---

## 4. ADMIN WALLETS (User Wallets with Vesting)

| Name | Address | Allocation | Fee Status | Admin Privileges |
|------|---------|------------|------------|------------------|
| **BRK** | `0x1109B6aDB60dB170139f00bA2490fCA0F8BE7A8C` | 10,000,000 SYL | ❌ NOT Exempt | ❌ None |
| **ERH** | `0xe64660026a1aaDaea2ac6032b6B59f8714a08E34` | 10,000,000 SYL | ❌ NOT Exempt | ❌ None |
| **GRK** | `0xd1cc4222b7b62fb623884371337ae04cf44b93a7` | 10,000,000 SYL | ❌ NOT Exempt | ❌ None |
| **CNK** | `0x106A637D825e562168678b7fd0f75cFf2cF2845B` | 10,000,000 SYL | ❌ NOT Exempt | ❌ None |

**Important:** These wallets have NO admin privileges. They are standard user wallets with vesting schedules.

---

## 5. VESTING SCHEDULES & LOCK DETAILS

### 5.1 Locked Reserve Wallet

| Parameter | Value |
|-----------|-------|
| **Wallet Address** | `0x687A2c7E494c3818c20AD2856d453514970d6aac` |
| **Total Amount** | 300,000,000 SYL |
| **Lock Percentage** | 100% (Fully Locked) |
| **Initial Release** | 0 SYL (No immediate release) |
| **Cliff Period** | 30 days |
| **Vesting Duration** | 34 months |
| **Monthly Release** | 3% (9,000,000 SYL) |
| **Burn on Release** | 10% (900,000 SYL/month) |
| **To Beneficiary** | 90% (8,100,000 SYL/month) |

### 5.2 Founder Wallet

| Parameter | Value |
|-----------|-------|
| **Wallet Address** | `0x465b54282e4885f61df7eB7CcDc2493DB35C9501` |
| **Total Amount** | 160,000,000 SYL |
| **Lock Percentage** | 80% (128,000,000 SYL) |
| **Initial Release** | 20% (32,000,000 SYL) |
| **Cliff Period** | 30 days |
| **Vesting Duration** | 16 months |
| **Monthly Release** | 5% (8,000,000 SYL) |
| **Burn on Release** | 0% (No burn) |

### 5.3 Admin Wallets (Each of 4 Wallets)

| Parameter | Value |
|-----------|-------|
| **Total Amount (Each)** | 10,000,000 SYL |
| **Lock Percentage** | 80% (8,000,000 SYL) |
| **Initial Release** | 20% (2,000,000 SYL) |
| **Cliff Period** | 30 days |
| **Vesting Duration** | 16 months |
| **Monthly Release** | 5% (500,000 SYL) |
| **Burn on Release** | 0% (No burn) |

---

## 6. FEE STRUCTURE

| Parameter | Value |
|-----------|-------|
| **Transaction Fee** | 1% (100 basis points) |
| **Fee to Operations** | 50% (0.5% of transaction) |
| **Fee to Donation** | 25% (0.25% of transaction) |
| **Fee Burned** | 25% (0.25% of transaction) |

---

## 7. FEE EXEMPTION STATUS

### ✅ EXEMPT Wallets (Technical Requirement Only - 3 Total)

| Wallet | Address | Reason |
|--------|---------|--------|
| Fee Collection Wallet | `0x46a4AF3bdAD67d3855Af42Ba0BBe9248b54F7915` | Prevents circular fee collection |
| Donation Wallet | `0xa697645Fdfa5d9399eD18A6575256F81343D4e17` | Prevents circular fee collection |
| Burn Address | `0x000000000000000000000000000000000000dEaD` | Prevents circular fee collection |

### ❌ NOT EXEMPT Wallets (Standard 1% Fee Applies)

- Sylvan Token Wallet
- Founder Wallet (Contract Owner)
- Locked Token Wallet
- All Admin Wallets (BRK, ERH, GRK, CNK)
- All DEX/Exchange Wallets
- All Partnership Wallets
- All Other Wallets

---

## 8. OWNER CAPABILITIES (Smart Contract Functions)

| # | Privilege | Function | Status |
|---|-----------|----------|--------|
| 1 | Exempt wallets from fees | `addExemptWallet()` | ✅ Active |
| 2 | Remove fee exemptions | `removeExemptWallet()` | ✅ Active |
| 3 | Bulk manage exemptions | `addExemptWalletsBatch()` | ✅ Active |
| 4 | Load exemptions from config | `loadExemptionsFromConfig()` | ✅ Active |
| 5 | Create vesting schedule | `createVestingSchedule()` | ✅ Active |
| 6 | Configure admin wallet | `configureAdminWallet()` | ✅ Active |
| 7 | Process initial 10% release | `processInitialRelease()` | ✅ Active |
| 8 | Process monthly admin release | `processMonthlyRelease()` | ✅ Active |
| 9 | Create locked wallet vesting | `createLockedWalletVesting()` | ✅ Active |
| 10 | Process locked wallet release | `processLockedWalletRelease()` | ✅ Active |
| 11 | Set/unset AMM pair | `setAMMPair()` | ✅ Active |
| 12 | Transfer ownership | `transferOwnership()` | ✅ Active |

### ❌ REMOVED Owner Privileges (Security Enhancement)

| Privilege | Status | Reason |
|-----------|--------|--------|
| Pause token transfers | ❌ REMOVED | Full decentralization - no entity can halt trading |
| Unpause token transfers | ❌ REMOVED | Full decentralization - no entity can halt trading |

---

## 9. VESTING TIMELINE SUMMARY

| Month | Locked Reserve | Founder | 4 Admins | Total Release | Total Burned |
|-------|----------------|---------|----------|---------------|--------------|
| 0 (Deploy) | 0 | 32M | 8M | 40M | 0 |
| 1 | 9M | 8M | 2M | 19M | 900K |
| 6 | 9M | 8M | 2M | 19M | 900K |
| 12 | 9M | 8M | 2M | 19M | 900K |
| 16 | 9M | 8M | 2M | 19M | 900K |
| 17-34 | 9M | 0 | 0 | 9M | 900K |

### Final Distribution (After 34 Months)

| Category | Amount |
|----------|--------|
| Total Distributed | 475,400,000 SYL |
| Total Burned (Locked Reserve) | 30,600,000 SYL |
| Deflationary Effect | 6.1% reduction |

---

## 10. SECURITY FEATURES

| Feature | Status | Description |
|---------|--------|-------------|
| Reentrancy Protection | ✅ Active | All state-changing functions protected |
| Owner-Only Access Control | ✅ Active | Critical functions restricted to owner |
| Input Validation | ✅ Active | All inputs validated before processing |
| Pause Mechanism | ❌ REMOVED | Ensures full decentralization |
| Multi-Sig Pause | ❌ REMOVED | No entity can halt trading |

---

## 11. IMPORTANT LINKS

| Resource | URL |
|----------|-----|
| BSCScan Contract | https://bscscan.com/address/0xc66404C3fa3E01378027b4A4411812D3a8D458F5 |
| BSCScan Token Tracker | https://bscscan.com/token/0xc66404C3fa3E01378027b4A4411812D3a8D458F5 |
| Holders Page | https://bscscan.com/token/0xc66404C3fa3E01378027b4A4411812D3a8D458F5#balances |

---

## 12. SAFE MULTISIG WALLET

| Parameter | Value |
|-----------|-------|
| **Address** | `0xC5CcDC8F01739CeD02B30b5aD10DD5Fb201436bB` |
| **Name** | Safe Multisig Wallet |
| **Platform** | Gnosis Safe |
| **Network** | BSC (Binance Smart Chain) |
| **URL** | https://app.safe.global/multisig |
| **Role** | Governance |
| **Added Date** | December 3, 2025 |

### Safe Wallet Purpose
- Primary governance wallet for decentralized decision-making
- Configured via Gnosis Safe platform
- Represents collective decision-making for critical actions
- Multi-signature approval required for transactions

---

## 13. WALLET ADDRESS QUICK REFERENCE

```
CONTRACT ADDRESS:        0xc66404C3fa3E01378027b4A4411812D3a8D458F5

OWNER/FOUNDER:           0x465b54282e4885f61df7eB7CcDc2493DB35C9501
DEPLOYER/SYLVAN WALLET:  0xf949f50B3C32bD4cDa7D2192ff8f51dd9db4A469
LOCKED RESERVE:          0x687A2c7E494c3818c20AD2856d453514970d6aac

SAFE MULTISIG:           0xC5CcDC8F01739CeD02B30b5aD10DD5Fb201436bB

FEE WALLET:              0x46a4AF3bdAD67d3855Af42Ba0BBe9248b54F7915
DONATION WALLET:         0xa697645Fdfa5d9399eD18A6575256F81343D4e17
BURN ADDRESS:            0x000000000000000000000000000000000000dEaD

ADMIN - BRK:             0x1109B6aDB60dB170139f00bA2490fCA0F8BE7A8C
ADMIN - ERH:             0xe64660026a1aaDaea2ac6032b6B59f8714a08E34
ADMIN - GRK:             0xd1cc4222b7b62fb623884371337ae04cf44b93a7
ADMIN - CNK:             0x106A637D825e562168678b7fd0f75cFf2cF2845B
```

---

**Document Version:** 1.0  
**Last Updated:** December 8, 2025  
**Status:** ✅ Active and Current
