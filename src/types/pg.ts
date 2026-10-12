export type RoomType = 'single' | 'double' | 'triple' | '1rk' | '1bhk' | 'other';

export interface RedFlag {
  id: string;
  title: string;
  severity: 'high' | 'medium' | 'low';
  explanation: string;
  category: 'deposit' | 'lockin' | 'utilities' | 'curfew' | 'agreement' | 'maintenance';
}

export interface PGListing {
  id: string;
  title: string;
  address: string;
  locality?: string;
  city: string;
  roomType: RoomType;
  
  // Cost breakdown
  monthlyRent: number;
  securityDeposit: number;
  depositRefundable: boolean;
  maintenanceCharges: number;
  waterAndGasCharges: number;
  electricityEstimate: number;
  electricityRule: string; // e.g. "₹12/unit submeter", "included", "split equally"
  foodIncluded: boolean;
  foodCostEstimate: number; // if not included or additional meal plan
  laundryCharges: number;
  wifiCharges: number;
  oneTimeMoveInFee: number;
  brokerageFee: number;
  
  // Agreement & Policies
  lockInPeriodMonths: number;
  noticePeriodDays: number;
  curfewTime?: string;
  visitorPolicy?: string;
  
  // Amenities & Tags
  amenities: string[];
  restrictions: string[];
  
  // Analysis intelligence
  missingInformation: string[];
  redFlags: RedFlag[];
  questionsToAskLandlord: string[];
  summary: string;
  overallRating: number; // 1-10
  verifiedFactsCount: number;
  estimatedFactsCount: number;
  
  // Metadata
  sourceType: 'screenshot' | 'text' | 'manual' | 'sample';
  createdAt: string;
  updatedAt: string;
  rawInputSnippet?: string;
  userCustomNotes?: string;
  isUserCorrected?: boolean;
}

export interface CostBreakdown {
  monthlyRent: number;
  maintenance: number;
  electricity: number;
  food: number;
  laundry: number;
  wifi: number;
  recurringMonthlyTotal: number;
  
  // First month cash required
  securityDeposit: number;
  firstMonthRent: number;
  oneTimeFees: number;
  firstMonthCashTotal: number;
  
  // Budget comparison
  studentMonthlyBudget: number;
  monthlySavingsOrDeficit: number;
  isWithinBudget: boolean;
}

export interface StudentProfile {
  name: string;
  city: string;
  collegeOrWorkplace: string;
  monthlyBudget: number;
  targetMoveInDate: string;
  preferredRoomType: RoomType;
  requiresFood: boolean;
  requiresAC: boolean;
}

export interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  category: 'before_visit' | 'during_visit' | 'agreement' | 'move_in';
  completed: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  quickReplies?: string[];
  highlightData?: any;
}

export interface ComparisonInsight {
  winnerId: string;
  winnerReason: string;
  bestValueId: string;
  safestDepositId: string;
  lowestFirstMonthId: string;
  whyThisRecommendation: {
    studentPreferencesUsed: string[];
    factualListingHighlights: string[];
    hiddenCostAlerts: string[];
    unknownFactorsToVerify: string[];
    recommendationSummary: string;
  };
}
