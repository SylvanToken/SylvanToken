const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

/**
 * @title Ownership Privileges Verification Test
 * @dev Verifies all owner privileges listed in the audit report
 * @notice Confirms which privileges exist and which have been removed
 */
describe("👑 Ownership Privileges Verification", function () {
    let token;
    let owner, user1, user2, admin1, lockedWallet, feeWallet, donationWallet;
    
    async function deployTokenFixture() {
        [owner, user1, user2, admin1, lockedWallet, feeWallet, donationWallet] = await ethers.getSigners();
        
        const SylvanToken = await ethers.getContractFactory("SylvanToken");
        
        const initialExemptAccounts = [owner.address, feeWallet.address, donationWallet.address];
        
        token = await SylvanToken.deploy(
            feeWallet.address,
            donationWallet.address,
            initialExemptAccounts
        );
        
        await token.deployed();
        
        return { token, owner, user1, user2, admin1, lockedWallet, feeWallet, donationWallet };
    }
    
    beforeEach(async function () {
        ({ token, owner, user1, user2, admin1, lockedWallet, feeWallet, donationWallet } = await loadFixture(deployTokenFixture));
    });
    
    describe("📋 Fee Exemption Privileges", function () {
        
        it("✅ Owner CAN exempt wallets from fees (addExemptWallet)", async function () {
            await expect(token.connect(owner).addExemptWallet(user1.address))
                .to.emit(token, "FeeExemptionChanged")
                .withArgs(user1.address, true);
            
            expect(await token.isExempt(user1.address)).to.be.true;
            console.log("✅ addExemptWallet - EXISTS and WORKS");
        });
        
        it("✅ Owner CAN remove exemptions (removeExemptWallet)", async function () {
            await token.connect(owner).addExemptWallet(user1.address);
            
            await expect(token.connect(owner).removeExemptWallet(user1.address))
                .to.emit(token, "FeeExemptionChanged")
                .withArgs(user1.address, false);
            
            expect(await token.isExempt(user1.address)).to.be.false;
            console.log("✅ removeExemptWallet - EXISTS and WORKS");
        });
        
        it("✅ Owner CAN manage exemptions in bulk (addExemptWalletsBatch)", async function () {
            const wallets = [user1.address, user2.address];
            
            await expect(token.connect(owner).addExemptWalletsBatch(wallets))
                .to.emit(token, "BatchExemptionUpdate");
            
            expect(await token.isExempt(user1.address)).to.be.true;
            expect(await token.isExempt(user2.address)).to.be.true;
            console.log("✅ addExemptWalletsBatch - EXISTS and WORKS");
        });
        
        it("✅ Owner CAN configure exemptions with config (loadExemptionsFromConfig)", async function () {
            const wallets = [user1.address, user2.address];
            const statuses = [true, true];
            
            // Overloaded function with parameters
            await expect(token.connect(owner)["loadExemptionsFromConfig(address[],bool[])"](wallets, statuses))
                .to.emit(token, "ExemptionConfigLoaded");
            
            expect(await token.isExempt(user1.address)).to.be.true;
            console.log("✅ loadExemptionsFromConfig (with params) - EXISTS and WORKS");
        });
        
        it("❌ Non-owner CANNOT exempt wallets", async function () {
            await expect(token.connect(user1).addExemptWallet(user2.address))
                .to.be.revertedWith("Ownable: caller is not the owner");
            console.log("✅ Non-owner correctly blocked from addExemptWallet");
        });
    });
    
    describe("📋 Vesting Schedule Privileges", function () {
        
        it("✅ Owner CAN create a vesting schedule (createVestingSchedule)", async function () {
            const amount = ethers.utils.parseEther("1000000");
            
            await expect(token.connect(owner).createVestingSchedule(
                user1.address,
                amount,
                30, // cliff days
                12, // vesting months
                500, // 5% release
                1000, // 10% burn
                false // not admin
            )).to.emit(token, "VestingScheduleCreated");
            
            console.log("✅ createVestingSchedule - EXISTS and WORKS");
        });
        
        it("❌ Non-owner CANNOT create vesting schedule", async function () {
            const amount = ethers.utils.parseEther("1000000");
            
            await expect(token.connect(user1).createVestingSchedule(
                user2.address,
                amount,
                30, 12, 500, 1000, false
            )).to.be.revertedWith("Ownable: caller is not the owner");
            console.log("✅ Non-owner correctly blocked from createVestingSchedule");
        });
    });
    
    describe("📋 Admin Wallet Privileges", function () {
        
        it("✅ Owner CAN configure admin wallet (configureAdminWallet)", async function () {
            const allocation = ethers.utils.parseEther("10000000");
            
            await expect(token.connect(owner).configureAdminWallet(admin1.address, allocation))
                .to.emit(token, "AdminWalletConfigured");
            
            console.log("✅ configureAdminWallet - EXISTS and WORKS");
        });
        
        it("✅ Owner CAN process initial 10% release (processInitialRelease)", async function () {
            const allocation = ethers.utils.parseEther("10000000");
            await token.connect(owner).configureAdminWallet(admin1.address, allocation);
            
            await expect(token.connect(owner).processInitialRelease(admin1.address))
                .to.emit(token, "InitialReleaseProcessed");
            
            console.log("✅ processInitialRelease - EXISTS and WORKS");
        });
        
        it("✅ Owner CAN process monthly release for admin (processMonthlyRelease)", async function () {
            const allocation = ethers.utils.parseEther("10000000");
            await token.connect(owner).configureAdminWallet(admin1.address, allocation);
            await token.connect(owner).processInitialRelease(admin1.address);
            
            // Fast forward 1 month
            await ethers.provider.send("evm_increaseTime", [2629746 + 1]);
            await ethers.provider.send("evm_mine");
            
            await expect(token.connect(owner).processMonthlyRelease(admin1.address))
                .to.emit(token, "MonthlyReleaseProcessed");
            
            console.log("✅ processMonthlyRelease - EXISTS and WORKS");
        });
        
        it("❌ Non-owner CANNOT configure admin wallet", async function () {
            const allocation = ethers.utils.parseEther("10000000");
            
            await expect(token.connect(user1).configureAdminWallet(admin1.address, allocation))
                .to.be.revertedWith("Ownable: caller is not the owner");
            console.log("✅ Non-owner correctly blocked from configureAdminWallet");
        });
    });
    
    describe("📋 Locked Wallet Privileges", function () {
        
        it("✅ Owner CAN create locked wallet vesting (createLockedWalletVesting)", async function () {
            const amount = ethers.utils.parseEther("5000000");
            
            await expect(token.connect(owner).createLockedWalletVesting(
                lockedWallet.address,
                amount,
                30 // cliff days
            )).to.emit(token, "VestingScheduleCreated");
            
            console.log("✅ createLockedWalletVesting - EXISTS and WORKS");
        });
        
        it("✅ Owner CAN process locked wallet release (processLockedWalletRelease)", async function () {
            const amount = ethers.utils.parseEther("5000000");
            await token.connect(owner).createLockedWalletVesting(lockedWallet.address, amount, 30);
            
            // Fast forward past cliff + 1 month
            await ethers.provider.send("evm_increaseTime", [30 * 86400 + 2629746 + 1]);
            await ethers.provider.send("evm_mine");
            
            await expect(token.connect(owner).processLockedWalletRelease(lockedWallet.address))
                .to.emit(token, "TokensReleased");
            
            console.log("✅ processLockedWalletRelease - EXISTS and WORKS");
        });
    });
    
    describe("📋 AMM Pair Privileges", function () {
        
        it("✅ Owner CAN set AMM pair (setAMMPair)", async function () {
            const fakePair = user1.address; // Using user1 as fake pair address
            
            await token.connect(owner).setAMMPair(fakePair, true);
            
            expect(await token.isAMMPair(fakePair)).to.be.true;
            console.log("✅ setAMMPair - EXISTS and WORKS");
        });
        
        it("✅ Owner CAN unset AMM pair", async function () {
            const fakePair = user1.address;
            
            await token.connect(owner).setAMMPair(fakePair, true);
            await token.connect(owner).setAMMPair(fakePair, false);
            
            expect(await token.isAMMPair(fakePair)).to.be.false;
            console.log("✅ setAMMPair (unset) - EXISTS and WORKS");
        });
        
        it("❌ Non-owner CANNOT set AMM pair", async function () {
            await expect(token.connect(user1).setAMMPair(user2.address, true))
                .to.be.revertedWith("Ownable: caller is not the owner");
            console.log("✅ Non-owner correctly blocked from setAMMPair");
        });
    });
    
    describe("📋 REMOVED Privileges (Pause Mechanism)", function () {
        
        it("❌ pauseContract function DOES NOT EXIST", async function () {
            expect(token.pauseContract).to.be.undefined;
            expect(token.pause).to.be.undefined;
            console.log("✅ pauseContract - REMOVED (does not exist)");
        });
        
        it("❌ unpauseContract function DOES NOT EXIST", async function () {
            expect(token.unpauseContract).to.be.undefined;
            expect(token.unpause).to.be.undefined;
            console.log("✅ unpauseContract - REMOVED (does not exist)");
        });
        
        it("❌ Owner CANNOT pause token transfers", async function () {
            // Verify no pause-related functions exist
            const pauseFunctions = [
                'pauseContract', 'unpauseContract', 'pause', 'unpause',
                'isPaused', 'paused', 'isContractPaused'
            ];
            
            for (const func of pauseFunctions) {
                expect(token[func]).to.be.undefined;
            }
            
            // Transfers always work
            await token.connect(owner).transfer(user1.address, ethers.utils.parseEther("1000"));
            await expect(token.connect(user1).transfer(user2.address, ethers.utils.parseEther("100")))
                .to.not.be.reverted;
            
            console.log("✅ PAUSE MECHANISM COMPLETELY REMOVED");
            console.log("✅ Owner CANNOT pause/unpause token transfers");
        });
    });
    
    describe("📊 Summary", function () {
        
        it("should display complete privilege summary", async function () {
            console.log("\n" + "=".repeat(60));
            console.log("📊 OWNERSHIP PRIVILEGES SUMMARY");
            console.log("=".repeat(60));
            
            console.log("\n✅ EXISTING PRIVILEGES (Owner CAN do):");
            console.log("   1. Exempt wallets from fees (addExemptWallet)");
            console.log("   2. Remove fee exemptions (removeExemptWallet)");
            console.log("   3. Manage exemptions in bulk (addExemptWalletsBatch)");
            console.log("   4. Emit exemption count (loadExemptionsFromConfig)");
            console.log("   5. Create vesting schedule (createVestingSchedule)");
            console.log("   6. Configure admin wallet (configureAdminWallet)");
            console.log("   7. Process initial 10% release (processInitialRelease)");
            console.log("   8. Process monthly admin release (processMonthlyRelease)");
            console.log("   9. Process locked wallet release (processLockedWalletRelease)");
            console.log("   10. Set/unset AMM pair (setAMMPair)");
            
            console.log("\n❌ REMOVED PRIVILEGES (Owner CANNOT do):");
            console.log("   1. Pause token transfers - REMOVED");
            console.log("   2. Unpause token transfers - REMOVED");
            
            console.log("\n" + "=".repeat(60));
            console.log("🔒 SECURITY: Pause mechanism completely removed");
            console.log("🔒 DECENTRALIZATION: No entity can halt trading");
            console.log("=".repeat(60) + "\n");
            
            expect(true).to.be.true; // Always pass - this is just for display
        });
    });
});
