import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types';
import { useAppTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { storageService } from '../../services/storage';

export const SplashScreen: React.FC = () => {
  const { theme, isDark } = useAppTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { isAuthenticated, isLoading } = useAuth();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.85)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 900,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        tension: 40,
        useNativeDriver: true,
      })
    ]).start();

    const timer = setTimeout(async () => {
      const hasSeenOnboarding = await storageService.getItem('has_seen_onboarding');
      if (isAuthenticated) {
        navigation.replace('Main');
      } else if (!hasSeenOnboarding) {
        navigation.replace('Onboarding');
      } else {
        navigation.replace('Auth');
      }
    }, 2200);

    return () => clearTimeout(timer);
  }, [isAuthenticated, isLoading]);

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#0B0F19' : '#1E3A8A' }]}>
      <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
        <View style={styles.logoBadge}>
          <Ionicons name="school" size={54} color="#FFFFFF" />
          <View style={styles.sparkleBadge}>
            <Ionicons name="sparkles" size={20} color="#7C3AED" />
          </View>
        </View>

        <Text style={styles.appName}>CampusGPT</Text>
        <Text style={styles.tagline}>Your Smart LPU Campus Companion</Text>

        <View style={styles.badgeRow}>
          <View style={styles.pill}>
            <Text style={styles.pillText}>AI Powered</Text>
          </View>
          <View style={[styles.pill, { backgroundColor: 'rgba(124, 58, 237, 0.35)' }]}>
            <Text style={styles.pillText}>LPU Verified</Text>
          </View>
        </View>
      </Animated.View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Lovely Professional University, Punjab</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
  },
  logoBadge: {
    width: 104,
    height: 104,
    borderRadius: 30,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  sparkleBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 4,
    elevation: 4,
  },
  appName: {
    fontSize: 36,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 15,
    color: '#E0E7FF',
    marginTop: 8,
    fontWeight: '500',
  },
  badgeRow: {
    flexDirection: 'row',
    marginTop: 24,
    gap: 8,
  },
  pill: {
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  pillText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  footer: {
    position: 'absolute',
    bottom: 40,
  },
  footerText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 12,
    fontWeight: '500',
  }
});
