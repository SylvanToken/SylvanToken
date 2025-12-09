# 🔐 Multi-Sig Wallet Setup Guide

**Version 2.0 | December 2025**

---

## 📋 Overview

Sylvan Token uses Gnosis Safe for multi-signature governance. This guide covers setup and operations.

---

## 🏦 Safe Wallet Configuration

### Current Setup

| Parameter | Value |
|-----------|-------|
| Platform | Gnosis Safe |
| Network | BSC Mainnet (Chain ID: 56) |
| Safe Address | `[SAFE_ADDRESS]` |
| Threshold | 2 of 3 (67%) |

### Signers

| # | Role | Address |
|---|------|---------|
| 1 | Deployer | `[DEPLOYER_ADDRESS]` |
| 2 | Owner | `[OWNER_ADDRESS]` |
| 3 | Admin BRK | `[ADMIN_BRK_ADDRESS]` |

**Note**: Safe Wallet address is the multisig itself, NOT a signer.

---

## 🚀 Creating a Safe Wallet

### Step 1: Access Safe App

1. Go to https://app.safe.global
2. Click "Create new Safe"
3. Select "Binance Smart Chain"

### Step 2: Configure Owners

1. Add signer addresses:
   - Deployer Wallet
   - Owner Wallet
   - Admin BRK Wallet
2. Set names for each signer

### Step 3: Set Threshold

1. Select "2 out of 3 owners"
2. This means any 2 signers can approve transactions

### Step 4: Review & Deploy

1. Review configuration
2. Pay deployment gas fee
3. Wait for confirmation

---

## 🔄 Transferring Ownership

### Via BSCScan

1. Go to contract Write functions
2. Connect with current Owner wallet
3. Find `transferOwnership` function
4. Enter Safe Wallet address
5. Execute transaction

### Via Script

```bash
npx hardhat run scripts/management/transfer-ownership-to-safe.js --network bscMainnet
```

### Verification

After transfer, verify:
1. Call `owner()` on BSCScan
2. Should return Safe Wallet address
3. Test a transaction from Safe

---

## 📝 Creating Transactions

### Step 1: Access Transaction Builder

1. Open Safe App
2. Go to "Apps" → "Transaction Builder"
3. Or use "New Transaction" → "Contract Interaction"

### Step 2: Enter Contract Details

```
Contract Address: 0xc66404C3fa3E01378027b4A4411812D3a8D458F5
ABI: [Paste from config/safe-wallet-abi.json]
```

### Step 3: Select Function

Choose from available functions:
- `processMonthlyRelease`
- `processLockedWalletRelease`
- `addExemptWallet`
- etc.

### Step 4: Enter Parameters

Fill in required parameters for the function.

### Step 5: Create Transaction

1. Click "Add transaction"
2. Review details
3. Click "Create Batch"

---

## ✅ Approving Transactions

### As a Signer

1. Open Safe App
2. Go to "Transactions" → "Queue"
3. Review pending transaction
4. Click "Confirm"
5. Sign with your wallet

### Execution

- Transaction executes when threshold (2/3) is reached
- Any signer can execute after threshold met
- Gas paid by executor

---

## 📊 Monthly Operations

### Vesting Release Batch

Create a batch transaction for monthly releases:

**Transaction 1**: Release BRK
```
Function: processMonthlyRelease
Parameter: [ADMIN_BRK_ADDRESS]
```

**Transaction 2**: Release ERH
```
Function: processMonthlyRelease
Parameter: [ADMIN_ERH_ADDRESS]
```

**Transaction 3**: Release GRK
```
Function: processMonthlyRelease
Parameter: [ADMIN_GRK_ADDRESS]
```

**Transaction 4**: Release CNK
```
Function: processMonthlyRelease
Parameter: [ADMIN_CNK_ADDRESS]
```

**Transaction 5**: Release Locked Reserve
```
Function: processLockedWalletRelease
Parameter: [LOCKED_RESERVE_ADDRESS]
```

---

## 📱 Safe App (Custom)

### Features

Our custom Safe App provides:
- Dashboard with wallet balances
- One-click vesting releases
- Batch airdrop functionality
- Schedule tracking
- Fee exemption management

### Access

1. Open Safe App
2. Go to "Apps"
3. Add custom app URL
4. Or use: [Safe App URL]

### Repository

https://github.com/SylvanToken/SafeWallet

---

## 🔒 Security Best Practices

### Signer Security

1. **Hardware Wallets**: Use Ledger/Trezor for signers
2. **Backup**: Secure recovery phrases
3. **Distribution**: Signers in different locations
4. **Verification**: Always verify transaction details

### Transaction Safety

1. **Review**: Carefully review all parameters
2. **Simulation**: Use transaction simulation
3. **Communication**: Coordinate with other signers
4. **Timing**: Don't rush approvals

### Access Control

1. **Regular Audits**: Review signer access
2. **Rotation**: Consider periodic signer rotation
3. **Monitoring**: Watch for suspicious activity

---

## ⚠️ Important Warnings

1. **Ownership Transfer is IRREVERSIBLE**
2. **After transfer, only Safe can manage contract**
3. **2 of 3 signers must approve all transactions**
4. **Keep all signer wallets secure**
5. **Never share private keys**

---

## 🆘 Troubleshooting

### Transaction Stuck

1. Check gas price
2. Verify all parameters
3. Ensure signers have BNB for gas
4. Try canceling and recreating

### Signer Issues

1. Verify signer address is correct
2. Check wallet connection
3. Try different browser/wallet

### Threshold Not Met

1. Contact other signers
2. Wait for approvals
3. Check transaction queue

---

## 📞 Quick Reference

| Item | Value |
|------|-------|
| Safe App | https://app.safe.global |
| Contract | `0xc66404C3fa3E01378027b4A4411812D3a8D458F5` |
| Safe Wallet | `0xC5CcDC8F01739CeD02B30b5aD10DD5Fb201436bB` |
| Threshold | 2 of 3 |
| BSCScan | https://bscscan.com |

---

## 🔗 Related Documentation

- [API Reference](./API_REFERENCE.md)
- [Vesting Guide](./VESTING_LOCK_GUIDE.md)
- [Emergency Procedures](./EMERGENCY_PROCEDURES_GUIDE.md)

---

<div align="center">

**Sylvan Token Multi-Sig Guide**

Last Updated: December 2025

</div>
