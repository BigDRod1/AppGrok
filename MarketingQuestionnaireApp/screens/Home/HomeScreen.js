import React, { useState, useRef, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, PanResponder, Animated, Alert } from 'react-native';
import { db, getUserDoc, collection, addDoc, query, onSnapshot, where, writeBatch, doc, getDoc, setDoc, updateDoc, increment } from '../../firebase';
import { useTheme } from '../../ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import Header from './Header';
import QuestionCard from './QuestionCard';
import RewardAnimation from './RewardAnimation';

const HomeScreen = ({ navigation }) => {
  console.error('HomeScreen: FILE LOADED - VERSION 2025-03-15');
  const { theme } = useTheme();
  console.error('HomeScreen: THEME LOADED');
  const { user, loading } = useAuth();
  console.error('HomeScreen: USER_ID=', user ? user.uid : 'temp-anonymous');

  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [balance, setBalance] = useState('0.00');
  const [submittedAnswers, setSubmittedAnswers] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showReward, setShowReward] = useState(false);
  const [allImagesViewed, setAllImagesViewed] = useState(false);
  const pan = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const rewardAnim = useRef(new Animated.Value(0)).current;

  const currentQuestion = useMemo(() => questions[currentIndex] || {}, [questions, currentIndex]);
  const USER_ID = user ? user.uid : 'temp-anonymous';

  useEffect(() => {
    if (loading || !user) {
      console.error('HomeScreen: Skipping useEffect, loading=', loading);
      return;
    }

    console.error('HomeScreen: Setting up Firestore listeners for USER_ID=', USER_ID);

    const userDoc = getUserDoc(USER_ID);
    const unsubscribeUser = onSnapshot(userDoc, (doc) => {
      if (doc.exists()) {
        console.error('HomeScreen: User doc exists, balance=', doc.data().balance);
        setBalance(Number(doc.data().balance).toFixed(2));
      } else {
        console.error('HomeScreen: User doc does not exist, creating...');
        getDoc(userDoc).then((docSnapshot) => {
          if (!docSnapshot.exists()) {
            setDoc(userDoc, { balance: 0.00 }).then(() => {
              console.error('HomeScreen: User doc created, balance=0.00');
              setBalance('0.00');
            });
          }
        });
      }
    }, (error) => console.error('HomeScreen: Error fetching user doc:', error));

    const q = query(collection(db, 'posts'), where('active', '==', true));
    const unsubscribeQuestions = onSnapshot(q, (snapshot) => {
      const loadedQuestions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      console.error('HomeScreen: Questions loaded, count=', loadedQuestions.length);
      setQuestions(loadedQuestions);
      setCurrentIndex(0);
    }, (error) => console.error('HomeScreen: Error fetching questions:', error));

    return () => {
      console.error('HomeScreen: Cleaning up listeners');
      unsubscribeUser();
      unsubscribeQuestions();
    };
  }, [USER_ID, user, loading]);

  const handleAnswer = (answer) => {
    console.error('HomeScreen: Handling answer=', answer);
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.95, duration: 50, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 50, useNativeDriver: true }),
    ]).start();
    setSelectedAnswer(answer);
  };

  const showRewardAnimation = () => {
    console.error('HomeScreen: Showing reward animation');
    setShowReward(true);
    Animated.sequence([
      Animated.timing(rewardAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
      Animated.delay(800),
      Animated.timing(rewardAnim, { toValue: 0, duration: 150, useNativeDriver: true })
    ]).start(() => setShowReward(false));
  };

  const handleSubmit = async () => {
    if (!selectedAnswer || isSubmitting || (currentQuestion.pictures?.length > 1 && !allImagesViewed)) {
      console.error('HomeScreen: Submit blocked: selectedAnswer=', selectedAnswer, 'isSubmitting=', isSubmitting, 'allImagesViewed=', allImagesViewed);
      return;
    }
    if (!user) {
      console.error('HomeScreen: No user for submit');
      return;
    }

    console.error('HomeScreen: Submitting answer for USER_ID=', USER_ID);
    const newBalance = Number(balance) + 0.10;
    if (user.isAnonymous && newBalance > 10) {
      console.error('HomeScreen: Balance limit reached for anonymous user, newBalance=', newBalance);
      Alert.alert(
        'Sign Up Required',
        'You’ve reached the $10 limit for anonymous users. Please sign up to continue earning.',
        [
          { text: 'Sign Up', onPress: () => navigation.navigate('Settings') },
          { text: 'Cancel' },
        ]
      );
      return;
    }

    setIsSubmitting(true);

    const newAnswer = {
      questionId: currentQuestion.id,
      questionText: currentQuestion.question || '',
      answer: selectedAnswer,
      timestamp: new Date().toISOString(),
    };
    setSubmittedAnswers((prev) => [...prev, newAnswer]);
    setBalance((prev) => (Number(prev) + 0.10).toFixed(2));

    try {
      const userDoc = getUserDoc(USER_ID);
      const responseDoc = doc(collection(db, 'responses'));
      const batch = writeBatch(db);

      batch.update(userDoc, { balance: increment(0.10) });
      batch.set(responseDoc, {
        questionId: newAnswer.questionId,
        userId: USER_ID,
        questionText: newAnswer.questionText,
        response: newAnswer.answer,
        timestamp: newAnswer.timestamp,
      });

      console.error('HomeScreen: Committing batch write');
      await batch.commit();
      showRewardAnimation();
    } catch (error) {
      console.error('HomeScreen: Error submitting answer:', error);
      setBalance((prev) => (Number(prev) - 0.10).toFixed(2));
    }

    Animated.timing(slideAnim, { toValue: -1000, duration: 300, useNativeDriver: true }).start(() => {
      setSelectedAnswer(null);
      setAllImagesViewed(false);
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
      if (gestureState.dy < -50 && selectedAnswer && (currentQuestion.pictures?.length <= 1 || allImagesViewed)) handleSubmit();
      else Animated.spring(pan, { toValue: { x: 0, y: 0 }, friction: 8, tension: 50, useNativeDriver: true }).start();
    },
  }), [pan, selectedAnswer, allImagesViewed, currentQuestion.pictures]);

  if (loading) {
    console.error('HomeScreen: RENDERING LOADING');
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={{ color: theme.text }}>Loading...</Text>
      </View>
    );
  }

  console.error('HomeScreen: RENDERING MAIN, questions.length=', questions.length);
  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Header theme={theme} balance={balance} />
      {questions.length > 0 ? (
        <QuestionCard
          theme={theme}
          question={currentQuestion}
          selectedAnswer={selectedAnswer}
          handleAnswer={handleAnswer}
          handleSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          allImagesViewed={allImagesViewed}
          setAllImagesViewed={setAllImagesViewed} // Pass the setter
          pan={pan}
          panResponder={panResponder}
          slideAnim={slideAnim}
          scaleAnim={scaleAnim}
        />
      ) : (
        <View style={styles.noQuestionsContainer}>
          <Text style={[styles.noQuestions, { color: theme.text }]}>No questions available at this time.</Text>
          <Text style={[styles.noQuestionsSubtext, { color: theme.text }]}>Come back soon!</Text>
        </View>
      )}
      <RewardAnimation showReward={showReward} rewardAnim={rewardAnim} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    // Removed paddingTop: 30 to let Header sit at the top naturally
    // Removed justifyContent: 'center' to allow vertical stacking
  },
  noQuestionsContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  noQuestions: { 
    fontSize: 18, 
    textAlign: 'center', 
    marginBottom: 8 
  },
  noQuestionsSubtext: { 
    fontSize: 16, 
    textAlign: 'center' 
  },
});

export default HomeScreen;