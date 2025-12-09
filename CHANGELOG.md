# Changelog

All notable changes to the Sylvan Token project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
