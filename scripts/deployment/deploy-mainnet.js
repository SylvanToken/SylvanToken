// BSC Mainnet Deployment Script
// This script deploys SylvanToken to BSC Mainnet with full configuration

const hre = require("hardhat");
const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

// Import configurations
const deploymentConfig = require("../../config/deployment.config.js");
const { 
    validateAddress, 
    executeTransfer, 
    verifyTransfer,
    displayTransferConfirmation 
} = require("../utils/transfer-ownership.js");

async function main() {
    console.log("\n" + "=".repeat(80));
    console.log("🚀 SYLVAN TOKEN - BSC MAINNET DEPLOYMENT");
    console.log("=".repeat(80) + "\n");

    // Get deployer
    const [deployer] = await ethers.getSigners();
    const deployerAddress = await deployer.getAddress();
    const deployerBalance = await ethers.provider.getBalance(deployerAddress);

    console.log("📋 Deployment Information:");
    console.log("-".repeat(80));
    console.log("Network:", hre.network.name);
    console.log("Chain ID:", (await ethers.provider.getNetwork()).chainId);
    console.log("Deployer:", deployerAddress);
    console.log("Balance:", ethers.utils.formatEther(deployerBalance), "BNB");
    console.log("Timestamp:", new Date().toISOString());
    console.log("-".repeat(80) + "\n");

    // Check balance
    const requiredBalance = ethers.utils.parseEther("0.15");
    if (deployerBalance.lt(requiredBalance)) {
        console.error("❌ ERROR: Insufficient BNB balance!");
        console.error("Required:", ethers.utils.formatEther(requiredBalance), "BNB");
        console.error("Current:", ethers.utils.formatEther(deployerBalance), "BNB");
        process.exit(1);
    }

    // Get owner address - REQUIRED for mainnet
    const ownerAddress = process.env.OWNER_ADDRESS || 
                        (deploymentConfig.roles && deploymentConfig.roles.owner && deploymentConfig.roles.owner.address);
    
    if (!ownerAddress) {
        console.error("\n❌ ERROR: OWNER_ADDRESS is required for mainnet deployment!");
        console.error("\n🔐 Security Requirement:");
        console.error("   For mainnet deployments, deployer and owner MUST be different addresses.");
        console.error("   The owner should be a hardware wallet or multisig for enhanced security.");
        console.error("\n📝 How to fix:");
        console.error("   1. Set OWNER_ADDRESS environment variable:");
        console.error("      export OWNER_ADDRESS=0x...");
        console.error("   2. Or add it to config/deployment.config.js:");
        console.error("      roles: { owner: { address: '0x...' } }");
        console.error("\n⚠️  The owner address should be:");
        console.error("   • A hardware wallet (Ledger/Trezor) for maximum security");
        console.error("   • A multisig wallet (Gnosis Safe) for team management");
        console.error("   • NEVER the same as the deployer wallet");
        process.exit(1);
    }

    // Validate owner address
    if (!validateAddress(ownerAddress)) {
        console.error("\n❌ ERROR: Invalid owner address!");
        console.error("Provided address:", ownerAddress);
        console.error("\nThe owner address must be:");
        console.error("  • A valid Ethereum address format");
        console.error("  • Not the zero address (0x0000...0000)");
        process.exit(1);
    }

    const validatedOwnerAddress = ethers.utils.getAddress(ownerAddress);

    // Enforce different deployer and owner on mainnet
    if (validatedOwnerAddress.toLowerCase() === deployerAddress.toLowerCase()) {
        console.error("\n❌ ERROR: Deployer and owner CANNOT be the same address on mainnet!");
        console.error("\n🔐 Security Requirement:");
        console.error("   Mainnet deployments require role separation for security.");
        console.error("   The deployer wallet is used only for deployment (hot wallet).");
        console.error("   The owner wallet must be a secure wallet (hardware/multisig).");
        console.error("\n📝 Current Configuration:");
        console.error("   Deployer:", deployerAddress);
        console.error("   Owner:   ", validatedOwnerAddress);
        console.error("\n⚠️  Please provide a DIFFERENT address for the owner.");
        process.exit(1);
    }

    console.log("👤 Role Separation:");
    console.log("-".repeat(80));
    console.log("Deployer (Hot Wallet):", deployerAddress);
    console.log("Owner (Secure Wallet):", validatedOwnerAddress);
    console.log("✅ Role separation verified - different addresses");
    console.log("-".repeat(80) + "\n");

    // Confirm deployment
    console.log("⚠️  WARNING: You are about to deploy to BSC MAINNET!");
    console.log("⚠️  This will cost real BNB and cannot be undone!");
    console.log("\nPlease verify all configurations in config/deployment.config.js");
    console.log("\nPress Ctrl+C to cancel, or wait 10 seconds to continue...\n");
    
    await new Promise(resolve => setTimeout(resolve, 10000));

    console.log("🔨 Starting deployment...\n");

    // Get configuration
    const config = deploymentConfig;
    const wallets = config.wallets;

    console.log("📝 Configuration:");
    console.log("-".repeat(80));
    console.log("Token Name: Sylvan Token");
    console.log("Token Symbol: SYL");
    console.log("Total Supply:", config.allocations.total, "SYL");
    console.log("Fee Rate:", config.feeStructure.taxRate / 100, "%");
    console.log("-".repeat(80) + "\n");

    // Deploy WalletManager library first
    console.log("📚 Deploying WalletManager Library...");
    const WalletManager = await ethers.getContractFactory(
        "contracts/libraries/WalletManager.sol:WalletManager"
    );
    const walletManager = await WalletManager.deploy();
    await walletManager.deployed();
    console.log("✅ WalletManager deployed:", walletManager.address);
    console.log();

    // Deploy contract
    console.log("📦 Deploying SylvanToken contract...");
    
    const SylvanToken = await ethers.getContractFactory("SylvanToken", {
        libraries: {
            WalletManager: walletManager.address
        }
    });
    
    // Initial exempt accounts
    const initialExemptAccounts = [
        deployerAddress,
        wallets.system.fee.address,
        wallets.system.donation.address,
        wallets.system.dead.address
    ];
    
    console.log("Initial Exempt Accounts:", initialExemptAccounts.length);
    console.log();

    const deployTx = SylvanToken.getDeployTransaction(
        wallets.system.fee.address,
        wallets.system.donation.address,
        initialExemptAccounts
    );
    
    const estimatedGas = await ethers.provider.estimateGas(deployTx);
    const gasPrice = await ethers.provider.getGasPrice();
    const estimatedCost = estimatedGas.mul(gasPrice);
    
    console.log("Estimated Gas:", estimatedGas.toString());
    console.log("Gas Price:", ethers.utils.formatUnits(gasPrice, "gwei"), "gwei");
    console.log("Estimated Cost:", ethers.utils.formatEther(estimatedCost), "BNB");
    console.log();

    const token = await SylvanToken.deploy(
        wallets.system.fee.address,
        wallets.system.donation.address,
        initialExemptAccounts
    );

    console.log("⏳ Waiting for deployment transaction...");
    await token.deployed();

    const deployReceipt = await token.deployTransaction.wait();
    const actualCost = deployReceipt.gasUsed.mul(deployReceipt.effectiveGasPrice);

    console.log("\n✅ Contract deployed successfully!");
    console.log("-".repeat(80));
    console.log("Contract Address:", token.address);
    console.log("Transaction Hash:", token.deployTransaction.hash);
    console.log("Block Number:", deployReceipt.blockNumber);
    console.log("Gas Used:", deployReceipt.gasUsed.toString());
    console.log("Actual Cost:", ethers.utils.formatEther(actualCost), "BNB");
    console.log("-".repeat(80) + "\n");

    // Verify deployment
    console.log("🔍 Verifying deployment...");
    
    const totalSupply = await token.totalSupply();
    const name = await token.name();
    const symbol = await token.symbol();
    const decimals = await token.decimals();
    const owner = await token.owner();
    const feeWallet = await token.feeWallet();
    const donationsWallet = await token.donationWallet();

    console.log("Total Supply:", ethers.utils.formatEther(totalSupply), "SYL");
    console.log("Name:", name);
    console.log("Symbol:", symbol);
    console.log("Decimals:", decimals);
    console.log("Owner:", owner);
    console.log("Fee Wallet:", feeWallet);
    console.log("Donations Wallet:", donationsWallet);
    console.log();

    // Verify configuration
    let configErrors = [];
    
    if (!totalSupply.eq(config.token.totalSupply)) {
        configErrors.push("Total supply mismatch");
    }
    if (name !== config.token.name) {
        configErrors.push("Token name mismatch");
    }
    if (symbol !== config.token.symbol) {
        configErrors.push("Token symbol mismatch");
    }
    if (owner !== deployerAddress) {
        configErrors.push("Owner mismatch");
    }
    if (feeWallet !== wallets.system.fee.address) {
        configErrors.push("Fee wallet mismatch");
    }
    if (donationsWallet !== wallets.system.donation.address) {
        configErrors.push("Donations wallet mismatch");
    }

    if (configErrors.length > 0) {
        console.error("❌ Configuration verification failed:");
        configErrors.forEach(error => console.error("  -", error));
        process.exit(1);
    }

    console.log("✅ Configuration verified successfully!\n");

    // Transfer ownership to secure wallet
    console.log("🔄 Transferring Ownership to Secure Wallet...");
    console.log("=".repeat(80));
    
    let ownershipTransferInfo = null;
    
    try {
        // Display transfer confirmation
        displayTransferConfirmation(deployerAddress, validatedOwnerAddress, token.address);
        
        // Execute transfer
        const transferReceipt = await executeTransfer(token, validatedOwnerAddress);
        
        console.log("\n✅ Ownership Transfer Successful!");
        console.log("-".repeat(80));
        console.log("Transaction Hash:", transferReceipt.transactionHash);
        console.log("Block Number:", transferReceipt.blockNumber);
        console.log("Gas Used:", transferReceipt.gasUsed.toString());
        console.log("-".repeat(80) + "\n");
        
        // Verify transfer
        const verified = await verifyTransfer(token, validatedOwnerAddress);
        
        if (!verified) {
            throw new Error("Ownership transfer verification failed");
        }
        
        ownershipTransferInfo = {
            executed: true,
            previousOwner: deployerAddress,
            newOwner: validatedOwnerAddress,
            transactionHash: transferReceipt.transactionHash,
            blockNumber: transferReceipt.blockNumber,
            gasUsed: transferReceipt.gasUsed.toString(),
            timestamp: new Date().toISOString()
        };
        
        console.log("✅ Ownership verified - new owner:", validatedOwnerAddress);
        console.log("✅ Deployer no longer has admin privileges\n");
        
    } catch (error) {
        console.error("\n❌ CRITICAL ERROR: Ownership Transfer Failed!");
        console.error("-".repeat(80));
        console.error("Error:", error.message);
        console.error("\n⚠️  DEPLOYMENT SUCCEEDED BUT OWNERSHIP TRANSFER FAILED!");
        console.error("⚠️  The deployer wallet still has admin privileges!");
        console.error("\n🔧 Manual Transfer Required:");
        console.error(`   CONTRACT_ADDRESS=${token.address} NEW_OWNER_ADDRESS=${validatedOwnerAddress} npx hardhat run scripts/utils/transfer-ownership.js --network bscMainnet`);
        console.error("\n⚠️  DO NOT proceed with configuration until ownership is transferred!");
        console.error("-".repeat(80) + "\n");
        
        ownershipTransferInfo = {
            executed: false,
            error: error.message,
            manualTransferRequired: true,
            manualTransferCommand: `CONTRACT_ADDRESS=${token.address} NEW_OWNER_ADDRESS=${validatedOwnerAddress} npx hardhat run scripts/utils/transfer-ownership.js --network bscMainnet`
        };
        
        // Don't exit - save deployment info but warn user
    }

    // Save deployment info
    const deploymentInfo = {
        network: hre.network.name,
        chainId: (await ethers.provider.getNetwork()).chainId,
        contractAddress: token.address,
        deployer: {
            address: deployerAddress,
            role: "deployer",
            balance: ethers.utils.formatEther(deployerBalance)
        },
        owner: {
            address: validatedOwnerAddress,
            role: "owner",
            isDeployer: false,
            walletType: deploymentConfig.roles && deploymentConfig.roles.owner && deploymentConfig.roles.owner.walletType || "unknown"
        },
        deployment: {
            transactionHash: token.deployTransaction.hash,
            blockNumber: deployReceipt.blockNumber,
            gasUsed: deployReceipt.gasUsed.toString(),
            gasCost: ethers.utils.formatEther(actualCost),
            timestamp: new Date().toISOString()
        },
        ownershipTransfer: ownershipTransferInfo,
        configuration: {
            totalSupply: ethers.utils.formatEther(totalSupply),
            name: name,
            symbol: symbol,
            decimals: decimals,
            feeWallet: feeWallet,
            donationsWallet: donationsWallet
        }
    };

    const deploymentDir = path.join(__dirname, "../../deployments");
    if (!fs.existsSync(deploymentDir)) {
        fs.mkdirSync(deploymentDir, { recursive: true });
    }

    const deploymentFile = path.join(deploymentDir, "mainnet-deployment.json");
    fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));

    console.log("💾 Deployment info saved to:", deploymentFile);
    console.log();

    // Next steps
    console.log("=" + "=".repeat(79));
    if (ownershipTransferInfo && ownershipTransferInfo.executed) {
        console.log("🎉 DEPLOYMENT AND OWNERSHIP TRANSFER COMPLETED SUCCESSFULLY!");
    } else {
        console.log("⚠️  DEPLOYMENT COMPLETED - OWNERSHIP TRANSFER REQUIRES ATTENTION!");
    }
    console.log("=".repeat(80) + "\n");

    console.log("📊 Deployment Summary:");
    console.log("-".repeat(80));
    console.log("Network:", hre.network.name);
    console.log("Contract Address:", token.address);
    console.log("Deployer:", deployerAddress);
    console.log("Owner:", validatedOwnerAddress);
    console.log("Ownership Transfer:", ownershipTransferInfo && ownershipTransferInfo.executed ? "✅ Completed" : "❌ Failed - Manual Action Required");
    console.log("-".repeat(80) + "\n");

    if (ownershipTransferInfo && !ownershipTransferInfo.executed) {
        console.log("🚨 CRITICAL: Manual Ownership Transfer Required!");
        console.log("-".repeat(80));
        console.log("Run this command to transfer ownership:");
        console.log(ownershipTransferInfo.manualTransferCommand);
        console.log("-".repeat(80) + "\n");
    }

    console.log("📋 Next Steps:");
    console.log("-".repeat(80));
    console.log("1. Verify contract on BSCScan:");
    console.log("   npx hardhat verify --network bscMainnet", token.address, wallets.system.fee.address, wallets.system.donation.address);
    console.log();
    
    if (ownershipTransferInfo && ownershipTransferInfo.executed) {
        console.log("2. Verify ownership on BSCScan:");
        console.log("   Check that owner is:", validatedOwnerAddress);
        console.log();
        console.log("3. Configure admin wallets (using OWNER wallet):");
        console.log("   ⚠️  Use the owner wallet's private key for this step!");
        console.log("   npx hardhat run scripts/deployment/configure-mainnet.js --network bscMainnet");
        console.log();
        console.log("4. Distribute tokens (using OWNER wallet):");
        console.log("   ⚠️  Use the owner wallet's private key for this step!");
        console.log("   npx hardhat run scripts/deployment/distribute-mainnet.js --network bscMainnet");
    } else {
        console.log("2. Transfer ownership manually (REQUIRED before proceeding):");
        console.log("   See command above");
        console.log();
        console.log("3. After ownership transfer, configure admin wallets:");
        console.log("   npx hardhat run scripts/deployment/configure-mainnet.js --network bscMainnet");
        console.log();
        console.log("4. Distribute tokens:");
        console.log("   npx hardhat run scripts/deployment/distribute-mainnet.js --network bscMainnet");
    }
    console.log("-".repeat(80) + "\n");

    console.log("🔗 Important Links:");
    console.log("-".repeat(80));
    console.log("Contract:", "https://bscscan.com/address/" + token.address);
    console.log("Transaction:", "https://bscscan.com/tx/" + token.deployTransaction.hash);
    console.log("-".repeat(80) + "\n");

    console.log("⚠️  IMPORTANT REMINDERS:");
    console.log("-".repeat(80));
    console.log("• Save the contract address:", token.address);
    console.log("• Verify the contract on BSCScan immediately");
    console.log("• Owner wallet:", validatedOwnerAddress);
    console.log("• ALL admin functions must be called from the OWNER wallet");
    console.log("• The deployer wallet NO LONGER has admin privileges");
    console.log("• Ensure you have access to the owner wallet's private key");
    console.log("• Monitor the contract closely for the first 24 hours");
    if (ownershipTransferInfo && !ownershipTransferInfo.executed) {
        console.log("• ⚠️  COMPLETE OWNERSHIP TRANSFER BEFORE PROCEEDING!");
    }
    console.log("-".repeat(80) + "\n");

    console.log("👤 Role Information:");
    console.log("-".repeat(80));
    console.log("Deployer Role (Hot Wallet):");
    console.log("  • Address:", deployerAddress);
    console.log("  • Purpose: Deploy contracts, pay gas fees");
    console.log("  • Privileges: None (after ownership transfer)");
    console.log();
    console.log("Owner Role (Secure Wallet):");
    console.log("  • Address:", validatedOwnerAddress);
    console.log("  • Purpose: Administrative control");
    console.log("  • Privileges: All admin functions");
    console.log("  • Type:", deploymentConfig.roles && deploymentConfig.roles.owner && deploymentConfig.roles.owner.walletType || "Unknown");
    console.log("-".repeat(80) + "\n");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("\n❌ Deployment failed:");
        console.error(error);
        process.exit(1);
    });
