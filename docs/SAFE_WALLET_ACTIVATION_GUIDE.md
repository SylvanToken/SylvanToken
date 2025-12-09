# 🔐 Safe Wallet Activation Guide

**Document Version:** 1.1  
**Date:** December 8, 2025  
**Status:** Ready for Activation

---

## 📋 Safe Wallet Configuration

### Safe Wallet Address
```
0xC5CcDC8F01739CeD02B30b5aD10DD5Fb201436bB
```

### Signers (3 Total)

| # | Role | Name | Address |
|---|------|------|---------|
| 1 | Deployer | Deployer Wallet | `0xf949f50B3C32bD4cDa7D2192ff8f51dd9db4A469` |
| 2 | Owner | Owner Wallet | `0x465b54282e4885f61df7eB7CcDc2493DB35C9501` |
| 3 | Admin | Admin (BRK) | `0x1109B6aDB60dB170139f00bA2490fCA0F8BE7A8C` |

**Note:** Safe Wallet address is the multisig wallet itself, not a signer.

### Threshold
- **Required Signatures:** 2 of 3 (67%)
- **Quorum:** 2 signers must approve each transaction

---

## 🚀 ACTIVATION STEPS

### Step 1: Configure Safe Wallet on Gnosis Safe

1. **Open Safe App:**
   ```
   https://app.safe.global/home?safe=bnb:0xC5CcDC8F01739CeD02B30b5aD10DD5Fb201436bB
   ```

2. **Add Signers (if not already added):**
   - Go to Settings → Owners
   - Add each signer address:
     - `0xf949f50B3C32bD4cDa7D2192ff8f51dd9db4A469` (Deployer)
     - `0x465b54282e4885f61df7eB7CcDc2493DB35C9501` (Owner)
     - `0x1109B6aDB60dB170139f00bA2490fCA0F8BE7A8C` (Admin BRK)

3. **Set Threshold:**
   - Go to Settings → Policies
   - Set threshold to **2 of 3**

---

### Step 2: Transfer Ownership to Safe

#### Option A: Via BSCScan (Recommended)

1. **Go to Contract Write:**
   ```
   https://bscscan.com/address/0xc66404C3fa3E01378027b4A4411812D3a8D458F5#writeContract
   ```

2. **Connect Wallet:**
   - Click "Connect to Web3"
   - Connect with **Owner Wallet:** `0x465b54282e4885f61df7eB7CcDc2493DB35C9501`

3. **Find transferOwnership Function:**
   - Scroll to find `transferOwnership`
   - Or search for it

4. **Enter New Owner:**
   ```
   newOwner (address): 0xC5CcDC8F01739CeD02B30b5aD10DD5Fb201436bB
   ```

5. **Execute:**
   - Click "Write"
   - Confirm transaction in wallet
   - Wait for confirmation

#### Option B: Via Script

```bash
npx hardhat run scripts/management/transfer-ownership-to-safe.js --network bscMainnet
```

---

### Step 3: Verify Transfer

1. **Check on BSCScan Read Contract:**
   ```
   https://bscscan.com/address/0xc66404C3fa3E01378027b4A4411812D3a8D458F5#readContract
   ```

2. **Call `owner()` function:**
   - Should return: `0xC5CcDC8F01739CeD02B30b5aD10DD5Fb201436bB`

3. **Verify in Safe App:**
   - Safe should now be able to interact with contract

---

## ✅ POST-ACTIVATION CHECKLIST

| Task | Status |
|------|--------|
| Safe signers configured (3 signers) | ⬜ |
| Threshold set to 2/3 | ⬜ |
| Ownership transferred | ⬜ |
| New owner verified on BSCScan | ⬜ |
| Test transaction from Safe | ⬜ |

---

## 📝 FIRST TEST TRANSACTION

After activation, test with a read function:

1. Open Safe App
2. Go to "Apps" → "Transaction Builder"
3. Enter contract: `0xc66404C3fa3E01378027b4A4411812D3a8D458F5`
4. Paste ABI from `config/safe-wallet-abi.json`
5. Call `getLockedWalletInfo` with:
   ```
   0x687A2c7E494c3818c20AD2856d453514970d6aac
   ```
6. Verify it returns vesting information

---

## 🔄 MONTHLY OPERATIONS (After Activation)

### Monthly Release Batch Transaction

Every month, create a batch transaction in Safe:

**Transaction 1:** Release BRK
```
Function: processMonthlyRelease
Parameter: 0x1109B6aDB60dB170139f00bA2490fCA0F8BE7A8C
```

**Transaction 2:** Release ERH
```
Function: processMonthlyRelease
Parameter: 0xe64660026a1aaDaea2ac6032b6B59f8714a08E34
```

**Transaction 3:** Release GRK
```
Function: processMonthlyRelease
Parameter: 0xd1cc4222b7b62fb623884371337ae04cf44b93a7
```

**Transaction 4:** Release CNK
```
Function: processMonthlyRelease
Parameter: 0x106A637D825e562168678b7fd0f75cFf2cF2845B
```

**Transaction 5:** Release Locked Reserve
```
Function: processLockedWalletRelease
Parameter: 0x687A2c7E494c3818c20AD2856d453514970d6aac
```

---

## ⚠️ IMPORTANT WARNINGS

1. **Ownership transfer is IRREVERSIBLE**
2. **After transfer, only Safe can manage contract**
3. **2 of 3 signers must approve transactions**
4. **Keep all signer wallets secure**
5. **Never share private keys**

---

## 📞 Quick Reference

| Item | Value |
|------|-------|
| Contract | `0xc66404C3fa3E01378027b4A4411812D3a8D458F5` |
| Safe Wallet | `0xC5CcDC8F01739CeD02B30b5aD10DD5Fb201436bB` |
| Current Owner | `0x465b54282e4885f61df7eB7CcDc2493DB35C9501` |
| Threshold | 2 of 3 |
| Safe App | https://app.safe.global |
| BSCScan | https://bscscan.com/address/0xc66404C3fa3E01378027b4A4411812D3a8D458F5 |

---

**Document Status:** ✅ Ready  
**Last Updated:** December 8, 2025
