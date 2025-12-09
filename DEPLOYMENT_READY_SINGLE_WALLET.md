# Deployment Ready - Single Wallet Configuration

**Date:** November 11, 2025-  
**Configuration:** Single Wallet (Deployer = Owner)  
**Status:** ✅ Ready for Deployment

## Configuration Summary

### Wallet Configuration
- **Wallet Address:** `0x465b54282e4885f61df7eB7CcDc2493DB35C9501`
- **Wallet Name:** Founder Wallet
- **Wallet Type:** Trust Wallet (Mobile Hot Wallet)
- **Role:** Deployer AND Owner (same wallet)
- **Private Key:** Configured in `.env` file

### Deployment Approach
- ✅ **Single Wallet Deployment:** Same wallet deploys and owns the contract
- ✅ **No Ownership Transfer:** Deployer remains as owner
- ✅ **Simplified Process:** One wallet, one transaction
- ⚠️ **Security Note:** Wallet must be secured properly (see below)

## Environment Configuration

### Current `.env` Settings
```bash
# Deployer and Owner are the SAME wallet
DEPLOYER_ADDRESS=0x465b54282e4885f61df7eB7CcDc2493DB35C9501
OWNER_ADDRESS=0x465b54282e4885f61df7eB7CcDc2493DB35C9501
OWNER_WALLET_TYPE=standard

# Private key for deployment
DEPLOYER_PRIVATE_KEY=4ced200ff617910aadd091dffcef1e7cb280ee51b86e5e1eecff18e921329452

# BSCScan API key for verification
BSCSCAN_API_KEY=N8R5NJSDH686DGNJ85EJZP3IGG3GTU2UE4
```

## Pre-Deployment Checklist

### Wallet Preparation
- [ ] **BNB Balance:** Ensure wallet has at least 0.2 BNB for gas fees
- [ ] **Private Key:** Confirmed in `.env` file
- [ ] **Wallet Access:** Can access Trust Wallet for confirmation
- [ ] **Network:** Set to BSC Mainnet in Trust Wallet

### Security Preparation
- [ ] **Trust Wallet Security:**
  - [ ] App PIN/password enabled
  - [ ] Biometric authentication enabled
  - [ ] Transaction confirmation enabled
  - [ ] App updated to latest version

- [ ] **Phone Security:**
  - [ ] Strong lock screen password
  - [ ] OS updated to latest version
  - [ ] No suspicious apps installed
  - [ ] Antivirus/security software active

- [ ] **Backup Security:**
  - [ ] Recovery phrase written on paper
  - [ ] Stored in fireproof safe
  - [ ] Never shared with anyone
  - [ ] Tested recovery on testnet

### Configuration Verification
- [ ] **Addresses Match:** Deployer and owner are the same
- [ ] **Network Config:** BSC Mainnet RPC configured
- [ ] **API Keys:** BSCScan API key configured
- [ ] **Contract Code:** Latest version compiled

## Deployment Commands

### Option 1: Standard Deployment (Recommended)
Use the existing mainnet deployment script:

```bash
# Deploy to BSC Mainnet
npx hardhat run scripts/deployment/deploy-mainnet.js --network bscMainnet
```

**What This Does:**
- Deploys contract with deployer wallet
- Deployer automatically becomes owner (no transfer needed)
- Configures all initial settings
- Saves deployment record

### Option 2: Deployment with Ownership Transfer Script
Even though we're not transferring, this script will work:

```bash
# Deploy (will skip transfer since addresses are same)
npx hardhat run scripts/deployment/deploy-with-ownership-transfer.js --network bscMainnet
```

**What This Does:**
- Deploys contract with deployer wallet
- Detects that deployer = owner
- Skips ownership transfer step
- Saves deployment record

### Option 3: Complete Setup Script
For full deployment with configuration:

```bash
# Complete deployment and setup
npx hardhat run scripts/deployment/complete-mainnet-setup.js --network bscMainnet
```

**What This Does:**
- Deploys contract
- Configures admin wallets
- Sets up vesting schedules
- Distributes tokens
- Enables trading

## Post-Deployment Verification

### Immediate Verification
```bash
# Check deployment status
npx hardhat run scripts/deployment/check-mainnet-status.js --network bscMainnet

# Verify ownership
npx hardhat run scripts/utils/verify-ownership.js --network bscMainnet

# Check trading status
npx hardhat run scripts/deployment/check-trading-status.js --network bscMainnet
```

### Contract Verification on BSCScan
```bash
# Verify contract source code
npx hardhat run scripts/deployment/verify-mainnet.js --network bscMainnet

# Or use simple verification
npx hardhat run scripts/deployment/simple-verify.js --network bscMainnet
```

## Expected Deployment Flow

### Step 1: Contract Deployment
```
📝 Deploying SylvanToken...
💰 Deployer: 0x465b54282e4885f61df7eB7CcDc2493DB35C9501
🔐 Owner: 0x465b54282e4885f61df7eB7CcDc2493DB35C9501 (same as deployer)
⚙️  Deploying contract...
✅ Contract deployed at: 0x...
💵 Gas used: ~0.08 BNB
```

### Step 2: Initial Configuration
```
⚙️  Configuring contract...
✅ Fee wallets set
✅ Donation wallet set
✅ Fee exemptions configured
✅ Initial distribution complete
```

### Step 3: Verification
```
🔍 Verifying deployment...
✅ Contract deployed successfully
✅ Owner is correct: 0x465b54282e4885f61df7eB7CcDc2493DB35C9501
✅ Total supply: 1,000,000,000 SYL
✅ Configuration verified
```

## Security Considerations

### Single Wallet Risks
⚠️ **Important:** Using the same wallet for deployment and ownership means:

**Risks:**
- Single point of failure
- If wallet is compromised, attacker has full control
- No separation between deployment and admin operations
- Wallet must remain secure long-term

**Mitigations:**
1. **Strong Security Practices:**
   - Enable all Trust Wallet security features
   - Keep phone secure and updated
   - Never share private key or recovery phrase
   - Regular security audits

2. **Future Upgrade Path:**
   - Plan to transfer ownership to hardware wallet (1-3 months)
   - Consider multisig for team operations (3-6 months)
   - Implement governance mechanisms

3. **Operational Security:**
   - Use wallet only for admin operations
   - Verify all transactions carefully
   - Monitor wallet activity regularly
   - Keep backup access methods

### Acceptable Use Cases
✅ **This configuration is acceptable for:**
- Initial mainnet deployment
- Testing and development
- Low-to-medium value contracts
- Short-term use with upgrade plan

⚠️ **Consider upgrading for:**
- Long-term mainnet deployment (>6 months)
- High-value contracts (>$100k)
- Contracts holding user funds
- Critical production systems

## Deployment Scenarios

### Scenario 1: Fresh Deployment
If this is a new deployment:
```bash
# 1. Compile contracts
npx hardhat compile

# 2. Deploy to mainnet
npx hardhat run scripts/deployment/deploy-mainnet.js --network bscMainnet

# 3. Verify on BSCScan
npx hardhat run scripts/deployment/verify-mainnet.js --network bscMainnet

# 4. Check status
npx hardhat run scripts/deployment/check-mainnet-status.js --network bscMainnet
```

### Scenario 2: Re-deployment
If you need to redeploy:
```bash
# 1. Backup old deployment data
cp deployments/mainnet-deployment.json deployments/mainnet-deployment-backup.json

# 2. Deploy new contract
npx hardhat run scripts/deployment/deploy-mainnet.js --network bscMainnet

# 3. Update all references to new contract address
# 4. Verify new deployment
```

### Scenario 3: Deployment with Full Setup
If you want complete setup in one go:
```bash
# Run complete setup script
npx hardhat run scripts/deployment/complete-mainnet-setup.js --network bscMainnet
```

## Troubleshooting

### Common Issues

**Issue 1: Insufficient BNB Balance**
```
Error: insufficient funds for gas
```
**Solution:** Add at least 0.2 BNB to deployer wallet

**Issue 2: Network Connection**
```
Error: could not detect network
```
**Solution:** Check BSC_MAINNET_RPC in .env file

**Issue 3: Private Key Error**
```
Error: invalid private key
```
**Solution:** Verify DEPLOYER_PRIVATE_KEY in .env file

**Issue 4: Contract Already Deployed**
```
Error: contract already deployed
```
**Solution:** Check if contract exists, or use different deployment script

## Post-Deployment Actions

### Immediate Actions (First 24 Hours)
1. **Verify Deployment:**
   - Check contract on BSCScan
   - Verify ownership
   - Test admin functions

2. **Configure Contract:**
   - Set up admin wallets
   - Configure vesting schedules
   - Enable trading

3. **Security Check:**
   - Verify all settings
   - Test fee mechanism
   - Check exemptions

### Short-Term Actions (First Week)
1. **Monitor Activity:**
   - Watch for unusual transactions
   - Check wallet balances
   - Monitor gas usage

2. **Community Communication:**
   - Announce deployment
   - Share contract address
   - Provide verification links

3. **Documentation:**
   - Update all documentation
   - Record deployment details
   - Create audit trail

### Long-Term Actions (1-3 Months)
1. **Security Upgrade:**
   - Research hardware wallets
   - Plan ownership transfer
   - Test on testnet first

2. **Governance:**
   - Implement governance mechanisms
   - Community involvement
   - Transparent operations

## Support and Resources

### Documentation
- [Production Deployment Guide](./PRODUCTION_DEPLOYMENT_MASTER_GUIDE.md)
- [Security Documentation](./docs/SECURITY.md)
- [Wallet Security Notice](./WALLET_TYPE_SECURITY_NOTICE.md)

### Scripts
- Deployment: `scripts/deployment/`
- Utilities: `scripts/utils/`
- Management: `scripts/management/`

### Emergency Contacts
- Technical Support: dev@sylvantoken.org
- Security Issues: security@sylvantoken.org

## Summary

✅ **Configuration:** Single wallet (deployer = owner)  
✅ **Wallet:** 0x465b54282e4885f61df7eB7CcDc2493DB35C9501 (Founder Wallet)  
✅ **Type:** Trust Wallet (standard mobile wallet)  
✅ **Ready:** All configurations complete  
⚠️ **Security:** Ensure all security measures are in place  
📋 **Next Step:** Run deployment command

**Recommended Deployment Command:**
```bash
npx hardhat run scripts/deployment/deploy-mainnet.js --network bscMainnet
```

---

**Configuration Version:** 1.0.9  
**Last Updated:** November 11, 2025-  
**Deployment Status:** Ready  
**Security Level:** 🟡 Medium (Single Wallet)
