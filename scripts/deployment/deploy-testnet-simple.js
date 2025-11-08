const { ethers } = require("hardhat");
const deploymentConfig = require("../../config/deployment.config.js");

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

    // Save deployment info
    const deploymentInfo = {
        network: "bscTestnet",
        timestamp: new Date().toISOString(),
        deployer: deployer.address,
        contracts: {
            walletManager: walletManager.address,
            token: token.address
        },
        transactionHash: token.deployTransaction.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString()
    };

    const fs = require("fs");
    const deploymentPath = `deployments/testnet-deployment-${Date.now()}.json`;
    fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
    console.log("\n💾 Deployment info saved to:", deploymentPath);

    console.log("\n📝 Next Steps:");
    console.log("  1. Verify contract on BSCScan:");
    console.log(`     npx hardhat verify --network bscTestnet ${token.address} "${feeWallet}" "${donationWallet}" "[${initialExemptAccounts.map(a => `"${a}"`).join(',')}]"`);
    console.log("  2. Configure vesting schedules");
    console.log("  3. Distribute initial tokens");

    console.log("\n✅ Deployment Complete!");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("\n❌ Deployment Failed:");
        console.error(error);
        process.exit(1);
    });
