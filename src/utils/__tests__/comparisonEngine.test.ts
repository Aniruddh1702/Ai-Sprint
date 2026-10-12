import { compareListings } from '../comparisonEngine';
import { SAMPLE_PG_LISTINGS, DEFAULT_STUDENT_PROFILE } from '@/constants/sampleListings';

console.log('--- Testing PG Comparison & "Why This Recommendation" Engine ---');

const result = compareListings(SAMPLE_PG_LISTINGS, DEFAULT_STUDENT_PROFILE);

console.log('Winner ID:', result.winnerId);
console.log('Winner Reason:', result.winnerReason);
console.log('Hidden Cost Alerts count:', result.whyThisRecommendation.hiddenCostAlerts.length);

if (!result.winnerId) throw new Error('Winner ID should not be empty');
if (result.whyThisRecommendation.studentPreferencesUsed.length === 0) throw new Error('Preferences used should be listed');
if (result.whyThisRecommendation.factualListingHighlights.length === 0) throw new Error('Factual highlights should be populated');

console.log('✅ Comparison & Explainability Engine Passed All Tests!');
