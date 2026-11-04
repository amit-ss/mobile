import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Switch, Alert
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types';
import { useAppTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { Ionicons } from '@expo/vector-icons';

export const ProfileScreen: React.FC = () => {
  const { theme, isDark, toggleTheme } = useAppTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { user, logout } = useAuth();

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const studentName = user ? `${user.first_name} ${user.last_name}`.trim() : 'Amit Singh';
  const regNumber = user?.student_profile?.reg_number || '12204567';
  const course = user?.student_profile?.course || 'B.Tech Computer Science & Engineering';
  const branch = user?.student_profile?.branch || 'CSE';
  const semester = user?.student_profile?.semester || 5;
  const section = user?.student_profile?.section || 'K22DF';
  const careerGoal = user?.student_profile?.career_goal || 'Full Stack AI Engineer';

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to log out of CampusGPT?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: async () => {
          await logout();
          navigation.replace('Auth');
        }
      }
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={[styles.headerBar, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border }]}>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Student Profile</Text>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutTopBtn}>
          <Ionicons name="log-out-outline" size={22} color={theme.colors.danger} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Profile Card */}
        <Card style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <View style={[styles.bigAvatar, { backgroundColor: theme.colors.primary }]}>
              <Text style={styles.bigAvatarText}>{studentName.charAt(0)}</Text>
              <View style={[styles.editIconBadge, { backgroundColor: theme.colors.secondary }]}>
                <Ionicons name="camera" size={14} color="#FFFFFF" />
              </View>
            </View>

            <View style={styles.profileInfo}>
              <Text style={[styles.nameText, { color: theme.colors.text }]}>{studentName}</Text>
              <Text style={[styles.regText, { color: theme.colors.primary }]}>Reg: {regNumber}</Text>
              <Text style={[styles.courseText, { color: theme.colors.textSecondary }]}>{course}</Text>
            </View>
          </View>

          {/* Academic Tags */}
          <View style={styles.tagsRow}>
            <Badge label={`Branch: ${branch}`} variant="primary" size="sm" />
            <Badge label={`Semester: ${semester}`} variant="secondary" size="sm" />
            <Badge label={`Section: ${section}`} variant="info" size="sm" />
          </View>

          <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />

          <View style={styles.careerRow}>
            <Ionicons name="rocket-outline" size={18} color={theme.colors.secondary} />
            <Text style={[styles.careerLabel, { color: theme.colors.textSecondary }]}>Target Career:</Text>
            <Text style={[styles.careerValue, { color: theme.colors.text }]}>{careerGoal}</Text>
          </View>
        </Card>

        {/* Academic Stats */}
        <View style={styles.statsRow}>
          <Card style={[styles.statBox, { alignItems: 'center' }]}>
            <Text style={[styles.statNumber, { color: theme.colors.primary }]}>82.4%</Text>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Attendance</Text>
          </Card>

          <Card style={[styles.statBox, { alignItems: 'center' }]}>
            <Text style={[styles.statNumber, { color: theme.colors.secondary }]}>8.72</Text>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Current CGPA</Text>
          </Card>

          <Card style={[styles.statBox, { alignItems: 'center' }]}>
            <Text style={[styles.statNumber, { color: theme.colors.success }]}>5</Text>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Subjects</Text>
          </Card>
        </View>

        {/* Settings & Preferences */}
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Preferences & System</Text>

        <Card style={styles.settingsCard}>
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Ionicons name="moon-outline" size={20} color={theme.colors.primary} />
              <Text style={[styles.settingLabel, { color: theme.colors.text }]}>Dark Mode</Text>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: '#CBD5E1', true: theme.colors.primary }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />

          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Ionicons name="notifications-outline" size={20} color={theme.colors.secondary} />
              <Text style={[styles.settingLabel, { color: theme.colors.text }]}>Class & Exam Reminders</Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: '#CBD5E1', true: theme.colors.secondary }}
              thumbColor="#FFFFFF"
            />
          </View>
        </Card>

        {/* Shortcuts */}
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>LPU Quick Access</Text>

        <Card style={styles.settingsCard}>
          <TouchableOpacity
            style={styles.shortcutRow}
            onPress={() => navigation.navigate('StudyAssistant')}
          >
            <View style={styles.settingLeft}>
              <Ionicons name="document-text-outline" size={20} color={theme.colors.primary} />
              <Text style={[styles.settingLabel, { color: theme.colors.text }]}>My Uploaded Study Notes</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={theme.colors.textSecondary} />
          </TouchableOpacity>

          <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />

          <TouchableOpacity
            style={styles.shortcutRow}
            onPress={() => navigation.navigate('Career')}
          >
            <View style={styles.settingLeft}>
              <Ionicons name="briefcase-outline" size={20} color={theme.colors.secondary} />
              <Text style={[styles.settingLabel, { color: theme.colors.text }]}>Placement Resume Analysis</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={theme.colors.textSecondary} />
          </TouchableOpacity>

          <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />

          <TouchableOpacity
            style={styles.shortcutRow}
            onPress={() => Alert.alert('LPU UMS Portal', 'Opening ums.lpu.in in student browser.')}
          >
            <View style={styles.settingLeft}>
              <Ionicons name="globe-outline" size={20} color={theme.colors.accent} />
              <Text style={[styles.settingLabel, { color: theme.colors.text }]}>Official UMS Touch Portal</Text>
            </View>
            <Ionicons name="open-outline" size={18} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        </Card>

        <Button
          title="Sign Out"
          onPress={handleLogout}
          variant="danger"
          icon="log-out-outline"
          size="lg"
          style={{ marginTop: 20 }}
        />

        <View style={{ height: 30 }} />
      </ScrollView>
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
  logoutTopBtn: {
    padding: 6,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  profileCard: {
    padding: 18,
    marginBottom: 14,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bigAvatar: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bigAvatarText: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '800',
  },
  editIconBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    borderRadius: 12,
    padding: 4,
  },
  profileInfo: {
    marginLeft: 16,
    flex: 1,
  },
  nameText: {
    fontSize: 18,
    fontWeight: '800',
  },
  regText: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 2,
  },
  courseText: {
    fontSize: 12,
    marginTop: 2,
  },
  tagsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 14,
    flexWrap: 'wrap',
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
  careerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  careerLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  careerValue: {
    fontSize: 13,
    fontWeight: '700',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  statBox: {
    flex: 1,
    padding: 14,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginTop: 14,
    marginBottom: 8,
  },
  settingsCard: {
    padding: 16,
    marginBottom: 8,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  shortcutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
  }
});
