// Complete Mainnet Deployment Fix
// This script runs all fix steps in sequence

const { exec } = require("child_process");
const util = require("util");
const execPromise = util.promisify(exec);

async function runScript(scriptPath, stepName) {
    console.log("\n" + "=".repeat(80));
    console.log(`🚀 Running: ${stepName}`);
    console.log("=".repeat(80) + "\n");

    try {
        const { stdout, stderr } = await execPromise(
            `npx hardhat run ${scriptPath} --network bscMainnet`,
            { maxBuffer: 1024 * 1024 * 10 } // 10MB buffer
        );
        
        console.log(stdout);
        if (stderr) {
            console.error("Warnings:", stderr);
        }
        
        console.log(`\n✅ ${stepName} completed successfully!\n`);
        return true;
    } catch (error) {
        console.error(`\n❌ ${stepName} failed:`);
        console.error(error.message);
        if (error.stdout) console.log(error.stdout);
        if (error.stderr) console.error(error.stderr);
        return false;
    }
}

async function main() {
    console.log("\n" + "=".repeat(80));
    console.log("🔧 MAINNET DEPLOYMENT COMPLETE FIX");
    console.log("=".repeat(80) + "\n");

    console.log("This script will:");
    console.log("1. Configure vesting schedules for admin wallets and locked reserve");
    console.log("2. Transfer 300M SYL to locked reserve");
    console.log("3. Generate updated deployment report");
    console.log();

    console.log("⚠️  WARNING: This will execute transactions on BSC MAINNET!");
    console.log("⚠️  Make sure you have sufficient BNB for gas fees!");
    console.log("\nPress Ctrl+C to cancel, or wait 15 seconds to continue...\n");
    
    await new Promise(resolve => setTimeout(resolve, 15000));

    const steps = [
        {
            script: "scripts/deployment/fix-mainnet-step1-configure-vesting.js",
            name: "Step 1: Configure Vesting Schedules"
        },
        {
            script: "scripts/deployment/fix-mainnet-step2-transfer-locked.js",
            name: "Step 2: Transfer Locked Reserve"
        },
        {
            script: "scripts/deployment/fix-mainnet-step3-update-report.js",
            name: "Step 3: Update Reports"
        }
    ];

    let allSuccess = true;

    for (const step of steps) {
        const success = await runScript(step.script, step.name);
        if (!success) {
            allSuccess = false;
            console.log("\n❌ Fix process stopped due to error.");
            console.log("Please review the error and try again.");
            process.exit(1);
        }
        
        // Wait a bit between steps
        await new Promise(resolve => setTimeout(resolve, 3000));
    }

    if (allSuccess) {
        console.log("\n" + "=".repeat(80));
        console.log("🎉 ALL FIX STEPS COMPLETED SUCCESSFULLY!");
        console.log("=".repeat(80) + "\n");

        console.log("📊 Summary:");
        console.log("-".repeat(80));
        console.log("✅ Admin vesting schedules configured");
        console.log("✅ Locked reserve vesting configured");
        console.log("✅ 300M SYL transferred to locked reserve");
        console.log("✅ Deployment reports updated");
        console.log("-".repeat(80) + "\n");

        console.log("📋 Next Steps:");
        console.log("-".repeat(80));
        console.log("1. Verify final status:");
        console.log("   npx hardhat run scripts/deployment/check-mainnet-status.js --network bscMainnet");
        console.log();
        console.log("2. Verify contract on BSCScan (if not done):");
        console.log("   npx hardhat verify --network bscMainnet <CONTRACT_ADDRESS>");
        console.log();
        console.log("3. Check holders on BSCScan:");
        console.log("   Wait 10-15 minutes for indexing, then visit:");
        console.log("   https://bscscan.com/token/<CONTRACT_ADDRESS>#balances");
        console.log();
        console.log("4. Enable trading when ready:");
        console.log("   npx hardhat run scripts/deployment/enable-trading.js --network bscMainnet");
        console.log("-".repeat(80) + "\n");

        console.log("🎊 Your deployment is now fully configured and operational!");
        console.log();
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("\n❌ Fix process failed:");
        console.error(error);
        process.exit(1);
    });
