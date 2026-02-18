import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  Animated,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import MyPressable from '../components/MyPressable';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import LanguageModal from '../components/LanguageModal';
import AnimatedBackground from '../components/AnimatedBackground';

const ForgotPasswordScreen: React.FC = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { resetPassword, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const { language } = useLanguage();
  const [showLangModal, setShowLangModal] = useState(false);

  const opacityAnim = useRef(new Animated.Value(0)).current;
  const emailBorderAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(opacityAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, [opacityAnim]);

  const handleFocus = () => {
    setEmailFocused(true);
    Animated.timing(emailBorderAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const handleBlur = () => {
    setEmailFocused(false);
    Animated.timing(emailBorderAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const emailBorderColor = emailBorderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#e0e0e0', '#7b1fa2'],
  });

  const handleResetPassword = async () => {
    if (!email) {
      Alert.alert('Erreur', 'Veuillez entrer votre adresse email');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Erreur', 'Veuillez entrer une adresse email valide');
      return;
    }

    const { error } = await resetPassword(email);

    if (error) {
      Alert.alert('Erreur', error.message);
    } else {
      setIsSubmitted(true);
    }
  };

  if (isSubmitted) {
    return (
      <AnimatedBackground>
        <View style={[styles.container, styles.centerContent, { paddingTop: insets.top }]}>
          <View style={styles.successIconContainer}>
            <Text style={styles.successIcon}>✉️</Text>
          </View>
          <Text style={styles.title}>Email envoyé !</Text>
          <Text style={styles.successSubtitle}>
            Un lien de réinitialisation a été envoyé à {email}. 
            Veuillez consulter votre boîte de réception.
          </Text>
          <MyPressable
            style={styles.sendButton}
            onPress={() => navigation.navigate('SignIn' as never)}
          >
            <Text style={styles.sendButtonText}>Retour à la connexion</Text>
          </MyPressable>
        </View>
      </AnimatedBackground>
    );
  }

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
          <Animated.View style={[styles.container, { paddingTop: insets.top + 20, opacity: opacityAnim }]}>
            <MyPressable
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.backText}>← Retour</Text>
            </MyPressable>

            <Text style={styles.title}>Mot de passe oublié?</Text>
            <Text style={styles.subtitle}>
              Ne vous inquiétez pas, cela arrive. Entrez votre email pour réinitialiser votre compte.
            </Text>

            <View style={styles.formContainer}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Adresse Email</Text>
                <Animated.View
                  style={[
                    styles.inputWrapper,
                    { borderColor: emailBorderColor },
                  ]}
                >
                  <Text style={styles.icon}>✉️</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="votre@email.com"
                    placeholderTextColor="#bbb"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                  />
                </Animated.View>
              </View>

              <MyPressable
                style={[styles.sendButton, loading && styles.buttonDisabled]}
                android_ripple={{ color: '#6a1b9a' }}
                onPress={handleResetPassword}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.sendButtonText}>Réinitialiser le mot de passe</Text>
                )}
              </MyPressable>

              <MyPressable
                style={styles.signInButton}
                android_ripple={{ color: '#f3e5f5' }}
                onPress={() => navigation.goBack()}
              >
                <Text style={styles.signInButtonText}>Retour à la connexion</Text>
              </MyPressable>
            </View>
          </Animated.View>
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
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 32,
    paddingVertical: 8,
  },
  backText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#7b1fa2',
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#6a1b9a',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '400',
    color: '#666',
    marginBottom: 40,
    lineHeight: 24,
  },
  successSubtitle: {
    fontSize: 16,
    fontWeight: '400',
    color: '#666',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  formContainer: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: 32,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6a1b9a',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
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
    fontWeight: '500',
    color: '#333',
  },
  sendButton: {
    backgroundColor: '#7b1fa2',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 20,
    width: '100%',
    shadowColor: '#7b1fa2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  sendButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  signInButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#7b1fa2',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    width: '100%',
  },
  signInButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#7b1fa2',
  },
  successIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f3e5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  successIcon: {
    fontSize: 50,
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
    borderColor: '#7b1fa2',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  languageText: {
    color: '#7b1fa2',
    fontSize: 12,
    fontWeight: '900',
  },
});

export default ForgotPasswordScreen;
