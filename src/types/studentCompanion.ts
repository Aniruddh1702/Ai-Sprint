export type ScamCategory =
  | 'fake_listings'
  | 'deposit_fraud'
  | 'fake_brokers'
  | 'fake_jobs'
  | 'admission_fraud'
  | 'payment_upi'
  | 'transport_fraud'
  | 'other';

export type ScamVerificationStatus =
  | 'verified_incident'
  | 'official_advisory'
  | 'general_warning'
  | 'user_report';

export interface ScamAlert {
  id: string;
  title: string;
  city: string; // e.g. "Bengaluru", "Pune", "Delhi NCR", "Hyderabad", "All Cities"
  category: ScamCategory;
  whatHappens: string;
  warningSigns: string[];
  preventionTips: string[];
  recoverySteps: string[];
  sourceName?: string;
  sourceLink?: string;
  sourceDate?: string;
  verificationStatus: ScamVerificationStatus;
  reportedCount: number;
  isBookmarked?: boolean;
}

export type MealPlanType = 'daily' | 'monthly' | 'trial';
export type MealTimeSlot = 'breakfast' | 'lunch' | 'dinner' | 'full_day';

export interface TiffinService {
  id: string;
  name: string;
  city: string;
  area: string;
  monthlyPrice: number;
  pricePerMeal: number;
  mealSlots: MealTimeSlot[];
  isVeg: boolean;
  hasNonVeg: boolean;
  hasJainOption: boolean;
  cuisineStyle: string; // "North Indian Homestyle", "South Indian", "Maharashtrian", etc.
  deliveryAvailable: boolean;
  pickupAvailable: boolean;
  distanceKm: number;
  trialMealAvailable: boolean;
  trialMealPrice: number;
  subscriptionPolicy: string;
  contactNumber: string;
  rating: number;
  reviewsCount: number;
  freshnessDate: string;
}

export interface RestaurantPlace {
  id: string;
  name: string;
  city: string;
  area: string;
  cuisine: string[];
  foodType: 'pure_veg' | 'non_veg_available' | 'jain_available';
  priceForOne: number;
  distanceKm: number;
  popularItems: { name: string; price: number }[];
  rating: number;
  openingHours: string;
  dineIn: boolean;
  takeaway: boolean;
  delivery: boolean;
  orderUrl?: string;
  contactPhone?: string;
}

export type TransportMode = 'metro' | 'bus' | 'auto' | 'cab' | 'walk' | 'cycle';

export type TransportPriority = 'cheapest' | 'fastest' | 'most_convenient' | 'balanced';
export type TimeOfDay = 'morning_peak' | 'afternoon' | 'evening_peak' | 'late_night';

export interface TransportOption {
  id: string;
  mode: TransportMode;
  name: string; // "Namma Metro (Purple Line)", "BMTC Ordinary Bus", "Shared Auto", etc.
  estimatedFareMin: number;
  estimatedFareMax: number;
  estimatedTimeMin: number;
  distanceKm: number;
  convenienceRating: 'High' | 'Moderate' | 'Low';
  operatingHours: string;
  safetyConsiderations: string[];
  bookingOrRouteLink?: string;
  sourceAuthority: string;
  sourceTimestamp: string;
  fareType?: 'per_person' | 'per_vehicle' | 'free';
  limitations?: string[];
  isFareAvailable?: boolean;
  isTimeAvailable?: boolean;
}

export type StarterKitCategory =
  | 'emergency'
  | 'hospital'
  | 'pharmacy'
  | 'grocery'
  | 'bank_atm'
  | 'connectivity'
  | 'stationery'
  | 'laundry'
  | 'transit';

export interface CityEssentialService {
  id: string;
  category: StarterKitCategory;
  name: string;
  city: string;
  area: string;
  distanceKm: number;
  address: string;
  phone?: string;
  timings: string;
  isVerified: boolean;
  googleMapsQuery?: string;
}

export interface ComprehensiveBudgetBreakdown {
  monthlyRent: number;
  securityDeposit: number; // One-time refundable, not recurring!
  foodMonthly: number;
  transportMonthly: number;
  utilitiesMonthly: number;
  mobileInternetMonthly: number;
  personalMonthly: number;
  otherMonthly: number;
  
  // Deterministic totals
  recurringMonthlyTotal: number;
  firstMonthMoveInTotal: number;
  studentBudget: number;
  monthlyBalance: number;
  isWithinBudget: boolean;
}
