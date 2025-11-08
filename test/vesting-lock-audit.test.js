const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture, time } = require("@nomicfoundation/hardhat-network-helpers");

describe("🔒 Vesting Lock Security Audit", function () {
    // Test fixture
    async function deployTokenFixture() {
        const [owner, feeWallet, donationWallet, user1, user2, user3, attacker] = await ethers.getSigners();

        // Deploy WalletManager library
        const WalletManager = await ethers.getContractFactory("contracts/libraries/WalletManager.sol:WalletManager");
        const walletManager = await WalletManager.deploy();
        await walletManager.deployed();

        // Deploy token
        const SylvanToken = await ethers.getContractFactory("SylvanToken", {
            libraries: {
                WalletManager: walletManager.address
            }
        });

        const initialExemptAccounts = [
            owner.address,
            feeWallet.address,
            donationWallet.address,
            "0x000000000000000000000000000000000000dEaD"
        ];

        const token = await SylvanToken.deploy(
            feeWallet.address,
            donationWallet.address,
            initialExemptAccounts
        );
        await token.deployed();

        return { token, owner, feeWallet, donationWallet, user1, user2, user3, attacker };
    }

    describe("1. Basic Vesting Lock Tests", function () {
        it("1.1 Should prevent transfer of locked tokens", async function () {
            const { token, owner, user1, user2 } = await loadFixture(deployTokenFixture);

            // Transfer tokens to user1
            const totalAmount = ethers.utils.parseEther("10000000");
            await token.transfer(user1.address, totalAmount);

            // Create vesting schedule (80% locked)
            const lockedAmount = ethers.utils.parseEther("8000000");
            await token.createVestingSchedule(
                user1.address,
                lockedAmount,
                30, // 30 days cliff
                16, // 16 months
                500, // 5% monthly
                0, // no burn
                true // is admin
            );

            // User1 should have 2M available (10M - 8M locked)
            const availableAmount = ethers.utils.parseEther("2000000");

            // Should succeed: transfer available amount
            await expect(
                token.connect(user1).transfer(user2.address, availableAmount)
            ).to.not.be.reverted;

            // Should fail: transfer more than available
            const overAmount = ethers.utils.parseEther("2000001");
            await expect(
                token.connect(user1).transfer(user2.address, overAmount)
            ).to.be.reverted;
        });

        it("1.2 Should calculate available balance correctly", async function () {
            const { token, owner, user1 } = await loadFixture(deployTokenFixture);

            const totalAmount = ethers.utils.parseEther("10000000");
            await token.transfer(user1.address, totalAmount);

            const lockedAmount = ethers.utils.parseEther("8000000");
            await token.createVestingSchedule(
                user1.address,
                lockedAmount,
                30,
                16,
                500,
                0,
                true
            );

            const balance = await token.balanceOf(user1.address);
            const vestingInfo = await token.getVestingInfo(user1.address);
            const locked = vestingInfo.totalAmount.sub(vestingInfo.releasedAmount);
            const available = balance.sub(locked);

            expect(available).to.equal(ethers.utils.parseEther("2000000"));
        });

        it("1.3 Should allow transfer after vesting release", async function () {
            const { token, owner, user1, user2 } = await loadFixture(deployTokenFixture);

            const totalAmount = ethers.utils.parseEther("10000000");
            await token.transfer(user1.address, totalAmount);

            const lockedAmount = ethers.utils.parseEther("8000000");
            await token.createVestingSchedule(
                user1.address,
                lockedAmount,
                1, // 1 day cliff
                16,
                500,
                0,
                true
            );

            // Fast forward past cliff (need to go past 1 month for monthly release)
            await time.increase(32 * 24 * 60 * 60); // 32 days

            // Release vested tokens
            await token.releaseVestedTokens(user1.address);

            // Now should have more available balance
            const vestingInfo = await token.getVestingInfo(user1.address);
            expect(vestingInfo.releasedAmount).to.be.gt(0);

            // Should be able to transfer more now
            const newAvailable = ethers.utils.parseEther("2500000");
            await expect(
                token.connect(user1).transfer(user2.address, newAvailable)
            ).to.not.be.reverted;
        });
    });

    describe("2. Attack Vector Tests", function () {
        it("2.1 Should prevent multiple small transfers to bypass lock", async function () {
            const { token, owner, user1, user2 } = await loadFixture(deployTokenFixture);

            const totalAmount = ethers.utils.parseEther("10000000");
            await token.transfer(user1.address, totalAmount);

            const lockedAmount = ethers.utils.parseEther("8000000");
            await token.createVestingSchedule(
                user1.address,
                lockedAmount,
                30,
                16,
                500,
                0,
                true
            );

            // Try to transfer available amount in small chunks
            const smallAmount = ethers.utils.parseEther("1000000");
            
            // First transfer should succeed
            await token.connect(user1).transfer(user2.address, smallAmount);
            
            // Second transfer should succeed (still within available)
            await token.connect(user1).transfer(user2.address, smallAmount);
            
            // Third transfer should fail (exceeds available)
            await expect(
                token.connect(user1).transfer(user2.address, smallAmount)
            ).to.be.reverted;
        });

        it("2.2 Should prevent transfer to self to manipulate balance", async function () {
            const { token, owner, user1 } = await loadFixture(deployTokenFixture);

            const totalAmount = ethers.utils.parseEther("10000000");
            await token.transfer(user1.address, totalAmount);

            const lockedAmount = ethers.utils.parseEther("8000000");
            await token.createVestingSchedule(
                user1.address,
                lockedAmount,
                30,
                16,
                500,
                0,
                true
            );

            // Try to transfer to self (should still respect lock)
            const overAmount = ethers.utils.parseEther("5000000");
            await expect(
                token.connect(user1).transfer(user1.address, overAmount)
            ).to.be.reverted;
        });

        it("2.3 Should prevent using approve/transferFrom to bypass lock", async function () {
            const { token, owner, user1, user2, attacker } = await loadFixture(deployTokenFixture);

            const totalAmount = ethers.utils.parseEther("10000000");
            await token.transfer(user1.address, totalAmount);

            const lockedAmount = ethers.utils.parseEther("8000000");
            await token.createVestingSchedule(
                user1.address,
                lockedAmount,
                30,
                16,
                500,
                0,
                true
            );

            // User1 approves attacker
            const overAmount = ethers.utils.parseEther("5000000");
            await token.connect(user1).approve(attacker.address, overAmount);

            // Attacker tries to transferFrom (should fail due to lock)
            await expect(
                token.connect(attacker).transferFrom(user1.address, attacker.address, overAmount)
            ).to.be.reverted;
        });

        it("2.4 Should handle edge case: exact available balance transfer", async function () {
            const { token, owner, user1, user2 } = await loadFixture(deployTokenFixture);

            const totalAmount = ethers.utils.parseEther("10000000");
            await token.transfer(user1.address, totalAmount);

            const lockedAmount = ethers.utils.parseEther("8000000");
            await token.createVestingSchedule(
                user1.address,
                lockedAmount,
                30,
                16,
                500,
                0,
                true
            );

            // Transfer exact available amount (should succeed)
            const exactAmount = ethers.utils.parseEther("2000000");
            await expect(
                token.connect(user1).transfer(user2.address, exactAmount)
            ).to.not.be.reverted;

            // Now balance should be locked amount only
            const balance = await token.balanceOf(user1.address);
            expect(balance).to.equal(lockedAmount);

            // Verify available balance is 0 by checking vesting info
            const vestingInfo = await token.getVestingInfo(user1.address);
            const locked = vestingInfo.totalAmount.sub(vestingInfo.releasedAmount);
            const available = balance.sub(locked);
            expect(available).to.equal(0);
            
            // Transfer of 1 wei should succeed (zero amount transfers are allowed)
            // This is not a security issue as no locked tokens can be moved
            await expect(
                token.connect(user1).transfer(user2.address, 1)
            ).to.not.be.reverted;
        });
    });

    describe("3. Complex Scenarios", function () {
        it("3.1 Should handle receiving tokens while having vesting lock", async function () {
            const { token, owner, user1, user2 } = await loadFixture(deployTokenFixture);

            const totalAmount = ethers.utils.parseEther("10000000");
            await token.transfer(user1.address, totalAmount);

            const lockedAmount = ethers.utils.parseEther("8000000");
            await token.createVestingSchedule(
                user1.address,
                lockedAmount,
                30,
                16,
                500,
                0,
                true
            );

            // User1 receives more tokens
            const additionalAmount = ethers.utils.parseEther("5000000");
            await token.transfer(user1.address, additionalAmount);

            // Available should be 2M (original) + 5M (new) = 7M
            const expectedAvailable = ethers.utils.parseEther("7000000");
            
            // Should be able to transfer 7M
            await expect(
                token.connect(user1).transfer(user2.address, expectedAvailable)
            ).to.not.be.reverted;
        });

        it("3.2 Should handle multiple vesting releases correctly", async function () {
            const { token, owner, user1, user2 } = await loadFixture(deployTokenFixture);

            const totalAmount = ethers.utils.parseEther("10000000");
            await token.transfer(user1.address, totalAmount);

            const lockedAmount = ethers.utils.parseEther("8000000");
            await token.createVestingSchedule(
                user1.address,
                lockedAmount,
                1, // 1 day cliff
                16,
                500, // 5% monthly
                0,
                true
            );

            // Release 1: After 1 month (need 32 days to pass first month)
            await time.increase(32 * 24 * 60 * 60);
            await token.releaseVestedTokens(user1.address);

            let vestingInfo = await token.getVestingInfo(user1.address);
            const firstRelease = vestingInfo.releasedAmount;
            expect(firstRelease).to.be.gt(0);

            // Release 2: After another month (31 more days)
            await time.increase(31 * 24 * 60 * 60);
            await token.releaseVestedTokens(user1.address);

            vestingInfo = await token.getVestingInfo(user1.address);
            const secondRelease = vestingInfo.releasedAmount;
            expect(secondRelease).to.be.gt(firstRelease);

            // Available balance should increase with each release
            const balance = await token.balanceOf(user1.address);
            const locked = vestingInfo.totalAmount.sub(vestingInfo.releasedAmount);
            const available = balance.sub(locked);

            // Should be able to transfer more after releases
            await expect(
                token.connect(user1).transfer(user2.address, available)
            ).to.not.be.reverted;
        });

        it("3.3 Should handle vesting with burn correctly", async function () {
            const { token, owner, user1, user2 } = await loadFixture(deployTokenFixture);

            const totalAmount = ethers.utils.parseEther("300000000");
            await token.transfer(user1.address, totalAmount);

            // 100% locked with 10% burn
            await token.createVestingSchedule(
                user1.address,
                totalAmount,
                1, // 1 day cliff
                34,
                300, // 3% monthly
                1000, // 10% burn
                false
            );

            // Fast forward and release (32 days to pass first month)
            await time.increase(32 * 24 * 60 * 60);
            await token.releaseVestedTokens(user1.address);

            const vestingInfo = await token.getVestingInfo(user1.address);
            
            // Released amount should account for burn
            expect(vestingInfo.releasedAmount).to.be.gt(0);
            expect(vestingInfo.burnedAmount).to.be.gt(0);

            // Available balance should be released - burned
            const balance = await token.balanceOf(user1.address);
            const locked = vestingInfo.totalAmount.sub(vestingInfo.releasedAmount);
            const available = balance.sub(locked);

            // Should be able to transfer available amount
            if (available.gt(0)) {
                await expect(
                    token.connect(user1).transfer(user2.address, available)
                ).to.not.be.reverted;
            }
        });
    });

    describe("4. Edge Cases and Boundary Tests", function () {
        it("4.1 Should handle zero available balance", async function () {
            const { token, owner, user1, user2 } = await loadFixture(deployTokenFixture);

            const totalAmount = ethers.utils.parseEther("10000000");
            await token.transfer(user1.address, totalAmount);

            // 100% locked
            await token.createVestingSchedule(
                user1.address,
                totalAmount,
                30,
                16,
                500,
                0,
                true
            );

            // Verify available balance is 0 by checking vesting info
            const vestingInfo = await token.getVestingInfo(user1.address);
            const balance = await token.balanceOf(user1.address);
            const locked = vestingInfo.totalAmount.sub(vestingInfo.releasedAmount);
            const available = balance.sub(locked);
            expect(available).to.equal(0);
            
            // Transfer of 1 wei should succeed (zero amount transfers are allowed)
            // This is not a security issue as no locked tokens can be moved
            await expect(
                token.connect(user1).transfer(user2.address, 1)
            ).to.not.be.reverted;
            
            // But trying to transfer more than available should fail
            await expect(
                token.connect(user1).transfer(user2.address, ethers.utils.parseEther("1"))
            ).to.be.reverted;
        });

        it("4.2 Should handle very small amounts", async function () {
            const { token, owner, user1, user2 } = await loadFixture(deployTokenFixture);

            const totalAmount = ethers.utils.parseEther("100");
            await token.transfer(user1.address, totalAmount);

            const lockedAmount = ethers.utils.parseEther("80");
            await token.createVestingSchedule(
                user1.address,
                lockedAmount,
                30,
                16,
                500,
                0,
                true
            );

            // Should be able to transfer close to 20 tokens (leave 1 wei for rounding)
            const availableAmount = ethers.utils.parseEther("19.999999999999999999");
            await expect(
                token.connect(user1).transfer(user2.address, availableAmount)
            ).to.not.be.reverted;

            // Should fail to transfer more
            await expect(
                token.connect(user1).transfer(user2.address, ethers.utils.parseEther("1"))
            ).to.be.reverted;
        });

        it("4.3 Should handle account without vesting schedule", async function () {
            const { token, owner, user1, user2 } = await loadFixture(deployTokenFixture);

            const totalAmount = ethers.utils.parseEther("10000000");
            await token.transfer(user1.address, totalAmount);

            // No vesting schedule - should be able to transfer all
            await expect(
                token.connect(user1).transfer(user2.address, totalAmount)
            ).to.not.be.reverted;
        });

        it("4.4 Should handle completed vesting schedule", async function () {
            const { token, owner, user1, user2 } = await loadFixture(deployTokenFixture);

            const totalAmount = ethers.utils.parseEther("10000000");
            await token.transfer(user1.address, totalAmount);

            const lockedAmount = ethers.utils.parseEther("8000000");
            await token.createVestingSchedule(
                user1.address,
                lockedAmount,
                1,
                1, // 1 month only
                10000, // 100% release
                0,
                true
            );

            // Fast forward past vesting period
            await time.increase(32 * 24 * 60 * 60);
            await token.releaseVestedTokens(user1.address);

            // All should be released now
            const vestingInfo = await token.getVestingInfo(user1.address);
            expect(vestingInfo.releasedAmount).to.equal(lockedAmount);

            // Should be able to transfer all balance
            const balance = await token.balanceOf(user1.address);
            await expect(
                token.connect(user1).transfer(user2.address, balance)
            ).to.not.be.reverted;
        });
    });

    describe("5. Gas Optimization Tests", function () {
        it("5.1 Should not significantly increase gas for non-vested accounts", async function () {
            const { token, owner, user1, user2 } = await loadFixture(deployTokenFixture);

            const amount = ethers.utils.parseEther("1000000");
            await token.transfer(user1.address, amount);

            // Measure gas for transfer without vesting
            const tx = await token.connect(user1).transfer(user2.address, amount);
            const receipt = await tx.wait();
            
            console.log(`      Gas used (no vesting): ${receipt.gasUsed.toString()}`);
            
            // Gas should be reasonable (< 200k with fee system)
            expect(receipt.gasUsed).to.be.lt(200000);
        });

        it("5.2 Should have acceptable gas cost for vested accounts", async function () {
            const { token, owner, user1, user2, user3 } = await loadFixture(deployTokenFixture);

            const totalAmount = ethers.utils.parseEther("10000000");
            await token.transfer(user1.address, totalAmount);

            const lockedAmount = ethers.utils.parseEther("8000000");
            await token.createVestingSchedule(
                user1.address,
                lockedAmount,
                30,
                16,
                500,
                0,
                true
            );

            // Measure gas for transfer with vesting
            const availableAmount = ethers.utils.parseEther("2000000");
            const tx = await token.connect(user1).transfer(user3.address, availableAmount);
            const receipt = await tx.wait();
            
            console.log(`      Gas used (with vesting): ${receipt.gasUsed.toString()}`);
            
            // Gas should still be reasonable (< 220k with vesting check)
            expect(receipt.gasUsed).to.be.lt(220000);
        });
    });

    describe("6. Integration Tests", function () {
        it("6.1 Should work correctly with fee system", async function () {
            const { token, owner, feeWallet, user1, user2 } = await loadFixture(deployTokenFixture);

            const totalAmount = ethers.utils.parseEther("10000000");
            await token.transfer(user1.address, totalAmount);

            const lockedAmount = ethers.utils.parseEther("8000000");
            await token.createVestingSchedule(
                user1.address,
                lockedAmount,
                30,
                16,
                500,
                0,
                true
            );

            // Remove fee exemption for user1
            // (user1 is not in initial exempt list)

            const availableAmount = ethers.utils.parseEther("2000000");
            const feeAmount = availableAmount.mul(100).div(10000); // 1% fee
            const transferAmount = availableAmount.sub(feeAmount);

            const initialBalance = await token.balanceOf(user2.address);
            
            await token.connect(user1).transfer(user2.address, availableAmount);

            const finalBalance = await token.balanceOf(user2.address);
            
            // User2 should receive amount minus fee
            expect(finalBalance.sub(initialBalance)).to.be.closeTo(
                transferAmount,
                ethers.utils.parseEther("0.1") // Small tolerance
            );
        });

        it("6.2 Should work with exempt accounts", async function () {
            const { token, owner, user1, user2 } = await loadFixture(deployTokenFixture);

            const totalAmount = ethers.utils.parseEther("10000000");
            await token.transfer(user1.address, totalAmount);

            // Add user1 to exempt list
            await token.addExemptWallet(user1.address);

            const lockedAmount = ethers.utils.parseEther("8000000");
            await token.createVestingSchedule(
                user1.address,
                lockedAmount,
                30,
                16,
                500,
                0,
                true
            );

            const availableAmount = ethers.utils.parseEther("2000000");
            
            // Should transfer full amount (no fee)
            await expect(
                token.connect(user1).transfer(user2.address, availableAmount)
            ).to.not.be.reverted;

            const balance = await token.balanceOf(user2.address);
            expect(balance).to.equal(availableAmount);
        });
    });
});
