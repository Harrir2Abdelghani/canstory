import React, { useEffect, useState, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
  RefreshControl,
  Linking,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import AnimatedBackground from '../../components/AnimatedBackground';
import { ApiService } from '../../services/api.service';
import { useLanguage } from '../../contexts/LanguageContext';
import Ionicons from 'react-native-vector-icons/Ionicons';

const { width } = Dimensions.get('window');

interface AboutSection {
  id: string;
  section: string;
  title_fr?: string;
  title_ar?: string;
  title_en?: string;
  content_fr?: string;
  content_ar?: string;
  content_en?: string;
  images?: any;
  metadata?: any;
  display_order: number;
}

interface TeamMember {
  id: string;
  full_name: string;
  position_fr: string;
  position_ar?: string;
  position_en?: string;
  bio_fr?: string;
  bio_ar?: string;
  bio_en?: string;
  avatar_url?: string;
  email?: string;
  linkedin_url?: string;
  display_order: number;
}

interface ContactInfo {
  id: string;
  type: string;
  label_fr: string;
  label_ar?: string;
  label_en?: string;
  value: string;
  icon?: string;
  display_order: number;
}

const AboutScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { t, language } = useLanguage();
  const [sections, setSections] = useState<AboutSection[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [contacts, setContacts] = useState<ContactInfo[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [expandedTeam, setExpandedTeam] = useState<Set<string>>(new Set());

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    loadAboutData();
    
    fadeAnim.setValue(0);
    scaleAnim.setValue(0.9);
    slideAnim.setValue(50);
    
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 7,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 700,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, scaleAnim, slideAnim]);

  const loadAboutData = async () => {
    try {
      setLoading(true);
      const [sectionsData, teamData, contactsData] = await Promise.all([
        ApiService.getAboutSections(),
        ApiService.getTeamMembers(),
        ApiService.getContactInfo(),
      ]);

      setSections(sectionsData || []);
      setTeamMembers(teamData || []);
      setContacts(contactsData || []);
    } catch (error) {
      console.error('Error loading about data:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAboutData();
    setRefreshing(false);
  };

  const toggleSection = (id: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedSections(newExpanded);
  };

  const toggleTeamMember = (id: string) => {
    const newExpanded = new Set(expandedTeam);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedTeam(newExpanded);
  };

  const getSectionIcon = (section: string) => {
    const icons: { [key: string]: string } = {
      mission: 'target',
      vision: 'eye-outline',
      values: 'diamond-outline',
      story: 'book-outline',
      team: 'people-outline',
      default: 'sparkles-outline',
    };
    return icons[section.toLowerCase()] || icons.default;
  };

  const getContactIcon = (type: string) => {
    const icons: { [key: string]: string } = {
      phone: 'call-outline',
      email: 'mail-outline',
      address: 'location-outline',
      website: 'globe-outline',
      facebook: 'logo-facebook',
      instagram: 'logo-instagram',
      twitter: 'logo-twitter',
      linkedin: 'logo-linkedin',
      default: 'information-circle-outline',
    };
    return icons[type.toLowerCase()] || icons.default;
  };

  const handleContactPress = (type: string, value: string) => {
    switch (type.toLowerCase()) {
      case 'phone':
        Linking.openURL(`tel:${value}`);
        break;
      case 'email':
        Linking.openURL(`mailto:${value}`);
        break;
      case 'website':
      case 'facebook':
      case 'instagram':
      case 'twitter':
      case 'linkedin':
        Linking.openURL(value.startsWith('http') ? value : `https://${value}`);
        break;
      case 'address':
        const query = encodeURIComponent(value);
        Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${query}`);
        break;
      default:
        break;
    }
  };

  const renderHero = () => (
    <LinearGradient
      colors={['#7b1fa2', '#6a1b9a']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.hero}
    >
      <Animated.View
        style={[
          styles.heroContent,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <Ionicons name="ribbon-outline" size={60} color="white" style={{ marginBottom: 12 }} />
        <Text style={styles.heroTitle}>{t('about_app') || 'À Propos'}</Text>
        <Text style={styles.heroSubtitle}>{t('about_hero_subtitle') || 'Canstory - Ensemble contre le cancer'}</Text>
      </Animated.View>
    </LinearGradient>
  );

  const renderSection = (section: AboutSection, index: number) => {
    const isExpanded = expandedSections.has(section.id);
    const content = section.content_fr || '';
    const shouldShowExpand = content.length > 150;

    return (
      <Animated.View
        key={section.id}
        style={[
          styles.sectionCard,
          {
            opacity: fadeAnim,
            transform: [
              { scale: scaleAnim },
              {
                translateY: slideAnim.interpolate({
                  inputRange: [0, 50],
                  outputRange: [0, 30],
                }),
              },
            ],
          },
        ]}
      >
        <TouchableOpacity
          onPress={() => shouldShowExpand && toggleSection(section.id)}
          activeOpacity={shouldShowExpand ? 0.7 : 1}
        >
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIconContainer}>
              <Ionicons name={getSectionIcon(section.section) as any} size={24} color="#7b1fa2" />
            </View>
            <View style={styles.sectionHeaderText}>
              <Text style={styles.sectionTitle}>
                {language === 'AR' ? section.title_ar : (language === 'EN' ? section.title_en : section.title_fr) || section.section}
              </Text>
            </View>
          </View>

          <View style={styles.sectionContent}>
            <Text
              style={styles.sectionText}
              numberOfLines={isExpanded ? undefined : 3}
            >
              {language === 'AR' ? section.content_ar : (language === 'EN' ? section.content_en : section.content_fr)}
            </Text>

            {shouldShowExpand && (
              <View style={styles.expandIndicator}>
                <Text style={styles.expandText}>
                  {isExpanded ? (t('view_less') || 'Voir moins') : (t('view_more') || 'Voir plus')}
                </Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderTeamMember = (member: TeamMember, index: number) => {
    const isExpanded = expandedTeam.has(member.id);
    const hasBio = !!member.bio_fr;

    return (
      <Animated.View
        key={member.id}
        style={[
          styles.teamCard,
          {
            opacity: fadeAnim,
            transform: [
              { scale: scaleAnim },
              {
                translateY: slideAnim.interpolate({
                  inputRange: [0, 50],
                  outputRange: [0, 30],
                }),
              },
            ],
          },
        ]}
      >
        <TouchableOpacity
          onPress={() => hasBio && toggleTeamMember(member.id)}
          activeOpacity={hasBio ? 0.7 : 1}
        >
          <View style={styles.teamHeader}>
            {member.avatar_url ? (
              <Image source={{ uri: member.avatar_url }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>
                  {member.full_name.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}

            <View style={styles.teamInfo}>
              <Text style={styles.teamName}>{member.full_name}</Text>
              <Text style={styles.teamPosition}>
                {language === 'AR' ? member.position_ar : (language === 'EN' ? member.position_en : member.position_fr)}
              </Text>
            </View>
          </View>

          {isExpanded && (member.bio_fr || member.bio_ar || member.bio_en) && (
            <View style={styles.teamBio}>
              <View style={styles.divider} />
              <Text style={styles.bioText}>
                {language === 'AR' ? member.bio_ar : (language === 'EN' ? member.bio_en : member.bio_fr)}
              </Text>
            </View>
          )}

          {(member.email || member.linkedin_url) && (
            <View style={styles.teamActions}>
              {member.email && (
                <TouchableOpacity
                  style={styles.teamActionBtn}
                  onPress={() => Linking.openURL(`mailto:${member.email}`)}
                >
                  <Ionicons name="mail-outline" size={18} color="#7b1fa2" style={{ marginRight: 6 }} />
                  <Text style={styles.actionLabel}>Email</Text>
                </TouchableOpacity>
              )}

              {member.linkedin_url && (
                <TouchableOpacity
                  style={styles.teamActionBtn}
                  onPress={() => Linking.openURL(member.linkedin_url!)}
                >
                  <Ionicons name="logo-linkedin" size={18} color="#0077b5" style={{ marginRight: 6 }} />
                  <Text style={styles.actionLabel}>LinkedIn</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {hasBio && (
            <View style={styles.tapIndicator}>
              <Text style={styles.tapText}>
                {isExpanded ? (t('tap_to_collapse') || 'Appuyez pour réduire') : (t('tap_to_expand') || 'Appuyez pour voir la bio')}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderContact = (contact: ContactInfo, index: number) => (
    <Animated.View
      key={contact.id}
      style={[
        styles.contactCard,
        {
          opacity: fadeAnim,
          transform: [
            { scale: scaleAnim },
            {
              translateY: slideAnim.interpolate({
                inputRange: [0, 50],
                outputRange: [0, 30],
              }),
            },
          ],
        },
      ]}
    >
      <TouchableOpacity
        style={styles.contactContent}
        onPress={() => handleContactPress(contact.type, contact.value)}
        activeOpacity={0.7}
      >
        <View style={styles.contactIconContainer}>
          <Ionicons name={getContactIcon(contact.type) as any} size={20} color="#7b1fa2" />
        </View>

        <View style={styles.contactInfo}>
          <Text style={styles.contactLabel}>
            {language === 'AR' ? contact.label_ar : (language === 'EN' ? contact.label_en : contact.label_fr)}
          </Text>
          <Text style={styles.contactValue}>{contact.value}</Text>
        </View>

        <View style={styles.contactArrow}>
          <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <AnimatedBackground>
      <View style={[styles.container, { paddingTop: 0 }]}>
        {renderHero()}

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#667eea" />
          }
        >
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color="#7b1fa2" size="large" />
              <Text style={styles.loadingText}>{t('about_loading') || 'Chargement...'}</Text>
            </View>
          ) : (
            <>
              {/* About Sections */}
              {sections.length > 0 && (
                <View style={styles.sectionsContainer}>
                  {sections.map((section, index) => renderSection(section, index))}
                </View>
              )}

              {/* Team Members */}
              {teamMembers.length > 0 && (
                <View style={styles.teamContainer}>
                  <View style={styles.categoryHeader}>
                    <Ionicons name="people-outline" size={28} color="#7b1fa2" style={{ marginRight: 12 }} />
                    <Text style={styles.categoryTitle}>{t('about_team') || 'Notre Équipe'}</Text>
                  </View>
                  {teamMembers.map((member, index) => renderTeamMember(member, index))}
                </View>
              )}

              {/* Contact Information */}
              {contacts.length > 0 && (
                <View style={styles.contactsContainer}>
                  <View style={styles.categoryHeader}>
                    <Ionicons name="call-outline" size={28} color="#7b1fa2" style={{ marginRight: 12 }} />
                    <Text style={styles.categoryTitle}>{t('about_contact') || 'Nous Contacter'}</Text>
                  </View>
                  {contacts.map((contact, index) => renderContact(contact, index))}
                </View>
              )}

              {/* Empty State */}
              {sections.length === 0 && teamMembers.length === 0 && contacts.length === 0 && (
                <View style={styles.emptyState}>
                  <Ionicons name="document-text-outline" size={64} color="#ddd" style={{ marginBottom: 16 }} />
                  <Text style={styles.emptyTitle}>{t('about_no_info') || 'Aucune information disponible'}</Text>
                  <Text style={styles.emptyText}>
                    {t('about_soon') || 'Le contenu sera bientôt disponible'}
                  </Text>
                </View>
              )}
            </>
          )}
        </ScrollView>
      </View>
    </AnimatedBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  hero: {
    paddingVertical: 40,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  heroContent: {
    alignItems: 'center',
  },
  heroIcon: {
    fontSize: 60,
    marginBottom: 12,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: 'white',
    marginBottom: 8,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
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
  sectionsContainer: {
    marginBottom: 24,
  },
  sectionCard: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  sectionIcon: {
    fontSize: 24,
  },
  sectionHeaderText: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1f2937',
  },
  sectionContent: {
    marginTop: 8,
  },
  sectionText: {
    fontSize: 15,
    lineHeight: 24,
    color: '#4b5563',
    fontWeight: '500',
  },
  expandIndicator: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    alignItems: 'center',
  },
  expandText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#667eea',
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  categoryIcon: {
    fontSize: 28,
    marginRight: 12,
  },
  categoryTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#1f2937',
  },
  teamContainer: {
    marginBottom: 24,
  },
  teamCard: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
  },
  teamHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  avatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#667eea',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '900',
    color: 'white',
  },
  teamInfo: {
    flex: 1,
  },
  teamName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1f2937',
    marginBottom: 4,
  },
  teamPosition: {
    fontSize: 14,
    fontWeight: '600',
    color: '#667eea',
  },
  teamBio: {
    marginTop: 16,
  },
  divider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginBottom: 12,
  },
  bioText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#4b5563',
    fontWeight: '500',
  },
  teamActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  teamActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f3f4f6',
    paddingVertical: 12,
    borderRadius: 12,
  },
  actionIcon: {
    fontSize: 18,
    marginRight: 6,
  },
  actionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1f2937',
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
  contactsContainer: {
    marginBottom: 24,
  },
  contactCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  contactContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  contactIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  contactIcon: {
    fontSize: 20,
  },
  contactInfo: {
    flex: 1,
  },
  contactLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 2,
  },
  contactValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1f2937',
  },
  contactArrow: {
    marginLeft: 8,
  },
  arrowIcon: {
    fontSize: 20,
    color: '#9ca3af',
    fontWeight: '600',
  },
  emptyState: {
    paddingVertical: 80,
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
    textAlign: 'center',
  },
});

export default AboutScreen;
