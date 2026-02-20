// Carnival Vintage palette:
// #b7ded2 (sage green), #f6a6b2 (dusty rose), #f7c297 (peach),
// #ffecb8 (cream yellow), #90d2d8 (cyan blue)

export const Palette = {
  sage: '#b7ded2',
  rose: '#f6a6b2',
  peach: '#f7c297',
  cream: '#ffecb8',
  cyan: '#90d2d8',
  roseDark: '#e0899a',
  cyanDark: '#6bb8c2',
  sageDark: '#8cc5b7',
} as const;

export const Colors = {
  light: {
    primary: '#f6a6b2',
    primaryDark: '#e0899a',
    primaryLight: '#fde8ec',
    accent: '#90d2d8',
    accentLight: '#d4f0f3',
    sage: '#b7ded2',
    peach: '#f7c297',
    cream: '#ffecb8',
    background: '#fef9f0',
    surface: '#FFFFFF',
    card: '#FFFFFF',
    text: '#2d2a26',
    textSecondary: '#6b6560',
    textMuted: '#9e9590',
    border: '#ecddd3',
    error: '#D32F2F',
    tabBar: '#FFFFFF',
    tabBarInactive: '#b5aaa2',
  },
  dark: {
    primary: '#f6a6b2',
    primaryDark: '#e0899a',
    primaryLight: '#3d2028',
    accent: '#90d2d8',
    accentLight: '#1a3235',
    sage: '#8cc5b7',
    peach: '#d4a07a',
    cream: '#c4b487',
    background: '#1a1816',
    surface: '#242120',
    card: '#2e2a28',
    text: '#faf5f0',
    textSecondary: '#b5aaa2',
    textMuted: '#7a716b',
    border: '#3d3835',
    error: '#EF5350',
    tabBar: '#242120',
    tabBarInactive: '#7a716b',
  },
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const FontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 22,
  xxl: 28,
} as const;

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
} as const;
