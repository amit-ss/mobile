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

export const RegisterScreen: React.FC = () => {
  const { theme } = useAppTheme();
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList & RootStackParamList>>();
  const { register } = useAuth();

  const [fullName, setFullName] = useState('');
  const [regNumber, setRegNumber] = useState('');
  const [email, setEmail] = useState('');
  const [course, setCourse] = useState('B.Tech Computer Science & Engineering');
  const [branch, setBranch] = useState('CSE');
  const [semester, setSemester] = useState('5');
  const [section, setSection] = useState('K22DF');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!fullName.trim() || !regNumber.trim() || !email.trim() || !password.trim()) {
      Alert.alert('Incomplete Form', 'Please fill in your name, registration number, email, and password.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Password Mismatch', 'The passwords you entered do not match.');
      return;
    }

    const nameParts = fullName.trim().split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ') || 'Student';

    setLoading(true);
    const success = await register({
      username: regNumber.trim(),
      reg_number: regNumber.trim(),
      email: email.trim(),
      first_name: firstName,
      last_name: lastName,
      course: course.trim(),
      branch: branch.trim(),
      semester: parseInt(semester, 10) || 5,
      section: section.trim(),
      password: password.trim()
    });
    setLoading(false);

    if (success) {
      Alert.alert('Account Created', 'Welcome to CampusGPT! Your LPU profile is ready.', [
        { text: 'Continue', onPress: () => navigation.replace('Main') }
      ]);
    } else {
      Alert.alert('Registration Notice', 'Unable to create account. Registration number might already be registered.');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.topNav}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Student Registration</Text>
          <View style={{ width: 24 }} />
        </View>

        <Text style={[styles.desc, { color: theme.colors.textSecondary }]}>
          Join the AI-powered student community of Lovely Professional University.
        </Text>

        <View style={styles.form}>
          <Input
            label="Full Name"
            placeholder="e.g. Amit Singh"
            value={fullName}
            onChangeText={setFullName}
            icon="person-outline"
          />

          <Input
            label="Registration Number"
            placeholder="e.g. 12204567"
            value={regNumber}
            onChangeText={setRegNumber}
            keyboardType="numeric"
            icon="card-outline"
          />

          <Input
            label="University Email"
            placeholder="e.g. amit.singh@lpu.in"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            icon="mail-outline"
          />

          <Input
            label="Degree & Course"
            placeholder="e.g. B.Tech Computer Science & Engineering"
            value={course}
            onChangeText={setCourse}
            icon="book-outline"
          />

          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Input
                label="Branch"
                placeholder="CSE"
                value={branch}
                onChangeText={setBranch}
              />
            </View>
            <View style={{ width: 90, marginRight: 8 }}>
              <Input
                label="Semester"
                placeholder="5"
                value={semester}
                onChangeText={setSemester}
                keyboardType="numeric"
              />
            </View>
            <View style={{ width: 100 }}>
              <Input
                label="Section"
                placeholder="K22DF"
                value={section}
                onChangeText={setSection}
              />
            </View>
          </View>

          <Input
            label="Password"
            placeholder="Minimum 6 characters"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            icon="lock-closed-outline"
          />

          <Input
            label="Confirm Password"
            placeholder="Re-enter password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            icon="shield-checkmark-outline"
          />

          <Button
            title="Create Student Account"
            onPress={handleRegister}
            loading={loading}
            size="lg"
            style={{ marginTop: 18 }}
          />
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: theme.colors.textSecondary }]}>
            Already registered?{' '}
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={[styles.signinLink, { color: theme.colors.primary }]}>Sign In</Text>
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
    paddingHorizontal: 22,
    paddingTop: 50,
    paddingBottom: 40,
  },
  topNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  backBtn: {
    padding: 6,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
  desc: {
    fontSize: 13,
    marginBottom: 20,
    lineHeight: 18,
  },
  form: {
    width: '100%',
  },
  row: {
    flexDirection: 'row',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 26,
  },
  footerText: {
    fontSize: 14,
  },
  signinLink: {
    fontSize: 14,
    fontWeight: '700',
  }
});
