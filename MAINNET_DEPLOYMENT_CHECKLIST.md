# 🚀 Mainnet Deployment Checklist

**Date:** November 10, 2025  
**Status:** PREPARATION PHASE  
**Target Network:** BSC Mainnet (Chain ID: 56)

---

## 📋 Required Information from User

### 1. Wallet Addresses (CRITICAL)

#### Owner/Deployer Wallet
- [ ] **Private Key:** (Will be requested when ready)
- [ ] **Address:** (Will be auto-detected)
- [ ] **BNB Balance Required:** Minimum 0.15 BNB (~$45)
  - Contract deployment: ~0.091 BNB
  - Initial transactions: ~0.05 BNB
  - Buffer: ~0.009 BNB

#### Main Distribution Wallets
- [ ] **Founder Wallet Address:** (160M SYL - 16%)
- [ ] **Sylvan Token Wallet Address:** (500M SYL - 50%)

#### Admin Wallets (10M SYL each - 4%)
- [ ] **MAD Wallet Address:** (10M SYL with vesting)
- [ ] **LEB Wallet Address:** (10M SYL with vesting)
- [ ] **CNK Wallet Address:** (10M SYL with vesting)
- [ ] **KDR Wallet Address:** (10M SYL with vesting)

#### Locked Reserve Wallet
- [ ] **Locked Reserve Address:** (300M SYL - 30% with 34-month vesting)

#### System Wallets
- [ ] **Fee Collection Wallet:** (Receives 50% of fees)
- [ ] **Donations Wallet:** (Receives 25% of fees)
- [ ] **Burn Address:** 0x000000000000000000000000000000000000dEaD (25% of fees)

### 2. API Keys (CRITICAL)

#### BSC Mainnet RPC
- [ ] **RPC URL:** (e.g., https://bsc-dataseed.binance.org/)
- [ ] **Alternative RPC:** (Backup RPC endpoint)
- [ ] **WebSocket URL:** (Optional, for monitoring)

#### BSCScan API
- [ ] **API Key:** (For contract verification)
- [ ] **Account:** (BSCScan account email)

#### Optional Monitoring Services
- [ ] **Tenderly API Key:** (For advanced monitoring)
- [ ] **The Graph API Key:** (For indexing)
- [ ] **Alchemy/Infura API Key:** (Alternative RPC)

### 3. Multi-Signature Wallet (RECOMMENDED)

- [ ] **Gnosis Safe Address:** (If already created)
- [ ] **Signers:** (List of signer addresses)
- [ ] **Threshold:** (e.g., 3 of 5)
- [ ] **Status:** ⏳ Not created yet / ✅ Already created

---

## 🔧 Pre-Deployment Preparation

### Phase 1: Environment Setup

#### 1.1 Update Configuration Files
- [ ] Update `config/deployment.config.js` with mainnet addresses
- [ ] Update `config/environment.config.js` with mainnet settings
- [ ] Update `.env` file with mainnet credentials
- [ ] Verify all addresses are correct (checksum format)

#### 1.2 Create Mainnet Deployment Script
- [ ] Create `scripts/deployment/deploy-mainnet.js`
- [ ] Add comprehensive logging
- [ ] Add error handling
- [ ] Add deployment verification
- [ ] Add post-deployment checks

#### 1.3 Update Hardhat Config
- [ ] Add BSC Mainnet network configuration
- [ ] Set correct chain ID (56)
- [ ] Configure gas settings
- [ ] Add BSCScan API key for verification

### Phase 2: Security Verification

#### 2.1 Code Review
- [ ] Review all contract code one final time
- [ ] Verify no testnet-specific code remains
- [ ] Check all addresses are parameterized
- [ ] Verify fee percentages are correct (1%)
- [ ] Confirm vesting schedules are accurate

#### 2.2 Test Suite
- [ ] Run full test suite: `npx hardhat test`
- [ ] Verify all 323 tests pass
- [ ] Run coverage report: `npx hardhat coverage`
- [ ] Check gas optimization
- [ ] Run security checks

#### 2.3 Deployment Simulation
- [ ] Test deployment on local network
- [ ] Verify all configurations
- [ ] Test initial distribution
- [ ] Test vesting schedules
- [ ] Test fee mechanism

### Phase 3: Documentation

#### 3.1 Deployment Documentation
- [ ] Create deployment runbook
- [ ] Document all wallet addresses
- [ ] Document all API keys (securely)
- [ ] Create rollback plan
- [ ] Document emergency procedures

#### 3.2 Team Preparation
- [ ] Brief all team members
- [ ] Assign roles and responsibilities
- [ ] Set up communication channels
- [ ] Schedule deployment time
- [ ] Prepare monitoring dashboard

---

## 🚀 Deployment Day Checklist

### Pre-Deployment (1 hour before)

#### System Checks
- [ ] Verify deployer wallet has sufficient BNB (0.15+ BNB)
- [ ] Check BSC Mainnet status (no issues)
- [ ] Verify gas prices are reasonable
- [ ] Test RPC connection
- [ ] Verify BSCScan API is working

#### Team Readiness
- [ ] All team members available
- [ ] Communication channels open
- [ ] Monitoring tools ready
- [ ] Emergency contacts confirmed
- [ ] Backup plan reviewed

### Deployment Execution

#### Step 1: Deploy Contract (15 minutes)
```bash
# Deploy to BSC Mainnet
npx hardhat run scripts/deployment/deploy-mainnet.js --network bscMainnet
```

**Expected Output:**
- ✅ Contract deployed successfully
- ✅ Contract address: 0x...
- ✅ Transaction hash: 0x...
- ✅ Gas used: ~4,400,000
- ✅ Cost: ~0.091 BNB

**Verification:**
- [ ] Contract deployed successfully
- [ ] Transaction confirmed on BSCScan
- [ ] Contract address saved
- [ ] Deployment cost within budget

#### Step 2: Verify Contract (10 minutes)
```bash
# Verify on BSCScan
npx hardhat verify --network bscMainnet 0xc66404C3fa3E01378027b4A4411812D3a8D458F5
```

**Verification:**
- [ ] Contract verified on BSCScan
- [ ] Source code visible
- [ ] Read/Write functions accessible
- [ ] Contract name correct

#### Step 3: Initial Configuration (30 minutes)

**3.1 Configure Admin Wallets**
```bash
# Run configuration script
npx hardhat run scripts/deployment/configure-mainnet.js --network bscMainnet
```

**Verification:**
- [ ] MAD wallet configured (10M SYL)
- [ ] LEB wallet configured (10M SYL)
- [ ] CNK wallet configured (10M SYL)
- [ ] KDR wallet configured (10M SYL)
- [ ] All vesting schedules created

**3.2 Configure Locked Reserve**
- [ ] Locked reserve configured (300M SYL)
- [ ] 34-month vesting schedule created
- [ ] 10% burn mechanism active

**3.3 Process Initial Releases**
- [ ] MAD initial release (2M SYL - 20%)
- [ ] LEB initial release (2M SYL - 20%)
- [ ] CNK initial release (2M SYL - 20%)
- [ ] KDR initial release (2M SYL - 20%)

#### Step 4: Token Distribution (20 minutes)

**4.1 Main Distribution**
```bash
# Run distribution script
npx hardhat run scripts/deployment/distribute-mainnet.js --network bscMainnet
```

**Verification:**
- [ ] Founder wallet: 160M SYL ✅
- [ ] Sylvan Token wallet: 500M SYL ✅
- [ ] Total distributed: 660M SYL
- [ ] Remaining in contract: 340M SYL (admin + locked)

**4.2 Set Fee Exemptions**
- [ ] Owner wallet exempt
- [ ] Founder wallet exempt
- [ ] Sylvan Token wallet exempt
- [ ] Fee collection wallet exempt
- [ ] Donations wallet exempt
- [ ] All admin wallets exempt

#### Step 5: Transfer Ownership (5 minutes)

**If Multi-Sig Ready:**
```javascript
await token.transferOwnership(MULTISIG_ADDRESS);
```

**If Multi-Sig Not Ready:**
- [ ] Keep ownership with deployer temporarily
- [ ] Document plan to transfer later
- [ ] Set reminder to transfer within 24 hours

**Verification:**
- [ ] Ownership transferred successfully
- [ ] New owner confirmed
- [ ] Old owner cannot execute owner functions

### Post-Deployment Verification (30 minutes)

#### Contract Verification
- [ ] Total supply: 1,000,000,000 SYL ✅
- [ ] Decimals: 18 ✅
- [ ] Name: "Sylvan Token" ✅
- [ ] Symbol: "SYL" ✅
- [ ] Fee rate: 1% ✅

#### Balance Verification
- [ ] Founder: 160M SYL
- [ ] Sylvan Token: 500M SYL
- [ ] MAD: 2M SYL (initial release)
- [ ] LEB: 2M SYL (initial release)
- [ ] CNK: 2M SYL (initial release)
- [ ] KDR: 2M SYL (initial release)
- [ ] Contract: 332M SYL (remaining vested)

#### Function Verification
- [ ] Transfer works correctly
- [ ] Fee deduction works (1%)
- [ ] Fee distribution works (50/25/25)
- [ ] Vesting schedules accessible
- [ ] Owner functions restricted

#### Monitoring Setup
- [ ] Add contract to Tenderly
- [ ] Configure alerts
- [ ] Set up dashboard
- [ ] Test notifications
- [ ] Monitor first transactions

---

## 📊 Post-Deployment Tasks

### Immediate (Day 1)

#### Documentation
- [ ] Update README with contract address
- [ ] Update WHITEPAPER with deployment details
- [ ] Create deployment report
- [ ] Document all transaction hashes
- [ ] Update CHANGELOG

#### Communication
- [ ] Announce deployment to team
- [ ] Prepare community announcement
- [ ] Update website with contract address
- [ ] Update social media
- [ ] Notify exchanges (if applicable)

#### Monitoring
- [ ] Monitor all transactions
- [ ] Check fee distribution
- [ ] Verify vesting schedules
- [ ] Watch for unusual activity
- [ ] Respond to any issues immediately

### Short-Term (Week 1)

#### Trading Preparation
- [ ] Test transfers between wallets
- [ ] Verify fee mechanism
- [ ] Test vesting releases
- [ ] Prepare for trading activation
- [ ] Community education

#### Security
- [ ] Monitor for vulnerabilities
- [ ] Check for unusual patterns
- [ ] Review all large transactions
- [ ] Update security documentation
- [ ] Prepare incident response

### Long-Term (Month 1+)

#### Enhancement
- [ ] Launch bug bounty program
- [ ] Set up regular audits
- [ ] Community feedback collection
- [ ] Performance optimization
- [ ] Feature development

---

## 🚨 Emergency Procedures

### If Deployment Fails

1. **STOP immediately**
2. **DO NOT retry** without investigation
3. **Check error message** carefully
4. **Verify all inputs** are correct
5. **Contact team** for review
6. **Document the issue**
7. **Fix and retry** only after approval

### If Configuration Fails

1. **Document the error**
2. **Check transaction on BSCScan**
3. **Verify wallet addresses**
4. **Check gas and BNB balance**
5. **Retry specific step** if safe
6. **Escalate if unsure**

### If Post-Deployment Issue Found

1. **Assess severity** (Critical/High/Medium/Low)
2. **Notify team immediately** if Critical/High
3. **Document the issue** thoroughly
4. **Prepare fix** if possible
5. **Test fix** on testnet first
6. **Execute fix** via multi-sig if available

---

## ✅ Success Criteria

### Deployment Success
- ✅ Contract deployed without errors
- ✅ Contract verified on BSCScan
- ✅ All configurations correct
- ✅ Token distribution complete
- ✅ Ownership transferred (if multi-sig ready)

### Operational Success
- ✅ All functions working correctly
- ✅ Fee mechanism operational
- ✅ Vesting schedules active
- ✅ Monitoring in place
- ✅ Team trained and ready

### Security Success
- ✅ No vulnerabilities detected
- ✅ All security measures active
- ✅ Emergency procedures documented
- ✅ Monitoring alerts configured
- ✅ Incident response ready

---

## 📞 Emergency Contacts

### Internal Team
- **Founder:** [To be provided]
- **Technical Lead:** [To be provided]
- **Security Officer:** [To be provided]

### External Support
- **BSCScan Support:** https://bscscan.com/contactus
- **Binance Support:** https://www.binance.com/en/support
- **Gnosis Safe Support:** support@safe.global

---

## 📝 Notes

### Important Reminders
- ⚠️ **NEVER share private keys**
- ⚠️ **Always verify addresses** before sending
- ⚠️ **Test on testnet first** if unsure
- ⚠️ **Keep backups** of all important data
- ⚠️ **Document everything** during deployment

### Cost Estimates
- **Contract Deployment:** ~0.091 BNB (~$27)
- **Initial Configuration:** ~0.03 BNB (~$9)
- **Token Distribution:** ~0.02 BNB (~$6)
- **Buffer:** ~0.009 BNB (~$3)
- **Total Required:** ~0.15 BNB (~$45)

### Timeline Estimates
- **Preparation:** 2-3 hours
- **Deployment:** 1.5 hours
- **Verification:** 30 minutes
- **Total:** ~4 hours

---

## 🎯 Ready to Deploy?

### Before You Start, Confirm:
- [ ] I have read this entire checklist
- [ ] I have all required information ready
- [ ] I understand the deployment process
- [ ] I have sufficient BNB for deployment
- [ ] I have tested on testnet successfully
- [ ] I have team support available
- [ ] I am ready to proceed

### When Ready, Provide:
1. **Deployer Private Key** (securely)
2. **All Wallet Addresses** (verified)
3. **BSCScan API Key**
4. **Mainnet RPC URL**
5. **Confirmation to proceed**

---

**Status:** ⏳ AWAITING USER INPUT  
**Next Step:** User to provide required information  
**Document Version:** 1.0.0  
**Last Updated:** November 10, 2025

