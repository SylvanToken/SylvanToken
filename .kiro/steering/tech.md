# Technology Stack

## Smart Contract Development

- **Solidity**: 0.8.24 (with Shanghai EVM)
- **Framework**: Hardhat 2.26.3
- **OpenZeppelin Contracts**: 4.9.6 (ERC20, Ownable, ReentrancyGuard, Address)
- **Compiler Optimization**: Enabled with 200 runs, Yul optimization active

## Testing & Quality

- **Test Framework**: Mocha 10.8.2 with Chai matchers
- **Test Helpers**: @nomicfoundation/hardhat-network-helpers, @nomicfoundation/hardhat-chai-matchers
- **Coverage**: solidity-coverage 0.8.16
- **Gas Reporting**: hardhat-gas-reporter 1.0.10
- **Contract Sizing**: hardhat-contract-sizer 2.10.1
- **Security Analysis**: Slither (external), truffle-security 1.7.3

## Blockchain Integration

- **Network**: Binance Smart Chain (BSC)
- **Ethers.js**: v5.8.0
- **Chain IDs**: BSC Mainnet (56), BSC Testnet (97), Localhost (31337)
- **Verification**: @nomiclabs/hardhat-etherscan 3.1.8

## Development Tools

- **Node.js**: v16+ required
- **Package Manager**: npm
- **Environment**: dotenv 16.6.1 for configuration
- **TypeScript**: 5.9.3 (for type support)

## Common Commands

### Compilation & Testing
```bash
# Compile contracts
npx hardhat compile

# Run all tests
npx hardhat test

# Run specific test file
npx hardhat test test/[filename].test.js

# Generate coverage report
npx hardhat coverage
```

### Deployment
```bash
# Deploy to BSC Testnet
npm run deploy:testnet

# Deploy to BSC Mainnet
npm run deploy:mainnet

# Verify deployment
npm run verify:testnet
npm run verify:mainnet

# Test connection
npm run test:connection
```

### Security & Analysis
```bash
# Run security analysis
npm run security:analysis

# Run Slither static analysis
npm run security:slither

# Full security suite
npm run security:full
```

### Management Scripts
```bash
# Fee exemption management
npm run exemptions:list
npm run exemptions:summary
npm run exemptions:validate
npm run exemptions:add
npm run exemptions:audit

# Wallet analysis
npm run wallets:analysis
npm run wallets:fees
npm run wallets:summary
```

## Architecture Patterns

- **Library Pattern**: Reusable logic in separate libraries (EmergencyManager, WalletManager, AccessControl, TaxManager, InputValidator)
- **Interface Segregation**: Separate interfaces for different concerns (IEnhancedFeeManager, IVestingManager, IAdminWalletHandler)
- **Modular Design**: Core contract imports and uses libraries via `using` statements
- **Centralized Configuration**: All deployment and security parameters in config files

## Gas Optimization

- Optimizer enabled with 200 runs
- Yul optimizer with stack allocation
- Efficient storage patterns (packed structs where possible)
- Batch operations for multiple updates
- View functions for read-only operations

## Testing Standards

- Minimum 163 security tests required
- Test categories: core functionality, security audit, error handling, coverage, integration
- All tests must pass before deployment
- Coverage target: 79%+ for production readiness
