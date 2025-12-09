const { ethers } = require("hardhat");
const deploymentConfig = require("../../config/deployment.config.js");
const { 
    validateAddress, 
    executeTransfer, 
    verifyTransfer,
    displayTransferConfirmation 
} = require("../utils/transfer-ownership.js");

async function main() {
    console.log("\n🚀 BSC Testnet Deployment - Sylvan Token");
    console.log("=".repeat(70));

    // Get deployer
    const [deployer] = await ethers.getSigners();
    console.log("\n📋 Deployer Information:");
    console.log("  Address:", deployer.address);
    const balance = await deployer.getBalance();
    console.log("  Balance:", ethers.utils.formatEther(balance), "BNB");

    if (balance.lt(ethers.utils.parseEther("0.1"))) {
        throw new Error("Insufficient balance. Need at least 0.1 BNB for deployment");
    }

    // Get owner address from environment variable or config (optional)
    const ownerAddress = process.env.OWNER_ADDRESS || 
                        (deploymentConfig.roles && deploymentConfig.roles.owner && deploymentConfig.roles.owner.address) ||
                        null;
    
    // Validate owner address if provided
    let validatedOwnerAddress = null;
    if (ownerAddress) {
        if (validateAddress(ownerAddress)) {
            validatedOwnerAddress = ethers.utils.getAddress(ownerAddress);
            console.log("\n👤 Owner Address (for transfer):", validatedOwnerAddress);
            
            // Check if owner is different from deployer
            if (validatedOwnerAddress.toLowerCase() === deployer.address.toLowerCase()) {
                console.log("  ⚠️  Note: Owner address is same as deployer (no transfer needed)");
                validatedOwnerAddress = null; // Don't transfer if same
            }
        } else {
            console.log("\n⚠️  Warning: Invalid owner address provided, will skip ownership transfer");
            console.log("  Provided address:", ownerAddress);
        }
    } else {
        console.log("\n📝 Note: No owner address provided, deployer will remain as owner");
    }

    // Get wallet addresses from config
    const feeWallet = deploymentConfig.wallets.system.fee.address;
    const donationWallet = deploymentConfig.wallets.system.donation.address;
    
    console.log("\n📋 Configuration:");
    console.log("  Fee Wallet:", feeWallet);
    console.log("  Donation Wallet:", donationWallet);

    // Initial exempt accounts
    const initialExemptAccounts = [
        deployer.address,
        feeWallet,
        donationWallet,
        deploymentConfig.wallets.system.dead.address
    ];

    console.log("\n📝 Initial Exempt Accounts:", initialExemptAccounts.length);

    // Deploy WalletManager library
    console.log("\n📚 Deploying WalletManager Library...");
    const WalletManager = await ethers.getContractFactory(
        "contracts/libraries/WalletManager.sol:WalletManager"
    );
    const walletManager = await WalletManager.deploy();
    await walletManager.deployed();
    console.log("  ✓ WalletManager:", walletManager.address);

    // Deploy main contract
    console.log("\n🪙 Deploying SylvanToken...");
    const SylvanToken = await ethers.getContractFactory("SylvanToken", {
        libraries: {
            WalletManager: walletManager.address
        }
    });

    const token = await SylvanToken.deploy(
        feeWallet,
        donationWallet,
        initialExemptAccounts
    );

    console.log("  ⏳ Waiting for deployment...");
    await token.deployed();

    const receipt = await token.deployTransaction.wait();
    
    console.log("\n✅ Deployment Successful!");
    console.log("  Contract Address:", token.address);
    console.log("  Transaction Hash:", token.deployTransaction.hash);
    console.log("  Block Number:", receipt.blockNumber);
    console.log("  Gas Used:", receipt.gasUsed.toString());

    // Verify deployment
    console.log("\n🔍 Verifying Deployment...");
    const name = await token.name();
    const symbol = await token.symbol();
    const totalSupply = await token.totalSupply();
    const decimals = await token.decimals();

    console.log("  Name:", name);
    console.log("  Symbol:", symbol);
    console.log("  Total Supply:", ethers.utils.formatEther(totalSupply), "SYL");
    console.log("  Decimals:", decimals);

    // Transfer ownership if different owner address provided
    let ownershipTransferInfo = null;
    const finalOwner = validatedOwnerAddress || deployer.address;
    
    if (validatedOwnerAddress) {
        console.log("\n🔄 Transferring Ownership...");
        console.log("=".repeat(70));
        
        try {
            // Display transfer confirmation
            displayTransferConfirmation(deployer.address, validatedOwnerAddress, token.address);
            
            // Execute transfer
            const transferReceipt = await executeTransfer(token, validatedOwnerAddress);
            
            console.log("\n✅ Ownership Transfer Successful!");
            console.log("  Transaction Hash:", transferReceipt.transactionHash);
            console.log("  Block Number:", transferReceipt.blockNumber);
            console.log("  Gas Used:", transferReceipt.gasUsed.toString());
            
            // Verify transfer
            const verified = await verifyTransfer(token, validatedOwnerAddress);
            
            if (!verified) {
                throw new Error("Ownership transfer verification failed");
            }
            
            ownershipTransferInfo = {
                executed: true,
                previousOwner: deployer.address,
                newOwner: validatedOwnerAddress,
                transactionHash: transferReceipt.transactionHash,
                blockNumber: transferReceipt.blockNumber,
                gasUsed: transferReceipt.gasUsed.toString(),
                timestamp: new Date().toISOString()
            };
            
            console.log("\n✅ Ownership verified - new owner:", validatedOwnerAddress);
            
        } catch (error) {
            console.error("\n❌ Ownership Transfer Failed:");
            console.error(error.message);
            console.log("\n⚠️  Deployment succeeded but ownership transfer failed");
            console.log("  You can transfer ownership manually using:");
            console.log(`  CONTRACT_ADDRESS=${token.address} NEW_OWNER_ADDRESS=${validatedOwnerAddress} npx hardhat run scripts/utils/transfer-ownership.js --network bscTestnet`);
            
            ownershipTransferInfo = {
                executed: false,
                error: error.message,
                manualTransferRequired: true
            };
        }
    }

    // Save deployment info
    const deploymentInfo = {
        network: "bscTestnet",
        timestamp: new Date().toISOString(),
        deployer: {
            address: deployer.address,
            role: "deployer",
            balance: ethers.utils.formatEther(balance)
        },
        owner: {
            address: finalOwner,
            role: "owner",
            isDeployer: finalOwner.toLowerCase() === deployer.address.toLowerCase()
        },
        contracts: {
            walletManager: walletManager.address,
            token: token.address
        },
        deployment: {
            transactionHash: token.deployTransaction.hash,
            blockNumber: receipt.blockNumber,
            gasUsed: receipt.gasUsed.toString()
        },
        ownershipTransfer: ownershipTransferInfo
    };

    const fs = require("fs");
    const deploymentPath = `deployments/testnet-deployment-${Date.now()}.json`;
    fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
    console.log("\n💾 Deployment info saved to:", deploymentPath);

    console.log("\n📝 Deployment Summary:");
    console.log("  Network:", "BSC Testnet");
    console.log("  Deployer:", deployer.address);
    console.log("  Owner:", finalOwner);
    console.log("  Contract:", token.address);
    console.log("  Ownership Transfer:", ownershipTransferInfo ? (ownershipTransferInfo.executed ? "✅ Completed" : "❌ Failed") : "⊘ Not Required");

    console.log("\n📝 Next Steps:");
    console.log("  1. Verify contract on BSCScan:");
    console.log(`     npx hardhat verify --network bscTestnet ${token.address} "${feeWallet}" "${donationWallet}" "[${initialExemptAccounts.map(a => `"${a}"`).join(',')}]"`);
    console.log("  2. Configure vesting schedules");
    console.log("  3. Distribute initial tokens");
    
    if (validatedOwnerAddress) {
        console.log("\n👤 Owner Role Information:");
        console.log("  • All administrative functions must now be called by:", validatedOwnerAddress);
        console.log("  • The deployer wallet no longer has admin privileges");
        console.log("  • Ensure you have access to the owner wallet's private key");
    }

    console.log("\n✅ Deployment Complete!");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("\n❌ Deployment Failed:");
        console.error(error);
        process.exit(1);
    });
