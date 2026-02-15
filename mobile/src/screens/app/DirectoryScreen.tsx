import React, { useEffect, useState, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Animated,
  Dimensions,
  RefreshControl,
  Linking,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import AnimatedBackground from '../../components/AnimatedBackground';
import { ApiService } from '../../services/api.service';

const { width, height } = Dimensions.get('window');
const CARD_WIDTH = width - 40;

interface DirectoryItem {
  id: string;
  full_name: string;
  entity_name?: string;
  role: string;
  role_display?: string;
  specialization?: string;
  wilaya: string;
  commune?: string;
  phone?: string;
  email?: string;
  address?: string;
  avatar_url?: string;
}

const DirectoryScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [directory, setDirectory] = useState<DirectoryItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  // Modern category config with gradients
  const categories = [
    {
      id: null,
      label: 'Tous',
      icon: '🌟',
      gradient: ['#667eea', '#764ba2'],
      description: 'Tous les professionnels',
    },
    {
      id: 'doctor',
      label: 'Médecins',
      icon: '👨‍⚕️',
      gradient: ['#f093fb', '#f5576c'],
      description: 'Médecins spécialistes',
    },
    {
      id: 'pharmacy',
      label: 'Pharmacies',
      icon: '💊',
      gradient: ['#4facfe', '#00f2fe'],
      description: 'Pharmacies certifiées',
    },
    {
      id: 'association',
      label: 'Associations',
      icon: '🤝',
      gradient: ['#43e97b', '#38f9d7'],
      description: 'Associations d\'aide',
    },
    {
      id: 'cancer_center',
      label: 'Centres',
      icon: '🏥',
      gradient: ['#fa709a', '#fee140'],
      description: 'Centres de traitement',
    },
    {
      id: 'laboratory',
      label: 'Laboratoires',
      icon: '🔬',
      gradient: ['#30cfd0', '#330867'],
      description: 'Laboratoires d\'analyse',
    },
  ];

  useEffect(() => {
    loadDirectory();
    
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, [selectedCategory]);

  const loadDirectory = async () => {
    try {
      setLoading(true);
      const data = await ApiService.getUserDirectory({
        role: selectedCategory || undefined,
        limit: 100,
      });

      const filteredData = (data || []).filter((item: any) => {
        const role = item.role?.toLowerCase();
        return role !== 'patient' && role !== 'admin' && role !== 'superadmin';
      });

      setDirectory(filteredData);
    } catch (error) {
      console.error('Error loading directory:', error);
      setDirectory([]);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDirectory();
    setRefreshing(false);
  };

  const filteredDirectory = directory.filter((item) =>
    searchQuery
      ? (item.entity_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
         item.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
         item.specialization?.toLowerCase().includes(searchQuery.toLowerCase()) ||
         item.wilaya?.toLowerCase().includes(searchQuery.toLowerCase()))
      : true
  );

  const getCategoryConfig = (role: string) => {
    return categories.find((c) => c.id === role) || categories[0];
  };

  const toggleCard = (id: string) => {
    const newExpanded = new Set(expandedCards);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedCards(newExpanded);
  };

  const renderCard = (item: DirectoryItem, index: number) => {
    const config = getCategoryConfig(item.role);
    const isExpanded = expandedCards.has(item.id);

    return (
      <Animated.View
        key={item.id}
        style={[
          styles.cardContainer,
          {
            opacity: fadeAnim,
            transform: [
              { scale: scaleAnim },
              {
                translateY: fadeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [30, 0],
                }),
              },
            ],
          },
        ]}
      >
        <TouchableOpacity
          style={styles.card}
          onPress={() => toggleCard(item.id)}
          activeOpacity={0.95}
        >
          {/* Gradient Header with Icon */}
          <LinearGradient
            colors={config.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.cardHeader}
          >
            <View style={styles.headerContent}>
              <Text style={styles.cardIconLarge}>{config.icon}</Text>
              <View style={styles.headerText}>
                <Text style={styles.cardCategory}>{config.label}</Text>
              </View>
            </View>
          </LinearGradient>

          {/* Card Body */}
          <View style={styles.cardBody}>
            <Text style={styles.cardName}>
              {item.entity_name || item.full_name}
            </Text>

            {item.specialization && (
              <View style={styles.tagContainer}>
                <View style={styles.tag}>
                  <Text style={styles.tagText}>{item.specialization}</Text>
                </View>
              </View>
            )}

            <View style={styles.locationRow}>
              <Text style={styles.locationPin}>📍</Text>
              <Text style={styles.locationText}>{item.wilaya}</Text>
            </View>

            {/* Expanded Content */}
            {isExpanded && (
              <View style={styles.expandedContent}>
                <View style={styles.divider} />

                {item.commune && (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Commune</Text>
                    <Text style={styles.infoValue}>{item.commune}</Text>
                  </View>
                )}

                {/* Quick Action Buttons */}
                <View style={styles.actionsRow}>
                  {item.phone && (
                    <TouchableOpacity
                      style={[styles.actionBtn, { backgroundColor: '#10b981' }]}
                      onPress={() => Linking.openURL(`tel:${item.phone}`)}
                    >
                      <Text style={styles.actionIcon}>📞</Text>
                      <Text style={styles.actionText}>Appeler</Text>
                    </TouchableOpacity>
                  )}

                  {item.email && (
                    <TouchableOpacity
                      style={[styles.actionBtn, { backgroundColor: '#3b82f6' }]}
                      onPress={() => Linking.openURL(`mailto:${item.email}`)}
                    >
                      <Text style={styles.actionIcon}>✉️</Text>
                      <Text style={styles.actionText}>Email</Text>
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: '#8b5cf6' }]}
                    onPress={() => {
                      const query = encodeURIComponent(
                        `${item.entity_name || item.full_name}, ${item.wilaya}, Algeria`
                      );
                      Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${query}`);
                    }}
                  >
                    <Text style={styles.actionIcon}>🗺️</Text>
                    <Text style={styles.actionText}>Maps</Text>
                  </TouchableOpacity>
                </View>

                {item.address && (
                  <View style={styles.addressBox}>
                    <Text style={styles.addressLabel}>Adresse complète</Text>
                    <Text style={styles.addressText}>{item.address}</Text>
                  </View>
                )}
              </View>
            )}

            {/* Tap Indicator */}
            <View style={styles.tapIndicator}>
              <Text style={styles.tapText}>
                {isExpanded ? 'Appuyez pour réduire ⬆' : 'Appuyez pour plus de détails ⬇'}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <AnimatedBackground>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        {/* Compact Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Annuaire</Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher..."
            placeholderTextColor="#9ca3af"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Text style={styles.clearBtn}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Category Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.tabsContainer}
          contentContainerStyle={styles.tabsContent}
        >
          {categories.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <TouchableOpacity
                key={cat.id || 'all'}
                onPress={() => setSelectedCategory(cat.id)}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={isActive ? cat.gradient : ['#f3f4f6', '#f3f4f6']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.tab}
                >
                  <Text style={styles.tabIcon}>{cat.icon}</Text>
                  <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
                    {cat.label}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Cards List */}
        <ScrollView
          style={styles.cardsList}
          contentContainerStyle={styles.cardsContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#667eea" />
          }
        >
          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>✨ Chargement...</Text>
            </View>
          ) : filteredDirectory.length > 0 ? (
            filteredDirectory.map((item, index) => renderCard(item, index))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>🔍</Text>
              <Text style={styles.emptyTitle}>Aucun résultat</Text>
              <Text style={styles.emptyText}>
                {searchQuery ? 'Essayez un autre terme' : 'Aucun professionnel trouvé'}
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
    </AnimatedBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    paddingVertical: 16,
  },
  title: {
    fontSize: 36,
    fontWeight: '900',
    color: '#1f2937',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 16,
    paddingHorizontal: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  searchIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 14,
    color: '#1f2937',
  },
  clearBtn: {
    fontSize: 18,
    color: '#9ca3af',
    fontWeight: '600',
  },
  tabsContainer: {
    marginBottom: 16,
    maxHeight: 90,
  },
  tabsContent: {
    paddingRight: 20,
    gap: 12,
  },
  tab: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    minWidth: 120,
    alignItems: 'center',
  },
  tabIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  tabLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6b7280',
  },
  tabLabelActive: {
    color: 'white',
  },
  cardsList: {
    flex: 1,
  },
  cardsContent: {
    paddingBottom: 20,
  },
  cardContainer: {
    marginBottom: 16,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
  },
  cardHeader: {
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardIconLarge: {
    fontSize: 40,
    marginRight: 14,
  },
  headerText: {
    flex: 1,
  },
  cardCategory: {
    fontSize: 14,
    fontWeight: '700',
    color: 'white',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  cardBody: {
    padding: 20,
  },
  cardName: {
    fontSize: 20,
    fontWeight: '900',
    color: '#1f2937',
    marginBottom: 12,
  },
  tagContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  tag: {
    backgroundColor: '#ede9fe',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#7c3aed',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  locationPin: {
    fontSize: 16,
    marginRight: 8,
  },
  locationText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6b7280',
  },
  expandedContent: {
    marginTop: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginVertical: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
  },
  infoLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6b7280',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1f2937',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  actionIcon: {
    fontSize: 22,
    marginBottom: 6,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '700',
    color: 'white',
  },
  addressBox: {
    backgroundColor: '#f9fafb',
    padding: 14,
    borderRadius: 12,
    marginTop: 16,
    borderLeftWidth: 3,
    borderLeftColor: '#8b5cf6',
  },
  addressLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6b7280',
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  addressText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1f2937',
    lineHeight: 20,
  },
  tapIndicator: {
    alignItems: 'center',
    paddingTop: 12,
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  tapText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9ca3af',
  },
  loadingContainer: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#667eea',
  },
  emptyState: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
    opacity: 0.3,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#6b7280',
  },
});

export default DirectoryScreen;
