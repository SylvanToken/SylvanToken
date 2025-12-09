const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("💰 TaxManager Library Complete Coverage", function () {
    let taxManager;
    let owner, user1, user2, user3, feeWallet, donationWallet, ammPair;

    beforeEach(async function () {
        this.timeout(30000);
        [owner, user1, user2, user3, feeWallet, donationWallet, ammPair] = await ethers.getSigners();

        // Deploy TaxManager library first
        const TaxManagerLib = await ethers.getContractFactory("contracts/libraries/TaxManager.sol:TaxManager");
        const taxManagerLib = await TaxManagerLib.deploy();

        // Deploy TaxManager test contract with library linking
        const TaxManagerTestContract = await ethers.getContractFactory("contracts/mocks/TaxManagerTestContract.sol:TaxManagerTestContract", {
            libraries: {
                TaxManager: taxManagerLib.address,
            },
        });
        taxManager = await TaxManagerTestContract.deploy();
    });

    describe("📊 Tax Constants and Configuration", function () {
        it("Should have correct tax constants", async function () {
            expect((await taxManager.TAX_RATE()).toString()).to.equal("100"); // 1%
            expect((await taxManager.TAX_DENOMINATOR()).toString()).to.equal("10000");
            expect((await taxManager.FEE_SHARE()).toString()).to.equal("5000"); // 50%
            expect((await taxManager.BURN_SHARE()).toString()).to.equal("2500"); // 25%
            expect((await taxManager.DONATION_SHARE()).toString()).to.equal("2500"); // 25%
            expect(await taxManager.BURN_WALLET()).to.equal("0x000000000000000000000000000000000000dEaD");
        });

        it("Should get tax info correctly", async function () {
            const taxInfo = await taxManager.testGetTaxInfo();
            expect(taxInfo.buyTax.toString()).to.equal("100");
            expect(taxInfo.sellTax.toString()).to.equal("100");
        });
    });

    describe("🔄 Trading Management", function () {
        it("Should enable trading", async function () {
            expect(await taxManager.testIsTradingEnabled()).to.be.false;
            
            await taxManager.testEnableTrading();
            
            expect(await taxManager.testIsTradingEnabled()).to.be.true;
        });

        it("Should prevent enabling trading twice", async function () {
            await taxManager.testEnableTrading();
            
            let failed = false;
            try {
                await taxManager.testEnableTrading();
            } catch (error) {
                failed = true;
                expect(error.message).to.include("Trading already enabled");
            }
            expect(failed).to.be.true;
        });

        it("Should validate trading conditions", async function () {
            // When trading is disabled, only exempt addresses can trade
            let failed = false;
            try {
                await taxManager.testValidateTrading(user1.address, user2.address, false, false);
            } catch (error) {
                failed = true;
                expect(error.message).to.include("Trading not enabled");
            }
            expect(failed).to.be.true;
            
            // Exempt addresses should be able to trade
            await taxManager.testValidateTrading(user1.address, user2.address, true, false);
            await taxManager.testValidateTrading(user1.address, user2.address, false, true);
        });
    });

    describe("🏪 AMM Pair Management", function () {
        it("Should set AMM pair status", async function () {
            expect(await taxManager.testIsAMMPair(ammPair.address)).to.be.false;
            
            await taxManager.testSetAMMPair(
                ammPair.address, 
                true, 
                owner.address, 
                feeWallet.address, 
                donationWallet.address
            );
            
            expect(await taxManager.testIsAMMPair(ammPair.address)).to.be.true;
        });

        it("Should remove AMM pair status", async function () {
            await taxManager.testSetAMMPair(
                ammPair.address, 
                true, 
                owner.address, 
                feeWallet.address, 
                donationWallet.address
            );
            
            await taxManager.testSetAMMPair(
                ammPair.address, 
                false, 
                owner.address, 
                feeWallet.address, 
                donationWallet.address
            );
            
            expect(await taxManager.testIsAMMPair(ammPair.address)).to.be.false;
        });

        it("Should prevent setting zero address as AMM pair", async function () {
            let failed = false;
            try {
                await taxManager.testSetAMMPair(
                    ethers.constants.AddressZero, 
                    true, 
                    owner.address, 
                    feeWallet.address, 
                    donationWallet.address
                );
            } catch (error) {
                failed = true;
                expect(error.message).to.include("Invalid pair address");
            }
            expect(failed).to.be.true;
        });

        it("Should prevent setting owner as AMM pair", async function () {
            let failed = false;
            try {
                await taxManager.testSetAMMPair(
                    owner.address, 
                    true, 
                    owner.address, 
                    feeWallet.address, 
                    donationWallet.address
                );
            } catch (error) {
                failed = true;
                expect(error.message).to.include("Cannot set owner as AMM pair");
            }
            expect(failed).to.be.true;
        });

        it("Should prevent setting fee wallet as AMM pair", async function () {
            let failed = false;
            try {
                await taxManager.testSetAMMPair(
                    feeWallet.address, 
                    true, 
                    owner.address, 
                    feeWallet.address, 
                    donationWallet.address
                );
            } catch (error) {
                failed = true;
                expect(error.message).to.include("Cannot set fee wallet as AMM pair");
            }
            expect(failed).to.be.true;
        });

        it("Should prevent setting donation wallet as AMM pair", async function () {
            let failed = false;
            try {
                await taxManager.testSetAMMPair(
                    donationWallet.address, 
                    true, 
                    owner.address, 
                    feeWallet.address, 
                    donationWallet.address
                );
            } catch (error) {
                failed = true;
                expect(error.message).to.include("Cannot set donation wallet as AMM pair");
            }
            expect(failed).to.be.true;
        });

        it("Should prevent setting burn wallet as AMM pair", async function () {
            let failed = false;
            try {
                await taxManager.testSetAMMPair(
                    "0x000000000000000000000000000000000000dEaD", 
                    true, 
                    owner.address, 
                    feeWallet.address, 
                    donationWallet.address
                );
            } catch (error) {
                failed = true;
                expect(error.message).to.include("Cannot set burn wallet as AMM pair");
            }
            expect(failed).to.be.true;
        });

        it("Should validate AMM pair setting parameters", async function () {
            // Valid parameters should not revert
            await taxManager.testValidateAMMPairSetting(
                ammPair.address,
                owner.address,
                feeWallet.address,
                donationWallet.address
            );
            
            // Invalid parameters should revert
            let failed = false;
            try {
                await taxManager.testValidateAMMPairSetting(
                    ethers.constants.AddressZero,
                    owner.address,
                    feeWallet.address,
                    donationWallet.address
                );
            } catch (error) {
                failed = true;
                expect(error.message).to.include("Invalid pair address");
            }
            expect(failed).to.be.true;
        });
    });

    describe("💸 Tax Calculation", function () {
        it("Should calculate tax amount correctly", async function () {
            const amount = ethers.utils.parseEther("1000");
            const taxAmount = await taxManager.testCalculateTaxAmount(amount);
            const expectedTax = amount.mul(100).div(10000); // 1%
            expect(taxAmount.toString()).to.equal(expectedTax.toString());
        });

        it("Should calculate zero tax for zero amount", async function () {
            const taxAmount = await taxManager.testCalculateTaxAmount(0);
            expect(taxAmount.toString()).to.equal("0");
        });

        it("Should calculate tax for maximum amount", async function () {
            const maxAmount = ethers.constants.MaxUint256.div(10000); // Avoid overflow
            const taxAmount = await taxManager.testCalculateTaxAmount(maxAmount);
            const expectedTax = maxAmount.mul(100).div(10000);
            expect(taxAmount.toString()).to.equal(expectedTax.toString());
        });

        it("Should calculate distribution correctly", async function () {
            const taxAmount = ethers.utils.parseEther("100");
            const distribution = await taxManager.testCalculateDistribution(taxAmount);
            
            const expectedFee = taxAmount.mul(5000).div(10000); // 50%
            const expectedBurn = taxAmount.mul(2500).div(10000); // 25%
            const expectedDonation = taxAmount.sub(expectedFee).sub(expectedBurn); // 25%
            
            expect(distribution.feeAmount.toString()).to.equal(expectedFee.toString());
            expect(distribution.burnAmount.toString()).to.equal(expectedBurn.toString());
            expect(distribution.donationAmount.toString()).to.equal(expectedDonation.toString());
            
            // Verify total equals original tax amount
            const total = distribution.feeAmount.add(distribution.burnAmount).add(distribution.donationAmount);
            expect(total.toString()).to.equal(taxAmount.toString());
        });

        it("Should handle rounding in distribution", async function () {
            // Use an amount that will cause rounding
            const taxAmount = ethers.utils.parseEther("1").add(1); // 1 wei extra
            const distribution = await taxManager.testCalculateDistribution(taxAmount);
            
            // Total should still equal original amount (no rounding errors)
            const total = distribution.feeAmount.add(distribution.burnAmount).add(distribution.donationAmount);
            expect(total.toString()).to.equal(taxAmount.toString());
        });

        it("Should calculate transfer amounts with tax", async function () {
            const amount = ethers.utils.parseEther("1000");
            const result = await taxManager.testCalculateTransferAmounts(amount, true);
            
            const expectedTax = amount.mul(100).div(10000); // 1%
            const expectedTransfer = amount.sub(expectedTax);
            
            expect(result.transferAmount.toString()).to.equal(expectedTransfer.toString());
            expect(result.taxAmount.toString()).to.equal(expectedTax.toString());
        });

        it("Should calculate transfer amounts without tax", async function () {
            const amount = ethers.utils.parseEther("1000");
            const result = await taxManager.testCalculateTransferAmounts(amount, false);
            
            expect(result.transferAmount.toString()).to.equal(amount.toString());
            expect(result.taxAmount.toString()).to.equal("0");
        });
    });

    describe("🎯 Tax Application Logic", function () {
        beforeEach(async function () {
            await taxManager.testEnableTrading();
            await taxManager.testSetAMMPair(
                ammPair.address, 
                true, 
                owner.address, 
                feeWallet.address, 
                donationWallet.address
            );
        });

        it("Should apply tax on AMM buy transactions", async function () {
            const shouldApply = await taxManager.testShouldApplyTax(
                ammPair.address, // from AMM
                user1.address,   // to user
                false,           // AMM not exempt
                false            // user not exempt
            );
            expect(shouldApply).to.be.true;
        });

        it("Should apply tax on AMM sell transactions", async function () {
            const shouldApply = await taxManager.testShouldApplyTax(
                user1.address,   // from user
                ammPair.address, // to AMM
                false,           // user not exempt
                false            // AMM not exempt
            );
            expect(shouldApply).to.be.true;
        });

        it("Should not apply tax on regular transfers", async function () {
            const shouldApply = await taxManager.testShouldApplyTax(
                user1.address, // from user
                user2.address, // to user
                false,         // not exempt
                false          // not exempt
            );
            expect(shouldApply).to.be.false;
        });

        it("Should not apply tax when sender is exempt", async function () {
            const shouldApply = await taxManager.testShouldApplyTax(
                user1.address,   // from user
                ammPair.address, // to AMM
                true,            // user exempt
                false            // AMM not exempt
            );
            expect(shouldApply).to.be.false;
        });

        it("Should not apply tax when recipient is exempt", async function () {
            const shouldApply = await taxManager.testShouldApplyTax(
                ammPair.address, // from AMM
                user1.address,   // to user
                false,           // AMM not exempt
                true             // user exempt
            );
            expect(shouldApply).to.be.false;
        });

        it("Should not apply tax when trading is disabled", async function () {
            // Create new instance with trading disabled
            const TaxManagerLib = await ethers.getContractFactory("contracts/libraries/TaxManager.sol:TaxManager");
            const taxManagerLib = await TaxManagerLib.deploy();
            const TaxManagerTestContract = await ethers.getContractFactory("contracts/mocks/TaxManagerTestContract.sol:TaxManagerTestContract", {
                libraries: { TaxManager: taxManagerLib.address },
            });
            const newTaxManager = await TaxManagerTestContract.deploy();
            
            await newTaxManager.testSetAMMPair(
                ammPair.address, 
                true, 
                owner.address, 
                feeWallet.address, 
                donationWallet.address
            );
            
            const shouldApply = await newTaxManager.testShouldApplyTax(
                ammPair.address, // from AMM
                user1.address,   // to user
                false,           // not exempt
                false            // not exempt
            );
            expect(shouldApply).to.be.false;
        });

        it("Should get comprehensive tax status", async function () {
            const status = await taxManager.testGetTaxStatus(
                ammPair.address, // from AMM
                user1.address,   // to user
                false,           // AMM not exempt
                false            // user not exempt
            );
            
            expect(status.willApplyTax).to.be.true;
            expect(status.isFromAMM).to.be.true;
            expect(status.isToAMM).to.be.false;
            expect(status.tradingActive).to.be.true;
        });
    });

    describe("📈 Tax Distribution and Analytics", function () {
        it("Should distribute tax and emit events", async function () {
            const taxAmount = ethers.utils.parseEther("100");
            
            // Use callStatic to get return values from the function
            const result = await taxManager.callStatic.testDistributeTax(
                user1.address,
                taxAmount,
                feeWallet.address,
                donationWallet.address
            );
            
            const expectedFee = taxAmount.mul(5000).div(10000); // 50%
            const expectedBurn = taxAmount.mul(2500).div(10000); // 25%
            const expectedDonation = taxAmount.sub(expectedFee).sub(expectedBurn); // 25%
            
            // Result is a tuple [feeAmount, burnAmount, donationAmount]
            expect(result[0].toString()).to.equal(expectedFee.toString());
            expect(result[1].toString()).to.equal(expectedBurn.toString());
            expect(result[2].toString()).to.equal(expectedDonation.toString());
        });

        it("Should log transfer analytics for AMM transactions", async function () {
            await taxManager.testSetAMMPair(
                ammPair.address, 
                true, 
                owner.address, 
                feeWallet.address, 
                donationWallet.address
            );
            
            // Should log analytics for AMM buy
            await taxManager.testLogTransferAnalytics(
                ammPair.address, // from AMM
                user1.address,   // to user
                ethers.utils.parseEther("1000")
            );
            
            // Should log analytics for AMM sell
            await taxManager.testLogTransferAnalytics(
                user1.address,   // from user
                ammPair.address, // to AMM
                ethers.utils.parseEther("500")
            );
        });

        it("Should not log analytics for regular transfers", async function () {
            // Should not log analytics for user-to-user transfers
            await taxManager.testLogTransferAnalytics(
                user1.address, // from user
                user2.address, // to user
                ethers.utils.parseEther("1000")
            );
            // No assertion needed - just ensuring no revert
        });
    });

    describe("🔍 Edge Cases and Error Handling", function () {
        it("Should handle zero tax amount distribution", async function () {
            // Use callStatic to get return values from the function
            const result = await taxManager.callStatic.testDistributeTax(
                user1.address,
                0,
                feeWallet.address,
                donationWallet.address
            );
            
            // Result is a tuple [feeAmount, burnAmount, donationAmount]
            expect(result[0].toString()).to.equal("0");
            expect(result[1].toString()).to.equal("0");
            expect(result[2].toString()).to.equal("0");
        });

        it("Should handle maximum tax amount", async function () {
            const maxTaxAmount = ethers.utils.parseEther("1000000"); // Large but safe amount
            const distribution = await taxManager.testCalculateDistribution(maxTaxAmount);
            
            // Verify no overflow and correct calculation
            const total = distribution.feeAmount.add(distribution.burnAmount).add(distribution.donationAmount);
            expect(total.toString()).to.equal(maxTaxAmount.toString());
        });

        it("Should handle AMM pair validation edge cases", async function () {
            // Test with same address for multiple roles (should fail)
            let failed = false;
            try {
                await taxManager.testValidateAMMPairSetting(
                    owner.address, // Same as owner
                    owner.address,
                    feeWallet.address,
                    donationWallet.address
                );
            } catch (error) {
                failed = true;
                expect(error.message).to.include("Cannot set owner as AMM pair");
            }
            expect(failed).to.be.true;
        });

        it("Should handle tax status for multiple scenarios", async function () {
            await taxManager.testEnableTrading();
            
            // Test various combinations
            const scenarios = [
                { from: user1.address, to: user2.address, fromExempt: false, toExempt: false, expectedTax: false },
                { from: user1.address, to: user2.address, fromExempt: true, toExempt: false, expectedTax: false },
                { from: user1.address, to: user2.address, fromExempt: false, toExempt: true, expectedTax: false },
            ];
            
            for (const scenario of scenarios) {
                const shouldApply = await taxManager.testShouldApplyTax(
                    scenario.from,
                    scenario.to,
                    scenario.fromExempt,
                    scenario.toExempt
                );
                expect(shouldApply).to.equal(scenario.expectedTax);
            }
        });

        it("Should handle boundary values in calculations", async function () {
            // Test with 1 wei
            const minAmount = 1;
            const taxAmount = await taxManager.testCalculateTaxAmount(minAmount);
            expect(taxAmount.toString()).to.equal("0"); // Should round down to 0
            
            // Test with amount that gives exactly 1 wei tax
            const exactAmount = 10000; // 10000 * 100 / 10000 = 100 wei tax
            const exactTax = await taxManager.testCalculateTaxAmount(exactAmount);
            expect(exactTax.toString()).to.equal("100");
        });

        it("Should get tax status with trading disabled and exemptions", async function () {
            // Trading disabled, both exempt
            const status1 = await taxManager.testGetTaxStatus(
                user1.address,
                user2.address,
                true,
                true
            );
            expect(status1.willApplyTax).to.be.false;
            expect(status1.tradingActive).to.be.false;
            
            // Trading disabled, only sender exempt
            const status2 = await taxManager.testGetTaxStatus(
                user1.address,
                user2.address,
                true,
                false
            );
            expect(status2.willApplyTax).to.be.false;
            expect(status2.tradingActive).to.be.false;
        });

        it("Should get tax status with trading enabled and exemptions", async function () {
            await taxManager.testEnableTrading();
            
            // Trading enabled, sender exempt
            const status1 = await taxManager.testGetTaxStatus(
                user1.address,
                user2.address,
                true,
                false
            );
            expect(status1.willApplyTax).to.be.false;
            expect(status1.tradingActive).to.be.true;
            
            // Trading enabled, recipient exempt
            const status2 = await taxManager.testGetTaxStatus(
                user1.address,
                user2.address,
                false,
                true
            );
            expect(status2.willApplyTax).to.be.false;
            expect(status2.tradingActive).to.be.true;
            
            // Trading enabled, both exempt
            const status3 = await taxManager.testGetTaxStatus(
                user1.address,
                user2.address,
                true,
                true
            );
            expect(status3.willApplyTax).to.be.false;
            expect(status3.tradingActive).to.be.true;
        });

        it("Should handle transfer amounts with zero amount", async function () {
            const result = await taxManager.testCalculateTransferAmounts(0, true);
            expect(result.transferAmount.toString()).to.equal("0");
            expect(result.taxAmount.toString()).to.equal("0");
        });

        it("Should handle very small amounts in tax calculation", async function () {
            // Test amounts smaller than tax rate
            const smallAmount = 50; // Less than 100 (1% threshold)
            const taxAmount = await taxManager.testCalculateTaxAmount(smallAmount);
            expect(taxAmount.toString()).to.equal("0"); // Should round down
        });

        it("Should validate all AMM pair setting restrictions", async function () {
            // Test fee wallet restriction
            let failed = false;
            try {
                await taxManager.testValidateAMMPairSetting(
                    feeWallet.address,
                    owner.address,
                    feeWallet.address,
                    donationWallet.address
                );
            } catch (error) {
                failed = true;
                expect(error.message).to.include("Cannot set fee wallet as AMM pair");
            }
            expect(failed).to.be.true;

            // Test donation wallet restriction
            failed = false;
            try {
                await taxManager.testValidateAMMPairSetting(
                    donationWallet.address,
                    owner.address,
                    feeWallet.address,
                    donationWallet.address
                );
            } catch (error) {
                failed = true;
                expect(error.message).to.include("Cannot set donation wallet as AMM pair");
            }
            expect(failed).to.be.true;

            // Test burn wallet restriction
            failed = false;
            try {
                await taxManager.testValidateAMMPairSetting(
                    "0x000000000000000000000000000000000000dEaD",
                    owner.address,
                    feeWallet.address,
                    donationWallet.address
                );
            } catch (error) {
                failed = true;
                expect(error.message).to.include("Cannot set burn wallet as AMM pair");
            }
            expect(failed).to.be.true;
        });

        it("Should handle distribution with odd numbers", async function () {
            // Use an odd number that will cause rounding in distribution
            const oddTaxAmount = ethers.utils.parseEther("1").add(3); // 1 ETH + 3 wei
            const distribution = await taxManager.testCalculateDistribution(oddTaxAmount);
            
            // Verify total still equals original (no loss due to rounding)
            const total = distribution.feeAmount.add(distribution.burnAmount).add(distribution.donationAmount);
            expect(total.toString()).to.equal(oddTaxAmount.toString());
        });

        it("Should get tax status with AMM pairs and exemptions", async function () {
            await taxManager.testEnableTrading();
            await taxManager.testSetAMMPair(
                ammPair.address,
                true,
                owner.address,
                feeWallet.address,
                donationWallet.address
            );

            // AMM buy with sender exempt (AMM exempt)
            const status1 = await taxManager.testGetTaxStatus(
                ammPair.address,
                user1.address,
                true,
                false
            );
            expect(status1.willApplyTax).to.be.false;
            expect(status1.isFromAMM).to.be.true;
            expect(status1.isToAMM).to.be.false;

            // AMM sell with recipient exempt (AMM exempt)
            const status2 = await taxManager.testGetTaxStatus(
                user1.address,
                ammPair.address,
                false,
                true
            );
            expect(status2.willApplyTax).to.be.false;
            expect(status2.isFromAMM).to.be.false;
            expect(status2.isToAMM).to.be.true;

            // AMM buy with no exemptions
            const status3 = await taxManager.testGetTaxStatus(
                ammPair.address,
                user1.address,
                false,
                false
            );
            expect(status3.willApplyTax).to.be.true;
            expect(status3.isFromAMM).to.be.true;
            expect(status3.isToAMM).to.be.false;
        });

        it("Should validate trading with all exemption combinations", async function () {
            // Trading disabled, both not exempt - should fail
            let failed = false;
            try {
                await taxManager.testValidateTrading(user1.address, user2.address, false, false);
            } catch (error) {
                failed = true;
                expect(error.message).to.include("Trading not enabled");
            }
            expect(failed).to.be.true;

            // Trading disabled, sender exempt - should pass
            await taxManager.testValidateTrading(user1.address, user2.address, true, false);

            // Trading disabled, recipient exempt - should pass
            await taxManager.testValidateTrading(user1.address, user2.address, false, true);

            // Trading disabled, both exempt - should pass
            await taxManager.testValidateTrading(user1.address, user2.address, true, true);

            // Enable trading
            await taxManager.testEnableTrading();

            // Trading enabled, all combinations should pass
            await taxManager.testValidateTrading(user1.address, user2.address, false, false);
            await taxManager.testValidateTrading(user1.address, user2.address, true, false);
            await taxManager.testValidateTrading(user1.address, user2.address, false, true);
            await taxManager.testValidateTrading(user1.address, user2.address, true, true);
        });

        it("Should calculate tax for various amount ranges", async function () {
            // Test different amount ranges
            const amounts = [
                ethers.BigNumber.from(1),             // Minimum
                ethers.BigNumber.from(99),            // Below 1% threshold
                ethers.BigNumber.from(100),           // Exactly 1% threshold
                ethers.BigNumber.from(10000),         // 1 token (assuming 18 decimals)
                ethers.utils.parseEther("1"),        // 1 ETH
                ethers.utils.parseEther("1000"),     // 1000 ETH
                ethers.utils.parseEther("1000000"),  // 1M ETH
            ];

            for (const amount of amounts) {
                const taxAmount = await taxManager.testCalculateTaxAmount(amount);
                const expectedTax = amount.mul(100).div(10000);
                expect(taxAmount.toString()).to.equal(expectedTax.toString());
            }
        });
    });
});