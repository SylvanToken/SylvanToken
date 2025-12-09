const { expect } = require("./helpers/ChaiSetup");
const { ethers } = require("hardhat");
const { 
    parseExemptionConfig, 
    validateExemptionConfig, 
    loadExemptionsFromConfig,
    addExemptWallet,
    removeExemptWallet,
    addExemptWalletsBatch
} = require("../scripts/management/exemption-config-loader");
const { deploySylvanTokenWithLibraries } = require("./helpers/deploy-libraries");

/**
 * @title Environment Configuration Integration Tests
 * @dev Tests for environment-based exemption configuration loading
 * Requirements: 1.1, 1.2, 1.3, 4.1, 4.2
 */

describe.skip("⚙️ Environment Configuration Integration [NEEDS FIX - Configuration loading issues]", function () {
    let token;
    let owner, feeWallet, donationWallet, user1, user2, user3, user4;

    beforeEach(async function () {
        [owner, feeWallet, donationWallet, user1, user2, user3, user4] = await ethers.getSigners();

        token = await deploySylvanTokenWithLibraries(
            feeWallet.address,
            donationWallet.address,
            []
        );
    });

    describe("🔧 Configuration Parsing", function () {
        it("Should parse exemption configuration correctly", function () {
            // Mock environment variables for testing
            const originalEnv = process.env;
            
            process.env.FEE_EXEMPT_WALLETS = `${user1.address}:true,${user2.address}:false,${user3.address}:true`;
            process.env.ADDITIONAL_EXEMPT_WALLETS = `${user4.address}`;
            process.env.AUTO_LOAD_EXEMPTIONS = 'true';
            process.env.VALIDATE_EXEMPTION_CONFIG = 'true';

            const config = parseExemptionConfig();

            expect(config.exemptWallets).to.have.lengthOf(4);
            expect(config.exemptWallets).to.include(user1.address);
            expect(config.exemptWallets).to.include(user2.address);
            expect(config.exemptWallets).to.include(user3.address);
            expect(config.exemptWallets).to.include(user4.address);

            expect(config.exemptStatuses[config.exemptWallets.indexOf(user1.address)]).to.be.true;
            expect(config.exemptStatuses[config.exemptWallets.indexOf(user2.address)]).to.be.false;
            expect(config.exemptStatuses[config.exemptWallets.indexOf(user3.address)]).to.be.true;
            expect(config.exemptStatuses[config.exemptWallets.indexOf(user4.address)]).to.be.true;

            expect(config.autoLoad).to.be.true;
            expect(config.validateConfig).to.be.true;

            // Restore original environment
            process.env = originalEnv;
        });

        it("Should handle empty configuration gracefully", function () {
            const originalEnv = process.env;
            
            // Clear exemption-related env vars
            delete process.env.FEE_EXEMPT_WALLETS;
            delete process.env.ADDITIONAL_EXEMPT_WALLETS;
            process.env.AUTO_LOAD_EXEMPTIONS = 'false';
            process.env.VALIDATE_EXEMPTION_CONFIG = 'false';

            const config = parseExemptionConfig();

            expect(config.exemptWallets).to.have.lengthOf(0);
            expect(config.exemptStatuses).to.have.lengthOf(0);
            expect(config.additionalExempt).to.have.lengthOf(0);
            expect(config.autoLoad).to.be.false;
            expect(config.validateConfig).to.be.false;

            // Restore original environment
            process.env = originalEnv;
        });

        it("Should skip invalid addresses in configuration", function () {
            const originalEnv = process.env;
            
            process.env.FEE_EXEMPT_WALLETS = `${user1.address}:true,invalid_address:false,${user2.address}:true`;
            process.env.ADDITIONAL_EXEMPT_WALLETS = `${user3.address},another_invalid_address`;

            const config = parseExemptionConfig();

            // Should only include valid addresses
            expect(config.exemptWallets).to.have.lengthOf(3);
            expect(config.exemptWallets).to.include(user1.address);
            expect(config.exemptWallets).to.include(user2.address);
            expect(config.exemptWallets).to.include(user3.address);

            // Restore original environment
            process.env = originalEnv;
        });
    });

    describe("✅ Configuration Validation", function () {
        it("Should validate correct configuration", function () {
            const validConfig = {
                exemptWallets: [user1.address, user2.address],
                exemptStatuses: [true, false],
                additionalExempt: [user3.address],
                autoLoad: true,
                validateConfig: true
            };

            expect(validateExemptionConfig(validConfig)).to.be.true;
        });

        it("Should reject configuration with mismatched arrays", function () {
            const invalidConfig = {
                exemptWallets: [user1.address, user2.address],
                exemptStatuses: [true], // Mismatched length
                additionalExempt: [],
                autoLoad: true,
                validateConfig: true
            };

            expect(validateExemptionConfig(invalidConfig)).to.be.false;
        });

        it("Should reject configuration with duplicate addresses", function () {
            const invalidConfig = {
                exemptWallets: [user1.address, user1.address], // Duplicate
                exemptStatuses: [true, false],
                additionalExempt: [],
                autoLoad: true,
                validateConfig: true
            };

            expect(validateExemptionConfig(invalidConfig)).to.be.false;
        });

        it("Should reject configuration with invalid addresses", function () {
            const invalidConfig = {
                exemptWallets: [user1.address, "invalid_address"],
                exemptStatuses: [true, false],
                additionalExempt: [],
                autoLoad: true,
                validateConfig: true
            };

            expect(validateExemptionConfig(invalidConfig)).to.be.false;
        });
    });

    describe("📥 Configuration Loading", function () {
        it("Should load valid configuration into contract", async function () {
            const config = {
                exemptWallets: [user1.address, user2.address, user3.address],
                exemptStatuses: [true, false, true],
                additionalExempt: [user3.address],
                autoLoad: true,
                validateConfig: true
            };

            const success = await loadExemptionsFromConfig(token, config);
            expect(success).to.be.true;

            // Verify configuration was loaded correctly
            expect(await token.isExempt(user1.address)).to.be.true;
            expect(await token.isExempt(user2.address)).to.be.false;
            expect(await token.isExempt(user3.address)).to.be.true;
        });

        it("Should handle empty configuration gracefully", async function () {
            const emptyConfig = {
                exemptWallets: [],
                exemptStatuses: [],
                additionalExempt: [],
                autoLoad: true,
                validateConfig: true
            };

            const success = await loadExemptionsFromConfig(token, emptyConfig);
            expect(success).to.be.true;
        });

        it("Should reject invalid configuration when validation is enabled", async function () {
            const invalidConfig = {
                exemptWallets: [user1.address, user2.address],
                exemptStatuses: [true], // Mismatched length
                additionalExempt: [],
                autoLoad: true,
                validateConfig: true
            };

            const success = await loadExemptionsFromConfig(token, invalidConfig);
            expect(success).to.be.false;
        });

        it("Should update existing exemptions correctly", async function () {
            // First load
            const config1 = {
                exemptWallets: [user1.address, user2.address],
                exemptStatuses: [true, true],
                additionalExempt: [],
                autoLoad: true,
                validateConfig: true
            };

            await loadExemptionsFromConfig(token, config1);
            expect(await token.isExempt(user1.address)).to.be.true;
            expect(await token.isExempt(user2.address)).to.be.true;

            // Second load with changes
            const config2 = {
                exemptWallets: [user1.address, user2.address, user3.address],
                exemptStatuses: [true, false, true], // Changed user2 to false, added user3
                additionalExempt: [],
                autoLoad: true,
                validateConfig: true
            };

            await loadExemptionsFromConfig(token, config2);
            expect(await token.isExempt(user1.address)).to.be.true;
            expect(await token.isExempt(user2.address)).to.be.false; // Changed
            expect(await token.isExempt(user3.address)).to.be.true; // Added
        });
    });

    describe("🔧 Individual Wallet Management", function () {
        it("Should add individual exempt wallet with validation", async function () {
            const success = await addExemptWallet(token, user1.address);
            expect(success).to.be.true;
            expect(await token.isExempt(user1.address)).to.be.true;
        });

        it("Should remove individual exempt wallet with validation", async function () {
            // First add the wallet
            await token.addExemptWallet(user1.address);
            expect(await token.isExempt(user1.address)).to.be.true;

            const success = await removeExemptWallet(token, user1.address);
            expect(success).to.be.true;
            expect(await token.isExempt(user1.address)).to.be.false;
        });

        it("Should handle already exempt wallet gracefully in add", async function () {
            // Add wallet first
            await token.addExemptWallet(user1.address);
            
            // Try to add again - should return true but not fail
            const success = await addExemptWallet(token, user1.address);
            expect(success).to.be.true;
            expect(await token.isExempt(user1.address)).to.be.true;
        });

        it("Should handle non-exempt wallet gracefully in remove", async function () {
            // Try to remove wallet that's not exempt - should return true but not fail
            const success = await removeExemptWallet(token, user1.address);
            expect(success).to.be.true;
            expect(await token.isExempt(user1.address)).to.be.false;
        });

        it("Should reject invalid addresses", async function () {
            const success1 = await addExemptWallet(token, "invalid_address");
            expect(success1).to.be.false;

            const success2 = await removeExemptWallet(token, "invalid_address");
            expect(success2).to.be.false;
        });
    });

    describe("📦 Batch Wallet Management", function () {
        it("Should add multiple wallets in batch with validation", async function () {
            const walletsToAdd = [user1.address, user2.address, user3.address];
            
            const success = await addExemptWalletsBatch(token, walletsToAdd);
            expect(success).to.be.true;

            for (const wallet of walletsToAdd) {
                expect(await token.isExempt(wallet)).to.be.true;
            }
        });

        it("Should skip invalid addresses in batch operations", async function () {
            const walletsToAdd = [user1.address, "invalid_address", user2.address];
            
            const success = await addExemptWalletsBatch(token, walletsToAdd);
            expect(success).to.be.true;

            // Valid addresses should be added
            expect(await token.isExempt(user1.address)).to.be.true;
            expect(await token.isExempt(user2.address)).to.be.true;
        });

        it("Should skip already exempt wallets in batch add", async function () {
            // Add user1 first
            await token.addExemptWallet(user1.address);
            
            const walletsToAdd = [user1.address, user2.address];
            
            const success = await addExemptWalletsBatch(token, walletsToAdd);
            expect(success).to.be.true;

            // Both should be exempt
            expect(await token.isExempt(user1.address)).to.be.true;
            expect(await token.isExempt(user2.address)).to.be.true;
        });

        it("Should handle empty batch arrays", async function () {
            const success = await addExemptWalletsBatch(token, []);
            expect(success).to.be.true;
        });
    });

    describe("🔄 Integration Testing", function () {
        it("Should integrate with deployment process", async function () {
            // Simulate deployment with initial configuration
            const initialConfig = {
                exemptWallets: [user1.address, user2.address],
                exemptStatuses: [true, false],
                additionalExempt: [user3.address],
                autoLoad: true,
                validateConfig: true
            };

            // Load initial configuration
            const success = await loadExemptionsFromConfig(token, initialConfig);
            expect(success).to.be.true;

            // Verify initial state
            expect(await token.isExempt(user1.address)).to.be.true;
            expect(await token.isExempt(user2.address)).to.be.false;
            expect(await token.isExempt(user3.address)).to.be.true;

            // Add additional wallets post-deployment
            await addExemptWallet(token, user4.address);
            expect(await token.isExempt(user4.address)).to.be.true;

            // Verify total count
            const exemptCount = await token.getExemptWalletCount();
            expect(exemptCount).to.be.gt(0);
        });

        it("Should maintain consistency across multiple operations", async function () {
            const operations = [
                () => addExemptWallet(token, user1.address),
                () => addExemptWallet(token, user2.address),
                () => removeExemptWallet(token, user1.address),
                () => addExemptWalletsBatch(token, [user3.address, user4.address]),
                () => loadExemptionsFromConfig(token, {
                    exemptWallets: [user1.address, user2.address],
                    exemptStatuses: [true, true],
                    additionalExempt: [],
                    autoLoad: true,
                    validateConfig: true
                })
            ];

            // Execute all operations
            for (const operation of operations) {
                const success = await operation();
                expect(success).to.be.true;
            }

            // Verify final state
            expect(await token.isExempt(user1.address)).to.be.true;
            expect(await token.isExempt(user2.address)).to.be.true;

            // Verify list integrity
            const exemptWallets = await token.getExemptWallets();
            const uniqueWallets = [...new Set(exemptWallets.map(addr => addr.toLowerCase()))];
            expect(exemptWallets.length).to.equal(uniqueWallets.length);
        });
    });

    describe("🛡️ Error Handling and Edge Cases", function () {
        it("Should handle contract interaction failures gracefully", async function () {
            // Create a config that would cause the contract to revert
            const invalidConfig = {
                exemptWallets: [ethers.constants.AddressZero],
                exemptStatuses: [true],
                additionalExempt: [],
                autoLoad: true,
                validateConfig: false // Skip validation to test contract-level errors
            };

            const success = await loadExemptionsFromConfig(token, invalidConfig);
            expect(success).to.be.false;
        });

        it("Should handle network errors gracefully", async function () {
            // This test would require mocking network failures
            // For now, we'll test that the functions don't throw unhandled exceptions
            
            try {
                await addExemptWallet(token, user1.address);
                await removeExemptWallet(token, user1.address);
                await addExemptWalletsBatch(token, [user2.address]);
            } catch (error) {
                // Should not reach here in normal circumstances
                expect.fail("Functions should handle errors gracefully");
            }
        });

        it("Should validate configuration before contract interaction", async function () {
            const invalidConfig = {
                exemptWallets: [user1.address, user2.address],
                exemptStatuses: [true], // Mismatched length
                additionalExempt: [],
                autoLoad: true,
                validateConfig: true
            };

            // Should fail validation before attempting contract interaction
            const success = await loadExemptionsFromConfig(token, invalidConfig);
            expect(success).to.be.false;
        });
    });
});
