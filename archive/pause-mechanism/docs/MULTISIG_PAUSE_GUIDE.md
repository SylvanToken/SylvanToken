# Multi-Signature Pause Mechanism Guide

## 🎯 Overview

The Multi-Signature Pause Mechanism is a decentralized security feature that replaces the traditional single-owner pause functionality. Instead of allowing one address to unilaterally halt token transfers, this system requires multiple independent approvals before the contract can be paused or unpaused.

This mechanism addresses the centralization risk identified in security audits where a single owner could lock all token transfers, creating a single point of failure.

## 🏗️ Architecture

### System Components

```
Multi-Sig Pause System:
├── MultiSigPauseManager Library
│   ├── Proposal Management
│   ├── Approval Collection
│   ├── Timelock Enforcement
│   └── Automatic Unpause
├── SylvanToken Integration
│   ├── Pause State Management
│   ├── Transfer Blocking
│   └── Admin Function Exemption
└── Management Scripts
    ├── Signer Management
    ├── Proposal Creation
    ├── Approval Workflow
    └── Execution Tools
```

### Workflow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    PAUSE PROPOSAL WORKFLOW                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. CREATE PROPOSAL                                              │
│     ┌──────────────┐                                            │
│     │ Signer 1     │──────► createPauseProposal()               │
│     └──────────────┘        ↓                                   │
│                        Proposal Created (ID: X)                  │
│                                                                  │
│  2. COLLECT APPROVALS                                            │
│     ┌──────────────┐                                            │
│     │ Signer 2     │──────► approvePauseProposal(X)             │
│     └──────────────┘        ↓                                   │
│     ┌──────────────┐   Approval Count: 2/3                      │
│     │ Signer 3     │──────► approvePauseProposal(X)             │
│     └──────────────┘        ↓                                   │
│                        Quorum Met! (3/3)                         │
│                                                                  │
│  3. WAIT FOR TIMELOCK                                            │
│     ┌──────────────┐                                            │
│     │ 24 hours     │ (configurable: 6-48 hours)                 │
│     └──────────────┘                                            │
│                                                                  │
│  4. EXECUTE PROPOSAL                                             │
│     ┌──────────────┐                                            │
│     │ Any Signer   │──────► executeProposal(X)                  │
│     └──────────────┘        ↓                                   │
│                        Contract Paused ✓                         │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## ⚙️ Configuration Parameters

### Parameter Bounds

| Parameter | Minimum | Maximum | Default | Description |
|-----------|---------|---------|---------|-------------|
| Quorum Threshold | 2 | 10 | 3 | Minimum signatures required |
| Authorized Signers | 2 | 10 | 5 | Number of addresses that can sign |
| Timelock Duration | 6 hours | 48 hours | 24 hours | Delay before execution |
| Max Pause Duration | 7 days | 30 days | 14 days | Auto-unpause after this time |
| Proposal Lifetime | 7 days | 30 days | 14 days | Proposal expires if not executed |
| Proposal Cooldown | 1 hour | 24 hours | 6 hours | Time between proposals from same signer |

### Configuration Example

```javascript
// deployment.config.js
multiSigPause: {
    enabled: true,
    initialSigners: [
        "0x1234...", // Signer 1
        "0x5678...", // Signer 2
        "0x9ABC..."  // Signer 3
    ],
    quorumThreshold: 2,           // 2 of 3 required
    timelockDuration: 24 * 3600,  // 24 hours
    maxPauseDuration: 14 * 86400, // 14 days
    proposalLifetime: 14 * 86400, // 14 days
    proposalCooldown: 6 * 3600    // 6 hours
}
```

## 🔐 Security Features

### 1. Quorum Enforcement
- Minimum 2 signers required for any pause action
- Configurable threshold (2-10 signers)
- Prevents single point of failure

### 2. Timelock Protection
- Mandatory delay between proposal and execution
- Gives community time to review and respond
- Configurable from 6 to 48 hours

### 3. Emergency Bypass
- Unanimous approval (all signers) can bypass timelock
- For critical security incidents only
- Still requires all authorized signers to agree

### 4. Automatic Unpause
- Contract cannot remain paused indefinitely
- Auto-unpause after max duration (7-30 days)
- Protects against inactive or compromised signers

### 5. Proposal Expiration
- Proposals expire after lifetime period
- Prevents stale proposals from being executed
- Configurable from 7 to 30 days

### 6. Cooldown Period
- Prevents proposal spam from single signer
- Configurable from 1 to 24 hours
- Each signer has independent cooldown

### 7. Replay Attack Prevention
- Unique proposal IDs (counter-based)
- Cannot reuse or replay old proposals
- Each proposal tracked independently

## 📋 Usage Guide

### Creating a Pause Proposal

```bash
# Using management script
npx hardhat run scripts/management/create-pause-proposal.js --network bscMainnet

# Or programmatically
const tx = await token.createPauseProposal();
const receipt = await tx.wait();
const proposalId = receipt.events[0].args.proposalId;
```

### Approving a Proposal

```bash
# Using management script
npx hardhat run scripts/management/approve-pause-proposal.js --network bscMainnet

# Or programmatically
await token.approvePauseProposal(proposalId);
```

### Executing a Proposal

```bash
# Using management script
npx hardhat run scripts/management/execute-pause-proposal.js --network bscMainnet

# Or programmatically
await token.executeProposal(proposalId);
```

### Managing Signers

```bash
# Add a new signer (owner only)
npx hardhat run scripts/management/manage-pause-signers.js --network bscMainnet
# Select: Add Signer

# Remove a signer (owner only)
npx hardhat run scripts/management/manage-pause-signers.js --network bscMainnet
# Select: Remove Signer

# Update quorum threshold (owner only)
npx hardhat run scripts/management/manage-pause-signers.js --network bscMainnet
# Select: Update Quorum
```

## 🔍 Query Functions

### Check Pause Status

```javascript
// Get current pause state
const isPaused = await token.isPaused();
const pauseInfo = await token.getPauseInfo();
// Returns: { isPaused, pausedAt, remainingTime }
```

### Get Proposal Status

```javascript
const status = await token.getProposalStatus(proposalId);
// Returns: {
//   proposalId,
//   proposalType,      // PAUSE or UNPAUSE
//   createdAt,
//   executedAt,
//   executed,
//   cancelled,
//   proposer,
//   approvers,
//   approvalCount,
//   canExecute,
//   hasExpired,
//   timelockRemaining
// }
```

### Check Signer Status

```javascript
// Get all authorized signers
const signers = await token.getAuthorizedSigners();

// Check if address is authorized
const isAuthorized = await token.isAuthorizedSigner(address);

// Get multi-sig configuration
const config = await token.getMultiSigConfig();
```

## 📊 Events

The system emits comprehensive events for transparency:

| Event | Description |
|-------|-------------|
| `PauseProposalCreated` | New pause proposal created |
| `UnpauseProposalCreated` | New unpause proposal created |
| `ProposalApproved` | Signer approved a proposal |
| `ProposalExecuted` | Proposal was executed |
| `ProposalCancelled` | Proposal was cancelled |
| `ContractPausedMultiSig` | Contract paused via multi-sig |
| `ContractUnpausedMultiSig` | Contract unpaused via multi-sig |
| `AutoUnpauseTriggered` | Automatic unpause occurred |
| `AuthorizedSignerAdded` | New signer added |
| `AuthorizedSignerRemoved` | Signer removed |
| `QuorumThresholdUpdated` | Quorum changed |

## ⚠️ Error Handling

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `UnauthorizedSigner` | Caller is not an authorized signer | Use an authorized signer address |
| `ProposalNotFound` | Invalid proposal ID | Check proposal ID exists |
| `ProposalAlreadyExecuted` | Proposal already executed | Cannot interact with executed proposals |
| `ProposalExpired` | Proposal lifetime exceeded | Create a new proposal |
| `TimelockNotElapsed` | Timelock period not complete | Wait for timelock or get unanimous approval |
| `QuorumNotMet` | Insufficient approvals | Collect more approvals |
| `AlreadyApproved` | Signer already approved | Each signer can only approve once |
| `ContractAlreadyPaused` | Trying to pause when paused | Create unpause proposal instead |
| `ContractNotPaused` | Trying to unpause when not paused | Contract is already operational |
| `ProposalCooldownActive` | Signer in cooldown period | Wait for cooldown to expire |

## 🛡️ Best Practices

### For Signers

1. **Verify Before Approving**: Always verify the proposal details before approving
2. **Coordinate with Team**: Communicate with other signers before creating proposals
3. **Monitor Proposals**: Regularly check for pending proposals requiring approval
4. **Secure Keys**: Use hardware wallets for signer addresses
5. **Document Actions**: Keep records of all pause-related actions

### For Administrators

1. **Distribute Signers**: Use geographically distributed signers
2. **Regular Audits**: Periodically review signer list and access
3. **Emergency Procedures**: Document emergency bypass procedures
4. **Backup Plans**: Have contingency plans for signer unavailability
5. **Monitor Events**: Set up alerts for pause-related events

### For Deployment

1. **Test Thoroughly**: Test all scenarios on testnet first
2. **Verify Configuration**: Double-check all parameters before mainnet
3. **Document Signers**: Maintain secure records of signer identities
4. **Plan Transitions**: Have clear procedures for signer changes
5. **Monitor Auto-Unpause**: Be aware of max pause duration limits

## 🔄 Migration from Single-Owner Pause

If upgrading from a contract with single-owner pause:

1. **Deploy New Contract**: Deploy with multi-sig pause enabled
2. **Configure Signers**: Set up initial authorized signers
3. **Set Parameters**: Configure timelock, quorum, and durations
4. **Test Workflow**: Verify pause/unpause workflow works correctly
5. **Transfer Assets**: Migrate tokens and ownership as needed
6. **Deprecate Old**: Disable old pause mechanism if applicable

## 📚 Related Documentation

- [Security Guide](./SECURITY.md) - Comprehensive security documentation
- [Enhanced System Overview](./ENHANCED_SYSTEM_OVERVIEW.md) - System architecture
- [Deployment Guide](./ENHANCED_DEPLOYMENT_GUIDE.md) - Deployment instructions
- [API Reference](./ENHANCED_API_REFERENCE.md) - Contract interfaces

---

**Multi-Sig Pause Guide Version**: 1.0.0  
**Last Updated**: December 2025  
**Compatible With**: SylvanToken v1.1.0+
