import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Modal, Alert, ScrollView
} from 'react-native';
import { useAppTheme } from '../../context/ThemeContext';
import { TimetableEntry } from '../../types';
import { api } from '../../services/api';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Ionicons } from '@expo/vector-icons';

const DAYS = [
  { code: 'MON', name: 'Mon' },
  { code: 'TUE', name: 'Tue' },
  { code: 'WED', name: 'Wed' },
  { code: 'THU', name: 'Thu' },
  { code: 'FRI', name: 'Fri' },
  { code: 'SAT', name: 'Sat' },
];

export const TimetableScreen: React.FC = () => {
  const { theme, isDark } = useAppTheme();
  const [selectedDay, setSelectedDay] = useState('MON');
  const [weeklyData, setWeeklyData] = useState<any[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form states
  const [courseCode, setCourseCode] = useState('');
  const [courseName, setCourseName] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [roomNumber, setRoomNumber] = useState('34-402');
  const [facultyName, setFacultyName] = useState('Dr. Amar Kumar');

  useEffect(() => {
    loadTimetable();
  }, []);

  const loadTimetable = async () => {
    try {
      const data = await api.getWeeklyTimetable();
      setWeeklyData(data);
    } catch (e) {}
  };

  const currentDayGroup = weeklyData.find((g) => g.day_code === selectedDay);
  const classesForDay: TimetableEntry[] = currentDayGroup?.classes || [];

  // Check conflicts
  const conflicts: string[] = [];
  for (let i = 0; i < classesForDay.length; i++) {
    for (let j = i + 1; j < classesForDay.length; j++) {
      const c1 = classesForDay[i];
      const c2 = classesForDay[j];
      if (c1.start_time < c2.end_time && c2.start_time < c1.end_time) {
        conflicts.push(`Schedule Conflict: ${c1.course.code} and ${c2.course.code} overlap.`);
      }
    }
  }

  const handleAddClass = async () => {
    if (!courseCode.trim() || !courseName.trim() || !roomNumber.trim()) {
      Alert.alert('Required Fields', 'Please enter course code, name, and room number.');
      return;
    }

    const payload = {
      course: {
        id: Date.now(),
        name: courseName.trim(),
        code: courseCode.trim().toUpperCase(),
        credits: 4,
        assigned_faculty: { id: Date.now(), name: facultyName.trim(), department: 'CSE', email: 'faculty@lpu.co.in', office_room: roomNumber }
      },
      day_of_week: selectedDay,
      start_time: startTime + ':00',
      end_time: endTime + ':00',
      room_number: roomNumber.trim(),
      section: 'K22DF'
    };

    try {
      await api.addTimetableClass(payload);
      setWeeklyData((prev) =>
        prev.map((group) => {
          if (group.day_code === selectedDay) {
            return { ...group, classes: [...group.classes, payload] };
          }
          return group;
        })
      );
      setShowAddModal(false);
      Alert.alert('Class Added', `${payload.course.code} has been added to your timetable for ${selectedDay}.`);
    } catch (e) {}
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Header
        title="Smart Timetable"
        subtitle="Weekly Schedule & Conflict Detection"
        rightAction={
          <TouchableOpacity onPress={() => setShowAddModal(true)} style={[styles.addBtn, { backgroundColor: theme.colors.primary }]}>
            <Ionicons name="add" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        }
      />

      {/* Days Tabs */}
      <View style={[styles.daysContainer, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border }]}>
        {DAYS.map((d) => {
          const isSelected = selectedDay === d.code;
          return (
            <TouchableOpacity
              key={d.code}
              onPress={() => setSelectedDay(d.code)}
              style={[
                styles.dayTab,
                {
                  backgroundColor: isSelected ? theme.colors.primary : 'transparent',
                }
              ]}
            >
              <Text style={[styles.dayText, { color: isSelected ? '#FFFFFF' : theme.colors.textSecondary, fontWeight: isSelected ? '700' : '500' }]}>
                {d.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Conflict Warning Banner */}
        {conflicts.length > 0 && (
          <View style={[styles.conflictBanner, { backgroundColor: theme.colors.danger + '15', borderColor: theme.colors.danger }]}>
            <Ionicons name="warning" size={20} color={theme.colors.danger} />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={[styles.conflictTitle, { color: theme.colors.danger }]}>Timetable Conflict Detected</Text>
              {conflicts.map((c, i) => (
                <Text key={i} style={[styles.conflictSub, { color: theme.colors.text }]}>{c}</Text>
              ))}
            </View>
          </View>
        )}

        {/* Classes List */}
        <View style={styles.listHeaderRow}>
          <Text style={[styles.listHeader, { color: theme.colors.text }]}>
            {DAYS.find((d) => d.code === selectedDay)?.name} Schedule ({classesForDay.length} Classes)
          </Text>
        </View>

        {classesForDay.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Ionicons name="calendar-outline" size={48} color={theme.colors.textMuted} />
            <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>No classes scheduled for {selectedDay}</Text>
            <Button
              title="Add a Class"
              onPress={() => setShowAddModal(true)}
              variant="outline"
              size="sm"
              style={{ marginTop: 12 }}
            />
          </View>
        ) : (
          classesForDay.map((item, index) => (
            <Card key={index} style={styles.classCard}>
              <View style={styles.cardHeader}>
                <View style={styles.timeTag}>
                  <Ionicons name="time-outline" size={14} color={theme.colors.primary} />
                  <Text style={[styles.classTime, { color: theme.colors.primary }]}>
                    {item.start_time?.slice(0, 5)} - {item.end_time?.slice(0, 5)}
                  </Text>
                </View>

                <Badge label={`Room ${item.room_number}`} variant="secondary" size="sm" />
              </View>

              <Text style={[styles.courseCode, { color: theme.colors.primaryLight }]}>
                {item.course?.code}
              </Text>
              <Text style={[styles.courseTitle, { color: theme.colors.text }]}>
                {item.course?.name}
              </Text>

              <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />

              <View style={styles.footerRow}>
                <View style={styles.facultyRow}>
                  <Ionicons name="person-circle-outline" size={18} color={theme.colors.textSecondary} />
                  <Text style={[styles.facultyName, { color: theme.colors.textSecondary }]}>
                    {item.course?.assigned_faculty?.name || 'Dr. Faculty Member'}
                  </Text>
                </View>

                <Badge label={`${item.course?.credits || 4} Credits`} variant="info" size="sm" />
              </View>
            </Card>
          ))
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Add Class Modal */}
      <Modal visible={showAddModal} transparent animationType="slide">
        <View style={[styles.modalOverlay, { backgroundColor: theme.colors.overlay }]}>
          <View style={[styles.modalBox, { backgroundColor: theme.colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Add Class ({selectedDay})</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Ionicons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 400 }}>
              <Input
                label="Course Code"
                placeholder="e.g. CSE316"
                value={courseCode}
                onChangeText={setCourseCode}
              />
              <Input
                label="Course Name"
                placeholder="e.g. Operating Systems"
                value={courseName}
                onChangeText={setCourseName}
              />
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <Input
                    label="Start Time"
                    placeholder="09:00"
                    value={startTime}
                    onChangeText={setStartTime}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Input
                    label="End Time"
                    placeholder="10:00"
                    value={endTime}
                    onChangeText={setEndTime}
                  />
                </View>
              </View>
              <Input
                label="Room Number"
                placeholder="e.g. 34-402, 27-407"
                value={roomNumber}
                onChangeText={setRoomNumber}
              />
              <Input
                label="Faculty Name"
                placeholder="e.g. Dr. Amar Kumar"
                value={facultyName}
                onChangeText={setFacultyName}
              />
            </ScrollView>

            <Button
              title="Save to Timetable"
              onPress={handleAddClass}
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
  addBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  daysContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  dayTab: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
  },
  dayText: {
    fontSize: 13,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  conflictBanner: {
    flexDirection: 'row',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 14,
  },
  conflictTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  conflictSub: {
    fontSize: 12,
    marginTop: 2,
  },
  listHeaderRow: {
    marginBottom: 10,
  },
  listHeader: {
    fontSize: 16,
    fontWeight: '800',
  },
  emptyWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 14,
    marginTop: 10,
  },
  classCard: {
    padding: 16,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  classTime: {
    fontSize: 13,
    fontWeight: '700',
  },
  courseCode: {
    fontSize: 12,
    fontWeight: '800',
    marginTop: 8,
    letterSpacing: 0.5,
  },
  courseTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginTop: 2,
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  facultyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  facultyName: {
    fontSize: 13,
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
  }
});
