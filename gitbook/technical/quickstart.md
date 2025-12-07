---
description: Get started with Sylvan Token development in minutes.
---

# 🚀 Quick Start

## 📋 Prerequisites

Before you begin, ensure you have:

- **Node.js** v16 or higher
- **npm** or **yarn** package manager
- **MetaMask** or compatible Web3 wallet
- **Git** for version control

---

## ⚡ Installation

### 1. Clone the Repository

```bash
git clone https://github.com/SylvanToken/sylvan-token.git
cd sylvan-token
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment

```bash
# Copy the example environment file
cp .env.example .env

# Edit .env with your configuration
# Required: PRIVATE_KEY, BSC_RPC_URL
```

---

## 🔧 Basic Commands

### Compile Contracts

```bash
npx hardhat compile
```

### Run Tests

```bash
# Run all tests
npm test

# Run with coverage
npm run coverage

# Run specific test file
npx hardhat test test/enhanced-fee-system.test.js

# Run security tests
npm run test:security
```

### Deploy to Testnet

```bash
npx hardhat run scripts/deployment/deploy-local.js --network bscTestnet
```

### Deploy to Mainnet

```bash
npx hardhat run scripts/deployment/deploy-mainnet.js --network bscMainnet
```

---

## 🔐 Deployer & Owner Separation

For enhanced security, separate the deployer (pays gas) from the owner (admin control):

### Setup

```bash
# Set environment variables
export DEPLOYER_ADDRESS=0x...  # Standard wallet
export OWNER_ADDRESS=0x...     # Hardware wallet or multisig
```

### Deploy with Ownership Transfer

```bash
npx hardhat run scripts/deployment/deploy-with-ownership-transfer.js --network bscMainnet
```

### Verify Ownership

```bash
npx hardhat run scripts/utils/verify-ownership.js --network bscMainnet
```

{% hint style="info" %}
**Best Practice:** Use a hardware wallet or multisig for the owner address.
{% endhint %}

---

## 📁 Project Structure

```
sylvan-token/
├── contracts/              # Smart contracts
│   ├── SylvanToken.sol    # Main token
│   ├── interfaces/        # Contract interfaces
│   └── libraries/         # Modular libraries
├── scripts/               # Deployment scripts
│   ├── deployment/        # Deploy scripts
│   └── utils/             # Utility scripts
├── test/                  # Test files
├── docs/                  # Documentation
├── .env.example           # Environment template
├── hardhat.config.js      # Hardhat config
└── package.json           # Dependencies
```

---

## 🧪 Testing

### Run Full Test Suite

```bash
npm test
```

**Expected Output:**
```
  SylvanToken
    ✓ should have correct name and symbol
    ✓ should have correct total supply
    ✓ should apply 1% fee on transfers
    ...

  323 passing (45s)
```

### Run Coverage Report

```bash
npm run coverage
```

**Expected Coverage:** 95%+

---

## 🌐 Network Configuration

### BSC Testnet

| Parameter | Value |
|-----------|-------|
| Chain ID | 97 |
| RPC URL | https://data-seed-prebsc-1-s1.binance.org:8545 |
| Explorer | https://testnet.bscscan.com |

### BSC Mainnet

| Parameter | Value |
|-----------|-------|
| Chain ID | 56 |
| RPC URL | https://bsc-dataseed.binance.org |
| Explorer | https://bscscan.com |

---

## 🔗 Useful Links

| Resource | Link |
|----------|------|
| **GitHub** | [github.com/SylvanToken](https://github.com/SylvanToken) |
| **Documentation** | [docs.sylvantoken.org](https://docs.sylvantoken.org) |
| **BSCScan** | [Contract](https://bscscan.com/address/0x50FfD5b14a1b4CDb2EA29fC61bdf5EB698f72e85) |
| **Discord** | Coming Soon |

---

## ❓ Troubleshooting

<details>
<summary><strong>Compilation fails with version error</strong></summary>

Ensure you have the correct Solidity version:
```bash
npx hardhat clean
npx hardhat compile
```
</details>

<details>
<summary><strong>Tests timeout</strong></summary>

Increase timeout in hardhat.config.js:
```javascript
mocha: {
  timeout: 120000
}
```
</details>

<details>
<summary><strong>Deployment fails with gas error</strong></summary>

Increase gas limit and ensure sufficient BNB in deployer wallet.
</details>

---

## 📞 Support

Need help? Reach out through:

- 📧 **Email:** dev@sylvantoken.org
- 💬 **Telegram:** [t.me/sylvantoken](https://t.me/sylvantoken)
- 🐦 **Twitter:** [@SylvanToken](https://x.com/SylvanToken)
