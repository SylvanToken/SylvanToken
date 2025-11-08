# Contributing to Sylvan Token

Thank you for your interest in contributing to Sylvan Token! We welcome contributions from the community to help build a sustainable future through blockchain technology.

## 🌟 Ways to Contribute

- 🐛 Report bugs and issues
- 💡 Suggest new features or improvements
- 📝 Improve documentation
- 🔧 Submit code fixes or enhancements
- 🧪 Write or improve tests
- 🌍 Help with translations
- 📢 Spread the word about Sylvan Token

## 📋 Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment. Please:

- Be respectful and constructive
- Welcome newcomers and help them learn
- Focus on what is best for the community
- Show empathy towards other community members

## 🚀 Getting Started

### Prerequisites

- Node.js v16 or higher
- npm or yarn
- Git
- Basic understanding of Solidity and Hardhat

### Setup Development Environment

```bash
# Fork and clone the repository
git clone https://github.com/YOUR_USERNAME/sylvan-token.git
cd sylvan-token

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Compile contracts
npx hardhat compile

# Run tests
npm test
```

## 🔧 Development Workflow

### 1. Create a Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix
```

### 2. Make Your Changes

- Write clean, readable code
- Follow existing code style
- Add comments for complex logic
- Update documentation as needed

### 3. Test Your Changes

```bash
# Run all tests
npm test

# Run specific test
npx hardhat test test/your-test.test.js

# Check coverage
npm run coverage

# Run linter
npm run lint
```

### 4. Commit Your Changes

```bash
git add .
git commit -m "feat: add new feature"
# or
git commit -m "fix: resolve bug in fee calculation"
```

**Commit Message Format:**
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `test:` Test additions or changes
- `refactor:` Code refactoring
- `style:` Code style changes
- `chore:` Maintenance tasks

### 5. Push and Create Pull Request

```bash
git push origin feature/your-feature-name
```

Then create a Pull Request on GitHub with:
- Clear title and description
- Reference to related issues
- Screenshots (if applicable)
- Test results

## 📝 Coding Standards

### Solidity

- Follow [Solidity Style Guide](https://docs.soliditylang.org/en/latest/style-guide.html)
- Use NatSpec comments for all functions
- Keep functions small and focused
- Optimize for gas efficiency
- Include comprehensive error messages

**Example:**

```solidity
/**
 * @dev Transfers tokens with fee deduction
 * @param recipient Address to receive tokens
 * @param amount Amount to transfer
 * @return bool Success status
 */
function transfer(address recipient, uint256 amount) 
    public 
    override 
    nonReentrant 
    returns (bool) 
{
    require(recipient != address(0), "Invalid recipient");
    require(amount > 0, "Amount must be greater than zero");
    
    // Implementation
    return true;
}
```

### JavaScript/TypeScript

- Use ES6+ syntax
- Follow Airbnb style guide
- Use async/await over promises
- Add JSDoc comments
- Handle errors properly

### Testing

- Aim for >90% code coverage
- Test happy paths and edge cases
- Include security test scenarios
- Use descriptive test names
- Group related tests

**Example:**

```javascript
describe("Fee System", function () {
    it("Should apply 1% fee on transfers", async function () {
        // Test implementation
    });
    
    it("Should distribute fees correctly", async function () {
        // Test implementation
    });
});
```

## 🧪 Testing Requirements

All contributions must include appropriate tests:

- **Unit Tests**: Test individual functions
- **Integration Tests**: Test component interactions
- **Security Tests**: Test attack vectors
- **Edge Cases**: Test boundary conditions

**Minimum Requirements:**
- All new code must have tests
- All tests must pass
- Coverage must not decrease
- No security vulnerabilities

## 📚 Documentation

Update documentation when you:

- Add new features
- Change existing functionality
- Fix bugs that affect usage
- Add new configuration options

**Documentation Locations:**
- `README.md` - Project overview
- `WHITEPAPER.md` - Detailed specifications
- `docs/` - Technical documentation
- Code comments - Inline documentation

## 🔒 Security

### Reporting Security Issues

**DO NOT** create public issues for security vulnerabilities.

Instead, email: security@sylvantoken.org

Include:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

### Security Best Practices

- Never commit private keys or secrets
- Use `.env` for sensitive data
- Follow smart contract security patterns
- Test for common vulnerabilities
- Use latest dependency versions

## 🎯 Pull Request Process

1. **Before Submitting:**
   - Update documentation
   - Add/update tests
   - Run full test suite
   - Check code coverage
   - Run linter
   - Update CHANGELOG.md

2. **PR Requirements:**
   - Clear description of changes
   - Link to related issues
   - All tests passing
   - No merge conflicts
   - Approved by maintainers

3. **Review Process:**
   - Maintainers will review within 48 hours
   - Address feedback promptly
   - Keep PR focused and small
   - Be patient and respectful

4. **After Approval:**
   - Squash commits if requested
   - Maintainer will merge
   - Delete your branch

## 🏆 Recognition

Contributors will be:
- Listed in CONTRIBUTORS.md
- Mentioned in release notes
- Eligible for community rewards
- Invited to contributor calls

## 📞 Getting Help

- 💬 **Telegram**: [t.me/sylvantoken](https://t.me/sylvantoken)
- 🐦 **Twitter**: [@SylvanToken](https://x.com/SylvanToken)
- 💻 **GitHub Issues**: [Create an issue](https://github.com/SylvanToken/issues)
- 📧 **Email**: dev@sylvantoken.org

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to Sylvan Token! Together, we're building a sustainable future. 🌳

