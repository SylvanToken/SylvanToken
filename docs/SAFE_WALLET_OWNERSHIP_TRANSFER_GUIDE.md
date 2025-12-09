# 🔐 Safe Wallet'a Kilit Açma Yetkisi Verme Rehberi

**Tarih:** December 9, 2025  
**Durum:** Hazır  
**Ağ:** BSC Mainnet

---

## 📋 Özet

Bu rehber, SylvanToken kontratının sahipliğini Safe Multisig Wallet'a transfer ederek kilit açma yetkisinin nasıl verileceğini açıklar.

---

## 🎯 Mevcut Durum

| Parametre | Değer |
|-----------|-------|
| **Kontrat Adresi** | `0x50FfD5b14a1b4CDb2EA29fC61bdf5EB698f72e85` |
| **Mevcut Owner** | `0x465b54282e4885f61df7eB7CcDc2493DB35C9501` (Founder) |
| **Hedef Owner** | `0xC5CcDC8F01739CeD02B30b5aD10DD5Fb201436bB` (Safe Wallet) |

---

## 🔄 Transfer Sonrası Yetkiler

### Safe Wallet'ın Kazanacağı Yetkiler:

| Fonksiyon | Açıklama | Kullanım |
|-----------|----------|----------|
| `processInitialRelease(address)` | Admin için %10 ilk serbest bırakma | Bir kerelik |
| `processMonthlyRelease(address)` | Admin için aylık %5 serbest bırakma | Her ay |
| `processLockedWalletRelease(address)` | Kilitli rezerv için aylık %3 | Her ay |
| `addExemptWallet(address)` | Ücret muafiyeti ekle | Gerektiğinde |
| `removeExemptWallet(address)` | Ücret muafiyeti kaldır | Gerektiğinde |
| `setAMMPair(address,bool)` | AMM çifti ayarla | DEX eklerken |
| `transferOwnership(address)` | Sahipliği transfer et | ⚠️ Dikkatli! |

---

## 📝 Yöntem 1: BSCScan Üzerinden Manuel Transfer

### Adım 1: BSCScan'e Git
```
https://bscscan.com/address/0x50FfD5b14a1b4CDb2EA29fC61bdf5EB698f72e85#writeContract
```

### Adım 2: Cüzdan Bağla
- "Connect to Web3" butonuna tıkla
- **Owner Wallet** ile bağlan: `0x465b54282e4885f61df7eB7CcDc2493DB35C9501`

### Adım 3: transferOwnership Fonksiyonunu Bul
- Fonksiyon listesinde `transferOwnership` bul
- Genişletmek için tıkla

### Adım 4: Yeni Owner Adresini Gir
```
newOwner (address): 0xC5CcDC8F01739CeD02B30b5aD10DD5Fb201436bB
```

### Adım 5: İşlemi Onayla
- "Write" butonuna tıkla
- Cüzdanda işlemi onayla
- Gas ücreti: ~0.0001 BNB

### Adım 6: Doğrula
```
https://bscscan.com/address/0x50FfD5b14a1b4CDb2EA29fC61bdf5EB698f72e85#readContract
```
- `owner` fonksiyonunu çağır
- Sonuç Safe adresi olmalı: `0xC5CcDC8F01739CeD02B30b5aD10DD5Fb201436bB`

---

## 📝 Yöntem 2: Script ile Transfer

### Adım 1: Script'i Düzenle
`scripts/management/transfer-ownership-to-safe.js` dosyasında yorum satırlarını kaldır:

```javascript
// Bu satırları aktif et (/* ve */ işaretlerini kaldır):

console.log("\n🚀 Initiating ownership transfer...");

const tx = await token.transferOwnership(SAFE_WALLET);
console.log(`   Transaction hash: ${tx.hash}`);
console.log("   Waiting for confirmation...");

await tx.wait();

// ... devamı
```

### Adım 2: Script'i Çalıştır
```bash
npx hardhat run scripts/management/transfer-ownership-to-safe.js --network bscMainnet
```

### Adım 3: Sonucu Kontrol Et
```
✅ Ownership transferred successfully!
   New Owner: 0xC5CcDC8F01739CeD02B30b5aD10DD5Fb201436bB
```

---

## ✅ Transfer Sonrası Kontrol Listesi

- [ ] BSCScan'de owner değişti mi kontrol et
- [ ] Safe Wallet'tan bir read fonksiyonu test et
- [ ] İmzacıların Safe'e erişimi var mı kontrol et
- [ ] İlk test işlemi yap (örn: getVestingInfo çağır)

---

## 🔐 Safe Wallet'tan Kilit Açma İşlemi

### Transfer sonrası aylık kilit açma:

1. **Safe App'i Aç**
   ```
   https://app.safe.global/home?safe=bnb:0xC5CcDC8F01739CeD02B30b5aD10DD5Fb201436bB
   ```

2. **Transaction Builder'ı Aç**
   - Apps → Transaction Builder

3. **İşlem Oluştur**
   ```
   Contract: 0x50FfD5b14a1b4CDb2EA29fC61bdf5EB698f72e85
   Function: processMonthlyRelease
   Parameter: [admin adresi]
   ```

4. **İmza Topla**
   - İmzacı 1 onaylar ✅
   - İmzacı 2 onaylar ✅

5. **Execute Et**
   - 2/3 imza tamamlandığında execute

---

## 👥 İmzacılar

| # | İsim | Adres | Rol |
|---|------|-------|-----|
| 1 | Deployer | `0xf949f50B3C32bD4cDa7D2192ff8f51dd9db4A469` | İmzacı |
| 2 | Owner | `0x465b54282e4885f61df7eB7CcDc2493DB35C9501` | İmzacı |
| 3 | Admin BRK | `0x1109B6aDB60dB170139f00bA2490fCA0F8BE7A8C` | İmzacı |

**Eşik:** 2/3 (Herhangi 2 imza yeterli)

---

## ⚠️ Önemli Uyarılar

1. **GERİ ALINAMAZ:** Sahiplik transferi geri alınamaz!
2. **Safe Hazır Olmalı:** Transfer öncesi Safe'in düzgün yapılandırıldığından emin ol
3. **İmzacılar Aktif:** Tüm imzacıların cüzdanlarına erişimi olmalı
4. **Test Et:** Transfer sonrası hemen bir test işlemi yap

---

## 📊 Transfer Öncesi/Sonrası Karşılaştırma

| Özellik | Transfer Öncesi | Transfer Sonrası |
|---------|-----------------|------------------|
| Owner | Founder Wallet | Safe Multisig |
| Kilit Açma | Tek imza | 2/3 imza |
| Güvenlik | Orta | Yüksek |
| Merkeziyetsizlik | Düşük | Yüksek |

---

## 📞 Destek

- **BSCScan:** https://bscscan.com/address/0x50FfD5b14a1b4CDb2EA29fC61bdf5EB698f72e85
- **Safe App:** https://app.safe.global

---

**Belge Durumu:** ✅ Aktif  
**Son Güncelleme:** December 9, 2025
