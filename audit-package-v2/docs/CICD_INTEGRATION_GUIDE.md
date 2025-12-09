# CI/CD Integration Guide

## Overview

This guide shows how to integrate the Enhanced Sylvan Token test suite into CI/CD pipelines for automated testing, coverage reporting, and deployment validation.

## GitHub Actions Integration

### Basic Test Workflow

Create `.github/workflows/test.yml`:

```yaml
name: Test Suite

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '16'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npx hardhat test
      
      - name: Generate coverage
        run: npx hardhat coverage
      
      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json
          flags: unittests
          name: codecov-umbrella
```

### Advanced Workflow with Coverage Threshold

```yaml
name: Test and Coverage

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    strategy:
      matrix:
        node-version: [16.x, 18.x]
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Use Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v3
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Compile contracts
        run: npx hardhat compile
      
      - name: Run tests
        run: npx hardhat test
      
      - name: Generate coverage
        run: npx hardhat coverage
      
      - name: Check coverage threshold
        run: |
          COVERAGE=$(cat coverage/coverage-summary.json | jq '.total.lines.pct')
          echo "Coverage: $COVERAGE%"
          if (( $(echo "$COVERAGE < 85" | bc -l) )); then
            echo "❌ Coverage $COVERAGE% is below 85% threshold"
            exit 1
          fi
          echo "✅ Coverage $COVERAGE% meets threshold"
      
      - name: Upload coverage reports
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
          flags: unittests
          fail_ci_if_error: true
      
      - name: Archive coverage report
        uses: actions/upload-artifact@v3
        with:
          name: coverage-report
          path: coverage/
```


### Security and Linting Workflow

```yaml
name: Security and Quality

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  security:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '16'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run Slither
        uses: crytic/slither-action@v0.3.0
        with:
          target: 'contracts/'
          slither-args: '--filter-paths "node_modules|test"'
        continue-on-error: true
      
      - name: Run Solhint
        run: npx solhint 'contracts/**/*.sol'
        continue-on-error: true
      
      - name: Check contract size
        run: npx hardhat size-contracts
```

### Deployment Validation Workflow

```yaml
name: Deployment Validation

on:
  push:
    branches: [ main ]

jobs:
  validate-deployment:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '16'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Start Hardhat Network
        run: npx hardhat node &
        
      - name: Wait for network
        run: sleep 5
      
      - name: Deploy to local network
        run: npx hardhat run scripts/deployment/deploy-local.js --network localhost
      
      - name: Run deployment validation tests
        run: npx hardhat test test/local-deployment-validation.test.js --network localhost
      
      - name: Archive deployment report
        uses: actions/upload-artifact@v3
        with:
          name: deployment-report
          path: deployments/
```

## GitLab CI Integration

### `.gitlab-ci.yml` Configuration

```yaml
stages:
  - build
  - test
  - coverage
  - deploy

variables:
  NODE_VERSION: "16"

cache:
  paths:
    - node_modules/
    - cache/
    - artifacts/

build:
  stage: build
  image: node:${NODE_VERSION}
  script:
    - npm ci
    - npx hardhat compile
  artifacts:
    paths:
      - artifacts/
      - cache/
    expire_in: 1 hour

test:
  stage: test
  image: node:${NODE_VERSION}
  dependencies:
    - build
  script:
    - npm ci
    - npx hardhat test
  artifacts:
    reports:
      junit: test-results.xml

coverage:
  stage: coverage
  image: node:${NODE_VERSION}
  dependencies:
    - build
  script:
    - npm ci
    - npx hardhat coverage
    - echo "Coverage report generated"
  coverage: '/All files[^|]*\|[^|]*\s+([\d\.]+)/'
  artifacts:
    paths:
      - coverage/
    reports:
      coverage_report:
        coverage_format: cobertura
        path: coverage/cobertura-coverage.xml

deploy-validation:
  stage: deploy
  image: node:${NODE_VERSION}
  dependencies:
    - build
  script:
    - npm ci
    - npx hardhat node &
    - sleep 5
    - npx hardhat run scripts/deployment/deploy-local.js --network localhost
    - npx hardhat test test/local-deployment-validation.test.js --network localhost
  only:
    - main
```

## Jenkins Integration

### Jenkinsfile

```groovy
pipeline {
    agent any
    
    tools {
        nodejs 'NodeJS 16'
    }
    
    environment {
        CI = 'true'
    }
    
    stages {
        stage('Install') {
            steps {
                sh 'npm ci'
            }
        }
        
        stage('Compile') {
            steps {
                sh 'npx hardhat compile'
            }
        }
        
        stage('Test') {
            steps {
                sh 'npx hardhat test'
            }
        }
        
        stage('Coverage') {
            steps {
                sh 'npx hardhat coverage'
                publishHTML([
                    reportDir: 'coverage',
                    reportFiles: 'index.html',
                    reportName: 'Coverage Report'
                ])
            }
        }
        
        stage('Security Analysis') {
            steps {
                sh 'npm run security:analysis'
            }
        }
        
        stage('Deploy Validation') {
            when {
                branch 'main'
            }
            steps {
                sh 'npx hardhat node &'
                sh 'sleep 5'
                sh 'npx hardhat run scripts/deployment/deploy-local.js --network localhost'
                sh 'npx hardhat test test/local-deployment-validation.test.js --network localhost'
            }
        }
    }
    
    post {
        always {
            junit 'test-results.xml'
            archiveArtifacts artifacts: 'coverage/**/*', allowEmptyArchive: true
        }
        failure {
            emailext (
                subject: "Build Failed: ${env.JOB_NAME} - ${env.BUILD_NUMBER}",
                body: "Check console output at ${env.BUILD_URL}",
                to: "team@example.com"
            )
        }
    }
}
```


## CircleCI Integration

### `.circleci/config.yml`

```yaml
version: 2.1

orbs:
  node: circleci/node@5.0.0

jobs:
  test:
    docker:
      - image: cimg/node:16.0
    steps:
      - checkout
      - node/install-packages:
          pkg-manager: npm
      - run:
          name: Compile contracts
          command: npx hardhat compile
      - run:
          name: Run tests
          command: npx hardhat test
      - store_test_results:
          path: test-results
  
  coverage:
    docker:
      - image: cimg/node:16.0
    steps:
      - checkout
      - node/install-packages:
          pkg-manager: npm
      - run:
          name: Generate coverage
          command: npx hardhat coverage
      - run:
          name: Check coverage threshold
          command: |
            COVERAGE=$(cat coverage/coverage-summary.json | jq '.total.lines.pct')
            if (( $(echo "$COVERAGE < 85" | bc -l) )); then
              echo "Coverage below threshold"
              exit 1
            fi
      - store_artifacts:
          path: coverage
      - codecov/upload:
          file: coverage/coverage-final.json

workflows:
  test-and-coverage:
    jobs:
      - test
      - coverage:
          requires:
            - test
```

## Coverage Reporting Services

### Codecov Integration

1. **Sign up at [codecov.io](https://codecov.io)**

2. **Add to GitHub Actions:**
```yaml
- name: Upload to Codecov
  uses: codecov/codecov-action@v3
  with:
    files: ./coverage/coverage-final.json
    flags: unittests
    name: codecov-umbrella
    fail_ci_if_error: true
```

3. **Add badge to README.md:**
```markdown
[![codecov](https://codecov.io/gh/username/repo/branch/main/graph/badge.svg)](https://codecov.io/gh/username/repo)
```

### Coveralls Integration

1. **Install coveralls:**
```bash
npm install --save-dev coveralls
```

2. **Add to package.json:**
```json
{
  "scripts": {
    "coverage": "npx hardhat coverage && cat coverage/lcov.info | coveralls"
  }
}
```

3. **Add to CI:**
```yaml
- name: Upload to Coveralls
  uses: coverallsapp/github-action@master
  with:
    github-token: ${{ secrets.GITHUB_TOKEN }}
    path-to-lcov: ./coverage/lcov.info
```

## Environment Variables and Secrets

### GitHub Secrets Setup

1. Go to repository Settings → Secrets → Actions
2. Add required secrets:
   - `PRIVATE_KEY` - Deployment private key
   - `BSC_API_KEY` - BscScan API key
   - `INFURA_KEY` - Infura project ID (if using)

### Using Secrets in Workflow

```yaml
env:
  PRIVATE_KEY: ${{ secrets.PRIVATE_KEY }}
  BSC_API_KEY: ${{ secrets.BSC_API_KEY }}

steps:
  - name: Deploy to testnet
    run: npx hardhat run scripts/deployment/deploy-enhanced-complete.js --network bscTestnet
```

### Environment-Specific Configuration

```yaml
jobs:
  deploy-testnet:
    environment: testnet
    steps:
      - name: Deploy
        run: npm run deploy:testnet
  
  deploy-mainnet:
    environment: production
    steps:
      - name: Deploy
        run: npm run deploy:mainnet
```

## Quality Gates

### Coverage Threshold Check

```bash
#!/bin/bash
# scripts/check-coverage.sh

COVERAGE=$(cat coverage/coverage-summary.json | jq '.total.lines.pct')
THRESHOLD=85

echo "Current coverage: $COVERAGE%"
echo "Required threshold: $THRESHOLD%"

if (( $(echo "$COVERAGE < $THRESHOLD" | bc -l) )); then
  echo "❌ Coverage $COVERAGE% is below $THRESHOLD% threshold"
  exit 1
fi

echo "✅ Coverage $COVERAGE% meets threshold"
exit 0
```

### Test Performance Check

```bash
#!/bin/bash
# scripts/check-test-performance.sh

START_TIME=$(date +%s)
npx hardhat test
END_TIME=$(date +%s)

DURATION=$((END_TIME - START_TIME))
MAX_DURATION=180  # 3 minutes

echo "Test duration: ${DURATION}s"
echo "Maximum allowed: ${MAX_DURATION}s"

if [ $DURATION -gt $MAX_DURATION ]; then
  echo "❌ Tests took too long"
  exit 1
fi

echo "✅ Tests completed within time limit"
exit 0
```

### Gas Usage Check

```bash
#!/bin/bash
# scripts/check-gas-usage.sh

npx hardhat test --reporter gas-reporter

# Parse gas report and check against limits
# Implementation depends on your gas limits
```

## Automated Deployment

### Testnet Deployment Workflow

```yaml
name: Deploy to Testnet

on:
  push:
    branches: [ develop ]
    tags:
      - 'v*-testnet'

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: testnet
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '16'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npx hardhat test
      
      - name: Deploy to BSC Testnet
        env:
          PRIVATE_KEY: ${{ secrets.TESTNET_PRIVATE_KEY }}
          BSC_API_KEY: ${{ secrets.BSC_API_KEY }}
        run: npx hardhat run scripts/deployment/deploy-enhanced-complete.js --network bscTestnet
      
      - name: Verify contracts
        env:
          BSC_API_KEY: ${{ secrets.BSC_API_KEY }}
        run: npm run verify:testnet
      
      - name: Archive deployment report
        uses: actions/upload-artifact@v3
        with:
          name: testnet-deployment
          path: deployments/bscTestnet-*.json
```


### Mainnet Deployment Workflow (Manual Approval)

```yaml
name: Deploy to Mainnet

on:
  workflow_dispatch:
    inputs:
      version:
        description: 'Version to deploy'
        required: true

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: 
      name: production
      url: https://bscscan.com
    
    steps:
      - uses: actions/checkout@v3
        with:
          ref: ${{ github.event.inputs.version }}
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '16'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run full test suite
        run: npx hardhat test
      
      - name: Generate coverage
        run: npx hardhat coverage
      
      - name: Check coverage threshold
        run: |
          COVERAGE=$(cat coverage/coverage-summary.json | jq '.total.lines.pct')
          if (( $(echo "$COVERAGE < 85" | bc -l) )); then
            echo "Coverage too low for mainnet deployment"
            exit 1
          fi
      
      - name: Security analysis
        run: npm run security:full
      
      - name: Deploy to BSC Mainnet
        env:
          PRIVATE_KEY: ${{ secrets.MAINNET_PRIVATE_KEY }}
          BSC_API_KEY: ${{ secrets.BSC_API_KEY }}
        run: npx hardhat run scripts/deployment/deploy-enhanced-complete.js --network bscMainnet
      
      - name: Verify contracts
        env:
          BSC_API_KEY: ${{ secrets.BSC_API_KEY }}
        run: npm run verify:mainnet
      
      - name: Create release
        uses: actions/create-release@v1
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          tag_name: ${{ github.event.inputs.version }}
          release_name: Release ${{ github.event.inputs.version }}
          draft: false
          prerelease: false
```

## Notifications

### Slack Notifications

```yaml
- name: Notify Slack on Success
  if: success()
  uses: slackapi/slack-github-action@v1.24.0
  with:
    payload: |
      {
        "text": "✅ Tests passed for ${{ github.repository }}",
        "blocks": [
          {
            "type": "section",
            "text": {
              "type": "mrkdwn",
              "text": "✅ *Tests Passed*\nRepository: ${{ github.repository }}\nBranch: ${{ github.ref }}\nCommit: ${{ github.sha }}"
            }
          }
        ]
      }
  env:
    SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}

- name: Notify Slack on Failure
  if: failure()
  uses: slackapi/slack-github-action@v1.24.0
  with:
    payload: |
      {
        "text": "❌ Tests failed for ${{ github.repository }}",
        "blocks": [
          {
            "type": "section",
            "text": {
              "type": "mrkdwn",
              "text": "❌ *Tests Failed*\nRepository: ${{ github.repository }}\nBranch: ${{ github.ref }}\nCommit: ${{ github.sha }}\n<${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}|View Run>"
            }
          }
        ]
      }
  env:
    SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
```

### Discord Notifications

```yaml
- name: Discord notification
  uses: Ilshidur/action-discord@master
  env:
    DISCORD_WEBHOOK: ${{ secrets.DISCORD_WEBHOOK }}
  with:
    args: 'Tests completed for {{ EVENT_PAYLOAD.repository.full_name }}'
```

## Performance Monitoring

### Track Test Execution Time

```yaml
- name: Run tests with timing
  run: |
    START=$(date +%s)
    npx hardhat test
    END=$(date +%s)
    DURATION=$((END - START))
    echo "test_duration_seconds=$DURATION" >> $GITHUB_OUTPUT
  id: test

- name: Comment test duration
  uses: actions/github-script@v6
  with:
    script: |
      github.rest.issues.createComment({
        issue_number: context.issue.number,
        owner: context.repo.owner,
        repo: context.repo.repo,
        body: `⏱️ Tests completed in ${{ steps.test.outputs.test_duration_seconds }} seconds`
      })
```

### Track Coverage Trends

```yaml
- name: Coverage trend
  uses: codecov/codecov-action@v3
  with:
    files: ./coverage/coverage-final.json
    flags: unittests
    name: codecov-umbrella
    fail_ci_if_error: true
    verbose: true
```

## Best Practices

### 1. Cache Dependencies

```yaml
- name: Cache node modules
  uses: actions/cache@v3
  with:
    path: node_modules
    key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
    restore-keys: |
      ${{ runner.os }}-node-
```

### 2. Parallel Jobs

```yaml
jobs:
  test:
    runs-on: ubuntu-latest
    # Tests run in parallel
  
  coverage:
    runs-on: ubuntu-latest
    # Coverage runs in parallel
  
  security:
    runs-on: ubuntu-latest
    # Security runs in parallel
```

### 3. Conditional Execution

```yaml
- name: Deploy
  if: github.ref == 'refs/heads/main' && github.event_name == 'push'
  run: npm run deploy
```

### 4. Matrix Testing

```yaml
strategy:
  matrix:
    node-version: [16.x, 18.x, 20.x]
    os: [ubuntu-latest, windows-latest, macos-latest]
```

### 5. Artifact Management

```yaml
- name: Upload test results
  uses: actions/upload-artifact@v3
  with:
    name: test-results
    path: test-results/
    retention-days: 30
```

## Troubleshooting CI/CD

### Issue: Tests pass locally but fail in CI

**Common causes:**
- Environment differences
- Missing environment variables
- Timing issues
- Network connectivity

**Solution:**
```yaml
- name: Debug environment
  run: |
    node --version
    npm --version
    npx hardhat --version
    env | sort
```

### Issue: Coverage generation fails

**Solution:**
```yaml
- name: Generate coverage with more memory
  run: NODE_OPTIONS="--max-old-space-size=4096" npx hardhat coverage
```

### Issue: Deployment fails

**Solution:**
```yaml
- name: Validate before deploy
  run: |
    npx hardhat compile
    npx hardhat test
    npx hardhat run scripts/deployment/deploy-local.js --network localhost
```

## Related Documentation

- [Test Fixture Guide](./TEST_FIXTURE_GUIDE.md)
- [Coverage Improvement Guide](./COVERAGE_IMPROVEMENT_GUIDE.md)
- [Testing Troubleshooting Guide](./TESTING_TROUBLESHOOTING_GUIDE.md)
- [Local Deployment Guide](./LOCAL_DEPLOYMENT_GUIDE.md)
