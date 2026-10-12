import { calculateComprehensiveBudget } from '../studentBudgetEngine';
import { formatINR } from '../costCalculator';

console.log('--- Testing Comprehensive Student Budget Engine ---');

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`Assertion failure: ${msg}`);
}

const input1 = {
  monthlyRent: 10000,
  securityDeposit: 20000,
  foodMonthly: 3500,
  transportMonthly: 1200,
  utilitiesMonthly: 800,
  mobileInternetMonthly: 499,
  personalMonthly: 2000,
  otherMonthly: 500,
  oneTimeMoveInFees: 1000,
  studentMonthlyBudget: 20000,
  durationMonths: 6,
};

const res1 = calculateComprehensiveBudget(input1);

// Recurring monthly = 10000 + 3500 + 1200 + 800 + 499 + 2000 + 500 = 18499
assert(res1.breakdown.recurringMonthlyTotal === 18499, `Expected recurring 18499, got ${res1.breakdown.recurringMonthlyTotal}`);
// First month cash = 20000 deposit + 10000 rent + 1000 fee = 31000
assert(res1.breakdown.firstMonthMoveInTotal === 31000, `Expected move in 31000, got ${res1.breakdown.firstMonthMoveInTotal}`);
// Remaining balance = 20000 - 18499 = 1501
assert(res1.breakdown.monthlyBalance === 1501, `Expected balance 1501, got ${res1.breakdown.monthlyBalance}`);
assert(res1.breakdown.isWithinBudget === true, 'Expected isWithinBudget to be true');

// Multi-month 6 months = (6 * 18499) + 20000 deposit + 1000 fee = 110994 + 21000 = 131994
assert(res1.periodTotals.totalCashNeededIncludingDeposit === 131994, `Expected 6 month cash 131994, got ${res1.periodTotals.totalCashNeededIncludingDeposit}`);

// Edge case: NaN and undefined sanitization
const input2 = {
  monthlyRent: NaN,
  securityDeposit: undefined as any,
  foodMonthly: 2000,
  transportMonthly: 500,
  utilitiesMonthly: 0,
  mobileInternetMonthly: 0,
  personalMonthly: 0,
  otherMonthly: 0,
  oneTimeMoveInFees: 0,
  studentMonthlyBudget: 5000,
};
const res2 = calculateComprehensiveBudget(input2);
assert(res2.breakdown.recurringMonthlyTotal === 2500, `Expected 2500 recurring`);
assert(res2.breakdown.securityDeposit === 0, `Expected 0 deposit`);
assert(res2.breakdown.firstMonthMoveInTotal === 0, `Expected 0 move in cash`);

console.log('✅ ALL Comprehensive Budget Calculations Passed Successfully!');
