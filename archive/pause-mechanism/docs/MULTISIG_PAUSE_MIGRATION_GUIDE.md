# Multi-Sig Pause Migration Guide

## Overview

This guide documents the complete upgrade path from single-owner pause mechanism to multi-signature pause mechanism for SylvanToken. It covers migration procedures, rollback options, and best practices for a safe transition.

**Requirements Addressed**: 7.1 (Backward Compatibility), 7.5 (Library Integration)

## Table of Contents

1. [Pre-Migration Checklist](#pre-migration-checklist)
2. [Migration Scenarios](#migration-scenarios)
3. [Step-by-Step Migration](#step-by-step-migration)
4. [Post-Migration Verification](#post-migration-verification)
5. [Rollback Procedures](#rollback-procedures)
6. [Troubleshooting](#troubleshooting)
7. [Security Considerations](#security-considerations)

---

## Pre-Migration Checklist

Before starting the migration, ensure the following:

### Contract State
- [ ] Contract is NOT currently paused
- [ ] No pending administrative operations
- [ ] All vesting releases are up to date
- [ ] No active emergency situations

### Access Requirements
- [ ] Access to contract owner private key
- [ ] Sufficient BNB for gas fees (minimum 0.1 BNB recommended)
- [ ] All new signer addresses are verified and secure

### Configuration Prepared
- [ ] List of authorized signers (2-10 addresses)
- [ ] Quorum threshold determined (minimum 2)
- [ ] Timelock duration decided (6-48 hours)
- [ ] Max pause duration set (7-30 days)

### Environment Setup
- [ ] Node.js v16+ installed
- [ ] Dependencies installed (`npm install`)
- [ ] `.env` file configured with:
  - `PRIVATE_KEY` - Contract owner private key
  - `CONTRACT_ADDRESS` - Deployed contract address
  - `BSC_MAINNET_RPC` or `BSC_TESTNET_RPC` - Network RPC URL

---

## Migration Scenarios

### Scenario 1: New Deployment with Multi-Sig

For new contract deployments, multi-sig pause is configured during deployment:

```bash
# Deploy with multi-sig pause enabled
npx hardhat run scripts/deployment/deploy-multisig-pause.js --network bscMainnet
```

Configuration in `config/deployment.config.js`:
```javascript
multiSigPause: {
    deploymentConfig: {
        enabled: true
    },
    authorizedSigners: [
        { address: "0x...", role: "Primary Signer" },
        { address: "0x...", role: "Secondary Signer" },
        { address: "0x...", role: "Backup Signer" }
    ],
    parameters: {
        quorumThreshold: 2,
        timelockDuration: 86400,      // 24 hours
        maxPauseDuration: 1209600,    // 14 days
        proposalLifetime: 1209600,    // 14 days
        proposalCooldown: 21600       // 6 hours
    }
}
```

### Scenario 2: Upgrade Existing Deployment

For existing contracts, use the migration script:

```bash
# Set environment variables
export CONTRACT_ADDRESS=0x...
export CONFIRM_MIGRATION=true

# Run migration
npx hardhat run scripts/migration/migrate-to-multisig-pause.js --network bscMainnet
```

### Scenario 3: Testnet Migration First

Recommended approach - test on BSC Testnet before mainnet:

```bash
# 1. Deploy to testnet
npx hardhat run scripts/deployment/deploy-multisig-pause.js --network bscTestnet

# 2. Test all functionality
npx hardhat test test/deployment-multisig-pause.test.js

# 3. Verify migration script
export CONTRACT_ADDRESS=<testnet_address>
npx hardhat run scripts/migration/migrate-to-multisig-pause.js --network bscTestnet

# 4. After successful testing, proceed to mainnet
```

---

## Step-by-Step Migration

### Step 1: Backup Current State

```bash
# Create backup of current contract state
export ROLLBACK_TYPE=status
npx hardhat run scripts/migration/rollback-multisig-pause.js --network bscMainnet
```

This generates a backup report in `deployments/migration-backup-*.json`.

### Step 2: Configure Multi-Sig Parameters

Edit `config/deployment.config.js`:

```javascript
multiSigPause: {
    deploymentConfig: {
        enabled: true,
        validateOnDeploy: true
    },
    authorizedSigners: [
        {
            address: "0x1234567890123456789012345678901234567890",
            role: "CEO",
            description: "Primary decision maker"
        },
        {
            address: "0x2345678901234567890123456789012345678901",
            role: "CTO",
            description: "Technical lead"
        },
        {
            address: "0x3456789012345678901234567890123456789012",
            role: "Security Officer",
            description: "Security oversight"
        }
    ],
    parameters: {
        quorumThreshold: 2,           // 2 of 3 required
        timelockDuration: 86400,      // 24 hours
        maxPauseDuration: 1209600,    // 14 days
        proposalLifetime: 1209600,    // 14 days
        proposalCooldown: 21600       // 6 hours
    }
}
```

### Step 3: Validate Configuration

```bash
# Validate configuration before migration
npx hardhat run scripts/deployment/validate-config.js --network bscMainnet
```

Expected output:
```
✓ All signer addresses are valid
✓ Quorum threshold is within bounds (2-10)
✓ Timelock duration is within bounds (6-48 hours)
✓ Max pause duration is within bounds (7-30 days)
✓ Configuration is valid for migration
```

### Step 4: Execute Migration

```bash
# Set required environment variables
export CONTRACT_ADDRESS=0x...
export CONFIRM_MIGRATION=true
export AUTO_CONFIRM=false  # Set to true for automated pipelines

# Execute migration
npx hardhat run scripts/migration/migrate-to-multisig-pause.js --network bscMainnet
```

Migration output:
```
🔄 Multi-Sig Pause Migration Script
======================================================================
Migrating from single-owner pause to multi-signature pause mechanism

Migration account: 0x...
Account balance: 1.5 BNB
Network: bscMainnet

📋 Step 1: Pre-Migration Validation
--------------------------------------------------
  Contract owner: 0x...
  ✓ Owner verification passed
  Current pause state: NOT PAUSED
  ✓ Multi-sig not yet initialized
  Token: SylvanToken ( ESYL )
  Total Supply: 1000000000.0

  ✓ Pre-migration validation passed

💾 Step 2: Creating Backup Report
--------------------------------------------------
  Backup saved to: deployments/migration-backup-bscMainnet-1234567890.json

⚙️ Step 3: Loading Multi-Sig Configuration
--------------------------------------------------
  Authorized Signers: 3
    1. 0x1234...
    2. 0x2345...
    3. 0x3456...
  Quorum Threshold: 2
  Timelock Duration: 86400 seconds ( 24 hours)
  Max Pause Duration: 1209600 seconds ( 14 days)

⚠️ Step 4: Migration Confirmation
--------------------------------------------------
  This migration will:
    1. Initialize multi-sig pause mechanism
    2. Add authorized signers
    3. Configure timelock and quorum parameters
    4. Replace single-owner pause with multi-sig pause

🔧 Step 5: Executing Migration
--------------------------------------------------
  Initializing multi-sig pause mechanism...
  Transaction hash: 0x...
  Waiting for confirmations...
  ✓ Multi-sig pause initialized in block 12345678
  Gas used: 245000

✅ Step 6: Post-Migration Validation
--------------------------------------------------
  ✓ Signer count verified: 3
  ✓ All signers verified as authorized
  ✓ Quorum threshold verified: 2
  ✓ Timelock duration verified: 86400 seconds
  ✓ Pause state: NOT PAUSED

📊 Step 7: Generating Migration Report
--------------------------------------------------
  Migration report saved to: deployments/migration-report-bscMainnet-1234567890.json
  Markdown report saved to: deployments/migration-report-bscMainnet-1234567890.md

🎉 Migration Completed Successfully!
======================================================================
```

### Step 5: Verify Migration

```bash
# Check current status
export ROLLBACK_TYPE=status
npx hardhat run scripts/migration/rollback-multisig-pause.js --network bscMainnet
```

---

## Post-Migration Verification

### Verification Checklist

After migration, verify the following:

#### 1. Signer Configuration
```javascript
// Verify all signers are authorized
const signers = await token.getAuthorizedSigners();
console.log("Authorized Signers:", signers);

for (const signer of expectedSigners) {
    const isAuthorized = await token.isAuthorizedSigner(signer);
    console.log(`${signer}: ${isAuthorized ? '✓' : '✗'}`);
}
```

#### 2. Configuration Parameters
```javascript
const config = await token.getMultiSigConfig();
console.log("Quorum:", config.quorumThreshold.toString());
console.log("Timelock:", config.timelockDuration.toString(), "seconds");
console.log("Max Pause:", config.maxPauseDuration.toString(), "seconds");
```

#### 3. Pause Functionality Test (Testnet Only)
```bash
# Create a test pause proposal
npx hardhat run scripts/management/create-pause-proposal.js --network bscTestnet

# Have other signers approve
npx hardhat run scripts/management/approve-pause-proposal.js --network bscTestnet

# Wait for timelock and execute
npx hardhat run scripts/management/execute-pause-proposal.js --network bscTestnet

# Verify pause state
# Then create unpause proposal and execute
```

#### 4. Transfer Functionality
```javascript
// Verify transfers still work when not paused
const tx = await token.transfer(recipient, amount);
await tx.wait();
console.log("Transfer successful");
```

---

## Rollback Procedures

### Emergency Unpause

If the contract is stuck in paused state:

```bash
export ROLLBACK_TYPE=emergency-unpause
export CONFIRM_EMERGENCY=true
npx hardhat run scripts/migration/rollback-multisig-pause.js --network bscMainnet
```

This will:
1. Check if auto-unpause is available (max duration exceeded)
2. Create an unpause proposal if authorized
3. Provide instructions for other signers to approve

### Signer Reconfiguration

If signers are compromised or unavailable:

```bash
export ROLLBACK_TYPE=reconfigure-signers
export NEW_SIGNERS=0xNewSigner1,0xNewSigner2,0xNewSigner3
export CONFIRM_RECONFIGURE=true
npx hardhat run scripts/migration/rollback-multisig-pause.js --network bscMainnet
```

**Note**: Only the contract owner can reconfigure signers.

### Clear Pending Proposals

To cancel all pending proposals:

```bash
export ROLLBACK_TYPE=clear-proposals
export CONFIRM_CLEAR=true
npx hardhat run scripts/migration/rollback-multisig-pause.js --network bscMainnet
```

### Soft Rollback (Single-Owner Mode)

To effectively return to single-owner operation without deploying a new contract:

1. Remove all signers except owner
2. Set quorum to 1 (minimum)
3. Set timelock to minimum (6 hours)

```bash
# Configure for soft rollback
export NEW_SIGNERS=<owner_address>
export ROLLBACK_TYPE=reconfigure-signers
export CONFIRM_RECONFIGURE=true
npx hardhat run scripts/migration/rollback-multisig-pause.js --network bscMainnet

# Then update quorum (requires contract call)
# await token.updateQuorumThreshold(1);
```

### Full Rollback (New Contract)

For complete rollback to single-owner pause:

```bash
export ROLLBACK_TYPE=full-rollback
npx hardhat run scripts/migration/rollback-multisig-pause.js --network bscMainnet
```

This displays instructions for:
1. Deploying a new contract without multi-sig
2. Migrating tokens to new contract
3. Updating integrations
4. Deprecating old contract

**⚠️ Warning**: Full rollback requires deploying a new contract and migrating all tokens.

---

## Troubleshooting

### Common Issues

#### Issue: "Multi-sig already initialized"
```
Error: Multi-sig already initialized. Set FORCE_UPGRADE=true to reconfigure.
```

**Solution**: 
```bash
export FORCE_UPGRADE=true
npx hardhat run scripts/migration/migrate-to-multisig-pause.js --network bscMainnet
```

#### Issue: "Deployer is not the contract owner"
```
Error: Deployer is not the contract owner
```

**Solution**: Use the correct private key for the contract owner account.

#### Issue: "Insufficient funds"
```
Error: insufficient funds for gas
```

**Solution**: Ensure the account has at least 0.1 BNB for gas fees.

#### Issue: "Invalid signer address"
```
Error: Invalid signer address at index X
```

**Solution**: Verify all signer addresses in configuration are valid Ethereum addresses.

#### Issue: "Quorum exceeds signer count"
```
Error: InvalidQuorumThreshold
```

**Solution**: Ensure quorum threshold is less than or equal to the number of signers.

### Recovery Procedures

#### Stuck Transaction
If a migration transaction is stuck:
1. Wait for transaction to timeout (usually 15-30 minutes)
2. Increase gas price and retry
3. Or cancel with a 0-value transaction with same nonce

#### Lost Signer Access
If a signer loses access to their wallet:
1. Owner can remove the compromised signer
2. Add a replacement signer
3. Ensure quorum can still be met

#### All Signers Unavailable
If all signers become unavailable:
1. Wait for auto-unpause (max pause duration)
2. Contract will automatically unpause
3. Owner can then reconfigure signers

---

## Security Considerations

### Before Migration

1. **Verify Signer Identities**: Ensure all signer addresses belong to trusted individuals
2. **Secure Key Storage**: All signers should use hardware wallets
3. **Geographic Distribution**: Signers should be in different locations
4. **Communication Channels**: Establish secure communication between signers

### During Migration

1. **Test on Testnet First**: Always test migration on BSC Testnet
2. **Verify Transaction Details**: Double-check all parameters before confirming
3. **Monitor Gas Prices**: Avoid migration during high gas periods
4. **Keep Backup**: Save all backup reports generated

### After Migration

1. **Verify All Parameters**: Check all configuration matches expected values
2. **Test Pause Workflow**: Run through complete pause/unpause cycle on testnet
3. **Document Signers**: Maintain secure records of signer identities
4. **Set Up Monitoring**: Configure alerts for pause-related events
5. **Regular Audits**: Periodically review signer list and access

### Emergency Procedures

1. **Emergency Contact List**: Maintain contact info for all signers
2. **Backup Signers**: Have backup signers ready if primary signers unavailable
3. **Auto-Unpause Awareness**: Know the max pause duration for your deployment
4. **Owner Access**: Ensure owner can always reconfigure signers if needed

---

## Related Documentation

- [Multi-Sig Pause Guide](./MULTISIG_PAUSE_GUIDE.md) - Complete usage guide
- [Security Guide](./SECURITY.md) - Security best practices
- [Deployment Guide](./ENHANCED_DEPLOYMENT_GUIDE.md) - Deployment instructions
- [API Reference](./ENHANCED_API_REFERENCE.md) - Contract interfaces

---

**Migration Guide Version**: 1.0.0  
**Last Updated**: December 2025  
**Compatible With**: SylvanToken v1.1.0+
