# Project Structure

## Root Directory Organization

```
├── contracts/          # Solidity smart contracts
├── test/              # Test suites
├── scripts/           # Deployment and management scripts
├── config/            # Configuration files
├── docs/              # Documentation
├── deployments/       # Deployment records
├── artifacts/         # Compiled contract artifacts (generated)
├── cache/             # Hardhat cache (generated)
├── coverage/          # Coverage reports (generated)
└── logs/              # Script execution logs
```

## Contracts Directory

```
contracts/
├── EnhancedSylvanToken.sol    # Main token contract (primary)
├── SylvanToken.sol            # Legacy/reference contract
├── interfaces/                # Contract interfaces
│   ├── IEnhancedFeeManager.sol
│   ├── IVestingManager.sol
│   └── IAdminWalletHandler.sol
├── libraries/                 # Reusable logic libraries
│   ├── EmergencyManager.sol
│   ├── WalletManager.sol
│   ├── AccessControl.sol
│   ├── TaxManager.sol
│   └── InputValidator.sol
├── mocks/                     # Test helper contracts
│   ├── EmergencyManagerTestContract.sol
│   ├── TaxManagerTestContract.sol
│   ├── AccessControlTestContract.sol
│   └── InputValidatorTestContract.sol
└── utils/                     # Utility contracts
```

## Test Directory

```
test/
├── 01_core_functionality.test.js           # Basic token operations
├── comprehensive_coverage.test.js          # Full coverage tests
├── enhanced-fee-system.test.js            # Fee system tests
├── enhanced-deployment-integration.test.js # Deployment tests
├── exemption-management.test.js           # Exemption logic tests
├── final-system-validation.test.js        # End-to-end validation
├── system-integration.test.js             # Integration tests
├── management-tools.test.js               # Management script tests
├── error-message-validation.test.js       # Error handling tests
├── enhanced-branch-coverage.test.js       # Branch coverage tests
├── helpers/                               # Test utilities
│   └── deploy-libraries.js
└── libraries/                             # Library-specific tests
    ├── EmergencyManagerComplete.test.js
    ├── TaxManagerComplete.test.js
    ├── AccessControlComplete.test.js
    └── InputValidatorComplete.test.js
```

## Scripts Directory

```
scripts/
├── deployment/                            # Deployment scripts
│   ├── deploy-enhanced-complete.js       # Main deployment script
│   └── deployment-validation.js          # Validation utilities
└── management/                           # Management tools
    ├── manage-exemptions.js              # Fee exemption management
    ├── fee-exemption-manager.js          # Exemption utilities
    ├── exemption-config-loader.js        # Config loading
    └── wallet-analysis.js                # Wallet analytics
```

## Configuration Directory

```
config/
├── deployment.config.js    # Wallet addresses, allocations, network settings
├── environment.config.js   # Environment variables and secrets
└── security.config.js      # Security parameters and limits
```

## Documentation Directory

```
docs/
├── DOCUMENTATION_INDEX.md              # Documentation overview
├── ENHANCED_SYSTEM_OVERVIEW.md         # System architecture
├── ENHANCED_DEPLOYMENT_GUIDE.md        # Deployment instructions
├── ENHANCED_FEE_MANAGEMENT_GUIDE.md    # Fee system guide
├── LOCK_MECHANISM_GUIDE.md             # Vesting/locking guide
├── ENHANCED_API_REFERENCE.md           # API documentation
├── ENHANCED_MONITORING_GUIDE.md        # Monitoring setup
├── ENHANCED_MANAGEMENT_SCRIPTS.md      # Script usage
├── ENHANCED_ANALYTICS_INTEGRATION.md   # Analytics guide
├── SECURITY.md                         # Security practices
├── TESTNET_DEPLOYMENT_SUCCESS.md       # Deployment records
└── WALLET_STATUS_REPORT.md             # Wallet status
```

## Key Files

- **hardhat.config.js**: Hardhat configuration (networks, compiler, plugins)
- **package.json**: Dependencies and npm scripts
- **.env**: Environment variables (private keys, API keys) - never commit
- **.env.example**: Template for environment variables
- **.gitignore**: Git ignore patterns
- **README.md**: Project overview and quick start
- **COMPREHENSIVE_TRADING_GUIDE.md**: Trading scenarios and fee examples
- **FEE_EXEMPTION_GUIDE.md**: Fee exemption system guide

## Naming Conventions

### Contracts
- Main contracts: PascalCase (e.g., `EnhancedSylvanToken.sol`)
- Libraries: PascalCase with descriptive names (e.g., `EmergencyManager.sol`)
- Interfaces: Prefixed with `I` (e.g., `IEnhancedFeeManager.sol`)
- Mocks: Suffixed with `TestContract` (e.g., `EmergencyManagerTestContract.sol`)

### Tests
- Test files: kebab-case with `.test.js` suffix
- Test categories indicated by prefix or name (e.g., `enhanced-`, `01_core_`)
- Library tests in `test/libraries/` subdirectory

### Scripts
- Deployment scripts: `deploy-*.js` pattern
- Management scripts: descriptive kebab-case names
- Organized by function in subdirectories

### Configuration
- Config files: `*.config.js` pattern
- Descriptive names indicating purpose (deployment, environment, security)

## Import Patterns

### In Contracts
```solidity
// OpenZeppelin imports
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

// Local interface imports
import "./interfaces/IEnhancedFeeManager.sol";

// Local library imports
import "./libraries/EmergencyManager.sol";
```

### In Tests
```javascript
const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
```

### In Scripts
```javascript
const hre = require("hardhat");
const deploymentConfig = require("../config/deployment.config.js");
const environmentConfig = require("../config/environment.config.js");
```

## Generated Directories (Git Ignored)

- `artifacts/`: Compiled contract artifacts
- `cache/`: Hardhat compilation cache
- `coverage/`: Coverage reports
- `node_modules/`: npm dependencies

## Configuration Files Location

All configuration is centralized in the `config/` directory to separate concerns and make updates easier. Never hardcode addresses or parameters in contracts or scripts - always reference config files.
