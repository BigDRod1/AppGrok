import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from './ThemeContext';
import HomeScreen from './screens/Home/HomeScreen';
import CreateScreen from './screens/CreateScreen';
import GetPaidScreen from './screens/GetPaidScreen';
import SettingsScreen from './screens/SettingsScreen';

const Tab = createBottomTabNavigator();

const AppNavigator = () => {
  const { theme } = useTheme();
  console.error('AppNavigator: RENDERING');

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarStyle: { backgroundColor: theme.card },
          tabBarActiveTintColor: theme.isDark ? '#2196F3' : '#1976D2',
          tabBarInactiveTintColor: theme.isDark ? '#B0BEC5' : '#555555',
          headerShown: false,
          tabBarIcon: ({ color, size }) => {
            let iconName;
            if (route.name === 'Answer') iconName = 'chatbubble-ellipses';
            else if (route.name === 'Create') iconName = 'create';
            else if (route.name === 'Get Paid') iconName = 'cash';
            else if (route.name === 'Settings') iconName = 'settings';
            return <Ionicons name={iconName} size={size} color={color} />;
          },
        })}
      >
        <Tab.Screen name="Answer" component={HomeScreen} />
        <Tab.Screen name="Create" component={CreateScreen} />
        <Tab.Screen name="Get Paid" component={GetPaidScreen} />
        <Tab.Screen name="Settings" component={SettingsScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;