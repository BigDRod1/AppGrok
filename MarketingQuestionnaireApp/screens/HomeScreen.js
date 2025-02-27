import React, { useState, useRef, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, PanResponder, Animated, TouchableOpacity, useWindowDimensions, Image } from 'react-native';
import { db, getUserDoc } from '../firebase';
import { onSnapshot, getDoc, setDoc, updateDoc, increment } from 'firebase/firestore';
import { useTheme } from './SettingsScreen';

const HomeScreen = () => {
  const { theme = { background: '#F5F7FA', card: '#FFFFFF', text: '#000000', isDark: false } } = useTheme();
  const { width, height } = useWindowDimensions();
  const questions = [
    { 
      id: '1', 
      text: 'What term describes the number and variety of species found in Earths environment?', 
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
  const [balance, setBalance] = useState('0.00');
  const [submittedAnswers, setSubmittedAnswers] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showReward, setShowReward] = useState(false);
  const pan = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const rewardAnim = useRef(new Animated.Value(0)).current;

  const currentQuestion = useMemo(() => questions[currentIndex], [currentIndex]);
  const BOTTOM_PADDING = 100; // Increased padding to ensure content stays above navigation menu

  // Create a more efficient font sizing function
  const getFontSize = (baseSize) => Math.min(baseSize * 1.1, width * 0.06);

  // Memoize header background color
  const headerBackgroundColor = useMemo(() => 
    theme.isDark ? '#121212' : '#E3F2FD'
  , [theme.isDark]);

  useEffect(() => {
    const userDoc = getUserDoc(USER_ID);
    const unsubscribe = onSnapshot(userDoc, (doc) => {
      if (doc.exists()) {
        const firestoreBalance = Number(doc.data().balance) || 0.00;
        setBalance(firestoreBalance.toFixed(2));
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
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 50, // Made faster
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 50, // Made faster
        useNativeDriver: true,
      }),
    ]).start();
    
    setSelectedAnswer(answer);
  };

  const showRewardAnimation = () => {
    setShowReward(true);
    Animated.sequence([
      Animated.timing(rewardAnim, {
        toValue: 1,
        duration: 150, // Faster animation
        useNativeDriver: true
      }),
      Animated.delay(800), // Shorter delay
      Animated.timing(rewardAnim, {
        toValue: 0,
        duration: 150, // Faster animation
        useNativeDriver: true
      })
    ]).start(() => setShowReward(false));
  };

  const handleSubmit = async () => {
    if (selectedAnswer && !isSubmitting) {
      setIsSubmitting(true);
      
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
          return newBalance.toFixed(2);
        });

        // Show reward animation
        showRewardAnimation();
      } catch (error) {
        console.error('Error updating balance in Firestore:', error);
      }

      Animated.timing(slideAnim, {
        toValue: -1000,
        duration: 300, // Faster transition
        useNativeDriver: true,
      }).start(() => {
        setSelectedAnswer(null);
        setCurrentIndex((prev) => (prev + 1) % questions.length);
        pan.setValue({ x: 0, y: 0 });
        slideAnim.setValue(1000);
        
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300, // Faster transition
          useNativeDriver: true,
        }).start(() => {
          setIsSubmitting(false);
        });
      });
    }
  };

  // Optimize PanResponder by memoizing it
  const panResponder = useMemo(() => PanResponder.create({
    onMoveShouldSetPanResponder: (evt, gestureState) => Math.abs(gestureState.dy) > 10,
    onPanResponderMove: (evt, gestureState) => {
      pan.setValue({ x: 0, y: gestureState.dy });
    },
    onPanResponderRelease: (evt, gestureState) => {
      if (gestureState.dy < -50 && selectedAnswer) {
        handleSubmit();
      } else {
        Animated.spring(pan, { 
          toValue: { x: 0, y: 0 }, 
          friction: 8, // Increased for faster return
          tension: 50, // Increased for faster return
          useNativeDriver: true 
        }).start();
      }
    },
  }), [pan, selectedAnswer]);

  const getButtonColor = (option) => {
    if (selectedAnswer === option) {
      return '#4CAF50';  // Green when selected
    }
    return '#2196F3';  // Blue otherwise
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header with integrated balance */}
      <View style={[styles.header, { 
        backgroundColor: headerBackgroundColor,
        borderBottomWidth: 1,
        borderBottomColor: theme.isDark ? '#333333' : '#BBDEFB'
      }]}>
        <View style={styles.headerContent}>
          <Text style={[styles.headerText, { 
            color: theme.text, 
            fontSize: getFontSize(22),
            fontWeight: '700'
          }]} numberOfLines={1} ellipsizeMode="tail">
            Welcome back, User!
          </Text>
          
          <View style={[styles.balanceContainer, { 
            backgroundColor: theme.isDark ? '#333333' : '#FFFFFF', 
            borderLeftWidth: 4, 
            borderLeftColor: '#2196F3',
          }]}>
            <Text style={[styles.balanceLabel, { 
              color: theme.isDark ? '#E0E0E0' : '#555555',
              fontSize: getFontSize(14)
            }]}>
              Balance
            </Text>
            <Text style={[styles.balanceText, { 
              color: theme.text, 
              fontSize: getFontSize(22) 
            }]}>
              ${typeof balance === 'string' || typeof balance === 'number' ? balance : '0.00'}
            </Text>
          </View>
        </View>
      </View>

      {/* Question Card */}
      <Animated.View
        style={[
          styles.questionContainer,
          {
            transform: [
              ...pan.getTranslateTransform(), 
              { translateY: slideAnim },
              { scale: scaleAnim }
            ],
            backgroundColor: theme.card,
            borderRadius: 24,
            marginHorizontal: 16,
            paddingBottom: BOTTOM_PADDING,
            maxHeight: height - 150, // Ensure it doesn't go below navigation
          },
        ]}
        {...panResponder.panHandlers}
      >
        <Text style={[styles.questionText, { 
          color: theme.text, 
          fontSize: getFontSize(20),
          lineHeight: getFontSize(28)
        }]} adjustsFontSizeToFit numberOfLines={3} minimumFontScale={0.7}>
          {String(currentQuestion.text || '')}
        </Text>

        {currentQuestion.image && (
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: 'https://via.placeholder.com/350x150' }}
              style={styles.questionImage}
              resizeMode="cover"
            />
          </View>
        )}

        <View style={styles.optionsContainer}>
          {(currentQuestion.options || []).map((option, index) => (
            <TouchableOpacity
              key={String(option || '')}
              style={[
                styles.optionButton,
                {
                  backgroundColor: getButtonColor(option),
                  borderColor: selectedAnswer === option ? '#2E7D32' : '#1976D2',
                  width: '48%',
                }
              ]}
              onPress={() => handleAnswer(option)}
              activeOpacity={0.7}
            >
              <Text style={[styles.optionText, { 
                color: '#FFFFFF', 
                fontSize: getFontSize(18) 
              }]} adjustsFontSizeToFit numberOfLines={2} minimumFontScale={0.7}>
                {String(option || '')}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity 
          style={[
            styles.submitButton, 
            { 
              backgroundColor: selectedAnswer ? '#2196F3' : '#90CAF9',
              opacity: selectedAnswer ? 1 : 0.7,
              marginBottom: 20, // Ensure button is above navigation
            }
          ]} 
          onPress={handleSubmit}
          disabled={!selectedAnswer || isSubmitting}
        >
          <Text style={[styles.submitText, { fontSize: getFontSize(18) }]} adjustsFontSizeToFit numberOfLines={1}>
            {isSubmitting ? 'Submitting...' : 'Submit Answer'}
          </Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Reward Animation Popup */}
      {showReward && (
        <Animated.View style={[
          styles.rewardContainer,
          {
            opacity: rewardAnim,
            transform: [
              { scale: rewardAnim.interpolate({
                inputRange: [0, 0.5, 1],
                outputRange: [0.5, 1.2, 1]
              })}
            ]
          }
        ]}>
          <View style={styles.confetti}>
            {[...Array(10)].map((_, i) => ( // Reduced confetti count for better performance
              <Animated.View 
                key={i} 
                style={[
                  styles.confettiPiece, 
                  { 
                    backgroundColor: ['#FF9800', '#4CAF50', '#2196F3', '#E91E63', '#FFEB3B'][i % 5],
                    top: `${Math.random() * 100}%`,
                    left: `${Math.random() * 100}%`,
                    transform: [
                      { rotate: `${Math.random() * 360}deg` },
                      { translateY: rewardAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, Math.random() * 30 - 15]
                      })}
                    ]
                  }
                ]} 
              />
            ))}
          </View>
          <Text style={styles.rewardText}>+$0.10</Text>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    paddingTop: 40
  },
  header: { 
    paddingVertical: 14, 
    paddingHorizontal: 16, 
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerText: { 
    fontWeight: 'bold', 
    flex: 1,
  },
  balanceContainer: { 
    paddingVertical: 10, 
    paddingHorizontal: 14, 
    borderRadius: 16, 
    elevation: 4, 
    shadowColor: '#000000', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.1, 
    shadowRadius: 3,
  },
  balanceLabel: {
    marginBottom: 2
  },
  balanceText: { 
    fontWeight: 'bold', 
  },
  questionContainer: { 
    flex: 1, 
    justifyContent: 'space-between',
    padding: 20,
    marginTop: 16,
    elevation: 4, 
    shadowColor: '#000000', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.1, 
    shadowRadius: 3,
    overflow: 'hidden',
  },
  questionText: { 
    fontWeight: '600', 
    textAlign: 'center', 
    marginBottom: 20,
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 20
  },
  questionImage: {
    width: '100%',
    height: 140,
    borderRadius: 12
  },
  optionsContainer: { 
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  optionButton: {
    marginVertical: 6,
    paddingVertical: 16,
    paddingHorizontal: 10,
    borderRadius: 16,
    borderWidth: 2,
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    height: 110,
    justifyContent: 'center',
  },
  optionText: { 
    fontWeight: '600',
    textAlign: 'center',
  },
  submitButton: {
    alignSelf: 'center',
    borderRadius: 30,
    paddingVertical: 14,
    paddingHorizontal: 36,
    elevation: 4,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    backgroundColor: '#2196F3',
  },
  submitText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  rewardContainer: {
    position: 'absolute',
    top: '40%',
    left: '50%',
    marginLeft: -60,
    width: 120,
    height: 120,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
    elevation: 10,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  rewardText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  confetti: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  confettiPiece: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
  }
});

export default HomeScreen;