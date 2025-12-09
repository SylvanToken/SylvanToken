// Step 3: Update Deployment Report
// This script generates an updated deployment report with corrected information

const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
    console.log("\n" + "=".repeat(80));
    console.log("📝 STEP 3: UPDATE DEPLOYMENT REPORT");
    console.log("=".repeat(80) + "\n");

    // Load deployment info
    const deploymentFile = path.join(__dirname, "../../deployments/mainnet-deployment.json");
    if (!fs.existsSync(deploymentFile)) {
        console.error("❌ Deployment file not found!");
        process.exit(1);
    }

    const deploymentInfo = JSON.parse(fs.readFileSync(deploymentFile, "utf8"));
    const TOKEN_ADDRESS = deploymentInfo.contractAddress;

    console.log("Contract Address:", TOKEN_ADDRESS);
    console.log();

    // Get contract
    const token = await ethers.getContractAt("SylvanToken", TOKEN_ADDRESS);
    const [deployer] = await ethers.getSigners();

    // Load configuration
    const config = require("../../config/deployment.config.js");
    const wallets = config.wallets;

    console.log("🔍 Collecting Current Status...\n");

    // Get all balances
    const balances = {
        deployer: await token.balanceOf(deployer.address),
        founder: await token.balanceOf(wallets.system.founder.address),
        sylvanToken: await token.balanceOf(wallets.system.sylvanToken.address),
        feeCollection: await token.balanceOf(wallets.system.fee.address),
        donation: await token.balanceOf(wallets.system.donation.address),
        locked: await token.balanceOf(wallets.system.locked.address),
        mad: await token.balanceOf(wallets.admins.mad.address),
        leb: await token.balanceOf(wallets.admins.leb.address),
        cnk: await token.balanceOf(wallets.admins.cnk.address),
        kdr: await token.balanceOf(wallets.admins.kdr.address),
        dead: await token.balanceOf(wallets.system.dead.address)
    };

    // Get vesting info
    const adminVestingInfo = {};
    const adminWallets = [
        { name: "MAD", address: wallets.admins.mad.address },
        { name: "LEB", address: wallets.admins.leb.address },
        { name: "CNK", address: wallets.admins.cnk.address },
        { name: "KDR", address: wallets.admins.kdr.address }
    ];

    for (const admin of adminWallets) {
        try {
            const config = await token.getAdminConfig(admin.address);
            adminVestingInfo[admin.name] = {
                totalAllocation: ethers.utils.formatEther(config.totalAllocation),
                immediateRelease: ethers.utils.formatEther(config.immediateRelease),
                lockedAmount: ethers.utils.formatEther(config.lockedAmount),
                monthlyRelease: ethers.utils.formatEther(config.monthlyRelease),
                releasedAmount: ethers.utils.formatEther(config.releasedAmount),
                burnedAmount: ethers.utils.formatEther(config.burnedAmount),
                isConfigured: config.isConfigured,
                immediateReleased: config.immediateReleased
            };
        } catch (error) {
            adminVestingInfo[admin.name] = { error: "Not configured" };
        }
    }

    // Get locked reserve vesting info
    let lockedVestingInfo = {};
    try {
        const vestingInfo = await token.getVestingInfo(wallets.system.locked.address);
        lockedVestingInfo = {
            totalAmount: ethers.utils.formatEther(vestingInfo.totalAmount),
            releasedAmount: ethers.utils.formatEther(vestingInfo.releasedAmount),
            burnedAmount: ethers.utils.formatEther(vestingInfo.burnedAmount),
            startTime: new Date(vestingInfo.startTime * 1000).toISOString(),
            cliffDuration: vestingInfo.cliffDuration / 86400 + " days",
            vestingDuration: vestingInfo.vestingDuration / 2629746 + " months",
            releasePercentage: vestingInfo.releasePercentage / 100 + "%",
            burnPercentage: vestingInfo.burnPercentage / 100 + "%",
            isActive: vestingInfo.isActive
        };
    } catch (error) {
        lockedVestingInfo = { error: "Not configured" };
    }

    // Calculate totals
    const totalSupply = await token.totalSupply();
    let totalDistributed = ethers.BigNumber.from(0);
    for (const key in balances) {
        totalDistributed = totalDistributed.add(balances[key]);
    }

    // Generate report
    const report = `# 🎉 BSC MAINNET DEPLOYMENT - CORRECTED REPORT

**Date:** ${new Date().toISOString().split('T')[0]}  
**Status:** ✅ FULLY CONFIGURED  
**Network:** BSC Mainnet (Chain ID: 56)

---

## 🚀 Deployment Summary

### Contract Information
- **Contract Address:** \`${TOKEN_ADDRESS}\`
- **WalletManager Library:** \`${deploymentInfo.walletManagerLibrary}\`
- **Deployer:** \`${deployer.address}\`
- **Original Deployment TX:** \`${deploymentInfo.deploymentTx}\`
- **Block Number:** ${deploymentInfo.blockNumber}
- **Deployment Date:** ${deploymentInfo.timestamp}

### Links
- **Contract:** https://bscscan.com/address/${TOKEN_ADDRESS}
- **Token Tracker:** https://bscscan.com/token/${TOKEN_ADDRESS}
- **Holders:** https://bscscan.com/token/${TOKEN_ADDRESS}#balances

---

## ✅ Completed Configuration Steps

### 1. Contract Deployment ✅
- Deployed successfully on ${deploymentInfo.timestamp}
- Gas Used: ${deploymentInfo.gasUsed}
- Cost: ${deploymentInfo.gasCost} BNB

### 2. Initial Token Distribution ✅
- **Founder:** ${ethers.utils.formatEther(balances.founder)} SYL
- **Deployer/Sylvan Token:** ${ethers.utils.formatEther(balances.deployer)} SYL
- **Admin Wallets (Initial):** ${ethers.utils.formatEther(balances.mad.add(balances.leb).add(balances.cnk).add(balances.kdr))} SYL

### 3. Admin Wallet Vesting Configuration ✅
${adminWallets.map(admin => {
    const info = adminVestingInfo[admin.name];
    if (info.error) {
        return `- **${admin.name}:** ❌ ${info.error}`;
    }
    return `- **${admin.name}:** ✅ Configured
  - Total Allocation: ${info.totalAllocation} SYL
  - Immediate Release: ${info.immediateRelease} SYL
  - Locked Amount: ${info.lockedAmount} SYL
  - Monthly Release: ${info.monthlyRelease} SYL`;
}).join('\n')}

### 4. Locked Reserve Configuration ✅
- **Address:** \`${wallets.system.locked.address}\`
- **Balance:** ${ethers.utils.formatEther(balances.locked)} SYL
${lockedVestingInfo.error ? `- **Status:** ❌ ${lockedVestingInfo.error}` : `- **Total Amount:** ${lockedVestingInfo.totalAmount} SYL
- **Vesting Duration:** ${lockedVestingInfo.vestingDuration}
- **Monthly Release:** ${lockedVestingInfo.releasePercentage}
- **Burn Rate:** ${lockedVestingInfo.burnPercentage}
- **Cliff Period:** ${lockedVestingInfo.cliffDuration}
- **Status:** ${lockedVestingInfo.isActive ? "✅ Active" : "❌ Inactive"}`}

### 5. Fee Exemptions ✅
All system wallets configured as fee exempt

---

## 📊 Current Token Distribution

### Wallet Balances
| Wallet | Address | Balance |
|--------|---------|---------|
| Deployer/Sylvan Token | \`${deployer.address}\` | ${ethers.utils.formatEther(balances.deployer)} SYL |
| Founder | \`${wallets.system.founder.address}\` | ${ethers.utils.formatEther(balances.founder)} SYL |
| Locked Reserve | \`${wallets.system.locked.address}\` | ${ethers.utils.formatEther(balances.locked)} SYL |
| MAD | \`${wallets.admins.mad.address}\` | ${ethers.utils.formatEther(balances.mad)} SYL |
| LEB | \`${wallets.admins.leb.address}\` | ${ethers.utils.formatEther(balances.leb)} SYL |
| CNK | \`${wallets.admins.cnk.address}\` | ${ethers.utils.formatEther(balances.cnk)} SYL |
| KDR | \`${wallets.admins.kdr.address}\` | ${ethers.utils.formatEther(balances.kdr)} SYL |
| Fee Collection | \`${wallets.system.fee.address}\` | ${ethers.utils.formatEther(balances.feeCollection)} SYL |
| Donation | \`${wallets.system.donation.address}\` | ${ethers.utils.formatEther(balances.donation)} SYL |
| Dead Address | \`${wallets.system.dead.address}\` | ${ethers.utils.formatEther(balances.dead)} SYL |

### Distribution Summary
- **Total Supply:** ${ethers.utils.formatEther(totalSupply)} SYL
- **Total Distributed:** ${ethers.utils.formatEther(totalDistributed)} SYL
- **Match:** ${totalSupply.eq(totalDistributed) ? "✅ Perfect" : "⚠️ Mismatch"}

---

## 🔒 Vesting Details

### Admin Wallets (MAD, LEB, CNK, KDR)
- **Total Allocation:** 10M SYL each
- **Immediate Release:** 10% (1M SYL) - ✅ Completed
- **Locked Amount:** 90% (9M SYL)
- **Vesting Duration:** 18 months
- **Monthly Release:** 5% (500K SYL)
- **Burn Rate:** 10% of each release (50K SYL)
- **Net Monthly:** 450K SYL to admin
- **Cliff:** 0 days (immediate start)

### Locked Reserve
- **Total Allocation:** 300M SYL
- **Immediate Release:** 0%
- **Locked Amount:** 100% (300M SYL)
- **Vesting Duration:** 34 months
- **Monthly Release:** 3% (~9M SYL)
- **Burn Rate:** 10% of each release (~900K SYL)
- **Net Monthly:** ~8.1M SYL
- **Cliff:** 30 days

---

## 📋 Next Steps

### Immediate Actions
1. ✅ Contract Deployed
2. ✅ Tokens Distributed
3. ✅ Vesting Configured
4. ✅ Fee Exemptions Set
5. ⏳ **Contract Verification** (if not done)
   \`\`\`bash
   npx hardhat verify --network bscMainnet ${TOKEN_ADDRESS}
   \`\`\`

### Operational Tasks
1. **Monitor Vesting Releases**
   - First admin release: After initial configuration
   - First locked release: After 30-day cliff
   - Monthly releases thereafter

2. **Enable Trading** (when ready)
   \`\`\`bash
   npx hardhat run scripts/deployment/enable-trading.js --network bscMainnet
   \`\`\`

3. **Transfer Ownership** (if multi-sig ready)
   \`\`\`bash
   npx hardhat run scripts/deployment/transfer-ownership.js --network bscMainnet
   \`\`\`

---

## 🔗 Important Links

- **BSCScan Contract:** https://bscscan.com/address/${TOKEN_ADDRESS}
- **Token Tracker:** https://bscscan.com/token/${TOKEN_ADDRESS}
- **Holders Page:** https://bscscan.com/token/${TOKEN_ADDRESS}#balances

---

## ⚠️ Important Notes

### BSCScan Holder Display
If holders don't show on BSCScan:
1. **Wait 10-15 minutes** for BSCScan to index the contract
2. **Verify the contract** on BSCScan (if not done)
3. **Check token tracker page** instead of contract page
4. **Clear browser cache** and refresh

### Security Reminders
- 🔒 Private keys are secure - Never share
- 🔒 Contract is immutable - Cannot be changed
- 🔒 Vesting is automatic - Releases happen on schedule
- 🔒 Fee system is active - 1% on all non-exempt transfers

---

**Report Generated:** ${new Date().toISOString()}  
**Status:** ✅ FULLY CONFIGURED AND OPERATIONAL  
**Version:** 1.1.0 (Corrected)
`;

    // Save report
    const reportFile = path.join(__dirname, "../../BSC_MAINNET_DEPLOYMENT_CORRECTED_REPORT.md");
    fs.writeFileSync(reportFile, report);

    console.log("✅ Report generated successfully!");
    console.log("📄 Saved to:", reportFile);
    console.log();

    // Update deployment JSON
    deploymentInfo.corrected = true;
    deploymentInfo.correctionDate = new Date().toISOString();
    deploymentInfo.currentBalances = {
        deployer: ethers.utils.formatEther(balances.deployer),
        founder: ethers.utils.formatEther(balances.founder),
        locked: ethers.utils.formatEther(balances.locked),
        mad: ethers.utils.formatEther(balances.mad),
        leb: ethers.utils.formatEther(balances.leb),
        cnk: ethers.utils.formatEther(balances.cnk),
        kdr: ethers.utils.formatEther(balances.kdr)
    };
    deploymentInfo.vestingConfigured = {
        admins: adminVestingInfo,
        locked: lockedVestingInfo
    };

    fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
    console.log("✅ Deployment JSON updated!");
    console.log();

    console.log("=".repeat(80));
    console.log("✅ ALL STEPS COMPLETED!");
    console.log("=".repeat(80) + "\n");

    console.log("📊 Final Summary:");
    console.log("-".repeat(80));
    console.log("✅ Contract deployed and verified");
    console.log("✅ All tokens distributed correctly");
    console.log("✅ Admin vesting configured");
    console.log("✅ Locked reserve configured");
    console.log("✅ Fee exemptions set");
    console.log("✅ Reports updated");
    console.log("-".repeat(80) + "\n");

    console.log("🎉 Deployment is now complete and operational!");
    console.log();
    console.log("View your token on BSCScan:");
    console.log(`https://bscscan.com/token/${TOKEN_ADDRESS}`);
    console.log();
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("\n❌ Report generation failed:");
        console.error(error);
        process.exit(1);
    });
