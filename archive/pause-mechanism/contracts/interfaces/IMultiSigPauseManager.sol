// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title IMultiSigPauseManager
 * @dev Interface for multi-signature pause mechanism with timelock and automatic unpause
 * @notice This interface defines all public functions, events, and errors for the MultiSigPauseManager library
 */
interface IMultiSigPauseManager {
    
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
    
    /**
     * @dev Emitted when a pause proposal is created
     * @param proposalId Unique identifier for the proposal
     * @param proposer Address that created the proposal
     * @param timestamp Block timestamp when proposal was created
     */
    event PauseProposalCreated(uint256 indexed proposalId, address indexed proposer, uint256 timestamp);
    
    /**
     * @dev Emitted when an unpause proposal is created
     * @param proposalId Unique identifier for the proposal
     * @param proposer Address that created the proposal
     * @param timestamp Block timestamp when proposal was created
     */
    event UnpauseProposalCreated(uint256 indexed proposalId, address indexed proposer, uint256 timestamp);
    
    /**
     * @dev Emitted when a proposal receives an approval
     * @param proposalId Unique identifier for the proposal
     * @param approver Address that approved the proposal
     * @param approvalCount Current number of approvals
     * @param quorumThreshold Required number of approvals for execution
     */
    event ProposalApproved(uint256 indexed proposalId, address indexed approver, uint256 approvalCount, uint256 quorumThreshold);
    
    /**
     * @dev Emitted when a proposal is executed
     * @param proposalId Unique identifier for the proposal
     * @param proposalType Type of proposal (PAUSE or UNPAUSE)
     * @param executor Address that executed the proposal
     */
    event ProposalExecuted(uint256 indexed proposalId, ProposalType proposalType, address indexed executor);
    
    /**
     * @dev Emitted when a proposal is cancelled
     * @param proposalId Unique identifier for the proposal
     * @param canceller Address that cancelled the proposal
     * @param reason Reason for cancellation
     */
    event ProposalCancelled(uint256 indexed proposalId, address indexed canceller, string reason);
    
    /**
     * @dev Emitted when the contract is paused via multi-sig
     * @param proposalId Unique identifier for the pause proposal
     * @param approvers Array of addresses that approved the pause
     * @param timestamp Block timestamp when pause was activated
     */
    event ContractPausedMultiSig(uint256 indexed proposalId, address[] approvers, uint256 timestamp);
    
    /**
     * @dev Emitted when the contract is unpaused via multi-sig
     * @param proposalId Unique identifier for the unpause proposal
     * @param approvers Array of addresses that approved the unpause
     * @param timestamp Block timestamp when unpause was activated
     */
    event ContractUnpausedMultiSig(uint256 indexed proposalId, address[] approvers, uint256 timestamp);
    
    /**
     * @dev Emitted when automatic unpause is triggered
     * @param pauseDuration Duration the contract was paused (in seconds)
     * @param timestamp Block timestamp when auto-unpause was triggered
     */
    event AutoUnpauseTriggered(uint256 pauseDuration, uint256 timestamp);
    
    /**
     * @dev Emitted when an authorized signer is added
     * @param signer Address of the new authorized signer
     * @param totalSigners Total number of authorized signers after addition
     */
    event AuthorizedSignerAdded(address indexed signer, uint256 totalSigners);
    
    /**
     * @dev Emitted when an authorized signer is removed
     * @param signer Address of the removed authorized signer
     * @param totalSigners Total number of authorized signers after removal
     */
    event AuthorizedSignerRemoved(address indexed signer, uint256 totalSigners);
    
    /**
     * @dev Emitted when the quorum threshold is updated
     * @param oldThreshold Previous quorum threshold
     * @param newThreshold New quorum threshold
     */
    event QuorumThresholdUpdated(uint256 oldThreshold, uint256 newThreshold);
    
    /**
     * @dev Emitted when the timelock duration is updated
     * @param oldDuration Previous timelock duration (in seconds)
     * @param newDuration New timelock duration (in seconds)
     */
    event TimelockDurationUpdated(uint256 oldDuration, uint256 newDuration);
    
    /**
     * @dev Emitted when the maximum pause duration is updated
     * @param oldDuration Previous maximum pause duration (in seconds)
     * @param newDuration New maximum pause duration (in seconds)
     */
    event MaxPauseDurationUpdated(uint256 oldDuration, uint256 newDuration);
    
    // ============================================================================
    // ERRORS
    // ============================================================================
    
    /**
     * @dev Error thrown when an unauthorized address attempts a signer-only operation
     * @param signer Address that attempted the operation
     */
    error UnauthorizedSigner(address signer);
    
    /**
     * @dev Error thrown when a proposal ID does not exist
     * @param proposalId The non-existent proposal ID
     */
    error ProposalNotFound(uint256 proposalId);
    
    /**
     * @dev Error thrown when attempting to interact with an already executed proposal
     * @param proposalId The executed proposal ID
     */
    error ProposalAlreadyExecuted(uint256 proposalId);
    
    /**
     * @dev Error thrown when attempting to interact with a cancelled proposal
     * @param proposalId The cancelled proposal ID
     */
    error ProposalAlreadyCancelled(uint256 proposalId);
    
    /**
     * @dev Error thrown when a proposal has exceeded its lifetime
     * @param proposalId The expired proposal ID
     */
    error ProposalExpired(uint256 proposalId);
    
    /**
     * @dev Error thrown when attempting to execute a proposal before timelock expires
     * @param proposalId The proposal ID
     * @param remainingTime Time remaining until timelock expires (in seconds)
     */
    error TimelockNotElapsed(uint256 proposalId, uint256 remainingTime);
    
    /**
     * @dev Error thrown when attempting to execute a proposal without sufficient approvals
     * @param proposalId The proposal ID
     * @param currentApprovals Current number of approvals
     * @param required Required number of approvals (quorum)
     */
    error QuorumNotMet(uint256 proposalId, uint256 currentApprovals, uint256 required);
    
    /**
     * @dev Error thrown when a signer attempts to approve a proposal twice
     * @param proposalId The proposal ID
     * @param signer Address that already approved
     */
    error AlreadyApproved(uint256 proposalId, address signer);
    
    /**
     * @dev Error thrown when a proposal type is invalid or unexpected
     * @param proposalId The proposal ID with invalid type
     */
    error InvalidProposalType(uint256 proposalId);
    
    /**
     * @dev Error thrown when attempting to pause an already paused contract
     */
    error ContractAlreadyPaused();
    
    /**
     * @dev Error thrown when attempting to unpause a contract that is not paused
     */
    error ContractNotPaused();
    
    /**
     * @dev Error thrown when a signer attempts to create a proposal during cooldown period
     * @param signer Address in cooldown
     * @param remainingTime Time remaining in cooldown period (in seconds)
     */
    error ProposalCooldownActive(address signer, uint256 remainingTime);
    
    /**
     * @dev Error thrown when quorum threshold is invalid for the number of signers
     * @param threshold The invalid threshold value
     * @param signerCount Current number of signers
     */
    error InvalidQuorumThreshold(uint256 threshold, uint256 signerCount);
    
    /**
     * @dev Error thrown when timelock duration is outside valid bounds
     * @param duration The invalid duration value
     */
    error InvalidTimelockDuration(uint256 duration);
    
    /**
     * @dev Error thrown when maximum pause duration is outside valid bounds
     * @param duration The invalid duration value
     */
    error InvalidMaxPauseDuration(uint256 duration);
    
    /**
     * @dev Error thrown when attempting to add an already authorized signer
     * @param signer Address that is already authorized
     */
    error SignerAlreadyAuthorized(address signer);
    
    /**
     * @dev Error thrown when attempting to remove a non-authorized signer
     * @param signer Address that is not authorized
     */
    error SignerNotAuthorized(address signer);
    
    /**
     * @dev Error thrown when attempting to remove the last signer
     */
    error CannotRemoveLastSigner();
    
    /**
     * @dev Error thrown when signer count would be insufficient for quorum
     * @param signerCount Resulting signer count
     * @param quorum Required quorum threshold
     */
    error InsufficientSignersForQuorum(uint256 signerCount, uint256 quorum);
    

    
    /**
     * @dev Error thrown when signer count is outside valid bounds
     * @param count The invalid signer count
     */
    error InvalidSignerCount(uint256 count);
    
    /**
     * @dev Error thrown when proposal lifetime is outside valid bounds
     * @param lifetime The invalid lifetime value
     */
    error InvalidProposalLifetime(uint256 lifetime);
    
    /**
     * @dev Error thrown when proposal cooldown is outside valid bounds
     * @param cooldown The invalid cooldown value
     */
    error InvalidProposalCooldown(uint256 cooldown);
    
    // ============================================================================
    // PROPOSAL MANAGEMENT FUNCTIONS
    // ============================================================================
    
    /**
     * @dev Create a pause proposal
     * @return proposalId The ID of the created proposal
     */
    function createPauseProposal() external returns (uint256 proposalId);
    
    /**
     * @dev Create an unpause proposal
     * @return proposalId The ID of the created proposal
     */
    function createUnpauseProposal() external returns (uint256 proposalId);
    
    /**
     * @dev Approve a pause proposal
     * @param proposalId ID of the proposal to approve
     */
    function approvePauseProposal(uint256 proposalId) external;
    
    /**
     * @dev Execute a proposal (pause or unpause)
     * @param proposalId ID of the proposal to execute
     */
    function executeProposal(uint256 proposalId) external;
    
    /**
     * @dev Cancel a proposal
     * @param proposalId ID of the proposal to cancel
     */
    function cancelProposal(uint256 proposalId) external;
    
    // ============================================================================
    // SIGNER MANAGEMENT FUNCTIONS
    // ============================================================================
    
    /**
     * @dev Add an authorized signer
     * @param signer Address to add as authorized signer
     */
    function addAuthorizedSigner(address signer) external;
    
    /**
     * @dev Remove an authorized signer
     * @param signer Address to remove from authorized signers
     */
    function removeAuthorizedSigner(address signer) external;
    
    /**
     * @dev Get list of authorized signers
     * @return signers Array of authorized signer addresses
     */
    function getAuthorizedSigners() external view returns (address[] memory signers);
    
    /**
     * @dev Check if an address is an authorized signer
     * @param signer Address to check
     * @return isAuthorized True if address is an authorized signer
     */
    function isAuthorizedSigner(address signer) external view returns (bool isAuthorized);
    
    // ============================================================================
    // CONFIGURATION FUNCTIONS
    // ============================================================================
    
    /**
     * @dev Update quorum threshold
     * @param newThreshold New quorum threshold
     */
    function updateQuorumThreshold(uint256 newThreshold) external;
    
    /**
     * @dev Update timelock duration
     * @param newDuration New timelock duration in seconds
     */
    function updateTimelockDuration(uint256 newDuration) external;
    
    /**
     * @dev Update maximum pause duration
     * @param newDuration New maximum pause duration in seconds
     */
    function updateMaxPauseDuration(uint256 newDuration) external;
    
    /**
     * @dev Get multi-sig configuration
     * @return config Configuration view struct
     */
    function getMultiSigConfig() external view returns (MultiSigConfigView memory config);
    
    // ============================================================================
    // QUERY FUNCTIONS
    // ============================================================================
    
    /**
     * @dev Get proposal status
     * @param proposalId ID of the proposal
     * @return status Proposal status view struct
     */
    function getProposalStatus(uint256 proposalId) external view returns (ProposalStatusView memory status);
    
    /**
     * @dev Check if a proposal can be executed
     * @param proposalId ID of the proposal to check
     * @return canExecute True if proposal can be executed
     */
    function canExecuteProposal(uint256 proposalId) external view returns (bool canExecute);
    
    /**
     * @dev Check if contract should be automatically unpaused
     * @return shouldUnpause True if contract should be automatically unpaused
     */
    function shouldAutoUnpause() external view returns (bool shouldUnpause);
    
    /**
     * @dev Get pause information
     * @return isPaused Whether contract is currently paused
     * @return pausedAt Timestamp when contract was paused (0 if not paused)
     * @return remainingTime Time remaining before auto-unpause (0 if not applicable)
     */
    function getPauseInfo() external view returns (
        bool isPaused,
        uint256 pausedAt,
        uint256 remainingTime
    );
}
