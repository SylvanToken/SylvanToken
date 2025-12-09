# 🔐 Sylvan Token - Safe Wallet Configuration Guide

**Document Version:** 1.0  
**Last Updated:** December 8, 2025  
**Network:** BSC Mainnet

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Safe Wallet Information](#safe-wallet-information)
3. [Available Functions](#available-functions)
4. [Monthly Release Operations](#monthly-release-operations)
5. [Transaction Builder Setup](#transaction-builder-setup)
6. [Step-by-Step Guide](#step-by-step-guide)
7. [ABI Reference](#abi-reference)

---

## 🎯 Overview

This guide explains how to configure and use Gnosis Safe multisig wallet for managing SylvanToken operations.

### Current Setup

| Parameter | Value |
|-----------|-------|
| Safe Address | `0xC5CcDC8F01739CeD02B30b5aD10DD5Fb201436bB` |
| Contract Address | `0xc66404C3fa3E01378027b4A4411812D3a8D458F5` |
| Network | BSC Mainnet (Chain ID: 56) |
| Current Owner | `0x465b54282e4885f61df7eB7CcDc2493DB35C9501` |

---

## 🔐 Safe Wallet Information

### Access URL
```
https://app.safe.global/home?safe=bnb:0xC5CcDC8F01739CeD02B30b5aD10DD5Fb201436bB
```

### Recommended Signer Configuration

| # | Signer | Address | Role |
|---|--------|---------|------|
| 1 | Founder Wallet | `0x465b54282e4885f61df7eB7CcDc2493DB35C9501` | Primary |
| 2 | Deployer Wallet | `0xf949f50B3C32bD4cDa7D2192ff8f51dd9db4A469` | Secondary |
| 3 | Additional Signer | TBD | Backup |

### Recommended Threshold
- **2 of 3** signatures required (67% quorum)

---

## 📝 Available Functions

### 🔴 Critical Functions (Monthly Operations)

| Function | Description | When to Use |
|----------|-------------|-------------|
| `processMonthlyRelease(address)` | Release vested tokens for admin wallet | Every month |
| `processLockedWalletRelease(address)` | Release vested tokens for locked reserve | Every month |

### 🟡 Management Functions

| Function | Description | When to Use |
|----------|-------------|-------------|
| `addExemptWallet(address)` | Add fee exemption | As needed |
| `removeExemptWallet(address)` | Remove fee exemption | As needed |
| `addExemptWalletsBatch(address[])` | Bulk add exemptions | As needed |
| `setAMMPair(address,bool)` | Set AMM pair status | When adding DEX |

### 🔵 Administrative Functions

| Function | Description | When to Use |
|----------|-------------|-------------|
| `transferOwnership(address)` | Transfer ownership | ⚠️ CRITICAL - Irreversible |
| `configureAdminWallet(address,uint256)` | Configure new admin | Initial setup only |
| `createLockedWalletVesting(...)` | Create locked vesting | Initial setup only |

---

## 📅 Monthly Release Operations

### Target Wallets

#### Admin Wallets (4 total)
| Name | Address | Monthly Release |
|------|---------|-----------------|
| BRK | `0x1109B6aDB60dB170139f00bA2490fCA0F8BE7A8C` | 500,000 SYL |
| ERH | `0xe64660026a1aaDaea2ac6032b6B59f8714a08E34` | 500,000 SYL |
| GRK | `0xd1cc4222b7b62fb623884371337ae04cf44b93a7` | 500,000 SYL |
| CNK | `0x106A637D825e562168678b7fd0f75cFf2cF2845B` | 500,000 SYL |

#### Locked Reserve Wallet
| Name | Address | Monthly Release | Burn |
|------|---------|-----------------|------|
| Locked Reserve | `0x687A2c7E494c3818c20AD2856d453514970d6aac` | 9,000,000 SYL | 10% (900K) |

---

## 🛠️ Transaction Builder Setup

### Step 1: Open Safe App

1. Go to https://app.safe.global
2. Connect your wallet
3. Select BSC network
4. Open your Safe: `0xC5CcDC8F01739CeD02B30b5aD10DD5Fb201436bB`

### Step 2: Open Transaction Builder

1. Click "Apps" in the sidebar
2. Search for "Transaction Builder"
3. Click to open

### Step 3: Add Contract

1. Click "Add new transaction"
2. Enter contract address: `0xc66404C3fa3E01378027b4A4411812D3a8D458F5`
3. Paste the ABI (see ABI Reference section below)

---

## 📖 Step-by-Step Guide

### Monthly Admin Release (Example: BRK)

1. **Open Transaction Builder**
2. **Enter Contract Address:** `0xc66404C3fa3E01378027b4A4411812D3a8D458F5`
3. **Select Function:** `processMonthlyRelease`
4. **Enter Parameter:**
   - admin: `0x1109B6aDB60dB170139f00bA2490fCA0F8BE7A8C`
5. **Click "Add transaction"**
6. **Repeat for other admin wallets**
7. **Click "Create Batch"**
8. **Review and Submit**
9. **Collect required signatures**
10. **Execute transaction**

### Monthly Locked Reserve Release

1. **Open Transaction Builder**
2. **Enter Contract Address:** `0xc66404C3fa3E01378027b4A4411812D3a8D458F5`
3. **Select Function:** `processLockedWalletRelease`
4. **Enter Parameter:**
   - lockedWallet: `0x687A2c7E494c3818c20AD2856d453514970d6aac`
5. **Click "Add transaction"**
6. **Review and Submit**
7. **Collect required signatures**
8. **Execute transaction**

---

## 📋 Complete Monthly Batch Transaction

For efficiency, create a batch transaction with all 5 releases:

### Transaction 1: BRK Release
```
Contract: 0xc66404C3fa3E01378027b4A4411812D3a8D458F5
Function: processMonthlyRelease(address)
Parameter: 0x1109B6aDB60dB170139f00bA2490fCA0F8BE7A8C
```

### Transaction 2: ERH Release
```
Contract: 0xc66404C3fa3E01378027b4A4411812D3a8D458F5
Function: processMonthlyRelease(address)
Parameter: 0xe64660026a1aaDaea2ac6032b6B59f8714a08E34
```

### Transaction 3: GRK Release
```
Contract: 0xc66404C3fa3E01378027b4A4411812D3a8D458F5
Function: processMonthlyRelease(address)
Parameter: 0xd1cc4222b7b62fb623884371337ae04cf44b93a7
```

### Transaction 4: CNK Release
```
Contract: 0xc66404C3fa3E01378027b4A4411812D3a8D458F5
Function: processMonthlyRelease(address)
Parameter: 0x106A637D825e562168678b7fd0f75cFf2cF2845B
```

### Transaction 5: Locked Reserve Release
```
Contract: 0xc66404C3fa3E01378027b4A4411812D3a8D458F5
Function: processLockedWalletRelease(address)
Parameter: 0x687A2c7E494c3818c20AD2856d453514970d6aac
```

---

## 📜 ABI Reference

### Minimal ABI for Safe Transaction Builder

```json
[
  {
    "inputs": [{"name": "admin", "type": "address"}],
    "name": "processMonthlyRelease",
    "outputs": [
      {"name": "releasedAmount", "type": "uint256"},
      {"name": "burnedAmount", "type": "uint256"}
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"name": "lockedWallet", "type": "address"}],
    "name": "processLockedWalletRelease",
    "outputs": [
      {"name": "releasedAmount", "type": "uint256"},
      {"name": "burnedAmount", "type": "uint256"}
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"name": "wallet", "type": "address"}],
    "name": "addExemptWallet",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"name": "wallet", "type": "address"}],
    "name": "removeExemptWallet",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"name": "wallets", "type": "address[]"}],
    "name": "addExemptWalletsBatch",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"name": "pair", "type": "address"},
      {"name": "isAMM", "type": "bool"}
    ],
    "name": "setAMMPair",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"name": "newOwner", "type": "address"}],
    "name": "transferOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"name": "beneficiary", "type": "address"}],
    "name": "getVestingInfo",
    "outputs": [
      {"name": "totalAmount", "type": "uint256"},
      {"name": "releasedAmount", "type": "uint256"},
      {"name": "burnedAmount", "type": "uint256"},
      {"name": "startTime", "type": "uint256"},
      {"name": "cliffDuration", "type": "uint256"},
      {"name": "vestingDuration", "type": "uint256"},
      {"name": "releasePercentage", "type": "uint256"},
      {"name": "burnPercentage", "type": "uint256"},
      {"name": "isActive", "type": "bool"},
      {"name": "isAdmin", "type": "bool"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"name": "lockedWallet", "type": "address"}],
    "name": "getLockedWalletInfo",
    "outputs": [
      {"name": "totalAmount", "type": "uint256"},
      {"name": "releasedAmount", "type": "uint256"},
      {"name": "burnedAmount", "type": "uint256"},
      {"name": "remainingAmount", "type": "uint256"},
      {"name": "nextReleaseTime", "type": "uint256"},
      {"name": "monthsElapsed", "type": "uint256"},
      {"name": "monthsRemaining", "type": "uint256"},
      {"name": "canRelease", "type": "bool"}
    ],
    "stateMutability": "view",
    "type": "function"
  }
]
```

---

## ⚠️ Important Notes

1. **Ownership Required:** Safe must be the contract owner to execute these functions
2. **Current Owner:** `0x465b54282e4885f61df7eB7CcDc2493DB35C9501` (Founder)
3. **To Transfer Ownership:** Current owner must call `transferOwnership(safeAddress)`
4. **Gas Costs:** Each transaction requires BNB for gas fees
5. **Signature Collection:** All signers must approve before execution

---

## 🔄 Ownership Transfer Process

If you want Safe to be the owner:

### Step 1: Current Owner Transfers Ownership
```
Function: transferOwnership
Parameter: 0xC5CcDC8F01739CeD02B30b5aD10DD5Fb201436bB
```

### Step 2: Verify Transfer
Check on BSCScan that owner is now the Safe address.

### Step 3: Test with Read Functions
Use `getVestingInfo` to verify Safe can interact with contract.

---

## 📞 Support

- **BSCScan Contract:** https://bscscan.com/address/0xc66404C3fa3E01378027b4A4411812D3a8D458F5
- **Safe App:** https://app.safe.global
- **Documentation:** See project docs folder

---

**Document Status:** ✅ Active  
**Last Review:** December 8, 2025
