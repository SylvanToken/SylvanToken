#!/usr/bin/env node

/**
 * @title Multi-Sig Pause Signer Management CLI
 * @dev Command-line interface for managing authorized signers
 */

const hre = require("hardhat");
const { ethers } = require("hardhat");

class SignerManagementCLI {
    constructor() {
        this.token = null;
        this.signer = null;
    }

    /**
     * Initialize contract connection
     */
    async initialize(contractAddress, network = "localhost") {
        try {
            console.log(`\n🔗 Connecting to network: ${network}`);
            console.log(`📄 Contract address: ${contractAddress}`);

            // Get signer
            const [deployer] = await ethers.getSigners();
            this.signer = deployer;
            console.log(`👤 Using account: ${deployer.address}`);

            // Get contract instance
            const SylvanToken = await ethers.getContractFactory("SylvanToken");
            this.token = SylvanToken.attach(contractAddress);

            console.log("✅ Connected successfully!\n");
            return true;
        } catch (error) {
            console.error("❌ Connection failed:", error.message);
            return false;
        }
    }

    /**
     * Display help information
     */
    showHelp() {
        console.log(`
🔐 Multi-Sig Pause Signer Management CLI

Usage: node scripts/management/manage-pause-signers.js <command> [options]

Commands:
  list <contractAddress>                    List all authorized signers
  add <contractAddress> <signerAddress>     Add new authorized signer
  remove <contractAddress> <signerAddress>  Remove authorized signer
  check <contractAddress> <address>         Check if address is authorized
  config <contractAddress>                  Show multi-sig configuration
  update-quorum <contractAddress> <threshold> Update quorum threshold

Options:
  --network <network>    Network to use (default: localhost)

Examples:
  node scripts/management/manage-pause-signers.js list 0x1234...
  node scripts/management/manage-pause-signers.js add 0x1234... 0x5678... --network bscTestnet
  node scripts/management/manage-pause-signers.js config 0x1234...
        `);
    }

    /**
     * List all authorized signers
     */
    async listSigners() {
        try {
            console.log("\n🔐 Authorized Signers");
            console.log("=".repeat(80));

            const signers = await this.token.getAuthorizedSigners();
            const config = await this.token.getMultiSigConfig();

            console.log(`\nTotal Signers: ${signers.length}`);
            console.log(`Quorum Threshold: ${config.quorumThreshold}`);
            console.log(`Timelock Duration: ${config.timelockDuration / 3600} hours`);
            console.log(`Max Pause Duration: ${config.maxPauseDuration / 86400} days\n`);

            signers.forEach((signer, index) => {
                console.log(`${index + 1}. ${signer}`);
            });

            console.log("\n" + "=".repeat(80));
        } catch (error) {
            console.error("❌ Error listing signers:", error.message);
        }
    }

    /**
     * Add new authorized signer
     */
    async addSigner(signerAddress) {
        try {
            if (!ethers.utils.isAddress(signerAddress)) {
                console.log("❌ Invalid address format");
                return;
            }

            console.log(`\n➕ Adding signer: ${signerAddress}`);

            // Check if already authorized
            const isAuthorized = await this.token.isAuthorizedSigner(signerAddress);
            if (isAuthorized) {
                console.log("⚠️ Address is already an authorized signer");
                return;
            }

            // Add signer
            const tx = await this.token.addAuthorizedSigner(signerAddress);
            console.log(`📝 Transaction sent: ${tx.hash}`);
            console.log("⏳ Waiting for confirmation...");

            const receipt = await tx.wait();
            console.log(`✅ Signer added successfully! (Block: ${receipt.blockNumber})`);

            // Show updated list
            await this.listSigners();
        } catch (error) {
            console.error("❌ Error adding signer:", error.message);
        }
    }

    /**
     * Remove authorized signer
     */
    async removeSigner(signerAddress) {
        try {
            if (!ethers.utils.isAddress(signerAddress)) {
                console.log("❌ Invalid address format");
                return;
            }

            console.log(`\n➖ Removing signer: ${signerAddress}`);

            // Check if authorized
            const isAuthorized = await this.token.isAuthorizedSigner(signerAddress);
            if (!isAuthorized) {
                console.log("⚠️ Address is not an authorized signer");
                return;
            }

            // Remove signer
            const tx = await this.token.removeAuthorizedSigner(signerAddress);
            console.log(`📝 Transaction sent: ${tx.hash}`);
            console.log("⏳ Waiting for confirmation...");

            const receipt = await tx.wait();
            console.log(`✅ Signer removed successfully! (Block: ${receipt.blockNumber})`);

            // Show updated list
            await this.listSigners();
        } catch (error) {
            console.error("❌ Error removing signer:", error.message);
        }
    }

    /**
     * Check if address is authorized signer
     */
    async checkSigner(address) {
        try {
            if (!ethers.utils.isAddress(address)) {
                console.log("❌ Invalid address format");
                return;
            }

            console.log(`\n🔍 Checking address: ${address}`);

            const isAuthorized = await this.token.isAuthorizedSigner(address);
            console.log(`Authorized Signer: ${isAuthorized ? '✅ YES' : '❌ NO'}`);
        } catch (error) {
            console.error("❌ Error checking signer:", error.message);
        }
    }

    /**
     * Show multi-sig configuration
     */
    async showConfig() {
        try {
            console.log("\n⚙️ Multi-Sig Configuration");
            console.log("=".repeat(80));

            const config = await this.token.getMultiSigConfig();
            const signers = await this.token.getAuthorizedSigners();

            console.log(`\nAuthorized Signers: ${signers.length}`);
            console.log(`Quorum Threshold: ${config.quorumThreshold}`);
            console.log(`Timelock Duration: ${config.timelockDuration} seconds (${config.timelockDuration / 3600} hours)`);
            console.log(`Max Pause Duration: ${config.maxPauseDuration} seconds (${config.maxPauseDuration / 86400} days)`);
            console.log(`Proposal Lifetime: ${config.proposalLifetime} seconds (${config.proposalLifetime / 86400} days)`);
            console.log(`Proposal Cooldown: ${config.proposalCooldown} seconds (${config.proposalCooldown / 3600} hours)`);

            console.log("\n" + "=".repeat(80));
        } catch (error) {
            console.error("❌ Error fetching configuration:", error.message);
        }
    }

    /**
     * Update quorum threshold
     */
    async updateQuorum(newThreshold) {
        try {
            const threshold = parseInt(newThreshold);
            if (isNaN(threshold) || threshold < 2 || threshold > 10) {
                console.log("❌ Invalid threshold. Must be between 2 and 10");
                return;
            }

            console.log(`\n🔄 Updating quorum threshold to: ${threshold}`);

            const signers = await this.token.getAuthorizedSigners();
            if (threshold > signers.length) {
                console.log(`❌ Threshold (${threshold}) cannot exceed number of signers (${signers.length})`);
                return;
            }

            const tx = await this.token.updateQuorumThreshold(threshold);
            console.log(`📝 Transaction sent: ${tx.hash}`);
            console.log("⏳ Waiting for confirmation...");

            const receipt = await tx.wait();
            console.log(`✅ Quorum threshold updated successfully! (Block: ${receipt.blockNumber})`);
            console.log("⚠️ Note: All pending proposals have been invalidated");

            // Show updated config
            await this.showConfig();
        } catch (error) {
            console.error("❌ Error updating quorum:", error.message);
        }
    }

    /**
     * Run CLI with command line arguments
     */
    async run() {
        const args = process.argv.slice(2);
        const command = args[0];

        if (!command || command === 'help') {
            this.showHelp();
            return;
        }

        // Extract network option
        const networkIndex = args.indexOf('--network');
        const network = networkIndex !== -1 ? args[networkIndex + 1] : 'localhost';

        // Get contract address (should be second argument)
        const contractAddress = args[1];

        if (!contractAddress && command !== 'help') {
            console.log("❌ Contract address required");
            this.showHelp();
            return;
        }

        // Initialize connection
        const connected = await this.initialize(contractAddress, network);
        if (!connected) {
            return;
        }

        // Execute command
        switch (command) {
            case 'list':
                await this.listSigners();
                break;
            case 'add':
                const signerToAdd = args[2];
                if (!signerToAdd) {
                    console.log("❌ Signer address required");
                    return;
                }
                await this.addSigner(signerToAdd);
                break;
            case 'remove':
                const signerToRemove = args[2];
                if (!signerToRemove) {
                    console.log("❌ Signer address required");
                    return;
                }
                await this.removeSigner(signerToRemove);
                break;
            case 'check':
                const addressToCheck = args[2];
                if (!addressToCheck) {
                    console.log("❌ Address required");
                    return;
                }
                await this.checkSigner(addressToCheck);
                break;
            case 'config':
                await this.showConfig();
                break;
            case 'update-quorum':
                const newThreshold = args[2];
                if (!newThreshold) {
                    console.log("❌ New threshold required");
                    return;
                }
                await this.updateQuorum(newThreshold);
                break;
            default:
                console.log(`❌ Unknown command: ${command}`);
                this.showHelp();
        }
    }
}

// Run CLI if called directly
if (require.main === module) {
    const cli = new SignerManagementCLI();
    cli.run().catch(error => {
        console.error("Fatal error:", error);
        process.exit(1);
    });
}

module.exports = SignerManagementCLI;
