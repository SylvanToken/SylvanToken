# 📘 Sylvan Token - API Reference

**Versiyon:** 1.0  
**Contract:** SylvanToken  
**Solidity:** 0.8.24  
**Standard:** BEP-20 (ERC-20 Compatible)

---

## 📋 İçindekiler

1. [Contract Overview](#contract-overview)
2. [ERC20 Functions](#erc20-functions)
3. [Vesting Functions](#vesting-functions)
4. [Fee Management](#fee-management)
5. [Admin Functions](#admin-functions)
6. [View Functions](#view-functions)
7. [Events](#events)
8. [Errors](#errors)

---

## Contract Overview

### Inheritance

```solidity
contract SylvanToken is 
    ERC20,
    Ownable,
    ReentrancyGuard,
    IEnhancedFeeManager,
    IVestingManager,
    IAdminWalletHandler
```

### Constants

```solidity
uint256 public constant TOTAL_SUPPLY = 1_000_000_000 * 10**18;
uint256 public constant UNIVERSAL_FEE_RATE = 100; // 1%
uint256 public constant FEE_DENOMINATOR = 10000;
address public constant DEAD_WALLET = 0x000000000000000000000000000000000000dEaD;
```

---

## ERC20 Functions

### transfer

```solidity
function transfer(address to, uint256 amount) 
    public 
    override 
    returns (bool)
```

**Açıklama:** Token transfer işlemi (fee ve vesting lock kontrolü ile)

**Parametreler:**
- `to`: Alıcı adresi
- `amount`: Transfer miktarı (wei)

**Returns:** `bool` - Başarı durumu

**Revert Conditions:**
- `ZeroAddress()` - to == address(0)
- `InvalidAmount()` - amount == 0
- `InsufficientUnlockedBalance()` - Kilitli token transfer denemesi

**Events:** `Transfer`, `UniversalFeeApplied`, `FeeDistributed`

**Example:**
```javascript
await token.transfer("0xRecipient", ethers.utils.parseEther("1000"));
```

---

### transferFrom

```solidity
function transferFrom(
    address from,
    address to,
    uint256 amount
) public override returns (bool)
```

**Açıklama:** Onaylı token transfer (allowance kullanarak)

**Parametreler:**
- `from`: Gönderici adresi
- `to`: Alıcı adresi
- `amount`: Transfer miktarı

**Returns:** `bool` - Başarı durumu

**Revert Conditions:**
- Tüm `transfer` koşulları
- `ERC20InsufficientAllowance` - Yetersiz allowance

**Example:**
```javascript
await token.approve(spender, amount);
await token.connect(spender).transferFrom(owner, recipient, amount);
```

---

### approve

```solidity
function approve(address spender, uint256 amount) 
    public 
    override 
    returns (bool)
```

**Açıklama:** Spender'a harcama yetkisi ver

**Parametreler:**
- `spender`: Yetkilendirilecek adres
- `amount`: Yetki miktarı

**Returns:** `bool` - Başarı durumu

**Events:** `Approval`

---

### balanceOf

```solidity
function balanceOf(address account) 
    public 
    view 
    override 
    returns (uint256)
```

**Açıklama:** Hesap bakiyesini sorgula

**Parametreler:**
- `account`: Sorgulanacak adres

**Returns:** `uint256` - Bakiye (wei)

---

## Vesting Functions

### createVestingSchedule

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

**Açıklama:** Yeni vesting schedule oluştur

**Parametreler:**
- `beneficiary`: Token alacak adres
- `amount`: Kilitlenecek miktar
- `cliffDays`: Başlangıç bekleme süresi (gün)
- `vestingMonths`: Toplam vesting süresi (ay)
- `releasePercentage`: Aylık release yüzdesi (basis points)
- `burnPercentage`: Burn yüzdesi (basis points)
- `isAdmin`: Admin wallet mı?

**Access:** Owner only

**Revert Conditions:**
- `ZeroAddress()` - beneficiary == address(0)
- `InvalidAmount()` - amount == 0
- `VestingAlreadyExists()` - Schedule zaten var

**Events:** `VestingScheduleCreated`

**Example:**
```javascript
// 10M token, 30 gün cliff, 16 ay, %5 aylık, burn yok, admin
await token.createVestingSchedule(
    beneficiary,
    ethers.utils.parseEther("10000000"),
    30,
    16,
    500,
    0,
    true
);
```

---

### releaseVestedTokens

```solidity
function releaseVestedTokens(address beneficiary) 
    external
```

**Açıklama:** Vested tokenları release et

**Parametreler:**
- `beneficiary`: Release yapılacak adres

**Access:** Anyone (beneficiary için)

**Revert Conditions:**
- `NoVestingSchedule()` - Schedule yok
- `VestingNotStarted()` - Henüz başlamamış
- `CliffPeriodActive()` - Cliff period devam ediyor
- `NoTokensToRelease()` - Release edilecek token yok

**Events:** `TokensReleased`, `ProportionalBurn`

**Example:**
```javascript
await token.releaseVestedTokens(beneficiary);
```

---

### getVestingInfo

```solidity
function getVestingInfo(address beneficiary) 
    external 
    view 
    returns (VestingSchedule memory)
```

**Açıklama:** Vesting bilgilerini sorgula

**Parametreler:**
- `beneficiary`: Sorgulanacak adres

**Returns:** `VestingSchedule` struct
```solidity
struct VestingSchedule {
    uint256 totalAmount;
    uint256 releasedAmount;
    uint256 burnedAmount;
    uint256 startTime;
    uint256 cliffDuration;
    uint256 vestingDuration;
    uint256 releasePercentage;
    uint256 burnPercentage;
    bool isAdmin;
    bool isActive;
}
```

**Example:**
```javascript
const schedule = await token.getVestingInfo(beneficiary);
console.log("Total:", ethers.utils.formatEther(schedule.totalAmount));
console.log("Released:", ethers.utils.formatEther(schedule.releasedAmount));
```

---

## Fee Management

### isExempt

```solidity
function isExempt(address wallet) 
    public 
    view 
    returns (bool)
```

**Açıklama:** Fee exemption durumunu kontrol et

**Parametreler:**
- `wallet`: Kontrol edilecek adres

**Returns:** `bool` - Exempt mi?

---

### addExemptWallet

```solidity
function addExemptWallet(address wallet) 
    external 
    onlyOwner
```

**Açıklama:** Fee exemption listesine ekle

**Parametreler:**
- `wallet`: Eklenecek adres

**Access:** Owner only

**Revert Conditions:**
- `ZeroAddress()` - wallet == address(0)
- `WalletAlreadyExempt()` - Zaten exempt

**Events:** `FeeExemptionChanged`

---

### removeExemptWallet

```solidity
function removeExemptWallet(address wallet) 
    external 
    onlyOwner
```

**Açıklama:** Fee exemption listesinden çıkar

**Parametreler:**
- `wallet`: Çıkarılacak adres

**Access:** Owner only

**Revert Conditions:**
- `WalletNotExempt()` - Zaten exempt değil

**Events:** `FeeExemptionChanged`

---

### getExemptWallets

```solidity
function getExemptWallets() 
    external 
    view 
    returns (address[] memory)
```

**Açıklama:** Tüm exempt wallet'ları listele

**Returns:** `address[]` - Exempt adresler

---

## Admin Functions

### configureAdminWallet

```solidity
function configureAdminWallet(
    address admin,
    uint256 totalAllocation,
    uint256 immediateRelease,
    uint256 lockedAmount
) external onlyOwner
```

**Açıklama:** Admin wallet konfigürasyonu

**Parametreler:**
- `admin`: Admin adresi
- `totalAllocation`: Toplam allocation
- `immediateRelease`: İlk release
- `lockedAmount`: Kilitli miktar

**Access:** Owner only

---

### processInitialRelease

```solidity
function processInitialRelease(address admin) 
    external 
    onlyOwner
```

**Açıklama:** Admin için ilk release'i işle

**Parametreler:**
- `admin`: Admin adresi

**Access:** Owner only

---

## View Functions

### getFeeStats

```solidity
function getFeeStats() 
    external 
    view 
    returns (
        uint256 _totalFeesCollected,
        uint256 _totalTokensBurned,
        uint256 _totalDonations
    )
```

**Açıklama:** Fee istatistiklerini getir

**Returns:**
- `_totalFeesCollected`: Toplanan fee
- `_totalTokensBurned`: Yakılan token
- `_totalDonations`: Bağış miktarı

---

### getVestingStats

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

**Açıklama:** Vesting istatistiklerini getir

**Returns:**
- `_totalVested`: Toplam vested
- `_totalReleased`: Toplam released
- `_totalBurned`: Toplam burned
- `_activeSchedules`: Aktif schedule sayısı

---

## Events

### Transfer

```solidity
event Transfer(
    address indexed from,
    address indexed to,
    uint256 value
)
```

**Açıklama:** Token transfer olayı (ERC20 standard)

---

### UniversalFeeApplied

```solidity
event UniversalFeeApplied(
    address indexed from,
    address indexed to,
    uint256 amount,
    uint256 feeAmount
)
```

**Açıklama:** Fee uygulandığında emit edilir

---

### FeeDistributed

```solidity
event FeeDistributed(
    uint256 feeAmount,
    uint256 donationAmount,
    uint256 burnAmount
)
```

**Açıklama:** Fee dağıtıldığında emit edilir

---

### VestingScheduleCreated

```solidity
event VestingScheduleCreated(
    address indexed beneficiary,
    uint256 amount,
    uint256 cliffDays,
    bool isAdmin
)
```

**Açıklama:** Yeni vesting schedule oluşturulduğunda

---

### TokensReleased

```solidity
event TokensReleased(
    address indexed beneficiary,
    uint256 releasedAmount,
    uint256 totalReleased
)
```

**Açıklama:** Token release edildiğinde

---

### FeeExemptionChanged

```solidity
event FeeExemptionChanged(
    address indexed wallet,
    bool exempt
)
```

**Açıklama:** Fee exemption değiştiğinde

---

## Errors

### ZeroAddress

```solidity
error ZeroAddress()
```

**Açıklama:** Sıfır adres kullanıldığında

---

### InvalidAmount

```solidity
error InvalidAmount()
```

**Açıklama:** Geçersiz miktar (0 veya negatif)

---

### InsufficientUnlockedBalance

```solidity
error InsufficientUnlockedBalance(
    address account,
    uint256 requested,
    uint256 available
)
```

**Açıklama:** Kilitli token transfer denemesi

**Parametreler:**
- `account`: Hesap adresi
- `requested`: İstenen miktar
- `available`: Mevcut miktar

---

### VestingAlreadyExists

```solidity
error VestingAlreadyExists(address beneficiary)
```

**Açıklama:** Vesting schedule zaten var

---

### NoVestingSchedule

```solidity
error NoVestingSchedule(address beneficiary)
```

**Açıklama:** Vesting schedule bulunamadı

---

### NoTokensToRelease

```solidity
error NoTokensToRelease(address beneficiary)
```

**Açıklama:** Release edilecek token yok

---

## 📞 Destek

**Teknik Sorular:**
- Email: dev@sylvantoken.org
- Telegram: t.me/sylvantoken

**Contract:**
- BSC Testnet: 0x2016Fd055810ef5e9F7C753c24ae4b2C2B414B9E

---

**Hazırlayan:** Kiro AI Assistant  
**Tarih:** 8 Kasım 2025  
**Versiyon:** 1.0
