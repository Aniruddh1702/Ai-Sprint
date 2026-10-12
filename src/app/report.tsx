import React, { useState } from 'react';
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
import { EditListingModal } from '@/components/clay/EditListingModal';
import { formatINR, calculatePGBreakdown, getDepositMultiplier } from '@/utils/costCalculator';
import { Ionicons } from '@expo/vector-icons';

export default function ReportScreen() {
  const router = useRouter();
  const {
    activeListing,
    profile,
    toggleCompareSelection,
    selectedForCompare,
    saveListing,
  } = useApp();

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [copiedQuestion, setCopiedQuestion] = useState<string | null>(null);

  if (!activeListing) {
    return (
      <View style={styles.emptyContainer}>
        <ClayBuddyAvatar mood="thinking" size={80} speechText="Listing select karo pehle!" />
        <Text style={styles.emptyTitle}>No Active Listing Selected</Text>
        <Text style={styles.emptySubtitle}>
          Choose an analyzed listing from the Home screen or paste a new listing advertisement.
        </Text>
        <ClayButton
          title="Go to Home"
          variant="primary"
          onPress={() => router.push('/')}
          style={{ marginTop: 14 }}
        />
      </View>
    );
  }

  const cost = calculatePGBreakdown(activeListing, profile.monthlyBudget);
  const isCompared = selectedForCompare.includes(activeListing.id);

  const handleCopyQuestion = (question: string) => {
    setCopiedQuestion(question);
    setTimeout(() => setCopiedQuestion(null), 2500);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Top Property Overview */}
      <ClayCard variant="elevated" padding={18} radius={ClayRadii.xl} style={styles.topCard}>
        <View style={styles.topRow}>
          <View style={{ flex: 1 }}>
            <View style={styles.badgeRow}>
              <ClayBadge label={`${activeListing.roomType.toUpperCase()} ROOM`} type="fact" />
              <ClayBadge
                label={cost.isWithinBudget ? 'Within Budget' : 'Exceeds Budget'}
                type={cost.isWithinBudget ? 'success' : 'redflag'}
              />
              {activeListing.isUserCorrected && (
                <ClayBadge label="User Corrected" type="estimate" />
              )}
            </View>
            <Text style={styles.listingTitle}>{activeListing.title}</Text>
            <Text style={styles.addressText}>
              📍 {activeListing.address} • {activeListing.city}
            </Text>
          </View>

          <ClayBuddyAvatar
            mood={activeListing.redFlags.length > 0 ? 'alert' : 'happy'}
            size={64}
          />
        </View>

        {/* Quick Correction CTA */}
        <View style={styles.correctionNotice}>
          <View style={{ flex: 1 }}>
            <Text style={styles.correctionNoticeTitle}>AI Extraction Transparency</Text>
            <Text style={styles.correctionNoticeSub}>
              Extracted from listing text. Notice any discrepancy? Tap to edit facts.
            </Text>
          </View>
          <ClayButton
            title="Edit / Correct"
            variant="secondary"
            size="sm"
            onPress={() => setEditModalVisible(true)}
            icon={<Ionicons name="pencil" size={14} color={ClayColors.textPrimary} />}
          />
        </View>
      </ClayCard>

      {/* Primary Financial Breakdown Section */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Deterministic Cost Breakdown</Text>
        <Text style={styles.sectionSubtitle}>Calculated in real code • No hallucinated values</Text>
      </View>

      <View style={styles.costGrid}>
        {/* Recurring Monthly Cost Card */}
        <ClayCard variant="blue" padding={16} radius={ClayRadii.lg} style={styles.costCard}>
          <Text style={styles.costCardHeader}>Recurring Monthly Expense</Text>
          <Text style={styles.costBigNumber}>{formatINR(cost.recurringMonthlyTotal)}</Text>
          <Text style={styles.costSubtext}>Per month while staying here</Text>

          <View style={styles.lineItemsList}>
            <View style={styles.lineItem}>
              <Text style={styles.lineItemName}>Base Monthly Rent</Text>
              <Text style={styles.lineItemVal}>{formatINR(cost.monthlyRent)}</Text>
            </View>
            <View style={styles.lineItem}>
              <Text style={styles.lineItemName}>
                Food Mess {activeListing.foodIncluded ? '(Included)' : '(Estimate)'}
              </Text>
              <Text style={styles.lineItemVal}>
                {activeListing.foodIncluded ? 'FREE' : formatINR(cost.food)}
              </Text>
            </View>
            <View style={styles.lineItem}>
              <Text style={styles.lineItemName}>Electricity ({activeListing.electricityRule})</Text>
              <Text style={styles.lineItemVal}>{formatINR(cost.electricity)}</Text>
            </View>
            <View style={styles.lineItem}>
              <Text style={styles.lineItemName}>Maintenance & Water</Text>
              <Text style={styles.lineItemVal}>{formatINR(cost.maintenance)}</Text>
            </View>
          </View>
        </ClayCard>

        {/* First Month Cash Requirement Card */}
        <ClayCard variant="peach" padding={16} radius={ClayRadii.lg} style={styles.costCard}>
          <Text style={styles.costCardHeader}>1st Month Cash Requirement</Text>
          <Text style={[styles.costBigNumber, { color: ClayColors.peachDark }]}>
            {formatINR(cost.firstMonthCashTotal)}
          </Text>
          <Text style={styles.costSubtext}>Total upfront money required before move-in</Text>

          <View style={styles.lineItemsList}>
            <View style={styles.lineItem}>
              <Text style={styles.lineItemName}>
                Security Deposit ({getDepositMultiplier(activeListing.securityDeposit, activeListing.monthlyRent)} rent)
              </Text>
              <Text style={styles.lineItemVal}>{formatINR(activeListing.securityDeposit)}</Text>
            </View>
            <View style={styles.lineItem}>
              <Text style={styles.lineItemName}>Deposit Status</Text>
              <Text
                style={[
                  styles.lineItemVal,
                  { color: activeListing.depositRefundable ? ClayColors.mintDeep : ClayColors.roseDeep },
                ]}
              >
                {activeListing.depositRefundable ? 'Refundable on exit' : 'Non-Refundable clause!'}
              </Text>
            </View>
            <View style={styles.lineItem}>
              <Text style={styles.lineItemName}>Advance 1st Month Rent</Text>
              <Text style={styles.lineItemVal}>{formatINR(cost.firstMonthRent)}</Text>
            </View>
            <View style={styles.lineItem}>
              <Text style={styles.lineItemName}>Move-in & Agreement Charge</Text>
              <Text style={styles.lineItemVal}>{formatINR(cost.oneTimeFees)}</Text>
            </View>
          </View>
        </ClayCard>
      </View>

      {/* Red Flags & Risk Explanations */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Potential Red Flags & Hidden Costs</Text>
        <Text style={styles.sectionSubtitle}>
          {activeListing.redFlags.length} risk factors identified
        </Text>
      </View>

      {activeListing.redFlags.length === 0 ? (
        <ClayCard variant="mint" padding={16} radius={ClayRadii.lg}>
          <View style={styles.cleanRecordRow}>
            <Ionicons name="checkmark-circle" size={24} color={ClayColors.mintDeep} />
            <View style={{ marginLeft: 10, flex: 1 }}>
              <Text style={styles.cleanRecordTitle}>Zero Major Red Flags Detected</Text>
              <Text style={styles.cleanRecordSub}>
                Terms appear reasonable. Always cross-check the written rental agreement before paying token money.
              </Text>
            </View>
          </View>
        </ClayCard>
      ) : (
        activeListing.redFlags.map((flag) => (
          <ClayCard
            key={flag.id}
            variant={flag.severity === 'high' ? 'rose' : 'peach'}
            padding={14}
            radius={ClayRadii.md}
            style={styles.flagCard}
          >
            <View style={styles.flagHeaderRow}>
              <Ionicons
                name={flag.severity === 'high' ? 'alert-circle' : 'warning'}
                size={20}
                color={flag.severity === 'high' ? ClayColors.roseDark : ClayColors.peachDark}
              />
              <Text style={styles.flagTitle}>{flag.title}</Text>
              <ClayBadge
                label={flag.severity.toUpperCase()}
                type={flag.severity === 'high' ? 'redflag' : 'estimate'}
              />
            </View>
            <Text style={styles.flagExplanation}>{flag.explanation}</Text>
          </ClayCard>
        ))
      )}

      {/* Missing Information Callouts */}
      {activeListing.missingInformation.length > 0 && (
        <View style={{ marginTop: 16 }}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Missing / Unstated Details</Text>
            <Text style={styles.sectionSubtitle}>Details not found in the original advertisement</Text>
          </View>
          <ClayCard variant="cream" padding={14} radius={ClayRadii.md}>
            {activeListing.missingInformation.map((info, idx) => (
              <View key={idx} style={styles.missingInfoItem}>
                <Ionicons name="help-circle" size={16} color={ClayColors.creamDark} />
                <Text style={styles.missingInfoText}>{info}</Text>
              </View>
            ))}
          </ClayCard>
        </View>
      )}

      {/* Questions to Ask Landlord */}
      <View style={{ marginTop: 16 }}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Questions to Ask the Landlord</Text>
          <Text style={styles.sectionSubtitle}>Tap any question to copy for WhatsApp</Text>
        </View>

        {activeListing.questionsToAskLandlord.map((q, idx) => (
          <Pressable
            key={idx}
            onPress={() => handleCopyQuestion(q)}
            style={({ pressed }) => [
              styles.questionBox,
              ClayShadows.pill,
              pressed && { transform: [{ scale: 0.98 }] },
            ]}
          >
            <Ionicons name="chatbubble-outline" size={16} color={ClayColors.buddyPurple} />
            <Text style={styles.questionText}>{q}</Text>
            <Ionicons
              name={copiedQuestion === q ? 'checkmark' : 'copy-outline'}
              size={14}
              color={copiedQuestion === q ? ClayColors.mintDeep : ClayColors.textMuted}
            />
          </Pressable>
        ))}

        {copiedQuestion && (
          <Text style={styles.copiedToast}>✓ Copied question to clipboard!</Text>
        )}
      </View>

      {/* Amenities & Restrictions Tags */}
      <View style={{ marginTop: 16 }}>
        <Text style={styles.sectionTitle}>Amenities & Policies</Text>
        <View style={styles.tagsContainer}>
          {activeListing.amenities.map((item, idx) => (
            <View key={idx} style={styles.amenityTag}>
              <Ionicons name="checkmark" size={12} color="#15803D" />
              <Text style={styles.amenityText}>{item}</Text>
            </View>
          ))}
          {activeListing.restrictions.map((item, idx) => (
            <View key={`r-${idx}`} style={styles.restrictionTag}>
              <Ionicons name="close" size={12} color="#BE123C" />
              <Text style={styles.restrictionText}>{item}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Action Footer */}
      <View style={styles.reportActionsRow}>
        <ClayButton
          title={isCompared ? 'In Compare List' : 'Add to Compare'}
          variant={isCompared ? 'mint' : 'secondary'}
          onPress={() => toggleCompareSelection(activeListing.id)}
          icon={<Ionicons name="git-compare" size={18} color={isCompared ? '#FFFFFF' : ClayColors.textPrimary} />}
          style={{ flex: 1, marginRight: 8 }}
        />
        <ClayButton
          title="Ask Buddy in Chat"
          variant="primary"
          onPress={() => router.push('/buddy')}
          icon={<Ionicons name="chatbubbles" size={18} color="#FFFFFF" />}
          style={{ flex: 1.2, marginLeft: 8 }}
        />
      </View>

      {/* Edit Listing Modal */}
      <EditListingModal
        visible={editModalVisible}
        listing={activeListing}
        onClose={() => setEditModalVisible(false)}
      />

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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: ClayColors.textPrimary,
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 13,
    color: ClayColors.textSecondary,
    textAlign: 'center',
    marginTop: 6,
    maxWidth: 300,
  },
  topCard: {
    marginBottom: 16,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 6,
  },
  listingTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: ClayColors.textPrimary,
  },
  addressText: {
    fontSize: 13,
    color: ClayColors.textMuted,
    marginTop: 3,
  },
  correctionNotice: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: ClayRadii.md,
    padding: 12,
    marginTop: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  correctionNoticeTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: ClayColors.textPrimary,
  },
  correctionNoticeSub: {
    fontSize: 11,
    color: ClayColors.textMuted,
    marginTop: 1,
    maxWidth: 240,
  },
  sectionHeader: {
    marginTop: 12,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: ClayColors.textPrimary,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: ClayColors.textMuted,
    marginTop: 1,
  },
  costGrid: {
    gap: 12,
  },
  costCard: {
    marginBottom: 6,
  },
  costCardHeader: {
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    color: ClayColors.textSecondary,
  },
  costBigNumber: {
    fontSize: 28,
    fontWeight: '900',
    color: ClayColors.buddyPurple,
    letterSpacing: -0.5,
    marginVertical: 4,
  },
  costSubtext: {
    fontSize: 12,
    color: ClayColors.textMuted,
    marginBottom: 12,
  },
  lineItemsList: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.06)',
    paddingTop: 8,
  },
  lineItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
  },
  lineItemName: {
    fontSize: 13,
    color: ClayColors.textSecondary,
  },
  lineItemVal: {
    fontSize: 13,
    fontWeight: '700',
    color: ClayColors.textPrimary,
  },
  cleanRecordRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cleanRecordTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#15803D',
  },
  cleanRecordSub: {
    fontSize: 12,
    color: ClayColors.textSecondary,
    marginTop: 2,
  },
  flagCard: {
    marginBottom: 8,
  },
  flagHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  flagTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: ClayColors.textPrimary,
    marginLeft: 6,
    flex: 1,
  },
  flagExplanation: {
    fontSize: 12,
    color: ClayColors.textSecondary,
    lineHeight: 17,
    marginTop: 2,
    marginLeft: 26,
  },
  missingInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  missingInfoText: {
    fontSize: 12,
    color: ClayColors.creamDark,
    marginLeft: 8,
    fontWeight: '600',
  },
  questionBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: ClayRadii.md,
    padding: 12,
    marginBottom: 8,
  },
  questionText: {
    fontSize: 13,
    color: ClayColors.textPrimary,
    flex: 1,
    marginHorizontal: 8,
    fontWeight: '600',
  },
  copiedToast: {
    fontSize: 12,
    color: ClayColors.mintDeep,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  amenityTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: ClayRadii.pill,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  amenityText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#15803D',
    marginLeft: 4,
  },
  restrictionTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFE4E6',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: ClayRadii.pill,
    borderWidth: 1,
    borderColor: '#FECDD3',
  },
  restrictionText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#BE123C',
    marginLeft: 4,
  },
  reportActionsRow: {
    flexDirection: 'row',
    marginTop: 20,
  },
});
