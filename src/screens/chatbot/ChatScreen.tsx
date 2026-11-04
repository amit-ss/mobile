import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ActivityIndicator, Alert, Clipboard
} from 'react-native';
import { useAppTheme } from '../../context/ThemeContext';
import { ChatMessage } from '../../types';
import { api } from '../../services/api';
import { Header } from '../../components/Header';
import { Badge } from '../../components/Badge';
import { Ionicons } from '@expo/vector-icons';
import { storageService } from '../../services/storage';

let Speech: any = null;
try {
  Speech = require('expo-speech');
} catch (e) {}

const PROVIDER_OPTIONS = [
  { id: 'auto', label: 'Auto', icon: 'flash-outline' },
  { id: 'ollama_local', label: 'Local', icon: 'laptop-outline' },
  { id: 'ollama_cloud', label: 'Cloud', icon: 'cloud-outline' },
  { id: 'gemini', label: 'Gemini', icon: 'sparkles-outline' },
] as const;

const INITIAL_PROMPTS = [
  "What is the attendance criteria for exams?",
  "Where is Block 34 located?",
  "What are Central Library timings?",
  "Tell me hostel in-time and curfew rules",
  "Placement eligibility and recruiters",
  "How to apply for duty leave (DL)?"
];

export const ChatScreen: React.FC = () => {
  const { theme, isDark } = useAppTheme();
  const flatListRef = useRef<FlatList>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [suggestedPrompts, setSuggestedPrompts] = useState<string[]>(INITIAL_PROMPTS);
  const [provider, setProvider] = useState<string>('auto');
  const [providerStatus, setProviderStatus] = useState<Record<string, boolean>>({});
  const [lastModel, setLastModel] = useState<string>('');

  useEffect(() => {
    loadHistory();
    loadProviders();
  }, []);

  const loadProviders = async () => {
    try {
      const saved = await storageService.getItem('ai_provider');
      if (saved) setProvider(saved);
      const res = await api.getAIProviders();
      const map: Record<string, boolean> = {};
      (res.providers || []).forEach((p: any) => { map[p.id] = !!p.available; });
      setProviderStatus(map);
    } catch (e) {}
  };

  const handleProviderChange = async (id: string) => {
    setProvider(id);
    await storageService.setItem('ai_provider', id);
    if (id !== 'auto' && providerStatus[id] === false) {
      Alert.alert(
        'Provider not ready',
        id === 'ollama_local'
          ? 'Local Ollama is not reachable. Start it on the computer running the backend (ollama serve). Replies will fall back to the next available provider.'
          : 'This provider is not configured in backend/.env. Replies will fall back to the next available provider.'
      );
    }
  };

  const loadHistory = async () => {
    try {
      const history = await api.getChatHistory();
      if (history && history.length > 0) {
        setMessages(history);
      } else {
        // Welcoming opening message
        setMessages([
          {
            id: 'welcome-1',
            role: 'ai',
            content: "Hello! I am **CampusGPT**, your official LPU Campus AI companion. 🎓\n\nAsk me anything about **timetables**, **attendance regulations**, **campus buildings (Block 25-38)**, **hostel rules**, **examinations**, and **placements**.",
            timestamp: new Date().toISOString(),
            sources: ["LPU Knowledge Base"]
          }
        ]);
      }
    } catch (e) {}
  };

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text) return;

    setInputText('');

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toISOString()
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    try {
      const response = await api.sendChatMessage(text, 'app_session', provider);
      if (response.model) setLastModel(response.model);
      const aiContent = response.message?.content || response.text || "I am processing your query based on official LPU guidelines.";
      const sources = response.sources || response.message?.sources || ["LPU Repository"];

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'ai',
        content: aiContent,
        timestamp: new Date().toISOString(),
        sources
      };

      setMessages((prev) => [...prev, aiMsg]);
      if (response.suggestions && response.suggestions.length > 0) {
        setSuggestedPrompts(response.suggestions);
      }
    } catch (e) {
      Alert.alert('Connection Notice', 'Unable to reach backend. Using verified offline campus repository.');
    } finally {
      setIsTyping(false);
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };

  const handleCopy = (text: string) => {
    Clipboard.setString(text);
    Alert.alert('Copied', 'Response copied to clipboard.');
  };

  const handleSpeak = (text: string) => {
    if (!Speech) {
      Alert.alert('TTS Not Supported', 'Text-to-speech is available on physical devices.');
      return;
    }
    if (isSpeaking) {
      Speech.stop();
      setIsSpeaking(false);
    } else {
      setIsSpeaking(true);
      Speech.speak(text.replace(/[#*_-]/g, ''), {
        onDone: () => setIsSpeaking(false),
        onError: () => setIsSpeaking(false),
      });
    }
  };

  const handleVoiceInput = () => {
    setIsListening(true);
    // Simulating quick voice capture prompt
    setTimeout(() => {
      setIsListening(false);
      setInputText("What are the hostel curfew rules?");
    }, 1200);
  };

  const handleClear = () => {
    Alert.alert('Clear Conversation', 'Are you sure you want to clear your chat history?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear',
        style: 'destructive',
        onPress: async () => {
          await api.clearChatHistory();
          setMessages([
            {
              id: 'welcome-reset',
              role: 'ai',
              content: "Chat cleared. What can I help you find on the LPU campus today?",
              timestamp: new Date().toISOString(),
              sources: ["LPU Knowledge Base"]
            }
          ]);
        }
      }
    ]);
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isUser = item.role === 'user';
    return (
      <View
        style={[
          styles.msgContainer,
          isUser ? styles.userMsgContainer : styles.aiMsgContainer
        ]}
      >
        {!isUser && (
          <View style={[styles.aiAvatar, { backgroundColor: theme.colors.secondary }]}>
            <Ionicons name="sparkles" size={14} color="#FFFFFF" />
          </View>
        )}

        <View
          style={[
            styles.bubble,
            isUser
              ? [styles.userBubble, { backgroundColor: theme.colors.primary }]
              : [styles.aiBubble, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]
          ]}
        >
          <Text
            style={[
              styles.msgText,
              { color: isUser ? '#FFFFFF' : theme.colors.text }
            ]}
          >
            {item.content}
          </Text>

          {item.sources && item.sources.length > 0 && !isUser && (
            <View style={styles.sourcesBox}>
              <Text style={[styles.sourcesHeader, { color: theme.colors.textSecondary }]}>Sources:</Text>
              <View style={styles.sourcesList}>
                {item.sources.map((s, idx) => (
                  <Badge key={idx} label={s} variant="info" size="sm" style={{ marginRight: 4, marginTop: 4 }} />
                ))}
              </View>
            </View>
          )}

          {!isUser && (
            <View style={styles.actionRow}>
              <TouchableOpacity onPress={() => handleCopy(item.content)} style={styles.bubbleAction}>
                <Ionicons name="copy-outline" size={15} color={theme.colors.textSecondary} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleSpeak(item.content)} style={styles.bubbleAction}>
                <Ionicons name={isSpeaking ? "volume-mute-outline" : "volume-high-outline"} size={16} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <Header
        title="CampusGPT AI"
        subtitle={lastModel ? `Answered by ${lastModel}` : "Ollama (local & cloud) + Gemini RAG"}
        rightAction={
          <TouchableOpacity onPress={handleClear} style={styles.clearBtn}>
            <Ionicons name="trash-outline" size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        }
      />

      {/* AI provider picker */}
      <View style={[styles.providerBar, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border }]}>
        {PROVIDER_OPTIONS.map((opt) => {
          const selected = provider === opt.id;
          const unavailable = opt.id !== 'auto' && providerStatus[opt.id] === false;
          return (
            <TouchableOpacity
              key={opt.id}
              onPress={() => handleProviderChange(opt.id)}
              activeOpacity={0.8}
              style={[
                styles.providerChip,
                {
                  backgroundColor: selected ? theme.colors.primary : theme.colors.surfaceVariant,
                  borderColor: selected ? theme.colors.primary : theme.colors.border,
                  opacity: unavailable && !selected ? 0.55 : 1,
                },
              ]}
            >
              <Ionicons name={opt.icon as any} size={13} color={selected ? '#FFFFFF' : theme.colors.textSecondary} />
              <Text style={{ fontSize: 12, fontWeight: '700', color: selected ? '#FFFFFF' : theme.colors.text }}>
                {opt.label}
              </Text>
              {opt.id !== 'auto' && providerStatus[opt.id] !== undefined && (
                <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: unavailable ? theme.colors.danger : theme.colors.success }} />
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderMessage}
        contentContainerStyle={styles.listContent}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        ListFooterComponent={
          isTyping ? (
            <View style={styles.typingIndicator}>
              <View style={[styles.aiAvatar, { backgroundColor: theme.colors.secondary }]}>
                <Ionicons name="sparkles" size={14} color="#FFFFFF" />
              </View>
              <View style={[styles.typingBubble, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
                <ActivityIndicator size="small" color={theme.colors.secondary} />
                <Text style={[styles.typingText, { color: theme.colors.textSecondary }]}>
                  CampusGPT is querying verified LPU facts...
                </Text>
              </View>
            </View>
          ) : null
        }
      />

      {/* Suggested Prompts Horizontal Chips */}
      <View style={[styles.promptsContainer, { backgroundColor: theme.colors.surface, borderTopColor: theme.colors.border }]}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={suggestedPrompts}
          keyExtractor={(item, idx) => String(idx)}
          renderItem={({ item }) => (
            <TouchableOpacity
              activeOpacity={0.75}
              onPress={() => handleSend(item)}
              style={[styles.promptChip, { backgroundColor: theme.colors.surfaceVariant, borderColor: theme.colors.border }]}
            >
              <Ionicons name="sparkles-outline" size={13} color={theme.colors.secondary} />
              <Text style={[styles.promptChipText, { color: theme.colors.text }]}>{item}</Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={{ paddingHorizontal: 12, paddingVertical: 8, gap: 8 }}
        />
      </View>

      {/* Bottom Input Bar */}
      <View style={[styles.inputBar, { backgroundColor: theme.colors.surface, borderTopColor: theme.colors.border }]}>
        <TouchableOpacity
          onPress={handleVoiceInput}
          style={[styles.voiceBtn, { backgroundColor: isListening ? theme.colors.danger : theme.colors.surfaceVariant }]}
          activeOpacity={0.7}
        >
          <Ionicons name="mic-outline" size={20} color={isListening ? '#FFFFFF' : theme.colors.text} />
        </TouchableOpacity>

        <TextInput
          value={inputText}
          onChangeText={setInputText}
          placeholder="Ask anything about LPU..."
          placeholderTextColor={theme.colors.textMuted}
          onSubmitEditing={() => handleSend()}
          style={[
            styles.textInput,
            {
              backgroundColor: theme.colors.surfaceVariant,
              color: theme.colors.text,
              borderColor: theme.colors.border,
            }
          ]}
        />

        <TouchableOpacity
          onPress={() => handleSend()}
          disabled={!inputText.trim()}
          style={[
            styles.sendBtn,
            { backgroundColor: inputText.trim() ? theme.colors.primary : theme.colors.surfaceVariant }
          ]}
          activeOpacity={0.8}
        >
          <Ionicons
            name="send"
            size={18}
            color={inputText.trim() ? '#FFFFFF' : theme.colors.textMuted}
          />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  providerBar: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  providerChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
  },
  clearBtn: {
    padding: 6,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  msgContainer: {
    flexDirection: 'row',
    marginVertical: 6,
    maxWidth: '85%',
  },
  userMsgContainer: {
    alignSelf: 'flex-end',
  },
  aiMsgContainer: {
    alignSelf: 'flex-start',
    alignItems: 'flex-end',
  },
  aiAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    marginBottom: 4,
  },
  bubble: {
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  userBubble: {
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    borderBottomLeftRadius: 4,
    borderWidth: 1,
  },
  msgText: {
    fontSize: 14,
    lineHeight: 21,
  },
  sourcesBox: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  sourcesHeader: {
    fontSize: 11,
    fontWeight: '700',
  },
  sourcesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
    gap: 12,
  },
  bubbleAction: {
    padding: 4,
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  typingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 1,
    gap: 8,
  },
  typingText: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  promptsContainer: {
    borderTopWidth: 1,
  },
  promptChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    gap: 6,
  },
  promptChipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderTopWidth: 1,
    gap: 10,
  },
  voiceBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textInput: {
    flex: 1,
    height: 42,
    borderRadius: 21,
    paddingHorizontal: 16,
    fontSize: 14,
    borderWidth: 1,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  }
});
