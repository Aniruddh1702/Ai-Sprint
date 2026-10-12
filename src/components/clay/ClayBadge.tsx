import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { ClayColors, ClayRadii } from '@/constants/clayTheme';

export type ClayBadgeType = 'fact' | 'estimate' | 'redflag' | 'verified' | 'neutral' | 'success';

interface ClayBadgeProps {
  label: string;
  type?: ClayBadgeType;
  style?: ViewStyle;
}

export const ClayBadge: React.FC<ClayBadgeProps> = ({
  label,
  type = 'neutral',
  style,
}) => {
  const getBadgeColors = () => {
    switch (type) {
      case 'redflag':
        return {
          bg: ClayColors.roseLight,
          border: ClayColors.roseBorder,
          text: ClayColors.roseDark,
        };
      case 'fact':
        return {
          bg: ClayColors.blueLight,
          border: ClayColors.blueBorder,
          text: ClayColors.blueDark,
        };
      case 'estimate':
        return {
          bg: ClayColors.peachLight,
          border: ClayColors.peachBorder,
          text: ClayColors.peachDark,
        };
      case 'verified':
      case 'success':
        return {
          bg: ClayColors.mintLight,
          border: ClayColors.mintBorder,
          text: ClayColors.mintDark,
        };
      case 'neutral':
      default:
        return {
          bg: '#F1F5F9',
          border: '#E2E8F0',
          text: ClayColors.textSecondary,
        };
    }
  };

  const colors = getBadgeColors();

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: colors.bg,
          borderColor: colors.border,
        },
        style,
      ]}
    >
      <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: ClayRadii.sm,
    borderWidth: 1.2,
    alignSelf: 'flex-start',
    marginRight: 6,
    marginBottom: 4,
  },
  label: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
});
