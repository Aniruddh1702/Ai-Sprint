import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TextInputProps,
  ViewStyle,
  TextStyle,
  Pressable,
} from 'react-native';
import { ClayColors, ClayRadii, ClayShadows } from '@/constants/clayTheme';

interface ClayInputProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  onRightIconPress?: () => void;
}

export const ClayInput: React.FC<ClayInputProps> = ({
  label,
  error,
  hint,
  containerStyle,
  inputStyle,
  iconLeft,
  iconRight,
  onRightIconPress,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}

      <View
        style={[
          styles.inputWrapper,
          ClayShadows.insetInput,
          isFocused && styles.focusedWrapper,
          error ? styles.errorWrapper : null,
        ]}
      >
        {iconLeft && <View style={styles.iconLeft}>{iconLeft}</View>}

        <TextInput
          style={[styles.input, inputStyle]}
          placeholderTextColor={ClayColors.textMuted}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />

        {iconRight && (
          <Pressable
            onPress={onRightIconPress}
            disabled={!onRightIconPress}
            style={styles.iconRight}
          >
            {iconRight}
          </Pressable>
        )}
      </View>

      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : hint ? (
        <Text style={styles.hintText}>{hint}</Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 6,
    width: '100%',
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: ClayColors.textPrimary,
    marginBottom: 6,
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: ClayRadii.input,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    paddingHorizontal: 14,
    minHeight: 48,
  },
  focusedWrapper: {
    borderColor: ClayColors.buddyPurple,
    backgroundColor: '#FFFFFF',
  },
  errorWrapper: {
    borderColor: ClayColors.danger,
    backgroundColor: '#FFF5F5',
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: ClayColors.textPrimary,
    paddingVertical: 10,
  },
  iconLeft: {
    marginRight: 10,
  },
  iconRight: {
    marginLeft: 8,
  },
  errorText: {
    fontSize: 12,
    color: ClayColors.danger,
    marginTop: 4,
    marginLeft: 6,
    fontWeight: '600',
  },
  hintText: {
    fontSize: 12,
    color: ClayColors.textMuted,
    marginTop: 4,
    marginLeft: 6,
  },
});
