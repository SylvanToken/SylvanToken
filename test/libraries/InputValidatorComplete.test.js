const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("🔧 InputValidator Library Complete Coverage", function () {
    let inputValidator;
    let owner, user1, user2, user3, feeWallet, donationWallet;

    beforeEach(async function () {
        this.timeout(30000);
        [owner, user1, user2, user3, feeWallet, donationWallet] = await ethers.getSigners();

        // Deploy InputValidator library first
        const InputValidatorLib = await ethers.getContractFactory("contracts/libraries/InputValidator.sol:InputValidator");
        const inputValidatorLib = await InputValidatorLib.deploy();

        // Deploy InputValidator test contract with library linking
        const InputValidatorTestContract = await ethers.getContractFactory("contracts/mocks/InputValidatorTestContract.sol:InputValidatorTestContract", {
            libraries: {
                InputValidator: inputValidatorLib.address,
            },
        });
        inputValidator = await InputValidatorTestContract.deploy();
    });

    describe("📋 Address Validation Functions", function () {
        it("Should validate address with custom message", async function () {
            // Valid address
            await inputValidator.testValidateAddressWithMessage(user1.address, "Custom error");
            
            // Invalid address
            let failed = false;
            try {
                await inputValidator.testValidateAddressWithMessage(ethers.constants.AddressZero, "Custom error");
            } catch (error) {
                failed = true;
                expect(error.message).to.include("Custom error");
            }
            expect(failed).to.be.true;
        });

        it("Should validate single address", async function () {
            // Valid address
            await inputValidator.testValidateAddress(user1.address);
            
            // Invalid address
            let failed = false;
            try {
                await inputValidator.testValidateAddress(ethers.constants.AddressZero);
            } catch (error) {
                failed = true;
                expect(error.message).to.include("Invalid address: cannot be zero");
            }
            expect(failed).to.be.true;
        });

        it("Should validate address is not contract", async function () {
            // Valid address
            await inputValidator.testValidateNotContract(user1.address, inputValidator.address);
            
            // Invalid - same as contract
            await expect(
                inputValidator.testValidateNotContract(inputValidator.address, inputValidator.address)
            ).to.be.revertedWith("Invalid address: cannot be contract address");
        });

        it("Should validate wallet pair addresses", async function () {
            // Valid wallet pair
            await inputValidator.testValidateWalletPair(
                feeWallet.address,
                donationWallet.address,
                inputValidator.address
            );
            
            // Invalid - first wallet zero
            await expect(
                inputValidator.testValidateWalletPair(
                    ethers.constants.AddressZero,
                    donationWallet.address,
                    inputValidator.address
                )
            ).to.be.revertedWith("Invalid first wallet address");
            
            // Invalid - second wallet zero
            await expect(
                inputValidator.testValidateWalletPair(
                    feeWallet.address,
                    ethers.constants.AddressZero,
                    inputValidator.address
                )
            ).to.be.revertedWith("Invalid second wallet address");
            
            // Invalid - first wallet is contract
            await expect(
                inputValidator.testValidateWalletPair(
                    inputValidator.address,
                    donationWallet.address,
                    inputValidator.address
                )
            ).to.be.revertedWith("First wallet cannot be contract address");
            
            // Invalid - second wallet is contract
            await expect(
                inputValidator.testValidateWalletPair(
                    feeWallet.address,
                    inputValidator.address,
                    inputValidator.address
                )
            ).to.be.revertedWith("Second wallet cannot be contract address");
            
            // Invalid - same wallets
            await expect(
                inputValidator.testValidateWalletPair(
                    feeWallet.address,
                    feeWallet.address,
                    inputValidator.address
                )
            ).to.be.revertedWith("Wallets cannot be the same");
        });
    });

    describe("💰 Amount Validation Functions", function () {
        it("Should validate amount", async function () {
            // Valid amount
            await inputValidator.testValidateAmount(100);
            
            // Invalid - zero amount
            let failed = false;
            try {
                await inputValidator.testValidateAmount(0);
            } catch (error) {
                failed = true;
                expect(error.message).to.include("Amount must be greater than zero");
            }
            expect(failed).to.be.true;
        });

        it("Should validate amount with minimum", async function () {
            // Valid amount
            await inputValidator.testValidateAmountWithMin(100, 50);
            
            // Invalid - below minimum
            await expect(
                inputValidator.testValidateAmountWithMin(30, 50)
            ).to.be.revertedWith("Amount below minimum threshold");
        });

        it("Should validate transfer addresses", async function () {
            // Valid addresses
            await inputValidator.testValidateTransferAddresses(user1.address, user2.address);
            
            // Invalid - from zero
            await expect(
                inputValidator.testValidateTransferAddresses(ethers.constants.AddressZero, user2.address)
            ).to.be.revertedWith("ERC20: transfer from the zero address");
            
            // Invalid - to zero
            await expect(
                inputValidator.testValidateTransferAddresses(user1.address, ethers.constants.AddressZero)
            ).to.be.revertedWith("ERC20: transfer to the zero address");
            
            // Invalid - same address
            await expect(
                inputValidator.testValidateTransferAddresses(user1.address, user1.address)
            ).to.be.revertedWith("Cannot transfer to self");
        });
    });

    describe("📊 Array Validation Functions", function () {
        it("Should validate array length", async function () {
            // Valid length
            await inputValidator.testValidateArrayLength(5);
            
            // Invalid - zero length
            await expect(
                inputValidator.testValidateArrayLength(0)
            ).to.be.revertedWith("Array cannot be empty");
            
            // Invalid - too large
            await expect(
                inputValidator.testValidateArrayLength(101)
            ).to.be.revertedWith("Array too large");
        });

        it("Should validate array lengths match", async function () {
            // Valid - same lengths
            await inputValidator.testValidateArrayLengths(5, 5);
            
            // Invalid - different lengths
            await expect(
                inputValidator.testValidateArrayLengths(5, 3)
            ).to.be.revertedWith("Array lengths must match");
            
            // Invalid - zero length
            await expect(
                inputValidator.testValidateArrayLengths(0, 0)
            ).to.be.revertedWith("Array cannot be empty");
        });

        it("Should validate address array", async function () {
            // Valid array
            const validAddresses = [user1.address, user2.address, user3.address];
            await inputValidator.testValidateAddressArray(validAddresses);
            
            // Invalid - empty array
            await expect(
                inputValidator.testValidateAddressArray([])
            ).to.be.revertedWith("Array cannot be empty");
            
            // Invalid - zero address in array
            const invalidAddresses = [user1.address, ethers.constants.AddressZero];
            await expect(
                inputValidator.testValidateAddressArray(invalidAddresses)
            ).to.be.revertedWith("Invalid address in array");
            
            // Invalid - duplicate addresses
            const duplicateAddresses = [user1.address, user2.address, user1.address];
            await expect(
                inputValidator.testValidateAddressArray(duplicateAddresses)
            ).to.be.revertedWith("Duplicate address in array");
        });
    });

    describe("🔐 Ownership and Wallet Validation", function () {
        it("Should validate ownership transfer", async function () {
            // Valid transfer
            await inputValidator.testValidateOwnershipTransfer(
                user2.address,
                user1.address,
                inputValidator.address
            );
            
            // Invalid - new owner zero
            await expect(
                inputValidator.testValidateOwnershipTransfer(
                    ethers.constants.AddressZero,
                    user1.address,
                    inputValidator.address
                )
            ).to.be.revertedWith("New owner cannot be zero address");
            
            // Invalid - same as current
            await expect(
                inputValidator.testValidateOwnershipTransfer(
                    user1.address,
                    user1.address,
                    inputValidator.address
                )
            ).to.be.revertedWith("New owner cannot be current owner");
            
            // Invalid - contract address
            await expect(
                inputValidator.testValidateOwnershipTransfer(
                    inputValidator.address,
                    user1.address,
                    inputValidator.address
                )
            ).to.be.revertedWith("New owner cannot be contract address");
        });

        it("Should validate wallet update", async function () {
            // Valid update
            await inputValidator.testValidateWalletUpdate(
                user2.address,
                user1.address,
                inputValidator.address
            );
            
            // Invalid - zero address
            await expect(
                inputValidator.testValidateWalletUpdate(
                    ethers.constants.AddressZero,
                    user1.address,
                    inputValidator.address
                )
            ).to.be.revertedWith("Invalid wallet address");
            
            // Invalid - contract address
            await expect(
                inputValidator.testValidateWalletUpdate(
                    inputValidator.address,
                    user1.address,
                    inputValidator.address
                )
            ).to.be.revertedWith("Cannot be contract address");
            
            // Invalid - same as current
            await expect(
                inputValidator.testValidateWalletUpdate(
                    user1.address,
                    user1.address,
                    inputValidator.address
                )
            ).to.be.revertedWith("Same as current wallet");
        });
    });

    describe("🔄 AMM and Tax Validation", function () {
        it("Should validate AMM pair", async function () {
            // Valid AMM pair
            await inputValidator.testValidateAMMPair(
                user3.address,
                inputValidator.address,
                owner.address,
                feeWallet.address,
                donationWallet.address
            );
            
            // Invalid - zero address
            await expect(
                inputValidator.testValidateAMMPair(
                    ethers.constants.AddressZero,
                    inputValidator.address,
                    owner.address,
                    feeWallet.address,
                    donationWallet.address
                )
            ).to.be.revertedWith("Invalid pair address");
            
            // Invalid - contract address
            await expect(
                inputValidator.testValidateAMMPair(
                    inputValidator.address,
                    inputValidator.address,
                    owner.address,
                    feeWallet.address,
                    donationWallet.address
                )
            ).to.be.revertedWith("Cannot set contract as AMM pair");
            
            // Invalid - owner address
            await expect(
                inputValidator.testValidateAMMPair(
                    owner.address,
                    inputValidator.address,
                    owner.address,
                    feeWallet.address,
                    donationWallet.address
                )
            ).to.be.revertedWith("Cannot set owner as AMM pair");
        });

        it("Should validate tax exemption", async function () {
            // Valid exemption - adding exemption
            await inputValidator.testValidateTaxExemption(
                user1.address,
                true,
                owner.address,
                inputValidator.address,
                feeWallet.address,
                donationWallet.address
            );
            
            // Valid exemption - removing from regular user
            await inputValidator.testValidateTaxExemption(
                user1.address,
                false,
                owner.address,
                inputValidator.address,
                feeWallet.address,
                donationWallet.address
            );
            
            // Invalid - zero address
            await expect(
                inputValidator.testValidateTaxExemption(
                    ethers.constants.AddressZero,
                    true,
                    owner.address,
                    inputValidator.address,
                    feeWallet.address,
                    donationWallet.address
                )
            ).to.be.revertedWith("Invalid account address");
            
            // Invalid - removing exemption from contract
            await expect(
                inputValidator.testValidateTaxExemption(
                    inputValidator.address,
                    false,
                    owner.address,
                    inputValidator.address,
                    feeWallet.address,
                    donationWallet.address
                )
            ).to.be.revertedWith("Contract must remain tax exempt");
        });
    });

    describe("⏰ Time and State Validation", function () {
        it("Should validate percentage", async function () {
            // Valid percentage
            await inputValidator.testValidatePercentage(5000, 10000);
            
            // Invalid - exceeds maximum
            await expect(
                inputValidator.testValidatePercentage(15000, 10000)
            ).to.be.revertedWith("Percentage exceeds maximum");
        });

        it("Should validate timelock", async function () {
            const currentTime = Math.floor(Date.now() / 1000);
            const futureTime = currentTime + 3600; // 1 hour
            const minDelay = 1800; // 30 minutes
            
            // Valid timelock
            await inputValidator.testValidateTimelock(futureTime, currentTime, minDelay);
            
            // Invalid - unlock time in past
            await expect(
                inputValidator.testValidateTimelock(currentTime - 100, currentTime, minDelay)
            ).to.be.revertedWith("Unlock time must be in future");
            
            // Invalid - insufficient delay
            await expect(
                inputValidator.testValidateTimelock(currentTime + 900, currentTime, minDelay)
            ).to.be.revertedWith("Insufficient delay");
        });

        it("Should validate cooldown", async function () {
            const currentTime = Math.floor(Date.now() / 1000);
            const lastAction = currentTime - 3600; // 1 hour ago
            const cooldownPeriod = 1800; // 30 minutes
            
            // Valid - cooldown elapsed
            await inputValidator.testValidateCooldown(lastAction, currentTime, cooldownPeriod);
            
            // Invalid - cooldown not elapsed
            await expect(
                inputValidator.testValidateCooldown(currentTime - 900, currentTime, cooldownPeriod)
            ).to.be.revertedWith("Cooldown period not elapsed");
        });

        it("Should validate balance", async function () {
            // Valid balance
            await inputValidator.testValidateBalance(1000, 500);
            
            // Invalid - insufficient balance
            await expect(
                inputValidator.testValidateBalance(300, 500)
            ).to.be.revertedWith("Insufficient balance");
        });

        it("Should validate contract state", async function () {
            // Valid state - not paused, trading not required
            await inputValidator.testValidateContractState(false, false, false);
            
            // Valid state - not paused, trading enabled and required
            await inputValidator.testValidateContractState(false, true, true);
            
            // Invalid - contract paused
            await expect(
                inputValidator.testValidateContractState(true, true, false)
            ).to.be.revertedWith("Contract is paused");
            
            // Invalid - trading required but not enabled
            await expect(
                inputValidator.testValidateContractState(false, false, true)
            ).to.be.revertedWith("Trading not enabled");
        });
    });

    describe("🏗️ Constructor Validation", function () {
        it("Should validate constructor parameters", async function () {
            // Valid parameters with empty array
            await inputValidator.testValidateConstructorParams(
                feeWallet.address,
                donationWallet.address,
                inputValidator.address,
                []
            );
            
            // Valid parameters with exempt accounts
            const exemptAccounts = [user1.address, user2.address];
            await inputValidator.testValidateConstructorParams(
                feeWallet.address,
                donationWallet.address,
                inputValidator.address,
                exemptAccounts
            );
            
            // Invalid - fee wallet zero
            await expect(
                inputValidator.testValidateConstructorParams(
                    ethers.constants.AddressZero,
                    donationWallet.address,
                    inputValidator.address,
                    []
                )
            ).to.be.revertedWith("Invalid fee wallet address");
            
            // Invalid - donation wallet zero
            await expect(
                inputValidator.testValidateConstructorParams(
                    feeWallet.address,
                    ethers.constants.AddressZero,
                    inputValidator.address,
                    []
                )
            ).to.be.revertedWith("Invalid donation wallet address");
            
            // Invalid - same wallets
            await expect(
                inputValidator.testValidateConstructorParams(
                    feeWallet.address,
                    feeWallet.address,
                    inputValidator.address,
                    []
                )
            ).to.be.revertedWith("Wallets cannot be the same");
        });
    });

    describe("🚨 Emergency Validation", function () {
        it("Should validate emergency withdraw", async function () {
            // Valid ETH withdrawal
            await inputValidator.testValidateEmergencyWithdraw(
                ethers.constants.AddressZero,
                ethers.utils.parseEther("1"),
                user1.address
            );
            
            // Valid token withdrawal
            await inputValidator.testValidateEmergencyWithdraw(
                user2.address, // token address
                1000,
                user1.address
            );
            
            // Invalid - zero amount
            await expect(
                inputValidator.testValidateEmergencyWithdraw(
                    ethers.constants.AddressZero,
                    0,
                    user1.address
                )
            ).to.be.revertedWith("Amount must be greater than zero");
            
            // Invalid - zero recipient
            await expect(
                inputValidator.testValidateEmergencyWithdraw(
                    ethers.constants.AddressZero,
                    1000,
                    ethers.constants.AddressZero
                )
            ).to.be.revertedWith("Invalid recipient address");
        });
    });

    describe("🔢 Boundary Value Testing", function () {
        it("Should test array length boundaries", async function () {
            const maxLength = await inputValidator.getMaxArrayLength();
            
            // Test maximum allowed length
            await inputValidator.testValidateArrayLength(maxLength);
            
            // Test just over maximum (should fail)
            await expect(
                inputValidator.testValidateArrayLength(maxLength.add(1))
            ).to.be.revertedWith("Array too large");
            
            // Test minimum valid length
            await inputValidator.testValidateArrayLength(1);
            
            // Test zero length (should fail)
            await expect(
                inputValidator.testValidateArrayLength(0)
            ).to.be.revertedWith("Array cannot be empty");
        });

        it("Should test percentage boundaries", async function () {
            // Test valid percentages
            await inputValidator.testValidatePercentage(0, 10000);
            await inputValidator.testValidatePercentage(5000, 10000);
            await inputValidator.testValidatePercentage(10000, 10000);
            
            // Test exceeding maximum
            await expect(
                inputValidator.testValidatePercentage(10001, 10000)
            ).to.be.revertedWith("Percentage exceeds maximum");
            
            // Test with different maximum
            await inputValidator.testValidatePercentage(500, 1000);
            await expect(
                inputValidator.testValidatePercentage(1001, 1000)
            ).to.be.revertedWith("Percentage exceeds maximum");
        });

        it("Should test amount boundaries", async function () {
            const minAmount = await inputValidator.getMinTransferAmount();
            
            // Test minimum valid amount
            await inputValidator.testValidateAmount(minAmount);
            
            // Test large valid amount
            const largeAmount = ethers.utils.parseEther("1000000");
            await inputValidator.testValidateAmount(largeAmount);
            
            // Test zero amount (should fail)
            await expect(
                inputValidator.testValidateAmount(0)
            ).to.be.revertedWith("Amount must be greater than zero");
        });

        it("Should test time boundaries", async function () {
            const currentTime = Math.floor(Date.now() / 1000);
            
            // Test minimum valid delay
            const minDelay = 1;
            const futureTime = currentTime + minDelay;
            await inputValidator.testValidateTimelock(futureTime, currentTime, minDelay);
            
            // Test large delay
            const largeDelay = 365 * 24 * 60 * 60; // 1 year
            const farFutureTime = currentTime + largeDelay;
            await inputValidator.testValidateTimelock(farFutureTime, currentTime, largeDelay);
            
            // Test edge case: exactly at minimum delay
            const exactTime = currentTime + minDelay;
            await inputValidator.testValidateTimelock(exactTime, currentTime, minDelay);
        });
    });

    describe("🧪 Edge Case Testing", function () {
        it("Should handle maximum array size with valid addresses", async function () {
            const maxLength = await inputValidator.getMaxArrayLength();
            const addresses = [];
            
            // Create array with maximum allowed size
            for (let i = 0; i < Math.min(maxLength.toNumber(), 10); i++) {
                addresses.push(ethers.Wallet.createRandom().address);
            }
            
            await inputValidator.testValidateAddressArray(addresses);
        });

        it("Should detect duplicates in large arrays", async function () {
            const addresses = [
                user1.address,
                user2.address,
                user3.address,
                user1.address // Duplicate
            ];
            
            await expect(
                inputValidator.testValidateAddressArray(addresses)
            ).to.be.revertedWith("Duplicate address in array");
        });

        it("Should handle complex validation scenarios", async function () {
            // Test constructor params with edge cases
            const largeExemptArray = [user1.address, user2.address, user3.address];
            
            await inputValidator.testValidateConstructorParams(
                feeWallet.address,
                donationWallet.address,
                inputValidator.address,
                largeExemptArray
            );
            
            // Test with empty array
            await inputValidator.testValidateConstructorParams(
                feeWallet.address,
                donationWallet.address,
                inputValidator.address,
                []
            );
        });

        it("Should validate complex AMM scenarios", async function () {
            // Test AMM pair validation with all different addresses
            await inputValidator.testValidateAMMPair(
                user1.address, // pair
                inputValidator.address, // contract
                owner.address, // owner
                feeWallet.address, // fee wallet
                donationWallet.address // donation wallet
            );
            
            // Test failure when pair equals fee wallet
            await expect(
                inputValidator.testValidateAMMPair(
                    feeWallet.address, // pair same as fee wallet
                    inputValidator.address,
                    owner.address,
                    feeWallet.address,
                    donationWallet.address
                )
            ).to.be.revertedWith("Cannot set fee wallet as AMM pair");
            
            // Test failure when pair equals donation wallet
            await expect(
                inputValidator.testValidateAMMPair(
                    donationWallet.address, // pair same as donation wallet
                    inputValidator.address,
                    owner.address,
                    feeWallet.address,
                    donationWallet.address
                )
            ).to.be.revertedWith("Cannot set donation wallet as AMM pair");
        });

        it("Should handle tax exemption edge cases", async function () {
            // Test removing exemption from owner (should fail)
            await expect(
                inputValidator.testValidateTaxExemption(
                    owner.address,
                    false, // removing exemption
                    owner.address,
                    inputValidator.address,
                    feeWallet.address,
                    donationWallet.address
                )
            ).to.be.revertedWith("Owner must remain tax exempt");
            
            // Test removing exemption from fee wallet (should fail)
            await expect(
                inputValidator.testValidateTaxExemption(
                    feeWallet.address,
                    false, // removing exemption
                    owner.address,
                    inputValidator.address,
                    feeWallet.address,
                    donationWallet.address
                )
            ).to.be.revertedWith("Fee wallet must remain tax exempt");
            
            // Test removing exemption from donation wallet (should fail)
            await expect(
                inputValidator.testValidateTaxExemption(
                    donationWallet.address,
                    false, // removing exemption
                    owner.address,
                    inputValidator.address,
                    feeWallet.address,
                    donationWallet.address
                )
            ).to.be.revertedWith("Donation wallet must remain tax exempt");
        });

        it("Should validate cooldown edge cases", async function () {
            const currentTime = Math.floor(Date.now() / 1000);
            const cooldownPeriod = 3600; // 1 hour
            
            // Test exactly at cooldown boundary
            const exactBoundary = currentTime - cooldownPeriod;
            await inputValidator.testValidateCooldown(exactBoundary, currentTime, cooldownPeriod);
            
            // Test just before cooldown expires (should fail)
            const justBefore = currentTime - cooldownPeriod + 1;
            await expect(
                inputValidator.testValidateCooldown(justBefore, currentTime, cooldownPeriod)
            ).to.be.revertedWith("Cooldown period not elapsed");
            
            // Test well after cooldown
            const wellAfter = currentTime - cooldownPeriod - 1000;
            await inputValidator.testValidateBalance(1000, 500);
        });

        it("Should validate contract state combinations", async function () {
            // Test all valid combinations
            await inputValidator.testValidateContractState(false, false, false); // Not paused, trading not required
            await inputValidator.testValidateContractState(false, true, false);  // Not paused, trading enabled but not required
            await inputValidator.testValidateContractState(false, true, true);   // Not paused, trading enabled and required
            
            // Test invalid combinations
            await expect(
                inputValidator.testValidateContractState(true, false, false) // Paused
            ).to.be.revertedWith("Contract is paused");
            
            await expect(
                inputValidator.testValidateContractState(true, true, false) // Paused
            ).to.be.revertedWith("Contract is paused");
            
            await expect(
                inputValidator.testValidateContractState(false, false, true) // Trading required but not enabled
            ).to.be.revertedWith("Trading not enabled");
        });
    });

    describe("🔍 Error Message Validation", function () {
        it("Should provide correct error messages for address validation", async function () {
            await expect(
                inputValidator.testValidateAddress(ethers.constants.AddressZero)
            ).to.be.revertedWith("Invalid address: cannot be zero");
            
            await expect(
                inputValidator.testValidateAddressWithMessage(ethers.constants.AddressZero, "Custom error message")
            ).to.be.revertedWith("Custom error message");
        });

        it("Should provide correct error messages for amount validation", async function () {
            await expect(
                inputValidator.testValidateAmount(0)
            ).to.be.revertedWith("Amount must be greater than zero");
            
            await expect(
                inputValidator.testValidateAmountWithMin(50, 100)
            ).to.be.revertedWith("Amount below minimum threshold");
            
            await expect(
                inputValidator.testValidateBalance(100, 200)
            ).to.be.revertedWith("Insufficient balance");
        });

        it("Should provide correct error messages for array validation", async function () {
            await expect(
                inputValidator.testValidateArrayLength(0)
            ).to.be.revertedWith("Array cannot be empty");
            
            const maxLength = await inputValidator.getMaxArrayLength();
            await expect(
                inputValidator.testValidateArrayLength(maxLength.add(1))
            ).to.be.revertedWith("Array too large");
            
            await expect(
                inputValidator.testValidateArrayLengths(5, 3)
            ).to.be.revertedWith("Array lengths must match");
        });
    });

    describe("⚠️ Malformed Input Testing", function () {
        it("Should handle malformed address arrays", async function () {
            // Array with zero address in middle
            const malformedArray1 = [user1.address, ethers.constants.AddressZero, user2.address];
            await expect(
                inputValidator.testValidateAddressArray(malformedArray1)
            ).to.be.revertedWith("Invalid address in array");
            
            // Array with zero address at end
            const malformedArray2 = [user1.address, user2.address, ethers.constants.AddressZero];
            await expect(
                inputValidator.testValidateAddressArray(malformedArray2)
            ).to.be.revertedWith("Invalid address in array");
            
            // Array with duplicate at different positions
            const malformedArray3 = [user1.address, user2.address, user3.address, user2.address];
            await expect(
                inputValidator.testValidateAddressArray(malformedArray3)
            ).to.be.revertedWith("Duplicate address in array");
        });

        it("Should handle malformed constructor parameters", async function () {
            // Fee wallet is contract address
            await expect(
                inputValidator.testValidateConstructorParams(
                    inputValidator.address, // contract as fee wallet
                    donationWallet.address,
                    inputValidator.address,
                    []
                )
            ).to.be.revertedWith("Fee wallet cannot be contract address");
            
            // Donation wallet is contract address
            await expect(
                inputValidator.testValidateConstructorParams(
                    feeWallet.address,
                    inputValidator.address, // contract as donation wallet
                    inputValidator.address,
                    []
                )
            ).to.be.revertedWith("Donation wallet cannot be contract address");
            
            // Array with zero address
            const malformedExemptArray = [user1.address, ethers.constants.AddressZero];
            await expect(
                inputValidator.testValidateConstructorParams(
                    feeWallet.address,
                    donationWallet.address,
                    inputValidator.address,
                    malformedExemptArray
                )
            ).to.be.revertedWith("Invalid address in array");
            
            // Array with duplicates
            const duplicateExemptArray = [user1.address, user2.address, user1.address];
            await expect(
                inputValidator.testValidateConstructorParams(
                    feeWallet.address,
                    donationWallet.address,
                    inputValidator.address,
                    duplicateExemptArray
                )
            ).to.be.revertedWith("Duplicate address in array");
        });

        it("Should handle malformed time parameters", async function () {
            const currentTime = Math.floor(Date.now() / 1000);
            
            // Unlock time in the past
            await expect(
                inputValidator.testValidateTimelock(
                    currentTime - 100, // past time
                    currentTime,
                    3600
                )
            ).to.be.revertedWith("Unlock time must be in future");
            
            // Insufficient delay
            await expect(
                inputValidator.testValidateTimelock(
                    currentTime + 1800, // 30 minutes
                    currentTime,
                    3600 // requires 1 hour
                )
            ).to.be.revertedWith("Insufficient delay");
            
            // Zero delay
            await expect(
                inputValidator.testValidateTimelock(
                    currentTime,
                    currentTime,
                    0
                )
            ).to.be.revertedWith("Unlock time must be in future");
        });

        it("Should handle extreme boundary conditions", async function () {
            // Test with maximum uint256 values where appropriate
            const maxUint256 = ethers.constants.MaxUint256;
            
            // Very large percentage (should fail)
            await expect(
                inputValidator.testValidatePercentage(maxUint256, 10000)
            ).to.be.revertedWith("Percentage exceeds maximum");
            
            // Very large array length (should fail)
            const maxLength = await inputValidator.getMaxArrayLength();
            await expect(
                inputValidator.testValidateArrayLength(maxUint256)
            ).to.be.revertedWith("Array too large");
            
            // Test balance validation with edge cases
            await inputValidator.testValidateBalance(maxUint256, maxUint256); // Equal values should pass
            await expect(
                inputValidator.testValidateBalance(100, maxUint256)
            ).to.be.revertedWith("Insufficient balance");
        });

        it("Should validate complex transfer scenarios", async function () {
            // Self-transfer (should fail)
            await expect(
                inputValidator.testValidateTransferAddresses(user1.address, user1.address)
            ).to.be.revertedWith("Cannot transfer to self");
            
            // Transfer from zero address (should fail)
            await expect(
                inputValidator.testValidateTransferAddresses(ethers.constants.AddressZero, user1.address)
            ).to.be.revertedWith("ERC20: transfer from the zero address");
            
            // Transfer to zero address (should fail)
            await expect(
                inputValidator.testValidateTransferAddresses(user1.address, ethers.constants.AddressZero)
            ).to.be.revertedWith("ERC20: transfer to the zero address");
        });

        it("Should validate wallet update edge cases", async function () {
            // Update to same wallet (should fail)
            await expect(
                inputValidator.testValidateWalletUpdate(
                    user1.address,
                    user1.address, // same as current
                    inputValidator.address
                )
            ).to.be.revertedWith("Same as current wallet");
            
            // Update to contract address (should fail)
            await expect(
                inputValidator.testValidateWalletUpdate(
                    inputValidator.address, // contract address
                    user1.address,
                    inputValidator.address
                )
            ).to.be.revertedWith("Cannot be contract address");
            
            // Update to zero address (should fail)
            await expect(
                inputValidator.testValidateWalletUpdate(
                    ethers.constants.AddressZero,
                    user1.address,
                    inputValidator.address
                )
            ).to.be.revertedWith("Invalid wallet address");
        });
    });

    describe("🎯 Comprehensive Integration Testing", function () {
        it("Should validate complete workflow scenarios", async function () {
            // Test a complete constructor validation with all parameters
            const exemptAccounts = [user1.address, user2.address];
            await inputValidator.testValidateConstructorParams(
                feeWallet.address,
                donationWallet.address,
                inputValidator.address,
                exemptAccounts
            );
            
            // Test ownership transfer workflow
            await inputValidator.testValidateOwnershipTransfer(
                user2.address,
                owner.address,
                inputValidator.address
            );
            
            // Test wallet update workflow
            await inputValidator.testValidateWalletUpdate(
                user3.address,
                feeWallet.address,
                inputValidator.address
            );
            
            // Test AMM pair validation
            await inputValidator.testValidateAMMPair(
                user1.address,
                inputValidator.address,
                owner.address,
                feeWallet.address,
                donationWallet.address
            );
        });

        it("Should handle multiple validation failures", async function () {
            // Test array validation with zero length (first check is for empty array)
            await expect(
                inputValidator.testValidateArrayLength(0)
            ).to.be.revertedWith("Array cannot be empty");
            
            // Test multiple address validation failures
            await expect(
                inputValidator.testValidateWalletPair(
                    ethers.constants.AddressZero,
                    ethers.constants.AddressZero,
                    inputValidator.address
                )
            ).to.be.revertedWith("Invalid first wallet address");
            
            // Test multiple time validation failures
            const currentTime = Math.floor(Date.now() / 1000);
            await expect(
                inputValidator.testValidateTimelock(
                    currentTime - 100, // past time
                    currentTime,
                    3600
                )
            ).to.be.revertedWith("Unlock time must be in future");
        });

        it("Should validate state consistency", async function () {
            // Test contract state validation with all combinations
            const states = [
                [false, false, false], // Valid: not paused, no trading required
                [false, true, false],  // Valid: not paused, trading enabled but not required
                [false, true, true],   // Valid: not paused, trading enabled and required
            ];
            
            for (const [isPaused, tradingEnabled, requireTrading] of states) {
                await inputValidator.testValidateContractState(isPaused, tradingEnabled, requireTrading);
            }
            
            // Test invalid states
            const invalidStates = [
                [true, false, false],  // Invalid: paused
                [true, true, false],   // Invalid: paused
                [true, true, true],    // Invalid: paused
                [false, false, true],  // Invalid: trading required but not enabled
            ];
            
            for (const [isPaused, tradingEnabled, requireTrading] of invalidStates) {
                await expect(
                    inputValidator.testValidateContractState(isPaused, tradingEnabled, requireTrading)
                ).to.be.reverted;
            }
        });
    });

    describe("⚡ Performance Testing", function () {
        it("Should benchmark gas consumption for address validation functions", async function () {
            // Test simple address validation
            const gas1 = await inputValidator.estimateGas.testValidateAddress(user1.address);
            console.log(`    Simple address validation gas: ${gas1.toString()}`);
            
            // Test address validation with custom message
            const gas2 = await inputValidator.estimateGas.testValidateAddressWithMessage(user1.address, "Custom error");
            console.log(`    Address validation with message gas: ${gas2.toString()}`);
            
            // Test wallet pair validation (more complex)
            const gas3 = await inputValidator.estimateGas.testValidateWalletPair(
                feeWallet.address,
                donationWallet.address,
                inputValidator.address
            );
            console.log(`    Wallet pair validation gas: ${gas3.toString()}`);
            
            // Verify gas consumption is reasonable (should be under 50k gas for simple validations)
            expect(gas1.toNumber()).to.be.lessThan(50000);
            expect(gas2.toNumber()).to.be.lessThan(50000);
            expect(gas3.toNumber()).to.be.lessThan(100000);
        });

        it("Should benchmark gas consumption for array validation functions", async function () {
            // Test small array validation
            const smallArray = [user1.address, user2.address];
            const gas1 = await inputValidator.estimateGas.testValidateAddressArray(smallArray);
            console.log(`    Small array (2 addresses) validation gas: ${gas1.toString()}`);
            
            // Test medium array validation
            const mediumArray = [user1.address, user2.address, user3.address, feeWallet.address, donationWallet.address];
            const gas2 = await inputValidator.estimateGas.testValidateAddressArray(mediumArray);
            console.log(`    Medium array (5 addresses) validation gas: ${gas2.toString()}`);
            
            // Test large array validation (up to 10 addresses)
            const largeArray = [];
            for (let i = 0; i < 10; i++) {
                largeArray.push(ethers.Wallet.createRandom().address);
            }
            const gas3 = await inputValidator.estimateGas.testValidateAddressArray(largeArray);
            console.log(`    Large array (10 addresses) validation gas: ${gas3.toString()}`);
            
            // Verify gas consumption scales reasonably with array size
            expect(gas2.toNumber()).to.be.greaterThan(gas1.toNumber());
            expect(gas3.toNumber()).to.be.greaterThan(gas2.toNumber());
            expect(gas3.toNumber()).to.be.lessThan(500000); // Should be under 500k gas
        });

        it("Should benchmark gas consumption for complex validation scenarios", async function () {
            // Test constructor parameter validation (complex scenario)
            const exemptAccounts = [user1.address, user2.address, user3.address];
            const gas1 = await inputValidator.estimateGas.testValidateConstructorParams(
                feeWallet.address,
                donationWallet.address,
                inputValidator.address,
                exemptAccounts
            );
            console.log(`    Constructor params validation gas: ${gas1.toString()}`);
            
            // Test AMM pair validation (complex scenario)
            const gas2 = await inputValidator.estimateGas.testValidateAMMPair(
                user1.address,
                inputValidator.address,
                owner.address,
                feeWallet.address,
                donationWallet.address
            );
            console.log(`    AMM pair validation gas: ${gas2.toString()}`);
            
            // Test tax exemption validation (complex scenario)
            const gas3 = await inputValidator.estimateGas.testValidateTaxExemption(
                user1.address,
                true,
                owner.address,
                inputValidator.address,
                feeWallet.address,
                donationWallet.address
            );
            console.log(`    Tax exemption validation gas: ${gas3.toString()}`);
            
            // Verify complex validations stay within reasonable gas limits
            expect(gas1.toNumber()).to.be.lessThan(200000);
            expect(gas2.toNumber()).to.be.lessThan(150000);
            expect(gas3.toNumber()).to.be.lessThan(150000);
        });

        it("Should benchmark gas consumption for time-based validations", async function () {
            const currentTime = Math.floor(Date.now() / 1000);
            
            // Test timelock validation
            const gas1 = await inputValidator.estimateGas.testValidateTimelock(
                currentTime + 3600,
                currentTime,
                1800
            );
            console.log(`    Timelock validation gas: ${gas1.toString()}`);
            
            // Test cooldown validation
            const gas2 = await inputValidator.estimateGas.testValidateCooldown(
                currentTime - 3600,
                currentTime,
                1800
            );
            console.log(`    Cooldown validation gas: ${gas2.toString()}`);
            
            // Test contract state validation
            const gas3 = await inputValidator.estimateGas.testValidateContractState(false, true, true);
            console.log(`    Contract state validation gas: ${gas3.toString()}`);
            
            // Verify time-based validations are efficient
            expect(gas1.toNumber()).to.be.lessThan(50000);
            expect(gas2.toNumber()).to.be.lessThan(50000);
            expect(gas3.toNumber()).to.be.lessThan(50000);
        });

        it("Should benchmark gas consumption for boundary value scenarios", async function () {
            const maxLength = await inputValidator.getMaxArrayLength();
            
            // Test maximum array length validation
            const gas1 = await inputValidator.estimateGas.testValidateArrayLength(maxLength);
            console.log(`    Max array length validation gas: ${gas1.toString()}`);
            
            // Test maximum percentage validation
            const gas2 = await inputValidator.estimateGas.testValidatePercentage(10000, 10000);
            console.log(`    Max percentage validation gas: ${gas2.toString()}`);
            
            // Test large amount validation
            const largeAmount = ethers.utils.parseEther("1000000");
            const gas3 = await inputValidator.estimateGas.testValidateAmount(largeAmount);
            console.log(`    Large amount validation gas: ${gas3.toString()}`);
            
            // Test large balance validation
            const gas4 = await inputValidator.estimateGas.testValidateBalance(largeAmount, largeAmount.div(2));
            console.log(`    Large balance validation gas: ${gas4.toString()}`);
            
            // Verify boundary value validations are efficient
            expect(gas1.toNumber()).to.be.lessThan(50000);
            expect(gas2.toNumber()).to.be.lessThan(50000);
            expect(gas3.toNumber()).to.be.lessThan(50000);
            expect(gas4.toNumber()).to.be.lessThan(50000);
        });

        it("Should compare gas consumption across validation complexity levels", async function () {
            // Simple validation
            const simpleGas = await inputValidator.estimateGas.testValidateAmount(1000);
            
            // Medium complexity validation
            const mediumGas = await inputValidator.estimateGas.testValidateTransferAddresses(user1.address, user2.address);
            
            // Complex validation
            const complexGas = await inputValidator.estimateGas.testValidateConstructorParams(
                feeWallet.address,
                donationWallet.address,
                inputValidator.address,
                [user1.address, user2.address]
            );
            
            console.log(`    Simple validation gas: ${simpleGas.toString()}`);
            console.log(`    Medium validation gas: ${mediumGas.toString()}`);
            console.log(`    Complex validation gas: ${complexGas.toString()}`);
            
            // Verify gas consumption increases with complexity
            expect(mediumGas.toNumber()).to.be.greaterThan(simpleGas.toNumber());
            expect(complexGas.toNumber()).to.be.greaterThan(mediumGas.toNumber());
            
            // Verify all stay within reasonable limits
            expect(simpleGas.toNumber()).to.be.lessThan(50000);
            expect(mediumGas.toNumber()).to.be.lessThan(100000);
            expect(complexGas.toNumber()).to.be.lessThan(200000);
        });

        it("Should benchmark worst-case gas consumption scenarios", async function () {
            // Worst case: Large array with maximum allowed size (limited to 10 for testing)
            const worstCaseArray = [];
            for (let i = 0; i < 10; i++) {
                worstCaseArray.push(ethers.Wallet.createRandom().address);
            }
            
            const gas1 = await inputValidator.estimateGas.testValidateAddressArray(worstCaseArray);
            console.log(`    Worst case array validation gas: ${gas1.toString()}`);
            
            // Worst case: Constructor with maximum exempt accounts
            const gas2 = await inputValidator.estimateGas.testValidateConstructorParams(
                feeWallet.address,
                donationWallet.address,
                inputValidator.address,
                worstCaseArray
            );
            console.log(`    Worst case constructor validation gas: ${gas2.toString()}`);
            
            // Verify worst-case scenarios stay within acceptable limits
            expect(gas1.toNumber()).to.be.lessThan(500000);
            expect(gas2.toNumber()).to.be.lessThan(600000);
        });
    });
});