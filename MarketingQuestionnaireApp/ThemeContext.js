import React, { createContext, useContext, useState } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(false);

  const theme = {
    isDark,
    background: isDark ? '#121212' : '#F5F7FA',
    card: isDark ? '#1E1E1E' : '#FFFFFF',
    text: isDark ? '#E0E0E0' : '#000000',
  };

  return (
    <ThemeContext.Provider value={{ theme, setIsDark }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
};