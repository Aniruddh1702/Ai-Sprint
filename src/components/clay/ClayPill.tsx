import React from 'react';
import { Pressable, Text, StyleSheet, View, ViewStyle, TextStyle } from 'react-native';
import { ClayColors, ClayRadii, ClayShadows } from '@/constants/clayTheme';

interface ClayPillProps {
  label: string;
  count?: number | string;
  selected?: boolean;
  onPress?: () => void;
  icon?: React.ReactNode;
  variant?: 'blue' | 'lavender' | 'mint' | 'peach' | 'default';
  style?: ViewStyle;
}

export const ClayPill: React.FC<ClayPillProps> = ({
  label,
  count,
  selected = false,
  onPress,
  icon,
  variant = 'default',
  style,
}) => {
  const getColors = () => {
    if (selected) {
      return {
        bg: ClayColors.buddyPurple,
        border: '#4F46E5',
        text: '#FFFFFF',
        countBg: 'rgba(255, 255, 255, 0.25)',
        countText: '#FFFFFF',
      };
    }
    switch (variant) {
      case 'blue':
        return {
          bg: ClayColors.blueLight,
          border: ClayColors.blueBorder,
          text: ClayColors.blueDark,
          countBg: '#BAE6FD',
          countText: ClayColors.blueDark,
        };
      case 'lavender':
        return {
          bg: ClayColors.lavenderLight,
          border: ClayColors.lavenderBorder,
          text: ClayColors.lavenderDark,
          countBg: '#DDD6FE',
          countText: ClayColors.lavenderDark,
        };
      case 'mint':
        return {
          bg: ClayColors.mintLight,
          border: ClayColors.mintBorder,
          text: ClayColors.mintDark,
          countBg: '#BBF7D0',
          countText: ClayColors.mintDark,
        };
      case 'peach':
        return {
          bg: ClayColors.peachLight,
          border: ClayColors.peachBorder,
          text: ClayColors.peachDark,
          countBg: '#FED7AA',
          countText: ClayColors.peachDark,
        };
      case 'default':
      default:
        return {
          bg: ClayColors.surface,
          border: ClayColors.borderSubtle,
          text: ClayColors.textSecondary,
          countBg: '#F1F5F9',
          countText: ClayColors.textPrimary,
        };
    }
  };

  const colors = getColors();

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={[
        styles.pillContainer,
        ClayShadows.pill,
        {
          backgroundColor: colors.bg,
          borderColor: colors.border,
        },
        style,
      ]}
    >
      <View style={styles.topGlow} pointerEvents="none" />
      <View style={styles.content}>
        {icon && <View style={styles.iconWrapper}>{icon}</View>}
        <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
        {count !== undefined && (
          <View style={[styles.countBadge, { backgroundColor: colors.countBg }]}>
            <Text style={[styles.countText, { color: colors.countText }]}>{count}</Text>
          </View>
        )}
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  pillContainer: {
    borderRadius: ClayRadii.pill,
    borderWidth: 1.5,
    paddingVertical: 7,
    paddingHorizontal: 14,
    alignSelf: 'flex-start',
    position: 'relative',
    overflow: 'hidden',
  },
  topGlow: {
    position: 'absolute',
    top: 1,
    left: 2,
    right: 2,
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconWrapper: {
    marginRight: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
  },
  countBadge: {
    marginLeft: 6,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 10,
  },
  countText: {
    fontSize: 11,
    fontWeight: '700',
  },
});
