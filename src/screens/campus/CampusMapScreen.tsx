import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, ScrollView, Modal, Animated, Linking
} from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types';
import { useAppTheme } from '../../context/ThemeContext';
import { CampusLocation } from '../../types';
import { api } from '../../services/api';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { Ionicons } from '@expo/vector-icons';
import { useLiveLocation } from '../../hooks/useLiveLocation';
import {
  distanceMeters, bearingDegrees, compassPoint, formatDistance, walkMinutes,
  formatCoord, isOnCampus, directionsUrl
} from '../../utils/geo';

const CATEGORIES = [
  { key: 'all', label: 'All Places' },
  { key: 'academic', label: 'Academic Blocks' },
  { key: 'library', label: 'Libraries' },
  { key: 'cafeteria', label: 'Food & UniMall' },
  { key: 'lab', label: 'Robotics & Labs' },
  { key: 'hostel', label: 'Hostels' },
  { key: 'sports', label: 'Unipolis / Sports' },
];

const LiveDot: React.FC<{ color: string; active: boolean }> = ({ color, active }) => {
  const pulse = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!active) { pulse.setValue(0); return; }
    const loop = Animated.loop(
      Animated.timing(pulse, { toValue: 1, duration: 1400, useNativeDriver: true })
    );
    loop.start();
    return () => loop.stop();
  }, [active]);
  return (
    <View style={{ width: 14, height: 14, alignItems: 'center', justifyContent: 'center' }}>
      {active && (
        <Animated.View
          style={{
            position: 'absolute', width: 14, height: 14, borderRadius: 7, backgroundColor: color,
            opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.5, 0] }),
            transform: [{ scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 2.4] }) }],
          }}
        />
      )}
      <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: color }} />
    </View>
  );
};

export const CampusMapScreen: React.FC = () => {
  const { theme, isDark } = useAppTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [locations, setLocations] = useState<CampusLocation[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<CampusLocation | null>(null);
  const [nearestFirst, setNearestFirst] = useState(true);

  // GPS is only on while this tab is visible
  const isFocused = useIsFocused();
  const { coords, status, updatedAt, retry } = useLiveLocation(isFocused);
  const me = coords ? { latitude: coords.latitude, longitude: coords.longitude } : null;

  const distanceTo = (loc: CampusLocation) =>
    me ? distanceMeters(me, { latitude: loc.latitude, longitude: loc.longitude }) : null;

  const visibleLocations = useMemo(() => {
    const withDistance = locations.map((loc) => ({ loc, meters: distanceTo(loc) }));
    if (nearestFirst && me) {
      withDistance.sort((a, b) => (a.meters ?? Infinity) - (b.meters ?? Infinity));
    }
    return withDistance;
  }, [locations, nearestFirst, coords?.latitude, coords?.longitude]);

  useEffect(() => {
    loadLocations();
  }, [selectedCategory, searchQuery]);

  const loadLocations = async () => {
    try {
      const data = await api.getCampusLocations(
        selectedCategory === 'all' ? undefined : selectedCategory,
        searchQuery.trim() || undefined
      );
      setLocations(data);
    } catch (e) {}
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'academic': return 'business-outline';
      case 'library': return 'book-outline';
      case 'cafeteria': return 'fast-food-outline';
      case 'lab': return 'hardware-chip-outline';
      case 'hostel': return 'home-outline';
      case 'sports': return 'football-outline';
      default: return 'location-outline';
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header Bar */}
      <View style={[styles.headerBar, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border }]}>
        <View>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Campus Navigation</Text>
          <Text style={[styles.headerSub, { color: theme.colors.textSecondary }]}>
            Verified LPU Buildings & Directions
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => navigation.navigate('QRScanner')}
          style={[styles.qrHeaderBtn, { backgroundColor: theme.colors.primary }]}
          activeOpacity={0.8}
        >
          <Ionicons name="qr-code" size={18} color="#FFFFFF" />
          <Text style={styles.qrBtnText}>Scan QR</Text>
        </TouchableOpacity>
      </View>

      {/* Search Input */}
      <View style={[styles.searchBox, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border }]}>
        <View style={[styles.searchInputWrapper, { backgroundColor: theme.colors.surfaceVariant, borderColor: theme.colors.border }]}>
          <Ionicons name="search-outline" size={18} color={theme.colors.textMuted} />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search block (e.g. 34), lab, library, UniMall..."
            placeholderTextColor={theme.colors.textMuted}
            style={[styles.searchInput, { color: theme.colors.text }]}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color={theme.colors.textMuted} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* Category Pills */}
      <View style={styles.categoryPills}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
          {CATEGORIES.map((cat) => {
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

      {/* Live location banner */}
      <View style={[styles.mapBanner, { backgroundColor: isDark ? '#1E293B' : '#EFF6FF', borderColor: theme.colors.primaryLight + '30' }]}>
        <View style={styles.mapPinRow}>
          <View style={[styles.pulsePin, { backgroundColor: status === 'live' ? theme.colors.primary : theme.colors.textMuted }]}>
            <Ionicons name={status === 'live' ? 'navigate' : 'navigate-outline'} size={18} color="#FFFFFF" />
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            {status === 'live' && coords ? (
              <>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <LiveDot color={theme.colors.success} active />
                  <Text style={[styles.mapBannerTitle, { color: theme.colors.text }]}>
                    Live location{coords.accuracy ? ` · ±${Math.round(coords.accuracy)} m` : ''}
                  </Text>
                </View>
                <Text style={[styles.mapBannerSub, { color: theme.colors.textSecondary }]}>
                  {formatCoord(coords.latitude, 'N', 'S')}, {formatCoord(coords.longitude, 'E', 'W')}
                  {updatedAt ? `  •  ${new Date(updatedAt).toLocaleTimeString()}` : ''}
                </Text>
                {me && !isOnCampus(me) && (
                  <Text style={[styles.mapBannerSub, { color: theme.colors.warning, marginTop: 2 }]}>
                    You appear to be off campus, so distances are to the LPU buildings.
                  </Text>
                )}
              </>
            ) : status === 'requesting' ? (
              <>
                <Text style={[styles.mapBannerTitle, { color: theme.colors.text }]}>Finding your location…</Text>
                <Text style={[styles.mapBannerSub, { color: theme.colors.textSecondary }]}>
                  LPU Main Campus • Phagwara
                </Text>
              </>
            ) : (
              <>
                <Text style={[styles.mapBannerTitle, { color: theme.colors.text }]}>
                  {status === 'denied'
                    ? 'Location permission is off'
                    : status === 'services_off'
                    ? 'Location services are turned off'
                    : 'Location unavailable'}
                </Text>
                <TouchableOpacity
                  onPress={() => (status === 'denied' ? Linking.openSettings() : retry())}
                  style={{ marginTop: 4 }}
                >
                  <Text style={[styles.mapBannerSub, { color: theme.colors.primary, fontWeight: '700' }]}>
                    {status === 'denied' ? 'Open settings to enable' : 'Tap to retry'}
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>

        {status === 'live' && (
          <TouchableOpacity
            onPress={() => setNearestFirst((v) => !v)}
            style={[styles.sortToggle, { borderColor: theme.colors.border, backgroundColor: nearestFirst ? theme.colors.primary + '15' : 'transparent' }]}
            activeOpacity={0.8}
          >
            <Ionicons name="swap-vertical" size={14} color={theme.colors.primary} />
            <Text style={{ color: theme.colors.primary, fontSize: 12, fontWeight: '700' }}>
              {nearestFirst ? 'Nearest first' : 'A–Z'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Locations List */}
      <FlatList
        data={visibleLocations}
        keyExtractor={(item) => String(item.loc.id)}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
        renderItem={({ item: entry }) => {
          const item = entry.loc;
          return (
          <Card
            onPress={() => setSelectedLocation(item)}
            style={styles.locationCard}
          >
            <View style={styles.locationCardRow}>
              <View style={[styles.locIconWrap, { backgroundColor: theme.colors.primary + '15' }]}>
                <Ionicons name={getCategoryIcon(item.category) as any} size={24} color={theme.colors.primary} />
              </View>

              <View style={{ flex: 1, marginLeft: 12 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Badge label={item.block_number} variant="primary" size="sm" />
                  <Text style={[styles.distanceText, { color: theme.colors.textSecondary }]}>
                    {entry.meters != null
                      ? `${formatDistance(entry.meters)} · ${walkMinutes(entry.meters)} min walk`
                      : '—'}
                  </Text>
                </View>

                <Text style={[styles.locName, { color: theme.colors.text }]} numberOfLines={1}>
                  {item.name}
                </Text>

                <Text style={[styles.locFloor, { color: theme.colors.textSecondary }]} numberOfLines={1}>
                  📍 {item.floor_or_room}
                </Text>
              </View>
            </View>
          </Card>
          );
        }}
      />

      {/* Location Details Modal */}
      <Modal
        visible={!!selectedLocation}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedLocation(null)}
      >
        <View style={[styles.modalOverlay, { backgroundColor: theme.colors.overlay }]}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
            {selectedLocation && (
              <>
                <View style={styles.modalHeader}>
                  <Badge label={selectedLocation.block_number} variant="primary" size="md" />
                  <TouchableOpacity onPress={() => setSelectedLocation(null)}>
                    <Ionicons name="close" size={24} color={theme.colors.text} />
                  </TouchableOpacity>
                </View>

                <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
                  {selectedLocation.name}
                </Text>

                <Text style={[styles.modalFloor, { color: theme.colors.textSecondary }]}>
                  Floor & Room: {selectedLocation.floor_or_room}
                </Text>

                <Text style={[styles.modalDesc, { color: theme.colors.text }]}>
                  {selectedLocation.description}
                </Text>

                <View style={[styles.qrVerifyBox, { backgroundColor: theme.colors.surfaceVariant }]}>
                  <Ionicons name="shield-checkmark" size={20} color={theme.colors.success} />
                  <Text style={[styles.qrVerifyText, { color: theme.colors.text }]}>
                    Verified LPU QR Code: <Text style={{ fontWeight: '700' }}>{selectedLocation.qr_code_id || 'LPU-VERIFIED'}</Text>
                  </Text>
                </View>

                {(() => {
                  const m = distanceTo(selectedLocation);
                  if (m == null || !me) return null;
                  const dir = compassPoint(bearingDegrees(me, { latitude: selectedLocation.latitude, longitude: selectedLocation.longitude }));
                  return (
                    <View style={[styles.qrVerifyBox, { backgroundColor: theme.colors.surfaceVariant }]}>
                      <Ionicons name="walk-outline" size={20} color={theme.colors.primary} />
                      <Text style={[styles.qrVerifyText, { color: theme.colors.text }]}>
                        <Text style={{ fontWeight: '700' }}>{formatDistance(m)}</Text> away · about {walkMinutes(m)} min walk · {dir} of you
                      </Text>
                    </View>
                  );
                })()}

                <View style={styles.modalButtons}>
                  <Button
                    title="Walking Directions"
                    onPress={() =>
                      Linking.openURL(
                        directionsUrl({ latitude: selectedLocation.latitude, longitude: selectedLocation.longitude })
                      )
                    }
                    variant="primary"
                    icon="navigate"
                    style={{ flex: 1, marginRight: 8 }}
                  />
                  <Button
                    title="Close"
                    onPress={() => setSelectedLocation(null)}
                    variant="outline"
                    style={{ width: 90 }}
                  />
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
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
  qrHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    gap: 6,
  },
  qrBtnText: {
    color: '#FFFFFF',
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
  categoryPills: {
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
  mapBanner: {
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
  },
  sortToggle: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
  },
  mapPinRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pulsePin: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapBannerTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  mapBannerSub: {
    fontSize: 11,
    marginTop: 2,
  },
  locationCard: {
    padding: 14,
    marginBottom: 8,
  },
  locationCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locIconWrap: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  distanceText: {
    fontSize: 11,
    fontWeight: '500',
  },
  locName: {
    fontSize: 15,
    fontWeight: '700',
    marginTop: 4,
  },
  locFloor: {
    fontSize: 12,
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    padding: 24,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
  modalFloor: {
    fontSize: 13,
    marginTop: 4,
    fontWeight: '600',
  },
  modalDesc: {
    fontSize: 14,
    lineHeight: 22,
    marginTop: 14,
  },
  qrVerifyBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    marginTop: 18,
    gap: 8,
  },
  qrVerifyText: {
    fontSize: 12,
  },
  modalButtons: {
    flexDirection: 'row',
    marginTop: 20,
  }
});
