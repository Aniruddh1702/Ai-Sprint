import React, { useRef } from 'react';
import {
  Pressable,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  Animated,
  ActivityIndicator,
  View,
} from 'react-native';
import { ClayColors, ClayRadii, ClayShadows } from '@/constants/clayTheme';

export type ClayButtonVariant =
  | 'primary'
  | 'secondary'
  | 'mint'
  | 'peach'
  | 'lavender'
  | 'outline'
  | 'danger';

export type ClayButtonSize = 'sm' | 'md' | 'lg';

interface ClayButtonProps {
  title: string;
  onPress: () => void;
  variant?: ClayButtonVariant;
  size?: ClayButtonSize;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
}

export const ClayButton: React.FC<ClayButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  loading = false,
  disabled = false,
  style,
  textStyle,
  fullWidth = false,
}) => {
  const animatedScale = useRef(new Animated.Value(1)).current;
  const animatedTranslateY = useRef(new Animated.Value(0)).current;

  const handlePressIn = () => {
    Animated.parallel([
      Animated.timing(animatedScale, {
        toValue: 0.97,
        duration: 90,
        useNativeDriver: true,
      }),
      Animated.timing(animatedTranslateY, {
        toValue: 2,
        duration: 90,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePressOut = () => {
    Animated.parallel([
      Animated.spring(animatedScale, {
        toValue: 1,
        friction: 5,
        tension: 80,
        useNativeDriver: true,
      }),
      Animated.spring(animatedTranslateY, {
        toValue: 0,
        friction: 5,
        tension: 80,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const getVariantStyles = (): { button: ViewStyle; text: TextStyle; highlight: string } => {
    switch (variant) {
      case 'secondary':
        return {
          button: {
            backgroundColor: ClayColors.surface,
            borderColor: ClayColors.borderSubtle,
            borderBottomColor: ClayColors.borderDark,
            borderBottomWidth: 3,
          },
          text: { color: ClayColors.textPrimary },
          highlight: 'rgba(255, 255, 255, 0.9)',
        };
      case 'mint':
        return {
          button: {
            backgroundColor: ClayColors.mintPrimary,
            borderColor: ClayColors.mintDark,
            borderBottomColor: '#14532D',
            borderBottomWidth: 3,
          },
          text: { color: '#FFFFFF' },
          highlight: 'rgba(255, 255, 255, 0.4)',
        };
      case 'peach':
        return {
          button: {
            backgroundColor: ClayColors.peachPrimary,
            borderColor: ClayColors.peachDark,
            borderBottomColor: '#9A3412',
            borderBottomWidth: 3,
          },
          text: { color: '#FFFFFF' },
          highlight: 'rgba(255, 255, 255, 0.4)',
        };
      case 'lavender':
        return {
          button: {
            backgroundColor: ClayColors.lavenderPrimary,
            borderColor: ClayColors.lavenderDark,
            borderBottomColor: '#4C1D95',
            borderBottomWidth: 3,
          },
          text: { color: '#FFFFFF' },
          highlight: 'rgba(255, 255, 255, 0.4)',
        };
      case 'danger':
        return {
          button: {
            backgroundColor: ClayColors.danger,
            borderColor: '#DC2626',
            borderBottomColor: '#991B1B',
            borderBottomWidth: 3,
          },
          text: { color: '#FFFFFF' },
          highlight: 'rgba(255, 255, 255, 0.35)',
        };
      case 'outline':
        return {
          button: {
            backgroundColor: 'transparent',
            borderColor: ClayColors.borderDark,
            borderWidth: 1.5,
          },
          text: { color: ClayColors.textPrimary },
          highlight: 'transparent',
        };
      case 'primary':
      default:
        return {
          button: {
            backgroundColor: ClayColors.buddyPurple,
            borderColor: '#4F46E5',
            borderBottomColor: '#3730A3',
            borderBottomWidth: 3.5,
          },
          text: { color: '#FFFFFF' },
          highlight: 'rgba(255, 255, 255, 0.38)',
        };
    }
  };

  const getSizeStyles = (): { paddingVertical: number; paddingHorizontal: number; fontSize: number } => {
    switch (size) {
      case 'sm':
        return { paddingVertical: 8, paddingHorizontal: 14, fontSize: 13 };
      case 'lg':
        return { paddingVertical: 16, paddingHorizontal: 24, fontSize: 16 };
      case 'md':
      default:
        return { paddingVertical: 12, paddingHorizontal: 20, fontSize: 14 };
    }
  };

  const currentVariant = getVariantStyles();
  const currentSize = getSizeStyles();

  return (
    <Animated.View
      style={[
        fullWidth && { width: '100%' },
        {
          transform: [
            { scale: animatedScale },
            { translateY: animatedTranslateY },
          ],
        },
      ]}
    >
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        style={[
          styles.baseButton,
          ClayShadows.button,
          currentVariant.button,
          {
            paddingVertical: currentSize.paddingVertical,
            paddingHorizontal: currentSize.paddingHorizontal,
            opacity: disabled ? 0.55 : 1,
          },
          fullWidth && { width: '100%', alignItems: 'center' },
          style,
        ]}
      >
        {/* Soft 3D bevel top highlight */}
        <View
          style={[
            styles.bevelHighlight,
            { backgroundColor: currentVariant.highlight },
          ]}
          pointerEvents="none"
        />

        <View style={styles.contentRow}>
          {loading ? (
            <ActivityIndicator
              size="small"
              color={currentVariant.text.color || '#FFFFFF'}
              style={{ marginRight: 8 }}
            />
          ) : (
            icon && iconPosition === 'left' && <View style={styles.iconLeft}>{icon}</View>
          )}

          <Text
            style={[
              styles.baseText,
              currentVariant.text,
              { fontSize: currentSize.fontSize },
              textStyle,
            ]}
          >
            {title}
          </Text>

          {!loading && icon && iconPosition === 'right' && (
            <View style={styles.iconRight}>{icon}</View>
          )}
        </View>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  baseButton: {
    borderRadius: ClayRadii.button,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  bevelHighlight: {
    position: 'absolute',
    top: 1,
    left: 4,
    right: 4,
    height: 3,
    borderRadius: 8,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  baseText: {
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },
});
