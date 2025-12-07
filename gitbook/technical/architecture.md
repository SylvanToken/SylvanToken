---
description: Deep dive into Sylvan Token's smart contract architecture.
---

# 🏗️ Architecture

## 📐 Design Philosophy

Sylvan Token's architecture follows these core principles:

1. **Modularity** - Separate concerns into distinct libraries
2. **Security** - Multiple layers of protection
3. **Efficiency** - Gas-optimized operations
4. **Transparency** - Comprehensive event logging

---

## 🏛️ Contract Hierarchy

```
SylvanToken (Main Contract)
│
├── Inheritance
│   ├── ERC20 (OpenZeppelin)
│   ├── Ownable (OpenZeppelin)
│   ├── ReentrancyGuard (OpenZeppelin)
│   └── Custom Interfaces
│       ├── IEnhancedFeeManager
│       ├── IVestingManager
│       └── IAdminWalletHandler
│
└── Libraries (Linked)
    ├── AccessControl
    ├── InputValidator
    ├── TaxManager
    └── WalletManager
```

---

## 📚 Core Libraries

### 1. AccessControl.sol

**Purpose:** Manages access permissions and owner operations

| Function | Description |
|----------|-------------|
| `onlyOwner` modifier | Restricts to contract owner |
| `checkCooldown` | Enforces time between operations |
| `validateTransfer` | Ownership transfer validation |

---

### 2. InputValidator.sol

**Purpose:** Validates all user inputs before processing

| Function | Description |
|----------|-------------|
| `requireNonZeroAddress` | Rejects zero addresses |
| `requirePositiveAmount` | Validates positive numbers |
| `requireValidArray` | Checks array bounds |
| `requireValidBasisPoints` | Validates percentages |

---

### 3. TaxManager.sol

**Purpose:** Handles fee calculations and distributions

| Function | Description |
|----------|-------------|
| `calculateFee` | Computes transaction fee |
| `distributeFee` | Splits fee to destinations |
| `checkExemption` | Determines fee exemption |
| `trackStatistics` | Updates fee metrics |

---

### 4. WalletManager.sol

**Purpose:** Manages system wallet configurations

| Function | Description |
|----------|-------------|
| `updateWallet` | Changes wallet address |
| `validateWallet` | Checks wallet validity |
| `getWalletInfo` | Retrieves wallet data |

---

## 🔄 Transaction Flow

```
User Initiates Transfer
         │
         ▼
    ┌─────────────────┐
    │ Input Validation │
    └─────────────────┘
         │
         ▼
    ┌─────────────────┐
    │ Check Exemptions │
    └─────────────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
Exempt    Not Exempt
    │         │
    │    ┌────┴────┐
    │    │         │
    │    ▼         │
    │  Calculate   │
    │    Fee       │
    │    │         │
    │    ▼         │
    │  Distribute  │
    │  ├─ 50% Ops  │
    │  ├─ 25% NGO  │
    │  └─ 25% Burn │
    │         │
    └────┬────┘
         │
         ▼
    ┌─────────────────┐
    │ Execute Transfer │
    └─────────────────┘
         │
         ▼
    ┌─────────────────┐
    │ Emit Events     │
    └─────────────────┘
```

---

## 💾 State Management

### Key Storage Variables

| Variable | Type | Purpose |
|----------|------|---------|
| `_balances` | mapping | Token balances |
| `_allowances` | mapping | Spending approvals |
| `_feeExempt` | mapping | Fee exemption status |
| `_vestingSchedules` | mapping | Vesting data |
| `_systemWallets` | struct | Wallet addresses |

---

## 📡 Events

All significant actions emit events for transparency:

```solidity
event Transfer(address indexed from, address indexed to, uint256 value);
event FeeCollected(address indexed from, uint256 fee, uint256 timestamp);
event DonationSent(address indexed ngo, uint256 amount);
event TokensBurned(uint256 amount);
event VestingClaimed(address indexed wallet, uint256 amount);
event WalletUpdated(string walletType, address newAddress);
```

---

## ⚡ Gas Optimization

### Deployment Costs

| Component | Gas Cost | USD @ 5 Gwei |
|-----------|----------|--------------|
| Libraries | ~1.2M gas | ~$3 |
| Main Contract | ~4.4M gas | ~$14 |
| **Total** | ~5.6M gas | ~$17 |

### Transaction Costs

| Operation | Gas Cost | USD @ 5 Gwei |
|-----------|----------|--------------|
| Standard Transfer | ~50K gas | ~$0.15 |
| Transfer with Fee | ~100K gas | ~$0.30 |
| Vesting Claim | ~150K gas | ~$0.45 |
| Batch Operation | ~200K gas | ~$0.60 |

---

## 🔐 Upgrade Pattern

Sylvan Token uses a proxy pattern for potential upgrades:

```
User → Proxy Contract → Implementation Contract
              │
              └── Storage (Persistent)
```

{% hint style="warning" %}
**Note:** Upgrades are protected by timelock and require community notification.
{% endhint %}
