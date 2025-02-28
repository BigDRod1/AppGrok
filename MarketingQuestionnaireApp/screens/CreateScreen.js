import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Switch, Alert, Modal, Image } from 'react-native';
import { useTheme } from './SettingsScreen';
import * as ImagePicker from 'expo-image-picker';

export default function CreateScreen() {
  console.log('CreateScreen: Component mounted');
  const { theme } = useTheme();
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState({
    question: '',
    type: 'multiple_choice',
    options: ['', ''],
    pictures: [null, null],
    link: '',
    votes: '',
  });
  const [showMyPosts, setShowMyPosts] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false); // Preview popup
  const [showPaymentModal, setShowPaymentModal] = useState(false); // Payment popup

  const VOTE_COST = 0.10;
  const totalCost = newPost.votes ? (parseInt(newPost.votes, 10) * VOTE_COST).toFixed(2) : '0.00';

  const pickImage = async (index) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'We need permission to access your photos.');
      return;
    }
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
    if (!result.canceled) {
      const updatedPictures = [...newPost.pictures];
      updatedPictures[index] = result.assets[0].uri;
      setNewPost({ ...newPost, pictures: updatedPictures });
    }
  };

  const handlePreview = () => {
    if (!newPost.question || !newPost.votes || newPost.options.some(opt => !opt)) {
      Alert.alert('Error', 'Please fill in the question, votes, and all options.');
      return;
    }
    setShowPreviewModal(true); // Open preview popup
  };

  const handleCreatePost = () => {
    setShowPreviewModal(false); // Close preview
    setShowPaymentModal(true); // Open payment confirmation
  };

  const confirmPayment = () => {
    // Simulate payment and create post
    if (editingPost) {
      setPosts(posts.map(post => (post.id === editingPost.id ? { ...post, ...newPost } : post)));
      setEditingPost(null);
    } else {
      const post = {
        id: Date.now().toString(),
        ...newPost,
        createdAt: new Date().toISOString(),
        responses: 0,
        active: true,
      };
      setPosts([post, ...posts]);
    }
    setNewPost({
      question: '',
      type: 'multiple_choice',
      options: ['', ''],
      pictures: [null, null],
      link: '',
      votes: '',
    });
    setShowPaymentModal(false);
    Alert.alert('Success', 'Post created successfully!');
  };

  const handleDeletePost = (postId) => {
    setPosts(posts.filter(post => post.id !== postId));
  };

  const togglePostActive = (postId) => {
    setPosts(posts.map(post => (post.id === postId ? { ...post, active: !post.active } : post)));
  };

  const handleEditPost = (post) => {
    setEditingPost(post);
    setNewPost({
      question: post.question,
      type: post.type,
      options: post.options || ['', ''],
      pictures: post.pictures || [null, null],
      link: post.link || '',
      votes: post.votes || '',
    });
  };

  const simulateResponse = (postId) => {
    setPosts(posts.map(post => (post.id === postId ? { ...post, responses: post.responses + 1 } : post)));
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.text }]}>Create Content</Text>

      <View style={[styles.section, { backgroundColor: theme.card }]}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Create New Question</Text>
        <TextInput
          style={[styles.input, { backgroundColor: theme.background, color: theme.text }]}
          placeholder="Enter your question"
          placeholderTextColor={theme.text + '80'}
          value={newPost.question}
          onChangeText={(text) => setNewPost({ ...newPost, question: text })}
        />

        {newPost.type === 'multiple_choice' && (
          <View style={styles.optionsContainer}>
            {newPost.options.map((option, index) => (
              <TextInput
                key={index}
                style={[styles.input, { backgroundColor: theme.background, color: theme.text }]}
                placeholder={`Option ${index + 1}`}
                placeholderTextColor={theme.text + '80'}
                value={option}
                onChangeText={(text) => {
                  const newOptions = [...newPost.options];
                  newOptions[index] = text;
                  setNewPost({ ...newPost, options: newOptions });
                }}
              />
            ))}
            <TouchableOpacity
              style={styles.addOptionButton}
              onPress={() => setNewPost({ ...newPost, options: [...newPost.options, ''] })}
            >
              <Text style={styles.addOptionText}>+ Add Option</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.pictureContainer}>
          <TouchableOpacity style={styles.pictureButton} onPress={() => pickImage(0)}>
            <Text style={styles.pictureButtonText}>{newPost.pictures[0] ? 'Image 1 Selected' : 'Add Picture 1'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.pictureButton} onPress={() => pickImage(1)}>
            <Text style={styles.pictureButtonText}>{newPost.pictures[1] ? 'Image 2 Selected' : 'Add Picture 2'}</Text>
          </TouchableOpacity>
        </View>

        <TextInput
          style={[styles.input, { backgroundColor: theme.background, color: theme.text }]}
          placeholder="Add a link (optional)"
          placeholderTextColor={theme.text + '80'}
          value={newPost.link}
          onChangeText={(text) => setNewPost({ ...newPost, link: text })}
        />

        <TextInput
          style={[styles.input, { backgroundColor: theme.background, color: theme.text }]}
          placeholder="Number of Votes"
          placeholderTextColor={theme.text + '80'}
          value={newPost.votes}
          onChangeText={(text) => setNewPost({ ...newPost, votes: text })}
          keyboardType="number-pad"
        />

        <Text style={[styles.costDisplay, { color: theme.text }]}>
          Total Cost: ${totalCost} (${VOTE_COST} per vote)
        </Text>

        <TouchableOpacity
          style={[styles.createButton, { opacity: newPost.question && newPost.votes ? 1 : 0.7 }]}
          onPress={handlePreview}
          disabled={!newPost.question || !newPost.votes}
        >
          <Text style={styles.createButtonText}>
            {editingPost ? 'Update Preview' : 'Preview'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Preview Popup */}
      <Modal
        visible={showPreviewModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowPreviewModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.previewContainer, { backgroundColor: theme.card }]}>
            <Text style={[styles.previewQuestionText, { color: theme.text }]}>
              {newPost.question}
            </Text>

            {newPost.pictures[0] && (
              <View style={styles.previewImageContainer}>
                <Image
                  source={{ uri: newPost.pictures[0] || 'https://via.placeholder.com/350x150' }}
                  style={styles.previewQuestionImage}
                  resizeMode="cover"
                />
              </View>
            )}

            <View style={styles.previewOptionsContainer}>
              {newPost.options.map((option, index) => (
                <View
                  key={index}
                  style={[styles.previewOptionButton, { backgroundColor: '#2196F3', borderColor: '#1976D2' }]}
                >
                  <Text style={[styles.previewOptionText, { color: '#FFFFFF' }]}>
                    {option}
                  </Text>
                </View>
              ))}
            </View>

            <TouchableOpacity
              style={styles.previewPayButton}
              onPress={handleCreatePost}
            >
              <Text style={styles.previewPayButtonText}>Pay and Create</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.previewCancelButton}
              onPress={() => setShowPreviewModal(false)}
            >
              <Text style={styles.previewCancelButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Payment Confirmation Popup */}
      <Modal
        visible={showPaymentModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowPaymentModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Confirm Payment</Text>
            <Text style={[styles.modalText, { color: theme.text }]}>
              Total Cost: ${totalCost} for {newPost.votes} votes
            </Text>
            <TouchableOpacity
              style={styles.confirmButton}
              onPress={confirmPayment}
            >
              <Text style={styles.confirmButtonText}>Confirm Payment</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowPaymentModal(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* My Posts Section */}
      <View style={[styles.section, { backgroundColor: theme.card }]}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>My Posts</Text>
          <Switch
            value={showMyPosts}
            onValueChange={setShowMyPosts}
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={showMyPosts ? '#2196F3' : '#f4f3f4'}
          />
        </View>

        {showMyPosts && posts.map(post => (
          <View key={post.id} style={[styles.postCard, { backgroundColor: theme.background }]}>
            <Text style={[styles.postQuestion, { color: theme.text }]}>{post.question}</Text>
            <Text style={[styles.postStats, { color: theme.text }]}>
              Responses: {post.responses} | Votes: {post.votes}
            </Text>
            {post.link && <Text style={[styles.postStats, { color: theme.text }]}>Link: {post.link}</Text>}
            <Text style={[styles.postStats, { color: theme.text }]}>
              Engagement: {post.responses > 0 ? ((post.responses / 100) * 100).toFixed(1) : '0.0'}% (assuming 100 views)
            </Text>
            <View style={styles.postActions}>
              <Switch
                value={post.active}
                onValueChange={() => togglePostActive(post.id)}
                trackColor={{ false: '#767577', true: '#81b0ff' }}
                thumbColor={post.active ? '#2196F3' : '#f4f3f4'}
              />
              <TouchableOpacity style={styles.editButton} onPress={() => handleEditPost(post)}>
                <Text style={styles.editButtonText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeletePost(post.id)}>
                <Text style={styles.deleteButtonText}>Delete</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.simulateButton} onPress={() => simulateResponse(post.id)}>
                <Text style={styles.simulateButtonText}>+ Response</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  section: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  input: {
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  optionsContainer: {
    marginBottom: 12,
  },
  addOptionButton: {
    padding: 8,
    alignItems: 'center',
  },
  addOptionText: {
    color: '#2196F3',
    fontWeight: '600',
  },
  pictureContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  pictureButton: {
    backgroundColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  pictureButtonText: {
    color: '#333',
    fontWeight: '500',
  },
  costDisplay: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 12,
    textAlign: 'center',
  },
  createButton: {
    backgroundColor: '#2196F3',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  // Preview Modal Styles (Adapted from HomeScreen)
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  previewContainer: {
    width: '90%',
    padding: 20,
    borderRadius: 24,
    elevation: 4,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    maxHeight: '80%',
  },
  previewQuestionText: {
    fontWeight: '600',
    textAlign: 'center',
    fontSize: 20,
    lineHeight: 28,
    marginBottom: 20,
  },
  previewImageContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  previewQuestionImage: {
    width: '100%',
    height: 140,
    borderRadius: 12,
  },
  previewOptionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  previewOptionButton: {
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
    justifyContent: 'center',
  },
  previewOptionText: {
    fontWeight: '600',
    textAlign: 'center',
    fontSize: 18,
  },
  previewPayButton: {
    backgroundColor: '#2196F3',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    marginBottom: 10,
  },
  previewPayButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  previewCancelButton: {
    backgroundColor: '#FF4444',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  previewCancelButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  // Payment Modal Styles
  modalContent: {
    width: 300,
    padding: 20,
    borderRadius: 12,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  confirmButton: {
    backgroundColor: '#2196F3',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginBottom: 10,
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  cancelButton: {
    backgroundColor: '#FF4444',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  // My Posts Styles
  postCard: {
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    elevation: 1,
  },
  postQuestion: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  postStats: {
    fontSize: 14,
    marginBottom: 8,
  },
  postActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: '#FFA500',
    borderRadius: 6,
    padding: 8,
    paddingHorizontal: 12,
    marginRight: 8,
  },
  editButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: '#FF4444',
    borderRadius: 6,
    padding: 8,
    paddingHorizontal: 12,
  },
  deleteButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  simulateButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 6,
    padding: 8,
    paddingHorizontal: 12,
    marginLeft: 8,
  },
  simulateButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});