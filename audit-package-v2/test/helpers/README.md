# Test Helpers

This directory contains reusable test utilities and fixtures for the EnhancedSylvanToken test suite.

## Files

### test-fixtures.js

Centralized test fixture system using `@nomicfoundation/hardhat-network-helpers` for efficient test execution.

#### Available Fixtures

1. **deployTokenFixture()** - Basic deployment
   - Deploys EnhancedSylvanToken with libraries
   - Sets up initial exempt accounts
   - Returns token, accounts, libraries, and config

2. **deployTokenWithTradingFixture()** - Ready for trading
   - Same as basic fixture (trading is always enabled)
   - Most commonly used fixture

3. **deployTokenWithAdminFixture()** - Admin wallet configured
   - Configures admin wallet with 10M tokens
   - Processes initial 10% release
   - Ready for vesting tests

4. **deployTokenWithLockedWalletFixture()** - Locked wallet vesting
   - Creates locked wallet vesting with 300M tokens
   - 34-month vesting schedule
   - Ready for locked wallet tests

5. **deployTokenWithExemptionsFixture()** - Multiple exemptions
   - Adds user1 and user2 as exempt
   - Ready for exemption management tests

6. **deployTokenWithAMMFixture()** - AMM configuration
   - Compatibility fixture (EnhancedSylvanToken doesn't have AMM-specific features)

7. **deployTokenWithDistributionFixture()** - Tokens distributed
   - Distributes tokens to test users
   - Ready for transfer and fee tests

8. **deployTokenFullyConfiguredFixture()** - Complete setup
   - Admin wallet configured
   - Locked wallet vesting created
   - Exemptions added
   - Tokens distributed
   - Ready for integration tests

#### Configuration Constants (TEST_CONFIG)

```javascript
{
    // Token amounts
    INITIAL_SUPPLY: 1B tokens
    SMALL_AMOUNT: 100 tokens
    MEDIUM_AMOUNT: 10,000 tokens
    LARGE_AMOUNT: 1,000,000 tokens
    
    // Admin allocations
    ADMIN_ALLOCATION: 10M tokens
    LOCKED_ALLOCATION: 300M tokens
    
    // Time constants
    SECONDS_PER_MONTH: 2629746
    SECONDS_PER_DAY: 86400
    CLIFF_DAYS: 30
    
    // Fee parameters
    TAX_RATE: 100 (1%)
    TAX_DENOMINATOR: 10000
    FEE_SHARE: 5000 (50%)
    BURN_SHARE: 2500 (25%)
    DONATION_SHARE: 2500 (25%)
    
    // Lock parameters
    ADMIN_LOCK_PERCENTAGE: 9000 (90%)
    ADMIN_IMMEDIATE_RELEASE: 1000 (10%)
    ADMIN_MONTHLY_RELEASE: 500 (5%)
    LOCKED_MONTHLY_RELEASE: 300 (3%)
    BURN_PERCENTAGE: 1000 (10%)
}
```

#### Helper Functions

**Time Helpers:**
- `advanceTime(seconds)` - Advance blockchain time
- `advanceTimeByMonths(months)` - Advance by months
- `advanceTimeByDays(days)` - Advance by days
- `getCurrentTimestamp()` - Get current block timestamp

**Calculation Helpers:**
- `calculateExpectedFee(amount)` - Calculate 1% fee
- `calculateFeeDistribution(feeAmount)` - Calculate fee split
- `calculateAdminReleaseAmounts(allocation)` - Calculate admin vesting amounts
- `calculateLockedReleaseAmounts(allocation)` - Calculate locked wallet amounts

**Balance Helpers:**
- `getBalanceSnapshot(token, addresses)` - Snapshot balances
- `calculateBalanceChanges(before, after)` - Calculate balance changes

## Usage Examples

### Basic Usage

```javascript
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { deployTokenWithTradingFixture, TEST_CONFIG } = require("./helpers/test-fixtures");

describe("My Test Suite", function () {
    it("should test something", async function () {
        const { token, accounts, config } = await loadFixture(deployTokenWithTradingFixture);
        
        // Use token and accounts
        await token.transfer(accounts.user1.address, config.SMALL_AMOUNT);
        expect(await token.balanceOf(accounts.user1.address)).to.equal(config.SMALL_AMOUNT);
    });
});
```

### Using Time Helpers

```javascript
const { advanceTimeByMonths } = require("./helpers/test-fixtures");

it("should release tokens after 1 month", async function () {
    const { token, accounts } = await loadFixture(deployTokenWithAdminFixture);
    
    // Advance time by 1 month
    await advanceTimeByMonths(1);
    
    // Check available release
    const [available, burn] = await token.calculateAvailableRelease(accounts.adminWallet.address);
    expect(available).to.be.gt(0);
});
```

### Using Calculation Helpers

```javascript
const { calculateExpectedFee, calculateFeeDistribution } = require("./helpers/test-fixtures");

it("should apply correct fees", async function () {
    const amount = ethers.utils.parseEther("1000");
    
    const expectedFee = calculateExpectedFee(amount);
    const distribution = calculateFeeDistribution(expectedFee);
    
    expect(distribution.feeWalletAmount).to.equal(expectedFee.mul(5000).div(10000));
});
```

### Using Balance Snapshots

```javascript
const { getBalanceSnapshot, calculateBalanceChanges } = require("./helpers/test-fixtures");

it("should track balance changes", async function () {
    const { token, accounts } = await loadFixture(deployTokenWithDistributionFixture);
    
    const addresses = [accounts.user1.address, accounts.user2.address];
    const before = await getBalanceSnapshot(token, addresses);
    
    await token.connect(accounts.user1).transfer(accounts.user2.address, TEST_CONFIG.SMALL_AMOUNT);
    
    const after = await getBalanceSnapshot(token, addresses);
    const changes = calculateBalanceChanges(before, after);
    
    expect(changes[accounts.user1.address]).to.be.lt(0);
    expect(changes[accounts.user2.address]).to.be.gt(0);
});
```

## Benefits

1. **Faster Tests** - `loadFixture` caches deployment state, reducing test execution time
2. **Consistency** - All tests use the same deployment configuration
3. **Reusability** - Common setups are defined once and reused
4. **Maintainability** - Changes to deployment logic only need to be made in one place
5. **Type Safety** - Configuration constants prevent typos and magic numbers

## Best Practices

1. Always use `loadFixture` instead of `beforeEach` for deployment
2. Use `TEST_CONFIG` constants instead of hardcoded values
3. Choose the most specific fixture for your test needs
4. Combine fixtures with custom setup when needed
5. Use helper functions for common calculations

## See Also

- `test/fixture-usage-example.test.js` - Complete examples of fixture usage
- `test/01_core_functionality.test.js` - Real-world fixture usage
- `test/comprehensive_coverage.test.js` - Advanced fixture patterns
