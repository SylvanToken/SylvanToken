// Constructor arguments for SylvanToken verification
// Contract: 0xc66404C3fa3E01378027b4A4411812D3a8D458F5
// Deployed: 2025-12-09

module.exports = [
  "0x46a4AF3bdAD67d3855Af42Ba0BBe9248b54F7915", // feeWallet
  "0xa697645Fdfa5d9399eD18A6575256F81343D4e17", // donationWallet
  [
    "0x465b54282e4885f61df7eB7CcDc2493DB35C9501", // Founder wallet
    "0xf949f50B3C32bD4cDa7D2192ff8f51dd9db4A469", // Sylvan Token wallet
    "0x687A2c7E494c3818c20AD2856d453514970d6aac"  // Locked wallet
  ] // initialExemptAccounts (system wallets only, no admin wallets)
];
