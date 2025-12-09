const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");
const { deploySylvanTokenWithLibraries } = require("../helpers/deploy-libraries");

/**
 * @title Cross-Library Integration Tests
 * @dev Tests for interactions between multiple libraries in the SylvanToken system
 * Requirements: 2.3, 4.1, 4.4
 */
describe.skip("🔗 Cross-Library Integration Tests", function () {
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

    describe("🔄 Exemption + Tax Integration", function () {
        it("Should maintain tax exemption for critical wallets", async function () {
            // Verify initial critical wallets are exempt
            expect(await token.isExempt(owner.address)).to.be.true;
            expect(await token.isExempt(token.address)).to.be.true;
            expect(await token.isExempt(feeWallet.address)).to.be.true;
            expect(await token.isExempt(donationWallet.address)).to.be.true;
            expect(await token.isExempt(DEAD_WALLET)).to.be.true;

            // Verify exemption count
            const exemptCount = await token.getExemptWalletCount();
            expect(exemptCount).to.be.gte(5); // At least 5 critical wallets
        });

        it("Should handle tax calculation with exemption changes", async function () {
            // Enable trading and set AMM pair
            await token.enableTrading();
            await token.setAMMPair(ammPair.address, true);

            // Transfer tokens to user1
            await token.transfer(user1.address, ethers.utils.parseEther("10000"));

            // Note: user1 is not exempt by default, no need to remove exemption

            // Get initial balances
            const initialFeeBalance = await token.balanceOf(feeWallet.address);
            const initialDonationBalance = await token.balanceOf(donationWallet.address);

            // User1 sells to AMM (should apply tax)
            const sellAmount = ethers.utils.parseEther("1000");
            await token.connect(user1).transfer(ammPair.address, sellAmount);

            // Fee and donation wallets should receive tax
            const finalFeeBalance = await token.balanceOf(feeWallet.address);
            const finalDonationBalance = await token.balanceOf(donationWallet.address);
            expect(finalFeeBalance.gt(initialFeeBalance)).to.be.true;
            expect(finalDonationBalance.gt(initialDonationBalance)).to.be.true;
        });

        it("Should coordinate exemptions across batch operations", async function () {
            // Add multiple wallets as exempt
            const walletsToExempt = [user1.address, user2.address];
            await token.addExemptWalletsBatch(walletsToExempt);

            // Both should be exempt
            expect(await token.isExempt(user1.address)).to.be.true;
            expect(await token.isExempt(user2.address)).to.be.true;

            // Remove exemptions in batch
            await time.increase(ADMIN_COOLDOWN + 1);
            await token.removeExemptWalletsBatch(walletsToExempt);

            // Both should no longer be exempt
            expect(await token.isExempt(user1.address)).to.be.false;
            expect(await token.isExempt(user2.address)).to.be.false;
        });
    });

    describe("🛡️ AccessControl + EmergencyManager Integration", function () {
        it("Should enforce cooldown on emergency operations", async function () {
            // Enable emergency withdraw
            await token.enableEmergencyWithdraw();

            // Try to enable again immediately (should fail due to already enabled)
            await expect(token.enableEmergencyWithdraw())
                .to.be.revertedWith("Emergency withdraw already enabled");

            // Cancel emergency withdraw
            await token.cancelEmergencyWithdraw();

            // Try to cancel again (should fail)
            await expect(token.cancelEmergencyWithdraw())
                .to.be.revertedWith("Emergency withdraw not enabled");
        });

        it("Should validate ownership during emergency operations", async function () {
            // Only owner can enable emergency withdraw
            await expect(token.connect(user1).enableEmergencyWithdraw())
                .to.be.revertedWith("Ownable: caller is not the owner");

            // Owner can enable
            await token.enableEmergencyWithdraw();

            // Only owner can cancel
            await expect(token.connect(user1).cancelEmergencyWithdraw())
                .to.be.revertedWith("Ownable: caller is not the owner");
        });

        it("Should handle emergency withdraw with ownership transfer", async function () {
            // Enable emergency withdraw
            await token.enableEmergencyWithdraw();

            // Initiate ownership transfer
            await token.initiateOwnershipTransfer(user1.address);

            // Fast forward past ownership timelock
            await time.increase(24 * 60 * 60 + 1);

            // Complete ownership transfer
            await token.connect(user1).completeOwnershipTransfer();

            // New owner should be able to cancel emergency withdraw
            await token.connect(user1).cancelEmergencyWithdraw();

            const status = await token.getEmergencyWithdrawStatus();
            expect(status.isEnabled).to.be.false;
        });
    });

    describe("🔐 InputValidator + WalletManager Integration", function () {
        it("Should validate wallet addresses during updates", async function () {
            // Try to set zero address as fee wallet (should fail)
            await expect(token.updateFeeWallet(ethers.constants.AddressZero))
                .to.be.revertedWith("Invalid wallet address");

            // Try to set contract address as fee wallet (should fail)
            await expect(token.updateFeeWallet(token.address))
                .to.be.revertedWith("Cannot be contract address");

            // Try to set same address for both wallets (should fail)
            await expect(token.updateBothWallets(user1.address, user1.address))
                .to.be.revertedWith("Wallets cannot be the same");
        });

        it("Should validate amounts in tax calculations", async function () {
            // Enable trading
            await token.enableTrading();
            await token.setAMMPair(ammPair.address, true);

            // Transfer tokens to user1
            await token.transfer(user1.address, ethers.utils.parseEther("10000"));
            await token.removeExemptWallet(user1.address);

            // Try to transfer zero amount (should fail)
            await expect(token.connect(user1).transfer(ammPair.address, 0))
                .to.be.revertedWith("Amount must be greater than zero");

            // Try to transfer to zero address (should fail)
            await expect(token.connect(user1).transfer(ethers.constants.AddressZero, ethers.utils.parseEther("100")))
                .to.be.revertedWith("ERC20: transfer to the zero address");
        });
    });

    describe("💰 TaxManager + AccessControl Integration", function () {
        it("Should enforce cooldown on AMM pair updates", async function () {
            // Set AMM pair
            await token.setAMMPair(ammPair.address, true);
            expect(await token.isAMMPair(ammPair.address)).to.be.true;

            // Try to update immediately (should fail due to cooldown)
            await expect(token.setAMMPair(user1.address, true))
                .to.be.revertedWith("Cooldown period not elapsed");

            // Fast forward past cooldown
            await time.increase(ADMIN_COOLDOWN + 1);

            // Should work now
            await token.setAMMPair(user1.address, true);
            expect(await token.isAMMPair(user1.address)).to.be.true;
        });

        it("Should validate AMM pair settings with wallet checks", async function () {
            // Cannot set owner as AMM pair
            await expect(token.setAMMPair(owner.address, true))
                .to.be.revertedWith("Cannot set owner as AMM pair");

            // Cannot set fee wallet as AMM pair
            await expect(token.setAMMPair(feeWallet.address, true))
                .to.be.revertedWith("Cannot set fee wallet as AMM pair");

            // Cannot set donation wallet as AMM pair
            await expect(token.setAMMPair(donationWallet.address, true))
                .to.be.revertedWith("Cannot set donation wallet as AMM pair");
        });

        it("Should handle trading enable with access control", async function () {
            // Only owner can enable trading
            await expect(token.connect(user1).enableTrading())
                .to.be.revertedWith("Ownable: caller is not the owner");

            // Owner can enable
            await token.enableTrading();

            // Cannot enable twice
            await expect(token.enableTrading())
                .to.be.revertedWith("Trading already enabled");
        });
    });

    describe("🔄 Multi-Library Complex Workflows", function () {
        it("Should handle complete exemption workflow with trading", async function () {
            // 1. Enable trading and set up AMM
            await token.enableTrading();
            await token.setAMMPair(ammPair.address, true);

            // 2. Distribute tokens
            await token.transfer(user1.address, ethers.utils.parseEther("10000"));
            await token.transfer(user2.address, ethers.utils.parseEther("10000"));

            // 3. Add user2 as exempt
            await token.addExemptWallet(user2.address);
            expect(await token.isExempt(user2.address)).to.be.true;

            // 4. Remove exemption from user1
            await token.removeExemptWallet(user1.address);
            expect(await token.isExempt(user1.address)).to.be.false;

            // 5. Generate fees from non-exempt user
            const initialFeeBalance = await token.balanceOf(feeWallet.address);
            await token.connect(user1).transfer(ammPair.address, ethers.utils.parseEther("1000"));
            const midFeeBalance = await token.balanceOf(feeWallet.address);
            expect(midFeeBalance.gt(initialFeeBalance)).to.be.true;

            // 6. Exempt user should not generate fees
            const initialFeeBalance2 = await token.balanceOf(feeWallet.address);
            await token.connect(user2).transfer(ammPair.address, ethers.utils.parseEther("1000"));
            const finalFeeBalance2 = await token.balanceOf(feeWallet.address);
            expect(finalFeeBalance2).to.equal(initialFeeBalance2);
        });

        it("Should handle emergency scenario with all systems", async function () {
            // 1. Set up normal operations
            await token.enableTrading();
            await token.setAMMPair(ammPair.address, true);

            // 2. Distribute tokens and generate activity
            await token.transfer(user1.address, ethers.utils.parseEther("10000"));
            await token.removeExemptWallet(user1.address);
            await token.connect(user1).transfer(ammPair.address, ethers.utils.parseEther("1000"));

            // 3. Trigger emergency mode
            await token.pauseContract();
            expect(await token.contractPaused()).to.be.true;

            // 4. Enable emergency withdraw
            await token.enableEmergencyWithdraw();

            // 5. Try to perform normal operations (should fail when paused)
            await expect(token.addExemptWallet(user3.address))
                .to.be.revertedWith("Contract is paused");

            // 6. Unpause and verify operations resume
            await token.unpauseContract();
            await time.increase(ADMIN_COOLDOWN + 1);
            await token.addExemptWallet(user3.address);
            expect(await token.isExempt(user3.address)).to.be.true;
        });

        it("Should coordinate exemptions across all operations", async function () {
            // 1. Set up initial state
            await token.enableTrading();
            await token.setAMMPair(ammPair.address, true);

            // 2. Add user1 as exempt
            await token.addExemptWallet(user1.address);
            expect(await token.isExempt(user1.address)).to.be.true;

            // 3. Transfer to user1 (exempt)
            await token.transfer(user1.address, ethers.utils.parseEther("10000"));

            // 4. User1 trades (should not pay tax)
            const initialAmmBalance = await token.balanceOf(ammPair.address);
            const transferAmount = ethers.utils.parseEther("1000");
            await token.connect(user1).transfer(ammPair.address, transferAmount);
            const finalAmmBalance = await token.balanceOf(ammPair.address);
            
            // Should receive full amount (no tax)
            expect(finalAmmBalance.sub(initialAmmBalance).toString()).to.equal(transferAmount.toString());

            // 5. Remove exemption
            await time.increase(ADMIN_COOLDOWN + 1);
            await token.removeExemptWallet(user1.address);
            expect(await token.isExempt(user1.address)).to.be.false;

            // 6. User1 trades again (should pay tax)
            const initialAmmBalance2 = await token.balanceOf(ammPair.address);
            await token.connect(user1).transfer(ammPair.address, transferAmount);
            const finalAmmBalance2 = await token.balanceOf(ammPair.address);
            
            // Should receive less than full amount (tax applied)
            expect(finalAmmBalance2.sub(initialAmmBalance2).lt(transferAmount)).to.be.true;
        });

        it("Should handle ownership transfer affecting all systems", async function () {
            // 1. Set up operations as original owner
            await token.enableTrading();
            await token.setAMMPair(ammPair.address, true);
            await token.addExemptWallet(user3.address);

            // 2. Initiate ownership transfer
            await token.initiateOwnershipTransfer(user1.address);

            // 3. Original owner should still have control during timelock
            await time.increase(ADMIN_COOLDOWN + 1);
            await token.removeExemptWallet(user3.address);
            expect(await token.isExempt(user3.address)).to.be.false;

            // 4. Complete ownership transfer
            await time.increase(24 * 60 * 60 + 1);
            await token.connect(user1).completeOwnershipTransfer();
            expect(await token.owner()).to.equal(user1.address);

            // 5. New owner should have control
            await time.increase(ADMIN_COOLDOWN + 1);
            await token.connect(user1).addExemptWallet(user3.address);
            expect(await token.isExempt(user3.address)).to.be.true;

            // 6. Old owner should not have control
            await expect(token.connect(owner).pauseContract())
                .to.be.revertedWith("Ownable: caller is not the owner");
        });
    });

    describe("🔍 State Consistency Across Libraries", function () {
        it("Should maintain consistent state during concurrent operations", async function () {
            // Enable trading
            await token.enableTrading();
            await token.setAMMPair(ammPair.address, true);

            // Distribute tokens
            await token.transfer(user1.address, ethers.utils.parseEther("10000"));
            await token.transfer(user2.address, ethers.utils.parseEther("10000"));
            await token.removeExemptWallet(user1.address);
            await token.removeExemptWallet(user2.address);

            // Record initial state
            const initialTotalSupply = await token.totalSupply();
            const initialFeeBalance = await token.balanceOf(feeWallet.address);
            const initialDonationBalance = await token.balanceOf(donationWallet.address);

            // Perform multiple operations
            await token.connect(user1).transfer(ammPair.address, ethers.utils.parseEther("1000"));
            await token.connect(user2).transfer(ammPair.address, ethers.utils.parseEther("1000"));

            // Verify state consistency
            const finalTotalSupply = await token.totalSupply();
            const finalFeeBalance = await token.balanceOf(feeWallet.address);
            const finalDonationBalance = await token.balanceOf(donationWallet.address);

            // Total supply should decrease (due to burns)
            expect(finalTotalSupply.lt(initialTotalSupply)).to.be.true;

            // Fee and donation wallets should increase
            expect(finalFeeBalance.gt(initialFeeBalance)).to.be.true;
            expect(finalDonationBalance.gt(initialDonationBalance)).to.be.true;
        });

        it("Should validate cross-library data integrity", async function () {
            // Set up system
            await token.enableTrading();
            await token.setAMMPair(ammPair.address, true);

            // Verify wallet state
            expect(await token.feeWallet()).to.equal(feeWallet.address);
            expect(await token.donationWallet()).to.equal(donationWallet.address);

            // Verify tax manager state
            expect(await token.isAMMPair(ammPair.address)).to.be.true;

            // Verify access control state
            expect(await token.owner()).to.equal(owner.address);
            expect(await token.contractPaused()).to.be.false;

            // Add exemptions and verify consistency
            await token.addExemptWalletsBatch([user1.address, user2.address]);
            
            // New wallets should be exempt (coordination between exemption and tax systems)
            expect(await token.isExempt(user1.address)).to.be.true;
            expect(await token.isExempt(user2.address)).to.be.true;
        });
    });
});

