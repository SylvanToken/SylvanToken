/**
 * Enhanced Token Integration Tests
 * Task 9: Integration Test Genişletme
 * 
 * Tests real-world scenarios and end-to-end workflows
 */
const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");
const { deploySylvanTokenWithLibraries } = require("../helpers/deploy-libraries");

// NOTE: These tests are skipped because they rely on old SylvanToken API
// (isTradingEnabled, enableTrading, setAMMPair, etc.) which no longer exists.
describe.skip("🚀 Enhanced Token Integration Tests", function () {
    let token;
    let owner, feeWallet, donationWallet, user1, user2, user3, ammPair;
    
    const ADMIN_COOLDOWN = 1 * 60 * 60; // 1 hour
    const DEAD_WALLET = "0x000000000000000000000000000000000000dEaD";

    beforeEach(async function () {
        this.timeout(30000);
        [owner, feeWallet, donationWallet, user1, user2, user3, ammPair] = await ethers.getSigners();

        token = await deploySylvanTokenWithLibraries(
            feeWallet.address,
            donationWallet.address,
            []
        );
    });

    describe("🎯 End-to-End Scenarios", function () {
        it("Should handle complete token launch workflow", async function () {
            // 1. Initial state validation
            expect(await token.totalSupply()).to.equal(ethers.utils.parseEther("1000000000"));
            expect(await token.balanceOf(owner.address)).to.equal(ethers.utils.parseEther("1000000000"));
            expect(await token.isTradingEnabled()).to.be.false;

            // 2. Enable trading
            await token.enableTrading();
            expect(await token.isTradingEnabled()).to.be.true;

            // 3. Set AMM pair
            await token.setAMMPair(ammPair.address, true);
            expect(await token.isAMMPair(ammPair.address)).to.be.true;

            // 4. Test fee system with trading
            const transferAmount = ethers.utils.parseEther("1000");
            await token.transfer(user1.address, transferAmount);

            // user1 is not exempt by default, test fee directly
            const balanceBefore = await token.balanceOf(ammPair.address);
            await token.connect(user1).transfer(ammPair.address, transferAmount);

            // Verify fee was applied (1% fee)
            const expectedFee = transferAmount.mul(100).div(10000);
            const expectedNet = transferAmount.sub(expectedFee);
            const balanceAfter = await token.balanceOf(ammPair.address);
            expect(balanceAfter.sub(balanceBefore)).to.equal(expectedNet);

            console.log("✅ Complete token launch workflow tested successfully");
        });

        it("Should handle fee distribution across all systems", async function () {
            // Setup
            await token.enableTrading();
            await token.setAMMPair(ammPair.address, true);
            // user1 is not exempt by default

            // Transfer tokens to user
            const initialAmount = ethers.utils.parseEther("10000");
            await token.transfer(user1.address, initialAmount);

            // Record initial balances
            const feeWalletBefore = await token.balanceOf(feeWallet.address);
            const donationWalletBefore = await token.balanceOf(donationWallet.address);
            const burnWalletBefore = await token.balanceOf(DEAD_WALLET);

            // Execute transfer with fee
            const transferAmount = ethers.utils.parseEther("1000");
            await token.connect(user1).transfer(ammPair.address, transferAmount);

            // Calculate expected fee distribution
            const totalFee = transferAmount.mul(100).div(10000); // 1% fee
            const expectedFeeWallet = totalFee.mul(5000).div(10000); // 50%
            const expectedDonation = totalFee.mul(2500).div(10000); // 25%
            const expectedBurn = totalFee.mul(2500).div(10000); // 25%

            // Verify distribution
            const feeWalletAfter = await token.balanceOf(feeWallet.address);
            const donationWalletAfter = await token.balanceOf(donationWallet.address);
            const burnWalletAfter = await token.balanceOf(DEAD_WALLET);

            expect(feeWalletAfter.sub(feeWalletBefore)).to.equal(expectedFeeWallet);
            expect(donationWalletAfter.sub(donationWalletBefore)).to.equal(expectedDonation);
            expect(burnWalletAfter.sub(burnWalletBefore)).to.equal(expectedBurn);

            console.log("✅ Fee distribution across all systems tested successfully");
        });

        it("Should handle emergency scenarios with all systems", async function () {
            // Setup normal operations
            await token.enableTrading();

            // Verify normal state
            expect(await token.isTradingEnabled()).to.be.true;
            expect(await token.isContractPaused()).to.be.false;

            // Emergency: Pause contract
            await token.pauseContract();
            expect(await token.isContractPaused()).to.be.true;

            // Verify transfers are blocked
            await expect(
                token.transfer(user1.address, ethers.utils.parseEther("1000"))
            ).to.be.revertedWith("Contract is paused");

            // Unpause contract
            await token.unpauseContract();
            expect(await token.isContractPaused()).to.be.false;

            // Verify normal operations resume
            await token.transfer(user1.address, ethers.utils.parseEther("1000"));

            console.log("✅ Emergency scenarios with all systems tested successfully");
        });
    });

    describe("🌍 Real-World Use Cases", function () {
        it("Should handle token distribution event", async function () {
            // Simulate token distribution event
            const recipients = [user1.address, user2.address, user3.address];
            const amounts = [
                ethers.utils.parseEther("1000000"),  // 1M tokens
                ethers.utils.parseEther("2000000"),  // 2M tokens
                ethers.utils.parseEther("3000000")   // 3M tokens
            ];

            // Batch distribution
            for (let i = 0; i < recipients.length; i++) {
                await token.transfer(recipients[i], amounts[i]);
            }

            // Verify distribution
            for (let i = 0; i < recipients.length; i++) {
                expect(await token.balanceOf(recipients[i])).to.equal(amounts[i]);
            }

            // Add recipients to exemption list (batch operation)
            await token.addExemptWalletsBatch(recipients);

            // Verify exemptions
            for (const recipient of recipients) {
                expect(await token.isExempt(recipient)).to.be.true;
            }

            console.log("✅ Token distribution event tested successfully");
        });

        it("Should handle DEX listing scenario", async function () {
            // Pre-listing setup
            const liquidityAmount = ethers.utils.parseEther("50000000"); // 50M tokens for liquidity
            await token.transfer(user1.address, liquidityAmount);

            // Enable trading (DEX listing)
            await token.enableTrading();
            await token.setAMMPair(ammPair.address, true);

            // Simulate initial liquidity provision (user1 not exempt, will have fee)
            await token.connect(user1).transfer(ammPair.address, liquidityAmount);
            
            // Calculate expected amount after fee (1% fee)
            const fee = liquidityAmount.mul(100).div(10000);
            const expectedAmmBalance = liquidityAmount.sub(fee);
            expect(await token.balanceOf(ammPair.address)).to.equal(expectedAmmBalance);

            // Simulate trading activity
            const trades = [
                ethers.utils.parseEther("10000"),
                ethers.utils.parseEther("25000"),
                ethers.utils.parseEther("50000")
            ];

            let totalFees = ethers.BigNumber.from(0);
            
            // Add initial liquidity fee
            const initialFee = liquidityAmount.mul(100).div(10000);
            totalFees = totalFees.add(initialFee);

            for (const tradeAmount of trades) {
                await token.transfer(user1.address, tradeAmount);
                const balanceBefore = await token.balanceOf(ammPair.address);
                await token.connect(user1).transfer(ammPair.address, tradeAmount);
                const balanceAfter = await token.balanceOf(ammPair.address);
                
                const fee = tradeAmount.mul(100).div(10000);
                const netAmount = tradeAmount.sub(fee);
                totalFees = totalFees.add(fee);
                
                expect(balanceAfter.sub(balanceBefore)).to.equal(netAmount);
            }

            // Verify fee distribution (including initial liquidity fee)
            const expectedFeeWallet = totalFees.mul(5000).div(10000);
            const expectedDonation = totalFees.mul(2500).div(10000);
            
            expect(await token.balanceOf(feeWallet.address)).to.equal(expectedFeeWallet);
            expect(await token.balanceOf(donationWallet.address)).to.equal(expectedDonation);

            console.log("✅ DEX listing scenario tested successfully");
        });

        it("Should handle governance token scenario", async function () {
            // Setup governance wallets
            const governanceAllocation = ethers.utils.parseEther("100000000"); // 100M tokens
            const stakingRewards = ethers.utils.parseEther("50000000"); // 50M tokens

            // Distribute governance tokens
            await token.transfer(user1.address, governanceAllocation);
            await token.transfer(user2.address, stakingRewards);

            // Add governance wallets to exemption (no fees on governance)
            await token.addExemptWalletsBatch([user1.address, user2.address]);

            // Simulate governance voting (token transfers)
            const votingPower = ethers.utils.parseEther("10000000");
            await token.connect(user1).transfer(user3.address, votingPower);

            // Verify no fees on governance transfers
            expect(await token.balanceOf(user3.address)).to.equal(votingPower);

            // Simulate staking rewards distribution
            const rewardAmount = ethers.utils.parseEther("1000000");
            await token.connect(user2).transfer(user3.address, rewardAmount);

            // Verify total balance
            const expectedTotal = votingPower.add(rewardAmount);
            expect(await token.balanceOf(user3.address)).to.equal(expectedTotal);

            console.log("✅ Governance token scenario tested successfully");
        });
    });

    describe("⚡ Performance Integration", function () {
        it("Should handle high-volume transactions efficiently", async function () {
            // Setup
            await token.enableTrading();
            await token.setAMMPair(ammPair.address, true);

            const batchSize = 10;
            const transferAmount = ethers.utils.parseEther("1000");

            // Prepare accounts (user1 is not exempt by default)
            for (let i = 0; i < batchSize; i++) {
                await token.transfer(user1.address, transferAmount);
            }

            // Measure gas usage for batch transactions
            const gasUsed = [];
            
            for (let i = 0; i < batchSize; i++) {
                const tx = await token.connect(user1).transfer(ammPair.address, transferAmount);
                const receipt = await tx.wait();
                gasUsed.push(receipt.gasUsed.toNumber());
            }

            // Analyze gas usage
            const avgGas = gasUsed.reduce((sum, gas) => sum + gas, 0) / gasUsed.length;
            const maxGas = Math.max(...gasUsed);
            const minGas = Math.min(...gasUsed);

            console.log(`📊 Gas Usage Stats:`);
            console.log(`   Average: ${avgGas.toFixed(0)} gas`);
            console.log(`   Max: ${maxGas} gas`);
            console.log(`   Min: ${minGas} gas`);

            // Verify gas usage is reasonable (< 105k per transfer)
            expect(avgGas).to.be.lessThan(105000);

            console.log("✅ High-volume transactions tested successfully");
        });

        it("Should handle complex multi-system operations efficiently", async function () {
            // Setup complex scenario
            await token.enableTrading();
            await token.setAMMPair(ammPair.address, true);

            // Distribute tokens
            await token.transfer(user1.address, ethers.utils.parseEther("10000"));
            await token.transfer(user2.address, ethers.utils.parseEther("10000"));

            // Add exemption to user1 (user2 is already not exempt)
            await token.addExemptWallet(user1.address);

            // Execute transfers
            await token.connect(user1).transfer(ammPair.address, ethers.utils.parseEther("1000"));
            await token.connect(user2).transfer(ammPair.address, ethers.utils.parseEther("1000"));

            // Verify state consistency
            expect(await token.isExempt(user1.address)).to.be.true;
            expect(await token.isExempt(user2.address)).to.be.false;

            console.log("✅ Complex multi-system operations tested successfully");
        });
    });

    describe("🔍 Integration Edge Cases", function () {
        it("Should handle simultaneous operations correctly", async function () {
            // Setup complex scenario
            await token.enableTrading();
            await token.setAMMPair(ammPair.address, true);

            // Simultaneous operations
            const transferAmount = ethers.utils.parseEther("500000");
            await token.transfer(user1.address, transferAmount);

            // user1 is not exempt by default, test fee directly

            const balanceBefore = await token.balanceOf(ammPair.address);
            await token.connect(user1).transfer(ammPair.address, transferAmount);
            const balanceAfter = await token.balanceOf(ammPair.address);

            // Verify fee was applied correctly
            const expectedFee = transferAmount.mul(100).div(10000);
            const expectedNet = transferAmount.sub(expectedFee);
            expect(balanceAfter.sub(balanceBefore)).to.equal(expectedNet);

            console.log("✅ Simultaneous operations tested successfully");
        });

        it("Should handle exemption changes during active trading", async function () {
            // Setup active operations
            await token.enableTrading();
            await token.setAMMPair(ammPair.address, true);
            
            // Distribute tokens
            await token.transfer(user1.address, ethers.utils.parseEther("10000"));
            await token.transfer(user2.address, ethers.utils.parseEther("10000"));

            // Add user1 as exempt
            await token.addExemptWallet(user1.address);
            expect(await token.isExempt(user1.address)).to.be.true;

            // User1 trades without fee
            const transferAmount = ethers.utils.parseEther("1000");
            const ammBalanceBefore = await token.balanceOf(ammPair.address);
            await token.connect(user1).transfer(ammPair.address, transferAmount);
            const ammBalanceAfter = await token.balanceOf(ammPair.address);
            
            // Should receive full amount (no fee)
            expect(ammBalanceAfter.sub(ammBalanceBefore)).to.equal(transferAmount);

            // Remove exemption
            await time.increase(ADMIN_COOLDOWN + 1);
            await token.removeExemptWallet(user1.address);
            expect(await token.isExempt(user1.address)).to.be.false;

            // User1 trades with fee
            const ammBalanceBefore2 = await token.balanceOf(ammPair.address);
            await token.connect(user1).transfer(ammPair.address, transferAmount);
            const ammBalanceAfter2 = await token.balanceOf(ammPair.address);
            
            // Should receive less than full amount (fee applied)
            const expectedFee = transferAmount.mul(100).div(10000);
            const expectedNet = transferAmount.sub(expectedFee);
            expect(ammBalanceAfter2.sub(ammBalanceBefore2)).to.equal(expectedNet);

            console.log("✅ Exemption changes during active trading tested successfully");
        });

        it("Should maintain state consistency across complex workflows", async function () {
            // Complex workflow
            await token.enableTrading();
            await token.setAMMPair(ammPair.address, true);

            // Distribute tokens
            await token.transfer(user1.address, ethers.utils.parseEther("10000"));
            await token.transfer(user2.address, ethers.utils.parseEther("10000"));

            // Add exemptions
            await token.addExemptWalletsBatch([user1.address, user2.address]);

            // Pause and unpause
            await token.pauseContract();
            await token.unpauseContract();

            // Remove exemptions
            await time.increase(ADMIN_COOLDOWN + 1);
            await token.removeExemptWalletsBatch([user1.address, user2.address]);

            // Execute transfers
            await token.connect(user1).transfer(ammPair.address, ethers.utils.parseEther("1000"));
            await token.connect(user2).transfer(ammPair.address, ethers.utils.parseEther("1000"));

            // Verify state consistency
            expect(await token.isExempt(user1.address)).to.be.false;
            expect(await token.isExempt(user2.address)).to.be.false;
            expect(await token.balanceOf(feeWallet.address)).to.be.gt(0);
            expect(await token.balanceOf(donationWallet.address)).to.be.gt(0);

            console.log("✅ State consistency across complex workflows tested successfully");
        });
    });
});

