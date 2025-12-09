# Deployment Scripts

This directory contains scripts for deploying the SylvanToken contract with various configurations.

## Scripts

### deploy-with-ownership-transfer.js

Enhanced deployment script that supports role separation between deployer and owner wallets.

**Features:**
- Deploys contract with deployer wallet (pays gas fees)
- Validates deployer and owner addresses
- Transfers ownership to secure wallet (hardware wallet or multisig)
- Verifies ownership transfer succeeded
- Network-specific validation and security checks
- Comprehensive post-deployment verification
- Saves complete deployment record

**Usage:**

```bash
# Deploy on localhost (same address for deployer and owner)
npx hardhat run scripts/deployment/deploy-with-ownership-transfer.js --network localhost

# Deploy on testnet with role separation
export OWNER_ADDRESS=0x... (your owner wallet address)
export OWNER_WALLET_TYPE=hardware
npx hardhat run scripts/deployment/deploy-with-ownership-transfer.js --network bscTestnet

# Deploy on mainnet with hardware wallet as owner
export OWNER_ADDRESS=0x... (your hardware wallet address)
export OWNER_WALLET_TYPE=hardware
npx hardhat run scripts/deployment/deploy-with-ownership-transfer.js --network bscMainnet

# Deploy on mainnet with multisig as owner
export OWNER_ADDRESS=0x... (your multisig address)
export OWNER_WALLET_TYPE=multisig
npx hardhat run scripts/deployment/deploy-with-ownership-transfer.js --network bscMainnet
```

**Environment Variables:**

- `DEPLOYER_ADDRESS` - (Optional) Address of deployer wallet. Uses first signer if not set.
- `OWNER_ADDRESS` - (Optional) Address of owner wallet. Uses deployer address if not set.
- `OWNER_WALLET_TYPE` - (Optional) Type of owner wallet: `hardware`, `multisig`, or `standard`. Default: `standard`.
- `CONFIRM_RISKY_DEPLOYMENT` - (Optional) Set to `true` to confirm risky configurations on mainnet.

**Security Features:**

1. **Address Validation:**
   - Validates both deployer and owner addresses
   - Checks for zero address
   - Verifies address checksum
   - Ensures addresses are valid Ethereum addresses

2. **Network-Specific Validation:**
   - **Mainnet:** Enforces different deployer/owner addresses (security requirement)
   - **Mainnet:** Recommends hardware wallet or multisig for owner
   - **Mainnet:** Displays security warnings for risky configurations
   - **Testnet:** Allows flexible configuration for testing
   - **Localhost:** Allows same address for development

3. **Balance Checks:**
   - Verifies deployer has sufficient BNB for gas fees
   - Network-specific minimum balance requirements

4. **Ownership Transfer:**
   - Automatically transfers ownership if addresses differ
   - Skips transfer if addresses are the same (with warnings)
   - Verifies transfer succeeded
   - Logs all transfer details

5. **Post-Deployment Verification:**
   - Verifies contract deployment
   - Checks token properties (name, symbol, decimals, supply)
   - Verifies ownership is correct
   - Validates fee configuration
   - Checks fee exemptions

**Network Requirements:**

| Network | Same Address | Hardware Wallet | Min Balance |
|---------|--------------|-----------------|-------------|
| Localhost | ✅ Allowed | ❌ Not required | 0.01 BNB |
| BSC Testnet | ✅ Allowed | ❌ Not required | 0.1 BNB |
| BSC Mainnet | ❌ **NOT Allowed** | ✅ **Required** | 0.2 BNB |

**Deployment Flow:**

1. **Pre-Deployment:**
   - Get deployer wallet from signers
   - Load owner address from config/environment
   - Validate addresses and roles
   - Check deployer balance
   - Confirm risky configurations (if any)

2. **Deployment:**
   - Deploy WalletManager library
   - Deploy SylvanToken contract
   - Verify initial deployment
   - Save deployment info

3. **Ownership Transfer (if needed):**
   - Check if transfer is needed
   - Execute transferOwnership transaction
   - Verify transfer succeeded
   - Update deployment record

4. **Post-Deployment:**
   - Verify contract deployment
   - Verify token properties
   - Verify ownership
   - Verify fee configuration
   - Verify exemptions
   - Display next steps

**Output:**

The script saves a deployment record to `deployments/<network>-deployment-<timestamp>.json` with:
- Network information
- Deployer and owner details
- Contract addresses
- Transaction hashes and block numbers
- Gas usage
- Ownership transfer details (if executed)
- Configuration details

**Example Output:**

```json
{
  "network": "bscMainnet",
  "timestamp": "2025-11-11T10:00:00.000Z",
  "deployer": {
    "address": "0x...",
    "role": "deployer"
  },
  "owner": {
    "address": "0x...",
    "walletType": "hardware",
    "role": "owner"
  },
  "contracts": {
    "walletManager": "0x...",
    "token": "0x..."
  },
  "deployment": {
    "transactionHash": "0x...",
    "blockNumber": 12345678,
    "gasUsed": "1234567"
  },
  "ownershipTransfer": {
    "executed": true,
    "previousOwner": "0x...",
    "newOwner": "0x...",
    "transactionHash": "0x...",
    "blockNumber": 12345679,
    "gasUsed": "23456",
    "timestamp": "2025-11-11T10:05:00.000Z"
  }
}
```

**Error Handling:**

The script handles various error scenarios:
- Invalid addresses
- Insufficient balance
- Same address on mainnet (security error)
- Ownership transfer failures
- Verification failures
- Network connection issues

**Security Best Practices:**

1. **For Mainnet:**
   - ✅ Use different addresses for deployer and owner
   - ✅ Use hardware wallet (Ledger/Trezor) for owner
   - ✅ Or use multisig wallet for owner
   - ✅ Keep owner wallet in cold storage
   - ✅ Test on testnet first
   - ❌ Never use same address for both roles
   - ❌ Never use standard hot wallet for owner

2. **For Testnet:**
   - ✅ Test ownership transfer process
   - ✅ Verify all admin functions work
   - ✅ Practice with hardware wallet if using on mainnet
   - ✅ Test recovery procedures

3. **For Localhost:**
   - ✅ Use for development and testing
   - ✅ Test deployment flow
   - ✅ Verify contract functionality

**Troubleshooting:**

**Issue:** "Deployer and Owner MUST be different addresses on mainnet"
- **Solution:** Set `OWNER_ADDRESS` environment variable to a different address

**Issue:** "Insufficient deployer balance"
- **Solution:** Add more BNB to deployer wallet

**Issue:** "Ownership transfer failed"
- **Solution:** Check that deployer is current owner, verify owner address is valid

**Issue:** "Risky configuration not confirmed"
- **Solution:** Either set different owner address (recommended) or set `CONFIRM_RISKY_DEPLOYMENT=true`

### deploy-testnet-simple.js

Simple deployment script for testnet without ownership transfer features.

**Usage:**
```bash
npx hardhat run scripts/deployment/deploy-testnet-simple.js --network bscTestnet
```

## Related Scripts

- `scripts/utils/transfer-ownership.js` - Standalone ownership transfer utility
- `scripts/utils/verify-ownership.js` - Ownership verification utility

## Documentation

For more information, see:
- [Design Document](../../.kiro/specs/separate-deployer-owner/design.md)
- [Requirements Document](../../.kiro/specs/separate-deployer-owner/requirements.md)
- [Implementation Tasks](../../.kiro/specs/separate-deployer-owner/tasks.md)
