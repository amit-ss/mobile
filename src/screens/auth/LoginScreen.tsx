import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList, RootStackParamList } from '../../types';
import { useAppTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { Ionicons } from '@expo/vector-icons';

export const LoginScreen: React.FC = () => {
  const { theme } = useAppTheme();
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList & RootStackParamList>>();
  const { login } = useAuth();

  const [identifier, setIdentifier] = useState('12204567');
  const [password, setPassword] = useState('Student@123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!identifier.trim() || !password.trim()) {
      setError('Please enter your registration number and password.');
      return;
    }
    setError('');
    setLoading(true);
    const success = await login(identifier.trim(), password.trim());
    setLoading(false);

    if (success) {
      navigation.replace('Main');
    } else {
      Alert.alert('Login Failed', 'Invalid credentials. Please verify your Registration Number and Password.');
    }
  };

  const autofillDemo = () => {
    setIdentifier('12204567');
    setPassword('Student@123');
    setError('');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <View style={[styles.iconBadge, { backgroundColor: theme.colors.primary }]}>
            <Ionicons name="school-outline" size={36} color="#FFFFFF" />
          </View>
          <Text style={[styles.welcomeTitle, { color: theme.colors.text }]}>Welcome Back!</Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            Sign in with your Lovely Professional University credentials
          </Text>
        </View>

        <View style={styles.form}>
          <Input
            label="Registration Number or Email"
            placeholder="e.g. 12204567 or student@lpu.in"
            value={identifier}
            onChangeText={setIdentifier}
            icon="person-outline"
            error={error ? error : undefined}
          />

          <Input
            label="Password"
            placeholder="••••••••"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            icon="lock-closed-outline"
          />

          <TouchableOpacity
            onPress={() => navigation.navigate('ForgotPassword')}
            style={styles.forgotBtn}
          >
            <Text style={[styles.forgotText, { color: theme.colors.primary }]}>Forgot Password?</Text>
          </TouchableOpacity>

          <Button
            title="Log In to CampusGPT"
            onPress={handleLogin}
            loading={loading}
            size="lg"
            style={{ marginTop: 12 }}
          />

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={autofillDemo}
            style={[styles.demoCard, { backgroundColor: theme.colors.surfaceVariant, borderColor: theme.colors.border }]}
          >
            <Ionicons name="flash-outline" size={18} color={theme.colors.secondary} />
            <Text style={[styles.demoText, { color: theme.colors.textSecondary }]}>
              Autofill LPU Demo Account: <Text style={{ fontWeight: '700', color: theme.colors.text }}>12204567</Text>
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: theme.colors.textSecondary }]}>
            Don't have an account?{' '}
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={[styles.signupLink, { color: theme.colors.primary }]}>Register Now</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 30,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  iconBadge: {
    width: 74,
    height: 74,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  form: {
    width: '100%',
  },
  forgotBtn: {
    alignSelf: 'flex-end',
    marginVertical: 8,
  },
  forgotText: {
    fontSize: 13,
    fontWeight: '600',
  },
  demoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
    marginTop: 20,
    gap: 8,
  },
  demoText: {
    fontSize: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  footerText: {
    fontSize: 14,
  },
  signupLink: {
    fontSize: 14,
    fontWeight: '700',
  }
});
