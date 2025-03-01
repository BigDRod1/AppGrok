import React from 'react';
import { ThemeProvider } from './screens/SettingsScreen';
import AppNavigator from './AppNavigator';

console.log('ThemeProvider:', ThemeProvider);
console.log('AppNavigator:', AppNavigator);

export default function App() {
  return (
    <ThemeProvider>
      <AppNavigator />
    </ThemeProvider>
  );
}