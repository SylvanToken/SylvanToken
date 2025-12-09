# Multisig Wallet Integration Guide

## Overview

This guide provides comprehensive instructions for using a multisig (multi-signature) wallet as the owner of the SylvanToken smart contract. Multisig wallets require multiple parties to approve transactions, providing the highest level of security and governance for smart contract administration.

## What is a Multisig Wallet?

### Definition

A **multisig wallet** is a smart contract wallet that requires multiple signatures (approvals) from different addresses before executing a transaction. For example, a "3-of-5" multisig requires at least 3 out of 5 designated signers to approve a transaction.

### Key Concepts

- **Signers**: Addresses authorized to approve transactions
- **Threshold**: Minimum number of signatures required (e.g., 3 in a 3-of-5 setup)
- **Owners**: The signers who control the multisig
- **Proposal**: A transaction waiting for signatures
- **Execution**: Sending the transaction after threshold is met

### Benefits

- **No Single Point of Failure**: No single person can compromise the wallet
- **Distributed Trust**: Requires coordination among multiple parties
- **Transparent Governance**: All signers can see proposed transactions
- **Audit Trail**: Complete history of all proposals and approvals
- **Flexible Thresholds**: Customize security level (2-of-3, 3-of-5, etc.)
- **Recovery Options**: Loss of one key doesn't mean loss of access

### Use Cases

- **Production Contracts**: Mainnet smart contract ownership
- **DAO Governance**: Decentralized decision making
- **Team Management**: Shared control among team members
- **High-Value Assets**: Managing significant token amounts
- **Corporate Governance**: Multi-stakeholder approval processes

## Gnosis Safe Overview

**Gnosis Safe** is the most popular and battle-tested multisig wallet solution. It's used by major DeFi protocols and has secured billions of dollars in assets.

### Features

- **Multi-Chain Support**: Works on Ethereum, BSC, Polygon, and more
- **Flexible Thresholds**: Any M-of-N configuration
- **Transaction Builder**: Easy contract interaction interface
- **Mobile App**: iOS and Android support
- **WalletConnect**: Connect to dApps
- **Spending Limits**: Set daily limits for individual signers
- **Transaction Simulation**: Preview transaction effects
- **Gas Estimation**: Accurate gas cost predictions

### Supported Networks

- Ethereum Mainnet
- **Binance Smart Chain (BSC)** ✅ (Our network)
- Polygon
- Arbitrum
- Optimism
- And many more

## Gnosis Safe Setup Guide

### Prerequisites

Before creating a Gnosis Safe:

- [ ] Decide on number of signers (3-5 recommended)
- [ ] Collect all signer addresses
- [ ] Decide on threshold (e.g., 3-of-5)
- [ ] Ensure all signers have wallets (MetaMask, etc.)
- [ ] Have ~0.01 BNB for Safe creation gas fees
- [ ] Coordinate with all signers for testing

### Step 1: Create Gnosis Safe

#### Access Gnosis Safe Interface

1. **Visit Gnosis Safe**
   - Go to: https://app.safe.global
   - Or use: https://gnosis-safe.io/app

2. **Connect Wallet**
   - Click "Connect Wallet"
   - Select your wallet (MetaMask recommended)
   - Approve connection

3. **Select Network**
   - Click network selector (top right)
   - Select "Binance Smart Chain"
   - Confirm network switch in wallet

#### Create New Safe

1. **Start Creation**
   - Click "Create new Safe"
   - Or click "+ Create new Safe" button

2. **Name Your Safe**
   - Enter a name (e.g., "SylvanToken Admin")
   - This is only for your reference
   - Click "Continue"

3. **Add Signers**
   - **Signer 1**: Your connected wallet (automatically added)
   - Click "+ Add another signer"
   - Enter signer address and name
   - Repeat for all signers
   - **Recommended**: 3-5 signers for good balance

   Example configuration:
   ```
   Signer 1: 0x... (Founder - Hardware Wallet)
   Signer 2: 0x... (CTO - Hardware Wallet)
   Signer 3: 0x... (CFO - Hardware Wallet)
   Signer 4: 0x... (Advisor - Hardware Wallet)
   Signer 5: 0x... (Legal - Hardware Wallet)
   ```

4. **Set Threshold**
   - Choose "X out of Y signers"
   - **Recommended thresholds**:
     - 2-of-3: Good for small teams
     - 3-of-5: Excellent balance (recommended)
     - 4-of-7: High security for large teams
   - Click "Continue"

5. **Review and Deploy**
   - Review all settings
   - Check all signer addresses carefully
   - Verify threshold is correct
   - Click "Create"
   - Approve transaction in wallet
   - Wait for confirmation

6. **Save Safe Address**
   - Copy your Safe address (starts with 0x)
   - Save in secure location
   - Share with all signers
   - Add to project documentation

### Step 2: Configure Safe Settings

#### Access Safe Settings

1. **Open Your Safe**
   - Go to https://app.safe.global
   - Connect wallet
   - Select your Safe from list

2. **Navigate to Settings**
   - Click "Settings" in left sidebar
   - Review all available options

#### Important Settings

**1. Safe Details**
- Verify Safe address
- Update Safe name if needed
- Note Safe version

**2. Owners**
- Review all signer addresses
- Verify threshold setting
- Add/remove signers if needed (requires threshold approval)

**3. Policies**
- Set spending limits (optional)
- Configure module permissions (advanced)

**4. Advanced**
- Review nonce
- Check Safe version
- Update if needed

### Step 3: Fund Safe

#### Add BNB for Gas

1. **Get Safe Address**
   - Copy Safe address from interface
   - Or click "Receive" to see QR code

2. **Send BNB**
   - Send 0.1-0.5 BNB to Safe address
   - This covers gas fees for admin operations
   - Use any wallet to send

3. **Verify Balance**
   - Check balance in Safe interface
   - Should show BNB amount
   - Ready for transactions

### Step 4: Test Safe Operations

#### Create Test Transaction

1. **Propose Transaction**
   - Click "New Transaction"
   - Select "Send tokens" or "Contract interaction"
   - Enter small test amount
   - Click "Create"

2. **Collect Signatures**
   - Transaction appears in queue
   - Share with other signers
   - Each signer connects wallet
   - Each signer clicks "Confirm"
   - Watch signature count increase

3. **Execute Transaction**
   - Once threshold is met, "Execute" button appears
   - Any signer can execute
   - Click "Execute"
   - Approve in wallet
   - Wait for confirmation

4. **Verify Success**
   - Check transaction history
   - Verify transaction on BSCScan
   - Confirm all signers can see history

## Using Gnosis Safe for Contract Ownership

### Configuration

Add Safe address to your `.env` file:

```bash
# Deployer wallet (hot wallet for gas fees)
DEPLOYER_PRIVATE_KEY=0x...

# Owner wallet (Gnosis Safe address)
OWNER_ADDRESS=0xYourGnosisSafeAddress
OWNER_WALLET_TYPE=multisig
```

### Deployment Process

#### Step 1: Deploy Contract

```bash
npx hardhat run scripts/deployment/deploy-with-ownership-transfer.js --network bscMainnet
```

**What Happens**:
1. Deployer wallet deploys contract
2. Deployer pays gas fees
3. Ownership automatically transfers to Safe address
4. Safe now controls all admin functions

#### Step 2: Verify Ownership

```bash
npx hardhat run scripts/utils/verify-ownership.js --network bscMainnet
```

**Expected Output**:
```
Current Owner: 0xYourGnosisSafeAddress
✓ Ownership matches configuration
✓ Owner wallet type: multisig
✓ Safe is operational
```

### Executing Admin Functions

All admin functions require multisig approval. Here's the complete workflow:

#### Method 1: Using Safe Interface (Recommended)

##### Step 1: Propose Transaction

**Proposer** (any signer):

1. **Access Safe**
   - Go to https://app.safe.global
   - Connect wallet
   - Select your Safe

2. **Start New Transaction**
   - Click "New Transaction"
   - Select "Contract interaction"

3. **Enter Contract Details**
   - **Contract Address**: Your SylvanToken address
   - **ABI**: Paste SylvanToken ABI or upload JSON
   - Safe will load contract functions

4. **Select Function**
   - Choose function from dropdown
   - Example: `setFeeExempt`
   - Enter parameters:
     - `account`: 0x... (address to exempt)
     - `exempt`: true (or false)

5. **Review Transaction**
   - Verify contract address
   - Verify function and parameters
   - Check gas estimate
   - Click "Create"

6. **Sign Proposal**
   - Approve in wallet
   - Transaction appears in queue
   - Status: "1 of X confirmations"

##### Step 2: Collect Signatures

**Other Signers**:

1. **Access Safe**
   - Go to https://app.safe.global
   - Connect wallet
   - Select Safe

2. **View Pending Transaction**
   - Click "Transactions" in sidebar
   - See pending transaction in queue
   - Click to view details

3. **Review Transaction**
   - Verify contract address
   - Review function being called
   - Check parameters
   - Verify gas estimate

4. **Sign Transaction**
   - Click "Confirm"
   - Approve in wallet
   - Signature added
   - Status updates: "2 of X confirmations"

5. **Repeat Until Threshold**
   - Each required signer repeats steps 1-4
   - Watch confirmation count increase
   - Once threshold met, ready to execute

##### Step 3: Execute Transaction

**Any Signer** (after threshold met):

1. **View Ready Transaction**
   - Transaction shows "Execute" button
   - Threshold has been reached

2. **Execute**
   - Click "Execute"
   - Review final details
   - Approve in wallet
   - Pay gas fees

3. **Verify Execution**
   - Transaction moves to "History"
   - Status: "Success"
   - View on BSCScan
   - Verify contract state changed

#### Method 2: Using Transaction Builder

For complex or batch operations:

1. **Access Transaction Builder**
   - In Safe interface
   - Click "Apps" in sidebar
   - Select "Transaction Builder"

2. **Build Transaction**
   - Enter contract address
   - Enter ABI
   - Add multiple transactions
   - Batch operations together

3. **Create Batch**
   - Review all transactions
   - Click "Create Batch"
   - Follow signing process above

#### Method 3: Using Safe CLI (Advanced)

For automation or scripting:

```bash
# Install Safe CLI
npm install -g @gnosis.pm/safe-cli

# Propose transaction
safe-cli propose-transaction \
  --safe-address 0xYourSafeAddress \
  --to 0xContractAddress \
  --data 0x... \
  --value 0

# Sign transaction
safe-cli sign-transaction \
  --safe-address 0xYourSafeAddress \
  --tx-hash 0x...

# Execute transaction
safe-cli execute-transaction \
  --safe-address 0xYourSafeAddress \
  --tx-hash 0x...
```

## Common Admin Operations

### Set Fee Exemption

**Function**: `setFeeExempt(address account, bool exempt)`

**Steps**:
1. Propose transaction in Safe
2. Select `setFeeExempt` function
3. Enter address and true/false
4. Collect signatures
5. Execute

**Use Case**: Exempt exchange wallets from fees

### Configure Admin Wallet

**Function**: `configureAdminWallet(...)`

**Parameters**:
- `admin`: Address
- `amount`: Token amount
- `cliffDuration`: Days
- `duration`: Months
- `releaseRate`: Basis points
- `burnRate`: Basis points
- `isAdmin`: Boolean

**Steps**:
1. Propose transaction
2. Enter all parameters carefully
3. Collect signatures
4. Execute

**Use Case**: Set up vesting for team members

### Enable Trading

**Function**: `enableTrading()`

**Steps**:
1. Propose transaction
2. Select `enableTrading` function
3. No parameters needed
4. Collect signatures
5. Execute

**Use Case**: Activate trading after deployment

### Emergency Pause

**Function**: `pause()` (if implemented)

**Steps**:
1. Propose transaction immediately
2. Select `pause` function
3. Collect signatures urgently
4. Execute

**Use Case**: Emergency response to security issue

## Signer Management

### Adding a Signer

**When to Add**:
- Team expansion
- Replacing lost key
- Increasing security

**Process**:
1. **Propose Add Owner**
   - In Safe settings
   - Click "Add new owner"
   - Enter new signer address
   - Optionally adjust threshold

2. **Collect Signatures**
   - Requires current threshold
   - All signers review new address
   - Sign proposal

3. **Execute**
   - Execute transaction
   - New signer added
   - Can now participate

### Removing a Signer

**When to Remove**:
- Team member departure
- Compromised key
- Reducing signer count

**Process**:
1. **Propose Remove Owner**
   - In Safe settings
   - Select signer to remove
   - Adjust threshold if needed

2. **Collect Signatures**
   - Requires current threshold
   - Cannot remove yourself if you're last signer

3. **Execute**
   - Execute transaction
   - Signer removed
   - Can no longer sign

### Changing Threshold

**When to Change**:
- Security policy update
- Signer count changed
- Risk assessment

**Process**:
1. **Propose Threshold Change**
   - In Safe settings
   - Select new threshold
   - Must be ≤ number of signers

2. **Collect Signatures**
   - Requires current threshold
   - All signers review change

3. **Execute**
   - Execute transaction
   - New threshold active

## Security Best Practices

### Signer Selection

- ✅ **Diverse Signers**: Different people, not same person with multiple wallets
- ✅ **Geographic Distribution**: Signers in different locations
- ✅ **Role Distribution**: Different roles (technical, business, legal)
- ✅ **Hardware Wallets**: All signers should use hardware wallets
- ✅ **Backup Signers**: Have more signers than threshold (e.g., 3-of-5, not 3-of-3)

### Threshold Selection

- ✅ **Not Too Low**: 1-of-N is not secure
- ✅ **Not Too High**: N-of-N is risky (one lost key = locked)
- ✅ **Recommended**: 60-70% of signers (e.g., 3-of-5, 4-of-6)
- ✅ **Consider Availability**: Ensure threshold signers are usually available

### Operational Security

- ✅ **Verify Addresses**: Always verify contract addresses
- ✅ **Review Transactions**: All signers should review before signing
- ✅ **Simulate First**: Use Safe's simulation feature
- ✅ **Test on Testnet**: Test complex operations on testnet first
- ✅ **Document Procedures**: Write down all processes
- ✅ **Regular Audits**: Review signer list and transactions regularly

### Communication

- ✅ **Secure Channels**: Use encrypted communication
- ✅ **Verify Requests**: Confirm transaction requests are legitimate
- ✅ **No Pressure**: Never rush important decisions
- ✅ **Document Decisions**: Keep records of why transactions were approved
- ✅ **Regular Meetings**: Coordinate with all signers regularly

## Troubleshooting

### Transaction Stuck in Queue

**Symptoms**: Transaction not executing after threshold met

**Solutions**:
- Check if Safe has sufficient BNB for gas
- Verify network is not congested
- Try executing from different signer
- Check if nonce is correct
- Reject and recreate if needed

### Signer Cannot See Transaction

**Symptoms**: Pending transaction not visible to signer

**Solutions**:
- Verify signer is connected to correct Safe
- Check network is BSC Mainnet
- Refresh page
- Clear browser cache
- Try different browser
- Check Safe address is correct

### Insufficient Signatures

**Symptoms**: Cannot reach threshold

**Solutions**:
- Contact all signers
- Verify all signers have access to wallets
- Check if any signers are unavailable
- Consider if threshold is too high
- May need to add new signer if one is permanently unavailable

### Wrong Network

**Symptoms**: Safe not showing or transactions failing

**Solutions**:
- Verify connected to BSC Mainnet
- Check wallet network setting
- Switch network in Safe interface
- Reconnect wallet

### Gas Estimation Failed

**Symptoms**: Cannot estimate gas for transaction

**Solutions**:
- Check contract function is valid
- Verify parameters are correct
- Ensure Safe has BNB balance
- Try manual gas limit
- Check if function requires special permissions

## Emergency Procedures

### Lost Signer Key

**If Below Threshold**:
1. Remaining signers can still operate
2. Propose removal of lost signer
3. Add new signer if needed
4. Continue operations

**If At or Above Threshold**:
1. **CRITICAL SITUATION**
2. Cannot execute transactions
3. Cannot add new signers
4. Ownership may be permanently locked
5. **Prevention is critical**

### Compromised Signer

**Immediate Actions**:
1. Contact all other signers urgently
2. Propose removal of compromised signer
3. Collect signatures quickly
4. Execute removal
5. Add new signer
6. Review all recent transactions
7. Consider transferring to new Safe

### Safe Contract Upgrade

**When Needed**:
- Critical bug in Safe contract
- New features required
- Security update

**Process**:
1. Create new Safe with same signers
2. Transfer ownership to new Safe
3. Requires threshold approval
4. Test thoroughly first
5. Update all documentation

## Advanced Features

### Spending Limits

Allow individual signers to spend up to a limit without full approval:

1. **Set Limit**
   - In Safe settings
   - Configure spending limit module
   - Set daily/weekly limits per signer

2. **Use Limit**
   - Signer can spend within limit
   - No other signatures needed
   - Resets after time period

**Use Case**: Operational expenses, small transactions

### Safe Apps

Integrate with DeFi protocols and tools:

1. **Access Apps**
   - Click "Apps" in Safe interface
   - Browse available apps
   - Connect to DeFi protocols

2. **Use Apps**
   - Interact with protocols through Safe
   - All transactions require threshold
   - Seamless integration

**Examples**: Uniswap, Aave, Curve, etc.

### Transaction Simulation

Preview transaction effects before execution:

1. **Simulate**
   - Safe automatically simulates transactions
   - Shows expected state changes
   - Displays warnings if issues detected

2. **Review**
   - Check balance changes
   - Verify expected outcomes
   - Proceed if correct

## Testing Recommendations

### Before Mainnet

1. **Create Test Safe on BSC Testnet**
   - Same configuration as mainnet
   - Same signers
   - Practice all operations

2. **Test All Admin Functions**
   - Set fee exemption
   - Configure vesting
   - Enable trading
   - Emergency functions

3. **Test Signer Management**
   - Add signer
   - Remove signer
   - Change threshold

4. **Test Emergency Scenarios**
   - Simulate lost signer
   - Practice urgent approvals
   - Test communication channels

### Mainnet Deployment

1. **Final Verification**
   - All signers have access
   - All signers trained
   - Communication channels established
   - Emergency procedures documented

2. **Deployment**
   - Deploy contract
   - Transfer ownership to Safe
   - Verify ownership
   - Test one admin function

3. **Post-Deployment**
   - Regular signer meetings
   - Monitor all transactions
   - Keep documentation updated
   - Regular security reviews

## Best Practices Summary

### Setup Phase

- ✅ Choose 3-5 signers
- ✅ Use 60-70% threshold
- ✅ All signers use hardware wallets
- ✅ Test on testnet first
- ✅ Document all procedures
- ✅ Train all signers

### Operational Phase

- ✅ Verify all transaction details
- ✅ Use secure communication
- ✅ Never rush approvals
- ✅ Keep Safe funded with BNB
- ✅ Regular signer coordination
- ✅ Document all decisions

### Emergency Phase

- ✅ Have emergency contacts
- ✅ Know recovery procedures
- ✅ Can reach threshold quickly
- ✅ Have backup plan
- ✅ Regular emergency drills

## Additional Resources

### Official Documentation

- **Gnosis Safe**: https://docs.safe.global
- **Safe Apps**: https://apps.safe.global
- **Safe CLI**: https://github.com/gnosis/safe-cli

### Tutorials

- **Safe User Guide**: https://help.safe.global
- **Video Tutorials**: https://www.youtube.com/c/GnosisSafe
- **Community Forum**: https://forum.gnosis-safe.io

### Security

- **Safe Audits**: https://github.com/gnosis/safe-contracts/tree/main/docs
- **Bug Bounty**: https://immunefi.com/bounty/gnosissafe

## Support

For Gnosis Safe issues:
- **Help Center**: https://help.safe.global
- **Discord**: https://discord.gg/AjG7AQD9Qn
- **Twitter**: @safe

For SylvanToken integration:
- Review this guide
- Check deployment documentation
- Verify on BSCScan
- Contact development team

---

**Last Updated**: November 11, 2025-

**Version**: 1.0.0
