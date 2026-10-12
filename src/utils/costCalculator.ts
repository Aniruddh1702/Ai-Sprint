import { PGListing, CostBreakdown } from '@/types/pg';

/**
 * Deterministic cost calculation logic for PG Proof.
 * Implements strict rules without double counting or hallucinating costs.
 */
export function calculatePGBreakdown(
  listing: Partial<PGListing>,
  studentBudget: number = 15000
): CostBreakdown {
  const sanitize = (val?: number | null): number => {
    if (typeof val !== 'number' || isNaN(val) || !isFinite(val) || val < 0) {
      return 0;
    }
    return Math.round(val);
  };

  const monthlyRent = sanitize(listing.monthlyRent);
  const maintenance = sanitize(listing.maintenanceCharges);
  const waterAndGas = sanitize(listing.waterAndGasCharges);
  const electricity = sanitize(listing.electricityEstimate);
  
  // If food is included in rent, additional food cost is 0. Otherwise use estimate.
  const food = listing.foodIncluded ? 0 : sanitize(listing.foodCostEstimate);
  
  const laundry = sanitize(listing.laundryCharges);
  const wifi = sanitize(listing.wifiCharges);

  const recurringMonthlyTotal = 
    monthlyRent + 
    maintenance + 
    waterAndGas + 
    electricity + 
    food + 
    laundry + 
    wifi;

  const securityDeposit = sanitize(listing.securityDeposit);
  const oneTimeMoveIn = sanitize(listing.oneTimeMoveInFee);
  const brokerage = sanitize(listing.brokerageFee);
  const oneTimeFees = oneTimeMoveIn + brokerage;

  // First month cash required = deposit + 1st month rent + one time move-in/brokerage fees
  const firstMonthCashTotal = securityDeposit + monthlyRent + oneTimeFees;

  const budget = sanitize(studentBudget);
  const monthlySavingsOrDeficit = budget - recurringMonthlyTotal;
  const isWithinBudget = recurringMonthlyTotal <= budget;

  return {
    monthlyRent,
    maintenance: maintenance + waterAndGas,
    electricity,
    food,
    laundry,
    wifi,
    recurringMonthlyTotal,
    securityDeposit,
    firstMonthRent: monthlyRent,
    oneTimeFees,
    firstMonthCashTotal,
    studentMonthlyBudget: budget,
    monthlySavingsOrDeficit,
    isWithinBudget,
  };
}

/**
 * Format currency in Indian Rupees format (₹)
 */
export function formatINR(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return '₹0';
  }
  const isNeg = amount < 0;
  const abs = Math.abs(Math.round(amount));
  return `${isNeg ? '-' : ''}₹${abs.toLocaleString('en-IN')}`;
}

/**
 * Calculate deposit multiplier (e.g. "2x monthly rent")
 */
export function getDepositMultiplier(deposit: number, rent: number): string {
  if (!rent || rent <= 0 || !deposit || deposit <= 0) return '0x';
  const ratio = (deposit / rent).toFixed(1);
  return ratio.endsWith('.0') ? `${Math.round(deposit / rent)}x` : `${ratio}x`;
}
