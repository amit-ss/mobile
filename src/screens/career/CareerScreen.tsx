import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Alert, RefreshControl
} from 'react-native';
import { useAppTheme } from '../../context/ThemeContext';
import { InterviewQuestion, RoadmapStep } from '../../types';
import { api } from '../../services/api';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { CircularProgress } from '../../components/CircularProgress';
import { Ionicons } from '@expo/vector-icons';

export const CareerScreen: React.FC = () => {
  const { theme, isDark } = useAppTheme();
  const [activeTab, setActiveTab] = useState<'resume' | 'interview' | 'roadmap'>('resume');

  const [careerProfile, setCareerProfile] = useState<any>(null);
  const [interviewQuestions, setInterviewQuestions] = useState<InterviewQuestion[]>([]);
  const [selectedQuestionType, setSelectedQuestionType] = useState<'all' | 'technical' | 'hr' | 'dsa'>('all');
  const [roadmap, setRoadmap] = useState<RoadmapStep[]>([]);
  const [expandedQuestion, setExpandedQuestion] = useState<number | null>(null);

  // Resume analysis state
  const [resumeText, setResumeText] = useState('');
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    loadCareerData();
  }, [selectedQuestionType]);

  const loadCareerData = async () => {
    try {
      const [profile, questions, road] = await Promise.all([
        api.getCareerProfile(),
        api.getInterviewQuestions(selectedQuestionType === 'all' ? undefined : selectedQuestionType),
        api.getCareerRoadmap()
      ]);
      setCareerProfile(profile);
      setInterviewQuestions(questions);
      setRoadmap(road);
    } catch (e) {}
  };

  const handleAnalyzeResume = async () => {
    if (!resumeText.trim()) {
      Alert.alert('Resume Text Needed', 'Please paste your resume summary or project highlights.');
      return;
    }
    setAnalyzing(true);
    try {
      const res = await api.analyzeResume(resumeText.trim(), careerProfile?.target_role || "Full Stack AI Engineer");
      setCareerProfile((prev: any) => ({
        ...prev,
        resume_score: res.analysis?.score || 85,
        resume_analysis: res.analysis
      }));
      Alert.alert('Analysis Complete', `Resume scored ${res.analysis?.score}/100 with tailored suggestions!`);
    } catch (e) {
    } finally {
      setAnalyzing(false);
    }
  };

  const analysis = careerProfile?.resume_analysis || {};

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Header
        title="Career & Placements"
        subtitle="AI Resume Review, DSA & Mock Interviews"
      />

      {/* Tabs */}
      <View style={[styles.tabsRow, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border }]}>
        {[
          { key: 'resume', label: 'Resume Review', icon: 'document-text-outline' },
          { key: 'interview', label: 'Interview Prep', icon: 'chatbubbles-outline' },
          { key: 'roadmap', label: '8-Week Roadmap', icon: 'map-outline' },
        ].map((tab) => {
          const isSelected = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              onPress={() => setActiveTab(tab.key as any)}
              style={[
                styles.tabItem,
                { borderBottomColor: isSelected ? theme.colors.primary : 'transparent' }
              ]}
            >
              <Ionicons
                name={tab.icon as any}
                size={18}
                color={isSelected ? theme.colors.primary : theme.colors.textSecondary}
              />
              <Text
                style={[
                  styles.tabText,
                  { color: isSelected ? theme.colors.primary : theme.colors.textSecondary, fontWeight: isSelected ? '700' : '500' }
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Tab 1: Resume Review */}
        {activeTab === 'resume' && (
          <>
            <Card style={styles.scoreCard}>
              <View style={styles.scoreRow}>
                <CircularProgress
                  percentage={careerProfile?.resume_score || 84}
                  size={100}
                  strokeWidth={9}
                  subtitle="ATS Score"
                />
                <View style={{ flex: 1, marginLeft: 18 }}>
                  <Badge label="TARGET ROLE" variant="secondary" size="sm" />
                  <Text style={[styles.roleTitle, { color: theme.colors.text }]}>
                    {careerProfile?.target_role || "Full Stack AI Engineer"}
                  </Text>
                  <Text style={[styles.companyText, { color: theme.colors.textSecondary }]}>
                    Recruiters: Microsoft, Google, Cognizant
                  </Text>
                </View>
              </View>
            </Card>

            {/* Input Card */}
            <Card style={styles.inputCard}>
              <Text style={[styles.inputTitle, { color: theme.colors.text }]}>Analyze Your Resume with Gemini</Text>
              <Text style={[styles.inputSub, { color: theme.colors.textSecondary }]}>
                Paste your technical experience, GitHub links, and projects for instant critique.
              </Text>

              <TextInput
                value={resumeText}
                onChangeText={setResumeText}
                placeholder="e.g. B.Tech CSE student at LPU. Built full-stack AI apps using React Native and Django. LeetCode 200+ problems solved in Python..."
                placeholderTextColor={theme.colors.textMuted}
                multiline
                numberOfLines={4}
                style={[styles.resumeInput, { backgroundColor: theme.colors.surfaceVariant, color: theme.colors.text, borderColor: theme.colors.border }]}
              />

              <Button
                title="Evaluate Resume & ATS Keywords"
                onPress={handleAnalyzeResume}
                loading={analyzing}
                variant="primary"
                icon="sparkles"
                size="lg"
                style={{ marginTop: 12 }}
              />
            </Card>

            {/* Strengths */}
            {analysis.strengths && analysis.strengths.length > 0 && (
              <Card style={styles.critiqueCard}>
                <View style={styles.critiqueHeader}>
                  <Ionicons name="checkmark-circle" size={20} color={theme.colors.success} />
                  <Text style={[styles.critiqueTitle, { color: theme.colors.text }]}>Resume Strengths</Text>
                </View>
                {analysis.strengths.map((str: string, i: number) => (
                  <Text key={i} style={[styles.bulletItem, { color: theme.colors.textSecondary }]}>
                    • {str}
                  </Text>
                ))}
              </Card>
            )}

            {/* Improvements */}
            {analysis.improvements && analysis.improvements.length > 0 && (
              <Card style={styles.critiqueCard}>
                <View style={styles.critiqueHeader}>
                  <Ionicons name="trending-up" size={20} color={theme.colors.warning} />
                  <Text style={[styles.critiqueTitle, { color: theme.colors.text }]}>Areas to Enhance</Text>
                </View>
                {analysis.improvements.map((imp: string, i: number) => (
                  <Text key={i} style={[styles.bulletItem, { color: theme.colors.textSecondary }]}>
                    • {imp}
                  </Text>
                ))}
              </Card>
            )}

            {/* Keywords */}
            {analysis.keywords_to_add && analysis.keywords_to_add.length > 0 && (
              <Card style={styles.critiqueCard}>
                <Text style={[styles.critiqueTitle, { color: theme.colors.text, marginBottom: 8 }]}>
                  High-Yield Keywords to Include
                </Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                  {analysis.keywords_to_add.map((kw: string, i: number) => (
                    <Badge key={i} label={kw} variant="info" size="sm" />
                  ))}
                </View>
              </Card>
            )}
          </>
        )}

        {/* Tab 2: Interview Prep */}
        {activeTab === 'interview' && (
          <View>
            <View style={styles.filterPills}>
              {[
                { key: 'all', label: 'All Questions' },
                { key: 'technical', label: 'Technical Core' },
                { key: 'dsa', label: 'DSA & Coding' },
                { key: 'hr', label: 'HR Behavioral' },
              ].map((f) => (
                <TouchableOpacity
                  key={f.key}
                  onPress={() => setSelectedQuestionType(f.key as any)}
                  style={[
                    styles.pillBtn,
                    {
                      backgroundColor: selectedQuestionType === f.key ? theme.colors.primary : theme.colors.surfaceVariant,
                    }
                  ]}
                >
                  <Text style={{ color: selectedQuestionType === f.key ? '#FFFFFF' : theme.colors.text, fontSize: 12, fontWeight: '700' }}>
                    {f.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {interviewQuestions.map((q) => {
              const isExpanded = expandedQuestion === q.id;
              return (
                <Card
                  key={q.id}
                  onPress={() => setExpandedQuestion(isExpanded ? null : q.id)}
                  style={styles.qCard}
                >
                  <View style={styles.qHeader}>
                    <Badge
                      label={q.question_type.toUpperCase()}
                      variant={q.question_type === 'dsa' ? 'danger' : q.question_type === 'technical' ? 'primary' : 'secondary'}
                      size="sm"
                    />
                    <Badge label={q.difficulty} variant="warning" size="sm" />
                  </View>

                  <Text style={[styles.questionText, { color: theme.colors.text }]}>
                    {q.question}
                  </Text>

                  {isExpanded ? (
                    <View style={styles.expandedContent}>
                      <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
                      <Text style={[styles.sampleTitle, { color: theme.colors.primary }]}>Model Answer:</Text>
                      <Text style={[styles.sampleText, { color: theme.colors.textSecondary }]}>
                        {q.sample_answer}
                      </Text>

                      {q.tips ? (
                        <View style={[styles.tipsBox, { backgroundColor: theme.colors.surfaceVariant }]}>
                          <Text style={[styles.tipsTitle, { color: theme.colors.secondary }]}>💡 Interview Tip:</Text>
                          <Text style={[styles.tipsText, { color: theme.colors.textSecondary }]}>{q.tips}</Text>
                        </View>
                      ) : null}
                    </View>
                  ) : (
                    <Text style={[styles.expandHint, { color: theme.colors.primary }]}>Tap to view answer & tips</Text>
                  )}
                </Card>
              );
            })}
          </View>
        )}

        {/* Tab 3: Roadmap */}
        {activeTab === 'roadmap' && (
          <View>
            <Text style={[styles.roadmapIntro, { color: theme.colors.textSecondary }]}>
              Step-by-step 8-week placement preparation curriculum designed for LPU placement drives.
            </Text>

            {roadmap.map((step) => (
              <Card key={step.week} style={styles.stepCard}>
                <View style={styles.stepHeader}>
                  <View style={[styles.weekBadge, { backgroundColor: theme.colors.primary }]}>
                    <Text style={styles.weekText}>W{step.week}</Text>
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={[styles.stepTitle, { color: theme.colors.text }]}>{step.title}</Text>
                    <Text style={[styles.stepFocus, { color: theme.colors.primary }]}>{step.focus}</Text>
                  </View>
                  <Badge label={step.hours} variant="info" size="sm" />
                </View>

                <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />

                <Text style={[styles.milestoneText, { color: theme.colors.textSecondary }]}>
                  🎯 <Text style={{ fontWeight: '700', color: theme.colors.text }}>Milestone:</Text> {step.milestone}
                </Text>
              </Card>
            ))}
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabsRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  tabItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderBottomWidth: 2,
    gap: 6,
  },
  tabText: {
    fontSize: 13,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  scoreCard: {
    padding: 18,
    marginBottom: 14,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  roleTitle: {
    fontSize: 17,
    fontWeight: '800',
    marginTop: 6,
  },
  companyText: {
    fontSize: 12,
    marginTop: 2,
  },
  inputCard: {
    padding: 16,
    marginBottom: 14,
  },
  inputTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  inputSub: {
    fontSize: 12,
    lineHeight: 17,
    marginTop: 2,
    marginBottom: 10,
  },
  resumeInput: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    fontSize: 13,
    minHeight: 90,
    textAlignVertical: 'top',
  },
  critiqueCard: {
    padding: 16,
    marginBottom: 10,
  },
  critiqueHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  critiqueTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  bulletItem: {
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 4,
  },
  filterPills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  pillBtn: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 14,
  },
  qCard: {
    padding: 16,
    marginBottom: 10,
  },
  qHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  questionText: {
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 21,
  },
  expandHint: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 8,
  },
  expandedContent: {
    marginTop: 8,
  },
  divider: {
    height: 1,
    marginVertical: 10,
  },
  sampleTitle: {
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 4,
  },
  sampleText: {
    fontSize: 13,
    lineHeight: 19,
  },
  tipsBox: {
    padding: 10,
    borderRadius: 10,
    marginTop: 10,
  },
  tipsTitle: {
    fontSize: 12,
    fontWeight: '700',
  },
  tipsText: {
    fontSize: 12,
    marginTop: 2,
  },
  roadmapIntro: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 14,
  },
  stepCard: {
    padding: 16,
    marginBottom: 10,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  weekBadge: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
  stepTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  stepFocus: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  milestoneText: {
    fontSize: 13,
  }
});
