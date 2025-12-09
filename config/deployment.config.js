/**
 * @title Deployment Configuration for SylvanToken
 * @dev Centralized deployment parameters and wallet addresses
 */
module.exports = {
    // 🎯 WALLET ADDRESSES - DETAILED CONFIGURATION WITH FEE EXEMPTION MANAGEMENT
    wallets: {
        // 🏛️ CORE SYSTEM WALLETS (Minimal Fee Exemptions - Only Technical Requirements)
        system: {
            sylvanToken: {
                address: "0xf949f50B3C32bD4cDa7D2192ff8f51dd9db4A469",
                name: "Sylvan Token Wallet",
                description: "Main project wallet for token operations and liquidity",
                feeExempt: false,
                exemptReason: "NO EXEMPTION - Standard fees apply to all transfers",
                canChangeExemption: false,
                role: "system",
                note: "Fees apply to maintain fair tokenomics"
            },
            founder: {
                address: "0x465b54282e4885f61df7eB7CcDc2493DB35C9501",
                name: "Founder Wallet",
                description: "Project founder's main wallet for strategic operations",
                feeExempt: false,
                exemptReason: "NO EXEMPTION - Standard fees apply to all transfers",
                canChangeExemption: false,
                role: "founder",
                note: "Fees apply to maintain fair tokenomics"
            },
            fee: {
                address: "0x46a4AF3bdAD67d3855Af42Ba0BBe9248b54F7915",
                name: "Fee Collection Wallet",
                description: "Receives 50% of all transaction fees",
                feeExempt: true,
                exemptReason: "TECHNICAL REQUIREMENT - Must be exempt to avoid circular fee collection",
                canChangeExemption: false,
                role: "system",
                note: "Only exempt for technical reasons (prevents infinite loop)"
            },
            donation: {
                address: "0xa697645Fdfa5d9399eD18A6575256F81343D4e17",
                name: "Donation Wallet",
                description: "Receives 25% of transaction fees for charitable purposes",
                feeExempt: true,
                exemptReason: "TECHNICAL REQUIREMENT - Must be exempt to avoid circular fee collection",
                canChangeExemption: false,
                role: "system",
                note: "Only exempt for technical reasons (prevents infinite loop)"
            },
            locked: {
                address: "0x687A2c7E494c3818c20AD2856d453514970d6aac",
                name: "Locked Token Wallet",
                description: "Holds locked tokens with 34-month vesting schedule",
                feeExempt: false,
                exemptReason: "NO EXEMPTION - Standard fees apply to all transfers",
                canChangeExemption: false,
                role: "vesting",
                note: "Fees apply even during vesting period"
            },
            dead: {
                address: "0x000000000000000000000000000000000000dEaD",
                name: "Burn Address",
                description: "Dead wallet for token burning (receives 25% of fees)",
                feeExempt: true,
                exemptReason: "TECHNICAL REQUIREMENT - Must be exempt to avoid circular fee collection",
                canChangeExemption: false,
                role: "system",
                note: "Only exempt for technical reasons (prevents infinite loop)"
            }
        },

        // 👥 ADMIN WALLETS (Regular Users - Fee Charged)
        admins: {
            brk: {
                address: "0x1109B6aDB60dB170139f00bA2490fCA0F8BE7A8C",
                name: "BRK User Wallet",
                description: "BRK user wallet with 10M token allocation and lock mechanism (no admin privileges)",
                feeExempt: false,
                exemptReason: "Standard user wallet with fee charges",
                canChangeExemption: false, // Cannot change - permanently fee charged
                role: "user",
                allocation: "10000000", // 10M tokens
                lockStatus: "active",
                adminPrivileges: false,
                authorityLevel: "none"
            },
            erh: {
                address: "0xe64660026a1aaDaea2ac6032b6B59f8714a08E34",
                name: "ERH User Wallet",
                description: "ERH user wallet with 10M token allocation and lock mechanism (no admin privileges)",
                feeExempt: false,
                exemptReason: "Standard user wallet with fee charges",
                canChangeExemption: false, // Cannot change - permanently fee charged
                role: "user",
                allocation: "10000000", // 10M tokens
                lockStatus: "active",
                adminPrivileges: false,
                authorityLevel: "none"
            },
            grk: {
                address: "0xd1cc4222b7b62fb623884371337ae04cf44b93a7",
                name: "GRK User Wallet",
                description: "GRK user wallet with 10M token allocation and lock mechanism (no admin privileges)",
                feeExempt: false,
                exemptReason: "Standard user wallet with fee charges",
                canChangeExemption: false, // Cannot change - permanently fee charged
                role: "user",
                allocation: "10000000", // 10M tokens
                lockStatus: "active",
                adminPrivileges: false,
                authorityLevel: "none"
            },
            cnk: {
                address: "0x106A637D825e562168678b7fd0f75cFf2cF2845B",
                name: "CNK User Wallet",
                description: "CNK user wallet with 10M token allocation and lock mechanism (no admin privileges)",
                feeExempt: false,
                exemptReason: "Standard user wallet with fee charges",
                canChangeExemption: false, // Cannot change - permanently fee charged
                role: "user",
                allocation: "10000000", // 10M tokens
                lockStatus: "active",
                adminPrivileges: false,
                authorityLevel: "none"
            }
        }

        // ❌ NO PARTNERSHIP OR BUSINESS EXEMPTIONS
        // All DEX, exchange, and business wallets are subject to standard 1% fee
        // No special exemptions for any external parties or integrations
    },

    // 📊 TOKEN DISTRIBUTION - 1 BILLION TOKENS
    allocations: {
        total: "1000000000", // 1B total supply
        founder: "160000000", // 160M (16%)
        sylvanToken: "500000000", // 500M (50%)
        locked: "300000000", // 300M (30%)
        admins: {
            brk: "10000000", // 10M (1%)
            erh: "10000000", // 10M (1%)
            grk: "10000000", // 10M (1%)
            cnk: "10000000"  // 10M (1%)
        }
    },

    // 💸 FEE STRUCTURE - 1% UNIVERSAL FEE
    feeStructure: {
        taxRate: 100, // 1% (100 basis points)
        taxDenominator: 10000, // 100% = 10000 basis points
        distribution: {
            feeWallet: 5000, // 50% to fee wallet
            donation: 2500, // 25% to donation
            burn: 2500 // 25% burned
        }
    },

    // 🔒 LOCK PARAMETERS
    lockParameters: {
        // Founder Wallet Lock Settings
        founder: {
            lockPercentage: 8000, // 80% locked
            initialRelease: 2000, // 20% immediate
            monthlyRelease: 500, // 5% monthly
            burnPercentage: 0, // No burn
            cliffDays: 30, // 30 days cliff
            durationMonths: 16 // 16 months total
        },

        // Admin Wallet Lock Settings
        admin: {
            lockPercentage: 8000, // 80% locked
            initialRelease: 2000, // 20% immediate
            monthlyRelease: 500, // 5% monthly
            burnPercentage: 0, // No burn
            cliffDays: 30, // 30 days cliff
            durationMonths: 16 // 16 months total
        },

        // Locked Wallet Settings
        locked: {
            lockPercentage: 10000, // 100% locked
            initialRelease: 0, // No immediate release
            monthlyRelease: 300, // 3% monthly
            burnPercentage: 1000, // 10% burn on release
            cliffDays: 30, // 30 days cliff
            durationMonths: 34 // 34 months total
        }
    },

    // 🚫 FEE EXEMPTION CONFIGURATION - MINIMAL EXEMPTIONS ONLY
    exemptions: {
        // 🔒 TECHNICAL EXEMPTIONS (Only for preventing circular fees)
        // These are the ONLY exemptions - required for technical operation
        technical: [
            {
                address: "0x46a4AF3bdAD67d3855Af42Ba0BBe9248b54F7915",
                name: "Fee Collection Wallet",
                reason: "TECHNICAL REQUIREMENT - Prevents circular fee collection (infinite loop)",
                canChangeExemption: false,
                note: "Must be exempt to avoid fees on fee distribution"
            },
            {
                address: "0xa697645Fdfa5d9399eD18A6575256F81343D4e17",
                name: "Donation Wallet", 
                reason: "TECHNICAL REQUIREMENT - Prevents circular fee collection (infinite loop)",
                canChangeExemption: false,
                note: "Must be exempt to avoid fees on fee distribution"
            },
            {
                address: "0x000000000000000000000000000000000000dEaD",
                name: "Burn Address",
                reason: "TECHNICAL REQUIREMENT - Prevents circular fee collection (infinite loop)",
                canChangeExemption: false,
                note: "Must be exempt to avoid fees on burn operations"
            }
        ],

        // ❌ NO OTHER EXEMPTIONS
        // All other wallets including:
        // - Sylvan Token Wallet: FEES APPLY
        // - Founder Wallet: FEES APPLY
        // - Locked Token Wallet: FEES APPLY
        // - Admin Wallets: FEES APPLY
        // - DEX/Exchange Wallets: FEES APPLY
        // - Partnership Wallets: FEES APPLY
        // - Business Wallets: FEES APPLY
        // - ALL OTHER WALLETS: FEES APPLY

        // 👥 ADMIN WALLETS (Fee Charged - No Exemptions)
        adminWallets: [
            {
                address: "0x1109B6aDB60dB170139f00bA2490fCA0F8BE7A8C",
                name: "BRK User Wallet",
                reason: "Standard user wallet with fee charges",
                feeStatus: "CHARGED",
                adminPrivileges: false,
                canChangeExemption: false,
                priority: "low",
                note: "Standard user - fees apply to all transactions"
            },
            {
                address: "0xe64660026a1aaDaea2ac6032b6B59f8714a08E34",
                name: "ERH User Wallet",
                reason: "Standard user wallet with fee charges",
                feeStatus: "CHARGED",
                adminPrivileges: false,
                canChangeExemption: false,
                priority: "low",
                note: "Standard user - fees apply to all transactions"
            },
            {
                address: "0xd1cc4222b7b62fb623884371337ae04cf44b93a7",
                name: "GRK User Wallet",
                reason: "Standard user wallet with fee charges",
                feeStatus: "CHARGED",
                adminPrivileges: false,
                canChangeExemption: false,
                priority: "low",
                note: "Standard user - fees apply to all transactions"
            },
            {
                address: "0x106A637D825e562168678b7fd0f75cFf2cF2845B",
                name: "CNK User Wallet",
                reason: "Standard user wallet with fee charges",
                feeStatus: "CHARGED",
                adminPrivileges: false,
                canChangeExemption: false,
                priority: "low",
                note: "Standard user - fees apply to all transactions"
            }
        ],

        // ⚙️ EXEMPTION POLICY
        policy: {
            // Strict no-exemption policy
            allowNewExemptions: false, // NO new exemptions allowed
            maxExemptWallets: 3, // Only 3 technical exemptions (fee, donation, burn)
            requireApproval: true, // Owner approval required for any changes
            auditTrail: true, // Keep audit trail of all changes
            
            // Policy statement
            statement: "NO EXEMPTIONS POLICY - Only technical exemptions for fee collection, donation, and burn addresses are allowed. All other wallets including DEX, exchanges, partnerships, and business wallets must pay the standard 1% fee on all transfers.",
            
            // Rationale
            rationale: [
                "Fair tokenomics - everyone pays the same fee",
                "No special treatment for any party",
                "Prevents manipulation and favoritism",
                "Ensures consistent fee collection",
                "Maintains token value through burns",
                "Transparent and predictable fee structure"
            ]
        }
    },

    // 🔐 ROLE SEPARATION CONFIGURATION
    // Separates deployer (who deploys contracts) from owner (who has admin privileges)
    // This enhances security by allowing deployment with a hot wallet while keeping
    // administrative control in a secure cold wallet (hardware wallet or multisig)
    roles: {
        // 🚀 DEPLOYER WALLET CONFIGURATION
        // The deployer wallet pays gas fees for contract deployment
        // Should be a hot wallet with sufficient BNB for gas fees
        // Does NOT need to be highly secured as it has no admin privileges after deployment
        deployer: {
            // Address of the deployer wallet (from environment variable)
            address: process.env.DEPLOYER_ADDRESS || null,
            
            // Human-readable description
            description: "Wallet that deploys contracts and pays gas fees for deployment transactions",
            
            // Balance requirements
            requiresBalance: true, // Must have BNB for gas fees
            minimumBalance: "0.1", // Minimum 0.1 BNB required for deployment
            
            // Security level (can be standard hot wallet)
            securityLevel: "standard",
            
            // Wallet type
            walletType: "standard", // Can be: standard, hardware, multisig
            
            // Role in the system
            role: "deployer",
            
            // Post-deployment privileges
            hasAdminPrivileges: false, // No admin privileges after ownership transfer
            
            // Security notes
            securityNotes: [
                "Can be a standard hot wallet (MetaMask, Trust Wallet, etc.)",
                "Only needs enough BNB for deployment gas fees",
                "Private key security is important but not critical",
                "Will NOT have admin privileges after ownership transfer",
                "Can be reused for multiple deployments"
            ]
        },

        // 👑 OWNER WALLET CONFIGURATION
        // The owner wallet has full administrative control over the contract
        // Should be a highly secure wallet (hardware wallet or multisig)
        // Does NOT need BNB balance (can be cold storage)
        owner: {
            // Address of the owner wallet (from environment variable)
            address: process.env.OWNER_ADDRESS || null,
            
            // Human-readable description
            description: "Wallet with administrative control over contracts (onlyOwner functions)",
            
            // Balance requirements
            requiresBalance: false, // Can be cold wallet with no balance initially
            
            // Security level (must be high security)
            securityLevel: "high",
            
            // Wallet type (should be hardware or multisig for mainnet)
            walletType: process.env.OWNER_WALLET_TYPE || "hardware", // Can be: hardware, multisig, standard
            
            // Role in the system
            role: "owner",
            
            // Administrative privileges
            hasAdminPrivileges: true, // Full admin control
            
            // Ownership transfer settings
            transferOnDeploy: true, // Automatically transfer ownership after deployment
            
            // Security notes
            securityNotes: [
                "MUST be a hardware wallet (Ledger, Trezor) or multisig for mainnet",
                "Can be a standard wallet for testnet/localhost only",
                "Does not need BNB balance initially (can be cold storage)",
                "Has full control over all onlyOwner functions",
                "Private key must be extremely secure",
                "Consider using multisig for additional security"
            ],
            
            // Administrative functions controlled by owner
            controlledFunctions: [
                "setFeeExempt() - Manage fee exemptions",
                "setFeeWallet() - Change fee collection wallet",
                "setDonationWallet() - Change donation wallet",
                "configureLock() - Configure vesting schedules",
                "enableTrading() - Enable/disable trading",
                "transferOwnership() - Transfer ownership to new address",
                "All emergency functions"
            ]
        },

        // ✅ VALIDATION RULES
        // Rules for validating deployer and owner configuration
        validation: {
            // Allow deployer and owner to be the same address
            // Useful for testing on localhost/testnet
            // Should be false for mainnet deployments
            allowSameAddress: true,
            
            // Require different addresses for mainnet
            // Enforces security best practice on production
            requireDifferentForMainnet: true,
            
            // Validate owner address format before transfer
            validateOwnerAddress: true,
            
            // Check deployer balance before deployment
            checkDeployerBalance: true,
            
            // Minimum deployer balance (in BNB)
            minDeployerBalance: "0.1",
            
            // Validate wallet types
            validateWalletTypes: true,
            
            // Network-specific requirements
            networkRequirements: {
                localhost: {
                    allowSameAddress: true,
                    requireHardwareWallet: false,
                    requireMultisig: false,
                    minDeployerBalance: "0.01"
                },
                bscTestnet: {
                    allowSameAddress: true,
                    requireHardwareWallet: false,
                    requireMultisig: false,
                    minDeployerBalance: "0.1"
                },
                bscMainnet: {
                    allowSameAddress: false, // MUST be different on mainnet
                    requireHardwareWallet: true, // Owner should be hardware wallet
                    requireMultisig: false, // Multisig recommended but not required
                    minDeployerBalance: "0.2",
                    warnings: [
                        "Deployer and owner MUST be different addresses",
                        "Owner SHOULD be a hardware wallet or multisig",
                        "Never use the same wallet for both roles on mainnet",
                        "Deployer wallet should have minimal funds after deployment"
                    ]
                }
            }
        },

        // 🔒 SECURITY IMPLICATIONS
        // Documentation of security considerations for role separation
        securityImplications: {
            // Why separate roles?
            rationale: [
                "Deployer wallet is exposed during deployment (hot wallet, online)",
                "Owner wallet can remain in cold storage (hardware wallet, offline)",
                "Compromised deployer wallet cannot affect contract after deployment",
                "Owner wallet only needs to be online for admin operations",
                "Reduces attack surface by limiting hot wallet exposure"
            ],
            
            // Deployment security
            deployment: {
                risk: "medium",
                description: "Deployer wallet is exposed during deployment",
                mitigation: [
                    "Use a dedicated deployment wallet with minimal funds",
                    "Transfer ownership immediately after deployment",
                    "Never reuse deployer wallet as owner on mainnet",
                    "Clear deployer wallet private key from deployment machine after use"
                ]
            },
            
            // Ownership security
            ownership: {
                risk: "critical",
                description: "Owner wallet has full control over contract",
                mitigation: [
                    "Use hardware wallet (Ledger, Trezor) for owner",
                    "Consider multisig wallet for additional security",
                    "Keep owner private key in cold storage",
                    "Test ownership transfer on testnet first",
                    "Verify owner address multiple times before transfer",
                    "Document recovery procedures for owner wallet"
                ]
            },
            
            // Transfer security
            transfer: {
                risk: "critical",
                description: "Ownership transfer is irreversible",
                mitigation: [
                    "Validate owner address format (checksum)",
                    "Verify owner address is not zero address",
                    "Test transfer process on testnet first",
                    "Confirm owner wallet can sign transactions",
                    "Keep audit trail of ownership transfers",
                    "Have emergency recovery plan"
                ]
            },
            
            // Best practices
            bestPractices: [
                "Always use different wallets for deployer and owner on mainnet",
                "Use hardware wallet or multisig for owner on mainnet",
                "Test entire deployment process on testnet first",
                "Verify ownership transfer succeeded before proceeding",
                "Document all wallet addresses and their purposes",
                "Keep backup of owner wallet recovery phrase in secure location",
                "Never share private keys or recovery phrases",
                "Use environment variables for sensitive addresses",
                "Audit all configuration before mainnet deployment"
            ]
        },

        // 📋 CONFIGURATION EXAMPLES
        // Examples for different deployment scenarios
        examples: {
            // Local development
            localhost: {
                deployer: "First account from Hardhat node",
                owner: "Same as deployer (for testing)",
                notes: "Same address is acceptable for local testing"
            },
            
            // Testnet deployment
            testnet: {
                deployer: "Hot wallet with testnet BNB",
                owner: "Can be same as deployer or different test wallet",
                notes: "Good place to test ownership transfer process"
            },
            
            // Mainnet with hardware wallet
            mainnetHardware: {
                deployer: "Hot wallet (MetaMask) with 0.2+ BNB",
                owner: "Hardware wallet (Ledger/Trezor) address",
                notes: "Recommended setup for mainnet deployment"
            },
            
            // Mainnet with multisig
            mainnetMultisig: {
                deployer: "Hot wallet (MetaMask) with 0.2+ BNB",
                owner: "Gnosis Safe multisig address (3-of-5 or similar)",
                notes: "Highest security setup for mainnet deployment"
            }
        }
    },

    // 🌐 NETWORK CONFIGURATION
    networks: {
        localhost: {
            url: "http://127.0.0.1:8545",
            chainId: 31337,
            gasPrice: "auto",
            gas: "auto"
        },
        bscTestnet: {
            url: "https://data-seed-prebsc-1-s1.binance.org:8545/",
            chainId: 97,
            gasPrice: 10000000000, // 10 gwei
            gas: "auto"
        },
        bscMainnet: {
            url: "https://bsc-dataseed.binance.org/",
            chainId: 56,
            gasPrice: 5000000000, // 5 gwei
            gas: "auto"
        }
    },

    // 🔧 DEPLOYMENT SETTINGS
    deployment: {
        confirmations: 3, // Wait for 3 confirmations
        timeout: 120000, // 2 minutes timeout
        gasMultiplier: 1.2, // 20% gas buffer
        maxFeePerGas: "20000000000", // 20 gwei max
        maxPriorityFeePerGas: "2000000000" // 2 gwei priority
    },

    // 🔐 MULTI-SIGNATURE PAUSE MECHANISM CONFIGURATION
    // Configuration for decentralized pause mechanism using multi-signature approval
    // ⚠️ REMOVED: Multi-Sig Pause Mechanism
    // Pause mechanism has been completely removed from the contract
    // Token transfers can never be paused - fully decentralized
    // Addresses security audit finding #3 (Medium): "The owner can lock token transfer"
    multiSigPause: {
        enabled: false,
        removed: true,
        removalDate: "2025-12-03",
        removalReason: "Pause mechanism completely removed for full decentralization",
        // 🏛️ SAFE MULTISIG WALLET
        // Primary multisig wallet for pause mechanism governance
        safeMultisig: {
            address: "0xC5CcDC8F01739CeD02B30b5aD10DD5Fb201436bB",
            name: "Safe Multisig Wallet",
            description: "Gnosis Safe multisig wallet for decentralized pause governance",
            platform: "Gnosis Safe",
            url: "https://app.safe.global/multisig",
            network: "BSC", // Binance Smart Chain
            role: "governance",
            isAuthorizedSigner: true,
            priority: "critical",
            addedDate: "2025-12-03",
            notes: [
                "Primary governance wallet for pause mechanism",
                "Configured via Gnosis Safe platform",
                "Should be included as authorized signer in MultiSigPauseManager",
                "Represents collective decision-making for emergency actions"
            ]
        },

        // 👥 AUTHORIZED SIGNERS
        // List of addresses authorized to vote on pause/unpause proposals
        authorizedSigners: [
            {
                address: "0xC5CcDC8F01739CeD02B30b5aD10DD5Fb201436bB",
                name: "Safe Multisig Wallet",
                type: "multisig",
                description: "Primary Safe multisig wallet for governance",
                priority: "critical",
                canCreateProposals: true,
                canApproveProposals: true,
                addedDate: "2025-12-03"
            },
            {
                address: "0xf949f50B3C32bD4cDa7D2192ff8f51dd9db4A469",
                name: "Deployer Wallet",
                type: "individual",
                description: "Deployer wallet as authorized signer",
                priority: "high",
                canCreateProposals: true,
                canApproveProposals: true,
                addedDate: "2025-12-03"
            },
            {
                address: "0x465b54282e4885f61df7eB7CcDc2493DB35C9501",
                name: "Owner Wallet",
                type: "individual",
                description: "Owner wallet as authorized signer",
                priority: "high",
                canCreateProposals: true,
                canApproveProposals: true,
                addedDate: "2025-12-03"
            },
            {
                address: "0x1109B6aDB60dB170139f00bA2490fCA0F8BE7A8C",
                name: "Admin Wallet (BRK)",
                type: "individual",
                description: "Admin wallet as authorized signer",
                priority: "medium",
                canCreateProposals: true,
                canApproveProposals: true,
                addedDate: "2025-12-03"
            }
        ],

        // ⚙️ MULTI-SIG PARAMETERS
        // Configuration parameters for the multi-signature pause mechanism
        parameters: {
            // Quorum threshold - minimum approvals required
            quorumThreshold: 3, // Minimum 3 approvals required (out of 4 signers - 75% consensus)
            
            // Timelock duration - delay before execution
            timelockDuration: 86400, // 24 hours (in seconds)
            
            // Maximum pause duration - auto-unpause after this time
            maxPauseDuration: 1209600, // 14 days (in seconds)
            
            // Proposal lifetime - proposals expire after this time
            proposalLifetime: 1209600, // 14 days (in seconds)
            
            // Proposal cooldown - time between proposals from same signer
            proposalCooldown: 21600, // 6 hours (in seconds)
            
            // Parameter bounds (from library constants)
            bounds: {
                minSigners: 2,
                maxSigners: 10,
                minTimelock: 21600, // 6 hours
                maxTimelock: 172800, // 48 hours
                minMaxPauseDuration: 604800, // 7 days
                maxMaxPauseDuration: 2592000, // 30 days
                minProposalLifetime: 604800, // 7 days
                maxProposalLifetime: 2592000, // 30 days
                minProposalCooldown: 3600, // 1 hour
                maxProposalCooldown: 86400 // 24 hours
            }
        },

        // 🎯 DEPLOYMENT CONFIGURATION
        // Settings for deploying the multi-sig pause mechanism
        deploymentConfig: {
            // Enable multi-sig pause mechanism
            enabled: true,
            
            // Deploy on networks
            networks: ["bscMainnet", "bscTestnet", "localhost"],
            
            // Initialize with Safe multisig
            initializeWithSafe: true,
            
            // Auto-configure on deployment
            autoConfigureOnDeploy: true,
            
            // Validate configuration before deployment
            validateBeforeDeploy: true,
            
            // Replace old pause mechanism
            replaceOldPauseMechanism: true,
            
            // Deployment notes
            notes: [
                "Multi-sig pause mechanism will replace single-owner pause",
                "Safe multisig will be primary authorized signer",
                "Additional signers can be added after deployment",
                "Quorum and timelock can be adjusted by owner",
                "Emergency bypass requires unanimous approval"
            ]
        },

        // 🔒 SECURITY SETTINGS
        // Security configuration for multi-sig pause mechanism
        security: {
            // Require multiple approvals
            requireMultipleApprovals: true,
            
            // Enforce timelock delay
            enforceTimelock: true,
            
            // Allow emergency bypass with unanimous approval
            allowEmergencyBypass: true,
            
            // Automatic unpause after max duration
            autoUnpauseEnabled: true,
            
            // Proposal expiration enabled
            proposalExpirationEnabled: true,
            
            // Cooldown between proposals
            cooldownEnabled: true,
            
            // Invalidate proposals on quorum change
            invalidateOnQuorumChange: true,
            
            // Remove approvals on signer removal
            removeApprovalsOnSignerRemoval: true,
            
            // Security notes
            notes: [
                "All security features from design document are enabled",
                "Prevents single point of failure for pause mechanism",
                "Timelock provides transparency and reaction time",
                "Auto-unpause prevents indefinite pause",
                "Emergency bypass available with full consensus"
            ]
        },

        // 📊 GOVERNANCE RULES
        // Rules for governance and decision-making
        governance: {
            // Who can create proposals
            proposalCreation: {
                allowedRoles: ["authorizedSigner"],
                requiresAuthorization: true,
                cooldownBetweenProposals: true
            },
            
            // Who can approve proposals
            proposalApproval: {
                allowedRoles: ["authorizedSigner"],
                requiresAuthorization: true,
                preventDuplicateApprovals: true
            },
            
            // Who can execute proposals
            proposalExecution: {
                allowedRoles: ["anyone"], // Anyone can execute after quorum + timelock
                requiresQuorum: true,
                requiresTimelock: true,
                allowEmergencyBypass: true
            },
            
            // Who can manage signers
            signerManagement: {
                allowedRoles: ["owner"],
                requiresOwnerApproval: true,
                canAddSigners: true,
                canRemoveSigners: true,
                canUpdateQuorum: true
            },
            
            // Governance notes
            notes: [
                "Only authorized signers can create and approve proposals",
                "Anyone can execute proposals after requirements are met",
                "Only contract owner can manage authorized signers",
                "Quorum changes invalidate pending proposals for security"
            ]
        },

        // 📝 MANAGEMENT INSTRUCTIONS
        // Instructions for managing the multi-sig pause mechanism
        management: {
            // Adding new signers
            addSigner: {
                step1: "Call addAuthorizedSigner(address) as contract owner",
                step2: "Verify signer was added with getAuthorizedSigners()",
                step3: "Consider updating quorum threshold if needed",
                step4: "Document the new signer in this config file",
                notes: [
                    "Maximum 10 signers allowed",
                    "Cannot add zero address or duplicates",
                    "Emits AuthorizedSignerAdded event"
                ]
            },
            
            // Removing signers
            removeSigner: {
                step1: "Call removeAuthorizedSigner(address) as contract owner",
                step2: "Verify signer was removed with getAuthorizedSigners()",
                step3: "Check that remaining signers meet quorum requirement",
                step4: "Update this config file to reflect removal",
                notes: [
                    "Cannot remove if it would violate quorum requirement",
                    "Removes signer's approvals from pending proposals",
                    "Emits AuthorizedSignerRemoved event"
                ]
            },
            
            // Updating quorum
            updateQuorum: {
                step1: "Call updateQuorumThreshold(uint256) as contract owner",
                step2: "Verify new threshold with getMultiSigConfig()",
                step3: "Note that all pending proposals will be cancelled",
                step4: "Update this config file with new threshold",
                notes: [
                    "Must be between 2 and signer count",
                    "Invalidates all pending proposals",
                    "Emits QuorumThresholdUpdated event"
                ]
            },
            
            // Creating proposals
            createProposal: {
                pause: "Call createPauseProposal() as authorized signer",
                unpause: "Call createUnpauseProposal() as authorized signer",
                notes: [
                    "Must be authorized signer",
                    "Subject to cooldown period",
                    "Returns proposal ID for tracking"
                ]
            },
            
            // Approving proposals
            approveProposal: {
                step1: "Call approvePauseProposal(proposalId) as authorized signer",
                step2: "Check approval count with getProposalStatus(proposalId)",
                step3: "Wait for quorum to be met",
                notes: [
                    "Must be authorized signer",
                    "Cannot approve twice",
                    "Emits ProposalApproved event"
                ]
            },
            
            // Executing proposals
            executeProposal: {
                step1: "Wait for timelock period to elapse (or get unanimous approval)",
                step2: "Call executeProposal(proposalId)",
                step3: "Verify execution with getProposalStatus(proposalId)",
                notes: [
                    "Anyone can execute after requirements met",
                    "Requires quorum + timelock (or unanimous approval)",
                    "Emits ProposalExecuted and ContractPaused/Unpaused events"
                ]
            }
        },

        // 🔍 MONITORING AND ALERTS
        // Monitoring configuration for multi-sig pause mechanism
        monitoring: {
            // Events to monitor
            events: [
                "PauseProposalCreated",
                "UnpauseProposalCreated",
                "ProposalApproved",
                "ProposalExecuted",
                "ProposalCancelled",
                "ContractPausedMultiSig",
                "ContractUnpausedMultiSig",
                "AutoUnpauseTriggered",
                "AuthorizedSignerAdded",
                "AuthorizedSignerRemoved",
                "QuorumThresholdUpdated"
            ],
            
            // Alert conditions
            alerts: {
                onProposalCreated: true,
                onQuorumMet: true,
                onProposalExecuted: true,
                onSignerChange: true,
                onQuorumChange: true,
                onAutoUnpause: true
            },
            
            // Monitoring notes
            notes: [
                "Monitor all pause-related events",
                "Alert on proposal creation and execution",
                "Track signer and quorum changes",
                "Monitor for auto-unpause triggers"
            ]
        },

        // 📚 DOCUMENTATION REFERENCES
        // Links to relevant documentation
        documentation: {
            specification: ".kiro/specs/decentralized-pause-mechanism/",
            requirements: ".kiro/specs/decentralized-pause-mechanism/requirements.md",
            design: ".kiro/specs/decentralized-pause-mechanism/design.md",
            tasks: ".kiro/specs/decentralized-pause-mechanism/tasks.md",
            library: "contracts/libraries/MultiSigPauseManager.sol",
            tests: "test/libraries/MultiSigPauseManagerComplete.test.js",
            auditFinding: "Security Audit Issue #3 (Medium): The owner can lock token transfer"
        }
    },

    // 🔐 ROLE SEPARATION CONFIGURATION
    // Separates deployer (hot wallet) from owner (secure wallet) for enhanced security
    roles: {
        // Deployer wallet - pays gas fees for deployment
        deployer: {
            address: process.env.DEPLOYER_ADDRESS || null,
            description: "Wallet that deploys contracts and pays gas fees",
            requiresBalance: true,
            minimumBalance: "0.15", // BNB - minimum balance required for deployment
            securityLevel: "standard", // Can be a hot wallet
            notes: "Used only for deployment, no admin privileges after ownership transfer"
        },
        
        // Owner wallet - has administrative privileges
        owner: {
            address: process.env.OWNER_ADDRESS || null,
            description: "Wallet with administrative control over contracts",
            requiresBalance: false, // Can be cold wallet with no balance initially
            securityLevel: "high", // Should be hardware wallet or multisig
            walletType: process.env.OWNER_WALLET_TYPE || "hardware", // hardware|multisig|standard
            transferOnDeploy: true, // Auto-transfer ownership after deployment
            notes: "Should be a hardware wallet (Ledger/Trezor) or multisig (Gnosis Safe) for mainnet"
        },
        
        // Validation rules
        validation: {
            allowSameAddress: true, // Allow deployer == owner for testing (testnet/localhost)
            requireDifferentForMainnet: true, // Force separation on mainnet for security
            validateOwnerAddress: true, // Validate owner address before transfer
            enforceSecureWalletOnMainnet: true, // Recommend hardware/multisig on mainnet
            notes: "Mainnet deployments MUST use different addresses for deployer and owner"
        }
    }
};