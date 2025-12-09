# Enhanced Management Scripts Guide

## 🎯 Overview

This comprehensive guide covers all management scripts and tools for the Enhanced SylvanToken system. Learn how to effectively manage fee exemptions, monitor lock mechanisms, and maintain system health using the provided management tools.

## 🛠️ Management Script Architecture

### Script Categories
```
Management Scripts:
├── Fee Exemption Management
│   ├── manage-fee-exemptions.js
│   ├── validate-exemption-config.js
│   └── exemption-config-loader.js
├── Lock Mechanism Management
│   ├── monitor-lock-mechanisms.js
│   ├── setup-lock-mechanisms.js
│   └── test-lock-mechanisms.js
├── System Monitoring
│   ├── monitor-tax-collection.js
│   ├── gas-optimization-check.js
│   └── final-security-review.js
└── Deployment & Validation
    ├── deploy-enhanced-complete.js
    ├── validate-deployment-script.js
    └── pre-mainnet-checklist.js
```

## 🏦 Fee Exemption Management Scripts

### 1. Interactive Fee Exemption Manager

**Script**: `scripts/manage-fee-exemptions.js`

**Features:**
- Interactive command-line interface
- Real-time exemption status checking
- Batch exemption operations
- Configuration validation

**Usage:**
```bash
# Start interactive manager
node scripts/manage-fee-exemptions.js

# Available commands:
# - list: Show all exempt wallets
# - add <address>: Add exemption
# - remove <address>: Remove exemption
# - check <address>: Check exemption status
# - batch <file>: Batch update from file
# - stats: Show exemption statistics
# - exit: Exit manager
```

**Example Session:**
```bash
$ node scripts/manage-fee-exemptions.js

🏦 Enhanced Fee Exemption Manager
Connected to: EnhancedSylvanToken (0x...)
Network: BSC Mainnet

> list
📋 Current Exempt Wallets (7 total):
✅ 0x3e13b113482bCbCcfCd0D8517174EFF81b36a740 (Fee Wallet)
✅ 0x9Df4B945cef88E42c78522BB26621bBF2DCd10ef (Donation Wallet)
✅ 0xE56ab5861f2B1C8dC185ecF8881242256CdB4c17 (Locked Wallet)
✅ 0x1109B6aDB60dB170139f00bA2490fCA0F8BE7A8C (Founder)
✅ 0x2109B6aDB60dB170139f00bA2490fCA0F8BE7A8D (Team)
❌ 0xC4FB112cF0Ee27b33F112A9e3c20F8090a246902 (Admin MAD - Non-exempt)
❌ 0xc19855A1477770c69412fD2165BdB0b33ec81D7e (Admin LEB - Non-exempt)

> add 0x1234567890123456789012345678901234567890
✅ Adding exemption for 0x1234567890123456789012345678901234567890
📤 Transaction sent: 0xabc123...
⏳ Waiting for confirmation...
✅ Exemption added successfully!

> check 0x1234567890123456789012345678901234567890
✅ Wallet 0x1234567890123456789012345678901234567890 is EXEMPT from fees

> stats
📊 Exemption Statistics:
- Total exempt wallets: 8
- System wallets: 3 (Fee, Donation, Locked)
- Admin wallets exempt: 0/4
- Special wallets exempt: 2 (Founder, Team)
- Custom exemptions: 3
```

### 2. Batch Exemption Configuration

**Script**: `scripts/exemption-config-loader.js`

**Features:**
- Load exemptions from configuration files
- Environment variable integration
- Validation and error handling
- Dry-run mode for testing

**Configuration File Format** (`exemptions.json`):
```json
{
  "exemptions": [
    {
      "address": "0x1234567890123456789012345678901234567890",
      "exempt": true,
      "description": "Partner wallet",
      "category": "partner"
    },
    {
      "address": "0xABCDEF1234567890123456789012345678901234",
      "exempt": false,
      "description": "Remove previous exemption",
      "category": "admin"
    }
  ],
  "metadata": {
    "version": "1.0",
    "created": "2024-11-01",
    "description": "Monthly exemption updates"
  }
}
```

**Usage:**
```bash
# Load exemptions from file
node scripts/exemption-config-loader.js --file exemptions.json

# Dry run (preview changes)
node scripts/exemption-config-loader.js --file exemptions.json --dry-run

# Load from environment variables
node scripts/exemption-config-loader.js --env

# Validate configuration only
node scripts/exemption-config-loader.js --file exemptions.json --validate-only
```

### 3. Exemption Configuration Validator

**Script**: `scripts/validate-exemption-config.js`

**Features:**
- Validate environment configuration
- Check wallet address formats
- Verify exemption logic consistency
- Generate validation reports

**Usage:**
```bash
# Validate current configuration
node scripts/validate-exemption-config.js

# Validate specific configuration file
node scripts/validate-exemption-config.js --config exemptions.json

# Generate detailed report
node scripts/validate-exemption-config.js --report --output validation-report.json
```

**Example Output:**
```bash
$ node scripts/validate-exemption-config.js

🔍 Enhanced Exemption Configuration Validator

✅ Environment Variables:
  - FEE_EXEMPT_WALLETS: Valid (5 entries)
  - ADDITIONAL_EXEMPT_WALLETS: Valid (3 entries)
  - Admin wallet configurations: Valid

✅ Address Validation:
  - All addresses are valid Ethereum addresses
  - No duplicate addresses found
  - Critical wallets properly configured

✅ Logic Validation:
  - System wallets are exempt: ✅
  - Admin wallet exemption settings: ✅
  - No conflicting configurations: ✅

📊 Summary:
  - Total configured exemptions: 8
  - Valid configurations: 8
  - Warnings: 0
  - Errors: 0

✅ Configuration is valid and ready for deployment!
```

## 🔐 Lock Mechanism Management Scripts

### 1. Interactive Lock Monitor

**Script**: `scripts/monitor-lock-mechanisms.js`

**Features:**
- Real-time lock status monitoring
- Release processing
- Burn statistics tracking
- Schedule management

**Usage:**
```bash
# Start interactive monitor
node scripts/monitor-lock-mechanisms.js

# Available commands:
# - status: Show all lock statuses
# - release <address>: Process release for wallet
# - schedule <address>: Show release schedule
# - burns: Show burn statistics
# - releasable: Show all releasable amounts
# - history: Show release history
# - exit: Exit monitor
```

**Example Session:**
```bash
$ node scripts/monitor-lock-mechanisms.js

🔐 Enhanced Lock Mechanism Monitor
Connected to: EnhancedSylvanToken (0x...)
Network: BSC Mainnet

> status
📊 Lock Status Overview:

👑 Admin Wallets:
┌─────────────────────────────────────────────┬──────────────┬──────────────┬──────────────┬─────────────┐
│ Wallet                                      │ Total        │ Released     │ Burned       │ Next Release│
├─────────────────────────────────────────────┼──────────────┼──────────────┼──────────────┼─────────────┤
│ 0xC4FB...6902 (Admin MAD)                  │ 10,000,000   │ 2,000,000    │ 200,000      │ 2024-12-01  │
│ 0xc198...1D7e (Admin LEB)                  │ 10,000,000   │ 1,500,000    │ 150,000      │ 2024-12-01  │
│ 0x623b...F8b (Admin CNK)                   │ 10,000,000   │ 1,000,000    │ 100,000      │ 2024-12-01  │
│ 0xd1cC...93a7 (Admin KDR)                  │ 10,000,000   │ 500,000      │ 50,000       │ 2024-12-01  │
└─────────────────────────────────────────────┴──────────────┴──────────────┴──────────────┴─────────────┘

🔒 Locked Wallet:
┌─────────────────────────────────────────────┬──────────────┬──────────────┬──────────────┬─────────────┐
│ Wallet                                      │ Total        │ Released     │ Burned       │ Next Release│
├─────────────────────────────────────────────┼──────────────┼──────────────┼──────────────┼─────────────┤
│ 0xE56a...4c17 (Locked Wallet)              │ 300,000,000  │ 27,000,000   │ 2,700,000    │ 2024-12-01  │
└─────────────────────────────────────────────┴──────────────┴──────────────┴──────────────┴─────────────┘

📈 System Totals:
- Total Locked: 336,000,000 SYL
- Total Released: 32,000,000 SYL
- Total Burned: 3,200,000 SYL
- Next Release Date: 2024-12-01 12:00:00 UTC

> releasable
🎯 Releasable Amounts (as of 2024-12-01):

Admin Wallets:
- Admin MAD: 500,000 SYL (50,000 SYL will be burned)
- Admin LEB: 500,000 SYL (50,000 SYL will be burned)
- Admin CNK: 500,000 SYL (50,000 SYL will be burned)
- Admin KDR: 500,000 SYL (50,000 SYL will be burned)

Locked Wallet:
- Locked Wallet: 9,000,000 SYL (900,000 SYL will be burned)

Total Releasable: 11,000,000 SYL
Total Burns: 1,100,000 SYL
Net Release: 9,900,000 SYL

> release 0xC4FB112cF0Ee27b33F112A9e3c20F8090a246902
🔄 Processing release for Admin MAD (0xC4FB...6902)...
📤 Transaction sent: 0xdef456...
⏳ Waiting for confirmation...
✅ Release processed successfully!
  - Gross Amount: 500,000 SYL
  - Burned: 50,000 SYL
  - Net Released: 450,000 SYL
  - Transaction: 0xdef456...
```

### 2. Lock Mechanism Setup

**Script**: `scripts/setup-lock-mechanisms.js`

**Features:**
- Initialize all lock mechanisms
- Configure vesting schedules
- Process initial releases
- Validate setup completion

**Usage:**
```bash
# Setup all lock mechanisms
node scripts/setup-lock-mechanisms.js

# Setup specific wallet type
node scripts/setup-lock-mechanisms.js --type admin
node scripts/setup-lock-mechanisms.js --type locked

# Dry run (preview setup)
node scripts/setup-lock-mechanisms.js --dry-run

# Setup with custom parameters
node scripts/setup-lock-mechanisms.js --config custom-lock-config.json
```

**Configuration File** (`lock-config.json`):
```json
{
  "adminWallets": [
    {
      "address": "0xC4FB112cF0Ee27b33F112A9e3c20F8090a246902",
      "allocation": "10000000000000000000000000",
      "immediateRelease": 1000,
      "monthlyRelease": 500,
      "vestingMonths": 18,
      "cliffDays": 0
    }
  ],
  "lockedWallet": {
    "address": "0xE56ab5861f2B1C8dC185ecF8881242256CdB4c17",
    "allocation": "300000000000000000000000000",
    "monthlyRelease": 300,
    "vestingMonths": 34,
    "cliffDays": 0
  },
  "burnRate": 1000
}
```

### 3. Lock Testing and Validation

**Script**: `scripts/test-lock-mechanisms.js`

**Features:**
- Comprehensive lock testing
- Release calculation validation
- Burn amount verification
- Schedule accuracy testing

**Usage:**
```bash
# Run all lock tests
node scripts/test-lock-mechanisms.js

# Test specific functionality
node scripts/test-lock-mechanisms.js --test release-calculation
node scripts/test-lock-mechanisms.js --test burn-amounts
node scripts/test-lock-mechanisms.js --test schedule-timing

# Generate test report
node scripts/test-lock-mechanisms.js --report --output lock-test-report.json
```

## 📊 System Monitoring Scripts

### 1. Tax Collection Monitor

**Script**: `scripts/monitor-tax-collection.js`

**Features:**
- Real-time fee collection monitoring
- Exemption rate tracking
- Distribution analysis
- Performance metrics

**Usage:**
```bash
# Start tax collection monitor
node scripts/monitor-tax-collection.js

# Monitor specific time period
node scripts/monitor-tax-collection.js --period 24h
node scripts/monitor-tax-collection.js --period 7d
node scripts/monitor-tax-collection.js --period 30d

# Generate collection report
node scripts/monitor-tax-collection.js --report --output tax-report.json
```

**Example Output:**
```bash
$ node scripts/monitor-tax-collection.js --period 24h

💰 Tax Collection Monitor (Last 24 Hours)

📊 Collection Summary:
- Total Transactions: 1,247
- Taxed Transactions: 873 (70%)
- Exempt Transactions: 374 (30%)
- Total Fees Collected: 12,450 SYL

💸 Fee Distribution:
- Fee Wallet: 6,225 SYL (50%)
- Donation Wallet: 3,112.5 SYL (25%)
- Burn Wallet: 3,112.5 SYL (25%)

📈 Hourly Breakdown:
┌──────────┬─────────────┬──────────────┬─────────────┐
│ Hour     │ Transactions│ Fees (SYL)   │ Exempt Rate │
├──────────┼─────────────┼──────────────┼─────────────┤
│ 00:00    │ 45          │ 423          │ 28%         │
│ 01:00    │ 38          │ 367          │ 31%         │
│ ...      │ ...         │ ...          │ ...         │
│ 23:00    │ 67          │ 634          │ 25%         │
└──────────┴─────────────┴──────────────┴─────────────┘

🎯 Top Fee Payers:
1. 0x1234...7890: 1,250 SYL (125 transactions)
2. 0xABCD...1234: 890 SYL (89 transactions)
3. 0x5678...CDEF: 567 SYL (56 transactions)

⚡ Performance Metrics:
- Average fee per transaction: 14.26 SYL
- Peak hour: 15:00 (89 transactions)
- Lowest exemption rate: 22% (14:00)
- Highest exemption rate: 38% (03:00)
```

### 2. Gas Optimization Checker

**Script**: `scripts/gas-optimization-check.js`

**Features:**
- Gas usage analysis
- Optimization recommendations
- Cost projections
- Performance benchmarks

**Usage:**
```bash
# Run gas optimization check
node scripts/gas-optimization-check.js

# Check specific operations
node scripts/gas-optimization-check.js --operation transfer
node scripts/gas-optimization-check.js --operation exemption
node scripts/gas-optimization-check.js --operation release

# Generate optimization report
node scripts/gas-optimization-check.js --report --output gas-report.json
```

### 3. Security Review Script

**Script**: `scripts/final-security-review.js`

**Features:**
- Comprehensive security validation
- Configuration verification
- Access control testing
- Vulnerability scanning

**Usage:**
```bash
# Run complete security review
node scripts/final-security-review.js

# Quick security check
node scripts/final-security-review.js --quick

# Generate security report
node scripts/final-security-review.js --report --output security-report.json
```

## 🚀 Deployment and Validation Scripts

### 1. Enhanced Complete Deployment

**Script**: `scripts/deploy-enhanced-complete.js`

**Features:**
- Complete system deployment
- Configuration setup
- Initial distribution
- Validation checks

**Usage:**
```bash
# Deploy to testnet
npx hardhat run scripts/deploy-enhanced-complete.js --network bscTestnet

# Deploy to mainnet
npx hardhat run scripts/deploy-enhanced-complete.js --network bscMainnet

# Deploy with custom configuration
DEPLOYMENT_CONFIG=custom-config.json npx hardhat run scripts/deploy-enhanced-complete.js --network bscTestnet
```

### 2. Deployment Validation

**Script**: `scripts/validate-deployment-script.js`

**Features:**
- Post-deployment validation
- Configuration verification
- System health checks
- Integration testing

**Usage:**
```bash
# Validate deployment
node scripts/validate-deployment-script.js --contract 0xContractAddress

# Comprehensive validation
node scripts/validate-deployment-script.js --contract 0xContractAddress --comprehensive

# Generate validation report
node scripts/validate-deployment-script.js --contract 0xContractAddress --report
```

### 3. Pre-Mainnet Checklist

**Script**: `scripts/pre-mainnet-checklist.js`

**Features:**
- Mainnet readiness assessment
- Security verification
- Configuration validation
- Risk assessment

**Usage:**
```bash
# Run pre-mainnet checklist
node scripts/pre-mainnet-checklist.js --contract 0xContractAddress

# Generate readiness report
node scripts/pre-mainnet-checklist.js --contract 0xContractAddress --report
```

## 🔧 Custom Script Development

### Script Template
```javascript
// scripts/custom-management-script.js
const { ethers } = require("hardhat");
const readline = require('readline');

class CustomManagementScript {
  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  }

  async initialize() {
    // Get contract instance
    const contractAddress = process.env.CONTRACT_ADDRESS;
    this.token = await ethers.getContractAt("EnhancedSylvanToken", contractAddress);
    
    // Get signer
    const [signer] = await ethers.getSigners();
    this.signer = signer;
    
    console.log(`🔧 Custom Management Script`);
    console.log(`Connected to: ${contractAddress}`);
    console.log(`Signer: ${signer.address}`);
  }

  async runInteractiveMode() {
    console.log('\nAvailable commands:');
    console.log('- command1: Description');
    console.log('- command2: Description');
    console.log('- exit: Exit script');

    this.rl.on('line', async (input) => {
      const [command, ...args] = input.trim().split(' ');
      
      try {
        switch (command) {
          case 'command1':
            await this.handleCommand1(args);
            break;
          case 'command2':
            await this.handleCommand2(args);
            break;
          case 'exit':
            this.rl.close();
            process.exit(0);
            break;
          default:
            console.log('Unknown command. Type "exit" to quit.');
        }
      } catch (error) {
        console.error('Error:', error.message);
      }
      
      this.rl.prompt();
    });

    this.rl.prompt();
  }

  async handleCommand1(args) {
    // Implement custom command logic
    console.log('Executing command1 with args:', args);
  }

  async handleCommand2(args) {
    // Implement custom command logic
    console.log('Executing command2 with args:', args);
  }
}

// Main execution
async function main() {
  const script = new CustomManagementScript();
  await script.initialize();
  await script.runInteractiveMode();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = CustomManagementScript;
```

## 📋 Script Usage Best Practices

### 1. Environment Setup
```bash
# Always set required environment variables
export CONTRACT_ADDRESS=0x...
export PRIVATE_KEY=0x...
export BSC_MAINNET_RPC=https://...

# Use .env file for persistent configuration
cp .env.example .env
# Edit .env with your settings
```

### 2. Safety Practices
- **Dry Run First**: Always use `--dry-run` for testing
- **Testnet Testing**: Test all scripts on testnet first
- **Backup Configurations**: Keep backups of all configurations
- **Validation**: Validate all inputs before execution
- **Monitoring**: Monitor script execution and results

### 3. Error Handling
```javascript
// Implement comprehensive error handling
try {
  await riskyOperation();
} catch (error) {
  console.error('Operation failed:', error.message);
  
  // Log error details
  console.error('Error details:', {
    code: error.code,
    transaction: error.transaction,
    receipt: error.receipt
  });
  
  // Attempt recovery or cleanup
  await cleanupOperation();
}
```

### 4. Logging and Monitoring
```javascript
// Implement structured logging
const log = {
  info: (msg, data) => console.log(`ℹ️  ${msg}`, data || ''),
  success: (msg, data) => console.log(`✅ ${msg}`, data || ''),
  warning: (msg, data) => console.log(`⚠️  ${msg}`, data || ''),
  error: (msg, data) => console.log(`❌ ${msg}`, data || '')
};

// Use throughout scripts
log.info('Starting operation...');
log.success('Operation completed successfully!');
log.warning('Configuration issue detected');
log.error('Operation failed', error.message);
```

## 🔍 Troubleshooting Common Issues

### 1. Connection Issues
```bash
# Check network connectivity
node -e "console.log('Network:', process.env.BSC_MAINNET_RPC)"

# Verify contract address
node -e "
const { ethers } = require('hardhat');
ethers.getContractAt('EnhancedSylvanToken', process.env.CONTRACT_ADDRESS)
  .then(() => console.log('✅ Contract accessible'))
  .catch(err => console.log('❌ Contract error:', err.message))
"
```

### 2. Permission Issues
```bash
# Check signer permissions
node scripts/check-permissions.js

# Verify owner status
node -e "
const { ethers } = require('hardhat');
(async () => {
  const [signer] = await ethers.getSigners();
  const token = await ethers.getContractAt('EnhancedSylvanToken', process.env.CONTRACT_ADDRESS);
  const owner = await token.owner();
  console.log('Signer:', signer.address);
  console.log('Owner:', owner);
  console.log('Is Owner:', signer.address.toLowerCase() === owner.toLowerCase());
})()
"
```

### 3. Gas Issues
```bash
# Check gas price
node -e "
const { ethers } = require('hardhat');
ethers.provider.getGasPrice()
  .then(price => console.log('Gas Price:', ethers.formatUnits(price, 'gwei'), 'gwei'))
"

# Estimate gas for operation
node scripts/estimate-gas.js --operation addExemption --address 0x...
```

---

**Enhanced Management Scripts Guide Version**: 1.0.0  
**Last Updated**: November 2024  
**Compatible With**: EnhancedSylvanToken v1.0.0  
**Coverage**: Complete management script documentation with examples