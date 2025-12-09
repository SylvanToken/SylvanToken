# BSC Mainnet Contract Verification Guide

## Contract Information

- **Contract Address**: `0xc66404C3fa3E01378027b4A4411812D3a8D458F5`
- **Contract Name**: SylvanToken
- **Compiler Version**: v0.8.24+commit.e11b9ed9
- **Optimization**: Enabled with 200 runs
- **EVM Version**: Shanghai
- **License**: MIT

## BSCScan Verification URL

https://bscscan.com/verifyContract?a=0xc66404C3fa3E01378027b4A4411812D3a8D458F5

## Constructor Arguments (ABI-Encoded)

```
Fee Wallet: 0x46a4AF3bdAD67d3855Af42Ba0BBe9248b54F7915
Donation Wallet: 0xa697645Fdfa5d9399eD18A6575256F81343D4e17
Initial Exempt Accounts: [
  "0x465b54282e4885f61df7eB7CcDc2493DB35C9501",  // Founder
  "0xf949f50B3C32bD4cDa7D2192ff8f51dd9db4A469",  // Sylvan Token Wallet
  "0x687A2c7E494c3818c20AD2856d453514970d6aac"   // Locked Wallet
]
```

## Manual Verification Steps

### Step 1: Go to BSCScan Verify Page
1. Visit: https://bscscan.com/address/0xc66404C3fa3E01378027b4A4411812D3a8D458F5#code
2. Click "Verify and Publish"

### Step 2: Select Verification Method
- Choose "Solidity (Standard-Json-Input)"
- Or choose "Solidity (Single file)" and use the flattened contract

### Step 3: Compiler Settings
- Compiler Type: Solidity (Single file)
- Compiler Version: v0.8.24+commit.e11b9ed9
- Open Source License Type: MIT License (MIT)

### Step 4: Optimization Settings
- Optimization: Yes
- Runs: 200

### Step 5: Contract Code
- Use the flattened contract file: `SylvanToken-flattened-v2.sol`
- Remove duplicate SPDX license identifiers (keep only one at the top)

### Step 6: Constructor Arguments
ABI-encoded constructor arguments:

```
00000000000000000000000046a4af3bdad67d3855af42ba0bbe9248b54f7915000000000000000000000000a697645fdfa5d9399ed18a6575256f81343d4e1700000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000003000000000000000000000000465b54282e4885f61df7eb7ccdc2493db35c9501000000000000000000000000f949f50b3c32bd4cda7d2192ff8f51dd9db4a469000000000000000000000000687a2c7e494c3818c20ad2856d453514970d6aac
```

### Step 7: Verify
Click "Verify and Publish"

## Alternative: Standard JSON Input

Use the `standard-input.json` file for verification with Standard JSON Input method.

## Files for Verification

1. **Flattened Contract**: `SylvanToken-flattened-v2.sol`
2. **Standard JSON Input**: `standard-input.json`
3. **Constructor Arguments**: `arguments.js`

## Post-Verification

After successful verification:
1. Contract source code will be visible on BSCScan
2. Read/Write contract functions will be available
3. Users can interact with the contract directly from BSCScan

## Deployment Summary

| Item | Value |
|------|-------|
| Network | BSC Mainnet |
| Chain ID | 56 |
| Contract | 0xc66404C3fa3E01378027b4A4411812D3a8D458F5 |
| Deployer | 0xf949f50B3C32bD4cDa7D2192ff8f51dd9db4A469 |
| Total Supply | 1,000,000,000 SYL |
| Deployment Date | 2025-12-09 |
