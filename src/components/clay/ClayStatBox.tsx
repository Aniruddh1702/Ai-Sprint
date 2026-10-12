import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { ClayCard, ClayCardVariant } from './ClayCard';
import { ClayColors, ClayRadii } from '@/constants/clayTheme';

interface ClayStatBoxProps {
  label: string;
  value: string;
  subtext?: string;
  variant?: ClayCardVariant;
  icon?: React.ReactNode;
  style?: ViewStyle;
}

export const ClayStatBox: React.FC<ClayStatBoxProps> = ({
  label,
  value,
  subtext,
  variant = 'default',
  icon,
  style,
}) => {
  return (
    <ClayCard variant={variant} padding={14} radius={ClayRadii.lg} style={[styles.card, style]}>
      <View style={styles.headerRow}>
        <Text style={styles.label}>{label}</Text>
        {icon && <View style={styles.iconBlob}>{icon}</View>}
      </View>
      <Text style={styles.value} numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </Text>
      {subtext && <Text style={styles.subtext}>{subtext}</Text>}
    </ClayCard>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 100,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  label: {
    fontSize: 11,
    fontWeight: '800',
    color: ClayColors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  iconBlob: {
    width: 28,
    height: 28,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.95)',
  },
  iconContainer: {
    opacity: 0.85,
  },
  value: {
    fontSize: 20,
    fontWeight: '800',
    color: ClayColors.textPrimary,
    letterSpacing: -0.5,
  },
  subtext: {
    fontSize: 11,
    color: ClayColors.textMuted,
    marginTop: 2,
    fontWeight: '500',
  },
});
