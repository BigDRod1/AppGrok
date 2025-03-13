import React from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity, Image, FlatList, useWindowDimensions } from 'react-native';

const QuestionCard = ({ 
  theme, 
  question, 
  selectedAnswer, 
  handleAnswer, 
  handleSubmit, 
  isSubmitting, 
  allImagesViewed, 
  setAllImagesViewed, // Added to props
  pan, 
  panResponder, 
  slideAnim, 
  scaleAnim 
}) => {
  const { width, height } = useWindowDimensions();
  const BOTTOM_PADDING = 100;
  const getFontSize = (baseSize) => Math.min(baseSize * 1.1, width * 0.06);

  const getButtonColor = (option) => (selectedAnswer === option ? '#4CAF50' : '#2196F3');

  const renderImage = ({ item }) => (
    item && (
      <Image
        source={{ uri: item || 'https://via.placeholder.com/350x150' }}
        style={[styles.questionImage, { width: width - 48 }]}
        resizeMode="cover"
      />
    )
  );

  return (
    <Animated.View 
      style={[
        styles.questionContainer, 
        { 
          transform: [...pan.getTranslateTransform(), { translateY: slideAnim }, { scale: scaleAnim }], 
          backgroundColor: theme.card, 
          maxHeight: height - 100 
        }
      ]} 
      {...panResponder.panHandlers}
    >
      <Text 
        style={[
          styles.questionText, 
          { color: theme.text, fontSize: getFontSize(20), lineHeight: getFontSize(28) }
        ]} 
        adjustsFontSizeToFit 
        numberOfLines={3} 
        minimumFontScale={0.7}
      >
        {question.question || ''}
      </Text>
      {question.pictures?.length > 0 && (
        <FlatList
          data={question.pictures.filter(Boolean)}
          renderItem={renderImage}
          keyExtractor={(item, index) => `${index}`}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onViewableItemsChanged={({ viewableItems }) => {
            const lastIndex = (question.pictures?.filter(Boolean).length || 1) - 1;
            if (viewableItems.some(item => item.index === lastIndex)) {
              setAllImagesViewed(true); // Fixed: Use setter function
            }
          }}
          viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
          style={styles.imageContainer}
        />
      )}
      <View style={styles.optionsContainer}>
        {(question.options || []).map((option, index) => (
          <TouchableOpacity 
            key={String(option || '')} 
            style={[
              styles.optionButton, 
              { backgroundColor: getButtonColor(option), borderColor: selectedAnswer === option ? '#2E7D32' : '#1976D2' }
            ]} 
            onPress={() => handleAnswer(option)} 
            activeOpacity={0.7}
          >
            <Text 
              style={[styles.optionText, { fontSize: getFontSize(18) }]} 
              adjustsFontSizeToFit 
              numberOfLines={2} 
              minimumFontScale={0.7}
            >
              {String(option || '')}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <TouchableOpacity 
        style={[
          styles.submitButton, 
          { 
            backgroundColor: selectedAnswer && (question.pictures?.length <= 1 || allImagesViewed) ? '#2196F3' : '#90CAF9', 
            opacity: selectedAnswer && (question.pictures?.length <= 1 || allImagesViewed) ? 1 : 0.7 
          }
        ]} 
        onPress={handleSubmit} 
        disabled={!selectedAnswer || isSubmitting || (question.pictures?.length > 1 && !allImagesViewed)}
      >
        <Text 
          style={[styles.submitText, { fontSize: getFontSize(18) }]} 
          adjustsFontSizeToFit 
          numberOfLines={1}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Answer'}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  questionContainer: { 
    flex: 1, 
    justifyContent: 'space-between', 
    padding: 20, 
    marginTop: 16, 
    marginHorizontal: 16, 
    elevation: 4, 
    shadowColor: '#000000', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.1, 
    shadowRadius: 3, 
    borderRadius: 24, 
    paddingBottom: 100, 
    overflow: 'hidden' 
  },
  questionText: { 
    fontWeight: '600', 
    textAlign: 'center', 
    marginBottom: 20 
  },
  imageContainer: { 
    height: 200, 
    marginBottom: 20 
  },
  questionImage: { 
    height: 200, 
    borderRadius: 12 
  },
  optionsContainer: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    justifyContent: 'space-between', 
    marginBottom: 20 
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
    width: '48%', 
    height: 110, 
    justifyContent: 'center' 
  },
  optionText: { 
    color: '#FFFFFF', 
    fontWeight: '600', 
    textAlign: 'center' 
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
    marginBottom: 20 
  },
  submitText: { 
    color: '#FFFFFF', 
    fontWeight: 'bold', 
    textAlign: 'center' 
  },
});

export default QuestionCard;