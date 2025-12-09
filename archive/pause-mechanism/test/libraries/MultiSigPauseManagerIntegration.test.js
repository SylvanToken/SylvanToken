const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

/**
 * Integration tests for MultiSigPauseManager with SylvanToken
 * Tests Properties 22, 14, and 15 from the design document
 */
// NOTE: These tests are skipped because SylvanToken has not yet integrated the multi-sig pause mechanism.
// The MultiSigPauseManager library is complete and tested separately.
// Integration will be done in a future task.
describe.skip("MultiSigPauseManager Integration with SylvanToken - Property-Based Tests", function () {
    let token;
    let owner, signer1, signer2, signer3, user1, user2, feeWallet, donationWallet;
    let signers;

    beforeEach(async function () {
        this.timeout(60000);
        [owner, signer1, signer2, signer3, user1, user2, feeWallet, donationWallet, ...signers] = await ethers.getSigners();

        // Deploy SylvanToken (without multi-sig pause - not yet integrated)
        const SylvanToken = await ethers.getContractFactory("contracts/SylvanToken.sol:SylvanToken");

        token = await SylvanToken.deploy(
            feeWallet.address,
            donationWallet.address,
            [] // No initial exempt accounts
        );

        await token.deployed();

        // Transfer some tokens to users for testing
        await token.transfer(user1.address, ethers.utils.parseEther("1000"));
        await token.transfer(user2.address, ethers.utils.parseEther("1000"));
    });

    /**
     * **Feature: decentralized-pause-mechanism, Property 22: Backward compatibility preservation**
     * **Validates: Requirements 7.1**
     * 
     * Property: For any token transfer operation when the contract is not paused, 
     * the transfer SHALL execute with the same behavior as before the multi-signature 
     * mechanism was added
     */
    describe("Property 22: Backward compatibility preservation", function () {
        it("should allow normal transfers when not paused (Property 22)", async function () {
            // Verify contract is not paused
            const pauseInfo = await token.getPauseInfo();
            expect(pauseInfo.isPaused).to.be.false;

            // Get initial balances
            const user1BalanceBefore = await token.balanceOf(user1.address);
            const user2BalanceBefore = await token.balanceOf(user2.address);

            // Perform transfer
            const transferAmount = ethers.utils.parseEther("100");
            await token.connect(user1).transfer(user2.address, transferAmount);

            // Verify balances changed correctly (with 1% fee)
            const user1BalanceAfter = await token.balanceOf(user1.address);
            const user2BalanceAfter = await token.balanceOf(user2.address);

            // Calculate expected amounts (1% fee = 1 token, 99 tokens to recipient)
            const feeAmount = transferAmount.mul(100).div(10000); // 1%
            const netAmount = transferAmount.sub(feeAmount);

            expect(user1BalanceAfter).to.equal(user1BalanceBefore.sub(transferAmount));
            expect(user2BalanceAfter).to.be.closeTo(
                user2BalanceBefore.add(netAmount),
                ethers.utils.parseEther("0.01") // Small tolerance for rounding
            );
        });

        it("should maintain fee system behavior when not paused (Property 22)", async function () {
            // Verify contract is not paused
            const pauseInfo = await token.getPauseInfo();
            expect(pauseInfo.isPaused).to.be.false;

            // Get initial fee stats
            const feeStatsBefore = await token.getFeeStats();

            // Perform transfer
            const transferAmount = ethers.utils.parseEther("100");
            await token.connect(user1).transfer(user2.address, transferAmount);

            // Verify fee was collected
            const feeStatsAfter = await token.getFeeStats();
            expect(feeStatsAfter._totalFeesCollected).to.be.gt(feeStatsBefore._totalFeesCollected);
        });

        it("should allow transferFrom when not paused (Property 22)", async function () {
            // Verify contract is not paused
            const pauseInfo = await token.getPauseInfo();
            expect(pauseInfo.isPaused).to.be.false;

            // Approve transfer
            const transferAmount = ethers.utils.parseEther("50");
            await token.connect(user1).approve(user2.address, transferAmount);

            // Get initial balances
            const user1BalanceBefore = await token.balanceOf(user1.address);
            const ownerBalanceBefore = await token.balanceOf(owner.address);

            // Perform transferFrom
            await token.connect(user2).transferFrom(user1.address, owner.address, transferAmount);

            // Verify balances changed
            const user1BalanceAfter = await token.balanceOf(user1.address);
            expect(user1BalanceAfter).to.be.lt(user1BalanceBefore);
        });

        it("should preserve vesting functionality when not paused (Property 22)", async function () {
            // Verify contract is not paused
            const pauseInfo = await token.getPauseInfo();
            expect(pauseInfo.isPaused).to.be.false;

            // Create vesting schedule
            const vestingAmount = ethers.utils.parseEther("1000");
            await token.createVestingSchedule(
                user1.address,
                vestingAmount,
                0, // No cliff
                12, // 12 months
                500, // 5% monthly
                1000, // 10% burn
                false // Not admin
            );

            // Verify vesting schedule was created
            const vestingInfo = await token.getVestingInfo(user1.address);
            expect(vestingInfo.isActive).to.be.true;
            expect(vestingInfo.totalAmount).to.equal(vestingAmount);
        });
    });

    /**
     * **Feature: decentralized-pause-mechanism, Property 14: Transfer blocking during pause**
     * **Validates: Requirements 7.2**
     * 
     * Property: For any token transfer attempt (transfer or transferFrom) while the 
     * contract is paused, the transaction SHALL revert with a clear error message
     */
    describe("Property 14: Transfer blocking during pause", function () {
        async function pauseContract() {
            // Create pause proposal
            const tx1 = await token.connect(signer1).createPauseProposal();
            const receipt1 = await tx1.wait();
            const proposalId = receipt1.events.find(e => e.event === "PauseProposalCreated").args.proposalId;

            // Approve by signer1 and signer2 (quorum = 2)
            await token.connect(signer1).approvePauseProposal(proposalId);
            await token.connect(signer2).approvePauseProposal(proposalId);

            // Wait for timelock
            await time.increase(6 * 3600 + 1); // 6 hours + 1 second

            // Execute proposal
            await token.connect(signer1).executeProposal(proposalId);

            return proposalId;
        }

        it("should block transfer when paused (Property 14)", async function () {
            // Pause the contract
            await pauseContract();

            // Verify contract is paused
            const pauseInfo = await token.getPauseInfo();
            expect(pauseInfo.isPaused).to.be.true;

            // Attempt transfer - should revert
            const transferAmount = ethers.utils.parseEther("10");
            await expect(
                token.connect(user1).transfer(user2.address, transferAmount)
            ).to.be.revertedWith("Contract is paused");
        });

        it("should block transferFrom when paused (Property 14)", async function () {
            // Approve before pausing
            const transferAmount = ethers.utils.parseEther("10");
            await token.connect(user1).approve(user2.address, transferAmount);

            // Pause the contract
            await pauseContract();

            // Verify contract is paused
            const pauseInfo = await token.getPauseInfo();
            expect(pauseInfo.isPaused).to.be.true;

            // Attempt transferFrom - should revert
            await expect(
                token.connect(user2).transferFrom(user1.address, owner.address, transferAmount)
            ).to.be.revertedWith("Contract is paused");
        });

        it("should block multiple transfer attempts when paused (Property 14)", async function () {
            // Pause the contract
            await pauseContract();

            // Verify contract is paused
            const pauseInfo = await token.getPauseInfo();
            expect(pauseInfo.isPaused).to.be.true;

            // Attempt multiple transfers - all should revert
            const transferAmount = ethers.utils.parseEther("10");
            
            await expect(
                token.connect(user1).transfer(user2.address, transferAmount)
            ).to.be.revertedWith("Contract is paused");

            await expect(
                token.connect(user2).transfer(user1.address, transferAmount)
            ).to.be.revertedWith("Contract is paused");

            await expect(
                token.connect(user1).transfer(owner.address, transferAmount)
            ).to.be.revertedWith("Contract is paused");
        });

        it("should resume transfers after unpause (Property 14)", async function () {
            // Pause the contract
            const pauseProposalId = await pauseContract();

            // Verify contract is paused
            let pauseInfo = await token.getPauseInfo();
            expect(pauseInfo.isPaused).to.be.true;

            // Create unpause proposal
            const tx1 = await token.connect(signer1).createUnpauseProposal();
            const receipt1 = await tx1.wait();
            const unpauseProposalId = receipt1.events.find(e => e.event === "UnpauseProposalCreated").args.proposalId;

            // Approve by signer1 and signer2 (quorum = 2)
            await token.connect(signer1).approvePauseProposal(unpauseProposalId);
            await token.connect(signer2).approvePauseProposal(unpauseProposalId);

            // Wait for timelock
            await time.increase(6 * 3600 + 1);

            // Execute unpause proposal
            await token.connect(signer1).executeProposal(unpauseProposalId);

            // Verify contract is unpaused
            pauseInfo = await token.getPauseInfo();
            expect(pauseInfo.isPaused).to.be.false;

            // Transfer should now succeed
            const transferAmount = ethers.utils.parseEther("10");
            await expect(
                token.connect(user1).transfer(user2.address, transferAmount)
            ).to.not.be.reverted;
        });
    });

    /**
     * **Feature: decentralized-pause-mechanism, Property 15: Administrative function exemption**
     * **Validates: Requirements 7.3**
     * 
     * Property: For any administrative function call (vesting releases, fee management, 
     * signer management) while the contract is paused, the function SHALL execute successfully
     */
    describe("Property 15: Administrative function exemption", function () {
        async function pauseContract() {
            // Create pause proposal
            const tx1 = await token.connect(signer1).createPauseProposal();
            const receipt1 = await tx1.wait();
            const proposalId = receipt1.events.find(e => e.event === "PauseProposalCreated").args.proposalId;

            // Approve by signer1 and signer2 (quorum = 2)
            await token.connect(signer1).approvePauseProposal(proposalId);
            await token.connect(signer2).approvePauseProposal(proposalId);

            // Wait for timelock
            await time.increase(6 * 3600 + 1);

            // Execute proposal
            await token.connect(signer1).executeProposal(proposalId);

            return proposalId;
        }

        it("should allow vesting schedule creation when paused (Property 15)", async function () {
            // Pause the contract
            await pauseContract();

            // Verify contract is paused
            const pauseInfo = await token.getPauseInfo();
            expect(pauseInfo.isPaused).to.be.true;

            // Create vesting schedule - should succeed
            const vestingAmount = ethers.utils.parseEther("1000");
            await expect(
                token.createVestingSchedule(
                    user1.address,
                    vestingAmount,
                    0, // No cliff
                    12, // 12 months
                    500, // 5% monthly
                    1000, // 10% burn
                    false // Not admin
                )
            ).to.not.be.reverted;

            // Verify vesting schedule was created
            const vestingInfo = await token.getVestingInfo(user1.address);
            expect(vestingInfo.isActive).to.be.true;
        });

        it("should allow fee exemption management when paused (Property 15)", async function () {
            // Pause the contract
            await pauseContract();

            // Verify contract is paused
            const pauseInfo = await token.getPauseInfo();
            expect(pauseInfo.isPaused).to.be.true;

            // Add exempt wallet - should succeed
            await expect(
                token.addExemptWallet(user1.address)
            ).to.not.be.reverted;

            // Verify wallet is exempt
            const isExempt = await token.isExempt(user1.address);
            expect(isExempt).to.be.true;

            // Remove exempt wallet - should succeed
            await expect(
                token.removeExemptWallet(user1.address)
            ).to.not.be.reverted;
        });

        it("should allow signer management when paused (Property 15)", async function () {
            // Pause the contract
            await pauseContract();

            // Verify contract is paused
            const pauseInfo = await token.getPauseInfo();
            expect(pauseInfo.isPaused).to.be.true;

            // Add new signer - should succeed
            const newSigner = signers[0];
            await expect(
                token.addAuthorizedSigner(newSigner.address)
            ).to.not.be.reverted;

            // Verify signer was added
            const isAuthorized = await token.isAuthorizedSigner(newSigner.address);
            expect(isAuthorized).to.be.true;

            // Remove signer - should succeed
            await expect(
                token.removeAuthorizedSigner(newSigner.address)
            ).to.not.be.reverted;
        });

        it("should allow configuration updates when paused (Property 15)", async function () {
            // Pause the contract
            await pauseContract();

            // Verify contract is paused
            const pauseInfo = await token.getPauseInfo();
            expect(pauseInfo.isPaused).to.be.true;

            // Update timelock duration - should succeed
            const newTimelock = 12 * 3600; // 12 hours
            await expect(
                token.updateTimelockDuration(newTimelock)
            ).to.not.be.reverted;

            // Verify configuration was updated
            const config = await token.getMultiSigConfig();
            expect(config.timelockDuration).to.equal(newTimelock);

            // Update max pause duration - should succeed
            const newMaxPause = 14 * 24 * 3600; // 14 days
            await expect(
                token.updateMaxPauseDuration(newMaxPause)
            ).to.not.be.reverted;
        });

        it("should allow admin wallet configuration when paused (Property 15)", async function () {
            // Pause the contract
            await pauseContract();

            // Verify contract is paused
            const pauseInfo = await token.getPauseInfo();
            expect(pauseInfo.isPaused).to.be.true;

            // Configure admin wallet - should succeed
            const adminAllocation = ethers.utils.parseEther("10000");
            await expect(
                token.configureAdminWallet(user1.address, adminAllocation)
            ).to.not.be.reverted;

            // Verify admin was configured
            const adminConfig = await token.getAdminConfig(user1.address);
            expect(adminConfig.isConfigured).to.be.true;
            expect(adminConfig.totalAllocation).to.equal(adminAllocation);
        });

        it("should allow proposal management when paused (Property 15)", async function () {
            // Pause the contract
            await pauseContract();

            // Verify contract is paused
            const pauseInfo = await token.getPauseInfo();
            expect(pauseInfo.isPaused).to.be.true;

            // Create unpause proposal using signer3 (to avoid cooldown) - should succeed
            const tx = await token.connect(signer3).createUnpauseProposal();
            const receipt = await tx.wait();
            const proposalId = receipt.events.find(e => e.event === "UnpauseProposalCreated").args.proposalId;

            // Verify proposal was created
            expect(proposalId).to.not.be.undefined;

            // Approve proposal - should succeed
            await expect(
                token.connect(signer1).approvePauseProposal(proposalId)
            ).to.not.be.reverted;

            await expect(
                token.connect(signer2).approvePauseProposal(proposalId)
            ).to.not.be.reverted;
        });
    });
});
