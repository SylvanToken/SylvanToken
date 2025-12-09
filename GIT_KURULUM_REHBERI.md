# Git Kurulum ve GitHub Yükleme Rehberi

## 🎯 Hızlı Başlangıç

GitHub'a yüklemek için 2 seçeneğiniz var:

### Seçenek 1: GitHub Desktop (ÖNERİLEN - En Kolay) ⭐
### Seçenek 2: Git Command Line (Gelişmiş)

---

## 📦 Seçenek 1: GitHub Desktop (Önerilen)

### Adım 1: GitHub Desktop'ı İndir ve Yükle

1. **İndirme Linki:** https://desktop.github.com/
2. İndirilen dosyayı çalıştır
3. Kurulumu tamamla (varsayılan ayarlar ile)

### Adım 2: GitHub'a Giriş Yap

1. GitHub Desktop'ı aç
2. "Sign in to GitHub.com" tıkla
3. GitHub kullanıcı adı ve şifrenle giriş yap

### Adım 3: Repository'yi Ekle

1. **File** > **Add Local Repository** tıkla
2. **Choose...** butonuna tıkla
3. Proje klasörünü seç: `<proje-dizininiz>/SylvanToken`
4. **Add Repository** tıkla

Eğer "This directory does not appear to be a Git repository" hatası alırsan:
- **Create a repository** tıkla
- **Create Repository** butonuna tıkla

### Adım 4: Değişiklikleri Gözden Geçir

Sol panelde değişen dosyaları göreceksin.

**⚠️ ÖNEMLİ KONTROL:**
- `.env` dosyası listede **OLMAMALI**
- `node_modules/` klasörü listede **OLMAMALI**
- `artifacts/` klasörü listede **OLMAMALI**

Eğer bu dosyalar listede varsa, `.gitignore` dosyası çalışmıyor demektir.

### Adım 5: Commit Yap

1. Sol alttaki "Summary" kutusuna yaz:
   ```
   feat: Add testnet deployment and distribution
   ```

2. "Description" kutusuna (opsiyonel):
   ```
   - Deploy SylvanToken to BSC Testnet
   - Complete token distribution
   - Add comprehensive documentation
   - Security audit passed
   ```

3. **Commit to main** butonuna tıkla

### Adım 6: GitHub'a Yükle

1. Üstteki **Publish repository** butonuna tıkla
   (veya **Push origin** butonu varsa ona tıkla)

2. Repository ayarları:
   - **Name:** SylvanToken
   - **Description:** Production-ready BEP-20 token
   - **Keep this code private** işaretini kaldır (public yapmak için)
   - **Publish Repository** tıkla

3. Yükleme tamamlanınca "View on GitHub" tıkla

### Adım 7: GitHub'da Kontrol Et

1. Repository sayfası açılacak
2. Kontrol et:
   - ✅ README.md görünüyor mu?
   - ✅ contracts/ klasörü var mı?
   - ✅ test/ klasörü var mı?
   - ❌ `.env` dosyası YOK mu? (olmamalı!)
   - ❌ `node_modules/` YOK mu? (olmamalı!)

3. Search kutusuna `.env` yaz
   - Sonuç çıkmamalı (sadece .env.example olmalı)

---

## 💻 Seçenek 2: Git Command Line

### Adım 1: Git'i İndir ve Yükle

1. **İndirme Linki:** https://git-scm.com/download/win
2. İndirilen dosyayı çalıştır
3. Kurulum sırasında:
   - Varsayılan ayarları kullan
   - "Git from the command line and also from 3rd-party software" seç
   - "Use Windows' default console window" seç
4. Kurulumu tamamla
5. **PowerShell'i kapat ve yeniden aç** (önemli!)

### Adım 2: Git'i Doğrula

PowerShell'de çalıştır:
```powershell
git --version
```

Çıktı: `git version 2.x.x` görmelisin

### Adım 3: Git Yapılandırması

```powershell
# Kullanıcı adını ayarla
git config --global user.name "Adınız Soyadınız"

# Email'i ayarla
git config --global user.email "email@example.com"

# Kontrol et
git config --global user.name
git config --global user.email
```

### Adım 4: Güvenlik Kontrolü

```powershell
npm run security:check
```

Çıktı: `✅ ✅ ✅ GÜVENLIK KONTROLÜ BAŞARILI!` görmelisin

### Adım 5: Git Repository Başlat

```powershell
# Repository'yi başlat
git init

# Dosyaları ekle
git add .

# Durumu kontrol et
git status
```

**⚠️ ÖNEMLİ:** `.env` dosyası listede **OLMAMALI**

### Adım 6: Commit Yap

```powershell
git commit -m "feat: Add testnet deployment and distribution"
```

### Adım 7: GitHub Repository Oluştur

1. https://github.com/new adresine git
2. Repository adı: `SylvanToken`
3. Description: `Production-ready BEP-20 token with advanced vesting`
4. Public seç
5. **Create repository** tıkla

### Adım 8: Remote Ekle ve Push Yap

```powershell
# Remote repository ekle (URL'yi kendi repository'nizle değiştirin)
git remote add origin https://github.com/KULLANICI_ADINIZ/SylvanToken.git

# Branch'i main olarak ayarla
git branch -M main

# Push yap
git push -u origin main
```

**Not:** Kullanıcı adı ve şifre istenecek. Şifre yerine **Personal Access Token** kullanmanız gerekebilir.

### Adım 9: Personal Access Token Oluştur (Gerekirse)

1. https://github.com/settings/tokens adresine git
2. **Generate new token** > **Generate new token (classic)** tıkla
3. Note: `SylvanToken Upload`
4. Expiration: `90 days`
5. Scopes: `repo` işaretle
6. **Generate token** tıkla
7. Token'ı kopyala (bir daha göremezsin!)

Token ile push:
```powershell
git push https://TOKEN@github.com/KULLANICI_ADINIZ/SylvanToken.git main
```

---

## 🔍 Yükleme Sonrası Kontrol

### GitHub'da Kontrol Et

1. Repository'ye git: `https://github.com/KULLANICI_ADINIZ/SylvanToken`

2. **Dosya Kontrolü:**
   - ✅ README.md var
   - ✅ contracts/ var
   - ✅ test/ var
   - ✅ docs/ var
   - ❌ `.env` YOK (olmamalı!)
   - ❌ `node_modules/` YOK (olmamalı!)

3. **Search Kontrolü:**
   - Search kutusuna `DEPLOYER_PRIVATE_KEY` yaz
   - Sadece `.env.example` dosyasında olmalı
   - Gerçek key olmamalı!

4. **Güvenlik Kontrolü:**
   - Search kutusuna `.env` yaz
   - Sonuç çıkmamalı (sadece .env.example)

### Repository Ayarları

1. **Settings** > **Security** > **Code security and analysis**
   - Secret scanning: **Enable**
   - Dependabot alerts: **Enable**

2. **About** (sağ üstte)
   - Description ekle
   - Topics ekle: `blockchain`, `bsc`, `bep20`, `solidity`, `hardhat`
   - Website ekle (varsa)

---

## 🆘 Sorun Giderme

### Git bulunamadı hatası
```
Çözüm: Git'i yükleyin ve PowerShell'i yeniden başlatın
```

### .env dosyası listede görünüyor
```
Çözüm: 
1. .gitignore dosyasını kontrol edin
2. git rm --cached .env
3. git commit -m "Remove .env"
```

### Push authentication hatası
```
Çözüm: Personal Access Token kullanın
https://github.com/settings/tokens
```

### Remote repository hatası
```
Çözüm: GitHub'da repository oluşturun
https://github.com/new
```

### "fatal: not a git repository" hatası
```
Çözüm: git init komutunu çalıştırın
```

---

## 📋 Hızlı Komutlar

### Güvenlik Kontrolü
```powershell
npm run security:check
```

### Git Durumu
```powershell
git status
```

### Değişiklikleri Ekle
```powershell
git add .
```

### Commit Yap
```powershell
git commit -m "mesaj"
```

### Push Yap
```powershell
git push origin main
```

### Remote Kontrol
```powershell
git remote -v
```

---

## 🎯 Önerilen Yöntem

**Yeni başlıyorsanız:** GitHub Desktop kullanın (Seçenek 1)
- Görsel arayüz
- Kolay kullanım
- Hata yapma riski düşük

**Deneyimliyseniz:** Git Command Line kullanın (Seçenek 2)
- Daha fazla kontrol
- Otomasyona uygun
- Profesyonel workflow

---

## 📞 Yardım

### GitHub Desktop
- Dokümantasyon: https://docs.github.com/en/desktop
- Video Tutorial: https://www.youtube.com/results?search_query=github+desktop+tutorial

### Git Command Line
- Git Dokümantasyon: https://git-scm.com/doc
- Git Tutorial: https://www.atlassian.com/git/tutorials

### GitHub
- GitHub Guides: https://guides.github.com/
- GitHub Skills: https://skills.github.com/

---

**Hazırlayan:** Sylvan Token Geliştirme Ekibi  
**Tarih:** 8 Kasım 2025-  
**Durum:** Testnet deployment tamamlandı, GitHub'a yüklemeye hazır ✅
