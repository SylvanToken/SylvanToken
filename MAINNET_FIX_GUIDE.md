# 🔧 Mainnet Deployment Fix Guide

## Tespit Edilen Sorunlar

Mainnet deployment'ınızda aşağıdaki sorunlar tespit edildi:

### 1. ❌ Token Dağıtımı Eksik
- **Locked Reserve**: 0 SYL (300M olmalı)
- **Deployer'da kalan**: 836M SYL (536M olmalı)

### 2. ❌ Vesting Yapılmamış
- Admin wallet'lar için vesting schedule kurulmamış
- Locked reserve için vesting schedule kurulmamış

### 3. ⚠️ BSCScan'de Holder Görünmeme
- Holder'lar aslında var (7 holder)
- BSCScan henüz tam index etmemiş olabilir
- Contract verify edilmemiş olabilir

---

## 🚀 Hızlı Düzeltme (Önerilen)

Tüm adımları otomatik olarak çalıştırmak için:

```bash
npx hardhat run scripts/deployment/fix-mainnet-complete.js --network bscMainnet
```

Bu script şunları yapacak:
1. ✅ Admin wallet'lar için vesting schedule oluştur
2. ✅ Locked reserve için vesting schedule oluştur
3. ✅ 300M SYL'yi locked reserve'e transfer et
4. ✅ Güncellenmiş deployment raporu oluştur

**Süre:** ~5-10 dakika  
**Gas Maliyeti:** ~0.01-0.02 BNB

---

## 📝 Adım Adım Düzeltme (Manuel)

Eğer her adımı manuel kontrol etmek isterseniz:

### Adım 1: Vesting Schedule'ları Yapılandır

```bash
npx hardhat run scripts/deployment/fix-mainnet-step1-configure-vesting.js --network bscMainnet
```

Bu adım:
- Admin wallet'lar (MAD, LEB, CNK, KDR) için vesting schedule oluşturur
- Locked reserve için vesting schedule oluşturur
- Her admin için: 10M total (1M immediate + 9M vested over 18 months)
- Locked reserve: 300M vested over 34 months

**Beklenen Sonuç:**
- ✅ 4 admin wallet vesting configured
- ✅ Locked reserve vesting configured

---

### Adım 2: Locked Reserve'e Token Transfer Et

```bash
npx hardhat run scripts/deployment/fix-mainnet-step2-transfer-locked.js --network bscMainnet
```

Bu adım:
- Deployer'dan locked reserve'e 300M SYL transfer eder
- Transfer sonrası bakiyeleri doğrular

**Beklenen Sonuç:**
- ✅ Locked Reserve: 300M SYL
- ✅ Deployer: 536M SYL (836M - 300M)

---

### Adım 3: Raporları Güncelle

```bash
npx hardhat run scripts/deployment/fix-mainnet-step3-update-report.js --network bscMainnet
```

Bu adım:
- Güncel durumu analiz eder
- Yeni deployment raporu oluşturur
- Deployment JSON'ını günceller

**Beklenen Sonuç:**
- ✅ `BSC_MAINNET_DEPLOYMENT_CORRECTED_REPORT.md` oluşturuldu
- ✅ `deployments/mainnet-deployment.json` güncellendi

---

## 🔍 Düzeltme Sonrası Kontrol

Tüm adımlar tamamlandıktan sonra durumu kontrol edin:

```bash
npx hardhat run scripts/deployment/check-mainnet-status.js --network bscMainnet
```

### Beklenen Sonuçlar:

#### Token Dağılımı
- ✅ Deployer/Sylvan Token: 536M SYL
- ✅ Founder: 160M SYL
- ✅ Locked Reserve: 300M SYL
- ✅ MAD: 1M SYL
- ✅ LEB: 1M SYL
- ✅ CNK: 1M SYL
- ✅ KDR: 1M SYL
- **Total:** 1,000M SYL ✅

#### Vesting Status
- ✅ Admin wallets: 4/4 configured
- ✅ Locked reserve: Configured
- ✅ Total vested: 336M SYL (36M admin + 300M locked)

---

## 🔗 BSCScan'de Holder'ları Görme

Düzeltme sonrası holder'lar BSCScan'de görünmüyorsa:

### 1. Contract'ı Verify Edin

```bash
npx hardhat verify --network bscMainnet 0xc66404C3fa3E01378027b4A4411812D3a8D458F5
```

### 2. BSCScan'in Index Etmesini Bekleyin
- **Süre:** 10-15 dakika
- **Neden:** BSCScan yeni transaction'ları index etmeli

### 3. Doğru Sayfayı Kontrol Edin
- ❌ Contract sayfası: `https://bscscan.com/address/0xc66404C3fa3E01378027b4A4411812D3a8D458F5`
- ✅ Token tracker sayfası: `https://bscscan.com/token/0xc66404C3fa3E01378027b4A4411812D3a8D458F5`
- ✅ Holders sayfası: `https://bscscan.com/token/0xc66404C3fa3E01378027b4A4411812D3a8D458F5#balances`

### 4. Cache'i Temizleyin
- Browser cache'ini temizleyin
- Sayfayı yenileyin (Ctrl+F5)

---

## 📊 Beklenen Final Durum

### Token Distribution
| Wallet | Balance | Percentage |
|--------|---------|------------|
| Deployer/Sylvan Token | 536M SYL | 53.6% |
| Founder | 160M SYL | 16% |
| Locked Reserve | 300M SYL | 30% |
| MAD (immediate) | 1M SYL | 0.1% |
| LEB (immediate) | 1M SYL | 0.1% |
| CNK (immediate) | 1M SYL | 0.1% |
| KDR (immediate) | 1M SYL | 0.1% |
| **TOTAL** | **1,000M SYL** | **100%** |

### Vested Tokens (Contract'ta)
- Admin wallets: 36M SYL (9M × 4)
- Locked reserve: 300M SYL
- **Total vested:** 336M SYL

### Holders
- **Total holders:** 7
  1. Deployer/Sylvan Token
  2. Founder
  3. Locked Reserve
  4. MAD
  5. LEB
  6. CNK
  7. KDR

---

## ⚠️ Önemli Notlar

### Gas Ücretleri
- **Step 1 (Vesting Config):** ~0.005-0.01 BNB
- **Step 2 (Transfer):** ~0.002-0.005 BNB
- **Step 3 (Report):** Ücretsiz (sadece okuma)
- **TOPLAM:** ~0.01-0.02 BNB

### Güvenlik
- ✅ Tüm işlemler owner tarafından yapılmalı
- ✅ Private key'i güvende tutun
- ✅ Her adımdan sonra kontrol edin
- ✅ Şüphe duyarsanız durdurun ve kontrol edin

### Geri Alınamaz İşlemler
- ❌ Vesting schedule oluşturulduktan sonra değiştirilemez
- ❌ Token transfer'i geri alınamaz
- ✅ Ancak tüm işlemler planlanan dağıtıma uygun

---

## 🆘 Sorun Giderme

### "Insufficient balance" Hatası
**Neden:** Deployer'da yeterli token yok  
**Çözüm:** Deployer'da en az 300M SYL olmalı

### "Already configured" Hatası
**Neden:** Vesting zaten yapılandırılmış  
**Çözüm:** Step 2'ye geçin, sorun yok

### "Transaction failed" Hatası
**Neden:** Gas yetersiz veya network sorunu  
**Çözüm:** 
1. BNB bakiyenizi kontrol edin (min 0.02 BNB)
2. Network bağlantısını kontrol edin
3. Tekrar deneyin

### BSCScan'de Holder Görünmüyor
**Çözüm:**
1. 15 dakika bekleyin
2. Contract'ı verify edin
3. Token tracker sayfasını kontrol edin
4. Cache'i temizleyin

---

## 📞 Destek

Sorun yaşarsanız:

1. **Kontrol Script'ini Çalıştırın:**
   ```bash
   npx hardhat run scripts/deployment/check-mainnet-status.js --network bscMainnet
   ```

2. **Logları Kaydedin:**
   - Tüm script çıktılarını kaydedin
   - Hata mesajlarını not edin

3. **BSCScan'i Kontrol Edin:**
   - Transaction'ları kontrol edin
   - Contract durumunu kontrol edin

---

## ✅ Başarı Kriterleri

Düzeltme başarılı sayılır eğer:

- ✅ Locked Reserve: 300M SYL
- ✅ Admin vesting: 4/4 configured
- ✅ Locked vesting: Configured
- ✅ Total supply: 1,000M SYL
- ✅ Total distributed: 1,000M SYL
- ✅ Holders: 7

---

**Son Güncelleme:** ${new Date().toISOString().split('T')[0]}  
**Versiyon:** 1.0.0
