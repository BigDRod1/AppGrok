import React, { useState, useContext } from 'react';
import { View, Text, Switch, Button, StyleSheet, ScrollView } from 'react-native';

// Create a theme context
const ThemeContext = React.createContext();

// Theme provider to manage light/dark modes
const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const theme = {
    background: isDarkMode ? '#2D3748' : '#F5F7FA',
    text: isDarkMode ? '#FFFFFF' : '#333333',
    card: isDarkMode ? '#4A5568' : '#FFFFFF',
    button: isDarkMode ? '#4CAF50' : '#4CAF50', // Green for submit button
    toggle: isDarkMode ? '#666666' : '#FFFFFF',
  };

  return (
    <ThemeContext.Provider value={{ theme, setIsDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Use ThemeContext in components
const useTheme = () => useContext(ThemeContext);

const SettingsScreen = ({ navigation }) => {
  const { theme, setIsDarkMode } = useTheme();
  const [isCustomer, setIsCustomer] = useState(false); // Track customer status
  const [notificationsEnabled, setNotificationsEnabled] = useState(false); // Notification toggle

  const handleBecomeCustomer = () => {
    setIsCustomer(true);
    alert('You are now a customer! Use the "Ask" option to post questions.');
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background, borderTopWidth: 2, borderTopColor: '#2196F3' }]}>
      <Text style={[styles.title, { color: theme.text }]}>Settings</Text>

      {/* Update Profile Section */}
      <View style={[styles.section, { backgroundColor: theme.card, shadowColor: theme.text }]}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Update Profile</Text>
        <Text style={[styles.description, { color: theme.text }]}>Update your name, email, or other profile information here.</Text>
        <Button title="Edit Profile" onPress={() => alert('Profile editing not implemented yet')} color="#2196F3" />
      </View>

      {/* Settings Section (Original) */}
      <View style={[styles.section, { backgroundColor: theme.card, shadowColor: theme.text }]}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Settings</Text>
        <View style={[styles.option, { backgroundColor: theme.toggle }]}>
          <Text style={{ color: theme.text }}>Enable Notifications</Text>
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
            trackColor={{ false: '#767577', true: '#2196F3' }}
            thumbColor={notificationsEnabled ? '#FFFFFF' : '#F4F3F4'}
          />
        </View>
        <Button
          title={isCustomer ? 'Customer Mode Active' : 'Become a Customer'}
          onPress={handleBecomeCustomer}
          disabled={isCustomer}
          color="#2196F3"
        />
        <View style={[styles.themeOption, { backgroundColor: theme.toggle }]}>
          <Text style={{ color: theme.text }}>Dark Mode</Text>
          <Switch
            value={theme.background === '#2D3748'}
            onValueChange={(value) => setIsDarkMode(value)}
            trackColor={{ false: '#767577', true: '#2196F3' }}
            thumbColor={theme.background === '#2D3748' ? theme.text : '#F4F3F4'} // Use theme.text for dark mode thumb
          />
        </View>
      </View>

      {/* Agreements Section */}
      <View style={[styles.section, { backgroundColor: theme.card, shadowColor: theme.text }]}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Agreements</Text>
        <Text style={[styles.description, { color: theme.text }]}>Review and agree to our Terms of Service and Privacy Policy.</Text>
        <Button title="View Terms" onPress={() => alert('Terms of Service not implemented yet')} color="#2196F3" />
        <Button title="View Privacy Policy" onPress={() => alert('Privacy Policy not implemented yet')} color="#2196F3" style={styles.button} />
      </View>

      {/* Delete Account Section */}
      <View style={[styles.section, { backgroundColor: theme.card, shadowColor: theme.text }]}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Delete Account</Text>
        <Text style={[styles.description, { color: theme.text }]}>Permanently delete your account and all associated data.</Text>
        <Button title="Delete Account" onPress={() => alert('Account deletion not implemented yet')} color="#FF4444" />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: { fontSize: 28, fontWeight: '600', marginBottom: 20, textAlign: 'center' },
  section: { marginBottom: 20, padding: 20, borderRadius: 20, elevation: 6, shadowColor: '#000000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4 },
  sectionTitle: { fontSize: 22, fontWeight: '600', marginBottom: 15 },
  description: { fontSize: 16, marginBottom: 20, color: '#666666' },
  option: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15, padding: 15, borderRadius: 15, backgroundColor: '#FFFFFF', elevation: 4, shadowColor: '#000000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3 },
  button: { marginTop: 15, borderRadius: 20 },
  themeOption: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 15, padding: 15, borderRadius: 15, elevation: 4, shadowColor: '#000000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3 },
});

// Export ThemeContext, ThemeProvider, and useTheme as named exports
export { ThemeContext, ThemeProvider, useTheme };
export default SettingsScreen;