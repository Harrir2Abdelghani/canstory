import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Switch,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import AnimatedBackground from '../../components/AnimatedBackground';
import MyPressable from '../../components/MyPressable';
import { supabase } from '../../lib/supabase';

interface NotificationSettings {
  article_notifications: boolean;
  appointment_notifications: boolean;
  message_notifications: boolean;
  system_notifications: boolean;
  community_notifications: boolean;
}

const NotificationSettingsScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { user } = useAuth();
  
  const [settings, setSettings] = useState<NotificationSettings>({
    article_notifications: true,
    appointment_notifications: true,
    message_notifications: true,
    system_notifications: true,
    community_notifications: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('notification_settings')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (data) {
      setSettings({
        article_notifications: data.article_notifications,
        appointment_notifications: data.appointment_notifications,
        message_notifications: data.message_notifications,
        system_notifications: data.system_notifications,
        community_notifications: data.community_notifications,
      });
    }
    setLoading(false);
  };

  const handleToggle = (key: keyof NotificationSettings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    const { error } = await supabase
      .from('notification_settings')
      .update(settings)
      .eq('user_id', user.id);

    setSaving(false);

    if (error) {
      Alert.alert('Erreur', 'Impossible de sauvegarder les paramètres');
    } else {
      Alert.alert('Succès', 'Paramètres mis à jour avec succès', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <AnimatedBackground />
        <ActivityIndicator size="large" color="#7b1fa2" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.backgroundContainer}>
        <AnimatedBackground />
      </View>
      
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>← Retour</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={{ width: 80 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 0, paddingBottom: insets.bottom + 20 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Gérer les notifications</Text>
          <Text style={styles.sectionDescription}>
            Choisissez les types de notifications que vous souhaitez recevoir
          </Text>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingIcon}>📰</Text>
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Articles</Text>
                <Text style={styles.settingDescription}>
                  Nouveaux articles et actualités
                </Text>
              </View>
            </View>
            <Switch
              value={settings.article_notifications}
              onValueChange={() => handleToggle('article_notifications')}
              trackColor={{ false: '#ccc', true: '#ce93d8' }}
              thumbColor={settings.article_notifications ? '#7b1fa2' : '#f4f3f4'}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingIcon}>📅</Text>
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Rendez-vous</Text>
                <Text style={styles.settingDescription}>
                  Rappels de rendez-vous médicaux
                </Text>
              </View>
            </View>
            <Switch
              value={settings.appointment_notifications}
              onValueChange={() => handleToggle('appointment_notifications')}
              trackColor={{ false: '#ccc', true: '#ce93d8' }}
              thumbColor={settings.appointment_notifications ? '#7b1fa2' : '#f4f3f4'}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingIcon}>💬</Text>
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Messages</Text>
                <Text style={styles.settingDescription}>
                  Nouveaux messages privés
                </Text>
              </View>
            </View>
            <Switch
              value={settings.message_notifications}
              onValueChange={() => handleToggle('message_notifications')}
              trackColor={{ false: '#ccc', true: '#ce93d8' }}
              thumbColor={settings.message_notifications ? '#7b1fa2' : '#f4f3f4'}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingIcon}>👥</Text>
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Communauté</Text>
                <Text style={styles.settingDescription}>
                  Réponses et mentions dans la communauté
                </Text>
              </View>
            </View>
            <Switch
              value={settings.community_notifications}
              onValueChange={() => handleToggle('community_notifications')}
              trackColor={{ false: '#ccc', true: '#ce93d8' }}
              thumbColor={settings.community_notifications ? '#7b1fa2' : '#f4f3f4'}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingIcon}>⚙️</Text>
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Système</Text>
                <Text style={styles.settingDescription}>
                  Mises à jour et annonces importantes
                </Text>
              </View>
            </View>
            <Switch
              value={settings.system_notifications}
              onValueChange={() => handleToggle('system_notifications')}
              trackColor={{ false: '#ccc', true: '#ce93d8' }}
              thumbColor={settings.system_notifications ? '#7b1fa2' : '#f4f3f4'}
            />
          </View>
        </View>

        <MyPressable
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.saveButtonText}>Enregistrer</Text>
          )}
        </MyPressable>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3e5f5',
  },
  backgroundContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 5,
  },
  backText: {
    fontSize: 16,
    color: '#7b1fa2',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  scrollView: {
    flex: 1,
    marginTop: 0,
    zIndex: 5,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    fontSize: 28,
    marginRight: 12,
  },
  settingText: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 13,
    color: '#666',
  },
  saveButton: {
    backgroundColor: '#7b1fa2',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#7b1fa2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
});

export default NotificationSettingsScreen;
