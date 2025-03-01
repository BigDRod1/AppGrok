import React, { useState, useRef, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, PanResponder, Animated, TouchableOpacity, useWindowDimensions, Image } from 'react-native';
import { db, getUserDoc, collection, addDoc, query, onSnapshot, where } from '../firebase';
import { getDoc, setDoc, updateDoc, increment } from 'firebase/firestore';
import { useTheme } from './SettingsScreen';

const HomeScreen = () => {
  const { theme = { background: '#F5F7FA', card: '#FFFFFF', text: '#000000', isDark: false } } = useTheme();
  const { width, height } = useWindowDimensions();
  const [questions, setQuestions] = useState([]);
  const USER_ID = 'user123';
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [balance, setBalance] = useState('0.00');
  const [submittedAnswers, setSubmittedAnswers] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showReward, setShowReward] = useState(false);
  const pan = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const rewardAnim = useRef(new Animated.Value(0)).current;

  const currentQuestion = useMemo(() => questions[currentIndex] || {}, [questions, currentIndex]);
  const BOTTOM_PADDING = 100;

  const getFontSize = (baseSize) => Math.min(baseSize * 1.1, width * 0.06);
  const headerBackgroundColor = useMemo(() => theme.isDark ? '#1E1E1E' : '#E3F2FD', [theme.isDark]);
  const headerTextColor = useMemo(() => theme.isDark ? '#FFFFFF' : '#1976D2', [theme.isDark]);
  const balanceLabelColor = useMemo(() => theme.isDark ? '#B0BEC5' : '#555555', [theme.isDark]);
  const balanceTextColor = useMemo(() => theme.isDark ? '#E0E0E0' : '#2196F3', [theme.isDark]);

  useEffect(() => {
    const userDoc = getUserDoc(USER_ID);
    const unsubscribeUser = onSnapshot(userDoc, (doc) => {
      if (doc.exists()) setBalance(Number(doc.data().balance).toFixed(2));
      else {
        getDoc(userDoc).then((docSnapshot) => {
          if (!docSnapshot.exists()) setDoc(userDoc, { balance: 0.00 }).then(() => setBalance('0.00'));
        });
      }
    });

    const q = query(collection(db, 'posts'), where('active', '==', true));
    const unsubscribeQuestions = onSnapshot(q, (snapshot) => {
      const loadedQuestions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setQuestions(loadedQuestions);
      setCurrentIndex(0);
    }, (error) => {
      console.error('Error fetching questions:', error);
    });

    return () => {
      unsubscribeUser();
      unsubscribeQuestions();
    };
  }, [USER_ID]);

  const handleAnswer = (answer) => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.95, duration: 50, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 50, useNativeDriver: true }),
    ]).start();
    setSelectedAnswer(answer);
  };

  const showRewardAnimation = () => {
    setShowReward(true);
    Animated.sequence([
      Animated.timing(rewardAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
      Animated.delay(800),
      Animated.timing(rewardAnim, { toValue: 0, duration: 150, useNativeDriver: true })
    ]).start(() => setShowReward(false));
  };

  const handleSubmit = async () => {
    if (!selectedAnswer || isSubmitting) return;
    setIsSubmitting(true);

    const newAnswer = {
      questionId: currentQuestion.id,
      questionText: currentQuestion.question || '',
      answer: selectedAnswer,
      timestamp: new Date().toISOString(),
    };
    setSubmittedAnswers((prev) => [...prev, newAnswer]);

    try {
      const userDoc = getUserDoc(USER_ID);
      await updateDoc(userDoc, { balance: increment(0.10) });
      setBalance((prev) => (Number(prev) + 0.10).toFixed(2));

      await addDoc(collection(db, 'responses'), {
        questionId: newAnswer.questionId,
        userId: USER_ID,
        questionText: newAnswer.questionText,
        response: newAnswer.answer,
        timestamp: newAnswer.timestamp,
      });

      showRewardAnimation();
    } catch (error) {
      console.error('Error submitting answer:', error);
    }

    Animated.timing(slideAnim, { toValue: -1000, duration: 300, useNativeDriver: true }).start(() => {
      setSelectedAnswer(null);
      setCurrentIndex((prev) => {
        const nextIndex = prev + 1;
        return nextIndex < questions.length ? nextIndex : 0;
      });
      pan.setValue({ x: 0, y: 0 });
      slideAnim.setValue(1000);
      Animated.timing(slideAnim, { toValue: 0, duration: 300, useNativeDriver: true }).start(() => setIsSubmitting(false));
    });
  };

  const panResponder = useMemo(() => PanResponder.create({
    onMoveShouldSetPanResponder: (evt, gestureState) => Math.abs(gestureState.dy) > 10,
    onPanResponderMove: (evt, gestureState) => pan.setValue({ x: 0, y: gestureState.dy }),
    onPanResponderRelease: (evt, gestureState) => {
      if (gestureState.dy < -50 && selectedAnswer) handleSubmit();
      else Animated.spring(pan, { toValue: { x: 0, y: 0 }, friction: 8, tension: 50, useNativeDriver: true }).start();
    },
  }), [pan, selectedAnswer]);

  const getButtonColor = (option) => (selectedAnswer === option ? '#4CAF50' : '#2196F3');

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: headerBackgroundColor, borderBottomWidth: 1, borderBottomColor: theme.isDark ? '#424242' : '#BBDEFB' }]}>
        <View style={styles.headerContent}>
          <Text style={[styles.headerText, { color: headerTextColor, fontSize: getFontSize(22), fontWeight: '700' }]} numberOfLines={1} ellipsizeMode="tail">Welcome back, User!</Text>
          <View style={[styles.balanceContainer, { backgroundColor: theme.isDark ? '#2C2C2C' : '#FFFFFF', borderLeftWidth: 4, borderLeftColor: '#2196F3' }]}>
            <Text style={[styles.balanceLabel, { color: balanceLabelColor, fontSize: getFontSize(14) }]}>Balance</Text>
            <Text style={[styles.balanceText, { color: balanceTextColor, fontSize: getFontSize(22) }]}>${balance}</Text>
          </View>
        </View>
      </View>

      {questions.length > 0 ? (
        <Animated.View style={[styles.questionContainer, { transform: [...pan.getTranslateTransform(), { translateY: slideAnim }, { scale: scaleAnim }], backgroundColor: theme.card, borderRadius: 24, marginHorizontal: 16, paddingBottom: BOTTOM_PADDING, maxHeight: height - 150 }]} {...panResponder.panHandlers}>
          <Text style={[styles.questionText, { color: theme.text, fontSize: getFontSize(20), lineHeight: getFontSize(28) }]} adjustsFontSizeToFit numberOfLines={3} minimumFontScale={0.7}>{currentQuestion.question || ''}</Text>
          {currentQuestion.pictures?.length > 0 && (
            <View style={styles.imageContainer}>
              {currentQuestion.pictures.map((uri, index) => (
                uri && (
                  <Image
                    key={index}
                    source={{ uri: uri || 'https://via.placeholder.com/350x150' }}
                    style={[styles.questionImage, { width: currentQuestion.pictures.length > 1 ? '48%' : '100%' }]}
                    resizeMode="cover"
                  />
                )
              ))}
            </View>
          )}
          <View style={styles.optionsContainer}>
            {(currentQuestion.options || []).map((option, index) => (
              <TouchableOpacity key={String(option || '')} style={[styles.optionButton, { backgroundColor: getButtonColor(option), borderColor: selectedAnswer === option ? '#2E7D32' : '#1976D2', width: '48%' }]} onPress={() => handleAnswer(option)} activeOpacity={0.7}>
                <Text style={[styles.optionText, { color: '#FFFFFF', fontSize: getFontSize(18) }]} adjustsFontSizeToFit numberOfLines={2} minimumFontScale={0.7}>{String(option || '')}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity style={[styles.submitButton, { backgroundColor: selectedAnswer ? '#2196F3' : '#90CAF9', opacity: selectedAnswer ? 1 : 0.7, marginBottom: 20 }]} onPress={handleSubmit} disabled={!selectedAnswer || isSubmitting}>
            <Text style={[styles.submitText, { fontSize: getFontSize(18) }]} adjustsFontSizeToFit numberOfLines={1}>{isSubmitting ? 'Submitting...' : 'Submit Answer'}</Text>
          </TouchableOpacity>
        </Animated.View>
      ) : (
        <View style={styles.noQuestionsContainer}>
          <Text style={[styles.noQuestions, { color: theme.text }]}>No questions available at this time.</Text>
          <Text style={[styles.noQuestionsSubtext, { color: theme.text }]}>Come back soon!</Text>
        </View>
      )}

      {showReward && (
        <Animated.View style={[styles.rewardContainer, { opacity: rewardAnim, transform: [{ scale: rewardAnim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.5, 1.2, 1] }) }] }]}>
          <View style={styles.confetti}>
            {[...Array(10)].map((_, i) => (
              <Animated.View key={i} style={[styles.confettiPiece, { backgroundColor: ['#FF9800', '#4CAF50', '#2196F3', '#E91E63', '#FFEB3B'][i % 5], top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%`, transform: [{ rotate: `${Math.random() * 360}deg` }, { translateY: rewardAnim.interpolate({ inputRange: [0, 1], outputRange: [0, Math.random() * 30 - 15] }) }] }]} />
            ))}
          </View>
          <Text style={styles.rewardText}>+$0.10</Text>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 40 },
  header: { paddingVertical: 14, paddingHorizontal: 16 },
  headerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerText: { fontWeight: 'bold', flex: 1 },
  balanceContainer: { paddingVertical: 10, paddingHorizontal: 14, borderRadius: 16, elevation: 4, shadowColor: '#000000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3 },
  balanceLabel: { marginBottom: 2 },
  balanceText: { fontWeight: 'bold' },
  questionContainer: { flex: 1, justifyContent: 'space-between', padding: 20, marginTop: 16, elevation: 4, shadowColor: '#000000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3, overflow: 'hidden' },
  questionText: { fontWeight: '600', textAlign: 'center', marginBottom: 20 },
  imageContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap' },
  questionImage: { height: 140, borderRadius: 12, marginHorizontal: '1%', marginBottom: 10 },
  optionsContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 20 },
  optionButton: { marginVertical: 6, paddingVertical: 16, paddingHorizontal: 10, borderRadius: 16, borderWidth: 2, elevation: 2, shadowColor: '#000000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 2, height: 110, justifyContent: 'center' },
  optionText: { fontWeight: '600', textAlign: 'center' },
  submitButton: { alignSelf: 'center', borderRadius: 30, paddingVertical: 14, paddingHorizontal: 36, elevation: 4, shadowColor: '#000000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4 },
  submitText: { color: '#FFFFFF', fontWeight: 'bold', textAlign: 'center' },
  rewardContainer: { position: 'absolute', top: '40%', left: '50%', marginLeft: -60, width: 120, height: 120, backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: 60, justifyContent: 'center', alignItems: 'center', zIndex: 100, elevation: 10, shadowColor: '#000000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 6 },
  rewardText: { fontSize: 32, fontWeight: 'bold', color: '#4CAF50' },
  confetti: { position: 'absolute', width: '100%', height: '100%' },
  confettiPiece: { position: 'absolute', width: 8, height: 8, borderRadius: 4 },
  noQuestionsContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  noQuestions: { fontSize: 18, textAlign: 'center', marginBottom: 8 },
  noQuestionsSubtext: { fontSize: 16, textAlign: 'center' },
});

export default HomeScreen;