import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { SplashScreen } from '../screens/auth/SplashScreen';
import { OnboardingScreen } from '../screens/auth/OnboardingScreen';
import { AuthNavigator } from './AuthNavigator';
import { BottomTabNavigator } from './BottomTabNavigator';

// Deep Screens
import { TimetableScreen } from '../screens/timetable/TimetableScreen';
import { AttendanceScreen } from '../screens/attendance/AttendanceScreen';
import { StudyAssistantScreen } from '../screens/study/StudyAssistantScreen';
import { FlashcardsScreen } from '../screens/study/FlashcardsScreen';
import { LostFoundScreen } from '../screens/lostfound/LostFoundScreen';
import { ReportItemScreen } from '../screens/lostfound/ReportItemScreen';
import { CareerScreen } from '../screens/career/CareerScreen';
import { StudyPartnerScreen } from '../screens/partner/StudyPartnerScreen';
import { QRScannerScreen } from '../screens/campus/QRScannerScreen';
import { EventDetailScreen } from '../screens/events/EventDetailScreen';
import { NotificationsScreen } from '../screens/notifications/NotificationsScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="Splash"
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="Auth" component={AuthNavigator} />
      <Stack.Screen name="Main" component={BottomTabNavigator} />

      {/* Module Stacks */}
      <Stack.Screen name="Timetable" component={TimetableScreen} />
      <Stack.Screen name="Attendance" component={AttendanceScreen} />
      <Stack.Screen name="StudyAssistant" component={StudyAssistantScreen} />
      <Stack.Screen name="Flashcards" component={FlashcardsScreen} />
      <Stack.Screen name="LostFound" component={LostFoundScreen} />
      <Stack.Screen name="ReportItem" component={ReportItemScreen} />
      <Stack.Screen name="Career" component={CareerScreen} />
      <Stack.Screen name="StudyPartner" component={StudyPartnerScreen} />
      <Stack.Screen name="QRScanner" component={QRScannerScreen} />
      <Stack.Screen name="EventDetail" component={EventDetailScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
    </Stack.Navigator>
  );
};
