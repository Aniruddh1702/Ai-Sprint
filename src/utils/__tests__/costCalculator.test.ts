import { calculatePGBreakdown, formatINR, getDepositMultiplier } from '../costCalculator';
import { PGListing } from '@/types/pg';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

console.log('--- Running PG Cost Calculation Engine Unit Tests ---');

// Test 1: Standard PG with all inclusive food
const sample1: Partial<PGListing> = {
  monthlyRent: 12000,
  securityDeposit: 24000,
  foodIncluded: true,
  foodCostEstimate: 4000, // Should be ignored because food is included!
  maintenanceCharges: 500,
  electricityEstimate: 800,
  waterAndGasCharges: 200,
  laundryCharges: 300,
  wifiCharges: 0,
  oneTimeMoveInFee: 1000,
  brokerageFee: 0,
};

const result1 = calculatePGBreakdown(sample1, 15000);
assert(result1.recurringMonthlyTotal === 13800, `Expected recurring 13800, got ${result1.recurringMonthlyTotal}`);
assert(result1.food === 0, `Expected food to be 0 when included, got ${result1.food}`);
assert(result1.firstMonthCashTotal === 37000, `Expected first month cash 37000 (24000 deposit + 12000 rent + 1000 fee), got ${result1.firstMonthCashTotal}`);
assert(result1.monthlySavingsOrDeficit === 1200, `Expected savings 1200, got ${result1.monthlySavingsOrDeficit}`);
assert(result1.isWithinBudget === true, 'Expected isWithinBudget to be true');

// Test 2: Listing without food, over budget
const sample2: Partial<PGListing> = {
  monthlyRent: 16000,
  securityDeposit: 32000,
  foodIncluded: false,
  foodCostEstimate: 4500,
  maintenanceCharges: 1000,
  electricityEstimate: 1200,
  laundryCharges: 500,
  wifiCharges: 500,
  oneTimeMoveInFee: 2000,
  brokerageFee: 8000,
};

const result2 = calculatePGBreakdown(sample2, 18000);
assert(result2.recurringMonthlyTotal === 23700, `Expected recurring 23700, got ${result2.recurringMonthlyTotal}`);
assert(result2.firstMonthCashTotal === 58000, `Expected first month 58000, got ${result2.firstMonthCashTotal}`);
assert(result2.isWithinBudget === false, 'Expected over budget');
assert(result2.monthlySavingsOrDeficit === -5700, 'Expected deficit -5700');

// Test 3: Zero or missing/undefined fields gracefully handled
const sample3: Partial<PGListing> = {
  monthlyRent: undefined,
  securityDeposit: NaN,
  foodIncluded: false,
};
const result3 = calculatePGBreakdown(sample3, 10000);
assert(result3.recurringMonthlyTotal === 0, 'Expected 0 total for empty listing');
assert(result3.firstMonthCashTotal === 0, 'Expected 0 first month');

// Test 4: Format INR & multipliers
assert(formatINR(15000) === '₹15,000', `Expected ₹15,000, got ${formatINR(15000)}`);
assert(formatINR(-2500) === '-₹2,500', `Expected -₹2,500, got ${formatINR(-2500)}`);
assert(getDepositMultiplier(24000, 12000) === '2x', 'Expected 2x');
assert(getDepositMultiplier(30000, 12000) === '2.5x', 'Expected 2.5x');

console.log('✅ ALL 12 Calculation Assertions Passed Successfully!');
