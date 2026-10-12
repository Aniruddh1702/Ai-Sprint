import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Switch,
} from 'react-native';
import { PGListing } from '@/types/pg';
import { ClayColors, ClayRadii, ClayShadows } from '@/constants/clayTheme';
import { ClayCard } from './ClayCard';
import { ClayInput } from './ClayInput';
import { ClayButton } from './ClayButton';
import { Ionicons } from '@expo/vector-icons';
import { calculatePGBreakdown, formatINR } from '@/utils/costCalculator';
import { useApp } from '@/context/AppContext';

interface EditListingModalProps {
  visible: boolean;
  listing: PGListing | null;
  onClose: () => void;
}

export const EditListingModal: React.FC<EditListingModalProps> = ({
  visible,
  listing,
  onClose,
}) => {
  const { updateListing, profile } = useApp();

  const [rent, setRent] = useState('');
  const [deposit, setDeposit] = useState('');
  const [foodIncluded, setFoodIncluded] = useState(false);
  const [foodCost, setFoodCost] = useState('');
  const [electricity, setElectricity] = useState('');
  const [electricityRule, setElectricityRule] = useState('');
  const [maintenance, setMaintenance] = useState('');
  const [moveInFee, setMoveInFee] = useState('');
  const [depositRefundable, setDepositRefundable] = useState(true);

  useEffect(() => {
    if (listing) {
      setRent(listing.monthlyRent?.toString() || '0');
      setDeposit(listing.securityDeposit?.toString() || '0');
      setFoodIncluded(Boolean(listing.foodIncluded));
      setFoodCost(listing.foodCostEstimate?.toString() || '0');
      setElectricity(listing.electricityEstimate?.toString() || '0');
      setElectricityRule(listing.electricityRule || '');
      setMaintenance(listing.maintenanceCharges?.toString() || '0');
      setMoveInFee(listing.oneTimeMoveInFee?.toString() || '0');
      setDepositRefundable(Boolean(listing.depositRefundable));
    }
  }, [listing]);

  if (!listing) return null;

  // Live calculation preview while typing!
  const previewListing: Partial<PGListing> = {
    monthlyRent: parseInt(rent, 10) || 0,
    securityDeposit: parseInt(deposit, 10) || 0,
    foodIncluded,
    foodCostEstimate: parseInt(foodCost, 10) || 0,
    electricityEstimate: parseInt(electricity, 10) || 0,
    maintenanceCharges: parseInt(maintenance, 10) || 0,
    oneTimeMoveInFee: parseInt(moveInFee, 10) || 0,
  };

  const previewCost = calculatePGBreakdown(previewListing, profile.monthlyBudget);

  const handleSave = () => {
    updateListing(listing.id, {
      monthlyRent: parseInt(rent, 10) || 0,
      securityDeposit: parseInt(deposit, 10) || 0,
      foodIncluded,
      foodCostEstimate: parseInt(foodCost, 10) || 0,
      electricityEstimate: parseInt(electricity, 10) || 0,
      electricityRule: electricityRule.trim() || listing.electricityRule,
      maintenanceCharges: parseInt(maintenance, 10) || 0,
      oneTimeMoveInFee: parseInt(moveInFee, 10) || 0,
      depositRefundable,
    });
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.modalContainer, ClayShadows.cardElevated]}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Correct AI Extracted Data</Text>
              <Text style={styles.subtitle}>
                You have full control. Correct any AI reading and see recalculations live.
              </Text>
            </View>
            <Pressable onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close-circle" size={26} color={ClayColors.textMuted} />
            </Pressable>
          </View>

          {/* Live Recalculation Bar */}
          <ClayCard variant="lavender" padding={12} radius={ClayRadii.md} style={styles.liveCard}>
            <View style={styles.liveRow}>
              <View>
                <Text style={styles.liveLabel}>Recurring Monthly</Text>
                <Text style={styles.liveValue}>{formatINR(previewCost.recurringMonthlyTotal)}</Text>
              </View>
              <View style={styles.liveDivider} />
              <View>
                <Text style={styles.liveLabel}>1st Month Cash</Text>
                <Text style={styles.liveValue}>{formatINR(previewCost.firstMonthCashTotal)}</Text>
              </View>
              <View style={styles.liveDivider} />
              <View>
                <Text style={styles.liveLabel}>Budget Fit</Text>
                <Text
                  style={[
                    styles.liveValue,
                    { color: previewCost.isWithinBudget ? ClayColors.mintDeep : ClayColors.roseDeep },
                  ]}
                >
                  {previewCost.isWithinBudget ? 'Within Budget' : 'Over Budget'}
                </Text>
              </View>
            </View>
          </ClayCard>

          {/* Form inputs */}
          <ScrollView style={styles.formScroll} showsVerticalScrollIndicator={false}>
            <ClayInput
              label="Monthly Rent (₹)"
              placeholder="e.g. 12000"
              keyboardType="numeric"
              value={rent}
              onChangeText={setRent}
            />

            <ClayInput
              label="Security Deposit (₹)"
              placeholder="e.g. 24000"
              keyboardType="numeric"
              value={deposit}
              onChangeText={setDeposit}
            />

            <View style={styles.switchRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.switchLabel}>Is Security Deposit Refundable?</Text>
                <Text style={styles.switchSubtext}>
                  Watch out if landlord verbally mentions deduction for painting/maintenance.
                </Text>
              </View>
              <Switch
                value={depositRefundable}
                onValueChange={setDepositRefundable}
                trackColor={{ false: '#CBD5E1', true: ClayColors.mintPrimary }}
              />
            </View>

            <View style={styles.switchRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.switchLabel}>Is Food Included in Rent?</Text>
                <Text style={styles.switchSubtext}>
                  Toggling ON sets food expense to ₹0; OFF enables monthly food estimate.
                </Text>
              </View>
              <Switch
                value={foodIncluded}
                onValueChange={setFoodIncluded}
                trackColor={{ false: '#CBD5E1', true: ClayColors.buddyPurple }}
              />
            </View>

            {!foodIncluded && (
              <ClayInput
                label="Estimated Monthly Food Expense (₹)"
                placeholder="e.g. 3500"
                keyboardType="numeric"
                value={foodCost}
                onChangeText={setFoodCost}
                hint="Cost of mess or daily meals outside"
              />
            )}

            <ClayInput
              label="Electricity Monthly Estimate (₹)"
              placeholder="e.g. 800"
              keyboardType="numeric"
              value={electricity}
              onChangeText={setElectricity}
            />

            <ClayInput
              label="Electricity Rule / Rate Note"
              placeholder="e.g. Submeter at ₹10/unit or Included"
              value={electricityRule}
              onChangeText={setElectricityRule}
            />

            <ClayInput
              label="Maintenance & Water Charges (₹)"
              placeholder="e.g. 500"
              keyboardType="numeric"
              value={maintenance}
              onChangeText={setMaintenance}
            />

            <ClayInput
              label="One-Time Move-In / Agreement Fee (₹)"
              placeholder="e.g. 1000"
              keyboardType="numeric"
              value={moveInFee}
              onChangeText={setMoveInFee}
            />

            <View style={{ height: 20 }} />
          </ScrollView>

          {/* Modal Actions */}
          <View style={styles.footer}>
            <ClayButton
              title="Cancel"
              variant="secondary"
              onPress={onClose}
              style={{ flex: 1, marginRight: 8 }}
            />
            <ClayButton
              title="Apply & Recalculate"
              variant="mint"
              onPress={handleSave}
              style={{ flex: 1.5, marginLeft: 8 }}
              icon={<Ionicons name="checkmark-circle" size={18} color="#FFFFFF" />}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: ClayRadii.xl,
    borderTopRightRadius: ClayRadii.xl,
    maxHeight: '90%',
    padding: 20,
    borderTopWidth: 2,
    borderColor: '#E2E8F0',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: ClayColors.textPrimary,
  },
  subtitle: {
    fontSize: 12,
    color: ClayColors.textMuted,
    marginTop: 2,
    maxWidth: 290,
  },
  closeBtn: {
    padding: 4,
  },
  liveCard: {
    marginBottom: 12,
  },
  liveRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  liveLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: ClayColors.textMuted,
    textTransform: 'uppercase',
  },
  liveValue: {
    fontSize: 15,
    fontWeight: '800',
    color: ClayColors.textPrimary,
    marginTop: 2,
  },
  liveDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#CBD5E1',
  },
  formScroll: {
    maxHeight: 380,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  switchLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: ClayColors.textPrimary,
  },
  switchSubtext: {
    fontSize: 11,
    color: ClayColors.textMuted,
    marginTop: 2,
    paddingRight: 12,
  },
  footer: {
    flexDirection: 'row',
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
});
