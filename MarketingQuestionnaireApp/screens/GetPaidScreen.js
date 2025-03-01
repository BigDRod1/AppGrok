import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useWindowDimensions } from 'react-native';
import { useTheme } from './SettingsScreen';
import { auth, onAuthStateChanged } from '../firebase';

const GetPaidScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const { width } = useWindowDimensions();
  const [user, setUser] = useState(null);

  const getFontSize = (baseSize) => Math.min(baseSize * 1.1, width * 0.06);
  const headerBackgroundColor = theme.isDark ? '#1E1E1E' : '#E3F2FD';
  const headerTextColor = theme.isDark ? '#FFFFFF' : '#1976D2';

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleSignInPrompt = () => {
    navigation.navigate('Settings');
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: headerBackgroundColor, borderBottomWidth: 1, borderBottomColor: theme.isDark ? '#424242' : '#BBDEFB' }]}>
        <Text style={[styles.headerText, { color: headerTextColor, fontSize: getFontSize(22), fontWeight: '700' }]}>Get Paid</Text>
        {user && (
          <TouchableOpacity style={styles.signOutButton} onPress={() => auth.signOut()}>
            <Text style={styles.signOutButtonText}>Sign Out</Text>
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.content}>
        {user ? (
          <>
            <Text style={[styles.title, { color: theme.text }]}>Get Paid</Text>
            <Text style={[styles.description, { color: theme.text }]}>View your earnings and request withdrawals here.</Text>
            <Text style={[styles.balance, { color: '#2196F3' }]}>Balance: $0.00 (Feature coming soon)</Text>
          </>
        ) : (
          <>
            <Text style={[styles.title, { color: theme.text }]}>Sign In Required</Text>
            <Text style={[styles.description, { color: theme.text }]}>Please sign in to view your earnings.</Text>
            <TouchableOpacity style={styles.signInButton} onPress={handleSignInPrompt}>
              <Text style={styles.signInButtonText}>Sign In</Text>
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
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30 },
  title: { fontSize: 28, fontWeight: '600', marginBottom: 20 },
  description: { fontSize: 16, marginBottom: 20 },
  balance: { fontSize: 18, fontWeight: 'bold' },
  signInButton: { backgroundColor: '#2196F3', borderRadius: 8, padding: 14, alignItems: 'center' },
  signInButtonText: { color: '#FFFFFF', fontWeight: '600', fontSize: 16 },
});

export default GetPaidScreen;