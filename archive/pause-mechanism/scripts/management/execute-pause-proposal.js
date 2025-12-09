#!/usr/bin/env node

/**
 * @title Execute Pause Proposal CLI
 * @dev Command-line interface for executing approved pause/unpause proposals
 */

const hre = require("hardhat");
const { ethers } = require("hardhat");

class ProposalExecutionCLI {
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
⚡ Execute Pause Proposal CLI

Usage: node scripts/management/execute-pause-proposal.js <command> <contractAddress> [proposalId] [options]

Commands:
  execute <contractAddress> <proposalId>    Execute an approved proposal
  check <contractAddress> <proposalId>      Check if proposal can be executed
  cancel <contractAddress> <proposalId>     Cancel a proposal (owner only)

Options:
  --network <network>    Network to use (default: localhost)

Examples:
  node scripts/management/execute-pause-proposal.js execute 0x1234... 1
  node scripts/management/execute-pause-proposal.js check 0x1234... 1 --network bscTestnet
  node scripts/management/execute-pause-proposal.js cancel 0x1234... 1
        `);
    }

    /**
     * Execute a proposal
     */
    async executeProposal(proposalId) {
        try {
            console.log(`\n⚡ Executing Proposal #${proposalId}`);
            console.log("=".repeat(80));

            // Get proposal status
            const status = await this.token.getProposalStatus(proposalId);
            const config = await this.token.getMultiSigConfig();

            console.log(`Proposal Type: ${status.proposalType === 0 ? 'PAUSE' : 'UNPAUSE'}`);
            console.log(`Proposer: ${status.proposer}`);
            console.log(`Approval Count: ${status.approvalCount}/${config.quorumThreshold}`);

            if (status.executed) {
                console.log("⚠️ Proposal has already been executed");
                return;
            }

            if (status.cancelled) {
                console.log("⚠️ Proposal has been cancelled");
                return;
            }

            // Check if can execute
            const canExecute = await this.token.canExecuteProposal(proposalId);
            if (!canExecute) {
                console.log("\n❌ Proposal cannot be executed yet:");
                
                if (status.approvalCount < config.quorumThreshold) {
                    const needed = config.quorumThreshold - status.approvalCount;
                    console.log(`  - Need ${needed} more approval${needed > 1 ? 's' : ''}`);
                }
                
                const timelockEnd = status.createdAt + config.timelockDuration;
                const now = Math.floor(Date.now() / 1000);
                if (now < timelockEnd) {
                    const remainingTime = timelockEnd - now;
                    console.log(`  - Timelock remaining: ${Math.floor(remainingTime / 3600)} hours ${Math.floor((remainingTime % 3600) / 60)} minutes`);
                }
                
                return;
            }

            console.log("\n✅ Proposal is ready for execution");
            console.log("📝 Submitting execution transaction...");

            // Execute proposal
            const tx = await this.token.executeProposal(proposalId);
            console.log(`📝 Transaction sent: ${tx.hash}`);
            console.log("⏳ Waiting for confirmation...");

            const receipt = await tx.wait();
            console.log(`✅ Proposal executed successfully! (Block: ${receipt.blockNumber})`);

            // Show result
            const pauseInfo = await this.token.getPauseInfo();
            console.log(`\n📊 Contract Status:`);
            console.log(`Paused: ${pauseInfo.isPaused ? '✅ YES' : '❌ NO'}`);

            if (pauseInfo.isPaused) {
                console.log(`Paused At: ${new Date(pauseInfo.pausedAt * 1000).toLocaleString()}`);
                console.log(`Max Duration: ${config.maxPauseDuration / 86400} days`);
            }

            console.log("\n" + "=".repeat(80));
        } catch (error) {
            if (error.message.includes("QuorumNotMet")) {
                console.error("❌ Quorum not met - need more approvals");
            } else if (error.message.includes("TimelockNotElapsed")) {
                console.error("❌ Timelock period has not elapsed yet");
            } else if (error.message.includes("ProposalNotFound")) {
                console.error("❌ Proposal not found");
            } else if (error.message.includes("ProposalExpired")) {
                console.error("❌ Proposal has expired");
            } else if (error.message.includes("ProposalAlreadyExecuted")) {
                console.error("❌ Proposal has already been executed");
            } else if (error.message.includes("ContractAlreadyPaused")) {
                console.error("❌ Contract is already paused");
            } else if (error.message.includes("ContractNotPaused")) {
                console.error("❌ Contract is not paused");
            } else {
                console.error("❌ Error executing proposal:", error.message);
            }
        }
    }

    /**
     * Check if proposal can be executed
     */
    async checkProposal(proposalId) {
        try {
            console.log(`\n🔍 Checking Proposal #${proposalId}`);
            console.log("=".repeat(80));

            const status = await this.token.getProposalStatus(proposalId);
            const config = await this.token.getMultiSigConfig();
            const canExecute = await this.token.canExecuteProposal(proposalId);

            console.log(`Proposal Type: ${status.proposalType === 0 ? 'PAUSE' : 'UNPAUSE'}`);
            console.log(`Proposer: ${status.proposer}`);
            console.log(`Created At: ${new Date(status.createdAt * 1000).toLocaleString()}`);
            console.log(`Executed: ${status.executed ? '✅ YES' : '❌ NO'}`);
            console.log(`Cancelled: ${status.cancelled ? '✅ YES' : '❌ NO'}`);
            console.log(`Approval Count: ${status.approvalCount}/${config.quorumThreshold}`);

            console.log(`\n🎯 Can Execute: ${canExecute ? '✅ YES' : '❌ NO'}`);

            if (!canExecute && !status.executed && !status.cancelled) {
                console.log("\nReasons:");
                
                if (status.approvalCount < config.quorumThreshold) {
                    const needed = config.quorumThreshold - status.approvalCount;
                    console.log(`  ❌ Quorum not met (need ${needed} more approval${needed > 1 ? 's' : ''})`);
                } else {
                    console.log(`  ✅ Quorum met`);
                }
                
                const timelockEnd = status.createdAt + config.timelockDuration;
                const now = Math.floor(Date.now() / 1000);
                if (now < timelockEnd) {
                    const remainingTime = timelockEnd - now;
                    console.log(`  ❌ Timelock active (${Math.floor(remainingTime / 3600)}h ${Math.floor((remainingTime % 3600) / 60)}m remaining)`);
                } else {
                    console.log(`  ✅ Timelock elapsed`);
                }

                // Check expiration
                const proposalAge = now - status.createdAt;
                if (proposalAge > config.proposalLifetime) {
                    console.log(`  ❌ Proposal expired`);
                } else {
                    const expiresIn = config.proposalLifetime - proposalAge;
                    console.log(`  ✅ Not expired (${Math.floor(expiresIn / 86400)}d ${Math.floor((expiresIn % 86400) / 3600)}h remaining)`);
                }
            }

            if (status.approvers.length > 0) {
                console.log(`\nApprovers:`);
                status.approvers.forEach((approver, index) => {
                    console.log(`  ${index + 1}. ${approver}`);
                });
            }

            console.log("\n" + "=".repeat(80));
        } catch (error) {
            if (error.message.includes("ProposalNotFound")) {
                console.error("❌ Proposal not found");
            } else {
                console.error("❌ Error checking proposal:", error.message);
            }
        }
    }

    /**
     * Cancel a proposal (owner only)
     */
    async cancelProposal(proposalId) {
        try {
            console.log(`\n🚫 Cancelling Proposal #${proposalId}`);
            console.log("=".repeat(80));

            // Get proposal status
            const status = await this.token.getProposalStatus(proposalId);

            if (status.executed) {
                console.log("⚠️ Cannot cancel - proposal has already been executed");
                return;
            }

            if (status.cancelled) {
                console.log("⚠️ Proposal is already cancelled");
                return;
            }

            console.log(`Proposal Type: ${status.proposalType === 0 ? 'PAUSE' : 'UNPAUSE'}`);
            console.log(`Proposer: ${status.proposer}`);
            console.log(`Approval Count: ${status.approvalCount}`);

            console.log("\n📝 Submitting cancellation...");

            // Cancel proposal
            const tx = await this.token.cancelProposal(proposalId);
            console.log(`📝 Transaction sent: ${tx.hash}`);
            console.log("⏳ Waiting for confirmation...");

            const receipt = await tx.wait();
            console.log(`✅ Proposal cancelled successfully! (Block: ${receipt.blockNumber})`);

            console.log("\n" + "=".repeat(80));
        } catch (error) {
            if (error.message.includes("ProposalNotFound")) {
                console.error("❌ Proposal not found");
            } else if (error.message.includes("ProposalAlreadyExecuted")) {
                console.error("❌ Cannot cancel - proposal has been executed");
            } else if (error.message.includes("Ownable: caller is not the owner")) {
                console.error("❌ Only the contract owner can cancel proposals");
            } else {
                console.error("❌ Error cancelling proposal:", error.message);
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
            case 'execute':
                const proposalIdToExecute = args[2];
                if (!proposalIdToExecute) {
                    console.log("❌ Proposal ID required");
                    return;
                }
                await this.executeProposal(proposalIdToExecute);
                break;
            case 'check':
                const proposalIdToCheck = args[2];
                if (!proposalIdToCheck) {
                    console.log("❌ Proposal ID required");
                    return;
                }
                await this.checkProposal(proposalIdToCheck);
                break;
            case 'cancel':
                const proposalIdToCancel = args[2];
                if (!proposalIdToCancel) {
                    console.log("❌ Proposal ID required");
                    return;
                }
                await this.cancelProposal(proposalIdToCancel);
                break;
            default:
                console.log(`❌ Unknown command: ${command}`);
                this.showHelp();
        }
    }
}

// Run CLI if called directly
if (require.main === module) {
    const cli = new ProposalExecutionCLI();
    cli.run().catch(error => {
        console.error("Fatal error:", error);
        process.exit(1);
    });
}

module.exports = ProposalExecutionCLI;
