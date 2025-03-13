import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';

const RewardAnimation = ({ showReward, rewardAnim }) => {
  return showReward ? (
    <Animated.View style={[styles.rewardContainer, { opacity: rewardAnim, transform: [{ scale: rewardAnim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.5, 1.2, 1] }) }] }]}>
      <View style={styles.confetti}>
        {[...Array(10)].map((_, i) => (
          <Animated.View key={i} style={[styles.confettiPiece, { backgroundColor: ['#FF9800', '#4CAF50', '#2196F3', '#E91E63', '#FFEB3B'][i % 5], top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%`, transform: [{ rotate: `${Math.random() * 360}deg` }, { translateY: rewardAnim.interpolate({ inputRange: [0, 1], outputRange: [0, Math.random() * 30 - 15] }) }] }]} />
        ))}
      </View>
      <Text style={styles.rewardText}>+$0.10</Text>
    </Animated.View>
  ) : null;
};

const styles = StyleSheet.create({
  rewardContainer: { position: 'absolute', top: '40%', left: '50%', marginLeft: -60, width: 120, height: 120, backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: 60, justifyContent: 'center', alignItems: 'center', zIndex: 100, elevation: 10, shadowColor: '#000000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 6 },
  rewardText: { fontSize: 32, fontWeight: 'bold', color: '#4CAF50' },
  confetti: { position: 'absolute', width: '100%', height: '100%' },
  confettiPiece: { position: 'absolute', width: 8, height: 8, borderRadius: 4 },
});

export default RewardAnimation;