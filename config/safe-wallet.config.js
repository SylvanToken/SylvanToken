/**
 * @title Safe Wallet Configuration for SylvanToken
 * @dev Gnosis Safe multi-signature wallet configuration
 * @notice This file contains all Safe wallet settings and transaction templates
 */

module.exports = {
    // 🔐 SAFE WALLET INFORMATION
    safeWallet: {
        address: "0xC5CcDC8F01739CeD02B30b5aD10DD5Fb201436bB",
        name: "Sylvan Token Safe Multisig",
        network: "BSC Mainnet",
        chainId: 56,
        platform: "Gnosis Safe",
        url: "https://app.safe.global/home?safe=bnb:0xC5CcDC8F01739CeD02B30b5aD10DD5Fb201436bB"
    },

    // 📋 CONTRACT INFORMATION
    // Updated: 2025-12-09 - New contract deployment
    contract: {
        address: "0xc66404C3fa3E01378027b4A4411812D3a8D458F5",
        name: "SylvanToken",
        network: "BSC Mainnet",
        bscscanUrl: "https://bscscan.com/address/0xc66404C3fa3E01378027b4A4411812D3a8D458F5"
    },

    // 👥 AUTHORIZED SIGNERS (3 Signers - 2/3 Threshold)
    // Note: Safe Wallet address is the multisig itself, not a signer
    signers: [
        {
            address: "0xf949f50B3C32bD4cDa7D2192ff8f51dd9db4A469",
            name: "Deployer Wallet",
            type: "individual",
            role: "deployer"
        },
        {
            address: "0x465b54282e4885f61df7eB7CcDc2493DB35C9501",
            name: "Owner Wallet",
            type: "individual",
            role: "owner"
        },
        {
            address: "0x1109B6aDB60dB170139f00bA2490fCA0F8BE7A8C",
            name: "Admin Wallet (BRK)",
            type: "individual",
            role: "admin"
        }
    ],

    // ⚙️ MULTI-SIG PARAMETERS
    parameters: {
        threshold: 2,           // Minimum 2 signatures required
        totalSigners: 3,        // Total 3 signers
        quorumPercentage: 67    // 2/3 = 67%
    },

    // 🔓 VESTING RELEASE AUTHORIZATION
    // Safe Wallet must be contract owner to execute these functions
    vestingReleaseAuthorization: {
        enabled: true,
        authorizedWallet: "0xC5CcDC8F01739CeD02B30b5aD10DD5Fb201436bB",
        requiredRole: "owner", // Safe must be contract owner
        requiredSignatures: 2,
        permissions: [
            {
                function: "processMonthlyRelease",
                description: "Release monthly vested tokens for admin wallets",
                targets: ["BRK", "ERH", "GRK", "CNK"],
                frequency: "monthly",
                authorized: true
            },
            {
                function: "processLockedWalletRelease",
                description: "Release monthly vested tokens for locked reserve",
                targets: ["Locked Reserve"],
                frequency: "monthly",
                authorized: true
            },
            {
                function: "processInitialRelease",
                description: "Release initial 10% for admin wallets",
                targets: ["BRK", "ERH", "GRK", "CNK"],
                frequency: "one-time",
                authorized: true
            }
        ],
        activationSteps: [
            "1. Current owner calls transferOwnership(0xC5CcDC8F01739CeD02B30b5aD10DD5Fb201436bB)",
            "2. Safe Wallet becomes contract owner",
            "3. All vesting release functions require 2/3 Safe signatures",
            "4. Use SafeWallet App or Transaction Builder to execute releases"
        ],
        status: "pending_ownership_transfer" // Change to "active" after transfer
    },

    // 🎯 TARGET WALLETS FOR VESTING OPERATIONS
    vestingWallets: {
        // Admin Wallets (Monthly Release)
        admins: [
            {
                address: "0x1109B6aDB60dB170139f00bA2490fCA0F8BE7A8C",
                name: "BRK",
                allocation: "10000000",
                monthlyRelease: "500000",
                vestingMonths: 16
            },
            {
                address: "0xe64660026a1aaDaea2ac6032b6B59f8714a08E34",
                name: "ERH",
                allocation: "10000000",
                monthlyRelease: "500000",
                vestingMonths: 16
            },
            {
                address: "0xd1cc4222b7b62fb623884371337ae04cf44b93a7",
                name: "GRK",
                allocation: "10000000",
                monthlyRelease: "500000",
                vestingMonths: 16
            },
            {
                address: "0x106A637D825e562168678b7fd0f75cFf2cF2845B",
                name: "CNK",
                allocation: "10000000",
                monthlyRelease: "500000",
                vestingMonths: 16
            }
        ],
        // Locked Reserve Wallet
        lockedReserve: {
            address: "0x687A2c7E494c3818c20AD2856d453514970d6aac",
            name: "Locked Reserve",
            allocation: "300000000",
            monthlyRelease: "9000000",
            burnPercentage: 10,
            vestingMonths: 34
        }
    },

    // 📝 TRANSACTION TEMPLATES FOR SAFE
    transactions: {
        // Monthly Admin Release Transactions
        monthlyAdminRelease: {
            functionName: "processMonthlyRelease",
            functionSignature: "processMonthlyRelease(address)",
            description: "Process monthly vested token release for admin wallet",
            gasLimit: 250000,
            templates: [
                {
                    name: "Release BRK Monthly",
                    to: "0xc66404C3fa3E01378027b4A4411812D3a8D458F5",
                    value: "0",
                    data: "0x", // Will be encoded
                    params: { admin: "0x1109B6aDB60dB170139f00bA2490fCA0F8BE7A8C" }
                },
                {
                    name: "Release ERH Monthly",
                    to: "0xc66404C3fa3E01378027b4A4411812D3a8D458F5",
                    value: "0",
                    data: "0x",
                    params: { admin: "0xe64660026a1aaDaea2ac6032b6B59f8714a08E34" }
                },
                {
                    name: "Release GRK Monthly",
                    to: "0xc66404C3fa3E01378027b4A4411812D3a8D458F5",
                    value: "0",
                    data: "0x",
                    params: { admin: "0xd1cc4222b7b62fb623884371337ae04cf44b93a7" }
                },
                {
                    name: "Release CNK Monthly",
                    to: "0xc66404C3fa3E01378027b4A4411812D3a8D458F5",
                    value: "0",
                    data: "0x",
                    params: { admin: "0x106A637D825e562168678b7fd0f75cFf2cF2845B" }
                }
            ]
        },

        // Locked Wallet Release Transaction
        lockedWalletRelease: {
            functionName: "processLockedWalletRelease",
            functionSignature: "processLockedWalletRelease(address)",
            description: "Process monthly vested token release for locked reserve wallet",
            gasLimit: 300000,
            template: {
                name: "Release Locked Reserve Monthly",
                to: "0xc66404C3fa3E01378027b4A4411812D3a8D458F5",
                value: "0",
                data: "0x",
                params: { lockedWallet: "0x687A2c7E494c3818c20AD2856d453514970d6aac" }
            }
        },

        // Fee Exemption Management
        feeExemption: {
            add: {
                functionName: "addExemptWallet",
                functionSignature: "addExemptWallet(address)",
                description: "Add wallet to fee exemption list",
                gasLimit: 100000
            },
            remove: {
                functionName: "removeExemptWallet",
                functionSignature: "removeExemptWallet(address)",
                description: "Remove wallet from fee exemption list",
                gasLimit: 80000
            },
            addBatch: {
                functionName: "addExemptWalletsBatch",
                functionSignature: "addExemptWalletsBatch(address[])",
                description: "Add multiple wallets to fee exemption list",
                gasLimit: 200000
            }
        },

        // AMM Pair Management
        ammPair: {
            functionName: "setAMMPair",
            functionSignature: "setAMMPair(address,bool)",
            description: "Set or unset address as AMM pair",
            gasLimit: 60000
        },

        // Ownership Transfer
        transferOwnership: {
            functionName: "transferOwnership",
            functionSignature: "transferOwnership(address)",
            description: "Transfer contract ownership to new address",
            gasLimit: 50000,
            warning: "⚠️ CRITICAL: This action is IRREVERSIBLE!"
        }
    },

    // 📅 SCHEDULED OPERATIONS
    schedule: {
        monthlyRelease: {
            description: "Monthly vesting release operations",
            frequency: "Monthly (every ~30 days)",
            operations: [
                "processMonthlyRelease for all 4 admin wallets",
                "processLockedWalletRelease for locked reserve"
            ],
            estimatedGas: "1,100,000 gas total",
            estimatedCost: "~0.0055 BNB (at 5 gwei)"
        }
    }
};
