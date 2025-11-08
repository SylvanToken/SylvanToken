#!/usr/bin/env node

/**
 * @title Wallet Analysis Tool
 * @dev Comprehensive analysis of wallets by fee status and authority levels
 */

const FeeExemptionManager = require('./fee-exemption-manager.js');
const deploymentConfig = require('../../config/deployment.config.js');

class WalletAnalyzer {
    constructor() {
        this.exemptionManager = new FeeExemptionManager();
        this.config = deploymentConfig;
    }

    /**
     * Get all wallets from configuration
     */
    getAllWallets() {
        const wallets = [];

        // System wallets
        Object.entries(this.config.wallets.system).forEach(([key, wallet]) => {
            wallets.push({
                ...wallet,
                category: 'system',
                subcategory: key,
                authority: this.getAuthorityLevel(wallet, 'system'),
                feeStatus: wallet.feeExempt ? 'EXEMPT' : 'CHARGED'
            });
        });

        // Former admin wallets (now regular users)
        Object.entries(this.config.wallets.admins).forEach(([key, wallet]) => {
            wallets.push({
                ...wallet,
                category: 'user', // Changed from 'admin' to 'user'
                subcategory: key,
                authority: this.getAuthorityLevel(wallet, 'user'),
                feeStatus: wallet.feeExempt ? 'EXEMPT' : 'CHARGED'
            });
        });

        // Partnership wallets (if any)
        if (this.config.wallets.partnerships) {
            Object.entries(this.config.wallets.partnerships).forEach(([key, wallet]) => {
                wallets.push({
                    ...wallet,
                    category: 'partnership',
                    subcategory: key,
                    authority: this.getAuthorityLevel(wallet, 'partnership'),
                    feeStatus: wallet.feeExempt ? 'EXEMPT' : 'CHARGED'
                });
            });
        }

        // Business wallets (if any)
        if (this.config.wallets.business) {
            Object.entries(this.config.wallets.business).forEach(([key, wallet]) => {
                wallets.push({
                    ...wallet,
                    category: 'business',
                    subcategory: key,
                    authority: this.getAuthorityLevel(wallet, 'business'),
                    feeStatus: wallet.feeExempt ? 'EXEMPT' : 'CHARGED'
                });
            });
        }

        return wallets;
    }

    /**
     * Determine authority level based on wallet properties
     */
    getAuthorityLevel(wallet, category) {
        // System wallets have highest authority
        if (category === 'system') {
            if (wallet.role === 'system' && !wallet.canChangeExemption) {
                return 'CRITICAL'; // Cannot be changed
            }
            return 'HIGH'; // System but can be changed
        }

        // Former admin wallets now have no authority
        if (category === 'admin') {
            if (wallet.adminPrivileges === false) {
                return 'NONE'; // No admin privileges
            }
            if (wallet.lockStatus === 'active') {
                return 'HIGH'; // Active vesting (legacy)
            }
            return 'MEDIUM'; // Post-vesting (legacy)
        }

        // Partnership wallets
        if (category === 'partnership') {
            return 'MEDIUM';
        }

        // Business wallets
        if (category === 'business') {
            return 'LOW';
        }

        // User wallets (former admins)
        if (category === 'user') {
            return 'NONE'; // No authority
        }

        return 'UNKNOWN';
    }

    /**
     * Get wallets by fee status
     */
    getWalletsByFeeStatus(feeStatus) {
        const allWallets = this.getAllWallets();
        return allWallets.filter(wallet => wallet.feeStatus === feeStatus);
    }

    /**
     * Get wallets by authority level
     */
    getWalletsByAuthority(authority) {
        const allWallets = this.getAllWallets();
        return allWallets.filter(wallet => wallet.authority === authority);
    }

    /**
     * Get wallets by category
     */
    getWalletsByCategory(category) {
        const allWallets = this.getAllWallets();
        return allWallets.filter(wallet => wallet.category === category);
    }

    /**
     * Generate comprehensive analysis
     */
    generateAnalysis() {
        const allWallets = this.getAllWallets();
        
        const analysis = {
            timestamp: new Date().toISOString(),
            totalWallets: allWallets.length,
            
            // Fee Status Analysis
            feeStatus: {
                exempt: this.getWalletsByFeeStatus('EXEMPT'),
                charged: this.getWalletsByFeeStatus('CHARGED')
            },
            
            // Authority Level Analysis
            authority: {
                critical: this.getWalletsByAuthority('CRITICAL'),
                high: this.getWalletsByAuthority('HIGH'),
                medium: this.getWalletsByAuthority('MEDIUM'),
                low: this.getWalletsByAuthority('LOW')
            },
            
            // Category Analysis
            categories: {
                system: this.getWalletsByCategory('system'),
                user: this.getWalletsByCategory('user'),
                partnership: this.getWalletsByCategory('partnership'),
                business: this.getWalletsByCategory('business')
            },
            
            // Summary Statistics
            summary: {
                feeExemptCount: this.getWalletsByFeeStatus('EXEMPT').length,
                feeChargedCount: this.getWalletsByFeeStatus('CHARGED').length,
                criticalAuthorityCount: this.getWalletsByAuthority('CRITICAL').length,
                highAuthorityCount: this.getWalletsByAuthority('HIGH').length,
                mediumAuthorityCount: this.getWalletsByAuthority('MEDIUM').length,
                lowAuthorityCount: this.getWalletsByAuthority('LOW').length,
                noneAuthorityCount: this.getWalletsByAuthority('NONE').length
            }
        };

        return analysis;
    }

    /**
     * Display fee status analysis
     */
    displayFeeStatusAnalysis() {
        console.log("\n💰 FEE STATUS ANALYSIS");
        console.log("=".repeat(60));
        
        const exemptWallets = this.getWalletsByFeeStatus('EXEMPT');
        const chargedWallets = this.getWalletsByFeeStatus('CHARGED');
        
        console.log(`\n🚫 FEE EXEMPT WALLETS (${exemptWallets.length})`);
        console.log("-".repeat(40));
        exemptWallets.forEach((wallet, index) => {
            console.log(`${index + 1}. ${wallet.name}`);
            console.log(`   Address: ${wallet.address}`);
            console.log(`   Category: ${wallet.category.toUpperCase()}`);
            console.log(`   Authority: ${wallet.authority}`);
            console.log(`   Can Change: ${wallet.canChangeExemption ? '✅ YES' : '❌ NO'}`);
            console.log(`   Reason: ${wallet.exemptReason}`);
            console.log("");
        });
        
        console.log(`\n💸 FEE CHARGED WALLETS (${chargedWallets.length})`);
        console.log("-".repeat(40));
        if (chargedWallets.length === 0) {
            console.log("   No wallets currently charged fees (all are exempt)");
        } else {
            chargedWallets.forEach((wallet, index) => {
                console.log(`${index + 1}. ${wallet.name}`);
                console.log(`   Address: ${wallet.address}`);
                console.log(`   Category: ${wallet.category.toUpperCase()}`);
                console.log(`   Authority: ${wallet.authority}`);
                console.log(`   Reason: Standard fee applies`);
                console.log("");
            });
        }
    }

    /**
     * Display authority level analysis
     */
    displayAuthorityAnalysis() {
        console.log("\n🔐 AUTHORITY LEVEL ANALYSIS");
        console.log("=".repeat(60));
        
        const authorities = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'NONE'];
        
        authorities.forEach(authority => {
            const wallets = this.getWalletsByAuthority(authority);
            console.log(`\n${this.getAuthorityIcon(authority)} ${authority} AUTHORITY (${wallets.length})`);
            console.log("-".repeat(40));
            
            if (wallets.length === 0) {
                console.log("   No wallets with this authority level");
            } else {
                wallets.forEach((wallet, index) => {
                    console.log(`${index + 1}. ${wallet.name}`);
                    console.log(`   Address: ${wallet.address}`);
                    console.log(`   Category: ${wallet.category.toUpperCase()}`);
                    console.log(`   Fee Status: ${wallet.feeStatus}`);
                    console.log(`   Can Change Exemption: ${wallet.canChangeExemption ? '✅ YES' : '❌ NO'}`);
                    if (wallet.role) console.log(`   Role: ${wallet.role}`);
                    if (wallet.lockStatus) console.log(`   Lock Status: ${wallet.lockStatus}`);
                    console.log("");
                });
            }
        });
    }

    /**
     * Display category analysis
     */
    displayCategoryAnalysis() {
        console.log("\n📂 CATEGORY ANALYSIS");
        console.log("=".repeat(60));
        
        const categories = ['system', 'user', 'partnership', 'business'];
        
        categories.forEach(category => {
            const wallets = this.getWalletsByCategory(category);
            console.log(`\n${this.getCategoryIcon(category)} ${category.toUpperCase()} WALLETS (${wallets.length})`);
            console.log("-".repeat(40));
            
            if (wallets.length === 0) {
                console.log("   No wallets in this category");
            } else {
                wallets.forEach((wallet, index) => {
                    console.log(`${index + 1}. ${wallet.name}`);
                    console.log(`   Address: ${wallet.address}`);
                    console.log(`   Fee Status: ${wallet.feeStatus}`);
                    console.log(`   Authority: ${wallet.authority}`);
                    console.log(`   Description: ${wallet.description}`);
                    if (wallet.allocation) console.log(`   Allocation: ${wallet.allocation} tokens`);
                    console.log("");
                });
            }
        });
    }

    /**
     * Display summary statistics
     */
    displaySummary() {
        const analysis = this.generateAnalysis();
        
        console.log("\n📊 WALLET SUMMARY STATISTICS");
        console.log("=".repeat(60));
        
        console.log(`\n💰 Fee Status Distribution:`);
        console.log(`   Fee Exempt: ${analysis.summary.feeExemptCount} wallets`);
        console.log(`   Fee Charged: ${analysis.summary.feeChargedCount} wallets`);
        console.log(`   Exemption Rate: ${((analysis.summary.feeExemptCount / analysis.totalWallets) * 100).toFixed(1)}%`);
        
        console.log(`\n🔐 Authority Distribution:`);
        console.log(`   Critical: ${analysis.summary.criticalAuthorityCount} wallets`);
        console.log(`   High: ${analysis.summary.highAuthorityCount} wallets`);
        console.log(`   Medium: ${analysis.summary.mediumAuthorityCount} wallets`);
        console.log(`   Low: ${analysis.summary.lowAuthorityCount} wallets`);
        
        console.log(`\n📂 Category Distribution:`);
        console.log(`   System: ${analysis.categories.system.length} wallets`);
        console.log(`   Admin: ${analysis.categories.admin ? analysis.categories.admin.length : 0} wallets`);
        console.log(`   User: ${analysis.categories.user ? analysis.categories.user.length : 0} wallets`);
        console.log(`   Partnership: ${analysis.categories.partnership.length} wallets`);
        console.log(`   Business: ${analysis.categories.business.length} wallets`);
        
        console.log(`\n📈 Total Wallets: ${analysis.totalWallets}`);
    }

    /**
     * Display complete analysis
     */
    displayCompleteAnalysis() {
        console.log("\n🔍 COMPLETE WALLET ANALYSIS");
        console.log("=".repeat(80));
        console.log(`Generated: ${new Date().toISOString()}`);
        
        this.displaySummary();
        this.displayFeeStatusAnalysis();
        this.displayAuthorityAnalysis();
        this.displayCategoryAnalysis();
        
        console.log("\n" + "=".repeat(80));
        console.log("Analysis Complete!");
    }

    /**
     * Get authority icon
     */
    getAuthorityIcon(authority) {
        const icons = {
            'CRITICAL': '🔴',
            'HIGH': '🟠',
            'MEDIUM': '🟡',
            'LOW': '🟢',
            'NONE': '⚫'
        };
        return icons[authority] || '⚪';
    }

    /**
     * Get category icon
     */
    getCategoryIcon(category) {
        const icons = {
            'system': '🏛️',
            'user': '👤',
            'partnership': '🤝',
            'business': '🏢'
        };
        return icons[category] || '📁';
    }

    /**
     * Export analysis to JSON
     */
    exportAnalysis() {
        const analysis = this.generateAnalysis();
        const fs = require('fs');
        const filename = `wallet-analysis-${Date.now()}.json`;
        
        fs.writeFileSync(filename, JSON.stringify(analysis, null, 2));
        console.log(`\n💾 Analysis exported to: ${filename}`);
        
        return filename;
    }

    /**
     * Run analysis based on command line arguments
     */
    run() {
        const args = process.argv.slice(2);
        const command = args[0] || 'complete';
        
        switch (command) {
            case 'fee':
            case 'fees':
                this.displayFeeStatusAnalysis();
                break;
            case 'authority':
            case 'auth':
                this.displayAuthorityAnalysis();
                break;
            case 'category':
            case 'cat':
                this.displayCategoryAnalysis();
                break;
            case 'summary':
                this.displaySummary();
                break;
            case 'export':
                this.exportAnalysis();
                break;
            case 'complete':
            case 'all':
            default:
                this.displayCompleteAnalysis();
                break;
        }
    }
}

// Run if called directly
if (require.main === module) {
    const analyzer = new WalletAnalyzer();
    analyzer.run();
}

module.exports = WalletAnalyzer;