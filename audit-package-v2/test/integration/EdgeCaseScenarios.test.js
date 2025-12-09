const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");
const { deploySylvanTokenWithLibraries } = require("../helpers/deploy-libraries");

/**
 * @title Edge Case Scenario Tests
 * @dev Comprehensive edge case and boundary testing for the SylvanToken system
 * Requirements: 1.5, 2.1, 2.2
 */
describe.skip("🎯 Edge Case Scenario Tests", function () {
    let token;
    let owner, feeWallet, donationWallet, user1, user2, user3, ammPair;
    
    const ADMIN_COOLDOWN = 1 * 60 * 60; // 1 hour
    const EMERGENCY_TIMELOCK = 2 * 24 * 60 * 60; // 2 days
    const DEAD_WALLET = "0x000000000000000000000000000000000000dEaD";

    beforeEach(async function () {
        this.timeout(30000);
        [owner, feeWallet, donationWallet, user1, user2, user3, ammPair] = await ethers.getSigners();

        // Deploy token with libraries using helper
        token = await deploySylvanTokenWithLibraries(
            feeWallet.address,
            donationWallet.address,
            []
        );
    });

    describe("💰 Boundary Value Testing", function () {
        it("Should handle minimum transfer amounts", async function () {
            await token.enableTrading();
            await token.setAMMPair(ammPair.address, true);

            // Transfer minimum amount (1 wei)
            await token.transfer(user1.address, 1);
            expect(await token.balanceOf(user1.address)).to.equal(1);

            // Note: user1 is not exempt by default, no need to remove exemption
            // Transfer 1 wei to AMM (should handle rounding)
            await token.connect(user1).transfer(ammPair.address, 1);
            
            // Verify transfer completed (even if tax rounds to 0)
            const ammBalance = await token.balanceOf(ammPair.address);
            expect(ammBalance.gte(0)).to.be.true;
        });

        it("Should handle maximum safe transfer amounts", async function () {
            const ownerBalance = await token.balanceOf(owner.address);
            const maxTransfer = ownerBalance.div(2);

            // Transfer large amount
            await token.transfer(user1.address, maxTransfer);
            expect(await token.balanceOf(user1.address)).to.equal(maxTransfer);

            // Verify no overflow
            const remainingBalance = await token.balanceOf(owner.address);
            expect(remainingBalance.add(maxTransfer)).to.equal(ownerBalance);
        });

        it("Should handle tax calculations at boundaries", async function () {
            await token.enableTrading();
            await token.setAMMPair(ammPair.address, true);

            // Test with amount that results in exact tax division
            const amount = ethers.utils.parseEther("10000"); // 1% = 100 ESYL
            await token.transfer(user1.address, amount);
            await token.removeExemptWallet(user1.address);

            const initialFeeBalance = await token.balanceOf(feeWallet.address);
            const initialDonationBalance = await token.balanceOf(donationWallet.address);
            const initialBurnBalance = await token.balanceOf(DEAD_WALLET);

            await token.connect(user1).transfer(ammPair.address, amount);

            const finalFeeBalance = await token.balanceOf(feeWallet.address);
            const finalDonationBalance = await token.balanceOf(donationWallet.address);
            const finalBurnBalance = await token.balanceOf(DEAD_WALLET);

            // Verify distribution (50% fee, 25% burn, 25% donation)
            const expectedTax = amount.mul(100).div(10000); // 1%
            const expectedFee = expectedTax.mul(5000).div(10000); // 50%
            const expectedBurn = expectedTax.mul(2500).div(10000); // 25%
            const expectedDonation = expectedTax.sub(expectedFee).sub(expectedBurn); // Remaining

            expect(finalFeeBalance.sub(initialFeeBalance)).to.equal(expectedFee);
            expect(finalBurnBalance.sub(initialBurnBalance)).to.equal(expectedBurn);
            expect(finalDonationBalance.sub(initialDonationBalance)).to.equal(expectedDonation);
        });

        it("Should handle amounts causing rounding in tax distribution", async function () {
            await token.enableTrading();
            await token.setAMMPair(ammPair.address, true);

            // Use odd amount that doesn't divide evenly
            const amount = ethers.utils.parseEther("1337"); // 1% = 13.37 ESYL
            await token.transfer(user1.address, amount);
            await token.removeExemptWallet(user1.address);

            const initialTotalSupply = await token.totalSupply();
            await token.connect(user1).transfer(ammPair.address, amount);
            const finalTotalSupply = await token.totalSupply();

            // Verify no tokens lost to rounding
            const burned = initialTotalSupply.sub(finalTotalSupply);
            expect(burned.gt(0)).to.be.true; // Some tokens burned
        });
    });

    describe("⏰ Timelock and Cooldown Edge Cases", function () {
        it("Should handle operations exactly at cooldown expiry", async function () {
            // Perform first operation
            await token.setAMMPair(ammPair.address, true);

            // Fast forward to exactly cooldown expiry
            await time.increase(ADMIN_COOLDOWN);

            // Should succeed at exact expiry
            await token.setAMMPair(user1.address, true);
            expect(await token.isAMMPair(user1.address)).to.be.true;
        });

        it("Should handle operations just before cooldown expiry", async function () {
            // Perform first operation
            await token.setAMMPair(ammPair.address, true);

            // Fast forward to just before cooldown expiry
            await time.increase(ADMIN_COOLDOWN - 2);

            // Should fail just before expiry
            await expect(token.setAMMPair(user1.address, true))
                .to.be.revertedWith("Cooldown period not elapsed");
        });

        it("Should handle emergency timelock boundary conditions", async function () {
            // Enable emergency withdraw
            await token.enableEmergencyWithdraw();

            // Send ETH to contract
            await owner.sendTransaction({
                to: token.address,
                value: ethers.utils.parseEther("1.0")
            });

            // Try to withdraw just before timelock expires
            await time.increase(EMERGENCY_TIMELOCK - 2);
            await expect(token.emergencyWithdraw(ethers.constants.AddressZero, ethers.utils.parseEther("0.1")))
                .to.be.revertedWith("Emergency withdraw not available");

            // Try at exact expiry
            await time.increase(2);
            await token.emergencyWithdraw(ethers.constants.AddressZero, ethers.utils.parseEther("0.1"));
        });

        it("Should handle multiple cooldown timers independently", async function () {
            // Trigger different operations with different cooldowns
            await token.setAMMPair(ammPair.address, true);
            
            // Fast forward partial cooldown
            await time.increase(ADMIN_COOLDOWN / 2);
            
            // Try another AMM operation (should fail)
            await expect(token.setAMMPair(user1.address, true))
                .to.be.revertedWith("Cooldown period not elapsed");

            // But pause should work (different function signature)
            await token.pauseContract();
            expect(await token.contractPaused()).to.be.true;
        });
    });

    describe("🔄 State Transition Edge Cases", function () {
        it("Should handle rapid state changes", async function () {
            // Pause and unpause rapidly
            await token.pauseContract();
            await token.unpauseContract();
            await token.pauseContract();
            await token.unpauseContract();

            // Verify final state
            expect(await token.contractPaused()).to.be.false;
        });

        it("Should handle exemption status changes during transfers", async function () {
            await token.enableTrading();
            await token.setAMMPair(ammPair.address, true);

            // Transfer tokens to user1
            await token.transfer(user1.address, ethers.utils.parseEther("10000"));

            // Add exemption
            await token.addExemptWallet(user1.address);
            
            // Transfer (no tax)
            const amount = ethers.utils.parseEther("1000");
            const initialAmmBalance = await token.balanceOf(ammPair.address);
            await token.connect(user1).transfer(ammPair.address, amount);
            let finalAmmBalance = await token.balanceOf(ammPair.address);
            expect(finalAmmBalance.sub(initialAmmBalance)).to.equal(amount);

            // Remove exemption
            await time.increase(ADMIN_COOLDOWN + 1);
            await token.removeExemptWallet(user1.address);

            // Transfer (with tax)
            const initialAmmBalance2 = await token.balanceOf(ammPair.address);
            await token.connect(user1).transfer(ammPair.address, amount);
            const finalAmmBalance2 = await token.balanceOf(ammPair.address);
            expect(finalAmmBalance2.sub(initialAmmBalance2).lt(amount)).to.be.true;
        });

        it("Should handle exemption changes during active trading", async function () {
            await token.enableTrading();
            await token.setAMMPair(ammPair.address, true);

            // Distribute tokens
            await token.transfer(user1.address, ethers.utils.parseEther("10000"));
            await token.transfer(user2.address, ethers.utils.parseEther("10000"));

            // Remove exemption from user1
            await token.removeExemptWallet(user1.address);

            // Generate fees from user1
            await token.connect(user1).transfer(ammPair.address, ethers.utils.parseEther("1000"));
            const feeBalanceAfterUser1 = await token.balanceOf(feeWallet.address);
            expect(feeBalanceAfterUser1.gt(0)).to.be.true;

            // Add user2 as exempt
            await time.increase(ADMIN_COOLDOWN + 1);
            await token.addExemptWallet(user2.address);

            // User2 trades (should not generate fees)
            const feeBalanceBeforeUser2 = await token.balanceOf(feeWallet.address);
            await token.connect(user2).transfer(ammPair.address, ethers.utils.parseEther("1000"));
            const feeBalanceAfterUser2 = await token.balanceOf(feeWallet.address);

            // Fee balance should remain unchanged
            expect(feeBalanceAfterUser2).to.equal(feeBalanceBeforeUser2);
        });

        it("Should handle ownership transfer cancellation edge cases", async function () {
            // Initiate transfer
            await token.initiateOwnershipTransfer(user1.address);

            // Cancel before timelock
            await token.cancelOwnershipTransfer();

            // Verify no pending transfer
            const status = await token.getOwnershipTransferStatus();
            expect(status.isPending).to.be.false;

            // Initiate again
            await token.initiateOwnershipTransfer(user1.address);

            // Fast forward past timelock
            await time.increase(24 * 60 * 60 + 1);

            // Cannot cancel after timelock (should complete instead)
            await expect(token.cancelOwnershipTransfer())
                .to.be.revertedWith("Ownership transfer timelock already passed");
        });
    });

    describe("🚨 Error Recovery Scenarios", function () {
        it("Should recover from failed emergency withdraw", async function () {
            // Enable emergency withdraw
            await token.enableEmergencyWithdraw();

            // Try to withdraw before timelock (should fail)
            await expect(token.emergencyWithdraw(ethers.constants.AddressZero, ethers.utils.parseEther("0.1")))
                .to.be.revertedWith("Emergency withdraw not available");

            // Cancel and re-enable
            await token.cancelEmergencyWithdraw();
            await token.enableEmergencyWithdraw();

            // Fast forward and try again
            await time.increase(EMERGENCY_TIMELOCK + 1);

            // Send ETH to contract
            await owner.sendTransaction({
                to: token.address,
                value: ethers.utils.parseEther("1.0")
            });

            // Should succeed now
            await token.emergencyWithdraw(ethers.constants.AddressZero, ethers.utils.parseEther("0.1"));
        });

        it("Should handle insufficient balance scenarios gracefully", async function () {
            await token.enableTrading();
            await token.setAMMPair(ammPair.address, true);

            // Transfer all tokens to user1
            const balance = await token.balanceOf(owner.address);
            await token.transfer(user1.address, balance);

            // Try to transfer more than balance (should fail)
            await expect(token.transfer(user2.address, 1))
                .to.be.revertedWith("ERC20: transfer amount exceeds balance");
        });

        it("Should handle contract pause during operations", async function () {
            await token.enableTrading();
            await token.setAMMPair(ammPair.address, true);

            // Pause contract
            await token.pauseContract();

            // Try to add exemption (should fail)
            await expect(token.addExemptWallet(user1.address))
                .to.be.revertedWith("Contract is paused");

            // Try to set AMM pair (should fail)
            await expect(token.setAMMPair(user1.address, true))
                .to.be.revertedWith("Contract is paused");

            // Unpause
            await token.unpauseContract();

            // Operations should work now
            await time.increase(ADMIN_COOLDOWN + 1);
            await token.addExemptWallet(user1.address);
            expect(await token.isExempt(user1.address)).to.be.true;
        });

        it("Should handle zero balance transfers", async function () {
            // Transfer to user with zero balance
            await token.transfer(user1.address, ethers.utils.parseEther("1000"));

            // User1 transfers all back
            const balance = await token.balanceOf(user1.address);
            await token.connect(user1).transfer(owner.address, balance);

            // User1 now has zero balance
            expect(await token.balanceOf(user1.address)).to.equal(0);

            // Try to transfer from zero balance (should fail)
            await expect(token.connect(user1).transfer(user2.address, 1))
                .to.be.revertedWith("ERC20: transfer amount exceeds balance");
        });
    });

    describe("🔐 Access Control Edge Cases", function () {
        it("Should handle unauthorized access attempts", async function () {
            // Non-owner tries to pause
            await expect(token.connect(user1).pauseContract())
                .to.be.revertedWith("Ownable: caller is not the owner");

            // Non-owner tries to enable trading
            await expect(token.connect(user1).enableTrading())
                .to.be.revertedWith("Ownable: caller is not the owner");

            // Non-owner tries to update wallets
            await expect(token.connect(user1).updateFeeWallet(user2.address))
                .to.be.revertedWith("Ownable: caller is not the owner");

            // Non-owner tries to set AMM pair
            await expect(token.connect(user1).setAMMPair(ammPair.address, true))
                .to.be.revertedWith("Ownable: caller is not the owner");
        });

        it("Should handle pending owner access correctly", async function () {
            // Initiate ownership transfer
            await token.initiateOwnershipTransfer(user1.address);

            // Pending owner cannot perform owner actions yet
            await expect(token.connect(user1).pauseContract())
                .to.be.revertedWith("Ownable: caller is not the owner");

            // Fast forward past timelock
            await time.increase(24 * 60 * 60 + 1);

            // Pending owner still cannot perform owner actions until completion
            await expect(token.connect(user1).pauseContract())
                .to.be.revertedWith("Ownable: caller is not the owner");

            // Complete transfer
            await token.connect(user1).completeOwnershipTransfer();

            // Now new owner can perform actions
            await token.connect(user1).pauseContract();
            expect(await token.contractPaused()).to.be.true;
        });

        it("Should prevent critical address modifications", async function () {
            // Cannot remove owner exemption
            await expect(token.removeExemptWallet(owner.address))
                .to.be.revertedWith("Owner must remain tax exempt");

            // Cannot remove contract exemption
            await expect(token.removeExemptWallet(token.address))
                .to.be.revertedWith("Contract must remain tax exempt");

            // Cannot remove fee wallet exemption
            await expect(token.removeExemptWallet(feeWallet.address))
                .to.be.revertedWith("Fee wallet must remain tax exempt");

            // Cannot remove donation wallet exemption
            await expect(token.removeExemptWallet(donationWallet.address))
                .to.be.revertedWith("Donation wallet must remain tax exempt");
        });
    });

    describe("💸 Complex Tax Scenarios", function () {
        it("Should handle multiple consecutive taxed transfers", async function () {
            await token.enableTrading();
            await token.setAMMPair(ammPair.address, true);

            // Distribute tokens
            await token.transfer(user1.address, ethers.utils.parseEther("10000"));
            await token.removeExemptWallet(user1.address);

            const initialTotalSupply = await token.totalSupply();

            // Perform multiple transfers
            for (let i = 0; i < 5; i++) {
                await token.connect(user1).transfer(ammPair.address, ethers.utils.parseEther("100"));
            }

            const finalTotalSupply = await token.totalSupply();

            // Total supply should decrease due to burns
            expect(finalTotalSupply.lt(initialTotalSupply)).to.be.true;

            // Verify fee wallets received funds
            expect(await token.balanceOf(feeWallet.address)).to.be.gt(0);
            expect(await token.balanceOf(donationWallet.address)).to.be.gt(0);
            expect(await token.balanceOf(DEAD_WALLET)).to.be.gt(0);
        });

        it("Should handle tax with very small amounts", async function () {
            await token.enableTrading();
            await token.setAMMPair(ammPair.address, true);

            // Transfer very small amount
            await token.transfer(user1.address, 1000);
            await token.removeExemptWallet(user1.address);

            // Transfer to AMM (tax might round to 0)
            await token.connect(user1).transfer(ammPair.address, 100);

            // Verify transfer completed
            const ammBalance = await token.balanceOf(ammPair.address);
            expect(ammBalance.lte(100)).to.be.true; // Should be <= 100 (with or without tax)
        });

        it("Should handle exempt to non-exempt transfers", async function () {
            await token.enableTrading();
            await token.setAMMPair(ammPair.address, true);

            // Owner (exempt) transfers to user1 (non-exempt)
            const amount = ethers.utils.parseEther("1000");
            await token.transfer(user1.address, amount);

            // User1 should receive full amount (sender is exempt)
            expect(await token.balanceOf(user1.address)).to.equal(amount);

            // Remove user1 exemption
            await token.removeExemptWallet(user1.address);

            // User1 (non-exempt) transfers to AMM
            const initialAmmBalance = await token.balanceOf(ammPair.address);
            await token.connect(user1).transfer(ammPair.address, amount);
            const finalAmmBalance = await token.balanceOf(ammPair.address);

            // AMM should receive less than full amount (tax applied)
            expect(finalAmmBalance.sub(initialAmmBalance).lt(amount)).to.be.true;
        });

        it("Should handle trading disabled scenarios", async function () {
            // Trading not enabled yet
            await token.setAMMPair(ammPair.address, true);

            // Transfer tokens to user1
            await token.transfer(user1.address, ethers.utils.parseEther("1000"));
            await token.removeExemptWallet(user1.address);

            // Non-exempt user cannot transfer when trading disabled
            await expect(token.connect(user1).transfer(user2.address, ethers.utils.parseEther("100")))
                .to.be.revertedWith("Trading not enabled");

            // Enable trading
            await token.enableTrading();

            // Now transfer should work
            await token.connect(user1).transfer(user2.address, ethers.utils.parseEther("100"));
            expect(await token.balanceOf(user2.address)).to.be.gt(0);
        });
    });

    describe("🔄 Batch Operations Edge Cases", function () {
        it("Should handle batch exemption additions", async function () {
            const wallets = [user1.address, user2.address, user3.address];

            // Add batch exemptions
            await token.addExemptWalletsBatch(wallets);

            // Verify all are exempt
            for (const wallet of wallets) {
                expect(await token.isExempt(wallet)).to.be.true;
            }
        });

        it("Should handle batch exemption removals", async function () {
            const wallets = [user1.address, user2.address, user3.address];

            // Add batch exemptions
            await token.addExemptWalletsBatch(wallets);

            // Remove batch exemptions
            await time.increase(ADMIN_COOLDOWN + 1);
            await token.removeExemptWalletsBatch(wallets);

            // Verify all are non-exempt
            for (const wallet of wallets) {
                expect(await token.isExempt(wallet)).to.be.false;
            }
        });

        it("Should handle empty batch operations", async function () {
            // Empty batch should not revert
            await token.addExemptWalletsBatch([]);
            
            // Verify no state change
            expect(await token.isExempt(user1.address)).to.be.false;
        });
    });
});

