#!/usr/bin/env node

/**
 * @title Create Pause Proposal CLI
 * @dev Command-line interface for creating pause/unpause proposals
 */

const hre = require("hardhat");
const { ethers } = require("hardhat");

class ProposalCreationCLI {
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
📝 Create Pause Proposal CLI

Usage: node scripts/management/create-pause-proposal.js <command> <contractAddress> [options]

Commands:
  pause <contractAddress>      Create a pause proposal
  unpause <contractAddress>    Create an unpause proposal
  status <contractAddress>     Show current pause status

Options:
  --network <network>    Network to use (default: localhost)

Examples:
  node scripts/management/create-pause-proposal.js pause 0x1234...
  node scripts/management/create-pause-proposal.js unpause 0x1234... --network bscTestnet
  node scripts/management/create-pause-proposal.js status 0x1234...
        `);
    }

    /**
     * Create pause proposal
     */
    async createPauseProposal() {
        try {
            console.log("\n⏸️ Creating Pause Proposal");
            console.log("=".repeat(80));

            // Check if already paused
            const pauseInfo = await this.token.getPauseInfo();
            if (pauseInfo.isPaused) {
                console.log("⚠️ Contract is already paused");
                return;
            }

            // Check if signer is authorized
            const isAuthorized = await this.token.isAuthorizedSigner(this.signer.address);
            if (!isAuthorized) {
                console.log("❌ You are not an authorized signer");
                return;
            }

            // Create proposal
            console.log("📝 Submitting pause proposal...");
            const tx = await this.token.createPauseProposal();
            console.log(`📝 Transaction sent: ${tx.hash}`);
            console.log("⏳ Waiting for confirmation...");

            const receipt = await tx.wait();
            
            // Extract proposal ID from event
            const event = receipt.events?.find(e => e.event === 'PauseProposalCreated');
            const proposalId = event?.args?.proposalId;

            console.log(`✅ Pause proposal created successfully!`);
            console.log(`📋 Proposal ID: ${proposalId}`);
            console.log(`🔗 Block: ${receipt.blockNumber}`);

            // Show proposal details
            await this.showProposalDetails(proposalId);
        } catch (error) {
            if (error.message.includes("ProposalCooldownActive")) {
                console.error("❌ Cooldown period active. Please wait before creating another proposal.");
            } else {
                console.error("❌ Error creating pause proposal:", error.message);
            }
        }
    }

    /**
     * Create unpause proposal
     */
    async createUnpauseProposal() {
        try {
            console.log("\n▶️ Creating Unpause Proposal");
            console.log("=".repeat(80));

            // Check if paused
            const pauseInfo = await this.token.getPauseInfo();
            if (!pauseInfo.isPaused) {
                console.log("⚠️ Contract is not paused");
                return;
            }

            // Check if signer is authorized
            const isAuthorized = await this.token.isAuthorizedSigner(this.signer.address);
            if (!isAuthorized) {
                console.log("❌ You are not an authorized signer");
                return;
            }

            // Create proposal
            console.log("📝 Submitting unpause proposal...");
            const tx = await this.token.createUnpauseProposal();
            console.log(`📝 Transaction sent: ${tx.hash}`);
            console.log("⏳ Waiting for confirmation...");

            const receipt = await tx.wait();
            
            // Extract proposal ID from event
            const event = receipt.events?.find(e => e.event === 'UnpauseProposalCreated');
            const proposalId = event?.args?.proposalId;

            console.log(`✅ Unpause proposal created successfully!`);
            console.log(`📋 Proposal ID: ${proposalId}`);
            console.log(`🔗 Block: ${receipt.blockNumber}`);

            // Show proposal details
            await this.showProposalDetails(proposalId);
        } catch (error) {
            if (error.message.includes("ProposalCooldownActive")) {
                console.error("❌ Cooldown period active. Please wait before creating another proposal.");
            } else {
                console.error("❌ Error creating unpause proposal:", error.message);
            }
        }
    }

    /**
     * Show proposal details
     */
    async showProposalDetails(proposalId) {
        try {
            console.log("\n📋 Proposal Details");
            console.log("=".repeat(80));

            const status = await this.token.getProposalStatus(proposalId);
            const config = await this.token.getMultiSigConfig();

            console.log(`Proposal ID: ${proposalId}`);
            console.log(`Type: ${status.proposalType === 0 ? 'PAUSE' : 'UNPAUSE'}`);
            console.log(`Proposer: ${status.proposer}`);
            console.log(`Created At: ${new Date(status.createdAt * 1000).toLocaleString()}`);
            console.log(`Executed: ${status.executed ? '✅ YES' : '❌ NO'}`);
            console.log(`Cancelled: ${status.cancelled ? '✅ YES' : '❌ NO'}`);
            console.log(`Approval Count: ${status.approvalCount}/${config.quorumThreshold}`);
            
            if (status.approvers.length > 0) {
                console.log(`\nApprovers:`);
                status.approvers.forEach((approver, index) => {
                    console.log(`  ${index + 1}. ${approver}`);
                });
            }

            const canExecute = await this.token.canExecuteProposal(proposalId);
            console.log(`\nCan Execute: ${canExecute ? '✅ YES' : '❌ NO'}`);

            if (!canExecute && !status.executed && !status.cancelled) {
                const timelockEnd = status.createdAt + config.timelockDuration;
                const now = Math.floor(Date.now() / 1000);
                if (now < timelockEnd) {
                    const remainingTime = timelockEnd - now;
                    console.log(`⏳ Timelock remaining: ${Math.floor(remainingTime / 3600)} hours ${Math.floor((remainingTime % 3600) / 60)} minutes`);
                }
                if (status.approvalCount < config.quorumThreshold) {
                    console.log(`⏳ Approvals needed: ${config.quorumThreshold - status.approvalCount}`);
                }
            }

            console.log("\n" + "=".repeat(80));
        } catch (error) {
            console.error("❌ Error fetching proposal details:", error.message);
        }
    }

    /**
     * Show current pause status
     */
    async showPauseStatus() {
        try {
            console.log("\n📊 Current Pause Status");
            console.log("=".repeat(80));

            const pauseInfo = await this.token.getPauseInfo();
            const config = await this.token.getMultiSigConfig();

            console.log(`Contract Paused: ${pauseInfo.isPaused ? '✅ YES' : '❌ NO'}`);

            if (pauseInfo.isPaused) {
                console.log(`Paused At: ${new Date(pauseInfo.pausedAt * 1000).toLocaleString()}`);
                
                const now = Math.floor(Date.now() / 1000);
                const pauseDuration = now - pauseInfo.pausedAt;
                console.log(`Pause Duration: ${Math.floor(pauseDuration / 86400)} days ${Math.floor((pauseDuration % 86400) / 3600)} hours`);
                
                const remainingTime = pauseInfo.remainingTime;
                if (remainingTime > 0) {
                    console.log(`Auto-Unpause In: ${Math.floor(remainingTime / 86400)} days ${Math.floor((remainingTime % 86400) / 3600)} hours`);
                } else {
                    console.log(`⚠️ Auto-unpause time exceeded - contract will unpause on next transfer`);
                }
            }

            console.log(`\nMax Pause Duration: ${config.maxPauseDuration / 86400} days`);
            console.log(`Timelock Duration: ${config.timelockDuration / 3600} hours`);

            console.log("\n" + "=".repeat(80));
        } catch (error) {
            console.error("❌ Error fetching pause status:", error.message);
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

        // Get contract address
        const contractAddress = args[1];

        if (!contractAddress) {
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
            case 'pause':
                await this.createPauseProposal();
                break;
            case 'unpause':
                await this.createUnpauseProposal();
                break;
            case 'status':
                await this.showPauseStatus();
                break;
            default:
                console.log(`❌ Unknown command: ${command}`);
                this.showHelp();
        }
    }
}

// Run CLI if called directly
if (require.main === module) {
    const cli = new ProposalCreationCLI();
    cli.run().catch(error => {
        console.error("Fatal error:", error);
        process.exit(1);
    });
}

module.exports = ProposalCreationCLI;
