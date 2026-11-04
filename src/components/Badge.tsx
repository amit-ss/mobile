import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { useAppTheme } from '../context/ThemeContext';

interface BadgeProps {
  label: string;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md';
  style?: ViewStyle;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'primary',
  size = 'md',
  style
}) => {
  const { theme, isDark } = useAppTheme();

  const getColors = () => {
    switch (variant) {
      case 'success':
        return { bg: isDark ? 'rgba(16, 185, 129, 0.2)' : '#DEF7EC', text: '#057A55' };
      case 'warning':
        return { bg: isDark ? 'rgba(245, 158, 11, 0.2)' : '#FEF3C7', text: '#D97706' };
      case 'danger':
        return { bg: isDark ? 'rgba(239, 68, 68, 0.2)' : '#FDE8E8', text: '#E02424' };
      case 'secondary':
        return { bg: isDark ? 'rgba(124, 58, 237, 0.2)' : '#EDE9FE', text: '#7C3AED' };
      case 'info':
        return { bg: isDark ? 'rgba(6, 182, 212, 0.2)' : '#E0F2FE', text: '#0284C7' };
      default:
        return { bg: isDark ? 'rgba(30, 58, 138, 0.3)' : '#EBF5FF', text: '#1E40AF' };
    }
  };

  const colors = getColors();

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: colors.bg,
          paddingHorizontal: size === 'sm' ? 8 : 12,
          paddingVertical: size === 'sm' ? 3 : 5,
        },
        style
      ]}
    >
      <Text
        style={[
          styles.text,
          {
            color: colors.text,
            fontSize: size === 'sm' ? 11 : 12,
          }
        ]}
      >
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    borderRadius: 20,
    alignSelf: 'flex-start',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: '700',
    letterSpacing: 0.2,
  }
});
