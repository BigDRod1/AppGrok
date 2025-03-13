import React from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';

const Header = ({ theme, balance }) => {
  const { width } = useWindowDimensions();
  const getFontSize = (baseSize) => Math.min(baseSize * 1.1, width * 0.06);
  const headerBackgroundColor = theme.isDark ? '#1E1E1E' : '#E3F2FD';
  const headerTextColor = theme.isDark ? '#FFFFFF' : '#1976D2';
  const balanceLabelColor = theme.isDark ? '#B0BEC5' : '#555555';
  const balanceTextColor = theme.isDark ? '#E0E0E0' : '#2196F3';

  return (
    <View style={[styles.header, { backgroundColor: headerBackgroundColor, borderBottomColor: theme.isDark ? '#424242' : '#BBDEFB' }]}>
      <View style={styles.headerContent}>
        <Text style={[styles.headerText, { color: headerTextColor, fontSize: getFontSize(18) }]} numberOfLines={1} ellipsizeMode="tail">Welcome back!</Text>
        <View style={[styles.balanceContainer, { backgroundColor: theme.isDark ? '#2C2C2C' : '#FFFFFF' }]}>
          <Text style={[styles.balanceLabel, { color: balanceLabelColor, fontSize: getFontSize(12) }]}>Balance</Text>
          <Text style={[styles.balanceText, { color: balanceTextColor, fontSize: getFontSize(18) }]}>${balance}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: { paddingVertical: 10, paddingHorizontal: 16, borderBottomWidth: 1 },
  headerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerText: { fontWeight: 'bold', flex: 1 },
  balanceContainer: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 12, elevation: 4, shadowColor: '#000000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3, borderLeftWidth: 4, borderLeftColor: '#2196F3' },
  balanceLabel: { marginBottom: 2 },
  balanceText: { fontWeight: 'bold' },
});

export default Header;