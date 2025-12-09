# 🔄 GitHub Actions Workflows

This directory contains automated CI/CD workflows for the Enhanced Sylvan Token project.

---

## 📋 Available Workflows

### 1. 🧪 Test Suite (`test.yml`)

**Triggers**:
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop`
- Manual trigger

**What it does**:
- Runs on Node.js 16.x and 18.x
- Compiles smart contracts
- Executes production test suite (189 tests)
- Uploads test results as artifacts

**Test Coverage**:
- Library Tests: 178 tests
- Integration Tests: 11 tests
- Total: 189 tests

**Duration**: ~2-3 minutes

---

### 2. 📊 Coverage Report (`coverage.yml`)

**Triggers**:
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop`
- Weekly schedule (Sunday at midnight)
- Manual trigger

**What it does**:
- Generates code coverage report
- Checks coverage thresholds (79% statements, 75% branches)
- Uploads to Codecov
- Stores coverage artifacts
- Analyzes coverage trends

**Thresholds**:
- Statements: ≥ 79%
- Branches: ≥ 75%

**Duration**: ~3-5 minutes

---

### 3. 🔐 Security Scan (`security.yml`)

**Triggers**:
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop`
- Weekly schedule (Monday at midnight)
- Manual trigger

**What it does**:
- Runs security test suite
- Performs dependency vulnerability scan
- Executes Slither static analysis
- Generates security summary

**Security Checks**:
- Reentrancy Protection
- Access Control
- Input Validation
- Emergency Controls
- Dependency Vulnerabilities
- Static Analysis

**Duration**: ~5-7 minutes

---

### 4. 🚀 Deployment (`deploy.yml`)

**Triggers**:
- Manual trigger only (workflow_dispatch)

**Inputs**:
- `network`: testnet or mainnet
- `confirm`: Must type "deploy" to proceed

**What it does**:
- Pre-deployment validation
- Runs all tests
- Deploys contracts to selected network
- Post-deployment validation
- Sends deployment notification

**Environments**:
- BSC Testnet
- BSC Mainnet

**Duration**: ~10-15 minutes

---

## 🚀 Usage

### Running Tests

Tests run automatically on every push and pull request. To manually trigger:

1. Go to **Actions** tab
2. Select **Test Suite** workflow
3. Click **Run workflow**
4. Select branch and run

### Generating Coverage

Coverage reports are generated automatically. To manually trigger:

1. Go to **Actions** tab
2. Select **Coverage Report** workflow
3. Click **Run workflow**
4. Select branch and run

### Running Security Scans

Security scans run automatically weekly. To manually trigger:

1. Go to **Actions** tab
2. Select **Security Scan** workflow
3. Click **Run workflow**
4. Select branch and run

### Deploying Contracts

**⚠️ Important**: Deployment requires manual confirmation

1. Go to **Actions** tab
2. Select **Deployment** workflow
3. Click **Run workflow**
4. Select:
   - Branch (usually `main`)
   - Network (`testnet` or `mainnet`)
   - Type `deploy` in confirmation field
5. Click **Run workflow**

---

## 🔐 Required Secrets

Configure these secrets in repository settings:

### Deployment Secrets

```
DEPLOYER_PRIVATE_KEY    # Private key for deployment account
BSC_TESTNET_RPC         # BSC Testnet RPC URL
BSC_MAINNET_RPC         # BSC Mainnet RPC URL
BSCSCAN_API_KEY         # BSCScan API key for verification
```

### Optional Secrets

```
CODECOV_TOKEN           # Codecov upload token (optional)
SLACK_WEBHOOK           # Slack notification webhook (optional)
DISCORD_WEBHOOK         # Discord notification webhook (optional)
```

---

## 📊 Workflow Status Badges

Add these badges to your README.md:

```markdown
![Test Suite](https://github.com/SylvanToken/enhanced-sylvan-token/workflows/Test%20Suite/badge.svg)
![Coverage](https://github.com/SylvanToken/enhanced-sylvan-token/workflows/Coverage%20Report/badge.svg)
![Security](https://github.com/SylvanToken/enhanced-sylvan-token/workflows/Security%20Scan/badge.svg)
```

---

## 🔧 Customization

### Modifying Test Workflow

Edit `.github/workflows/test.yml`:

```yaml
# Add more Node.js versions
strategy:
  matrix:
    node-version: [16.x, 18.x, 20.x]

# Add more test files
- name: Run tests
  run: |
    npx hardhat test test/your-test-file.test.js
```

### Adjusting Coverage Thresholds

Edit `.github/workflows/coverage.yml`:

```yaml
# Change thresholds
if (( $(echo "$STATEMENTS < 85" | bc -l) )); then
  echo "Statement coverage below 85%"
  exit 1
fi
```

### Adding Security Tools

Edit `.github/workflows/security.yml`:

```yaml
# Add more security tools
- name: Run Mythril
  run: myth analyze contracts/EnhancedSylvanToken.sol
```

---

## 📈 Monitoring

### View Workflow Runs

1. Go to **Actions** tab
2. Select workflow from left sidebar
3. View run history and details

### Download Artifacts

1. Open completed workflow run
2. Scroll to **Artifacts** section
3. Download desired artifacts

### Check Logs

1. Open workflow run
2. Click on job name
3. Expand steps to view logs

---

## 🐛 Troubleshooting

### Tests Failing

1. Check test logs in workflow run
2. Run tests locally: `npm test`
3. Verify dependencies: `npm ci`
4. Check Node.js version compatibility

### Coverage Not Generated

1. Verify test files are included
2. Check hardhat.config.js settings
3. Ensure contracts compile successfully
4. Review coverage workflow logs

### Deployment Failing

1. Verify secrets are configured
2. Check network connectivity
3. Ensure sufficient gas/funds
4. Review deployment logs
5. Validate contract compilation

### Security Scan Issues

1. Check Slither installation
2. Verify Python version (3.10+)
3. Review security scan logs
4. Update dependencies if needed

---

## 📚 Best Practices

### For Developers

1. **Run tests locally** before pushing
2. **Check coverage** before submitting PR
3. **Review security warnings** promptly
4. **Keep dependencies updated**
5. **Follow semantic versioning**

### For Maintainers

1. **Review workflow runs** regularly
2. **Monitor coverage trends**
3. **Address security issues** immediately
4. **Update workflows** as needed
5. **Document changes** in this README

### For Deployment

1. **Always test on testnet** first
2. **Verify all checks pass** before mainnet
3. **Have rollback plan** ready
4. **Monitor deployment** closely
5. **Communicate with team** during deployment

---

## 🔄 Workflow Dependencies

```
Test Suite
    ↓
Coverage Report
    ↓
Security Scan
    ↓
Pre-Deployment Checks
    ↓
Deployment
    ↓
Post-Deployment Validation
```

---

## 📞 Support

For workflow issues:
- **GitHub Issues**: [Report Issue](https://github.com/SylvanToken/issues)
- **Documentation**: [CI/CD Guide](../../docs/CICD_INTEGRATION_GUIDE.md)
- **Team Contact**: devops@sylvantoken.org

---

## 📝 Changelog

### v1.0.0 (January 2025)
- ✅ Initial workflow setup
- ✅ Test automation
- ✅ Coverage reporting
- ✅ Security scanning
- ✅ Deployment automation

---

**Last Updated**: January 8, 2025  
**Maintained By**: Sylvan Token DevOps Team

© 2025 Sylvan Token. All rights reserved.
