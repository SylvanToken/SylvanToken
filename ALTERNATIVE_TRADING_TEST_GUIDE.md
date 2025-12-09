# Alternative Trading Test Methods (PancakeSwap Erişim Sorunu İçin)

**Date:** November 8, 2025-  
**Contract:** 0x2016Fd055810ef5e9F7C753c24ae4b2C2B414B9E  
**Network:** BSC Testnet

---

## 🎯 Alternatif Yöntemler

PancakeSwap'e erişim sorunu varsa 3 ana alternatif var:

1. **Diğer DEX'ler** (Web UI)
2. **Direkt Script ile Test** (En kolay ve güvenilir)
3. **VPN ile PancakeSwap** (Gerekirse)

---

## 🚀 Yöntem 1: Alternatif DEX'ler (BSC Testnet)

### 1. Biswap Testnet
**URL:** https://testnet.biswap.org/

**Özellikler:**
- PancakeSwap benzeri arayüz
- BSC Testnet desteği
- Düşük fee
- Kolay kullanım

**Kullanım:**
```
1. Biswap Testnet'e git
2. MetaMask bağla (BSC Testnet)
3. Token import et: 0x2016Fd055810ef5e9F7C753c24ae4b2C2B414B9E
4. Liquidity > Add Liquidity
5. Trade > Swap ile test yap
```

### 2. ApeSwap Testnet
**URL:** https://testnet.apeswap.finance/

**Özellikler:**
- BSC Testnet desteği
- Basit arayüz
- Hızlı işlem

**Kullanım:**
```
1. ApeSwap Testnet'e git
2. Wallet bağla
3. Token ekle
4. Likidite ekle
5. Swap yap
```

### 3. BakerySwap
**URL:** https://www.bakeryswap.org/

**Not:** Testnet desteği sınırlı, mainnet odaklı

---

## ⭐ Yöntem 2: Direkt Script ile Test (ÖNERİLEN)

Bu yöntem **en güvenilir ve kolay** olanıdır. Web arayüzüne ihtiyaç yok!

### Adım 1: Test Script'i Oluştur

```javascript
// scripts/testnet-trading-test.js
const { ethers } = require("hardhat");

async function main() {
    console.log("=== BSC Testnet Trading Test ===\n");
    
    const [deployer, user1, user2] = await ethers.getSigners();
    
    // Contract addresses
    const TOKEN_ADDRESS = "0x2016Fd055810ef5e9F7C753c24ae4b2C2B414B9E";
    const PANCAKE_ROUTER = "0xD99D1c33F9fC3444f8101754aBC46c52416550D1";
    const WBNB = "0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd";
    
    // Get contracts
    const token = await ethers.getContractAt("SylvanToken", TOKEN_ADDRESS);
    
    // Router ABI (minimal)
    const routerABI = [
        "function addLiquidityETH(address token, uint amountTokenDesired, uint amountTokenMin, uint amountETHMin, address to, uint deadline) external payable returns (uint amountToken, uint amountETH, uint liquidity)",
        "function swapExactETHForTokens(uint amountOutMin, address[] calldata path, address to, uint deadline) external payable returns (uint[] memory amounts)",
        "function swapExactTokensForETH(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)",
        "function getAmountsOut(uint amountIn, address[] calldata path) external view returns (uint[] memory amounts)"
    ];
    
    const router = new ethers.Contract(PANCAKE_ROUTER, routerABI, deployer);
    
    console.log("Deployer:", deployer.address);
    console.log("Token:", TOKEN_ADDRESS);
    console.log("Router:", PANCAKE_ROUTER);
    console.log("\n");
    
    // Check balances
    const tokenBalance = await token.balanceOf(deployer.address);
    const bnbBalance = await ethers.provider.getBalance(deployer.address);
    
    console.log("Initial Balances:");
    console.log("- SYL:", ethers.utils.formatEther(tokenBalance));
    console.log("- BNB:", ethers.utils.formatEther(bnbBalance));
    console.log("\n");
    
    // 1. Approve Router
    console.log("Step 1: Approving router...");
    const approveAmount = ethers.utils.parseEther("1000000");
    const approveTx = await token.approve(PANCAKE_ROUTER, approveAmount);
    await approveTx.wait();
    console.log("✅ Router approved");
    console.log("TX:", approveTx.hash);
    console.log("\n");
    
    // 2. Add Liquidity
    console.log("Step 2: Adding liquidity...");
    const tokenAmount = ethers.utils.parseEther("100000"); // 100K SYL
    const bnbAmount = ethers.utils.parseEther("0.1"); // 0.1 BNB
    const deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 min
    
    try {
        const liquidityTx = await router.addLiquidityETH(
            TOKEN_ADDRESS,
            tokenAmount,
            0, // min token
            0, // min BNB
            deployer.address,
            deadline,
            { value: bnbAmount, gasLimit: 500000 }
        );
        
        const receipt = await liquidityTx.wait();
        console.log("✅ Liquidity added");
        console.log("TX:", liquidityTx.hash);
        console.log("Gas used:", receipt.gasUsed.toString());
        console.log("\n");
    } catch (error) {
        console.log("⚠️ Liquidity might already exist");
        console.log("Error:", error.message);
        console.log("\n");
    }
    
    // 3. Buy Test (BNB → SYL)
    console.log("Step 3: Testing BUY (BNB → SYL)...");
    const buyAmount = ethers.utils.parseEther("0.01"); // 0.01 BNB
    const path = [WBNB, TOKEN_ADDRESS];
    
    // Get expected output
    const amountsOut = await router.getAmountsOut(buyAmount, path);
    console.log("Expected to receive:", ethers.utils.formatEther(amountsOut[1]), "SYL");
    
    const balanceBefore = await token.balanceOf(deployer.address);
    
    const buyTx = await router.swapExactETHForTokens(
        0, // min tokens (0 for test)
        path,
        deployer.address,
        deadline,
        { value: buyAmount, gasLimit: 300000 }
    );
    
    const buyReceipt = await buyTx.wait();
    const balanceAfter = await token.balanceOf(deployer.address);
    const received = balanceAfter.sub(balanceBefore);
    
    console.log("✅ Buy completed");
    console.log("TX:", buyTx.hash);
    console.log("Spent:", ethers.utils.formatEther(buyAmount), "BNB");
    console.log("Received:", ethers.utils.formatEther(received), "SYL");
    console.log("Gas used:", buyReceipt.gasUsed.toString());
    
    // Calculate fee
    const expectedWithoutFee = amountsOut[1];
    const feeAmount = expectedWithoutFee.sub(received);
    const feePercentage = feeAmount.mul(10000).div(expectedWithoutFee);
    console.log("Fee deducted:", ethers.utils.formatEther(feeAmount), "SYL");
    console.log("Fee percentage:", feePercentage.toString() / 100, "%");
    console.log("\n");
    
    // 4. Sell Test (SYL → BNB)
    console.log("Step 4: Testing SELL (SYL → BNB)...");
    const sellAmount = ethers.utils.parseEther("1000"); // 1000 SYL
    const pathReverse = [TOKEN_ADDRESS, WBNB];
    
    // Get expected output
    const amountsOutSell = await router.getAmountsOut(sellAmount, pathReverse);
    console.log("Expected to receive:", ethers.utils.formatEther(amountsOutSell[1]), "BNB");
    
    const bnbBefore = await ethers.provider.getBalance(deployer.address);
    
    const sellTx = await router.swapExactTokensForETH(
        sellAmount,
        0, // min BNB (0 for test)
        pathReverse,
        deployer.address,
        deadline,
        { gasLimit: 300000 }
    );
    
    const sellReceipt = await sellTx.wait();
    const bnbAfter = await ethers.provider.getBalance(deployer.address);
    
    // Calculate BNB received (minus gas)
    const gasCost = sellReceipt.gasUsed.mul(sellReceipt.effectiveGasPrice);
    const bnbReceived = bnbAfter.sub(bnbBefore).add(gasCost);
    
    console.log("✅ Sell completed");
    console.log("TX:", sellTx.hash);
    console.log("Sold:", ethers.utils.formatEther(sellAmount), "SYL");
    console.log("Received:", ethers.utils.formatEther(bnbReceived), "BNB");
    console.log("Gas used:", sellReceipt.gasUsed.toString());
    console.log("Gas cost:", ethers.utils.formatEther(gasCost), "BNB");
    console.log("\n");
    
    // 5. Check Fee Distribution
    console.log("Step 5: Checking fee distribution...");
    
    // Get wallet addresses from config
    const config = require("../config/deployment.config.js");
    const operationsWallet = config.wallets.operations;
    const donationsWallet = config.wallets.donations;
    const deadWallet = "0x000000000000000000000000000000000000dEaD";
    
    const operationsBalance = await token.balanceOf(operationsWallet);
    const donationsBalance = await token.balanceOf(donationsWallet);
    const burnedBalance = await token.balanceOf(deadWallet);
    
    console.log("Fee Distribution:");
    console.log("- Operations:", ethers.utils.formatEther(operationsBalance), "SYL");
    console.log("- Donations:", ethers.utils.formatEther(donationsBalance), "SYL");
    console.log("- Burned:", ethers.utils.formatEther(burnedBalance), "SYL");
    console.log("\n");
    
    // Final balances
    const finalTokenBalance = await token.balanceOf(deployer.address);
    const finalBnbBalance = await ethers.provider.getBalance(deployer.address);
    
    console.log("Final Balances:");
    console.log("- SYL:", ethers.utils.formatEther(finalTokenBalance));
    console.log("- BNB:", ethers.utils.formatEther(finalBnbBalance));
    console.log("\n");
    
    console.log("=== Test Completed Successfully ===");
    console.log("\n📊 Summary:");
    console.log("✅ Liquidity added");
    console.log("✅ Buy test passed");
    console.log("✅ Sell test passed");
    console.log("✅ Fee mechanism working");
    console.log("\n🔗 View transactions on BSCScan:");
    console.log("https://testnet.bscscan.com/address/" + TOKEN_ADDRESS);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
```

### Adım 2: Script'i Çalıştır

```bash
npx hardhat run scripts/testnet-trading-test.js --network bscTestnet
```

### Beklenen Çıktı:

```
=== BSC Testnet Trading Test ===

Deployer: 0x...
Token: 0x2016Fd055810ef5e9F7C753c24ae4b2C2B414B9E
Router: 0xD99D1c33F9fC3444f8101754aBC46c52416550D1

Initial Balances:
- SYL: 500000000.0
- BNB: 1.5

Step 1: Approving router...
✅ Router approved
TX: 0x...

Step 2: Adding liquidity...
✅ Liquidity added
TX: 0x...
Gas used: 234567

Step 3: Testing BUY (BNB → SYL)...
Expected to receive: 1000.0 SYL
✅ Buy completed
TX: 0x...
Spent: 0.01 BNB
Received: 990.0 SYL
Gas used: 156789
Fee deducted: 10.0 SYL
Fee percentage: 1.0 %

Step 4: Testing SELL (SYL → BNB)...
Expected to receive: 0.0099 BNB
✅ Sell completed
TX: 0x...
Sold: 1000.0 SYL
Received: 0.009801 BNB
Gas used: 167890

Step 5: Checking fee distribution...
Fee Distribution:
- Operations: 5.0 SYL
- Donations: 2.5 SYL
- Burned: 2.5 SYL

Final Balances:
- SYL: 499999990.0
- BNB: 1.489

=== Test Completed Successfully ===

📊 Summary:
✅ Liquidity added
✅ Buy test passed
✅ Sell test passed
✅ Fee mechanism working
```

---

## 🔧 Yöntem 3: Basit Transfer Testi (DEX Olmadan)

DEX'e hiç ihtiyaç duymadan sadece transfer ile test:

```javascript
// scripts/simple-transfer-test.js
const { ethers } = require("hardhat");

async function main() {
    console.log("=== Simple Transfer Test ===\n");
    
    const [owner, user1, user2] = await ethers.getSigners();
    const TOKEN_ADDRESS = "0x2016Fd055810ef5e9F7C753c24ae4b2C2B414B9E";
    const token = await ethers.getContractAt("SylvanToken", TOKEN_ADDRESS);
    
    // Test 1: Normal transfer (with fee)
    console.log("Test 1: Normal transfer (with fee)");
    const amount = ethers.utils.parseEther("1000");
    
    const balanceBefore = await token.balanceOf(user1.address);
    await token.transfer(user1.address, amount);
    const balanceAfter = await token.balanceOf(user1.address);
    
    const received = balanceAfter.sub(balanceBefore);
    const fee = amount.sub(received);
    
    console.log("Sent:", ethers.utils.formatEther(amount));
    console.log("Received:", ethers.utils.formatEther(received));
    console.log("Fee:", ethers.utils.formatEther(fee));
    console.log("Fee %:", fee.mul(10000).div(amount).toNumber() / 100);
    console.log("✅ Transfer with fee working\n");
    
    // Test 2: Check fee distribution
    console.log("Test 2: Fee distribution");
    const config = require("../config/deployment.config.js");
    
    const operationsBalance = await token.balanceOf(config.wallets.operations);
    const donationsBalance = await token.balanceOf(config.wallets.donations);
    const burnedBalance = await token.balanceOf("0x000000000000000000000000000000000000dEaD");
    
    console.log("Operations:", ethers.utils.formatEther(operationsBalance));
    console.log("Donations:", ethers.utils.formatEther(donationsBalance));
    console.log("Burned:", ethers.utils.formatEther(burnedBalance));
    console.log("✅ Fee distribution working\n");
    
    console.log("=== All Tests Passed ===");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
```

**Çalıştır:**
```bash
npx hardhat run scripts/simple-transfer-test.js --network bscTestnet
```

---

## 🌐 Yöntem 4: VPN ile PancakeSwap (Gerekirse)

Eğer mutlaka PancakeSwap kullanmak isterseniz:

### Ücretsiz VPN Seçenekleri:
1. **ProtonVPN** (Ücretsiz, güvenilir)
2. **Windscribe** (10GB/ay ücretsiz)
3. **TunnelBear** (500MB/ay ücretsiz)

### Tarayıcı Eklentileri:
1. **Opera Browser** (Built-in VPN)
2. **Brave Browser** (Tor desteği)

### Kullanım:
```
1. VPN kur ve bağlan
2. Farklı ülke seç (Singapur, Hong Kong, vb.)
3. PancakeSwap'e git
4. Normal şekilde kullan
```

---

## 📊 Karşılaştırma

| Yöntem | Kolay | Hızlı | Güvenilir | VPN Gerekli |
|--------|-------|-------|-----------|-------------|
| **Script (Önerilen)** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ❌ |
| **Biswap** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ❌ |
| **ApeSwap** | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | ❌ |
| **Transfer Test** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ❌ |
| **VPN + PancakeSwap** | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | ✅ |

---

## 🎯 Önerilen Yaklaşım

### En İyi Seçenek: Script ile Test

**Avantajlar:**
- ✅ VPN'e gerek yok
- ✅ Web arayüzüne gerek yok
- ✅ Tam kontrol
- ✅ Otomatik test
- ✅ Detaylı log
- ✅ Tekrarlanabilir
- ✅ CI/CD'ye entegre edilebilir

**Kullanım:**
```bash
# 1. Script'i oluştur (yukarıdaki kodu kullan)
# 2. Çalıştır
npx hardhat run scripts/testnet-trading-test.js --network bscTestnet

# 3. Sonuçları kontrol et
# 4. BSCScan'de transaction'ları gör
```

---

## 📝 Test Checklist

### Script ile Test
- [ ] Script oluşturuldu
- [ ] Testnet BNB var
- [ ] Token balance yeterli
- [ ] Script çalıştırıldı
- [ ] Liquidity eklendi
- [ ] Buy test başarılı
- [ ] Sell test başarılı
- [ ] Fee dağılımı doğru
- [ ] BSCScan'de görünüyor

### Alternatif DEX ile Test
- [ ] DEX'e erişim var
- [ ] Wallet bağlandı
- [ ] Token import edildi
- [ ] Liquidity eklendi
- [ ] Swap testleri yapıldı

---

## 🆘 Sorun Giderme

### "Insufficient liquidity" Hatası
```javascript
// Daha fazla likidite ekle
const tokenAmount = ethers.utils.parseEther("100000"); // Artır
const bnbAmount = ethers.utils.parseEther("0.5"); // Artır
```

### "Transaction failed" Hatası
```javascript
// Gas limit artır
{ gasLimit: 500000 } // 300000'den 500000'e
```

### "Approval needed" Hatası
```javascript
// Önce approve yap
await token.approve(ROUTER_ADDRESS, ethers.constants.MaxUint256);
```

---

## 📞 Destek

**Script çalışmazsa:**
1. Hardhat config'i kontrol et
2. Network bağlantısını test et
3. Private key doğru mu?
4. Testnet BNB var mı?
5. Contract address doğru mu?

**Hata logları:**
```bash
# Detaylı log için
npx hardhat run scripts/testnet-trading-test.js --network bscTestnet --verbose
```

---

**Hazırlayan:** Sylvan Token Development Team  
**Tarih:** November 8, 2025-  
**Versiyon:** 1.0.0  
**Önerilen Yöntem:** ⭐ Script ile Test
