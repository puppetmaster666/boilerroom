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
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    // Tactile feel
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
  },

  // Variants
  primary: {
    backgroundColor: colors.primaryDim,
    borderColor: colors.primary,
  },
  secondary: {
    backgroundColor: colors.surfaceHighlight,
    borderColor: colors.borderActive,
  },
  danger: {
    backgroundColor: colors.dangerDim,
    borderColor: colors.danger,
  },
  ghost: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
    elevation: 0,
  },

  // Sizes
  small: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    minWidth: 80,
  },
  medium: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    minWidth: 120,
  },
  large: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    minWidth: 160,
  },

  // Text base
  text: {
    fontFamily: fontFamily.mono,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  // Text variants
  primaryText: {
    color: '#ffffff',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  } as TextStyle,
  secondaryText: {
    color: colors.primary,
  } as TextStyle,
  dangerText: {
    color: '#fff',
  } as TextStyle,
  ghostText: {
    color: colors.textDim,
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
    opacity: 0.5,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    elevation: 0,
  },
  disabledText: {
    color: colors.textMuted,
  },
});
