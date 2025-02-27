import React from 'react';
import AppNavigator from './AppNavigator';
import { ThemeProvider } from './screens/SettingsScreen';

export default function App() {
  return (
    <ThemeProvider>
      <AppNavigator />
    </ThemeProvider>
  );
}