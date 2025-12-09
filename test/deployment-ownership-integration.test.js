const { expect } = require("chai");
const { ethers } = require("hardhat");
const { deploySylvanTokenWithLibraries } = require("./helpers/deploy-libraries");

/**
 * @title Deployment with Ownership Transfer Integration Tests
 * @dev Integration tests for full deployment with ownership transfer
 * Requirements: 1.5, 2.1, 2.4, 2.5, 3.1, 3.2, 3.3
 */

// NOTE: These tests are skipped because they rely on old SylvanToken API
// (isTradingEnabled, enableTrading, pauseContract, etc.) which no longer exists.
// The new SylvanToken has different functionality.
describe.skip("🚀 Deployment with Ownership Transfer Integration", function () {
    let token;
    let deployer, owner, hardwareWallet, multisigWallet, user1, user2;
    let feeWallet, donationWallet;

    beforeEach(async function () {
        [deployer, owner, hardwareWallet, multisigWallet, user1, user2, feeWallet, donationWallet] = await ethers.getSigners();
    });

    describe("✅ Full Deployment with Ownership Transfer", function () {
        it("Should deploy and transfer ownership in single flow", async function () {
            // Deploy contract (deployer is initial owner)
            token = await deploySylvanTokenWithLibraries(
                feeWallet.address,
                donationWallet.address,
                []
            );

            // Verify deployer is initial owner
            expect(await token.owner()).to.equal(deployer.address);

            // Transfer ownership to secure wallet
            await token.transferOwnership(owner.address);

            // Verify new owner
            expect(await token.owner()).to.equal(owner.address);

            // Verify contract is functional
            expect(await token.name()).to.equal("Sylvan Token");
            expect(await token.symbol()).to.equal("SYL");
            expect(await token.totalSupply()).to.be.gt(0);
        });

        it("Should maintain contract state after ownership transfer", async function () {
            // Deploy contract
            token = await deploySylvanTokenWithLibraries(
                feeWallet.address,
                donationWallet.address,
                [user1.address]
            );

            // Record initial state
            const initialSupply = await token.totalSupply();
            const initialExemptStatus = await token.isExempt(user1.address);

            // Transfer ownership
            await token.transferOwnership(owner.address);

            // Verify state unchanged
            expect(await token.totalSupply()).to.equal(initialSupply);
            expect(await token.isExempt(user1.address)).to.equal(initialExemptStatus);
        });
    });

    describe("🔐 Admin Functions with New Owner", function () {
        beforeEach(async function () {
            // Deploy and transfer ownership
            token = await deploySylvanTokenWithLibraries(
                feeWallet.address,
                donationWallet.address,
                []
            );
            await token.transferOwnership(owner.address);
        });

        it("Should allow new owner to manage exemptions", async function () {
            // New owner adds exemption
            await expect(
                token.connect(owner).addExemptWallet(user1.address)
            ).to.not.be.reverted;

            expect(await token.isExempt(user1.address)).to.be.true;

            // New owner removes exemption
            await expect(
                token.connect(owner).removeExemptWallet(user1.address)
            ).to.not.be.reverted;

            expect(await token.isExempt(user1.address)).to.be.false;
        });

        it("Should allow new owner to configure admin wallets", async function () {
            const allocation = ethers.utils.parseEther("10000000");

            await expect(
                token.connect(owner).configureAdminWallet(user1.address, allocation)
            ).to.not.be.reverted;

            expect(await token.isAdminConfigured(user1.address)).to.be.true;
        });

        it("Should allow new owner to enable trading", async function () {
            expect(await token.isTradingEnabled()).to.be.false;

            await expect(
                token.connect(owner).enableTrading()
            ).to.not.be.reverted;

            expect(await token.isTradingEnabled()).to.be.true;
        });

        it("Should allow new owner to pause/unpause contract", async function () {
            // Pause
            await expect(
                token.connect(owner).pauseContract()
            ).to.not.be.reverted;

            expect(await token.isContractPaused()).to.be.true;

            // Unpause
            await expect(
                token.connect(owner).unpauseContract()
            ).to.not.be.reverted;

            expect(await token.isContractPaused()).to.be.false;
        });

        it("Should allow new owner to manage batch exemptions", async function () {
            const wallets = [user1.address, user2.address];

            // Add batch
            await expect(
                token.connect(owner).addExemptWalletsBatch(wallets)
            ).to.not.be.reverted;

            for (const wallet of wallets) {
                expect(await token.isExempt(wallet)).to.be.true;
            }

            // Remove batch
            await expect(
                token.connect(owner).removeExemptWalletsBatch(wallets)
            ).to.not.be.reverted;

            for (const wallet of wallets) {
                expect(await token.isExempt(wallet)).to.be.false;
            }
        });
    });

    describe("❌ Old Owner Cannot Call Admin Functions", function () {
        beforeEach(async function () {
            // Deploy and transfer ownership
            token = await deploySylvanTokenWithLibraries(
                feeWallet.address,
                donationWallet.address,
                []
            );
            await token.transferOwnership(owner.address);
        });

        it("Should prevent old owner from managing exemptions", async function () {
            await expect(
                token.connect(deployer).addExemptWallet(user1.address)
            ).to.be.revertedWith("Ownable: caller is not the owner");

            await expect(
                token.connect(deployer).removeExemptWallet(feeWallet.address)
            ).to.be.revertedWith("Ownable: caller is not the owner");
        });

        it("Should prevent old owner from configuring admin wallets", async function () {
            const allocation = ethers.utils.parseEther("10000000");

            await expect(
                token.connect(deployer).configureAdminWallet(user1.address, allocation)
            ).to.be.revertedWith("Ownable: caller is not the owner");
        });

        it("Should prevent old owner from enabling trading", async function () {
            await expect(
                token.connect(deployer).enableTrading()
            ).to.be.revertedWith("Ownable: caller is not the owner");
        });

        it("Should prevent old owner from pausing contract", async function () {
            await expect(
                token.connect(deployer).pauseContract()
            ).to.be.revertedWith("Ownable: caller is not the owner");
        });

        it("Should prevent old owner from batch operations", async function () {
            const wallets = [user1.address, user2.address];

            await expect(
                token.connect(deployer).addExemptWalletsBatch(wallets)
            ).to.be.revertedWith("Ownable: caller is not the owner");

            await expect(
                token.connect(deployer).removeExemptWalletsBatch(wallets)
            ).to.be.revertedWith("Ownable: caller is not the owner");
        });
    });

    describe("🔐 Hardware Wallet as Owner", function () {
        it("Should work with hardware wallet as owner", async function () {
            // Deploy contract
            token = await deploySylvanTokenWithLibraries(
                feeWallet.address,
                donationWallet.address,
                []
            );

            // Transfer to hardware wallet (simulated)
            await token.transferOwnership(hardwareWallet.address);

            // Verify hardware wallet is owner
            expect(await token.owner()).to.equal(hardwareWallet.address);

            // Hardware wallet can execute admin functions
            await expect(
                token.connect(hardwareWallet).addExemptWallet(user1.address)
            ).to.not.be.reverted;

            expect(await token.isExempt(user1.address)).to.be.true;
        });

        it("Should allow hardware wallet to transfer ownership", async function () {
            // Deploy and transfer to hardware wallet
            token = await deploySylvanTokenWithLibraries(
                feeWallet.address,
                donationWallet.address,
                []
            );
            await token.transferOwnership(hardwareWallet.address);

            // Hardware wallet transfers to another address
            await expect(
                token.connect(hardwareWallet).transferOwnership(owner.address)
            ).to.not.be.reverted;

            expect(await token.owner()).to.equal(owner.address);
        });
    });

    describe("🔐 Multisig Wallet as Owner", function () {
        it("Should work with multisig wallet as owner", async function () {
            // Deploy contract
            token = await deploySylvanTokenWithLibraries(
                feeWallet.address,
                donationWallet.address,
                []
            );

            // Transfer to multisig wallet (simulated)
            await token.transferOwnership(multisigWallet.address);

            // Verify multisig wallet is owner
            expect(await token.owner()).to.equal(multisigWallet.address);

            // Multisig wallet can execute admin functions
            await expect(
                token.connect(multisigWallet).addExemptWallet(user1.address)
            ).to.not.be.reverted;

            expect(await token.isExempt(user1.address)).to.be.true;
        });

        it("Should allow multisig wallet to manage vesting", async function () {
            // Deploy and transfer to multisig
            token = await deploySylvanTokenWithLibraries(
                feeWallet.address,
                donationWallet.address,
                []
            );
            await token.transferOwnership(multisigWallet.address);

            // Multisig configures admin wallet
            const allocation = ethers.utils.parseEther("10000000");
            await expect(
                token.connect(multisigWallet).configureAdminWallet(user1.address, allocation)
            ).to.not.be.reverted;

            expect(await token.isAdminConfigured(user1.address)).to.be.true;

            // Verify vesting schedule created
            expect(await token.hasVestingSchedule(user1.address)).to.be.true;
        });
    });

    describe("🔄 Complete Deployment Workflow", function () {
        it("Should execute complete deployment and configuration workflow", async function () {
            // 1. Deploy with deployer
            token = await deploySylvanTokenWithLibraries(
                feeWallet.address,
                donationWallet.address,
                [user1.address]
            );

            expect(await token.owner()).to.equal(deployer.address);

            // 2. Configure initial settings as deployer
            const allocation = ethers.utils.parseEther("10000000");
            await token.configureAdminWallet(user2.address, allocation);

            // 3. Transfer ownership to secure wallet
            await token.transferOwnership(owner.address);
            expect(await token.owner()).to.equal(owner.address);

            // 4. New owner continues configuration
            await token.connect(owner).enableTrading();

            // 5. Verify all configurations maintained
            expect(await token.isExempt(user1.address)).to.be.true;
            expect(await token.isAdminConfigured(user2.address)).to.be.true;
            expect(await token.isTradingEnabled()).to.be.true;

            // 6. Verify old owner cannot modify
            await expect(
                token.connect(deployer).addExemptWallet(user2.address)
            ).to.be.revertedWith("Ownable: caller is not the owner");
        });

        it("Should handle immediate post-deployment ownership transfer", async function () {
            // Deploy
            token = await deploySylvanTokenWithLibraries(
                feeWallet.address,
                donationWallet.address,
                []
            );

            // Immediate transfer (no configuration by deployer)
            await token.transferOwnership(owner.address);

            // New owner performs all configuration
            await token.connect(owner).addExemptWallet(user1.address);
            
            const allocation = ethers.utils.parseEther("10000000");
            await token.connect(owner).configureAdminWallet(user2.address, allocation);
            await token.connect(owner).enableTrading();

            // Verify everything works
            expect(await token.isExempt(user1.address)).to.be.true;
            expect(await token.isAdminConfigured(user2.address)).to.be.true;
            expect(await token.isTradingEnabled()).to.be.true;
        });
    });

    describe("🔒 Security Validations", function () {
        it("Should prevent unauthorized ownership changes", async function () {
            // Deploy
            token = await deploySylvanTokenWithLibraries(
                feeWallet.address,
                donationWallet.address,
                []
            );

            // Transfer to owner
            await token.transferOwnership(owner.address);

            // Deployer cannot transfer again
            await expect(
                token.connect(deployer).transferOwnership(user1.address)
            ).to.be.revertedWith("Ownable: caller is not the owner");

            // Random user cannot transfer
            await expect(
                token.connect(user1).transferOwnership(user2.address)
            ).to.be.revertedWith("Ownable: caller is not the owner");

            // Only current owner can transfer
            await expect(
                token.connect(owner).transferOwnership(hardwareWallet.address)
            ).to.not.be.reverted;

            expect(await token.owner()).to.equal(hardwareWallet.address);
        });

        it("Should maintain access control after multiple transfers", async function () {
            // Deploy
            token = await deploySylvanTokenWithLibraries(
                feeWallet.address,
                donationWallet.address,
                []
            );

            // First transfer
            await token.transferOwnership(owner.address);
            
            // Second transfer
            await token.connect(owner).transferOwnership(hardwareWallet.address);
            
            // Third transfer
            await token.connect(hardwareWallet).transferOwnership(multisigWallet.address);

            // Only current owner (multisig) can call admin functions
            await expect(
                token.connect(multisigWallet).addExemptWallet(user1.address)
            ).to.not.be.reverted;

            // All previous owners cannot
            await expect(
                token.connect(deployer).addExemptWallet(user2.address)
            ).to.be.revertedWith("Ownable: caller is not the owner");

            await expect(
                token.connect(owner).addExemptWallet(user2.address)
            ).to.be.revertedWith("Ownable: caller is not the owner");

            await expect(
                token.connect(hardwareWallet).addExemptWallet(user2.address)
            ).to.be.revertedWith("Ownable: caller is not the owner");
        });
    });
});
