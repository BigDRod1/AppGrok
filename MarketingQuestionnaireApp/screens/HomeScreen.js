import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, PanResponder, Animated, TouchableOpacity, useWindowDimensions } from 'react-native';
import { db, getUserDoc } from '../firebase';
import { onSnapshot, getDoc, setDoc, updateDoc, increment } from 'firebase/firestore';
import { useTheme } from './SettingsScreen';

const HomeScreen = () => {
  const { theme = { background: '#F5F7FA', card: '#FFFFFF', text: '#000000' } } = useTheme(); // Fallback theme
  const { width } = useWindowDimensions();
  const questions = [
    { 
      id: '1', 
      text: 'What term describes the number and variety of species found in Earth’s environment?', 
      options: ['Ecology', 'Biodiversity', 'Sustainability', 'Erosion'],
      correct: 'Biodiversity',
      image: 'https://example.com/puffins.jpg'
    },
    { 
      id: '2', 
      text: 'Do you prefer coffee or tea?', 
      options: ['Coffee', 'Tea'], 
      correct: 'Tea' 
    },
    { 
      id: '3', 
      text: 'How often do you exercise?', 
      options: ['Daily', 'Weekly', 'Rarely'], 
      correct: 'Weekly' 
    },
  ];

  const USER_ID = 'user123';
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [balance, setBalance] = useState('0.00'); // Initialize as string for consistency
  const [submittedAnswers, setSubmittedAnswers] = useState([]);
  const pan = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  const currentQuestion = questions[currentIndex];

  const getFontSize = (baseSize) => Math.min(baseSize, width * 0.08);

  useEffect(() => {
    const userDoc = getUserDoc(USER_ID);
    const unsubscribe = onSnapshot(userDoc, (doc) => {
      if (doc.exists()) {
        const firestoreBalance = Number(doc.data().balance) || 0.00;
        setBalance(firestoreBalance.toFixed(2)); // String with 2 decimal places
      } else {
        getDoc(userDoc)
          .then((docSnapshot) => {
            if (!docSnapshot.exists()) {
              setDoc(userDoc, { balance: 0.00 })
                .then(() => setBalance('0.00'))
                .catch((error) => console.error('Error creating user doc:', error));
            }
          })
          .catch((error) => console.error('Error checking user doc:', error));
      }
    }, (error) => {
      console.error('Error fetching balance from Firestore:', error);
    });

    return () => unsubscribe();
  }, [USER_ID]);

  const handleAnswer = (answer) => {
    setSelectedAnswer(answer);
  };

  const handleSubmit = async () => {
    if (selectedAnswer) {
      const newAnswer = {
        questionId: currentQuestion.id,
        questionText: currentQuestion.text || '',
        answer: selectedAnswer,
        timestamp: new Date().toISOString(),
      };
      setSubmittedAnswers((prev) => [...prev, newAnswer]);

      try {
        const userDoc = getUserDoc(USER_ID);
        await updateDoc(userDoc, {
          balance: increment(0.10)
        });
        setBalance((prev) => {
          const numericPrev = Number(prev) || 0;
          const newBalance = numericPrev + 0.10;
          return newBalance.toFixed(2); // Consistent string output
        });
      } catch (error) {
        console.error('Error updating balance in Firestore:', error);
      }

      Animated.timing(slideAnim, {
        toValue: -1000,
        duration: 500,
        useNativeDriver: false,
      }).start(() => {
        setSelectedAnswer(null);
        setCurrentIndex((prev) => (prev + 1) % questions.length);
        pan.setValue({ x: 0, y: 0 });
        slideAnim.setValue(1000);
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: false,
        }).start();
      });
    }
  };

  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (evt, gestureState) => Math.abs(gestureState.dy) > 10,
    onPanResponderMove: (evt, gestureState) => {
      pan.setValue({ x: 0, y: gestureState.dy });
    },
    onPanResponderRelease: (evt, gestureState) => {
      if (gestureState.dy < -50 && selectedAnswer) {
        handleSubmit();
      } else {
        Animated.spring(pan, { toValue: { x: 0, y: 0 }, useNativeDriver: false }).start();
      }
    },
  });

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.balanceContainer, { backgroundColor: theme.card, borderTopWidth: 2, borderTopColor: '#2196F3', zIndex: 1000 }]}>
        <Text style={[styles.balanceText, { color: theme.text, fontSize: getFontSize(20) }]}>
          ${typeof balance === 'string' || typeof balance === 'number' ? balance : '0.00'}
        </Text>
      </View>
      <View style={[styles.header, { backgroundColor: theme.background === '#F5F7FA' ? '#E3F2FD' : '#1E3A8A' }]}>
        <Text style={[styles.headerText, { color: theme.text, fontSize: getFontSize(25) }]}>
          Welcome back, User!
        </Text>
      </View>
      <Animated.View
        style={[
          styles.questionContainer,
          {
            transform: [...pan.getTranslateTransform(), { translateY: slideAnim }],
            backgroundColor: theme.card,
          },
        ]}
        {...panResponder.panHandlers}
      >
        <Text style={[styles.questionText, { color: theme.text, fontSize: getFontSize(30) }]} numberOfLines={2} ellipsizeMode="tail">
          {String(currentQuestion.text || '')}
        </Text>
        {currentQuestion.image && (
          <Text style={[styles.imagePlaceholder, { color: theme.text, fontSize: getFontSize(18) }]}>
            Image Placeholder (Tap for Link)
          </Text>
        )}
        <View style={[styles.optionsContainer, { backgroundColor: theme.card, marginTop: 20, marginBottom: 60, borderTopWidth: 2, borderTopColor: '#2196F3' }]}>
          {(currentQuestion.options || []).map((option, index) => (
            <TouchableOpacity
              key={String(option || '')}
              style={[
                styles.optionButton,
                {
                  width: '48%',
                  marginHorizontal: '1%',
                  aspectRatio: 1,
                  backgroundColor: selectedAnswer === option ? '#4CAF50' : '#2196F3',
                  marginVertical: 20,
                },
              ]}
              onPress={() => handleAnswer(option)}
            >
              <Text style={[styles.optionText, { color: theme.text, fontSize: getFontSize(24) }]}>
                {String(option || '')}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={[styles.submitText, { fontSize: getFontSize(18) }]}>
            Submit
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  balanceContainer: { position: 'absolute', top: 120, right: 20, padding: 15, borderRadius: 20, elevation: 6, shadowColor: '#000000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4 },
  header: { height: 100, justifyContent: 'center', alignItems: 'center' },
  headerText: { fontWeight: 'bold', textAlign: 'center' },
  balanceText: { fontWeight: 'bold', textAlign: 'center' },
  questionContainer: { flex: 1, justifyContent: 'flex-end', alignItems: 'center', padding: 20, borderRadius: 20, elevation: 6, shadowColor: '#000000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4 },
  questionText: { fontWeight: '600', textAlign: 'center', marginBottom: 30 },
  imagePlaceholder: { marginBottom: 30, textDecorationLine: 'underline', textAlign: 'center' },
  optionsContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', width: '100%', marginBottom: 60, borderRadius: 20, padding: 15, elevation: 6, shadowColor: '#000000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4 },
  optionButton: {
    borderRadius: 30,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  optionText: { 
    fontWeight: 'bold',
    textAlign: 'center',
    paddingVertical: 30,
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 40,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    paddingVertical: 20,
    paddingHorizontal: 40,
  },
  submitText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default HomeScreen;