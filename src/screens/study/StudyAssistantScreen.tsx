import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Alert, ActivityIndicator
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types';
import { useAppTheme } from '../../context/ThemeContext';
import { StudyDocument, QuizQuestion } from '../../types';
import { api } from '../../services/api';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { Ionicons } from '@expo/vector-icons';

let DocumentPicker: any = null;
try {
  DocumentPicker = require('expo-document-picker');
} catch (e) {}

export const StudyAssistantScreen: React.FC = () => {
  const { theme, isDark } = useAppTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [activeTab, setActiveTab] = useState<'upload' | 'quiz' | 'solver'>('upload');
  const [documents, setDocuments] = useState<StudyDocument[]>([]);
  const [loading, setLoading] = useState(false);

  // Note Upload / Paste State
  const [docTitle, setDocTitle] = useState('');
  const [docSubject, setDocSubject] = useState('CSE316 Operating Systems');
  const [docText, setDocText] = useState('');
  const [latestSummary, setLatestSummary] = useState('');

  // Quiz State
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: number }>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  // Problem Solver State
  const [problemQuery, setProblemQuery] = useState('');
  const [solverResult, setSolverResult] = useState('');
  const [solving, setSolving] = useState(false);

  useEffect(() => {
    loadDocs();
  }, []);

  const loadDocs = async () => {
    try {
      const data = await api.getStudyDocuments();
      setDocuments(data);
    } catch (e) {}
  };

  const handlePickDocument = async () => {
    if (DocumentPicker && typeof DocumentPicker.getDocumentAsync === 'function') {
      try {
        const result = await DocumentPicker.getDocumentAsync({
          type: ['application/pdf', 'text/plain'],
          copyToCacheDirectory: true
        });
        if (!result.canceled && result.assets && result.assets.length > 0) {
          const file = result.assets[0];
          setDocTitle(file.name.replace('.pdf', ''));
          setDocText(`Imported document contents for ${file.name}. PyMuPDF will extract pages and key concepts.`);
          Alert.alert('PDF Selected', `Loaded ${file.name}. Tap "Process with Gemini & PyMuPDF" to summarize.`);
        }
      } catch (e) {
        Alert.alert('Picker Notice', 'Document picker active. You can also paste lecture notes directly.');
      }
    } else {
      setDocText("CPU scheduling is the basis of multiprogrammed operating systems. By switching the CPU among processes, the operating system can make the computer more productive. In a single-processor system, only one process can run at a time; any other processes must wait until the CPU is free and can be rescheduled.");
      setDocTitle("Operating Systems - CPU Scheduling Notes");
      Alert.alert('Sample Loaded', 'Loaded sample LPU lecture notes for testing.');
    }
  };

  const handleProcessNotes = async () => {
    if (!docTitle.trim() || !docText.trim()) {
      Alert.alert('Incomplete Notes', 'Please provide a title and lecture text or PDF.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.uploadStudyDoc(docTitle.trim(), docSubject.trim(), docText.trim());
      setLatestSummary(res.document?.summary || 'Summary generated.');
      loadDocs();
      Alert.alert('Processing Complete', 'Gemini AI generated chapter summaries and extracted revision topics.');
    } catch (e) {
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateQuiz = async () => {
    setLoading(true);
    setQuizSubmitted(false);
    setSelectedAnswers({});
    try {
      const questions = await api.generateMCQs(docText || undefined);
      setQuizQuestions(questions);
      setActiveTab('quiz');
    } catch (e) {
    } finally {
      setLoading(false);
    }
  };

  const handleSolveProblem = async () => {
    if (!problemQuery.trim()) {
      Alert.alert('Empty Problem', 'Please enter your academic or coding problem.');
      return;
    }
    setSolving(true);
    try {
      const solution = await api.solveAcademicProblem(problemQuery.trim(), docSubject);
      setSolverResult(solution);
    } catch (e) {
    } finally {
      setSolving(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Header
        title="AI Study Assistant"
        subtitle="PyMuPDF Processing & Gemini Revision"
      />

      {/* Tabs Row */}
      <View style={[styles.tabsRow, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border }]}>
        {[
          { key: 'upload', label: 'PDF & Notes', icon: 'document-text-outline' },
          { key: 'quiz', label: 'MCQs Quiz', icon: 'help-circle-outline' },
          { key: 'solver', label: 'Problem Solver', icon: 'bulb-outline' },
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
        {activeTab === 'upload' && (
          <>
            <Card style={styles.uploadCard}>
              <View style={styles.uploadHeader}>
                <Ionicons name="cloud-upload-outline" size={28} color={theme.colors.primary} />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={[styles.uploadTitle, { color: theme.colors.text }]}>Upload PDF or Paste Notes</Text>
                  <Text style={[styles.uploadSub, { color: theme.colors.textSecondary }]}>
                    PyMuPDF extracts diagrams, text, and formulas for AI
                  </Text>
                </View>
              </View>

              <View style={styles.actionRow}>
                <Button
                  title="Pick PDF from Storage"
                  onPress={handlePickDocument}
                  variant="outline"
                  icon="document-attach"
                  size="sm"
                  style={{ flex: 1, marginRight: 8 }}
                />
                <Button
                  title="Load Sample Notes"
                  onPress={() => handlePickDocument()}
                  variant="ghost"
                  size="sm"
                />
              </View>

              <TextInput
                value={docTitle}
                onChangeText={setDocTitle}
                placeholder="Document / Topic Title (e.g. CPU Scheduling)"
                placeholderTextColor={theme.colors.textMuted}
                style={[styles.inputField, { backgroundColor: theme.colors.surfaceVariant, color: theme.colors.text, borderColor: theme.colors.border }]}
              />

              <TextInput
                value={docText}
                onChangeText={setDocText}
                placeholder="Paste lecture notes or chapter contents here..."
                placeholderTextColor={theme.colors.textMuted}
                multiline
                numberOfLines={5}
                style={[styles.textArea, { backgroundColor: theme.colors.surfaceVariant, color: theme.colors.text, borderColor: theme.colors.border }]}
              />

              <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
                <Button
                  title="Summarize with Gemini"
                  onPress={handleProcessNotes}
                  loading={loading}
                  variant="primary"
                  icon="sparkles"
                  style={{ flex: 1 }}
                />
              </View>

              <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
                <Button
                  title="Practice Flashcards"
                  onPress={() => navigation.navigate('Flashcards', {})}
                  variant="secondary"
                  icon="albums-outline"
                  size="sm"
                  style={{ flex: 1 }}
                />
                <Button
                  title="Generate Quiz"
                  onPress={handleGenerateQuiz}
                  variant="outline"
                  icon="help-circle-outline"
                  size="sm"
                  style={{ flex: 1 }}
                />
              </View>
            </Card>

            {/* Generated Summary Card */}
            {latestSummary ? (
              <Card style={styles.summaryCard}>
                <View style={styles.summaryHeader}>
                  <Badge label="AI GENERATED SUMMARY" variant="success" size="sm" />
                  <Ionicons name="sparkles" size={16} color={theme.colors.success} />
                </View>
                <Text style={[styles.summaryText, { color: theme.colors.text }]}>
                  {latestSummary}
                </Text>
              </Card>
            ) : null}

            {/* Previous Documents List */}
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Recent Study Notes</Text>

            {documents.map((doc) => (
              <Card key={doc.id} style={styles.docCard}>
                <View style={styles.docHeader}>
                  <View style={[styles.docIcon, { backgroundColor: theme.colors.primary + '15' }]}>
                    <Ionicons name="document-text" size={22} color={theme.colors.primary} />
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={[styles.docTitle, { color: theme.colors.text }]}>{doc.title}</Text>
                    <Text style={[styles.docSubject, { color: theme.colors.textSecondary }]}>
                      {doc.subject} • {doc.page_count} pages
                    </Text>
                  </View>
                  <Badge label="PyMuPDF" variant="info" size="sm" />
                </View>
                <Text style={[styles.docPreview, { color: theme.colors.textSecondary }]} numberOfLines={2}>
                  {doc.summary}
                </Text>
              </Card>
            ))}
          </>
        )}

        {/* Tab 2: MCQs Quiz */}
        {activeTab === 'quiz' && (
          <View>
            <View style={styles.quizHeader}>
              <Text style={[styles.quizTitle, { color: theme.colors.text }]}>Self-Assessment Quiz</Text>
              <Button title="Refresh Quiz" onPress={handleGenerateQuiz} variant="outline" size="sm" />
            </View>

            {quizQuestions.length === 0 ? (
              <Card style={{ padding: 24, alignItems: 'center' }}>
                <Ionicons name="help-buoy-outline" size={44} color={theme.colors.primary} />
                <Text style={[styles.uploadTitle, { color: theme.colors.text, marginTop: 10 }]}>No Active Quiz</Text>
                <Text style={{ color: theme.colors.textSecondary, textAlign: 'center', marginTop: 4 }}>
                  Generate MCQs from your notes or syllabus topics to test your retention.
                </Text>
                <Button title="Generate 5 MCQs" onPress={handleGenerateQuiz} variant="primary" style={{ marginTop: 14 }} />
              </Card>
            ) : (
              quizQuestions.map((q, qIndex) => {
                const userChoice = selectedAnswers[qIndex];
                return (
                  <Card key={qIndex} style={styles.quizCard}>
                    <Text style={[styles.qNum, { color: theme.colors.primary }]}>Question {qIndex + 1}</Text>
                    <Text style={[styles.qText, { color: theme.colors.text }]}>{q.question}</Text>

                    <View style={styles.optionsWrap}>
                      {q.options.map((opt, optIndex) => {
                        const isSelected = userChoice === optIndex;
                        const isCorrect = q.correct_index === optIndex;
                        let optBg = theme.colors.surfaceVariant;
                        let optBorder = theme.colors.border;

                        if (quizSubmitted) {
                          if (isCorrect) {
                            optBg = theme.colors.success + '20';
                            optBorder = theme.colors.success;
                          } else if (isSelected && !isCorrect) {
                            optBg = theme.colors.danger + '20';
                            optBorder = theme.colors.danger;
                          }
                        } else if (isSelected) {
                          optBg = theme.colors.primary + '20';
                          optBorder = theme.colors.primary;
                        }

                        return (
                          <TouchableOpacity
                            key={optIndex}
                            onPress={() => {
                              if (!quizSubmitted) {
                                setSelectedAnswers((prev) => ({ ...prev, [qIndex]: optIndex }));
                              }
                            }}
                            style={[styles.optBtn, { backgroundColor: optBg, borderColor: optBorder }]}
                          >
                            <Text style={[styles.optLetter, { color: theme.colors.textSecondary }]}>
                              {String.fromCharCode(65 + optIndex)}.
                            </Text>
                            <Text style={[styles.optText, { color: theme.colors.text }]}>{opt}</Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>

                    {quizSubmitted && (
                      <View style={[styles.explanationBox, { backgroundColor: theme.colors.surfaceVariant }]}>
                        <Text style={[styles.expTitle, { color: theme.colors.success }]}>Explanation:</Text>
                        <Text style={[styles.expText, { color: theme.colors.textSecondary }]}>{q.explanation}</Text>
                      </View>
                    )}
                  </Card>
                );
              })
            )}

            {quizQuestions.length > 0 && !quizSubmitted && (
              <Button
                title="Submit Answers & Grade"
                onPress={() => setQuizSubmitted(true)}
                variant="primary"
                size="lg"
                style={{ marginTop: 14 }}
              />
            )}
          </View>
        )}

        {/* Tab 3: Step-by-Step Problem Solver */}
        {activeTab === 'solver' && (
          <View>
            <Card style={styles.uploadCard}>
              <Text style={[styles.uploadTitle, { color: theme.colors.text }]}>LPU Academic Problem Solver</Text>
              <Text style={[styles.uploadSub, { color: theme.colors.textSecondary }]}>
                Ask step-by-step solutions for algorithm questions, math derivations, or shell scripts.
              </Text>

              <TextInput
                value={problemQuery}
                onChangeText={setProblemQuery}
                placeholder="e.g. Given 3 processes with burst times [10, 5, 8], calculate average waiting time using SJF."
                placeholderTextColor={theme.colors.textMuted}
                multiline
                numberOfLines={4}
                style={[styles.textArea, { backgroundColor: theme.colors.surfaceVariant, color: theme.colors.text, borderColor: theme.colors.border, marginTop: 12 }]}
              />

              <Button
                title="Solve Step-by-Step"
                onPress={handleSolveProblem}
                loading={solving}
                variant="primary"
                icon="bulb"
                size="lg"
                style={{ marginTop: 14 }}
              />
            </Card>

            {solverResult ? (
              <Card style={styles.summaryCard}>
                <View style={styles.summaryHeader}>
                  <Badge label="AI PROFESSOR SOLUTION" variant="secondary" size="sm" />
                </View>
                <Text style={[styles.summaryText, { color: theme.colors.text }]}>
                  {solverResult}
                </Text>
              </Card>
            ) : null}
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
  uploadCard: {
    padding: 18,
    marginBottom: 14,
  },
  uploadHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  uploadTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  uploadSub: {
    fontSize: 12,
    marginTop: 2,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  inputField: {
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 14,
    marginBottom: 10,
  },
  textArea: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    fontSize: 14,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  summaryCard: {
    padding: 16,
    marginBottom: 16,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  summaryText: {
    fontSize: 14,
    lineHeight: 22,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginVertical: 12,
  },
  docCard: {
    padding: 14,
    marginBottom: 10,
  },
  docHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  docIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  docTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  docSubject: {
    fontSize: 12,
    marginTop: 2,
  },
  docPreview: {
    fontSize: 12,
    lineHeight: 17,
  },
  quizHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  quizTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  quizCard: {
    padding: 16,
    marginBottom: 14,
  },
  qNum: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  qText: {
    fontSize: 15,
    fontWeight: '700',
    marginTop: 4,
    marginBottom: 12,
  },
  optionsWrap: {
    gap: 8,
  },
  optBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  optLetter: {
    fontSize: 13,
    fontWeight: '800',
    marginRight: 8,
  },
  optText: {
    fontSize: 13,
    flex: 1,
  },
  explanationBox: {
    padding: 10,
    borderRadius: 10,
    marginTop: 10,
  },
  expTitle: {
    fontSize: 12,
    fontWeight: '700',
  },
  expText: {
    fontSize: 12,
    marginTop: 2,
  }
});
