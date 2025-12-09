const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("🏦 WalletManager Library Complete Coverage", function () {
    let walletManager;
    let owner, user1, user2, user3, feeWallet, donationWallet, newFeeWallet, newDonationWallet;
    let BURN_WALLET;

    beforeEach(async function () {
        this.timeout(30000);
        [owner, user1, user2, user3, feeWallet, donationWallet, newFeeWallet, newDonationWallet] = await ethers.getSigners();

        // Deploy WalletManager library first
        const WalletManagerLib = await ethers.getContractFactory("contracts/libraries/WalletManager.sol:WalletManager");
        const walletManagerLib = await WalletManagerLib.deploy();

        // Deploy WalletManager test contract with library linking
        const WalletManagerTestContract = await ethers.getContractFactory("contracts/mocks/WalletManagerTestContract.sol:WalletManagerTestContract", {
            libraries: {
                WalletManager: walletManagerLib.address,
            },
        });
        walletManager = await WalletManagerTestContract.deploy(owner.address);
        
        // Get burn wallet constant
        BURN_WALLET = await walletManager.getBurnWallet();
        
        // Initialize wallets
        await walletManager.initializeWallets(
            feeWallet.address,
            donationWallet.address,
            [user3.address]
        );
    });

    describe("💼 Wallet Initialization", function () {
        it("Should initialize wallets correctly", async function () {
            const [fee, donation] = await walletManager.getWallets();
            expect(fee).to.equal(feeWallet.address);
            expect(donation).to.equal(donationWallet.address);
        });

        it("Should set initial tax exemptions correctly", async function () {
            expect(await walletManager.isExemptFromTax(owner.address)).to.be.true;
            expect(await walletManager.isExemptFromTax(walletManager.address)).to.be.true;
            expect(await walletManager.isExemptFromTax(feeWallet.address)).to.be.true;
            expect(await walletManager.isExemptFromTax(donationWallet.address)).to.be.true;
            expect(await walletManager.isExemptFromTax(BURN_WALLET)).to.be.true;
            expect(await walletManager.isExemptFromTax(user3.address)).to.be.true;
            expect(await walletManager.isExemptFromTax(user1.address)).to.be.false;
        });
    });

    describe("💼 Wallet Configuration", function () {
        it("Should update fee wallet", async function () {
            await walletManager.updateFeeWallet(newFeeWallet.address);
            expect(await walletManager.getFeeWallet()).to.equal(newFeeWallet.address);
        });

        it("Should update donation wallet", async function () {
            await walletManager.updateDonationWallet(newDonationWallet.address);
            expect(await walletManager.getDonationWallet()).to.equal(newDonationWallet.address);
        });

        it("Should prevent setting zero address as fee wallet", async function () {
            await expect(
                walletManager.updateFeeWallet(ethers.constants.AddressZero)
            ).to.be.revertedWith("Invalid wallet address");
        });

        it("Should prevent setting contract address as fee wallet", async function () {
            await expect(
                walletManager.updateFeeWallet(walletManager.address)
            ).to.be.revertedWith("Cannot be contract address");
        });

        it("Should prevent setting same address as current fee wallet", async function () {
            await expect(
                walletManager.updateFeeWallet(feeWallet.address)
            ).to.be.revertedWith("Same as current fee wallet");
        });

        it("Should prevent setting burn wallet as fee wallet", async function () {
            await expect(
                walletManager.updateFeeWallet(BURN_WALLET)
            ).to.be.revertedWith("Cannot be burn wallet");
        });
    });

    describe("🔄 Wallet Validation", function () {
        it("Should validate wallet addresses are different", async function () {
            await walletManager.updateFeeWallet(newFeeWallet.address);
            await expect(
                walletManager.updateDonationWallet(newFeeWallet.address)
            ).to.be.revertedWith("Cannot be same as fee wallet");
        });

        it("Should validate single wallet with validateSingleWallet", async function () {
            await walletManager.validateSingleWallet(user1.address);
            await expect(
                walletManager.validateSingleWallet(ethers.constants.AddressZero)
            ).to.be.revertedWith("Invalid wallet address");
        });

        it("Should validate AMM pair wallet", async function () {
            await walletManager.validateAMMPairWallet(user1.address);
            await expect(
                walletManager.validateAMMPairWallet(owner.address)
            ).to.be.revertedWith("Cannot set owner as AMM pair");
        });
    });

    describe("🔄 Batch Wallet Updates", function () {
        it("Should update both wallets simultaneously", async function () {
            await walletManager.updateBothWallets(newFeeWallet.address, newDonationWallet.address);
            expect(await walletManager.getFeeWallet()).to.equal(newFeeWallet.address);
            expect(await walletManager.getDonationWallet()).to.equal(newDonationWallet.address);
        });

        it("Should handle tax exemptions correctly in batch update", async function () {
            await walletManager.updateBothWallets(newFeeWallet.address, newDonationWallet.address);
            expect(await walletManager.isExemptFromTax(newFeeWallet.address)).to.be.true;
            expect(await walletManager.isExemptFromTax(newDonationWallet.address)).to.be.true;
            expect(await walletManager.isExemptFromTax(feeWallet.address)).to.be.false;
            expect(await walletManager.isExemptFromTax(donationWallet.address)).to.be.false;
        });
    });

    describe("🔐 Tax Exemption Management", function () {
        it("Should update tax exemption status", async function () {
            expect(await walletManager.isExemptFromTax(user1.address)).to.be.false;
            await walletManager.updateTaxExemption(user1.address, true);
            expect(await walletManager.isExemptFromTax(user1.address)).to.be.true;
            await walletManager.updateTaxExemption(user1.address, false);
            expect(await walletManager.isExemptFromTax(user1.address)).to.be.false;
        });

        it("Should prevent removing exemption from contract", async function () {
            await expect(
                walletManager.updateTaxExemption(walletManager.address, false)
            ).to.be.revertedWith("Contract must remain tax exempt");
        });

        it("Should prevent removing exemption from owner", async function () {
            await expect(
                walletManager.updateTaxExemption(owner.address, false)
            ).to.be.revertedWith("Owner must remain tax exempt");
        });

        it("Should prevent removing exemption from fee wallet", async function () {
            await expect(
                walletManager.updateTaxExemption(feeWallet.address, false)
            ).to.be.revertedWith("Fee wallet must remain tax exempt");
        });

        it("Should prevent setting zero address exemption", async function () {
            await expect(
                walletManager.updateTaxExemption(ethers.constants.AddressZero, true)
            ).to.be.revertedWith("Invalid account address");
        });
    });

    describe("📊 Wallet Information Retrieval", function () {
        it("Should get correct wallet addresses", async function () {
            const retrievedFeeWallet = await walletManager.getFeeWallet();
            const retrievedDonationWallet = await walletManager.getDonationWallet();
            expect(retrievedFeeWallet).to.equal(feeWallet.address);
            expect(retrievedDonationWallet).to.equal(donationWallet.address);
        });

        it("Should get both wallets with getWallets", async function () {
            const [fee, donation] = await walletManager.getWallets();
            expect(fee).to.equal(feeWallet.address);
            expect(donation).to.equal(donationWallet.address);
        });

        it("Should return correct burn wallet constant", async function () {
            const burnWallet = await walletManager.getBurnWallet();
            expect(burnWallet).to.equal("0x000000000000000000000000000000000000dEaD");
        });
    });
});
