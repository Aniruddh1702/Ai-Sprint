import React, { useState, useEffect, useMemo } from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  Pressable,
  Linking,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useApp } from '@/context/AppContext';
import { ClayColors, ClayRadii, ClayShadows } from '@/constants/clayTheme';
import { ClayCard } from '@/components/clay/ClayCard';
import { ClayBadge } from '@/components/clay/ClayBadge';
import { ClayInput } from '@/components/clay/ClayInput';
import { ClayButton } from '@/components/clay/ClayButton';
import { ClayBuddyAvatar } from '@/components/clay/ClayBuddyAvatar';
import { CITY_TRANSPORT_OPTIONS } from '@/constants/transportData';
import {
  TransportOption,
  TransportPriority,
  TimeOfDay,
  TransportMode,
} from '@/types/studentCompanion';
import { formatINR } from '@/utils/costCalculator';
import { Ionicons } from '@expo/vector-icons';

interface RecommendationResult {
  winner: TransportOption;
  reason: string;
  perPersonFareMin: number;
  perPersonFareMax: number;
  totalFareMin: number;
  totalFareMax: number;
  adjustedTimeMin: number;
  trafficNote: string;
}

export default function TransportGuideScreen() {
  const router = useRouter();
  const {
    profile,
    activeListing,
    activeTransportMode,
    setActiveTransportMode,
  } = useApp();

  // Student Journey State
  const [selectedCity, setSelectedCity] = useState<string>(profile.city || 'Indore');
  const [startLocation, setStartLocation] = useState<string>(
    activeListing ? `${activeListing.title}, ${activeListing.address}` : 'Current PG Accommodation'
  );
  const [destination, setDestination] = useState<string>(
    profile.collegeOrWorkplace || 'College / Workplace'
  );
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('morning_peak');
  const [priority, setPriority] = useState<TransportPriority>('balanced');
  const [passengers, setPassengers] = useState<number>(1);
  const [selectedModeFilter, setSelectedModeFilter] = useState<string>('all');
  const [compareModeIds, setCompareModeIds] = useState<string[]>([]);
  const [isSavedFeedback, setIsSavedFeedback] = useState<boolean>(false);

  // Sync selectedCity when profile.city changes
  useEffect(() => {
    if (profile.city) {
      setSelectedCity(profile.city);
    }
  }, [profile.city]);

  // Sync start location when activeListing changes
  useEffect(() => {
    if (activeListing) {
      setStartLocation(`${activeListing.title}, ${activeListing.address}`);
    }
  }, [activeListing]);

  // Sync destination if profile updates
  useEffect(() => {
    if (profile.collegeOrWorkplace) {
      setDestination(profile.collegeOrWorkplace);
    }
  }, [profile.collegeOrWorkplace]);

  // Lookup available transport options for the city
  const availableOptions: TransportOption[] = useMemo(() => {
    const list =
      CITY_TRANSPORT_OPTIONS[selectedCity] ||
      Object.entries(CITY_TRANSPORT_OPTIONS).find(
        ([k]) => k.toLowerCase() === selectedCity.toLowerCase()
      )?.[1] ||
      CITY_TRANSPORT_OPTIONS['Indore'] ||
      CITY_TRANSPORT_OPTIONS['Bengaluru'] ||
      [];
    return list;
  }, [selectedCity]);

  // Calculate adjusted travel times and fares
  const getCalculatedMetrics = (opt: TransportOption) => {
    const count = Math.max(1, passengers);
    let perPersonMin = opt.estimatedFareMin;
    let perPersonMax = opt.estimatedFareMax;
    let totalMin = opt.estimatedFareMin;
    let totalMax = opt.estimatedFareMax;

    // Fare calculation by fareType
    if (opt.fareType === 'free') {
      perPersonMin = 0;
      perPersonMax = 0;
      totalMin = 0;
      totalMax = 0;
    } else if (opt.fareType === 'per_vehicle') {
      // Vehicle cost shared by passengers
      perPersonMin = Math.round(opt.estimatedFareMin / count);
      perPersonMax = Math.round(opt.estimatedFareMax / count);
      totalMin = opt.estimatedFareMin;
      totalMax = opt.estimatedFareMax;
    } else {
      // Per person (bus, metro, shared auto, cycle)
      perPersonMin = opt.estimatedFareMin;
      perPersonMax = opt.estimatedFareMax;
      totalMin = opt.estimatedFareMin * count;
      totalMax = opt.estimatedFareMax * count;
    }

    // Late night surcharge for cab/auto
    if (timeOfDay === 'late_night' && (opt.mode === 'auto' || opt.mode === 'cab')) {
      perPersonMin = Math.round(perPersonMin * 1.3);
      perPersonMax = Math.round(perPersonMax * 1.3);
      totalMin = Math.round(totalMin * 1.3);
      totalMax = Math.round(totalMax * 1.3);
    }

    // Traffic congestion delay
    let adjustedTime = opt.estimatedTimeMin;
    let trafficNote = 'Normal traffic';
    if (timeOfDay === 'morning_peak' || timeOfDay === 'evening_peak') {
      if (opt.mode === 'metro') {
        trafficNote = 'Zero road traffic (Dedicated metro track)';
      } else if (opt.mode === 'bus' && opt.id.includes('ibus')) {
        trafficNote = 'Dedicated BRTS bus corridor (Minimal delay)';
        adjustedTime += 2;
      } else if (opt.mode === 'walk') {
        trafficNote = 'Pedestrian pace unaffected by vehicle jams';
      } else {
        const delay = Math.round(opt.estimatedTimeMin * 0.35);
        adjustedTime += delay;
        trafficNote = `+${delay} mins peak road delay`;
      }
    } else if (timeOfDay === 'late_night') {
      trafficNote = 'Open roads with fast travel time';
    }

    return {
      perPersonMin,
      perPersonMax,
      totalMin,
      totalMax,
      adjustedTime,
      trafficNote,
    };
  };

  // Recommendation Engine: Evaluates the best option based on user priority
  const recommendation: RecommendationResult | null = useMemo(() => {
    if (availableOptions.length === 0) return null;

    let candidate = availableOptions[0];
    let candidateMetrics = getCalculatedMetrics(candidate);
    let reasonText = '';

    if (priority === 'cheapest') {
      // Find lowest per-person cost (prefer public transit over walking if distance > 1.5km)
      let lowestCost = Infinity;
      for (const opt of availableOptions) {
        // Skip walk if destination sounds distant or distance > 1.5km unless it's only option
        if (opt.mode === 'walk' && opt.distanceKm > 1.5) continue;
        const metrics = getCalculatedMetrics(opt);
        if (metrics.perPersonMin < lowestCost) {
          lowestCost = metrics.perPersonMin;
          candidate = opt;
          candidateMetrics = metrics;
        }
      }

      if (candidate.fareType === 'free') {
        reasonText = `Selected as Cheapest: ₹0 free pedestrian route for short distance (${candidate.distanceKm} km). Great for saving money on everyday short trips.`;
      } else {
        reasonText = `Selected as Cheapest: At only ₹${candidateMetrics.perPersonMin}–₹${candidateMetrics.perPersonMax}/person (Total ₹${candidateMetrics.totalMin} for ${passengers} passenger${passengers > 1 ? 's' : ''}), this saves up to 75% compared to hailing a private cab or auto.`;
      }
    } else if (priority === 'fastest') {
      // Find lowest adjusted travel time
      let lowestTime = Infinity;
      for (const opt of availableOptions) {
        if (opt.mode === 'walk') continue; // Walk is rarely fastest
        const metrics = getCalculatedMetrics(opt);
        if (metrics.adjustedTime < lowestTime) {
          lowestTime = metrics.adjustedTime;
          candidate = opt;
          candidateMetrics = metrics;
        }
      }

      const trafficAdvantage =
        candidate.mode === 'metro'
          ? 'unaffected by peak road jams on dedicated elevated rail'
          : 'quickest direct door-to-door transit route';
      reasonText = `Selected as Fastest: Takes ~${candidateMetrics.adjustedTime} mins to reach ${destination || 'your destination'}, ${trafficAdvantage}.`;
    } else if (priority === 'most_convenient') {
      // Prioritize High convenience and point-to-point comfort
      const convenientOptions = availableOptions.filter((o) => o.convenienceRating === 'High');
      const pool = convenientOptions.length > 0 ? convenientOptions : availableOptions;

      // Prefer auto or cab or metro over ordinary bus
      candidate =
        pool.find((o) => o.mode === 'cab') ||
        pool.find((o) => o.mode === 'metro') ||
        pool.find((o) => o.mode === 'auto') ||
        pool[0];
      candidateMetrics = getCalculatedMetrics(candidate);

      reasonText = `Selected as Most Convenient: Rated ${candidate.convenienceRating} convenience with comfortable seating, shelter from rain/heat, and reliable operating schedules.`;
    } else {
      // 'balanced': Balances affordable student budget and sensible commute time
      let bestScore = -Infinity;
      for (const opt of availableOptions) {
        if (opt.mode === 'walk' && opt.distanceKm > 1.5) continue;
        const metrics = getCalculatedMetrics(opt);

        // Lower fare is better (max score 50), lower time is better (max score 50)
        const fareScore = Math.max(0, 50 - (metrics.perPersonMin / 2));
        const timeScore = Math.max(0, 50 - (metrics.adjustedTime / 1.5));
        const convenienceBonus = opt.convenienceRating === 'High' ? 15 : opt.convenienceRating === 'Moderate' ? 8 : 0;
        const totalScore = fareScore + timeScore + convenienceBonus;

        if (totalScore > bestScore) {
          bestScore = totalScore;
          candidate = opt;
          candidateMetrics = metrics;
        }
      }

      reasonText = `Selected as Balanced: The optimal sweet spot between student budget (₹${candidateMetrics.perPersonMin}/person) and fast commute time (~${candidateMetrics.adjustedTime} mins) without heavy surge or extreme traffic delays.`;
    }

    return {
      winner: candidate,
      reason: reasonText,
      perPersonFareMin: candidateMetrics.perPersonMin,
      perPersonFareMax: candidateMetrics.perPersonMax,
      totalFareMin: candidateMetrics.totalMin,
      totalFareMax: candidateMetrics.totalMax,
      adjustedTimeMin: candidateMetrics.adjustedTime,
      trafficNote: candidateMetrics.trafficNote,
    };
  }, [availableOptions, priority, passengers, timeOfDay, destination]);

  const filteredOptions = availableOptions.filter((opt) => {
    if (selectedModeFilter === 'all') return true;
    return opt.mode === selectedModeFilter;
  });

  const toggleCompare = (id: string) => {
    setCompareModeIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const getModeIcon = (mode: TransportMode) => {
    switch (mode) {
      case 'metro':
        return 'train';
      case 'bus':
        return 'bus';
      case 'auto':
        return 'car-sport';
      case 'cab':
        return 'car';
      case 'walk':
        return 'walk';
      case 'cycle':
        return 'bicycle';
      default:
        return 'navigate';
    }
  };

  const handleSetPrimary = (opt: TransportOption) => {
    setActiveTransportMode(opt);
    setIsSavedFeedback(true);
    setTimeout(() => setIsSavedFeedback(false), 3500);
  };

  const hasMissingJourney = !startLocation.trim() || !destination.trim();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Top Banner */}
      <ClayCard variant="blue" padding={18} radius={ClayRadii.xl} style={styles.headerCard}>
        <View style={styles.headerRow}>
          <View style={{ flex: 1, paddingRight: 8 }}>
            <View style={styles.headerPill}>
              <Text style={styles.headerPillText}>🚇 Real Student Commute Guide</Text>
            </View>
            <Text style={styles.headerTitle}>Transport Guide</Text>
            <Text style={styles.headerSubtitle}>
              Compare Metro, city buses, autos, cabs & shared rides. Get intelligent recommendations tailored to your journey.
            </Text>
          </View>
          <ClayBuddyAvatar mood="detective" size={62} speechText="Save daily transit cash!" />
        </View>

        {isSavedFeedback && (
          <View style={styles.feedbackBanner}>
            <Ionicons name="checkmark-circle" size={16} color="#15803D" />
            <Text style={styles.feedbackText}>
              ✓ Selected as your Primary Commute Mode! Synced with your monthly budget in My Plan.
            </Text>
          </View>
        )}
      </ClayCard>

      {/* SECTION 2: Student Journey Input Form */}
      <ClayCard variant="default" padding={16} radius={ClayRadii.lg} style={styles.formCard}>
        <View style={styles.formCardHeader}>
          <Ionicons name="map" size={18} color={ClayColors.buddyPurple} />
          <Text style={styles.formCardTitle}>Plan Your Daily Journey</Text>
        </View>

        {/* City Switcher */}
        <Text style={styles.inputLabel}>Select City</Text>
        <View style={styles.cityPillsRow}>
          {Array.from(new Set(['Indore', profile.city || 'Indore', 'Bengaluru', 'Pune', 'Delhi NCR'])).map((city) => (
            <Pressable
              key={city}
              onPress={() => setSelectedCity(city)}
              style={[
                styles.cityPill,
                selectedCity.toLowerCase() === city.toLowerCase() && styles.cityPillActive,
              ]}
            >
              <Text
                style={[
                  styles.cityPillText,
                  selectedCity.toLowerCase() === city.toLowerCase() && styles.cityPillTextActive,
                ]}
              >
                📍 {city}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Starting Point */}
        <ClayInput
          label="Starting Point (PG or Residence)"
          placeholder="e.g. Shree Ram Residency, Bhawarkua or Koramangala 4th Block"
          value={startLocation}
          onChangeText={setStartLocation}
          iconLeft={<Ionicons name="location-sharp" size={18} color={ClayColors.blueDark} />}
          containerStyle={{ marginVertical: 4 }}
        />

        {/* Destination */}
        <ClayInput
          label="Destination (College, Tech Park or Coaching Hub)"
          placeholder="e.g. DAVV Campus, Christ University, Infosys Gate 1"
          value={destination}
          onChangeText={setDestination}
          iconLeft={<Ionicons name="flag-sharp" size={18} color={ClayColors.buddyPurple} />}
          containerStyle={{ marginVertical: 4 }}
        />

        {/* Validation Warning if inputs are missing */}
        {hasMissingJourney && (
          <View style={styles.validationBox}>
            <Ionicons name="warning-outline" size={15} color="#B91C1C" />
            <Text style={styles.validationText}>
              Please enter your starting location and destination to compute accurate routes.
            </Text>
          </View>
        )}

        {/* Time of Day */}
        <Text style={styles.inputLabel}>Time of Day (Traffic & Night Fare Impact)</Text>
        <View style={styles.optionsRowWrap}>
          {[
            { id: 'morning_peak' as TimeOfDay, label: '🌅 Morning Peak (8–10 AM)' },
            { id: 'afternoon' as TimeOfDay, label: '☀️ Afternoon (11 AM–4 PM)' },
            { id: 'evening_peak' as TimeOfDay, label: '🌆 Evening Peak (5–8 PM)' },
            { id: 'late_night' as TimeOfDay, label: '🌙 Late Night (9 PM–5 AM)' },
          ].map((item) => (
            <Pressable
              key={item.id}
              onPress={() => setTimeOfDay(item.id)}
              style={[
                styles.filterChoicePill,
                timeOfDay === item.id && styles.filterChoicePillActive,
              ]}
            >
              <Text
                style={[
                  styles.filterChoiceText,
                  timeOfDay === item.id && styles.filterChoiceTextActive,
                ]}
              >
                {item.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Commute Priority */}
        <Text style={styles.inputLabel}>Student Priority (Recalculates Winner)</Text>
        <View style={styles.optionsRowWrap}>
          {[
            { id: 'balanced' as TransportPriority, label: '⚖️ Balanced (Recommended)', color: ClayColors.buddyPurple },
            { id: 'cheapest' as TransportPriority, label: '💰 Cheapest', color: '#15803D' },
            { id: 'fastest' as TransportPriority, label: '⚡ Fastest', color: '#0284C7' },
            { id: 'most_convenient' as TransportPriority, label: '✨ Most Convenient', color: '#B45309' },
          ].map((item) => (
            <Pressable
              key={item.id}
              onPress={() => setPriority(item.id)}
              style={[
                styles.priorityPill,
                priority === item.id && styles.priorityPillActive,
              ]}
            >
              <Text
                style={[
                  styles.priorityText,
                  priority === item.id && styles.priorityTextActive,
                ]}
              >
                {item.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Number of Passengers (Fare Splitter) */}
        <View style={styles.passengersRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.passengersTitle}>Group Size (Splits Auto & Cab Fares):</Text>
            <Text style={styles.passengersSub}>
              {passengers === 1 ? 'Solo student commute' : `Splitting among ${passengers} students`}
            </Text>
          </View>
          <View style={styles.stepperPills}>
            {[1, 2, 3, 4].map((num) => (
              <Pressable
                key={num}
                onPress={() => setPassengers(num)}
                style={[
                  styles.passengerBtn,
                  passengers === num && styles.passengerBtnActive,
                ]}
              >
                <Text
                  style={[
                    styles.passengerBtnText,
                    passengers === num && styles.passengerBtnTextActive,
                  ]}
                >
                  {num} {num === 1 ? '👤' : '👥'}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      </ClayCard>

      {/* SECTION 4: RECOMMENDATION CARD "Best for You" */}
      {recommendation && (
        <ClayCard variant="lavender" padding={18} radius={ClayRadii.xl} style={styles.recommendationCard}>
          <View style={styles.recommendHeaderRow}>
            <View style={styles.recommendBadge}>
              <Text style={styles.recommendBadgeText}>★ BEST FOR YOU</Text>
            </View>
            <View style={styles.priorityActiveTag}>
              <Text style={styles.priorityActiveTagText}>
                Priority: {priority.replace('_', ' ').toUpperCase()}
              </Text>
            </View>
          </View>

          <View style={styles.winnerMainRow}>
            <View style={styles.winnerIconBlob}>
              <Ionicons
                name={getModeIcon(recommendation.winner.mode) as any}
                size={26}
                color={ClayColors.buddyPurple}
              />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.winnerTitle}>{recommendation.winner.name}</Text>
              <Text style={styles.winnerHours}>🕒 {recommendation.winner.operatingHours}</Text>
            </View>
          </View>

          {/* Reasoning Explanation Box */}
          <View style={styles.reasonBox}>
            <View style={styles.reasonHeaderRow}>
              <Ionicons name="sparkles" size={14} color={ClayColors.buddyPurple} />
              <Text style={styles.reasonHeading}>Why This Was Selected:</Text>
            </View>
            <Text style={styles.reasonExplanation}>{recommendation.reason}</Text>
          </View>

          {/* Key Metric Blocks */}
          <View style={styles.winnerMetricsRow}>
            <View style={styles.winnerMetricBox}>
              <Text style={styles.winnerMetricLabel}>
                {passengers > 1 ? 'Per Student' : 'Estimated Fare'}
              </Text>
              <Text style={styles.winnerMetricValue}>
                {recommendation.winner.fareType === 'free'
                  ? '₹0 Free'
                  : `₹${recommendation.perPersonFareMin}–₹${recommendation.perPersonFareMax}`}
              </Text>
            </View>
            <View style={styles.metricDivider} />
            <View style={styles.winnerMetricBox}>
              <Text style={styles.winnerMetricLabel}>Est. Duration</Text>
              <Text style={styles.winnerMetricValue}>~{recommendation.adjustedTimeMin} mins</Text>
            </View>
            <View style={styles.metricDivider} />
            <View style={styles.winnerMetricBox}>
              <Text style={styles.winnerMetricLabel}>Traffic State</Text>
              <Text style={[styles.winnerMetricValue, { fontSize: 11, color: '#15803D' }]}>
                {recommendation.trafficNote.includes('Zero') ? '⚡ Traffic-Free' : '🚗 Normal Flow'}
              </Text>
            </View>
          </View>

          {/* Action Button: Set as Primary Commute Mode */}
          <View style={{ marginTop: 14 }}>
            <ClayButton
              title={
                activeTransportMode?.id === recommendation.winner.id
                  ? '✓ Active Primary Commute in Budget'
                  : 'Set as My Primary Budget Commute'
              }
              variant={activeTransportMode?.id === recommendation.winner.id ? 'mint' : 'primary'}
              size="md"
              fullWidth
              onPress={() => handleSetPrimary(recommendation.winner)}
              icon={<Ionicons name="wallet-outline" size={18} color="#FFFFFF" />}
            />
          </View>
        </ClayCard>
      )}

      {/* Side-by-Side Comparison Box if 2 modes selected */}
      {compareModeIds.length >= 2 && (
        <ClayCard variant="peach" padding={14} radius={ClayRadii.lg} style={styles.compareNoticeCard}>
          <Text style={styles.compareNoticeTitle}>
            Comparing {compareModeIds.length} Selected Transport Modes Side-by-Side:
          </Text>
          <View style={styles.compareRow}>
            {availableOptions
              .filter((opt) => compareModeIds.includes(opt.id))
              .map((opt) => {
                const metrics = getCalculatedMetrics(opt);
                return (
                  <View key={opt.id} style={styles.compareBlock}>
                    <Text style={styles.compareBlockName} numberOfLines={1}>
                      {opt.name.split('(')[0]}
                    </Text>
                    <Text style={styles.compareBlockFare}>
                      {opt.fareType === 'free' ? '₹0 Free' : `₹${metrics.perPersonMin}–₹${metrics.perPersonMax}`}
                    </Text>
                    <Text style={styles.compareBlockTime}>⏱️ ~{metrics.adjustedTime} mins</Text>
                  </View>
                );
              })}
          </View>
        </ClayCard>
      )}

      {/* SECTION 3: Compare Transport Options List */}
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>All Transit Options in {selectedCity}</Text>
        <Text style={styles.sectionSub}>Official fares, safety notes & restrictions</Text>
      </View>

      {/* Mode Filter Pills */}
      <View style={styles.modeFilterRow}>
        {[
          { id: 'all', label: 'All Modes' },
          { id: 'metro', label: 'Metro' },
          { id: 'bus', label: 'Bus' },
          { id: 'auto', label: 'Auto' },
          { id: 'cab', label: 'Cab' },
          { id: 'cycle', label: 'Cycle' },
          { id: 'walk', label: 'Walk' },
        ].map((mode) => (
          <Pressable
            key={mode.id}
            onPress={() => setSelectedModeFilter(mode.id)}
            style={[styles.modePill, selectedModeFilter === mode.id && styles.modePillActive]}
          >
            <Text style={[styles.modePillText, selectedModeFilter === mode.id && styles.modePillTextActive]}>
              {mode.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {filteredOptions.length === 0 ? (
        <ClayCard variant="lavender" padding={18} radius={ClayRadii.lg} style={{ alignItems: 'center' }}>
          <Text style={{ fontSize: 13, color: ClayColors.textMuted, fontWeight: '700' }}>
            No transit options found for category "{selectedModeFilter}" in {selectedCity}.
          </Text>
        </ClayCard>
      ) : (
        filteredOptions.map((opt) => {
          const isSelectedInBudget = activeTransportMode?.id === opt.id;
          const isCompared = compareModeIds.includes(opt.id);
          const isWinner = recommendation?.winner.id === opt.id;
          const metrics = getCalculatedMetrics(opt);

          return (
            <ClayCard
              key={opt.id}
              variant={isWinner ? 'lavender' : isSelectedInBudget ? 'mint' : 'default'}
              padding={16}
              radius={ClayRadii.lg}
              style={styles.optionCard}
            >
              <View style={styles.optionTopRow}>
                <View style={styles.modeIconBlob}>
                  <Ionicons name={getModeIcon(opt.mode) as any} size={22} color={ClayColors.buddyPurple} />
                </View>

                <View style={{ flex: 1, marginLeft: 10 }}>
                  <View style={styles.badgeRow}>
                    <ClayBadge label={opt.mode.toUpperCase()} type="fact" />
                    <ClayBadge
                      label={`${opt.convenienceRating} Convenience`}
                      type={opt.convenienceRating === 'High' ? 'verified' : 'neutral'}
                    />
                    {isWinner && <ClayBadge label="★ Recommended" type="verified" />}
                  </View>
                  <Text style={styles.optionName}>{opt.name}</Text>
                  <Text style={styles.operatingHoursText}>🕒 {opt.operatingHours}</Text>
                </View>

                <View style={styles.fareContainer}>
                  <Text style={styles.fareNumber}>
                    {opt.isFareAvailable === false
                      ? 'Fare unavailable'
                      : opt.fareType === 'free'
                      ? '₹0 (Free)'
                      : `₹${metrics.perPersonMin} – ₹${metrics.perPersonMax}`}
                  </Text>
                  <Text style={styles.perPersonSub}>
                    {passengers > 1 && opt.fareType === 'per_vehicle'
                      ? `(₹${metrics.totalMin}–₹${metrics.totalMax} total)`
                      : 'per person'}
                  </Text>
                  <Text style={styles.timeTag}>
                    {opt.isTimeAvailable === false ? 'Estimate unavailable' : `~${metrics.adjustedTime} mins`}
                  </Text>
                </View>
              </View>

              {/* Traffic / Delay Note */}
              <View style={styles.trafficNoteRow}>
                <Ionicons name="time-outline" size={12} color={ClayColors.textMuted} />
                <Text style={styles.trafficNoteText}>{metrics.trafficNote}</Text>
              </View>

              {/* Limitations / Caveats */}
              {opt.limitations && opt.limitations.length > 0 && (
                <View style={styles.limitationsBox}>
                  <Text style={styles.limitationsHeading}>⚠️ Notice & Limitations:</Text>
                  {opt.limitations.map((lim, idx) => (
                    <Text key={idx} style={styles.limitationItem}>
                      • {lim}
                    </Text>
                  ))}
                </View>
              )}

              {/* Safety & Commute Tips */}
              <View style={styles.safetyBox}>
                <Text style={styles.safetyHeading}>🛡️ Safety & Commute Tips:</Text>
                {opt.safetyConsiderations.map((tip, idx) => (
                  <View key={idx} style={styles.tipRow}>
                    <Ionicons name="checkmark-circle-outline" size={13} color="#15803D" style={{ marginTop: 2 }} />
                    <Text style={styles.tipText}>{tip}</Text>
                  </View>
                ))}
              </View>

              {/* Action Bar */}
              <View style={styles.cardActionsRow}>
                <Pressable
                  onPress={() => handleSetPrimary(opt)}
                  style={[styles.budgetSelectBtn, isSelectedInBudget && styles.budgetSelectBtnActive]}
                >
                  <Ionicons
                    name={isSelectedInBudget ? 'checkmark-circle' : 'add-circle-outline'}
                    size={16}
                    color={isSelectedInBudget ? '#15803D' : ClayColors.buddyPurple}
                  />
                  <Text style={[styles.budgetSelectText, isSelectedInBudget && { color: '#15803D' }]}>
                    {isSelectedInBudget ? 'Primary in Budget' : 'Set as Primary Commute'}
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => toggleCompare(opt.id)}
                  style={[styles.compareToggleBtn, isCompared && styles.compareToggleBtnActive]}
                >
                  <Text style={[styles.compareToggleText, isCompared && { color: ClayColors.buddyPurple }]}>
                    {isCompared ? '✓ Selected' : '+ Compare'}
                  </Text>
                </Pressable>
              </View>

              {/* Source & Booking Link */}
              <View style={styles.sourceFooterRow}>
                <Text style={styles.sourceAuthorityText}>
                  Source: {opt.sourceAuthority} • {opt.sourceTimestamp}
                </Text>
                {opt.bookingOrRouteLink && (
                  <Pressable onPress={() => Linking.openURL(opt.bookingOrRouteLink!)}>
                    <Text style={styles.bookingLinkText}>Official Timetable →</Text>
                  </Pressable>
                )}
              </View>
            </ClayCard>
          );
        })
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    maxWidth: 720,
    alignSelf: 'center',
    width: '100%',
  },
  headerCard: {
    marginBottom: 14,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerPill: {
    backgroundColor: '#E0F2FE',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: ClayRadii.pill,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  headerPillText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0369A1',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: ClayColors.textPrimary,
  },
  headerSubtitle: {
    fontSize: 12,
    color: ClayColors.textSecondary,
    lineHeight: 17,
    marginTop: 4,
  },
  feedbackBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    padding: 8,
    borderRadius: ClayRadii.sm,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#86EFAC',
  },
  feedbackText: {
    fontSize: 11,
    color: '#15803D',
    fontWeight: '700',
    marginLeft: 6,
    flex: 1,
  },
  formCard: {
    marginBottom: 14,
  },
  formCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  formCardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: ClayColors.textPrimary,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: ClayColors.textSecondary,
    marginTop: 8,
    marginBottom: 4,
  },
  cityPillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  cityPill: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: ClayRadii.pill,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  cityPillActive: {
    backgroundColor: '#EEF2FF',
    borderColor: ClayColors.buddyPurple,
  },
  cityPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: ClayColors.textSecondary,
  },
  cityPillTextActive: {
    color: ClayColors.buddyPurple,
  },
  validationBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    padding: 8,
    borderRadius: ClayRadii.sm,
    marginTop: 4,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  validationText: {
    fontSize: 11,
    color: '#B91C1C',
    fontWeight: '600',
    marginLeft: 6,
    flex: 1,
  },
  optionsRowWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  filterChoicePill: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: ClayRadii.pill,
    backgroundColor: '#F8FAFC',
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
  },
  filterChoicePillActive: {
    backgroundColor: '#E0F2FE',
    borderColor: '#0284C7',
  },
  filterChoiceText: {
    fontSize: 11,
    fontWeight: '600',
    color: ClayColors.textSecondary,
  },
  filterChoiceTextActive: {
    color: '#0369A1',
    fontWeight: '800',
  },
  priorityPill: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: ClayRadii.pill,
    backgroundColor: '#F8FAFC',
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
  },
  priorityPillActive: {
    backgroundColor: '#EDE9FE',
    borderColor: ClayColors.buddyPurple,
  },
  priorityText: {
    fontSize: 11,
    fontWeight: '600',
    color: ClayColors.textSecondary,
  },
  priorityTextActive: {
    color: ClayColors.buddyPurple,
    fontWeight: '800',
  },
  passengersRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  passengersTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: ClayColors.textPrimary,
  },
  passengersSub: {
    fontSize: 10,
    color: ClayColors.textMuted,
    marginTop: 1,
  },
  stepperPills: {
    flexDirection: 'row',
    gap: 6,
  },
  passengerBtn: {
    paddingVertical: 4,
    paddingHorizontal: 9,
    borderRadius: ClayRadii.pill,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  passengerBtnActive: {
    backgroundColor: ClayColors.buddyPurple,
    borderColor: ClayColors.buddyPurple,
  },
  passengerBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: ClayColors.textSecondary,
  },
  passengerBtnTextActive: {
    color: '#FFFFFF',
  },
  recommendationCard: {
    marginBottom: 16,
    borderWidth: 2,
    borderBottomWidth: 4,
    borderColor: '#C7D2FE',
    borderBottomColor: '#A5B4FC',
  },
  recommendHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  recommendBadge: {
    backgroundColor: '#FEF08A',
    paddingVertical: 3,
    paddingHorizontal: 9,
    borderRadius: ClayRadii.pill,
    borderWidth: 1.5,
    borderBottomWidth: 2.5,
    borderColor: '#EAB308',
    borderBottomColor: '#CA8A04',
  },
  recommendBadgeText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#854D0E',
    letterSpacing: 0.5,
  },
  priorityActiveTag: {
    backgroundColor: '#EEF2FF',
    paddingVertical: 3,
    paddingHorizontal: 9,
    borderRadius: ClayRadii.pill,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  priorityActiveTagText: {
    fontSize: 10,
    fontWeight: '800',
    color: ClayColors.buddyPurple,
  },
  winnerMainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  winnerIconBlob: {
    width: 50,
    height: 50,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderBottomWidth: 3.5,
    borderColor: '#C7D2FE',
    borderBottomColor: '#A5B4FC',
  },
  winnerTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: ClayColors.textPrimary,
  },
  winnerHours: {
    fontSize: 11,
    color: ClayColors.textMuted,
    marginTop: 2,
  },
  reasonBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: ClayRadii.md,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1.5,
    borderBottomWidth: 3,
    borderColor: '#DDD6FE',
    borderBottomColor: '#C4B5FD',
  },
  reasonHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 4,
  },
  reasonHeading: {
    fontSize: 11,
    fontWeight: '800',
    color: ClayColors.buddyPurple,
  },
  reasonExplanation: {
    fontSize: 12,
    color: ClayColors.textPrimary,
    lineHeight: 18,
  },
  winnerMetricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: ClayRadii.md,
    padding: 12,
    borderWidth: 1.5,
    borderBottomWidth: 3,
    borderColor: '#E2E8F0',
    borderBottomColor: '#CBD5E1',
  },
  winnerMetricBox: {
    flex: 1,
    alignItems: 'center',
  },
  winnerMetricLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: ClayColors.textMuted,
    textTransform: 'uppercase',
  },
  winnerMetricValue: {
    fontSize: 13,
    fontWeight: '900',
    color: ClayColors.buddyPurple,
    marginTop: 2,
  },
  metricDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#E2E8F0',
  },
  compareNoticeCard: {
    marginBottom: 14,
  },
  compareNoticeTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#9A3412',
    marginBottom: 8,
  },
  compareRow: {
    flexDirection: 'row',
    gap: 8,
  },
  compareBlock: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: ClayRadii.sm,
    padding: 8,
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  compareBlockName: {
    fontSize: 11,
    fontWeight: '800',
    color: ClayColors.textPrimary,
  },
  compareBlockFare: {
    fontSize: 12,
    fontWeight: '900',
    color: ClayColors.buddyPurple,
    marginTop: 2,
  },
  compareBlockTime: {
    fontSize: 10,
    color: ClayColors.textMuted,
    marginTop: 1,
  },
  sectionHeaderRow: {
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: ClayColors.textPrimary,
  },
  sectionSub: {
    fontSize: 11,
    color: ClayColors.textMuted,
  },
  modeFilterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  modePill: {
    paddingVertical: 5,
    paddingHorizontal: 11,
    borderRadius: ClayRadii.pill,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
  },
  modePillActive: {
    backgroundColor: ClayColors.buddyPurple,
    borderColor: '#4F46E5',
  },
  modePillText: {
    fontSize: 11,
    fontWeight: '700',
    color: ClayColors.textSecondary,
  },
  modePillTextActive: {
    color: '#FFFFFF',
  },
  optionCard: {
    marginBottom: 12,
  },
  optionTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  modeIconBlob: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderBottomWidth: 3.5,
    borderColor: '#C7D2FE',
    borderBottomColor: '#A5B4FC',
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginBottom: 4,
  },
  optionName: {
    fontSize: 14,
    fontWeight: '800',
    color: ClayColors.textPrimary,
  },
  operatingHoursText: {
    fontSize: 11,
    color: ClayColors.textMuted,
    marginTop: 2,
  },
  fareContainer: {
    alignItems: 'flex-end',
  },
  fareNumber: {
    fontSize: 15,
    fontWeight: '900',
    color: ClayColors.buddyPurple,
  },
  perPersonSub: {
    fontSize: 10,
    color: ClayColors.textMuted,
    marginTop: 1,
  },
  timeTag: {
    fontSize: 11,
    color: ClayColors.textMuted,
    marginTop: 2,
  },
  trafficNoteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
    paddingHorizontal: 2,
  },
  trafficNoteText: {
    fontSize: 11,
    color: ClayColors.textMuted,
    fontStyle: 'italic',
  },
  limitationsBox: {
    backgroundColor: '#FFFBEB',
    borderRadius: ClayRadii.md,
    padding: 10,
    marginVertical: 6,
    borderWidth: 1.5,
    borderBottomWidth: 3,
    borderColor: '#FDE68A',
    borderBottomColor: '#FCD34D',
  },
  limitationsHeading: {
    fontSize: 11,
    fontWeight: '800',
    color: '#B45309',
    marginBottom: 2,
  },
  limitationItem: {
    fontSize: 11,
    color: '#92400E',
    lineHeight: 16,
  },
  safetyBox: {
    backgroundColor: '#F0FDF4',
    borderRadius: ClayRadii.md,
    padding: 10,
    marginVertical: 6,
    borderWidth: 1.5,
    borderBottomWidth: 3,
    borderColor: '#BBF7D0',
    borderBottomColor: '#86EFAC',
  },
  safetyHeading: {
    fontSize: 11,
    fontWeight: '800',
    color: '#15803D',
    marginBottom: 4,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: 1,
  },
  tipText: {
    fontSize: 11,
    color: ClayColors.textSecondary,
    marginLeft: 5,
    flex: 1,
    lineHeight: 15,
  },
  cardActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  budgetSelectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: ClayRadii.pill,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  budgetSelectBtnActive: {
    backgroundColor: '#DCFCE7',
    borderColor: '#86EFAC',
  },
  budgetSelectText: {
    fontSize: 11,
    fontWeight: '700',
    color: ClayColors.buddyPurple,
    marginLeft: 5,
  },
  compareToggleBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: ClayRadii.pill,
    backgroundColor: '#F1F5F9',
  },
  compareToggleBtnActive: {
    backgroundColor: '#EDE9FE',
  },
  compareToggleText: {
    fontSize: 11,
    fontWeight: '700',
    color: ClayColors.textSecondary,
  },
  sourceFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 8,
    marginTop: 8,
  },
  sourceAuthorityText: {
    fontSize: 10,
    color: ClayColors.textMuted,
    flex: 1,
  },
  bookingLinkText: {
    fontSize: 10,
    fontWeight: '700',
    color: ClayColors.buddyPurple,
    marginLeft: 8,
  },
});
