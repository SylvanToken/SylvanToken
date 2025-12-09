# Changelog

All notable changes to the Sylvan Token project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.4.4] - 2025-12-09

### Added - SafeWallet Verify Ownership (Message Signing & Verification)
- **SafeWallet/src/components/VerifyOwnership.jsx** - Complete wallet ownership verification system
  - Sign messages with Safe Wallet (EIP-191 standard)
  - Verify message signatures from any wallet
  - Generate sample verification messages
  - Copy signatures to clipboard
  - Two modes: Sign and Verify
  - Technical information display (message hash, recovered address)
  - Security warnings and best practices
  - Turkish language interface
- **SafeWallet/src/App.jsx** - Added "✍️ İmza Doğrulama" tab
- **SafeWallet/src/styles.css** - Added verify ownership styles

### Use Cases
- Prove wallet ownership to third parties
- Verify potentially compromised wallets
- Authorization for specific operations
- Create audit trails with signed messages
- Security validation before critical operations

---

## [2.4.3] - 2025-12-09

### Added - SafeWallet Security Management System
- **SafeWallet/src/components/SecurityManagement.jsx** - Comprehensive wallet security tracking
  - Mark wallets as compromised or secure
  - Visual security status indicators
  - Add custom compromised addresses
  - Export security configuration as JSON
  - Real-time security alerts
  - Turkish language interface
- **SafeWallet/src/components/Dashboard.jsx** - Enhanced with security status columns
  - Security Status column in System Wallet Balances table
  - Security Status column in Admin Wallet Balances table
  - Red background highlighting for compromised wallets
  - Security alert boxes when compromised wallets detected
- **SafeWallet/src/config.js** - Added compromised wallet tracking
  - `compromised` flag for each wallet
  - `COMPROMISED_WALLETS` array for easy management
  - Deployer wallet marked as compromised by default
- **SafeWallet/src/App.jsx** - Added "🛡️ Güvenlik" tab
- **SafeWallet/src/styles.css** - Added security management styles

### Security Enhancement
- Provides visual tracking of compromised wallets
- Alerts users to security risks in Dashboard
- Enables quick identification of wallets needing attention
- Supports exporting security configuration for backup
- Integrates with Safe Management for removing compromised signers

---

## [2.4.2] - 2025-12-09

### Added - SafeWallet Safe Management Component
- **SafeWallet/src/components/SafeManagement.jsx** - Complete Safe signer management interface
  - View current Safe signers with status badges
  - Add new signer with threshold control
  - Remove signer with linked list handling
  - Change threshold dynamically
  - Swap owner functionality
  - Quick actions for replacing compromised deployer wallet
  - Turkish language interface
  - Real-time Safe state updates
- **SafeWallet/src/App.jsx** - Added "🔐 Safe Yönetimi" tab
- **SafeWallet/src/styles.css** - Added comprehensive styles for Safe Management UI

### Security Enhancement
- Provides UI to remove compromised deployer wallet (`0xf949f50B3C32bD4cDa7D2192ff8f51dd9db4A469`)
- Enables adding new secure signers
- Allows threshold adjustments for governance flexibility
- All operations require Safe multi-sig approval

---

## [2.4.1] - 2025-12-09

### Fixed - Documentation Placeholders
- **Replaced All Placeholders**: All remaining address placeholders replaced with actual addresses
- **Safe Wallet Address**: `0xC5CcDC8F01739CeD02B30b5aD10DD5Fb201436bB`
- **Fee Wallet**: `0x46a4AF3bdAD67d3855Af42Ba0BBe9248b54F7915`
- **Donation Wallet**: `0xa697645Fdfa5d9399eD18A6575256F81343D4e17`
- **Locked Reserve**: `0x687A2c7E494c3818c20AD2856d453514970d6aac`

### Updated Files
- **README.md** - Replaced [SAFE_ADDRESS] placeholder
- **WHITEPAPER.md** - Replaced [SAFE_ADDRESS] placeholder
- **SECURITY.md** - Replaced [SAFE_ADDRESS] and signer addresses
- **LAUNCH_PLAN.md** - Replaced [SAFE_ADDRESS] placeholder
- **MAINNET_DEPLOYMENT_SUCCESS.md** - Replaced [SAFE_ADDRESS] and signer addresses, marked ownership as transferred
- **docs/DOCUMENTATION_INDEX.md** - Replaced [DONATION_WALLET] placeholder
- **docs/MULTISIG_WALLET_SETUP_GUIDE.md** - Replaced [SAFE_ADDRESS] placeholder
- **docs/MONITORING_SYSTEM_SETUP_GUIDE.md** - Replaced [FEE_WALLET], [DONATION_WALLET], [LOCKED_RESERVE] placeholders
- **newdocs/** - All corresponding files in newdocs directory updated

### Documentation Completion
- All wallet addresses now properly documented
- Safe Wallet signers fully identified
- Monitoring scripts ready with correct addresses
- Ownership transfer status marked as complete

---

## [2.4.0] - 2025-12-09

### Added - Safe Wallet Ownership Transfer
- **Ownership Transferred**: Contract ownership transferred to Safe Wallet
- **Safe Wallet Address**: `0xC5CcDC8F01739CeD02B30b5aD10DD5Fb201436bB`
- **Governance Model**: Multi-Signature 2/3 Threshold
- **Previous Owner**: `0xf949f50B3C32bD4cDa7D2192ff8f51dd9db4A469`
- **Transfer Date**: December 9, 2025

### Changed - Governance Structure
- All owner functions now require 2/3 multi-sig approval
- Enhanced security through decentralized control
- No single point of failure for critical operations

### Updated Files
- **deployments/bsc-mainnet-deployment-2025-12-09.json** - Added ownership and Safe Wallet information
- **README.md** - Updated contract owner and governance information
- **SYLVAN_TOKEN_COMPLETE_REFERENCE.md** - Updated ownership structure and Safe Wallet details
- **CHANGELOG.md** - Documented ownership transfer

### Security Enhancement
- Contract now managed by multi-signature wallet
- Vesting releases require multi-sig approval
- Fee exemption changes require multi-sig approval
- Enhanced protection against unauthorized access

---

## [2.3.1] - 2025-12-09

### Added - BSCScan Contract Verification
- **Contract Verified**: `0xc66404C3fa3E01378027b4A4411812D3a8D458F5`
- **BSCScan URL**: https://bscscan.com/address/0xc66404C3fa3E01378027b4A4411812D3a8D458F5#code
- **standard-input-new.json** - Standard JSON Input file for verification
- **deployments/bsc-mainnet-deployment-2025-12-09.json** - Updated verification status

---

## [2.3.0] - 2025-12-09

### Added - BSC Mainnet Deployment (New Contract)
- **Contract Address**: `0xc66404C3fa3E01378027b4A4411812D3a8D458F5`
- **scripts/deployment/continue-deployment.js** - Deployment continuation script
- **scripts/deployment/finalize-distribution.js** - Token distribution finalization script
- **scripts/deployment/complete-distribution.js** - Full token distribution to all wallets
- **deployments/bsc-mainnet-deployment-2025-12-09.json** - Deployment record
- **docs/BSC_MAINNET_VERIFICATION_GUIDE.md** - Manual verification guide
- **SylvanToken-flattened-v2.sol** - Flattened contract for verification

### Changed - Deployment Script Fix
- **scripts/deployment/deploy-enhanced-complete.js** - Fixed AdminWalletConfig struct access
  - Removed reference to non-existent `monthlyRelease` field
  - Monthly release now calculated dynamically (5% of total allocation)
- **hardhat.config.js** - Updated to use @nomicfoundation/hardhat-verify
- **SafeWallet/src/config.js** - Updated contract address
- **config/safe-wallet.config.js** - Updated contract address
- **arguments.js** - Updated constructor arguments for new deployment

### Deployment Summary
- Total Supply: 1,000,000,000 SYL
- Founder Wallet: 160,000,000 SYL (16%)
- Sylvan Token Wallet: 500,000,000 SYL (50%)
- Locked Wallet: 300,000,000 SYL (30%)
- Admin Wallets: 40,000,000 SYL total (4 x 10M each, 4%)

### Admin Wallets Configured
- 0x1109B6aDB60dB170139f00bA2490fCA0F8BE7A8C
- 0xe64660026a1aaDaea2ac6032b6B59f8714a08E34
- 0xd1cc4222b7b62fb623884371337ae04cf44b93a7
- 0x106A637D825e562168678b7fd0f75cFf2cF2845B

### Documentation Update
- Updated all documentation files with new contract address
- Replaced old address `0x50FfD5b14a1b4CDb2EA29fC61bdf5EB698f72e85` with new address `0xc66404C3fa3E01378027b4A4411812D3a8D458F5`
- Files updated: config files, scripts, docs, guides, reports

---

## [2.2.5] - 2025-12-09

### Added - Vesting Release Authorization Configuration
- **config/safe-wallet.config.js** - Added vestingReleaseAuthorization section
  - Defines Safe Wallet as authorized vesting releaser
  - Lists all permitted vesting functions
  - Includes activation steps for ownership transfer
  - Status tracking (pending/active)

---

## [2.2.4] - 2025-12-09

### Added - Safe Wallet Ownership Management Component
- **SafeWallet/src/components/Ownership.jsx** - New ownership management component
  - Quick transfer to Safe Wallet with one click
  - Custom address transfer option
  - Current owner status display
  - Confirmation steps for safety
  - Turkish language support

### Changed
- **SafeWallet/src/App.jsx** - Added Ownership tab to navigation

---

## [2.2.3] - 2025-12-09

### Added - Safe Wallet Ownership Transfer Guide
- **docs/SAFE_WALLET_OWNERSHIP_TRANSFER_GUIDE.md** - Complete guide for transferring ownership to Safe Wallet
  - Step-by-step BSCScan manual transfer instructions
  - Script-based transfer method
  - Post-transfer verification checklist
  - Safe Wallet lock release operations guide

---

## [2.2.0] - 2025-12-08

### Added - Complete Documentation Overhaul
- **README.md** - Complete rewrite with updated project information
- **WHITEPAPER.md** - Version 2.0 with current tokenomics and governance
- **ROADMAP.md** - Updated development timeline
- **SECURITY.md** - Comprehensive security documentation
- **CONTRIBUTING.md** - Contribution guidelines
- **LAUNCH_PLAN.md** - Mainnet launch strategy

### Added - Documentation Suite
- **docs/API_REFERENCE.md** - Complete API documentation
- **docs/DOCUMENTATION_INDEX.md** - Documentation overview
- **docs/VESTING_LOCK_GUIDE.md** - Vesting system guide
- **docs/MULTISIG_WALLET_SETUP_GUIDE.md** - Safe Wallet setup
- **docs/EMERGENCY_PROCEDURES_GUIDE.md** - Emergency procedures
- **docs/MONITORING_SYSTEM_SETUP_GUIDE.md** - Monitoring setup
- **docs/FREE_AUDIT_TOOLS_GUIDE.md** - Audit tools guide

### Changed
- All documentation updated to reflect current project state
- Contract address placeholders for new deployment
- Safe Wallet configuration (3 signers, 2/3 threshold)
- Removed outdated pause mechanism references

---

## [2.1.5] - 2025-12-08

### Added - Safe App for Vesting Management
- **SafeWallet/** - Complete Safe App project
  - React-based Safe App using @safe-global/safe-apps-sdk
  - Dashboard with wallet status and statistics
  - Vesting release interface for admin and locked wallets
  - Airdrop/batch transfer functionality
  - Schedule tracking with countdown timer
  - Fee exemption management

### Files Created
- `SafeWallet/package.json`
- `SafeWallet/src/App.jsx`
- `SafeWallet/src/components/Dashboard.jsx`
- `SafeWallet/src/components/VestingRelease.jsx`
- `SafeWallet/src/components/Schedule.jsx`
- `SafeWallet/src/components/FeeManagement.jsx`
- `SafeWallet/src/components/Airdrop.jsx`
- `SafeWallet/src/config.js`
- `SafeWallet/public/manifest.json`

---

## [2.1.4] - 2025-12-08

### Added - Safe Wallet Activation
- **scripts/management/transfer-ownership-to-safe.js**
- **docs/SAFE_WALLET_ACTIVATION_GUIDE.md**

### Changed
- Safe Wallet configuration corrected (3 signers, 2/3 threshold)

---

## [2.1.3] - 2025-12-08

### Added - Safe Wallet Configuration
- **config/safe-wallet.config.js**
- **config/safe-wallet-abi.json**
- **docs/SAFE_WALLET_GUIDE.md**

---

## [2.1.2] - 2025-12-08

### Added
- **WALLET_DISTRIBUTION_REPORT.md**
- **SYLVAN_TOKEN_COMPLETE_REFERENCE.md**

---

## [2.1.1] - 2025-12-03

### Fixed - Critical Audit Issues

#### Issue #1: Incorrect Vesting Calculation (MEDIUM)
- Fixed `releaseVestedTokens` function
- Admin wallets now use correct calculation
- Prevents 9% permanent fund loss

#### Issue #3: Owner Can Lock Token Transfer (MEDIUM)
- Pause mechanism completely removed
- Contract is fully decentralized

### Added - Audit Verification Tests
- **test/vesting-calculation-fix.test.js** (7 tests)
- **test/no-pause-mechanism.test.js** (12 tests)
- **test/ownership-privileges.test.js** (20 tests)

### Test Results
- 275 tests passing
- 0 tests failing

---

## [2.1.0] - 2025-12-03

### Removed - Pause Mechanism
- All pause-related code moved to archive
- SafeWallet multisig used for governance instead

### Changed
- **contracts/SylvanToken.sol** - Removed pause functions
- **contracts/libraries/AccessControl.sol** - Removed pause-related code

---

## [2.0.0] - 2025-12-03

### BREAKING CHANGE - Complete Removal of Pause Mechanism

#### Removed Features
- ❌ Multi-signature pause mechanism
- ❌ All pause-related functions
- ❌ Pause state variables
- ❌ Transfer blocking during pause

#### Benefits
- ✅ Full Decentralization
- ✅ Eliminates Centralization Risk
- ✅ Simpler Contract
- ✅ Increased Trust

---

## [1.0.0] - 2025-11-10

### Added - Initial Release
- SylvanToken contract
- 1% universal fee system
- Fee distribution (50% ops, 25% donation, 25% burn)
- Admin wallet vesting (10% immediate, 90% vested)
- Locked wallet vesting (100% vested, 34 months)
- Proportional burning (10% of releases)
- Fee exemption system
- Comprehensive test suite

### Technical Details
- Solidity 0.8.24
- OpenZeppelin 4.9.6
- Hardhat 2.26.3
- BSC Mainnet deployment

---

## Version History Summary

| Version | Date | Type | Description |
|---------|------|------|-------------|
| 2.2.0 | 2025-12-08 | Major | Documentation overhaul |
| 2.1.5 | 2025-12-08 | Minor | Safe App development |
| 2.1.1 | 2025-12-03 | Patch | Audit fixes |
| 2.1.0 | 2025-12-03 | Minor | Pause removal |
| 2.0.0 | 2025-12-03 | Major | Full decentralization |
| 1.0.0 | 2025-11-10 | Major | Initial release |

---

<div align="center">

**Sylvan Token Changelog**

Last Updated: December 8, 2025

</div>
