# 🎯 Comprehensive SylvanToken Trading Guide

## 📋 Overview

This comprehensive guide covers all aspects of trading SylvanToken (SYL) on BSC Testnet, including multiple methods for interacting with PancakeSwap, manual BSCScan interactions, and automated script-based trading.

## 🔧 Initial Setup

### Network Configuration
```
Network Name: BSC Testnet
RPC URL: https://data-seed-prebsc-1-s1.binance.org:8545/
Chain ID: 97
Currency Symbol: BNB
Block Explorer: https://testnet.bscscan.com/
```

### Contract Information
```
SYL Token: 0x778AD2A293193408779447782da95eff11914c5E
PancakeSwap Router: 0xD99D1c33F9fC3444f8101754aBC46c52416550D1
PancakeSwap Factory: 0x6725F303b657a9451d8BA641348b6761A6CC7a17
WBNB: 0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd
```

### System Wallets
```
Fee Wallet: 0x3e13b113482bCbCcfCd0D8517174EFF81b36a740 (50% of tax)
Donation Wallet: 0x9Df4B945cef88E42c78522BB26621bBF2DCd10ef (25% of tax)
Burn Address: 0x000000000000000000000000000000000000dEaD (25% of tax)
```

## 💰 Getting Test Tokens

### 1. Get Testnet BNB
1. Visit: https://testnet.bnbchain.org/faucet-smart
2. Enter your wallet address
3. Request 0.1+ BNB (sufficient for trading)
4. Wait 1-2 minutes for confirmation

### 2. Get SYL Tokens
Transfer from allocated wallets (fee-exempt):
```
Sylvan Token Wallet: 0xea8e945F7Cd6faC08dD5e369B55e04E7a8c3e28a (500M SYL)
Founder Wallet: 0x1109B6aDB60dB170139f00bA2490fCA0F8BE7A8C (160M SYL)
Locked Token Wallet: 0xE56ab5861f2B1C8dC185ecF8881242256CdB4c17 (300M SYL)
```

**Transfer Steps:**
1. Import one of the above wallet private keys to MetaMask
2. Switch to BSC Testnet
3. Add SYL token to MetaMask
4. Transfer 1000-5000 SYL to your test wallet (tax-free)

## 🎯 Trading Methods

## Method 1: PancakeSwap Web Interface

### Setup
1. Visit: https://pancakeswap.finance/
2. Connect MetaMask wallet
3. Switch to BSC Testnet (auto-detected)
4. Add SYL token: `0x778AD2A293193408779447782da95eff11914c5E`

### Creating Liquidity Pool
1. Go to "Liquidity" → "Add Liquidity"
2. Select BNB and SYL tokens
3. Enter amounts (e.g., 0.1 BNB + 1000 SYL)
4. Set slippage to 5-10% (due to tax)
5. Approve SYL tokens
6. Confirm liquidity addition

### Trading Operations
**Buy (BNB → SYL):**
1. Go to "Trade" → "Swap"
2. From: BNB, To: SYL
3. Enter BNB amount (e.g., 0.01 BNB)
4. Set slippage to 10% (for tax)
5. Execute swap

**Sell (SYL → BNB):**
1. From: SYL, To: BNB
2. Enter SYL amount (e.g., 100 SYL)
3. Set slippage to 10%
4. Execute swap

## Method 2: BSCScan Manual Interaction

### Step 1: Approve SYL Tokens
**BSCScan Link**: https://testnet.bscscan.com/address/0x778AD2A293193408779447782da95eff11914c5E

1. Go to "Contract" → "Write Contract"
2. Connect MetaMask
3. Find **approve** function
4. Parameters:
   ```
   spender: 0xD99D1c33F9fC3444f8101754aBC46c52416550D1
   amount: 2000000000000000000000 (2000 SYL in wei)
   ```
5. Execute transaction

### Step 2: Add Liquidity
**BSCScan Link**: https://testnet.bscscan.com/address/0xD99D1c33F9fC3444f8101754aBC46c52416550D1

1. Find **addLiquidityETH** function
2. Parameters:
   ```
   token: 0x778AD2A293193408779447782da95eff11914c5E
   amountTokenDesired: 1000000000000000000000 (1000 SYL)
   amountTokenMin: 950000000000000000000 (950 SYL, 5% slippage)
   amountETHMin: 95000000000000000 (0.095 BNB, 5% slippage)
   to: YOUR_WALLET_ADDRESS
   deadline: 1762418933 (future timestamp)
   ```
3. Value: `0.1` (BNB amount)
4. Execute transaction

### Step 3: Buy Tokens (BNB → SYL)
1. Find **swapExactETHForTokens** function
2. Parameters:
   ```
   amountOutMin: 90000000000000000000 (90 SYL minimum)
   path: ["0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd","0x778AD2A293193408779447782da95eff11914c5E"]
   to: YOUR_WALLET_ADDRESS
   deadline: 1762418933
   ```
3. Value: `0.01` (BNB to spend)
4. Execute transaction

### Step 4: Sell Tokens (SYL → BNB)
1. Find **swapExactTokensForETH** function
2. Parameters:
   ```
   amountIn: 100000000000000000000 (100 SYL)
   amountOutMin: 9000000000000000 (0.009 BNB minimum)
   path: ["0x778AD2A293193408779447782da95eff11914c5E","0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd"]
   to: YOUR_WALLET_ADDRESS
   deadline: 1762418933
   ```
3. Execute transaction

## Method 3: Automated Script Trading

### Available Commands
```bash
# Check pool status
npm run trade:direct check

# Create liquidity pool
npm run trade:direct create [SYL_AMOUNT] [BNB_AMOUNT]

# Buy tokens
npm run trade:direct buy [BNB_AMOUNT]

# Sell tokens
npm run trade:direct sell [SYL_AMOUNT]

# Check tax collection
npm run trade:direct tax

# Run full demo
npm run trade:demo
```

### Example Usage
```bash
# Create small pool
npm run trade:direct create 1000 0.1

# Buy with 0.01 BNB
npm run trade:direct buy 0.01

# Sell 100 SYL
npm run trade:direct sell 100

# Full automated demo
npm run trade:demo
```

## 📊 Tax System Analysis

### Tax Structure
```
Total Tax Rate: 1% per transaction
Distribution:
├── Fee Wallet (50%): 0.5%
├── Donation Wallet (25%): 0.25%
└── Burn Address (25%): 0.25%
```

### Tax Calculation Example
```
Transaction: 1000 SYL
Tax Applied: 10 SYL (1%)

Distribution:
├── Fee Wallet: 5 SYL
├── Donation Wallet: 2.5 SYL
└── Burn Address: 2.5 SYL

Net Amount: 990 SYL
```

### Monitoring Tax Collection
Check these addresses after trading:

**Fee Wallet:**
- Address: `0x3e13b113482bCbCcfCd0D8517174EFF81b36a740`
- BSCScan: https://testnet.bscscan.com/address/0x3e13b113482bCbCcfCd0D8517174EFF81b36a740

**Donation Wallet:**
- Address: `0x9Df4B945cef88E42c78522BB26621bBF2DCd10ef`
- BSCScan: https://testnet.bscscan.com/address/0x9Df4B945cef88E42c78522BB26621bBF2DCd10ef

**Burn Address:**
- Address: `0x000000000000000000000000000000000000dEaD`
- BSCScan: https://testnet.bscscan.com/address/0x000000000000000000000000000000000000dEaD

## 🧪 Advanced Testing Scenarios

### 1. Fee-Exempt Account Testing
Test transfers from exempt accounts (no tax applied):
```
Exempt Accounts:
- Sylvan Token Wallet: 0xea8e945F7Cd6faC08dD5e369B55e04E7a8c3e28a
- Founder Wallet: 0x1109B6aDB60dB170139f00bA2490fCA0F8BE7A8C
- Fee Collection Wallet: 0x3e13b113482bCbCcfCd0D8517174EFF81b36a740
- Donation Wallet: 0x9Df4B945cef88E42c78522BB26621bBF2DCd10ef
- Locked Token Wallet: 0xE56ab5861f2B1C8dC185ecF8881242256CdB4c17
```

### 2. Large Volume Testing
1. **Large Buy**: 0.1+ BNB purchases
2. **Large Sell**: 10,000+ SYL sales
3. **Price Impact**: Monitor price changes
4. **Tax Collection**: Verify large amounts

### 3. Multi-Wallet Testing
1. **Different Wallets**: Use multiple test wallets
2. **P2P Transfers**: Test wallet-to-wallet transfers
3. **Tax Consistency**: Verify consistent tax rates

## 🔧 Utility Tools

### Wei Conversion
```javascript
// In browser console or Node.js:
ethers.utils.parseEther("1000").toString()  // 1000 SYL → wei
ethers.utils.parseEther("0.1").toString()   // 0.1 BNB → wei
ethers.utils.formatEther("1000000000000000000000") // wei → readable
```

### Deadline Calculator
```javascript
// 20 minutes from now:
Math.floor(Date.now() / 1000) + (20 * 60)
```

### Slippage Calculator
```javascript
// 5% slippage:
const amount = 1000;
const minAmount = amount * 0.95; // 950
```

## ⚠️ Important Notes

### Trading Considerations
1. **Slippage**: Set 5-10% due to 1% tax
2. **Gas Fees**: Keep sufficient BNB for transactions
3. **Test Amounts**: Start with small amounts
4. **Network**: Ensure you're on BSC Testnet
5. **Contract Address**: Always verify correct addresses

### Troubleshooting
```
"Transaction Failed" → Increase slippage tolerance
"Insufficient Liquidity" → Add more liquidity to pool
"Token Not Found" → Manually enter contract address
"High Gas" → Verify you're on BSC Testnet
"Insufficient Allowance" → Approve tokens first
"Deadline Exceeded" → Calculate new deadline
```

## 📋 Complete Testing Checklist

### ✅ Setup Phase
- [ ] MetaMask BSC Testnet configuration
- [ ] SYL token added to MetaMask
- [ ] Testnet BNB acquired
- [ ] SYL tokens transferred from exempt wallet

### ✅ Liquidity Phase
- [ ] SYL token approval completed
- [ ] Liquidity pool created successfully
- [ ] Pool reserves verified
- [ ] LP tokens received

### ✅ Trading Phase
- [ ] Buy transaction successful (BNB → SYL)
- [ ] Sell transaction successful (SYL → BNB)
- [ ] Transaction hashes recorded
- [ ] Balance changes verified

### ✅ Tax Validation
- [ ] Fee wallet balance increased
- [ ] Donation wallet balance increased
- [ ] Burn address balance increased
- [ ] Tax rates verified (1% total)

### ✅ Advanced Testing
- [ ] Large volume trades tested
- [ ] Price impact analyzed
- [ ] Multi-wallet scenarios tested
- [ ] Fee-exempt transfers verified

## 🎯 Success Metrics

### Quantitative Indicators
1. **Successful Transactions**: All trades execute without errors
2. **Tax Collection**: Correct 1% tax applied and distributed
3. **Price Stability**: Reasonable price impact for trade sizes
4. **Gas Efficiency**: Transactions complete with normal gas usage

### Qualitative Indicators
1. **User Experience**: Smooth trading process
2. **System Reliability**: Consistent behavior across methods
3. **Tax Transparency**: Clear tax distribution
4. **Documentation Accuracy**: Guide matches actual behavior

---

**🎉 This comprehensive guide provides multiple methods to successfully trade SylvanToken and validate the complete tax system functionality!**