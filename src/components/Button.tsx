import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { colors, fontSize, fontFamily, spacing } from '../theme/terminal';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  style?: ViewStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  style,
}) => {
  const buttonStyle = [
    styles.button,
    styles[variant],
    styles[size],
    disabled && styles.disabled,
    style,
  ];

  const textStyle = [
    styles.text,
    styles[`${variant}Text`],
    styles[`${size}Text`],
    disabled && styles.disabledText,
  ];

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <Text style={textStyle}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Variants
  primary: {
    backgroundColor: colors.primaryDim,
    borderColor: colors.primary,
  },
  secondary: {
    backgroundColor: 'transparent',
    borderColor: colors.primary,
  },
  danger: {
    backgroundColor: colors.dangerDim,
    borderColor: colors.danger,
  },
  ghost: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
  },

  // Sizes
  small: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  medium: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  large: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },

  // Text base
  text: {
    fontFamily: fontFamily.mono,
  },

  // Text variants
  primaryText: {
    color: '#ffffff',
  } as TextStyle,
  secondaryText: {
    color: colors.primary,
  } as TextStyle,
  dangerText: {
    color: '#fff',
  } as TextStyle,
  ghostText: {
    color: colors.primary,
  } as TextStyle,

  // Text sizes
  smallText: {
    fontSize: fontSize.sm,
  } as TextStyle,
  mediumText: {
    fontSize: fontSize.md,
  } as TextStyle,
  largeText: {
    fontSize: fontSize.lg,
  } as TextStyle,

  // Disabled
  disabled: {
    opacity: 0.4,
    borderColor: colors.textMuted,
  },
  disabledText: {
    color: colors.textMuted,
  },
});
