import React from 'react';
import { ThemeProvider } from './ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import AppNavigator from './AppNavigator';

const App = () => {
  console.error('App with Auth: RENDERING');
  return (
    <AuthProvider>
      <ThemeProvider>
        <AppNavigator />
      </ThemeProvider>
    </AuthProvider>
  );
};

export default App;