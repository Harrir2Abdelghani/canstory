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

const ForgotPasswordScreen: React.FC = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');

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
          <MyPressable
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backText}>← Retour</Text>
          </MyPressable>

          <Text style={styles.title}>Mot de passe oublié?</Text>
          <Text style={styles.subtitle}>
            Entrez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe
          </Text>

          <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="votre@email.com"
                placeholderTextColor="#999"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
              />
            </View>

            <MyPressable
              style={styles.sendButton}
              android_ripple={{ color: '#6a1b9a' }}
              onPress={() => navigation.navigate('ResetPassword' as never)}
            >
              <Text style={styles.sendButtonText}>Envoyer le lien</Text>
            </MyPressable>

            <MyPressable
              style={styles.signInButton}
              android_ripple={{ color: '#f3e5f5' }}
              onPress={() => navigation.goBack()}
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
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 24,
  },
  backText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7b1fa2',
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
    lineHeight: 24,
  },
  formContainer: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: 24,
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
  sendButton: {
    backgroundColor: '#7b1fa2',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 16,
  },
  sendButtonText: {
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

export default ForgotPasswordScreen;
