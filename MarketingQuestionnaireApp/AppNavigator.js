import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import HomeScreen from './screens/HomeScreen';
import CreateScreen from './screens/CreateScreen';
import GetPaidScreen from './screens/GetPaidScreen';
import SettingsScreen from './screens/SettingsScreen';
import { ThemeContext } from './screens/SettingsScreen';
import { Home, PlusCircle, Bell, Settings as SettingsIcon } from 'lucide-react-native';

const Tab = createBottomTabNavigator();

export default function AppNavigator() {
  const { theme } = React.useContext(ThemeContext);

  const screens = [
    { name: 'Answer', component: HomeScreen, icon: Home },
    { name: 'Create', component: CreateScreen, icon: PlusCircle },
    { name: 'Get Paid', component: GetPaidScreen, icon: Bell },
    { name: 'Settings', component: SettingsScreen, icon: SettingsIcon }
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
            height: 60
          },
          tabBarActiveTintColor: '#FFFFFF',
          tabBarInactiveTintColor: '#A0AEC0',
          headerShown: false,
          tabBarIcon: ({ color, size, focused }) => {
            const screen = screens.find(s => s.name === route.name);
            const IconComponent = screen.icon;
            return <IconComponent size={size} color={focused ? '#FFFFFF' : '#A0AEC0'} />;
          },
          tabBarLabel: ({ focused, color }) => (
            <Text style={{ fontSize: 12, fontWeight: 'bold', color: focused ? '#FFFFFF' : '#A0AEC0' }}>
              {route.name}
            </Text>
          )
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