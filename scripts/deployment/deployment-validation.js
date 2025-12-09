const { ethers, run } = require("hardhat");
const fs = require('fs');

/**
 * @title Deployment Validation Utilities
 * @dev Consolidated script for network testing and contract verification
 */

// Network Connection Testing
async function testNetworkConnection(networkName = 'testnet') {
    console.log(`🔗 Testing BSC ${networkName} Connection...`);
    
    try {
        const rpcUrl = networkName === 'mainnet' 
            ? (process.env.BSC_MAINNET_RPC || "https://bsc-dataseed.binance.org/")
            : (process.env.BSC_TESTNET_RPC || "https://data-seed-prebsc-1-s1.binance.org:8545/");
            
        const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
        
        // Get network info
        const network = await provider.getNetwork();
        console.log("✅ Network Info:");
        console.log("   Chain ID:", network.chainId);
        console.log("   Network Name:", network.name);
        
        // Get latest block
        const blockNumber = await provider.getBlockNumber();
        console.log("✅ Latest Block:", blockNumber);
        
        // Get gas price
        const gasPrice = await provider.getGasPrice();
        console.log("✅ Current Gas Price:", ethers.utils.formatUnits(gasPrice, "gwei"), "gwei");
        
        // Test deployer account if configured
        if (process.env.DEPLOYER_PRIVATE_KEY) {
            const wallet = new ethers.Wallet(process.env.DEPLOYER_PRIVATE_KEY, provider);
            const balance = await wallet.getBalance();
            console.log("✅ Deployer Account:");
            console.log("   Address:", wallet.address);
            console.log("   Balance:", ethers.utils.formatEther(balance), "BNB");
            
            if (balance.lt(ethers.utils.parseEther("0.1"))) {
                console.log("⚠️  WARNING: Low BNB balance. Need at least 0.1 BNB for deployment");
            }
        } else {
            console.log("⚠️  No DEPLOYER_PRIVATE_KEY found in environment");
        }
        
        console.log(`✅ BSC ${networkName} connection successful!`);
        return true;
        
    } catch (error) {
        console.error(`❌ BSC ${networkName} connection failed:`);
        console.error("   Error:", error.message);
        return false;
    }
}

// Contract Verification
async function verifyContract(contractAddress, constructorArgs = []) {
    console.log("🔍 Verifying contract on BSCScan...");
    
    try {
        await run("verify:verify", {
            address: contractAddress,
            constructorArguments: constructorArgs,
        });
        
        console.log("✅ Contract verified successfully!");
        console.log(`📄 View on BSCScan: https://testnet.bscscan.com/address/${contractAddress}`);
        
    } catch (error) {
        if (error.message.toLowerCase().includes("already verified")) {
            console.log("✅ Contract already verified!");
        } else {
            console.error("❌ Verification failed:", error.message);
            throw error;
        }
    }
}

async function verifyLibraries(libraries) {
    console.log("\n📚 Verifying libraries...");
    
    for (const [name, address] of Object.entries(libraries)) {
        console.log(`\n🔍 Verifying ${name}...`);
        try {
            await verifyContract(address, []);
            console.log(`✅ ${name} verified`);
        } catch (error) {
            console.log(`❌ ${name} verification failed:`, error.message);
        }
    }
}

// Main CLI Interface
async function main() {
    const command = process.argv[2];
    
    if (!command) {
        console.log("🚀 Deployment Validation Utilities");
        console.log("\nUsage:");
        console.log("  node deployment-validation.js test [testnet|mainnet]");
        console.log("  node deployment-validation.js verify <CONTRACT_ADDRESS> <FEE_WALLET> <DONATION_WALLET> [DEPLOYMENT_FILE]");
        console.log("  node deployment-validation.js full-test");
        console.log("\nExamples:");
        console.log("  node deployment-validation.js test testnet");
        console.log("  node deployment-validation.js verify 0x123... 0xfee... 0xdonation...");
        console.log("  node deployment-validation.js full-test");
        process.exit(1);
    }
    
    switch (command) {
        case 'test':
            const networkName = process.argv[3] || 'testnet';
            await testNetworkConnection(networkName);
            break;
            
        case 'verify':
            const contractAddress = process.argv[3];
            const feeWallet = process.argv[4];
            const donationWallet = process.argv[5];
            const deploymentFile = process.argv[6];
            
            if (!contractAddress || !feeWallet || !donationWallet) {
                console.log("❌ Missing required arguments for verification");
                console.log("Usage: node deployment-validation.js verify <CONTRACT_ADDRESS> <FEE_WALLET> <DONATION_WALLET> [DEPLOYMENT_FILE]");
                process.exit(1);
            }
            
            console.log("🚀 Contract Verification");
            console.log("Contract:", contractAddress);
            
            try {
                // Load deployment info if provided
                let libraries = {};
                if (deploymentFile && fs.existsSync(deploymentFile)) {
                    const deployment = JSON.parse(fs.readFileSync(deploymentFile, 'utf8'));
                    libraries = deployment.contracts.libraries || {};
                    console.log("📄 Loaded deployment info from:", deploymentFile);
                }
                
                // Verify libraries first
                if (Object.keys(libraries).length > 0) {
                    await verifyLibraries(libraries);
                }
                
                // Verify main contract
                console.log("\n🪙 Verifying SylvanToken...");
                const constructorArgs = [
                    feeWallet,
                    donationWallet,
                    [] // initialExemptAccounts - empty array for basic deployment
                ];
                
                await verifyContract(contractAddress, constructorArgs);
                console.log("\n🎉 Verification completed!");
                
            } catch (error) {
                console.error("❌ Verification process failed:", error);
                process.exit(1);
            }
            break;
            
        case 'full-test':
            console.log("🚀 Full Network Connection Test\n");
            
            const testnetOk = await testNetworkConnection('testnet');
            const mainnetOk = await testNetworkConnection('mainnet');
            
            console.log("\n📊 Connection Test Results:");
            console.log("   BSC Testnet:", testnetOk ? "✅ OK" : "❌ FAILED");
            console.log("   BSC Mainnet:", mainnetOk ? "✅ OK" : "❌ FAILED");
            
            if (testnetOk) {
                console.log("\n🎯 Ready for BSC Testnet deployment!");
            } else {
                console.log("\n⚠️  Fix BSC Testnet connection before deployment");
            }
            break;
            
        default:
            console.log("❌ Unknown command:", command);
            console.log("Use 'test', 'verify', or 'full-test'");
            process.exit(1);
    }
}

if (require.main === module) {
    main()
        .then(() => process.exit(0))
        .catch((error) => {
            console.error(error);
            process.exit(1);
        });
}

module.exports = { 
    testNetworkConnection, 
    verifyContract, 
    verifyLibraries 
};