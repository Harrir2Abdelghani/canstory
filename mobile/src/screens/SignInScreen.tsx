import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import MyPressable from '../components/MyPressable';
import AnimatedBackground from '../components/AnimatedBackground';
import { useAuth } from '../contexts/AuthContext';
import { DoctorProfileModal } from './DoctorProfileModal';
import { DoctorProfileCompletionModal } from './DoctorProfileCompletionModal';
import { doctorProfileService } from '../services/doctor-profile.service';
import { supabase } from '../lib/supabase';
import { useLanguage } from '../contexts/LanguageContext';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LanguageModal from '../components/LanguageModal';

const SignInScreen: React.FC = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { signIn, loading, user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showDoctorModal, setShowDoctorModal] = useState(false);
  const [showDoctorCompletionModal, setShowDoctorCompletionModal] = useState(false);
  const [checkingDoctorProfile, setCheckingDoctorProfile] = useState(false);
  const [annuaireEntryId, setAnnuaireEntryId] = useState<string | null>(null);
  const { language, t } = useLanguage();
  const [showLangModal, setShowLangModal] = useState(false);

  const emailBorderAnim = useRef(new Animated.Value(0)).current;
  const passwordBorderAnim = useRef(new Animated.Value(0)).current;
  const titleOpacityAnim = useRef(new Animated.Value(0)).current;
  const formOpacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(titleOpacityAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(formOpacityAnim, {
        toValue: 1,
        duration: 800,
        delay: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [titleOpacityAnim, formOpacityAnim]);

  const handleEmailFocus = () => {
    setEmailFocused(true);
    Animated.timing(emailBorderAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const handleEmailBlur = () => {
    setEmailFocused(false);
    Animated.timing(emailBorderAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const handlePasswordFocus = () => {
    setPasswordFocused(true);
    Animated.timing(passwordBorderAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const handlePasswordBlur = () => {
    setPasswordFocused(false);
    Animated.timing(passwordBorderAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const emailBorderColor = emailBorderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#e0e0e0', '#7b1fa2'],
  });

  const passwordBorderColor = passwordBorderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#e0e0e0', '#7b1fa2'],
  });

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
            <Animated.View style={{ opacity: titleOpacityAnim }}>
              <Text style={styles.title}>{t('welcome')}</Text>
              <Text style={styles.subtitle}>{t('login_subtitle')}</Text>
            </Animated.View>

            <Animated.View style={[styles.formContainer, { opacity: formOpacityAnim }]}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>{t('email')}</Text>
                <Animated.View
                  style={[
                    styles.inputWrapper,
                    { borderColor: emailBorderColor },
                  ]}
                >
                  <Ionicons name="mail-outline" size={20} color={emailFocused ? '#7b1fa2' : '#999'} style={{ marginRight: 12 }} />
                  <TextInput
                    style={styles.input}
                    placeholder={t('email_placeholder') || "votre@email.com"}
                    placeholderTextColor="#bbb"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    onFocus={handleEmailFocus}
                    onBlur={handleEmailBlur}
                  />
                </Animated.View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>{t('password')}</Text>
                <Animated.View
                  style={[
                    styles.inputWrapper,
                    { borderColor: passwordBorderColor },
                  ]}
                >
                  <Ionicons name="lock-closed-outline" size={20} color={passwordFocused ? '#7b1fa2' : '#999'} style={{ marginRight: 12 }} />
                  <TextInput
                    style={styles.input}
                    placeholder={t('password_placeholder') || "••••••••"}
                    placeholderTextColor="#bbb"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    onFocus={handlePasswordFocus}
                    onBlur={handlePasswordBlur}
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                    <Ionicons name={showPassword ? "eye-outline" : "eye-off-outline"} size={22} color="#7b1fa2" />
                  </TouchableOpacity>
                </Animated.View>
              </View>

              <MyPressable
                style={styles.forgotButton}
                onPress={() => navigation.navigate('ForgotPassword' as never)}
              >
                <Text style={styles.forgotText}>{t('forgot_password')}</Text>
              </MyPressable>

              <MyPressable
                style={[styles.signInButton, loading && styles.signInButtonDisabled]}
                android_ripple={{ color: '#6a1b9a' }}
                onPress={async () => {
                  if (loading) return;
                  if (!email || !password) {
                    Alert.alert(t('error') || 'Erreur', t('error_fill_all_fields') || 'Veuillez remplir tous les champs', [{ text: t('ok') || 'OK' }]);
                    return;
                  }
                  const { error } = await signIn({ email, password });
                  if (error) {
                    Alert.alert(t('error_login') || 'Erreur de connexion', error.message, [{ text: t('ok') || 'OK' }]);
                  } else {
                    setTimeout(async () => {
                      setCheckingDoctorProfile(true);
                      try {
                        const { data: userData } = await supabase
                          .from('users')
                          .select('id, role, is_active')
                          .eq('email', email)
                          .single();

                        if (!userData) {
                          Alert.alert(t('error') || 'Erreur', t('user_not_found') || 'Données utilisateur introuvables', [{ text: t('ok') || 'OK' }]);
                          setCheckingDoctorProfile(false);
                          return;
                        }

                        const userRole = (userData as any).role;
                        const isActive = (userData as any).is_active;
                        const userId = (userData as any).id;

                        // Check if doctor is active
                        if (userRole === 'doctor') {
                          if (!isActive) {
                            Alert.alert(
                              t('access_denied') || 'Accès refusé',
                              t('profile_not_active') || 'Votre profil n\'est pas encore activé. Veuillez attendre l\'approbation de l\'administrateur.',
                              [{ text: t('ok') || 'OK' }]
                            );
                            setCheckingDoctorProfile(false);
                            await supabase.auth.signOut();
                            return;
                          }

                          console.log('Doctor signin detected, checking profile completion for user:', userId);
                          const entryId = await doctorProfileService.getAnnuaireEntryId(userId);
                          console.log('Annuaire entry ID:', entryId);
                          if (entryId) {
                            const isComplete = await doctorProfileService.checkIfDoctorProfileComplete(entryId);
                            console.log('Doctor profile complete:', isComplete);
                            setCheckingDoctorProfile(false);
                            if (!isComplete) {
                              // Show profile completion modal for incomplete profiles
                              setAnnuaireEntryId(entryId);
                              setShowDoctorCompletionModal(true);
                              console.log('Showing doctor profile completion modal');
                            } else {
                              navigation.navigate('MainHome' as never);
                            }
                          } else {
                            console.log('No annuaire entry found for doctor');
                            setCheckingDoctorProfile(false);
                            navigation.navigate('MainHome' as never);
                          }
                        } else {
                          // Patient - full access
                          setCheckingDoctorProfile(false);
                          navigation.navigate('MainHome' as never);
                        }
                      } catch (err) {
                        console.error('Error checking user profile:', err);
                        setCheckingDoctorProfile(false);
                        Alert.alert(t('error') || 'Erreur', t('error_occurred') || 'Une erreur est survenue lors de la connexion', [{ text: t('ok') || 'OK' }]);
                      }
                    }, 500);
                  }
                }}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.signInButtonText}>{t('login_button')}</Text>
                )}
              </MyPressable>


              <View style={styles.signUpContainer}>
                <Text style={styles.signUpText}>{t('no_account')} </Text>
                <MyPressable
                  onPress={() => navigation.navigate('SignUp' as never)}
                >
                  <Text style={styles.signUpLink}>{t('signup_link')}</Text>
                </MyPressable>
              </View>
            </Animated.View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {user && annuaireEntryId && (
        <DoctorProfileModal
          visible={showDoctorModal}
          userId={user.id}
          annuaireEntryId={annuaireEntryId}
          onComplete={() => {
            setShowDoctorModal(false);
            navigation.navigate('MainHome' as never);
          }}
        />
      )}

      {annuaireEntryId && (
        <DoctorProfileCompletionModal
          visible={showDoctorCompletionModal}
          entryId={annuaireEntryId}
          onComplete={() => {
            setShowDoctorCompletionModal(false);
            navigation.navigate('MainHome' as never);
          }}
          onCancel={() => {
            setShowDoctorCompletionModal(false);
            navigation.navigate('MainHome' as never);
          }}
        />
      )}

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
    color: '#888',
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
  forgotButton: {
    alignSelf: 'flex-end',
    marginBottom: 28,
  },
  forgotText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7b1fa2',
  },
  signInButton: {
    backgroundColor: '#7b1fa2',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#7b1fa2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  signInButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
  },
  signInButtonDisabled: {
    opacity: 0.6,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#ddd',
  },
  dividerText: {
    marginHorizontal: 12,
    color: '#999',
    fontWeight: '500',
    fontSize: 13,
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 28,
  },
  socialButton: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  socialIcon: {
    fontSize: 24,
    fontWeight: '700',
    color: '#7b1fa2',
  },
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signUpText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#888',
  },
  signUpLink: {
    fontSize: 14,
    fontWeight: '700',
    color: '#7b1fa2',
  },
  eyeIcon: {
    padding: 8,
  },
  eyeIconText: {
    fontSize: 20,
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

export default SignInScreen;
