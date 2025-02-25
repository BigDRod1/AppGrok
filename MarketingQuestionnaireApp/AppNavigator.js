import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import HomeScreen from './screens/HomeScreen';
import SettingsScreen from './screens/SettingsScreen';
import GetPaidScreen from './screens/GetPaidScreen';
import { ThemeContext } from './screens/SettingsScreen';
import { Home, Bell, Settings as SettingsIcon } from 'lucide-react-native';

const Tab = createBottomTabNavigator();

const AppNavigator = () => {
  const { theme } = React.useContext(ThemeContext);

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarStyle: { 
            backgroundColor: '#1A202C', // Dark background for non-floating bar
            borderTopWidth: 1,
            borderTopColor: '#4A5568', // Subtle border for definition
            elevation: 6, // Subtle shadow for non-floating look
            height: 60, // Standard height for non-floating bar
          },
          tabBarActiveTintColor: '#FFFFFF', // White for active icons/labels
          tabBarInactiveTintColor: '#A0AEC0', // Light gray for inactive icons/labels
          headerShown: false, // Remove header for all screens
          tabBarIcon: ({ color, size, focused }) => {
            let IconComponent;
            if (route.name === 'Answer') {
              IconComponent = Home;
            } else if (route.name === 'Get Paid') {
              IconComponent = Bell;
            } else if (route.name === 'Settings') {
              IconComponent = SettingsIcon;
            }
            return <IconComponent size={size} color={focused ? '#FFFFFF' : '#A0AEC0'} />; // Show icons always, color based on focus
          },
          tabBarLabel: ({ focused, color }) => (
            <Text style={{ fontSize: 12, fontWeight: 'bold', color: focused ? '#FFFFFF' : '#A0AEC0' }}>
              {route.name}
            </Text>
          ),
        })}
      >
        <Tab.Screen name="Answer" component={HomeScreen} />
        <Tab.Screen name="Get Paid" component={GetPaidScreen} />
        <Tab.Screen name="Settings" component={SettingsScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;