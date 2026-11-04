import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from '../types';
import { useAppTheme } from '../context/ThemeContext';
import { HomeScreen } from '../screens/home/HomeScreen';
import { ChatScreen } from '../screens/chatbot/ChatScreen';
import { CampusMapScreen } from '../screens/campus/CampusMapScreen';
import { EventsScreen } from '../screens/events/EventsScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { Ionicons } from '@expo/vector-icons';
import { Platform } from 'react-native';

const Tab = createBottomTabNavigator<MainTabParamList>();

export const BottomTabNavigator: React.FC = () => {
  const { theme, isDark } = useAppTheme();

  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textMuted,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 88 : 64,
          paddingBottom: Platform.OS === 'ios' ? 28 : 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          switch (route.name) {
            case 'Home':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'AIChat':
              iconName = focused ? 'sparkles' : 'sparkles-outline';
              break;
            case 'Campus':
              iconName = focused ? 'map' : 'map-outline';
              break;
            case 'Events':
              iconName = focused ? 'star' : 'star-outline';
              break;
            case 'Profile':
              iconName = focused ? 'person' : 'person-outline';
              break;
            default:
              iconName = 'ellipse';
          }

          return <Ionicons name={iconName} size={22} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarLabel: 'Home' }} />
      <Tab.Screen name="AIChat" component={ChatScreen} options={{ tabBarLabel: 'AI Chat' }} />
      <Tab.Screen name="Campus" component={CampusMapScreen} options={{ tabBarLabel: 'Campus' }} />
      <Tab.Screen name="Events" component={EventsScreen} options={{ tabBarLabel: 'Events' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarLabel: 'Profile' }} />
    </Tab.Navigator>
  );
};
