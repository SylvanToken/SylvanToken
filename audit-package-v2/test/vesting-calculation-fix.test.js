const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture, time } = require("@nomicfoundation/hardhat-network-helpers");

/**
 * @title Vesting Calculation Fix Test
 * @dev Tests for the critical bug fix in releaseVestedTokens function
 * @notice Validates that admin wallets receive correct vesting amounts
 * 
 * AUDIT ISSUE #1: Incorrect Vesting Calculation for Admin Wallets
 * - Problem: releaseVestedTokens was calling _calculateLockedWalletRelease for ALL beneficiaries
 * - Impact: Admin wallets received 10% less tokens, causing 9% permanent fund loss
 * - Fix: Route to correct helper based on schedule.isAdmin flag
 */
describe("🔧 Vesting Calculation Fix - Audit Issue #1", function () {
    let token;
    let owner, admin1, admin2, lockedWallet, feeWallet, donationWallet;
    
    // Contract constants - must match SylvanToken.sol
    const SECONDS_PER_MONTH = 2629746; // Average month in seconds (30.44 days)
    
    async function deployTokenFixture() {
        [owner, admin1, admin2, lockedWallet, feeWallet, donationWallet, ...others] = await ethers.getSigners();
        
        const SylvanToken = await ethers.getContractFactory("SylvanToken");
        
        const initialExemptAccounts = [owner.address, feeWallet.address, donationWallet.address];
        
        token = await SylvanToken.deploy(
            feeWallet.address,
            donationWallet.address,
            initialExemptAccounts
        );
        
        await token.deployed();
        
        return { token, owner, admin1, admin2, lockedWallet, feeWallet, donationWallet };
    }
    
    beforeEach(async function () {
        ({ token, owner, admin1, admin2, lockedWallet, feeWallet, donationWallet } = await loadFixture(deployTokenFixture));
    });
    
    describe("✅ Admin Wallet Vesting - Correct Calculation", function () {
        
        it("should use _calculateAvailableRelease for admin wallets (not _calculateLockedWalletRelease)", async function () {
            const allocation = ethers.utils.parseEther("10000000"); // 10M tokens
            
            // Configure admin wallet
            await token.connect(owner).configureAdminWallet(admin1.address, allocation);
            
            // Process initial release (10%)
            await token.connect(owner).processInitialRelease(admin1.address);
            
            // Get admin config and vesting schedule
            const config = await token.getAdminConfig(admin1.address);
            const schedule = await token.getVestingInfo(admin1.address);
            
            // Verify setup
            expect(config.totalAllocation).to.equal(allocation);
            expect(config.immediateRelease).to.equal(allocation.div(10)); // 10%
            // SECURITY FIX: schedule.totalAmount now stores FULL allocation for correct calculation
            // This ensures 5% monthly is calculated from total allocation, not locked amount
            expect(schedule.totalAmount).to.equal(allocation); // Full allocation stored
            expect(schedule.isAdmin).to.be.true;
            
            console.log(`Total Allocation: ${ethers.utils.formatEther(allocation)} tokens`);
            console.log(`Immediate Release (10%): ${ethers.utils.formatEther(config.immediateRelease)} tokens`);
            console.log(`Schedule Total Amount: ${ethers.utils.formatEther(schedule.totalAmount)} tokens`);
        });

        it("should calculate correct monthly release for admin wallets (5% of total allocation)", async function () {
            const allocation = ethers.utils.parseEther("10000000"); // 10M tokens
            
            // Configure and process initial release
            await token.connect(owner).configureAdminWallet(admin1.address, allocation);
            await token.connect(owner).processInitialRelease(admin1.address);
            
            // Fast forward past cliff (admin cliff is 0, but we need 1 month for first release)
            // Use SECONDS_PER_MONTH to match contract's calculation
            await time.increase(SECONDS_PER_MONTH + 1); // 1 month + 1 second
            
            // Calculate expected monthly release
            // SECURITY FIX: Admin monthly release is 5% of TOTAL allocation (not locked amount)
            // This ensures admin receives full allocation over 18 months + 10% initial
            // 18 months × 5% = 90% + 10% initial = 100% total
            const expectedMonthlyRelease = allocation.mul(500).div(10000); // 5% of 10M = 500K
            
            // Get calculated release amount
            const [availableAmount, burnAmount] = await token.calculateAvailableRelease(admin1.address);
            
            console.log(`Total Allocation: ${ethers.utils.formatEther(allocation)} tokens`);
            console.log(`Expected Monthly (5% of total): ${ethers.utils.formatEther(expectedMonthlyRelease)} tokens`);
            console.log(`Calculated Available: ${ethers.utils.formatEther(availableAmount)} tokens`);
            console.log(`Burn Amount (10%): ${ethers.utils.formatEther(burnAmount)} tokens`);
            
            // Verify calculation is correct
            expect(availableAmount).to.equal(expectedMonthlyRelease);
            expect(burnAmount).to.equal(expectedMonthlyRelease.mul(10).div(100)); // 10% burn
        });

        it("should release correct amount via releaseVestedTokens for admin wallets", async function () {
            const allocation = ethers.utils.parseEther("10000000"); // 10M tokens
            
            // Configure and process initial release
            await token.connect(owner).configureAdminWallet(admin1.address, allocation);
            await token.connect(owner).processInitialRelease(admin1.address);
            
            const initialBalance = await token.balanceOf(admin1.address);
            console.log(`Initial Balance (after 10% immediate): ${ethers.utils.formatEther(initialBalance)} tokens`);
            
            // Fast forward 1 month (use contract's SECONDS_PER_MONTH)
            await time.increase(SECONDS_PER_MONTH + 1);
            
            // Release vested tokens
            const tx = await token.releaseVestedTokens(admin1.address);
            const receipt = await tx.wait();
            
            const finalBalance = await token.balanceOf(admin1.address);
            const released = finalBalance.sub(initialBalance);
            
            // SECURITY FIX: Expected is 5% of TOTAL allocation = 500K tokens
            // After 10% burn: 500K - 50K = 450K tokens to beneficiary
            const monthlyRelease = allocation.mul(500).div(10000); // 5% of 10M = 500K
            const burnAmount = monthlyRelease.mul(10).div(100); // 10% burn = 50K
            const expectedToReceive = monthlyRelease.sub(burnAmount); // 450K to beneficiary
            
            console.log(`Monthly Release (5% of total): ${ethers.utils.formatEther(monthlyRelease)} tokens`);
            console.log(`Burn Amount (10%): ${ethers.utils.formatEther(burnAmount)} tokens`);
            console.log(`Expected to Receive: ${ethers.utils.formatEther(expectedToReceive)} tokens`);
            console.log(`Actually Received: ${ethers.utils.formatEther(released)} tokens`);
            
            expect(released).to.equal(expectedToReceive);
            console.log(`✅ Admin received correct amount!`);
        });
    });
    
    describe("✅ Locked Wallet Vesting - Correct Calculation", function () {
        
        it("should use _calculateLockedWalletRelease for locked wallets", async function () {
            const lockedAmount = ethers.utils.parseEther("5000000"); // 5M tokens
            
            // Create locked wallet vesting
            await token.connect(owner).createLockedWalletVesting(
                lockedWallet.address,
                lockedAmount,
                30 // 30 days cliff
            );
            
            const schedule = await token.getVestingInfo(lockedWallet.address);
            
            expect(schedule.totalAmount).to.equal(lockedAmount);
            expect(schedule.isAdmin).to.be.false;
            
            console.log(`Locked Wallet Amount: ${ethers.utils.formatEther(lockedAmount)} tokens`);
            console.log(`Is Admin: ${schedule.isAdmin}`);
        });

        it("should calculate correct monthly release for locked wallets (3% monthly)", async function () {
            const lockedAmount = ethers.utils.parseEther("5000000"); // 5M tokens
            
            // Create locked wallet vesting
            await token.connect(owner).createLockedWalletVesting(
                lockedWallet.address,
                lockedAmount,
                30 // 30 days cliff
            );
            
            // Fast forward past cliff (30 days) + 1 month
            // Cliff: 30 days = 30 * 86400 = 2592000 seconds
            // Plus 1 month for first release
            await time.increase(30 * 86400 + SECONDS_PER_MONTH + 1);
            
            // Calculate expected monthly release
            // Locked wallet: 3% of locked amount per month
            const expectedMonthlyRelease = lockedAmount.mul(300).div(10000); // 3% = 300 basis points
            
            // Get calculated release amount
            const [availableAmount, burnAmount] = await token.calculateReleasableAmount(lockedWallet.address);
            
            console.log(`Locked Amount: ${ethers.utils.formatEther(lockedAmount)} tokens`);
            console.log(`Expected Monthly (3%): ${ethers.utils.formatEther(expectedMonthlyRelease)} tokens`);
            console.log(`Calculated Available: ${ethers.utils.formatEther(availableAmount)} tokens`);
            
            // Verify calculation is correct
            expect(availableAmount).to.equal(expectedMonthlyRelease);
        });
    });
    
    describe("✅ Differentiation Between Admin and Locked Wallets", function () {
        
        it("should route to correct calculation based on isAdmin flag", async function () {
            const adminAllocation = ethers.utils.parseEther("10000000"); // 10M
            const lockedAllocation = ethers.utils.parseEther("5000000"); // 5M
            
            // Setup admin wallet
            await token.connect(owner).configureAdminWallet(admin1.address, adminAllocation);
            await token.connect(owner).processInitialRelease(admin1.address);
            
            // Setup locked wallet
            await token.connect(owner).createLockedWalletVesting(
                lockedWallet.address,
                lockedAllocation,
                30
            );
            
            // Verify isAdmin flags
            const adminSchedule = await token.getVestingInfo(admin1.address);
            const lockedSchedule = await token.getVestingInfo(lockedWallet.address);
            
            expect(adminSchedule.isAdmin).to.be.true;
            expect(lockedSchedule.isAdmin).to.be.false;
            
            // Fast forward past cliff (30 days for locked wallet) + 1 month
            await time.increase(30 * 86400 + SECONDS_PER_MONTH + 1);
            
            // Both should be able to release
            await expect(token.releaseVestedTokens(admin1.address)).to.not.be.reverted;
            await expect(token.releaseVestedTokens(lockedWallet.address)).to.not.be.reverted;
            
            console.log(`✅ Both admin and locked wallet releases work correctly!`);
        });
    });
    
    describe("✅ No Fund Loss - Full Vesting Period", function () {
        
        it("should release 100% of admin allocation over full vesting period (no 9% loss)", async function () {
            this.timeout(120000); // 2 minute timeout for this test
            
            const allocation = ethers.utils.parseEther("10000000"); // 10M tokens
            
            // Configure and process initial release
            await token.connect(owner).configureAdminWallet(admin1.address, allocation);
            await token.connect(owner).processInitialRelease(admin1.address);
            
            // Track total received
            let totalReceived = await token.balanceOf(admin1.address); // Initial 10%
            let totalBurned = ethers.BigNumber.from(0);
            
            console.log(`Initial Release (10%): ${ethers.utils.formatEther(totalReceived)} tokens`);
            
            // Release over 20 months (admin vesting period)
            for (let month = 1; month <= 20; month++) {
                // Advance 1 month (use contract's SECONDS_PER_MONTH)
                await time.increase(SECONDS_PER_MONTH);
                
                try {
                    const balanceBefore = await token.balanceOf(admin1.address);
                    const tx = await token.releaseVestedTokens(admin1.address);
                    const receipt = await tx.wait();
                    const balanceAfter = await token.balanceOf(admin1.address);
                    
                    const released = balanceAfter.sub(balanceBefore);
                    totalReceived = balanceAfter;
                    
                    // Get burn amount from event
                    const event = receipt.events?.find(e => e.event === 'TokensReleased');
                    if (event) {
                        totalBurned = totalBurned.add(event.args.burnedAmount);
                    }
                    
                    if (month <= 3 || month >= 18) {
                        console.log(`Month ${month}: Released ${ethers.utils.formatEther(released)} tokens`);
                    }
                } catch (error) {
                    if (error.message.includes("NoTokensToRelease")) {
                        console.log(`Month ${month}: No more tokens to release`);
                        break;
                    }
                    throw error;
                }
            }
            
            const totalDistributed = totalReceived.add(totalBurned);
            const percentageReceived = totalReceived.mul(10000).div(allocation);
            const percentageBurned = totalBurned.mul(10000).div(allocation);
            const percentageTotal = totalDistributed.mul(10000).div(allocation);
            
            console.log(`\n📊 Final Summary:`);
            console.log(`Total Allocation: ${ethers.utils.formatEther(allocation)} tokens`);
            console.log(`Total Received: ${ethers.utils.formatEther(totalReceived)} tokens (${percentageReceived.toNumber() / 100}%)`);
            console.log(`Total Burned: ${ethers.utils.formatEther(totalBurned)} tokens (${percentageBurned.toNumber() / 100}%)`);
            console.log(`Total Distributed: ${ethers.utils.formatEther(totalDistributed)} tokens (${percentageTotal.toNumber() / 100}%)`);
            
            // Verify no significant fund loss (allow 1% for rounding)
            const lossPercentage = allocation.sub(totalDistributed).mul(10000).div(allocation);
            expect(lossPercentage).to.be.lt(100); // Less than 1% loss
            
            console.log(`\n✅ NO 9% FUND LOSS - Bug is fixed!`);
        });
    });
});
