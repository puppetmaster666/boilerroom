// Terminal theme - Refined Retro (Premium 1987)

export const colors = {
  // Backgrounds - Softer, deep greys instead of pitch black
  background: '#111111',
  backgroundLight: '#1a1a1a',
  surface: '#222222',
  surfaceHighlight: '#2a2a2a',

  // Primary colors - Softer Phosphor Green
  primary: '#33ff77', 
  primaryDim: '#1a803b',
  primaryDark: '#0d401d',

  // Accent colors - Amber/Gold for wealth
  accent: '#ffb000', 
  accentDim: '#996a00',
  accentDark: '#4d3500',

  // Danger/heat
  danger: '#ff4444',
  dangerDim: '#802222',

  // Warning
  warning: '#ffdd00',
  warningDim: '#806e00',

  // Text - High readability
  text: '#e0e0e0', // Off-white for main text
  textDim: '#a0a0a0',
  textMuted: '#666666',
  textInverse: '#111111',

  // Borders
  border: '#333333',
  borderActive: '#33ff77',
  borderDim: '#222222',

  // Special
  money: '#33ff77',
  heat: '#ff4444',
  trust: '#00ccff',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const fontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  title: 40,
};

export const fontFamily = {
  // Keeping the pixel font for flavor, but we might want to mix in a clean sans for body if needed.
  // For now, we stick to the requested retro feel but rely on size/color for readability.
  mono: 'VT323_400Regular', 
};

// Common styles
export const commonStyles = {
  // Premium Card
  box: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    // Shadow for depth
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },

  // Interactive Card (Button-like)
  interactiveBox: {
    backgroundColor: colors.surfaceHighlight,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.borderActive,
    padding: spacing.md,
  },

  // No scanlines - cleaner look
  scanlines: {
    display: 'none' as const,
  },
  
  // Text Shadows for "Glow" effect (use sparingly)
  glow: {
    textShadowColor: 'rgba(51, 255, 119, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
};

// Heat level colors
export const getHeatColor = (heat: number): string => {
  if (heat < 25) return colors.primary;
  if (heat < 50) return colors.warning;
  if (heat < 75) return colors.accent;
  return colors.danger;
};

// Format money
export const formatMoney = (amount: number): string => {
  if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(2)}M`;
  }
  if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(1)}K`;
  }
  return `$${amount.toFixed(0)}`;
};

// Format percentage
export const formatPercent = (value: number): string => {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${(value * 100).toFixed(1)}%`;
};

// Format stock price
export const formatPrice = (price: number): string => {
  return `$${price.toFixed(2)}`;
};
