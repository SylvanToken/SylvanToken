# Sylvan Token Logo Kullanım Rehberi

**Tarih:** 9 Kasım 2025  
**Versiyon:** 1.0

---

## 📁 Logo Dosyası

### Ana Logo
- **Dosya:** `assets/images/sylvan-token-logo.png`
- **Boyut:** Orijinal yüksek çözünürlük
- **Format:** PNG (şeffaf arka plan)
- **Kullanım:** Tüm resmi materyaller

---

## 🎨 Logo Özellikleri

### Tasarım Konsepti
Logo, Sylvan Token'ın misyonunu ve değerlerini yansıtır:

1. **Dairesel Akış (Mavi-Yeşil Gradyan)**
   - Sürdürülebilir ekosistem
   - Token dolaşımı
   - Doğal döngüler

2. **Geometrik Elmas Deseni**
   - Blockchain yapısı
   - Dijital varlık
   - Hassasiyet ve değer

3. **S Harfi**
   - Sylvan kimliği
   - Modern tasarım
   - Marka tanınırlığı

### Renk Paleti

#### Mavi Tonları (Teknoloji)
- **Açık Mavi:** `#00B4D8` - Cyan/Turquoise
- **Orta Mavi:** `#0096C7` - Sky Blue
- **Koyu Mavi:** `#0077B6` - Deep Blue

#### Yeşil Tonları (Doğa)
- **Açık Yeşil:** `#52B788` - Forest Green
- **Orta Yeşil:** `#40916C` - Sea Green
- **Koyu Yeşil:** `#2D6A4F` - Dark Green

---

## 📐 Logo Boyutları

### Gerekli Boyutlar

1. **Orijinal (Yüksek Çözünürlük)**
   - Boyut: 1024x1024px veya daha büyük
   - Kullanım: Baskı, büyük formatlar
   - Dosya: `sylvan-token-logo.png`

2. **Web Büyük**
   - Boyut: 512x512px
   - Kullanım: Website header, social media
   - Dosya: `sylvan-token-logo-512.png`

3. **Web Orta**
   - Boyut: 256x256px
   - Kullanım: Dokümantasyon, küçük görseller
   - Dosya: `sylvan-token-logo-256.png`

4. **İkon**
   - Boyut: 128x128px
   - Kullanım: Uygulama ikonları
   - Dosya: `sylvan-token-logo-128.png`

5. **Favicon**
   - Boyutlar: 32x32px, 16x16px
   - Format: ICO
   - Dosya: `favicon.ico`

---

## 📝 Kullanım Alanları

### 1. README.md (Proje Ana Sayfası)

```markdown
<div align="center">
  <img src="assets/images/sylvan-token-logo.png" alt="Sylvan Token Logo" width="200"/>
  
  # 🌳 Sylvan Token (SYL)
</div>
```

**Eklendi:** ✅

### 2. WHITEPAPER.md

```markdown
<div align="center">
  <img src="assets/images/sylvan-token-logo.png" alt="Sylvan Token Logo" width="180"/>
  
  # 🌳 Sylvan Token Whitepaper
</div>
```

**Eklendi:** ✅

### 3. Web Sayfası (HTML)

```html
<div class="logo">
  <img src="../assets/images/sylvan-token-logo.png" 
       alt="Sylvan Token Logo" 
       style="width: 120px; height: 120px;">
</div>
```

**Eklendi:** ✅

### 4. Dokümantasyon Dosyaları

```markdown
![Sylvan Token](../assets/images/sylvan-token-logo.png)
```

**Eklenecek:** docs/ klasöründeki dosyalar

### 5. GitHub Repository

#### Social Preview
- Settings > Options > Social preview
- Boyut: 1280x640px
- Logo + Arka plan tasarımı

#### Repository Icon
- Settings > Options > Repository icon
- Boyut: 256x256px

### 6. Package.json (npm)

```json
{
  "icon": "assets/images/sylvan-token-logo-256.png"
}
```

### 7. Favicon (Website)

```html
<link rel="icon" type="image/x-icon" href="assets/images/favicon.ico">
<link rel="icon" type="image/png" sizes="32x32" href="assets/images/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="assets/images/favicon-16x16.png">
```

---

## ✅ Yapılması Gerekenler

### Logo Dosyalarını Oluştur

1. **Ana Logo Kaydet**
   ```
   assets/images/sylvan-token-logo.png
   ```
   - Orijinal yüksek çözünürlük PNG
   - Şeffaf arka plan

2. **Farklı Boyutlar Oluştur**
   ```bash
   # ImageMagick veya online tool kullanarak:
   - sylvan-token-logo-512.png (512x512)
   - sylvan-token-logo-256.png (256x256)
   - sylvan-token-logo-128.png (128x128)
   ```

3. **Favicon Oluştur**
   ```bash
   # Online favicon generator kullan:
   - favicon.ico (32x32, 16x16)
   - favicon-32x32.png
   - favicon-16x16.png
   ```

### Dosyalara Ekle

- [x] README.md
- [x] WHITEPAPER.md
- [x] project-analysis-web/index.html
- [ ] docs/DOCUMENTATION_INDEX.md
- [ ] docs/API_REFERENCE.md
- [ ] CONTRIBUTING.md
- [ ] ROADMAP.md

---

## 🎯 Kullanım Kuralları

### Yapılması Gerekenler ✅

1. **Oran Koru**
   - Her zaman 1:1 aspect ratio
   - Deforme etme veya uzatma

2. **Minimum Boyut**
   - En az 32x32px kullan
   - Daha küçük boyutlarda okunabilirlik azalır

3. **Arka Plan**
   - Beyaz arka planda kullanılabilir
   - Koyu arka planda kullanılabilir
   - Şeffaf PNG formatı tercih et

4. **Format**
   - PNG (şeffaf arka plan için)
   - SVG (vektör format varsa)
   - ICO (favicon için)

### Yapılmaması Gerekenler ❌

1. **Deformasyon**
   - Logoyu uzatma veya sıkıştırma
   - Perspektif değiştirme

2. **Renk Değişikliği**
   - Orijinal renkleri değiştirme
   - Filtre veya efekt ekleme

3. **Düşük Çözünürlük**
   - Bulanık veya pixelated görüntü
   - Düşük kalite JPEG

4. **Ek Elementler**
   - Logo üzerine yazı ekleme
   - Çerçeve veya border ekleme

---

## 🔧 Logo Oluşturma Araçları

### Online Araçlar

1. **Favicon Generator**
   - https://favicon.io/
   - https://realfavicongenerator.net/

2. **Image Resizer**
   - https://imageresizer.com/
   - https://www.iloveimg.com/resize-image

3. **PNG Optimizer**
   - https://tinypng.com/
   - https://compressor.io/

### Desktop Araçlar

1. **Adobe Photoshop**
   - Professional editing
   - Batch resize

2. **GIMP (Free)**
   - Open source alternative
   - Full featured

3. **ImageMagick (CLI)**
   ```bash
   # Resize command
   convert sylvan-token-logo.png -resize 512x512 sylvan-token-logo-512.png
   ```

---

## 📊 Logo Kullanım İstatistikleri

### Mevcut Kullanım
- ✅ README.md (200px)
- ✅ WHITEPAPER.md (180px)
- ✅ Web sayfası (120px)

### Planlanan Kullanım
- ⏳ GitHub social preview
- ⏳ Favicon
- ⏳ Dokümantasyon dosyaları
- ⏳ npm package icon

---

## 📞 Destek

Logo kullanımı ile ilgili sorularınız için:
- GitHub Issues: https://github.com/SylvanToken/sylvan-token/issues
- Email: design@sylvantoken.org

---

## 📄 Lisans

Sylvan Token logosu telif hakkı koruması altındadır. Kullanım, resmi Sylvan Token proje materyalleri ve yetkili ortaklarla sınırlıdır.

---

**Son Güncelleme:** 9 Kasım 2025  
**Hazırlayan:** Kiro AI  
**Durum:** ✅ Aktif Kullanımda
