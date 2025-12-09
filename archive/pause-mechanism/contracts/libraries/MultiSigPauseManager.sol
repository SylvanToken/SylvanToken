// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title MultiSigPauseManager
 * @dev Library for managing multi-signature pause mechanism with timelock and automatic unpause
 * @notice This library provides decentralized pause control requiring multiple approvals
 */
library MultiSigPauseManager {
    
    // ============================================================================
    // CONSTANTS
    // ============================================================================
    
    // Configuration bounds
    uint256 public constant MIN_SIGNERS = 2;
    uint256 public constant MAX_SIGNERS = 10;
    uint256 public constant MIN_TIMELOCK = 6 hours;
    uint256 public constant MAX_TIMELOCK = 48 hours;
    uint256 public constant MIN_MAX_PAUSE_DURATION = 7 days;
    uint256 public constant MAX_MAX_PAUSE_DURATION = 30 days;
    uint256 public constant MIN_PROPOSAL_LIFETIME = 7 days;
    uint256 public constant MAX_PROPOSAL_LIFETIME = 30 days;
    uint256 public constant MIN_PROPOSAL_COOLDOWN = 1 hours;
    uint256 public constant MAX_PROPOSAL_COOLDOWN = 24 hours;
    
    // Default values
    uint256 public constant DEFAULT_TIMELOCK = 24 hours;
    uint256 public constant DEFAULT_MAX_PAUSE_DURATION = 14 days;
    uint256 public constant DEFAULT_PROPOSAL_LIFETIME = 14 days;
    uint256 public constant DEFAULT_PROPOSAL_COOLDOWN = 6 hours;
    
    // ============================================================================
    // ENUMS
    // ============================================================================
    
    /**
     * @dev Type of proposal
     */
    enum ProposalType {
        PAUSE,
        UNPAUSE
    }
    
    // ============================================================================
    // STRUCTS
    // ============================================================================
    
    /**
     * @dev Pause proposal structure
     */
    struct PauseProposal {
        uint256 proposalId;
        ProposalType proposalType;
        uint256 createdAt;
        uint256 executedAt;
        bool executed;
        bool cancelled;
        address proposer;
        address[] approvers;
        mapping(address => bool) hasApproved;
        uint256 approvalCount;
    }
    
    /**
     * @dev Multi-signature configuration
     */
    struct MultiSigConfig {
        address[] authorizedSigners;
        mapping(address => bool) isAuthorizedSigner;
        mapping(address => uint256) signerIndex; // For efficient removal
        uint256 quorumThreshold;
        uint256 timelockDuration;
        uint256 maxPauseDuration;
        uint256 proposalLifetime;
        uint256 proposalCooldown;
        mapping(address => uint256) lastProposalTime;
        uint256 signerCount;
    }
    
    /**
     * @dev Pause state management
     */
    struct PauseState {
        bool isPaused;
        uint256 pausedAt;
        uint256 pauseProposalId;
        uint256 activeProposalCount;
        uint256 nextProposalId;
        mapping(uint256 => PauseProposal) proposals;
    }
    
    /**
     * @dev View struct for proposal status (no mappings)
     */
    struct ProposalStatusView {
        uint256 proposalId;
        ProposalType proposalType;
        uint256 createdAt;
        uint256 executedAt;
        bool executed;
        bool cancelled;
        address proposer;
        address[] approvers;
        uint256 approvalCount;
        bool canExecute;
        bool hasExpired;
        uint256 timelockRemaining;
    }
    
    /**
     * @dev View struct for multi-sig configuration (no mappings)
     */
    struct MultiSigConfigView {
        address[] authorizedSigners;
        uint256 quorumThreshold;
        uint256 timelockDuration;
        uint256 maxPauseDuration;
        uint256 proposalLifetime;
        uint256 proposalCooldown;
        uint256 signerCount;
    }
    
    // ============================================================================
    // EVENTS
    // ============================================================================
    
    event PauseProposalCreated(uint256 indexed proposalId, address indexed proposer, uint256 timestamp);
    event UnpauseProposalCreated(uint256 indexed proposalId, address indexed proposer, uint256 timestamp);
    event ProposalApproved(uint256 indexed proposalId, address indexed approver, uint256 approvalCount, uint256 quorumThreshold);
    event ProposalExecuted(uint256 indexed proposalId, ProposalType proposalType, address indexed executor);
    event ProposalCancelled(uint256 indexed proposalId, address indexed canceller, string reason);
    event ContractPausedMultiSig(uint256 indexed proposalId, address[] approvers, uint256 timestamp);
    event ContractUnpausedMultiSig(uint256 indexed proposalId, address[] approvers, uint256 timestamp);
    event AutoUnpauseTriggered(uint256 pauseDuration, uint256 timestamp);
    event AuthorizedSignerAdded(address indexed signer, uint256 totalSigners);
    event AuthorizedSignerRemoved(address indexed signer, uint256 totalSigners);
    event QuorumThresholdUpdated(uint256 oldThreshold, uint256 newThreshold);
    event TimelockDurationUpdated(uint256 oldDuration, uint256 newDuration);
    event MaxPauseDurationUpdated(uint256 oldDuration, uint256 newDuration);
    
    // ============================================================================
    // ERRORS
    // ============================================================================
    
    error UnauthorizedSigner(address signer);
    error ProposalNotFound(uint256 proposalId);
    error ProposalAlreadyExecuted(uint256 proposalId);
    error ProposalAlreadyCancelled(uint256 proposalId);
    error ProposalExpired(uint256 proposalId);
    error TimelockNotElapsed(uint256 proposalId, uint256 remainingTime);
    error QuorumNotMet(uint256 proposalId, uint256 currentApprovals, uint256 required);
    error AlreadyApproved(uint256 proposalId, address signer);
    error InvalidProposalType(uint256 proposalId);
    error ContractAlreadyPaused();
    error ContractNotPaused();
    error ProposalCooldownActive(address signer, uint256 remainingTime);
    error InvalidQuorumThreshold(uint256 threshold, uint256 signerCount);
    error InvalidTimelockDuration(uint256 duration);
    error InvalidMaxPauseDuration(uint256 duration);
    error SignerAlreadyAuthorized(address signer);
    error SignerNotAuthorized(address signer);
    error CannotRemoveLastSigner();
    error InsufficientSignersForQuorum(uint256 signerCount, uint256 quorum);
    error ZeroAddress();
    error InvalidSignerCount(uint256 count);
    error InvalidProposalLifetime(uint256 lifetime);
    error InvalidProposalCooldown(uint256 cooldown);
    
    // ============================================================================
    // INITIALIZATION
    // ============================================================================
    
    /**
     * @dev Initialize multi-sig configuration with deployment parameters
     * @param config Multi-sig configuration storage reference
     * @param initialSigners Array of initial authorized signers
     * @param quorumThreshold Minimum approvals required
     * @param timelockDuration Delay before execution
     * @param maxPauseDuration Maximum pause duration before auto-unpause
     * @param proposalLifetime Maximum time a proposal remains valid
     * @param proposalCooldown Minimum time between proposals from same signer
     */
    function initialize(
        MultiSigConfig storage config,
        address[] memory initialSigners,
        uint256 quorumThreshold,
        uint256 timelockDuration,
        uint256 maxPauseDuration,
        uint256 proposalLifetime,
        uint256 proposalCooldown
    ) external {
        // Validate parameters (Requirement 5.5)
        if (initialSigners.length < MIN_SIGNERS || initialSigners.length > MAX_SIGNERS) {
            revert InvalidSignerCount(initialSigners.length);
        }
        if (quorumThreshold < 2 || quorumThreshold > initialSigners.length) {
            revert InvalidQuorumThreshold(quorumThreshold, initialSigners.length);
        }
        if (timelockDuration < MIN_TIMELOCK || timelockDuration > MAX_TIMELOCK) {
            revert InvalidTimelockDuration(timelockDuration);
        }
        if (maxPauseDuration < MIN_MAX_PAUSE_DURATION || maxPauseDuration > MAX_MAX_PAUSE_DURATION) {
            revert InvalidMaxPauseDuration(maxPauseDuration);
        }
        if (proposalLifetime < MIN_PROPOSAL_LIFETIME || proposalLifetime > MAX_PROPOSAL_LIFETIME) {
            revert InvalidProposalLifetime(proposalLifetime);
        }
        if (proposalCooldown < MIN_PROPOSAL_COOLDOWN || proposalCooldown > MAX_PROPOSAL_COOLDOWN) {
            revert InvalidProposalCooldown(proposalCooldown);
        }
        
        // Validate and add initial signers
        for (uint256 i = 0; i < initialSigners.length; i++) {
            address signer = initialSigners[i];
            if (signer == address(0)) revert ZeroAddress();
            if (config.isAuthorizedSigner[signer]) revert SignerAlreadyAuthorized(signer);
            
            config.authorizedSigners.push(signer);
            config.isAuthorizedSigner[signer] = true;
            config.signerIndex[signer] = i;
        }
        
        config.signerCount = initialSigners.length;
        config.quorumThreshold = quorumThreshold;
        config.timelockDuration = timelockDuration;
        config.maxPauseDuration = maxPauseDuration;
        config.proposalLifetime = proposalLifetime;
        config.proposalCooldown = proposalCooldown;
    }
    
    // ============================================================================
    // PROPOSAL CREATION AND MANAGEMENT
    // ============================================================================
    
    /**
     * @dev Create a pause proposal
     * @param state Pause state storage reference
     * @param config Multi-sig configuration storage reference
     * @param proposer Address creating the proposal
     * @return proposalId The ID of the created proposal
     * 
     * Requirements:
     * - Proposer must be an authorized signer (Requirement 1.1)
     * - Contract must not already be paused (Requirement 1.5)
     * - Proposer must not be in cooldown period (Requirement 8.1)
     */
    function createPauseProposal(
        PauseState storage state,
        MultiSigConfig storage config,
        address proposer
    ) external returns (uint256 proposalId) {
        // Validate proposer is authorized signer
        if (!config.isAuthorizedSigner[proposer]) {
            revert UnauthorizedSigner(proposer);
        }
        
        // Check contract is not already paused (Requirement 1.5)
        if (state.isPaused) {
            revert ContractAlreadyPaused();
        }
        
        // Check cooldown period (Requirement 8.1)
        uint256 lastProposal = config.lastProposalTime[proposer];
        if (lastProposal > 0 && block.timestamp < lastProposal + config.proposalCooldown) {
            uint256 remainingTime = (lastProposal + config.proposalCooldown) - block.timestamp;
            revert ProposalCooldownActive(proposer, remainingTime);
        }
        
        // Generate unique proposal ID (Requirement 8.2)
        proposalId = state.nextProposalId;
        state.nextProposalId++;
        
        // Create proposal
        PauseProposal storage proposal = state.proposals[proposalId];
        proposal.proposalId = proposalId;
        proposal.proposalType = ProposalType.PAUSE;
        proposal.createdAt = block.timestamp;
        proposal.proposer = proposer;
        proposal.executed = false;
        proposal.cancelled = false;
        proposal.approvalCount = 0;
        
        // Update state
        state.activeProposalCount++;
        config.lastProposalTime[proposer] = block.timestamp;
        
        // Emit event (Requirement 6.1)
        emit PauseProposalCreated(proposalId, proposer, block.timestamp);
        
        return proposalId;
    }
    
    /**
     * @dev Create an unpause proposal
     * @param state Pause state storage reference
     * @param config Multi-sig configuration storage reference
     * @param proposer Address creating the proposal
     * @return proposalId The ID of the created proposal
     * 
     * Requirements:
     * - Proposer must be an authorized signer
     * - Contract must be paused (Requirement 4.4)
     * - Proposer must not be in cooldown period (Requirement 8.1)
     */
    function createUnpauseProposal(
        PauseState storage state,
        MultiSigConfig storage config,
        address proposer
    ) external returns (uint256 proposalId) {
        // Validate proposer is authorized signer
        if (!config.isAuthorizedSigner[proposer]) {
            revert UnauthorizedSigner(proposer);
        }
        
        // Check contract is paused
        if (!state.isPaused) {
            revert ContractNotPaused();
        }
        
        // Check cooldown period (Requirement 8.1)
        uint256 lastProposal = config.lastProposalTime[proposer];
        if (lastProposal > 0 && block.timestamp < lastProposal + config.proposalCooldown) {
            uint256 remainingTime = (lastProposal + config.proposalCooldown) - block.timestamp;
            revert ProposalCooldownActive(proposer, remainingTime);
        }
        
        // Generate unique proposal ID (Requirement 8.2)
        proposalId = state.nextProposalId;
        state.nextProposalId++;
        
        // Create proposal
        PauseProposal storage proposal = state.proposals[proposalId];
        proposal.proposalId = proposalId;
        proposal.proposalType = ProposalType.UNPAUSE;
        proposal.createdAt = block.timestamp;
        proposal.proposer = proposer;
        proposal.executed = false;
        proposal.cancelled = false;
        proposal.approvalCount = 0;
        
        // Update state
        state.activeProposalCount++;
        config.lastProposalTime[proposer] = block.timestamp;
        
        // Emit event (Requirement 6.1)
        emit UnpauseProposalCreated(proposalId, proposer, block.timestamp);
        
        return proposalId;
    }
    
    /**
     * @dev Cancel a proposal
     * @param state Pause state storage reference
     * @param config Multi-sig configuration storage reference
     * @param proposalId ID of the proposal to cancel
     * @param canceller Address cancelling the proposal
     * @param reason Reason for cancellation
     * 
     * Requirements:
     * - Proposal must exist
     * - Proposal must not be executed
     * - Proposal must not already be cancelled
     * - Canceller must be the proposer or an authorized signer
     */
    function cancelProposal(
        PauseState storage state,
        MultiSigConfig storage config,
        uint256 proposalId,
        address canceller,
        string memory reason
    ) external {
        // Validate proposal exists
        PauseProposal storage proposal = state.proposals[proposalId];
        if (proposal.createdAt == 0) {
            revert ProposalNotFound(proposalId);
        }
        
        // Check proposal is not executed
        if (proposal.executed) {
            revert ProposalAlreadyExecuted(proposalId);
        }
        
        // Check proposal is not already cancelled
        if (proposal.cancelled) {
            revert ProposalAlreadyCancelled(proposalId);
        }
        
        // Validate canceller is proposer or authorized signer
        if (canceller != proposal.proposer && !config.isAuthorizedSigner[canceller]) {
            revert UnauthorizedSigner(canceller);
        }
        
        // Cancel proposal
        proposal.cancelled = true;
        state.activeProposalCount--;
        
        // Emit event (Requirement 6.5)
        emit ProposalCancelled(proposalId, canceller, reason);
    }
    
    /**
     * @dev Check if a proposal has expired
     * @param state Pause state storage reference
     * @param config Multi-sig configuration storage reference
     * @param proposalId ID of the proposal to check
     * @return expired True if proposal has expired
     * 
     * Requirements:
     * - Checks proposal age against maximum proposal lifetime (Requirement 8.5)
     */
    function isProposalExpired(
        PauseState storage state,
        MultiSigConfig storage config,
        uint256 proposalId
    ) public view returns (bool expired) {
        PauseProposal storage proposal = state.proposals[proposalId];
        
        // Proposal doesn't exist or already executed/cancelled
        if (proposal.createdAt == 0 || proposal.executed || proposal.cancelled) {
            return false;
        }
        
        // Check if proposal has exceeded lifetime (Requirement 8.5)
        return block.timestamp > proposal.createdAt + config.proposalLifetime;
    }
    
    // ============================================================================
    // APPROVAL MECHANISM
    // ============================================================================
    
    /**
     * @dev Approve a pause proposal
     * @param state Pause state storage reference
     * @param config Multi-sig configuration storage reference
     * @param proposalId ID of the proposal to approve
     * @param approver Address approving the proposal
     * 
     * Requirements:
     * - Approver must be an authorized signer (Requirement 1.1)
     * - Proposal must exist and not be executed/cancelled
     * - Approver must not have already approved (Requirement 1.3)
     * - Proposal must not be expired (Requirement 8.5)
     */
    function approvePauseProposal(
        PauseState storage state,
        MultiSigConfig storage config,
        uint256 proposalId,
        address approver
    ) external {
        // Validate approver is authorized signer (Requirement 1.1)
        if (!config.isAuthorizedSigner[approver]) {
            revert UnauthorizedSigner(approver);
        }
        
        // Validate proposal exists
        PauseProposal storage proposal = state.proposals[proposalId];
        if (proposal.createdAt == 0) {
            revert ProposalNotFound(proposalId);
        }
        
        // Check proposal is not executed
        if (proposal.executed) {
            revert ProposalAlreadyExecuted(proposalId);
        }
        
        // Check proposal is not cancelled
        if (proposal.cancelled) {
            revert ProposalAlreadyCancelled(proposalId);
        }
        
        // Check proposal has not expired (Requirement 8.5)
        if (isProposalExpired(state, config, proposalId)) {
            revert ProposalExpired(proposalId);
        }
        
        // Prevent duplicate approval (Requirement 1.3)
        if (proposal.hasApproved[approver]) {
            revert AlreadyApproved(proposalId, approver);
        }
        
        // Record approval
        proposal.hasApproved[approver] = true;
        proposal.approvers.push(approver);
        proposal.approvalCount++;
        
        // Emit event (Requirement 6.2)
        emit ProposalApproved(
            proposalId,
            approver,
            proposal.approvalCount,
            config.quorumThreshold
        );
    }
    
    /**
     * @dev Check if quorum is met for a proposal
     * @param state Pause state storage reference
     * @param config Multi-sig configuration storage reference
     * @param proposalId ID of the proposal to check
     * @return met True if quorum is met
     * 
     * Requirements:
     * - Checks if approval count meets or exceeds quorum threshold (Requirement 1.4)
     */
    function isQuorumMet(
        PauseState storage state,
        MultiSigConfig storage config,
        uint256 proposalId
    ) public view returns (bool met) {
        PauseProposal storage proposal = state.proposals[proposalId];
        
        // Proposal doesn't exist or already executed/cancelled
        if (proposal.createdAt == 0 || proposal.executed || proposal.cancelled) {
            return false;
        }
        
        // Check if approval count meets quorum (Requirement 1.4)
        return proposal.approvalCount >= config.quorumThreshold;
    }
    
    /**
     * @dev Check if a proposal can be executed
     * @param state Pause state storage reference
     * @param config Multi-sig configuration storage reference
     * @param proposalId ID of the proposal to check
     * @return canExecute True if proposal can be executed
     * 
     * Requirements:
     * - Proposal must exist and not be executed/cancelled
     * - Quorum must be met (Requirement 1.4)
     * - Timelock must have elapsed (Requirement 3.1, 3.3, 3.4)
     * - Proposal must not be expired (Requirement 8.5)
     */
    function canExecuteProposal(
        PauseState storage state,
        MultiSigConfig storage config,
        uint256 proposalId
    ) public view returns (bool) {
        PauseProposal storage proposal = state.proposals[proposalId];
        
        // Proposal doesn't exist
        if (proposal.createdAt == 0) {
            return false;
        }
        
        // Already executed or cancelled
        if (proposal.executed || proposal.cancelled) {
            return false;
        }
        
        // Check if expired
        if (isProposalExpired(state, config, proposalId)) {
            return false;
        }
        
        // Check quorum (Requirement 1.4)
        if (!isQuorumMet(state, config, proposalId)) {
            return false;
        }
        
        // Check timelock (Requirement 3.1, 3.3, 3.4)
        uint256 timelockEnd = proposal.createdAt + config.timelockDuration;
        if (block.timestamp < timelockEnd) {
            return false;
        }
        
        return true;
    }
    
    /**
     * @dev Get proposal status view
     * @param state Pause state storage reference
     * @param config Multi-sig configuration storage reference
     * @param proposalId ID of the proposal
     * @return status Proposal status view struct
     */
    function getProposalStatus(
        PauseState storage state,
        MultiSigConfig storage config,
        uint256 proposalId
    ) external view returns (ProposalStatusView memory status) {
        PauseProposal storage proposal = state.proposals[proposalId];
        
        if (proposal.createdAt == 0) {
            revert ProposalNotFound(proposalId);
        }
        
        status.proposalId = proposal.proposalId;
        status.proposalType = proposal.proposalType;
        status.createdAt = proposal.createdAt;
        status.executedAt = proposal.executedAt;
        status.executed = proposal.executed;
        status.cancelled = proposal.cancelled;
        status.proposer = proposal.proposer;
        status.approvers = proposal.approvers;
        status.approvalCount = proposal.approvalCount;
        status.hasExpired = isProposalExpired(state, config, proposalId);
        
        // Calculate timelock remaining
        uint256 timelockEnd = proposal.createdAt + config.timelockDuration;
        if (block.timestamp < timelockEnd) {
            status.timelockRemaining = timelockEnd - block.timestamp;
        } else {
            status.timelockRemaining = 0;
        }
        
        // Check if can execute
        status.canExecute = canExecuteProposal(state, config, proposalId);
        
        return status;
    }
    
    // ============================================================================
    // PROPOSAL EXECUTION
    // ============================================================================
    
    /**
     * @dev Check if proposal has unanimous approval (all signers approved)
     * @param state Pause state storage reference
     * @param config Multi-sig configuration storage reference
     * @param proposalId ID of the proposal to check
     * @return unanimous True if all authorized signers have approved
     * 
     * Requirements:
     * - Used for emergency bypass validation (Requirement 3.5)
     */
    function hasUnanimousApproval(
        PauseState storage state,
        MultiSigConfig storage config,
        uint256 proposalId
    ) public view returns (bool unanimous) {
        PauseProposal storage proposal = state.proposals[proposalId];
        
        // Proposal doesn't exist or already executed/cancelled
        if (proposal.createdAt == 0 || proposal.executed || proposal.cancelled) {
            return false;
        }
        
        // Check if all signers have approved (Requirement 3.5)
        return proposal.approvalCount == config.signerCount;
    }
    
    /**
     * @dev Execute a proposal (pause or unpause)
     * @param state Pause state storage reference
     * @param config Multi-sig configuration storage reference
     * @param proposalId ID of the proposal to execute
     * @param executor Address executing the proposal
     * @return executed True if execution was successful
     * 
     * Requirements:
     * - Proposal must exist and not be executed/cancelled
     * - Quorum must be met (Requirement 1.4)
     * - Timelock must have elapsed OR unanimous approval for emergency bypass (Requirement 3.1, 3.3, 3.4, 3.5)
     * - Proposal must not be expired (Requirement 8.5)
     * - For pause proposals: contract must not be paused
     * - For unpause proposals: contract must be paused (Requirement 4.4)
     */
    function executeProposal(
        PauseState storage state,
        MultiSigConfig storage config,
        uint256 proposalId,
        address executor
    ) external returns (bool executed) {
        // Validate proposal exists
        PauseProposal storage proposal = state.proposals[proposalId];
        if (proposal.createdAt == 0) {
            revert ProposalNotFound(proposalId);
        }
        
        // Check proposal is not already executed
        if (proposal.executed) {
            revert ProposalAlreadyExecuted(proposalId);
        }
        
        // Check proposal is not cancelled
        if (proposal.cancelled) {
            revert ProposalAlreadyCancelled(proposalId);
        }
        
        // Check proposal has not expired (Requirement 8.5)
        if (isProposalExpired(state, config, proposalId)) {
            revert ProposalExpired(proposalId);
        }
        
        // Check quorum is met (Requirement 1.4)
        if (!isQuorumMet(state, config, proposalId)) {
            revert QuorumNotMet(
                proposalId,
                proposal.approvalCount,
                config.quorumThreshold
            );
        }
        
        // Check timelock OR emergency bypass (Requirements 3.1, 3.3, 3.4, 3.5)
        uint256 timelockEnd = proposal.createdAt + config.timelockDuration;
        bool timelockElapsed = block.timestamp >= timelockEnd;
        bool emergencyBypass = hasUnanimousApproval(state, config, proposalId);
        
        if (!timelockElapsed && !emergencyBypass) {
            uint256 remainingTime = timelockEnd - block.timestamp;
            revert TimelockNotElapsed(proposalId, remainingTime);
        }
        
        // Validate proposal type matches current state
        if (proposal.proposalType == ProposalType.PAUSE) {
            if (state.isPaused) {
                revert ContractAlreadyPaused();
            }
        } else if (proposal.proposalType == ProposalType.UNPAUSE) {
            if (!state.isPaused) {
                revert ContractNotPaused();
            }
        } else {
            revert InvalidProposalType(proposalId);
        }
        
        // Mark proposal as executed
        proposal.executed = true;
        proposal.executedAt = block.timestamp;
        state.activeProposalCount--;
        
        // Execute the pause/unpause action
        if (proposal.proposalType == ProposalType.PAUSE) {
            state.isPaused = true;
            state.pausedAt = block.timestamp; // Record pause timestamp (Requirement 4.1)
            state.pauseProposalId = proposalId;
            
            // Emit events (Requirements 6.3)
            emit ContractPausedMultiSig(proposalId, proposal.approvers, block.timestamp);
        } else {
            state.isPaused = false;
            state.pausedAt = 0;
            state.pauseProposalId = 0;
            
            // Clear all pending pause proposals on unpause (Requirement 4.5)
            _clearPendingPauseProposals(state);
            
            // Emit events (Requirements 6.4)
            emit ContractUnpausedMultiSig(proposalId, proposal.approvers, block.timestamp);
        }
        
        // Emit execution event (Requirement 6.3, 6.4)
        emit ProposalExecuted(proposalId, proposal.proposalType, executor);
        
        return true;
    }
    
    /**
     * @dev Get multi-sig configuration view
     * @param config Multi-sig configuration storage reference
     * @return configView Configuration view struct
     */
    function getMultiSigConfig(
        MultiSigConfig storage config
    ) external view returns (MultiSigConfigView memory configView) {
        configView.authorizedSigners = config.authorizedSigners;
        configView.quorumThreshold = config.quorumThreshold;
        configView.timelockDuration = config.timelockDuration;
        configView.maxPauseDuration = config.maxPauseDuration;
        configView.proposalLifetime = config.proposalLifetime;
        configView.proposalCooldown = config.proposalCooldown;
        configView.signerCount = config.signerCount;
        
        return configView;
    }
    
    /**
     * @dev Get pause information
     * @param state Pause state storage reference
     * @param config Multi-sig configuration storage reference
     * @return isPaused Whether contract is currently paused
     * @return pausedAt Timestamp when contract was paused (0 if not paused)
     * @return remainingTime Time remaining before auto-unpause (0 if not applicable)
     */
    function getPauseInfo(
        PauseState storage state,
        MultiSigConfig storage config
    ) external view returns (
        bool isPaused,
        uint256 pausedAt,
        uint256 remainingTime
    ) {
        isPaused = state.isPaused;
        pausedAt = state.pausedAt;
        
        if (isPaused && pausedAt > 0) {
            uint256 maxPauseEnd = pausedAt + config.maxPauseDuration;
            if (block.timestamp < maxPauseEnd) {
                remainingTime = maxPauseEnd - block.timestamp;
            } else {
                remainingTime = 0;
            }
        } else {
            remainingTime = 0;
        }
        
        return (isPaused, pausedAt, remainingTime);
    }
    
    // ============================================================================
    // AUTOMATIC UNPAUSE MECHANISM
    // ============================================================================
    
    /**
     * @dev Check if contract should be automatically unpaused
     * @param state Pause state storage reference
     * @param config Multi-sig configuration storage reference
     * @return shouldUnpause True if contract should be automatically unpaused
     * 
     * Requirements:
     * - Contract must be paused (Requirement 4.1)
     * - Pause duration must exceed maximum pause duration (Requirement 4.3)
     */
    function shouldAutoUnpause(
        PauseState storage state,
        MultiSigConfig storage config
    ) public view returns (bool shouldUnpause) {
        // Contract must be paused
        if (!state.isPaused) {
            return false;
        }
        
        // Pause timestamp must be recorded (Requirement 4.1)
        if (state.pausedAt == 0) {
            return false;
        }
        
        // Check if max pause duration has been exceeded (Requirement 4.3)
        uint256 pauseDuration = block.timestamp - state.pausedAt;
        return pauseDuration >= config.maxPauseDuration;
    }
    
    /**
     * @dev Trigger automatic unpause if conditions are met
     * @param state Pause state storage reference
     * @param config Multi-sig configuration storage reference
     * @return unpaused True if automatic unpause was triggered
     * 
     * Requirements:
     * - Automatically unpause when max duration exceeded (Requirement 4.3)
     * - Clear all pending pause proposals on unpause (Requirement 4.5)
     * - Emit auto-unpause event
     */
    function triggerAutoUnpause(
        PauseState storage state,
        MultiSigConfig storage config
    ) external returns (bool unpaused) {
        // Check if auto-unpause should be triggered
        if (!shouldAutoUnpause(state, config)) {
            return false;
        }
        
        // Calculate pause duration for event
        uint256 pauseDuration = block.timestamp - state.pausedAt;
        
        // Unpause the contract
        state.isPaused = false;
        state.pausedAt = 0;
        state.pauseProposalId = 0;
        
        // Clear all pending pause proposals (Requirement 4.5)
        _clearPendingPauseProposals(state);
        
        // Emit auto-unpause event
        emit AutoUnpauseTriggered(pauseDuration, block.timestamp);
        
        // Also emit standard unpause event for consistency
        address[] memory emptyApprovers;
        emit ContractUnpausedMultiSig(0, emptyApprovers, block.timestamp);
        
        return true;
    }
    
    /**
     * @dev Clear all pending pause proposals
     * @param state Pause state storage reference
     * 
     * Requirements:
     * - Clear all pending proposals when contract is unpaused (Requirement 4.5)
     */
    function _clearPendingPauseProposals(
        PauseState storage state
    ) private {
        // Iterate through all proposals
        for (uint256 i = 0; i < state.nextProposalId; i++) {
            PauseProposal storage proposal = state.proposals[i];
            
            // Skip if proposal doesn't exist, is executed, or is already cancelled
            if (proposal.createdAt == 0 || proposal.executed || proposal.cancelled) {
                continue;
            }
            
            // Only clear PAUSE proposals (keep UNPAUSE proposals as they're no longer relevant)
            if (proposal.proposalType == ProposalType.PAUSE) {
                proposal.cancelled = true;
                state.activeProposalCount--;
                
                // Emit cancellation event
                emit ProposalCancelled(i, address(0), "Auto-unpause triggered");
            }
        }
    }
    
    // ============================================================================
    // SIGNER MANAGEMENT
    // ============================================================================
    
    /**
     * @dev Add an authorized signer
     * @param config Multi-sig configuration storage reference
     * @param signer Address to add as authorized signer
     * 
     * Requirements:
     * - Signer address must not be zero (Requirement 2.1)
     * - Signer must not already be authorized (Requirement 2.1)
     * - Total signers must not exceed MAX_SIGNERS (Requirement 2.5)
     */
    function addAuthorizedSigner(
        MultiSigConfig storage config,
        address signer
    ) external {
        // Validate signer address (Requirement 2.1)
        if (signer == address(0)) {
            revert ZeroAddress();
        }
        
        // Check signer is not already authorized (Requirement 2.1)
        if (config.isAuthorizedSigner[signer]) {
            revert SignerAlreadyAuthorized(signer);
        }
        
        // Check maximum signer limit (Requirement 2.5)
        if (config.signerCount >= MAX_SIGNERS) {
            revert InvalidSignerCount(config.signerCount + 1);
        }
        
        // Add signer
        config.authorizedSigners.push(signer);
        config.isAuthorizedSigner[signer] = true;
        config.signerIndex[signer] = config.authorizedSigners.length - 1;
        config.signerCount++;
        
        // Emit event (Requirement 2.3)
        emit AuthorizedSignerAdded(signer, config.signerCount);
    }
    
    /**
     * @dev Remove an authorized signer
     * @param config Multi-sig configuration storage reference
     * @param state Pause state storage reference
     * @param signer Address to remove from authorized signers
     * 
     * Requirements:
     * - Signer must be currently authorized (Requirement 2.2)
     * - Remaining signers must meet minimum quorum requirement (Requirement 2.2)
     * - Remove signer's approvals from all pending proposals (Requirement 8.4)
     */
    function removeAuthorizedSigner(
        MultiSigConfig storage config,
        PauseState storage state,
        address signer
    ) external {
        // Check signer is authorized
        if (!config.isAuthorizedSigner[signer]) {
            revert SignerNotAuthorized(signer);
        }
        
        // Check remaining signers will meet quorum requirement (Requirement 2.2)
        if (config.signerCount - 1 < config.quorumThreshold) {
            revert InsufficientSignersForQuorum(config.signerCount - 1, config.quorumThreshold);
        }
        
        // Check not removing last signer
        if (config.signerCount <= MIN_SIGNERS) {
            revert CannotRemoveLastSigner();
        }
        
        // Remove signer from array (swap with last element and pop)
        uint256 indexToRemove = config.signerIndex[signer];
        uint256 lastIndex = config.authorizedSigners.length - 1;
        
        if (indexToRemove != lastIndex) {
            address lastSigner = config.authorizedSigners[lastIndex];
            config.authorizedSigners[indexToRemove] = lastSigner;
            config.signerIndex[lastSigner] = indexToRemove;
        }
        
        config.authorizedSigners.pop();
        delete config.isAuthorizedSigner[signer];
        delete config.signerIndex[signer];
        config.signerCount--;
        
        // Remove signer's approvals from all pending proposals (Requirement 8.4)
        _removeSignerFromPendingProposals(state, signer);
        
        // Emit event (Requirement 2.3)
        emit AuthorizedSignerRemoved(signer, config.signerCount);
    }
    
    /**
     * @dev Update quorum threshold
     * @param config Multi-sig configuration storage reference
     * @param state Pause state storage reference
     * @param newThreshold New quorum threshold
     * 
     * Requirements:
     * - New threshold must be at least 2 (Requirement 1.2)
     * - New threshold must not exceed signer count (Requirement 1.2)
     * - Invalidate all pending proposals (Requirement 8.3)
     */
    function updateQuorumThreshold(
        MultiSigConfig storage config,
        PauseState storage state,
        uint256 newThreshold
    ) external {
        // Validate new threshold (Requirement 1.2)
        if (newThreshold < 2 || newThreshold > config.signerCount) {
            revert InvalidQuorumThreshold(newThreshold, config.signerCount);
        }
        
        uint256 oldThreshold = config.quorumThreshold;
        config.quorumThreshold = newThreshold;
        
        // Invalidate all pending proposals (Requirement 8.3)
        _invalidateAllPendingProposals(state);
        
        // Emit event
        emit QuorumThresholdUpdated(oldThreshold, newThreshold);
    }
    
    /**
     * @dev Get list of authorized signers
     * @param config Multi-sig configuration storage reference
     * @return signers Array of authorized signer addresses
     * 
     * Requirements:
     * - Return complete list of current authorized signers (Requirement 2.4)
     */
    function getAuthorizedSigners(
        MultiSigConfig storage config
    ) external view returns (address[] memory signers) {
        return config.authorizedSigners;
    }
    
    /**
     * @dev Check if an address is an authorized signer
     * @param config Multi-sig configuration storage reference
     * @param signer Address to check
     * @return isAuthorized True if address is an authorized signer
     */
    function isAuthorizedSigner(
        MultiSigConfig storage config,
        address signer
    ) external view returns (bool isAuthorized) {
        return config.isAuthorizedSigner[signer];
    }
    
    // ============================================================================
    // CONFIGURATION MANAGEMENT
    // ============================================================================
    
    /**
     * @dev Update timelock duration
     * @param config Multi-sig configuration storage reference
     * @param newDuration New timelock duration in seconds
     * 
     * Requirements:
     * - New duration must be within bounds [6 hours, 48 hours] (Requirement 3.2)
     */
    function updateTimelockDuration(
        MultiSigConfig storage config,
        uint256 newDuration
    ) external {
        // Validate new duration (Requirement 3.2)
        if (newDuration < MIN_TIMELOCK || newDuration > MAX_TIMELOCK) {
            revert InvalidTimelockDuration(newDuration);
        }
        
        uint256 oldDuration = config.timelockDuration;
        config.timelockDuration = newDuration;
        
        // Emit event
        emit TimelockDurationUpdated(oldDuration, newDuration);
    }
    
    /**
     * @dev Update maximum pause duration
     * @param config Multi-sig configuration storage reference
     * @param newDuration New maximum pause duration in seconds
     * 
     * Requirements:
     * - New duration must be within bounds [7 days, 30 days] (Requirement 4.2)
     */
    function updateMaxPauseDuration(
        MultiSigConfig storage config,
        uint256 newDuration
    ) external {
        // Validate new duration (Requirement 4.2)
        if (newDuration < MIN_MAX_PAUSE_DURATION || newDuration > MAX_MAX_PAUSE_DURATION) {
            revert InvalidMaxPauseDuration(newDuration);
        }
        
        uint256 oldDuration = config.maxPauseDuration;
        config.maxPauseDuration = newDuration;
        
        // Emit event
        emit MaxPauseDurationUpdated(oldDuration, newDuration);
    }
    
    /**
     * @dev Update proposal lifetime
     * @param config Multi-sig configuration storage reference
     * @param newLifetime New proposal lifetime in seconds
     * 
     * Requirements:
     * - New lifetime must be within bounds [7 days, 30 days] (Requirement 5.2)
     */
    function updateProposalLifetime(
        MultiSigConfig storage config,
        uint256 newLifetime
    ) external {
        // Validate new lifetime (Requirement 5.2)
        if (newLifetime < MIN_PROPOSAL_LIFETIME || newLifetime > MAX_PROPOSAL_LIFETIME) {
            revert InvalidProposalLifetime(newLifetime);
        }
        
        config.proposalLifetime = newLifetime;
    }
    
    /**
     * @dev Update proposal cooldown
     * @param config Multi-sig configuration storage reference
     * @param newCooldown New proposal cooldown in seconds
     * 
     * Requirements:
     * - New cooldown must be within bounds [1 hour, 24 hours] (Requirement 5.3)
     */
    function updateProposalCooldown(
        MultiSigConfig storage config,
        uint256 newCooldown
    ) external {
        // Validate new cooldown (Requirement 5.3)
        if (newCooldown < MIN_PROPOSAL_COOLDOWN || newCooldown > MAX_PROPOSAL_COOLDOWN) {
            revert InvalidProposalCooldown(newCooldown);
        }
        
        config.proposalCooldown = newCooldown;
    }
    
    // ============================================================================
    // INTERNAL HELPER FUNCTIONS
    // ============================================================================
    
    /**
     * @dev Remove a signer's approvals from all pending proposals
     * @param state Pause state storage reference
     * @param signer Address of the signer to remove
     * 
     * Requirements:
     * - Remove signer's approval from all active proposals (Requirement 8.4)
     * - Decrement approval count for affected proposals (Requirement 8.4)
     */
    function _removeSignerFromPendingProposals(
        PauseState storage state,
        address signer
    ) private {
        // Iterate through all proposals
        for (uint256 i = 0; i < state.nextProposalId; i++) {
            PauseProposal storage proposal = state.proposals[i];
            
            // Skip if proposal doesn't exist, is executed, or is cancelled
            if (proposal.createdAt == 0 || proposal.executed || proposal.cancelled) {
                continue;
            }
            
            // Check if signer has approved this proposal
            if (proposal.hasApproved[signer]) {
                // Remove approval
                proposal.hasApproved[signer] = false;
                proposal.approvalCount--;
                
                // Remove from approvers array
                for (uint256 j = 0; j < proposal.approvers.length; j++) {
                    if (proposal.approvers[j] == signer) {
                        // Swap with last element and pop
                        proposal.approvers[j] = proposal.approvers[proposal.approvers.length - 1];
                        proposal.approvers.pop();
                        break;
                    }
                }
            }
        }
    }
    
    /**
     * @dev Invalidate all pending proposals
     * @param state Pause state storage reference
     * 
     * Requirements:
     * - Cancel all pending proposals when quorum changes (Requirement 8.3)
     */
    function _invalidateAllPendingProposals(
        PauseState storage state
    ) private {
        // Iterate through all proposals
        for (uint256 i = 0; i < state.nextProposalId; i++) {
            PauseProposal storage proposal = state.proposals[i];
            
            // Skip if proposal doesn't exist, is executed, or is already cancelled
            if (proposal.createdAt == 0 || proposal.executed || proposal.cancelled) {
                continue;
            }
            
            // Cancel the proposal
            proposal.cancelled = true;
            state.activeProposalCount--;
            
            // Emit cancellation event
            emit ProposalCancelled(i, address(0), "Quorum threshold changed");
        }
    }
}
