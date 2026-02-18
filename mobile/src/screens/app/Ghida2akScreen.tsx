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

const CATEGORIES = (t: any) => [t('category_all') || 'Tous', t('cat_recipes') || 'Recettes', t('cat_tips') || 'Conseils', t('cat_vitamins') || 'Vitamines', t('cat_diets') || 'Régimes'];

const Ghida2akScreen: React.FC = () => {
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

  const renderRecipe = ({ item }: any) => (
    <TouchableOpacity style={styles.recipeCard} activeOpacity={0.9}>
      <View style={styles.recipeImageContainer}>
        <View style={styles.recipeImagePlaceholder}>
          <Ionicons name="restaurant-outline" size={60} color="#ccc" />
        </View>
        <View style={styles.timeBadge}>
          <Ionicons name="time-outline" size={14} color="#333" style={{ marginRight: 4 }} />
          <Text style={styles.timeText}>20 min</Text>
        </View>
      </View>
      <View style={styles.recipeContent}>
        <Text style={styles.recipeTitle}>Salade détox aux baies et noix</Text>
        <Text style={styles.recipeDescription}>Une salade riche en antioxydants pour booster votre système immunitaire.</Text>
          <View style={styles.footerRow}>
            <View style={styles.difficultyContainer}>
              <Text style={styles.difficultyText}>Niveau: Facile</Text>
            </View>
            <View style={styles.caloriesContainer}>
              <Ionicons name="flame-outline" size={14} color="#ef5350" style={{ marginRight: 4 }} />
              <Text style={styles.caloriesText}>250 kcal</Text>
            </View>
          </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <AnimatedBackground>
      <Animated.View style={[styles.container, { opacity: fadeAnim, paddingTop: 10 }]}>
        <View style={styles.header}>
          <Text style={styles.title}>{t('ghida2ak_title') || 'Ghida2ak'}</Text>
          <Text style={styles.subtitle}>{t('ghida2ak_subtitle') || 'Votre guide nutritionnel'}</Text>
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
          renderItem={renderRecipe}
          keyExtractor={(item) => item.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View style={styles.specialContainer}>
              <View style={styles.tipCard}>
                <View style={styles.tipIconContainer}>
                  <Ionicons name="bulb-outline" size={24} color="#7b1fa2" />
                </View>
                <View style={styles.tipContent}>
                  <Text style={styles.tipTitle}>{t('tip_of_day') || 'Conseil du jour'}</Text>
                  <Text style={styles.tipText}>
                    Boire un verre d'eau tiède avec du citron chaque matin aide à détoxifier votre foie.
                  </Text>
                </View>
              </View>
              <Text style={styles.sectionTitle}>{t('recommended_recipes') || 'Recettes recommandées'}</Text>
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
  specialContainer: { marginBottom: 10 },
  tipCard: {
    backgroundColor: '#f3e5f5',
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
    borderWidth: 1,
    borderColor: '#e1bee7',
  },
  tipIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  tipIcon: { fontSize: 24 },
  tipContent: { flex: 1 },
  tipTitle: { fontSize: 16, fontWeight: '800', color: '#7b1fa2', marginBottom: 2 },
  tipText: { fontSize: 13, color: '#666', lineHeight: 18 },
  sectionTitle: { fontSize: 20, fontWeight: '800', color: '#333', marginBottom: 15 },
  recipeCard: {
    backgroundColor: '#fff',
    borderRadius: 25,
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
  recipeImageContainer: {
    height: 160,
    backgroundColor: '#f9f9f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recipeImagePlaceholder: { alignItems: 'center' },
  recipeIcon: { fontSize: 60 },
  timeBadge: {
    position: 'absolute',
    bottom: 15,
    right: 15,
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: { fontSize: 12, fontWeight: '700', color: '#333' },
  recipeContent: { padding: 20 },
  recipeTitle: { fontSize: 18, fontWeight: '800', color: '#333', marginBottom: 8 },
  recipeDescription: { fontSize: 14, color: '#777', lineHeight: 20, marginBottom: 15 },
  recipeFooter: {
    borderTopWidth: 1,
    borderTopColor: '#f5f5f5',
    paddingTop: 15,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  difficultyContainer: {
    backgroundColor: '#e8f5e9',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  difficultyText: { fontSize: 12, fontWeight: '600', color: '#2e7d32' },
  caloriesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  caloriesText: { fontSize: 13, fontWeight: '700', color: '#ef5350' },
});

export default Ghida2akScreen;
