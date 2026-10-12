import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Modal,
  Platform,
} from 'react-native';
import { ClayColors, ClayRadii, ClayShadows } from '@/constants/clayTheme';
import { useApp } from '@/context/AppContext';
import { formatINR } from '@/utils/costCalculator';
import { Ionicons } from '@expo/vector-icons';
import { ClayInput } from './ClayInput';
import { ClayButton } from './ClayButton';
import { ClayCard } from './ClayCard';

export const ClayHeader: React.FC = () => {
  const { profile, updateProfile, backendStatus } = useApp();
  const [modalVisible, setModalVisible] = useState(false);
  const [tempCity, setTempCity] = useState(profile.city);
  const [tempBudget, setTempBudget] = useState(profile.monthlyBudget.toString());

  const handleSavePreferences = () => {
    const budgetNum = parseInt(tempBudget, 10);
    updateProfile({
      city: tempCity.trim() || 'Bengaluru',
      monthlyBudget: !isNaN(budgetNum) && budgetNum > 0 ? budgetNum : profile.monthlyBudget,
    });
    setModalVisible(false);
  };

  return (
    <View style={styles.headerContainer}>
      <View style={styles.topRow}>
        <View style={styles.brandContainer}>
          <View style={styles.brandIconBlob}>
            <Text style={styles.brandIconText}>🏠</Text>
          </View>
          <View>
            <View style={styles.titleRow}>
              <Text style={styles.brandTitle}>PG Proof</Text>
              <View
                style={[
                  styles.aiPill,
                  {
                    backgroundColor: backendStatus.aiConfigured
                      ? '#DCFCE7'
                      : '#FEF9C3',
                    borderColor: backendStatus.aiConfigured
                      ? '#86EFAC'
                      : '#FDE047',
                  },
                ]}
              >
                <View
                  style={[
                    styles.aiDot,
                    {
                      backgroundColor: backendStatus.aiConfigured
                        ? '#16A34A'
                        : '#CA8A04',
                    },
                  ]}
                />
                <Text
                  style={[
                    styles.aiText,
                    {
                      color: backendStatus.aiConfigured
                        ? '#15803D'
                        : '#854D0E',
                    },
                  ]}
                >
                  {backendStatus.aiConfigured ? 'Live AI' : 'Smart Fallback'}
                </Text>
              </View>
            </View>
            <Text style={styles.tagline}>Check. Compare. Choose.</Text>
          </View>
        </View>

        <Pressable
          onPress={() => {
            setTempCity(profile.city);
            setTempBudget(profile.monthlyBudget.toString());
            setModalVisible(true);
          }}
          style={({ pressed }) => [
            styles.prefPill,
            ClayShadows.pill,
            pressed && { transform: [{ scale: 0.96 }] },
          ]}
        >
          <Ionicons name="location-sharp" size={14} color={ClayColors.buddyPurple} />
          <Text style={styles.cityText}>{profile.city}</Text>
          <View style={styles.divider} />
          <Text style={styles.budgetText}>{formatINR(profile.monthlyBudget)}</Text>
          <Ionicons name="pencil" size={12} color={ClayColors.textMuted} style={{ marginLeft: 3 }} />
        </Pressable>
      </View>

      {/* Preference Edit Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <ClayCard variant="default" padding={20} radius={ClayRadii.xl} style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Update Your Student Profile</Text>
              <Pressable onPress={() => setModalVisible(false)} style={styles.closeBtn}>
                <Ionicons name="close-circle" size={24} color={ClayColors.textMuted} />
              </Pressable>
            </View>

            <Text style={styles.modalDesc}>
              Personalize your city and monthly rent budget. PG Proof uses this to tailor red-flag warnings and recommendations.
            </Text>

            <ClayInput
              label="Target City"
              placeholder="e.g. Indore, Bengaluru, Pune, Delhi NCR"
              value={tempCity}
              onChangeText={setTempCity}
              iconLeft={<Ionicons name="business" size={18} color={ClayColors.buddyPurple} />}
            />

            <View style={[styles.presetRow, { marginTop: -4, marginBottom: 12 }]}>
              {['Indore', 'Bengaluru', 'Pune', 'Delhi NCR', 'Mumbai'].map((city) => (
                <Pressable
                  key={city}
                  onPress={() => setTempCity(city)}
                  style={[
                    styles.presetPill,
                    tempCity.toLowerCase() === city.toLowerCase() && styles.presetPillActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.presetText,
                      tempCity.toLowerCase() === city.toLowerCase() && styles.presetTextActive,
                    ]}
                  >
                    📍 {city}
                  </Text>
                </Pressable>
              ))}
            </View>

            <ClayInput
              label="Monthly Accommodation Budget (₹)"
              placeholder="e.g. 15000"
              keyboardType="numeric"
              value={tempBudget}
              onChangeText={setTempBudget}
              iconLeft={<Ionicons name="wallet" size={18} color={ClayColors.buddyPurple} />}
            />

            <View style={styles.presetRow}>
              {[10000, 15000, 20000, 25000].map((amount) => (
                <Pressable
                  key={amount}
                  onPress={() => setTempBudget(amount.toString())}
                  style={[
                    styles.presetPill,
                    tempBudget === amount.toString() && styles.presetPillActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.presetText,
                      tempBudget === amount.toString() && styles.presetTextActive,
                    ]}
                  >
                    {formatINR(amount)}
                  </Text>
                </Pressable>
              ))}
            </View>

            <View style={styles.modalActions}>
              <ClayButton
                title="Cancel"
                variant="secondary"
                onPress={() => setModalVisible(false)}
                style={{ flex: 1, marginRight: 8 }}
              />
              <ClayButton
                title="Save Profile"
                variant="primary"
                onPress={handleSavePreferences}
                style={{ flex: 1, marginLeft: 8 }}
              />
            </View>
          </ClayCard>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 3,
    borderBottomColor: '#E2E8F0',
    paddingTop: Platform.OS === 'ios' ? 48 : 16,
    paddingBottom: 14,
    paddingHorizontal: 16,
    zIndex: 100,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    maxWidth: 960,
    alignSelf: 'center',
    width: '100%',
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandIconBlob: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: '#EEF2FF',
    borderWidth: 2,
    borderBottomWidth: 3.5,
    borderColor: '#C7D2FE',
    borderBottomColor: '#A5B4FC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  brandIconText: {
    fontSize: 20,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#1E1B4B',
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 11,
    color: ClayColors.textMuted,
    fontWeight: '600',
  },
  aiPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: ClayRadii.pill,
    borderWidth: 1.5,
    marginLeft: 8,
  },
  aiDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  aiText: {
    fontSize: 10,
    fontWeight: '800',
  },
  prefPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 2,
    borderBottomWidth: 3.5,
    borderColor: '#E2E8F0',
    borderBottomColor: '#CBD5E1',
    borderRadius: ClayRadii.pill,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  cityText: {
    fontSize: 12,
    fontWeight: '700',
    color: ClayColors.textPrimary,
    marginLeft: 4,
  },
  divider: {
    width: 1,
    height: 12,
    backgroundColor: '#CBD5E1',
    marginHorizontal: 6,
  },
  budgetText: {
    fontSize: 12,
    fontWeight: '800',
    color: ClayColors.buddyPurple,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 440,
    backgroundColor: '#FFFFFF',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: ClayColors.textPrimary,
  },
  closeBtn: {
    padding: 2,
  },
  modalDesc: {
    fontSize: 13,
    color: ClayColors.textSecondary,
    marginVertical: 10,
    lineHeight: 18,
  },
  presetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 8,
  },
  presetPill: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: ClayRadii.pill,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  presetPillActive: {
    backgroundColor: '#EEF2FF',
    borderColor: ClayColors.buddyPurple,
  },
  presetText: {
    fontSize: 12,
    fontWeight: '700',
    color: ClayColors.textSecondary,
  },
  presetTextActive: {
    color: ClayColors.buddyPurple,
  },
  modalActions: {
    flexDirection: 'row',
    marginTop: 16,
  },
});
