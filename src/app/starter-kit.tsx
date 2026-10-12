import React, { useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  Pressable,
  Linking,
} from 'react-native';
import { useApp } from '@/context/AppContext';
import { ClayColors, ClayRadii, ClayShadows } from '@/constants/clayTheme';
import { ClayCard } from '@/components/clay/ClayCard';
import { ClayBadge } from '@/components/clay/ClayBadge';
import { ClayBuddyAvatar } from '@/components/clay/ClayBuddyAvatar';
import {
  STARTER_KIT_CATEGORIES,
  CITY_ESSENTIAL_SERVICES,
  ONBOARDING_STARTER_CHECKLIST,
} from '@/constants/starterKitData';
import { StarterKitCategory } from '@/types/studentCompanion';
import { Ionicons } from '@expo/vector-icons';

export default function StarterKitScreen() {
  const {
    profile,
    starterChecklistStatus,
    toggleStarterChecklistItem,
  } = useApp();

  const [selectedCity, setSelectedCity] = useState<string>(profile.city || 'Indore');
  const [selectedCategory, setSelectedCategory] = useState<StarterKitCategory | 'all'>('all');

  // Sync selectedCity when profile.city changes
  React.useEffect(() => {
    if (profile.city) {
      setSelectedCity(profile.city);
    }
  }, [profile.city]);

  const filteredServices = CITY_ESSENTIAL_SERVICES.filter((item) => {
    const matchesCity =
      selectedCity === 'All Cities' ||
      item.city === 'All Cities' ||
      item.city.toLowerCase().includes(selectedCity.toLowerCase()) ||
      selectedCity.toLowerCase().includes(item.city.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesCity && matchesCategory;
  });

  const handleCall = (phone?: string) => {
    if (!phone) return;
    Linking.openURL(`tel:${phone}`).catch((err) => console.warn('Cannot dial:', err));
  };

  const handleMapSearch = (query?: string, address?: string) => {
    const target = query || address;
    if (!target) return;
    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(target)}`).catch((err) =>
      console.warn('Cannot open maps:', err)
    );
  };

  const completedChecklistCount = ONBOARDING_STARTER_CHECKLIST.filter(
    (item) => starterChecklistStatus[item.id]
  ).length;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Top Banner */}
      <ClayCard variant="peach" padding={18} radius={ClayRadii.xl} style={styles.headerCard}>
        <View style={styles.headerRow}>
          <View style={{ flex: 1, paddingRight: 8 }}>
            <View style={styles.headerPill}>
              <Text style={styles.headerPillText}>📍 Student City Orientation</Text>
            </View>
            <Text style={styles.headerTitle}>City Starter Kit</Text>
            <Text style={styles.headerSubtitle}>
              Essential emergency numbers, nearby hospitals, 24x7 pharmacies, SIM card stores, and print shops.
            </Text>
          </View>
          <ClayBuddyAvatar mood="happy" size={62} speechText="Settle in easily!" />
        </View>

        {/* Onboarding Checklist Progress Bar */}
        <View style={styles.progressBox}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>New City Settle-In Checklist</Text>
            <Text style={styles.progressCount}>
              {completedChecklistCount}/{ONBOARDING_STARTER_CHECKLIST.length} Done
            </Text>
          </View>
          <View style={styles.progressBarBg}>
            <View
              style={[
                styles.progressBarFill,
                {
                  width: `${(completedChecklistCount / ONBOARDING_STARTER_CHECKLIST.length) * 100}%`,
                },
              ]}
            />
          </View>
        </View>
      </ClayCard>

      {/* Onboarding Checklist Items */}
      <ClayCard variant="default" padding={14} radius={ClayRadii.lg} style={styles.checklistCard}>
        <Text style={styles.cardSectionHeading}>Essential First-Week Tasks:</Text>
        {ONBOARDING_STARTER_CHECKLIST.map((item) => {
          const isDone = Boolean(starterChecklistStatus[item.id]);

          return (
            <Pressable
              key={item.id}
              onPress={() => toggleStarterChecklistItem(item.id)}
              style={({ pressed }) => [
                styles.checklistItem,
                isDone && styles.checklistItemDone,
                pressed && { opacity: 0.8 },
              ]}
            >
              <Ionicons
                name={isDone ? 'checkmark-circle' : 'ellipse-outline'}
                size={22}
                color={isDone ? ClayColors.mintDeep : ClayColors.textMuted}
              />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={[styles.itemTitle, isDone && styles.itemTitleDone]}>
                  {item.title}
                </Text>
                <Text style={styles.itemDesc}>{item.desc}</Text>
              </View>
            </Pressable>
          );
        })}
      </ClayCard>

      {/* City Switcher */}
      <View style={styles.cityPillsRow}>
        {Array.from(new Set(['Indore', profile.city || 'Indore', 'Bengaluru', 'Pune', 'Delhi NCR', 'All Cities'])).map((city) => (
          <Pressable
            key={city}
            onPress={() => setSelectedCity(city)}
            style={[styles.cityPill, selectedCity.toLowerCase() === city.toLowerCase() && styles.cityPillActive]}
          >
            <Text style={[styles.cityPillText, selectedCity.toLowerCase() === city.toLowerCase() && styles.cityPillTextActive]}>
              {city === 'All Cities' ? '🌐 All Cities' : `📍 ${city}`}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Category Filter Pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryScroll}
      >
        <Pressable
          onPress={() => setSelectedCategory('all')}
          style={[styles.categoryPill, selectedCategory === 'all' && styles.categoryPillActive]}
        >
          <Text style={[styles.categoryPillText, selectedCategory === 'all' && styles.categoryPillTextActive]}>
            All Categories
          </Text>
        </Pressable>

        {STARTER_KIT_CATEGORIES.map((cat) => (
          <Pressable
            key={cat.id}
            onPress={() => setSelectedCategory(cat.id)}
            style={[styles.categoryPill, selectedCategory === cat.id && styles.categoryPillActive]}
          >
            <Text style={[styles.categoryPillText, selectedCategory === cat.id && styles.categoryPillTextActive]}>
              {cat.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Essential Services List */}
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>Essential Directory ({filteredServices.length})</Text>
        <Text style={styles.sectionSub}>Around student hub in {selectedCity}</Text>
      </View>

      {filteredServices.map((service) => (
        <ClayCard
          key={service.id}
          variant={service.category === 'emergency' ? 'rose' : 'default'}
          padding={14}
          radius={ClayRadii.lg}
          style={styles.serviceCard}
        >
          <View style={styles.serviceTopRow}>
            <View style={{ flex: 1 }}>
              <View style={styles.badgeRow}>
                <ClayBadge label={service.category.toUpperCase()} type={service.category === 'emergency' ? 'redflag' : 'fact'} />
                {service.isVerified && <ClayBadge label="VERIFIED" type="verified" />}
                <ClayBadge label={`📍 ${service.distanceKm} km`} type="neutral" />
              </View>
              <Text style={styles.serviceName}>{service.name}</Text>
              <Text style={styles.serviceAddress}>{service.address}</Text>
            </View>
          </View>

          <Text style={styles.timingsText}>🕒 {service.timings}</Text>

          {/* Action buttons */}
          <View style={styles.serviceActionsRow}>
            {service.phone && (
              <Pressable onPress={() => handleCall(service.phone)} style={styles.actionBtnCall}>
                <Ionicons name="call" size={14} color="#FFFFFF" />
                <Text style={styles.actionBtnCallText}>Call {service.phone}</Text>
              </Pressable>
            )}

            <Pressable
              onPress={() => handleMapSearch(service.googleMapsQuery, service.address)}
              style={styles.actionBtnMap}
            >
              <Ionicons name="map-outline" size={14} color={ClayColors.buddyPurple} />
              <Text style={styles.actionBtnMapText}>Directions</Text>
            </Pressable>
          </View>
        </ClayCard>
      ))}

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
    backgroundColor: '#FFEDD5',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: ClayRadii.pill,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  headerPillText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#C2410C',
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
  progressBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: ClayRadii.md,
    padding: 10,
    marginTop: 12,
    borderWidth: 1.5,
    borderColor: '#FED7AA',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  progressTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: ClayColors.textPrimary,
  },
  progressCount: {
    fontSize: 11,
    fontWeight: '800',
    color: ClayColors.peachDark,
  },
  progressBarBg: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#F1F5F9',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: ClayColors.peachPrimary,
    borderRadius: 4,
  },
  checklistCard: {
    marginBottom: 14,
  },
  cardSectionHeading: {
    fontSize: 13,
    fontWeight: '800',
    color: ClayColors.textPrimary,
    marginBottom: 8,
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  checklistItemDone: {
    opacity: 0.65,
  },
  itemTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: ClayColors.textPrimary,
  },
  itemTitleDone: {
    textDecorationLine: 'line-through',
    color: ClayColors.textMuted,
  },
  itemDesc: {
    fontSize: 11,
    color: ClayColors.textMuted,
    marginTop: 1,
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
  categoryScroll: {
    gap: 8,
    paddingVertical: 4,
    marginBottom: 12,
  },
  categoryPill: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: ClayRadii.pill,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  categoryPillActive: {
    backgroundColor: '#EEF2FF',
    borderColor: ClayColors.buddyPurple,
  },
  categoryPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: ClayColors.textSecondary,
  },
  categoryPillTextActive: {
    color: ClayColors.buddyPurple,
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
  serviceCard: {
    marginBottom: 10,
  },
  serviceTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginBottom: 4,
  },
  serviceName: {
    fontSize: 15,
    fontWeight: '800',
    color: ClayColors.textPrimary,
  },
  serviceAddress: {
    fontSize: 11,
    color: ClayColors.textMuted,
    marginTop: 2,
  },
  timingsText: {
    fontSize: 11,
    color: ClayColors.textSecondary,
    fontWeight: '600',
    marginTop: 6,
  },
  serviceActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
  },
  actionBtnCall: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ClayColors.buddyPurple,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: ClayRadii.pill,
  },
  actionBtnCallText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
    marginLeft: 4,
  },
  actionBtnMap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: ClayRadii.pill,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  actionBtnMapText: {
    fontSize: 11,
    fontWeight: '700',
    color: ClayColors.buddyPurple,
    marginLeft: 4,
  },
});
