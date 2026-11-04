import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Alert
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppTheme } from '../../context/ThemeContext';
import { Flashcard } from '../../types';
import { api } from '../../services/api';
import { Header } from '../../components/Header';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { Ionicons } from '@expo/vector-icons';

export const FlashcardsScreen: React.FC = () => {
  const { theme, isDark } = useAppTheme();
  const navigation = useNavigation();

  const [cards, setCards] = useState<Flashcard[]>([
    { id: 1, front: "Deadlock Prevention Conditions", back: "Violate at least one of 4 Coffman conditions: Mutual Exclusion, Hold & Wait, No Preemption, Circular Wait.", is_mastered: false },
    { id: 2, front: "Time Complexity of Binary Search", back: "O(log n) because the search space divides by half on each iteration.", is_mastered: true },
    { id: 3, front: "Belady's Anomaly", back: "In FIFO page replacement, increasing page frames can paradoxically increase page faults.", is_mastered: false },
    { id: 4, front: "CAP Theorem", back: "Distributed systems can guarantee at most 2 out of 3: Consistency, Availability, Partition Tolerance.", is_mastered: false },
    { id: 5, front: "Translation Lookaside Buffer (TLB)", back: "High-speed hardware associative cache used to reduce virtual address translation latency.", is_mastered: true },
  ]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const currentCard = cards[currentIndex];
  const masteredCount = cards.filter((c) => c.is_mastered).length;

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleNext = () => {
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    } else {
      Alert.alert('Deck Completed', `Great revision! You mastered ${masteredCount} of ${cards.length} cards.`);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsFlipped(false);
    }
  };

  const toggleMastered = () => {
    setCards((prev) =>
      prev.map((c, i) =>
        i === currentIndex ? { ...c, is_mastered: !c.is_mastered } : c
      )
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Header
        title="Revision Flashcards"
        subtitle={`Card ${currentIndex + 1} of ${cards.length}`}
        showBack
        onBack={() => navigation.goBack()}
      />

      <View style={styles.content}>
        {/* Progress Bar */}
        <View style={styles.topStats}>
          <Badge label={`${masteredCount} Mastered`} variant="success" size="sm" />
          <Badge label={`${cards.length - masteredCount} To Review`} variant="warning" size="sm" />
        </View>

        {/* Flippable Card Container */}
        <TouchableOpacity
          activeOpacity={0.92}
          onPress={handleFlip}
          style={[
            styles.flashcard,
            {
              backgroundColor: isFlipped ? (isDark ? '#1E293B' : '#F5F3FF') : theme.colors.surface,
              borderColor: isFlipped ? theme.colors.secondary : theme.colors.border,
            }
          ]}
        >
          <View style={styles.cardIndicatorRow}>
            <Badge
              label={isFlipped ? "ANSWER / EXPLANATION" : "QUESTION / CONCEPT"}
              variant={isFlipped ? "secondary" : "primary"}
              size="sm"
            />
            <TouchableOpacity onPress={toggleMastered}>
              <Ionicons
                name={currentCard?.is_mastered ? "checkmark-circle" : "checkmark-circle-outline"}
                size={24}
                color={currentCard?.is_mastered ? theme.colors.success : theme.colors.textMuted}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.cardCenter}>
            <Text
              style={[
                styles.cardText,
                {
                  color: isFlipped ? (isDark ? '#FFFFFF' : '#4C1D95') : theme.colors.text,
                  fontSize: isFlipped ? 16 : 20,
                  lineHeight: isFlipped ? 26 : 28,
                  fontWeight: isFlipped ? '600' : '800'
                }
              ]}
            >
              {isFlipped ? currentCard?.back : currentCard?.front}
            </Text>
          </View>

          <View style={styles.cardFooter}>
            <Ionicons name="swap-horizontal" size={16} color={theme.colors.textSecondary} />
            <Text style={[styles.tapFlipText, { color: theme.colors.textSecondary }]}>
              Tap anywhere to flip card
            </Text>
          </View>
        </TouchableOpacity>

        {/* Bottom Navigation Buttons */}
        <View style={styles.navRow}>
          <Button
            title="Previous"
            onPress={handlePrev}
            disabled={currentIndex === 0}
            variant="outline"
            icon="arrow-back"
            style={{ flex: 1, marginRight: 10 }}
          />

          <Button
            title={currentIndex === cards.length - 1 ? "Finish Deck" : "Next Card"}
            onPress={handleNext}
            variant="primary"
            icon={currentIndex === cards.length - 1 ? "checkmark-done" : "arrow-forward"}
            style={{ flex: 1 }}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 22,
    paddingTop: 16,
    paddingBottom: 30,
    justifyContent: 'space-between',
  },
  topStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  flashcard: {
    flex: 1,
    borderRadius: 26,
    borderWidth: 2,
    padding: 24,
    justifyContent: 'space-between',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
  },
  cardIndicatorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardCenter: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  cardText: {
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  tapFlipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  navRow: {
    flexDirection: 'row',
    marginTop: 20,
  }
});
