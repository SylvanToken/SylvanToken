# Ownership Transfer Guide

## Overview

This guide explains how to safely transfer ownership of the SylvanToken smart contract from the deployer wallet to a secure owner wallet. Separating the deployer and owner roles is a critical security best practice that protects your contract from single points of failure.

## Understanding Roles

### Deployer Wallet

The **Deployer Wallet** is the address that:
- Executes the contract deployment transaction
- Pays gas fees for deployment
- Becomes the initial owner of the contract
- Should be a standard hot wallet for operational convenience
- Does NOT need to remain secure after ownership transfer

**Recommended:** Standard wallet (MetaMask, Trust Wallet) with sufficient BNB for gas fees

### Owner Wallet

The **Owner Wallet** is the address that:
- Has administrative control over the contract
- Can execute all `onlyOwner` functions
- Manages fee exemptions and vesting configurations
- Controls trading activation and emergency functions
- MUST be highly secure (hardware wallet or multisig recommended)

**Recommended:** Hardware wallet (Ledger, Trezor) or Multisig wallet (Gnosis Safe)

### Why Separate These Roles?

1. **Security**: Deployer wallet is a hot wallet that may be exposed during deployment. Owner wallet can be cold storage.
2. **Risk Mitigation**: If deployer wallet is compromised, attacker cannot control the contract after ownership transfer.
3. **Operational Security**: Deployment operations are separate from administrative operations.
4. **Best Practice**: Industry standard for production smart contracts.

## Prerequisites

Before transferring ownership, ensure you have:

- ✅ Deployed SylvanToken contract address
- ✅ Deployer wallet with access to private key
- ✅ Owner wallet address (verified and tested)
- ✅ Owner wallet accessible (hardware wallet connected, multisig configured)
- ✅ Sufficient BNB in deployer wallet for gas fees
- ✅ Backup of all wallet recovery information

## Step-by-Step Transfer Instructions

### Method 1: Automatic Transfer During Deployment (Recommended)

This method transfers ownership immediately after deployment in a single script execution.

#### Step 1: Configure Environment Variables

Edit your `.env` file:

```bash
# Deployer wallet (pays gas fees)
DEPLOYER_PRIVATE_KEY=your_deployer_private_key_here

# Owner wallet (receives admin control)
OWNER_ADDRESS=0xYourSecureOwnerAddressHere
```

#### Step 2: Validate Configuration

Run the validation script:

```bash
npx hardhat run scripts/utils/validate-deployment-config.js --network bscMainnet
```

This will check:
- Deployer has sufficient balance
- Owner address is valid
- Addresses are different (required for mainnet)

#### Step 3: Deploy with Ownership Transfer

Execute the deployment script:

```bash
npx hardhat run scripts/deployment/deploy-with-ownership-transfer.js --network bscMainnet
```

The script will:
1. Deploy the contract with deployer as initial owner
2. Automatically transfer ownership to the configured owner address
3. Verify the transfer succeeded
4. Save deployment records

#### Step 4: Verify Ownership

Confirm the transfer:

```bash
npx hardhat run scripts/utils/verify-ownership.js --network bscMainnet
```

Expected output:
```
Current Owner: 0xYourSecureOwnerAddressHere
✓ Ownership matches configuration
✓ Owner can execute admin functions
```

### Method 2: Manual Transfer After Deployment

Use this method if you've already deployed the contract or need to transfer ownership separately.

#### Step 1: Prepare Transfer Script

Create a transfer configuration file or use environment variables:

```bash
# Contract address
CONTRACT_ADDRESS=0xYourDeployedContractAddress

# New owner address
NEW_OWNER_ADDRESS=0xYourSecureOwnerAddressHere

# Deployer private key (current owner)
DEPLOYER_PRIVATE_KEY=your_deployer_private_key_here
```

#### Step 2: Execute Transfer

Run the ownership transfer utility:

```bash
npx hardhat run scripts/utils/transfer-ownership.js --network bscMainnet
```

The script will:
1. Load the contract at the specified address
2. Verify you are the current owner
3. Validate the new owner address
4. Execute `transferOwnership(newOwner)`
5. Wait for transaction confirmation
6. Verify the new owner is set correctly

#### Step 3: Verify Transfer

Check the ownership status:

```bash
npx hardhat run scripts/utils/verify-ownership.js --network bscMainnet
```

#### Step 4: Test Admin Functions

Verify the new owner can execute admin functions:

```bash
# Example: Check if owner can call setFeeExempt
# This should be done from the new owner wallet
```

## Hardware Wallet Integration

### Using Ledger

#### Setup

1. **Connect Ledger Device**
   - Connect your Ledger to your computer
   - Unlock the device with your PIN
   - Open the Ethereum app on the device

2. **Get Ledger Address**
   ```bash
   # Use Ledger Live or MetaMask with Ledger connection
   # Note the address you want to use as owner
   ```

3. **Configure Deployment**
   ```bash
   # In .env file
   OWNER_ADDRESS=0xYourLedgerAddressHere
   OWNER_WALLET_TYPE=hardware
   ```

#### Deployment Process

1. Deploy contract with automatic transfer (Method 1 above)
2. Contract ownership will be transferred to your Ledger address
3. Ledger device is NOT needed during deployment (only the address)

#### Executing Admin Functions

When you need to execute admin functions as owner:

1. **Connect Ledger to Hardhat**
   ```javascript
   // In your script
   const ledgerSigner = await ethers.getSigner(ownerAddress);
   const token = await ethers.getContractAt("SylvanToken", contractAddress, ledgerSigner);
   ```

2. **Execute Function**
   ```javascript
   // Example: Set fee exemption
   const tx = await token.setFeeExempt(address, true);
   await tx.wait();
   ```

3. **Confirm on Device**
   - Transaction details will appear on Ledger screen
   - Verify the contract address and function
   - Approve the transaction on the device

### Using Trezor

#### Setup

1. **Connect Trezor Device**
   - Connect Trezor to your computer
   - Unlock with PIN
   - Enable Ethereum support

2. **Get Trezor Address**
   ```bash
   # Use Trezor Suite or MetaMask with Trezor
   # Note the address for owner role
   ```

3. **Configure Deployment**
   ```bash
   OWNER_ADDRESS=0xYourTrezorAddressHere
   OWNER_WALLET_TYPE=hardware
   ```

#### Deployment Process

Same as Ledger - only the address is needed during deployment.

#### Executing Admin Functions

1. **Connect Trezor to Application**
   - Use Trezor Suite or compatible wallet
   - Connect to BSC network

2. **Sign Transactions**
   - Review transaction on Trezor screen
   - Confirm contract interaction
   - Approve on device

## Multisig Wallet Integration

### Using Gnosis Safe

#### Setup

1. **Create Gnosis Safe**
   - Visit https://app.safe.global
   - Connect to BSC network
   - Create new Safe with desired signers
   - Configure signature threshold (e.g., 2-of-3)

2. **Note Safe Address**
   ```bash
   # Your Gnosis Safe contract address
   OWNER_ADDRESS=0xYourGnosisSafeAddress
   OWNER_WALLET_TYPE=multisig
   ```

3. **Configure Signers**
   - Add all signer addresses
   - Set threshold (minimum signatures required)
   - Test with a small transaction

#### Deployment Process

1. Deploy contract with Safe address as owner
2. Ownership will be transferred to the Safe
3. All admin functions will require multisig approval

#### Executing Admin Functions

1. **Propose Transaction**
   - Go to Gnosis Safe interface
   - Select "New Transaction"
   - Choose "Contract Interaction"
   - Enter SylvanToken contract address
   - Select function (e.g., `setFeeExempt`)
   - Enter parameters

2. **Collect Signatures**
   - First signer proposes and signs
   - Other signers review and sign
   - Once threshold is met, transaction can be executed

3. **Execute Transaction**
   - Any signer can execute once threshold is reached
   - Transaction is sent to blockchain
   - Verify execution in Safe transaction history

### Multisig Best Practices

- **Signer Diversity**: Use different wallet types for signers (hardware + software)
- **Geographic Distribution**: Signers in different locations
- **Threshold Selection**: 2-of-3 or 3-of-5 for good balance
- **Regular Testing**: Test multisig operations on testnet first
- **Backup Plan**: Document recovery procedures if signers are unavailable

## Security Checklist

Before transferring ownership, verify:

- [ ] Owner address is correct (triple-check!)
- [ ] Owner address is NOT the zero address (0x0000...0000)
- [ ] Owner wallet is accessible and tested
- [ ] Backup/recovery information is securely stored
- [ ] Transfer has been tested on testnet
- [ ] All signers are available (for multisig)
- [ ] Hardware wallet firmware is up to date
- [ ] Transaction will be executed on correct network
- [ ] Sufficient gas fees available in deployer wallet

## Troubleshooting

### Error: "Ownable: new owner is the zero address"

**Cause**: Attempting to transfer to address 0x0000000000000000000000000000000000000000

**Solution**: 
- Verify OWNER_ADDRESS in .env file
- Ensure address is properly formatted with 0x prefix
- Check for typos in the address

### Error: "Ownable: caller is not the owner"

**Cause**: Attempting to transfer ownership from a wallet that is not the current owner

**Solution**:
- Verify you're using the deployer wallet (current owner)
- Check DEPLOYER_PRIVATE_KEY in .env file
- Confirm current owner with verify-ownership.js script

### Error: "Transaction failed"

**Cause**: Various reasons - insufficient gas, network issues, etc.

**Solution**:
- Check deployer wallet has sufficient BNB for gas
- Verify network connection
- Try increasing gas limit
- Check BSCScan for transaction details

### Hardware Wallet Not Detected

**Cause**: Device not connected, locked, or wrong app open

**Solution**:
- Ensure device is connected via USB
- Unlock device with PIN
- Open Ethereum app on device
- Try different USB port or cable
- Update device firmware if needed

### Multisig Transaction Stuck

**Cause**: Insufficient signatures or execution issues

**Solution**:
- Verify signature threshold is met
- Check all signers have approved
- Ensure executing signer has sufficient BNB for gas
- Review transaction in Safe interface for errors

### Cannot Execute Admin Functions After Transfer

**Cause**: Ownership transfer may not have completed successfully

**Solution**:
- Run verify-ownership.js to check current owner
- Verify transaction on BSCScan
- If transfer failed, retry from deployer wallet
- Check owner wallet is properly connected

## Emergency Recovery

### If You Transfer to Wrong Address

**CRITICAL**: There is NO way to recover if you transfer ownership to:
- An address you don't control
- An incorrect address
- A lost wallet

**Prevention**:
- Always test on testnet first
- Triple-check the owner address
- Send a test transaction to the address first
- Verify you can access the owner wallet

### If Owner Wallet Is Lost

**For Hardware Wallets**:
- Use recovery seed phrase to restore wallet
- Import into new hardware device
- Verify address matches before using

**For Multisig Wallets**:
- If enough signers are available, continue operations
- If below threshold, ownership cannot be recovered
- This is why backup signers are critical

### If Deployer Wallet Is Compromised

**After Ownership Transfer**: No risk - deployer has no control

**Before Ownership Transfer**: 
- Immediately transfer ownership to secure wallet
- Use emergency recovery script if available
- Monitor contract for unauthorized transactions

## Testing Recommendations

### Testnet Testing

Always test the complete ownership transfer process on BSC Testnet before mainnet:

1. **Deploy on Testnet**
   ```bash
   npx hardhat run scripts/deployment/deploy-with-ownership-transfer.js --network bscTestnet
   ```

2. **Verify Transfer**
   ```bash
   npx hardhat run scripts/utils/verify-ownership.js --network bscTestnet
   ```

3. **Test Admin Functions**
   - Execute setFeeExempt from owner wallet
   - Execute other admin functions
   - Verify deployer cannot execute admin functions

4. **Document Results**
   - Record any issues encountered
   - Note gas costs
   - Verify timing and confirmations

### Mainnet Deployment

After successful testnet testing:

1. **Final Verification**
   - Review all addresses one more time
   - Confirm owner wallet is accessible
   - Check deployer wallet balance

2. **Execute Deployment**
   - Run deployment script
   - Monitor transaction on BSCScan
   - Wait for confirmations

3. **Post-Deployment Verification**
   - Verify ownership transfer
   - Test one admin function
   - Save all transaction hashes

4. **Documentation**
   - Record deployment details
   - Save contract address
   - Document ownership transfer transaction

## Additional Resources

- **OpenZeppelin Ownable Documentation**: https://docs.openzeppelin.com/contracts/4.x/api/access#Ownable
- **Gnosis Safe Documentation**: https://docs.safe.global
- **Ledger Support**: https://support.ledger.com
- **Trezor Support**: https://trezor.io/support
- **BSCScan**: https://bscscan.com

## Support

If you encounter issues not covered in this guide:

1. Check the troubleshooting section above
2. Review deployment logs in `deployments/` directory
3. Verify transaction details on BSCScan
4. Consult the project's security documentation
5. Contact the development team with specific error messages

---

**Last Updated**: November 11, 2025-

**Version**: 1.0.0
