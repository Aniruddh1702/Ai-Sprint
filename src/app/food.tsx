import React, { useState } from 'react';
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
import { ClayButton } from '@/components/clay/ClayButton';
import { ClayBadge } from '@/components/clay/ClayBadge';
import { ClayInput } from '@/components/clay/ClayInput';
import { ClayBuddyAvatar } from '@/components/clay/ClayBuddyAvatar';
import { SAMPLE_TIFFIN_SERVICES, SAMPLE_STUDENT_RESTAURANTS } from '@/constants/foodData';
import { TiffinService, RestaurantPlace } from '@/types/studentCompanion';
import { formatINR } from '@/utils/costCalculator';
import { Ionicons } from '@expo/vector-icons';

type FoodSectionType = 'both' | 'tiffin' | 'restaurants';

export default function FoodTiffinScreen() {
  const router = useRouter();
  const { profile, activeFoodPlan, setActiveFoodPlan, sendChatMessage } = useApp();

  const [sectionType, setSectionType] = useState<FoodSectionType>('both');
  const [selectedCity, setSelectedCity] = useState<string>(profile.city || 'Indore');
  const [vegOnly, setVegOnly] = useState(false);
  const [jainOnly, setJainOnly] = useState(false);
  const [maxMonthlyBudget, setMaxMonthlyBudget] = useState('4000');
  const [searchQuery, setSearchQuery] = useState('');

  // Sync selectedCity when profile.city changes
  React.useEffect(() => {
    if (profile.city) {
      setSelectedCity(profile.city);
    }
  }, [profile.city]);

  // Tiffin services filtered
  const filteredTiffins = SAMPLE_TIFFIN_SERVICES.filter((item) => {
    const matchesCity = item.city.toLowerCase().includes(selectedCity.toLowerCase());
    const matchesVeg = !vegOnly || item.isVeg;
    const matchesJain = !jainOnly || item.hasJainOption;
    const maxBudgetNum = parseInt(maxMonthlyBudget, 10) || 5000;
    const matchesBudget = item.monthlyPrice <= maxBudgetNum;
    const matchesSearch =
      !searchQuery.trim() ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.area.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.cuisineStyle.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCity && matchesVeg && matchesJain && matchesBudget && matchesSearch;
  });

  // Restaurants filtered
  const filteredRestaurants = SAMPLE_STUDENT_RESTAURANTS.filter((item) => {
    const matchesCity = item.city.toLowerCase().includes(selectedCity.toLowerCase());
    const matchesVeg = !vegOnly || item.foodType === 'pure_veg';
    const matchesSearch =
      !searchQuery.trim() ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.area.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.cuisine.some((c) => c.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCity && matchesVeg && matchesSearch;
  });

  const handleDial = (phone: string) => {
    Linking.openURL(`tel:${phone}`).catch((err) => console.warn('Cannot dial:', err));
  };

  const handleAskBuddyAboutFood = (question: string) => {
    sendChatMessage(question);
    router.push('/buddy');
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Top Banner */}
      <ClayCard variant="mint" padding={18} radius={ClayRadii.xl} style={styles.headerCard}>
        <View style={styles.headerRow}>
          <View style={{ flex: 1, paddingRight: 8 }}>
            <View style={styles.headerTagPill}>
              <Text style={styles.headerTagText}>🥗 Verified Student Meal Hub</Text>
            </View>
            <Text style={styles.headerTitle}>Food & Tiffin Discovery</Text>
            <Text style={styles.headerSubtitle}>
              Find affordable homestyle dabbas, mess subscriptions, and student pocket-friendly food spots near your PG.
            </Text>
          </View>
          <ClayBuddyAvatar mood="happy" size={62} speechText="Ghar jaisa khana!" />
        </View>

        {/* Selected Plan Cost Preview */}
        {activeFoodPlan && (
          <View style={styles.activePlanBanner}>
            <View style={{ flex: 1 }}>
              <Text style={styles.activePlanLabel}>Your Selected Monthly Tiffin Plan:</Text>
              <Text style={styles.activePlanName}>{activeFoodPlan.name}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.activePlanPrice}>{formatINR(activeFoodPlan.monthlyPrice)}/mo</Text>
              <Text style={styles.activePlanSlot}>Lunch + Dinner</Text>
            </View>
          </View>
        )}
      </ClayCard>

      {/* Section Mode Switcher */}
      <View style={styles.sectionModeRow}>
        <Pressable
          onPress={() => setSectionType('both')}
          style={[styles.sectionModeBtn, sectionType === 'both' && styles.sectionModeBtnActive]}
        >
          <Text style={[styles.sectionModeText, sectionType === 'both' && styles.sectionModeTextActive]}>
            All Food Options
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setSectionType('tiffin')}
          style={[styles.sectionModeBtn, sectionType === 'tiffin' && styles.sectionModeBtnActive]}
        >
          <Text style={[styles.sectionModeText, sectionType === 'tiffin' && styles.sectionModeTextActive]}>
            🍱 Tiffin / Dabba
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setSectionType('restaurants')}
          style={[styles.sectionModeBtn, sectionType === 'restaurants' && styles.sectionModeBtnActive]}
        >
          <Text style={[styles.sectionModeText, sectionType === 'restaurants' && styles.sectionModeTextActive]}>
            🍲 Food Outlets
          </Text>
        </Pressable>
      </View>

      {/* City Switcher */}
      <View style={styles.cityPillsRow}>
        {Array.from(new Set(['Indore', profile.city || 'Indore', 'Bengaluru', 'Pune', 'Delhi NCR'])).map((city) => (
          <Pressable
            key={city}
            onPress={() => setSelectedCity(city)}
            style={[styles.cityPill, selectedCity.toLowerCase() === city.toLowerCase() && styles.cityPillActive]}
          >
            <Text style={[styles.cityPillText, selectedCity.toLowerCase() === city.toLowerCase() && styles.cityPillTextActive]}>
              📍 {city}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Dietary Filters & Search */}
      <View style={styles.filtersBar}>
        <ClayInput
          placeholder="Search by area, dish, or provider name..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          iconLeft={<Ionicons name="search" size={18} color={ClayColors.textMuted} />}
          containerStyle={{ marginVertical: 0, flex: 1 }}
        />

        <View style={styles.dietPillsRow}>
          <Pressable
            onPress={() => setVegOnly(!vegOnly)}
            style={[styles.dietPill, vegOnly && styles.dietPillActive]}
          >
            <Text style={[styles.dietPillText, vegOnly && styles.dietPillTextActive]}>
              🌱 Pure Veg Only
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setJainOnly(!jainOnly)}
            style={[styles.dietPill, jainOnly && styles.dietPillActive]}
          >
            <Text style={[styles.dietPillText, jainOnly && styles.dietPillTextActive]}>
              Jain Available
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Smart Food Assistant Prompts Card */}
      <ClayCard variant="lavender" padding={14} radius={ClayRadii.lg} style={styles.foodAiCard}>
        <View style={styles.foodAiRow}>
          <Ionicons name="sparkles" size={18} color={ClayColors.buddyPurple} />
          <Text style={styles.foodAiTitle}>Ask Buddy About Food Planning</Text>
        </View>
        <View style={styles.promptButtonsRow}>
          {[
            'Mere ₹3,000 monthly food budget mein kya options hain?',
            'Affordable veg tiffin near Koramangala',
            'Is monthly tiffin cheaper than Swiggy/Zomato daily?',
          ].map((prompt, idx) => (
            <Pressable
              key={idx}
              onPress={() => handleAskBuddyAboutFood(prompt)}
              style={({ pressed }) => [
                styles.foodPromptPill,
                pressed && { opacity: 0.7 },
              ]}
            >
              <Text style={styles.foodPromptText}>"{prompt}"</Text>
            </Pressable>
          ))}
        </View>
      </ClayCard>

      {/* A. Tiffin Services Section */}
      {(sectionType === 'both' || sectionType === 'tiffin') && (
        <View style={{ marginTop: 12 }}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Tiffin & Dabba Services ({filteredTiffins.length})</Text>
            <Text style={styles.sectionSubtitle}>Homestyle monthly meal subscriptions</Text>
          </View>

          {filteredTiffins.map((tiffin) => {
            const isSelected = activeFoodPlan?.id === tiffin.id;

            return (
              <ClayCard
                key={tiffin.id}
                variant={isSelected ? 'mint' : 'default'}
                padding={16}
                radius={ClayRadii.lg}
                style={styles.foodItemCard}
              >
                <View style={styles.foodTopRow}>
                  <View style={{ flex: 1 }}>
                    <View style={styles.badgeRow}>
                      <ClayBadge label={tiffin.isVeg ? 'PURE VEG' : 'NON-VEG DAYS'} type={tiffin.isVeg ? 'verified' : 'estimate'} />
                      <ClayBadge label={`📍 ${tiffin.distanceKm} km`} type="fact" />
                      {tiffin.trialMealAvailable && (
                        <ClayBadge label={`Trial Meal: ₹${tiffin.trialMealPrice}`} type="neutral" />
                      )}
                    </View>
                    <Text style={styles.foodName}>{tiffin.name}</Text>
                    <Text style={styles.foodArea}>📍 {tiffin.area} • {tiffin.city}</Text>
                  </View>

                  <View style={styles.priceContainer}>
                    <Text style={styles.priceMonthly}>{formatINR(tiffin.monthlyPrice)}</Text>
                    <Text style={styles.pricePerMeal}>~₹{tiffin.pricePerMeal}/meal</Text>
                  </View>
                </View>

                {/* Cuisine & Subscription Details */}
                <Text style={styles.cuisineText}>🍛 {tiffin.cuisineStyle}</Text>
                <Text style={styles.policyText}>ℹ️ {tiffin.subscriptionPolicy}</Text>

                {/* Action buttons */}
                <View style={styles.foodActionsRow}>
                  <Pressable
                    onPress={() => setActiveFoodPlan(isSelected ? null : tiffin)}
                    style={[
                      styles.selectPlanBtn,
                      isSelected && styles.selectPlanBtnActive,
                    ]}
                  >
                    <Ionicons
                      name={isSelected ? 'checkmark-circle' : 'add-circle-outline'}
                      size={16}
                      color={isSelected ? '#15803D' : ClayColors.buddyPurple}
                    />
                    <Text
                      style={[
                        styles.selectPlanText,
                        isSelected && { color: '#15803D', fontWeight: '800' },
                      ]}
                    >
                      {isSelected ? 'Selected in Budget' : 'Add to Monthly Budget'}
                    </Text>
                  </Pressable>

                  <Pressable
                    onPress={() => handleDial(tiffin.contactNumber)}
                    style={styles.callBtn}
                  >
                    <Ionicons name="call" size={14} color="#FFFFFF" />
                    <Text style={styles.callBtnText}>Call Provider</Text>
                  </Pressable>
                </View>

                <Text style={styles.freshnessTag}>Freshness: {tiffin.freshnessDate}</Text>
              </ClayCard>
            );
          })}
        </View>
      )}

      {/* B. Restaurants & Food Outlets Section */}
      {(sectionType === 'both' || sectionType === 'restaurants') && (
        <View style={{ marginTop: 14 }}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Budget Outlets & Quick Bites ({filteredRestaurants.length})</Text>
            <Text style={styles.sectionSubtitle}>Verified student rates & dine-in spots</Text>
          </View>

          {filteredRestaurants.map((rest) => (
            <ClayCard
              key={rest.id}
              variant="default"
              padding={16}
              radius={ClayRadii.lg}
              style={styles.foodItemCard}
            >
              <View style={styles.foodTopRow}>
                <View style={{ flex: 1 }}>
                  <View style={styles.badgeRow}>
                    <ClayBadge label={rest.foodType === 'pure_veg' ? 'PURE VEG' : 'NON-VEG'} type="fact" />
                    <ClayBadge label={`★ ${rest.rating}`} type="verified" />
                    <ClayBadge label={`📍 ${rest.distanceKm} km`} type="neutral" />
                  </View>
                  <Text style={styles.foodName}>{rest.name}</Text>
                  <Text style={styles.foodArea}>📍 {rest.area} • Open {rest.openingHours}</Text>
                </View>

                <View style={styles.priceContainer}>
                  <Text style={styles.priceMonthly}>~₹{rest.priceForOne}</Text>
                  <Text style={styles.pricePerMeal}>avg per person</Text>
                </View>
              </View>

              {/* Popular student items */}
              <View style={styles.menuHighlightsBox}>
                <Text style={styles.menuHighlightsTitle}>Popular Student Items:</Text>
                {rest.popularItems.map((item, idx) => (
                  <View key={idx} style={styles.menuItemRow}>
                    <Text style={styles.menuItemName}>• {item.name}</Text>
                    <Text style={styles.menuItemPrice}>{formatINR(item.price)}</Text>
                  </View>
                ))}
              </View>

              {/* Ordering link if available */}
              {rest.orderUrl && (
                <View style={styles.foodActionsRow}>
                  <Pressable
                    onPress={() => Linking.openURL(rest.orderUrl!)}
                    style={styles.orderLinkBtn}
                  >
                    <Ionicons name="open-outline" size={14} color={ClayColors.buddyPurple} />
                    <Text style={styles.orderLinkText}>View on Delivery App</Text>
                  </Pressable>
                </View>
              )}
            </ClayCard>
          ))}
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
  headerCard: {
    marginBottom: 14,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTagPill: {
    backgroundColor: '#DCFCE7',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: ClayRadii.pill,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  headerTagText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#15803D',
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
  activePlanBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: ClayRadii.md,
    padding: 10,
    marginTop: 12,
    borderWidth: 1.5,
    borderColor: '#BBF7D0',
  },
  activePlanLabel: {
    fontSize: 10,
    color: ClayColors.textMuted,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  activePlanName: {
    fontSize: 13,
    fontWeight: '800',
    color: ClayColors.textPrimary,
  },
  activePlanPrice: {
    fontSize: 15,
    fontWeight: '900',
    color: '#15803D',
  },
  activePlanSlot: {
    fontSize: 10,
    color: ClayColors.textMuted,
  },
  sectionModeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  sectionModeBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: ClayRadii.pill,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  sectionModeBtnActive: {
    backgroundColor: ClayColors.buddyPurple,
    borderColor: '#4F46E5',
  },
  sectionModeText: {
    fontSize: 11,
    fontWeight: '700',
    color: ClayColors.textSecondary,
  },
  sectionModeTextActive: {
    color: '#FFFFFF',
  },
  cityPillsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  cityPill: {
    flex: 1,
    paddingVertical: 7,
    alignItems: 'center',
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
    fontSize: 12,
    fontWeight: '700',
    color: ClayColors.textSecondary,
  },
  cityPillTextActive: {
    color: ClayColors.buddyPurple,
  },
  filtersBar: {
    marginBottom: 10,
  },
  dietPillsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  dietPill: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: ClayRadii.pill,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
  },
  dietPillActive: {
    backgroundColor: '#DCFCE7',
    borderColor: '#86EFAC',
  },
  dietPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: ClayColors.textSecondary,
  },
  dietPillTextActive: {
    color: '#15803D',
  },
  foodAiCard: {
    marginBottom: 12,
  },
  foodAiRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  foodAiTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: ClayColors.buddyPurple,
    marginLeft: 6,
  },
  promptButtonsRow: {
    gap: 6,
  },
  foodPromptPill: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: ClayRadii.md,
    borderWidth: 1,
    borderColor: '#DDD6FE',
  },
  foodPromptText: {
    fontSize: 11,
    color: ClayColors.textPrimary,
    fontWeight: '600',
  },
  sectionHeaderRow: {
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: ClayColors.textPrimary,
  },
  sectionSubtitle: {
    fontSize: 11,
    color: ClayColors.textMuted,
  },
  foodItemCard: {
    marginBottom: 12,
  },
  foodTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginBottom: 4,
  },
  foodName: {
    fontSize: 16,
    fontWeight: '800',
    color: ClayColors.textPrimary,
  },
  foodArea: {
    fontSize: 11,
    color: ClayColors.textMuted,
    marginTop: 1,
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  priceMonthly: {
    fontSize: 18,
    fontWeight: '900',
    color: ClayColors.buddyPurple,
  },
  pricePerMeal: {
    fontSize: 10,
    color: ClayColors.textMuted,
  },
  cuisineText: {
    fontSize: 12,
    color: ClayColors.textSecondary,
    fontWeight: '600',
    marginTop: 6,
  },
  policyText: {
    fontSize: 11,
    color: ClayColors.textMuted,
    marginTop: 3,
  },
  menuHighlightsBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: ClayRadii.sm,
    padding: 8,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  menuHighlightsTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: ClayColors.textSecondary,
    marginBottom: 4,
  },
  menuItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 1,
  },
  menuItemName: {
    fontSize: 12,
    color: ClayColors.textPrimary,
  },
  menuItemPrice: {
    fontSize: 12,
    fontWeight: '700',
    color: ClayColors.textSecondary,
  },
  foodActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  selectPlanBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: ClayRadii.pill,
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  selectPlanBtnActive: {
    backgroundColor: '#DCFCE7',
    borderColor: '#86EFAC',
  },
  selectPlanText: {
    fontSize: 12,
    fontWeight: '700',
    color: ClayColors.buddyPurple,
    marginLeft: 6,
  },
  callBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ClayColors.buddyPurple,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: ClayRadii.pill,
  },
  callBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
    marginLeft: 4,
  },
  orderLinkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  orderLinkText: {
    fontSize: 11,
    color: ClayColors.buddyPurple,
    fontWeight: '700',
    marginLeft: 4,
  },
  freshnessTag: {
    fontSize: 10,
    color: ClayColors.textMuted,
    marginTop: 6,
    textAlign: 'right',
  },
});
