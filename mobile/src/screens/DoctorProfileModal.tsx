import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  ScrollView,
  Modal,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import MyPressable from '../components/MyPressable';
import { doctorProfileService, DoctorProfileData } from '../services/doctor-profile.service';

const PRIMARY_COLOR = '#7D5AB4';

interface DoctorProfileModalProps {
  visible: boolean;
  userId: string;
  annuaireEntryId: string;
  onComplete: () => void;
}

export const DoctorProfileModal: React.FC<DoctorProfileModalProps> = ({
  visible,
  userId,
  annuaireEntryId,
  onComplete,
}) => {
  const [specialization, setSpecialization] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [hospitalAffiliation, setHospitalAffiliation] = useState('');
  const [consultationFee, setConsultationFee] = useState('');
  const [yearsOfExperience, setYearsOfExperience] = useState('');
  const [languagesSpoken, setLanguagesSpoken] = useState('');
  const [acceptsNewPatients, setAcceptsNewPatients] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!specialization.trim() || !licenseNumber.trim()) {
      Alert.alert('Erreur', 'Veuillez remplir au moins la spécialisation et le numéro de licence');
      return;
    }

    try {
      setLoading(true);

      const profileData: DoctorProfileData = {
        specialization: specialization.trim(),
        license_number: licenseNumber.trim(),
        hospital_affiliation: hospitalAffiliation.trim() || undefined,
        consultation_fee: consultationFee ? parseFloat(consultationFee) : undefined,
        years_of_experience: yearsOfExperience ? parseInt(yearsOfExperience) : undefined,
        languages_spoken: languagesSpoken
          ? languagesSpoken.split(',').map(l => l.trim())
          : undefined,
        accepts_new_patients: acceptsNewPatients,
      };

      const { error } = await doctorProfileService.saveDoctorProfile(userId, annuaireEntryId, profileData);

      if (error) {
        Alert.alert('Erreur', 'Impossible de sauvegarder votre profil. Veuillez réessayer.');
        return;
      }

      Alert.alert('Succès', 'Votre profil médecin a été complété avec succès!', [
        { text: 'OK', onPress: onComplete },
      ]);
    } catch (error) {
      console.error('Error saving doctor profile:', error);
      Alert.alert('Erreur', 'Une erreur est survenue lors de la sauvegarde.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Complétez votre profil médecin</Text>
            <Text style={styles.subtitle}>Informations professionnelles</Text>
          </View>

          <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Spécialisation *</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: Cardiologue, Oncologie, etc."
                placeholderTextColor="#bbb"
                value={specialization}
                onChangeText={setSpecialization}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Numéro de licence *</Text>
              <TextInput
                style={styles.input}
                placeholder="Votre numéro de licence"
                placeholderTextColor="#bbb"
                value={licenseNumber}
                onChangeText={setLicenseNumber}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Affiliation hospitalière</Text>
              <TextInput
                style={styles.input}
                placeholder="Hôpital ou clinique"
                placeholderTextColor="#bbb"
                value={hospitalAffiliation}
                onChangeText={setHospitalAffiliation}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Tarif de consultation (DA)</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: 5000"
                placeholderTextColor="#bbb"
                value={consultationFee}
                onChangeText={setConsultationFee}
                keyboardType="decimal-pad"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Années d'expérience</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: 10"
                placeholderTextColor="#bbb"
                value={yearsOfExperience}
                onChangeText={setYearsOfExperience}
                keyboardType="number-pad"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Langues parlées</Text>
              <TextInput
                style={styles.input}
                placeholder="Séparées par des virgules (FR, AR, EN)"
                placeholderTextColor="#bbb"
                value={languagesSpoken}
                onChangeText={setLanguagesSpoken}
              />
            </View>

            <View style={styles.checkboxGroup}>
              <TouchableOpacity
                style={styles.checkbox}
                onPress={() => setAcceptsNewPatients(!acceptsNewPatients)}
              >
                <View style={[styles.checkboxBox, acceptsNewPatients && styles.checkboxBoxChecked]}>
                  {acceptsNewPatients && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={styles.checkboxLabel}>Accepte les nouveaux patients</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <MyPressable
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleSave}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.buttonText}>Sauvegarder et continuer</Text>
              )}
            </MyPressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    paddingBottom: 20,
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#6a1b9a',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '400',
    color: '#888',
  },
  form: {
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6a1b9a',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  checkboxGroup: {
    marginTop: 20,
    marginBottom: 20,
  },
  checkbox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  checkboxBox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderRadius: 6,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxBoxChecked: {
    backgroundColor: PRIMARY_COLOR,
    borderColor: PRIMARY_COLOR,
  },
  checkmark: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
  checkboxLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  button: {
    backgroundColor: PRIMARY_COLOR,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
  },
});
