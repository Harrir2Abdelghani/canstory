import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import AnimatedBackground from '../../components/AnimatedBackground';
import MyPressable from '../../components/MyPressable';
import Ionicons from 'react-native-vector-icons/Ionicons';

const EditProfileScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { user, updateProfile } = useAuth();
  const { t } = useLanguage();
  
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [wilaya, setWilaya] = useState(user?.wilaya || '');
  const [commune, setCommune] = useState(user?.commune || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!fullName.trim()) {
      Alert.alert(t('error') || 'Erreur', t('error_name_required') || 'Le nom complet est requis');
      return;
    }
    if (!wilaya.trim()) {
      Alert.alert(t('error') || 'Erreur', t('error_wilaya_required') || 'La wilaya est requise');
      return;
    }
    if (!commune.trim()) {
      Alert.alert(t('error') || 'Erreur', t('error_commune_required') || 'La commune est requise');
      return;
    }

    setLoading(true);
    const { error } = await updateProfile({
      full_name: fullName,
      wilaya,
      commune,
      phone: phone || undefined,
    });
    setLoading(false);

    if (error) {
      Alert.alert(t('error') || 'Erreur', error.message);
    } else {
      Alert.alert(t('success') || 'Succès', t('profile_updated') || 'Profil mis à jour avec succès', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    }
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
        <Text style={styles.headerTitle}>{t('edit_profile_title') || 'Modifier le profil'}</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 0, paddingBottom: insets.bottom + 20 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t('full_name_label') || 'Nom complet'} *</Text>
            <TextInput
              style={styles.input}
              value={fullName}
              onChangeText={setFullName}
              placeholder={t('full_name_label') || "Votre nom complet"}
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t('wilaya_label') || 'Wilaya'} *</Text>
            <TextInput
              style={styles.input}
              value={wilaya}
              onChangeText={setWilaya}
              placeholder={t('wilaya_label') || "Votre wilaya"}
              placeholderTextColor="#999"
            />
          </View>
 
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t('commune_label') || 'Commune'} *</Text>
            <TextInput
              style={styles.input}
              value={commune}
              onChangeText={setCommune}
              placeholder={t('commune_label') || "Votre commune"}
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t('phone_label') || 'Téléphone'}</Text>
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              placeholder={t('phone_label') || "Numéro de téléphone"}
              placeholderTextColor="#999"
              keyboardType="phone-pad"
            />
          </View>
 
          <Text style={styles.note}>{t('required_fields') || '* Champs obligatoires'}</Text>
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
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#fafafa',
  },
  note: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
    marginTop: 10,
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

export default EditProfileScreen;
