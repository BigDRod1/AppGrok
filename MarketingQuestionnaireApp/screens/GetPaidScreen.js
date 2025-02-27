import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from './SettingsScreen';

const GetPaidScreen = () => {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.background, borderTopWidth: 2, borderTopColor: '#2196F3' }]}>
      <Text style={[styles.title, { color: theme.text }]}>Get Paid</Text>
      <Text style={[styles.description, { color: theme.text }]}>View your earnings and request withdrawals here.</Text>
      <Text style={[styles.balance, { color: '#2196F3' }]}>Balance: $0.00 (Feature coming soon)</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30 },
  title: { fontSize: 28, fontWeight: '600', marginBottom: 20, color: '#333333' },
  description: { fontSize: 16, marginBottom: 20, color: '#666666' },
  balance: { fontSize: 18, fontWeight: 'bold' },
});

export default GetPaidScreen;