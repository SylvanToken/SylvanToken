/**
 * @title Transfer Ownership to Safe Wallet
 * @dev Script to transfer contract ownership from current owner to Safe multisig
 * @notice This action is IRREVERSIBLE - double check before executing!
 */

const hre = require("hardhat");
const safeConfig = require("../../config/safe-wallet.config.js");

// Contract and wallet addresses
const CONTRACT_ADDRESS = "0xc66404C3fa3E01378027b4A4411812D3a8D458F5";
const CURRENT_OWNER = "0x465b54282e4885f61df7eB7CcDc2493DB35C9501";
const SAFE_WALLET = "0xC5CcDC8F01739CeD02B30b5aD10DD5Fb201436bB";

async function main() {
    console.log("=".repeat(60));
    console.log("🔐 OWNERSHIP TRANSFER TO SAFE WALLET");
    console.log("=".repeat(60));
    
    // Display configuration
    console.log("\n📋 Configuration:");
    console.log(`   Contract: ${CONTRACT_ADDRESS}`);
    console.log(`   Current Owner: ${CURRENT_OWNER}`);
    console.log(`   New Owner (Safe): ${SAFE_WALLET}`);
    
    // Get signer
    const [signer] = await hre.ethers.getSigners();
    console.log(`\n👤 Signer Address: ${signer.address}`);
    
    // Verify signer is current owner
    if (signer.address.toLowerCase() !== CURRENT_OWNER.toLowerCase()) {
        console.log("\n❌ ERROR: Signer is not the current owner!");
        console.log(`   Expected: ${CURRENT_OWNER}`);
        console.log(`   Got: ${signer.address}`);
        console.log("\n⚠️  Please use the Owner wallet to run this script.");
        process.exit(1);
    }
    
    // Get contract instance
    const token = await hre.ethers.getContractAt("SylvanToken", CONTRACT_ADDRESS);
    
    // Verify current owner
    const currentOwner = await token.owner();
    console.log(`\n🔍 Verifying current owner: ${currentOwner}`);
    
    if (currentOwner.toLowerCase() !== CURRENT_OWNER.toLowerCase()) {
        console.log("\n❌ ERROR: Current owner mismatch!");
        process.exit(1);
    }
    
    console.log("✅ Current owner verified");
    
    // Display Safe Wallet signers
    console.log("\n👥 Safe Wallet Signers (2/3 threshold):");
    safeConfig.signers.forEach((s, i) => {
        console.log(`   ${i + 1}. ${s.name}: ${s.address}`);
    });
    
    // Warning
    console.log("\n" + "⚠️".repeat(30));
    console.log("⚠️  WARNING: THIS ACTION IS IRREVERSIBLE!");
    console.log("⚠️  After transfer, only Safe Wallet can manage the contract.");
    console.log("⚠️  Make sure Safe Wallet is properly configured with signers.");
    console.log("⚠️".repeat(30));
    
    // Confirmation prompt
    console.log("\n📝 To proceed, uncomment the transfer code below and run again.");
    console.log("   This is a safety measure to prevent accidental transfers.\n");
    
    // ============================================
    // UNCOMMENT BELOW TO EXECUTE TRANSFER
    // ============================================
    
    /*
    console.log("\n🚀 Initiating ownership transfer...");
    
    const tx = await token.transferOwnership(SAFE_WALLET);
    console.log(`   Transaction hash: ${tx.hash}`);
    console.log("   Waiting for confirmation...");
    
    await tx.wait();
    
    // Verify new owner
    const newOwner = await token.owner();
    console.log(`\n✅ Ownership transferred successfully!`);
    console.log(`   New Owner: ${newOwner}`);
    
    if (newOwner.toLowerCase() === SAFE_WALLET.toLowerCase()) {
        console.log("\n🎉 SUCCESS! Safe Wallet is now the contract owner.");
        console.log("\n📋 Next Steps:");
        console.log("   1. Verify on BSCScan that owner changed");
        console.log("   2. Test a read function from Safe");
        console.log("   3. All owner operations now require Safe multi-sig");
    } else {
        console.log("\n❌ ERROR: Owner verification failed!");
    }
    */
    
    // ============================================
    // END OF TRANSFER CODE
    // ============================================
    
    console.log("=".repeat(60));
    console.log("📖 For manual transfer via BSCScan or Safe:");
    console.log("=".repeat(60));
    console.log("\n1. Go to BSCScan Contract Write:");
    console.log(`   https://bscscan.com/address/${CONTRACT_ADDRESS}#writeContract`);
    console.log("\n2. Connect Owner Wallet:");
    console.log(`   ${CURRENT_OWNER}`);
    console.log("\n3. Find 'transferOwnership' function");
    console.log("\n4. Enter new owner address:");
    console.log(`   ${SAFE_WALLET}`);
    console.log("\n5. Click 'Write' and confirm transaction");
    console.log("\n6. Verify new owner on BSCScan Read Contract");
    console.log("=".repeat(60));
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
