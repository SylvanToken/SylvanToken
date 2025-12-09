const { expect } = require("chai");
const { ethers } = require("hardhat");
const deploymentScript = require("../scripts/deployment/deploy-multisig-pause.js");

/**
 * @title Multi-Sig Pause Deployment Script Tests
 * @dev Unit tests for deploy-multisig-pause.js deployment script
 * Requirements: 5.1, 5.2, 5.3, 5.4, 5.5
 */

describe("Multi-Sig Pause Deployment Script", function () {
    let originalEnv;
    
    beforeEach(function() {
        // Save original environment
        originalEnv = { ...process.env };
    });
    
    afterEach(function() {
        // Restore original environment
        process.env = originalEnv;
    });

    /**
     * Test: Load and validate configuration
     * Requirements: 5.1, 5.2, 5.3, 5.4
     */
    describe("Configuration Loading and Validation", function () {
        it("Should load multi-sig configuration from deployment config", function () {
            const config = deploymentScript.loadMultiSigConfig();
            
            expect(config).to.have.property('authorizedSigners');
            expect(config).to.have.property('quorumThreshold');
            expect(config).to.have.property('timelockDuration');
            expect(config).to.have.property('maxPauseDuration');
            expect(config).to.have.property('proposalLifetime');
            expect(config).to.have.property('proposalCooldown');
            expect(config).to.have.property('bounds');
            
            expect(config.authorizedSigners).to.be.an('array');
            expect(config.authorizedSigners.length).to.be.at.least(2);
        });

        it("Should validate minimum valid configuration (2 signers, quorum 2)", function () {
            const config = {
                authorizedSigners: [
                    '0x1234567890123456789012345678901234567890',
                    '0x2234567890123456789012345678901234567890'
                ],
                quorumThreshold: 2,
                timelockDuration: 21600, // 6 hours (minimum)
                maxPauseDuration: 604800, // 7 days (minimum)
                proposalLifetime: 604800,
                proposalCooldown: 3600,
                bounds: {
                    minSigners: 2,
                    maxSigners: 10,
                    minTimelock: 21600,
                    maxTimelock: 172800,
                    minMaxPauseDuration: 604800,
                    maxMaxPauseDuration: 2592000,
                    minProposalLifetime: 604800,
                    maxProposalLifetime: 2592000,
                    minProposalCooldown: 3600,
                    maxProposalCooldown: 86400
                }
            };
            
            expect(() => deploymentScript.validateMultiSigConfig(config)).to.not.throw();
        });

        it("Should validate typical production configuration (5 signers, quorum 3)", function () {
            const signers = [];
            for (let i = 0; i < 5; i++) {
                signers.push(`0x${(i + 1).toString().padStart(40, '0')}`);
            }
            
            const config = {
                authorizedSigners: signers,
                quorumThreshold: 3,
                timelockDuration: 86400, // 24 hours
                maxPauseDuration: 1209600, // 14 days
                proposalLifetime: 1209600,
                proposalCooldown: 21600,
                bounds: {
                    minSigners: 2,
                    maxSigners: 10,
                    minTimelock: 21600,
                    maxTimelock: 172800,
                    minMaxPauseDuration: 604800,
                    maxMaxPauseDuration: 2592000,
                    minProposalLifetime: 604800,
                    maxProposalLifetime: 2592000,
                    minProposalCooldown: 3600,
                    maxProposalCooldown: 86400
                }
            };
            
            expect(() => deploymentScript.validateMultiSigConfig(config)).to.not.throw();
        });
    });

    /**
     * Test: Parameter validation
     * Requirements: 5.5
     */
    describe("Parameter Validation", function () {
        const baseBounds = {
            minSigners: 2,
            maxSigners: 10,
            minTimelock: 21600,
            maxTimelock: 172800,
            minMaxPauseDuration: 604800,
            maxMaxPauseDuration: 2592000,
            minProposalLifetime: 604800,
            maxProposalLifetime: 2592000,
            minProposalCooldown: 3600,
            maxProposalCooldown: 86400
        };

        it("Should reject configuration with zero signers", function () {
            const config = {
                authorizedSigners: [],
                quorumThreshold: 2,
                timelockDuration: 86400,
                maxPauseDuration: 1209600,
                proposalLifetime: 1209600,
                proposalCooldown: 21600,
                bounds: baseBounds
            };
            
            expect(() => deploymentScript.validateMultiSigConfig(config)).to.throw('No authorized signers configured');
        });

        it("Should reject configuration with only 1 signer", function () {
            const config = {
                authorizedSigners: ['0x1234567890123456789012345678901234567890'],
                quorumThreshold: 1,
                timelockDuration: 86400,
                maxPauseDuration: 1209600,
                proposalLifetime: 1209600,
                proposalCooldown: 21600,
                bounds: baseBounds
            };
            
            expect(() => deploymentScript.validateMultiSigConfig(config)).to.throw('Insufficient signers');
        });

        it("Should reject quorum threshold less than 2", function () {
            const config = {
                authorizedSigners: [
                    '0x1234567890123456789012345678901234567890',
                    '0x2234567890123456789012345678901234567890'
                ],
                quorumThreshold: 1,
                timelockDuration: 86400,
                maxPauseDuration: 1209600,
                proposalLifetime: 1209600,
                proposalCooldown: 21600,
                bounds: baseBounds
            };
            
            expect(() => deploymentScript.validateMultiSigConfig(config)).to.throw('Quorum threshold too low');
        });

        it("Should reject timelock duration below minimum (6 hours)", function () {
            const config = {
                authorizedSigners: [
                    '0x1234567890123456789012345678901234567890',
                    '0x2234567890123456789012345678901234567890'
                ],
                quorumThreshold: 2,
                timelockDuration: 21599, // 1 second below minimum
                maxPauseDuration: 1209600,
                proposalLifetime: 1209600,
                proposalCooldown: 21600,
                bounds: baseBounds
            };
            
            expect(() => deploymentScript.validateMultiSigConfig(config)).to.throw('Timelock duration too short');
        });

        it("Should reject max pause duration below minimum (7 days)", function () {
            const config = {
                authorizedSigners: [
                    '0x1234567890123456789012345678901234567890',
                    '0x2234567890123456789012345678901234567890'
                ],
                quorumThreshold: 2,
                timelockDuration: 86400,
                maxPauseDuration: 604799, // 1 second below minimum
                proposalLifetime: 1209600,
                proposalCooldown: 21600,
                bounds: baseBounds
            };
            
            expect(() => deploymentScript.validateMultiSigConfig(config)).to.throw('Max pause duration too short');
        });

        it("Should reject zero address as signer", function () {
            const config = {
                authorizedSigners: [
                    '0x0000000000000000000000000000000000000000',
                    '0x2234567890123456789012345678901234567890'
                ],
                quorumThreshold: 2,
                timelockDuration: 86400,
                maxPauseDuration: 1209600,
                proposalLifetime: 1209600,
                proposalCooldown: 21600,
                bounds: baseBounds
            };
            
            expect(() => deploymentScript.validateMultiSigConfig(config)).to.throw('Cannot use zero address as signer');
        });

        it("Should reject duplicate signers", function () {
            const config = {
                authorizedSigners: [
                    '0x1234567890123456789012345678901234567890',
                    '0x1234567890123456789012345678901234567890'
                ],
                quorumThreshold: 2,
                timelockDuration: 86400,
                maxPauseDuration: 1209600,
                proposalLifetime: 1209600,
                proposalCooldown: 21600,
                bounds: baseBounds
            };
            
            expect(() => deploymentScript.validateMultiSigConfig(config)).to.throw('Duplicate signer addresses detected');
        });

        it("Should reject quorum exceeding signer count", function () {
            const config = {
                authorizedSigners: [
                    '0x1234567890123456789012345678901234567890',
                    '0x2234567890123456789012345678901234567890'
                ],
                quorumThreshold: 3, // More than signer count
                timelockDuration: 86400,
                maxPauseDuration: 1209600,
                proposalLifetime: 1209600,
                proposalCooldown: 21600,
                bounds: baseBounds
            };
            
            expect(() => deploymentScript.validateMultiSigConfig(config)).to.throw('Quorum threshold exceeds signer count');
        });
    });

    /**
     * Test: Initial signer setup validation
     * Requirements: 5.1, 5.2
     */
    describe("Initial Signer Setup Validation", function () {
        it("Should validate configuration with 3 authorized signers", function () {
            const config = {
                authorizedSigners: [
                    '0x1234567890123456789012345678901234567890',
                    '0x2234567890123456789012345678901234567890',
                    '0x3234567890123456789012345678901234567890'
                ],
                quorumThreshold: 2,
                timelockDuration: 86400,
                maxPauseDuration: 1209600,
                proposalLifetime: 1209600,
                proposalCooldown: 21600,
                bounds: {
                    minSigners: 2,
                    maxSigners: 10,
                    minTimelock: 21600,
                    maxTimelock: 172800,
                    minMaxPauseDuration: 604800,
                    maxMaxPauseDuration: 2592000,
                    minProposalLifetime: 604800,
                    maxProposalLifetime: 2592000,
                    minProposalCooldown: 3600,
                    maxProposalCooldown: 86400
                }
            };
            
            expect(() => deploymentScript.validateMultiSigConfig(config)).to.not.throw();
            expect(config.authorizedSigners.length).to.equal(3);
        });

        it("Should validate configuration with maximum signers (10)", function () {
            const signers = [];
            for (let i = 0; i < 10; i++) {
                signers.push(`0x${(i + 1).toString().padStart(40, '0')}`);
            }
            
            const config = {
                authorizedSigners: signers,
                quorumThreshold: 6,
                timelockDuration: 86400,
                maxPauseDuration: 1209600,
                proposalLifetime: 1209600,
                proposalCooldown: 21600,
                bounds: {
                    minSigners: 2,
                    maxSigners: 10,
                    minTimelock: 21600,
                    maxTimelock: 172800,
                    minMaxPauseDuration: 604800,
                    maxMaxPauseDuration: 2592000,
                    minProposalLifetime: 604800,
                    maxProposalLifetime: 2592000,
                    minProposalCooldown: 3600,
                    maxProposalCooldown: 86400
                }
            };
            
            expect(() => deploymentScript.validateMultiSigConfig(config)).to.not.throw();
            expect(config.authorizedSigners.length).to.equal(10);
        });

        it("Should reject configuration with more than maximum signers", function () {
            const signers = [];
            for (let i = 0; i < 11; i++) {
                signers.push(`0x${(i + 1).toString().padStart(40, '0')}`);
            }
            
            const config = {
                authorizedSigners: signers,
                quorumThreshold: 6,
                timelockDuration: 86400,
                maxPauseDuration: 1209600,
                proposalLifetime: 1209600,
                proposalCooldown: 21600,
                bounds: {
                    minSigners: 2,
                    maxSigners: 10,
                    minTimelock: 21600,
                    maxTimelock: 172800,
                    minMaxPauseDuration: 604800,
                    maxMaxPauseDuration: 2592000,
                    minProposalLifetime: 604800,
                    maxProposalLifetime: 2592000,
                    minProposalCooldown: 3600,
                    maxProposalCooldown: 86400
                }
            };
            
            expect(() => deploymentScript.validateMultiSigConfig(config)).to.throw('Too many signers');
        });
    });

    /**
     * Test: Configuration bounds validation
     * Requirements: 5.3, 5.4
     */
    describe("Configuration Bounds Validation", function () {
        const baseBounds = {
            minSigners: 2,
            maxSigners: 10,
            minTimelock: 21600,
            maxTimelock: 172800,
            minMaxPauseDuration: 604800,
            maxMaxPauseDuration: 2592000,
            minProposalLifetime: 604800,
            maxProposalLifetime: 2592000,
            minProposalCooldown: 3600,
            maxProposalCooldown: 86400
        };

        it("Should validate timelock at minimum bound (6 hours)", function () {
            const config = {
                authorizedSigners: [
                    '0x1234567890123456789012345678901234567890',
                    '0x2234567890123456789012345678901234567890'
                ],
                quorumThreshold: 2,
                timelockDuration: 21600, // Exactly 6 hours
                maxPauseDuration: 1209600,
                proposalLifetime: 1209600,
                proposalCooldown: 21600,
                bounds: baseBounds
            };
            
            expect(() => deploymentScript.validateMultiSigConfig(config)).to.not.throw();
        });

        it("Should validate timelock at maximum bound (48 hours)", function () {
            const config = {
                authorizedSigners: [
                    '0x1234567890123456789012345678901234567890',
                    '0x2234567890123456789012345678901234567890'
                ],
                quorumThreshold: 2,
                timelockDuration: 172800, // Exactly 48 hours
                maxPauseDuration: 1209600,
                proposalLifetime: 1209600,
                proposalCooldown: 21600,
                bounds: baseBounds
            };
            
            expect(() => deploymentScript.validateMultiSigConfig(config)).to.not.throw();
        });

        it("Should reject timelock above maximum bound", function () {
            const config = {
                authorizedSigners: [
                    '0x1234567890123456789012345678901234567890',
                    '0x2234567890123456789012345678901234567890'
                ],
                quorumThreshold: 2,
                timelockDuration: 172801, // 1 second above maximum
                maxPauseDuration: 1209600,
                proposalLifetime: 1209600,
                proposalCooldown: 21600,
                bounds: baseBounds
            };
            
            expect(() => deploymentScript.validateMultiSigConfig(config)).to.throw('Timelock duration too long');
        });

        it("Should validate max pause duration at minimum bound (7 days)", function () {
            const config = {
                authorizedSigners: [
                    '0x1234567890123456789012345678901234567890',
                    '0x2234567890123456789012345678901234567890'
                ],
                quorumThreshold: 2,
                timelockDuration: 86400,
                maxPauseDuration: 604800, // Exactly 7 days
                proposalLifetime: 1209600,
                proposalCooldown: 21600,
                bounds: baseBounds
            };
            
            expect(() => deploymentScript.validateMultiSigConfig(config)).to.not.throw();
        });

        it("Should validate max pause duration at maximum bound (30 days)", function () {
            const config = {
                authorizedSigners: [
                    '0x1234567890123456789012345678901234567890',
                    '0x2234567890123456789012345678901234567890'
                ],
                quorumThreshold: 2,
                timelockDuration: 86400,
                maxPauseDuration: 2592000, // Exactly 30 days
                proposalLifetime: 1209600,
                proposalCooldown: 21600,
                bounds: baseBounds
            };
            
            expect(() => deploymentScript.validateMultiSigConfig(config)).to.not.throw();
        });

        it("Should reject max pause duration above maximum bound", function () {
            const config = {
                authorizedSigners: [
                    '0x1234567890123456789012345678901234567890',
                    '0x2234567890123456789012345678901234567890'
                ],
                quorumThreshold: 2,
                timelockDuration: 86400,
                maxPauseDuration: 2592001, // 1 second above maximum
                proposalLifetime: 1209600,
                proposalCooldown: 21600,
                bounds: baseBounds
            };
            
            expect(() => deploymentScript.validateMultiSigConfig(config)).to.throw('Max pause duration too long');
        });

        it("Should validate proposal lifetime bounds", function () {
            const config = {
                authorizedSigners: [
                    '0x1234567890123456789012345678901234567890',
                    '0x2234567890123456789012345678901234567890'
                ],
                quorumThreshold: 2,
                timelockDuration: 86400,
                maxPauseDuration: 1209600,
                proposalLifetime: 604799, // Below minimum
                proposalCooldown: 21600,
                bounds: baseBounds
            };
            
            expect(() => deploymentScript.validateMultiSigConfig(config)).to.throw('Proposal lifetime too short');
        });

        it("Should validate proposal cooldown bounds", function () {
            const config = {
                authorizedSigners: [
                    '0x1234567890123456789012345678901234567890',
                    '0x2234567890123456789012345678901234567890'
                ],
                quorumThreshold: 2,
                timelockDuration: 86400,
                maxPauseDuration: 1209600,
                proposalLifetime: 1209600,
                proposalCooldown: 3599, // Below minimum
                bounds: baseBounds
            };
            
            expect(() => deploymentScript.validateMultiSigConfig(config)).to.throw('Proposal cooldown too short');
        });
    });
});
