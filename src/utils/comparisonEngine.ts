import { PGListing, StudentProfile, ComparisonInsight } from '@/types/pg';
import { calculatePGBreakdown, formatINR } from './costCalculator';

export function compareListings(
  listings: PGListing[],
  studentProfile: StudentProfile
): ComparisonInsight {
  if (!listings || listings.length === 0) {
    return {
      winnerId: '',
      winnerReason: 'No listings selected for comparison.',
      bestValueId: '',
      safestDepositId: '',
      lowestFirstMonthId: '',
      whyThisRecommendation: {
        studentPreferencesUsed: [],
        factualListingHighlights: [],
        hiddenCostAlerts: [],
        unknownFactorsToVerify: [],
        recommendationSummary: 'Add at least 2 listings to generate an intelligent comparison.',
      },
    };
  }

  // Calculate scores and breakdowns for all
  const analyzed = listings.map((pg) => {
    const cost = calculatePGBreakdown(pg, studentProfile.monthlyBudget);
    
    // Scoring system:
    // + Budget fit (up to 40 pts)
    // + Facilities & food alignment (up to 25 pts)
    // + Deposit safety & transparency (up to 20 pts)
    // - High red flags penalty (-15 pts each)
    let score = 50;

    // Budget fit
    if (cost.isWithinBudget) {
      score += 25;
      const margin = (studentProfile.monthlyBudget - cost.recurringMonthlyTotal) / studentProfile.monthlyBudget;
      if (margin > 0.1) score += 10;
    } else {
      const deficit = (cost.recurringMonthlyTotal - studentProfile.monthlyBudget) / studentProfile.monthlyBudget;
      score -= Math.min(35, Math.round(deficit * 50));
    }

    // Food preference alignment
    if (studentProfile.requiresFood) {
      if (pg.foodIncluded) score += 15;
      else score -= 10;
    }

    // AC preference
    const hasAC = pg.amenities.some((a) => a.toLowerCase().includes('ac'));
    if (studentProfile.requiresAC) {
      if (hasAC) score += 10;
      else score -= 10;
    }

    // Red flag deductions
    const highFlags = pg.redFlags.filter((f) => f.severity === 'high').length;
    const medFlags = pg.redFlags.filter((f) => f.severity === 'medium').length;
    score -= highFlags * 18;
    score -= medFlags * 8;

    // Deposit safety
    if (pg.depositRefundable) {
      const depositRatio = pg.monthlyRent > 0 ? pg.securityDeposit / pg.monthlyRent : 2;
      if (depositRatio <= 2) score += 10;
      else if (depositRatio > 4) score -= 10;
    } else {
      score -= 25; // Non-refundable deposit is a massive red flag!
    }

    return {
      pg,
      cost,
      score,
      highFlags,
    };
  });

  // Sort descending by score
  const sorted = [...analyzed].sort((a, b) => b.score - a.score);
  const winner = sorted[0];

  // Best value: highest amenities per recurring rupee
  const bestValue = [...analyzed].sort((a, b) => {
    const ratioA = a.pg.amenities.length / (a.cost.recurringMonthlyTotal || 1);
    const ratioB = b.pg.amenities.length / (b.cost.recurringMonthlyTotal || 1);
    return ratioB - ratioA;
  })[0];

  // Safest deposit: lowest multiplier + refundable + transparent
  const safestDeposit = [...analyzed].sort((a, b) => {
    const ratioA = a.pg.depositRefundable ? a.pg.securityDeposit / (a.pg.monthlyRent || 1) : 99;
    const ratioB = b.pg.depositRefundable ? b.pg.securityDeposit / (b.pg.monthlyRent || 1) : 99;
    return ratioA - ratioB;
  })[0];

  // Lowest first month cash
  const lowestFirstMonth = [...analyzed].sort((a, b) => {
    return a.cost.firstMonthCashTotal - b.cost.firstMonthCashTotal;
  })[0];

  // Build the "Why this recommendation?" explanation
  const preferencesUsed: string[] = [
    `Student Monthly Budget: ${formatINR(studentProfile.monthlyBudget)}`,
    studentProfile.requiresFood ? 'Food inclusion strongly preferred' : 'Flexible with external meals',
    studentProfile.requiresAC ? 'Air-conditioning requested' : 'Standard room ventilation sufficient',
    `Target Room Type: ${studentProfile.preferredRoomType.toUpperCase()}`,
  ];

  const factualHighlights: string[] = [
    `${winner.pg.title}: Recurring cost is ${formatINR(winner.cost.recurringMonthlyTotal)}/mo (${winner.cost.isWithinBudget ? 'within' : 'exceeds'} budget by ${formatINR(Math.abs(winner.cost.monthlySavingsOrDeficit))}).`,
    `First month upfront cash requirement is ${formatINR(winner.cost.firstMonthCashTotal)} (Deposit: ${formatINR(winner.pg.securityDeposit)}).`,
    `Included amenities: ${winner.pg.amenities.slice(0, 4).join(', ')}.`,
  ];

  const hiddenCostAlerts: string[] = [];
  analyzed.forEach((item) => {
    item.pg.redFlags.forEach((rf) => {
      if (rf.severity === 'high') {
        hiddenCostAlerts.push(`⚠️ ${item.pg.title}: ${rf.title} - ${rf.explanation}`);
      }
    });
  });

  const unknownFactors: string[] = [];
  analyzed.forEach((item) => {
    item.pg.missingInformation.forEach((mi) => {
      unknownFactors.push(`❓ ${item.pg.title}: ${mi}`);
    });
  });

  const winnerReason = winner.cost.isWithinBudget
    ? `Recommended because its recurring monthly cost (${formatINR(winner.cost.recurringMonthlyTotal)}) safely fits your ${formatINR(studentProfile.monthlyBudget)} budget, has ${winner.highFlags === 0 ? 'zero critical red flags' : 'fewer risks'}, and matches your room and food priorities.`
    : `Selected as the closest balanced option, but exceeds your target monthly budget by ${formatINR(Math.abs(winner.cost.monthlySavingsOrDeficit))}. Consider negotiating deposit or utility tiers.`;

  return {
    winnerId: winner.pg.id,
    winnerReason,
    bestValueId: bestValue.pg.id,
    safestDepositId: safestDeposit.pg.id,
    lowestFirstMonthId: lowestFirstMonth.pg.id,
    whyThisRecommendation: {
      studentPreferencesUsed: preferencesUsed,
      factualListingHighlights: factualHighlights,
      hiddenCostAlerts: hiddenCostAlerts.length > 0 ? hiddenCostAlerts : ['No severe hidden cost traps found across these listings.'],
      unknownFactorsToVerify: unknownFactors.length > 0 ? unknownFactors : ['All major utility and policy details were specified in listing.'],
      recommendationSummary: winnerReason,
    },
  };
}
