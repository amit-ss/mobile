import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types';
import { useAppTheme } from '../../context/ThemeContext';
import { Button } from '../../components/Button';
import { Ionicons } from '@expo/vector-icons';
import { storageService } from '../../services/storage';

const { width } = Dimensions.get('window');

const slides = [
  {
    icon: 'chatbubbles' as const,
    badge: 'AI Assistant',
    title: 'Ask Anything About LPU',
    description: 'Instant verified answers powered by Gemini RAG. Academics, fee deadlines, hostel curfews, exams, and campus facilities.'
  },
  {
    icon: 'calculator' as const,
    badge: 'Academics & Attendance',
    title: 'Timetable & 75% Predictor',
    description: 'Daily schedules, conflict detection, and smart calculators for the classes you need or can miss to stay safe.'
  },
  {
    icon: 'rocket' as const,
    badge: 'Placement & Studies',
    title: 'Career & Study Assistant',
    description: 'Upload PDF notes for AI summaries, interactive quizzes, flashcards, resume review, and placement interview roadmaps.'
  }
];

export const OnboardingScreen: React.FC = () => {
  const { theme, isDark } = useAppTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleFinish = async () => {
    await storageService.setItem('has_seen_onboarding', 'true');
    navigation.replace('Auth');
  };

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      handleFinish();
    }
  };

  const slide = slides[currentIndex];

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.topBar}>
        <View style={[styles.badge, { backgroundColor: theme.colors.primaryLight + '20' }]}>
          <Text style={[styles.badgeText, { color: theme.colors.primary }]}>{slide.badge}</Text>
        </View>
        <TouchableOpacity onPress={handleFinish} activeOpacity={0.7}>
          <Text style={[styles.skipText, { color: theme.colors.textSecondary }]}>Skip</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={[styles.iconContainer, { backgroundColor: theme.colors.primary + '15' }]}>
          <Ionicons name={slide.icon} size={70} color={theme.colors.primary} />
        </View>

        <Text style={[styles.title, { color: theme.colors.text }]}>{slide.title}</Text>
        <Text style={[styles.description, { color: theme.colors.textSecondary }]}>{slide.description}</Text>
      </View>

      <View style={styles.bottomBar}>
        <View style={styles.dots}>
          {slides.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                {
                  backgroundColor: i === currentIndex ? theme.colors.primary : theme.colors.border,
                  width: i === currentIndex ? 28 : 8,
                }
              ]}
            />
          ))}
        </View>

        <Button
          title={currentIndex === slides.length - 1 ? 'Get Started' : 'Next'}
          onPress={handleNext}
          variant="primary"
          size="lg"
          style={{ width: '100%', marginTop: 20 }}
          icon={currentIndex === slides.length - 1 ? 'arrow-forward' : undefined}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 54,
    paddingBottom: 40,
    justifyContent: 'space-between',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  skipText: {
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  iconContainer: {
    width: 150,
    height: 150,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 36,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  description: {
    fontSize: 15,
    lineHeight: 23,
    textAlign: 'center',
    marginTop: 14,
  },
  bottomBar: {
    alignItems: 'center',
  },
  dots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  }
});
