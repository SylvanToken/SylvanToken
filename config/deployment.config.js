/**
 * @title Deployment Configuration for SylvanToken
 * @dev Centralized deployment parameters and wallet addresses
 */
module.exports = {
    // 🎯 WALLET ADDRESSES - DETAILED CONFIGURATION WITH FEE EXEMPTION MANAGEMENT
    wallets: {
        // 🏛️ CORE SYSTEM WALLETS (Always Fee Exempt)
        system: {
            sylvanToken: {
                address: "0xea8e945F7Cd6faC08dD5e369B55e04E7a8c3e28a",
                name: "Sylvan Token Wallet",
                description: "Main project wallet for token operations and liquidity",
                feeExempt: true,
                exemptReason: "Core system wallet - must remain exempt for proper operation",
                canChangeExemption: false, // Cannot be changed
                role: "system"
            },
            founder: {
                address: "0x1109B6aDB60dB170139f00bA2490fCA0F8BE7A8C",
                name: "Founder Wallet",
                description: "Project founder's main wallet for strategic operations",
                feeExempt: true,
                exemptReason: "Founder wallet - exempt for project development activities",
                canChangeExemption: true, // Can be changed if needed
                role: "founder"
            },
            fee: {
                address: "0x3e13b113482bCbCcfCd0D8517174EFF81b36a740",
                name: "Fee Collection Wallet",
                description: "Receives 50% of all transaction fees",
                feeExempt: true,
                exemptReason: "Fee collection wallet - must be exempt to avoid circular fees",
                canChangeExemption: false,
                role: "system"
            },
            donation: {
                address: "0x9Df4B945cef88E42c78522BB26621bBF2DCd10ef",
                name: "Donation Wallet",
                description: "Receives 25% of transaction fees for charitable purposes",
                feeExempt: true,
                exemptReason: "Donation wallet - exempt to maximize charitable impact",
                canChangeExemption: false,
                role: "system"
            },
            locked: {
                address: "0xE56ab5861f2B1C8dC185ecF8881242256CdB4c17",
                name: "Locked Token Wallet",
                description: "Holds locked tokens with 34-month vesting schedule",
                feeExempt: true,
                exemptReason: "Locked wallet - exempt during vesting period",
                canChangeExemption: true, // Can be changed after vesting
                role: "vesting"
            },
            dead: {
                address: "0x000000000000000000000000000000000000dEaD",
                name: "Burn Address",
                description: "Dead wallet for token burning (receives 25% of fees)",
                feeExempt: true,
                exemptReason: "Burn address - always exempt",
                canChangeExemption: false,
                role: "system"
            }
        },

        // 👥 FORMER ADMIN WALLETS (Now Regular Users - Fee Charged)
        admins: {
            mad: {
                address: "0xC4FB112cF0Ee27b33F112A9e3c20F8090a246902",
                name: "MAD User Wallet",
                description: "MAD user wallet with 10M token allocation and lock mechanism (no admin privileges)",
                feeExempt: false,
                exemptReason: "No longer exempt - standard user wallet with fee charges",
                canChangeExemption: false, // Cannot change - permanently fee charged
                role: "user",
                allocation: "10000000", // 10M tokens
                lockStatus: "active",
                adminPrivileges: false,
                authorityLevel: "none"
            },
            leb: {
                address: "0x9063f65823EE4343c014Ef048B0d916b1bD99108",
                name: "LEB User Wallet",
                description: "LEB user wallet with 10M token allocation and lock mechanism (no admin privileges)",
                feeExempt: false,
                exemptReason: "No longer exempt - standard user wallet with fee charges",
                canChangeExemption: false, // Cannot change - permanently fee charged
                role: "user",
                allocation: "10000000", // 10M tokens
                lockStatus: "active",
                adminPrivileges: false,
                authorityLevel: "none"
            },
            cnk: {
                address: "0x591Ec181Db349615b1b2d41BA39a49E43209d890",
                name: "CNK User Wallet",
                description: "CNK user wallet with 10M token allocation and lock mechanism (no admin privileges)",
                feeExempt: false,
                exemptReason: "No longer exempt - standard user wallet with fee charges",
                canChangeExemption: false, // Cannot change - permanently fee charged
                role: "user",
                allocation: "10000000", // 10M tokens
                lockStatus: "active",
                adminPrivileges: false,
                authorityLevel: "none"
            },
            kdr: {
                address: "0xf9Ea1726Df5cBbbecC1812754C96de8Fd246351c",
                name: "KDR User Wallet",
                description: "KDR user wallet with 10M token allocation and lock mechanism (no admin privileges)",
                feeExempt: false,
                exemptReason: "No longer exempt - standard user wallet with fee charges",
                canChangeExemption: false, // Cannot change - permanently fee charged
                role: "user",
                allocation: "10000000", // 10M tokens
                lockStatus: "active",
                adminPrivileges: false,
                authorityLevel: "none"
            }
        },

        // 🤝 PARTNERSHIP & INTEGRATION WALLETS (Configurable Fee Exemption)
        partnerships: {
            // Example partnership wallets - can be added as needed
            /*
            exchange1: {
                address: "0x0000000000000000000000000000000000000000",
                name: "Exchange Partnership Wallet",
                description: "Major exchange partnership for liquidity provision",
                feeExempt: true,
                exemptReason: "Exchange partnership - exempt to encourage liquidity",
                canChangeExemption: true,
                role: "partnership",
                partnerType: "exchange"
            },
            dex1: {
                address: "0x0000000000000000000000000000000000000000",
                name: "DEX Integration Wallet",
                description: "Decentralized exchange integration wallet",
                feeExempt: false,
                exemptReason: "Standard DEX operations - fees apply",
                canChangeExemption: true,
                role: "integration",
                partnerType: "dex"
            }
            */
        },

        // 🏢 BUSINESS & OPERATIONAL WALLETS (Configurable Fee Exemption)
        business: {
            // Example business wallets - can be added as needed
            /*
            marketing: {
                address: "0x0000000000000000000000000000000000000000",
                name: "Marketing Wallet",
                description: "Marketing and promotional activities wallet",
                feeExempt: false,
                exemptReason: "Marketing operations - standard fees apply",
                canChangeExemption: true,
                role: "business",
                department: "marketing"
            },
            development: {
                address: "0x0000000000000000000000000000000000000000",
                name: "Development Wallet",
                description: "Development team operational wallet",
                feeExempt: true,
                exemptReason: "Development operations - exempt for efficiency",
                canChangeExemption: true,
                role: "business",
                department: "development"
            }
            */
        }
    },

    // 📊 TOKEN DISTRIBUTION - 1 BILLION TOKENS
    allocations: {
        total: "1000000000", // 1B total supply
        founder: "160000000", // 160M (16%)
        sylvanToken: "500000000", // 500M (50%)
        locked: "300000000", // 300M (30%)
        admins: {
            mad: "10000000", // 10M (1%)
            leb: "10000000", // 10M (1%)
            cnk: "10000000", // 10M (1%)
            kdr: "10000000"  // 10M (1%)
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

    // 🚫 FEE EXEMPTION CONFIGURATION
    exemptions: {
        // 🔒 PERMANENT EXEMPTIONS (Cannot be changed)
        permanent: [
            {
                address: "0x3e13b113482bCbCcfCd0D8517174EFF81b36a740",
                name: "Fee Collection Wallet",
                reason: "System wallet - prevents circular fee collection"
            },
            {
                address: "0x9Df4B945cef88E42c78522BB26621bBF2DCd10ef",
                name: "Donation Wallet", 
                reason: "System wallet - maximizes charitable impact"
            },
            {
                address: "0x000000000000000000000000000000000000dEaD",
                name: "Burn Address",
                reason: "Dead wallet - always exempt"
            }
        ],

        // ⏰ TEMPORARY EXEMPTIONS (Can be changed)
        temporary: [
            {
                address: "0xea8e945F7Cd6faC08dD5e369B55e04E7a8c3e28a",
                name: "Sylvan Token Wallet",
                reason: "Main project wallet - exempt for operational efficiency",
                canExpire: false,
                priority: "high"
            },
            {
                address: "0x1109B6aDB60dB170139f00bA2490fCA0F8BE7A8C",
                name: "Founder Wallet",
                reason: "Founder operations - exempt for project development",
                canExpire: true,
                expiryCondition: "After project maturity",
                priority: "high"
            },
            {
                address: "0xE56ab5861f2B1C8dC185ecF8881242256CdB4c17",
                name: "Locked Token Wallet",
                reason: "Vesting wallet - exempt during lock period",
                canExpire: true,
                expiryCondition: "After vesting completion (34 months)",
                priority: "medium"
            }
        ],

        // 👥 FORMER ADMIN WALLETS (Now Fee Charged - No Exemptions)
        formerAdmins: [
            {
                address: "0xC4FB112cF0Ee27b33F112A9e3c20F8090a246902",
                name: "MAD User Wallet",
                reason: "Former admin - now standard user with fee charges",
                feeStatus: "CHARGED",
                adminPrivileges: false,
                canChangeExemption: false,
                priority: "low",
                note: "Removed from exemption list - fees apply to all transactions"
            },
            {
                address: "0x9063f65823EE4343c014Ef048B0d916b1bD99108",
                name: "LEB User Wallet",
                reason: "Former admin - now standard user with fee charges",
                feeStatus: "CHARGED",
                adminPrivileges: false,
                canChangeExemption: false,
                priority: "low",
                note: "Removed from exemption list - fees apply to all transactions"
            },
            {
                address: "0x591Ec181Db349615b1b2d41BA39a49E43209d890",
                name: "CNK User Wallet",
                reason: "Former admin - now standard user with fee charges",
                feeStatus: "CHARGED",
                adminPrivileges: false,
                canChangeExemption: false,
                priority: "low",
                note: "Removed from exemption list - fees apply to all transactions"
            },
            {
                address: "0xf9Ea1726Df5cBbbecC1812754C96de8Fd246351c",
                name: "KDR User Wallet",
                reason: "Former admin - now standard user with fee charges",
                feeStatus: "CHARGED",
                adminPrivileges: false,
                canChangeExemption: false,
                priority: "low",
                note: "Removed from exemption list - fees apply to all transactions"
            }
        ],

        // 🆕 FUTURE EXEMPTIONS (Template for new additions)
        future: {
            // Template for adding new exempt wallets
            template: {
                address: "0x0000000000000000000000000000000000000000",
                name: "Wallet Name",
                description: "Detailed description of wallet purpose",
                reason: "Reason for fee exemption",
                canExpire: true, // true if exemption can be removed later
                expiryCondition: "Condition for removing exemption",
                priority: "low|medium|high", // Priority level
                category: "system|admin|partnership|business|integration",
                addedDate: null, // Will be set when added
                addedBy: null, // Will be set when added
                reviewDate: null // Next review date
            },
            
            // Instructions for adding new exemptions
            instructions: {
                step1: "Copy the template above",
                step2: "Fill in all required fields",
                step3: "Set appropriate priority and category",
                step4: "Add to the appropriate exemption category",
                step5: "Update the management settings below",
                step6: "Run validation before deployment"
            }
        },

        // ⚙️ MANAGEMENT SETTINGS
        management: {
            autoLoad: true, // Automatically load exemptions during deployment
            validateConfig: true, // Validate all exemption configurations
            maxExemptWallets: 50, // Maximum number of exempt wallets
            requireApproval: true, // Require approval for exemption changes
            auditTrail: true, // Keep audit trail of exemption changes
            reviewPeriod: 90, // Review exemptions every 90 days
            
            // Approval requirements
            approvalRequirements: {
                permanent: "owner", // Only owner can modify permanent exemptions
                temporary: "owner", // Only owner can modify temporary exemptions
                admin: "owner", // Only owner can modify admin exemptions
                future: "owner" // Only owner can add future exemptions
            },
            
            // Notification settings
            notifications: {
                onExemptionAdd: true,
                onExemptionRemove: true,
                onExemptionExpiry: true,
                reviewReminder: true
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
    }
};