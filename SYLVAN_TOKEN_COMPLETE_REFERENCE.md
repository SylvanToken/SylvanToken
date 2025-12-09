# 🌲 SYLVAN TOKEN - COMPLETE REFERENCE DOCUMENT

**Document Version:** 1.1  
**Last Updated:** December 9, 2025  
**Network:** BSC Mainnet (Chain ID: 56)  
**Status:** Production Ready - Safe Wallet Governance Active

---

## 📜 CONTRACT INFORMATION

| Parameter | Value |
|-----------|-------|
| **Contract Name** | SylvanToken (SYL) |
| **Contract Address** | `0xc66404C3fa3E01378027b4A4411812D3a8D458F5` |
| **Contract Owner** | `0xC5CcDC8F01739CeD02B30b5aD10DD5Fb201436bB` (Safe Wallet) |
| **Governance Model** | Multi-Signature 2/3 Threshold |
| **Token Standard** | BEP-20 (ERC-20 Compatible) |
| **Total Supply** | 1,000,000,000 SYL (1 Billion) |
| **Decimals** | 18 |
| **Solidity Version** | 0.8.24 |
| **Framework** | Hardhat 2.26.3 |
| **OpenZeppelin** | 4.9.6 |
| **BSCScan** | [View Contract](https://bscscan.com/address/0xc66404C3fa3E01378027b4A4411812D3a8D458F5) |
| **Safe Wallet** | [Manage](https://app.safe.global/home?safe=bnb:0xC5CcDC8F01739CeD02B30b5aD10DD5Fb201436bB) |

---

## 👑 OWNERSHIP STRUCTURE

### Current Owner
| Role | Address | Description |
|------|---------|-------------|
| **Contract Owner** | `0xC5CcDC8F01739CeD02B30b5aD10DD5Fb201436bB` | Safe Wallet (Multi-Sig 2/3) |
| **Initial Owner** | `0xf949f50B3C32bD4cDa7D2192ff8f51dd9db4A469` | Transferred to Safe Wallet |
| **Deployer** | `0xf949f50B3C32bD4cDa7D2192ff8f51dd9db4A469` | Deployed contract |
| **Transfer Date** | December 9, 2025 | Ownership transferred to Safe Wallet |

### Owner Capabilities
| # | Function | Description |
|---|----------|-------------|
| 1 | `addExemptWallet()` | Add wallet to fee exemption list |
| 2 | `removeExemptWallet()` | Remove wallet from fee exemption |
| 3 | `addExemptWalletsBatch()` | Bulk add fee exemptions |
| 4 | `createVestingSchedule()` | Create vesting for any wallet |
| 5 | `configureAdminWallet()` | Configure admin wallet allocation |
| 6 | `processInitialRelease()` | Release initial 10% for admin |
| 7 | `processMonthlyRelease()` | Release monthly vested tokens |
| 8 | `createLockedWalletVesting()` | Create locked wallet vesting |
| 9 | `processLockedWalletRelease()` | Release locked wallet tokens |
| 10 | `setAMMPair()` | Set/unset AMM pair addresses |
| 11 | `transferOwnership()` | Transfer ownership to new address |

### Removed Capabilities (Security)
| Function | Status | Reason |
|----------|--------|--------|
| `pauseContract()` | ❌ REMOVED | Full decentralization |
| `unpauseContract()` | ❌ REMOVED | No entity can halt trading |

---

## 🔐 SAFE MULTISIG WALLET

### Safe Wallet Configuration
| Parameter | Value |
|-----------|-------|
| **Safe Address** | `0xC5CcDC8F01739CeD02B30b5aD10DD5Fb201436bB` |
| **Platform** | Gnosis Safe |
| **Network** | BSC Mainnet |
| **Threshold** | 2 of 3 (67% quorum) |
| **Safe App URL** | https://app.safe.global |

### Signers (3 Total)
| # | Role | Address |
|---|------|---------|
| 1 | `0xf949f50B3C32bD4cDa7D2192ff8f51dd9db4A469` | Deployer |
| 2 | `0x465b54282e4885f61df7eB7CcDc2493DB35C9501` | Owner |
| 3 | `0x1109B6aDB60dB170139f00bA2490fCA0F8BE7A8C` | Admin |

**Note:** Safe Wallet address (`0xC5CcDC...`) is the multisig wallet itself, not a signer.

### Safe Wallet Purpose
- **Contract Ownership**: Safe Wallet is the current owner of the contract
- **Decentralized Governance**: All owner functions require 2/3 multi-sig approval
- **Vesting Release Management**: Monthly releases processed through Safe
- **Fee Exemption Management**: Adding/removing exemptions requires multi-sig
- **Enhanced Security**: No single point of failure for critical operations

### Ownership Transfer History
| Date | From | To | Transaction |
|------|------|----|-----------| 
| Dec 9, 2025 | `0xf949...A469` | `0xC5Cc...36bB` (Safe Wallet) | [View on BSCScan](https://bscscan.com/address/0xc66404C3fa3E01378027b4A4411812D3a8D458F5) |
- Airdrop/batch transfers

---

## 💰 TOKEN DISTRIBUTION

### Overview
| Category | Amount | Percentage | Status |
|----------|--------|------------|--------|
| Sylvan Token Wallet | 500,000,000 SYL | 50% | ✅ Active |
| Locked Reserve | 300,000,000 SYL | 30% | 🔒 Locked (34 months) |
| Founder Wallet | 160,000,000 SYL | 16% | 🔒 Partially Locked |
| Admin Wallets (4x) | 40,000,000 SYL | 4% | 🔒 Partially Locked |
| **TOTAL** | **1,000,000,000 SYL** | **100%** | - |

---

## 💼 WALLET ADDRESSES

### System Wallets
| Wallet | Address | Amount | Role |
|--------|---------|--------|------|
| 👑 **Owner/Founder** | `0x465b54282e4885f61df7eB7CcDc2493DB35C9501` | 160M SYL | Strategic Operations |
| 🏦 **Deployer/Sylvan** | `0xf949f50B3C32bD4cDa7D2192ff8f51dd9db4A469` | 500M SYL | Main Operations |
| 🔒 **Locked Reserve** | `0x687A2c7E494c3818c20AD2856d453514970d6aac` | 300M SYL | 34-month Vesting |
| 💰 **Fee Wallet** | `0x46a4AF3bdAD67d3855Af42Ba0BBe9248b54F7915` | - | Receives 50% fees |
| 🎁 **Donation Wallet** | `0xa697645Fdfa5d9399eD18A6575256F81343D4e17` | - | Receives 25% fees |
| 🔥 **Burn Address** | `0x000000000000000000000000000000000000dEaD` | - | Receives 25% fees |
| 🔐 **Safe Multisig** | `0xC5CcDC8F01739CeD02B30b5aD10DD5Fb201436bB` | - | Governance |

### Admin Wallets (Vesting Recipients)
| Name | Address | Allocation |
|------|---------|------------|
| **BRK** | `0x1109B6aDB60dB170139f00bA2490fCA0F8BE7A8C` | 10,000,000 SYL |
| **ERH** | `0xe64660026a1aaDaea2ac6032b6B59f8714a08E34` | 10,000,000 SYL |
| **GRK** | `0xd1cc4222b7b62fb623884371337ae04cf44b93a7` | 10,000,000 SYL |
| **CNK** | `0x106A637D825e562168678b7fd0f75cFf2cF2845B` | 10,000,000 SYL |

**Note:** Admin wallets have NO administrative privileges. They are standard user wallets with vesting schedules.

---

## 🔒 VESTING SCHEDULES

### Locked Reserve Wallet
| Parameter | Value |
|-----------|-------|
| **Address** | `0x687A2c7E494c3818c20AD2856d453514970d6aac` |
| **Total Amount** | 300,000,000 SYL |
| **Lock Percentage** | 100% (Fully Locked) |
| **Initial Release** | 0 SYL (No immediate release) |
| **Cliff Period** | 30 days |
| **Vesting Duration** | 34 months |
| **Monthly Release** | 3% (9,000,000 SYL) |
| **Burn on Release** | 10% (900,000 SYL/month) |
| **To Beneficiary** | 90% (8,100,000 SYL/month) |
| **Release Function** | `processLockedWalletRelease()` |

### Founder Wallet
| Parameter | Value |
|-----------|-------|
| **Address** | `0x465b54282e4885f61df7eB7CcDc2493DB35C9501` |
| **Total Amount** | 160,000,000 SYL |
| **Lock Percentage** | 80% (128,000,000 SYL) |
| **Initial Release** | 20% (32,000,000 SYL) |
| **Cliff Period** | 30 days |
| **Vesting Duration** | 16 months |
| **Monthly Release** | 5% (8,000,000 SYL) |
| **Burn on Release** | 0% (No burn) |

### Admin Wallets (Each of 4)
| Parameter | Value |
|-----------|-------|
| **Total Amount (Each)** | 10,000,000 SYL |
| **Lock Percentage** | 90% (9,000,000 SYL) |
| **Initial Release** | 10% (1,000,000 SYL) |
| **Cliff Period** | 30 days |
| **Vesting Duration** | 20 months |
| **Monthly Release** | 4.5% (450,000 SYL) |
| **Burn on Release** | 10% (45,000 SYL/month) |
| **To Beneficiary** | 90% (405,000 SYL/month) |
| **Initial Function** | `processInitialRelease()` |
| **Monthly Function** | `processMonthlyRelease()` |

---

## 💸 FEE STRUCTURE

### Transaction Fee
| Parameter | Value |
|-----------|-------|
| **Fee Rate** | 1% (100 basis points) |
| **Fee to Operations** | 50% (0.5% of transaction) |
| **Fee to Donation** | 25% (0.25% of transaction) |
| **Fee Burned** | 25% (0.25% of transaction) |

### Fee Distribution Wallets
| Destination | Address | Share |
|-------------|---------|-------|
| Fee Wallet | `0x46a4AF3bdAD67d3855Af42Ba0BBe9248b54F7915` | 50% |
| Donation Wallet | `0xa697645Fdfa5d9399eD18A6575256F81343D4e17` | 25% |
| Burn Address | `0x000000000000000000000000000000000000dEaD` | 25% |

### Fee Exemption Status
| Wallet | Status | Reason |
|--------|--------|--------|
| Fee Wallet | ✅ EXEMPT | Prevents circular fees |
| Donation Wallet | ✅ EXEMPT | Prevents circular fees |
| Burn Address | ✅ EXEMPT | Prevents circular fees |
| All Other Wallets | ❌ NOT EXEMPT | Standard 1% fee applies |

---

## 📅 VESTING TIMELINE

### Monthly Release Schedule
| Month | Locked Reserve | Founder | 4 Admins | Total | Burned |
|-------|----------------|---------|----------|-------|--------|
| 0 (Deploy) | 0 | 32M | 4M (1M×4) | 36M | 0 |
| 1 | 9M | 8M | 1.8M | 18.8M | 1.08M |
| 2-16 | 9M/mo | 8M/mo | 1.8M/mo | 18.8M/mo | 1.08M/mo |
| 17-20 | 9M/mo | 0 | 1.8M/mo | 10.8M/mo | 1.08M/mo |
| 21-34 | 9M/mo | 0 | 0 | 9M/mo | 0.9M/mo |

### Final Distribution (After 34 Months)
| Category | Amount |
|----------|--------|
| Total Distributed | ~970M SYL |
| Total Burned | ~30M SYL |
| Deflationary Effect | ~3% reduction |

---

## 🛡️ SECURITY FEATURES

### Active Security Measures
| Feature | Status | Description |
|---------|--------|-------------|
| Reentrancy Protection | ✅ Active | All state-changing functions protected |
| Owner-Only Access | ✅ Active | Critical functions restricted |
| Input Validation | ✅ Active | All inputs validated |
| Multi-Sig Governance | ✅ Active | Safe Wallet for critical operations |

### Removed Features (Decentralization)
| Feature | Status | Reason |
|---------|--------|--------|
| Pause Mechanism | ❌ REMOVED | Full decentralization |
| Emergency Stop | ❌ REMOVED | No entity can halt trading |

---

## 🔗 IMPORTANT LINKS

### BSCScan
| Resource | URL |
|----------|-----|
| Contract | https://bscscan.com/address/0xc66404C3fa3E01378027b4A4411812D3a8D458F5 |
| Token Tracker | https://bscscan.com/token/0xc66404C3fa3E01378027b4A4411812D3a8D458F5 |
| Holders | https://bscscan.com/token/0xc66404C3fa3E01378027b4A4411812D3a8D458F5#balances |
| Write Contract | https://bscscan.com/address/0xc66404C3fa3E01378027b4A4411812D3a8D458F5#writeContract |
| Read Contract | https://bscscan.com/address/0xc66404C3fa3E01378027b4A4411812D3a8D458F5#readContract |

### Safe Wallet
| Resource | URL |
|----------|-----|
| Safe App | https://app.safe.global |
| Safe Wallet | https://app.safe.global/home?safe=bnb:0xC5CcDC8F01739CeD02B30b5aD10DD5Fb201436bB |

### GitHub
| Resource | URL |
|----------|-----|
| Main Repo | https://github.com/SylvanToken/SylvanToken |
| Safe App Repo | https://github.com/SylvanToken/SafeWallet |
| Logo | https://raw.githubusercontent.com/SylvanToken/SylvanToken/main/assets/images/sylvan-token-logo.png |

---

## 📋 QUICK REFERENCE - ALL ADDRESSES

```
============================================
CONTRACT
============================================
Contract Address:     0xc66404C3fa3E01378027b4A4411812D3a8D458F5

============================================
OWNERSHIP & GOVERNANCE
============================================
Owner/Founder:        0x465b54282e4885f61df7eB7CcDc2493DB35C9501
Deployer:             0xf949f50B3C32bD4cDa7D2192ff8f51dd9db4A469
Safe Multisig:        0xC5CcDC8F01739CeD02B30b5aD10DD5Fb201436bB

============================================
TOKEN DISTRIBUTION
============================================
Sylvan Wallet:        0xf949f50B3C32bD4cDa7D2192ff8f51dd9db4A469  (500M)
Locked Reserve:       0x687A2c7E494c3818c20AD2856d453514970d6aac  (300M)
Founder:              0x465b54282e4885f61df7eB7CcDc2493DB35C9501  (160M)

============================================
ADMIN WALLETS (10M each)
============================================
Admin BRK:            0x1109B6aDB60dB170139f00bA2490fCA0F8Be7A8C
Admin ERH:            0xe64660026a1aaDaea2ac6032b6B59f8714a08E34
Admin GRK:            0xd1cc4222b7b62fb623884371337ae04cf44b93a7
Admin CNK:            0x106A637D825e562168678b7fd0f75cFf2cF2845B

============================================
FEE COLLECTION
============================================
Fee Wallet:           0x46a4AF3bdAD67d3855Af42Ba0BBe9248b54F7915  (50%)
Donation Wallet:      0xa697645Fdfa5d9399eD18A6575256F81343D4e17  (25%)
Burn Address:         0x000000000000000000000000000000000000dEaD  (25%)
```

---

## 🔄 OWNERSHIP TRANSFER TO SAFE

### Steps to Transfer
1. Go to BSCScan Write Contract
2. Connect with Owner Wallet (`0x465b54...`)
3. Call `transferOwnership`
4. Parameter: `0xC5CcDC8F01739CeD02B30b5aD10DD5Fb201436bB`
5. Confirm transaction

### After Transfer
- Safe Wallet becomes contract owner
- All owner functions require 2/3 multi-sig approval
- Vesting releases managed via Safe App

---

## 📱 SAFE APP FEATURES

### Dashboard
- Contract information
- System wallet balances
- Admin wallet balances
- Vesting summary

### Vesting Release
- Initial 10% release for admins
- Monthly release for admins
- Locked reserve release

### Airdrop
- Source wallet selection
- Manual entry or CSV import
- Batch transfer (up to 50+ recipients)
- Balance validation

### Schedule
- Vesting timeline
- Countdown to next release

### Fee Management
- Add/remove fee exemptions

---

**Document Status:** ✅ Complete  
**Last Updated:** December 8, 2025
