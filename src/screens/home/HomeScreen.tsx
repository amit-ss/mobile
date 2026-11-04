import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  RefreshControl, Image
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, MainTabParamList } from '../../types';
import { useAppTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { CircularProgress } from '../../components/CircularProgress';
import { Skeleton } from '../../components/Skeleton';
import { api } from '../../services/api';
import { Ionicons } from '@expo/vector-icons';

export const HomeScreen: React.FC = () => {
  const { theme, isDark, toggleTheme } = useAppTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList & MainTabParamList>>();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dashboardData, setDashboardData] = useState<any>(null);

  const fetchDashboard = useCallback(async () => {
    try {
      const data = await api.getMyCampusDay();
      setDashboardData(data);
    } catch (e) {
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboard();
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const studentName = user?.first_name || dashboardData?.student_name || 'LPU Student';
  const regNumber = user?.student_profile?.reg_number || dashboardData?.reg_number || '12204567';

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Top Header Bar */}
      <View style={[styles.topHeader, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border }]}>
        <View style={styles.userInfoRow}>
          <View style={[styles.avatar, { backgroundColor: theme.colors.primary }]}>
            <Text style={styles.avatarText}>{studentName.charAt(0)}</Text>
          </View>
          <View style={styles.nameBlock}>
            <Text style={[styles.greeting, { color: theme.colors.textSecondary }]}>
              {getGreeting()},
            </Text>
            <Text style={[styles.studentName, { color: theme.colors.text }]}>
              {studentName} 👋
            </Text>
          </View>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity
            onPress={toggleTheme}
            style={[styles.actionBtn, { backgroundColor: theme.colors.surfaceVariant }]}
            activeOpacity={0.7}
          >
            <Ionicons name={isDark ? 'sunny' : 'moon'} size={20} color={theme.colors.text} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('Notifications')}
            style={[styles.actionBtn, { backgroundColor: theme.colors.surfaceVariant }]}
            activeOpacity={0.7}
          >
            <Ionicons name="notifications-outline" size={20} color={theme.colors.text} />
            {dashboardData?.unread_notifications_count > 0 && (
              <View style={[styles.notifDot, { backgroundColor: theme.colors.danger }]} />
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.primary]} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Date and LPU Badge */}
        <View style={styles.dateRow}>
          <View style={styles.dateWrap}>
            <Ionicons name="calendar-outline" size={14} color={theme.colors.primary} />
            <Text style={[styles.dateText, { color: theme.colors.textSecondary }]}>
              {dashboardData?.date_formatted || 'Wednesday, 4 November 2026'}
            </Text>
          </View>
          <Badge label={`Sec: ${user?.student_profile?.section || 'K22DF'}`} variant="secondary" size="sm" />
        </View>

        {/* Quick Ask CampusGPT Banner */}
        <TouchableOpacity
          activeOpacity={0.88}
          onPress={() => navigation.navigate('AIChat')}
          style={[styles.aiBanner, { backgroundColor: isDark ? '#1E293B' : '#1E3A8A' }]}
        >
          <View style={styles.aiBannerTextWrap}>
            <View style={styles.aiTag}>
              <Ionicons name="sparkles" size={12} color="#FFFFFF" />
              <Text style={styles.aiTagText}>CAMPUS ASSISTANT</Text>
            </View>
            <Text style={styles.aiBannerTitle}>Ask Anything About LPU</Text>
            <Text style={styles.aiBannerSub}>Exam policies, hostel curfews, library hours & syllabus</Text>
          </View>
          <View style={styles.aiBannerBtn}>
            <Ionicons name="arrow-forward" size={18} color="#1E3A8A" />
          </View>
        </TouchableOpacity>

        {/* Next Upcoming Class Card */}
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Today's Schedule</Text>

        {loading ? (
          <Skeleton height={110} borderRadius={20} />
        ) : dashboardData?.next_class ? (
          <Card
            onPress={() => navigation.navigate('Timetable')}
            style={[styles.nextClassCard, { borderLeftColor: theme.colors.primary, borderLeftWidth: 5 }]}
          >
            <View style={styles.nextClassHeader}>
              <Badge label="NEXT UPCOMING CLASS" variant="primary" size="sm" />
              <Text style={[styles.timeText, { color: theme.colors.primary }]}>
                {dashboardData.next_class.start_time?.slice(0, 5)} - {dashboardData.next_class.end_time?.slice(0, 5)}
              </Text>
            </View>

            <Text style={[styles.courseName, { color: theme.colors.text }]}>
              {dashboardData.next_class.course?.name || 'Operating Systems'}
            </Text>

            <View style={styles.classDetailsRow}>
              <View style={styles.classDetailItem}>
                <Ionicons name="location-outline" size={16} color={theme.colors.textSecondary} />
                <Text style={[styles.detailText, { color: theme.colors.textSecondary }]}>
                  Room {dashboardData.next_class.room_number || '34-402'}
                </Text>
              </View>

              <View style={styles.classDetailItem}>
                <Ionicons name="person-outline" size={16} color={theme.colors.textSecondary} />
                <Text style={[styles.detailText, { color: theme.colors.textSecondary }]}>
                  {dashboardData.next_class.course?.assigned_faculty?.name || 'Dr. Amar Kumar'}
                </Text>
              </View>
            </View>
          </Card>
        ) : (
          <Card onPress={() => navigation.navigate('Timetable')} style={{ alignItems: 'center', padding: 20 }}>
            <Ionicons name="checkmark-circle-outline" size={36} color={theme.colors.success} />
            <Text style={[styles.courseName, { color: theme.colors.text, marginTop: 8 }]}>No More Classes Today</Text>
            <Text style={{ color: theme.colors.textSecondary, fontSize: 13 }}>Tap to view your full weekly timetable</Text>
          </Card>
        )}

        {/* Attendance Summary Widget */}
        <Card onPress={() => navigation.navigate('Attendance')} style={styles.attendanceCard}>
          <View style={styles.attendanceLeft}>
            <Badge
              label={dashboardData?.attendance?.overall_percentage >= 75 ? "SAFE ELIGIBILITY" : "ATTENDANCE SHORTAGE"}
              variant={dashboardData?.attendance?.overall_percentage >= 75 ? "success" : "danger"}
              size="sm"
            />
            <Text style={[styles.attTitle, { color: theme.colors.text }]}>Attendance Overview</Text>
            <Text style={[styles.attSub, { color: theme.colors.textSecondary }]}>
              LPU requires min. 75% for end-term examinations.
            </Text>

            <View style={styles.predictorLink}>
              <Text style={[styles.predictorLinkText, { color: theme.colors.primary }]}>
                Predict Missable Classes
              </Text>
              <Ionicons name="chevron-forward" size={16} color={theme.colors.primary} />
            </View>
          </View>

          <View style={styles.attendanceRight}>
            <CircularProgress
              percentage={dashboardData?.attendance?.overall_percentage || 82.4}
              size={96}
              strokeWidth={8}
            />
          </View>
        </Card>

        {/* 8 Main Modules Quick Grid */}
        <View style={styles.sectionHeaderRow}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Campus Modules</Text>
          <Text style={[styles.regCodeText, { color: theme.colors.textSecondary }]}>ID: {regNumber}</Text>
        </View>

        <View style={styles.grid}>
          {[
            { id: '1', title: 'Ask CampusGPT', sub: 'AI Chatbot', icon: 'sparkles', color: '#7C3AED', route: 'AIChat' },
            { id: '2', title: 'Smart Timetable', sub: 'Daily & Weekly', icon: 'calendar', color: '#2563EB', route: 'Timetable' },
            { id: '3', title: 'Attendance', sub: '75% Predictor', icon: 'calculator', color: '#10B981', route: 'Attendance' },
            { id: '4', title: 'Campus Map', sub: 'Walking & Rooms', icon: 'map', color: '#06B6D4', route: 'Campus' },
            { id: '5', title: 'Study Assistant', sub: 'PDFs & MCQs', icon: 'book', color: '#F59E0B', route: 'StudyAssistant' },
            { id: '6', title: 'Lost & Found', sub: 'Student Board', icon: 'search', color: '#EF4444', route: 'LostFound' },
            { id: '7', title: 'Event Finder', sub: 'Fests & Talks', icon: 'star', color: '#EC4899', route: 'Events' },
            { id: '8', title: 'Career Prep', sub: 'Resume & DSA', icon: 'briefcase', color: '#6366F1', route: 'Career' },
          ].map((item) => (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.8}
              onPress={() => (navigation as any).navigate(item.route)}
              style={[
                styles.gridItem,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: isDark ? '#2A364F' : '#EEF2F6',
                }
              ]}
            >
              <View style={[styles.gridIconWrap, { backgroundColor: item.color + '15' }]}>
                <Ionicons name={item.icon as any} size={22} color={item.color} />
              </View>
              <Text style={[styles.gridItemTitle, { color: theme.colors.text }]} numberOfLines={1}>
                {item.title}
              </Text>
              <Text style={[styles.gridItemSub, { color: theme.colors.textSecondary }]} numberOfLines={1}>
                {item.sub}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Extra Campus Utilities: QR Scanner & Study Partner */}
        <View style={styles.utilityRow}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => navigation.navigate('QRScanner')}
            style={[styles.utilityCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
          >
            <Ionicons name="qr-code-outline" size={24} color={theme.colors.primary} />
            <View style={{ marginLeft: 12 }}>
              <Text style={[styles.utilityTitle, { color: theme.colors.text }]}>Campus QR Scanner</Text>
              <Text style={[styles.utilitySub, { color: theme.colors.textSecondary }]}>Scan room doors & blocks</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => navigation.navigate('StudyPartner')}
            style={[styles.utilityCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
          >
            <Ionicons name="people-outline" size={24} color={theme.colors.secondary} />
            <View style={{ marginLeft: 12 }}>
              <Text style={[styles.utilityTitle, { color: theme.colors.text }]}>Find Study Partner</Text>
              <Text style={[styles.utilitySub, { color: theme.colors.textSecondary }]}>Connect with peer coders</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Featured Campus Events */}
        <View style={styles.sectionHeaderRow}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Featured Campus Events</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Events')}>
            <Text style={[styles.seeAllText, { color: theme.colors.primary }]}>View All</Text>
          </TouchableOpacity>
        </View>

        {dashboardData?.upcoming_events?.slice(0, 2).map((ev: any) => (
          <Card
            key={ev.id}
            onPress={() => navigation.navigate('EventDetail', { event: ev })}
            style={styles.eventCard}
          >
            <View style={styles.eventRow}>
              <View style={[styles.eventBadgeWrap, { backgroundColor: theme.colors.primary + '15' }]}>
                <Ionicons name="trophy-outline" size={24} color={theme.colors.primary} />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Badge label={ev.category?.toUpperCase() || 'EVENT'} variant="info" size="sm" />
                <Text style={[styles.eventTitle, { color: theme.colors.text }]} numberOfLines={1}>
                  {ev.title}
                </Text>
                <Text style={[styles.eventVenue, { color: theme.colors.textSecondary }]}>
                  📍 {ev.venue} • {ev.organizer}
                </Text>
              </View>
            </View>
          </Card>
        ))}

        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topHeader: {
    paddingHorizontal: 20,
    paddingTop: 48,
    paddingBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
  },
  userInfoRow: {
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
  nameBlock: {
    marginLeft: 12,
  },
  greeting: {
    fontSize: 12,
    fontWeight: '500',
  },
  studentName: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  dateWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dateText: {
    fontSize: 13,
    fontWeight: '600',
  },
  aiBanner: {
    borderRadius: 22,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    elevation: 4,
  },
  aiBannerTextWrap: {
    flex: 1,
    paddingRight: 10,
  },
  aiTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  aiTagText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  aiBannerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  aiBannerSub: {
    color: '#E0E7FF',
    fontSize: 12,
    marginTop: 4,
  },
  aiBannerBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginVertical: 10,
    letterSpacing: -0.3,
  },
  nextClassCard: {
    padding: 16,
    marginBottom: 14,
  },
  nextClassHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  timeText: {
    fontSize: 13,
    fontWeight: '700',
  },
  courseName: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 12,
  },
  classDetailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
  },
  classDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 13,
    fontWeight: '500',
  },
  attendanceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    marginVertical: 12,
  },
  attendanceLeft: {
    flex: 1,
    paddingRight: 12,
  },
  attTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginTop: 8,
  },
  attSub: {
    fontSize: 12,
    marginTop: 4,
    lineHeight: 16,
  },
  predictorLink: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    gap: 4,
  },
  predictorLinkText: {
    fontSize: 13,
    fontWeight: '700',
  },
  attendanceRight: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
    marginBottom: 10,
  },
  regCodeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '700',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'space-between',
  },
  gridItem: {
    width: '48%',
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    marginBottom: 4,
  },
  gridIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  gridItemTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  gridItemSub: {
    fontSize: 11,
    marginTop: 2,
  },
  utilityRow: {
    flexDirection: 'column',
    gap: 10,
    marginTop: 14,
    marginBottom: 6,
  },
  utilityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
  utilityTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  utilitySub: {
    fontSize: 11,
    marginTop: 2,
  },
  eventCard: {
    padding: 14,
    marginBottom: 10,
  },
  eventRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eventBadgeWrap: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eventTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginTop: 4,
  },
  eventVenue: {
    fontSize: 12,
    marginTop: 2,
  }
});
