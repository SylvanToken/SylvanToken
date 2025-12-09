# 📊 Monitoring System Setup Guide

**Version 2.0 | December 2025**

---

## 📋 Overview

This guide covers monitoring setup for Sylvan Token operations, including on-chain monitoring, alerts, and analytics.

---

## 🔍 What to Monitor

### Contract Activity

| Metric | Description | Priority |
|--------|-------------|----------|
| Transfers | All token transfers | High |
| Fee Collection | Fee distribution events | High |
| Vesting Releases | Token releases from vesting | High |
| Ownership Changes | Owner transfer events | Critical |
| Exemption Changes | Fee exemption updates | Medium |

### Wallet Balances

| Wallet | Purpose | Alert Threshold |
|--------|---------|-----------------|
| Fee Wallet | Operations funds | < 100K SYL |
| Donation Wallet | NGO donations | > 1M SYL (time to donate) |
| Burn Address | Burned tokens | Track total |
| Safe Wallet | Governance | Any change |

### Vesting Status

| Wallet | Monitor |
|--------|---------|
| Locked Reserve | Monthly release eligibility |
| Admin Wallets | Monthly release eligibility |
| Founder Wallet | Monthly release eligibility |

---

## 🛠️ Monitoring Tools

### 1. BSCScan

**Free Features:**
- Transaction history
- Token transfers
- Event logs
- Contract verification

**Setup:**
1. Go to https://bscscan.com
2. Search for contract address
3. Bookmark the page
4. Use "Watch List" feature

### 2. BSCScan Alerts

**Email Notifications:**
1. Create BSCScan account
2. Go to "Watch List"
3. Add contract address
4. Configure alert types:
   - Incoming transactions
   - Outgoing transactions
   - Token transfers

### 3. Safe App Dashboard

**Built-in Monitoring:**
- Wallet balances
- Vesting status
- Transaction history
- Pending approvals

### 4. Custom Scripts

**Balance Monitoring Script:**
```javascript
const { ethers } = require("ethers");

const provider = new ethers.providers.JsonRpcProvider("https://bsc-dataseed.binance.org");
const contractAddress = "0xc66404C3fa3E01378027b4A4411812D3a8D458F5";
const abi = ["function balanceOf(address) view returns (uint256)"];
const contract = new ethers.Contract(contractAddress, abi, provider);

async function checkBalances() {
    const wallets = {
        "Fee Wallet": "0x46a4AF3bdAD67d3855Af42Ba0BBe9248b54F7915",
        "Donation Wallet": "0xa697645Fdfa5d9399eD18A6575256F81343D4e17",
        "Locked Reserve": "0x687A2c7E494c3818c20AD2856d453514970d6aac"
    };
    
    for (const [name, address] of Object.entries(wallets)) {
        const balance = await contract.balanceOf(address);
        console.log(`${name}: ${ethers.utils.formatEther(balance)} SYL`);
    }
}

checkBalances();
```

---

## 📡 Event Monitoring

### Key Events to Track

```solidity
// Fee Events
event FeeCollected(address indexed from, uint256 feeAmount, uint256 toFeeWallet, uint256 toDonation, uint256 burned);

// Vesting Events
event TokensReleased(address indexed beneficiary, uint256 releasedAmount, uint256 burnedAmount);
event InitialReleaseProcessed(address indexed admin, uint256 amount);

// Admin Events
event WalletExempted(address indexed wallet, bool status);
event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
```

### Event Listener Script

```javascript
const { ethers } = require("ethers");

const provider = new ethers.providers.WebSocketProvider("wss://bsc-ws-node.nariox.org");
const contractAddress = "0xc66404C3fa3E01378027b4A4411812D3a8D458F5";
const abi = [
    "event Transfer(address indexed from, address indexed to, uint256 value)",
    "event TokensReleased(address indexed beneficiary, uint256 releasedAmount, uint256 burnedAmount)",
    "event OwnershipTransferred(address indexed previousOwner, address indexed newOwner)"
];

const contract = new ethers.Contract(contractAddress, abi, provider);

// Listen for transfers
contract.on("Transfer", (from, to, value) => {
    console.log(`Transfer: ${from} -> ${to}: ${ethers.utils.formatEther(value)} SYL`);
});

// Listen for vesting releases
contract.on("TokensReleased", (beneficiary, released, burned) => {
    console.log(`Vesting Release: ${beneficiary}`);
    console.log(`  Released: ${ethers.utils.formatEther(released)} SYL`);
    console.log(`  Burned: ${ethers.utils.formatEther(burned)} SYL`);
});

// Listen for ownership changes
contract.on("OwnershipTransferred", (prev, next) => {
    console.log(`⚠️ OWNERSHIP CHANGED: ${prev} -> ${next}`);
});

console.log("Listening for events...");
```

---

## 🔔 Alert Configuration

### Critical Alerts (Immediate)

| Event | Action |
|-------|--------|
| Ownership Transfer | SMS + Email + Telegram |
| Large Transfer (>1M SYL) | Email + Telegram |
| Safe Transaction Proposed | Telegram |

### High Priority Alerts (Within 1 hour)

| Event | Action |
|-------|--------|
| Vesting Release | Email |
| Fee Exemption Change | Email |
| Unusual Activity | Email |

### Regular Monitoring (Daily)

| Metric | Report |
|--------|--------|
| Daily Volume | Dashboard |
| Fee Collection | Dashboard |
| Holder Count | Dashboard |

---

## 📊 Analytics Dashboard

### Recommended Metrics

1. **Token Metrics**
   - Total Supply
   - Circulating Supply
   - Burned Amount
   - Holder Count

2. **Fee Metrics**
   - Total Fees Collected
   - Fees to Operations
   - Fees to Donations
   - Fees Burned

3. **Vesting Metrics**
   - Total Released
   - Total Burned (Vesting)
   - Next Release Date
   - Remaining Locked

4. **Trading Metrics**
   - Daily Volume
   - Price (if listed)
   - Liquidity

---

## 🔧 Setup Checklist

### Basic Monitoring
- [ ] BSCScan bookmark
- [ ] BSCScan watch list
- [ ] Email alerts configured
- [ ] Safe App access

### Advanced Monitoring
- [ ] Event listener script
- [ ] Balance monitoring script
- [ ] Telegram bot alerts
- [ ] Custom dashboard

### Documentation
- [ ] Alert contacts documented
- [ ] Escalation procedures
- [ ] Response playbooks

---

## 📞 Alert Contacts

| Priority | Contact Method |
|----------|----------------|
| Critical | Phone + SMS |
| High | Telegram + Email |
| Medium | Email |
| Low | Dashboard only |

---

## 🔗 Related Documentation

- [Emergency Procedures](./EMERGENCY_PROCEDURES_GUIDE.md)
- [Multi-Sig Guide](./MULTISIG_WALLET_SETUP_GUIDE.md)
- [API Reference](./API_REFERENCE.md)

---

<div align="center">

**Sylvan Token Monitoring Guide**

Last Updated: December 2025

</div>
