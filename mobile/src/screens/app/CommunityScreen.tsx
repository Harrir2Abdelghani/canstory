import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AnimatedBackground from '../../components/AnimatedBackground';
import { ApiService } from '../../services/api.service';

const CommunityScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const [posts, setPosts] = useState<any[]>([]);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      const data = await ApiService.getCommunityPosts({ limit: 20 });
      setPosts(data || []);
    } catch (error) {
      console.error('Error loading posts:', error);
    }
  };

  return (
    <AnimatedBackground>
      <View style={[styles.container, { paddingTop: insets.top + 20 }]}>
        <View style={styles.header}>
          <Text style={styles.title}>Communauté</Text>
          <TouchableOpacity style={styles.addButton}>
            <Text style={styles.addButtonText}>+</Text>
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {posts.map((post) => (
            <TouchableOpacity key={post.id} style={styles.postCard}>
              <View style={styles.postHeader}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {post.is_anonymous ? '?' : post.user?.full_name?.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.postHeaderContent}>
                  <Text style={styles.postAuthor}>
                    {post.is_anonymous ? 'Anonyme' : post.user?.full_name}
                  </Text>
                  <Text style={styles.postTime}>Il y a 2h</Text>
                </View>
              </View>
              <Text style={styles.postTitle}>{post.title}</Text>
              <Text style={styles.postContent} numberOfLines={3}>{post.content}</Text>
              <View style={styles.postFooter}>
                <Text style={styles.postStat}>❤️ {post.likes_count}</Text>
                <Text style={styles.postStat}>💬 {post.comments_count}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </AnimatedBackground>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 28, fontWeight: '800', color: '#6a1b9a' },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#7b1fa2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: { fontSize: 24, fontWeight: '600', color: 'white' },
  postCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f3e5f5',
  },
  postHeader: { flexDirection: 'row', marginBottom: 12 },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#7b1fa2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: { fontSize: 16, fontWeight: '700', color: 'white' },
  postHeaderContent: { flex: 1, justifyContent: 'center' },
  postAuthor: { fontSize: 14, fontWeight: '700', color: '#333' },
  postTime: { fontSize: 12, fontWeight: '500', color: '#999' },
  postTitle: { fontSize: 16, fontWeight: '700', color: '#333', marginBottom: 8 },
  postContent: { fontSize: 14, fontWeight: '400', color: '#666', lineHeight: 20, marginBottom: 12 },
  postFooter: { flexDirection: 'row', gap: 16 },
  postStat: { fontSize: 13, fontWeight: '600', color: '#888' },
});

export default CommunityScreen;
