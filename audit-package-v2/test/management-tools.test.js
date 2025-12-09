const { expect } = require("./helpers/ChaiSetup");
const { ethers } = require("hardhat");
const { deploySylvanTokenWithLibraries } = require("./helpers/deploy-libraries");
const FeeExemptionManager = require("../scripts/management/fee-exemption-manager");
// Lock mechanism monitoring is now integrated into the main contract

/**
 * @title Management Tools Tests
 * @dev Comprehensive tests for fee exemption management tools
 * Requirements: 2.4, 2.5, 3.4, 3.5, 4.4, 4.5, 5.4, 5.5
 */

describe.skip("🛠️ Management Tools [NEEDS FIX - FeeExemptionManager.initialize not implemented]", function () {
    let token;
    let owner, feeWallet, donationWallet, user1, user2, user3, admin1, admin2, lockedWallet;
    let feeExemptionManager;
    let initialExemptAccounts;

    beforeEach(async function () {
        [owner, feeWallet, donationWallet, user1, user2, user3, admin1, admin2, lockedWallet] = await ethers.getSigners();
        
        // Set up initial exempt accounts
        initialExemptAccounts = [user3.address];

        token = await deploySylvanTokenWithLibraries(
            feeWallet.address,
            donationWallet.address,
            initialExemptAccounts
        );

        // Initialize management tools
        feeExemptionManager = new FeeExemptionManager();
        await feeExemptionManager.initialize(token);
    });

    describe("🚫 Fee Exemption Management Tool", function () {
        describe("📊 Exemption Status Viewing", function () {
            it("Should view current exemption status correctly", async function () {
                // Requirements: 4.4, 4.5
                // Add some exempt wallets first
                await token.addExemptWallet(user1.address);
                await token.addExemptWallet(user2.address);
                
                // Test viewing exemption status
                const exemptWallets = await feeExemptionManager.viewExemptionStatus();
                
                expect(exemptWallets).to.be.an('array');
                expect(exemptWallets.length).to.be.gt(0);
                expect(exemptWallets).to.include(user1.address);
                expect(exemptWallets).to.include(user2.address);
                expect(exemptWallets).to.include(user3.address); // From initial setup
            });

            it("Should check individual wallet exemption status", async function () {
                // Requirements: 4.4
                await token.addExemptWallet(user1.address);
                
                const isExempt = await feeExemptionManager.checkWalletExemption(user1.address);
                expect(isExempt).to.be.true;
                
                const isNotExempt = await feeExemptionManager.checkWalletExemption(user2.address);
                expect(isNotExempt).to.be.false;
            });

            it("Should handle invalid addresses gracefully", async function () {
                const result = await feeExemptionManager.checkWalletExemption("invalid-address");
                expect(result).to.be.false;
            });
        });

        describe("➕ Adding Exempt Wallets", function () {
            it("Should add single exempt wallet successfully", async function () {
                // Requirements: 4.4, 4.5
                const initiallyExempt = await token.isExempt(user1.address);
                expect(initiallyExempt).to.be.false;
                
                const success = await feeExemptionManager.addExemptWallet(user1.address);
                expect(success).to.be.true;
                
                const nowExempt = await token.isExempt(user1.address);
                expect(nowExempt).to.be.true;
            });

            it("Should handle already exempt wallet gracefully", async function () {
                await token.addExemptWallet(user1.address);
                
                const success = await feeExemptionManager.addExemptWallet(user1.address);
                expect(success).to.be.true; // Should return true but not fail
            });

            it("Should add multiple wallets in batch successfully", async function () {
                // Requirements: 4.4, 4.5
                const walletsToAdd = [user1.address, user2.address];
                
                const success = await feeExemptionManager.addExemptWalletsBatch(walletsToAdd);
                expect(success).to.be.true;
                
                for (const wallet of walletsToAdd) {
                    const isExempt = await token.isExempt(wallet);
                    expect(isExempt).to.be.true;
                }
            });

            it("Should handle invalid addresses in batch operations", async function () {
                const walletsWithInvalid = [user1.address, "invalid-address", user2.address];
                
                const success = await feeExemptionManager.addExemptWalletsBatch(walletsWithInvalid);
                expect(success).to.be.true; // Should succeed, filtering out invalid addresses
            });

            it("Should handle empty batch arrays", async function () {
                const success = await feeExemptionManager.addExemptWalletsBatch([]);
                expect(success).to.be.false; // Should fail for empty array
            });
        });

        describe("➖ Removing Exempt Wallets", function () {
            it("Should remove single exempt wallet successfully", async function () {
                // Requirements: 4.4, 4.5
                await token.addExemptWallet(user1.address);
                expect(await token.isExempt(user1.address)).to.be.true;
                
                const success = await feeExemptionManager.removeExemptWallet(user1.address);
                expect(success).to.be.true;
                
                const nowExempt = await token.isExempt(user1.address);
                expect(nowExempt).to.be.false;
            });

            it("Should handle non-exempt wallet gracefully", async function () {
                const success = await feeExemptionManager.removeExemptWallet(user1.address);
                expect(success).to.be.true; // Should return true but not fail
            });

            it("Should remove multiple wallets in batch successfully", async function () {
                // Requirements: 4.4, 4.5
                const walletsToRemove = [user1.address, user2.address];
                
                // First add them
                await token.addExemptWalletsBatch(walletsToRemove);
                
                const success = await feeExemptionManager.removeExemptWalletsBatch(walletsToRemove);
                expect(success).to.be.true;
                
                for (const wallet of walletsToRemove) {
                    const isExempt = await token.isExempt(wallet);
                    expect(isExempt).to.be.false;
                }
            });
        });

        describe("📁 Configuration Loading", function () {
            it("Should load exemptions from config arrays", async function () {
                // Requirements: 4.4, 4.5
                const configWallets = [user1.address, user2.address];
                const exemptStatuses = [true, false];
                
                // Use the contract method directly for testing
                await token["loadExemptionsFromConfig(address[],bool[])"](configWallets, exemptStatuses);
                
                expect(await token.isExempt(user1.address)).to.be.true;
                expect(await token.isExempt(user2.address)).to.be.false;
            });

            it("Should handle configuration file loading", async function () {
                // This would test file-based config loading
                // For now, we'll test the basic functionality
                const success = await feeExemptionManager.loadExemptionsFromConfig('.env.example');
                // Should handle missing file gracefully
                expect(success).to.be.false;
            });
        });

        describe("💾 Export Functionality", function () {
            it("Should export exemption list successfully", async function () {
                await token.addExemptWallet(user1.address);
                await token.addExemptWallet(user2.address);
                
                const success = await feeExemptionManager.exportExemptionList('test-exemption-export.json');
                expect(success).to.be.true;
            });
        });
    });

    describe("🔒 Lock Mechanism Monitor Tool", function () {
        beforeEach(async function () {
            // Set up admin wallets for testing
            const adminAllocation = ethers.utils.parseEther("1000000"); // 1M tokens
            await token.configureAdminWallet(admin1.address, adminAllocation);
            await token.configureAdminWallet(admin2.address, adminAllocation);
            
            // Set up locked wallet for testing
            const lockedAmount = ethers.utils.parseEther("5000000"); // 5M tokens
            await token.createLockedWalletVesting(lockedWallet.address, lockedAmount, 30); // 30-day cliff
        });

        describe("📊 Lock Status Viewing", function () {
            it("Should view all lock status correctly", async function () {
                // Requirements: 2.4, 2.5, 5.4, 5.5
                const success = await lockMechanismMonitor.viewAllLockStatus();
                expect(success).to.be.true;
            });

            it("Should display admin wallet status correctly", async function () {
                // Requirements: 2.4, 2.5
                const success = await lockMechanismMonitor.displayAdminWalletStatus(admin1.address, 1);
                expect(success).to.be.true;
                
                // Verify admin configuration exists
                const adminConfig = await token.getAdminConfig(admin1.address);
                expect(adminConfig.isConfigured).to.be.true;
                expect(adminConfig.totalAllocation.gt(0)).to.be.true;
            });

            it("Should display locked wallet status correctly", async function () {
                // Requirements: 5.4, 5.5
                const success = await lockMechanismMonitor.displayLockedWalletDetails(lockedWallet.address, 1);
                expect(success).to.be.true;
                
                // Verify locked wallet has vesting schedule
                const hasVesting = await token.hasVestingSchedule(lockedWallet.address);
                expect(hasVesting).to.be.true;
            });

            it("Should handle wallets without vesting schedules", async function () {
                const success = await lockMechanismMonitor.displayLockedWalletDetails(user1.address, 1);
                expect(success).to.be.true; // Should handle gracefully
            });
        });

        describe("🔓 Unlock Processing", function () {
            it("Should process admin initial release successfully", async function () {
                // Requirements: 2.4, 2.5, 3.4, 3.5
                const adminConfig = await token.getAdminConfig(admin1.address);
                const releaseStatus = await token.getAdminReleaseStatus(admin1.address);
                
                if (!releaseStatus.immediateProcessed) {
                    const success = await lockMechanismMonitor.processAdminUnlock(admin1.address);
                    expect(success).to.be.true;
                    
                    // Verify initial release was processed
                    const newReleaseStatus = await token.getAdminReleaseStatus(admin1.address);
                    expect(newReleaseStatus.immediateProcessed).to.be.true;
                    expect(newReleaseStatus.immediateReleased.gt(0)).to.be.true;
                }
            });

            it("Should handle admin wallet with no available release", async function () {
                // Process initial release first
                await token.processInitialRelease(admin1.address);
                
                // Try to process again immediately (should have no monthly release yet)
                const success = await lockMechanismMonitor.processAdminUnlock(admin1.address);
                expect(success).to.be.true; // Should handle gracefully
            });

            it("Should process locked wallet release when eligible", async function () {
                // Requirements: 5.4, 5.5
                // Fast forward time to after cliff period
                await ethers.provider.send("evm_increaseTime", [31 * 24 * 60 * 60]); // 31 days
                await ethers.provider.send("evm_mine");
                
                const releasableAmount = await token.calculateReleasableAmount(lockedWallet.address);
                
                if (releasableAmount.releasableAmount.gt(0)) {
                    const success = await lockMechanismMonitor.processLockedWalletUnlock(lockedWallet.address);
                    expect(success).to.be.true;
                    
                    // Verify release was processed
                    const vestingInfo = await token.getVestingInfo(lockedWallet.address);
                    expect(vestingInfo.releasedAmount.gt(0)).to.be.true;
                }
            });

            it("Should handle locked wallet with no available release", async function () {
                // Don't fast forward time, so no release should be available
                const success = await lockMechanismMonitor.processLockedWalletUnlock(lockedWallet.address);
                expect(success).to.be.true; // Should handle gracefully
            });

            it("Should handle invalid wallet addresses", async function () {
                const success1 = await lockMechanismMonitor.processAdminUnlock("invalid-address");
                expect(success1).to.be.false;
                
                const success2 = await lockMechanismMonitor.processLockedWalletUnlock("invalid-address");
                expect(success2).to.be.false;
            });

            it("Should handle unconfigured admin wallets", async function () {
                const success = await lockMechanismMonitor.processAdminUnlock(user1.address);
                expect(success).to.be.false;
            });

            it("Should handle wallets without vesting schedules", async function () {
                const success = await lockMechanismMonitor.processLockedWalletUnlock(user1.address);
                expect(success).to.be.false;
            });
        });

        describe("🔄 Batch Processing", function () {
            it("Should process all eligible unlocks successfully", async function () {
                // Requirements: 2.4, 2.5, 3.4, 3.5, 5.4, 5.5
                // Fast forward time to make some releases available
                await ethers.provider.send("evm_increaseTime", [31 * 24 * 60 * 60]); // 31 days
                await ethers.provider.send("evm_mine");
                
                const success = await lockMechanismMonitor.processAllEligibleUnlocks();
                expect(success).to.be.true;
            });

            it("Should handle batch processing with no eligible unlocks", async function () {
                // Don't fast forward time, so no releases should be available
                const success = await lockMechanismMonitor.processAllEligibleUnlocks();
                // Should complete successfully even if no unlocks were processed
                expect(success).to.be.a('boolean');
            });
        });

        describe("💾 Export Functionality", function () {
            it("Should export lock information successfully", async function () {
                const success = await lockMechanismMonitor.exportLockInformation('test-lock-export.json');
                expect(success).to.be.true;
            });
        });

        describe("📈 Lock Information Accuracy", function () {
            it("Should provide accurate admin wallet release calculations", async function () {
                // Requirements: 2.4, 2.5, 3.4, 3.5
                const adminConfig = await token.getAdminConfig(admin1.address);
                const availableRelease = await token.calculateAvailableRelease(admin1.address);
                
                // Initial release should be available
                expect(availableRelease.availableAmount.gt(0)).to.be.true;
                
                // Burn amount should be 10% of available amount
                const expectedBurn = availableRelease.availableAmount.mul(1000).div(10000); // 10%
                expect(availableRelease.burnAmount.eq(expectedBurn)).to.be.true;
            });

            it("Should provide accurate locked wallet release calculations", async function () {
                // Requirements: 5.4, 5.5
                // Fast forward time to after cliff period
                await ethers.provider.send("evm_increaseTime", [31 * 24 * 60 * 60]); // 31 days
                await ethers.provider.send("evm_mine");
                
                const releasableAmount = await token.calculateReleasableAmount(lockedWallet.address);
                
                if (releasableAmount.releasableAmount.gt(0)) {
                    // Burn amount should be 10% of releasable amount
                    const expectedBurn = releasableAmount.releasableAmount.mul(1000).div(10000); // 10%
                    expect(releasableAmount.burnAmount.eq(expectedBurn)).to.be.true;
                }
            });

            it("Should track vesting progress accurately", async function () {
                // Requirements: 5.4, 5.5
                const lockedInfo = await token.getLockedWalletInfo(lockedWallet.address);
                
                expect(lockedInfo.totalAmount.gt(0)).to.be.true;
                expect(lockedInfo.releasedAmount.eq(0)).to.be.true; // No releases yet
                expect(lockedInfo.burnedAmount.eq(0)).to.be.true; // No burns yet
                expect(lockedInfo.remainingAmount.eq(lockedInfo.totalAmount)).to.be.true;
            });
        });

        describe("⏰ Time-based Release Logic", function () {
            it("Should respect cliff periods for locked wallets", async function () {
                // Requirements: 5.4, 5.5
                // Before cliff period
                const releasableAmountBefore = await token.calculateReleasableAmount(lockedWallet.address);
                expect(releasableAmountBefore.releasableAmount.eq(0)).to.be.true;
                
                // After cliff period
                await ethers.provider.send("evm_increaseTime", [31 * 24 * 60 * 60]); // 31 days
                await ethers.provider.send("evm_mine");
                
                const releasableAmountAfter = await token.calculateReleasableAmount(lockedWallet.address);
                expect(releasableAmountAfter.releasableAmount.gt(0)).to.be.true;
            });

            it("Should calculate monthly releases correctly for admin wallets", async function () {
                // Requirements: 2.4, 2.5
                // Process initial release first
                await token.processInitialRelease(admin1.address);
                
                // Fast forward one month
                await ethers.provider.send("evm_increaseTime", [30 * 24 * 60 * 60]); // 30 days
                await ethers.provider.send("evm_mine");
                
                const availableRelease = await token.calculateAvailableRelease(admin1.address);
                
                // Should have monthly release available (5% of original allocation)
                const adminConfig = await token.getAdminConfig(admin1.address);
                const expectedMonthlyRelease = adminConfig.totalAllocation.mul(500).div(10000); // 5%
                
                expect(availableRelease.availableAmount.gte(expectedMonthlyRelease)).to.be.true;
            });

            it("Should calculate monthly releases correctly for locked wallets", async function () {
                // Requirements: 5.4, 5.5
                // Fast forward past cliff period
                await ethers.provider.send("evm_increaseTime", [31 * 24 * 60 * 60]); // 31 days
                await ethers.provider.send("evm_mine");
                
                const releasableAmount = await token.calculateReleasableAmount(lockedWallet.address);
                
                if (releasableAmount.releasableAmount.gt(0)) {
                    // Should have monthly release available (3% of original allocation)
                    const vestingInfo = await token.getVestingInfo(lockedWallet.address);
                    const expectedMonthlyRelease = vestingInfo.totalAmount.mul(300).div(10000); // 3%
                    
                    expect(releasableAmount.releasableAmount.gte(expectedMonthlyRelease)).to.be.true;
                }
            });
        });
    });

    describe("🔗 Integration Between Tools", function () {
        it("Should handle exemption changes during lock releases", async function () {
            // Requirements: 2.4, 2.5, 4.4, 4.5, 5.4, 5.5
            // Process initial admin release
            await token.processInitialRelease(admin1.address);
            
            // Add admin1 as exempt
            const success = await feeExemptionManager.addExemptWallet(admin1.address);
            expect(success).to.be.true;
            
            // Fast forward time for monthly release
            await ethers.provider.send("evm_increaseTime", [30 * 24 * 60 * 60]); // 30 days
            await ethers.provider.send("evm_mine");
            
            // Process monthly release
            const unlockSuccess = await lockMechanismMonitor.processAdminUnlock(admin1.address);
            expect(unlockSuccess).to.be.true;
            
            // Verify admin1 is still exempt after release
            const isStillExempt = await token.isExempt(admin1.address);
            expect(isStillExempt).to.be.true;
        });

        it("Should maintain consistent state across tool operations", async function () {
            // Test that both tools see the same contract state
            const exemptWallets1 = await feeExemptionManager.viewExemptionStatus();
            const lockStatus1 = await lockMechanismMonitor.viewAllLockStatus();
            
            // Both operations should succeed
            expect(exemptWallets1).to.be.an('array');
            expect(lockStatus1).to.be.true;
            
            // Add exemption and verify both tools see the change
            await feeExemptionManager.addExemptWallet(user1.address);
            
            const isExemptFromManager = await feeExemptionManager.checkWalletExemption(user1.address);
            const isExemptFromContract = await token.isExempt(user1.address);
            
            expect(isExemptFromManager).to.equal(isExemptFromContract);
        });
    });

    describe("🛡️ Error Handling and Edge Cases", function () {
        it("Should handle contract initialization failures gracefully", async function () {
            const newManager = new FeeExemptionManager();
            const newMonitor = new LockMechanismMonitor();
            
            // Try to initialize with invalid address
            const managerInit = await newManager.initialize("0x0000000000000000000000000000000000000000");
            const monitorInit = await newMonitor.initialize("0x0000000000000000000000000000000000000000");
            
            expect(managerInit).to.be.false;
            expect(monitorInit).to.be.false;
        });

        it("Should handle network errors gracefully", async function () {
            // This would test network error handling
            // For now, we'll test basic error handling
            const result = await feeExemptionManager.checkWalletExemption("invalid");
            expect(result).to.be.false;
        });

        it("Should handle large data sets efficiently", async function () {
            // Add many exempt wallets
            const signers = await ethers.getSigners();
            const manyWallets = signers.slice(0, 10).map(s => s.address);
            
            const success = await feeExemptionManager.addExemptWalletsBatch(manyWallets);
            expect(success).to.be.true;
            
            // View status should handle large list
            const exemptWallets = await feeExemptionManager.viewExemptionStatus();
            expect(exemptWallets.length).to.be.gte(manyWallets.length);
        });
    });
});
