import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AnimatedBackground from '../../components/AnimatedBackground';
import { ApiService } from '../../services/api.service';
import { useLanguage } from '../../contexts/LanguageContext';
import Ionicons from 'react-native-vector-icons/Ionicons';

const CommunityScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { t } = useLanguage();
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
          <Text style={styles.title}>{t('community_title') || 'Communauté'}</Text>
          <TouchableOpacity style={styles.addButton} activeOpacity={0.75}>
            <Ionicons name="add" size={30} color="white" />
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
                    {post.is_anonymous ? (t('anonymous') || 'Anonyme') : post.user?.full_name}
                  </Text>
                  <Text style={styles.postTime}>Il y a 2h</Text>
                </View>
              </View>
              <Text style={styles.postTitle}>{post.title}</Text>
              <Text style={styles.postContent} numberOfLines={3}>{post.content}</Text>
              <View style={styles.postFooter}>
                <View style={styles.statRow}>
                  <Ionicons name="heart-outline" size={16} color="#ef5350" />
                  <Text style={styles.postStat}>{post.likes_count}</Text>
                </View>
                <View style={styles.statRow}>
                  <Ionicons name="chatbubble-outline" size={16} color="#7b1fa2" />
                  <Text style={styles.postStat}>{post.comments_count}</Text>
                </View>
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
    shadowColor: '#7b1fa2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 4,
  },
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
  postFooter: { flexDirection: 'row', gap: 20 },
  statRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  postStat: { fontSize: 13, fontWeight: '600', color: '#666' },
});

export default CommunityScreen;
