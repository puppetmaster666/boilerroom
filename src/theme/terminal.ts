// Terminal theme - 1980s CRT aesthetic

export const colors = {
  // Backgrounds
  background: '#0a0a0a',
  backgroundLight: '#1a1a1a',
  surface: '#141414',

  // Primary colors
  primary: '#00ff41', // Matrix green
  primaryDim: '#00aa2a',

  // Accent colors
  accent: '#ffb000', // Amber/gold
  accentDim: '#996a00',

  // Danger/heat
  danger: '#ff3333',
  dangerDim: '#aa2222',

  // Warning
  warning: '#ffff00',
  warningDim: '#999900',

  // Text
  text: '#00ff41',
  textDim: '#006618',
  textMuted: '#444444',

  // Borders
  border: '#00ff41',
  borderDim: '#004411',

  // Special
  money: '#00ff41',
  heat: '#ff3333',
  trust: '#00aaff',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const fontSize = {
  xs: 10,
  sm: 12,
  md: 14,
  lg: 18,
  xl: 24,
  xxl: 32,
  title: 48,
};

export const fontFamily = {
  // Using the exact font name that's registered
  mono: 'VT323_400Regular',
};

// Common styles
export const commonStyles = {
  // Terminal box
  box: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: spacing.md,
  },

  // Scanline effect (applied as overlay)
  scanlines: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.03,
    pointerEvents: 'none' as const,
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
