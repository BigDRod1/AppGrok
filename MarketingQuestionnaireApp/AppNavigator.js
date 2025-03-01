import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import HomeScreen from './screens/HomeScreen';
import CreateScreen from './screens/CreateScreen';
import GetPaidScreen from './screens/GetPaidScreen';
import SettingsScreen from './screens/SettingsScreen';
import { useTheme } from './screens/SettingsScreen';
import { Ionicons } from '@expo/vector-icons';

const Tab = createBottomTabNavigator();

export default function AppNavigator() {
  const { theme } = useTheme();

  const screens = [
    { name: 'Answer', component: HomeScreen, icon: 'home' },
    { name: 'Create', component: CreateScreen, icon: 'add-circle' },
    { name: 'Get Paid', component: GetPaidScreen, icon: 'cash' },
    { name: 'Settings', component: SettingsScreen, icon: 'settings' },
  ];

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarStyle: {
            backgroundColor: '#1A202C',
            borderTopWidth: 1,
            borderTopColor: '#4A5568',
            elevation: 6,
            height: 60,
          },
          tabBarActiveTintColor: '#FFFFFF',
          tabBarInactiveTintColor: '#A0AEC0',
          headerShown: false,
          tabBarIcon: ({ color, size, focused }) => {
            const screen = screens.find(s => s.name === route.name);
            return <Ionicons name={screen.icon} size={size} color={focused ? '#FFFFFF' : '#A0AEC0'} />;
          },
          tabBarLabel: ({ focused, color }) => (
            <Text style={{ fontSize: 12, fontWeight: 'bold', color: focused ? '#FFFFFF' : '#A0AEC0' }}>
              {route.name}
            </Text>
          ),
        })}
      >
        {screens.map(screen => (
          <Tab.Screen
            key={screen.name}
            name={screen.name}
            component={screen.component}
          />
        ))}
      </Tab.Navigator>
    </NavigationContainer>
  );
}