import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import AnimatedBackground from '../../components/AnimatedBackground';
import MyPressable from '../../components/MyPressable';
import { useLanguage } from '../../contexts/LanguageContext';
import { LanguagePreference } from '../../types';
import Ionicons from 'react-native-vector-icons/Ionicons';

const LANGUAGES = [
  { value: 'fr' as LanguagePreference, label: 'Français', icon: '🇫🇷' },
  { value: 'ar' as LanguagePreference, label: 'العربية', icon: '🇩🇿' },
  { value: 'en' as LanguagePreference, label: 'English', icon: '🇬🇧' },
];

const LanguageSelectionScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { user, updateProfile } = useAuth();
  const { language: currentLang, setLanguage: setGlobalLanguage, t } = useLanguage();
  
  const [selectedLanguage, setSelectedLanguage] = useState<LanguagePreference>(
    (currentLang.toLowerCase() as LanguagePreference) || 'fr'
  );
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    
    // Update global context first
    await setGlobalLanguage(selectedLanguage.toUpperCase() as any);
    
    // Auth context update is already handled inside setLanguage in LanguageContext
    // but we can keep this for explicit success/error feedback if needed
    setLoading(false);
    Alert.alert(t('success') || 'Succès', t('profile_updated') || 'Langue mise à jour avec succès', [
      { text: 'OK', onPress: () => navigation.goBack() }
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.backgroundContainer}>
        <AnimatedBackground />
      </View>
      
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="arrow-back" size={24} color="#7b1fa2" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('lang_title') || 'Langue'}</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 0, paddingBottom: insets.bottom + 20 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>{t('choose_lang') || 'Choisissez votre langue'}</Text>
          <Text style={styles.sectionDescription}>
            {t('choose_lang_desc') || "Sélectionnez la langue d'affichage de l'application"}
          </Text>

          {LANGUAGES.map((language) => (
            <TouchableOpacity
              key={language.value}
              style={[
                styles.languageOption,
                selectedLanguage === language.value && styles.languageOptionSelected,
              ]}
              onPress={() => setSelectedLanguage(language.value)}
            >
              <View style={styles.languageInfo}>
                <Text style={styles.languageIcon}>{language.icon}</Text>
                <Text style={[
                  styles.languageLabel,
                  selectedLanguage === language.value && styles.languageLabelSelected,
                ]}>
                  {language.label}
                </Text>
              </View>
              {selectedLanguage === language.value && (
                <Text style={styles.checkmark}>✓</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>

        <MyPressable
          style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.saveButtonText}>{t('save') || 'Enregistrer'}</Text>
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
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    marginBottom: 12,
    backgroundColor: '#fafafa',
  },
  languageOptionSelected: {
    borderColor: '#7b1fa2',
    backgroundColor: '#f3e5f5',
  },
  languageInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  languageIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  languageLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  languageLabelSelected: {
    color: '#7b1fa2',
  },
  checkmark: {
    fontSize: 24,
    color: '#7b1fa2',
    fontWeight: '700',
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

export default LanguageSelectionScreen;
