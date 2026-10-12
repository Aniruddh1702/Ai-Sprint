import React, { useState, useEffect, useMemo } from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useApp } from '@/context/AppContext';
import { ClayColors, ClayRadii, ClayShadows } from '@/constants/clayTheme';
import { ClayCard } from '@/components/clay/ClayCard';
import { ClayButton } from '@/components/clay/ClayButton';
import { ClayBuddyAvatar } from '@/components/clay/ClayBuddyAvatar';
import { ClayStatBox } from '@/components/clay/ClayStatBox';
import { ClayBadge } from '@/components/clay/ClayBadge';
import { formatINR, calculatePGBreakdown } from '@/utils/costCalculator';
import { Ionicons } from '@expo/vector-icons';

export default function HomeScreen() {
  const router = useRouter();
  const { profile, listings, setActiveListing, activeListing, selectedForCompare, toggleCompareSelection } = useApp();

  const [selectedCityFilter, setSelectedCityFilter] = useState<string>(profile.city || 'Indore');

  // Sync city filter when user updates profile city in header
  useEffect(() => {
    if (profile.city) {
      setSelectedCityFilter(profile.city);
    }
  }, [profile.city]);

  // Compute available cities from profile and listings
  const availableCities = useMemo(() => {
    const set = new Set<string>();
    if (profile.city) set.add(profile.city);
    listings.forEach((l) => {
      if (l.city) set.add(l.city);
    });
    // Ensure Indore, Bengaluru, Pune are present
    set.add('Indore');
    set.add('Bengaluru');
    set.add('Pune');
    return ['All Cities', ...Array.from(set)];
  }, [profile.city, listings]);

  // Filter listings by selected city
  const displayedListings = useMemo(() => {
    if (selectedCityFilter === 'All Cities') return listings;
    return listings.filter((pg) =>
      pg.city.toLowerCase().includes(selectedCityFilter.toLowerCase()) ||
      selectedCityFilter.toLowerCase().includes(pg.city.toLowerCase())
    );
  }, [listings, selectedCityFilter]);

  const activeCost = activeListing
    ? calculatePGBreakdown(activeListing, profile.monthlyBudget)
    : null;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Friendly Welcome & Buddy Card */}
      <ClayCard variant="elevated" padding={20} radius={ClayRadii.xl} style={styles.heroCard}>
        <View style={styles.heroRow}>
          <View style={styles.heroTextContainer}>
            <View style={styles.welcomePill}>
              <Text style={styles.welcomePillText}>👋 Welcome {profile.name}!</Text>
            </View>
            <Text style={styles.heroTitle}>
              Moving to <Text style={{ color: ClayColors.buddyPurple }}>{profile.city}</Text>?
            </Text>
            <Text style={styles.heroSubtitle}>
              Don't pay token money blindly. Let's uncover hidden electricity tariffs, non-refundable deposit traps, and real recurring costs.
            </Text>
          </View>
          <View style={styles.avatarWrapper}>
            <ClayBuddyAvatar
              mood="happy"
              size={76}
              speechText="Paison ki bachhat!"
            />
          </View>
        </View>

        {/* Large Primary Action Button */}
        <ClayButton
          title="Analyze a PG Listing Now"
          variant="primary"
          size="lg"
          fullWidth
          onPress={() => router.push('/analyze')}
          icon={<Ionicons name="scan-circle" size={24} color="#FFFFFF" />}
          style={{ marginTop: 14 }}
        />
      </ClayCard>

      {/* Quick Student Budget Summary */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Monthly Accommodation Budget</Text>
        <Pressable onPress={() => router.push('/plan')}>
          <Text style={styles.sectionAction}>View Breakdown →</Text>
        </Pressable>
      </View>

      <View style={styles.statsRow}>
        <ClayStatBox
          label="Your Target"
          value={formatINR(profile.monthlyBudget)}
          subtext="Monthly cap"
          variant="lavender"
          icon={<Ionicons name="wallet-outline" size={18} color={ClayColors.lavenderDark} />}
        />
        <ClayStatBox
          label={activeListing ? 'Active PG Cost' : 'Avg Estimated'}
          value={activeCost ? formatINR(activeCost.recurringMonthlyTotal) : '₹11,500'}
          subtext={activeCost?.isWithinBudget ? 'Within budget' : 'Exceeds budget'}
          variant={activeCost?.isWithinBudget ? 'mint' : 'rose'}
          icon={<Ionicons name="calculator-outline" size={18} color={ClayColors.mintDark} />}
        />
        <ClayStatBox
          label="Est. Savings"
          value={
            activeCost
              ? formatINR(activeCost.monthlySavingsOrDeficit)
              : formatINR(profile.monthlyBudget - 11500)
          }
          subtext="Per month"
          variant="blue"
          icon={<Ionicons name="trending-up-outline" size={18} color={ClayColors.blueDark} />}
        />
      </View>

      {/* Student City Companion Suite Grid */}
      <View style={styles.sectionHeaderColumn}>
        <View style={styles.sectionTitleRow}>
          <Text style={styles.sectionTitle}>Student City Companion Suite</Text>
          <View style={styles.cityBadgePill}>
            <Text style={styles.cityBadgePillText}>📍 {profile.city}</Text>
          </View>
        </View>
        <Text style={styles.sectionSub}>Everything you need to settle safely into your new city</Text>
      </View>

      <View style={styles.launcherGrid}>
        {/* Scam Alerts Clay Pod */}
        <Pressable
          onPress={() => router.push('/scams')}
          style={({ pressed }) => [
            styles.launcherCard,
            ClayShadows.pod,
            { backgroundColor: '#FFF1F2', borderColor: '#FECDD3', borderBottomColor: '#FDA4AF' },
            pressed && styles.cardPressed,
          ]}
        >
          <View style={styles.cardSheen} pointerEvents="none" />
          <View style={styles.launcherCardTopRow}>
            <View style={[styles.launcherIconCircle, { backgroundColor: '#FFE4E6', borderColor: '#FECDD3' }]}>
              <Ionicons name="alert-circle" size={22} color="#E11D48" />
            </View>
            <Ionicons name="chevron-forward-circle" size={18} color="#FDA4AF" />
          </View>
          <Text style={styles.launcherTitle}>Scam Alerts</Text>
          <Text style={styles.launcherSub}>Fake listings, QR traps & deposit theft</Text>
        </Pressable>

        {/* Food & Tiffin Clay Pod */}
        <Pressable
          onPress={() => router.push('/food')}
          style={({ pressed }) => [
            styles.launcherCard,
            ClayShadows.pod,
            { backgroundColor: '#F0FDF4', borderColor: '#BBF7D0', borderBottomColor: '#86EFAC' },
            pressed && styles.cardPressed,
          ]}
        >
          <View style={styles.cardSheen} pointerEvents="none" />
          <View style={styles.launcherCardTopRow}>
            <View style={[styles.launcherIconCircle, { backgroundColor: '#DCFCE7', borderColor: '#BBF7D0' }]}>
              <Ionicons name="restaurant" size={22} color="#16A34A" />
            </View>
            <Ionicons name="chevron-forward-circle" size={18} color="#86EFAC" />
          </View>
          <Text style={styles.launcherTitle}>Food & Tiffin</Text>
          <Text style={styles.launcherSub}>Homestyle student dabbas & thalis</Text>
        </Pressable>

        {/* Transport Guide Clay Pod */}
        <Pressable
          onPress={() => router.push('/transport')}
          style={({ pressed }) => [
            styles.launcherCard,
            ClayShadows.pod,
            { backgroundColor: '#F0F9FF', borderColor: '#BAE6FD', borderBottomColor: '#7DD3FC' },
            pressed && styles.cardPressed,
          ]}
        >
          <View style={styles.cardSheen} pointerEvents="none" />
          <View style={styles.launcherCardTopRow}>
            <View style={[styles.launcherIconCircle, { backgroundColor: '#E0F2FE', borderColor: '#BAE6FD' }]}>
              <Ionicons name="bus" size={22} color="#0284C7" />
            </View>
            <Ionicons name="chevron-forward-circle" size={18} color="#7DD3FC" />
          </View>
          <Text style={styles.launcherTitle}>Transport Guide</Text>
          <Text style={styles.launcherSub}>Metro, bus, auto fare splits & Best route</Text>
        </Pressable>

        {/* City Starter Kit Clay Pod */}
        <Pressable
          onPress={() => router.push('/starter-kit')}
          style={({ pressed }) => [
            styles.launcherCard,
            ClayShadows.pod,
            { backgroundColor: '#FFF7ED', borderColor: '#FED7AA', borderBottomColor: '#FDBA74' },
            pressed && styles.cardPressed,
          ]}
        >
          <View style={styles.cardSheen} pointerEvents="none" />
          <View style={styles.launcherCardTopRow}>
            <View style={[styles.launcherIconCircle, { backgroundColor: '#FFEDD5', borderColor: '#FED7AA' }]}>
              <Ionicons name="navigate" size={22} color="#EA580C" />
            </View>
            <Ionicons name="chevron-forward-circle" size={18} color="#FDBA74" />
          </View>
          <Text style={styles.launcherTitle}>City Starter Kit</Text>
          <Text style={styles.launcherSub}>Hospitals, 24x7 chemists & print hubs</Text>
        </Pressable>
      </View>

      {/* Prominent PG Proof Buddy Assistant Card */}
      <ClayCard variant="peach" padding={18} radius={ClayRadii.xl} style={styles.buddyFeatureCard}>
        <View style={styles.buddyFeatureRow}>
          <View style={styles.buddyFeatureText}>
            <View style={styles.badgeRow}>
              <ClayBadge label="Real AI Assistant" type="verified" />
              <ClayBadge label="Hinglish / English" type="fact" />
            </View>
            <Text style={styles.buddyCardTitle}>Talk to PG Proof Buddy</Text>
            <Text style={styles.buddyCardDesc}>
              Ask about rental agreement clauses, negotiate deposit politely on WhatsApp, or check local tenant rights.
            </Text>
            <ClayButton
              title="Chat with Buddy"
              variant="peach"
              size="sm"
              onPress={() => router.push('/buddy')}
              icon={<Ionicons name="chatbubbles" size={16} color="#FFFFFF" />}
              style={{ marginTop: 10, alignSelf: 'flex-start' }}
            />
          </View>
          <View style={styles.buddyAvatarMini}>
            <ClayBuddyAvatar mood="detective" size={68} speechText="Ask me anything!" />
          </View>
        </View>
      </ClayCard>

      {/* Recently Analyzed & Saved Listings */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Analyzed & Saved PGs</Text>
        <Text style={styles.listingCount}>
          {displayedListings.length} {selectedCityFilter === 'All Cities' ? 'properties' : `in ${selectedCityFilter}`}
        </Text>
      </View>

      {/* City Switcher Filter Pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.cityFilterScroll}
      >
        {availableCities.map((city) => {
          const isSelected = selectedCityFilter.toLowerCase() === city.toLowerCase();
          const count =
            city === 'All Cities'
              ? listings.length
              : listings.filter(
                  (l) =>
                    l.city.toLowerCase().includes(city.toLowerCase()) ||
                    city.toLowerCase().includes(l.city.toLowerCase())
                ).length;

          return (
            <Pressable
              key={city}
              onPress={() => {
                setSelectedCityFilter(city);
                // If switching to a specific city and active listing is from another city, update active listing
                if (city !== 'All Cities') {
                  const match = listings.find(
                    (l) =>
                      l.city.toLowerCase().includes(city.toLowerCase()) ||
                      city.toLowerCase().includes(l.city.toLowerCase())
                  );
                  if (match) setActiveListing(match);
                }
              }}
              style={[
                styles.cityFilterPill,
                isSelected && styles.cityFilterPillActive,
              ]}
            >
              <Text
                style={[
                  styles.cityFilterPillText,
                  isSelected && styles.cityFilterPillTextActive,
                ]}
              >
                {city === 'All Cities' ? '🌐 All' : `📍 ${city}`} ({count})
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {displayedListings.length === 0 ? (
        <ClayCard variant="lavender" padding={20} radius={ClayRadii.lg} style={styles.emptyStateCard}>
          <Text style={styles.emptyStateTitle}>No PGs currently saved for {selectedCityFilter}</Text>
          <Text style={styles.emptyStateDesc}>
            Analyze a rent receipt or WhatsApp listing from {selectedCityFilter} to check hidden deposit and electricity traps.
          </Text>
          <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
            <ClayButton
              title="Analyze New Listing"
              variant="primary"
              size="sm"
              onPress={() => router.push('/analyze')}
              style={{ flex: 1 }}
            />
            <ClayButton
              title="View All Cities"
              variant="secondary"
              size="sm"
              onPress={() => setSelectedCityFilter('All Cities')}
              style={{ flex: 1 }}
            />
          </View>
        </ClayCard>
      ) : (
        displayedListings.map((pg) => {
          const cost = calculatePGBreakdown(pg, profile.monthlyBudget);
          const isCompareSelected = selectedForCompare.includes(pg.id);

          return (
          <ClayCard
            key={pg.id}
            variant={cost.isWithinBudget ? 'default' : 'rose'}
            padding={16}
            radius={ClayRadii.lg}
            style={styles.listingCard}
          >
            <View style={styles.listingTopRow}>
              <View style={{ flex: 1 }}>
                <View style={styles.titleBadgeRow}>
                  <Text style={styles.listingTitle} numberOfLines={1}>
                    {pg.title}
                  </Text>
                  {pg.isUserCorrected && (
                    <ClayBadge label="User Corrected" type="estimate" />
                  )}
                </View>
                <Text style={styles.listingAddress} numberOfLines={1}>
                  📍 {pg.address} • {pg.city}
                </Text>
              </View>

              <View style={styles.ratingBadge}>
                <Ionicons name="shield-checkmark" size={14} color="#15803D" />
                <Text style={styles.ratingText}>{pg.overallRating}/10</Text>
              </View>
            </View>

            {/* Metrics Row */}
            <View style={styles.listingMetricsRow}>
              <View style={styles.metricBlock}>
                <Text style={styles.metricLabel}>Headline Rent</Text>
                <Text style={styles.metricValue}>{formatINR(pg.monthlyRent)}/mo</Text>
              </View>
              <View style={styles.metricDivider} />
              <View style={styles.metricBlock}>
                <Text style={styles.metricLabel}>Total Recurring</Text>
                <Text style={[styles.metricValue, { color: ClayColors.buddyPurple }]}>
                  {formatINR(cost.recurringMonthlyTotal)}/mo
                </Text>
              </View>
              <View style={styles.metricDivider} />
              <View style={styles.metricBlock}>
                <Text style={styles.metricLabel}>1st Month Cash</Text>
                <Text style={styles.metricValue}>{formatINR(cost.firstMonthCashTotal)}</Text>
              </View>
            </View>

            {/* Red Flags count if any */}
            {pg.redFlags.length > 0 && (
              <View style={styles.redFlagsSummaryRow}>
                <Ionicons name="warning" size={14} color={ClayColors.roseDark} />
                <Text style={styles.redFlagsSummaryText}>
                  {pg.redFlags.length} Risk Alert{pg.redFlags.length > 1 ? 's' : ''}:{' '}
                  {pg.redFlags[0].title}
                </Text>
              </View>
            )}

            {/* Actions */}
            <View style={styles.cardActionsRow}>
              <Pressable
                onPress={() => toggleCompareSelection(pg.id)}
                style={[
                  styles.compareBtn,
                  isCompareSelected && styles.compareBtnActive,
                ]}
              >
                <Ionicons
                  name={isCompareSelected ? 'checkbox' : 'square-outline'}
                  size={16}
                  color={isCompareSelected ? ClayColors.buddyPurple : ClayColors.textMuted}
                />
                <Text
                  style={[
                    styles.compareBtnText,
                    isCompareSelected && { color: ClayColors.buddyPurple, fontWeight: '700' },
                  ]}
                >
                  {isCompareSelected ? 'Added to Compare' : 'Compare'}
                </Text>
              </Pressable>

              <ClayButton
                title="View Full Report"
                variant="secondary"
                size="sm"
                onPress={() => {
                  setActiveListing(pg);
                  router.push('/report');
                }}
                icon={<Ionicons name="arrow-forward" size={14} color={ClayColors.textPrimary} />}
                iconPosition="right"
              />
            </View>
          </ClayCard>
        );
      })
      )}

      {/* Compare Floating Banner if selected */}
      {selectedForCompare.length >= 2 && (
        <ClayCard variant="lavender" padding={14} radius={ClayRadii.lg} style={styles.compareBanner}>
          <View style={styles.compareBannerRow}>
            <View>
              <Text style={styles.compareBannerTitle}>
                {selectedForCompare.length} PGs Selected for Side-by-Side Review
              </Text>
              <Text style={styles.compareBannerSub}>
                Includes "Why this recommendation?" AI breakdown
              </Text>
            </View>
            <ClayButton
              title="Compare Now"
              variant="lavender"
              size="sm"
              onPress={() => router.push('/compare')}
            />
          </View>
        </ClayCard>
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
  heroCard: {
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
  },
  heroRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heroTextContainer: {
    flex: 1,
    paddingRight: 10,
  },
  welcomePill: {
    alignSelf: 'flex-start',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: ClayRadii.pill,
    marginBottom: 6,
  },
  welcomePillText: {
    fontSize: 12,
    fontWeight: '700',
    color: ClayColors.buddyPurple,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: ClayColors.textPrimary,
    letterSpacing: -0.4,
  },
  heroSubtitle: {
    fontSize: 13,
    color: ClayColors.textSecondary,
    lineHeight: 18,
    marginTop: 4,
  },
  avatarWrapper: {
    marginLeft: 6,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 18,
    marginBottom: 10,
  },
  sectionHeaderColumn: {
    marginTop: 20,
    marginBottom: 12,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
  },
  sectionSub: {
    fontSize: 12,
    color: ClayColors.textMuted,
    marginTop: 4,
    fontWeight: '500',
  },
  cityBadgePill: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: ClayRadii.pill,
    borderWidth: 1.5,
    borderColor: '#C7D2FE',
  },
  cityBadgePillText: {
    fontSize: 11,
    fontWeight: '800',
    color: ClayColors.buddyPurple,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: ClayColors.textPrimary,
  },
  sectionAction: {
    fontSize: 13,
    fontWeight: '700',
    color: ClayColors.buddyPurple,
  },
  listingCount: {
    fontSize: 12,
    color: ClayColors.textMuted,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  buddyFeatureCard: {
    marginVertical: 12,
  },
  buddyFeatureRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  buddyFeatureText: {
    flex: 1,
  },
  badgeRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  buddyCardTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: ClayColors.textPrimary,
  },
  buddyCardDesc: {
    fontSize: 12,
    color: ClayColors.textSecondary,
    lineHeight: 17,
    marginTop: 2,
    maxWidth: 280,
  },
  buddyAvatarMini: {
    marginLeft: 12,
  },
  listingCard: {
    marginBottom: 14,
  },
  listingTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  titleBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  listingTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: ClayColors.textPrimary,
    marginRight: 6,
  },
  listingAddress: {
    fontSize: 12,
    color: ClayColors.textMuted,
    marginTop: 2,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: ClayRadii.pill,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#15803D',
    marginLeft: 4,
  },
  listingMetricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: ClayRadii.md,
    padding: 10,
    marginVertical: 10,
  },
  metricBlock: {
    flex: 1,
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 10,
    color: ClayColors.textMuted,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  metricValue: {
    fontSize: 13,
    fontWeight: '800',
    color: ClayColors.textPrimary,
    marginTop: 2,
  },
  metricDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#E2E8F0',
  },
  redFlagsSummaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF1F2',
    padding: 8,
    borderRadius: ClayRadii.sm,
    marginBottom: 10,
  },
  redFlagsSummaryText: {
    fontSize: 12,
    color: ClayColors.roseDark,
    fontWeight: '700',
    marginLeft: 6,
    flex: 1,
  },
  cardActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  compareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: ClayRadii.pill,
    backgroundColor: '#F1F5F9',
  },
  compareBtnActive: {
    backgroundColor: '#EEF2FF',
  },
  compareBtnText: {
    fontSize: 12,
    color: ClayColors.textSecondary,
    marginLeft: 6,
  },
  compareBanner: {
    marginVertical: 10,
  },
  compareBannerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  compareBannerTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: ClayColors.lavenderDark,
  },
  compareBannerSub: {
    fontSize: 11,
    color: ClayColors.lavenderText,
    marginTop: 1,
  },
  launcherGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
    justifyContent: 'space-between',
  },
  launcherCard: {
    width: '48%',
    borderRadius: ClayRadii.xl,
    padding: 14,
    borderWidth: 2,
    borderBottomWidth: 4,
    minHeight: 124,
    justifyContent: 'flex-start',
    position: 'relative',
    overflow: 'hidden',
  },
  cardSheen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
    borderTopLeftRadius: ClayRadii.xl,
    borderTopRightRadius: ClayRadii.xl,
  },
  cardPressed: {
    transform: [{ translateY: 2 }],
    opacity: 0.95,
  },
  launcherCardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  launcherIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
  },
  launcherTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: ClayColors.textPrimary,
  },
  launcherSub: {
    fontSize: 11,
    color: ClayColors.textSecondary,
    marginTop: 3,
    lineHeight: 15,
  },
  cityFilterScroll: {
    paddingVertical: 6,
    paddingHorizontal: 2,
    gap: 8,
    marginBottom: 12,
  },
  cityFilterPill: {
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: ClayRadii.pill,
    backgroundColor: '#F1F5F9',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  cityFilterPillActive: {
    backgroundColor: ClayColors.buddyPurple,
    borderColor: ClayColors.buddyPurple,
  },
  cityFilterPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: ClayColors.textSecondary,
  },
  cityFilterPillTextActive: {
    color: '#FFFFFF',
  },
  emptyStateCard: {
    marginVertical: 12,
    alignItems: 'center',
    textAlign: 'center',
  },
  emptyStateTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: ClayColors.lavenderDark,
    textAlign: 'center',
  },
  emptyStateDesc: {
    fontSize: 12,
    color: ClayColors.lavenderText,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
  },
  transportPromoCard: {
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: '#BAE6FD',
  },
  transportPromoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  transportPromoIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#E0F2FE',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#BAE6FD',
  },
  transportPromoBadge: {
    backgroundColor: '#E0F2FE',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: ClayRadii.pill,
    alignSelf: 'flex-start',
    marginBottom: 3,
  },
  transportPromoBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0369A1',
    letterSpacing: 0.5,
  },
  transportPromoTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: ClayColors.textPrimary,
  },
  transportPromoSubtitle: {
    fontSize: 11,
    color: ClayColors.textSecondary,
    lineHeight: 15,
    marginTop: 2,
  },
});
