# Lock Mechanism Guide

## 🔐 Overview

This comprehensive guide covers the advanced token locking and vesting system for EnhancedSylvanToken. The system provides sophisticated vesting schedules, proportional burning, and automated release mechanisms for different wallet types.

## 🏗️ Lock System Architecture

### Lock Types

#### 1. Admin Wallet Locks
```
Configuration:
├── Initial Release: 10% immediately available
├── Locked Amount: 90% under vesting
├── Release Schedule: 5% monthly for 18 months
├── Proportional Burn: 10% of each release
└── Cliff Period: None (immediate start)
```

#### 2. Locked Wallet Vesting
```
Configuration:
├── Initial Release: 0% (fully locked)
├── Locked Amount: 100% under vesting
├── Release Schedule: 3% monthly for 34 months
├── Proportional Burn: 10% of each release
└── Cliff Period: None (immediate start)
```

### Vesting Schedule Structure
```solidity
struct VestingSchedule {
    uint256 totalAmount;        // Total tokens allocated
    uint256 releasedAmount;     // Tokens already released
    uint256 burnedAmount;       // Tokens burned during releases
    uint256 startTime;          // Vesting start timestamp
    uint256 cliffDuration;      // Cliff period in seconds
    uint256 vestingDuration;    // Total vesting period in seconds
    uint256 releasePercentage;  // Monthly release percentage (basis points)
    uint256 burnPercentage;     // Burn percentage of releases (basis points)
    bool isAdmin;               // Admin wallet flag
}
```

## 🎯 Lock Configuration

### Environment Configuration (.env)
```bash
# Admin Wallet Lock Parameters
ADMIN_IMMEDIATE_RELEASE=1000  # 10% (in basis points)
ADMIN_LOCK_PERCENTAGE=9000    # 90% (in basis points)
ADMIN_MONTHLY_RELEASE=500     # 5% monthly (basis points)
ADMIN_VESTING_MONTHS=18       # 18 months total
ADMIN_CLIFF_DAYS=0            # No cliff period

# Locked Wallet Parameters
LOCKED_MONTHLY_RELEASE=300    # 3% monthly (basis points)
LOCKED_VESTING_MONTHS=34      # 34 months total
LOCKED_CLIFF_DAYS=0           # No cliff period

# Burn Configuration
PROPORTIONAL_BURN=1000        # 10% of releases (basis points)

# Wallet Addresses
ADMIN_MAD_WALLET=0xC4FB112cF0Ee27b33F112A9e3c20F8090a246902
ADMIN_LEB_WALLET=0xc19855A1477770c69412fD2165BdB0b33ec81D7e
ADMIN_CNK_WALLET=0x623b82aF610b92F8C36872045042e29F20076F8b
ADMIN_KDR_WALLET=0xd1cC4222B7b62Fb623884371337ae04CF44B93a7
LOCKED_WALLET=0xE56ab5861f2B1C8dC185ecF8881242256CdB4c17
```

### Lock Setup Configuration
```javascript
const lockConfiguration = {
  adminWallets: [
    {
      address: process.env.ADMIN_MAD_WALLET,
      totalAllocation: ethers.parseEther("10000000"), // 10M tokens
      immediateRelease: ethers.parseEther("1000000"),  // 1M tokens (10%)
      lockedAmount: ethers.parseEther("9000000"),      // 9M tokens (90%)
      monthlyRelease: 500, // 5% monthly (basis points)
      vestingMonths: 18,
      cliffDays: 0
    },
    // ... other admin wallets
  ],
  
  lockedWallet: {
    address: process.env.LOCKED_WALLET,
    totalAllocation: ethers.parseEther("300000000"), // 300M tokens
    lockedAmount: ethers.parseEther("300000000"),    // 100% locked
    monthlyRelease: 300, // 3% monthly (basis points)
    vestingMonths: 34,
    cliffDays: 0
  },
  
  burnConfiguration: {
    proportionalBurnRate: 1000, // 10% (basis points)
    burnWallet: "0x000000000000000000000000000000000000dEaD"
  }
};
```

## 🛠️ Management Tools

### 1. Lock Mechanism Setup
```bash
# Setup all lock mechanisms during deployment
npm run setup:locks

# Setup specific admin wallet locks
npm run setup:admin-locks -- --wallet 0xAddress

# Setup locked wallet vesting
npm run setup:locked-wallet

# Validate lock setup
npm run validate:locks
```

### 2. Lock Monitoring Script
```bash
# Monitor all lock mechanisms
npm run monitor:locks

# Check specific wallet lock status
npm run monitor:locks -- --wallet 0xAddress

# View releasable amounts
npm run locks:check-releasable

# Process pending releases
npm run locks:process-releases
```

### 3. Interactive Lock Manager
```bash
# Start interactive lock manager
node scripts/monitor-lock-mechanisms.js

# Available commands:
# - status: Show all lock statuses
# - release <address>: Process release for wallet
# - schedule <address>: Show release schedule
# - burns: Show burn statistics
# - exit: Exit manager
```

## 📊 Lock Schedules

### Admin Wallet Release Schedule
```javascript
// Example: Admin MAD Wallet (10M tokens)
const adminSchedule = {
  totalTokens: "10000000000000000000000000", // 10M tokens
  immediateRelease: "1000000000000000000000000", // 1M tokens (10%)
  lockedTokens: "9000000000000000000000000",    // 9M tokens (90%)
  
  monthlyReleases: [
    // Month 1-18: 500,000 tokens each (5% of original)
    { month: 1, release: "500000000000000000000000", burn: "50000000000000000000000" },
    { month: 2, release: "500000000000000000000000", burn: "50000000000000000000000" },
    // ... continues for 18 months
    { month: 18, release: "500000000000000000000000", burn: "50000000000000000000000" }
  ],
  
  totalReleased: "9000000000000000000000000",  // 9M tokens over 18 months
  totalBurned: "900000000000000000000000",    // 900K tokens (10% of releases)
  netReceived: "8100000000000000000000000"    // 8.1M tokens after burns
};
```

### Locked Wallet Release Schedule
```javascript
// Locked Wallet (300M tokens)
const lockedSchedule = {
  totalTokens: "300000000000000000000000000", // 300M tokens
  immediateRelease: "0",                      // 0 tokens (0%)
  lockedTokens: "300000000000000000000000000", // 300M tokens (100%)
  
  monthlyReleases: [
    // Month 1-34: 9M tokens each (3% of original)
    { month: 1, release: "9000000000000000000000000", burn: "900000000000000000000000" },
    { month: 2, release: "9000000000000000000000000", burn: "900000000000000000000000" },
    // ... continues for 34 months
    { month: 34, release: "6000000000000000000000000", burn: "600000000000000000000000" } // Final partial release
  ],
  
  totalReleased: "300000000000000000000000000", // 300M tokens over 34 months
  totalBurned: "30000000000000000000000000",   // 30M tokens (10% of releases)
  netReceived: "270000000000000000000000000"   // 270M tokens after burns
};
```

## 🔥 Proportional Burning System

### Burn Calculation Logic
```solidity
function calculateBurnAmount(uint256 releaseAmount) internal pure returns (uint256) {
    return (releaseAmount * PROPORTIONAL_BURN_RATE) / 10000; // 10% burn
}

function processRelease(address beneficiary, uint256 releaseAmount) internal {
    uint256 burnAmount = calculateBurnAmount(releaseAmount);
    uint256 netAmount = releaseAmount - burnAmount;
    
    // Burn tokens
    _transfer(address(this), BURN_WALLET, burnAmount);
    
    // Transfer net amount to beneficiary
    _transfer(address(this), beneficiary, netAmount);
    
    emit TokensReleased(beneficiary, netAmount, burnAmount);
    emit ProportionalBurn(burnAmount, totalBurned);
}
```

### Burn Statistics Tracking
```javascript
const burnStatistics = {
  totalBurned: "0",           // Total tokens burned from releases
  adminBurns: "0",            // Tokens burned from admin releases
  lockedBurns: "0",           // Tokens burned from locked releases
  burnRate: 1000,             // 10% burn rate (basis points)
  
  monthlyBurns: [
    { month: 1, amount: "0", source: "admin|locked" },
    // ... monthly burn tracking
  ],
  
  projectedBurns: {
    adminTotal: "3600000000000000000000000",  // 3.6M tokens (10% of 36M admin releases)
    lockedTotal: "30000000000000000000000000", // 30M tokens (10% of 300M locked releases)
    grandTotal: "33600000000000000000000000"   // 33.6M total projected burns
  }
};
```

## 🕐 Release Timing and Automation

### Release Timing Logic
```javascript
function calculateNextRelease(vestingSchedule) {
  const currentTime = Math.floor(Date.now() / 1000);
  const startTime = vestingSchedule.startTime;
  const monthlyInterval = 30 * 24 * 60 * 60; // 30 days in seconds
  
  const monthsElapsed = Math.floor((currentTime - startTime) / monthlyInterval);
  const nextReleaseTime = startTime + ((monthsElapsed + 1) * monthlyInterval);
  
  return {
    monthsElapsed,
    nextReleaseTime,
    timeUntilNextRelease: nextReleaseTime - currentTime,
    isReleaseReady: currentTime >= nextReleaseTime
  };
}
```

### Automated Release Processing
```bash
# Setup automated release processing (cron job)
# Run every day at 12:00 PM
0 12 * * * cd /path/to/project && npm run locks:process-releases

# Manual release processing
npm run locks:process-releases

# Check which releases are ready
npm run locks:check-ready-releases

# Process specific wallet release
npm run locks:release -- --wallet 0xAddress
```

## 📈 Analytics and Monitoring

### 1. Lock Status Dashboard
```javascript
const lockDashboard = {
  adminWallets: {
    totalLocked: "36000000000000000000000000",    // 36M tokens across all admin wallets
    totalReleased: "0",                           // Released so far
    totalBurned: "0",                             // Burned so far
    nextReleaseDate: "2024-12-01",                // Next scheduled release
    monthlyReleaseAmount: "2000000000000000000000000" // 2M tokens monthly (all admin wallets)
  },
  
  lockedWallet: {
    totalLocked: "300000000000000000000000000",   // 300M tokens
    totalReleased: "0",                           // Released so far
    totalBurned: "0",                             // Burned so far
    nextReleaseDate: "2024-12-01",                // Next scheduled release
    monthlyReleaseAmount: "9000000000000000000000000" // 9M tokens monthly
  },
  
  systemTotals: {
    totalLocked: "336000000000000000000000000",   // 336M total locked
    projectedBurns: "33600000000000000000000000", // 33.6M projected burns
    netReleases: "302400000000000000000000000"    // 302.4M net after burns
  }
};
```

### 2. Release History Tracking
```javascript
const releaseHistory = {
  releases: [
    {
      date: "2024-12-01",
      wallet: "0xC4FB112cF0Ee27b33F112A9e3c20F8090a246902",
      type: "admin",
      grossAmount: "500000000000000000000000",  // 500K tokens
      burnAmount: "50000000000000000000000",    // 50K burned
      netAmount: "450000000000000000000000",    // 450K net
      transactionHash: "0x..."
    }
    // ... more release records
  ],
  
  statistics: {
    totalReleases: 0,
    totalGrossReleased: "0",
    totalBurned: "0",
    totalNetReleased: "0",
    averageReleaseAmount: "0"
  }
};
```

### 3. Monitoring Alerts
```javascript
// Setup monitoring alerts
const monitoringConfig = {
  alerts: {
    releaseReady: true,        // Alert when releases are ready
    burnThreshold: "1000000000000000000000000", // Alert when burns exceed 1M tokens
    scheduleDeviation: true,   // Alert if releases deviate from schedule
    lowBalance: true           // Alert if contract balance is low
  },
  
  notifications: {
    email: "admin@sylvantoken.com",
    webhook: "https://api.sylvantoken.com/webhooks/locks",
    discord: "https://discord.com/api/webhooks/..."
  }
};
```

## 🧪 Testing Lock Mechanisms

### 1. Lock Testing Suite
```bash
# Run complete lock mechanism tests
npm run test:locks

# Test admin wallet locks
npm run test:locks -- --type admin

# Test locked wallet vesting
npm run test:locks -- --type locked

# Test burn calculations
npm run test:burns

# Test release timing
npm run test:release-timing
```

### 2. Manual Testing Scenarios
```javascript
// Test scenarios for lock mechanisms
const testScenarios = [
  {
    name: "Admin Immediate Release",
    description: "Test 10% immediate release for admin wallets",
    expectedResult: "1M tokens immediately available"
  },
  {
    name: "Monthly Release Calculation",
    description: "Test monthly release amount calculation",
    expectedResult: "Correct percentage of original allocation"
  },
  {
    name: "Proportional Burn",
    description: "Test 10% burn on each release",
    expectedResult: "10% burned, 90% to beneficiary"
  },
  {
    name: "Vesting Schedule Completion",
    description: "Test complete vesting schedule",
    expectedResult: "All tokens released over specified period"
  }
];
```

## 🚨 Troubleshooting

### Common Issues

#### 1. Release Not Processing
```bash
# Check if release is ready
npm run locks:check-ready -- --wallet 0xAddress

# Verify contract balance
npm run locks:check-balance

# Manual release trigger
npm run locks:release -- --wallet 0xAddress --force
```

#### 2. Incorrect Burn Calculations
```bash
# Verify burn rate configuration
npm run validate:burn-rates

# Test burn calculation
npm run test:burn-calculation -- --amount 1000000

# Check burn wallet balance
npm run monitor:burn-wallet
```

#### 3. Schedule Timing Issues
```bash
# Check system time synchronization
npm run check:system-time

# Verify release schedule
npm run locks:schedule -- --wallet 0xAddress

# Recalculate release timing
npm run locks:recalculate-schedule -- --wallet 0xAddress
```

## 📋 Best Practices

### 1. Lock Management
- **Regular Monitoring**: Check lock status daily
- **Automated Processing**: Setup automated release processing
- **Backup Procedures**: Maintain backup of lock configurations
- **Testing**: Test lock mechanisms regularly in testnet
- **Documentation**: Document all lock parameter changes

### 2. Security Considerations
- **Access Control**: Restrict lock management to authorized accounts
- **Validation**: Validate all lock parameters before setup
- **Monitoring**: Monitor for unauthorized lock modifications
- **Emergency Procedures**: Prepare emergency lock procedures
- **Audit Trail**: Maintain complete audit trail of lock operations

### 3. Operational Guidelines
- **Communication**: Notify stakeholders of release schedules
- **Transparency**: Provide public access to lock information
- **Analytics**: Track lock performance and statistics
- **Optimization**: Optimize gas costs for release operations
- **Compliance**: Ensure compliance with tokenomics requirements

## 📊 Lock Mechanism Summary

### Total Lock Overview
```
Total Locked Tokens: 336,000,000 SYL
├── Admin Wallets: 36,000,000 SYL (4 wallets × 9M each)
└── Locked Wallet: 300,000,000 SYL

Release Schedule:
├── Admin: 5% monthly × 18 months = 90% released
└── Locked: 3% monthly × 34 months = 102% released (with partial final)

Burn Impact:
├── Total Projected Burns: 33,600,000 SYL (10% of all releases)
├── Admin Burns: 3,600,000 SYL
└── Locked Burns: 30,000,000 SYL

Net Token Distribution:
├── Total Net Released: 302,400,000 SYL (after burns)
├── Admin Net: 32,400,000 SYL
└── Locked Net: 270,000,000 SYL
```

---

**Lock Mechanism Guide Version**: 1.0.0  
**Last Updated**: November 2024  
**Compatible With**: EnhancedSylvanToken v1.0.0  
**Features**: Advanced Vesting, Proportional Burning, Automated Releases