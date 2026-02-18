import React, { useEffect, useState, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Animated,
  Image,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import AnimatedBackground from '../../components/AnimatedBackground';
import { useAuth } from '../../contexts/AuthContext';
import { ApiService } from '../../services/api.service';
import { useLanguage } from '../../contexts/LanguageContext';
import Ionicons from 'react-native-vector-icons/Ionicons';

const { width } = Dimensions.get('window');

const HomeScreen: React.FC = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { t } = useLanguage();
  const [refreshing, setRefreshing] = useState(false);
  const [articles, setArticles] = useState<any[]>([]);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    loadData();
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, scaleAnim]);

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
    if (hour < 12) return t('greeting_morning');
    if (hour < 18) return t('greeting_afternoon');
    return t('greeting_evening');
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
        <Animated.View
          style={[
            styles.container,
            {
              paddingTop: 16,
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >

          <View style={styles.featuredCard}>
            <View style={styles.featuredBg} />
            <View style={styles.featuredContent}>
              <View style={styles.featuredHeader}>
                <Text style={styles.featuredBadge}>{t('home_featured_badge') || 'À LA UNE'}</Text>
                <Ionicons name="sparkles" size={20} color="white" />
              </View>
              <Text style={styles.featuredTitle}>{t('home_featured_title') || 'Votre allié santé au quotidien'}</Text>
              <Text style={styles.featuredDesc}>{t('home_featured_desc') || 'Découvrez nos conseils personnalisés et trouvez les meilleurs spécialistes près de chez vous.'}</Text>
            </View>
          </View>

          <View style={styles.quickGrid}>
            <TouchableOpacity 
              style={[styles.quickCard, { backgroundColor: '#f3e5f5' }]} 
              activeOpacity={0.7} 
              onPress={() => navigation.navigate('I3lamTab' as never)}
            >
              <View style={[styles.quickIconCircle, { backgroundColor: '#e1bee7' }]}>
                <Ionicons name="megaphone-outline" size={24} color="#7b1fa2" />
              </View>
              <Text style={styles.quickLabel}>{t('i3lam_title')}</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.quickCard, { backgroundColor: '#e8f5e9' }]} 
              activeOpacity={0.7} 
              onPress={() => navigation.navigate('Ghida2akTab' as never)}
            >
              <View style={[styles.quickIconCircle, { backgroundColor: '#c8e6c9' }]}>
                <Ionicons name="nutrition-outline" size={24} color="#2e7d32" />
              </View>
              <Text style={styles.quickLabel}>{t('ghida2ak_title')}</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.quickCard, { backgroundColor: '#fff3e0' }]} 
              activeOpacity={0.7} 
              onPress={() => navigation.navigate('Nassa2ihTab' as never)}
            >
              <View style={[styles.quickIconCircle, { backgroundColor: '#ffe0b2' }]}>
                <Ionicons name="bulb-outline" size={24} color="#ef6c00" />
              </View>
              <Text style={styles.quickLabel}>{t('nassa2ih_title')}</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.quickCard, { backgroundColor: '#e3f2fd' }]} 
              activeOpacity={0.7} 
              onPress={() => navigation.navigate('DirectoryTab' as never)}
            >
              <View style={[styles.quickIconCircle, { backgroundColor: '#bbdefb' }]}>
                <Ionicons name="list-outline" size={24} color="#1565c0" />
              </View>
              <Text style={styles.quickLabel}>{t('directory_title')}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('home_latest_articles') || 'Derniers articles'}</Text>

            {articles.length > 0 ? (
              articles.map((article) => (
                <TouchableOpacity
                  key={article.id}
                  style={styles.articleCard}
                  activeOpacity={0.65}
                  onPress={() => {}}
                >
                  <View style={styles.articleLeft}>
                    <Ionicons name="document-text-outline" size={24} color="#7b1fa2" />
                  </View>
                  <View style={styles.articleBody}>
                    <Text style={styles.articleTitle} numberOfLines={2}>
                      {article.title}
                    </Text>
                    <Text style={styles.articleMeta}>
                      {article.author?.full_name || 'Anonyme'} • {article.views_count} vues
                    </Text>
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>{t('home_no_articles') || 'Aucun article'}</Text>
              </View>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('home_resources') || 'Ressources'}</Text>

            <TouchableOpacity style={styles.resourceCard} activeOpacity={0.65} onPress={() => {}}>
              <View style={[styles.resourceBg, { backgroundColor: '#fff5f7' }]}>
                <Ionicons name="call-outline" size={24} color="#ff5252" />
              </View>
              <View style={styles.resourceBody}>
                <Text style={styles.resourceTitle}>{t('home_listening_line') || "Ligne d'écoute"}</Text>
                <Text style={styles.resourceDesc}>{t('home_listening_line_desc') || 'Support psychologique'}</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.resourceCard} activeOpacity={0.65} onPress={() => {}}>
              <View style={[styles.resourceBg, { backgroundColor: '#f5f0ff' }]}>
                <Ionicons name="medkit-outline" size={24} color="#7b1fa2" />
              </View>
              <View style={styles.resourceBody}>
                <Text style={styles.resourceTitle}>{t('home_pharmacies') || 'Pharmacies'}</Text>
                <Text style={styles.resourceDesc}>{t('home_pharmacies_desc') || 'Pharmacies de garde'}</Text>
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.spacer} />
        </Animated.View>
      </ScrollView>
    </AnimatedBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 85,
    marginTop: 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  greeting: {
    fontSize: 13,
    fontWeight: '500',
    color: '#aaa',
    letterSpacing: 0.3,
  },
  userName: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1a1a1a',
    marginTop: 4,
  },
  avatarContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#7b1fa2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '700',
    color: 'white',
  },
  featuredCard: {
    marginBottom: 24,
    marginTop: 0,
    borderRadius: 24,
    overflow: 'hidden',
  },
  featuredBg: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: '#7b1fa2',
  },
  featuredHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  featuredBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    color: 'white',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
  featuredContent: {
    padding: 24,
  },
  featuredIcon: {
    fontSize: 24,
  },
  featuredTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: 'white',
    marginBottom: 8,
  },
  featuredDesc: {
    fontSize: 14,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 20,
    marginBottom: 20,
  },
  featuredBtn: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  featuredBtnText: {
    color: '#7b1fa2',
    fontWeight: '700',
    fontSize: 14,
  },
  quickGrid: {
   flexDirection: 'row',
   flexWrap: 'wrap',
   justifyContent: 'space-between',
   marginBottom: 28,
   gap: 1
},

  quickCard: {
    width: '48%',
    marginBottom: 12,
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 4,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  quickIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickIcon: {
    fontSize: 28,
  },
  quickLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 14,
  },
  articleCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  articleLeft: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#f3e5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  articleIcon: {
    fontSize: 22,
  },
  articleBody: {
    flex: 1,
  },
  articleTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  articleMeta: {
    fontSize: 13,
    fontWeight: '500',
    color: '#888',
  },
  emptyState: {
    backgroundColor: 'white',
    borderRadius: 14,
    paddingVertical: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f5f5f5',
  },
  emptyStateText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#aaa',
  },
  resourceCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  resourceBg: {
    width: 52,
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  resourceIcon: {
    fontSize: 26,
  },
  resourceBody: {
    flex: 1,
  },
  resourceTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  resourceDesc: {
    fontSize: 13,
    fontWeight: '400',
    color: '#888',
  },
  spacer: {
    height: 40,
  },
});

export default HomeScreen;
