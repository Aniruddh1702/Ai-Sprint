import React from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { ClayColors, ClayRadii, ClayShadows } from '@/constants/clayTheme';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '@/context/AppContext';

export interface TabItem {
  name: string;
  label: string;
  path: string;
  icon: keyof typeof Ionicons.glyphMap;
  badge?: number | string;
}

export const ClayTabBar: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { scamAlerts } = useApp();

  const officialScamsCount = scamAlerts.filter((s) => s.verificationStatus === 'official_advisory').length;

  const tabs: TabItem[] = [
    { name: 'home', label: 'Home', path: '/', icon: 'home-sharp' },
    { name: 'analyze', label: 'Analyze', path: '/analyze', icon: 'scan-sharp' },
    {
      name: 'scams',
      label: 'Scams',
      path: '/scams',
      icon: 'warning-sharp',
      badge: officialScamsCount > 0 ? officialScamsCount : undefined,
    },
    { name: 'food', label: 'Food', path: '/food', icon: 'restaurant-sharp' },
    { name: 'transport', label: 'Transport', path: '/transport', icon: 'bus-sharp' },
    { name: 'buddy', label: 'Buddy', path: '/buddy', icon: 'chatbubble-ellipses-sharp' },
    { name: 'plan', label: 'Plan', path: '/plan', icon: 'wallet-sharp' },
  ];

  return (
    <View style={styles.tabBarWrapper}>
      <View style={[styles.tabBarContainer, ClayShadows.cardElevated]}>
        {/* Soft upper clay highlight line */}
        <View style={styles.innerGlow} pointerEvents="none" />

        <View style={styles.tabsRow}>
          {tabs.map((tab) => {
            const isSelected =
              tab.path === '/'
                ? pathname === '/' || pathname === '/index'
                : pathname === tab.path || pathname.startsWith(`${tab.path}/`);

            return (
              <Pressable
                key={tab.name}
                onPress={() => router.push(tab.path as any)}
                style={({ pressed }) => [
                  styles.tabButton,
                  isSelected && styles.tabButtonActive,
                  pressed && styles.tabButtonPressed,
                ]}
              >
                <View style={styles.iconContainer}>
                  <Ionicons
                    name={tab.icon}
                    size={18}
                    color={isSelected ? '#FFFFFF' : ClayColors.textMuted}
                  />
                  {tab.badge !== undefined && (
                    <View
                      style={[
                        styles.badge,
                        {
                          backgroundColor: isSelected ? '#FDE047' : ClayColors.rosePrimary,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.badgeText,
                          { color: isSelected ? '#1E1B4B' : '#FFFFFF' },
                        ]}
                      >
                        {tab.badge}
                      </Text>
                    </View>
                  )}
                </View>
                <Text
                  style={[
                    styles.tabLabel,
                    isSelected ? styles.tabLabelActive : styles.tabLabelInactive,
                  ]}
                  numberOfLines={1}
                >
                  {tab.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  tabBarWrapper: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 20 : 10,
    left: 8,
    right: 8,
    alignItems: 'center',
    zIndex: 999,
  },
  tabBarContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: ClayRadii.xl,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    paddingVertical: 5,
    paddingHorizontal: 6,
    width: '100%',
    maxWidth: 640,
    position: 'relative',
    overflow: 'hidden',
  },
  innerGlow: {
    position: 'absolute',
    top: 1,
    left: 4,
    right: 4,
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  tabsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 5,
    borderRadius: ClayRadii.md,
  },
  tabButtonActive: {
    backgroundColor: ClayColors.buddyPurple,
  },
  tabButtonPressed: {
    transform: [{ scale: 0.95 }],
  },
  iconContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    fontSize: 9,
    marginTop: 2,
    fontWeight: '700',
  },
  tabLabelActive: {
    color: '#FFFFFF',
  },
  tabLabelInactive: {
    color: ClayColors.textMuted,
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: -10,
    borderRadius: 10,
    minWidth: 15,
    height: 15,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  badgeText: {
    fontSize: 8,
    fontWeight: '900',
  },
});
