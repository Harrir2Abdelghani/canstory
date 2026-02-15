import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import MyPressable from '../components/MyPressable';

const ResetPasswordScreen: React.FC = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.container, { paddingTop: insets.top + 20 }]}>
          <Text style={styles.title}>Réinitialiser le mot de passe</Text>
          <Text style={styles.subtitle}>
            Entrez votre nouveau mot de passe ci-dessous
          </Text>

          <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nouveau mot de passe</Text>
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor="#999"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Confirmer le mot de passe</Text>
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor="#999"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
              />
            </View>

            <Text style={styles.hint}>
              Le mot de passe doit contenir au moins 8 caractères
            </Text>

            <MyPressable
              style={styles.resetButton}
              android_ripple={{ color: '#6a1b9a' }}
              onPress={() => navigation.navigate('SignIn' as never)}
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
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#f3e5f5',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#6a1b9a',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '400',
    color: '#666',
    marginBottom: 32,
  },
  formContainer: {
    flex: 1,
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
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: 'white',
  },
  hint: {
    fontSize: 12,
    fontWeight: '400',
    color: '#999',
    marginBottom: 24,
  },
  resetButton: {
    backgroundColor: '#7b1fa2',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 16,
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  signInButton: {
    borderWidth: 1,
    borderColor: '#7b1fa2',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  signInButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#7b1fa2',
  },
});

export default ResetPasswordScreen;
