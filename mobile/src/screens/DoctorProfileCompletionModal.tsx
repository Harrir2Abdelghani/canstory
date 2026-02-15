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
import { annuaireSignupService, DoctorProfileData } from '../services/annuaire-signup.service';

const PRIMARY_COLOR = '#7D5AB4';

interface DoctorProfileCompletionModalProps {
  visible: boolean;
  entryId: string;
  onComplete: () => void;
  onCancel: () => void;
}

export function DoctorProfileCompletionModal({
  visible,
  entryId,
  onComplete,
  onCancel,
}: DoctorProfileCompletionModalProps) {
  const [specialization, setSpecialization] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [hospitalAffiliation, setHospitalAffiliation] = useState('');
  const [consultationFee, setConsultationFee] = useState('');
  const [yearsOfExperience, setYearsOfExperience] = useState('');
  const [languagesSpoken, setLanguagesSpoken] = useState('');
  const [education, setEducation] = useState('');
  const [certifications, setCertifications] = useState('');
  const [acceptsNewPatients, setAcceptsNewPatients] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!specialization || !licenseNumber) {
      Alert.alert('Erreur', 'Veuillez remplir les champs obligatoires: Spécialité et Numéro de licence');
      return;
    }

    setLoading(true);
    try {
      const profileData: DoctorProfileData = {
        specialization: specialization.trim(),
        license_number: licenseNumber.trim(),
        hospital_affiliation: hospitalAffiliation.trim() || undefined,
        consultation_fee: consultationFee ? Number(consultationFee) : undefined,
        years_of_experience: yearsOfExperience ? Number(yearsOfExperience) : undefined,
        languages_spoken: languagesSpoken
          ? languagesSpoken.split(',').map(l => l.trim()).filter(l => l)
          : [],
        education: education
          ? education.split('\n').map(e => e.trim()).filter(e => e)
          : [],
        certifications: certifications
          ? certifications.split('\n').map(c => c.trim()).filter(c => c)
          : [],
        accepts_new_patients: acceptsNewPatients,
      };

      await annuaireSignupService.updateDoctorProfile(entryId, profileData);
      Alert.alert('Succès', 'Votre profil a été complété avec succès!', [
        { text: 'OK', onPress: onComplete },
      ]);
    } catch (error) {
      console.error('Error saving doctor profile:', error);
      Alert.alert('Erreur', 'Une erreur est survenue lors de la sauvegarde de votre profil');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onCancel}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Complétez votre profil médecin</Text>
          <Text style={styles.subtitle}>Remplissez les informations requises</Text>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <Text style={styles.label}>Spécialité *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Oncologie, Cardiologie..."
              placeholderTextColor="#bbb"
              value={specialization}
              onChangeText={setSpecialization}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Numéro de licence *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: MED-123456"
              placeholderTextColor="#bbb"
              value={licenseNumber}
              onChangeText={setLicenseNumber}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Affiliation hospitalière</Text>
            <TextInput
              style={styles.input}
              placeholder="Nom de l'hôpital ou clinique"
              placeholderTextColor="#bbb"
              value={hospitalAffiliation}
              onChangeText={setHospitalAffiliation}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Tarif de consultation (DA)</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: 2000"
              placeholderTextColor="#bbb"
              value={consultationFee}
              onChangeText={setConsultationFee}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Années d'expérience</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: 10"
              placeholderTextColor="#bbb"
              value={yearsOfExperience}
              onChangeText={setYearsOfExperience}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Langues parlées</Text>
            <TextInput
              style={styles.input}
              placeholder="Séparées par des virgules (Ex: Français, Arabe, Anglais)"
              placeholderTextColor="#bbb"
              value={languagesSpoken}
              onChangeText={setLanguagesSpoken}
              multiline
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Formation</Text>
            <TextInput
              style={[styles.input, styles.multilineInput]}
              placeholder="Une formation par ligne"
              placeholderTextColor="#bbb"
              value={education}
              onChangeText={setEducation}
              multiline
              numberOfLines={4}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Certifications</Text>
            <TextInput
              style={[styles.input, styles.multilineInput]}
              placeholder="Une certification par ligne"
              placeholderTextColor="#bbb"
              value={certifications}
              onChangeText={setCertifications}
              multiline
              numberOfLines={4}
            />
          </View>

          <View style={styles.section}>
            <View style={styles.checkboxContainer}>
              <TouchableOpacity
                style={[styles.checkbox, acceptsNewPatients && styles.checkboxChecked]}
                onPress={() => setAcceptsNewPatients(!acceptsNewPatients)}
              >
                {acceptsNewPatients && <Text style={styles.checkmark}>✓</Text>}
              </TouchableOpacity>
              <Text style={styles.checkboxLabel}>J'accepte les nouveaux patients</Text>
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <MyPressable
            style={[styles.button, styles.cancelButton]}
            onPress={onCancel}
            disabled={loading}
          >
            <Text style={styles.cancelButtonText}>Annuler</Text>
          </MyPressable>
          <MyPressable
            style={[styles.button, styles.saveButton, loading && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.saveButtonText}>Enregistrer</Text>
            )}
          </MyPressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#f5f5f5',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
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
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#333',
    backgroundColor: '#f9f9f9',
  },
  multilineInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: PRIMARY_COLOR,
    borderRadius: 4,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  checkboxChecked: {
    backgroundColor: PRIMARY_COLOR,
  },
  checkmark: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#333',
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  saveButton: {
    backgroundColor: PRIMARY_COLOR,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
