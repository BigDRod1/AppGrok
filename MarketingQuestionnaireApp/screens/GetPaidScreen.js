import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useWindowDimensions } from 'react-native';
import { useTheme } from '../ThemeContext';
import { useAuth } from '../contexts/AuthContext'; // Use AuthContext
import { getUserDoc, onSnapshot, getDoc, setDoc } from '../firebase';

const GetPaidScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const { user, loading } = useAuth(); // Get user and loading from context
  const { width } = useWindowDimensions();
  const [balance, setBalance] = useState('0.00');

  const getFontSize = (baseSize) => Math.min(baseSize * 1.1, width * 0.06);
  const headerBackgroundColor = theme.isDark ? '#1E1E1E' : '#E3F2FD';
  const headerTextColor = theme.isDark ? '#FFFFFF' : '#1976D2';

  useEffect(() => {
    if (loading || !user) {
      console.error('GetPaidScreen: Skipping useEffect, loading=', loading, 'user=', user ? user.uid : 'none');
      setBalance('0.00');
      return;
    }

    console.error('GetPaidScreen: Setting up Firestore listener for userId=', user.uid);
    const userDoc = getUserDoc(user.uid);
    const unsubscribe = onSnapshot(userDoc, (doc) => {
      if (doc.exists()) {
        setBalance(Number(doc.data().balance).toFixed(2));
      } else {
        getDoc(userDoc).then((docSnapshot) => {
          if (!docSnapshot.exists()) {
            setDoc(userDoc, { balance: 0.00 }).then(() => setBalance('0.00'));
          }
        });
      }
    }, (error) => console.error('GetPaidScreen: Error fetching balance:', error));

    return () => {
      console.error('GetPaidScreen: Cleaning up listener');
      unsubscribe();
    };
  }, [user, loading]);

  const handleSignInPrompt = () => {
    navigation.navigate('Settings');
  };

  const handleSignOut = () => {
    navigation.navigate('Settings'); // Redirect to Settings for sign-out
  };

  if (loading) {
    console.error('GetPaidScreen: RENDERING LOADING');
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={{ color: theme.text }}>Loading...</Text>
      </View>
    );
  }

  console.error('GetPaidScreen: RENDERING MAIN');
  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: headerBackgroundColor, borderBottomWidth: 1, borderBottomColor: theme.isDark ? '#424242' : '#BBDEFB' }]}>
        <Text style={[styles.headerText, { color: headerTextColor, fontSize: getFontSize(22), fontWeight: '700' }]}>Get Paid</Text>
        <View style={styles.headerRight}>
          <Text style={[styles.balanceText, { color: theme.text }]}>Current Balance: ${balance}</Text>
          {user && (
            <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
              <Text style={styles.signOutButtonText}>Sign Out</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
      <View style={styles.content}>
        {user ? (
          <>
            <Text style={[styles.title, { color: theme.text }]}>Get Paid</Text>
            <Text style={[styles.description, { color: theme.text }]}>View your earnings and request withdrawals here.</Text>
            <Text style={[styles.balance, { color: '#2196F3' }]}>Balance: ${balance} (Feature coming soon)</Text>
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
  headerRight: { flexDirection: 'row', alignItems: 'center' },
  balanceText: { fontSize: 16, marginRight: 10 },
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