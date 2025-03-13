import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Switch, Alert, useWindowDimensions } from 'react-native';
import { useTheme } from '../ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from '../firebase';

const SettingsScreen = () => {
  const { theme, setIsDark } = useTheme();
  const { user, loading } = useAuth(); // Use useAuth instead of local state
  const { width } = useWindowDimensions();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);

  const getFontSize = (baseSize) => Math.min(baseSize * 1.1, width * 0.06);
  const headerBackgroundColor = theme.isDark ? '#1E1E1E' : '#E3F2FD';
  const headerTextColor = theme.isDark ? '#FFFFFF' : '#1976D2';

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password.');
      return;
    }
    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(email, password);
        Alert.alert('Success', 'Account created successfully!');
      } else {
        await signInWithEmailAndPassword(email, password);
        Alert.alert('Success', 'Signed in successfully!');
      }
      setEmail('');
      setPassword('');
    } catch (error) {
      console.error('Auth error:', error);
      Alert.alert('Error', error.message);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      Alert.alert('Success', 'Signed out successfully!');
    } catch (error) {
      console.error('Sign out error:', error);
      Alert.alert('Error', 'Failed to sign out.');
    }
  };

  const toggleAuthMode = () => {
    setIsSignUp(!isSignUp);
    setEmail('');
    setPassword('');
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={{ color: theme.text }}>Loading...</Text>
      </View>
    );
  }

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
      <View style={styles.content}>
        {user ? (
          <>
            <Text style={[styles.welcomeText, { color: theme.text }]}>Welcome, {user.email}!</Text>
            <View style={styles.option}>
              <Text style={[styles.optionText, { color: theme.text }]}>Dark Mode</Text>
              <Switch value={theme.isDark} onValueChange={setIsDark} />
            </View>
          </>
        ) : (
          <>
            <Text style={[styles.title, { color: theme.text }]}>{isSignUp ? 'Sign Up' : 'Sign In'}</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.card, color: theme.text }]}
              placeholder="Email"
              placeholderTextColor={theme.text + '80'}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TextInput
              style={[styles.input, { backgroundColor: theme.card, color: theme.text }]}
              placeholder="Password"
              placeholderTextColor={theme.text + '80'}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            <TouchableOpacity style={styles.authButton} onPress={handleAuth}>
              <Text style={styles.authButtonText}>{isSignUp ? 'Sign Up' : 'Sign In'}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={toggleAuthMode}>
              <Text style={[styles.toggleText, { color: '#2196F3' }]}>
                {isSignUp ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
              </Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingVertical: 14, paddingHorizontal: 16, paddingTop: 40, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerText: { fontWeight: 'bold' },
  signOutButton: { backgroundColor: '#FF4444', borderRadius: 6, padding: 8 },
  signOutButtonText: { color: '#FFFFFF', fontWeight: '600' },
  content: { flex: 1, padding: 20, justifyContent: user ? 'flex-start' : 'center', alignItems: 'center' },
  welcomeText: { fontSize: 20, fontWeight: '600', marginBottom: 20 },
  option: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%', paddingVertical: 10 },
  optionText: { fontSize: 16 },
  title: { fontSize: 28, fontWeight: '600', marginBottom: 20 },
  input: { width: '100%', borderRadius: 8, padding: 12, marginBottom: 16, borderWidth: 1, borderColor: '#ddd' },
  authButton: { backgroundColor: '#2196F3', borderRadius: 8, padding: 14, width: '100%', alignItems: 'center', marginBottom: 16 },
  authButtonText: { color: '#FFFFFF', fontWeight: '600', fontSize: 16 },
  toggleText: { fontSize: 16, textDecorationLine: 'underline' },
});

export default SettingsScreen;