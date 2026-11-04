import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, Modal, Alert, RefreshControl
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types';
import { useAppTheme } from '../../context/ThemeContext';
import { LostFoundItem } from '../../types';
import { api } from '../../services/api';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Ionicons } from '@expo/vector-icons';

export const LostFoundScreen: React.FC = () => {
  const { theme, isDark } = useAppTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [items, setItems] = useState<LostFoundItem[]>([]);
  const [filterType, setFilterType] = useState<'all' | 'lost' | 'found'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // Claim modal state
  const [claimingItem, setClaimingItem] = useState<LostFoundItem | null>(null);
  const [claimantName, setClaimantName] = useState('');
  const [claimantPhone, setClaimantPhone] = useState('');
  const [proofDesc, setProofDesc] = useState('');
  const [submittingClaim, setSubmittingClaim] = useState(false);

  useEffect(() => {
    loadItems();
  }, [filterType, searchQuery]);

  const loadItems = async () => {
    try {
      const data = await api.getLostFoundItems(
        filterType === 'all' ? undefined : filterType,
        undefined,
        searchQuery.trim() || undefined
      );
      setItems(data);
    } catch (e) {
    } finally {
      setRefreshing(false);
    }
  };

  const handleClaimSubmit = async () => {
    if (!claimantName.trim() || !claimantPhone.trim() || !proofDesc.trim()) {
      Alert.alert('Required Fields', 'Please provide your name, phone number, and proof of ownership.');
      return;
    }

    if (!claimingItem) return;

    setSubmittingClaim(true);
    try {
      await api.submitItemClaim(claimingItem.id, claimantName.trim(), claimantPhone.trim(), proofDesc.trim());
      setSubmittingClaim(false);
      setClaimingItem(null);
      setClaimantName('');
      setClaimantPhone('');
      setProofDesc('');
      Alert.alert('Claim Submitted', 'Your ownership claim was submitted for verification.');
    } catch (e) {
      setSubmittingClaim(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Header
        title="Lost & Found"
        subtitle="LPU Student Community Noticeboard"
        rightAction={
          <TouchableOpacity
            onPress={() => navigation.navigate('ReportItem')}
            style={[styles.reportBtn, { backgroundColor: theme.colors.primary }]}
            activeOpacity={0.8}
          >
            <Ionicons name="add" size={18} color="#FFFFFF" />
            <Text style={styles.reportBtnText}>Report Item</Text>
          </TouchableOpacity>
        }
      />

      {/* Filter Chips: All, Lost Items, Found Items */}
      <View style={[styles.filterBar, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border }]}>
        <View style={styles.chipRow}>
          {[
            { key: 'all', label: 'All Items' },
            { key: 'lost', label: 'Lost Items' },
            { key: 'found', label: 'Found Items' },
          ].map((c) => {
            const isSelected = filterType === c.key;
            return (
              <TouchableOpacity
                key={c.key}
                onPress={() => setFilterType(c.key as any)}
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: isSelected ? theme.colors.primary : theme.colors.surfaceVariant,
                  }
                ]}
              >
                <Text
                  style={[
                    styles.chipText,
                    { color: isSelected ? '#FFFFFF' : theme.colors.textSecondary, fontWeight: isSelected ? '700' : '500' }
                  ]}
                >
                  {c.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Search Input */}
        <View style={[styles.searchBox, { backgroundColor: theme.colors.surfaceVariant, borderColor: theme.colors.border }]}>
          <Ionicons name="search-outline" size={18} color={theme.colors.textMuted} />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search chargers, watches, ID cards..."
            placeholderTextColor={theme.colors.textMuted}
            style={[styles.searchInput, { color: theme.colors.text }]}
          />
        </View>
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => String(item.id)}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadItems(); }} />}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 14, paddingBottom: 30 }}
        renderItem={({ item }) => {
          const isLost = item.item_type === 'lost';
          return (
            <Card style={styles.itemCard}>
              <View style={styles.cardTopRow}>
                <Badge
                  label={isLost ? "LOST ITEM" : "FOUND ITEM"}
                  variant={isLost ? "danger" : "success"}
                  size="sm"
                />
                <Badge label={item.category.toUpperCase()} variant="info" size="sm" />
              </View>

              <Text style={[styles.itemTitle, { color: theme.colors.text }]}>
                {item.title}
              </Text>

              <Text style={[styles.itemDesc, { color: theme.colors.textSecondary }]}>
                {item.description}
              </Text>

              <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />

              <View style={styles.infoRow}>
                <Ionicons name="location-outline" size={15} color={theme.colors.primary} />
                <Text style={[styles.infoText, { color: theme.colors.textSecondary }]}>
                  {item.location_name}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Ionicons name="call-outline" size={15} color={theme.colors.secondary} />
                <Text style={[styles.infoText, { color: theme.colors.textSecondary }]}>
                  Contact: {item.contact_phone}
                </Text>
              </View>

              <View style={styles.cardActions}>
                <Button
                  title={isLost ? "I Found This" : "Claim Ownership"}
                  onPress={() => setClaimingItem(item)}
                  variant="outline"
                  size="sm"
                  style={{ flex: 1 }}
                />
              </View>
            </Card>
          );
        }}
      />

      {/* Claim Modal */}
      <Modal visible={!!claimingItem} transparent animationType="slide">
        <View style={[styles.modalOverlay, { backgroundColor: theme.colors.overlay }]}>
          <View style={[styles.modalBox, { backgroundColor: theme.colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
                Claim: {claimingItem?.title}
              </Text>
              <TouchableOpacity onPress={() => setClaimingItem(null)}>
                <Ionicons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            <Input
              label="Your Full Name"
              placeholder="e.g. Amit Singh"
              value={claimantName}
              onChangeText={setClaimantName}
            />

            <Input
              label="Phone Number"
              placeholder="+91 9598993555"
              value={claimantPhone}
              onChangeText={setClaimantPhone}
              keyboardType="phone-pad"
            />

            <Input
              label="Proof of Ownership"
              placeholder="Describe serial number, color details, stickers, or unique markings..."
              value={proofDesc}
              onChangeText={setProofDesc}
              multiline
              numberOfLines={3}
            />

            <Button
              title="Submit Verification Claim"
              onPress={handleClaimSubmit}
              loading={submittingClaim}
              size="lg"
              style={{ marginTop: 14 }}
            />
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
  reportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 14,
    gap: 4,
  },
  reportBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  filterBar: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  chipRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
  },
  chipText: {
    fontSize: 12,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: 42,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
  },
  itemCard: {
    padding: 16,
    marginBottom: 12,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  itemDesc: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: 6,
  },
  divider: {
    height: 1,
    marginVertical: 10,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  infoText: {
    fontSize: 12,
  },
  cardActions: {
    marginTop: 10,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBox: {
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    padding: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    flex: 1,
  }
});
