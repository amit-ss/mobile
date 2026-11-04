import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAppTheme } from '../context/ThemeContext';

interface CircularProgressProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  subtitle?: string;
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
  percentage,
  size = 120,
  strokeWidth = 10,
  subtitle = "Attendance"
}) => {
  const { theme, isDark } = useAppTheme();

  const getColor = () => {
    if (percentage >= 80) return theme.colors.success;
    if (percentage >= 75) return theme.colors.warning;
    return theme.colors.danger;
  };

  const color = getColor();
  const radius = size / 2;
  const innerSize = size - strokeWidth * 2;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <View
        style={[
          styles.outerRing,
          {
            width: size,
            height: size,
            borderRadius: radius,
            borderColor: isDark ? '#1E293B' : '#E2E8F0',
            borderWidth: strokeWidth,
            borderTopColor: color,
            borderRightColor: percentage > 50 ? color : isDark ? '#1E293B' : '#E2E8F0',
            borderBottomColor: percentage > 75 ? color : isDark ? '#1E293B' : '#E2E8F0',
            borderLeftColor: percentage > 25 ? color : isDark ? '#1E293B' : '#E2E8F0',
          }
        ]}
      />
      <View
        style={[
          styles.innerCircle,
          {
            width: innerSize,
            height: innerSize,
            borderRadius: innerSize / 2,
            backgroundColor: theme.colors.surface,
          }
        ]}
      >
        <Text style={[styles.percentageText, { color: theme.colors.text }]}>
          {percentage.toFixed(1)}%
        </Text>
        {subtitle && (
          <Text style={[styles.subtitleText, { color: theme.colors.textSecondary }]}>
            {subtitle}
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  outerRing: {
    position: 'absolute',
  },
  innerCircle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  percentageText: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  subtitleText: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  }
});
