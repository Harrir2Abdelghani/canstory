import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  FlatList,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AnimatedBackground from '../../components/AnimatedBackground';
import { useLanguage } from '../../contexts/LanguageContext';
import Ionicons from 'react-native-vector-icons/Ionicons';

const { width } = Dimensions.get('window');

const CATEGORIES = (t: any) => [t('category_all') || 'Tous', t('cat_news') || 'Actualités', t('cat_health') || 'Santé', t('cat_events') || 'Événements', t('cat_research') || 'Recherche'];

const I3lamScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { t } = useLanguage();
  const categoriesList = CATEGORIES(t);
  const [selectedCategory, setSelectedCategory] = useState(categoriesList[0]);
  const fadeAnim = new Animated.Value(0);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const renderArticle = ({ item, index }: any) => (
    <TouchableOpacity style={styles.articleCard} activeOpacity={0.9}>
      <View style={styles.articleImageContainer}>
        <View style={styles.articleImagePlaceholder}>
          <Ionicons name="newspaper-outline" size={40} color="#ccc" />
        </View>
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryBadgeText}>Santé</Text>
        </View>
      </View>
      <View style={styles.articleContent}>
        <Text style={styles.articleDate}>18 Février 2026</Text>
        <Text style={styles.articleTitle} numberOfLines={2}>
          Nouveaux protocoles de soins pour le cancer du sein en Algérie
        </Text>
        <Text style={styles.articleExcerpt} numberOfLines={2}>
          Les experts se réunissent pour discuter des dernières avancées technologiques et des méthodes de traitement innovantes...
        </Text>
        <View style={styles.articleFooter}>
          <View style={styles.readMoreRow}>
            <Text style={styles.readMore}>{t('read_more') || 'Lire la suite'}</Text>
            <Ionicons name="arrow-forward-outline" size={14} color="#7b1fa2" style={{ marginLeft: 4 }} />
          </View>
          <View style={styles.viewsRow}>
            <Ionicons name="eye-outline" size={14} color="#999" />
            <Text style={styles.viewsCount}>1.2k</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <AnimatedBackground>
      <Animated.View style={[styles.container, { opacity: fadeAnim, paddingTop: 10 }]}>
        <View style={styles.header}>
          <Text style={styles.title}>{t('i3lam_title') || 'I3lam'}</Text>
          <Text style={styles.subtitle}>{t('i3lam_subtitle') || 'Actualités et informations de santé'}</Text>
        </View>

        <View style={styles.categoriesWrapper}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesContainer}>
            {categoriesList.map(cat => (
              <TouchableOpacity
                key={cat}
                onPress={() => setSelectedCategory(cat)}
                style={[
                  styles.categoryTab,
                  selectedCategory === cat && styles.activeCategoryTab
                ]}
              >
                <Text style={[
                  styles.categoryTabText,
                  selectedCategory === cat && styles.activeCategoryTabText
                ]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <FlatList
          data={[1, 2, 3, 4, 5]}
          renderItem={renderArticle}
          keyExtractor={(item) => item.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View style={styles.featuredContainer}>
              <Text style={styles.sectionTitle}>{t('featured') || 'À la une'}</Text>
              <TouchableOpacity style={styles.featuredCard} activeOpacity={0.9}>
                <View style={styles.featuredImagePlaceholder}>
                  <Ionicons name="flash-outline" size={60} color="rgba(255,255,255,0.4)" />
                </View>
                <View style={styles.featuredOverlay}>
                  <Text style={styles.featuredCategory}>DÉCOUVERTE</Text>
                  <Text style={styles.featuredTitle}>
                    L'importance du dépistage précoce expliqué par nos experts
                  </Text>
                </View>
              </TouchableOpacity>
              <Text style={styles.sectionTitle}>{t('recent_articles') || 'Articles récents'}</Text>
            </View>
          }
        />
      </Animated.View>
    </AnimatedBackground>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20 },
  header: { marginTop: 10, marginBottom: 15 },
  title: { fontSize: 32, fontWeight: '900', color: '#7b1fa2' },
  subtitle: { fontSize: 16, color: '#666', marginTop: 4 },
  categoriesWrapper: { marginBottom: 20 },
  categoriesContainer: { gap: 10, paddingRight: 20 },
  categoryTab: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#eee',
  },
  activeCategoryTab: {
    backgroundColor: '#7b1fa2',
    borderColor: '#7b1fa2',
  },
  categoryTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  activeCategoryTabText: {
    color: '#fff',
  },
  listContent: { paddingBottom: 100 },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#333',
    marginBottom: 15,
    marginTop: 10,
  },
  featuredContainer: { marginBottom: 10 },
  featuredCard: {
    height: 200,
    borderRadius: 25,
    backgroundColor: '#f3e5f5',
    overflow: 'hidden',
    marginBottom: 20,
    elevation: 5,
    shadowColor: '#7b1fa2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  featuredImagePlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#7b1fa2',
  },
  featuredImageIcon: { fontSize: 60 },
  featuredOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  featuredCategory: {
    color: '#f3e5f5',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
    marginBottom: 5,
  },
  featuredTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
  },
  articleCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    marginBottom: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#eee',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  articleImageContainer: {
    height: 150,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  articleImagePlaceholder: { alignItems: 'center' },
  imageIcon: { fontSize: 40 },
  categoryBadge: {
    position: 'absolute',
    top: 15,
    left: 15,
    backgroundColor: '#7b1fa2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  categoryBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  articleContent: { padding: 15 },
  articleDate: {
    fontSize: 12,
    color: '#999',
    marginBottom: 5,
  },
  articleTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#333',
    marginBottom: 8,
  },
  articleExcerpt: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  articleFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f5f5f5',
    paddingTop: 12,
  },
  readMore: {
    color: '#7b1fa2',
    fontWeight: '700',
    fontSize: 14,
  },
  readMoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewsCount: {
    fontSize: 12,
    color: '#999',
  },
});

export default I3lamScreen;
