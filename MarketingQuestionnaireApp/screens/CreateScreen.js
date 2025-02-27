import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Switch } from 'react-native';
import { useTheme } from './SettingsScreen';

export default function CreateScreen() {
  const { theme } = useTheme();
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState({
    question: '',
    type: 'multiple_choice',
    options: ['', ''],
    rewardPerAnswer: '0.10',
  });
  const [showMyPosts, setShowMyPosts] = useState(false);

  const handleCreatePost = () => {
    const post = {
      id: Date.now().toString(),
      ...newPost,
      createdAt: new Date().toISOString(),
      responses: 0,
      active: true,
    };
    setPosts([post, ...posts]);
    setNewPost({
      question: '',
      type: 'multiple_choice',
      options: ['', ''],
      rewardPerAnswer: '0.10',
    });
  };

  const handleDeletePost = (postId) => {
    setPosts(posts.filter(post => post.id !== postId));
  };

  const togglePostActive = (postId) => {
    setPosts(posts.map(post => 
      post.id === postId ? { ...post, active: !post.active } : post
    ));
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.text }]}>Create Content</Text>
      
      {/* Create New Post Section */}
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

        <TextInput
          style={[styles.input, { backgroundColor: theme.background, color: theme.text }]}
          placeholder="Reward per answer ($)"
          placeholderTextColor={theme.text + '80'}
          value={newPost.rewardPerAnswer}
          onChangeText={(text) => setNewPost({ ...newPost, rewardPerAnswer: text })}
          keyboardType="decimal-pad"
        />

        <TouchableOpacity
          style={[styles.createButton, { opacity: newPost.question ? 1 : 0.7 }]}
          onPress={handleCreatePost}
          disabled={!newPost.question}
        >
          <Text style={styles.createButtonText}>Create Post</Text>
        </TouchableOpacity>
      </View>

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
              Responses: {post.responses} | Reward: ${post.rewardPerAnswer}
            </Text>
            <View style={styles.postActions}>
              <Switch
                value={post.active}
                onValueChange={() => togglePostActive(post.id)}
                trackColor={{ false: '#767577', true: '#81b0ff' }}
                thumbColor={post.active ? '#2196F3' : '#f4f3f4'}
              />
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDeletePost(post.id)}
              >
                <Text style={styles.deleteButtonText}>Delete</Text>
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
});