# Emergency Ownership Recovery Guide

## Overview

This guide provides comprehensive instructions for recovering ownership of the SylvanToken contract in emergency situations. The emergency recovery utility should only be used when standard ownership management procedures are not available or have failed.

**⚠️ WARNING: Emergency recovery procedures should only be used in critical situations. All recovery actions are logged and audited.**

## Table of Contents

- [When to Use Emergency Recovery](#when-to-use-emergency-recovery)
- [Prerequisites](#prerequisites)
- [Recovery Scenarios](#recovery-scenarios)
- [Recovery Procedures](#recovery-procedures)
- [Post-Recovery Steps](#post-recovery-steps)
- [Troubleshooting](#troubleshooting)
- [Support Information](#support-information)

## When to Use Emergency Recovery

Emergency recovery should be used in the following situations:

### Critical Scenarios

1. **Lost Access to Owner Wallet**
   - Private key lost or corrupted
   - Hardware wallet damaged or inaccessible
   - Multisig signers unavailable

2. **Compromised Owner Wallet**
   - Private key exposed or stolen
   - Suspicious activity detected
   - Immediate ownership transfer required

3. **Failed Standard Transfer**
   - Standard ownership transfer script failed
   - Transaction reverted unexpectedly
   - Network issues during transfer

4. **Contract State Issues**
   - Owner address verification failed
   - Unexpected ownership state
   - Need to verify and correct ownership

### Non-Emergency Situations

**Do NOT use emergency recovery for:**
- Planned ownership transfers (use standard transfer script)
- Routine ownership verification (use verify-ownership script)
- Testing or development (use testnet)

## Prerequisites

### Required Information

Before starting recovery, gather the following information:

1. **Contract Address**
   - Deployed SylvanToken contract address
   - Verify on BSCScan

2. **Current Owner Information**
   - Current owner address
   - Access to current owner's private key
   - Or recovery phrase for hardware wallet

3. **New Owner Information**
   - New owner address (verified and checksummed)
   - Confirmation that new owner wallet is accessible
   - New owner wallet type (EOA, hardware wallet, multisig)

4. **Network Information**
   - Network name (BSC Mainnet, BSC Testnet, etc.)
   - RPC endpoint URL
   - Current network status

### Required Access

- **Private Key**: Current owner's private key or recovery phrase
- **BNB Balance**: Sufficient BNB for gas fees (minimum 0.01 BNB recommended)
- **Network Access**: Stable internet connection and RPC access

### Required Tools

- Node.js (v16 or higher)
- Hardhat environment configured
- Emergency recovery script (`scripts/utils/recover-ownership.js`)

## Recovery Scenarios

### Scenario 1: Lost Access to Owner Wallet

**Situation**: You have lost access to the current owner wallet and need to transfer ownership using a backup key.

**Requirements**:
- Backup private key or recovery phrase
- New secure wallet prepared

**Procedure**:
1. Restore access using backup key
2. Run emergency recovery with verification
3. Transfer to new secure wallet
4. Verify new owner access

**Risk Level**: HIGH - Ensure backup key is valid before proceeding

---

### Scenario 2: Compromised Owner Wallet

**Situation**: The current owner wallet has been compromised and immediate transfer is required.

**Requirements**:
- Access to compromised wallet (if still possible)
- New secure wallet ready
- Fast execution required

**Procedure**:
1. Prepare new secure wallet immediately
2. Run emergency recovery with highest priority
3. Transfer ownership as quickly as possible
4. Monitor for unauthorized transactions

**Risk Level**: CRITICAL - Act immediately, time is critical

---

### Scenario 3: Failed Standard Transfer

**Situation**: Standard ownership transfer failed and needs recovery.

**Requirements**:
- Transaction hash of failed transfer
- Error message or revert reason
- Current owner access still available

**Procedure**:
1. Verify current ownership state
2. Diagnose failure reason
3. Run emergency recovery with verification
4. Confirm successful transfer

**Risk Level**: MEDIUM - Verify state before proceeding

---

### Scenario 4: Ownership Verification and Correction

**Situation**: Need to verify current ownership and correct if necessary.

**Requirements**:
- Contract address
- Expected owner address
- Access to verify ownership

**Procedure**:
1. Run verification only mode
2. Compare with expected owner
3. If mismatch, run recovery if authorized
4. Document findings

**Risk Level**: LOW - Verification only, no changes

## Recovery Procedures

### Step 1: Preparation

1. **Create Backup**
   ```bash
   # The recovery script automatically creates backups
   # But you can manually backup current state
   npx hardhat run scripts/utils/verify-ownership.js --network <network>
   ```

2. **Set Environment Variables**
   ```bash
   # Windows (PowerShell)
   $env:CONTRACT_ADDRESS="0x..."
   $env:RECOVERY_WALLET_KEY="your-private-key"
   $env:NEW_OWNER_ADDRESS="0x..."
   
   # Linux/Mac
   export CONTRACT_ADDRESS="0x..."
   export RECOVERY_WALLET_KEY="your-private-key"
   export NEW_OWNER_ADDRESS="0x..."
   ```

3. **Verify Network Connection**
   ```bash
   npx hardhat run scripts/test-network.js --network <network>
   ```

### Step 2: Run Emergency Recovery

1. **Start Recovery Script**
   ```bash
   npx hardhat run scripts/utils/recover-ownership.js --network <network>
   ```

2. **Select Recovery Option**
   
   The script will present four options:
   
   **Option 1: Standard Ownership Transfer**
   - Use for straightforward transfers
   - Requires current owner's private key
   - Fastest option
   
   **Option 2: Emergency Recovery with Verification**
   - Use for critical situations
   - Includes additional safety checks
   - Verifies new owner can access admin functions
   - **RECOMMENDED for most emergency situations**
   
   **Option 3: Verify Current Ownership Only**
   - Use for diagnosis
   - No changes made
   - Safe to run anytime
   
   **Option 4: Cancel**
   - Exit without changes

3. **Provide Required Information**
   
   If not set in environment variables, you will be prompted for:
   - Contract address
   - New owner address
   
4. **Confirm Recovery Action**
   
   The script will display:
   - Current owner address
   - New owner address
   - Warning about irreversibility
   
   You must type "yes" to confirm.

5. **Wait for Completion**
   
   The script will:
   - Create backup of current state
   - Execute ownership transfer
   - Verify transfer success
   - Log all actions
   - Display summary

### Step 3: Verification

After recovery completes:

1. **Verify New Owner**
   ```bash
   npx hardhat run scripts/utils/verify-ownership.js --network <network>
   ```

2. **Test Admin Functions**
   ```javascript
   // Test that new owner can call admin functions
   const contract = await ethers.getContractAt("SylvanToken", contractAddress);
   const owner = await contract.owner();
   console.log("Current owner:", owner);
   
   // Try to check exemption status (admin function)
   const isExempt = await contract.isExempt(someAddress);
   ```

3. **Check Recovery Logs**
   ```bash
   # View recovery logs
   cat deployments/recovery-logs/recovery-actions.log
   
   # View detailed recovery record
   cat deployments/recovery-logs/recovery-log-<timestamp>.json
   ```

## Post-Recovery Steps

### Immediate Actions (Within 1 Hour)

1. **Verify Ownership Transfer**
   - Confirm new owner address is correct
   - Test admin function access
   - Verify old owner no longer has access

2. **Secure New Owner Wallet**
   - Backup private key securely
   - Store in multiple secure locations
   - Use hardware wallet if possible
   - Configure multisig if applicable

3. **Document Recovery**
   - Record recovery reason
   - Document new owner details
   - Update team documentation
   - Notify relevant stakeholders

4. **Monitor Contract**
   - Watch for any unusual activity
   - Verify all functions work correctly
   - Check that fees are being collected
   - Monitor token transfers

### Short-Term Actions (Within 24 Hours)

1. **Update Configuration**
   - Update `config/deployment.config.js` with new owner
   - Update `.env.example` if needed
   - Update any deployment documentation

2. **Notify Team**
   - Inform development team
   - Notify operations team
   - Update security contacts
   - Document in team wiki/docs

3. **Review Security**
   - Analyze what led to recovery need
   - Implement preventive measures
   - Update security procedures
   - Review access controls

4. **Test Critical Functions**
   - Test fee exemption management
   - Test vesting operations
   - Test emergency functions
   - Verify all admin capabilities

### Long-Term Actions (Within 1 Week)

1. **Security Audit**
   - Review recovery logs
   - Analyze any security issues
   - Update security policies
   - Conduct team training

2. **Process Improvement**
   - Document lessons learned
   - Update recovery procedures
   - Improve backup procedures
   - Enhance monitoring

3. **Backup Verification**
   - Test backup restoration
   - Verify recovery procedures
   - Update disaster recovery plan
   - Schedule regular drills

## Troubleshooting

### Common Issues

#### Issue 1: "Invalid contract address"

**Cause**: Contract address is not valid or not checksummed

**Solution**:
```bash
# Verify address on BSCScan
# Use checksummed address (mixed case)
# Example: 0xAbC123... not 0xabc123...
```

#### Issue 2: "Insufficient funds for transaction"

**Cause**: Current owner wallet has insufficient BNB for gas

**Solution**:
```bash
# Send BNB to current owner wallet
# Minimum 0.01 BNB recommended
# Check balance:
npx hardhat run scripts/check-balance.js --network <network>
```

#### Issue 3: "Ownable: caller is not the owner"

**Cause**: Using wrong private key or wallet

**Solution**:
```bash
# Verify you're using current owner's private key
# Check current owner:
npx hardhat run scripts/utils/verify-ownership.js --network <network>
```

#### Issue 4: "Transaction reverted"

**Cause**: Contract state issue or invalid new owner

**Solution**:
```bash
# Verify new owner address is valid
# Check it's not zero address
# Ensure it's different from current owner
# Try with higher gas limit
```

#### Issue 5: "Network connection failed"

**Cause**: RPC endpoint unavailable or network issues

**Solution**:
```bash
# Check network status
# Try alternative RPC endpoint
# Verify internet connection
# Check hardhat.config.js RPC settings
```

#### Issue 6: "Cannot estimate gas"

**Cause**: Transaction will fail, possibly due to contract restrictions

**Solution**:
```bash
# Verify contract state
# Check if owner can call transferOwnership
# Ensure new owner address is valid
# Review contract for any restrictions
```

### Recovery Failure Scenarios

#### Scenario: Recovery Script Crashes

**Steps**:
1. Check error message in console
2. Review recovery logs in `deployments/recovery-logs/`
3. Verify backup was created
4. Check network connection
5. Retry with verbose logging
6. Contact support if issue persists

#### Scenario: Transfer Succeeds But Verification Fails

**Steps**:
1. Check transaction on BSCScan
2. Verify transaction was confirmed
3. Check if OwnershipTransferred event was emitted
4. Query owner() function directly
5. May be temporary network issue - wait and retry verification

#### Scenario: New Owner Cannot Access Admin Functions

**Steps**:
1. Verify ownership transfer completed
2. Check new owner address is correct
3. Ensure using correct private key for new owner
4. Test with simple view functions first
5. Check gas settings for transactions
6. Verify network connection

## Support Information

### Emergency Contacts

**Development Team**:
- Review recovery logs before contacting
- Provide contract address and network
- Include error messages and transaction hashes
- Have backup files ready

### Required Information for Support

When contacting support, provide:

1. **Contract Information**
   - Contract address
   - Network (mainnet/testnet)
   - Current owner address

2. **Recovery Attempt Details**
   - Recovery option selected
   - Error messages received
   - Transaction hashes (if any)
   - Timestamp of attempt

3. **Log Files**
   - Recovery log file
   - Backup file
   - Console output
   - Any error stack traces

4. **Environment Details**
   - Node.js version
   - Hardhat version
   - Operating system
   - Network RPC endpoint used

### Self-Help Resources

- **Ownership Transfer Guide**: `docs/OWNERSHIP_TRANSFER_GUIDE.md`
- **Deployment Guide**: `PRODUCTION_DEPLOYMENT_MASTER_GUIDE.md`
- **Hardware Wallet Guide**: `docs/HARDWARE_WALLET_INTEGRATION_GUIDE.md`
- **Multisig Guide**: `docs/MULTISIG_WALLET_INTEGRATION_GUIDE.md`
- **Emergency Procedures**: `docs/EMERGENCY_PROCEDURES_GUIDE.md`

### Additional Resources

- **BSCScan**: https://bscscan.com (mainnet) or https://testnet.bscscan.com (testnet)
- **Hardhat Documentation**: https://hardhat.org/docs
- **OpenZeppelin Ownable**: https://docs.openzeppelin.com/contracts/4.x/api/access#Ownable

## Best Practices

### Prevention

1. **Regular Backups**
   - Backup private keys securely
   - Store in multiple locations
   - Use hardware wallets for mainnet
   - Test backup restoration regularly

2. **Access Management**
   - Use multisig for mainnet owner
   - Separate deployer and owner roles
   - Limit access to private keys
   - Regular security audits

3. **Monitoring**
   - Monitor ownership changes
   - Set up alerts for admin functions
   - Regular ownership verification
   - Log all administrative actions

4. **Documentation**
   - Keep recovery procedures updated
   - Document all ownership changes
   - Maintain contact information
   - Regular team training

### During Recovery

1. **Stay Calm**
   - Follow procedures step by step
   - Don't rush critical decisions
   - Verify each step before proceeding
   - Ask for help if unsure

2. **Verify Everything**
   - Double-check all addresses
   - Verify network settings
   - Confirm backup creation
   - Test after recovery

3. **Document Actions**
   - Record all steps taken
   - Save all error messages
   - Keep transaction hashes
   - Note timestamps

4. **Communicate**
   - Inform relevant team members
   - Update stakeholders
   - Document for future reference
   - Share lessons learned

### After Recovery

1. **Immediate Verification**
   - Confirm ownership transfer
   - Test admin functions
   - Verify contract state
   - Check all operations

2. **Security Review**
   - Analyze what went wrong
   - Implement preventive measures
   - Update procedures
   - Conduct training

3. **Long-term Monitoring**
   - Regular ownership checks
   - Monitor for issues
   - Review logs periodically
   - Update documentation

## Recovery Checklist

Use this checklist during recovery:

### Pre-Recovery
- [ ] Backup current state created
- [ ] Contract address verified
- [ ] Current owner address confirmed
- [ ] New owner address verified and checksummed
- [ ] Private key access confirmed
- [ ] Sufficient BNB for gas fees
- [ ] Network connection tested
- [ ] Team notified (if applicable)

### During Recovery
- [ ] Recovery script executed
- [ ] Correct option selected
- [ ] All prompts answered correctly
- [ ] Confirmation provided
- [ ] Transaction sent successfully
- [ ] Transaction confirmed on blockchain
- [ ] Recovery logs created

### Post-Recovery
- [ ] Ownership transfer verified
- [ ] New owner address confirmed
- [ ] Admin functions tested
- [ ] Old owner access revoked
- [ ] Recovery documented
- [ ] Team notified
- [ ] Configuration updated
- [ ] Security review scheduled

## Conclusion

Emergency ownership recovery is a critical procedure that should only be used when necessary. Always follow the procedures carefully, verify each step, and document all actions. Regular backups and preventive measures are the best way to avoid needing emergency recovery.

**Remember**: Prevention is better than recovery. Implement proper security measures, regular backups, and access controls to minimize the need for emergency procedures.

---

**Document Version**: 1.0.0  
**Last Updated**: 2025-  
**Maintained By**: SylvanToken Development Team

