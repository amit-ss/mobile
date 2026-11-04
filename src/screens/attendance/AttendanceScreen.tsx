import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, RefreshControl
} from 'react-native';
import { useAppTheme } from '../../context/ThemeContext';
import { AttendanceSummary, AttendanceRecord } from '../../types';
import { api } from '../../services/api';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { CircularProgress } from '../../components/CircularProgress';
import { Button } from '../../components/Button';
import { Ionicons } from '@expo/vector-icons';

export const AttendanceScreen: React.FC = () => {
  const { theme, isDark } = useAppTheme();
  const [summary, setSummary] = useState<AttendanceSummary | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Predictor Sandbox State
  const [customTotal, setCustomTotal] = useState('30');
  const [customAttended, setCustomAttended] = useState('22');
  const [customTarget, setCustomTarget] = useState(75.0);
  const [predictionResult, setPredictionResult] = useState<any>(null);

  useEffect(() => {
    loadAttendance();
    calculatePrediction(30, 22, 75.0);
  }, []);

  const loadAttendance = async () => {
    try {
      const data = await api.getAttendanceSummary();
      setSummary(data);
    } catch (e) {
    } finally {
      setRefreshing(false);
    }
  };

  const calculatePrediction = async (tot: number, att: number, tgt: number) => {
    try {
      const res = await api.predictAttendance(tot, att, tgt);
      setPredictionResult(res);
    } catch (e) {}
  };

  const handlePredictSubmit = () => {
    const tot = parseInt(customTotal, 10) || 0;
    const att = parseInt(customAttended, 10) || 0;
    if (tot > 0 && att <= tot) {
      calculatePrediction(tot, att, customTarget);
    }
  };

  const selectSubjectToPredict = (rec: AttendanceRecord) => {
    setCustomTotal(String(rec.total_classes));
    setCustomAttended(String(rec.classes_attended));
    calculatePrediction(rec.total_classes, rec.classes_attended, customTarget);
  };

  const overallPct = summary?.overall_percentage || 82.4;
  const isSafe = overallPct >= 75.0;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Header
        title="Attendance Predictor"
        subtitle="LPU 75% Requirement Calculator"
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadAttendance(); }} />}
      >
        {/* Overall Circular Summary Card */}
        <Card style={styles.topCard}>
          <View style={styles.circleRow}>
            <CircularProgress percentage={overallPct} size={120} strokeWidth={10} />

            <View style={styles.topCardDetails}>
              <Badge
                label={isSafe ? "EXAM ELIGIBLE (>=75%)" : "SHORTAGE WARNING (<75%)"}
                variant={isSafe ? "success" : "danger"}
                size="md"
              />
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary, marginTop: 8 }]}>
                Total Held: <Text style={{ fontWeight: '700', color: theme.colors.text }}>{summary?.total_classes_held || 138}</Text>
              </Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                Attended: <Text style={{ fontWeight: '700', color: theme.colors.text }}>{summary?.total_classes_attended || 114}</Text>
              </Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                Target Goal: <Text style={{ fontWeight: '700', color: theme.colors.primary }}>75.0%</Text>
              </Text>
            </View>
          </View>
        </Card>

        {/* Interactive Prediction Sandbox */}
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>What-If Attendance Simulator</Text>

        <Card style={styles.simulatorCard}>
          <Text style={[styles.simDesc, { color: theme.colors.textSecondary }]}>
            Test how attending or missing future classes affects your end-term examination eligibility.
          </Text>

          <View style={styles.inputRow}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text style={[styles.fieldLabel, { color: theme.colors.textSecondary }]}>Classes Held</Text>
              <TextInput
                value={customTotal}
                onChangeText={(t) => { setCustomTotal(t); }}
                keyboardType="numeric"
                style={[styles.simInput, { backgroundColor: theme.colors.surfaceVariant, color: theme.colors.text, borderColor: theme.colors.border }]}
              />
            </View>

            <View style={{ flex: 1, marginRight: 8 }}>
              <Text style={[styles.fieldLabel, { color: theme.colors.textSecondary }]}>Classes Attended</Text>
              <TextInput
                value={customAttended}
                onChangeText={(t) => { setCustomAttended(t); }}
                keyboardType="numeric"
                style={[styles.simInput, { backgroundColor: theme.colors.surfaceVariant, color: theme.colors.text, borderColor: theme.colors.border }]}
              />
            </View>

            <View style={{ width: 90 }}>
              <Text style={[styles.fieldLabel, { color: theme.colors.textSecondary }]}>Target %</Text>
              <View style={[styles.targetBox, { backgroundColor: theme.colors.surfaceVariant, borderColor: theme.colors.border }]}>
                <Text style={{ fontWeight: '700', color: theme.colors.primary }}>{customTarget}%</Text>
              </View>
            </View>
          </View>

          {/* Target Selector Buttons */}
          <View style={styles.targetRow}>
            {[75, 80, 85, 90].map((t) => (
              <TouchableOpacity
                key={t}
                onPress={() => {
                  setCustomTarget(t);
                  calculatePrediction(parseInt(customTotal, 10) || 30, parseInt(customAttended, 10) || 22, t);
                }}
                style={[
                  styles.targetBtn,
                  {
                    backgroundColor: customTarget === t ? theme.colors.primary : theme.colors.surfaceVariant,
                  }
                ]}
              >
                <Text style={{ color: customTarget === t ? '#FFFFFF' : theme.colors.text, fontWeight: '700', fontSize: 12 }}>
                  {t}%
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Prediction Outcome Banner */}
          {predictionResult && (
            <View
              style={[
                styles.outcomeBanner,
                {
                  backgroundColor: predictionResult.is_eligible_for_exams ? theme.colors.success + '15' : theme.colors.danger + '15',
                  borderColor: predictionResult.is_eligible_for_exams ? theme.colors.success : theme.colors.danger,
                }
              ]}
            >
              <Ionicons
                name={predictionResult.is_eligible_for_exams ? 'shield-checkmark' : 'alert-circle'}
                size={24}
                color={predictionResult.is_eligible_for_exams ? theme.colors.success : theme.colors.danger}
              />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={[styles.outcomeTitle, { color: theme.colors.text }]}>
                  Current: {predictionResult.current_percentage}%
                </Text>
                <Text style={[styles.outcomeSub, { color: theme.colors.textSecondary }]}>
                  {predictionResult.message}
                </Text>
              </View>
            </View>
          )}

          <Button
            title="Recalculate Scenario"
            onPress={handlePredictSubmit}
            variant="outline"
            size="md"
            style={{ marginTop: 14 }}
          />
        </Card>

        {/* Subject-Wise Attendance Breakdown */}
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Subject-Wise Attendance</Text>

        {(summary?.records || []).map((item) => (
          <Card
            key={item.id}
            onPress={() => selectSubjectToPredict(item)}
            style={styles.subjectCard}
          >
            <View style={styles.subjectHeader}>
              <View>
                <Text style={[styles.subjectCode, { color: theme.colors.primary }]}>{item.subject_code}</Text>
                <Text style={[styles.subjectName, { color: theme.colors.text }]}>{item.subject_name}</Text>
              </View>

              <Badge
                label={`${item.current_percentage}%`}
                variant={item.status_level === 'safe' ? 'success' : item.status_level === 'warning' ? 'warning' : 'danger'}
                size="md"
              />
            </View>

            {/* Attendance Bar */}
            <View style={[styles.progressTrack, { backgroundColor: theme.colors.surfaceVariant }]}>
              <View
                style={[
                  styles.progressBar,
                  {
                    width: `${Math.min(100, item.current_percentage)}%`,
                    backgroundColor: item.current_percentage >= 75 ? theme.colors.success : theme.colors.danger,
                  }
                ]}
              />
            </View>

            <View style={styles.subjectFooter}>
              <Text style={[styles.footerStat, { color: theme.colors.textSecondary }]}>
                Attended: {item.classes_attended} / {item.total_classes}
              </Text>

              {item.current_percentage >= 75 ? (
                <Text style={[styles.missText, { color: theme.colors.success }]}>
                  Can miss {item.max_missable_classes} classes
                </Text>
              ) : (
                <Text style={[styles.missText, { color: theme.colors.danger }]}>
                  Must attend {item.classes_needed} classes
                </Text>
              )}
            </View>
          </Card>
        ))}

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
  topCard: {
    padding: 20,
    marginBottom: 16,
  },
  circleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  topCardDetails: {
    flex: 1,
    marginLeft: 20,
  },
  statLabel: {
    fontSize: 13,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginVertical: 12,
  },
  simulatorCard: {
    padding: 18,
    marginBottom: 16,
  },
  simDesc: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 14,
  },
  inputRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 4,
  },
  simInput: {
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 15,
    fontWeight: '700',
  },
  targetBox: {
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  targetRow: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: 6,
  },
  targetBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
  },
  outcomeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginTop: 12,
  },
  outcomeTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  outcomeSub: {
    fontSize: 12,
    marginTop: 2,
  },
  subjectCard: {
    padding: 16,
    marginBottom: 10,
  },
  subjectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  subjectCode: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  subjectName: {
    fontSize: 15,
    fontWeight: '700',
    marginTop: 2,
  },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginVertical: 12,
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  subjectFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerStat: {
    fontSize: 12,
    fontWeight: '600',
  },
  missText: {
    fontSize: 12,
    fontWeight: '700',
  }
});
