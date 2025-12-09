# 🚀 Sylvan Token Launch Plan

**Version 2.0 | December 2025**

---

## 📋 Executive Summary

This document outlines the complete launch strategy for Sylvan Token (SYL) on BSC Mainnet, including deployment procedures, liquidity setup, and post-launch operations.

---

## 🎯 Launch Objectives

1. **Secure Deployment**: Deploy verified, audited contract
2. **Liquidity**: Establish initial trading liquidity
3. **Governance**: Transfer ownership to Safe Wallet
4. **Community**: Build engaged community
5. **Transparency**: Full on-chain verification

---

## 📅 Launch Timeline

### Pre-Launch (T-7 days)

| Day | Task | Status |
|-----|------|--------|
| T-7 | Final code review | ⬜ |
| T-6 | Test deployment on testnet | ⬜ |
| T-5 | Safe Wallet configuration | ⬜ |
| T-4 | Documentation finalization | ⬜ |
| T-3 | Community announcement | ⬜ |
| T-2 | Final security check | ⬜ |
| T-1 | Deployment preparation | ⬜ |

### Launch Day (T-0)

| Time | Task | Status |
|------|------|--------|
| 00:00 | Contract deployment | ⬜ |
| 00:30 | BSCScan verification | ⬜ |
| 01:00 | Initial configuration | ⬜ |
| 02:00 | Ownership transfer to Safe | ⬜ |
| 03:00 | Liquidity addition | ⬜ |
| 04:00 | Trading enabled | ⬜ |
| 05:00 | Community announcement | ⬜ |

### Post-Launch (T+1 to T+7)

| Day | Task | Status |
|-----|------|--------|
| T+1 | Monitor trading | ⬜ |
| T+2 | Community support | ⬜ |
| T+3 | First vesting setup | ⬜ |
| T+7 | Week 1 report | ⬜ |

---

## 🔧 Deployment Procedure

### Step 1: Contract Deployment

```bash
# Deploy to BSC Mainnet
npx hardhat run scripts/deployment/deploy-enhanced-complete.js --network bscMainnet
```

**Parameters:**
- Fee Wallet: `[FEE_WALLET_ADDRESS]`
- Donation Wallet: `[DONATION_WALLET_ADDRESS]`
- Initial Exempt: Owner, Fee, Donation wallets

### Step 2: BSCScan Verification

```bash
# Verify contract
npx hardhat verify --network bscMainnet 0xc66404C3fa3E01378027b4A4411812D3a8D458F5 \
  "0x46a4AF3bdAD67d3855Af42Ba0BBe9248b54F7915" "0xa697645Fdfa5d9399eD18A6575256F81343D4e17" "[EXEMPT_ARRAY]"
```

### Step 3: Initial Configuration

1. **Configure Admin Wallets**
   ```
   configureAdminWallet(BRK_ADDRESS, 10000000 * 10^18)
   configureAdminWallet(ERH_ADDRESS, 10000000 * 10^18)
   configureAdminWallet(GRK_ADDRESS, 10000000 * 10^18)
   configureAdminWallet(CNK_ADDRESS, 10000000 * 10^18)
   ```

2. **Create Locked Wallet Vesting**
   ```
   createLockedWalletVesting(LOCKED_ADDRESS, 300000000 * 10^18, 30)
   ```

3. **Add Fee Exemptions**
   ```
   addExemptWallet(FEE_WALLET)
   addExemptWallet(DONATION_WALLET)
   ```

### Step 4: Ownership Transfer

```bash
# Transfer to Safe Wallet
npx hardhat run scripts/management/transfer-ownership-to-safe.js --network bscMainnet
```

**Safe Wallet Configuration:**
- Address: `[SAFE_ADDRESS]`
- Threshold: 2 of 3
- Signers: Deployer, Owner, Admin BRK

---

## 💧 Liquidity Setup

### PancakeSwap Listing

| Parameter | Value |
|-----------|-------|
| DEX | PancakeSwap V2 |
| Pair | SYL/BNB |
| Initial Liquidity | TBD |
| Lock Period | 2 years |

### Liquidity Addition

1. Approve PancakeSwap Router
2. Add liquidity (SYL + BNB)
3. Lock LP tokens
4. Publish lock proof

---

## 🔐 Security Checklist

### Pre-Deployment
- [ ] All tests passing (275+)
- [ ] Security audit completed
- [ ] No pause mechanism (verified)
- [ ] Reentrancy protection active
- [ ] Input validation working

### Deployment
- [ ] Correct constructor parameters
- [ ] Contract verified on BSCScan
- [ ] Owner address correct
- [ ] Fee wallets configured

### Post-Deployment
- [ ] Ownership transferred to Safe
- [ ] Safe threshold verified (2/3)
- [ ] All signers confirmed
- [ ] Test transaction successful

---

## 📊 Token Distribution

### Initial Allocation

| Wallet | Amount | Percentage |
|--------|--------|------------|
| Sylvan Token | 500M | 50% |
| Locked Reserve | 300M | 30% |
| Founder | 160M | 16% |
| Admin BRK | 10M | 1% |
| Admin ERH | 10M | 1% |
| Admin GRK | 10M | 1% |
| Admin CNK | 10M | 1% |
| **Total** | **1B** | **100%** |

### Vesting Schedule

| Wallet | Immediate | Vested | Duration |
|--------|-----------|--------|----------|
| Locked Reserve | 0% | 100% | 34 months |
| Founder | 20% | 80% | 16 months |
| Admin Wallets | 10% | 90% | 20 months |

---

## 📢 Communication Plan

### Announcement Channels

| Channel | Action | Timing |
|---------|--------|--------|
| Twitter | Launch announcement | T-0 |
| Telegram | Community update | T-0 |
| Website | Contract details | T-0 |
| Medium | Launch article | T+1 |

### Key Messages

1. **Contract Address**: Published immediately
2. **BSCScan Link**: Verification proof
3. **Safe Wallet**: Governance details
4. **Trading**: PancakeSwap link

---

## 🚨 Emergency Procedures

### Issue: Deployment Failure
1. Stop deployment process
2. Analyze error logs
3. Fix issues
4. Redeploy

### Issue: Verification Failure
1. Check constructor arguments
2. Verify compiler settings
3. Retry verification
4. Manual verification if needed

### Issue: Liquidity Problems
1. Check token approvals
2. Verify router address
3. Adjust slippage
4. Contact support

---

## ✅ Launch Checklist

### Technical
- [ ] Contract deployed
- [ ] BSCScan verified
- [ ] Admin wallets configured
- [ ] Locked wallet vesting created
- [ ] Fee exemptions set
- [ ] Ownership transferred

### Governance
- [ ] Safe Wallet active
- [ ] All signers confirmed
- [ ] Test transaction completed
- [ ] Threshold verified

### Trading
- [ ] Liquidity added
- [ ] LP tokens locked
- [ ] Trading enabled
- [ ] Price stable

### Community
- [ ] Announcement published
- [ ] Contract address shared
- [ ] Documentation live
- [ ] Support active

---

## 📞 Support Contacts

| Role | Contact |
|------|---------|
| Technical Lead | dev@sylvantoken.org |
| Community Manager | community@sylvantoken.org |
| Emergency | emergency@sylvantoken.org |

---

<div align="center">

**Sylvan Token Launch Plan**

*Launching a Greener Future*

Last Updated: December 2025

</div>
