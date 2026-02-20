import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Animated,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import AnimatedBackground from '../../components/AnimatedBackground';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { supabase } from '../../lib/supabase';
import Ionicons from 'react-native-vector-icons/Ionicons';

const ProfileScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { user, profile, signOut, updateProfile } = useAuth();
  const { t } = useLanguage();
  const [fadeAnim] = useState(new Animated.Value(0));
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleSignOut = () => {
    Alert.alert(
      t('sign_out') || 'Déconnexion',
      t('sign_out_confirm') || 'Êtes-vous sûr de vouloir vous déconnecter?',
      [
        { text: t('cancel') || 'Annuler', style: 'cancel' },
        {
          text: t('sign_out') || 'Déconnexion',
          style: 'destructive',
          onPress: async () => {
            await signOut();
            navigation.navigate('SignIn' as never);
          },
        },
      ]
    );
  };

  const getRoleLabel = (role: string) => {
    const roles: Record<string, string> = {
      patient: 'Patient / Proche',
      doctor: 'Médecin',
      pharmacy: 'Pharmacie',
      association: 'Association',
      cancer_center: 'Centre Cancer',
      laboratory: 'Laboratoire',
      admin: 'Administrateur',
    };
    return roles[role] || role;
  };

  const handleAvatarUpload = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission refusée', 'Nous avons besoin de votre permission pour accéder à vos photos');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const image = result.assets[0];
      await uploadAvatar(image.uri);
    }
  };

  const uploadAvatar = async (uri: string) => {
    if (!user) return;

    setUploadingAvatar(true);
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      const arrayBuffer = await new Response(blob).arrayBuffer();
      const fileExt = uri.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, arrayBuffer, {
          contentType: `image/${fileExt}`,
          upsert: true,
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      const { error: updateError } = await updateProfile({
        avatar_url: publicUrl,
      });

      if (updateError) throw updateError;
      Alert.alert(t('success') || 'Succès', t('avatar_updated') || 'Photo de profil mise à jour');
    } catch (error: any) {
      Alert.alert(t('error') || 'Erreur', error.message || 'Impossible de télécharger la photo');
    } finally {
      setUploadingAvatar(false);
    }
  };

  return (
    <AnimatedBackground>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.container, { paddingTop: 60 }]}>
          <Animated.View style={{ opacity: fadeAnim }}>
            <View style={styles.header}>
              <TouchableOpacity onPress={handleAvatarUpload} style={styles.avatarContainer}>
                {uploadingAvatar ? (
                  <View style={styles.avatarLarge}>
                    <ActivityIndicator color="#7b1fa2" size="large" />
                  </View>
                ) : user?.avatar_url ? (
                  <Image source={{ uri: user.avatar_url }} style={styles.avatarImage} />
                ) : (
                  <View style={styles.avatarLarge}>
                    <Text style={styles.avatarLargeText}>
                      {user?.full_name?.charAt(0).toUpperCase() || '?'}
                    </Text>
                  </View>
                )}
                <View style={styles.editBadge}>
                  <Ionicons name="camera-outline" size={18} color="#7b1fa2" />
                </View>
              </TouchableOpacity>
              <Text style={styles.userName}>{user?.full_name || 'Utilisateur'}</Text>
              <Text style={styles.userRole}>{getRoleLabel(user?.role || '')}</Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{user?.wilaya}</Text>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('account_info') || 'Informations du compte'}</Text>

              <View style={styles.infoCard}>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Email</Text>
                  <Text style={styles.infoValue}>{user?.email}</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Téléphone</Text>
                  <Text style={styles.infoValue}>{user?.phone || 'Non renseigné'}</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Wilaya</Text>
                  <Text style={styles.infoValue}>{user?.wilaya}</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Commune</Text>
                  <Text style={styles.infoValue}>{user?.commune}</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>{t('lang_settings') || 'Langue'}</Text>
                  <Text style={styles.infoValue}>
                    {user?.language?.toUpperCase() === 'FR' ? 'Français' : 
                     user?.language?.toUpperCase() === 'AR' ? 'العربية' : 'English'}
                  </Text>
                </View>
              </View>
            </View>

            {profile && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Profil professionnel</Text>
                <View style={styles.infoCard}>
                  {profile.bio && (
                    <>
                      <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Bio</Text>
                        <Text style={styles.infoValue}>{profile.bio}</Text>
                      </View>
                      <View style={styles.divider} />
                    </>
                  )}
                  {profile.specialization && (
                    <>
                      <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Spécialisation</Text>
                        <Text style={styles.infoValue}>{profile.specialization}</Text>
                      </View>
                      <View style={styles.divider} />
                    </>
                  )}
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Statut de vérification</Text>
                    <Text style={styles.infoValue}>{profile.verification_status}</Text>
                  </View>
                </View>
              </View>
            )}

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('actions') || 'Actions'}</Text>

              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => navigation.navigate('EditProfile' as never)}
              >
                <View style={styles.actionIconBg}>
                  <Ionicons name="person-outline" size={20} color="#7b1fa2" />
                </View>
                <Text style={styles.actionText}>{t('edit_profile') || 'Modifier le profil'}</Text>
                <Ionicons name="chevron-forward" size={20} color="#ccc" />
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => navigation.navigate('NotificationSettings' as never)}
              >
                <View style={styles.actionIconBg}>
                  <Ionicons name="notifications-outline" size={20} color="#7b1fa2" />
                </View>
                <Text style={styles.actionText}>{t('notif_settings') || 'Paramètres de notification'}</Text>
                <Ionicons name="chevron-forward" size={20} color="#ccc" />
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => navigation.navigate('LanguageSelection' as never)}
              >
                <View style={styles.actionIconBg}>
                  <Ionicons name="globe-outline" size={20} color="#7b1fa2" />
                </View>
                <Text style={styles.actionText}>{t('lang_settings') || 'Langue'}</Text>
                <Ionicons name="chevron-forward" size={20} color="#ccc" />
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionButton}>
                <View style={styles.actionIconBg}>
                  <Ionicons name="lock-closed-outline" size={20} color="#7b1fa2" />
                </View>
                <Text style={styles.actionText}>{t('privacy') || 'Confidentialité'}</Text>
                <Ionicons name="chevron-forward" size={20} color="#ccc" />
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionButton}>
                <View style={styles.actionIconBg}>
                  <Ionicons name="help-circle-outline" size={20} color="#7b1fa2" />
                </View>
                <Text style={styles.actionText}>{t('help_support') || 'Aide & Support'}</Text>
                <Ionicons name="chevron-forward" size={20} color="#ccc" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => navigation.navigate('About' as never)}
            >
              <View style={styles.actionIconBg}>
                <Ionicons name="information-circle-outline" size={20} color="#7b1fa2" />
              </View>
              <Text style={styles.actionText}>{t('about_app') || 'À propos de Canstory'}</Text>
              <Ionicons name="chevron-forward" size={20} color="#ccc" />
            </TouchableOpacity>

            <View style={styles.section}>
              <TouchableOpacity
                style={styles.signOutButton}
                onPress={handleSignOut}
              >
                <Ionicons name="log-out-outline" size={22} color="white" style={{ marginRight: 8 }} />
                <Text style={styles.signOutText}>{t('sign_out') || 'Se déconnecter'}</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.deleteButton}>
                <Text style={styles.deleteText}>{t('delete_account') || 'Supprimer mon compte'}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Version 1.0.0</Text>
              <Text style={styles.footerText}>© 2026 Canstory</Text>
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
    alignItems: 'center',
    marginBottom: 32,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatarLarge: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#7b1fa2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: 'white',
    borderRadius: 20,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#7b1fa2',
  },
  editBadgeText: {
    fontSize: 16,
  },
  avatarLargeText: {
    fontSize: 40,
    fontWeight: '700',
    color: 'white',
  },
  userName: {
    fontSize: 24,
    fontWeight: '800',
    color: '#6a1b9a',
    marginBottom: 4,
  },
  userRole: {
    fontSize: 16,
    fontWeight: '500',
    color: '#888',
    marginBottom: 12,
  },
  badge: {
    backgroundColor: '#f3e5f5',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#7b1fa2',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#6a1b9a',
    marginBottom: 12,
  },
  infoCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#f3e5f5',
  },
  infoRow: {
    paddingVertical: 12,
  },
  infoLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#888',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
  },
  divider: {
    height: 1,
    backgroundColor: '#f0f0f0',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(123, 31, 162, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  actionIconBg: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#f3e5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  actionText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  signOutButton: {
    backgroundColor: '#7b1fa2',
    borderRadius: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    marginTop: 10,
    shadowColor: '#7b1fa2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  signOutText: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
  },
  deleteButton: {
    backgroundColor: 'transparent',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ff5252',
  },
  deleteText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ff5252',
  },
  footer: {
    alignItems: 'center',
    marginTop: 24,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  footerText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#999',
    marginBottom: 4,
  },
});

export default ProfileScreen;
