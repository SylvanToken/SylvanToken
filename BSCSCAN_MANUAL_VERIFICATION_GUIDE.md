# BSCScan Manuel Contract Verification Rehberi

## 📋 Gerekli Bilgiler

**Contract Address:** `0xc66404C3fa3E01378027b4A4411812D3a8D458F5`

**Constructor Parameters:**
- Fee Wallet: `0x46a4AF3bdAD67d3855Af42Ba0BBe9248b54F7915`
- Donation Wallet: `0xa697645Fdfa5d9399eD18A6575256F81343D4e17`
- Initial Exempt Accounts: 
  - `0xf949f50B3C32bD4cDa7D2192ff8f51dd9db4A469` (Deployer)
  - `0x46a4AF3bdAD67d3855Af42Ba0BBe9248b54F7915` (Fee Wallet)
  - `0xa697645Fdfa5d9399eD18A6575256F81343D4e17` (Donation Wallet)
  - `0x000000000000000000000000000000000000dEaD` (Dead Address)

**Library Address:**
- WalletManager: `0xa2406B88002caD138a9d5BBcf22D3638efE9F819`

---

## 🔧 Adım Adım Verification

### Adım 1: BSCScan Verification Sayfasına Git

🔗 **Link:** https://bscscan.com/verifyContract?a=0xc66404C3fa3E01378027b4A4411812D3a8D458F5

### Adım 2: Compiler Ayarları

Aşağıdaki bilgileri girin:

1. **Compiler Type:** `Solidity (Single file)`
2. **Compiler Version:** `v0.8.24+commit.e11b9ed9`
3. **Open Source License Type:** `MIT License (MIT)`

### Adım 3: Optimization Ayarları

1. **Optimization:** `Yes`
2. **Runs:** `200`

### Adım 4: Contract Kodunu Flatten Et

Önce kontratı flatten etmemiz gerekiyor:

```bash
npx hardhat flatten contracts/SylvanToken.sol > SylvanToken-flattened.sol
```

Bu dosyayı açın ve aşağıdaki düzenlemeleri yapın:

1. **Duplicate SPDX License tanımlarını silin** - Sadece en üstte bir tane `// SPDX-License-Identifier: MIT` kalmalı
2. **Duplicate pragma tanımlarını silin** - Sadece bir tane `pragma solidity 0.8.24;` kalmalı

### Adım 5: Flattened Kodu Yapıştır

Düzenlenmiş `SylvanToken-flattened.sol` dosyasının içeriğini BSCScan'deki "Enter the Solidity Contract Code below" alanına yapıştırın.

### Adım 6: Constructor Arguments (ABI-encoded)

BSCScan otomatik olarak constructor arguments'ı encode edecek. Eğer manuel girmeniz gerekirse:

**Constructor Arguments (ABI-encoded hex):**
```
00000000000000000000000046a4af3bdad67d3855af42ba0bbe9248b54f7915000000000000000000000000a697645fdfa5d9399ed18a6575256f81343d4e1700000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000004000000000000000000000000f949f50b3c32bd4cda7d2192ff8f51dd9db4a46900000000000000000000000046a4af3bdad67d3855af42ba0bbe9248b54f7915000000000000000000000000a697645fdfa5d9399ed18a6575256f81343d4e17000000000000000000000000000000000000000000000000000000000000dead
```

### Adım 7: Library Addresses

"Add Library" butonuna tıklayın ve şu bilgileri girin:

**Library 1:**
- Library Name: `contracts/libraries/WalletManager.sol:WalletManager`
- Library Address: `0xa2406B88002caD138a9d5BBcf22D3638efE9F819`

### Adım 8: Verify

"Verify and Publish" butonuna tıklayın.

---

## ✅ Verification Sonrası

Başarılı olursa:
- ✅ Contract kaynak kodu görünür olacak
- ✅ Token holder'lar BSCScan'de listelenecek
- ✅ "Read Contract" ve "Write Contract" sekmeleri aktif olacak

**Contract Sayfası:**
https://bscscan.com/address/0xc66404C3fa3E01378027b4A4411812D3a8D458F5#code

**Token Tracker:**
https://bscscan.com/token/0xc66404C3fa3E01378027b4A4411812D3a8D458F5

---

## 🚨 Sorun Giderme

### Hata: "Constructor arguments mismatch"

Constructor arguments'ı yeniden encode edin:

```bash
npx hardhat run scripts/deployment/encode-constructor-args.js
```

### Hata: "Library not found"

Library adresinin doğru olduğundan emin olun:
- WalletManager: `0xa2406B88002caD138a9d5BBcf22D3638efE9F819`

### Hata: "Compilation failed"

1. Flattened dosyada duplicate SPDX ve pragma tanımlarını kontrol edin
2. Tüm import statement'ları silin (flatten işlemi bunları zaten dahil eder)

---

## 📞 Destek

Sorun yaşarsanız:
1. BSCScan Support: https://bscscan.com/contactus
2. Hardhat Documentation: https://hardhat.org/hardhat-runner/plugins/nomiclabs-hardhat-etherscan

---

**Date:** November 10, 2025-
**Version:** 1.0.0
