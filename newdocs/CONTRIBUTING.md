# Contributing to Sylvan Token

Thank you for your interest in contributing to Sylvan Token! This document provides guidelines for contributing to the project.

---

## 📋 Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [Getting Started](#getting-started)
3. [Development Process](#development-process)
4. [Pull Request Process](#pull-request-process)
5. [Coding Standards](#coding-standards)
6. [Testing Requirements](#testing-requirements)
7. [Documentation](#documentation)

---

## 📜 Code of Conduct

### Our Standards

- Be respectful and inclusive
- Focus on constructive feedback
- Accept responsibility for mistakes
- Prioritize community benefit

### Unacceptable Behavior

- Harassment or discrimination
- Trolling or insulting comments
- Publishing private information
- Unprofessional conduct

---

## 🚀 Getting Started

### Prerequisites

- Node.js v16+
- npm or yarn
- Git

### Setup

```bash
# Fork the repository on GitHub

# Clone your fork
git clone https://github.com/YOUR_USERNAME/SylvanToken.git
cd SylvanToken

# Add upstream remote
git remote add upstream https://github.com/SylvanToken/SylvanToken.git

# Install dependencies
npm install

# Run tests to verify setup
npm test
```

---

## 💻 Development Process

### Branch Naming

```
feature/description    # New features
fix/description        # Bug fixes
docs/description       # Documentation
test/description       # Test additions
refactor/description   # Code refactoring
```

### Workflow

1. **Sync with upstream**
   ```bash
   git fetch upstream
   git checkout main
   git merge upstream/main
   ```

2. **Create feature branch**
   ```bash
   git checkout -b feature/your-feature
   ```

3. **Make changes**
   - Write code
   - Add tests
   - Update documentation

4. **Commit changes**
   ```bash
   git add .
   git commit -m "feat: description of changes"
   ```

5. **Push and create PR**
   ```bash
   git push origin feature/your-feature
   ```

---

## 🔄 Pull Request Process

### Before Submitting

- [ ] All tests pass (`npm test`)
- [ ] Code follows style guidelines
- [ ] Documentation updated
- [ ] CHANGELOG.md updated
- [ ] No merge conflicts

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation
- [ ] Refactoring

## Testing
- [ ] Unit tests added
- [ ] Integration tests added
- [ ] All tests pass

## Checklist
- [ ] Code follows style guide
- [ ] Self-reviewed code
- [ ] Documentation updated
- [ ] CHANGELOG updated
```

### Review Process

1. Automated checks run
2. Code review by maintainers
3. Address feedback
4. Approval and merge

---

## 📝 Coding Standards

### Solidity

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title ContractName
 * @dev Description of contract
 * @notice User-facing description
 */
contract ContractName {
    // State variables
    uint256 public constant MAX_VALUE = 100;
    
    // Events
    event ValueChanged(uint256 indexed oldValue, uint256 indexed newValue);
    
    // Errors
    error InvalidValue(uint256 value);
    
    // Functions
    /**
     * @dev Function description
     * @param value Parameter description
     * @return Description of return value
     */
    function setValue(uint256 value) external returns (bool) {
        if (value > MAX_VALUE) revert InvalidValue(value);
        // Implementation
        return true;
    }
}
```

### JavaScript

```javascript
const { expect } = require("chai");
const { ethers } = require("hardhat");

/**
 * @description Test description
 */
describe("ContractName", function () {
    let contract;
    let owner;
    
    beforeEach(async function () {
        [owner] = await ethers.getSigners();
        const Contract = await ethers.getContractFactory("ContractName");
        contract = await Contract.deploy();
    });
    
    describe("Function Name", function () {
        it("should do something", async function () {
            // Arrange
            const value = 100;
            
            // Act
            await contract.setValue(value);
            
            // Assert
            expect(await contract.value()).to.equal(value);
        });
    });
});
```

---

## 🧪 Testing Requirements

### Test Coverage

- Minimum 90% coverage for new code
- All public functions must have tests
- Edge cases must be covered

### Test Categories

```
test/
├── unit/           # Unit tests
├── integration/    # Integration tests
├── security/       # Security tests
└── libraries/      # Library tests
```

### Running Tests

```bash
# All tests
npm test

# With coverage
npm run coverage

# Specific file
npx hardhat test test/specific.test.js

# Security tests
npm run test:security
```

---

## 📚 Documentation

### Requirements

- All public functions documented with NatSpec
- README updated for new features
- CHANGELOG updated for all changes
- API reference updated

### NatSpec Format

```solidity
/**
 * @title Contract title
 * @author Author name
 * @notice User-facing description
 * @dev Technical description
 */

/**
 * @notice Function description for users
 * @dev Technical implementation details
 * @param paramName Parameter description
 * @return Description of return value
 */
```

---

## 🏷️ Commit Messages

### Format

```
type(scope): description

[optional body]

[optional footer]
```

### Types

| Type | Description |
|------|-------------|
| feat | New feature |
| fix | Bug fix |
| docs | Documentation |
| style | Formatting |
| refactor | Code refactoring |
| test | Adding tests |
| chore | Maintenance |

### Examples

```
feat(vesting): add monthly release function
fix(fee): correct calculation for edge case
docs(readme): update installation instructions
test(security): add reentrancy tests
```

---

## 🔒 Security

### Reporting Vulnerabilities

**DO NOT** open public issues for security vulnerabilities.

Contact: security@sylvantoken.org

### Security Checklist

- [ ] No hardcoded secrets
- [ ] Input validation
- [ ] Reentrancy protection
- [ ] Access control verified
- [ ] Gas optimization considered

---

## 📞 Getting Help

- **Discord**: [Join our server](#)
- **Telegram**: [t.me/sylvantoken](https://t.me/sylvantoken)
- **Email**: dev@sylvantoken.org

---

## 🙏 Recognition

Contributors will be recognized in:
- CONTRIBUTORS.md file
- Release notes
- Project documentation

---

<div align="center">

**Thank you for contributing to Sylvan Token!**

*Together we build a greener future*

</div>
