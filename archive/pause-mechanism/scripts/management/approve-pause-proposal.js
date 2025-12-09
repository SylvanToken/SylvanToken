#!/usr/bin/env node

/**
 * @title Approve Pause Proposal CLI
 * @dev Command-line interface for approving pause/unpause proposals
 */

const hre = require("hardhat");
const { ethers } = require("hardhat");

class ProposalApprovalCLI {
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
✅ Approve Pause Proposal CLI

Usage: node scripts/management/approve-pause-proposal.js <command> <contractAddress> [proposalId] [options]

Commands:
  approve <contractAddress> <proposalId>    Approve a proposal
  status <contractAddress> <proposalId>     Show proposal status
  list <contractAddress>                    List all active proposals (if implemented)

Options:
  --network <network>    Network to use (default: localhost)

Examples:
  node scripts/management/approve-pause-proposal.js approve 0x1234... 1
  node scripts/management/approve-pause-proposal.js status 0x1234... 1 --network bscTestnet
        `);
    }

    /**
     * Approve a proposal
     */
    async approveProposal(proposalId) {
        try {
            console.log(`\n✅ Approving Proposal #${proposalId}`);
            console.log("=".repeat(80));

            // Check if signer is authorized
            const isAuthorized = await this.token.isAuthorizedSigner(this.signer.address);
            if (!isAuthorized) {
                console.log("❌ You are not an authorized signer");
                return;
            }

            // Get proposal status before approval
            const statusBefore = await this.token.getProposalStatus(proposalId);
            
            if (statusBefore.executed) {
                console.log("⚠️ Proposal has already been executed");
                return;
            }

            if (statusBefore.cancelled) {
                console.log("⚠️ Proposal has been cancelled");
                return;
            }

            // Check if already approved by this signer
            const hasApproved = statusBefore.approvers.includes(this.signer.address);
            if (hasApproved) {
                console.log("⚠️ You have already approved this proposal");
                return;
            }

            console.log(`\nProposal Type: ${statusBefore.proposalType === 0 ? 'PAUSE' : 'UNPAUSE'}`);
            console.log(`Current Approvals: ${statusBefore.approvalCount}`);
            console.log(`Proposer: ${statusBefore.proposer}`);

            // Approve proposal
            console.log("\n📝 Submitting approval...");
            const tx = await this.token.approvePauseProposal(proposalId);
            console.log(`📝 Transaction sent: ${tx.hash}`);
            console.log("⏳ Waiting for confirmation...");

            const receipt = await tx.wait();
            console.log(`✅ Approval submitted successfully! (Block: ${receipt.blockNumber})`);

            // Get updated status
            const statusAfter = await this.token.getProposalStatus(proposalId);
            const config = await this.token.getMultiSigConfig();

            console.log(`\n📊 Updated Status:`);
            console.log(`Approval Count: ${statusAfter.approvalCount}/${config.quorumThreshold}`);

            if (statusAfter.approvalCount >= config.quorumThreshold) {
                console.log(`\n🎉 Quorum reached! Proposal can be executed after timelock.`);
                
                const canExecute = await this.token.canExecuteProposal(proposalId);
                if (canExecute) {
                    console.log(`✅ Proposal is ready for execution now!`);
                } else {
                    const timelockEnd = statusAfter.createdAt + config.timelockDuration;
                    const now = Math.floor(Date.now() / 1000);
                    const remainingTime = timelockEnd - now;
                    if (remainingTime > 0) {
                        console.log(`⏳ Timelock remaining: ${Math.floor(remainingTime / 3600)} hours ${Math.floor((remainingTime % 3600) / 60)} minutes`);
                    }
                }
            } else {
                const needed = config.quorumThreshold - statusAfter.approvalCount;
                console.log(`⏳ ${needed} more approval${needed > 1 ? 's' : ''} needed to reach quorum`);
            }

            // Show all approvers
            if (statusAfter.approvers.length > 0) {
                console.log(`\nApprovers:`);
                statusAfter.approvers.forEach((approver, index) => {
                    console.log(`  ${index + 1}. ${approver}`);
                });
            }

            console.log("\n" + "=".repeat(80));
        } catch (error) {
            if (error.message.includes("AlreadyApproved")) {
                console.error("❌ You have already approved this proposal");
            } else if (error.message.includes("ProposalNotFound")) {
                console.error("❌ Proposal not found");
            } else if (error.message.includes("ProposalExpired")) {
                console.error("❌ Proposal has expired");
            } else if (error.message.includes("UnauthorizedSigner")) {
                console.error("❌ You are not an authorized signer");
            } else {
                console.error("❌ Error approving proposal:", error.message);
            }
        }
    }

    /**
     * Show proposal status
     */
    async showProposalStatus(proposalId) {
        try {
            console.log(`\n📋 Proposal #${proposalId} Status`);
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

            // Check if current signer has approved
            const hasApproved = status.approvers.includes(this.signer.address);
            console.log(`Your Approval: ${hasApproved ? '✅ YES' : '❌ NO'}`);

            if (status.approvers.length > 0) {
                console.log(`\nApprovers:`);
                status.approvers.forEach((approver, index) => {
                    const isCurrent = approver.toLowerCase() === this.signer.address.toLowerCase();
                    console.log(`  ${index + 1}. ${approver}${isCurrent ? ' (you)' : ''}`);
                });
            }

            const canExecute = await this.token.canExecuteProposal(proposalId);
            console.log(`\nCan Execute: ${canExecute ? '✅ YES' : '❌ NO'}`);

            if (!canExecute && !status.executed && !status.cancelled) {
                if (status.approvalCount < config.quorumThreshold) {
                    const needed = config.quorumThreshold - status.approvalCount;
                    console.log(`⏳ Approvals needed: ${needed}`);
                }
                
                const timelockEnd = status.createdAt + config.timelockDuration;
                const now = Math.floor(Date.now() / 1000);
                if (now < timelockEnd) {
                    const remainingTime = timelockEnd - now;
                    console.log(`⏳ Timelock remaining: ${Math.floor(remainingTime / 3600)} hours ${Math.floor((remainingTime % 3600) / 60)} minutes`);
                }
            }

            // Check proposal expiration
            const proposalAge = Math.floor(Date.now() / 1000) - status.createdAt;
            const expiresIn = config.proposalLifetime - proposalAge;
            if (expiresIn > 0) {
                console.log(`⏰ Expires in: ${Math.floor(expiresIn / 86400)} days ${Math.floor((expiresIn % 86400) / 3600)} hours`);
            } else {
                console.log(`⚠️ Proposal has expired`);
            }

            console.log("\n" + "=".repeat(80));
        } catch (error) {
            if (error.message.includes("ProposalNotFound")) {
                console.error("❌ Proposal not found");
            } else {
                console.error("❌ Error fetching proposal status:", error.message);
            }
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
            case 'approve':
                const proposalIdToApprove = args[2];
                if (!proposalIdToApprove) {
                    console.log("❌ Proposal ID required");
                    return;
                }
                await this.approveProposal(proposalIdToApprove);
                break;
            case 'status':
                const proposalIdToCheck = args[2];
                if (!proposalIdToCheck) {
                    console.log("❌ Proposal ID required");
                    return;
                }
                await this.showProposalStatus(proposalIdToCheck);
                break;
            default:
                console.log(`❌ Unknown command: ${command}`);
                this.showHelp();
        }
    }
}

// Run CLI if called directly
if (require.main === module) {
    const cli = new ProposalApprovalCLI();
    cli.run().catch(error => {
        console.error("Fatal error:", error);
        process.exit(1);
    });
}

module.exports = ProposalApprovalCLI;
