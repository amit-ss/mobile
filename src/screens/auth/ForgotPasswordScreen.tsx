import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppTheme } from '../../context/ThemeContext';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { Ionicons } from '@expo/vector-icons';

export const ForgotPasswordScreen: React.FC = () => {
  const { theme } = useAppTheme();
  const navigation = useNavigation();
  const [identifier, setIdentifier] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleReset = async () => {
    if (!identifier.trim()) {
      Alert.alert('Required', 'Please enter your Registration Number or University Email.');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSent(true);
    }, 1000);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
        <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
      </TouchableOpacity>

      <View style={styles.content}>
        <View style={[styles.iconWrap, { backgroundColor: theme.colors.primary + '15' }]}>
          <Ionicons name="key-outline" size={48} color={theme.colors.primary} />
        </View>

        <Text style={[styles.title, { color: theme.colors.text }]}>Reset Password</Text>
        <Text style={[styles.desc, { color: theme.colors.textSecondary }]}>
          Enter your university registration number or email address to receive password reset instructions.
        </Text>

        {sent ? (
          <View style={[styles.successBox, { backgroundColor: theme.colors.success + '15', borderColor: theme.colors.success }]}>
            <Ionicons name="checkmark-circle" size={28} color={theme.colors.success} />
            <Text style={[styles.successText, { color: theme.colors.text }]}>
              Password reset link has been dispatched to the university email linked with {identifier}.
            </Text>
            <Button
              title="Return to Login"
              onPress={() => navigation.goBack()}
              variant="outline"
              size="md"
              style={{ marginTop: 14 }}
            />
          </View>
        ) : (
          <View style={{ width: '100%', marginTop: 20 }}>
            <Input
              label="Registration Number or Email"
              placeholder="e.g. 12204567"
              value={identifier}
              onChangeText={setIdentifier}
              icon="mail-outline"
            />

            <Button
              title="Send Reset Instructions"
              onPress={handleReset}
              loading={loading}
              size="lg"
              style={{ marginTop: 16 }}
            />
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 54,
  },
  backBtn: {
    padding: 6,
    alignSelf: 'flex-start',
  },
  content: {
    alignItems: 'center',
    paddingTop: 30,
  },
  iconWrap: {
    width: 90,
    height: 90,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
  },
  desc: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
    paddingHorizontal: 16,
  },
  successBox: {
    width: '100%',
    padding: 20,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    marginTop: 30,
  },
  successText: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 20,
  }
});
