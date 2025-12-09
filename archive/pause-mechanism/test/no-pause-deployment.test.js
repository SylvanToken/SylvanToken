const { expect } = require("chai");
const { ethers } = require("hardhat");

/**
 * @title No Pause Mechanism Deployment Test
 * @dev Verify that pause mechanism has been completely removed
 */

describe("SylvanToken - No Pause Mechanism", function () {
    let token;
    let owner, feeWallet, donationWallet, user1;

    beforeEach(async function () {
        [owner, feeWallet, donationWallet, user1] = await ethers.getSigners();
        
        const SylvanToken = await ethers.getContractFactory("SylvanToken");
        
        const initialExemptAccounts = [
            feeWallet.address,
            donationWallet.address
        ];
        
        token = await SylvanToken.deploy(
            feeWallet.address,
            donationWallet.address,
            initialExemptAccounts
        );
        
        await token.deployed();
    });

    it("Should deploy successfully without pause mechanism", async function () {
        expect(token.address).to.not.equal(ethers.constants.AddressZero);
        console.log("✅ Token deployed to:", token.address);
    });

    it("Should not have pause-related functions", async function () {
        // Verify pause functions don't exist
        expect(token.createPauseProposal).to.be.undefined;
        expect(token.createUnpauseProposal).to.be.undefined;
        expect(token.approvePauseProposal).to.be.undefined;
        expect(token.executeProposal).to.be.undefined;
        expect(token.isContractPaused).to.be.undefined;
        expect(token.getPauseInfo).to.be.undefined;
        console.log("✅ Pause functions successfully removed");
    });

    it("Should allow transfers without pause checks", async function () {
        // Transfer tokens from owner to user1
        const amount = ethers.utils.parseEther("1000");
        await token.transfer(user1.address, amount);
        
        const balance = await token.balanceOf(user1.address);
        expect(balance).to.be.gt(0); // Should have received tokens (minus fees)
        console.log("✅ Transfers work without pause mechanism");
    });

    it("Should have correct total supply", async function () {
        const totalSupply = await token.totalSupply();
        const expectedSupply = ethers.utils.parseEther("1000000000"); // 1 billion
        expect(totalSupply).to.equal(expectedSupply);
        console.log("✅ Total supply correct: 1,000,000,000 SYL");
    });

    it("Should have fee system working", async function () {
        // Owner is fee-exempt, so transfer from owner to user1 won't have fees
        // But transfer from user1 to another address will have fees
        const amount = ethers.utils.parseEther("1000");
        
        // First transfer from owner to user1 (no fee - owner is exempt)
        await token.transfer(user1.address, amount);
        const user1Balance = await token.balanceOf(user1.address);
        
        // Now transfer from user1 to another address (should have fee)
        const [, , , , user2] = await ethers.getSigners();
        await token.connect(user1).transfer(user2.address, ethers.utils.parseEther("100"));
        
        const user2Balance = await token.balanceOf(user2.address);
        
        // User2 should receive exactly 99 tokens (100 - 1% fee)
        expect(user2Balance).to.equal(ethers.utils.parseEther("99"));
        console.log("✅ Fee system working correctly - 1% fee applied");
    });
});
