# 🎨 BSCScan Token Logo Ekleme Rehberi

## 📋 Gereksinimler

### Logo Özellikleri
- **Format:** PNG (şeffaf arka plan)
- **Boyut:** 256x256 piksel (önerilen) veya 200x200 piksel (minimum)
- **Dosya Boyutu:** Maksimum 100 KB
- **Kalite:** Yüksek çözünürlük, net görüntü
- **Arka Plan:** Şeffaf (transparent)

### Hazırlık
1. ✅ Token contract'ı deploy edilmiş olmalı
2. ✅ Contract address: `0xc66404C3fa3E01378027b4A4411812D3a8D458F5`
3. ✅ Logo dosyası hazır olmalı

---

## 🎯 Yöntem 1: BSCScan Token Update Form (ÖNERİLEN)

### Adım 1: BSCScan Token Update Sayfasına Gidin
```
https://bscscan.com/tokenupdate
```

### Adım 2: Formu Doldurun

**Token Contract Address:**
```
0xc66404C3fa3E01378027b4A4411812D3a8D458F5
```

**Token Project Name:**
```
Sylvan Token
```

**Token Symbol:**
```
SYL
```

**Official Email Address:**
```
contact@sylvantoken.org
```
(Veya projenizin resmi email adresi)

**Official Website:**
```
https://www.sylvantoken.org
```

**Official Project Logo:**
- "Choose File" butonuna tıklayın
- Logo dosyanızı seçin (PNG, 256x256, şeffaf arka plan)

**Project Description:**
```
Sylvan Token (SYL) is an advanced BEP-20 token on Binance Smart Chain featuring:
- 1% transaction fee (50% operations, 25% donations, 25% burn)
- Advanced vesting system with proportional burning
- Secure and gas-optimized smart contracts
- Community-driven environmental initiatives

Total Supply: 1,000,000,000 SYL
```

**Project Sector:**
```
DeFi / Environmental / Charity
```

**Social Media Links:**
- **Twitter:** https://x.com/SylvanToken
- **Telegram:** https://t.me/sylvantoken
- **GitHub:** https://github.com/[your-github]/sylvan-token

**Additional Information:**
```
Sylvan Token is deployed on BSC Mainnet with comprehensive security audits and 95%+ test coverage. The token features an innovative vesting mechanism with proportional burning to support long-term sustainability.
```

### Adım 3: Doğrulama
- CAPTCHA'yı tamamlayın
- "Update" butonuna tıklayın

### Adım 4: Email Doğrulama
- BSCScan size bir doğrulama emaili gönderecek
- Email'deki linke tıklayarak doğrulayın

### Adım 5: Onay Bekleyin
- BSCScan team başvurunuzu inceleyecek (1-7 gün)
- Onaylandığında logo BSCScan'de görünecek

---

## 🎯 Yöntem 2: GitHub Pull Request (Alternatif)

BSCScan, Trust Wallet'ın asset repository'sini kullanır.

### Adım 1: Trust Wallet Assets Repository'yi Fork Edin
```
https://github.com/trustwallet/assets
```

### Adım 2: Logo Dosyasını Hazırlayın
```
Dosya Adı: logo.png
Boyut: 256x256 piksel
Format: PNG (şeffaf arka plan)
Maksimum: 100 KB
```

### Adım 3: Doğru Klasöre Ekleyin
```
assets/blockchains/smartchain/assets/0xc66404C3fa3E01378027b4A4411812D3a8D458F5/logo.png
```

**Klasör Yapısı:**
```
assets/
└── blockchains/
    └── smartchain/
        └── assets/
            └── 0xc66404C3fa3E01378027b4A4411812D3a8D458F5/
                ├── logo.png
                └── info.json
```

### Adım 4: info.json Dosyası Oluşturun
```json
{
  "name": "Sylvan Token",
  "type": "BEP20",
  "symbol": "SYL",
  "decimals": 18,
  "website": "https://www.sylvantoken.org",
  "description": "Advanced BEP-20 token with vesting and environmental focus",
  "explorer": "https://bscscan.com/token/0xc66404C3fa3E01378027b4A4411812D3a8D458F5",
  "status": "active",
  "id": "0xc66404C3fa3E01378027b4A4411812D3a8D458F5",
  "links": [
    {
      "name": "twitter",
      "url": "https://x.com/SylvanToken"
    },
    {
      "name": "telegram",
      "url": "https://t.me/sylvantoken"
    },
    {
      "name": "github",
      "url": "https://github.com/[your-repo]"
    }
  ],
  "tags": [
    "defi",
    "environmental",
    "charity"
  ]
}
```

### Adım 5: Pull Request Oluşturun
1. Değişiklikleri commit edin
2. GitHub'da Pull Request açın
3. Trust Wallet team inceleyecek
4. Onaylandığında logo otomatik olarak BSCScan'de görünecek

---

## 🎨 Logo Hazırlama İpuçları

### Tasarım Önerileri
1. **Basit ve Tanınabilir:** Küçük boyutlarda bile net görünmeli
2. **Şeffaf Arka Plan:** PNG formatında alpha channel kullanın
3. **Merkezi Yerleşim:** Logo merkezde, kenarlardan boşluk bırakın
4. **Yüksek Kontrast:** Hem açık hem koyu temalarda görünür olmalı
5. **Marka Tutarlılığı:** Diğer platformlardaki logonuzla aynı olmalı

### Teknik Gereksinimler
```
Format: PNG
Boyut: 256x256 piksel (önerilen)
Minimum: 200x200 piksel
Maksimum Dosya: 100 KB
Renk Modu: RGB
Arka Plan: Şeffaf (Alpha Channel)
```

### Logo Optimizasyonu
Dosya boyutunu küçültmek için:
```bash
# TinyPNG kullanın (online)
https://tinypng.com/

# Veya ImageMagick (command line)
magick convert logo.png -resize 256x256 -quality 95 logo-optimized.png
```

---

## 📊 Logo Görünme Süreleri

### BSCScan Token Update Form
- **Başvuru:** Anında
- **Email Doğrulama:** 5-10 dakika
- **İnceleme:** 1-7 gün
- **Yayınlanma:** Onay sonrası anında

### GitHub Pull Request
- **PR Oluşturma:** Anında
- **İnceleme:** 3-14 gün
- **Merge:** İnceleme sonrası
- **Yayınlanma:** Merge sonrası 24 saat içinde

---

## ✅ Kontrol Listesi

### Başvuru Öncesi
- [ ] Logo hazır (PNG, 256x256, şeffaf)
- [ ] Dosya boyutu 100 KB'dan küçük
- [ ] Contract address doğru
- [ ] Resmi email adresi hazır
- [ ] Website aktif
- [ ] Social media linkleri hazır

### Başvuru Sonrası
- [ ] Email doğrulaması yapıldı
- [ ] BSCScan'den onay bekleniyor
- [ ] Logo görünüyor mu kontrol et

---

## 🔍 Sorun Giderme

### Logo Görünmüyor
1. **Bekleyin:** Onay süreci 1-7 gün sürebilir
2. **Email Kontrol:** Doğrulama emailini kontrol edin
3. **Dosya Boyutu:** 100 KB'dan küçük olduğundan emin olun
4. **Format:** PNG ve şeffaf arka plan olmalı

### Başvuru Reddedildi
1. **Logo Kalitesi:** Daha yüksek çözünürlük deneyin
2. **Dosya Boyutu:** Optimize edin
3. **Bilgiler:** Tüm bilgilerin doğru olduğundan emin olun
4. **Tekrar Deneyin:** Düzeltmelerle yeniden başvurun

---

## 📞 Destek

### BSCScan Support
- **Email:** support@bscscan.com
- **Form:** https://bscscan.com/contactus
- **Konu:** "Token Logo Update Request"

### Trust Wallet Support
- **GitHub:** https://github.com/trustwallet/assets/issues
- **Discord:** https://discord.gg/trustwallet

---

## 🎯 Hızlı Başlangıç

1. Logo hazırlayın (PNG, 256x256, şeffaf)
2. https://bscscan.com/tokenupdate adresine gidin
3. Formu doldurun
4. Email doğrulaması yapın
5. 1-7 gün içinde onay bekleyin

**Başarılar!** 🚀

---

**Son Güncelleme:** November 10, 2025
**Contract Address:** 0xc66404C3fa3E01378027b4A4411812D3a8D458F5
