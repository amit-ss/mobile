import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Modal, Alert, TextInput
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppTheme } from '../../context/ThemeContext';
import { StudyPartner } from '../../types';
import { api } from '../../services/api';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { Ionicons } from '@expo/vector-icons';

export const StudyPartnerScreen: React.FC = () => {
  const { theme, isDark } = useAppTheme();
  const navigation = useNavigation();

  const [partners, setPartners] = useState<StudyPartner[]>([]);
  const [selectedPartner, setSelectedPartner] = useState<StudyPartner | null>(null);
  const [message, setMessage] = useState('Hi! Would love to collaborate on DSA and placement prep.');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    loadPartners();
  }, []);

  const loadPartners = async () => {
    try {
      const data = await api.getStudyPartners();
      setPartners(data);
    } catch (e) {}
  };

  const handleSendRequest = async () => {
    if (!selectedPartner) return;
    setSending(true);
    try {
      await api.sendPartnerRequest(selectedPartner.name, selectedPartner.focus_area, message);
      setSending(false);
      setSelectedPartner(null);
      Alert.alert('Request Sent', `Connection request sent to ${selectedPartner.name}. You will be notified when accepted!`);
    } catch (e) {
      setSending(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Header
        title="Find Study Partner"
        subtitle="Connect with LPU peers & code together"
        showBack
        onBack={() => navigation.goBack()}
      />

      <FlatList
        data={partners}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 30 }}
        ListHeaderComponent={
          <View style={[styles.privacyNotice, { backgroundColor: theme.colors.surfaceVariant, borderColor: theme.colors.border }]}>
            <Ionicons name="shield-checkmark-outline" size={18} color={theme.colors.success} />
            <Text style={[styles.privacyText, { color: theme.colors.textSecondary }]}>
              Verified LPU students only. Contact details remain confidential until connection request is accepted.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <Card style={styles.partnerCard}>
            <View style={styles.partnerHeader}>
              <View style={[styles.avatar, { backgroundColor: theme.colors.primary }]}>
                <Text style={styles.avatarText}>{item.name.charAt(0)}</Text>
              </View>

              <View style={{ flex: 1, marginLeft: 14 }}>
                <Text style={[styles.partnerName, { color: theme.colors.text }]}>{item.name}</Text>
                <Text style={[styles.branchText, { color: theme.colors.textSecondary }]}>{item.branch}</Text>
              </View>

              <Badge label="Online" variant="success" size="sm" />
            </View>

            <View style={styles.focusRow}>
              <Ionicons name="sparkles" size={14} color={theme.colors.secondary} />
              <Text style={[styles.focusText, { color: theme.colors.secondary }]}>{item.focus_area}</Text>
            </View>

            <Text style={[styles.lookingFor, { color: theme.colors.text }]}>
              "{item.looking_for}"
            </Text>

            <View style={styles.tagsWrap}>
              {item.subjects.map((sub, i) => (
                <Badge key={i} label={sub} variant="primary" size="sm" />
              ))}
            </View>

            <Button
              title="Connect & Study"
              onPress={() => setSelectedPartner(item)}
              variant="outline"
              icon="person-add-outline"
              size="sm"
              style={{ marginTop: 14 }}
            />
          </Card>
        )}
      />

      {/* Connection Modal */}
      <Modal visible={!!selectedPartner} transparent animationType="slide">
        <View style={[styles.modalOverlay, { backgroundColor: theme.colors.overlay }]}>
          <View style={[styles.modalBox, { backgroundColor: theme.colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
                Connect with {selectedPartner?.name}
              </Text>
              <TouchableOpacity onPress={() => setSelectedPartner(null)}>
                <Ionicons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            <Text style={{ fontSize: 13, color: theme.colors.textSecondary, marginBottom: 12 }}>
              Subject / Goal: {selectedPartner?.focus_area}
            </Text>

            <TextInput
              value={message}
              onChangeText={setMessage}
              placeholder="Introduce yourself and propose your study schedule..."
              placeholderTextColor={theme.colors.textMuted}
              multiline
              numberOfLines={4}
              style={[styles.msgInput, { backgroundColor: theme.colors.surfaceVariant, color: theme.colors.text, borderColor: theme.colors.border }]}
            />

            <Button
              title="Dispatch Connection Request"
              onPress={handleSendRequest}
              loading={sending}
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
  privacyNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 14,
    gap: 8,
  },
  privacyText: {
    fontSize: 12,
    lineHeight: 16,
    flex: 1,
  },
  partnerCard: {
    padding: 16,
    marginBottom: 12,
  },
  partnerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  partnerName: {
    fontSize: 16,
    fontWeight: '800',
  },
  branchText: {
    fontSize: 12,
    marginTop: 2,
  },
  focusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
  },
  focusText: {
    fontSize: 13,
    fontWeight: '700',
  },
  lookingFor: {
    fontSize: 13,
    fontStyle: 'italic',
    marginTop: 6,
    lineHeight: 18,
  },
  tagsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
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
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  msgInput: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    fontSize: 14,
    minHeight: 90,
    textAlignVertical: 'top',
  }
});
