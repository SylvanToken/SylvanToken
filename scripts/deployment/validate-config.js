// Validate Mainnet Configuration
const { ethers } = require("ethers");

function validateAddress(address, name) {
    if (!address) {
        console.error(`❌ ${name}: Address is missing!`);
        return false;
    }
    
    if (!ethers.utils.isAddress(address)) {
        console.error(`❌ ${name}: Invalid address format: ${address}`);
        return false;
    }
    
    // Check if address is checksummed
    const checksummed = ethers.utils.getAddress(address);
    if (address !== checksummed) {
        console.warn(`⚠️  ${name}: Address is not checksummed`);
        console.warn(`   Current: ${address}`);
        console.warn(`   Should be: ${checksummed}`);
    }
    
    console.log(`✅ ${name}: ${address}`);
    return true;
}

async function main() {
    console.log("\n🔍 Validating Mainnet Configuration...\n");
    
    const config = require("../../config/deployment.config.js");
    const wallets = config.wallets;
    
    let isValid = true;
    
    // Validate System Wallets
    console.log("📋 System Wallets:");
    console.log("-".repeat(80));
    isValid = validateAddress(wallets.system.sylvanToken.address, "Sylvan Token Wallet") && isValid;
    isValid = validateAddress(wallets.system.founder.address, "Founder Wallet") && isValid;
    isValid = validateAddress(wallets.system.fee.address, "Fee Collection Wallet") && isValid;
    isValid = validateAddress(wallets.system.donation.address, "Donation Wallet") && isValid;
    isValid = validateAddress(wallets.system.locked.address, "Locked Reserve Wallet") && isValid;
    isValid = validateAddress(wallets.system.dead.address, "Burn Address") && isValid;
    console.log();
    
    // Validate Admin Wallets
    console.log("👥 Admin Wallets:");
    console.log("-".repeat(80));
    isValid = validateAddress(wallets.admins.mad.address, "MAD User Wallet") && isValid;
    isValid = validateAddress(wallets.admins.leb.address, "LEB User Wallet") && isValid;
    isValid = validateAddress(wallets.admins.cnk.address, "CNK User Wallet") && isValid;
    isValid = validateAddress(wallets.admins.kdr.address, "KDR User Wallet") && isValid;
    console.log();
    
    // Check for duplicate addresses
    console.log("🔍 Checking for Duplicate Addresses:");
    console.log("-".repeat(80));
    const addresses = [
        { name: "Sylvan Token", address: wallets.system.sylvanToken.address },
        { name: "Founder", address: wallets.system.founder.address },
        { name: "Fee Collection", address: wallets.system.fee.address },
        { name: "Donation", address: wallets.system.donation.address },
        { name: "Locked Reserve", address: wallets.system.locked.address },
        { name: "MAD", address: wallets.admins.mad.address },
        { name: "LEB", address: wallets.admins.leb.address },
        { name: "CNK", address: wallets.admins.cnk.address },
        { name: "KDR", address: wallets.admins.kdr.address }
    ];
    
    const addressMap = new Map();
    let hasDuplicates = false;
    
    for (const wallet of addresses) {
        const addr = wallet.address.toLowerCase();
        if (addressMap.has(addr)) {
            console.error(`❌ Duplicate address found!`);
            console.error(`   ${wallet.name}: ${wallet.address}`);
            console.error(`   ${addressMap.get(addr)}: ${wallet.address}`);
            hasDuplicates = true;
            isValid = false;
        } else {
            addressMap.set(addr, wallet.name);
        }
    }
    
    if (!hasDuplicates) {
        console.log("✅ No duplicate addresses found");
    }
    console.log();
    
    // Validate Allocations
    console.log("💰 Token Allocations:");
    console.log("-".repeat(80));
    const allocations = config.allocations;
    const totalAllocated = 
        parseInt(allocations.founder) +
        parseInt(allocations.sylvanToken) +
        parseInt(allocations.locked) +
        parseInt(allocations.admins.mad) +
        parseInt(allocations.admins.leb) +
        parseInt(allocations.admins.cnk) +
        parseInt(allocations.admins.kdr);
    
    console.log(`Total Supply: ${allocations.total} SYL`);
    console.log(`Total Allocated: ${totalAllocated} SYL`);
    
    if (totalAllocated === parseInt(allocations.total)) {
        console.log("✅ Allocations match total supply");
    } else {
        console.error(`❌ Allocation mismatch!`);
        console.error(`   Expected: ${allocations.total}`);
        console.error(`   Got: ${totalAllocated}`);
        isValid = false;
    }
    console.log();
    
    // Validate Fee Structure
    console.log("💸 Fee Structure:");
    console.log("-".repeat(80));
    const feeStructure = config.feeStructure;
    const totalDistribution = 
        feeStructure.distribution.feeWallet +
        feeStructure.distribution.donation +
        feeStructure.distribution.burn;
    
    console.log(`Tax Rate: ${feeStructure.taxRate / 100}%`);
    console.log(`Fee Distribution Total: ${totalDistribution / 100}%`);
    
    if (totalDistribution === feeStructure.taxDenominator) {
        console.log("✅ Fee distribution adds up to 100%");
    } else {
        console.error(`❌ Fee distribution mismatch!`);
        console.error(`   Expected: ${feeStructure.taxDenominator}`);
        console.error(`   Got: ${totalDistribution}`);
        isValid = false;
    }
    console.log();
    
    // Final Result
    console.log("=".repeat(80));
    if (isValid) {
        console.log("✅ CONFIGURATION IS VALID - READY FOR DEPLOYMENT!");
    } else {
        console.log("❌ CONFIGURATION HAS ERRORS - PLEASE FIX BEFORE DEPLOYMENT!");
    }
    console.log("=".repeat(80));
    console.log();
    
    process.exit(isValid ? 0 : 1);
}

main()
    .then(() => {})
    .catch((error) => {
        console.error("\n❌ Validation failed:");
        console.error(error);
        process.exit(1);
    });
