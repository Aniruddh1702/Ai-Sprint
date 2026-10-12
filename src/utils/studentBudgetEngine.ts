import { ComprehensiveBudgetBreakdown } from '@/types/studentCompanion';
import { formatINR } from './costCalculator';

export interface BudgetSimulationInput {
  monthlyRent: number;
  securityDeposit: number; // One-time refundable!
  foodMonthly: number;
  transportMonthly: number;
  utilitiesMonthly: number;
  mobileInternetMonthly: number;
  personalMonthly: number;
  otherMonthly: number;
  oneTimeMoveInFees: number;
  studentMonthlyBudget: number;
  durationMonths?: number;
}

export interface BudgetSimulationResult {
  breakdown: ComprehensiveBudgetBreakdown;
  formulaExplanations: {
    recurringFormula: string;
    firstMonthFormula: string;
    multiMonthEstimate: string;
    depositSafetyNote: string;
  };
  periodTotals: {
    months: number;
    totalRecurringSpent: number;
    totalCashNeededIncludingDeposit: number;
  };
}

export function calculateComprehensiveBudget(
  input: BudgetSimulationInput
): BudgetSimulationResult {
  const sanitize = (val?: number | null): number => {
    if (typeof val !== 'number' || isNaN(val) || !isFinite(val) || val < 0) {
      return 0;
    }
    return Math.round(val);
  };

  const monthlyRent = sanitize(input.monthlyRent);
  const securityDeposit = sanitize(input.securityDeposit);
  const foodMonthly = sanitize(input.foodMonthly);
  const transportMonthly = sanitize(input.transportMonthly);
  const utilitiesMonthly = sanitize(input.utilitiesMonthly);
  const mobileInternetMonthly = sanitize(input.mobileInternetMonthly);
  const personalMonthly = sanitize(input.personalMonthly);
  const otherMonthly = sanitize(input.otherMonthly);
  const oneTimeMoveInFees = sanitize(input.oneTimeMoveInFees);
  const studentBudget = sanitize(input.studentMonthlyBudget);
  const durationMonths = Math.max(1, Math.min(12, sanitize(input.durationMonths) || 1));

  // 1. Expected recurring monthly expense (Deposit is EXCLUDED because it is refundable!)
  const recurringMonthlyTotal =
    monthlyRent +
    foodMonthly +
    transportMonthly +
    utilitiesMonthly +
    mobileInternetMonthly +
    personalMonthly +
    otherMonthly;

  // 2. One-time move-in cash requirement (Deposit + 1st month rent + move-in fees)
  const firstMonthMoveInTotal = securityDeposit + monthlyRent + oneTimeMoveInFees;

  // 3. Monthly savings or deficit
  const monthlyBalance = studentBudget - recurringMonthlyTotal;
  const isWithinBudget = recurringMonthlyTotal <= studentBudget;

  // 4. Multi-month projection
  const totalRecurringSpent = recurringMonthlyTotal * durationMonths;
  const totalCashNeededIncludingDeposit = totalRecurringSpent + securityDeposit + oneTimeMoveInFees;

  const breakdown: ComprehensiveBudgetBreakdown = {
    monthlyRent,
    securityDeposit,
    foodMonthly,
    transportMonthly,
    utilitiesMonthly,
    mobileInternetMonthly,
    personalMonthly,
    otherMonthly,
    recurringMonthlyTotal,
    firstMonthMoveInTotal,
    studentBudget,
    monthlyBalance,
    isWithinBudget,
  };

  const formulaExplanations = {
    recurringFormula: `Monthly Recurring (${formatINR(recurringMonthlyTotal)}) = Rent (${formatINR(monthlyRent)}) + Food (${formatINR(foodMonthly)}) + Transport (${formatINR(transportMonthly)}) + Utilities (${formatINR(utilitiesMonthly)}) + Phone/Wi-Fi (${formatINR(mobileInternetMonthly)}) + Personal (${formatINR(personalMonthly)}) + Other (${formatINR(otherMonthly)})`,
    firstMonthFormula: `Move-in Cash (${formatINR(firstMonthMoveInTotal)}) = Refundable Deposit (${formatINR(securityDeposit)}) + 1st Month Rent (${formatINR(monthlyRent)}) + Agreement/Move-in Fees (${formatINR(oneTimeMoveInFees)})`,
    multiMonthEstimate: `Total for ${durationMonths} Months = (${durationMonths} × ${formatINR(recurringMonthlyTotal)}) + Deposit (${formatINR(securityDeposit)}) = ${formatINR(totalCashNeededIncludingDeposit)}`,
    depositSafetyNote: `Security Deposit (${formatINR(securityDeposit)}) is a refundable capital asset; it is NEVER double-counted as a recurring monthly expense.`,
  };

  return {
    breakdown,
    formulaExplanations,
    periodTotals: {
      months: durationMonths,
      totalRecurringSpent,
      totalCashNeededIncludingDeposit,
    },
  };
}
