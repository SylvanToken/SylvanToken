# Sourcify Verification Files

## Contract Information
- **Address:** 0xc66404C3fa3E01378027b4A4411812D3a8D458F5
- **Network:** BSC Mainnet (Chain ID: 56)
- **Compiler:** v0.8.24+commit.e11b9ed9
- **Optimization:** Yes (200 runs)
- **EVM Version:** shanghai

## Libraries
- **WalletManager:** 0xa2406B88002caD138a9d5BBcf22D3638efE9F819

## Verification Steps

### Option 1: Sourcify Web Interface
1. Go to: https://sourcify.dev/#/verifier
2. Select "Verifier" tab
3. Enter Chain ID: 56
4. Enter Contract Address: 0xc66404C3fa3E01378027b4A4411812D3a8D458F5
5. Upload all files from this directory
6. Click "Verify"

### Option 2: Sourcify CLI
```bash
npx sourcify verify --chain 56 --address 0xc66404C3fa3E01378027b4A4411812D3a8D458F5 --files ./sourcify-verification
```

## Files Included
- contracts/SylvanToken.sol (main contract)
- contracts/libraries/*.sol (all libraries)
- contracts/interfaces/*.sol (all interfaces)
- metadata.json (compilation metadata)

## Constructor Arguments
```
feeWallet: 0x46a4AF3bdAD67d3855Af42Ba0BBe9248b54F7915
donationWallet: 0xa697645Fdfa5d9399eD18A6575256F81343D4e17
initialExemptAccounts: [
  "0xf949f50B3C32bD4cDa7D2192ff8f51dd9db4A469",
  "0x46a4AF3bdAD67d3855Af42Ba0BBe9248b54F7915",
  "0xa697645Fdfa5d9399ed18a6575256F81343D4e17",
  "0x000000000000000000000000000000000000dEaD"
]
```

## Links
- **BSCScan:** https://bscscan.com/address/0xc66404C3fa3E01378027b4A4411812D3a8D458F5
- **Sourcify:** https://sourcify.dev/
- **Deployment TX:** https://bscscan.com/tx/0x31834fad66071ceddcff6a98f8590e7df188170b55a0c55862c74dc0ac5e0d72
