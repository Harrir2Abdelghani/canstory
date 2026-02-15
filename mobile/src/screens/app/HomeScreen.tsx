import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Animated,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AnimatedBackground from '../../components/AnimatedBackground';
import { useAuth } from '../../contexts/AuthContext';
import { ApiService } from '../../services/api.service';

const HomeScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [articles, setArticles] = useState<any[]>([]);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadData();
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  const loadData = async () => {
    try {
      const articlesData = await ApiService.getArticles({ limit: 5 });
      setArticles(articlesData || []);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bonjour';
    if (hour < 18) return 'Bon après-midi';
    return 'Bonsoir';
  };

  return (
    <AnimatedBackground>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#7b1fa2" />
        }
      >
        <View style={[styles.container, { paddingTop: insets.top + 20 }]}>
          <Animated.View style={{ opacity: fadeAnim }}>
            <View style={styles.header}>
              <View>
                <Text style={styles.greeting}>{getGreeting()},</Text>
                <Text style={styles.userName}>{user?.full_name || 'Utilisateur'}</Text>
              </View>
              {user?.avatar_url ? (
                <Image source={{ uri: user.avatar_url }} style={styles.avatarImage} />
              ) : (
                <View style={styles.avatarContainer}>
                  <Text style={styles.avatarText}>
                    {user?.full_name?.charAt(0).toUpperCase() || '?'}
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.quickActions}>
              <TouchableOpacity style={styles.actionCard}>
                <Text style={styles.actionIcon}>📚</Text>
                <Text style={styles.actionTitle}>Articles</Text>
                <Text style={styles.actionSubtitle}>Informations médicales</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionCard}>
                <Text style={styles.actionIcon}>🥗</Text>
                <Text style={styles.actionTitle}>Nutrition</Text>
                <Text style={styles.actionSubtitle}>Conseils alimentaires</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.quickActions}>
              <TouchableOpacity style={styles.actionCard}>
                <Text style={styles.actionIcon}>🏥</Text>
                <Text style={styles.actionTitle}>Centres</Text>
                <Text style={styles.actionSubtitle}>Centres de traitement</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionCard}>
                <Text style={styles.actionIcon}>🏠</Text>
                <Text style={styles.actionTitle}>Hébergement</Text>
                <Text style={styles.actionSubtitle}>Logements gratuits</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Articles récents</Text>
                <TouchableOpacity>
                  <Text style={styles.seeAll}>Voir tout</Text>
                </TouchableOpacity>
              </View>

              {articles.length > 0 ? (
                articles.map((article) => (
                  <TouchableOpacity key={article.id} style={styles.articleCard}>
                    <View style={styles.articleContent}>
                      <Text style={styles.articleTitle} numberOfLines={2}>
                        {article.title}
                      </Text>
                      <Text style={styles.articleExcerpt} numberOfLines={2}>
                        {article.excerpt || article.content.substring(0, 100)}
                      </Text>
                      <View style={styles.articleMeta}>
                        <Text style={styles.articleAuthor}>
                          {article.author?.full_name || 'Anonyme'}
                        </Text>
                        <Text style={styles.articleStats}>
                          👁 {article.views_count} • ❤️ {article.likes_count}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))
              ) : (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateText}>Aucun article disponible</Text>
                </View>
              )}
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Ressources utiles</Text>
              </View>

              <TouchableOpacity style={styles.resourceCard}>
                <Text style={styles.resourceIcon}>📞</Text>
                <View style={styles.resourceContent}>
                  <Text style={styles.resourceTitle}>Ligne d'écoute</Text>
                  <Text style={styles.resourceDescription}>
                    Support psychologique 24/7
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity style={styles.resourceCard}>
                <Text style={styles.resourceIcon}>💊</Text>
                <View style={styles.resourceContent}>
                  <Text style={styles.resourceTitle}>Pharmacies de garde</Text>
                  <Text style={styles.resourceDescription}>
                    Trouvez une pharmacie proche
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </ScrollView>
    </AnimatedBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  greeting: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
  },
  userName: {
    fontSize: 28,
    fontWeight: '800',
    color: '#6a1b9a',
    marginTop: 4,
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#7b1fa2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '700',
    color: 'white',
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  actionCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f3e5f5',
  },
  actionIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6a1b9a',
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 11,
    fontWeight: '400',
    color: '#888',
    textAlign: 'center',
  },
  section: {
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#6a1b9a',
  },
  seeAll: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7b1fa2',
  },
  articleCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f3e5f5',
  },
  articleContent: {
    flex: 1,
  },
  articleTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  articleExcerpt: {
    fontSize: 14,
    fontWeight: '400',
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  articleMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  articleAuthor: {
    fontSize: 12,
    fontWeight: '600',
    color: '#7b1fa2',
  },
  articleStats: {
    fontSize: 12,
    fontWeight: '500',
    color: '#999',
  },
  emptyState: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f3e5f5',
  },
  emptyStateText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#999',
  },
  resourceCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f3e5f5',
  },
  resourceIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  resourceContent: {
    flex: 1,
  },
  resourceTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#6a1b9a',
    marginBottom: 4,
  },
  resourceDescription: {
    fontSize: 13,
    fontWeight: '400',
    color: '#666',
  },
});

export default HomeScreen;
