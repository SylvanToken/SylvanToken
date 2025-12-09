# Requirements Document

## Introduction

This document outlines the requirements for separating the deployer and owner roles in the SylvanToken smart contract system. Currently, the deployer wallet (which deploys the contract) automatically becomes the owner wallet (which has administrative privileges). This creates a security risk as the deployer's private key has full control over the contract. By separating these roles, we can enhance security by using a more secure wallet (such as a hardware wallet or multisig) as the owner while using a standard wallet for deployment.

## Glossary

- **Deployer Wallet**: The wallet address that executes the contract deployment transaction and pays the gas fees
- **Owner Wallet**: The wallet address that has administrative privileges over the contract (can call onlyOwner functions)
- **SylvanToken Contract**: The main BEP-20 token smart contract with vesting and fee management features
- **Ownable Pattern**: OpenZeppelin's access control pattern that designates one address as the contract owner
- **transferOwnership**: OpenZeppelin Ownable function that transfers ownership to a new address
- **Administrative Functions**: Contract functions restricted to the owner (fee exemptions, vesting configuration, trading controls)
- **Hardware Wallet**: A physical device that stores private keys securely (e.g., Ledger, Trezor)
- **Multisig Wallet**: A wallet requiring multiple signatures to execute transactions

## Requirements

### Requirement 1

**User Story:** As a project administrator, I want to deploy the contract with a standard wallet but transfer ownership to a secure wallet, so that administrative control is protected by enhanced security measures.

#### Acceptance Criteria

1. WHEN THE SylvanToken Contract is deployed, THE Deployer Wallet SHALL be set as the initial owner
2. AFTER deployment completes, THE System SHALL provide a mechanism to transfer ownership to a different wallet address
3. WHEN ownership transfer is initiated, THE System SHALL validate that the new owner address is not the zero address
4. WHEN ownership transfer is executed, THE System SHALL emit an OwnershipTransferred event
5. AFTER ownership transfer completes, THE New Owner Wallet SHALL have all administrative privileges

### Requirement 2

**User Story:** As a security-conscious administrator, I want to use a hardware wallet or multisig as the owner, so that the contract cannot be compromised by a single private key leak.

#### Acceptance Criteria

1. THE System SHALL accept any valid Ethereum address as the new owner
2. THE System SHALL support hardware wallet addresses as the owner
3. THE System SHALL support multisig wallet addresses as the owner
4. WHEN a hardware wallet is set as owner, THE System SHALL allow that wallet to execute all onlyOwner functions
5. WHEN a multisig wallet is set as owner, THE System SHALL require the configured number of signatures for administrative actions

### Requirement 3

**User Story:** As a deployment operator, I want a deployment script that can optionally transfer ownership immediately after deployment, so that I can secure the contract in a single deployment process.

#### Acceptance Criteria

1. THE Deployment Script SHALL accept an optional owner address parameter
2. WHEN an owner address is provided, THE Deployment Script SHALL transfer ownership after contract deployment
3. WHEN no owner address is provided, THE Deployment Script SHALL leave the deployer as the owner
4. THE Deployment Script SHALL validate the owner address before attempting transfer
5. THE Deployment Script SHALL log the ownership transfer transaction hash and confirmation

### Requirement 4

**User Story:** As a project administrator, I want to verify the current owner address, so that I can confirm ownership has been transferred correctly.

#### Acceptance Criteria

1. THE SylvanToken Contract SHALL provide a public owner() function that returns the current owner address
2. THE Deployment Script SHALL display the current owner address after deployment
3. THE Verification Script SHALL check and display the current owner address
4. WHEN ownership is transferred, THE System SHALL emit an event containing both old and new owner addresses
5. THE System SHALL allow anyone to query the current owner address without gas costs

### Requirement 5

**User Story:** As a project administrator, I want documentation explaining how to transfer ownership safely, so that I can perform the transfer without errors or security risks.

#### Acceptance Criteria

1. THE Documentation SHALL explain the difference between deployer and owner roles
2. THE Documentation SHALL provide step-by-step instructions for transferring ownership
3. THE Documentation SHALL include examples for hardware wallet and multisig ownership transfer
4. THE Documentation SHALL warn about the risks of transferring to an incorrect address
5. THE Documentation SHALL explain how to verify ownership transfer was successful

### Requirement 6

**User Story:** As a deployment operator, I want the deployment configuration to support separate deployer and owner addresses, so that I can plan the deployment with proper role separation.

#### Acceptance Criteria

1. THE Deployment Configuration SHALL include a deployer address field
2. THE Deployment Configuration SHALL include an owner address field
3. THE Deployment Configuration SHALL allow deployer and owner to be the same address for testing
4. THE Deployment Configuration SHALL allow deployer and owner to be different addresses for production
5. THE Deployment Configuration SHALL include comments explaining the security implications of each configuration
