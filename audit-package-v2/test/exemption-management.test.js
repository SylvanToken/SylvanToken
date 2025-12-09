const { expect } = require("./helpers/ChaiSetup");
const { ethers } = require("hardhat");
const { parseExemptionConfig, validateExemptionConfig } = require("../scripts/management/exemption-config-loader");
const { deploySylvanTokenWithLibraries } = require("./helpers/deploy-libraries");

/**
 * @title Exemption Management Tests
 * @dev Comprehensive tests for dynamic exemption management functionality
 * Requirements: 4.1, 4.2, 4.3, 4.4, 4.5
 */

describe("🚫 Enhanced Exemption Management", function () {
    let token;
    let owner, feeWallet, donationWallet, user1, user2, user3, user4;
    let initialExemptAccounts;

    beforeEach(async function () {
        [owner, feeWallet, donationWallet, user1, user2, user3, user4] = await ethers.getSigners();
        
        // Set up initial exempt accounts
        initialExemptAccounts = [user3.address];

        token = await deploySylvanTokenWithLibraries(
            feeWallet.address,
            donationWallet.address,
            initialExemptAccounts
        );
    });

    describe("🔧 Individual Exemption Management", function () {
        it("Should add individual exempt wallet correctly", async function () {
            // Requirement 4.1: Add exempt function
            expect(await token.isExempt(user1.address)).to.be.false;

            const tx = await token.addExemptWallet(user1.address);
            await tx.wait();

            expect(await token.isExempt(user1.address)).to.be.true;
            
            const exemptWallets = await token.getExemptWallets();
            expect(exemptWallets).to.include(user1.address);
            
            const exemptCount = await token.getExemptWalletCount();
            expect(exemptCount.toNumber()).to.be.gt(0);
        });

        it("Should remove individual exempt wallet correctly", async function () {
            // Requirement 4.2: Remove exempt function
            // First add a wallet
            await token.addExemptWallet(user1.address);
            expect(await token.isExempt(user1.address)).to.be.true;

            const tx = await token.removeExemptWallet(user1.address);
            await tx.wait();

            expect(await token.isExempt(user1.address)).to.be.false;
            
            const exemptWallets = await token.getExemptWallets();
            expect(exemptWallets).to.not.include(user1.address);
        });

        it("Should emit FeeExemptionChanged event on add", async function () {
            // Requirement 4.4: Event emission
            const tx = await token.addExemptWallet(user1.address);
            const receipt = await tx.wait();
            
            // Check that an event was emitted
            expect(receipt.events.length).to.be.gt(0);
            const event = receipt.events.find(e => e.event === "FeeExemptionChanged");
            expect(event).to.not.be.undefined;
            expect(event.args.wallet).to.equal(user1.address);
            expect(event.args.exempt).to.be.true;
        });

        it("Should emit FeeExemptionChanged event on remove", async function () {
            // Requirement 4.4: Event emission
            await token.addExemptWallet(user1.address);
            
            const tx = await token.removeExemptWallet(user1.address);
            const receipt = await tx.wait();
            
            // Check that an event was emitted
            expect(receipt.events.length).to.be.gt(0);
            const event = receipt.events.find(e => e.event === "FeeExemptionChanged");
            expect(event).to.not.be.undefined;
            expect(event.args.wallet).to.equal(user1.address);
            expect(event.args.exempt).to.be.false;
        });

        it("Should revert when adding already exempt wallet", async function () {
            await token.addExemptWallet(user1.address);
            
            let reverted = false;
            try {
                await token.addExemptWallet(user1.address);
            } catch (error) {
                reverted = true;
                expect(error.message).to.include("WalletAlreadyExempt");
            }
            expect(reverted).to.be.true;
        });

        it("Should revert when removing non-exempt wallet", async function () {
            let reverted = false;
            try {
                await token.removeExemptWallet(user1.address);
            } catch (error) {
                reverted = true;
                expect(error.message).to.include("WalletNotExempt");
            }
            expect(reverted).to.be.true;
        });

        it("Should revert when unauthorized account tries to modify exemptions", async function () {
            // Requirement 4.5: Access control
            let reverted1 = false;
            try {
                await token.connect(user1).addExemptWallet(user2.address);
            } catch (error) {
                reverted1 = true;
                expect(error.message).to.include("caller is not the owner");
            }
            expect(reverted1).to.be.true;
            
            let reverted2 = false;
            try {
                await token.connect(user1).removeExemptWallet(user3.address);
            } catch (error) {
                reverted2 = true;
                expect(error.message).to.include("caller is not the owner");
            }
            expect(reverted2).to.be.true;
        });

        it("Should revert on zero address operations", async function () {
            let reverted = false;
            try {
                await token.addExemptWallet(ethers.constants.AddressZero);
            } catch (error) {
                reverted = true;
                expect(error.message).to.include("ZeroAddress");
            }
            expect(reverted).to.be.true;
        });
    });

    describe("📦 Batch Exemption Management", function () {
        it("Should add multiple wallets in batch", async function () {
            // Requirement 4.3: Batch operations
            const walletsToAdd = [user1.address, user2.address, user4.address];
            
            const tx = await token.addExemptWalletsBatch(walletsToAdd);
            await tx.wait();

            for (const wallet of walletsToAdd) {
                expect(await token.isExempt(wallet)).to.be.true;
            }
            
            const exemptWallets = await token.getExemptWallets();
            for (const wallet of walletsToAdd) {
                expect(exemptWallets).to.include(wallet);
            }
        });

        it("Should remove multiple wallets in batch", async function () {
            // Requirement 4.3: Batch operations
            const walletsToRemove = [user1.address, user2.address];
            
            // First add them
            await token.addExemptWalletsBatch(walletsToRemove);
            
            // Verify they're added
            for (const wallet of walletsToRemove) {
                expect(await token.isExempt(wallet)).to.be.true;
            }
            
            // Remove them in batch
            const tx = await token.removeExemptWalletsBatch(walletsToRemove);
            await tx.wait();

            for (const wallet of walletsToRemove) {
                expect(await token.isExempt(wallet)).to.be.false;
            }
        });

        it("Should emit BatchExemptionUpdate event on batch add", async function () {
            // Requirement 4.4: Event emission
            const walletsToAdd = [user1.address, user2.address];
            
            const tx = await token.addExemptWalletsBatch(walletsToAdd);
            const receipt = await tx.wait();
            
            // Check that an event was emitted
            expect(receipt.events.length).to.be.gt(0);
            const event = receipt.events.find(e => e.event === "BatchExemptionUpdate");
            expect(event).to.not.be.undefined;
            expect(event.args.exempt).to.be.true;
        });

        it("Should emit BatchExemptionUpdate event on batch remove", async function () {
            // Requirement 4.4: Event emission
            const walletsToRemove = [user1.address, user2.address];
            
            // First add them
            await token.addExemptWalletsBatch(walletsToRemove);
            
            const tx = await token.removeExemptWalletsBatch(walletsToRemove);
            const receipt = await tx.wait();
            
            // Check that an event was emitted
            expect(receipt.events.length).to.be.gt(0);
            const event = receipt.events.find(e => e.event === "BatchExemptionUpdate");
            expect(event).to.not.be.undefined;
            expect(event.args.exempt).to.be.false;
        });

        it("Should handle empty batch operations gracefully", async function () {
            const emptyArray = [];
            
            // Should not revert on empty arrays
            try {
                await token.addExemptWalletsBatch(emptyArray);
                await token.removeExemptWalletsBatch(emptyArray);
                // If we reach here, operations succeeded
                expect(true).to.be.true;
            } catch (error) {
                // Should not reach here
                expect.fail("Empty batch operations should not revert");
            }
        });

        it("Should skip already exempt wallets in batch add", async function () {
            const walletsToAdd = [user1.address, user2.address];
            
            // Add user1 individually first
            await token.addExemptWallet(user1.address);
            
            // Batch add should not revert, should skip user1
            try {
                await token.addExemptWalletsBatch(walletsToAdd);
                // If we reach here, operation succeeded
                expect(true).to.be.true;
            } catch (error) {
                expect.fail("Batch add should not revert when skipping already exempt wallets");
            }
            
            // Both should be exempt
            expect(await token.isExempt(user1.address)).to.be.true;
            expect(await token.isExempt(user2.address)).to.be.true;
        });

        it("Should skip non-exempt wallets in batch remove", async function () {
            const walletsToRemove = [user1.address, user2.address];
            
            // Add only user1
            await token.addExemptWallet(user1.address);
            
            // Batch remove should not revert, should skip user2
            try {
                await token.removeExemptWalletsBatch(walletsToRemove);
                // If we reach here, operation succeeded
                expect(true).to.be.true;
            } catch (error) {
                expect.fail("Batch remove should not revert when skipping non-exempt wallets");
            }
            
            // user1 should be removed, user2 should remain non-exempt
            expect(await token.isExempt(user1.address)).to.be.false;
            expect(await token.isExempt(user2.address)).to.be.false;
        });
    });

    describe("⚙️ Configuration Loading", function () {
        it("Should load exemptions from configuration arrays", async function () {
            // Requirements: 1.1, 1.2, 1.3, 4.1, 4.2
            const configWallets = [user1.address, user2.address, user4.address];
            const exemptStatuses = [true, false, true];

            const tx = await token["loadExemptionsFromConfig(address[],bool[])"](
                configWallets, 
                exemptStatuses
            );
            await tx.wait();

            expect(await token.isExempt(user1.address)).to.be.true;
            expect(await token.isExempt(user2.address)).to.be.false;
            expect(await token.isExempt(user4.address)).to.be.true;
        });

        it("Should emit ExemptionConfigLoaded event", async function () {
            const configWallets = [user1.address, user2.address];
            const exemptStatuses = [true, false];

            const tx = await token["loadExemptionsFromConfig(address[],bool[])"](
                configWallets, 
                exemptStatuses
            );
            const receipt = await tx.wait();
            
            // Check that an event was emitted
            expect(receipt.events.length).to.be.gt(0);
            const event = receipt.events.find(e => e.event === "ExemptionConfigLoaded");
            expect(event).to.not.be.undefined;
        });

        it("Should handle configuration changes correctly", async function () {
            // First configuration
            const configWallets1 = [user1.address, user2.address];
            const exemptStatuses1 = [true, true];
            
            await token["loadExemptionsFromConfig(address[],bool[])"](
                configWallets1, 
                exemptStatuses1
            );
            
            expect(await token.isExempt(user1.address)).to.be.true;
            expect(await token.isExempt(user2.address)).to.be.true;

            // Second configuration - change user2 to non-exempt
            const configWallets2 = [user1.address, user2.address];
            const exemptStatuses2 = [true, false];
            
            await token["loadExemptionsFromConfig(address[],bool[])"](
                configWallets2, 
                exemptStatuses2
            );
            
            expect(await token.isExempt(user1.address)).to.be.true;
            expect(await token.isExempt(user2.address)).to.be.false;
        });

        it("Should revert on mismatched array lengths", async function () {
            const configWallets = [user1.address, user2.address];
            const exemptStatuses = [true]; // Mismatched length

            let reverted = false;
            try {
                await token["loadExemptionsFromConfig(address[],bool[])"](
                    configWallets, 
                    exemptStatuses
                );
            } catch (error) {
                reverted = true;
                expect(error.message).to.include("InvalidExemptionConfiguration");
            }
            expect(reverted).to.be.true;
        });

        it("Should skip zero addresses in configuration", async function () {
            const configWallets = [user1.address, ethers.constants.AddressZero, user2.address];
            const exemptStatuses = [true, true, false];

            // Should not revert, should skip zero address
            try {
                await token["loadExemptionsFromConfig(address[],bool[])"](
                    configWallets, 
                    exemptStatuses
                );
                // If we reach here, operation succeeded
                expect(true).to.be.true;
            } catch (error) {
                expect.fail("Configuration loading should not revert when skipping zero addresses");
            }

            expect(await token.isExempt(user1.address)).to.be.true;
            expect(await token.isExempt(user2.address)).to.be.false;
        });

        it("Should handle empty configuration arrays", async function () {
            const emptyWallets = [];
            const emptyStatuses = [];

            try {
                await token["loadExemptionsFromConfig(address[],bool[])"](
                    emptyWallets, 
                    emptyStatuses
                );
                // If we reach here, operation succeeded
                expect(true).to.be.true;
            } catch (error) {
                expect.fail("Empty configuration arrays should not revert");
            }
        });
    });

    describe("📊 Exemption Status Checking and Validation", function () {
        it("Should correctly report exemption status", async function () {
            // Requirement 4.3: Status checking
            expect(await token.isExempt(user1.address)).to.be.false;
            
            await token.addExemptWallet(user1.address);
            expect(await token.isExempt(user1.address)).to.be.true;
            
            await token.removeExemptWallet(user1.address);
            expect(await token.isExempt(user1.address)).to.be.false;
        });

        it("Should return correct exempt wallet count", async function () {
            const initialCount = await token.getExemptWalletCount();
            
            await token.addExemptWallet(user1.address);
            expect((await token.getExemptWalletCount()).toNumber()).to.equal(initialCount.add(1).toNumber());
            
            await token.addExemptWallet(user2.address);
            expect((await token.getExemptWalletCount()).toNumber()).to.equal(initialCount.add(2).toNumber());
            
            await token.removeExemptWallet(user1.address);
            expect((await token.getExemptWalletCount()).toNumber()).to.equal(initialCount.add(1).toNumber());
        });

        it("Should return correct exempt wallet list", async function () {
            const walletsToAdd = [user1.address, user2.address];
            await token.addExemptWalletsBatch(walletsToAdd);
            
            const exemptWallets = await token.getExemptWallets();
            
            for (const wallet of walletsToAdd) {
                expect(exemptWallets).to.include(wallet);
            }
        });

        it("Should validate system wallets are automatically exempt", async function () {
            // System wallets should be automatically exempt
            expect(await token.isExempt(token.address)).to.be.true; // Contract itself
            expect(await token.isExempt(owner.address)).to.be.true; // Owner
            expect(await token.isExempt(feeWallet.address)).to.be.true; // Fee wallet
            expect(await token.isExempt(donationWallet.address)).to.be.true; // Donation wallet
            expect(await token.isExempt("0x000000000000000000000000000000000000dEaD")).to.be.true; // Dead wallet
        });

        it("Should validate initial exempt accounts from constructor", async function () {
            // user3 was set as initially exempt in beforeEach
            expect(await token.isExempt(user3.address)).to.be.true;
        });
    });

    describe("🔄 Integration with Fee System", function () {
        it("Should apply fees correctly based on exemption status", async function () {
            const transferAmount = ethers.utils.parseEther("1000");
            
            // Transfer tokens to users for testing
            await token.transfer(user1.address, transferAmount.mul(2));
            await token.transfer(user2.address, transferAmount.mul(2));
            
            // Test non-exempt to non-exempt (should apply fee)
            const initialBalance = await token.balanceOf(user4.address);
            await token.connect(user1).transfer(user4.address, transferAmount);
            const finalBalance = await token.balanceOf(user4.address);
            
            // Should receive less than full amount due to fee
            expect(finalBalance.sub(initialBalance).lt(transferAmount)).to.be.true;
            
            // Add user2 as exempt
            await token.addExemptWallet(user2.address);
            
            // Test exempt to non-exempt (should not apply fee)
            const initialBalance2 = await token.balanceOf(user4.address);
            await token.connect(user2).transfer(user4.address, transferAmount);
            const finalBalance2 = await token.balanceOf(user4.address);
            
            // Should receive full amount (no fee)
            expect(finalBalance2.sub(initialBalance2).eq(transferAmount)).to.be.true;
        });

        it("Should handle exemption changes during active trading", async function () {
            const transferAmount = ethers.utils.parseEther("1000");
            
            // Transfer tokens to user1
            await token.transfer(user1.address, transferAmount.mul(3));
            
            // First transfer - should apply fee (user1 not exempt)
            const initialBalance1 = await token.balanceOf(user4.address);
            await token.connect(user1).transfer(user4.address, transferAmount);
            const afterFirstTransfer = await token.balanceOf(user4.address);
            
            expect(afterFirstTransfer.sub(initialBalance1).lt(transferAmount)).to.be.true;
            
            // Add user1 as exempt
            await token.addExemptWallet(user1.address);
            
            // Second transfer - should not apply fee (user1 now exempt)
            await token.connect(user1).transfer(user4.address, transferAmount);
            const afterSecondTransfer = await token.balanceOf(user4.address);
            
            expect(afterSecondTransfer.sub(afterFirstTransfer).eq(transferAmount)).to.be.true;
            
            // Remove user1 from exempt
            await token.removeExemptWallet(user1.address);
            
            // Third transfer - should apply fee again (user1 no longer exempt)
            await token.connect(user1).transfer(user4.address, transferAmount);
            const afterThirdTransfer = await token.balanceOf(user4.address);
            
            expect(afterThirdTransfer.sub(afterSecondTransfer).lt(transferAmount)).to.be.true;
        });
    });

    describe("🛡️ Access Control and Security", function () {
        it("Should only allow owner to modify exemptions", async function () {
            // Requirement 4.5: Access control
            const operations = [
                () => token.connect(user1).addExemptWallet(user2.address),
                () => token.connect(user1).removeExemptWallet(user3.address),
                () => token.connect(user1).addExemptWalletsBatch([user2.address]),
                () => token.connect(user1).removeExemptWalletsBatch([user3.address]),
                () => token.connect(user1)["loadExemptionsFromConfig(address[],bool[])"]([user2.address], [true])
            ];

            for (const operation of operations) {
                let reverted = false;
                try {
                    await operation();
                } catch (error) {
                    reverted = true;
                    expect(error.message).to.include("caller is not the owner");
                }
                expect(reverted).to.be.true;
            }
        });

        it("Should maintain exemption list integrity", async function () {
            const initialCount = await token.getExemptWalletCount();
            const initialWallets = await token.getExemptWallets();
            
            // Add and remove same wallet multiple times
            await token.addExemptWallet(user1.address);
            await token.removeExemptWallet(user1.address);
            await token.addExemptWallet(user1.address);
            await token.removeExemptWallet(user1.address);
            
            // Count should return to initial
            expect((await token.getExemptWalletCount()).toNumber()).to.equal(initialCount.toNumber());
            
            // List should not contain duplicates
            const finalWallets = await token.getExemptWallets();
            const uniqueWallets = [...new Set(finalWallets.map(addr => addr.toLowerCase()))];
            expect(finalWallets.length).to.equal(uniqueWallets.length);
        });

        it("Should handle large batch operations efficiently", async function () {
            // Create array of 20 addresses for batch testing
            const signers = await ethers.getSigners();
            const largeWalletArray = signers.slice(10, 30).map(signer => signer.address);
            
            // Should handle large batch add
            try {
                await token.addExemptWalletsBatch(largeWalletArray);
                // If we reach here, operation succeeded
                expect(true).to.be.true;
            } catch (error) {
                expect.fail("Large batch add should not revert");
            }
            
            // Verify all were added
            for (const wallet of largeWalletArray) {
                expect(await token.isExempt(wallet)).to.be.true;
            }
            
            // Should handle large batch remove
            try {
                await token.removeExemptWalletsBatch(largeWalletArray);
                // If we reach here, operation succeeded
                expect(true).to.be.true;
            } catch (error) {
                expect.fail("Large batch remove should not revert");
            }
            
            // Verify all were removed
            for (const wallet of largeWalletArray) {
                expect(await token.isExempt(wallet)).to.be.false;
            }
        });
    });
});
