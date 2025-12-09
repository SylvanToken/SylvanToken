#!/usr/bin/env node

/**
 * @title Fee Exemption Management CLI
 * @dev Command-line interface for managing fee exemptions
 */

const FeeExemptionManager = require('./fee-exemption-manager.js');
const { ethers } = require('ethers');

// Ethers v5 compatibility helper
const isAddress = (address) => {
    try {
        return ethers.utils.isAddress(address);
    } catch {
        return false;
    }
};

class ExemptionCLI {
    constructor() {
        this.manager = new FeeExemptionManager();
    }

    /**
     * Display help information
     */
    showHelp() {
        console.log(`
🚫 Fee Exemption Management CLI

Usage: node scripts/manage-exemptions.js <command> [options]

Commands:
  list                    List all exempt wallets
  summary                 Show exemption summary
  validate               Validate exemption configuration
  report                 Generate detailed exemption report
  audit                  Show audit trail
  check <address>        Check if address is exempt
  details <address>      Get wallet details by address
  add                    Add new exempt wallet (interactive)
  export                 Export configuration for deployment

Examples:
  node scripts/manage-exemptions.js list
  node scripts/manage-exemptions.js check 0x1234...
  node scripts/manage-exemptions.js summary
  node scripts/manage-exemptions.js validate
        `);
    }

    /**
     * List all exempt wallets
     */
    listExemptWallets() {
        const wallets = this.manager.getAllExemptWallets();
        
        console.log(`\n🚫 All Exempt Wallets (${wallets.length})`);
        console.log("=".repeat(80));
        
        wallets.forEach((wallet, index) => {
            console.log(`\n${index + 1}. ${wallet.name}`);
            console.log(`   Address: ${wallet.address}`);
            console.log(`   Category: ${wallet.category}`);
            console.log(`   Priority: ${wallet.priority || 'medium'}`);
            console.log(`   Can Change: ${wallet.canChange ? '✅' : '❌'}`);
            console.log(`   Reason: ${wallet.reason}`);
            if (wallet.expiryCondition) {
                console.log(`   Expiry: ${wallet.expiryCondition}`);
            }
        });
    }

    /**
     * Show exemption summary
     */
    showSummary() {
        this.manager.displayExemptionSummary();
    }

    /**
     * Validate exemption configuration
     */
    validateConfiguration() {
        console.log("\n🔍 Validating Exemption Configuration...");
        const validation = this.manager.validateExemptionConfig();
        
        if (validation.isValid) {
            console.log("✅ Configuration is valid!");
        } else {
            console.log("❌ Configuration has errors:");
            validation.errors.forEach(error => console.log(`  - ${error}`));
        }
        
        if (validation.warnings.length > 0) {
            console.log("\n⚠️ Warnings:");
            validation.warnings.forEach(warning => console.log(`  - ${warning}`));
        }
        
        console.log(`\nTotal Wallets: ${validation.totalWallets}/${validation.maxAllowed}`);
    }

    /**
     * Generate detailed report
     */
    generateReport() {
        console.log("\n📊 Generating Detailed Exemption Report...");
        const report = this.manager.generateExemptionReport();
        
        console.log(JSON.stringify(report, null, 2));
        
        // Save report to file
        const fs = require('fs');
        const reportPath = `exemption-report-${Date.now()}.json`;
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
        console.log(`\n💾 Report saved to: ${reportPath}`);
    }

    /**
     * Show audit trail
     */
    showAuditTrail(limit = 20) {
        console.log(`\n📋 Audit Trail (Last ${limit} entries)`);
        console.log("=".repeat(60));
        
        const auditTrail = this.manager.getAuditTrail(limit);
        
        if (auditTrail.length === 0) {
            console.log("No audit entries found.");
            return;
        }
        
        auditTrail.forEach((entry, index) => {
            console.log(`\n${index + 1}. ${entry.action.toUpperCase()}`);
            console.log(`   Timestamp: ${entry.timestamp}`);
            console.log(`   Wallet: ${entry.walletAddress}`);
            console.log(`   Performed By: ${entry.performedBy}`);
            if (entry.details) {
                console.log(`   Details: ${JSON.stringify(entry.details, null, 2)}`);
            }
        });
    }

    /**
     * Check if address is exempt
     */
    checkAddress(address) {
        if (!address) {
            console.log("❌ Please provide an address to check");
            return;
        }
        
        if (!isAddress(address)) {
            console.log(`❌ Invalid address: ${address}`);
            return;
        }
        
        const isExempt = this.manager.isAddressExempt(address);
        console.log(`\n🔍 Address Check: ${address}`);
        console.log(`Fee Exempt: ${isExempt ? '✅ YES' : '❌ NO'}`);
        
        if (isExempt) {
            const details = this.manager.getWalletDetails(address);
            if (details) {
                console.log(`Name: ${details.name}`);
                console.log(`Category: ${details.category}`);
                console.log(`Reason: ${details.reason}`);
            }
        }
    }

    /**
     * Get wallet details by address
     */
    getWalletDetails(address) {
        if (!address) {
            console.log("❌ Please provide an address");
            return;
        }
        
        if (!isAddress(address)) {
            console.log(`❌ Invalid address: ${address}`);
            return;
        }
        
        const details = this.manager.getWalletDetails(address);
        
        if (!details) {
            console.log(`❌ No exempt wallet found for address: ${address}`);
            return;
        }
        
        console.log(`\n📋 Wallet Details: ${address}`);
        console.log("=".repeat(50));
        Object.entries(details).forEach(([key, value]) => {
            if (value !== null && value !== undefined) {
                console.log(`${key}: ${value}`);
            }
        });
    }

    /**
     * Interactive add new exempt wallet
     */
    async addExemptWallet() {
        const readline = require('readline');
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        const question = (prompt) => new Promise(resolve => rl.question(prompt, resolve));

        try {
            console.log("\n➕ Add New Exempt Wallet");
            console.log("=".repeat(30));
            
            const address = await question("Wallet Address: ");
            if (!isAddress(address)) {
                console.log("❌ Invalid address");
                rl.close();
                return;
            }
            
            if (this.manager.isAddressExempt(address)) {
                console.log("❌ Address is already exempt");
                rl.close();
                return;
            }
            
            const name = await question("Wallet Name: ");
            const description = await question("Description: ");
            const reason = await question("Exemption Reason: ");
            const category = await question("Category (system/admin/partnership/business): ");
            const priority = await question("Priority (low/medium/high/critical): ");
            const canExpire = await question("Can exemption expire? (y/n): ");
            
            let expiryCondition = null;
            if (canExpire.toLowerCase() === 'y') {
                expiryCondition = await question("Expiry Condition: ");
            }
            
            const walletConfig = {
                address,
                name,
                description,
                reason,
                category,
                priority,
                canExpire: canExpire.toLowerCase() === 'y',
                expiryCondition
            };
            
            console.log("\n📋 Review Configuration:");
            console.log(JSON.stringify(walletConfig, null, 2));
            
            const confirm = await question("\nConfirm addition? (y/n): ");
            if (confirm.toLowerCase() === 'y') {
                const newWallet = this.manager.addExemptWallet(walletConfig);
                console.log("\n✅ Wallet added successfully!");
                console.log("⚠️ Note: You need to update the deployment configuration and redeploy to apply changes.");
            } else {
                console.log("❌ Addition cancelled");
            }
            
        } catch (error) {
            console.error("❌ Error adding wallet:", error.message);
        } finally {
            rl.close();
        }
    }

    /**
     * Export configuration for deployment
     */
    exportConfiguration() {
        console.log("\n📤 Exporting Configuration for Deployment...");
        
        try {
            const exportData = this.manager.exportForDeployment();
            
            console.log("✅ Export successful!");
            console.log(`Addresses: ${exportData.count}`);
            console.log(`Validated: ${exportData.validated}`);
            console.log(`Timestamp: ${exportData.timestamp}`);
            
            // Save to file
            const fs = require('fs');
            const exportPath = `exemption-export-${Date.now()}.json`;
            fs.writeFileSync(exportPath, JSON.stringify(exportData, null, 2));
            console.log(`💾 Export saved to: ${exportPath}`);
            
            return exportData;
            
        } catch (error) {
            console.error("❌ Export failed:", error.message);
        }
    }

    /**
     * Run CLI with command line arguments
     */
    run() {
        const args = process.argv.slice(2);
        const command = args[0];
        
        if (!command || command === 'help') {
            this.showHelp();
            return;
        }
        
        switch (command) {
            case 'list':
                this.listExemptWallets();
                break;
            case 'summary':
                this.showSummary();
                break;
            case 'validate':
                this.validateConfiguration();
                break;
            case 'report':
                this.generateReport();
                break;
            case 'audit':
                const limit = parseInt(args[1]) || 20;
                this.showAuditTrail(limit);
                break;
            case 'check':
                this.checkAddress(args[1]);
                break;
            case 'details':
                this.getWalletDetails(args[1]);
                break;
            case 'add':
                this.addExemptWallet();
                break;
            case 'export':
                this.exportConfiguration();
                break;
            default:
                console.log(`❌ Unknown command: ${command}`);
                this.showHelp();
        }
    }
}

// Run CLI if called directly
if (require.main === module) {
    const cli = new ExemptionCLI();
    cli.run();
}

module.exports = ExemptionCLI;