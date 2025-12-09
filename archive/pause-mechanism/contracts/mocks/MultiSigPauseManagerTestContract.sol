// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "../libraries/MultiSigPauseManager.sol";

/**
 * @title MultiSigPauseManagerTestContract
 * @dev Test contract for MultiSigPauseManager library
 */
contract MultiSigPauseManagerTestContract {
    using MultiSigPauseManager for MultiSigPauseManager.MultiSigConfig;
    using MultiSigPauseManager for MultiSigPauseManager.PauseState;
    
    MultiSigPauseManager.MultiSigConfig private config;
    MultiSigPauseManager.PauseState private pauseState;
    
    // Re-declare events from library for testing
    event PauseProposalCreated(uint256 indexed proposalId, address indexed proposer, uint256 timestamp);
    event UnpauseProposalCreated(uint256 indexed proposalId, address indexed proposer, uint256 timestamp);
    event ProposalCancelled(uint256 indexed proposalId, address indexed canceller, string reason);
    event ProposalApproved(uint256 indexed proposalId, address indexed approver, uint256 approvalCount, uint256 quorumThreshold);
    event ProposalExecuted(uint256 indexed proposalId, MultiSigPauseManager.ProposalType proposalType, address indexed executor);
    event ContractPausedMultiSig(uint256 indexed proposalId, address[] approvers, uint256 timestamp);
    event ContractUnpausedMultiSig(uint256 indexed proposalId, address[] approvers, uint256 timestamp);
    event AuthorizedSignerAdded(address indexed signer, uint256 totalSigners);
    event AuthorizedSignerRemoved(address indexed signer, uint256 totalSigners);
    event QuorumThresholdUpdated(uint256 oldThreshold, uint256 newThreshold);
    event TimelockDurationUpdated(uint256 oldDuration, uint256 newDuration);
    event MaxPauseDurationUpdated(uint256 oldDuration, uint256 newDuration);
    
    /**
     * @dev Initialize the multi-sig configuration
     */
    function initialize(
        address[] memory initialSigners,
        uint256 quorumThreshold,
        uint256 timelockDuration,
        uint256 maxPauseDuration,
        uint256 proposalLifetime,
        uint256 proposalCooldown
    ) external {
        MultiSigPauseManager.initialize(
            config,
            initialSigners,
            quorumThreshold,
            timelockDuration,
            maxPauseDuration,
            proposalLifetime,
            proposalCooldown
        );
    }
    
    /**
     * @dev Get configuration view
     */
    function getConfig() external view returns (
        address[] memory authorizedSigners,
        uint256 quorumThreshold,
        uint256 timelockDuration,
        uint256 maxPauseDuration,
        uint256 proposalLifetime,
        uint256 proposalCooldown,
        uint256 signerCount
    ) {
        return (
            config.authorizedSigners,
            config.quorumThreshold,
            config.timelockDuration,
            config.maxPauseDuration,
            config.proposalLifetime,
            config.proposalCooldown,
            config.signerCount
        );
    }
    
    /**
     * @dev Check if address is authorized signer (using library)
     */
    function isAuthorizedSigner(address signer) external view returns (bool) {
        return MultiSigPauseManager.isAuthorizedSigner(config, signer);
    }
    
    /**
     * @dev Get signer index
     */
    function getSignerIndex(address signer) external view returns (uint256) {
        return config.signerIndex[signer];
    }
    
    /**
     * @dev Get constants for testing
     */
    function getConstants() external pure returns (
        uint256 minSigners,
        uint256 maxSigners,
        uint256 minTimelock,
        uint256 maxTimelock,
        uint256 minMaxPauseDuration,
        uint256 maxMaxPauseDuration
    ) {
        return (
            MultiSigPauseManager.MIN_SIGNERS,
            MultiSigPauseManager.MAX_SIGNERS,
            MultiSigPauseManager.MIN_TIMELOCK,
            MultiSigPauseManager.MAX_TIMELOCK,
            MultiSigPauseManager.MIN_MAX_PAUSE_DURATION,
            MultiSigPauseManager.MAX_MAX_PAUSE_DURATION
        );
    }
    
    /**
     * @dev Create a pause proposal
     */
    function createPauseProposal() external returns (uint256) {
        return MultiSigPauseManager.createPauseProposal(pauseState, config, msg.sender);
    }
    
    /**
     * @dev Create an unpause proposal
     */
    function createUnpauseProposal() external returns (uint256) {
        return MultiSigPauseManager.createUnpauseProposal(pauseState, config, msg.sender);
    }
    
    /**
     * @dev Cancel a proposal
     */
    function cancelProposal(uint256 proposalId, string memory reason) external {
        MultiSigPauseManager.cancelProposal(pauseState, config, proposalId, msg.sender, reason);
    }
    
    /**
     * @dev Get proposal status
     */
    function getProposalStatus(uint256 proposalId) external view returns (
        MultiSigPauseManager.ProposalStatusView memory
    ) {
        return MultiSigPauseManager.getProposalStatus(pauseState, config, proposalId);
    }
    
    /**
     * @dev Check if proposal is expired
     */
    function isProposalExpired(uint256 proposalId) external view returns (bool) {
        return MultiSigPauseManager.isProposalExpired(pauseState, config, proposalId);
    }
    
    /**
     * @dev Get pause state
     */
    function getPauseState() external view returns (
        bool isPaused,
        uint256 pausedAt,
        uint256 pauseProposalId,
        uint256 activeProposalCount,
        uint256 nextProposalId
    ) {
        return (
            pauseState.isPaused,
            pauseState.pausedAt,
            pauseState.pauseProposalId,
            pauseState.activeProposalCount,
            pauseState.nextProposalId
        );
    }
    
    /**
     * @dev Get last proposal time for a signer
     */
    function getLastProposalTime(address signer) external view returns (uint256) {
        return config.lastProposalTime[signer];
    }
    
    /**
     * @dev Manually set pause state for testing
     */
    function setPauseState(bool isPaused) external {
        pauseState.isPaused = isPaused;
        if (isPaused) {
            pauseState.pausedAt = block.timestamp;
        }
    }
    
    /**
     * @dev Approve a pause proposal
     */
    function approvePauseProposal(uint256 proposalId) external {
        MultiSigPauseManager.approvePauseProposal(pauseState, config, proposalId, msg.sender);
    }
    
    /**
     * @dev Check if quorum is met
     */
    function isQuorumMet(uint256 proposalId) external view returns (bool) {
        return MultiSigPauseManager.isQuorumMet(pauseState, config, proposalId);
    }
    
    /**
     * @dev Check if proposal can be executed
     */
    function canExecuteProposal(uint256 proposalId) external view returns (bool) {
        return MultiSigPauseManager.canExecuteProposal(pauseState, config, proposalId);
    }
    
    /**
     * @dev Check if a signer has approved a proposal
     */
    function hasApproved(uint256 proposalId, address signer) external view returns (bool) {
        // Access the proposal directly from storage
        // Note: This is a workaround since we can't return mapping values directly
        // In real usage, check the approvers array
        MultiSigPauseManager.ProposalStatusView memory status = 
            MultiSigPauseManager.getProposalStatus(pauseState, config, proposalId);
        
        for (uint256 i = 0; i < status.approvers.length; i++) {
            if (status.approvers[i] == signer) {
                return true;
            }
        }
        return false;
    }
    
    /**
     * @dev Execute a proposal
     */
    function executeProposal(uint256 proposalId) external returns (bool) {
        return MultiSigPauseManager.executeProposal(pauseState, config, proposalId, msg.sender);
    }
    
    /**
     * @dev Check if proposal has unanimous approval
     */
    function hasUnanimousApproval(uint256 proposalId) external view returns (bool) {
        return MultiSigPauseManager.hasUnanimousApproval(pauseState, config, proposalId);
    }
    
    /**
     * @dev Get pause info
     */
    function getPauseInfo() external view returns (
        bool isPaused,
        uint256 pausedAt,
        uint256 remainingTime
    ) {
        return MultiSigPauseManager.getPauseInfo(pauseState, config);
    }
    
    // ============================================================================
    // SIGNER MANAGEMENT FUNCTIONS
    // ============================================================================
    
    /**
     * @dev Add an authorized signer
     */
    function addAuthorizedSigner(address signer) external {
        MultiSigPauseManager.addAuthorizedSigner(config, signer);
    }
    
    /**
     * @dev Remove an authorized signer
     */
    function removeAuthorizedSigner(address signer) external {
        MultiSigPauseManager.removeAuthorizedSigner(config, pauseState, signer);
    }
    
    /**
     * @dev Update quorum threshold
     */
    function updateQuorumThreshold(uint256 newThreshold) external {
        MultiSigPauseManager.updateQuorumThreshold(config, pauseState, newThreshold);
    }
    
    /**
     * @dev Get authorized signers
     */
    function getAuthorizedSigners() external view returns (address[] memory) {
        return MultiSigPauseManager.getAuthorizedSigners(config);
    }
    
    /**
     * @dev Check if address is authorized signer (using library function)
     */
    function isAuthorizedSignerLib(address signer) external view returns (bool) {
        return MultiSigPauseManager.isAuthorizedSigner(config, signer);
    }
    
    // ============================================================================
    // CONFIGURATION MANAGEMENT FUNCTIONS
    // ============================================================================
    
    /**
     * @dev Update timelock duration
     */
    function updateTimelockDuration(uint256 newDuration) external {
        MultiSigPauseManager.updateTimelockDuration(config, newDuration);
    }
    
    /**
     * @dev Update maximum pause duration
     */
    function updateMaxPauseDuration(uint256 newDuration) external {
        MultiSigPauseManager.updateMaxPauseDuration(config, newDuration);
    }
    
    /**
     * @dev Update proposal lifetime
     */
    function updateProposalLifetime(uint256 newLifetime) external {
        MultiSigPauseManager.updateProposalLifetime(config, newLifetime);
    }
    
    /**
     * @dev Update proposal cooldown
     */
    function updateProposalCooldown(uint256 newCooldown) external {
        MultiSigPauseManager.updateProposalCooldown(config, newCooldown);
    }
    
    /**
     * @dev Get multi-sig configuration view
     */
    function getMultiSigConfig() external view returns (
        MultiSigPauseManager.MultiSigConfigView memory
    ) {
        return MultiSigPauseManager.getMultiSigConfig(config);
    }
    
    // ============================================================================
    // AUTOMATIC UNPAUSE FUNCTIONS
    // ============================================================================
    
    /**
     * @dev Check if contract should be automatically unpaused
     */
    function shouldAutoUnpause() external view returns (bool) {
        return MultiSigPauseManager.shouldAutoUnpause(pauseState, config);
    }
    
    /**
     * @dev Trigger automatic unpause if conditions are met
     */
    function triggerAutoUnpause() external returns (bool) {
        return MultiSigPauseManager.triggerAutoUnpause(pauseState, config);
    }
    
    // Re-declare AutoUnpauseTriggered event for testing
    event AutoUnpauseTriggered(uint256 pauseDuration, uint256 timestamp);
}
