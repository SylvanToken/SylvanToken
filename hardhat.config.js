require("@nomicfoundation/hardhat-network-helpers");
require("@nomiclabs/hardhat-waffle");
require("@nomicfoundation/hardhat-verify");
require("hardhat-gas-reporter");
require("solidity-coverage");
require("hardhat-contract-sizer");
require("dotenv").config();

const environmentConfig = require("./config/environment.config.js");
const deploymentConfig = require("./config/deployment.config.js");

module.exports = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: { 
        enabled: true, 
        runs: 200,
        details: {
          yul: true,
          yulDetails: {
            stackAllocation: true,
            optimizerSteps: "dhfoDgvulfnTUtnIf"
          }
        }
      },
      evmVersion: "shanghai"
    },
  },
  networks: {
    bscMainnet: {
      ...deploymentConfig.networks.bscMainnet,
      accounts: process.env.DEPLOYER_PRIVATE_KEY ? [process.env.DEPLOYER_PRIVATE_KEY] : [],
      timeout: deploymentConfig.deployment.timeout,
    },
    bscTestnet: {
      ...deploymentConfig.networks.bscTestnet,
      accounts: process.env.DEPLOYER_PRIVATE_KEY ? [process.env.DEPLOYER_PRIVATE_KEY] : [],
      timeout: deploymentConfig.deployment.timeout,
    },
    localhost: { 
      ...deploymentConfig.networks.localhost,
      accounts: {
        mnemonic: "test test test test test test test test test test test junk",
        count: 20
      },
      timeout: deploymentConfig.deployment.timeout
    },
    hardhat: { 
      chainId: 31337, 
      accounts: { 
        count: 20, 
        accountsBalance: "10000000000000000000000" 
      },
      allowUnlimitedContractSize: false,
      blockGasLimit: 30000000,
      mining: {
        auto: true,
        interval: 0,
        mempool: {
          order: "fifo" // Optimize transaction ordering
        }
      },
      // Optimize for test performance
      hardfork: "shanghai",
      initialBaseFeePerGas: 0, // Reduce gas calculation overhead
      loggingEnabled: false // Disable verbose logging for speed
    },
  },
  etherscan: {
    apiKey: { 
      bsc: environmentConfig.getBscscanApiKey(),
      bscMainnet: environmentConfig.getBscscanApiKey(),
      bscTestnet: environmentConfig.getBscscanApiKey() 
    },
    customChains: [
      {
        network: "bscTestnet",
        chainId: 97,
        urls: {
          apiURL: "https://api-testnet.bscscan.com/api",
          browserURL: "https://testnet.bscscan.com"
        }
      },
      {
        network: "bscMainnet",
        chainId: 56,
        urls: {
          apiURL: "https://api.bscscan.com/api",
          browserURL: "https://bscscan.com"
        }
      }
    ],
    enabled: true
  },
  sourcify: {
    enabled: false
  },
  gasReporter: { 
    enabled: process.env.REPORT_GAS === "true", 
    currency: "USD", 
    token: "BNB", 
    gasPrice: 5,
    excludeContracts: ['mocks/'],
    src: "./contracts"
  },
  contractSizer: { 
    alphaSort: true, 
    runOnCompile: false, 
    strict: false,
    except: ['mocks/']
  },
  // Enhanced coverage configuration (Requirements: 3.1, 3.3, 3.5)
  solcover: {
    skipFiles: [
      'mocks/',
      'utils/',
      'interfaces/'
    ],
    // Only measure production contracts
    include: [
      'contracts/SylvanToken.sol',
      'contracts/libraries/AccessControl.sol',
      'contracts/libraries/InputValidator.sol',
      'contracts/libraries/TaxManager.sol',
      'contracts/libraries/WalletManager.sol'
    ],
    measureStatementCoverage: true,
    measureFunctionCoverage: true,
    measureBranchCoverage: true,
    measureLineCoverage: true,
    // Coverage thresholds enforcement
    coverageThreshold: {
      global: {
        statements: 95,
        branches: 90,
        functions: 100,
        lines: 95
      },
      // Library-specific thresholds
      './contracts/libraries/InputValidator.sol': {
        statements: 95,
        branches: 90,
        functions: 100,
        lines: 95
      },
      './contracts/libraries/EmergencyManager.sol': {
        statements: 95,
        branches: 90,
        functions: 100,
        lines: 95
      },
      './contracts/libraries/AccessControl.sol': {
        statements: 95,
        branches: 90,
        functions: 100,
        lines: 95
      },
      './contracts/libraries/TaxManager.sol': {
        statements: 95,
        branches: 90,
        functions: 100,
        lines: 95
      },
      './contracts/libraries/WalletManager.sol': {
        statements: 95,
        branches: 90,
        functions: 100,
        lines: 95
      }
    },
    // Enhanced reporting options
    istanbulReporter: ['html', 'json', 'lcov', 'text', 'text-summary'],
    modifierWhitelist: [],
    // Optimize coverage collection
    providerOptions: {
      gasLimit: 0xfffffffffff,
      allowUnlimitedContractSize: true
    },
    // Enable detailed reporting
    silent: false,
    configureYulOptimizer: true,
    solcOptimizerDetails: {
      peephole: false,
      inliner: false,
      jumpdestRemover: false,
      orderLiterals: true,
      deduplicate: false,
      cse: false,
      constantOptimizer: false,
      yul: true
    }
  },
  mocha: { 
    timeout: 120000, // Increased timeout for localhost tests
    require: ["hardhat/register"],
    recursive: true,
    // Note: Parallel execution disabled due to gas reporter compatibility
    // Enable with: npx hardhat test --parallel (without gas reporting)
    parallel: false,
    jobs: 1
  },
  paths: {
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  }
};