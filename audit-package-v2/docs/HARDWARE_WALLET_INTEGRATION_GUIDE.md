# Hardware Wallet Integration Guide

## Overview

This guide provides detailed instructions for using hardware wallets (Ledger and Trezor) as the owner wallet for SylvanToken smart contract. Hardware wallets provide the highest level of security for private key storage, making them ideal for managing administrative control of production smart contracts.

## Why Use a Hardware Wallet?

### Security Benefits

- **Cold Storage**: Private keys never leave the device
- **Physical Security**: Requires physical access to device
- **PIN Protection**: Device locked with PIN code
- **Secure Element**: Military-grade chip stores keys
- **Transaction Verification**: Review and approve on device screen
- **Malware Resistant**: Keys cannot be extracted by software

### Use Cases

- **Production Deployments**: Mainnet contract ownership
- **High-Value Operations**: Managing large token amounts
- **Administrative Control**: Executing critical contract functions
- **Long-Term Security**: Protecting assets over time

## Supported Hardware Wallets

### Ledger Devices

- **Ledger Nano S Plus**: Entry-level, USB-C, ~$79
- **Ledger Nano X**: Bluetooth, larger screen, ~$149
- **Ledger Stax**: Touchscreen, premium, ~$279

**Recommended**: Ledger Nano X for best user experience

### Trezor Devices

- **Trezor One**: Entry-level, USB, ~$69
- **Trezor Model T**: Touchscreen, USB-C, ~$219

**Recommended**: Trezor Model T for touchscreen convenience

## Ledger Setup Guide

### Initial Device Setup

#### Step 1: Unbox and Connect

1. **Verify Package Integrity**
   - Check for tamper-evident seals
   - Ensure package is unopened
   - Verify device is genuine (check Ledger website)

2. **Connect Device**
   - Use provided USB cable
   - Connect to computer
   - Device will power on automatically

#### Step 2: Initialize Device

1. **Choose Setup Option**
   - Select "Set up as new device"
   - Do NOT use "Restore from recovery phrase" unless recovering

2. **Set PIN Code**
   - Choose 4-8 digit PIN
   - Use device buttons to enter PIN
   - Confirm PIN by entering again
   - **IMPORTANT**: Remember this PIN - needed for every use

3. **Write Down Recovery Phrase**
   - Device will display 24 words
   - Write each word on provided recovery sheet
   - Write in order (1-24)
   - **CRITICAL**: Store recovery sheet securely
   - Never take photos or store digitally
   - Consider using metal backup (fireproof/waterproof)

4. **Confirm Recovery Phrase**
   - Device will ask you to confirm random words
   - Use buttons to select correct words
   - This ensures you wrote them down correctly

#### Step 3: Install Ledger Live

1. **Download Ledger Live**
   - Visit: https://www.ledger.com/ledger-live
   - Download for your operating system
   - Verify download signature

2. **Install Application**
   - Run installer
   - Follow installation wizard
   - Launch Ledger Live

3. **Connect Device to Ledger Live**
   - Connect Ledger device
   - Enter PIN on device
   - Allow Ledger Manager access
   - Update firmware if prompted

#### Step 4: Install Ethereum App

1. **Open Ledger Live Manager**
   - Click "Manager" in left sidebar
   - Enter PIN on device
   - Allow Ledger Manager

2. **Install Ethereum App**
   - Search for "Ethereum"
   - Click "Install"
   - Wait for installation to complete
   - App will appear on device

3. **Configure Ethereum App**
   - Open Ethereum app on device
   - Go to Settings (if available)
   - Enable "Contract Data" (required for smart contracts)
   - Enable "Debug Data" (optional, for detailed info)

### Getting Your Ledger Address

#### Method 1: Using Ledger Live

1. **Add Ethereum Account**
   - Open Ledger Live
   - Click "Accounts" → "Add account"
   - Select "Ethereum"
   - Connect and unlock device
   - Open Ethereum app on device

2. **View Address**
   - Account will be created
   - Click on account to view details
   - Copy address (starts with 0x)
   - Verify address on device screen

#### Method 2: Using MetaMask

1. **Connect Ledger to MetaMask**
   - Open MetaMask
   - Click account icon → "Connect Hardware Wallet"
   - Select "Ledger"
   - Choose "WebHID" connection type

2. **Select Account**
   - Unlock Ledger device
   - Open Ethereum app
   - MetaMask will show available addresses
   - Select desired address
   - Click "Unlock"

3. **Copy Address**
   - Address now appears in MetaMask
   - Click address to copy
   - Verify on device if needed

### Using Ledger for Contract Ownership

#### Configuration

Add Ledger address to your `.env` file:

```bash
# Deployer wallet (hot wallet for gas fees)
DEPLOYER_PRIVATE_KEY=0x...

# Owner wallet (Ledger address)
OWNER_ADDRESS=0xYourLedgerAddressHere
OWNER_WALLET_TYPE=hardware
```

#### Deployment Process

1. **Deploy Contract**
   ```bash
   npx hardhat run scripts/deployment/deploy-with-ownership-transfer.js --network bscMainnet
   ```

2. **Ownership Transfer**
   - Script deploys with deployer wallet
   - Automatically transfers ownership to Ledger address
   - **No Ledger interaction needed during deployment**
   - Ledger address receives ownership

3. **Verify Ownership**
   ```bash
   npx hardhat run scripts/utils/verify-ownership.js --network bscMainnet
   ```

#### Executing Admin Functions

When you need to execute admin functions (fee exemptions, vesting, etc.):

##### Using Hardhat Scripts

1. **Prepare Script**
   ```javascript
   // Example: Set fee exemption
   const { ethers } = require("hardhat");
   
   async function main() {
       // Connect to Ledger
       const provider = new ethers.providers.JsonRpcProvider(process.env.BSC_RPC_URL);
       const ledgerSigner = await ethers.getSigner(process.env.OWNER_ADDRESS);
       
       // Load contract
       const token = await ethers.getContractAt(
           "SylvanToken",
           process.env.CONTRACT_ADDRESS,
           ledgerSigner
       );
       
       // Execute function
       const tx = await token.setFeeExempt(targetAddress, true);
       await tx.wait();
       
       console.log("Transaction confirmed:", tx.hash);
   }
   ```

2. **Connect Ledger**
   - Connect device to computer
   - Unlock with PIN
   - Open Ethereum app

3. **Run Script**
   ```bash
   npx hardhat run scripts/your-script.js --network bscMainnet
   ```

4. **Approve on Device**
   - Transaction details appear on Ledger screen
   - Review contract address
   - Review function being called
   - Review gas fees
   - Press both buttons to approve
   - Wait for confirmation

##### Using MetaMask + Ledger

1. **Connect Ledger to MetaMask**
   - Open MetaMask
   - Connect hardware wallet (as described above)
   - Select Ledger account

2. **Use dApp or BSCScan**
   - Go to contract on BSCScan
   - Click "Write Contract"
   - Connect MetaMask (with Ledger)
   - Select function to execute
   - Enter parameters
   - Click "Write"

3. **Approve Transaction**
   - MetaMask shows transaction
   - Click "Confirm"
   - Ledger device shows transaction
   - Review and approve on device

### Ledger Security Best Practices

#### Device Security

- **PIN Protection**: Never share your PIN
- **Physical Security**: Store device in safe location
- **Firmware Updates**: Keep firmware up to date
- **Genuine Device**: Only buy from official sources
- **Tamper Check**: Verify device hasn't been tampered with

#### Recovery Phrase Security

- **Write Down**: Use provided recovery sheet
- **Multiple Copies**: Store in 2-3 secure locations
- **Never Digital**: No photos, no cloud storage, no computers
- **Metal Backup**: Consider fireproof/waterproof metal backup
- **Test Recovery**: Practice recovery process with small amount first
- **Inheritance Plan**: Ensure trusted person can access if needed

#### Transaction Security

- **Verify Address**: Always verify address on device screen
- **Review Details**: Check contract address and function
- **Gas Fees**: Verify gas fees are reasonable
- **Network**: Confirm correct network (BSC Mainnet)
- **Blind Signing**: Be cautious with "blind signing" warnings

## Trezor Setup Guide

### Initial Device Setup

#### Step 1: Unbox and Connect

1. **Verify Package**
   - Check holographic seal
   - Verify device is genuine
   - Ensure package is unopened

2. **Connect Device**
   - Use provided USB cable
   - Connect to computer
   - Visit: https://trezor.io/start

#### Step 2: Initialize Device

1. **Install Trezor Bridge**
   - Download from trezor.io/start
   - Install for your operating system
   - Restart browser if needed

2. **Create New Wallet**
   - Select "Create new wallet"
   - Choose "Standard wallet"
   - Follow on-screen instructions

3. **Set PIN**
   - Choose 4-9 digit PIN
   - Use on-screen keypad (randomized for security)
   - Confirm PIN
   - **IMPORTANT**: Remember this PIN

4. **Backup Recovery Seed**
   - Device displays 12 or 24 words
   - Write on provided recovery card
   - Write in order
   - **CRITICAL**: Store securely
   - Never take photos or store digitally

5. **Confirm Recovery Seed**
   - Enter words in correct order
   - Verify you wrote them correctly

#### Step 3: Install Trezor Suite

1. **Download Trezor Suite**
   - Visit: https://trezor.io/trezor-suite
   - Download for your OS
   - Install application

2. **Connect Device**
   - Launch Trezor Suite
   - Connect Trezor device
   - Enter PIN on device
   - Allow Trezor Suite access

3. **Update Firmware**
   - Check for firmware updates
   - Install if available
   - Follow on-screen instructions

### Getting Your Trezor Address

#### Method 1: Using Trezor Suite

1. **Add Ethereum Account**
   - Open Trezor Suite
   - Select "Ethereum" from coins
   - Click "Receive"
   - Address will be displayed

2. **Verify Address**
   - Click "Show full address"
   - Address appears on Trezor screen
   - Verify both match
   - Copy address

#### Method 2: Using MetaMask

1. **Connect Trezor to MetaMask**
   - Open MetaMask
   - Click account icon → "Connect Hardware Wallet"
   - Select "Trezor"
   - Choose connection type

2. **Select Account**
   - Unlock Trezor device
   - MetaMask shows available addresses
   - Select desired address
   - Click "Unlock"

3. **Copy Address**
   - Address now in MetaMask
   - Click to copy
   - Verify on device

### Using Trezor for Contract Ownership

#### Configuration

Add Trezor address to `.env`:

```bash
# Deployer wallet
DEPLOYER_PRIVATE_KEY=0x...

# Owner wallet (Trezor address)
OWNER_ADDRESS=0xYourTrezorAddressHere
OWNER_WALLET_TYPE=hardware
```

#### Deployment Process

Same as Ledger:
1. Deploy with deployer wallet
2. Ownership transfers to Trezor address automatically
3. No Trezor interaction needed during deployment

#### Executing Admin Functions

##### Using Trezor Suite

1. **Connect Device**
   - Open Trezor Suite
   - Connect and unlock device
   - Navigate to Ethereum

2. **Send Transaction**
   - Click "Send"
   - Enter contract address
   - Enter transaction data (function call)
   - Review on device
   - Approve transaction

##### Using MetaMask + Trezor

1. **Connect Trezor to MetaMask**
   - Open MetaMask
   - Connect hardware wallet
   - Select Trezor account

2. **Execute Function**
   - Use BSCScan or dApp interface
   - Connect MetaMask (with Trezor)
   - Execute contract function
   - Review on Trezor screen
   - Approve on device

### Trezor Security Best Practices

#### Device Security

- **PIN Protection**: Use strong PIN, never share
- **Physical Security**: Store in safe place
- **Firmware Updates**: Keep up to date
- **Genuine Device**: Buy only from Trezor.io
- **Passphrase**: Consider adding passphrase for extra security

#### Recovery Seed Security

- **Write Down**: Use recovery card
- **Multiple Copies**: Store in different locations
- **Never Digital**: No photos, no cloud, no computers
- **Metal Backup**: Consider Cryptosteel or similar
- **Test Recovery**: Practice recovery process
- **Inheritance**: Plan for trusted access

#### Transaction Security

- **Verify Address**: Check on device screen
- **Review Details**: Confirm contract and function
- **Gas Fees**: Verify reasonable fees
- **Network**: Confirm BSC Mainnet
- **Phishing**: Beware of fake websites

## Troubleshooting

### Ledger Issues

#### Device Not Detected

**Symptoms**: Computer doesn't recognize Ledger

**Solutions**:
- Try different USB port
- Try different USB cable
- Update Ledger Live
- Install/reinstall Ledger Bridge
- Restart computer
- Update device firmware

#### "Contract Data Not Enabled"

**Symptoms**: Cannot execute smart contract functions

**Solutions**:
- Open Ethereum app on device
- Go to Settings in app
- Enable "Contract Data"
- Retry transaction

#### Transaction Rejected

**Symptoms**: Transaction fails on device

**Solutions**:
- Check device battery (Nano X)
- Ensure Ethereum app is open
- Verify correct network
- Check gas fees are sufficient
- Retry transaction

#### Blind Signing Warning

**Symptoms**: Device shows "Blind signing" warning

**Solutions**:
- This is normal for complex contract interactions
- Review transaction details carefully
- Verify contract address is correct
- Proceed if you trust the transaction
- Consider enabling "Debug Data" for more info

### Trezor Issues

#### Device Not Detected

**Symptoms**: Computer doesn't recognize Trezor

**Solutions**:
- Install/reinstall Trezor Bridge
- Try different USB port/cable
- Update Trezor Suite
- Restart browser
- Update device firmware

#### Connection Timeout

**Symptoms**: Device connection times out

**Solutions**:
- Unlock device before connecting
- Close other applications using device
- Restart Trezor Suite
- Reconnect device

#### Transaction Failed

**Symptoms**: Transaction doesn't complete

**Solutions**:
- Check device is unlocked
- Verify sufficient gas fees
- Confirm correct network
- Check internet connection
- Retry transaction

### General Hardware Wallet Issues

#### Lost Device

**Action Plan**:
1. **Don't Panic**: Keys are safe if you have recovery seed
2. **Get New Device**: Order replacement device
3. **Recover Wallet**: Use recovery seed to restore
4. **Verify Address**: Confirm address matches original
5. **Test Small Transaction**: Verify everything works
6. **Resume Operations**: Continue using new device

#### Forgotten PIN

**Action Plan**:
1. **Don't Guess**: Too many wrong attempts will wipe device
2. **Recover Wallet**: Use recovery seed on new/wiped device
3. **Set New PIN**: Choose new PIN during recovery
4. **Verify Address**: Confirm address matches
5. **Resume Operations**: Continue with new PIN

#### Lost Recovery Seed

**Critical Situation**:
- **If Device Still Works**: Immediately transfer ownership to new wallet
- **If Device Lost**: Ownership cannot be recovered
- **Prevention**: Always have secure backup of recovery seed

## Testing Recommendations

### Before Mainnet

1. **Test on Testnet**
   - Deploy test contract
   - Transfer ownership to hardware wallet
   - Execute all admin functions
   - Verify everything works

2. **Test Recovery**
   - Wipe device (or use second device)
   - Recover from seed phrase
   - Verify address matches
   - Test transaction signing

3. **Test Emergency Scenarios**
   - Practice with device disconnected
   - Practice with wrong PIN
   - Practice recovery process
   - Document all procedures

### Mainnet Deployment

1. **Final Checks**
   - Verify device firmware is updated
   - Confirm recovery seed is backed up
   - Test device connection
   - Verify address one more time

2. **Deployment**
   - Execute deployment script
   - Verify ownership transfer
   - Test one admin function
   - Document all details

3. **Post-Deployment**
   - Store device securely
   - Document access procedures
   - Train team members
   - Regular security reviews

## Best Practices Summary

### Setup Phase

- ✅ Buy only from official sources
- ✅ Verify device integrity
- ✅ Use strong PIN
- ✅ Write down recovery seed on paper
- ✅ Store recovery seed in multiple secure locations
- ✅ Test recovery process
- ✅ Keep firmware updated

### Operational Phase

- ✅ Verify all addresses on device screen
- ✅ Review all transaction details
- ✅ Keep device in secure location
- ✅ Never share PIN or recovery seed
- ✅ Use device only on trusted computers
- ✅ Keep firmware and software updated
- ✅ Regular security audits

### Emergency Phase

- ✅ Have recovery seed accessible
- ✅ Know recovery procedures
- ✅ Have backup device available
- ✅ Document all processes
- ✅ Train team members
- ✅ Regular emergency drills

## Additional Resources

### Official Documentation

- **Ledger**: https://support.ledger.com
- **Trezor**: https://trezor.io/support
- **MetaMask**: https://metamask.io/support

### Security Guides

- **Ledger Security**: https://www.ledger.com/academy/security
- **Trezor Security**: https://trezor.io/learn/a/how-to-keep-your-trezor-safe
- **Hardware Wallet Comparison**: https://www.ledger.com/academy/hardware-wallets-and-cold-wallets-whats-the-difference

### Community Support

- **Ledger Reddit**: r/ledgerwallet
- **Trezor Reddit**: r/TREZOR
- **Ethereum**: r/ethereum

## Support

For hardware wallet specific issues:
- **Ledger Support**: https://support.ledger.com/hc/en-us
- **Trezor Support**: https://trezor.io/support/technical

For SylvanToken integration issues:
- Review this guide
- Check deployment logs
- Verify transaction on BSCScan
- Contact development team

---

**Last Updated**: November 11, 2025-

**Version**: 1.0.0
