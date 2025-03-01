import React, { useState, useEffect } from 'react';
import { View, Text, Switch, Button, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, useWindowDimensions } from 'react-native';
import { useTheme, ThemeContext, ThemeProvider } from './SettingsScreen';
import { auth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from '../firebase';

export default function SettingsScreen({ navigation }) {
  const { theme } = useTheme();
  const { width } = useWindowDimensions();
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);

  const getFontSize = (baseSize) => Math.min(baseSize * 1.1, width * 0.06);
  const headerBackgroundColor = theme.isDark ? '#1E1E1E' : '#E3F2FD';
  const headerTextColor = theme.isDark ? '#FFFFFF' : '#1976D2';

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleSignIn = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      Alert.alert('Success', 'Signed in successfully!');
      setEmail('');
      setPassword('');
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const handleSignUp = async () => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      Alert.alert('Success', 'Account created successfully!');
      setEmail('');
      setPassword('');
      setIsSignUp(false);
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      Alert.alert('Success', 'Signed out successfully!');
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: headerBackgroundColor, borderBottomWidth: 1, borderBottomColor: theme.isDark ? '#424242' : '#BBDEFB' }]}>
        <Text style={[styles.headerText, { color: headerTextColor, fontSize: getFontSize(22), fontWeight: '700' }]}>Settings</Text>
        {user && (
          <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
            <Text style={styles.signOutButtonText}>Sign Out</Text>
          </TouchableOpacity>
        )}
      </View>
      <ScrollView style={styles.content}>
        {!user ? (
          <View style={[styles.section, { backgroundColor: theme.card, shadowColor: theme.text }]}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>{isSignUp ? 'Sign Up' : 'Sign In'}</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.background, color: theme.text }]}
              placeholder="Email"
              placeholderTextColor={theme.text + '80'}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
            />
            <TextInput
              style={[styles.input, { backgroundColor: theme.background, color: theme.text }]}
              placeholder="Password"
              placeholderTextColor={theme.text + '80'}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            <TouchableOpacity style={styles.authButton} onPress={isSignUp ? handleSignUp : handleSignIn}>
              <Text style={styles.authButtonText}>{isSignUp ? 'Sign Up' : 'Sign In'}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setIsSignUp(!isSignUp)}>
              <Text style={[styles.toggleAuthText, { color: '#2196F3' }]}>
                {isSignUp ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={[styles.section, { backgroundColor: theme.card, shadowColor: theme.text }]}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Update Profile</Text>
              <Text style={[styles.description, { color: theme.text }]}>Update your name, email, or other profile information here.</Text>
              <Button title="Edit Profile" onPress={() => alert('Profile editing not implemented yet')} color="#2196F3" />
            </View>
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
              <View style={[styles.themeOption, { backgroundColor: theme.toggle }]}>
                <Text style={{ color: theme.text }}>Dark Mode</Text>
                <Switch
                  value={theme.background === '#2D3748'}
                  onValueChange={(value) => setIsDarkMode(value)}
                  trackColor={{ false: '#767577', true: '#2196F3' }}
                  thumbColor={theme.background === '#2D3748' ? theme.text : '#F4F3F4'}
                />
              </View>
            </View>
            <View style={[styles.section, { backgroundColor: theme.card, shadowColor: theme.text }]}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Agreements</Text>
              <Text style={[styles.description, { color: theme.text }]}>Review and agree to our Terms of Service and Privacy Policy.</Text>
              <Button title="View Terms" onPress={() => alert('Terms of Service not implemented yet')} color="#2196F3" />
              <Button title="View Privacy Policy" onPress={() => alert('Privacy Policy not implemented yet')} color="#2196F3" />
            </View>
            <View style={[styles.section, { backgroundColor: theme.card, shadowColor: theme.text }]}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Delete Account</Text>
              <Text style={[styles.description, { color: theme.text }]}>Permanently delete your account and all associated data.</Text>
              <Button title="Delete Account" onPress={() => alert('Account deletion not implemented yet')} color="#FF4444" />
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingVertical: 14, paddingHorizontal: 16, paddingTop: 40, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerText: { fontWeight: 'bold' },
  signOutButton: { backgroundColor: '#FF4444', borderRadius: 6, padding: 8 },
  signOutButtonText: { color: '#FFFFFF', fontWeight: '600' },
  content: { flex: 1 },
  section: { marginBottom: 20, padding: 20, borderRadius: 20, elevation: 6, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4 },
  sectionTitle: { fontSize: 22, fontWeight: '600', marginBottom: 15 },
  description: { fontSize: 16, marginBottom: 20, color: '#666666' },
  option: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15, padding: 15, borderRadius: 15, elevation: 4, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3 },
  themeOption: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 15, padding: 15, borderRadius: 15, elevation: 4, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3 },
  input: { borderRadius: 8, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: '#ddd' },
  authButton: { backgroundColor: '#2196F3', borderRadius: 8, padding: 14, alignItems: 'center', marginTop: 8 },
  authButtonText: { color: '#FFFFFF', fontWeight: '600', fontSize: 16 },
  toggleAuthText: { textAlign: 'center', marginTop: 10 },
});