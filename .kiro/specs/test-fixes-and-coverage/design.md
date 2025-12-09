# Design Document - Test Fixes and Coverage Improvement

## Overview

Bu tasarım, 42 başarısız testi düzeltmeyi ve branch coverage'ı %73.64'ten %85+'a çıkarmayı hedefleyen sistematik bir yaklaşım sunmaktadır.

## Architecture

### Test Düzeltme Stratejisi

```
┌─────────────────────────────────────────────────────────────┐
│                   Test Fix Pipeline                          │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  1. Vesting Tests (6 test)                                  │
│     └─> Burn calculation fixes                              │
│     └─> Month count adjustments                             │
│                                                               │
│  2. Integration Tests (~20 test)                            │
│     └─> Function implementation                             │
│     └─> removeExemptWallet fixes                            │
│     └─> Cooldown mechanism tests                            │
│                                                               │
│  3. Comprehensive Coverage (42 test)                        │
│     └─> Token initialization                                │
│     └─> Fixture pattern implementation                      │
│     └─> beforeEach hook fixes                               │
│                                                               │
│  4. Branch Coverage Improvement                             │
│     └─> Conditional logic tests                             │
│     └─> Error path coverage                                 │
│     └─> State transition tests                              │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### 1. Vesting Test Fixes

**Affected File:** `test/enhanced-fee-system.test.js`

**Issues:**
- Burn calculation: Tests expect gross amount, but contract returns net (after 10% burn)
- Month count: Off-by-one errors in elapsed/remaining months
- Precision: Rounding differences in proportional burning

**Solution:**
```javascript
// Pattern for all vesting tests
const expectedGross = allocation.mul(percentage).div(10000);
const expectedBurn = expectedGross.mul(1000).div(10000); // 10%
const expectedNet = expectedGross.sub(expectedBurn); // 90%

expect(availableAmount).to.equal(expectedNet);
expect(burnAmount).to.equal(expectedBurn);
```

**Tests to Fix:**
1. `Should calculate available release correctly after time passes`
2. `Should calculate multiple months correctly`
3. `Should track total burned amounts correctly`
4. `Should handle proportional burning with precision`
5. `Should cap at total amount after 34 months`
6. `Should handle cliff period correctly in vesting info`

### 2. Integration Test Fixes

**Affected Files:**
- `test/integration/CrossLibraryIntegration.test.js`
- `test/integration/EdgeCaseScenarios.test.js`
- `test/integration/EnhancedTokenIntegration.test.js`

**Issues:**
- Missing functions: `enableEmergencyWithdraw`, `updateFeeWallet`, etc.
- `removeExemptWallet` errors: Trying to remove non-exempt wallets
- Cooldown bypass: Tests expect cooldown to be enforced
- Performance threshold: Gas usage exceeds limits

**Solution Approaches:**

**A. Missing Functions:**
- Check if functions exist in EnhancedSylvanToken
- If not, either implement or update tests to use existing functions
- Use alternative function names if available

**B. removeExemptWallet Errors:**
```javascript
// Before removing, ensure wallet is exempt
if (await token.isExempt(wallet.address)) {
    await token.removeExemptWallet(wallet.address);
}
```

**C. Cooldown Tests:**
- Verify cooldown constants in contract
- Use time manipulation to bypass cooldown in tests
- Or adjust test expectations

**D. Performance Tests:**
- Increase gas limit threshold
- Optimize test operations
- Or mark as pending if not critical

### 3. Comprehensive Coverage Test Fixes

**Affected File:** `test/comprehensive_coverage.test.js`

**Current State:** Skip edildi (42 test)

**Issues:**
- Token not initialized in beforeEach hooks
- Missing fixture usage
- Undefined variables (owner, user1, user2, etc.)

**Solution Pattern:**
```javascript
describe("Test Suite", function () {
    async function setupFixture() {
        return await deployTokenWithTradingFixture();
    }

    describe("Test Group", function () {
        it("Should do something", async function () {
            const { token, accounts } = await loadFixture(setupFixture);
            // Test logic here
        });
    });
});
```

**Implementation Steps:**
1. Remove `describe.skip`
2. Update all tests to use `loadFixture(setupFixture)`
3. Destructure needed variables from fixture
4. Remove empty beforeEach hooks
5. Update variable references

### 4. Branch Coverage Improvement

**Current:** 73.64%  
**Target:** 85%+  
**Gap:** +11.36%

**Strategy:**

**A. Identify Uncovered Branches:**
```bash
npx hardhat coverage
# Analyze coverage/index.html for uncovered branches
```

**B. Add Tests for:**

1. **Conditional Logic:**
   - if/else branches
   - Ternary operators
   - Switch statements

2. **Error Paths:**
   - require() statements
   - revert conditions
   - Custom errors

3. **State Transitions:**
   - Paused/unpaused states
   - Ownership transfer states
   - Emergency states

4. **Edge Cases:**
   - Zero amounts
   - Maximum amounts
   - Boundary conditions

**C. Test Patterns:**

```javascript
// Pattern 1: Test both branches of conditional
it("Should handle condition true", async function () {
    // Setup for true condition
    // Verify true branch behavior
});

it("Should handle condition false", async function () {
    // Setup for false condition
    // Verify false branch behavior
});

// Pattern 2: Test error conditions
it("Should revert when invalid", async function () {
    await expect(
        token.someFunction(invalidParam)
    ).to.be.revertedWith("Error message");
});

// Pattern 3: Test state transitions
it("Should transition from state A to B", async function () {
    // Verify initial state A
    // Trigger transition
    // Verify final state B
});
```

## Data Models

### Test Execution Flow

```
┌──────────────┐
│  Run Tests   │
└──────┬───────┘
       │
       ├─> Vesting Tests (Priority 1)
       │   └─> Fix burn calculations
       │   └─> Adjust month counts
       │   └─> Verify: 6 → 0 failures
       │
       ├─> Integration Tests (Priority 2)
       │   └─> Fix function calls
       │   └─> Handle removeExemptWallet
       │   └─> Adjust cooldowns
       │   └─> Verify: ~20 → 0 failures
       │
       ├─> Comprehensive Coverage (Priority 3)
       │   └─> Implement fixtures
       │   └─> Fix initialization
       │   └─> Update all tests
       │   └─> Verify: 42 → 0 failures
       │
       └─> Branch Coverage (Priority 4)
           └─> Add conditional tests
           └─> Add error path tests
           └─> Add edge case tests
           └─> Verify: 73.64% → 85%+
```

### Coverage Tracking

```javascript
{
  "before": {
    "statements": 95.02,
    "branches": 73.64,
    "functions": 97.8,
    "lines": 93.65,
    "failingTests": 42
  },
  "target": {
    "statements": 95,
    "branches": 85,
    "functions": 95,
    "lines": 95,
    "failingTests": 0
  }
}
```

## Error Handling

### Common Test Errors

**1. ReferenceError: token is not defined**
- **Cause:** Missing fixture or initialization
- **Fix:** Use `loadFixture(setupFixture)` and destructure

**2. AssertionError: expected X to equal Y**
- **Cause:** Incorrect test expectations
- **Fix:** Update expectations to match actual behavior

**3. WalletNotExempt Error**
- **Cause:** Trying to remove non-exempt wallet
- **Fix:** Check exemption status before removal

**4. Function not found**
- **Cause:** Function doesn't exist in contract
- **Fix:** Use correct function name or implement

## Testing Strategy

### Test Execution Order

1. **Unit Tests First**
   - Fix vesting calculations
   - Verify individual functions

2. **Integration Tests Second**
   - Fix cross-component interactions
   - Verify system behavior

3. **Coverage Tests Last**
   - Comprehensive test suite
   - Full system validation

### Validation Checkpoints

After each phase:
```bash
# Run specific test file
npx hardhat test test/[filename].test.js

# Check overall progress
npx hardhat test | grep "passing\|failing"

# Verify coverage
npx hardhat coverage
```

## Implementation Plan

### Phase 1: Vesting Tests (Est: 30 min)
- [ ] Fix burn calculation tests (4 tests)
- [ ] Fix month count tests (2 tests)
- [ ] Verify all vesting tests pass

### Phase 2: Integration Tests (Est: 1 hour)
- [ ] Analyze missing functions
- [ ] Fix removeExemptWallet usage
- [ ] Adjust cooldown tests
- [ ] Fix performance tests
- [ ] Verify all integration tests pass

### Phase 3: Comprehensive Coverage (Est: 2 hours)
- [ ] Remove describe.skip
- [ ] Implement fixture pattern
- [ ] Fix all beforeEach hooks
- [ ] Update variable references
- [ ] Verify all 42 tests pass

### Phase 4: Branch Coverage (Est: 1-2 hours)
- [ ] Identify uncovered branches
- [ ] Add conditional logic tests
- [ ] Add error path tests
- [ ] Add edge case tests
- [ ] Verify 85%+ branch coverage

## Success Criteria

- ✅ 0 failing tests (from 42)
- ✅ 85%+ branch coverage (from 73.64%)
- ✅ 95%+ statement coverage (maintained)
- ✅ 95%+ line coverage (from 93.65%)
- ✅ All integration tests passing
- ✅ Comprehensive coverage tests passing

## Notes

- Vesting tests are highest priority (quick wins)
- Integration tests may require contract changes
- Comprehensive coverage needs systematic refactoring
- Branch coverage requires new test cases
- Maintain existing passing tests (526 tests)
