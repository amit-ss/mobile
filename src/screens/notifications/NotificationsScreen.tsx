import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppTheme } from '../../context/ThemeContext';
import { NotificationItem } from '../../types';
import { api } from '../../services/api';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { Ionicons } from '@expo/vector-icons';

export const NotificationsScreen: React.FC = () => {
  const { theme, isDark } = useAppTheme();
  const navigation = useNavigation();

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadNotifs();
  }, []);

  const loadNotifs = async () => {
    try {
      const data = await api.getNotifications();
      setNotifications(data);
    } catch (e) {
    } finally {
      setRefreshing(false);
    }
  };

  const handleMarkAsRead = async (id: number) => {
    try {
      await api.markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
    } catch (e) {}
  };

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'class': return { name: 'time-outline', color: theme.colors.primary };
      case 'attendance': return { name: 'alert-circle-outline', color: theme.colors.danger };
      case 'event': return { name: 'trophy-outline', color: theme.colors.secondary };
      case 'exam': return { name: 'newspaper-outline', color: theme.colors.warning };
      default: return { name: 'notifications-outline', color: theme.colors.accent };
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Header
        title="Notifications"
        subtitle="Class Reminders & Campus Alerts"
        showBack
        onBack={() => navigation.goBack()}
        rightAction={
          <TouchableOpacity onPress={handleMarkAllRead} style={{ padding: 4 }}>
            <Text style={{ color: theme.colors.primary, fontSize: 13, fontWeight: '700' }}>
              Mark all read
            </Text>
          </TouchableOpacity>
        }
      />

      <FlatList
        data={notifications}
        keyExtractor={(item) => String(item.id)}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadNotifs(); }} />}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 14, paddingBottom: 30 }}
        renderItem={({ item }) => {
          const icon = getIcon(item.notification_type);
          return (
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => handleMarkAsRead(item.id)}
            >
              <Card
                style={[
                  styles.notifCard,
                  !item.is_read && { borderLeftColor: theme.colors.primary, borderLeftWidth: 4 }
                ]}
              >
                <View style={styles.notifRow}>
                  <View style={[styles.iconWrap, { backgroundColor: icon.color + '15' }]}>
                    <Ionicons name={icon.name as any} size={22} color={icon.color} />
                  </View>

                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <View style={styles.topRow}>
                      <Badge label={item.notification_type.toUpperCase()} variant="info" size="sm" />
                      <Text style={[styles.timeText, { color: theme.colors.textSecondary }]}>
                        {item.created_at}
                      </Text>
                    </View>

                    <Text style={[styles.title, { color: theme.colors.text }]}>
                      {item.title}
                    </Text>

                    <Text style={[styles.msg, { color: theme.colors.textSecondary }]}>
                      {item.message}
                    </Text>
                  </View>
                </View>
              </Card>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  notifCard: {
    padding: 14,
    marginBottom: 10,
  },
  notifRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  timeText: {
    fontSize: 11,
    fontWeight: '500',
  },
  title: {
    fontSize: 14,
    fontWeight: '800',
    marginTop: 2,
  },
  msg: {
    fontSize: 12,
    lineHeight: 17,
    marginTop: 4,
  }
});
