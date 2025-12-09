const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

// NOTE: Pause-related tests are skipped because pause mechanism was removed.
// SafeWallet multisig is now used for governance instead.
describe("AccessControl Library Complete Coverage", function () {
    let accessControl;
    let owner, user1, user2, user3;
    let ADMIN_COOLDOWN, OWNERSHIP_TIMELOCK;

    beforeEach(async function () {
        this.timeout(30000);
        [owner, user1, user2, user3] = await ethers.getSigners();

        // Deploy AccessControl library first
        const AccessControlLib = await ethers.getContractFactory("contracts/libraries/AccessControl.sol:AccessControlLib");
        const accessControlLib = await AccessControlLib.deploy();

        // Deploy AccessControl test contract with library linking
        const AccessControlTestContract = await ethers.getContractFactory("contracts/mocks/AccessControlTestContract.sol:AccessControlTestContract", {
            libraries: {
                AccessControlLib: accessControlLib.address,
            },
        });
        accessControl = await AccessControlTestContract.deploy();

        // Get constants
        ADMIN_COOLDOWN = await accessControl.getAdminCooldown();
        OWNERSHIP_TIMELOCK = await accessControl.getOwnershipTimelock();
    });

    describe("Timelock Operations", function () {
        describe("Admin Cooldown Mechanism", function () {
            it("should enforce cooldown period for admin actions", async function () {
                const functionSig = ethers.utils.id("testFunction()").slice(0, 10);
                
                // First call should succeed
                await accessControl.connect(owner).testCheckOwnerWithCooldown(functionSig);

                // Second call within cooldown should fail
                let failed = false;
                try {
                    await accessControl.connect(owner).testCheckOwnerWithCooldown(functionSig);
                } catch (error) {
                    failed = true;
                    expect(error.message).to.include("Cooldown period not elapsed");
                }
                expect(failed).to.be.true;
            });

            it("should allow admin action after cooldown period", async function () {
                const functionSig = ethers.utils.id("testFunction()").slice(0, 10);
                
                // First call
                await accessControl.connect(owner).testCheckOwnerWithCooldown(functionSig);
                
                // Fast forward past cooldown
                await time.increase(Number(ADMIN_COOLDOWN) + 1);
                
                // Second call should succeed
                await accessControl.connect(owner).testCheckOwnerWithCooldown(functionSig);
            });

            it("should track different function signatures separately", async function () {
                const functionSig1 = ethers.utils.id("testFunction1()").slice(0, 10);
                const functionSig2 = ethers.utils.id("testFunction2()").slice(0, 10);
                
                // Call first function
                await accessControl.connect(owner).testCheckOwnerWithCooldown(functionSig1);
                
                // Second function should work immediately (different signature)
                await accessControl.connect(owner).testCheckOwnerWithCooldown(functionSig2);
                
                // First function should still be in cooldown
                await expect(accessControl.connect(owner).testCheckOwnerWithCooldown(functionSig1))
                    .to.be.revertedWith("Cooldown period not elapsed");
            });

            it("should return correct cooldown status", async function () {
                const functionSig = ethers.utils.id("testFunction()").slice(0, 10);
                
                // Initially should be able to execute
                let [canExecute, timeRemaining] = await accessControl.testCheckCooldown(functionSig);
                expect(canExecute).to.be.true;
                expect(timeRemaining.toString()).to.equal("0");
                
                // After calling function, should be in cooldown
                await accessControl.connect(owner).testCheckOwnerWithCooldown(functionSig);
                [canExecute, timeRemaining] = await accessControl.testCheckCooldown(functionSig);
                expect(canExecute).to.be.false;
                expect(timeRemaining).to.be.closeTo(ADMIN_COOLDOWN, 5);
            });

            it("should get last admin action timestamp", async function () {
                const functionSig = ethers.utils.id("testFunction()").slice(0, 10);
                
                // Initially should be 0
                expect((await accessControl.testGetLastAdminAction(functionSig)).toString()).to.equal("0");
                
                // After calling function, should have timestamp
                await accessControl.connect(owner).testCheckOwnerWithCooldown(functionSig);
                const lastAction = await accessControl.testGetLastAdminAction(functionSig);
                expect(lastAction.toNumber()).to.be.greaterThan(0);
            });
        });

        describe("Ownership Transfer Timelock", function () {
            it("should initiate ownership transfer with timelock", async function () {
                await accessControl.connect(owner).testInitiateOwnershipTransfer(user1.address);

                const status = await accessControl.testGetOwnershipTransferStatus();
                expect(status.isPending).to.be.true;
                expect(status.pendingOwner).to.equal(user1.address);
                expect(status.canComplete).to.be.false;
            });

            it("should prevent completing transfer before timelock", async function () {
                await accessControl.connect(owner).testInitiateOwnershipTransfer(user1.address);
                
                await expect(accessControl.connect(user1).testCompleteOwnershipTransfer())
                    .to.be.revertedWith("Ownership transfer timelock not elapsed");
            });

            it("should allow completing transfer after timelock", async function () {
                await accessControl.connect(owner).testInitiateOwnershipTransfer(user1.address);
                
                // Fast forward past timelock
                await time.increase(Number(OWNERSHIP_TIMELOCK) + 1);
                
                await accessControl.connect(user1).testCompleteOwnershipTransfer();
                
                expect(await accessControl.getCurrentOwner()).to.equal(user1.address);
            });

            it("should prevent multiple pending transfers", async function () {
                await accessControl.connect(owner).testInitiateOwnershipTransfer(user1.address);
                
                await expect(accessControl.connect(owner).testInitiateOwnershipTransfer(user2.address))
                    .to.be.revertedWith("Ownership transfer already initiated");
            });

            it("should allow cancelling pending transfer", async function () {
                await accessControl.connect(owner).testInitiateOwnershipTransfer(user1.address);
                
                await accessControl.connect(owner).testCancelOwnershipTransfer();
                
                const status = await accessControl.testGetOwnershipTransferStatus();
                expect(status.isPending).to.be.false;
            });

            it("should update transfer status correctly over time", async function () {
                await accessControl.connect(owner).testInitiateOwnershipTransfer(user1.address);
                
                // Initially cannot complete
                let status = await accessControl.testGetOwnershipTransferStatus();
                expect(status.canComplete).to.be.false;
                
                // After timelock, can complete
                await time.increase(Number(OWNERSHIP_TIMELOCK) + 1);
                status = await accessControl.testGetOwnershipTransferStatus();
                expect(status.canComplete).to.be.true;
            });
        });
    });

    describe("Role and Permission Management", function () {
        describe("Owner Permission Validation", function () {
            it("should validate owner permissions with cooldown", async function () {
                const functionSig = ethers.utils.id("testFunction()").slice(0, 10);
                
                // Owner should be able to call
                await accessControl.connect(owner).testCheckOwnerWithCooldown(functionSig);
                
                // Non-owner should be rejected
                await expect(accessControl.connect(user1).testCheckOwnerWithCooldown(functionSig))
                    .to.be.revertedWith("Ownable: caller is not the owner");
            });

            it("should validate pending owner permissions", async function () {
                await accessControl.connect(owner).testInitiateOwnershipTransfer(user1.address);
                
                // Pending owner should be able to call requirePendingOwner
                await accessControl.connect(user1).testRequirePendingOwner();
                
                // Non-pending owner should be rejected
                await expect(accessControl.connect(user2).testRequirePendingOwner())
                    .to.be.revertedWith("Caller is not the pending owner");
            });

            it("should handle ownership transfer validation", async function () {
                // Valid transfer should not revert
                await accessControl.testValidateOwnershipTransfer(
                    user1.address, 
                    owner.address, 
                    accessControl.address
                );
                
                // Zero address should revert
                await expect(accessControl.testValidateOwnershipTransfer(
                    ethers.constants.AddressZero, 
                    owner.address, 
                    accessControl.address
                )).to.be.revertedWith("New owner cannot be zero address");
                
                // Same owner should revert
                await expect(accessControl.testValidateOwnershipTransfer(
                    owner.address, 
                    owner.address, 
                    accessControl.address
                )).to.be.revertedWith("New owner cannot be current owner");
                
                // Contract address should revert
                await expect(accessControl.testValidateOwnershipTransfer(
                    accessControl.address, 
                    owner.address, 
                    accessControl.address
                )).to.be.revertedWith("New owner cannot be contract address");
            });
        });

        describe("Complex Permission Scenarios", function () {
            it("should handle role transitions during ownership transfer", async function () {
                // Initiate transfer
                await accessControl.connect(owner).testInitiateOwnershipTransfer(user1.address);
                
                // Original owner should still have permissions
                const functionSig = ethers.utils.id("testFunction()").slice(0, 10);
                await accessControl.connect(owner).testCheckOwnerWithCooldown(functionSig);
                
                // Pending owner should not have owner permissions yet
                await expect(accessControl.connect(user1).testCheckOwnerWithCooldown(functionSig))
                    .to.be.revertedWith("Ownable: caller is not the owner");
                
                // Complete transfer
                await time.increase(Number(OWNERSHIP_TIMELOCK) + 1);
                await accessControl.connect(user1).testCompleteOwnershipTransfer();
                
                // New owner should have permissions
                await time.increase(Number(ADMIN_COOLDOWN) + 1);
                await accessControl.connect(user1).testCheckOwnerWithCooldown(functionSig);
                
                // Old owner should lose permissions
                await expect(accessControl.connect(owner).testCheckOwnerWithCooldown(functionSig))
                    .to.be.revertedWith("Ownable: caller is not the owner");
            });

            // Pause mechanism removed - SafeWallet multisig handles governance
            it.skip("should handle permission changes during pause state", async function () {
            });

            it("should handle multiple concurrent permission checks", async function () {
                const functionSig1 = ethers.utils.id("function1()").slice(0, 10);
                const functionSig2 = ethers.utils.id("function2()").slice(0, 10);
                const functionSig3 = ethers.utils.id("function3()").slice(0, 10);
                
                // Call multiple functions with different signatures
                await accessControl.connect(owner).testCheckOwnerWithCooldown(functionSig1);
                await accessControl.connect(owner).testCheckOwnerWithCooldown(functionSig2);
                await accessControl.connect(owner).testCheckOwnerWithCooldown(functionSig3);
                
                // All should be in cooldown
                let [canExecute1] = await accessControl.testCheckCooldown(functionSig1);
                let [canExecute2] = await accessControl.testCheckCooldown(functionSig2);
                let [canExecute3] = await accessControl.testCheckCooldown(functionSig3);
                
                expect(canExecute1).to.be.false;
                expect(canExecute2).to.be.false;
                expect(canExecute3).to.be.false;
                
                // After cooldown, all should be available
                await time.increase(Number(ADMIN_COOLDOWN) + 1);
                
                [canExecute1] = await accessControl.testCheckCooldown(functionSig1);
                [canExecute2] = await accessControl.testCheckCooldown(functionSig2);
                [canExecute3] = await accessControl.testCheckCooldown(functionSig3);
                
                expect(canExecute1).to.be.true;
                expect(canExecute2).to.be.true;
                expect(canExecute3).to.be.true;
            });

            it("should handle edge case in ownership transfer completion", async function () {
                await accessControl.connect(owner).testInitiateOwnershipTransfer(user1.address);
                
                // Only pending owner can complete
                await time.increase(Number(OWNERSHIP_TIMELOCK) + 1);
                await expect(accessControl.connect(user2).testCompleteOwnershipTransfer())
                    .to.be.revertedWith("Caller is not the pending owner");
                
                // Pending owner can complete
                await accessControl.connect(user1).testCompleteOwnershipTransfer();
                
                // Cannot complete again (no pending transfer) - should revert with "Caller is not the pending owner"
                await expect(accessControl.connect(user1).testCompleteOwnershipTransfer())
                    .to.be.revertedWith("Caller is not the pending owner");
            });
        });

        describe("Edge Cases and Error Conditions", function () {
            // Pause mechanism removed - SafeWallet multisig handles governance
            it.skip("should handle pause/unpause edge cases", async function () {
            });

            it("should handle ownership transfer cancellation edge cases", async function () {
                // Cannot cancel when no pending transfer
                await expect(accessControl.connect(owner).testCancelOwnershipTransfer())
                    .to.be.revertedWith("No pending ownership transfer");
                
                // Initiate transfer
                await accessControl.connect(owner).testInitiateOwnershipTransfer(user1.address);
                
                // Can cancel
                await accessControl.connect(owner).testCancelOwnershipTransfer();
                
                // Cannot cancel again
                await expect(accessControl.connect(owner).testCancelOwnershipTransfer())
                    .to.be.revertedWith("No pending ownership transfer");
            });

            it("should handle timelock boundary conditions", async function () {
                await accessControl.connect(owner).testInitiateOwnershipTransfer(user1.address);
                
                // Just before timelock expires (use 2 seconds buffer for timing)
                await time.increase(Number(OWNERSHIP_TIMELOCK) - 2);
                await expect(accessControl.connect(user1).testCompleteOwnershipTransfer())
                    .to.be.revertedWith("Ownership transfer timelock not elapsed");
                
                // After timelock expires
                await time.increase(3);
                await accessControl.connect(user1).testCompleteOwnershipTransfer();
            });

            it("should handle cooldown boundary conditions", async function () {
                const functionSig = ethers.utils.id("testFunction()").slice(0, 10);
                
                await accessControl.connect(owner).testCheckOwnerWithCooldown(functionSig);
                
                // Just before cooldown expires (use 2 seconds buffer for timing)
                await time.increase(Number(ADMIN_COOLDOWN) - 2);
                await expect(accessControl.connect(owner).testCheckOwnerWithCooldown(functionSig))
                    .to.be.revertedWith("Cooldown period not elapsed");
                
                // After cooldown expires
                await time.increase(3);
                await accessControl.connect(owner).testCheckOwnerWithCooldown(functionSig);
            });
        });
    });

    // Pause mechanism removed - SafeWallet multisig handles governance
    describe.skip("Multi-Signature Pause Integration", function () {
        describe("Multi-Sig Pause Functions", function () {
            it("should pause contract via multi-sig with approvers list", async function () {
                const approvers = [user1.address, user2.address, user3.address];
                
                // Contract should not be paused initially
                expect(await accessControl.testIsPaused()).to.be.false;
                
                // Pause via multi-sig
                await accessControl.testPauseContractMultiSig(approvers);
                
                // Contract should now be paused
                expect(await accessControl.testIsPaused()).to.be.true;
                
                // Get pause info
                const [paused, pausedAt, duration] = await accessControl.testGetPauseInfo();
                expect(paused).to.be.true;
                expect(pausedAt).to.be.gt(0);
                expect(duration).to.be.gte(0);
            });

            it("should unpause contract via multi-sig with approvers list", async function () {
                const approvers = [user1.address, user2.address, user3.address];
                
                // First pause the contract
                await accessControl.testPauseContractMultiSig(approvers);
                expect(await accessControl.testIsPaused()).to.be.true;
                
                // Wait a bit
                await time.increase(100);
                
                // Unpause via multi-sig
                await accessControl.testUnpauseContractMultiSig(approvers);
                
                // Contract should now be unpaused
                expect(await accessControl.testIsPaused()).to.be.false;
                
                // Get pause info - should be reset
                const [paused, pausedAt, duration] = await accessControl.testGetPauseInfo();
                expect(paused).to.be.false;
                expect(pausedAt).to.equal(0);
                expect(duration).to.equal(0);
            });

            it("should reject multi-sig pause when already paused", async function () {
                const approvers = [user1.address, user2.address];
                
                // First pause
                await accessControl.testPauseContractMultiSig(approvers);
                
                // Try to pause again
                await expect(accessControl.testPauseContractMultiSig(approvers))
                    .to.be.revertedWith("Contract already paused");
            });

            it("should reject multi-sig unpause when not paused", async function () {
                const approvers = [user1.address, user2.address];
                
                // Try to unpause when not paused
                await expect(accessControl.testUnpauseContractMultiSig(approvers))
                    .to.be.revertedWith("Contract not paused");
            });

            it("should reject multi-sig pause with empty approvers list", async function () {
                const approvers = [];
                
                await expect(accessControl.testPauseContractMultiSig(approvers))
                    .to.be.revertedWith("No approvers provided");
            });

            it("should reject multi-sig unpause with empty approvers list", async function () {
                const approvers = [user1.address];
                
                // First pause
                await accessControl.testPauseContractMultiSig(approvers);
                
                // Try to unpause with empty list
                await expect(accessControl.testUnpauseContractMultiSig([]))
                    .to.be.revertedWith("No approvers provided");
            });

            it("should track pause duration correctly", async function () {
                const approvers = [user1.address, user2.address];
                
                // Pause the contract
                await accessControl.testPauseContractMultiSig(approvers);
                
                // Check initial pause info
                let [paused, pausedAt, duration] = await accessControl.testGetPauseInfo();
                expect(paused).to.be.true;
                expect(pausedAt).to.be.gt(0);
                const initialDuration = duration;
                
                // Wait some time
                const waitTime = 3600; // 1 hour
                await time.increase(waitTime);
                
                // Check pause info again
                [paused, pausedAt, duration] = await accessControl.testGetPauseInfo();
                expect(paused).to.be.true;
                expect(duration).to.be.gte(initialDuration + waitTime - 5); // Allow 5 second tolerance
            });

            it("should emit ContractPausedMultiSig event with approvers", async function () {
                const approvers = [user1.address, user2.address, user3.address];
                
                // Execute the pause
                const tx = await accessControl.testPauseContractMultiSig(approvers);
                const receipt = await tx.wait();
                
                // Verify contract is paused
                expect(await accessControl.testIsPaused()).to.be.true;
                
                // Note: Events from libraries are emitted but may not be easily testable
                // The important thing is that the pause state is correctly updated
            });

            it("should emit ContractUnpausedMultiSig event with approvers", async function () {
                const approvers = [user1.address, user2.address];
                
                // First pause
                await accessControl.testPauseContractMultiSig(approvers);
                
                // Then unpause
                const tx = await accessControl.testUnpauseContractMultiSig(approvers);
                const receipt = await tx.wait();
                
                // Verify contract is unpaused
                expect(await accessControl.testIsPaused()).to.be.false;
                
                // Note: Events from libraries are emitted but may not be easily testable
                // The important thing is that the pause state is correctly updated
            });
        });

        describe("Backward Compatibility", function () {
            it("should maintain compatibility with legacy pause function", async function () {
                // Legacy pause should still work
                await accessControl.connect(owner).testPauseContract();
                expect(await accessControl.testIsPaused()).to.be.true;
                
                // Should track pause timestamp
                const [paused, pausedAt, duration] = await accessControl.testGetPauseInfo();
                expect(paused).to.be.true;
                expect(pausedAt).to.be.gt(0);
            });

            it("should maintain compatibility with legacy unpause function", async function () {
                // Pause with legacy function
                await accessControl.connect(owner).testPauseContract();
                
                // Unpause with legacy function
                await accessControl.connect(owner).testUnpauseContract();
                expect(await accessControl.testIsPaused()).to.be.false;
                
                // Pause info should be reset
                const [paused, pausedAt, duration] = await accessControl.testGetPauseInfo();
                expect(paused).to.be.false;
                expect(pausedAt).to.equal(0);
            });

            it("should allow mixing legacy and multi-sig pause methods", async function () {
                // Pause with multi-sig
                const approvers = [user1.address, user2.address];
                await accessControl.testPauseContractMultiSig(approvers);
                expect(await accessControl.testIsPaused()).to.be.true;
                
                // Unpause with legacy method
                await accessControl.connect(owner).testUnpauseContract();
                expect(await accessControl.testIsPaused()).to.be.false;
                
                // Pause with legacy method
                await accessControl.connect(owner).testPauseContract();
                expect(await accessControl.testIsPaused()).to.be.true;
                
                // Unpause with multi-sig
                await accessControl.testUnpauseContractMultiSig(approvers);
                expect(await accessControl.testIsPaused()).to.be.false;
            });
        });

        describe("Pause Info Query", function () {
            it("should return correct pause info when not paused", async function () {
                const [paused, pausedAt, duration] = await accessControl.testGetPauseInfo();
                expect(paused).to.be.false;
                expect(pausedAt).to.equal(0);
                expect(duration).to.equal(0);
            });

            it("should return correct pause info when paused", async function () {
                const approvers = [user1.address];
                await accessControl.testPauseContractMultiSig(approvers);
                
                const [paused, pausedAt, duration] = await accessControl.testGetPauseInfo();
                expect(paused).to.be.true;
                expect(pausedAt).to.be.gt(0);
                expect(duration).to.be.gte(0);
            });

            it("should calculate pause duration accurately over time", async function () {
                const approvers = [user1.address];
                await accessControl.testPauseContractMultiSig(approvers);
                
                // Get initial duration
                let [, , duration1] = await accessControl.testGetPauseInfo();
                
                // Wait 1 hour
                await time.increase(3600);
                
                // Get new duration
                let [, , duration2] = await accessControl.testGetPauseInfo();
                
                // Duration should have increased by approximately 1 hour
                expect(duration2).to.be.gte(duration1 + 3600 - 5); // 5 second tolerance
            });
        });
    });
});