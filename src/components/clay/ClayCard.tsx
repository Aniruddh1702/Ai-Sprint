import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { ClayColors, ClayRadii, ClayShadows } from '@/constants/clayTheme';

export type ClayCardVariant = 'default' | 'blue' | 'lavender' | 'mint' | 'peach' | 'cream' | 'rose' | 'elevated';

interface ClayCardProps {
  children: React.ReactNode;
  variant?: ClayCardVariant;
  style?: StyleProp<ViewStyle>;
  padding?: number;
  radius?: number;
}

export const ClayCard: React.FC<ClayCardProps> = ({
  children,
  variant = 'default',
  style,
  padding = 18,
  radius = ClayRadii.lg,
}) => {
  const getVariantStyles = (): ViewStyle => {
    switch (variant) {
      case 'blue':
        return {
          backgroundColor: '#F0F9FF',
          borderColor: '#BAE6FD',
          borderBottomColor: '#7DD3FC',
          borderBottomWidth: 3.5,
        };
      case 'lavender':
        return {
          backgroundColor: '#F5F3FF',
          borderColor: '#DDD6FE',
          borderBottomColor: '#C4B5FD',
          borderBottomWidth: 3.5,
        };
      case 'mint':
        return {
          backgroundColor: '#F0FDF4',
          borderColor: '#BBF7D0',
          borderBottomColor: '#86EFAC',
          borderBottomWidth: 3.5,
        };
      case 'peach':
        return {
          backgroundColor: '#FFF7ED',
          borderColor: '#FED7AA',
          borderBottomColor: '#FDBA74',
          borderBottomWidth: 3.5,
        };
      case 'cream':
        return {
          backgroundColor: '#FEFCE8',
          borderColor: '#FEF08A',
          borderBottomColor: '#FDE047',
          borderBottomWidth: 3.5,
        };
      case 'rose':
        return {
          backgroundColor: '#FFF1F2',
          borderColor: '#FECDD3',
          borderBottomColor: '#FDA4AF',
          borderBottomWidth: 3.5,
        };
      case 'elevated':
        return {
          backgroundColor: '#FFFFFF',
          borderColor: '#E0E7FF',
          borderBottomColor: '#C7D2FE',
          borderBottomWidth: 4,
        };
      case 'default':
      default:
        return {
          backgroundColor: '#FFFFFF',
          borderColor: '#E2E8F0',
          borderBottomColor: '#CBD5E1',
          borderBottomWidth: 3.5,
        };
    }
  };

  const shadowStyle = variant === 'elevated' ? ClayShadows.cardElevated : ClayShadows.card;

  return (
    <View
      style={[
        styles.baseCard,
        shadowStyle,
        getVariantStyles(),
        {
          padding,
          borderRadius: radius,
        },
        style,
      ]}
    >
      {/* Top subtle gloss sheen simulating soft clay surface reflection */}
      <View
        style={[
          styles.innerHighlight,
          {
            borderRadius: Math.max(0, radius - 2),
          },
        ]}
        pointerEvents="none"
      />
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  baseCard: {
    borderWidth: 2,
    position: 'relative',
    overflow: 'hidden',
  },
  innerHighlight: {
    position: 'absolute',
    top: 1,
    left: 2,
    right: 2,
    height: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    zIndex: 1,
  },
});
