# BSC Testnet Trading Test Guide

**Date:** November 8, 2025-  
**Contract:** 0x2016Fd055810ef5e9F7C753c24ae4b2C2B414B9E  
**Network:** BSC Testnet (Chain ID: 97)

---

## 🎯 Amaç

Testnette alım-satım (trading) testini yapmak için PancakeSwap Testnet'te likidite havuzu oluşturup, swap işlemlerini test edeceğiz.

---

## 📋 Gereksinimler

### 1. Testnet BNB
- **Nereden:** https://testnet.bnbchain.org/faucet-smart
- **Miktar:** En az 1 BNB (likidite için)
- **Kullanım:** Gas fee + Likidite sağlama

### 2. Sylvan Token (SYL)
- **Contract:** 0x2016Fd055810ef5e9F7C753c24ae4b2C2B414B9E
- **Miktar:** Test için yeterli token
- **Kaynak:** Deployment'tan kalan tokenlar

### 3. MetaMask Wallet
- BSC Testnet ağı eklenmiş
- Test BNB ve SYL token'ları olan

---

## 🚀 Adım Adım Rehber

### Adım 1: PancakeSwap Testnet'e Bağlan

**URL:** https://pancakeswap.finance/

**Testnet Moduna Geç:**
1. PancakeSwap'i aç
2. Sağ üstte "Testnet" butonuna tıkla
3. MetaMask'ta BSC Testnet'e geç
4. Wallet'ı bağla

**Alternatif URL:**
- https://pancakeswap.finance/?chain=bscTestnet

---

### Adım 2: Token'ı Import Et

**PancakeSwap'te:**
1. "Trade" > "Swap" git
2. Token seçicide "Manage Tokens" tıkla
3. "Tokens" tab'ına git
4. Contract adresini yapıştır: `0x2016Fd055810ef5e9F7C753c24ae4b2C2B414B9E`
5. "Import" tıkla
6. Uyarıyı onayla

**Kontrol:**
- Token adı: Sylvan Token
- Symbol: SYL
- Decimals: 18

---

### Adım 3: Likidite Havuzu Oluştur

**PancakeSwap'te:**
1. "Liquidity" > "Add Liquidity" git
2. İlk token: BNB seç
3. İkinci token: SYL seç (import ettiysen görünür)
4. Miktarları gir:
   - **BNB:** 0.1 BNB (örnek)
   - **SYL:** 10,000 SYL (örnek)
5. "Supply" butonuna tıkla
6. MetaMask'ta onayla

**Önemli Notlar:**
- İlk likidite sağlayan fiyatı belirler
- Oran: 1 BNB = 100,000 SYL (örnek)
- Minimum likidite: 0.01 BNB

**Beklenen Sonuç:**
```
Liquidity Pool Created:
- BNB: 0.1
- SYL: 10,000
- LP Tokens: X.XX
- Share: 100%
```

---

### Adım 4: Alım (Buy) Testi

**Swap İşlemi (BNB → SYL):**

1. "Trade" > "Swap" git
2. From: BNB
3. To: SYL
4. Miktar gir: 0.01 BNB
5. "Swap" tıkla
6. Detayları kontrol et:
   ```
   From: 0.01 BNB
   To: ~1,000 SYL (slippage'a göre)
   Price Impact: %X.XX
   Minimum Received: XXX SYL
   Fee: 1% (Universal Fee)
   ```
7. "Confirm Swap" tıkla
8. MetaMask'ta onayla

**Kontrol Edilecekler:**
- ✅ Swap başarılı mı?
- ✅ Fee kesildi mi? (1%)
- ✅ Doğru miktar alındı mı?
- ✅ Transaction hash alındı mı?

**BSCScan'de Kontrol:**
```
https://testnet.bscscan.com/tx/[TRANSACTION_HASH]
```

---

### Adım 5: Satım (Sell) Testi

**Swap İşlemi (SYL → BNB):**

1. "Trade" > "Swap" git
2. From: SYL
3. To: BNB
4. Miktar gir: 1,000 SYL
5. "Swap" tıkla
6. Detayları kontrol et:
   ```
   From: 1,000 SYL
   To: ~0.0099 BNB (fee sonrası)
   Price Impact: %X.XX
   Minimum Received: 0.00XX BNB
   Fee: 1% (Universal Fee)
   ```
7. "Confirm Swap" tıkla
8. MetaMask'ta onayla

**Kontrol Edilecekler:**
- ✅ Swap başarılı mı?
- ✅ Fee kesildi mi? (1%)
- ✅ Doğru miktar alındı mı?
- ✅ Slippage toleransı yeterli mi?

---

### Adım 6: Fee Mekanizması Testi

**Fee Dağılımını Kontrol:**

Her swap sonrası kontrol et:

1. **Operations Wallet** (50% fee)
   - Adres: [Operations wallet address]
   - Beklenen: Fee'nin %50'si

2. **Burn** (25% fee)
   - Adres: 0x000000000000000000000000000000000000dEaD
   - Beklenen: Fee'nin %25'i

3. **Donations** (25% fee)
   - Adres: [Donations wallet address]
   - Beklenen: Fee'nin %25'i

**Hesaplama Örneği:**
```
Swap Amount: 1,000 SYL
Fee (1%): 10 SYL

Distribution:
- Operations: 5 SYL (50%)
- Burn: 2.5 SYL (25%)
- Donations: 2.5 SYL (25%)

Received: 990 SYL
```

---

## 🧪 Test Senaryoları

### Senaryo 1: Basit Alım-Satım
```javascript
// 1. Buy
Swap: 0.01 BNB → SYL
Expected: ~1,000 SYL (minus fee)

// 2. Sell
Swap: 1,000 SYL → BNB
Expected: ~0.0099 BNB (minus fee)
```

### Senaryo 2: Büyük Miktar (Price Impact)
```javascript
// Large buy
Swap: 0.1 BNB → SYL
Check: Price impact > 5%?

// Large sell
Swap: 10,000 SYL → BNB
Check: Price impact > 5%?
```

### Senaryo 3: Slippage Testi
```javascript
// Set slippage: 0.5%
Swap: 0.01 BNB → SYL
Expected: Transaction fails if price moves > 0.5%

// Set slippage: 5%
Swap: 0.01 BNB → SYL
Expected: Transaction succeeds
```

### Senaryo 4: Fee Exemption Testi
```javascript
// Exempt wallet swap
From: Exempt wallet
Swap: 1,000 SYL → BNB
Expected: No fee deducted

// Non-exempt wallet swap
From: Regular wallet
Swap: 1,000 SYL → BNB
Expected: 1% fee deducted
```

---

## 📊 Monitoring & Analytics

### PancakeSwap Analytics

**Pool Info:**
```
https://pancakeswap.finance/info/v2/pairs/[PAIR_ADDRESS]
```

**Kontrol Edilecekler:**
- Liquidity (TVL)
- Volume (24h)
- Transactions
- Price chart

### BSCScan Monitoring

**Token Holders:**
```
https://testnet.bscscan.com/token/0x2016Fd055810ef5e9F7C753c24ae4b2C2B414B9E#balances
```

**Transactions:**
```
https://testnet.bscscan.com/token/0x2016Fd055810ef5e9F7C753c24ae4b2C2B414B9E#tokenTrade
```

---

## 🛠️ Script ile Test

### Otomatik Trading Test Script

```javascript
// scripts/test-trading.js
const { ethers } = require("hardhat");

async function main() {
    const [owner] = await ethers.getSigners();
    
    // Contract addresses
    const TOKEN_ADDRESS = "0x2016Fd055810ef5e9F7C753c24ae4b2C2B414B9E";
    const ROUTER_ADDRESS = "0xD99D1c33F9fC3444f8101754aBC46c52416550D1"; // PancakeSwap Testnet Router
    const WBNB_ADDRESS = "0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd"; // WBNB Testnet
    
    // Get contracts
    const token = await ethers.getContractAt("SylvanToken", TOKEN_ADDRESS);
    const router = await ethers.getContractAt("IPancakeRouter02", ROUTER_ADDRESS);
    
    console.log("=== Trading Test Started ===\n");
    
    // 1. Approve router
    console.log("1. Approving router...");
    const approveAmount = ethers.utils.parseEther("1000000");
    await token.approve(ROUTER_ADDRESS, approveAmount);
    console.log("✅ Router approved\n");
    
    // 2. Add Liquidity
    console.log("2. Adding liquidity...");
    const tokenAmount = ethers.utils.parseEther("10000");
    const bnbAmount = ethers.utils.parseEther("0.1");
    
    await router.addLiquidityETH(
        TOKEN_ADDRESS,
        tokenAmount,
        0, // min token
        0, // min BNB
        owner.address,
        Date.now() + 1000 * 60 * 10, // 10 min deadline
        { value: bnbAmount }
    );
    console.log("✅ Liquidity added\n");
    
    // 3. Buy Test (BNB → SYL)
    console.log("3. Testing buy (BNB → SYL)...");
    const buyAmount = ethers.utils.parseEther("0.01");
    const path = [WBNB_ADDRESS, TOKEN_ADDRESS];
    
    const balanceBefore = await token.balanceOf(owner.address);
    
    await router.swapExactETHForTokens(
        0, // min tokens
        path,
        owner.address,
        Date.now() + 1000 * 60 * 10,
        { value: buyAmount }
    );
    
    const balanceAfter = await token.balanceOf(owner.address);
    const received = balanceAfter.sub(balanceBefore);
    
    console.log(`Spent: ${ethers.utils.formatEther(buyAmount)} BNB`);
    console.log(`Received: ${ethers.utils.formatEther(received)} SYL`);
    console.log("✅ Buy test completed\n");
    
    // 4. Sell Test (SYL → BNB)
    console.log("4. Testing sell (SYL → BNB)...");
    const sellAmount = ethers.utils.parseEther("1000");
    const pathReverse = [TOKEN_ADDRESS, WBNB_ADDRESS];
    
    const bnbBefore = await ethers.provider.getBalance(owner.address);
    
    await router.swapExactTokensForETH(
        sellAmount,
        0, // min BNB
        pathReverse,
        owner.address,
        Date.now() + 1000 * 60 * 10
    );
    
    const bnbAfter = await ethers.provider.getBalance(owner.address);
    const bnbReceived = bnbAfter.sub(bnbBefore);
    
    console.log(`Sold: ${ethers.utils.formatEther(sellAmount)} SYL`);
    console.log(`Received: ${ethers.utils.formatEther(bnbReceived)} BNB`);
    console.log("✅ Sell test completed\n");
    
    console.log("=== Trading Test Completed ===");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
```

**Çalıştırma:**
```bash
npx hardhat run scripts/test-trading.js --network bscTestnet
```

---

## ⚠️ Dikkat Edilecekler

### 1. Slippage Ayarı
- **Minimum:** 1% (fee nedeniyle)
- **Önerilen:** 2-3%
- **Yüksek volatilite:** 5%

### 2. Gas Fee
- Her işlem için yeterli BNB
- Approve: ~50,000 gas
- Swap: ~150,000 gas
- Add Liquidity: ~200,000 gas

### 3. Price Impact
- Küçük likidite = Yüksek impact
- İlk testlerde küçük miktarlar kullan
- %10'dan fazla impact'tan kaçın

### 4. Deadline
- Her işlem için deadline belirle
- Önerilen: 10-20 dakika
- Çok kısa = Transaction fail

---

## 📝 Test Checklist

### Likidite Havuzu
- [ ] Pool oluşturuldu
- [ ] BNB ve SYL eklendi
- [ ] LP token'ları alındı
- [ ] Pool PancakeSwap'te görünüyor

### Alım (Buy) Testi
- [ ] BNB → SYL swap başarılı
- [ ] Fee kesildi (1%)
- [ ] Doğru miktar alındı
- [ ] Transaction BSCScan'de görünüyor

### Satım (Sell) Testi
- [ ] SYL → BNB swap başarılı
- [ ] Fee kesildi (1%)
- [ ] Doğru miktar alındı
- [ ] Slippage toleransı yeterli

### Fee Dağılımı
- [ ] Operations wallet fee aldı (50%)
- [ ] Burn gerçekleşti (25%)
- [ ] Donations wallet fee aldı (25%)
- [ ] Toplam fee %1

### Exemption Testi
- [ ] Exempt wallet fee ödemedi
- [ ] Non-exempt wallet fee ödedi
- [ ] Exemption listesi çalışıyor

---

## 🎯 Başarı Kriterleri

### Teknik
- ✅ Tüm swap'lar başarılı
- ✅ Fee mekanizması çalışıyor
- ✅ Slippage toleransı uygun
- ✅ Gas kullanımı makul

### Fonksiyonel
- ✅ Alım-satım sorunsuz
- ✅ Fiyat hesaplaması doğru
- ✅ Likidite yeterli
- ✅ Price impact kabul edilebilir

### Güvenlik
- ✅ Reentrancy yok
- ✅ Fee bypass yok
- ✅ Unauthorized access yok
- ✅ Overflow/underflow yok

---

## 📞 Destek

**Sorun yaşarsanız:**
- BSCScan'de transaction'ı kontrol edin
- Error mesajını okuyun
- Slippage'ı artırın
- Gas limit'i artırın

**Yaygın Hatalar:**
- "Insufficient liquidity" → Daha fazla likidite ekleyin
- "Price impact too high" → Daha küçük miktar kullanın
- "Transaction failed" → Slippage'ı artırın
- "Insufficient BNB" → Testnet faucet'ten BNB alın

---

**Hazırlayan:** Sylvan Token Development Team  
**Tarih:** November 8, 2025-  
**Versiyon:** 1.0.0  
**Durum:** ✅ Test Ready
