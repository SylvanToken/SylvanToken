const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

/**
 * Security tests for MultiSigPauseManager
 * Tests Requirements 8.1, 8.2, 8.3, 8.4 from the design document
 * 
 * Covers:
 * - Replay attack prevention (8.2)
 * - Cooldown enforcement (8.1)
 * - Proposal spam prevention (8.1)
 * - Quorum manipulation attempts (8.3, 8.4)
 */
describe("MultiSigPauseManager - Security Tests", function () {
    let testContract;
    let signers;
    let MIN_TIMELOCK, MIN_MAX_PAUSE_DURATION, MIN_PROPOSAL_COOLDOWN;

    beforeEach(async function () {
        this.timeout(30000);
        signers = await ethers.getSigners();

        // Deploy MultiSigPauseManager library
        const MultiSigPauseManagerLib = await ethers.getContractFactory(
            "contracts/libraries/MultiSigPauseManager.sol:MultiSigPauseManager"
        );
        const multiSigPauseManagerLib = await MultiSigPauseManagerLib.deploy();

        // Deploy test contract with library linking
        const TestContract = await ethers.getContractFactory(
            "contracts/mocks/MultiSigPauseManagerTestContract.sol:MultiSigPauseManagerTestContract",
            {
                libraries: {
                    MultiSigPauseManager: multiSigPauseManagerLib.address,
                },
            }
        );
        testContract = await TestContract.deploy();

        // Get constants
        const constants = await testContract.getConstants();
        MIN_TIMELOCK = constants.minTimelock;
        MIN_MAX_PAUSE_DURATION = constants.minMaxPauseDuration;
        const MIN_PROPOSAL_LIFETIME = 7 * 24 * 3600; // 7 days
        MIN_PROPOSAL_COOLDOWN = 3600; // 1 hour

        // Initialize with 5 signers, quorum of 3
        const initialSigners = signers.slice(0, 5).map(s => s.address);
        await testContract.initialize(
            initialSigners,
            3, // quorum
            MIN_TIMELOCK,
            MIN_MAX_PAUSE_DURATION,
            MIN_PROPOSAL_LIFETIME,
            MIN_PROPOSAL_COOLDOWN
        );
    });

    describe("Requirement 8.2: Replay Attack Prevention", function () {
        it("should prevent signature replay with unique proposal IDs", async function () {
            // Create first proposal
            const tx1 = await testContract.connect(signers[0]).createPauseProposal();
            const receipt1 = await tx1.wait();
            const proposalId1 = receipt1.events.find(e => e.event === "PauseProposalCreated").args.proposalId;

            // Approve first proposal
            await testContract.connect(signers[0]).approvePauseProposal(proposalId1);
            await testContract.connect(signers[1]).approvePauseProposal(proposalId1);
            await testContract.connect(signers[2]).approvePauseProposal(proposalId1);

            // Execute first proposal
            await time.increase(MIN_TIMELOCK.add(1));
            await testContract.connect(signers[0]).executeProposal(proposalId1);

            // Unpause
            const unpauseTx = await testContract.connect(signers[0]).createUnpauseProposal();
            const unpaused = await unpauseTx.wait();
            const unpauseProposalId = unpaused.events.find(e => e.event === "UnpauseProposalCreated").args.proposalId;
            
            await testContract.connect(signers[0]).approvePauseProposal(unpauseProposalId);
            await testContract.connect(signers[1]).approvePauseProposal(unpauseProposalId);
            await testContract.connect(signers[2]).approvePauseProposal(unpauseProposalId);
            await time.increase(MIN_TIMELOCK.add(1));
            await testContract.connect(signers[0]).executeProposal(unpauseProposalId);

            // Wait for cooldown
            await time.increase(MIN_PROPOSAL_COOLDOWN + 1);

            // Create second proposal
            const tx2 = await testContract.connect(signers[0]).createPauseProposal();
            const receipt2 = await tx2.wait();
            const proposalId2 = receipt2.events.find(e => e.event === "PauseProposalCreated").args.proposalId;

            // Verify proposal IDs are different
            expect(proposalId2).to.not.equal(proposalId1);
            expect(proposalId2).to.be.gt(proposalId1);
        });

        it("should reject approval attempts on executed proposals", async function () {
            // Create and execute proposal
            const tx = await testContract.connect(signers[0]).createPauseProposal();
            const receipt = await tx.wait();
            const proposalId = receipt.events.find(e => e.event === "PauseProposalCreated").args.proposalId;

            await testContract.connect(signers[0]).approvePauseProposal(proposalId);
            await testContract.connect(signers[1]).approvePauseProposal(proposalId);
            await testContract.connect(signers[2]).approvePauseProposal(proposalId);

            await time.increase(MIN_TIMELOCK.add(1));
            await testContract.connect(signers[0]).executeProposal(proposalId);

            // Try to approve again - should fail
            await expect(
                testContract.connect(signers[3]).approvePauseProposal(proposalId)
            ).to.be.revertedWith("ProposalAlreadyExecuted");
        });

        it("should reject execution attempts on already executed proposals", async function () {
            // Create and execute proposal
            const tx = await testContract.connect(signers[0]).createPauseProposal();
            const receipt = await tx.wait();
            const proposalId = receipt.events.find(e => e.event === "PauseProposalCreated").args.proposalId;

            await testContract.connect(signers[0]).approvePauseProposal(proposalId);
            await testContract.connect(signers[1]).approvePauseProposal(proposalId);
            await testContract.connect(signers[2]).approvePauseProposal(proposalId);

            await time.increase(MIN_TIMELOCK.add(1));
            await testContract.connect(signers[0]).executeProposal(proposalId);

            // Try to execute again - should fail
            await expect(
                testContract.connect(signers[0]).executeProposal(proposalId)
            ).to.be.revertedWith("ProposalAlreadyExecuted");
        });

        it("should maintain proposal ID uniqueness across multiple cycles", async function () {
            const proposalIds = new Set();

            // Create multiple proposals across pause/unpause cycles
            for (let i = 0; i < 3; i++) {
                // Create pause proposal
                const pauseTx = await testContract.connect(signers[i % 5]).createPauseProposal();
                const pauseReceipt = await pauseTx.wait();
                const pauseProposalId = pauseReceipt.events.find(e => e.event === "PauseProposalCreated").args.proposalId;
                
                // Verify uniqueness
                expect(proposalIds.has(pauseProposalId.toString())).to.be.false;
                proposalIds.add(pauseProposalId.toString());

                // Execute pause
                await testContract.connect(signers[0]).approvePauseProposal(pauseProposalId);
                await testContract.connect(signers[1]).approvePauseProposal(pauseProposalId);
                await testContract.connect(signers[2]).approvePauseProposal(pauseProposalId);
                await time.increase(MIN_TIMELOCK.add(1));
                await testContract.connect(signers[0]).executeProposal(pauseProposalId);

                // Create unpause proposal
                const unpauseTx = await testContract.connect(signers[(i + 1) % 5]).createUnpauseProposal();
                const unpaused = await unpauseTx.wait();
                const unpauseProposalId = unpaused.events.find(e => e.event === "UnpauseProposalCreated").args.proposalId;
                
                // Verify uniqueness
                expect(proposalIds.has(unpauseProposalId.toString())).to.be.false;
                proposalIds.add(unpauseProposalId.toString());

                // Execute unpause
                await testContract.connect(signers[0]).approvePauseProposal(unpauseProposalId);
                await testContract.connect(signers[1]).approvePauseProposal(unpauseProposalId);
                await testContract.connect(signers[2]).approvePauseProposal(unpauseProposalId);
                await time.increase(MIN_TIMELOCK.add(1));
                await testContract.connect(signers[0]).executeProposal(unpauseProposalId);

                // Wait for cooldown
                await time.increase(MIN_PROPOSAL_COOLDOWN + 1);
            }

            // Verify we collected 6 unique proposal IDs (3 pause + 3 unpause)
            expect(proposalIds.size).to.equal(6);
        });
    });

    describe("Requirement 8.1: Cooldown Enforcement", function () {
        it("should enforce cooldown period between proposals from same signer", async function () {
            // Create first proposal
            await testContract.connect(signers[0]).createPauseProposal();

            // Try to create second proposal immediately - should fail
            await expect(
                testContract.connect(signers[0]).createPauseProposal()
            ).to.be.revertedWith("ProposalCooldownActive");
        });

        it("should allow proposal after cooldown period expires", async function () {
            // Create first proposal
            const tx1 = await testContract.connect(signers[0]).createPauseProposal();
            await tx1.wait();

            // Wait for cooldown
            await time.increase(MIN_PROPOSAL_COOLDOWN + 1);

            // Create second proposal - should succeed
            const tx2 = await testContract.connect(signers[0]).createPauseProposal();
            await expect(tx2).to.emit(testContract, "PauseProposalCreated");
        });

        it("should track cooldown independently for each signer", async function () {
            // Signer 0 creates proposal
            await testContract.connect(signers[0]).createPauseProposal();

            // Signer 1 should be able to create proposal immediately
            const tx = await testContract.connect(signers[1]).createPauseProposal();
            await expect(tx).to.emit(testContract, "PauseProposalCreated");

            // Signer 0 still in cooldown
            await expect(
                testContract.connect(signers[0]).createPauseProposal()
            ).to.be.revertedWith("ProposalCooldownActive");
        });

        it("should prevent proposal spam from single signer", async function () {
            // Create first proposal
            await testContract.connect(signers[0]).createPauseProposal();

            // Try to create multiple proposals rapidly - all should fail
            for (let i = 0; i < 5; i++) {
                await expect(
                    testContract.connect(signers[0]).createPauseProposal()
                ).to.be.revertedWith("ProposalCooldownActive");
            }

            // Wait for cooldown
            await time.increase(MIN_PROPOSAL_COOLDOWN + 1);

            // Now should succeed
            const tx = await testContract.connect(signers[0]).createPauseProposal();
            await expect(tx).to.emit(testContract, "PauseProposalCreated");
        });

        it("should reset cooldown timer after each successful proposal", async function () {
            // Create first proposal
            await testContract.connect(signers[0]).createPauseProposal();
            const firstProposalTime = await testContract.getLastProposalTime(signers[0].address);

            // Wait for cooldown
            await time.increase(MIN_PROPOSAL_COOLDOWN + 1);

            // Create second proposal
            await testContract.connect(signers[0]).createPauseProposal();
            const secondProposalTime = await testContract.getLastProposalTime(signers[0].address);

            // Verify cooldown timer was reset
            expect(secondProposalTime).to.be.gt(firstProposalTime);

            // Should not be able to create another immediately
            await expect(
                testContract.connect(signers[0]).createPauseProposal()
            ).to.be.revertedWith("ProposalCooldownActive");
        });
    });

    describe("Requirement 8.3: Quorum Change Invalidation", function () {
        it("should invalidate pending proposals when quorum is increased", async function () {
            // Create proposal with current quorum (3)
            const tx = await testContract.connect(signers[0]).createPauseProposal();
            const receipt = await tx.wait();
            const proposalId = receipt.events.find(e => e.event === "PauseProposalCreated").args.proposalId;

            // Approve with 2 signers (not yet quorum)
            await testContract.connect(signers[0]).approvePauseProposal(proposalId);
            await testContract.connect(signers[1]).approvePauseProposal(proposalId);

            // Increase quorum to 4
            await testContract.updateQuorumThreshold(4);

            // Wait for timelock
            await time.increase(MIN_TIMELOCK.add(1));

            // Try to execute - should fail because quorum changed
            await expect(
                testContract.connect(signers[0]).executeProposal(proposalId)
            ).to.be.revertedWith("ProposalAlreadyCancelled");
        });

        it("should invalidate pending proposals when quorum is decreased", async function () {
            // Create proposal with current quorum (3)
            const tx = await testContract.connect(signers[0]).createPauseProposal();
            const receipt = await tx.wait();
            const proposalId = receipt.events.find(e => e.event === "PauseProposalCreated").args.proposalId;

            // Approve with 3 signers (meets quorum)
            await testContract.connect(signers[0]).approvePauseProposal(proposalId);
            await testContract.connect(signers[1]).approvePauseProposal(proposalId);
            await testContract.connect(signers[2]).approvePauseProposal(proposalId);

            // Decrease quorum to 2
            await testContract.updateQuorumThreshold(2);

            // Wait for timelock
            await time.increase(MIN_TIMELOCK.add(1));

            // Try to execute - should fail because quorum changed
            await expect(
                testContract.connect(signers[0]).executeProposal(proposalId)
            ).to.be.revertedWith("ProposalAlreadyCancelled");
        });

        it("should allow new proposals after quorum change", async function () {
            // Create and invalidate old proposal
            const tx1 = await testContract.connect(signers[0]).createPauseProposal();
            const receipt1 = await tx1.wait();
            const oldProposalId = receipt1.events.find(e => e.event === "PauseProposalCreated").args.proposalId;

            // Change quorum
            await testContract.updateQuorumThreshold(4);

            // Wait for cooldown
            await time.increase(MIN_PROPOSAL_COOLDOWN + 1);

            // Create new proposal - should succeed
            const tx2 = await testContract.connect(signers[0]).createPauseProposal();
            const receipt2 = await tx2.wait();
            const newProposalId = receipt2.events.find(e => e.event === "PauseProposalCreated").args.proposalId;

            // Approve with new quorum (4)
            await testContract.connect(signers[0]).approvePauseProposal(newProposalId);
            await testContract.connect(signers[1]).approvePauseProposal(newProposalId);
            await testContract.connect(signers[2]).approvePauseProposal(newProposalId);
            await testContract.connect(signers[3]).approvePauseProposal(newProposalId);

            // Wait for timelock
            await time.increase(MIN_TIMELOCK.add(1));

            // Execute new proposal - should succeed
            await expect(
                testContract.connect(signers[0]).executeProposal(newProposalId)
            ).to.emit(testContract, "ProposalExecuted");
        });

        it("should prevent quorum manipulation to bypass timelock", async function () {
            // Create proposal
            const tx = await testContract.connect(signers[0]).createPauseProposal();
            const receipt = await tx.wait();
            const proposalId = receipt.events.find(e => e.event === "PauseProposalCreated").args.proposalId;

            // Approve with 2 signers
            await testContract.connect(signers[0]).approvePauseProposal(proposalId);
            await testContract.connect(signers[1]).approvePauseProposal(proposalId);

            // Try to decrease quorum to 2 to meet threshold
            await testContract.updateQuorumThreshold(2);

            // Wait for timelock
            await time.increase(MIN_TIMELOCK.add(1));

            // Try to execute - should fail because proposal was invalidated
            await expect(
                testContract.connect(signers[0]).executeProposal(proposalId)
            ).to.be.revertedWith("ProposalAlreadyCancelled");
        });
    });

    describe("Requirement 8.4: Signer Removal Updates", function () {
        it("should remove approvals when signer is removed", async function () {
            // Create proposal
            const tx = await testContract.connect(signers[0]).createPauseProposal();
            const receipt = await tx.wait();
            const proposalId = receipt.events.find(e => e.event === "PauseProposalCreated").args.proposalId;

            // Approve with 3 signers
            await testContract.connect(signers[0]).approvePauseProposal(proposalId);
            await testContract.connect(signers[1]).approvePauseProposal(proposalId);
            await testContract.connect(signers[2]).approvePauseProposal(proposalId);

            // Verify quorum is met
            let isQuorumMet = await testContract.isQuorumMet(proposalId);
            expect(isQuorumMet).to.be.true;

            // Remove signer 2
            await testContract.removeAuthorizedSigner(signers[2].address);

            // Verify quorum is no longer met
            isQuorumMet = await testContract.isQuorumMet(proposalId);
            expect(isQuorumMet).to.be.false;

            // Verify signer 2's approval was removed
            const hasApproved = await testContract.hasApproved(proposalId, signers[2].address);
            expect(hasApproved).to.be.false;
        });

        it("should update approval count when signer is removed", async function () {
            // Create proposal
            const tx = await testContract.connect(signers[0]).createPauseProposal();
            const receipt = await tx.wait();
            const proposalId = receipt.events.find(e => e.event === "PauseProposalCreated").args.proposalId;

            // Approve with 3 signers
            await testContract.connect(signers[0]).approvePauseProposal(proposalId);
            await testContract.connect(signers[1]).approvePauseProposal(proposalId);
            await testContract.connect(signers[2]).approvePauseProposal(proposalId);

            // Get proposal status before removal
            let status = await testContract.getProposalStatus(proposalId);
            const approvalCountBefore = status.approvers.length;
            expect(approvalCountBefore).to.equal(3);

            // Remove signer 1
            await testContract.removeAuthorizedSigner(signers[1].address);

            // Get proposal status after removal
            status = await testContract.getProposalStatus(proposalId);
            const approvalCountAfter = status.approvers.length;
            expect(approvalCountAfter).to.equal(2);
        });

        it("should prevent execution if signer removal causes quorum loss", async function () {
            // Create proposal
            const tx = await testContract.connect(signers[0]).createPauseProposal();
            const receipt = await tx.wait();
            const proposalId = receipt.events.find(e => e.event === "PauseProposalCreated").args.proposalId;

            // Approve with exactly quorum (3)
            await testContract.connect(signers[0]).approvePauseProposal(proposalId);
            await testContract.connect(signers[1]).approvePauseProposal(proposalId);
            await testContract.connect(signers[2]).approvePauseProposal(proposalId);

            // Remove one signer
            await testContract.removeAuthorizedSigner(signers[2].address);

            // Wait for timelock
            await time.increase(MIN_TIMELOCK.add(1));

            // Try to execute - should fail
            await expect(
                testContract.connect(signers[0]).executeProposal(proposalId)
            ).to.be.revertedWith("QuorumNotMet");
        });

        it("should handle removal of non-approving signer", async function () {
            // Create proposal
            const tx = await testContract.connect(signers[0]).createPauseProposal();
            const receipt = await tx.wait();
            const proposalId = receipt.events.find(e => e.event === "PauseProposalCreated").args.proposalId;

            // Approve with 3 signers (not including signer 4)
            await testContract.connect(signers[0]).approvePauseProposal(proposalId);
            await testContract.connect(signers[1]).approvePauseProposal(proposalId);
            await testContract.connect(signers[2]).approvePauseProposal(proposalId);

            // Remove signer 4 (who didn't approve)
            await testContract.removeAuthorizedSigner(signers[4].address);

            // Quorum should still be met
            const isQuorumMet = await testContract.isQuorumMet(proposalId);
            expect(isQuorumMet).to.be.true;

            // Wait for timelock
            await time.increase(MIN_TIMELOCK.add(1));

            // Execute should succeed
            await expect(
                testContract.connect(signers[0]).executeProposal(proposalId)
            ).to.emit(testContract, "ProposalExecuted");
        });

        it("should prevent signer from approving after being removed", async function () {
            // Create proposal
            const tx = await testContract.connect(signers[0]).createPauseProposal();
            const receipt = await tx.wait();
            const proposalId = receipt.events.find(e => e.event === "PauseProposalCreated").args.proposalId;

            // Remove signer 1
            await testContract.removeAuthorizedSigner(signers[1].address);

            // Try to approve with removed signer - should fail
            await expect(
                testContract.connect(signers[1]).approvePauseProposal(proposalId)
            ).to.be.revertedWith("UnauthorizedSigner");
        });
    });

    describe("Combined Security Scenarios", function () {
        it("should handle complex attack scenario: cooldown + quorum manipulation", async function () {
            // Attacker creates proposal
            const tx1 = await testContract.connect(signers[0]).createPauseProposal();
            const receipt1 = await tx1.wait();
            const proposalId1 = receipt1.events.find(e => e.event === "PauseProposalCreated").args.proposalId;

            // Attacker tries to spam more proposals - blocked by cooldown
            await expect(
                testContract.connect(signers[0]).createPauseProposal()
            ).to.be.revertedWith("ProposalCooldownActive");

            // Attacker gets 2 approvals
            await testContract.connect(signers[0]).approvePauseProposal(proposalId1);
            await testContract.connect(signers[1]).approvePauseProposal(proposalId1);

            // Attacker tries to lower quorum to execute - proposal gets invalidated
            await testContract.updateQuorumThreshold(2);

            // Wait for timelock
            await time.increase(MIN_TIMELOCK.add(1));

            // Execution fails due to invalidation
            await expect(
                testContract.connect(signers[0]).executeProposal(proposalId1)
            ).to.be.revertedWith("ProposalAlreadyCancelled");
        });

        it("should handle signer removal during active proposal", async function () {
            // Create proposal
            const tx = await testContract.connect(signers[0]).createPauseProposal();
            const receipt = await tx.wait();
            const proposalId = receipt.events.find(e => e.event === "PauseProposalCreated").args.proposalId;

            // Get 2 approvals
            await testContract.connect(signers[0]).approvePauseProposal(proposalId);
            await testContract.connect(signers[1]).approvePauseProposal(proposalId);

            // Remove one approving signer
            await testContract.removeAuthorizedSigner(signers[1].address);

            // Add new signer
            await testContract.addAuthorizedSigner(signers[5].address);

            // New signer approves
            await testContract.connect(signers[5]).approvePauseProposal(proposalId);

            // Still need one more approval
            await testContract.connect(signers[2]).approvePauseProposal(proposalId);

            // Wait for timelock
            await time.increase(MIN_TIMELOCK.add(1));

            // Should be able to execute
            await expect(
                testContract.connect(signers[0]).executeProposal(proposalId)
            ).to.emit(testContract, "ProposalExecuted");
        });

        it("should prevent replay of cancelled proposal", async function () {
            // Create proposal
            const tx = await testContract.connect(signers[0]).createPauseProposal();
            const receipt = await tx.wait();
            const proposalId = receipt.events.find(e => e.event === "PauseProposalCreated").args.proposalId;

            // Cancel proposal
            await testContract.cancelProposal(proposalId, "Testing");

            // Try to approve cancelled proposal
            await expect(
                testContract.connect(signers[1]).approvePauseProposal(proposalId)
            ).to.be.revertedWith("ProposalAlreadyCancelled");

            // Try to execute cancelled proposal
            await expect(
                testContract.connect(signers[0]).executeProposal(proposalId)
            ).to.be.revertedWith("ProposalAlreadyCancelled");
        });
    });
});
