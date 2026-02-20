import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  FlatList,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AnimatedBackground from '../../components/AnimatedBackground';
import { useLanguage } from '../../contexts/LanguageContext';
import Ionicons from 'react-native-vector-icons/Ionicons';

const { width } = Dimensions.get('window');

const CATEGORIES = (t: any) => [t('category_all') || 'Tous', t('cat_wellbeing') || 'Bien-être', t('cat_psychology') || 'Psychologie', t('cat_sport') || 'Sport', t('cat_sleep') || 'Sommeil'];

const Nassa2ihScreen: React.FC = () => {
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

  const renderTip = ({ item }: any) => (
    <TouchableOpacity style={styles.tipCard} activeOpacity={0.9}>
      <View style={styles.tipHeader}>
        <View style={styles.tipIconContainer}>
          <Ionicons name="sparkles-outline" size={20} color="#7b1fa2" />
        </View>
        <View style={styles.tipBadge}>
          <Text style={styles.tipBadgeText}>Bien-être</Text>
        </View>
      </View>
      <View style={styles.tipContent}>
        <Text style={styles.tipTitle}>Pratiquer la méditation de pleine conscience</Text>
        <Text style={styles.tipDescription}>
          Prendre 10 minutes par jour pour se concentrer sur sa respiration peut réduire considérablement le stress et l'anxiété.
        </Text>
        <View style={styles.tipFooter}>
          <View style={styles.readMoreRow}>
            <Text style={styles.readMore}>{t('read_full_tip') || 'Lire le conseil complet'}</Text>
            <Ionicons name="chevron-forward-outline" size={14} color="#7b1fa2" style={{ marginLeft: 4 }} />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <AnimatedBackground>
      <Animated.View style={[styles.container, { opacity: fadeAnim, paddingTop: 10 }]}>
        <View style={styles.header}>
          <Text style={styles.title}>{t('nassa2ih_title') || 'Nassa2ih'}</Text>
          <Text style={styles.subtitle}>{t('nassa2ih_subtitle') || 'Conseils et bien-être au quotidien'}</Text>
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
          data={[1, 2, 3, 4]}
          renderItem={renderTip}
          keyExtractor={(item) => item.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View style={styles.heroContainer}>
              <TouchableOpacity style={styles.heroCard} activeOpacity={0.9}>
                <View style={styles.heroContent}>
                  <Text style={styles.heroLabel}>{t('tip_of_day') || 'CONSEIL DU JOUR'}</Text>
                  <Text style={styles.heroTitle}>Comment rester positif pendant le traitement ?</Text>
                  <Text style={styles.heroText}>Découvrez les techniques de psychologie positive recommandées par nos experts.</Text>
                </View>
                <View style={styles.heroIconContainer}>
                  <Ionicons name="heart-outline" size={32} color="#fff" />
                </View>
              </TouchableOpacity>
              <Text style={styles.sectionTitle}>{t('all_tips') || 'Tous les conseils'}</Text>
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
  heroContainer: { marginBottom: 10 },
  heroCard: {
    backgroundColor: '#7b1fa2',
    borderRadius: 25,
    padding: 25,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
    elevation: 5,
    shadowColor: '#7b1fa2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  heroContent: { flex: 1, marginRight: 15 },
  heroLabel: { color: '#f3e5f5', fontSize: 12, fontWeight: '900', letterSpacing: 1, marginBottom: 5 },
  heroTitle: { color: '#fff', fontSize: 20, fontWeight: '800', marginBottom: 8 },
  heroText: { color: '#f3e5f5', fontSize: 14, lineHeight: 20 },
  heroIconContainer: { width: 60, height: 60, borderRadius: 30, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  heroIcon: { fontSize: 32 },
  sectionTitle: { fontSize: 22, fontWeight: '800', color: '#333', marginBottom: 15 },
  tipCard: {
    backgroundColor: '#fff',
    borderRadius: 25,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#eee',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  tipHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  tipIconContainer: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#f3e5f5', alignItems: 'center', justifyContent: 'center' },
  tipIcon: { fontSize: 20 },
  tipBadge: { backgroundColor: '#f3e5f5', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  tipBadgeText: { color: '#7b1fa2', fontSize: 10, fontWeight: '800', textTransform: 'uppercase' },
  tipContent: {},
  tipTitle: { fontSize: 18, fontWeight: '800', color: '#333', marginBottom: 8 },
  tipDescription: { fontSize: 14, color: '#666', lineHeight: 22, marginBottom: 15 },
  tipFooter: { borderTopWidth: 1, borderTopColor: '#f5f5f5', paddingTop: 15 },
  readMoreRow: { flexDirection: 'row', alignItems: 'center' },
  readMore: { color: '#7b1fa2', fontWeight: '700', fontSize: 14 },
});

export default Nassa2ihScreen;
