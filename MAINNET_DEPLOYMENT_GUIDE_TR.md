# 🚀 Mainnet Deployment Rehberi (Türkçe)

**Tarih:** 10 Kasım 2025  
**Durum:** Hazırlık Aşaması  
**Hedef Network:** BSC Mainnet (Chain ID: 56)

---

## 📋 Gerekli Bilgiler

Mainnet deployment'a başlamadan önce aşağıdaki bilgileri hazırlamanız gerekiyor:

### 1. Cüzdan Adresleri

#### Ana Dağıtım Cüzdanları
- **Founder Cüzdanı:** (160M SYL - %16)
- **Sylvan Token Cüzdanı:** (500M SYL - %50)

#### Admin Cüzdanları (Her biri 10M SYL - %4)
- **MAD Cüzdanı:** (10M SYL + vesting)
- **LEB Cüzdanı:** (10M SYL + vesting)
- **CNK Cüzdanı:** (10M SYL + vesting)
- **KDR Cüzdanı:** (10M SYL + vesting)

#### Kilitli Reserve Cüzdanı
- **Locked Reserve:** (300M SYL - %30, 34 aylık vesting)

#### Sistem Cüzdanları
- **Fee Collection Cüzdanı:** (Fee'lerin %50'si)
- **Donations Cüzdanı:** (Fee'lerin %25'i)
- **Burn Adresi:** 0x000000000000000000000000000000000000dEaD (Fee'lerin %25'i)

### 2. API Keys

#### BSC Mainnet RPC
- **RPC URL:** (örn: https://bsc-dataseed.binance.org/)
- **Yedek RPC:** (İkinci bir RPC endpoint)

#### BSCScan API
- **API Key:** (Contract verification için)
- **Hesap:** (BSCScan hesap email'i)

### 3. Deployer Cüzdanı

- **Private Key:** (Deployment yapacak cüzdan)
- **BNB Bakiyesi:** Minimum 0.15 BNB (~$45)
  - Contract deployment: ~0.091 BNB
  - İlk işlemler: ~0.05 BNB
  - Yedek: ~0.009 BNB

---

## 🔧 Hazırlık Adımları

### Adım 1: Bilgileri Toplama

Yukarıdaki tüm bilgileri bir yere not edin:
- Tüm cüzdan adreslerini
- API key'leri
- Private key'i (GÜVENLİ bir yerde!)

### Adım 2: Konfigürasyon Dosyalarını Güncelleme

Ben size hazır script'ler vereceğim, siz sadece şu bilgileri sağlayın:

1. **Tüm cüzdan adresleri** (yukarıdaki listeden)
2. **BSCScan API Key**
3. **Deployer Private Key** (deployment sırasında)
4. **BSC Mainnet RPC URL** (opsiyonel, default kullanabiliriz)

### Adım 3: BNB Hazırlama

Deployer cüzdanınızda minimum **0.15 BNB** olmalı:
- Contract deployment: ~0.091 BNB (~$27)
- Configuration: ~0.03 BNB (~$9)
- Distribution: ~0.02 BNB (~$6)
- Yedek: ~0.009 BNB (~$3)

---

## 🚀 Deployment Süreci

### Deployment ne kadar sürer?

Toplam süre: **Yaklaşık 2-3 saat**
- Hazırlık: 30 dakika
- Deployment: 1.5 saat
- Verification: 30 dakika
- Test: 30 dakika

### Deployment adımları:

1. **Contract Deploy** (15 dakika)
   - SylvanToken contract'ı BSC Mainnet'e deploy edilir
   - Contract adresi alınır
   - BSCScan'de verify edilir

2. **Configuration** (30 dakika)
   - Admin cüzdanları configure edilir
   - Locked reserve configure edilir
   - İlk release'ler işlenir (%20 admin'lere)

3. **Distribution** (20 dakika)
   - Founder'a 160M SYL gönderilir
   - Sylvan Token wallet'a 500M SYL gönderilir

4. **Fee Exemptions** (10 dakika)
   - Tüm sistem cüzdanları fee exempt yapılır
   - Owner, founder, admin'ler exempt olur

5. **Verification** (30 dakika)
   - Tüm bakiyeler kontrol edilir
   - Vesting schedule'lar doğrulanır
   - Fee mekanizması test edilir

---

## 💰 Maliyet Tahmini

### Toplam Maliyet: ~0.15 BNB (~$45)

Detaylı maliyet:
- Contract deployment: 0.091 BNB (~$27)
- Configuration (4 admin + 1 locked): 0.03 BNB (~$9)
- Distribution (2 transfer): 0.02 BNB (~$6)
- Exemptions (10 wallet): 0.009 BNB (~$3)

**Not:** Gas fiyatları değişkendir, bu tahminlerdir.

---

## ✅ Deployment Checklist

### Deployment Öncesi
- [ ] Tüm cüzdan adresleri hazır
- [ ] BSCScan API key hazır
- [ ] Deployer cüzdanında 0.15+ BNB var
- [ ] Private key güvenli bir yerde
- [ ] Testnet'te başarılı test yapıldı
- [ ] Tüm team üyeleri hazır

### Deployment Sırasında
- [ ] Contract başarıyla deploy edildi
- [ ] Contract BSCScan'de verify edildi
- [ ] Admin cüzdanları configure edildi
- [ ] Locked reserve configure edildi
- [ ] Token distribution tamamlandı
- [ ] Fee exemptions ayarlandı

### Deployment Sonrası
- [ ] Tüm bakiyeler doğru
- [ ] Vesting schedule'lar çalışıyor
- [ ] Fee mekanizması çalışıyor
- [ ] Contract adresi kaydedildi
- [ ] Dokümantasyon güncellendi

---

## 🎯 Sonraki Adımlar

### Hemen Sonra (1. Gün)
1. Contract adresini kaydet
2. Tüm transaction hash'leri kaydet
3. Monitoring sistemini kur
4. İlk testleri yap

### Kısa Vadede (1. Hafta)
1. Trading'i aktif et (hazır olunca)
2. Community'ye duyur
3. Exchange listing'leri başlat
4. Monitoring'i sürekli kontrol et

### Uzun Vadede (1. Ay+)
1. Bug bounty programı başlat
2. Düzenli audit'ler yap
3. Community feedback topla
4. Roadmap'i takip et

---

## 🚨 Önemli Uyarılar

### GÜVENLİK
- ⚠️ **ASLA private key'i paylaşma!**
- ⚠️ **Tüm adresleri iki kez kontrol et!**
- ⚠️ **Testnet'te önce test et!**
- ⚠️ **Backup'larını al!**
- ⚠️ **Her şeyi dokümante et!**

### DEPLOYMENT
- ⚠️ Mainnet deployment **GERİ ALINAMAZ**
- ⚠️ Yanlış adrese gönderilen token **GERİ GELMİYOR**
- ⚠️ Contract deploy edildikten sonra **DEĞİŞTİRİLEMEZ**
- ⚠️ Tüm işlemler **GERÇEK BNB** harcar

---

## 📞 Destek

Deployment sırasında sorun yaşarsanız:

1. **DURAKLIN** - Panik yapmayın
2. **HATAYI KAYDET** - Screenshot alın
3. **TRANSACTION HASH** - Varsa kaydedin
4. **BENİ BİLGİLENDİRİN** - Sorunu açıklayın

---

## ✨ Hazır mısınız?

Deployment'a başlamak için bana şunları verin:

### 1. Cüzdan Adresleri
```
Founder: 0x...
Sylvan Token: 0x...
MAD: 0x...
LEB: 0x...
CNK: 0x...
KDR: 0x...
Locked Reserve: 0x...
Fee Collection: 0x...
Donations: 0x...
```

### 2. API Keys
```
BSCScan API Key: ...
RPC URL: ... (opsiyonel)
```

### 3. Deployer Info
```
Deployer Address: 0x...
BNB Balance: ... BNB
Private Key: ... (deployment sırasında)
```

---

**Hazır olduğunuzda bana "HAZIR" yazın ve bilgileri verin!** 🚀

**Durum:** ⏳ Bilgilerinizi bekliyorum  
**Versiyon:** 1.0.0  
**Son Güncelleme:** 10 Kasım 2025

