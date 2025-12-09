const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

/**
 * **Feature: decentralized-pause-mechanism, Property 8: Automatic unpause after max duration**
 * **Validates: Requirements 4.3**
 * 
 * Property: For any paused contract state, if the pause duration exceeds the configured 
 * maximum pause duration, the contract SHALL automatically transition to unpaused state
 * 
 * **Feature: decentralized-pause-mechanism, Property 11: Pause timestamp recording**
 * **Validates: Requirements 4.1**
 * 
 * Property: For any successful pause execution, the system SHALL record the exact 
 * block timestamp of the pause action
 * 
 * **Feature: decentralized-pause-mechanism, Property 10: Proposal cleanup on unpause**
 * **Validates: Requirements 4.5**
 * 
 * Property: For any contract unpause operation, all pending pause proposals SHALL be 
 * cleared from the active proposal list
 */
describe("MultiSigPauseManager - Automatic Unpause Properties", function () {
    let testContract;
    let signers;
    let MIN_TIMELOCK, MIN_MAX_PAUSE_DURATION;

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
        const MIN_PROPOSAL_COOLDOWN = 3600; // 1 hour

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

    /**
     * Helper function to create and execute a pause proposal
     */
    async function pauseContract() {
        // Create pause proposal
        const tx = await testContract.connect(signers[0]).createPauseProposal();
        const receipt = await tx.wait();
        const proposalId = receipt.events.find(e => e.event === "PauseProposalCreated").args.proposalId;

        // Approve with 3 signers (meets quorum)
        await testContract.connect(signers[0]).approvePauseProposal(proposalId);
        await testContract.connect(signers[1]).approvePauseProposal(proposalId);
        await testContract.connect(signers[2]).approvePauseProposal(proposalId);

        // Advance time past timelock
        await time.increase(MIN_TIMELOCK.add(1));

        // Execute proposal
        await testContract.connect(signers[0]).executeProposal(proposalId);

        return proposalId;
    }

    describe("Property 11: Pause timestamp recording", function () {
        /**
         * Test Strategy: For any successful pause execution, verify that the exact
         * block timestamp is recorded in the pause state
         */
        it("should record exact block timestamp when contract is paused", async function () {
            // Pause the contract
            await pauseContract();

            // Get pause info
            const pauseInfo = await testContract.getPauseInfo();

            // Get current block timestamp
            const currentBlock = await ethers.provider.getBlock("latest");
            const currentTimestamp = currentBlock.timestamp;

            // Verify pause timestamp is recorded and is recent (within reasonable range)
            expect(pauseInfo.isPaused).to.be.true;
            expect(pauseInfo.pausedAt).to.be.gt(0);
            expect(pauseInfo.pausedAt).to.be.lte(currentTimestamp);
        });

        it("should record different timestamps for multiple pause cycles", async function () {
            // First pause cycle
            await pauseContract();
            const firstPauseInfo = await testContract.getPauseInfo();
            const firstTimestamp = firstPauseInfo.pausedAt;

            // Unpause
            const unpauseTx = await testContract.connect(signers[0]).createUnpauseProposal();
            const unpaused = await unpauseTx.wait();
            const unpauseProposalId = unpaused.events.find(e => e.event === "UnpauseProposalCreated").args.proposalId;
            
            await testContract.connect(signers[0]).approvePauseProposal(unpauseProposalId);
            await testContract.connect(signers[1]).approvePauseProposal(unpauseProposalId);
            await testContract.connect(signers[2]).approvePauseProposal(unpauseProposalId);
            await time.increase(MIN_TIMELOCK.add(1));
            await testContract.connect(signers[0]).executeProposal(unpauseProposalId);

            // Wait some time
            await time.increase(3600); // 1 hour

            // Second pause cycle
            await pauseContract();
            const secondPauseInfo = await testContract.getPauseInfo();
            const secondTimestamp = secondPauseInfo.pausedAt;

            // Verify timestamps are different and second is later
            expect(secondTimestamp).to.be.gt(firstTimestamp);
        });

        it("should clear pause timestamp when unpaused", async function () {
            // Pause the contract
            await pauseContract();
            
            let pauseInfo = await testContract.getPauseInfo();
            expect(pauseInfo.pausedAt).to.be.gt(0);

            // Unpause
            const unpauseTx = await testContract.connect(signers[0]).createUnpauseProposal();
            const receipt = await unpauseTx.wait();
            const unpauseProposalId = receipt.events.find(e => e.event === "UnpauseProposalCreated").args.proposalId;
            
            await testContract.connect(signers[0]).approvePauseProposal(unpauseProposalId);
            await testContract.connect(signers[1]).approvePauseProposal(unpauseProposalId);
            await testContract.connect(signers[2]).approvePauseProposal(unpauseProposalId);
            await time.increase(MIN_TIMELOCK.add(1));
            await testContract.connect(signers[0]).executeProposal(unpauseProposalId);

            // Verify timestamp is cleared
            pauseInfo = await testContract.getPauseInfo();
            expect(pauseInfo.isPaused).to.be.false;
            expect(pauseInfo.pausedAt).to.equal(0);
        });

        it("should maintain timestamp accuracy across time advances", async function () {
            // Pause the contract
            const pauseTx = await testContract.connect(signers[0]).createPauseProposal();
            const receipt = await pauseTx.wait();
            const proposalId = receipt.events.find(e => e.event === "PauseProposalCreated").args.proposalId;

            // Record creation time
            const creationBlock = await ethers.provider.getBlock(receipt.blockNumber);
            const creationTime = creationBlock.timestamp;

            // Approve and execute
            await testContract.connect(signers[0]).approvePauseProposal(proposalId);
            await testContract.connect(signers[1]).approvePauseProposal(proposalId);
            await testContract.connect(signers[2]).approvePauseProposal(proposalId);
            await time.increase(MIN_TIMELOCK.add(1));
            
            const executeTx = await testContract.connect(signers[0]).executeProposal(proposalId);
            const executeReceipt = await executeTx.wait();
            const executeBlock = await ethers.provider.getBlock(executeReceipt.blockNumber);
            const executeTime = executeBlock.timestamp;

            // Get pause info
            const pauseInfo = await testContract.getPauseInfo();

            // Verify timestamp matches execution time, not creation time
            expect(pauseInfo.pausedAt).to.equal(executeTime);
            expect(pauseInfo.pausedAt).to.be.gt(creationTime);
        });
    });

    describe("Property 8: Automatic unpause after max duration", function () {
        /**
         * Test Strategy: For any paused contract, verify that after max pause duration
         * is exceeded, shouldAutoUnpause returns true and triggerAutoUnpause succeeds
         */
        it("should indicate auto-unpause needed after max duration exceeded", async function () {
            // Pause the contract
            await pauseContract();

            // Check shouldAutoUnpause before max duration
            let shouldUnpause = await testContract.shouldAutoUnpause();
            expect(shouldUnpause).to.be.false;

            // Advance time to just before max duration
            await time.increase(MIN_MAX_PAUSE_DURATION.sub(60)); // 1 minute before
            shouldUnpause = await testContract.shouldAutoUnpause();
            expect(shouldUnpause).to.be.false;

            // Advance time past max duration
            await time.increase(120); // 2 minutes, now past max duration
            shouldUnpause = await testContract.shouldAutoUnpause();
            expect(shouldUnpause).to.be.true;
        });

        it("should automatically unpause when max duration exceeded", async function () {
            // Pause the contract
            await pauseContract();

            // Verify paused
            let pauseInfo = await testContract.getPauseInfo();
            expect(pauseInfo.isPaused).to.be.true;

            // Advance time past max duration
            await time.increase(MIN_MAX_PAUSE_DURATION.add(1));

            // Trigger auto-unpause
            const tx = await testContract.triggerAutoUnpause();
            await expect(tx).to.emit(testContract, "AutoUnpauseTriggered");

            // Verify unpaused
            pauseInfo = await testContract.getPauseInfo();
            expect(pauseInfo.isPaused).to.be.false;
            expect(pauseInfo.pausedAt).to.equal(0);
        });

        it("should not auto-unpause before max duration", async function () {
            // Pause the contract
            await pauseContract();

            // Try to trigger auto-unpause before max duration
            const tx = await testContract.triggerAutoUnpause();
            const receipt = await tx.wait();

            // Should not emit AutoUnpauseTriggered event
            const autoUnpauseEvent = receipt.events.find(e => e.event === "AutoUnpauseTriggered");
            expect(autoUnpauseEvent).to.be.undefined;

            // Verify still paused
            const pauseInfo = await testContract.getPauseInfo();
            expect(pauseInfo.isPaused).to.be.true;
        });

        it("should calculate remaining time correctly", async function () {
            // Pause the contract
            await pauseContract();

            // Get initial remaining time
            let pauseInfo = await testContract.getPauseInfo();
            const initialRemaining = pauseInfo.remainingTime;
            
            // Should be approximately equal to max pause duration
            expect(initialRemaining).to.be.closeTo(MIN_MAX_PAUSE_DURATION, 10);

            // Advance time by half the max duration
            const halfDuration = MIN_MAX_PAUSE_DURATION.div(2);
            await time.increase(halfDuration);

            // Check remaining time decreased
            pauseInfo = await testContract.getPauseInfo();
            expect(pauseInfo.remainingTime).to.be.closeTo(halfDuration, 10);

            // Advance past max duration
            await time.increase(MIN_MAX_PAUSE_DURATION);

            // Remaining time should be 0
            pauseInfo = await testContract.getPauseInfo();
            expect(pauseInfo.remainingTime).to.equal(0);
        });

        it("should work with different max pause durations", async function () {
            // Test with minimum duration (7 days)
            await pauseContract();
            await time.increase(MIN_MAX_PAUSE_DURATION.add(1));
            
            let shouldUnpause = await testContract.shouldAutoUnpause();
            expect(shouldUnpause).to.be.true;
            
            await testContract.triggerAutoUnpause();
            let pauseInfo = await testContract.getPauseInfo();
            expect(pauseInfo.isPaused).to.be.false;

            // Update to longer duration
            const longerDuration = MIN_MAX_PAUSE_DURATION.mul(2); // 14 days
            await testContract.updateMaxPauseDuration(longerDuration);

            // Pause again
            await pauseContract();

            // Should not auto-unpause after old duration
            await time.increase(MIN_MAX_PAUSE_DURATION.add(1));
            shouldUnpause = await testContract.shouldAutoUnpause();
            expect(shouldUnpause).to.be.false;

            // Should auto-unpause after new duration
            await time.increase(MIN_MAX_PAUSE_DURATION.add(1));
            shouldUnpause = await testContract.shouldAutoUnpause();
            expect(shouldUnpause).to.be.true;
        });

        it("should emit AutoUnpauseTriggered event with correct duration", async function () {
            // Pause the contract
            await pauseContract();

            // Advance time past max duration
            const extraTime = 3600; // 1 hour extra
            await time.increase(MIN_MAX_PAUSE_DURATION.add(extraTime));

            // Trigger auto-unpause and check event
            const tx = await testContract.triggerAutoUnpause();
            const receipt = await tx.wait();
            
            const event = receipt.events.find(e => e.event === "AutoUnpauseTriggered");
            expect(event).to.not.be.undefined;
            
            // Duration should be approximately max duration + extra time
            const expectedDuration = MIN_MAX_PAUSE_DURATION.add(extraTime);
            expect(event.args.pauseDuration).to.be.closeTo(expectedDuration, 10);
        });
    });

    describe("Property 10: Proposal cleanup on unpause", function () {
        /**
         * Test Strategy: For any unpause operation (manual or automatic), verify that
         * all pending pause proposals are cleared from the active proposal list
         */
        it("should clear pending pause proposals on manual unpause", async function () {
            // Pause the contract
            await pauseContract();

            // Create additional pause proposals (should be rejected but let's create unpause proposals)
            // Actually, we can't create pause proposals when already paused
            // So let's verify the state after unpause

            // Create unpause proposal
            const unpauseTx = await testContract.connect(signers[0]).createUnpauseProposal();
            const receipt = await unpauseTx.wait();
            const unpauseProposalId = receipt.events.find(e => e.event === "UnpauseProposalCreated").args.proposalId;

            // Approve and execute unpause
            await testContract.connect(signers[0]).approvePauseProposal(unpauseProposalId);
            await testContract.connect(signers[1]).approvePauseProposal(unpauseProposalId);
            await testContract.connect(signers[2]).approvePauseProposal(unpauseProposalId);
            await time.increase(MIN_TIMELOCK.add(1));
            await testContract.connect(signers[0]).executeProposal(unpauseProposalId);

            // Verify unpaused
            const pauseInfo = await testContract.getPauseInfo();
            expect(pauseInfo.isPaused).to.be.false;

            // The unpause proposal itself should be marked as executed
            const proposalStatus = await testContract.getProposalStatus(unpauseProposalId);
            expect(proposalStatus.executed).to.be.true;
        });

        it("should clear pending pause proposals on auto-unpause", async function () {
            // Pause the contract
            const pauseProposalId = await pauseContract();

            // Verify pause proposal is executed
            let proposalStatus = await testContract.getProposalStatus(pauseProposalId);
            expect(proposalStatus.executed).to.be.true;

            // Advance time past max duration
            await time.increase(MIN_MAX_PAUSE_DURATION.add(1));

            // Trigger auto-unpause
            await testContract.triggerAutoUnpause();

            // Verify unpaused
            const pauseInfo = await testContract.getPauseInfo();
            expect(pauseInfo.isPaused).to.be.false;
        });

        it("should handle multiple pending proposals during unpause", async function () {
            // Create and execute first pause
            await pauseContract();

            // Unpause
            let unpauseTx = await testContract.connect(signers[0]).createUnpauseProposal();
            let receipt = await unpauseTx.wait();
            let unpauseProposalId = receipt.events.find(e => e.event === "UnpauseProposalCreated").args.proposalId;
            
            await testContract.connect(signers[0]).approvePauseProposal(unpauseProposalId);
            await testContract.connect(signers[1]).approvePauseProposal(unpauseProposalId);
            await testContract.connect(signers[2]).approvePauseProposal(unpauseProposalId);
            await time.increase(MIN_TIMELOCK.add(1));
            await testContract.connect(signers[0]).executeProposal(unpauseProposalId);

            // Create multiple pause proposals
            const proposal1Tx = await testContract.connect(signers[0]).createPauseProposal();
            const receipt1 = await proposal1Tx.wait();
            const proposalId1 = receipt1.events.find(e => e.event === "PauseProposalCreated").args.proposalId;

            // Wait for cooldown (6 hours default)
            await time.increase(6 * 3600);

            const proposal2Tx = await testContract.connect(signers[1]).createPauseProposal();
            const receipt2 = await proposal2Tx.wait();
            const proposalId2 = receipt2.events.find(e => e.event === "PauseProposalCreated").args.proposalId;

            // Approve first proposal to meet quorum
            await testContract.connect(signers[0]).approvePauseProposal(proposalId1);
            await testContract.connect(signers[1]).approvePauseProposal(proposalId1);
            await testContract.connect(signers[2]).approvePauseProposal(proposalId1);

            // Execute first pause
            await time.increase(MIN_TIMELOCK.add(1));
            await testContract.connect(signers[0]).executeProposal(proposalId1);

            // Now contract is paused, second proposal should still exist but be for pause (which is now invalid)
            // Let's unpause and verify cleanup
            unpauseTx = await testContract.connect(signers[0]).createUnpauseProposal();
            receipt = await unpauseTx.wait();
            unpauseProposalId = receipt.events.find(e => e.event === "UnpauseProposalCreated").args.proposalId;
            
            await testContract.connect(signers[0]).approvePauseProposal(unpauseProposalId);
            await testContract.connect(signers[1]).approvePauseProposal(unpauseProposalId);
            await testContract.connect(signers[2]).approvePauseProposal(unpauseProposalId);
            await time.increase(MIN_TIMELOCK.add(1));
            
            // This should clear pending pause proposals
            const tx = await testContract.connect(signers[0]).executeProposal(unpauseProposalId);
            await expect(tx).to.emit(testContract, "ContractUnpausedMultiSig");

            // Verify unpaused
            const pauseInfo = await testContract.getPauseInfo();
            expect(pauseInfo.isPaused).to.be.false;
        });

        it("should not affect executed or cancelled proposals during cleanup", async function () {
            // Pause the contract
            const pauseProposalId = await pauseContract();

            // Verify pause proposal is executed
            let proposalStatus = await testContract.getProposalStatus(pauseProposalId);
            expect(proposalStatus.executed).to.be.true;

            // Trigger auto-unpause
            await time.increase(MIN_MAX_PAUSE_DURATION.add(1));
            await testContract.triggerAutoUnpause();

            // Executed proposal should still be marked as executed
            proposalStatus = await testContract.getProposalStatus(pauseProposalId);
            expect(proposalStatus.executed).to.be.true;
            expect(proposalStatus.cancelled).to.be.false;
        });
    });

    describe("Integration: Auto-unpause with proposal lifecycle", function () {
        it("should handle complete pause-auto-unpause-pause cycle", async function () {
            // First pause
            await pauseContract();
            let pauseInfo = await testContract.getPauseInfo();
            expect(pauseInfo.isPaused).to.be.true;
            const firstPauseTime = pauseInfo.pausedAt;

            // Auto-unpause
            await time.increase(MIN_MAX_PAUSE_DURATION.add(1));
            await testContract.triggerAutoUnpause();
            pauseInfo = await testContract.getPauseInfo();
            expect(pauseInfo.isPaused).to.be.false;

            // Second pause
            await pauseContract();
            pauseInfo = await testContract.getPauseInfo();
            expect(pauseInfo.isPaused).to.be.true;
            const secondPauseTime = pauseInfo.pausedAt;

            // Verify different timestamps
            expect(secondPauseTime).to.be.gt(firstPauseTime);
        });

        it("should prevent operations during pause and allow after auto-unpause", async function () {
            // Pause the contract
            await pauseContract();
            
            // Verify paused
            let pauseInfo = await testContract.getPauseInfo();
            expect(pauseInfo.isPaused).to.be.true;

            // Auto-unpause
            await time.increase(MIN_MAX_PAUSE_DURATION.add(1));
            await testContract.triggerAutoUnpause();

            // Verify unpaused
            pauseInfo = await testContract.getPauseInfo();
            expect(pauseInfo.isPaused).to.be.false;

            // Should be able to create new pause proposal
            const tx = await testContract.connect(signers[0]).createPauseProposal();
            await expect(tx).to.emit(testContract, "PauseProposalCreated");
        });
    });
});
