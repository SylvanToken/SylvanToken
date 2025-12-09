# Design Document: Separate Deployer and Owner Roles

## Overview

This design document outlines the implementation approach for separating the deployer and owner roles in the SylvanToken smart contract system. The solution leverages OpenZeppelin's existing Ownable pattern and adds deployment-time ownership transfer capabilities to enhance security.

### Current State

- Deployer wallet deploys the contract and automatically becomes the owner
- All administrative functions require owner privileges
- Single point of failure if deployer wallet is compromised

### Target State

- Deployer wallet deploys the contract (pays gas fees)
- Ownership can be immediately transferred to a secure wallet (hardware wallet or multisig)
- Administrative control separated from deployment capability
- Enhanced security through role separation

## Architecture

### Component Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Deployment Process                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. Deployer Wallet                                         │
│     └─> Deploys SylvanToken Contract                        │
│         └─> Initial Owner = Deployer                        │
│                                                              │
│  2. Ownership Transfer (Optional)                           │
│     └─> transferOwnership(newOwner)                         │
│         └─> New Owner = Secure Wallet                       │
│                                                              │
│  3. Verification                                            │
│     └─> Check owner() == Secure Wallet                      │
│                                                              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    Role Separation                           │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Deployer Wallet (Standard Wallet)                          │
│  ├─> Deploys contracts                                      │
│  ├─> Pays gas fees                                          │
│  └─> No administrative privileges after transfer            │
│                                                              │
│  Owner Wallet (Secure Wallet)                               │
│  ├─> Hardware wallet or Multisig                            │
│  ├─> All administrative functions                           │
│  ├─> Fee exemption management                               │
│  ├─> Vesting configuration                                  │
│  └─> Trading controls                                       │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### 1. Smart Contract (No Changes Required)

The SylvanToken contract already inherits from OpenZeppelin's Ownable, which provides:

```solidity
// Existing functionality in Ownable
function owner() public view returns (address)
function transferOwnership(address newOwner) public onlyOwner
event OwnershipTransferred(address indexed previousOwner, address indexed newOwner)
```

**No contract modifications needed** - the existing Ownable implementation supports our requirements.

### 2. Deployment Configuration

**File:** `config/deployment.config.js`

Add new configuration section:

```javascript
// 🔐 ROLE SEPARATION CONFIGURATION
roles: {
    // Deployer wallet - pays gas fees for deployment
    deployer: {
        address: process.env.DEPLOYER_ADDRESS || null,
        description: "Wallet that deploys contracts and pays gas fees",
        requiresBalance: true,
        minimumBalance: "0.1", // BNB
        securityLevel: "standard"
    },
    
    // Owner wallet - has administrative privileges
    owner: {
        address: process.env.OWNER_ADDRESS || null,
        description: "Wallet with administrative control over contracts",
        requiresBalance: false, // Can be cold wallet
        securityLevel: "high",
        walletType: "hardware|multisig|standard",
        transferOnDeploy: true // Auto-transfer ownership after deployment
    },
    
    // Validation rules
    validation: {
        allowSameAddress: true, // Allow deployer == owner for testing
        requireDifferentForMainnet: true, // Force separation on mainnet
        validateOwnerAddress: true // Validate owner address before transfer
    }
}
```

### 3. Enhanced Deployment Script

**File:** `scripts/deployment/deploy-with-ownership-transfer.js`

New deployment script with ownership transfer capability:

```javascript
async function main() {
    // 1. Get deployer wallet
    const [deployer] = await ethers.getSigners();
    
    // 2. Get owner address from config or environment
    const ownerAddress = process.env.OWNER_ADDRESS || 
                        deploymentConfig.roles.owner.address ||
                        deployer.address;
    
    // 3. Validate addresses
    validateAddresses(deployer.address, ownerAddress);
    
    // 4. Deploy contract (deployer becomes initial owner)
    const token = await deployContract(deployer);
    
    // 5. Transfer ownership if different from deployer
    if (ownerAddress !== deployer.address) {
        await transferOwnership(token, ownerAddress);
    }
    
    // 6. Verify ownership
    await verifyOwnership(token, ownerAddress);
    
    // 7. Save deployment info
    saveDeploymentInfo(token, deployer.address, ownerAddress);
}
```

### 4. Ownership Transfer Utility

**File:** `scripts/utils/transfer-ownership.js`

Standalone script for transferring ownership after deployment:

```javascript
async function transferOwnership(contractAddress, newOwnerAddress) {
    // 1. Load contract
    const token = await ethers.getContractAt("SylvanToken", contractAddress);
    
    // 2. Get current owner
    const currentOwner = await token.owner();
    
    // 3. Validate new owner
    if (newOwnerAddress === ethers.constants.AddressZero) {
        throw new Error("Cannot transfer to zero address");
    }
    
    // 4. Check if already correct owner
    if (currentOwner === newOwnerAddress) {
        console.log("Already correct owner");
        return;
    }
    
    // 5. Execute transfer
    const tx = await token.transferOwnership(newOwnerAddress);
    await tx.wait();
    
    // 6. Verify transfer
    const verifiedOwner = await token.owner();
    if (verifiedOwner !== newOwnerAddress) {
        throw new Error("Ownership transfer failed");
    }
    
    console.log("Ownership transferred successfully");
}
```

### 5. Verification Script

**File:** `scripts/utils/verify-ownership.js`

Script to check current ownership:

```javascript
async function verifyOwnership(contractAddress) {
    const token = await ethers.getContractAt("SylvanToken", contractAddress);
    const owner = await token.owner();
    
    console.log("Current Owner:", owner);
    
    // Check if owner matches expected configuration
    const expectedOwner = deploymentConfig.roles.owner.address;
    if (expectedOwner && owner !== expectedOwner) {
        console.warn("WARNING: Owner does not match configuration");
    }
    
    return owner;
}
```

## Data Models

### Deployment Record

```javascript
{
    network: "bscMainnet",
    timestamp: "2025-11-11T10:00:00Z",
    deployer: {
        address: "0x...",
        balance: "1.5 BNB",
        role: "deployer"
    },
    owner: {
        address: "0x...",
        walletType: "hardware",
        role: "owner",
        transferredAt: "2025-11-11T10:05:00Z"
    },
    contract: {
        address: "0x...",
        transactionHash: "0x...",
        blockNumber: 12345678
    },
    ownershipTransfer: {
        executed: true,
        transactionHash: "0x...",
        previousOwner: "0x...",
        newOwner: "0x...",
        timestamp: "2025-11-11T10:05:00Z"
    }
}
```

## Error Handling

### Validation Errors

1. **Invalid Owner Address**
   - Check: `newOwner !== address(0)`
   - Error: "Cannot transfer ownership to zero address"
   - Action: Abort deployment

2. **Same Address on Mainnet**
   - Check: `deployer !== owner` on mainnet
   - Warning: "Deployer and owner should be different on mainnet"
   - Action: Require confirmation

3. **Insufficient Balance**
   - Check: Deployer has minimum BNB balance
   - Error: "Insufficient balance for deployment"
   - Action: Abort deployment

### Transfer Errors

1. **Transfer Failed**
   - Check: `owner() === newOwner` after transfer
   - Error: "Ownership transfer verification failed"
   - Action: Retry or manual intervention

2. **Not Current Owner**
   - Check: `msg.sender === owner()` before transfer
   - Error: "Only current owner can transfer ownership"
   - Action: Use correct wallet

3. **Hardware Wallet Connection**
   - Check: Hardware wallet is connected and unlocked
   - Error: "Hardware wallet not accessible"
   - Action: Connect and unlock device

## Testing Strategy

### Unit Tests

1. **Ownership Transfer Test**
   ```javascript
   it("Should transfer ownership to new address", async function() {
       const newOwner = addr1.address;
       await token.transferOwnership(newOwner);
       expect(await token.owner()).to.equal(newOwner);
   });
   ```

2. **Zero Address Rejection Test**
   ```javascript
   it("Should reject transfer to zero address", async function() {
       await expect(
           token.transferOwnership(ethers.constants.AddressZero)
       ).to.be.revertedWith("Ownable: new owner is the zero address");
   });
   ```

3. **Non-Owner Transfer Rejection Test**
   ```javascript
   it("Should reject transfer from non-owner", async function() {
       await expect(
           token.connect(addr1).transferOwnership(addr2.address)
       ).to.be.revertedWith("Ownable: caller is not the owner");
   });
   ```

### Integration Tests

1. **Full Deployment with Transfer**
   - Deploy contract with deployer wallet
   - Transfer ownership to different wallet
   - Verify new owner can call admin functions
   - Verify old owner cannot call admin functions

2. **Hardware Wallet Integration**
   - Deploy with standard wallet
   - Transfer to hardware wallet address
   - Execute admin function from hardware wallet
   - Verify transaction succeeds

3. **Multisig Integration**
   - Deploy with standard wallet
   - Transfer to multisig wallet
   - Execute admin function requiring multiple signatures
   - Verify transaction succeeds

### Manual Testing

1. **Testnet Deployment**
   - Deploy on BSC Testnet with role separation
   - Transfer ownership to test wallet
   - Verify all admin functions work
   - Document process and timing

2. **Mainnet Dry Run**
   - Simulate mainnet deployment locally
   - Test with actual hardware wallet
   - Verify gas costs
   - Document any issues

## Security Considerations

### 1. Address Validation

- Always validate new owner address is not zero address
- Verify address checksum before transfer
- Confirm address ownership before transfer (test transaction)

### 2. Transfer Timing

- Transfer ownership immediately after deployment
- Minimize time window where deployer has control
- Verify transfer before proceeding with configuration

### 3. Backup and Recovery

- Document owner private key backup procedures
- For multisig: document all signer addresses
- For hardware wallet: document recovery seed backup
- Test recovery procedures before mainnet deployment

### 4. Access Control

- Deployer wallet: Hot wallet, minimal funds, deployment only
- Owner wallet: Cold storage, high security, admin functions only
- Never reuse deployer wallet for owner role on mainnet

## Implementation Phases

### Phase 1: Configuration Setup
- Add role configuration to deployment.config.js
- Update environment variables template
- Document configuration options

### Phase 2: Script Development
- Create enhanced deployment script
- Create ownership transfer utility
- Create verification script

### Phase 3: Testing
- Unit tests for ownership transfer
- Integration tests with different wallet types
- Testnet deployment with role separation

### Phase 4: Documentation
- Update deployment guide
- Create ownership transfer guide
- Document security best practices

### Phase 5: Mainnet Deployment
- Deploy with role separation
- Transfer ownership to secure wallet
- Verify and document

## Design Decisions and Rationales

### Decision 1: Use Existing Ownable Pattern

**Rationale:** OpenZeppelin's Ownable is battle-tested and provides all necessary functionality. No need to create custom ownership management.

**Benefits:**
- Security through proven code
- Gas efficiency
- Standard interface
- Community familiarity

### Decision 2: Optional Ownership Transfer

**Rationale:** Allow same address for testing environments while enforcing separation for production.

**Benefits:**
- Flexibility for development
- Security for production
- Gradual adoption path
- Testing simplification

### Decision 3: Immediate Transfer in Deployment Script

**Rationale:** Minimize time window where deployer has admin privileges.

**Benefits:**
- Reduced security risk
- Atomic deployment process
- Clear audit trail
- Simplified operations

### Decision 4: Separate Utility Scripts

**Rationale:** Provide standalone tools for ownership management independent of deployment.

**Benefits:**
- Reusability
- Emergency recovery capability
- Operational flexibility
- Clear separation of concerns

## Dependencies

- OpenZeppelin Contracts (existing): Ownable pattern
- Hardhat (existing): Deployment framework
- ethers.js (existing): Contract interaction
- dotenv (existing): Environment configuration

## Risks and Mitigations

### Risk 1: Wrong Owner Address

**Impact:** Loss of contract control

**Mitigation:**
- Triple-check address before transfer
- Test transfer on testnet first
- Implement address validation
- Require manual confirmation

### Risk 2: Hardware Wallet Issues

**Impact:** Cannot execute admin functions

**Mitigation:**
- Test hardware wallet integration before mainnet
- Document connection procedures
- Have backup hardware wallet
- Test recovery procedures

### Risk 3: Multisig Configuration Error

**Impact:** Cannot reach signature threshold

**Mitigation:**
- Verify all signer addresses
- Test multisig operations on testnet
- Document signature procedures
- Have emergency recovery plan

## Success Criteria

1. ✅ Deployer and owner can be different addresses
2. ✅ Ownership transfer works on testnet
3. ✅ Hardware wallet can be set as owner
4. ✅ Multisig wallet can be set as owner
5. ✅ All admin functions work with new owner
6. ✅ Deployer cannot call admin functions after transfer
7. ✅ Documentation is complete and clear
8. ✅ Mainnet deployment successful with role separation
