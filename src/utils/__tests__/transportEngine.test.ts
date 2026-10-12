import { CITY_TRANSPORT_OPTIONS } from '../../constants/transportData';
import { TransportOption, TransportPriority, TimeOfDay } from '../../types/studentCompanion';

function calculateOptionMetrics(
  opt: TransportOption,
  passengers: number,
  timeOfDay: TimeOfDay
) {
  const count = Math.max(1, passengers);
  let perPersonMin = opt.estimatedFareMin;
  let perPersonMax = opt.estimatedFareMax;
  let totalMin = opt.estimatedFareMin;
  let totalMax = opt.estimatedFareMax;

  if (opt.fareType === 'free') {
    perPersonMin = 0;
    perPersonMax = 0;
    totalMin = 0;
    totalMax = 0;
  } else if (opt.fareType === 'per_vehicle') {
    perPersonMin = Math.round(opt.estimatedFareMin / count);
    perPersonMax = Math.round(opt.estimatedFareMax / count);
    totalMin = opt.estimatedFareMin;
    totalMax = opt.estimatedFareMax;
  } else {
    perPersonMin = opt.estimatedFareMin;
    perPersonMax = opt.estimatedFareMax;
    totalMin = opt.estimatedFareMin * count;
    totalMax = opt.estimatedFareMax * count;
  }

  if (timeOfDay === 'late_night' && (opt.mode === 'auto' || opt.mode === 'cab')) {
    perPersonMin = Math.round(perPersonMin * 1.3);
    perPersonMax = Math.round(perPersonMax * 1.3);
    totalMin = Math.round(totalMin * 1.3);
    totalMax = Math.round(totalMax * 1.3);
  }

  let adjustedTime = opt.estimatedTimeMin;
  if (timeOfDay === 'morning_peak' || timeOfDay === 'evening_peak') {
    if (opt.mode === 'metro') {
      // zero delay
    } else if (opt.mode === 'bus' && opt.id.includes('ibus')) {
      adjustedTime += 2;
    } else if (opt.mode === 'walk') {
      // unaffected
    } else {
      adjustedTime += Math.round(opt.estimatedTimeMin * 0.35);
    }
  }

  return { perPersonMin, perPersonMax, totalMin, totalMax, adjustedTime };
}

function selectBestTransportOption(
  options: TransportOption[],
  priority: TransportPriority,
  passengers: number,
  timeOfDay: TimeOfDay
): TransportOption {
  if (priority === 'cheapest') {
    let lowest = Infinity;
    let best = options[0];
    for (const opt of options) {
      if (opt.mode === 'walk' && opt.distanceKm > 1.5) continue;
      const m = calculateOptionMetrics(opt, passengers, timeOfDay);
      if (m.perPersonMin < lowest) {
        lowest = m.perPersonMin;
        best = opt;
      }
    }
    return best;
  }

  if (priority === 'fastest') {
    let lowest = Infinity;
    let best = options[0];
    for (const opt of options) {
      if (opt.mode === 'walk') continue;
      const m = calculateOptionMetrics(opt, passengers, timeOfDay);
      if (m.adjustedTime < lowest) {
        lowest = m.adjustedTime;
        best = opt;
      }
    }
    return best;
  }

  if (priority === 'most_convenient') {
    const highConvenience = options.filter((o) => o.convenienceRating === 'High');
    const pool = highConvenience.length > 0 ? highConvenience : options;
    return (
      pool.find((o) => o.mode === 'cab') ||
      pool.find((o) => o.mode === 'metro') ||
      pool.find((o) => o.mode === 'auto') ||
      pool[0]
    );
  }

  // Balanced
  let bestScore = -Infinity;
  let best = options[0];
  for (const opt of options) {
    if (opt.mode === 'walk' && opt.distanceKm > 1.5) continue;
    const m = calculateOptionMetrics(opt, passengers, timeOfDay);
    const fareScore = Math.max(0, 50 - (m.perPersonMin / 2));
    const timeScore = Math.max(0, 50 - (m.adjustedTime / 1.5));
    const bonus = opt.convenienceRating === 'High' ? 15 : 8;
    const score = fareScore + timeScore + bonus;
    if (score > bestScore) {
      bestScore = score;
      best = opt;
    }
  }
  return best;
}

console.log('--- Testing Transport Guide Fare Split & Recommendation Engine ---');

// 1. Check city options existence
const indoreOptions = CITY_TRANSPORT_OPTIONS['Indore'];
if (!indoreOptions || indoreOptions.length < 3) {
  throw new Error('Indore transport options missing or incomplete');
}

const blrOptions = CITY_TRANSPORT_OPTIONS['Bengaluru'];
if (!blrOptions || blrOptions.length < 4) {
  throw new Error('Bengaluru transport options missing or incomplete');
}

// 2. Test group fare splitting on per_vehicle (auto/cab)
const blrAuto = blrOptions.find((o) => o.mode === 'auto')!;
const soloAuto = calculateOptionMetrics(blrAuto, 1, 'afternoon');
const groupAuto = calculateOptionMetrics(blrAuto, 3, 'afternoon');

if (groupAuto.perPersonMin !== Math.round(soloAuto.totalMin / 3)) {
  throw new Error(`Group fare split failed: expected ${Math.round(soloAuto.totalMin / 3)}, got ${groupAuto.perPersonMin}`);
}

// 3. Test priority switching
const cheapestWinner = selectBestTransportOption(indoreOptions, 'cheapest', 1, 'morning_peak');
console.log('Indore Cheapest Winner:', cheapestWinner.name);
if (cheapestWinner.estimatedFareMin > 10) {
  throw new Error(`Expected low-cost bus or walk for cheapest, got ${cheapestWinner.name}`);
}

const fastestWinner = selectBestTransportOption(indoreOptions, 'fastest', 1, 'morning_peak');
console.log('Indore Fastest Winner:', fastestWinner.name);
if (fastestWinner.mode !== 'metro' && fastestWinner.mode !== 'cab') {
  throw new Error(`Expected metro or rapid cab for fastest, got ${fastestWinner.name}`);
}

const convenientWinner = selectBestTransportOption(indoreOptions, 'most_convenient', 1, 'morning_peak');
console.log('Indore Convenient Winner:', convenientWinner.name);
if (convenientWinner.convenienceRating !== 'High') {
  throw new Error('Expected High convenience rating for convenient winner');
}

console.log('✅ ALL Transport Guide & Recommendation Engine Assertions Passed Successfully!');
