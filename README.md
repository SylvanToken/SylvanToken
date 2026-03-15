<div align="center">

<img src="assets/images/sylvan-token-logo.png" alt="Sylvan Token Logo" width="200"/>

# 🌳 Sylvan Token (SYL)

[![Sylvan Token Badge](https://img.shields.io/badge/Sylvan-Token-green?style=for-the-badge&logo=ethereum)](https://www.sylvantoken.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![Solidity](https://img.shields.io/badge/Solidity-0.8.24-blue?style=for-the-badge&logo=solidity)](https://soliditylang.org/)
[![BSC](https://img.shields.io/badge/BSC-Mainnet-yellow?style=for-the-badge&logo=binance)](https://www.bnbchain.org/)

**Empowering Environmental Change Through Blockchain Technology**

[Website](https://www.sylvantoken.org/) • [Twitter](https://x.com/SylvanToken) • [Telegram](https://t.me/sylvantoken) • [GitHub](https://github.com/SylvanToken) • [Whitepaper](./WHITEPAPER.md)

</div>

---

## 🌍 About Sylvan Token

Sylvan Token (SYL) is a revolutionary BEP-20 token on Binance Smart Chain designed to support environmental organizations and ecological initiatives worldwide. Through an innovative fee distribution mechanism, every transaction contributes to environmental conservation, making each trade an act of environmental stewardship.

### 🎯 Mission

To create a sustainable financial ecosystem that directly funds environmental protection, reforestation projects, and ecological research through transparent blockchain technology.

### ✨ Key Features

- 🌱 **Environmental Impact**: 25% of transaction fees directly support environmental NGOs
- 🔥 **Deflationary Mechanism**: 25% of fees are burned, creating scarcity
- 💼 **Operational Sustainability**: 50% of fees fund project operations and development
- 🔒 **Advanced Vesting**: Secure token distribution with time-locked releases
- 🛡️ **Security First**: 95%+ test coverage with comprehensive security audits
- 🌐 **Transparent**: All transactions and donations publicly verifiable on-chain

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
| **BSCScan** | [View Contract](https://bscscan.com/address/0xc66404C3fa3E01378027b4A4411812D3a8D458F5) |
| **Token Tracker** | [View Token](https://bscscan.com/token/0xc66404C3fa3E01378027b4A4411812D3a8D458F5) |

### 🚀 Mainnet Deployment

**Status:** ✅ Live on BSC Mainnet  
**Deployed:** November 10, 2025-  
**Chain ID:** 56

**Quick Links:**
- 📝 [Contract on BSCScan](https://bscscan.com/address/0xc66404C3fa3E01378027b4A4411812D3a8D458F5)
- 👥 [Holder List](https://bscscan.com/token/0x50FfD5b14a1b4CDb2EA29fC61bdf5EB698f72e85#balances)
- 🔄 [Buy on PancakeSwap](https://pancakeswap.finance/swap?outputCurrency=0xc66404C3fa3E01378027b4A4411812D3a8D458F5)
- 📊 [Deployment Report](./MAINNET_DEPLOYMENT_SUCCESS.md)
| **Testnet Contract** | [0xc4dBA24a5D8F9f23cd989E5af5231952fD64CE70](https://testnet.bscscan.com/address/0xc4dBA24a5D8F9f23cd989E5af5231952fD64CE70) |

### Distribution

```
📊 Total Supply: 1,000,000,000 SYL

├─ 50% (500M) - PinkSale Presale & Liquidity
│  ├─ Presale Allocation
│  ├─ Liquidity Pool (90% locked for 2 years on PinkSale)
│  └─ Unsold tokens automatically burned immediately
├─ 30% (300M) - Locked Reserve (34-month vesting)
├─ 16% (160M) - Founder & Team
├─ 4% (40M) - Advisors & Partners (20-month vesting)
└─ Airdrop - Community Distribution (Post-Mainnet)
```

### Launch Sequence

**Phase 1: Mainnet Deployment** (September 2025)
- Smart contract deployment on BSC
- Contract verification on BSCScan
- Initial configuration

**Phase 2: Community Airdrop**
- Airdrop to early supporters and community members
- Snapshot-based distribution
- Anti-bot measures implemented

**Phase 3: PinkSale Presale**
- Public presale on PinkSale platform
- Fair launch mechanism
- **Unsold tokens automatically burned immediately**
- **90% of liquidity locked for 2 years on PinkSale**
- **Burn transaction published within 1 hour**
- 10% for initial market making

**Phase 4: Trading Launch**
- PancakeSwap listing
- Trading enabled
- Fee system activated

### Transaction Fee Structure

**Universal 1% Transaction Fee**

Every transaction (buy/sell/transfer) incurs a 1% fee distributed as follows:

```
💰 1% Transaction Fee Distribution:

├─ 50% → Operations Wallet (Development & Marketing)
├─ 25% → Environmental NGOs (Direct Donations)
└─ 25% → Burn Address (Deflationary Mechanism)
```

**Example Transaction:**
- Transfer: 10,000 SYL
- Fee: 100 SYL (1%)
- Recipient receives: 9,900 SYL
- Distribution:
  - 50 SYL → Operations
  - 25 SYL → Environmental NGOs
  - 25 SYL → Burned (permanently removed)

---

## 🚀 Quick Start

### Prerequisites

- Node.js v16+ 
- npm or yarn
- MetaMask or compatible Web3 wallet

### Installation

```bash
# Clone the repository
git clone https://github.com/SylvanToken/sylvan-token.git
cd sylvan-token

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your configuration

# Compile contracts
npx hardhat compile

# Run tests
npx hardhat test

# Deploy to testnet
npx hardhat run scripts/deployment/deploy-local.js --network bscTestnet
```

### Testing

```bash
# Run all tests
npm test

# Run with coverage
npm run coverage

# Run specific test suite
npx hardhat test test/enhanced-fee-system.test.js

# Run security tests
npm run test:security
```

---

## 🏗️ Architecture

### Smart Contract Structure

```
contracts/
├── SylvanToken.sol              # Main token contract
├── interfaces/                   # Contract interfaces
│   ├── IEnhancedFeeManager.sol
│   ├── IVestingManager.sol
│   └── IAdminWalletHandler.sol
└── libraries/                    # Modular libraries
    ├── AccessControl.sol         # Access management
    ├── InputValidator.sol        # Input validation
    ├── TaxManager.sol           # Fee calculations
    └── WalletManager.sol        # Wallet operations
```

### Key Components

#### 1. **Fee Management System**
- Universal 1% fee on all transactions
- Automatic distribution to three destinations
- Exemption system for specific wallets
- Real-time fee tracking and analytics

#### 2. **Vesting Mechanism**
- **Admin Wallets**: 10% immediate + 90% vested over 20 months
- **Locked Reserve**: 100% vested over 34 months with 3% monthly release
- **Proportional Burning**: 10% of each vested release is burned
- Cliff periods and time-locked releases

#### 3. **Security Features**
- ReentrancyGuard on all state-changing functions
- Ownable access control with transfer mechanisms
- Comprehensive input validation
- Emergency pause functionality
- Multi-layer security architecture

---

## 🔒 Security

### Audit Status

- ✅ **Internal Security Review**: Completed
- ✅ **Test Coverage**: 95%+ on production code
- ✅ **Static Analysis**: Passed (Slither, MythX)
- 🔄 **External Audit**: Scheduled for Q3 2025

### Security Measures

| Feature | Implementation | Status |
|---------|---------------|--------|
| Reentrancy Protection | ReentrancyGuard | ✅ Active |
| Access Control | Ownable + Custom | ✅ Active |
| Input Validation | Comprehensive checks | ✅ Active |
| Overflow Protection | Solidity 0.8.24 | ✅ Native |
| Emergency Controls | Pause mechanism | ✅ Active |

### Test Coverage

```
Production Contracts Coverage:
├─ SylvanToken.sol: 93.27%
├─ AccessControl.sol: 100%
├─ InputValidator.sol: 100%
├─ TaxManager.sol: 100%
└─ WalletManager.sol: 100%

Overall: 95.99% coverage
Total Tests: 323 passing
Security Tests: 163+ comprehensive security checks
```

---

## 🌱 Environmental Impact

### How It Works

1. **Every Transaction Counts**: 0.25% of every transaction goes directly to environmental NGOs
2. **Transparent Donations**: All donations are recorded on-chain and publicly verifiable
3. **Partner Organizations**: Carefully vetted environmental NGOs receive direct funding
4. **Impact Tracking**: Real-time dashboard showing total environmental contributions

### Supported Initiatives

- 🌳 Reforestation projects
- 🌊 Ocean cleanup initiatives  
- 🐾 Wildlife conservation
- ♻️ Sustainable development programs
- 🌍 Climate change research
- 🌿 Biodiversity protection

### Donation Transparency

All environmental donations are:
- ✅ Recorded on-chain and publicly verifiable
- ✅ **Pre-Transfer Announcement**: Donation details published 48 hours before transfer
- ✅ **Post-Transfer Verification**: Transaction proof shared within 24 hours after transfer
- ✅ **Multi-Channel Publishing**: Announced on website, Twitter, Telegram, and blog
- ✅ **NGO Transparency**: Recipient organizations and wallet addresses publicly disclosed
- ✅ **Regular Schedule**: Donations distributed at predetermined intervals (monthly or threshold-based)
- ✅ **Impact Reporting**: Detailed quarterly reports on fund utilization with photos and metrics
- ✅ **Real-Time Tracking**: Live donation tracker on website with cumulative statistics

---

## 📈 Roadmap

### 2025 Q3-Q4 - Launch Phase
- ✅ Smart contract development (Completed)
- ✅ Security audits (98/100 score)
- ✅ Testnet deployment (BSC Testnet)
- ✅ Token distribution (1B SYL)
- ✅ Vesting schedules configured (6 schedules)
- ✅ Comprehensive testing (323 tests passing)
- 🔄 Community building (In Progress)
- 🔄 Marketing campaign (In Progress)
- 📋 **Mainnet Launch (Q4 2025)**
- 📋 **Community Airdrop**
- 📋 **PinkSale Presale**
- 📋 **Liquidity Lock (90% for 2 years)**

### 2025 Q4 - Growth Phase
- 📋 DEX listings (PancakeSwap, etc.)
- 📋 CEX applications
- 📋 First environmental donations
- 📋 Partnership announcements
- 📋 Mobile app development

### 2026 Q1 - Expansion Phase
- 📋 Major exchange listings
- 📋 Cross-chain bridge development
- 📋 NFT marketplace for environmental causes
- 📋 Governance token implementation
- 📋 DAO formation

### 2026 Q2+ - Ecosystem Phase
- 📋 DeFi integrations
- 📋 Staking mechanisms
- 📋 Environmental impact NFTs
- 📋 Global partnership expansion
- 📋 Carbon credit marketplace

[View Detailed Roadmap](./ROADMAP.md)

---

## 🤝 Contributing

We welcome contributions from the community! Please read our [Contributing Guidelines](./CONTRIBUTING.md) before submitting pull requests.

### Development Process

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Code Standards

- Follow Solidity style guide
- Write comprehensive tests (>90% coverage)
- Document all functions with NatSpec
- Run linter before committing
- Include security considerations

---

## 📚 Documentation

- [Whitepaper](./WHITEPAPER.md) - Comprehensive project documentation
- [Technical Documentation](./docs/ENHANCED_SYSTEM_OVERVIEW.md) - System architecture
- [API Reference](./docs/ENHANCED_API_REFERENCE.md) - Contract interfaces
- [Deployment Guide](./docs/ENHANCED_DEPLOYMENT_GUIDE.md) - Deployment instructions
- [Security Documentation](./docs/SECURITY.md) - Security practices

---

## 🔗 Links & Resources

### Official Channels

- 🌐 **Website**: [sylvantoken.org](https://www.sylvantoken.org/)
- 🐦 **Twitter**: [@SylvanToken](https://x.com/SylvanToken)
- 💬 **Telegram**: [t.me/sylvantoken](https://t.me/sylvantoken)
- 💻 **GitHub**: [github.com/SylvanToken](https://github.com/SylvanToken)

### Resources

- 📊 **BSCScan**: [View Contract](#)
- 💱 **PancakeSwap**: [Trade SYL](#)
- 📈 **CoinGecko**: [Price & Stats](#)
- 📉 **CoinMarketCap**: [Market Data](#)

### Community

- 💬 **Discord**: Coming Soon
- 📱 **Reddit**: r/SylvanToken
- 📺 **YouTube**: Sylvan Token Official
- 📸 **Instagram**: @sylvantoken

---

## ⚖️ License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

---

## ⚠️ Disclaimer

**Important Notice:**

- Cryptocurrency investments carry risk. Only invest what you can afford to lose.
- This is not financial advice. Do your own research (DYOR).
- Smart contracts have been audited but no code is 100% secure.
- Environmental donations are made to vetted NGOs but we cannot guarantee specific outcomes.
- Token value may fluctuate. Past performance does not indicate future results.

---

## 🙏 Acknowledgments

- OpenZeppelin for secure smart contract libraries
- Binance Smart Chain for the robust blockchain infrastructure
- Our community for continuous support and feedback
- Environmental partners for their dedication to our planet

---

## 📞 Contact

For business inquiries, partnerships, or support:

- 📧 Email: contact@sylvantoken.org
- 💼 Business: partnerships@sylvantoken.org
- 🛠️ Technical: dev@sylvantoken.org

---

<div align="center">

**Made with 💚 for the Planet**

*Every transaction plants a seed for a greener future*

[![Twitter Follow](https://img.shields.io/twitter/follow/SylvanToken?style=social)](https://x.com/SylvanToken)
[![Telegram](https://img.shields.io/badge/Telegram-Join-blue?style=social&logo=telegram)](https://t.me/sylvantoken)

</div>
