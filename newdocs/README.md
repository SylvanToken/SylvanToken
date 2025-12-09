<div align="center">

<img src="assets/images/sylvan-token-logo.png" alt="Sylvan Token Logo" width="200"/>

# 🌳 Sylvan Token (SYL)

![Sylvan Token Badge](https://img.shields.io/badge/Sylvan-Token-green?style=for-the-badge&logo=ethereum)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![Solidity](https://img.shields.io/badge/Solidity-0.8.24-blue?style=for-the-badge&logo=solidity)](https://soliditylang.org/)
[![BSC](https://img.shields.io/badge/BSC-Mainnet-yellow?style=for-the-badge&logo=binance)](https://www.bnbchain.org/)

**Empowering Environmental Change Through Blockchain Technology**

[Website](https://www.sylvantoken.org/) • [Twitter](https://x.com/SylvanToken) • [Telegram](https://t.me/sylvantoken) • [GitHub](https://github.com/SylvanToken) • [Whitepaper](./WHITEPAPER.md)

</div>

---

## 🌍 About Sylvan Token

Sylvan Token (SYL) is a revolutionary BEP-20 token on Binance Smart Chain designed to support environmental organizations and ecological initiatives worldwide. Through an innovative fee distribution mechanism, every transaction contributes to environmental conservation.

### 🎯 Mission

To create a sustainable financial ecosystem that directly funds environmental protection, reforestation projects, and ecological research through transparent blockchain technology.

### ✨ Key Features

- 🌱 **Environmental Impact**: 25% of transaction fees directly support environmental NGOs
- 🔥 **Deflationary Mechanism**: 25% of fees burned + 10% of vested releases
- 💼 **Operational Sustainability**: 50% of fees fund project operations
- 🔒 **Advanced Vesting**: Time-locked releases with proportional burning
- 🛡️ **Fully Decentralized**: No pause mechanism - transfers can never be halted
- 🔐 **Multi-Sig Governance**: Safe Wallet (2/3 threshold) for secure operations
- 🌐 **Transparent**: All transactions publicly verifiable on-chain

---

## 📊 Token Economics

### Token Details

| Parameter | Value |
|-----------|-------|
| **Token Name** | Sylvan Token |
| **Symbol** | SYL |
| **Network** | Binance Smart Chain (BEP-20) |
| **Total Supply** | 1,000,000,000 SYL |
| **Decimals** | 18 |
| **Contract Address** | `0xc66404C3fa3E01378027b4A4411812D3a8D458F5` |
| **Contract Owner** | `0xC5CcDC8F01739CeD02B30b5aD10DD5Fb201436bB` (Safe Wallet) |
| **Governance** | Multi-Sig 2/3 Threshold |
| **BSCScan** | [View Contract](https://bscscan.com/address/0xc66404C3fa3E01378027b4A4411812D3a8D458F5) |
| **Safe Wallet** | [Manage Contract](https://app.safe.global/home?safe=bnb:0xC5CcDC8F01739CeD02B30b5aD10DD5Fb201436bB) |

### Distribution

```
📊 Total Supply: 1,000,000,000 SYL

├─ 50% (500M) - Sylvan Token Wallet (Operations & Liquidity)
├─ 30% (300M) - Locked Reserve (34-month vesting)
├─ 16% (160M) - Founder Wallet
└─ 4% (40M) - Admin Wallets (4 × 10M each)
```

### Transaction Fee Structure

**Universal 1% Transaction Fee**

```
💰 1% Transaction Fee Distribution:

├─ 50% → Fee Wallet (Operations)
├─ 25% → Donation Wallet (Environmental NGOs)
└─ 25% → Burn Address (Deflationary)
```

---

## 🔒 Vesting Schedules

### Locked Reserve (300M SYL)
| Parameter | Value |
|-----------|-------|
| Lock | 100% |
| Duration | 34 months |
| Monthly Release | 3% (9M SYL) |
| Burn on Release | 10% (900K/month) |
| To Beneficiary | 90% (8.1M/month) |

### Admin Wallets (10M SYL each × 4)
| Parameter | Value |
|-----------|-------|
| Initial Release | 10% (1M SYL) |
| Locked | 90% (9M SYL) |
| Duration | 20 months |
| Monthly Release | 4.5% (450K SYL) |
| Burn on Release | 10% (45K/month) |

### Founder Wallet (160M SYL)
| Parameter | Value |
|-----------|-------|
| Initial Release | 20% (32M SYL) |
| Locked | 80% (128M SYL) |
| Duration | 16 months |
| Monthly Release | 5% (8M SYL) |

---

## 🔐 Security & Governance

### Security Features
- ❌ **No Pause Mechanism**: Fully decentralized - transfers can NEVER be halted
- ✅ **Reentrancy Protection**: All state-changing functions protected
- ✅ **Input Validation**: Comprehensive parameter checking
- ✅ **Owner-Only Access**: Critical functions restricted

### Multi-Signature Governance (Safe Wallet)
| Parameter | Value |
|-----------|-------|
| Safe Address | `0xC5CcDC8F01739CeD02B30b5aD10DD5Fb201436bB` |
| Threshold | 2 of 3 (67%) |
| Signer 1 | Deployer Wallet |
| Signer 2 | Owner Wallet |
| Signer 3 | Admin BRK |

---

## 🚀 Quick Start

### Prerequisites
- Node.js v16+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/SylvanToken/SylvanToken.git
cd SylvanToken

# Install dependencies
npm install

# Compile contracts
npx hardhat compile

# Run tests
npx hardhat test
```

### Deployment

```bash
# Deploy to BSC Testnet
npm run deploy:testnet

# Deploy to BSC Mainnet
npm run deploy:mainnet

# Verify on BSCScan
npm run verify:mainnet
```

---

## 🏗️ Architecture

### Smart Contract Structure

```
contracts/
├── SylvanToken.sol              # Main token contract
├── interfaces/
│   ├── IEnhancedFeeManager.sol
│   ├── IVestingManager.sol
│   └── IAdminWalletHandler.sol
└── libraries/
    ├── AccessControl.sol
    ├── InputValidator.sol
    ├── TaxManager.sol
    ├── WalletManager.sol
    └── EmergencyManager.sol
```

---

## 📱 Safe App

Custom Safe App for vesting management and token operations:

**Features:**
- 📊 Dashboard with wallet balances
- 🔓 Vesting release management
- 🚀 Batch airdrop transfers
- 📅 Vesting schedule tracking
- 💰 Fee exemption management

**Repository**: [github.com/SylvanToken/SafeWallet](https://github.com/SylvanToken/SafeWallet)

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [Whitepaper](./WHITEPAPER.md) | Complete project documentation |
| [Roadmap](./ROADMAP.md) | Development timeline |
| [Security](./SECURITY.md) | Security practices |
| [API Reference](./docs/API_REFERENCE.md) | Contract interfaces |
| [Vesting Guide](./docs/VESTING_LOCK_GUIDE.md) | Vesting system details |

---

## 🔗 Links

- 🌐 **Website**: [sylvantoken.org](https://www.sylvantoken.org/)
- 🐦 **Twitter**: [@SylvanToken](https://x.com/SylvanToken)
- 💬 **Telegram**: [t.me/sylvantoken](https://t.me/sylvantoken)
- 💻 **GitHub**: [github.com/SylvanToken](https://github.com/SylvanToken)

---

## ⚖️ License

MIT License - see [LICENSE](./LICENSE)

---

## ⚠️ Disclaimer

Cryptocurrency investments carry risk. Only invest what you can afford to lose. This is not financial advice.

---

<div align="center">

**Made with 💚 for the Planet**

*Every transaction plants a seed for a greener future*

</div>
