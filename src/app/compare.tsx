import React from 'react';
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
import { ClayBadge } from '@/components/clay/ClayBadge';
import { ClayBuddyAvatar } from '@/components/clay/ClayBuddyAvatar';
import { formatINR, calculatePGBreakdown, getDepositMultiplier } from '@/utils/costCalculator';
import { Ionicons } from '@expo/vector-icons';

export default function CompareScreen() {
  const router = useRouter();
  const {
    listings,
    selectedForCompare,
    toggleCompareSelection,
    clearCompareSelection,
    profile,
    getComparisonInsights,
    setActiveListing,
  } = useApp();

  const compareList = listings.filter((l) => selectedForCompare.includes(l.id));

  // If fewer than 2 listings selected, show friendly selector
  if (compareList.length < 2) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <ClayCard variant="lavender" padding={20} radius={ClayRadii.xl} style={styles.emptyCompareCard}>
          <ClayBuddyAvatar mood="thinking" size={72} speechText="Select 2 or more PGs to compare!" />
          <Text style={styles.emptyTitle}>Select Listings to Compare</Text>
          <Text style={styles.emptySubtitle}>
            Compare recurring monthly bills, deposit traps, and see our explainable "Why this recommendation?" AI reasoning.
          </Text>
        </ClayCard>

        <Text style={styles.selectHeading}>Available Listings (Tap to Select):</Text>
        {listings.map((pg) => {
          const isSelected = selectedForCompare.includes(pg.id);
          const cost = calculatePGBreakdown(pg, profile.monthlyBudget);

          return (
            <Pressable
              key={pg.id}
              onPress={() => toggleCompareSelection(pg.id)}
              style={({ pressed }) => [
                styles.selectItem,
                isSelected && styles.selectItemActive,
                ClayShadows.card,
                pressed && { opacity: 0.8 },
              ]}
            >
              <Ionicons
                name={isSelected ? 'checkbox' : 'square-outline'}
                size={22}
                color={isSelected ? ClayColors.buddyPurple : ClayColors.textMuted}
              />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.selectItemTitle}>{pg.title}</Text>
                <Text style={styles.selectItemMeta}>
                  📍 {pg.city} • Recurring: {formatINR(cost.recurringMonthlyTotal)}/mo • Deposit: {formatINR(pg.securityDeposit)}
                </Text>
              </View>
              <ClayBadge
                label={cost.isWithinBudget ? 'Within Budget' : 'Exceeds'}
                type={cost.isWithinBudget ? 'success' : 'redflag'}
              />
            </Pressable>
          );
        })}
      </ScrollView>
    );
  }

  const insight = getComparisonInsights();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.pageTitle}>Side-by-Side Comparison</Text>
          <Text style={styles.pageSubtitle}>
            Comparing {compareList.length} properties against your {formatINR(profile.monthlyBudget)} budget
          </Text>
        </View>
        <Pressable
          onPress={() => {
            clearCompareSelection();
          }}
          style={styles.resetBtn}
        >
          <Text style={styles.resetBtnText}>Change Selection</Text>
        </Pressable>
      </View>

      {/* HACKATHON WINNING SECTION: "Why this recommendation?" */}
      <ClayCard variant="elevated" padding={20} radius={ClayRadii.xl} style={styles.whyCard}>
        <View style={styles.whyHeaderRow}>
          <View style={styles.winnerTrophyBlob}>
            <Ionicons name="trophy" size={24} color="#CA8A04" />
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <View style={styles.aiRecommendedPill}>
              <Text style={styles.aiRecommendedText}>🏆 TOP AI RECOMMENDATION</Text>
            </View>
            <Text style={styles.winnerTitle}>
              {listings.find((p) => p.id === insight.winnerId)?.title || 'Best Option'}
            </Text>
          </View>
          <ClayBuddyAvatar mood="celebrate" size={54} />
        </View>

        <Text style={styles.winnerSummaryText}>{insight.winnerReason}</Text>

        <View style={styles.accordionBox}>
          <Text style={styles.accordionTitle}>🔍 Why this recommendation? (Explainable AI)</Text>

          {/* Student preferences used */}
          <Text style={styles.explainCategory}>Student Preferences Influencing Decision:</Text>
          {insight.whyThisRecommendation.studentPreferencesUsed.map((item, idx) => (
            <View key={idx} style={styles.bulletRow}>
              <Ionicons name="checkmark-circle" size={14} color={ClayColors.mintDeep} />
              <Text style={styles.bulletText}>{item}</Text>
            </View>
          ))}

          {/* Factual Listing Highlights */}
          <Text style={[styles.explainCategory, { marginTop: 10 }]}>Listing Facts Used:</Text>
          {insight.whyThisRecommendation.factualListingHighlights.map((item, idx) => (
            <View key={idx} style={styles.bulletRow}>
              <Ionicons name="information-circle" size={14} color={ClayColors.blueDeep} />
              <Text style={styles.bulletText}>{item}</Text>
            </View>
          ))}

          {/* Hidden cost alerts */}
          <Text style={[styles.explainCategory, { marginTop: 10 }]}>Hidden Cost / Risk Checks:</Text>
          {insight.whyThisRecommendation.hiddenCostAlerts.map((item, idx) => (
            <View key={idx} style={styles.bulletRow}>
              <Text style={styles.bulletText}>{item}</Text>
            </View>
          ))}

          {/* Unknown Factors */}
          <Text style={[styles.explainCategory, { marginTop: 10 }]}>Unknown Details to Verify in Person:</Text>
          {insight.whyThisRecommendation.unknownFactorsToVerify.map((item, idx) => (
            <View key={idx} style={styles.bulletRow}>
              <Text style={styles.bulletText}>{item}</Text>
            </View>
          ))}
        </View>
      </ClayCard>

      {/* Side-by-Side Cards Comparison Grid */}
      <Text style={styles.sectionHeading}>Detailed Feature & Cost Matrix</Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.matrixScroll}>
        <View style={styles.matrixRow}>
          {compareList.map((pg) => {
            const cost = calculatePGBreakdown(pg, profile.monthlyBudget);
            const isWinner = pg.id === insight.winnerId;

            return (
              <ClayCard
                key={pg.id}
                variant={isWinner ? 'mint' : 'default'}
                padding={16}
                radius={ClayRadii.lg}
                style={styles.compareCard}
              >
                {isWinner && (
                  <View style={styles.winnerBadgePill}>
                    <Ionicons name="star" size={12} color="#15803D" />
                    <Text style={styles.winnerBadgeText}>Recommended Choice</Text>
                  </View>
                )}

                <Text style={styles.matrixCardTitle}>{pg.title}</Text>
                <Text style={styles.matrixCardLoc}>{pg.locality}, {pg.city}</Text>

                {/* Costs */}
                <View style={styles.matrixStat}>
                  <Text style={styles.matrixStatLabel}>Recurring Monthly</Text>
                  <Text style={[styles.matrixStatValue, { color: ClayColors.buddyPurple }]}>
                    {formatINR(cost.recurringMonthlyTotal)}/mo
                  </Text>
                  <Text style={styles.matrixStatSub}>
                    {cost.isWithinBudget ? '✓ Fits budget' : `Over by ${formatINR(Math.abs(cost.monthlySavingsOrDeficit))}`}
                  </Text>
                </View>

                <View style={styles.matrixStat}>
                  <Text style={styles.matrixStatLabel}>1st Month Cash</Text>
                  <Text style={styles.matrixStatValue}>{formatINR(cost.firstMonthCashTotal)}</Text>
                  <Text style={styles.matrixStatSub}>Deposit + Rent + Fees</Text>
                </View>

                <View style={styles.matrixStat}>
                  <Text style={styles.matrixStatLabel}>Security Deposit</Text>
                  <Text style={styles.matrixStatValue}>{formatINR(pg.securityDeposit)}</Text>
                  <Text style={styles.matrixStatSub}>
                    {getDepositMultiplier(pg.securityDeposit, pg.monthlyRent)} rent ({pg.depositRefundable ? 'Refundable' : 'Deductions apply'})
                  </Text>
                </View>

                {/* Food & Electricity */}
                <View style={styles.matrixStat}>
                  <Text style={styles.matrixStatLabel}>Food Mess</Text>
                  <Text style={styles.matrixStatValue}>
                    {pg.foodIncluded ? '✓ Included (3 Meals)' : `Extra (~${formatINR(cost.food)}/mo)`}
                  </Text>
                </View>

                <View style={styles.matrixStat}>
                  <Text style={styles.matrixStatLabel}>Electricity Policy</Text>
                  <Text style={styles.matrixStatValue}>{pg.electricityRule}</Text>
                </View>

                {/* Restrictions */}
                <View style={styles.matrixStat}>
                  <Text style={styles.matrixStatLabel}>Curfew / Lock-in</Text>
                  <Text style={styles.matrixStatValue}>
                    {pg.curfewTime || 'None'} • {pg.lockInPeriodMonths} mo lock-in
                  </Text>
                </View>

                {/* Red flags count */}
                <View style={styles.matrixStat}>
                  <Text style={styles.matrixStatLabel}>Risk Alerts</Text>
                  <Text
                    style={[
                      styles.matrixStatValue,
                      { color: pg.redFlags.length > 0 ? ClayColors.roseDark : ClayColors.mintDeep },
                    ]}
                  >
                    {pg.redFlags.length === 0 ? '✓ None' : `${pg.redFlags.length} Risks Identified`}
                  </Text>
                </View>

                <ClayButton
                  title="Open Full Report"
                  variant="secondary"
                  size="sm"
                  onPress={() => {
                    setActiveListing(pg);
                    router.push('/report');
                  }}
                  style={{ marginTop: 12 }}
                />
              </ClayCard>
            );
          })}
        </View>
      </ScrollView>

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
    maxWidth: 820,
    alignSelf: 'center',
    width: '100%',
  },
  emptyCompareCard: {
    alignItems: 'center',
    paddingVertical: 24,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: ClayColors.textPrimary,
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 13,
    color: ClayColors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    maxWidth: 320,
  },
  selectHeading: {
    fontSize: 14,
    fontWeight: '800',
    color: ClayColors.textPrimary,
    marginBottom: 10,
  },
  selectItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: ClayRadii.lg,
    padding: 14,
    marginBottom: 10,
  },
  selectItemActive: {
    borderColor: ClayColors.buddyPurple,
    backgroundColor: '#EEF2FF',
  },
  selectItemTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: ClayColors.textPrimary,
  },
  selectItemMeta: {
    fontSize: 12,
    color: ClayColors.textMuted,
    marginTop: 2,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: ClayColors.textPrimary,
  },
  pageSubtitle: {
    fontSize: 12,
    color: ClayColors.textMuted,
    marginTop: 2,
  },
  resetBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: ClayRadii.pill,
    backgroundColor: '#F1F5F9',
  },
  resetBtnText: {
    fontSize: 12,
    color: ClayColors.buddyPurple,
    fontWeight: '700',
  },
  whyCard: {
    marginBottom: 18,
    backgroundColor: '#FFFFFF',
  },
  whyHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  winnerTrophyBlob: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FEF9C3',
    borderWidth: 1.5,
    borderColor: '#FDE047',
    justifyContent: 'center',
    alignItems: 'center',
  },
  aiRecommendedPill: {
    backgroundColor: '#DCFCE7',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: ClayRadii.pill,
    alignSelf: 'flex-start',
  },
  aiRecommendedText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#15803D',
  },
  winnerTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: ClayColors.textPrimary,
    marginTop: 2,
  },
  winnerSummaryText: {
    fontSize: 13,
    color: ClayColors.textSecondary,
    lineHeight: 18,
    marginVertical: 10,
  },
  accordionBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: ClayRadii.md,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    padding: 12,
    marginTop: 6,
  },
  accordionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: ClayColors.textPrimary,
    marginBottom: 6,
  },
  explainCategory: {
    fontSize: 11,
    fontWeight: '800',
    color: ClayColors.buddyPurple,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginBottom: 4,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: 2,
  },
  bulletText: {
    fontSize: 12,
    color: ClayColors.textSecondary,
    marginLeft: 6,
    flex: 1,
    lineHeight: 16,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '800',
    color: ClayColors.textPrimary,
    marginBottom: 10,
  },
  matrixScroll: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  matrixRow: {
    flexDirection: 'row',
    gap: 14,
  },
  compareCard: {
    width: 260,
    position: 'relative',
  },
  winnerBadgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: ClayRadii.pill,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  winnerBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#15803D',
    marginLeft: 4,
  },
  matrixCardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: ClayColors.textPrimary,
  },
  matrixCardLoc: {
    fontSize: 11,
    color: ClayColors.textMuted,
    marginBottom: 10,
  },
  matrixStat: {
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  matrixStatLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: ClayColors.textMuted,
    textTransform: 'uppercase',
  },
  matrixStatValue: {
    fontSize: 13,
    fontWeight: '800',
    color: ClayColors.textPrimary,
    marginTop: 1,
  },
  matrixStatSub: {
    fontSize: 10,
    color: ClayColors.textMuted,
    marginTop: 1,
  },
});
