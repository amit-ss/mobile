import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useAppTheme } from '../../context/ThemeContext';
import { CampusEvent } from '../../types';
import { api } from '../../services/api';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { Ionicons } from '@expo/vector-icons';

export const EventDetailScreen: React.FC = () => {
  const { theme, isDark } = useAppTheme();
  const route = useRoute();
  const navigation = useNavigation();

  const { event } = (route.params as { event: CampusEvent }) || {};
  const [isSaved, setIsSaved] = useState(event?.is_saved || false);

  if (!event) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Header title="Event Details" showBack onBack={() => navigation.goBack()} />
        <Text style={{ padding: 20, color: theme.colors.text }}>Event not found.</Text>
      </View>
    );
  }

  const handleToggleSave = async () => {
    try {
      await api.toggleSaveEvent(event.id);
      setIsSaved(!isSaved);
      Alert.alert(isSaved ? 'Removed' : 'Saved', isSaved ? 'Event removed from saved items.' : 'Event added to your campus calendar.');
    } catch (e) {}
  };

  const handleRegister = () => {
    Alert.alert(
      'Register for Event',
      `Opening registration link (${event.registration_url}) in official LPU portal.`,
      [{ text: 'OK' }]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Header
        title="Event Details"
        subtitle={event.organizer}
        showBack
        onBack={() => navigation.goBack()}
        rightAction={
          <TouchableOpacity onPress={handleToggleSave} style={{ padding: 6 }}>
            <Ionicons
              name={isSaved ? "bookmark" : "bookmark-outline"}
              size={24}
              color={isSaved ? theme.colors.secondary : theme.colors.text}
            />
          </TouchableOpacity>
        }
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Banner Card */}
        <View style={[styles.bannerBox, { backgroundColor: theme.colors.primary }]}>
          <View style={styles.bannerIcon}>
            <Ionicons name="trophy" size={48} color="#FFFFFF" />
          </View>
          <Badge label={event.category.toUpperCase()} variant="secondary" size="md" style={{ alignSelf: 'flex-start', marginTop: 14 }} />
          <Text style={styles.bannerTitle}>{event.title}</Text>
        </View>

        {/* Schedule & Venue Card */}
        <Card style={styles.detailsCard}>
          <View style={styles.detailRow}>
            <Ionicons name="time-outline" size={20} color={theme.colors.primary} />
            <View style={{ marginLeft: 12 }}>
              <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>Date & Time</Text>
              <Text style={[styles.detailValue, { color: theme.colors.text }]}>
                {new Date(event.start_date).toLocaleString()}
              </Text>
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />

          <View style={styles.detailRow}>
            <Ionicons name="location-outline" size={20} color={theme.colors.secondary} />
            <View style={{ marginLeft: 12 }}>
              <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>Venue</Text>
              <Text style={[styles.detailValue, { color: theme.colors.text }]}>
                {event.venue}
              </Text>
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />

          <View style={styles.detailRow}>
            <Ionicons name="people-outline" size={20} color={theme.colors.accent} />
            <View style={{ marginLeft: 12 }}>
              <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>Organizer</Text>
              <Text style={[styles.detailValue, { color: theme.colors.text }]}>
                {event.organizer}
              </Text>
            </View>
          </View>
        </Card>

        {/* Description Card */}
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>About Event</Text>
        <Card style={styles.descCard}>
          <Text style={[styles.descText, { color: theme.colors.text }]}>
            {event.description}
          </Text>
        </Card>

        {/* Register CTA */}
        <Button
          title="Register Now (Official Portal)"
          onPress={handleRegister}
          variant="primary"
          icon="open-outline"
          size="lg"
          style={{ marginTop: 20 }}
        />

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  bannerBox: {
    borderRadius: 24,
    padding: 22,
    marginBottom: 16,
    elevation: 4,
  },
  bannerIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 8,
    lineHeight: 28,
  },
  detailsCard: {
    padding: 18,
    marginBottom: 14,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 2,
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginVertical: 10,
  },
  descCard: {
    padding: 18,
  },
  descText: {
    fontSize: 14,
    lineHeight: 22,
  }
});
