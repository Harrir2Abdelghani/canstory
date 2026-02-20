import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import MyPressable from '../components/MyPressable';
import AnimatedBackground from '../components/AnimatedBackground';
import { useLanguage } from '../contexts/LanguageContext';
import LanguageModal from '../components/LanguageModal';

const ResetPasswordScreen: React.FC = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { language } = useLanguage();
  const [showLangModal, setShowLangModal] = useState(false);

  const handleReset = () => {
    if (password.length < 8) {
      Alert.alert('Erreur', 'Le mot de passe doit contenir au moins 8 caractères');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Erreur', 'Les mots de passe ne correspondent pas');
      return;
    }
    
    // Logic for reset would go here
    Alert.alert('Succès', 'Votre mot de passe a été réinitialisé', [
      { text: 'OK', onPress: () => navigation.navigate('SignIn' as never) }
    ]);
  };

  return (
    <AnimatedBackground>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.container, { paddingTop: insets.top + 20 }]}>
            <Text style={styles.title}>Nouveau mot de passe</Text>
            <Text style={styles.subtitle}>
              Sécurisez votre compte avec un nouveau mot de passe
            </Text>

            <View style={styles.formContainer}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Nouveau mot de passe</Text>
                <View style={styles.inputWrapper}>
                  <Text style={styles.icon}>🔒</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="••••••••"
                    placeholderTextColor="#bbb"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Confirmer le mot de passe</Text>
                <View style={styles.inputWrapper}>
                  <Text style={styles.icon}>✓</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="••••••••"
                    placeholderTextColor="#bbb"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry
                  />
                </View>
              </View>

              <Text style={styles.hint}>
                Utilisez au moins 8 caractères avec des lettres et des chiffres
              </Text>

              <MyPressable
                style={styles.resetButton}
                android_ripple={{ color: '#6a1b9a' }}
                onPress={handleReset}
              >
                <Text style={styles.resetButtonText}>Réinitialiser le mot de passe</Text>
              </MyPressable>

              <MyPressable
                style={styles.signInButton}
                android_ripple={{ color: '#f3e5f5' }}
                onPress={() => navigation.navigate('SignIn' as never)}
              >
                <Text style={styles.signInButtonText}>Retour à la connexion</Text>
              </MyPressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={[styles.languageContainer, { top: insets.top + 16, right: 20 }]}>
        <TouchableOpacity 
          style={styles.languageButton} 
          onPress={() => setShowLangModal(true)}
          activeOpacity={0.6}
        >
          <View style={styles.langIndicator}>
            <Text style={styles.languageText}>{language}</Text>
          </View>
        </TouchableOpacity>
      </View>

      <LanguageModal 
        visible={showLangModal} 
        onClose={() => setShowLangModal(false)} 
      />
    </AnimatedBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#6a1b9a',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '400',
    color: '#666',
    marginBottom: 40,
  },
  formContainer: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6a1b9a',
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    height: 56,
  },
  icon: {
    fontSize: 20,
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    height: '100%',
    color: '#333',
  },
  hint: {
    fontSize: 13,
    color: '#999',
    marginBottom: 32,
    lineHeight: 18,
  },
  resetButton: {
    backgroundColor: '#7b1fa2',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#7b1fa2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
  },
  signInButton: {
    borderWidth: 2,
    borderColor: '#7b1fa2',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  signInButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#7b1fa2',
  },
  languageContainer: {
    position: 'absolute',
    zIndex: 1000,
  },
  languageButton: {
    padding: 4,
  },
  langIndicator: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderWidth: 1.5,
    borderColor: '#6a1b9a',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  languageText: {
    color: '#6a1b9a',
    fontSize: 12,
    fontWeight: '900',
  },
});

export default ResetPasswordScreen;
