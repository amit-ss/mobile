import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, ScrollView, RefreshControl
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types';
import { useAppTheme } from '../../context/ThemeContext';
import { CampusEvent } from '../../types';
import { api } from '../../services/api';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { Ionicons } from '@expo/vector-icons';

const EVENT_CATEGORIES = [
  { key: 'all', label: 'All Events' },
  { key: 'hackathon', label: 'Hackathons' },
  { key: 'workshop', label: 'Workshops' },
  { key: 'placement', label: 'Placements' },
  { key: 'cultural', label: 'Cultural' },
  { key: 'sports', label: 'Sports' },
];

export const EventsScreen: React.FC = () => {
  const { theme, isDark } = useAppTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [events, setEvents] = useState<CampusEvent[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadEvents();
  }, [selectedCategory, searchQuery]);

  const loadEvents = async () => {
    try {
      const data = await api.getCampusEvents(
        selectedCategory === 'all' ? undefined : selectedCategory,
        searchQuery.trim() || undefined
      );
      setEvents(data);
    } catch (e) {
    } finally {
      setRefreshing(false);
    }
  };

  const handleToggleSave = async (ev: CampusEvent) => {
    try {
      await api.toggleSaveEvent(ev.id);
      setEvents((prev) =>
        prev.map((item) =>
          item.id === ev.id ? { ...item, is_saved: !item.is_saved } : item
        )
      );
    } catch (e) {}
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={[styles.headerBar, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border }]}>
        <View>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Event Finder</Text>
          <Text style={[styles.headerSub, { color: theme.colors.textSecondary }]}>
            Workshops, Hackathons & Cultural Fests
          </Text>
        </View>

        <View style={[styles.badgeCount, { backgroundColor: theme.colors.primary + '20' }]}>
          <Text style={[styles.countText, { color: theme.colors.primary }]}>{events.length} Live</Text>
        </View>
      </View>

      {/* Search Input */}
      <View style={[styles.searchBox, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border }]}>
        <View style={[styles.searchInputWrapper, { backgroundColor: theme.colors.surfaceVariant, borderColor: theme.colors.border }]}>
          <Ionicons name="search-outline" size={18} color={theme.colors.textMuted} />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search HackLPU, guest lectures, workshops..."
            placeholderTextColor={theme.colors.textMuted}
            style={[styles.searchInput, { color: theme.colors.text }]}
          />
        </View>
      </View>

      {/* Category Horizontal Filter */}
      <View style={styles.catScroll}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
          {EVENT_CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.key;
            return (
              <TouchableOpacity
                key={cat.key}
                onPress={() => setSelectedCategory(cat.key)}
                style={[
                  styles.catChip,
                  {
                    backgroundColor: isSelected ? theme.colors.primary : theme.colors.surface,
                    borderColor: isSelected ? theme.colors.primary : theme.colors.border,
                  }
                ]}
              >
                <Text
                  style={[
                    styles.catChipText,
                    { color: isSelected ? '#FFFFFF' : theme.colors.textSecondary, fontWeight: isSelected ? '700' : '500' }
                  ]}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Events List */}
      <FlatList
        data={events}
        keyExtractor={(item) => String(item.id)}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadEvents(); }} />}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
        renderItem={({ item }) => (
          <Card
            onPress={() => navigation.navigate('EventDetail', { event: item })}
            style={styles.eventCard}
          >
            <View style={styles.cardTopRow}>
              <Badge label={item.category.toUpperCase()} variant="secondary" size="sm" />
              <TouchableOpacity onPress={() => handleToggleSave(item)} style={styles.saveBtn}>
                <Ionicons
                  name={item.is_saved ? 'bookmark' : 'bookmark-outline'}
                  size={20}
                  color={item.is_saved ? theme.colors.secondary : theme.colors.textSecondary}
                />
              </TouchableOpacity>
            </View>

            <Text style={[styles.eventTitle, { color: theme.colors.text }]}>
              {item.title}
            </Text>

            <Text style={[styles.eventDesc, { color: theme.colors.textSecondary }]} numberOfLines={2}>
              {item.description}
            </Text>

            <View style={[styles.cardDivider, { backgroundColor: theme.colors.border }]} />

            <View style={styles.cardFooter}>
              <View style={styles.footerInfo}>
                <Ionicons name="time-outline" size={15} color={theme.colors.primary} />
                <Text style={[styles.footerText, { color: theme.colors.textSecondary }]}>
                  {formatDate(item.start_date)}
                </Text>
              </View>

              <View style={styles.footerInfo}>
                <Ionicons name="location-outline" size={15} color={theme.colors.textSecondary} />
                <Text style={[styles.footerText, { color: theme.colors.textSecondary }]} numberOfLines={1}>
                  {item.venue}
                </Text>
              </View>
            </View>
          </Card>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerBar: {
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
  },
  headerSub: {
    fontSize: 12,
    marginTop: 2,
  },
  badgeCount: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  countText: {
    fontSize: 12,
    fontWeight: '700',
  },
  searchBox: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
  },
  catScroll: {
    paddingVertical: 10,
  },
  catChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    borderWidth: 1,
  },
  catChipText: {
    fontSize: 12,
  },
  eventCard: {
    padding: 16,
    marginBottom: 12,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  saveBtn: {
    padding: 4,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '800',
    lineHeight: 22,
  },
  eventDesc: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: 6,
  },
  cardDivider: {
    height: 1,
    marginVertical: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    maxWidth: '48%',
  },
  footerText: {
    fontSize: 12,
    fontWeight: '500',
  }
});
