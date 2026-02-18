import React, { useEffect, useState, useRef, useMemo } from 'react';
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
  Modal,
  FlatList,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AnimatedBackground from '../../components/AnimatedBackground';
import { ApiService } from '../../services/api.service';
import { useLanguage } from '../../contexts/LanguageContext';
import Ionicons from 'react-native-vector-icons/Ionicons';

const { width, height } = Dimensions.get('window');

interface DirectoryItem {
  id: string;
  full_name: string;
  entity_name?: string;
  role: string;
  specialization?: string;
  wilaya: string;
  commune?: string;
  phone?: string;
  email?: string;
  address?: string;
  avatar_url?: string;
  description?: string;
  horaires?: string;
}

const ALGERIA_WILAYAS = [
  "Adrar", "Chlef", "Laghouat", "Oum El Bouaghi", "Batna", "Béjaïa", "Biskra", "Béchar", 
  "Blida", "Bouira", "Tamanrasset", "Tébessa", "Tlemcen", "Tiaret", "Tizi Ouzou", "Alger", 
  "Djelfa", "Jijel", "Sétif", "Saïda", "Skikda", "Sidi Bel Abbès", "Annabba", "Guelma", 
  "Constantine", "Médéa", "Mostaganem", "M'Sila", "Mascara", "Ouargla", "Oran", "El Bayadh", 
  "Illizi", "Bordj Bou Arréridj", "Boumerdès", "El Tarf", "Tindouf", "Tissemsilt", "El Oued", 
  "Khenchela", "Souk Ahras", "Tipaza", "Mila", "Aïn Defla", "Naâma", "Aïn Témouchent", 
  "Ghardaïa", "Relizane", "Timimoun", "Bordj Badji Mokhtar", "Ouled Djellal", "Béni Abbès", 
  "In Salah", "In Guezzam", "Touggourt", "Djanet", "El M'Ghair", "El Meniaa"
].sort();

const DirectoryScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedWilaya, setSelectedWilaya] = useState<string>('');
  const [directory, setDirectory] = useState<DirectoryItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showWilayaModal, setShowWilayaModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<DirectoryItem | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  const categories = useMemo(() => [
    { id: 'all', label: t('category_all'), icon: 'apps-outline', color: '#7b1fa2' },
    { id: 'doctor', label: t('category_doctors'), icon: 'medkit-outline', color: '#10b981' },
    { id: 'cancer_center', label: t('category_centers'), icon: 'business-outline', color: '#ef4444' },
    { id: 'psychologist', label: t('category_psy'), icon: 'heart-outline', color: '#8b5cf6' },
    { id: 'laboratory', label: t('category_labs'), icon: 'flask-outline', color: '#3b82f6' },
    { id: 'pharmacy', label: t('category_pharmacies'), icon: 'bandage-outline', color: '#f59e0b' },
    { id: 'association', label: t('category_assoc'), icon: 'people-outline', color: '#ec4899' },
    { id: 'lodging', label: t('category_lodging'), icon: 'home-outline', color: '#6366f1' },
  ], [t]);

  useEffect(() => {
    loadData();
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await ApiService.getUserDirectory();
      // Filter out admin, superadmin, and patient roles
      const filteredRoles = (data || []).filter((item: any) => {
        const role = item.role?.toLowerCase();
        return role !== 'admin' && role !== 'superadmin' && role !== 'patient';
      });
      setDirectory(filteredRoles);
    } catch (error) {
      console.error('Error fetching directory:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const filteredData = useMemo(() => {
    return directory.filter(item => {
      const matchesSearch = !searchQuery || 
        item.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.entity_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.specialization?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = selectedCategory === 'all' || item.role === selectedCategory;
      const matchesWilaya = !selectedWilaya || item.wilaya === selectedWilaya;

      return matchesSearch && matchesCategory && matchesWilaya;
    });
  }, [directory, searchQuery, selectedCategory, selectedWilaya]);

  const toggleFavorite = (id: string) => {
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(fid => fid !== id) : [...prev, id]
    );
  };

  const openDetail = (user: DirectoryItem) => {
    setSelectedUser(user);
    setShowDetailModal(true);
  };

  const renderItem = ({ item }: { item: DirectoryItem }) => (
    <TouchableOpacity 
      style={styles.card} 
      activeOpacity={0.9}
      onPress={() => openDetail(item)}
    >
      <View style={styles.cardHeader}>
        {item.avatar_url ? (
          <Image source={{ uri: item.avatar_url }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatarPlaceholder, { backgroundColor: '#f3e5f5' }]}>
            <Text style={styles.avatarInitial}>{item.full_name?.charAt(0)}</Text>
          </View>
        )}
        <View style={styles.headerInfo}>
          <Text style={styles.name}>{item.entity_name || item.full_name}</Text>
          <Text style={styles.roleText}>{item.specialization || item.role}</Text>
        </View>
        <TouchableOpacity 
          onPress={() => toggleFavorite(item.id)}
          hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
          style={styles.favBtn}
        >
          <Ionicons 
            name={favorites.includes(item.id) ? 'heart' : 'heart-outline'} 
            size={22} 
            color={favorites.includes(item.id) ? '#ef4444' : '#ccc'} 
          />
        </TouchableOpacity>
      </View>

      <View style={styles.cardBody}>
        <View style={styles.infoRow}>
          <Ionicons name="location-outline" size={14} color="#7b1fa2" style={styles.miniIcon} />
          <Text style={styles.infoText}>{item.wilaya}{item.commune ? `, ${item.commune}` : ''}</Text>
        </View>
        {item.address && (
          <View style={styles.infoRow}>
            <Ionicons name="map-outline" size={14} color="#7b1fa2" style={styles.miniIcon} />
            <Text style={styles.infoText} numberOfLines={1}>{item.address}</Text>
          </View>
        )}
      </View>

      <View style={styles.cardFooter}>
        <TouchableOpacity 
          style={styles.callBtn}
          onPress={() => item.phone && Linking.openURL(`tel:${item.phone}`)}
        >
          <Ionicons name="call-outline" size={18} color="#7b1fa2" />
          <Text style={styles.btnText}>{t('call') || 'Appeler'}</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.mapBtn}
          onPress={() => {
            const query = encodeURIComponent(`${item.entity_name || item.full_name}, ${item.wilaya}`);
            Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${query}`);
          }}
        >
          <Ionicons name="navigate-outline" size={18} color="#2e7d32" />
          <Text style={[styles.btnText, { color: '#2e7d32' }]}>{t('itinerary') || 'Itinéraire'}</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <AnimatedBackground>
      <View style={[styles.container, { paddingTop: 10, paddingBottom: 85 }]}>
        <View style={styles.header}>
          <Text style={styles.title}>{t('directory_title') || 'Annuaire'}</Text>
          <Text style={styles.subtitle}>{t('directory_subtitle') || 'Trouvez des professionnels de santé'}</Text>
        </View>

        <View style={styles.searchContainer}>
          <View style={styles.searchBox}>
            <Ionicons name="search-outline" size={18} color="#999" />
            <TextInput
              style={styles.searchInput}
              placeholder={t('search_placeholder') || "Rechercher..."}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#999"
            />
          </View>
          <TouchableOpacity 
            style={styles.wilayaPicker}
            onPress={() => setShowWilayaModal(true)}
          >
            <Text style={styles.wilayaValue} numberOfLines={1}>
              {selectedWilaya || (t('wilaya_label') || "Wilaya")}
            </Text>
            <Ionicons name="chevron-down" size={14} color="#999" />
          </TouchableOpacity>
        </View>

        <View style={styles.catWrapper}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catList}>
            {categories.map(cat => (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.catItem,
                  selectedCategory === cat.id && { backgroundColor: cat.color, borderColor: cat.color }
                ]}
                onPress={() => setSelectedCategory(cat.id)}
              >
                <Ionicons 
                  name={cat.icon as any} 
                  size={16} 
                  color={selectedCategory === cat.id ? '#fff' : cat.color} 
                  style={{ marginRight: 6 }}
                />
                <Text style={[styles.catLabel, selectedCategory === cat.id && { color: '#fff' }]}>
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <FlatList
          data={filteredData}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="folder-open-outline" size={60} color="#ddd" />
              <Text style={styles.emptyText}>{t('no_results') || 'Aucun résultat trouvé'}</Text>
            </View>
          }
        />

        <Modal visible={showWilayaModal} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{t('wilaya_label') || 'Wilayas'}</Text>
                <TouchableOpacity onPress={() => setShowWilayaModal(false)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                  <Ionicons name="close-outline" size={24} color="#999" />
                </TouchableOpacity>
              </View>
              <ScrollView>
                <TouchableOpacity 
                  style={styles.wilayaItem}
                  onPress={() => { setSelectedWilaya(''); setShowWilayaModal(false); }}
                >
                  <Text style={styles.wilayaItemText}>{t('all_wilayas') || 'Toutes les wilayas'}</Text>
                </TouchableOpacity>
                {ALGERIA_WILAYAS.map(w => (
                  <TouchableOpacity 
                    key={w}
                    style={styles.wilayaItem}
                    onPress={() => { setSelectedWilaya(w); setShowWilayaModal(false); }}
                  >
                    <Text style={styles.wilayaItemText}>{w}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>

        <Modal visible={showDetailModal} transparent animationType="fade">
          <View style={styles.detailOverlay}>
            <Animated.View style={styles.detailContent}>
              <View style={styles.detailHeader}>
                <View style={styles.detailHeaderTop}>
                  <TouchableOpacity onPress={() => setShowDetailModal(false)} style={styles.detailCloseBtn}>
                    <Ionicons name="close-outline" size={20} color="#333" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => selectedUser && toggleFavorite(selectedUser.id)}>
                    <Ionicons 
                      name={selectedUser && favorites.includes(selectedUser.id) ? 'heart' : 'heart-outline'} 
                      size={24} 
                      color={selectedUser && favorites.includes(selectedUser.id) ? '#ef4444' : '#333'} 
                    />
                  </TouchableOpacity>
                </View>
                
                <View style={styles.detailUserInfo}>
                  {selectedUser?.avatar_url ? (
                    <Image source={{ uri: selectedUser.avatar_url }} style={styles.detailAvatar} />
                  ) : (
                    <View style={styles.detailAvatarPlaceholder}>
                      <Text style={styles.detailAvatarInitial}>{selectedUser?.full_name?.charAt(0)}</Text>
                    </View>
                  )}
                  <Text style={styles.detailName}>{selectedUser?.entity_name || selectedUser?.full_name}</Text>
                  <View style={styles.detailBadge}>
                    <Text style={styles.detailBadgeText}>{selectedUser?.specialization || selectedUser?.role}</Text>
                  </View>
                </View>
              </View>

              <ScrollView style={styles.detailScroll} showsVerticalScrollIndicator={false}>
                <View style={styles.detailSection}>
                  <Text style={styles.sectionLabel}>{t('details_contact') || 'Coordonnées'}</Text>
                  <View style={styles.detailInfoRow}>
                    <Ionicons name="location-outline" size={18} color="#7b1fa2" style={styles.detailInfoIcon} />
                    <Text style={styles.detailInfoText}>{selectedUser?.wilaya}, {selectedUser?.commune}</Text>
                  </View>
                  {selectedUser?.address && (
                    <View style={styles.detailInfoRow}>
                      <Ionicons name="map-outline" size={18} color="#7b1fa2" style={styles.detailInfoIcon} />
                      <Text style={styles.detailInfoText}>{selectedUser.address}</Text>
                    </View>
                  )}
                  {selectedUser?.phone && (
                    <View style={styles.detailInfoRow}>
                      <Ionicons name="call-outline" size={18} color="#7b1fa2" style={styles.detailInfoIcon} />
                      <Text style={styles.detailInfoText}>{selectedUser.phone}</Text>
                    </View>
                  )}
                  {selectedUser?.email && (
                    <View style={styles.detailInfoRow}>
                      <Ionicons name="mail-outline" size={18} color="#7b1fa2" style={styles.detailInfoIcon} />
                      <Text style={styles.detailInfoText}>{selectedUser.email}</Text>
                    </View>
                  )}
                </View>

                {selectedUser?.horaires && (
                  <View style={styles.detailSection}>
                    <Text style={styles.sectionLabel}>{t('details_hours') || 'Horaires d\'ouverture'}</Text>
                    <View style={styles.detailInfoRow}>
                      <Ionicons name="time-outline" size={18} color="#7b1fa2" style={styles.detailInfoIcon} />
                      <Text style={styles.detailInfoText}>{selectedUser.horaires}</Text>
                    </View>
                  </View>
                )}

                {selectedUser?.description && (
                  <View style={styles.detailSection}>
                    <Text style={styles.sectionLabel}>{t('details_about') || 'À propos'}</Text>
                    <Text style={styles.detailDescription}>{selectedUser.description}</Text>
                  </View>
                )}

                <View style={styles.detailActions}>
                  <TouchableOpacity 
                    style={[styles.detailActionBtn, { backgroundColor: '#7b1fa2' }]}
                    onPress={() => selectedUser?.phone && Linking.openURL(`tel:${selectedUser.phone}`)}
                  >
                    <Text style={styles.detailActionBtnText}>{t('call_now') || 'Appeler maintenant'}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.detailActionBtn, { backgroundColor: '#f3e5f5' }]}
                    onPress={() => {
                      if (selectedUser) {
                        const query = encodeURIComponent(`${selectedUser.entity_name || selectedUser.full_name}, ${selectedUser.wilaya}`);
                        Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${query}`);
                      }
                    }}
                  >
                    <Text style={[styles.detailActionBtnText, { color: '#7b1fa2' }]}>{t('view_on_map') || 'Voir sur la carte'}</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </Animated.View>
          </View>
        </Modal>
      </View>
    </AnimatedBackground>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20 },
  header: { marginBottom: 20 , marginTop: 10},
   title: { fontSize: 32, fontWeight: '900', color: '#7b1fa2' },
  subtitle: { fontSize: 16, color: '#666', marginTop: 4 },
  searchContainer: { flexDirection: 'row', gap: 10, marginBottom: 15 },
  searchBox: { 
    flex: 1, 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#fff', 
    borderRadius: 15, 
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#eee'
  },
  searchIcon: { fontSize: 18, marginRight: 8 },
  searchInput: { flex: 1, height: 45, fontSize: 15, color: '#333' },
  wilayaPicker: { 
    width: 110, 
    backgroundColor: '#fff', 
    borderRadius: 15, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#eee'
  },
  wilayaValue: { fontSize: 14, color: '#333', flex: 1 },
  pickerArrow: { fontSize: 10, color: '#999', marginLeft: 4 },
  catWrapper: { marginBottom: 20 },
  catList: { gap: 10 },
  catItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#fff', 
    paddingHorizontal: 15, 
    paddingVertical: 10, 
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#eee'
  },
  catIcon: { fontSize: 18, marginRight: 6 },
  catLabel: { fontSize: 14, fontWeight: '600', color: '#666' },
  listContent: { paddingBottom: 100 },
  card: { 
    backgroundColor: '#fff', 
    borderRadius: 20, 
    padding: 16, 
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  avatar: { width: 50, height: 50, borderRadius: 25 },
  avatarPlaceholder: { 
    width: 50, 
    height: 50, 
    borderRadius: 25, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  avatarInitial: { fontSize: 20, fontWeight: 'bold', color: '#7b1fa2' },
  headerInfo: { flex: 1, marginLeft: 12 },
  name: { fontSize: 18, fontWeight: '700', color: '#333' },
  roleText: { fontSize: 14, color: '#666', marginTop: 2 },
  favBtn: {
    padding: 8,
  },
  miniIcon: {
    marginRight: 6,
  },
  cardBody: { marginBottom: 15 },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  infoIcon: { fontSize: 14, width: 20 },
  infoText: { fontSize: 14, color: '#666', flex: 1 },
  cardFooter: { flexDirection: 'row', gap: 10 },
  callBtn: { 
    flex: 1, 
    flexDirection: 'row',
    paddingVertical: 10, 
    borderRadius: 12, 
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f3e5f5',
    gap: 8,
  },
  mapBtn: { 
    flex: 1, 
    flexDirection: 'row',
    paddingVertical: 10, 
    borderRadius: 12, 
    alignItems: 'center', 
    justifyContent: 'center',
    backgroundColor: '#e8f5e9',
    gap: 8,
  },
  btnText: { fontSize: 14, fontWeight: '600', color: '#7b1fa2' },
  emptyContainer: { alignItems: 'center', marginTop: 100 },
  emptyIcon: { fontSize: 60, marginBottom: 10, opacity: 0.2 },
  emptyText: { fontSize: 16, color: '#999' },
  modalOverlay: { 
    flex: 1, 
    backgroundColor: 'rgba(0,0,0,0.5)', 
    justifyContent: 'flex-end' 
  },
  modalContent: { 
    backgroundColor: '#fff', 
    borderTopLeftRadius: 30, 
    borderTopRightRadius: 30, 
    height: height * 0.7, 
    padding: 20 
  },
  modalHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 20 
  },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  closeBtn: { fontSize: 20, color: '#999', padding: 5 },
  wilayaItem: { 
    paddingVertical: 15, 
    borderBottomWidth: 1, 
    borderBottomColor: '#f5f5f5' 
  },
  wilayaItemText: { fontSize: 16, color: '#333' },
  // Detail Modal Styles
  detailOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  detailContent: {
    backgroundColor: '#fff',
    borderRadius: 30,
    width: '100%',
    maxHeight: '85%',
    overflow: 'hidden',
  },
  detailHeader: {
    backgroundColor: '#f3e5f5',
    padding: 25,
    alignItems: 'center',
  },
  detailHeaderTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    position: 'absolute',
    top: 15,
    paddingHorizontal: 20,
    zIndex: 1,
  },
  detailCloseBtn: {
    width: 35,
    height: 35,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtnText: { fontSize: 18, color: '#333', fontWeight: '600' },
  favIconLarge: { fontSize: 24 },
  detailUserInfo: { alignItems: 'center', marginTop: 10 },
  detailAvatar: { width: 100, height: 100, borderRadius: 50, borderWidth: 4, borderColor: '#fff' },
  detailAvatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#7b1fa2',
  },
  detailAvatarInitial: { fontSize: 40, fontWeight: '800', color: '#7b1fa2' },
  detailName: { fontSize: 24, fontWeight: '800', color: '#333', marginTop: 15, textAlign: 'center' },
  detailBadge: {
    backgroundColor: '#7b1fa2',
    paddingHorizontal: 15,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 10,
  },
  detailBadgeText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  detailScroll: { padding: 25 },
  detailSection: { marginBottom: 25 },
  sectionLabel: { fontSize: 16, fontWeight: '800', color: '#7b1fa2', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 },
  detailInfoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  detailInfoIcon: { fontSize: 18, width: 30 },
  detailInfoText: { fontSize: 15, color: '#444', flex: 1, lineHeight: 22 },
  detailDescription: { fontSize: 15, color: '#666', lineHeight: 24 },
  detailActions: { gap: 12, marginTop: 10, marginBottom: 30 },
  detailActionBtn: {
    height: 55,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#7b1fa2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  detailActionBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});

export default DirectoryScreen;

