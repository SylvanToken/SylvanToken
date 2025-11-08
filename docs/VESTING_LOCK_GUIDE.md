# 🔒 Vesting Lock Mekanizması - Kullanım Kılavuzu

**Versiyon:** 1.0  
**Tarih:** 8 Kasım 2025  
**Contract:** SylvanToken

---

## 📋 İçindekiler

1. [Genel Bakış](#genel-bakış)
2. [Nasıl Çalışır](#nasıl-çalışır)
3. [Kullanım Örnekleri](#kullanım-örnekleri)
4. [Güvenlik](#güvenlik)
5. [Sık Sorulan Sorular](#sık-sorulan-sorular)
6. [Troubleshooting](#troubleshooting)

---

## Genel Bakış

### Vesting Lock Nedir?

Vesting lock, token sahiplerinin belirli bir miktarda tokenlarını belirli bir süre boyunca kilitlemesini sağlayan bir mekanizmadır. Bu, token dağıtımını kontrol altında tutmak ve ani satışları önlemek için kullanılır.

### Temel Özellikler

- ✅ **Otomatik Koruma:** Kilitli tokenlar otomatik olarak transfer edilemez
- ✅ **Kademeli Release:** Tokenlar belirli periyotlarda serbest bırakılır
- ✅ **Şeffaf:** Tüm vesting bilgileri blockchain'de görülebilir
- ✅ **Güvenli:** Attack vector'lere karşı korumalı

---

## Nasıl Çalışır

### 1. Vesting Schedule Oluşturma

```solidity
function createVestingSchedule(
    address beneficiary,      // Token alacak kişi
    uint256 amount,          // Kilitlenecek miktar
    uint256 cliffDays,       // Başlangıç bekleme süresi (gün)
    uint256 vestingMonths,   // Toplam vesting süresi (ay)
    uint256 releasePercentage, // Aylık release yüzdesi (basis points)
    uint256 burnPercentage,  // Burn yüzdesi (basis points)
    bool isAdmin             // Admin wallet mı?
) external onlyOwner
```

**Örnek:**
```javascript
// 10M token, 30 gün cliff, 16 ay vesting, aylık %5 release
await token.createVestingSchedule(
    "0xUserAddress",
    ethers.utils.parseEther("10000000"),
    30,    // 30 gün cliff
    16,    // 16 ay
    500,   // %5 (500 basis points)
    0,     // Burn yok
    true   // Admin wallet
);
```

### 2. Available Balance Hesaplama

```
Available Balance = Total Balance - Locked Amount

Locked Amount = Total Vested - Released Amount
```

**Örnek:**
```
Total Balance:     10,000,000 SYL
Vested Amount:      8,000,000 SYL
Released Amount:            0 SYL
─────────────────────────────────
Locked Amount:      8,000,000 SYL
Available Balance:  2,000,000 SYL ✅ Transfer edilebilir
```

### 3. Transfer Kontrolü

Her transfer işleminde:

1. **Vesting schedule var mı?** → Kontrol et
2. **Varsa:**
   - Current balance al
   - Locked amount hesapla
   - Available balance hesapla
   - Transfer amount > available? → **HATA**
3. **Yoksa:** → Normal transfer

```solidity
// _transfer fonksiyonunda
if (vestingSchedules[from].isActive) {
    uint256 currentBalance = balanceOf(from);
    uint256 lockedAmount = vestingSchedules[from].totalAmount 
                         - vestingSchedules[from].releasedAmount;
    uint256 availableBalance = currentBalance > lockedAmount 
                              ? currentBalance - lockedAmount 
                              : 0;
    
    if (amount > availableBalance) {
        revert InsufficientUnlockedBalance(from, amount, availableBalance);
    }
}
```

### 4. Vesting Release

```javascript
// Cliff period geçtikten sonra
await token.releaseVestedTokens("0xBeneficiaryAddress");
```

**Release Hesaplama:**
```
Monthly Release = Total Vested × Release Percentage
Burn Amount = Monthly Release × Burn Percentage
Net Release = Monthly Release - Burn Amount
```

---

## Kullanım Örnekleri

### Örnek 1: Admin Wallet (80% Kilitli)

```javascript
// Setup
const totalAmount = ethers.utils.parseEther("10000000"); // 10M
const lockedAmount = ethers.utils.parseEther("8000000");  // 8M (80%)

// Transfer tokens
await token.transfer(adminAddress, totalAmount);

// Create vesting
await token.createVestingSchedule(
    adminAddress,
    lockedAmount,
    30,   // 30 gün cliff
    16,   // 16 ay
    500,  // %5 aylık
    0,    // Burn yok
    true  // Admin
);

// İlk durum
// Available: 2M SYL ✅
// Locked: 8M SYL ❌

// Transfer denemeleri
await token.connect(admin).transfer(user, ethers.utils.parseEther("2000000")); // ✅ Başarılı
await token.connect(admin).transfer(user, ethers.utils.parseEther("3000000")); // ❌ Hata!
```

### Örnek 2: Locked Reserve (100% Kilitli, %10 Burn)

```javascript
// Setup
const totalAmount = ethers.utils.parseEther("300000000"); // 300M

// Transfer tokens
await token.transfer(lockedAddress, totalAmount);

// Create vesting
await token.createVestingSchedule(
    lockedAddress,
    totalAmount,
    30,    // 30 gün cliff
    34,    // 34 ay
    300,   // %3 aylık
    1000,  // %10 burn
    false  // Not admin
);

// İlk durum
// Available: 0 SYL
// Locked: 300M SYL ❌

// Transfer denemesi
await token.connect(locked).transfer(user, 1); // ❌ Hata!

// 1 ay sonra release
await time.increase(32 * 24 * 60 * 60);
await token.releaseVestedTokens(lockedAddress);

// Release sonrası
// Monthly Release: 9M SYL (300M × 3%)
// Burn: 900K SYL (9M × 10%)
// Net Release: 8.1M SYL
// Available: 8.1M SYL ✅
```

### Örnek 3: Token Alma ile Available Artışı

```javascript
// Başlangıç
// Balance: 10M SYL
// Locked: 8M SYL
// Available: 2M SYL

// Yeni token geldi
await token.transfer(userAddress, ethers.utils.parseEther("5000000"));

// Yeni durum
// Balance: 15M SYL
// Locked: 8M SYL (değişmedi)
// Available: 7M SYL ✅ (arttı!)

// Şimdi 7M transfer edilebilir
await token.connect(user).transfer(recipient, ethers.utils.parseEther("7000000")); // ✅
```

---

## Güvenlik

### Korunan Attack Vector'ler

#### 1. ✅ Direct Transfer Bypass
```javascript
// ❌ Çalışmaz
await token.connect(user).transfer(recipient, lockedAmount);
// Hata: InsufficientUnlockedBalance
```

#### 2. ✅ Approve/TransferFrom Bypass
```javascript
// ❌ Çalışmaz
await token.connect(user).approve(attacker, lockedAmount);
await token.connect(attacker).transferFrom(user, attacker, lockedAmount);
// Hata: InsufficientUnlockedBalance
```

#### 3. ✅ Self-Transfer Bypass
```javascript
// ❌ Çalışmaz
await token.connect(user).transfer(user, lockedAmount);
// Hata: InsufficientUnlockedBalance
```

#### 4. ✅ Multiple Small Transfer Bypass
```javascript
// ❌ Çalışmaz
await token.connect(user).transfer(recipient, availableAmount / 2); // ✅
await token.connect(user).transfer(recipient, availableAmount / 2); // ✅
await token.connect(user).transfer(recipient, 1); // ❌ Hata!
```

### Güvenlik Özellikleri

- **Otomatik Kontrol:** Her transfer'de otomatik lock kontrolü
- **Bypass Koruması:** Tüm transfer yöntemleri korumalı
- **Şeffaflık:** Tüm vesting bilgileri görülebilir
- **Immutable Lock:** Kilitli tokenlar değiştirilemez

---

## Sık Sorulan Sorular

### Q: Kilitli tokenlarımı nasıl görebilirim?

```javascript
const vestingInfo = await token.getVestingInfo(myAddress);
console.log("Total Vested:", ethers.utils.formatEther(vestingInfo.totalAmount));
console.log("Released:", ethers.utils.formatEther(vestingInfo.releasedAmount));

const locked = vestingInfo.totalAmount.sub(vestingInfo.releasedAmount);
console.log("Locked:", ethers.utils.formatEther(locked));
```

### Q: Available balance'ımı nasıl hesaplarım?

```javascript
const balance = await token.balanceOf(myAddress);
const vestingInfo = await token.getVestingInfo(myAddress);
const locked = vestingInfo.totalAmount.sub(vestingInfo.releasedAmount);
const available = balance.sub(locked);

console.log("Available:", ethers.utils.formatEther(available));
```

### Q: Ne zaman token release edebilirim?

```javascript
const vestingInfo = await token.getVestingInfo(myAddress);
const cliffEnd = vestingInfo.startTime.add(vestingInfo.cliffDuration);
const now = Math.floor(Date.now() / 1000);

if (now < cliffEnd) {
    const waitTime = cliffEnd - now;
    console.log(`Wait ${waitTime} seconds (${waitTime / 86400} days)`);
} else {
    console.log("You can release now!");
    await token.releaseVestedTokens(myAddress);
}
```

### Q: Vesting schedule'ımı iptal edebilir miyim?

Hayır. Vesting schedule oluşturulduktan sonra iptal edilemez. Bu, güvenlik ve şeffaflık için tasarlanmıştır.

### Q: Yeni token aldığımda available balance artar mı?

Evet! Yeni gelen tokenlar kilitli değildir, sadece vesting schedule'daki tokenlar kilitlidir.

```
Örnek:
- Locked: 8M SYL
- Balance: 10M SYL → Available: 2M SYL
- +5M yeni token geldi
- Balance: 15M SYL → Available: 7M SYL ✅
```

---

## Troubleshooting

### Hata: InsufficientUnlockedBalance

**Neden:** Transfer miktarı available balance'dan fazla.

**Çözüm:**
```javascript
// Available balance'ı kontrol et
const balance = await token.balanceOf(myAddress);
const vestingInfo = await token.getVestingInfo(myAddress);
const locked = vestingInfo.totalAmount.sub(vestingInfo.releasedAmount);
const available = balance.sub(locked);

console.log("You can transfer:", ethers.utils.formatEther(available));

// Sadece available miktarı transfer et
await token.transfer(recipient, available);
```

### Hata: NoTokensToRelease

**Neden:** Cliff period henüz geçmedi veya release edilecek token yok.

**Çözüm:**
```javascript
const vestingInfo = await token.getVestingInfo(myAddress);
const now = Math.floor(Date.now() / 1000);
const cliffEnd = vestingInfo.startTime.add(vestingInfo.cliffDuration).toNumber();

if (now < cliffEnd) {
    console.log("Cliff period not passed yet");
    console.log(`Wait ${(cliffEnd - now) / 86400} more days`);
} else {
    console.log("Check if you already released all tokens");
}
```

### Wei Seviyesi Hassasiyet

**Sorun:** Çok küçük miktarlarda 1 wei fark olabiliyor.

**Çözüm:**
```javascript
// Tam available yerine biraz daha az transfer et
const available = balance.sub(locked);
const safeAmount = available.sub(ethers.utils.parseEther("0.000000000000000001"));
await token.transfer(recipient, safeAmount);
```

---

## API Referansı

### Vesting Schedule Oluşturma

```solidity
function createVestingSchedule(
    address beneficiary,
    uint256 amount,
    uint256 cliffDays,
    uint256 vestingMonths,
    uint256 releasePercentage,
    uint256 burnPercentage,
    bool isAdmin
) external onlyOwner
```

### Vesting Bilgisi Alma

```solidity
function getVestingInfo(address beneficiary) 
    external 
    view 
    returns (VestingSchedule memory)
```

### Token Release

```solidity
function releaseVestedTokens(address beneficiary) external
```

### Vesting İstatistikleri

```solidity
function getVestingStats() 
    external 
    view 
    returns (
        uint256 _totalVested,
        uint256 _totalReleased,
        uint256 _totalBurned,
        uint256 _activeSchedules
    )
```

---

## Örnekler

### Hardhat Console

```javascript
// Connect to contract
const token = await ethers.getContractAt("SylvanToken", "0xContractAddress");

// Check vesting info
const info = await token.getVestingInfo("0xMyAddress");
console.log("Total:", ethers.utils.formatEther(info.totalAmount));
console.log("Released:", ethers.utils.formatEther(info.releasedAmount));

// Calculate available
const balance = await token.balanceOf("0xMyAddress");
const locked = info.totalAmount.sub(info.releasedAmount);
const available = balance.sub(locked);
console.log("Available:", ethers.utils.formatEther(available));

// Transfer available
await token.transfer("0xRecipient", available);

// Release vested tokens (after cliff)
await token.releaseVestedTokens("0xMyAddress");
```

### Web3.js

```javascript
const web3 = new Web3(window.ethereum);
const token = new web3.eth.Contract(ABI, contractAddress);

// Get vesting info
const info = await token.methods.getVestingInfo(myAddress).call();
console.log("Locked:", web3.utils.fromWei(
    (info.totalAmount - info.releasedAmount).toString()
));

// Transfer
await token.methods.transfer(recipient, amount).send({ from: myAddress });
```

---

## Destek

**Teknik Sorular:**
- Email: dev@sylvantoken.org
- Telegram: t.me/sylvantoken
- GitHub: github.com/sylvantoken

**Contract:**
- BSC Testnet: 0x2016Fd055810ef5e9F7C753c24ae4b2C2B414B9E
- BSCScan: https://testnet.bscscan.com/address/0x2016Fd055810ef5e9F7C753c24ae4b2C2B414B9E

---

**Doküman Versiyonu:** 1.0  
**Son Güncelleme:** 8 Kasım 2025  
**Hazırlayan:** Kiro AI Assistant
