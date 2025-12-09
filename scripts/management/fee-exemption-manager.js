/**
 * @title Fee Exemption Manager
 * @dev Advanced utility for managing fee exemptions with detailed tracking
 */

const deploymentConfig = require("../../config/deployment.config.js");
const { ethers } = require("ethers");
const fs = require('fs');
const path = require('path');

class FeeExemptionManager {
    constructor() {
        this.config = deploymentConfig;
        this.auditLogPath = path.join(__dirname, '..', 'logs', 'exemption-audit.json');
        this.ensureLogDirectory();
    }

    /**
     * Ensure log directory exists
     */
    ensureLogDirectory() {
        const logDir = path.dirname(this.auditLogPath);
        if (!fs.existsSync(logDir)) {
            fs.mkdirSync(logDir, { recursive: true });
        }
    }

    /**
     * Get all exempt wallets with detailed information
     */
    getAllExemptWallets() {
        const exemptWallets = [];

        // Add permanent exemptions
        this.config.exemptions.permanent.forEach(wallet => {
            exemptWallets.push({
                ...wallet,
                category: 'permanent',
                canChange: false,
                priority: 'critical'
            });
        });

        // Add temporary exemptions
        this.config.exemptions.temporary.forEach(wallet => {
            exemptWallets.push({
                ...wallet,
                category: 'temporary',
                canChange: true
            });
        });

        // Add admin exemptions
        this.config.exemptions.admins.forEach(wallet => {
            exemptWallets.push({
                ...wallet,
                category: 'admin',
                canChange: true
            });
        });

        return exemptWallets;
    }

    /**
     * Get exempt addresses only (for contract deployment)
     */
    getExemptAddresses() {
        return this.getAllExemptWallets().map(wallet => wallet.address);
    }

    /**
     * Get exempt wallets by category
     */
    getExemptWalletsByCategory(category) {
        const allWallets = this.getAllExemptWallets();
        return allWallets.filter(wallet => wallet.category === category);
    }

    /**
     * Get exempt wallets by priority
     */
    getExemptWalletsByPriority(priority) {
        const allWallets = this.getAllExemptWallets();
        return allWallets.filter(wallet => wallet.priority === priority);
    }

    /**
     * Check if address is exempt
     */
    isAddressExempt(address) {
        const exemptAddresses = this.getExemptAddresses();
        return exemptAddresses.includes(address.toLowerCase()) || 
               exemptAddresses.includes(ethers.utils.getAddress(address));
    }

    /**
     * Get wallet details by address
     */
    getWalletDetails(address) {
        const allWallets = this.getAllExemptWallets();
        return allWallets.find(wallet => 
            wallet.address.toLowerCase() === address.toLowerCase()
        );
    }

    /**
     * Validate exemption configuration
     */
    validateExemptionConfig() {
        const errors = [];
        const warnings = [];
        const allWallets = this.getAllExemptWallets();

        // Check for duplicate addresses
        const addresses = allWallets.map(w => w.address.toLowerCase());
        const duplicates = addresses.filter((addr, index) => addresses.indexOf(addr) !== index);
        if (duplicates.length > 0) {
            errors.push(`Duplicate addresses found: ${duplicates.join(', ')}`);
        }

        // Validate addresses
        allWallets.forEach((wallet, index) => {
            if (!ethers.utils.isAddress(wallet.address)) {
                errors.push(`Invalid address at index ${index}: ${wallet.address}`);
            }
        });

        // Check maximum limit
        if (allWallets.length > this.config.exemptions.management.maxExemptWallets) {
            errors.push(`Too many exempt wallets: ${allWallets.length} > ${this.config.exemptions.management.maxExemptWallets}`);
        }

        // Check for missing required fields
        allWallets.forEach((wallet, index) => {
            if (!wallet.name) warnings.push(`Missing name for wallet at index ${index}`);
            if (!wallet.reason) warnings.push(`Missing reason for wallet at index ${index}`);
        });

        return {
            isValid: errors.length === 0,
            errors,
            warnings,
            totalWallets: allWallets.length,
            maxAllowed: this.config.exemptions.management.maxExemptWallets
        };
    }

    /**
     * Generate exemption report
     */
    generateExemptionReport() {
        const allWallets = this.getAllExemptWallets();
        const validation = this.validateExemptionConfig();

        const report = {
            timestamp: new Date().toISOString(),
            summary: {
                totalExemptWallets: allWallets.length,
                maxAllowed: this.config.exemptions.management.maxExemptWallets,
                remainingSlots: this.config.exemptions.management.maxExemptWallets - allWallets.length,
                isValid: validation.isValid
            },
            categories: {
                permanent: this.getExemptWalletsByCategory('permanent').length,
                temporary: this.getExemptWalletsByCategory('temporary').length,
                admin: this.getExemptWalletsByCategory('admin').length
            },
            priorities: {
                critical: this.getExemptWalletsByPriority('critical').length,
                high: this.getExemptWalletsByPriority('high').length,
                medium: this.getExemptWalletsByPriority('medium').length,
                low: this.getExemptWalletsByPriority('low').length
            },
            wallets: allWallets.map(wallet => ({
                address: wallet.address,
                name: wallet.name,
                category: wallet.category,
                priority: wallet.priority || 'medium',
                canChange: wallet.canChange,
                reason: wallet.reason,
                expiryCondition: wallet.expiryCondition || 'None'
            })),
            validation: validation
        };

        return report;
    }

    /**
     * Log exemption change to audit trail
     */
    logExemptionChange(action, walletAddress, details, performedBy = 'system') {
        const logEntry = {
            timestamp: new Date().toISOString(),
            action, // 'add', 'remove', 'modify'
            walletAddress,
            details,
            performedBy,
            blockNumber: null, // Will be set after transaction
            transactionHash: null // Will be set after transaction
        };

        let auditLog = [];
        if (fs.existsSync(this.auditLogPath)) {
            try {
                const logData = fs.readFileSync(this.auditLogPath, 'utf8');
                auditLog = JSON.parse(logData);
            } catch (error) {
                console.warn('Failed to read audit log:', error.message);
            }
        }

        auditLog.push(logEntry);

        // Keep only last 1000 entries
        if (auditLog.length > 1000) {
            auditLog = auditLog.slice(-1000);
        }

        try {
            fs.writeFileSync(this.auditLogPath, JSON.stringify(auditLog, null, 2));
        } catch (error) {
            console.error('Failed to write audit log:', error.message);
        }

        return logEntry;
    }

    /**
     * Get audit trail
     */
    getAuditTrail(limit = 100) {
        if (!fs.existsSync(this.auditLogPath)) {
            return [];
        }

        try {
            const logData = fs.readFileSync(this.auditLogPath, 'utf8');
            const auditLog = JSON.parse(logData);
            return auditLog.slice(-limit).reverse(); // Most recent first
        } catch (error) {
            console.error('Failed to read audit log:', error.message);
            return [];
        }
    }

    /**
     * Add new exempt wallet (for future use)
     */
    addExemptWallet(walletConfig) {
        // Validate required fields
        const required = ['address', 'name', 'reason', 'category', 'priority'];
        const missing = required.filter(field => !walletConfig[field]);
        if (missing.length > 0) {
            throw new Error(`Missing required fields: ${missing.join(', ')}`);
        }

        // Validate address
        if (!ethers.utils.isAddress(walletConfig.address)) {
            throw new Error(`Invalid address: ${walletConfig.address}`);
        }

        // Check if already exists
        if (this.isAddressExempt(walletConfig.address)) {
            throw new Error(`Address already exempt: ${walletConfig.address}`);
        }

        // Add metadata
        const newWallet = {
            ...walletConfig,
            addedDate: new Date().toISOString(),
            addedBy: 'manual',
            reviewDate: new Date(Date.now() + (this.config.exemptions.management.reviewPeriod * 24 * 60 * 60 * 1000)).toISOString()
        };

        // Log the addition
        this.logExemptionChange('add', walletConfig.address, newWallet);

        console.log(`✅ Exempt wallet added: ${walletConfig.name} (${walletConfig.address})`);
        console.log(`   Category: ${walletConfig.category}`);
        console.log(`   Priority: ${walletConfig.priority}`);
        console.log(`   Reason: ${walletConfig.reason}`);

        return newWallet;
    }

    /**
     * Display exemption summary
     */
    displayExemptionSummary() {
        const report = this.generateExemptionReport();
        
        console.log("\n🚫 Fee Exemption Summary");
        console.log("=".repeat(50));
        console.log(`Total Exempt Wallets: ${report.summary.totalExemptWallets}/${report.summary.maxAllowed}`);
        console.log(`Remaining Slots: ${report.summary.remainingSlots}`);
        console.log(`Configuration Valid: ${report.summary.isValid ? '✅' : '❌'}`);
        
        console.log("\n📊 Categories:");
        Object.entries(report.categories).forEach(([category, count]) => {
            console.log(`  ${category}: ${count} wallets`);
        });
        
        console.log("\n🎯 Priorities:");
        Object.entries(report.priorities).forEach(([priority, count]) => {
            console.log(`  ${priority}: ${count} wallets`);
        });

        if (report.validation.errors.length > 0) {
            console.log("\n❌ Errors:");
            report.validation.errors.forEach(error => console.log(`  - ${error}`));
        }

        if (report.validation.warnings.length > 0) {
            console.log("\n⚠️ Warnings:");
            report.validation.warnings.forEach(warning => console.log(`  - ${warning}`));
        }

        return report;
    }

    /**
     * Export exemption configuration for contract deployment
     */
    exportForDeployment() {
        const validation = this.validateExemptionConfig();
        if (!validation.isValid) {
            throw new Error(`Exemption configuration invalid: ${validation.errors.join(', ')}`);
        }

        return {
            addresses: this.getExemptAddresses(),
            count: this.getAllExemptWallets().length,
            maxAllowed: this.config.exemptions.management.maxExemptWallets,
            validated: true,
            timestamp: new Date().toISOString()
        };
    }
}

module.exports = FeeExemptionManager;