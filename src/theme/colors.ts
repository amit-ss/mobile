export const LightTheme = {
  dark: false,
  colors: {
    primary: '#1E3A8A',       // LPU Royal Navy Blue
    primaryLight: '#3B82F6',  // Bright Blue
    secondary: '#7C3AED',     // Royal Purple Accent
    secondaryLight: '#A78BFA',
    accent: '#06B6D4',        // Cyan
    background: '#F8FAFC',    // Cool Canvas White
    surface: '#FFFFFF',       // Card Surface
    surfaceVariant: '#F1F5F9',// Light Grayish
    border: '#E2E8F0',
    text: '#0F172A',          // Deep Slate Text
    textSecondary: '#64748B', // Subdued Gray
    textMuted: '#94A3B8',
    white: '#FFFFFF',
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',
    cardShadow: 'rgba(15, 23, 42, 0.08)',
    overlay: 'rgba(15, 23, 42, 0.6)',
  }
};

export const DarkTheme = {
  dark: true,
  colors: {
    primary: '#3B82F6',       // Vibrant Blue
    primaryLight: '#60A5FA',
    secondary: '#8B5CF6',     // Bright Purple
    secondaryLight: '#C4B5FD',
    accent: '#22D3EE',
    background: '#0B0F19',    // Deep Midnight Black
    surface: '#151D2F',       // Elevated Card Dark
    surfaceVariant: '#1E293B',// Slate Card Dark
    border: '#2A364F',
    text: '#F8FAFC',          // Crisp White Text
    textSecondary: '#94A3B8', // Subdued Slate
    textMuted: '#64748B',
    white: '#FFFFFF',
    success: '#34D399',
    warning: '#FBBF24',
    danger: '#F87171',
    cardShadow: 'rgba(0, 0, 0, 0.4)',
    overlay: 'rgba(0, 0, 0, 0.8)',
  }
};

export type ThemeType = typeof LightTheme;
