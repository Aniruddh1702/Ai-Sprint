import React, { useState, useEffect } from 'react';
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
import { ClayInput } from '@/components/clay/ClayInput';
import { ClayBadge } from '@/components/clay/ClayBadge';
import { ClayBuddyAvatar } from '@/components/clay/ClayBuddyAvatar';
import { formatINR } from '@/utils/costCalculator';
import { calculateComprehensiveBudget } from '@/utils/studentBudgetEngine';
import { Ionicons } from '@expo/vector-icons';

export default function MyPlanScreen() {
  const router = useRouter();
  const {
    profile,
    updateProfile,
    checklist,
    toggleChecklistItem,
    addChecklistItem,
    deleteChecklistItem,
    listings,
    setActiveListing,
    activeListing,
    activeFoodPlan,
    activeTransportMode,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'budget' | 'checklist' | 'saved'>('budget');
  const [newChecklistText, setNewChecklistText] = useState('');

  // Integrated Comprehensive Budget states
  const [customRent, setCustomRent] = useState(activeListing ? activeListing.monthlyRent.toString() : '9500');
  const [customDeposit, setCustomDeposit] = useState(activeListing ? activeListing.securityDeposit.toString() : '19000');
  const [customFood, setCustomFood] = useState(activeFoodPlan ? activeFoodPlan.monthlyPrice.toString() : '3200');
  const [customTransport, setCustomTransport] = useState(
    activeTransportMode ? (activeTransportMode.estimatedFareMax * 44).toString() : '1200' // 22 working days x 2 trips
  );
  const [customUtilities, setCustomUtilities] = useState('800');
  const [customMobile, setCustomMobile] = useState('499');
  const [customPersonal, setCustomPersonal] = useState('2000');
  const [customOther, setCustomOther] = useState('500');
  const [moveInFees, setMoveInFees] = useState('1000');
  const [simulationMonths, setSimulationMonths] = useState<number>(3);

  // Sync budget inputs when active PG or companion plans change
  useEffect(() => {
    if (activeListing) {
      setCustomRent(activeListing.monthlyRent.toString());
      setCustomDeposit(activeListing.securityDeposit.toString());
    }
  }, [activeListing]);

  useEffect(() => {
    if (activeFoodPlan) {
      setCustomFood(activeFoodPlan.monthlyPrice.toString());
    }
  }, [activeFoodPlan]);

  useEffect(() => {
    if (activeTransportMode) {
      setCustomTransport((activeTransportMode.estimatedFareMax * 44).toString());
    }
  }, [activeTransportMode]);

  // Run deterministic calculation engine
  const budgetResult = calculateComprehensiveBudget({
    monthlyRent: parseInt(customRent, 10) || 0,
    securityDeposit: parseInt(customDeposit, 10) || 0,
    foodMonthly: parseInt(customFood, 10) || 0,
    transportMonthly: parseInt(customTransport, 10) || 0,
    utilitiesMonthly: parseInt(customUtilities, 10) || 0,
    mobileInternetMonthly: parseInt(customMobile, 10) || 0,
    personalMonthly: parseInt(customPersonal, 10) || 0,
    otherMonthly: parseInt(customOther, 10) || 0,
    oneTimeMoveInFees: parseInt(moveInFees, 10) || 0,
    studentMonthlyBudget: profile.monthlyBudget,
    durationMonths: simulationMonths,
  });

  const handleAddChecklist = () => {
    if (!newChecklistText.trim()) return;
    addChecklistItem(newChecklistText.trim(), 'during_visit');
    setNewChecklistText('');
  };

  const completedChecklistCount = checklist.filter((c) => c.completed).length;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Top Profile Summary Card */}
      <ClayCard variant="peach" padding={18} radius={ClayRadii.xl} style={styles.topProfileCard}>
        <View style={styles.profileRow}>
          <View style={{ flex: 1, paddingRight: 8 }}>
            <Text style={styles.profileName}>{profile.name}</Text>
            <Text style={styles.profileSubtitle}>
              Target: {profile.city} • Accommodation Budget: {formatINR(profile.monthlyBudget)}/mo
            </Text>
            <View style={styles.progressContainer}>
              <View style={styles.progressBarBg}>
                <View
                  style={[
                    styles.progressBarFill,
                    {
                      width: `${checklist.length > 0 ? (completedChecklistCount / checklist.length) * 100 : 0}%`,
                    },
                  ]}
                />
              </View>
              <Text style={styles.progressLabel}>
                {completedChecklistCount}/{checklist.length} checklist items completed
              </Text>
            </View>
          </View>
          <ClayBuddyAvatar mood="happy" size={58} />
        </View>
      </ClayCard>

      {/* Navigation Pills */}
      <View style={styles.navTabsRow}>
        <Pressable
          onPress={() => setActiveTab('budget')}
          style={[styles.navTab, activeTab === 'budget' && styles.navTabActive]}
        >
          <Text style={[styles.navTabText, activeTab === 'budget' && styles.navTabTextActive]}>
            💰 Smart Budget
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setActiveTab('checklist')}
          style={[styles.navTab, activeTab === 'checklist' && styles.navTabActive]}
        >
          <Text style={[styles.navTabText, activeTab === 'checklist' && styles.navTabTextActive]}>
            ✅ Moving Checklist
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setActiveTab('saved')}
          style={[styles.navTab, activeTab === 'saved' && styles.navTabActive]}
        >
          <Text style={[styles.navTabText, activeTab === 'saved' && styles.navTabTextActive]}>
            🏠 Saved PGs ({listings.length})
          </Text>
        </Pressable>
      </View>

      {/* TAB 1: SMART STUDENT BUDGET (FEATURE 5) */}
      {activeTab === 'budget' && (
        <View>
          {/* Main Budget Dashboard Card */}
          <ClayCard
            variant={budgetResult.breakdown.isWithinBudget ? 'mint' : 'rose'}
            padding={18}
            radius={ClayRadii.xl}
            style={styles.budgetMainCard}
          >
            <View style={styles.budgetTopRow}>
              <View>
                <Text style={styles.budgetCategoryLabel}>Expected Recurring Monthly Cost</Text>
                <Text style={styles.recurringTotalNumber}>
                  {formatINR(budgetResult.breakdown.recurringMonthlyTotal)}
                  <Text style={styles.recurringPerMonth}> / month</Text>
                </Text>
              </View>
              <ClayBadge
                label={budgetResult.breakdown.isWithinBudget ? 'WITHIN BUDGET' : 'OVER BUDGET'}
                type={budgetResult.breakdown.isWithinBudget ? 'verified' : 'redflag'}
              />
            </View>

            {/* Split Metrics Row */}
            <View style={styles.budgetMetricsRow}>
              <View style={styles.metricBlock}>
                <Text style={styles.metricLabel}>Student Budget</Text>
                <Text style={styles.metricVal}>{formatINR(profile.monthlyBudget)}</Text>
              </View>
              <View style={styles.metricDivider} />
              <View style={styles.metricBlock}>
                <Text style={styles.metricLabel}>Monthly Balance</Text>
                <Text
                  style={[
                    styles.metricVal,
                    {
                      color: budgetResult.breakdown.monthlyBalance >= 0 ? ClayColors.mintDeep : ClayColors.roseDeep,
                    },
                  ]}
                >
                  {formatINR(budgetResult.breakdown.monthlyBalance)}
                </Text>
              </View>
              <View style={styles.metricDivider} />
              <View style={styles.metricBlock}>
                <Text style={styles.metricLabel}>1st Month Cash</Text>
                <Text style={[styles.metricVal, { color: ClayColors.buddyPurple }]}>
                  {formatINR(budgetResult.breakdown.firstMonthMoveInTotal)}
                </Text>
              </View>
            </View>

            {/* Refundable Deposit Clarification */}
            <View style={styles.depositNoticeBox}>
              <Ionicons name="information-circle" size={16} color={ClayColors.buddyPurple} />
              <Text style={styles.depositNoticeText}>
                {budgetResult.formulaExplanations.depositSafetyNote}
              </Text>
            </View>
          </ClayCard>

          {/* Multi-Month Projection Switcher */}
          <ClayCard variant="lavender" padding={14} radius={ClayRadii.lg} style={styles.projectionCard}>
            <Text style={styles.projectionTitle}>
              Selected Multi-Month Forecast: {simulationMonths} Months
            </Text>
            <View style={styles.monthsPillsRow}>
              {[1, 3, 6, 12].map((m) => (
                <Pressable
                  key={m}
                  onPress={() => setSimulationMonths(m)}
                  style={[styles.monthPill, simulationMonths === m && styles.monthPillActive]}
                >
                  <Text style={[styles.monthPillText, simulationMonths === m && styles.monthPillTextActive]}>
                    {m} {m === 1 ? 'Month' : 'Months'}
                  </Text>
                </Pressable>
              ))}
            </View>
            <Text style={styles.projectionFormulaText}>
              {budgetResult.formulaExplanations.multiMonthEstimate}
            </Text>
          </ClayCard>

          {/* Interactive Expenses Simulator */}
          <ClayCard variant="default" padding={16} radius={ClayRadii.lg} style={styles.inputsCard}>
            <Text style={styles.sectionHeading}>Customize Expense Inputs:</Text>
            <Text style={styles.sectionHint}>
              Values pre-sync with your selected PG, Tiffin & Transit choices. Adjust freely to simulate alternatives.
            </Text>

            <View style={styles.twoColRow}>
              <ClayInput
                label="Monthly PG Rent (₹)"
                value={customRent}
                onChangeText={setCustomRent}
                keyboardType="numeric"
                containerStyle={{ flex: 1, marginRight: 6 }}
              />
              <ClayInput
                label="Security Deposit (₹)"
                value={customDeposit}
                onChangeText={setCustomDeposit}
                keyboardType="numeric"
                hint="Refundable asset"
                containerStyle={{ flex: 1, marginLeft: 6 }}
              />
            </View>

            <View style={styles.twoColRow}>
              <ClayInput
                label="Food & Tiffin (₹/mo)"
                value={customFood}
                onChangeText={setCustomFood}
                keyboardType="numeric"
                hint={activeFoodPlan ? `Synced: ${activeFoodPlan.name.substring(0, 18)}` : 'Mess / Dabba'}
                containerStyle={{ flex: 1, marginRight: 6 }}
              />
              <ClayInput
                label="City Transport (₹/mo)"
                value={customTransport}
                onChangeText={setCustomTransport}
                keyboardType="numeric"
                hint={activeTransportMode ? `Synced: ${activeTransportMode.name.substring(0, 15)}` : 'Metro / Bus pass'}
                containerStyle={{ flex: 1, marginLeft: 6 }}
              />
            </View>

            <View style={styles.twoColRow}>
              <ClayInput
                label="Electricity & Gas (₹)"
                value={customUtilities}
                onChangeText={setCustomUtilities}
                keyboardType="numeric"
                containerStyle={{ flex: 1, marginRight: 6 }}
              />
              <ClayInput
                label="Phone & Wi-Fi (₹)"
                value={customMobile}
                onChangeText={setCustomMobile}
                keyboardType="numeric"
                containerStyle={{ flex: 1, marginLeft: 6 }}
              />
            </View>

            <View style={styles.twoColRow}>
              <ClayInput
                label="Personal & Outings (₹)"
                value={customPersonal}
                onChangeText={setCustomPersonal}
                keyboardType="numeric"
                containerStyle={{ flex: 1, marginRight: 6 }}
              />
              <ClayInput
                label="One-Time Move-in Fee (₹)"
                value={moveInFees}
                onChangeText={setMoveInFees}
                keyboardType="numeric"
                hint="Agreement / Stamp"
                containerStyle={{ flex: 1, marginLeft: 6 }}
              />
            </View>

            {/* Formula Explanation Callout */}
            <View style={styles.formulaExplBox}>
              <Text style={styles.formulaTitle}>Transparent Mathematical Breakdown:</Text>
              <Text style={styles.formulaBody}>{budgetResult.formulaExplanations.recurringFormula}</Text>
              <Text style={[styles.formulaBody, { marginTop: 4 }]}>
                {budgetResult.formulaExplanations.firstMonthFormula}
              </Text>
            </View>
          </ClayCard>
        </View>
      )}

      {/* TAB 2: MOVING CHECKLIST */}
      {activeTab === 'checklist' && (
        <View>
          <ClayCard variant="default" padding={14} radius={ClayRadii.md} style={styles.addCard}>
            <View style={styles.addInputRow}>
              <ClayInput
                placeholder="Add custom task (e.g. check washing machine timings)"
                value={newChecklistText}
                onChangeText={setNewChecklistText}
                onSubmitEditing={handleAddChecklist}
                containerStyle={{ marginVertical: 0, flex: 1 }}
                inputStyle={{ minHeight: 40 }}
              />
              <ClayButton
                title="Add"
                variant="primary"
                size="sm"
                onPress={handleAddChecklist}
                style={{ marginLeft: 8 }}
              />
            </View>
          </ClayCard>

          <Text style={styles.sectionHeading}>Actionable Moving Checklist</Text>
          {checklist.map((item) => (
            <Pressable
              key={item.id}
              onPress={() => toggleChecklistItem(item.id)}
              style={({ pressed }) => [
                styles.checklistItemCard,
                item.completed && styles.checklistItemCompleted,
                ClayShadows.pill,
                pressed && { opacity: 0.8 },
              ]}
            >
              <Ionicons
                name={item.completed ? 'checkmark-circle' : 'ellipse-outline'}
                size={22}
                color={item.completed ? ClayColors.mintDeep : ClayColors.textMuted}
              />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={[styles.itemTitle, item.completed && styles.itemTitleCompleted]}>
                  {item.title}
                </Text>
                <Text style={styles.itemDesc}>{item.description}</Text>
              </View>
              <Pressable onPress={() => deleteChecklistItem(item.id)} style={styles.deleteItemBtn}>
                <Ionicons name="close" size={16} color={ClayColors.textMuted} />
              </Pressable>
            </Pressable>
          ))}
        </View>
      )}

      {/* TAB 3: SAVED PGS & RULES */}
      {activeTab === 'saved' && (
        <View>
          <Text style={styles.sectionHeading}>Your Saved PGs ({listings.length})</Text>

          {listings.map((pg) => (
            <ClayCard key={pg.id} variant="default" padding={14} radius={ClayRadii.md} style={styles.savedListingItem}>
              <View style={styles.savedListingRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.savedTitle}>{pg.title}</Text>
                  <Text style={styles.savedLoc}>📍 {pg.address}</Text>
                  <Text style={styles.savedCost}>
                    Rent: {formatINR(pg.monthlyRent)} • Deposit: {formatINR(pg.securityDeposit)}
                  </Text>
                </View>
                <ClayButton
                  title="View"
                  variant="secondary"
                  size="sm"
                  onPress={() => {
                    setActiveListing(pg);
                    router.push('/report');
                  }}
                />
              </View>
            </ClayCard>
          ))}

          <Text style={[styles.sectionHeading, { marginTop: 18 }]}>Golden Rules for PG Hunting in India</Text>
          <ClayCard variant="cream" padding={14} radius={ClayRadii.md}>
            <Text style={styles.ruleText}>1. 📸 Take submeter reading photos on the day you move in.</Text>
            <Text style={styles.ruleText}>2. 📝 Always get notice period rules and deposit refund timeline in WhatsApp or on agreement paper.</Text>
            <Text style={styles.ruleText}>3. 🚫 Never transfer full deposit money before visiting the property in person.</Text>
            <Text style={styles.ruleText}>4. 🍽️ Eat one meal in the mess before signing.</Text>
          </ClayCard>
        </View>
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
  topProfileCard: {
    marginBottom: 14,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileName: {
    fontSize: 20,
    fontWeight: '900',
    color: ClayColors.textPrimary,
  },
  profileSubtitle: {
    fontSize: 12,
    color: ClayColors.textMuted,
    marginTop: 2,
  },
  progressContainer: {
    marginTop: 10,
  },
  progressBarBg: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FED7AA',
    overflow: 'hidden',
    width: '90%',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: ClayColors.peachPrimary,
    borderRadius: 4,
  },
  progressLabel: {
    fontSize: 11,
    color: ClayColors.peachDark,
    fontWeight: '700',
    marginTop: 4,
  },
  navTabsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  navTab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 9,
    borderRadius: ClayRadii.pill,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  navTabActive: {
    backgroundColor: ClayColors.buddyPurple,
    borderColor: '#4F46E5',
  },
  navTabText: {
    fontSize: 11,
    fontWeight: '700',
    color: ClayColors.textSecondary,
  },
  navTabTextActive: {
    color: '#FFFFFF',
  },
  budgetMainCard: {
    marginBottom: 12,
  },
  budgetTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  budgetCategoryLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: ClayColors.textSecondary,
    textTransform: 'uppercase',
  },
  recurringTotalNumber: {
    fontSize: 32,
    fontWeight: '900',
    color: ClayColors.buddyPurple,
    marginTop: 2,
  },
  recurringPerMonth: {
    fontSize: 14,
    fontWeight: '600',
    color: ClayColors.textMuted,
  },
  budgetMetricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: ClayRadii.md,
    padding: 10,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  metricBlock: {
    flex: 1,
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: ClayColors.textMuted,
    textTransform: 'uppercase',
  },
  metricVal: {
    fontSize: 14,
    fontWeight: '800',
    color: ClayColors.textPrimary,
    marginTop: 2,
  },
  metricDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#E2E8F0',
  },
  depositNoticeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 8,
    borderRadius: ClayRadii.sm,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  depositNoticeText: {
    fontSize: 11,
    color: ClayColors.textSecondary,
    marginLeft: 6,
    flex: 1,
    lineHeight: 15,
  },
  projectionCard: {
    marginBottom: 12,
  },
  projectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: ClayColors.lavenderDark,
  },
  monthsPillsRow: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: 8,
  },
  monthPill: {
    flex: 1,
    paddingVertical: 6,
    alignItems: 'center',
    borderRadius: ClayRadii.pill,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DDD6FE',
  },
  monthPillActive: {
    backgroundColor: ClayColors.buddyPurple,
    borderColor: '#4F46E5',
  },
  monthPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: ClayColors.textSecondary,
  },
  monthPillTextActive: {
    color: '#FFFFFF',
  },
  projectionFormulaText: {
    fontSize: 12,
    fontWeight: '700',
    color: ClayColors.textPrimary,
    marginTop: 2,
  },
  inputsCard: {
    marginBottom: 14,
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: '800',
    color: ClayColors.textPrimary,
    marginBottom: 4,
  },
  sectionHint: {
    fontSize: 11,
    color: ClayColors.textMuted,
    marginBottom: 12,
  },
  twoColRow: {
    flexDirection: 'row',
    marginBottom: 2,
  },
  formulaExplBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: ClayRadii.sm,
    padding: 10,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  formulaTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: ClayColors.buddyPurple,
    marginBottom: 4,
  },
  formulaBody: {
    fontSize: 11,
    color: ClayColors.textSecondary,
    lineHeight: 15,
  },
  addCard: {
    marginBottom: 14,
  },
  addInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checklistItemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: ClayRadii.lg,
    padding: 12,
    marginBottom: 8,
  },
  checklistItemCompleted: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },
  itemTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: ClayColors.textPrimary,
  },
  itemTitleCompleted: {
    textDecorationLine: 'line-through',
    color: ClayColors.textMuted,
  },
  itemDesc: {
    fontSize: 11,
    color: ClayColors.textMuted,
    marginTop: 1,
  },
  deleteItemBtn: {
    padding: 6,
  },
  savedListingItem: {
    marginBottom: 8,
  },
  savedListingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  savedTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: ClayColors.textPrimary,
  },
  savedLoc: {
    fontSize: 11,
    color: ClayColors.textMuted,
    marginTop: 2,
  },
  savedCost: {
    fontSize: 12,
    fontWeight: '700',
    color: ClayColors.buddyPurple,
    marginTop: 2,
  },
  ruleText: {
    fontSize: 12,
    color: ClayColors.creamDark,
    lineHeight: 18,
    marginVertical: 3,
    fontWeight: '600',
  },
});
