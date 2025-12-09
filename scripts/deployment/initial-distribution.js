const { ethers } = require("hardhat");
const deploymentConfig = require("../../config/deployment.config.js");

async function main() {
    console.log("\n╔════════════════════════════════════════════════════════════════╗");
    console.log("║           🪙 SYLVAN TOKEN - İLK DAĞITIM VE VESTING           ║");
    console.log("╚════════════════════════════════════════════════════════════════╝\n");

    // Get deployer
    const [deployer] = await ethers.getSigners();
    console.log("📋 Deployer:", deployer.address);
    
    const balance = await deployer.getBalance();
    console.log("💰 Balance:", ethers.utils.formatEther(balance), "BNB\n");

    // Contract address (BSC Testnet) - Latest deployment
    const tokenAddress = "0xc4dBA24a5D8F9f23cd989E5af5231952fD64CE70";
    
    // Get contract instance
    console.log("🔗 Connecting to SylvanToken...");
    const token = await ethers.getContractAt("SylvanToken", tokenAddress);
    console.log("✅ Connected to:", tokenAddress, "\n");

    // Verify token info
    const name = await token.name();
    const symbol = await token.symbol();
    const totalSupply = await token.totalSupply();
    const deployerBalance = await token.balanceOf(deployer.address);
    
    console.log("📊 Token Bilgileri:");
    console.log("  Name:", name);
    console.log("  Symbol:", symbol);
    console.log("  Total Supply:", ethers.utils.formatEther(totalSupply), "SYL");
    console.log("  Deployer Balance:", ethers.utils.formatEther(deployerBalance), "SYL\n");

    // Get wallet addresses from config
    const wallets = {
        sylvanToken: deploymentConfig.wallets.system.sylvanToken.address,
        founder: deploymentConfig.wallets.system.founder.address,
        locked: deploymentConfig.wallets.system.locked.address,
        mad: deploymentConfig.wallets.admins.mad.address,
        leb: deploymentConfig.wallets.admins.leb.address,
        cnk: deploymentConfig.wallets.admins.cnk.address,
        kdr: deploymentConfig.wallets.admins.kdr.address
    };

    console.log("═══════════════════════════════════════════════════════════════");
    console.log("PHASE 1: FEE EXEMPTION SETUP");
    console.log("═══════════════════════════════════════════════════════════════\n");

    // Add fee exemptions for system wallets
    const exemptWallets = [
        { address: wallets.sylvanToken, name: "Sylvan Token Wallet" },
        { address: wallets.founder, name: "Founder Wallet" },
        { address: wallets.locked, name: "Locked Reserve Wallet" }
    ];

    for (const wallet of exemptWallets) {
        const isExempt = await token.isExempt(wallet.address);
        if (!isExempt) {
            console.log(`➕ Adding fee exemption: ${wallet.name}`);
            console.log(`   Address: ${wallet.address}`);
            const tx = await token.addExemptWallet(wallet.address);
            await tx.wait();
            console.log(`   ✅ Transaction: ${tx.hash}\n`);
        } else {
            console.log(`✓ Already exempt: ${wallet.name}\n`);
        }
    }

    console.log("═══════════════════════════════════════════════════════════════");
    console.log("PHASE 2: INITIAL TOKEN DISTRIBUTION");
    console.log("═══════════════════════════════════════════════════════════════\n");

    // Distribution amounts (convert to wei)
    const distributions = [
        {
            name: "Sylvan Token Wallet",
            address: wallets.sylvanToken,
            amount: ethers.utils.parseEther(deploymentConfig.allocations.sylvanToken),
            description: "Main project wallet (50%)"
        },
        {
            name: "Locked Reserve Wallet",
            address: wallets.locked,
            amount: ethers.utils.parseEther(deploymentConfig.allocations.locked),
            description: "Locked tokens (30%)"
        },
        {
            name: "Founder Wallet",
            address: wallets.founder,
            amount: ethers.utils.parseEther(deploymentConfig.allocations.founder),
            description: "Founder allocation (16%)"
        },
        {
            name: "MAD Admin Wallet",
            address: wallets.mad,
            amount: ethers.utils.parseEther(deploymentConfig.allocations.admins.mad),
            description: "Admin allocation (1%)"
        },
        {
            name: "LEB Admin Wallet",
            address: wallets.leb,
            amount: ethers.utils.parseEther(deploymentConfig.allocations.admins.leb),
            description: "Admin allocation (1%)"
        },
        {
            name: "CNK Admin Wallet",
            address: wallets.cnk,
            amount: ethers.utils.parseEther(deploymentConfig.allocations.admins.cnk),
            description: "Admin allocation (1%)"
        },
        {
            name: "KDR Admin Wallet",
            address: wallets.kdr,
            amount: ethers.utils.parseEther(deploymentConfig.allocations.admins.kdr),
            description: "Admin allocation (1%)"
        }
    ];

    let totalDistributed = ethers.BigNumber.from(0);

    for (const dist of distributions) {
        console.log(`💸 Distributing to: ${dist.name}`);
        console.log(`   Address: ${dist.address}`);
        console.log(`   Amount: ${ethers.utils.formatEther(dist.amount)} SYL`);
        console.log(`   Description: ${dist.description}`);
        
        const currentBalance = await token.balanceOf(dist.address);
        console.log(`   Current Balance: ${ethers.utils.formatEther(currentBalance)} SYL`);
        
        if (currentBalance.lt(dist.amount)) {
            const amountToSend = ethers.BigNumber.from(dist.amount).sub(currentBalance);
            console.log(`   Sending: ${ethers.utils.formatEther(amountToSend)} SYL`);
            
            const tx = await token.transfer(dist.address, amountToSend);
            await tx.wait();
            console.log(`   ✅ Transaction: ${tx.hash}`);
            
            const newBalance = await token.balanceOf(dist.address);
            console.log(`   New Balance: ${ethers.utils.formatEther(newBalance)} SYL\n`);
            
            totalDistributed = totalDistributed.add(amountToSend);
        } else {
            console.log(`   ✓ Already has sufficient balance\n`);
        }
    }

    console.log("═══════════════════════════════════════════════════════════════");
    console.log("PHASE 3: VESTING SCHEDULES SETUP");
    console.log("═══════════════════════════════════════════════════════════════\n");

    // Vesting schedules
    const vestingSchedules = [
        {
            name: "Locked Reserve Wallet",
            beneficiary: wallets.locked,
            totalAmount: ethers.utils.parseEther(deploymentConfig.allocations.locked),
            cliffDays: deploymentConfig.lockParameters.locked.cliffDays,
            durationMonths: deploymentConfig.lockParameters.locked.durationMonths,
            monthlyReleasePercentage: deploymentConfig.lockParameters.locked.monthlyRelease,
            burnPercentage: deploymentConfig.lockParameters.locked.burnPercentage,
            description: "100% locked, 34 months, 3% monthly, 10% burn"
        },
        {
            name: "Founder Wallet",
            beneficiary: wallets.founder,
            totalAmount: ethers.utils.parseEther(deploymentConfig.allocations.founder)
                .mul(deploymentConfig.lockParameters.founder.lockPercentage)
                .div(10000),
            cliffDays: deploymentConfig.lockParameters.founder.cliffDays,
            durationMonths: deploymentConfig.lockParameters.founder.durationMonths,
            monthlyReleasePercentage: deploymentConfig.lockParameters.founder.monthlyRelease,
            burnPercentage: deploymentConfig.lockParameters.founder.burnPercentage,
            description: "80% locked, 16 months, 5% monthly, no burn"
        },
        {
            name: "MAD Admin Wallet",
            beneficiary: wallets.mad,
            totalAmount: ethers.utils.parseEther(deploymentConfig.allocations.admins.mad)
                .mul(deploymentConfig.lockParameters.admin.lockPercentage)
                .div(10000),
            cliffDays: deploymentConfig.lockParameters.admin.cliffDays,
            durationMonths: deploymentConfig.lockParameters.admin.durationMonths,
            monthlyReleasePercentage: deploymentConfig.lockParameters.admin.monthlyRelease,
            burnPercentage: deploymentConfig.lockParameters.admin.burnPercentage,
            description: "80% locked, 16 months, 5% monthly, no burn"
        },
        {
            name: "LEB Admin Wallet",
            beneficiary: wallets.leb,
            totalAmount: ethers.utils.parseEther(deploymentConfig.allocations.admins.leb)
                .mul(deploymentConfig.lockParameters.admin.lockPercentage)
                .div(10000),
            cliffDays: deploymentConfig.lockParameters.admin.cliffDays,
            durationMonths: deploymentConfig.lockParameters.admin.durationMonths,
            monthlyReleasePercentage: deploymentConfig.lockParameters.admin.monthlyRelease,
            burnPercentage: deploymentConfig.lockParameters.admin.burnPercentage,
            description: "80% locked, 16 months, 5% monthly, no burn"
        },
        {
            name: "CNK Admin Wallet",
            beneficiary: wallets.cnk,
            totalAmount: ethers.utils.parseEther(deploymentConfig.allocations.admins.cnk)
                .mul(deploymentConfig.lockParameters.admin.lockPercentage)
                .div(10000),
            cliffDays: deploymentConfig.lockParameters.admin.cliffDays,
            durationMonths: deploymentConfig.lockParameters.admin.durationMonths,
            monthlyReleasePercentage: deploymentConfig.lockParameters.admin.monthlyRelease,
            burnPercentage: deploymentConfig.lockParameters.admin.burnPercentage,
            description: "80% locked, 16 months, 5% monthly, no burn"
        },
        {
            name: "KDR Admin Wallet",
            beneficiary: wallets.kdr,
            totalAmount: ethers.utils.parseEther(deploymentConfig.allocations.admins.kdr)
                .mul(deploymentConfig.lockParameters.admin.lockPercentage)
                .div(10000),
            cliffDays: deploymentConfig.lockParameters.admin.cliffDays,
            durationMonths: deploymentConfig.lockParameters.admin.durationMonths,
            monthlyReleasePercentage: deploymentConfig.lockParameters.admin.monthlyRelease,
            burnPercentage: deploymentConfig.lockParameters.admin.burnPercentage,
            description: "80% locked, 16 months, 5% monthly, no burn"
        }
    ];

    for (const schedule of vestingSchedules) {
        console.log(`🔒 Creating vesting schedule: ${schedule.name}`);
        console.log(`   Beneficiary: ${schedule.beneficiary}`);
        console.log(`   Total Amount: ${ethers.utils.formatEther(schedule.totalAmount)} SYL`);
        console.log(`   Cliff: ${schedule.cliffDays} days`);
        console.log(`   Duration: ${schedule.durationMonths} months`);
        console.log(`   Monthly Release: ${schedule.monthlyReleasePercentage / 100}%`);
        console.log(`   Burn: ${schedule.burnPercentage / 100}%`);
        console.log(`   Description: ${schedule.description}`);
        
        try {
            // Check if vesting schedule already exists
            const existingSchedule = await token.getVestingSchedule(schedule.beneficiary);
            if (existingSchedule.totalAmount.gt(0)) {
                console.log(`   ✓ Vesting schedule already exists\n`);
                continue;
            }
        } catch (error) {
            // Schedule doesn't exist, continue to create
        }
        
        const isAdmin = schedule.name.includes("Admin");
        const tx = await token.createVestingSchedule(
            schedule.beneficiary,
            schedule.totalAmount,
            schedule.cliffDays,
            schedule.durationMonths,
            schedule.monthlyReleasePercentage,
            schedule.burnPercentage,
            isAdmin
        );
        await tx.wait();
        console.log(`   ✅ Transaction: ${tx.hash}\n`);
    }

    console.log("═══════════════════════════════════════════════════════════════");
    console.log("PHASE 4: VERIFICATION");
    console.log("═══════════════════════════════════════════════════════════════\n");

    // Verify balances
    console.log("📊 Final Balances:\n");
    
    for (const dist of distributions) {
        const balance = await token.balanceOf(dist.address);
        console.log(`${dist.name}:`);
        console.log(`  Balance: ${ethers.utils.formatEther(balance)} SYL`);
        console.log(`  Expected: ${ethers.utils.formatEther(dist.amount)} SYL`);
        console.log(`  Status: ${balance.gte(dist.amount) ? "✅" : "❌"}\n`);
    }

    // Verify vesting schedules
    console.log("🔒 Vesting Schedules:\n");
    
    for (const schedule of vestingSchedules) {
        try {
            const vestingInfo = await token.getVestingSchedule(schedule.beneficiary);
            console.log(`${schedule.name}:`);
            console.log(`  Total: ${ethers.utils.formatEther(vestingInfo.totalAmount)} SYL`);
            console.log(`  Released: ${ethers.utils.formatEther(vestingInfo.releasedAmount)} SYL`);
            console.log(`  Remaining: ${ethers.utils.formatEther(vestingInfo.totalAmount.sub(vestingInfo.releasedAmount))} SYL`);
            console.log(`  Status: ${vestingInfo.totalAmount.gt(0) ? "✅ Active" : "❌ Not Found"}\n`);
        } catch (error) {
            console.log(`${schedule.name}: ❌ Error reading schedule\n`);
        }
    }

    // Final summary
    const finalDeployerBalance = await token.balanceOf(deployer.address);
    
    console.log("═══════════════════════════════════════════════════════════════");
    console.log("✅ DISTRIBUTION COMPLETE!");
    console.log("═══════════════════════════════════════════════════════════════\n");
    
    console.log("📊 Summary:");
    console.log(`  Total Distributed: ${ethers.utils.formatEther(totalDistributed)} SYL`);
    console.log(`  Deployer Remaining: ${ethers.utils.formatEther(finalDeployerBalance)} SYL`);
    console.log(`  Vesting Schedules: ${vestingSchedules.length} created`);
    console.log(`  Fee Exemptions: ${exemptWallets.length} added\n`);

    // Save distribution info
    const distributionInfo = {
        network: "bscTestnet",
        timestamp: new Date().toISOString(),
        tokenAddress: tokenAddress,
        deployer: deployer.address,
        totalDistributed: ethers.utils.formatEther(totalDistributed),
        distributions: distributions.map(d => ({
            name: d.name,
            address: d.address,
            amount: ethers.utils.formatEther(d.amount)
        })),
        vestingSchedules: vestingSchedules.map(s => ({
            name: s.name,
            beneficiary: s.beneficiary,
            amount: ethers.utils.formatEther(s.totalAmount),
            duration: s.durationMonths
        }))
    };

    const fs = require("fs");
    const distributionPath = `deployments/distribution-${Date.now()}.json`;
    fs.writeFileSync(distributionPath, JSON.stringify(distributionInfo, null, 2));
    console.log("💾 Distribution info saved to:", distributionPath);
    
    console.log("\n✅ Initial distribution and vesting setup complete!\n");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("\n❌ Distribution Failed:");
        console.error(error);
        process.exit(1);
    });
