import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, Modal, Image, useWindowDimensions } from 'react-native';
import { useTheme } from '../ThemeContext'; // Fixed import
import { useAuth } from '../contexts/AuthContext'; // Use AuthContext
import { db, collection, addDoc, query, onSnapshot, doc, updateDoc, deleteDoc, where } from '../firebase'; // Removed auth imports
import * as ImagePicker from 'expo-image-picker';

const CreateScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const { width } = useWindowDimensions();
  const { user, loading } = useAuth(); // Get user and loading from context
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState({ question: '', type: 'multiple_choice', options: ['', ''], pictures: [null, null], link: '', votes: '' });
  const [editingPost, setEditingPost] = useState(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showReactivatePaymentModal, setShowReactivatePaymentModal] = useState(false);
  const [reactivatePostId, setReactivatePostId] = useState(null);
  const [additionalVotes, setAdditionalVotes] = useState('');
  const [responses, setResponses] = useState({});
  const [hasCreatedFirstPost, setHasCreatedFirstPost] = useState(false);

  const VOTE_COST = 0.10;
  const EARNINGS_LIMIT = 10.00;
  const totalCost = newPost.votes ? (parseInt(newPost.votes, 10) * VOTE_COST).toFixed(2) : '0.00';
  const reactivateTotalCost = additionalVotes ? (parseInt(additionalVotes, 10) * VOTE_COST).toFixed(2) : '0.00';

  const getFontSize = (baseSize) => Math.min(baseSize * 1.1, width * 0.06);
  const headerBackgroundColor = theme.isDark ? '#1E1E1E' : '#E3F2FD';
  const headerTextColor = theme.isDark ? '#FFFFFF' : '#1976D2';

  useEffect(() => {
    if (loading || !user) {
      console.error('CreateScreen: Skipping useEffect, loading=', loading, 'user=', user ? user.uid : 'none');
      setPosts([]);
      return;
    }

    console.error('CreateScreen: Setting up Firestore listeners for userId=', user.uid);

    const q = query(collection(db, 'posts'), where('userId', '==', user.uid));
    const unsubscribePosts = onSnapshot(q, (snapshot) => {
      const loadedPosts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      loadedPosts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setPosts(loadedPosts);
      setHasCreatedFirstPost(loadedPosts.length > 0);
    }, (error) => console.error('CreateScreen: Error fetching posts:', error));

    const responseQ = query(collection(db, 'responses'));
    const unsubscribeResponses = onSnapshot(responseQ, (snapshot) => {
      const responseData = {};
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (!responseData[data.questionId]) responseData[data.questionId] = [];
        responseData[data.questionId].push(data.response);
      });
      setResponses(responseData);

      posts.forEach(post => {
        if (post.active && responseData[post.id]?.length >= post.votes) {
          updateDoc(doc(db, 'posts', post.id), { active: false })
            .catch(error => console.error('CreateScreen: Error deactivating post:', error));
        }
      });
    }, (error) => console.error('CreateScreen: Error fetching responses:', error));

    return () => {
      console.error('CreateScreen: Cleaning up listeners');
      unsubscribePosts();
      unsubscribeResponses();
    };
  }, [user, loading, posts, responses, navigation]);

  const pickImage = async (index) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return Alert.alert('Permission Denied', 'We need permission to access your photos.');
    let result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [4, 3], quality: 1 });
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
    if (!user && hasCreatedFirstPost) {
      Alert.alert('Limit Reached', 'Please sign in to continue.', [
        { text: 'Sign In', onPress: () => navigation.navigate('Settings') },
        { text: 'Cancel' },
      ]);
      return;
    }
    setShowPreviewModal(true);
  };

  const handleCreatePost = () => {
    setShowPreviewModal(false);
    setShowPaymentModal(true);
  };

  const confirmPayment = async () => {
    if (!user && hasCreatedFirstPost) {
      Alert.alert('Sign In Required', 'Please sign in to pay and create more posts.', [
        { text: 'Sign In', onPress: () => navigation.navigate('Settings') },
        { text: 'Cancel', onPress: () => setShowPaymentModal(false) },
      ]);
      return;
    }

    try {
      const postData = {
        question: newPost.question,
        type: newPost.type,
        options: newPost.options,
        pictures: newPost.pictures,
        link: newPost.link || '',
        votes: parseInt(newPost.votes, 10),
        createdAt: new Date().toISOString(),
        responses: 0,
        active: true,
        userId: user ? user.uid : 'anonymous',
      };

      if (editingPost) {
        await updateDoc(doc(db, 'posts', editingPost.id), postData);
      } else {
        await addDoc(collection(db, 'posts'), postData);
        if (!user) setHasCreatedFirstPost(true);
      }

      setNewPost({ question: '', type: 'multiple_choice', options: ['', ''], pictures: [null, null], link: '', votes: '' });
      setEditingPost(null);
      setShowPaymentModal(false);
      Alert.alert('Success', editingPost ? 'Post updated!' : 'Post created!');
    } catch (error) {
      console.error('CreateScreen: Error saving post:', error);
      Alert.alert('Error', 'Failed to save post.');
    }
  };

  const handleDeactivatePost = async (postId) => {
    try {
      await updateDoc(doc(db, 'posts', postId), { active: false });
      Alert.alert('Success', 'Post marked as inactive.');
    } catch (error) {
      console.error('CreateScreen: Error deactivating post:', error);
      Alert.alert('Error', 'Failed to deactivate post.');
    }
  };

  const handleActivatePost = async (postId) => {
    try {
      await updateDoc(doc(db, 'posts', postId), { active: true });
      Alert.alert('Success', 'Post reactivated.');
    } catch (error) {
      console.error('CreateScreen: Error activating post:', error);
      Alert.alert('Error', 'Failed to activate post.');
    }
  };

  const handleReactivatePost = () => {
    if (!user) {
      Alert.alert('Sign In Required', 'Please sign in to reactivate posts.', [
        { text: 'Sign In', onPress: () => navigation.navigate('Settings') },
        { text: 'Cancel' },
      ]);
      return;
    }
    setShowReactivatePaymentModal(true);
  };

  const confirmReactivatePayment = async () => {
    if (!additionalVotes || parseInt(additionalVotes, 10) <= 0) {
      Alert.alert('Error', 'Please enter a valid number of additional votes.');
      return;
    }

    try {
      const postId = reactivatePostId;
      const additionalVotesNum = parseInt(additionalVotes, 10);
      const post = posts.find(p => p.id === postId);
      const newMaxVotes = post.votes + additionalVotesNum;

      await updateDoc(doc(db, 'posts', postId), { votes: newMaxVotes, active: true });
      setShowReactivatePaymentModal(false);
      setAdditionalVotes('');
      setReactivatePostId(null);
      Alert.alert('Success', 'Post reactivated with additional votes!');
    } catch (error) {
      console.error('CreateScreen: Error reactivating post:', error);
      Alert.alert('Error', 'Failed to reactivate post.');
    }
  };

  const handleErasePost = async (postId) => {
    try {
      await deleteDoc(doc(db, 'posts', postId));
      Alert.alert('Success', 'Post erased permanently.');
    } catch (error) {
      console.error('CreateScreen: Error erasing post:', error);
      Alert.alert('Error', 'Failed to erase post.');
    }
  };

  const handleEditPost = (post) => {
    setEditingPost(post);
    setNewPost({ question: post.question, type: post.type, options: post.options || ['', ''], pictures: post.pictures || [null, null], link: post.link || '', votes: post.votes.toString() });
    setReactivatePostId(post.id);
  };

  const getAnswerStats = (postId, option, maxVotes) => {
    const postResponses = responses[postId] || [];
    const totalVotes = postResponses.length;
    const currentVotes = postResponses.filter(resp => resp === option).length;
    const percentage = totalVotes > 0 ? ((currentVotes / totalVotes) * 100).toFixed(1) : '0.0';
    return { currentVotes, maxVotes, percentage };
  };

  const getPostStatus = (post) => {
    const totalResponses = responses[post.id]?.length || 0;
    if (!post.active && totalResponses < post.votes) return 'Inactive';
    if (totalResponses >= post.votes) return 'Complete';
    return 'Active';
  };

  const formatDate = (isoString) => {
    return new Date(isoString).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  if (loading) {
    console.error('CreateScreen: RENDERING LOADING');
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={{ color: theme.text }}>Loading...</Text>
      </View>
    );
  }

  console.error('CreateScreen: RENDERING MAIN');
  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: headerBackgroundColor, borderBottomWidth: 1, borderBottomColor: theme.isDark ? '#424242' : '#BBDEFB' }]}>
        <Text style={[styles.headerText, { color: headerTextColor, fontSize: getFontSize(22), fontWeight: '700' }]}>Create Content</Text>
        <View style={styles.headerRight}>
          {user && (
            <TouchableOpacity style={styles.signOutButton} onPress={() => auth.signOut()}>
              <Text style={styles.signOutButtonText}>Sign Out</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
      <ScrollView style={styles.content}>
        <View style={[styles.section, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Create New Question</Text>
          <TextInput style={[styles.input, { backgroundColor: theme.background, color: theme.text }]} placeholder="Enter your question" placeholderTextColor={theme.text + '80'} value={newPost.question} onChangeText={(text) => setNewPost({ ...newPost, question: text })} />
          {newPost.type === 'multiple_choice' && (
            <View style={styles.optionsContainer}>
              {newPost.options.map((option, index) => (
                <TextInput key={index} style={[styles.input, { backgroundColor: theme.background, color: theme.text }]} placeholder={`Option ${index + 1}`} placeholderTextColor={theme.text + '80'} value={option} onChangeText={(text) => {
                  const newOptions = [...newPost.options];
                  newOptions[index] = text;
                  setNewPost({ ...newPost, options: newOptions });
                }} />
              ))}
              <TouchableOpacity style={styles.addOptionButton} onPress={() => setNewPost({ ...newPost, options: [...newPost.options, ''] })}>
                <Text style={styles.addOptionText}>+ Add Option</Text>
              </TouchableOpacity>
            </View>
          )}
          <View style={styles.pictureContainer}>
            <TouchableOpacity style={styles.pictureButton} onPress={() => pickImage(0)}><Text style={styles.pictureButtonText}>{newPost.pictures[0] ? 'Image 1 Selected' : 'Add Picture 1'}</Text></TouchableOpacity>
            <TouchableOpacity style={styles.pictureButton} onPress={() => pickImage(1)}><Text style={styles.pictureButtonText}>{newPost.pictures[1] ? 'Image 2 Selected' : 'Add Picture 2'}</Text></TouchableOpacity>
          </View>
          <TextInput style={[styles.input, { backgroundColor: theme.background, color: theme.text }]} placeholder="Add a link (optional)" placeholderTextColor={theme.text + '80'} value={newPost.link} onChangeText={(text) => setNewPost({ ...newPost, link: text })} />
          <TextInput style={[styles.input, { backgroundColor: theme.background, color: theme.text }]} placeholder="Number of Votes" placeholderTextColor={theme.text + '80'} value={newPost.votes} onChangeText={(text) => setNewPost({ ...newPost, votes: text })} keyboardType="number-pad" />
          <Text style={[styles.costDisplay, { color: theme.text }]}>Total Cost: ${totalCost} (${VOTE_COST} per vote)</Text>
          <TouchableOpacity style={[styles.createButton, { opacity: newPost.question && newPost.votes ? 1 : 0.7 }]} onPress={handlePreview} disabled={!newPost.question || !newPost.votes}>
            <Text style={styles.createButtonText}>{editingPost ? 'Update Preview' : 'Preview'}</Text>
          </TouchableOpacity>
        </View>

        <Modal visible={showPreviewModal} transparent={true} animationType="slide" onRequestClose={() => setShowPreviewModal(false)}>
          <View style={styles.modalOverlay}>
            <View style={[styles.previewContainer, { backgroundColor: theme.card }]}>
              <Text style={[styles.previewQuestionText, { color: theme.text }]}>{newPost.question}</Text>
              {newPost.pictures.some(pic => pic) && (
                <View style={styles.previewImageContainer}>
                  {newPost.pictures.map((uri, index) => (
                    uri && (
                      <Image
                        key={index}
                        source={{ uri: uri || 'https://via.placeholder.com/350x150' }}
                        style={[styles.previewQuestionImage, { width: newPost.pictures.filter(Boolean).length > 1 ? '48%' : '100%' }]}
                        resizeMode="cover"
                      />
                    )
                  ))}
                </View>
              )}
              <View style={styles.previewOptionsContainer}>
                {newPost.options.map((option, index) => (
                  <View key={index} style={[styles.previewOptionButton, { backgroundColor: '#2196F3', borderColor: '#1976D2' }]}>
                    <Text style={[styles.previewOptionText, { color: '#FFFFFF' }]}>{option}</Text>
                  </View>
                ))}
              </View>
              <TouchableOpacity style={styles.previewPayButton} onPress={handleCreatePost}><Text style={styles.previewPayButtonText}>Pay and Create</Text></TouchableOpacity>
              <TouchableOpacity style={styles.previewCancelButton} onPress={() => setShowPreviewModal(false)}><Text style={styles.previewCancelButtonText}>Close</Text></TouchableOpacity>
            </View>
          </View>
        </Modal>

        <Modal visible={showPaymentModal} transparent={true} animationType="slide" onRequestClose={() => setShowPaymentModal(false)}>
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>Confirm Payment</Text>
              <Text style={[styles.modalText, { color: theme.text }]}>Total Cost: ${totalCost} for {newPost.votes} votes</Text>
              <TouchableOpacity style={styles.confirmButton} onPress={confirmPayment}><Text style={styles.confirmButtonText}>Confirm Payment</Text></TouchableOpacity>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setShowPaymentModal(false)}><Text style={styles.cancelButtonText}>Cancel</Text></TouchableOpacity>
            </View>
          </View>
        </Modal>

        <Modal visible={showReactivatePaymentModal} transparent={true} animationType="slide" onRequestClose={() => setShowReactivatePaymentModal(false)}>
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>Reactivate Post</Text>
              <Text style={[styles.modalText, { color: theme.text }]}>Enter additional votes to reactivate:</Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.background, color: theme.text }]}
                placeholder="Additional Votes"
                placeholderTextColor={theme.text + '80'}
                value={additionalVotes}
                onChangeText={setAdditionalVotes}
                keyboardType="number-pad"
              />
              <Text style={[styles.modalText, { color: theme.text }]}>Total Cost: ${reactivateTotalCost} (${VOTE_COST} per vote)</Text>
              <TouchableOpacity style={styles.confirmButton} onPress={confirmReactivatePayment}><Text style={styles.confirmButtonText}>Confirm Payment</Text></TouchableOpacity>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setShowReactivatePaymentModal(false)}><Text style={styles.cancelButtonText}>Cancel</Text></TouchableOpacity>
            </View>
          </View>
        </Modal>

        <View style={[styles.section, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>My Posts</Text>
          {posts.map(post => (
            <View key={post.id} style={[styles.postCard, { backgroundColor: theme.background }]}>
              <View style={styles.postHeader}>
                <Text style={[styles.postQuestion, { color: theme.text }]}>{post.question}</Text>
                <Text style={[styles.postStatus, { 
                  color: getPostStatus(post) === 'Active' ? '#4CAF50' : getPostStatus(post) === 'Complete' ? '#2196F3' : '#FF4444' 
                }]}>
                  {getPostStatus(post)}
                </Text>
              </View>
              <Text style={[styles.postDate, { color: theme.text }]}>Posted: {formatDate(post.createdAt)}</Text>
              <Text style={[styles.postStats, { color: theme.text }]}>Max Votes: {post.votes}</Text>
              {post.link && <Text style={[styles.postStats, { color: theme.text }]}>Link: {post.link}</Text>}
              <View style={styles.responseList}>
                {post.options.map((option, index) => {
                  const { currentVotes, maxVotes, percentage } = getAnswerStats(post.id, option, post.votes);
                  return (
                    <Text key={index} style={[styles.responseItem, { color: theme.text }]}>
                      {option}: {currentVotes} / {maxVotes} ({percentage}%)
                    </Text>
                  );
                })}
              </View>
              <View style={styles.postActions}>
                <TouchableOpacity style={styles.editButton} onPress={() => handleEditPost(post)}><Text style={styles.editButtonText}>Edit</Text></TouchableOpacity>
                {getPostStatus(post) !== 'Complete' && (
                  <TouchableOpacity 
                    style={getPostStatus(post) === 'Inactive' ? styles.activateButton : styles.deleteButton} 
                    onPress={() => getPostStatus(post) === 'Inactive' ? handleActivatePost(post.id) : handleDeactivatePost(post.id)}
                  >
                    <Text style={styles.deleteButtonText}>
                      {getPostStatus(post) === 'Inactive' ? 'Activate' : 'Deactivate'}
                    </Text>
                  </TouchableOpacity>
                )}
                {getPostStatus(post) === 'Complete' && (
                  <TouchableOpacity style={styles.reactivateButton} onPress={handleReactivatePost}><Text style={styles.reactivateButtonText}>Reactivate</Text></TouchableOpacity>
                )}
                <TouchableOpacity style={styles.eraseButton} onPress={() => handleErasePost(post.id)}><Text style={styles.eraseButtonText}>Erase</Text></TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingVertical: 14, paddingHorizontal: 16, paddingTop: 40, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerText: { fontWeight: 'bold' },
  headerRight: { flexDirection: 'row', alignItems: 'center' },
  signOutButton: { backgroundColor: '#FF4444', borderRadius: 6, padding: 8 },
  signOutButtonText: { color: '#FFFFFF', fontWeight: '600' },
  content: { flex: 1 },
  section: { borderRadius: 12, padding: 16, marginBottom: 20, elevation: 2 },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 16 },
  input: { borderRadius: 8, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: '#ddd' },
  optionsContainer: { marginBottom: 12 },
  addOptionButton: { padding: 8, alignItems: 'center' },
  addOptionText: { color: '#2196F3', fontWeight: '600' },
  pictureContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  pictureButton: { backgroundColor: '#E0E0E0', borderRadius: 8, padding: 12, flex: 1, alignItems: 'center', marginHorizontal: 4 },
  pictureButtonText: { color: '#333', fontWeight: '500' },
  costDisplay: { fontSize: 16, fontWeight: '500', marginBottom: 12, textAlign: 'center' },
  createButton: { backgroundColor: '#2196F3', borderRadius: 8, padding: 14, alignItems: 'center', marginTop: 8 },
  createButtonText: { color: '#FFFFFF', fontWeight: '600', fontSize: 16 },
  modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' },
  previewContainer: { width: '90%', padding: 20, borderRadius: 24, elevation: 4, shadowColor: '#000000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3, maxHeight: '80%' },
  previewQuestionText: { fontWeight: '600', textAlign: 'center', fontSize: 20, lineHeight: 28, marginBottom: 20 },
  previewImageContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap' },
  previewQuestionImage: { height: 140, borderRadius: 12, marginHorizontal: '1%', marginBottom: 10 },
  previewOptionsContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 20 },
  previewOptionButton: { marginVertical: 6, paddingVertical: 16, paddingHorizontal: 10, borderRadius: 16, borderWidth: 2, elevation: 2, shadowColor: '#000000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 2, width: '48%', height: 110, justifyContent: 'center' },
  previewOptionText: { fontWeight: '600', textAlign: 'center', fontSize: 18 },
  previewPayButton: { backgroundColor: '#2196F3', borderRadius: 8, padding: 14, alignItems: 'center', marginBottom: 10 },
  previewPayButtonText: { color: '#FFFFFF', fontWeight: '600', fontSize: 16 },
  previewCancelButton: { backgroundColor: '#FF4444', borderRadius: 8, padding: 12, alignItems: 'center' },
  previewCancelButtonText: { color: '#FFFFFF', fontWeight: '600', fontSize: 16 },
  modalContent: { width: 300, padding: 20, borderRadius: 12, elevation: 5 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' },
  modalText: { fontSize: 16, marginBottom: 20, textAlign: 'center' },
  confirmButton: { backgroundColor: '#2196F3', borderRadius: 8, padding: 12, alignItems: 'center', marginBottom: 10 },
  confirmButtonText: { color: '#FFFFFF', fontWeight: '600', fontSize: 16 },
  cancelButton: { backgroundColor: '#FF4444', borderRadius: 8, padding: 12, alignItems: 'center' },
  cancelButtonText: { color: '#FFFFFF', fontWeight: '600', fontSize: 16 },
  postCard: { borderRadius: 8, padding: 12, marginBottom: 12, elevation: 1 },
  postHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  postQuestion: { fontSize: 16, fontWeight: '500', flex: 1 },
  postStatus: { fontSize: 14, fontWeight: '600' },
  postDate: { fontSize: 12, marginBottom: 8 },
  postStats: { fontSize: 14, marginBottom: 8 },
  postActions: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' },
  editButton: { backgroundColor: '#FFA500', borderRadius: 6, padding: 8, paddingHorizontal: 12, marginRight: 8, marginBottom: 8 },
  editButtonText: { color: '#FFFFFF', fontWeight: '600' },
  deleteButton: { backgroundColor: '#FF4444', borderRadius: 6, padding: 8, paddingHorizontal: 12, marginBottom: 8 },
  activateButton: { backgroundColor: '#4CAF50', borderRadius: 6, padding: 8, paddingHorizontal: 12, marginBottom: 8 },
  deleteButtonText: { color: '#FFFFFF', fontWeight: '600' },
  reactivateButton: { backgroundColor: '#2196F3', borderRadius: 6, padding: 8, paddingHorizontal: 12, marginLeft: 8, marginBottom: 8 },
  reactivateButtonText: { color: '#FFFFFF', fontWeight: '600' },
  eraseButton: { backgroundColor: '#9E9E9E', borderRadius: 6, padding: 8, paddingHorizontal: 12, marginLeft: 8, marginBottom: 8 },
  eraseButtonText: { color: '#FFFFFF', fontWeight: '600' },
  responseList: { marginTop: 8 },
  responseItem: { fontSize: 14, marginLeft: 8 },
});

export default CreateScreen;