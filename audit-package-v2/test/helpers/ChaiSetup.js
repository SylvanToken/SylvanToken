const chai = require("chai");
const { expect } = chai;

// Set up chai for hardhat testing
try {
    const chaiAsPromised = require("chai-as-promised");
    chai.use(chaiAsPromised);
} catch (e) {
    console.log("chai-as-promised not available");
}

// Try to set up hardhat chai matchers
try {
    const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
    // Use hardhat's built-in chai matchers
} catch (e) {
    console.log("hardhat network helpers not available");
}

// Export configured chai
module.exports = { expect, chai };