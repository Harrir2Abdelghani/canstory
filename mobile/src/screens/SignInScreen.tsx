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
              <Text style={styles.title}>Bienvenue sur Canstory</Text>
              <Text style={styles.subtitle}>Connectez-vous à votre compte</Text>
            </Animated.View>

            <Animated.View style={[styles.formContainer, { opacity: formOpacityAnim }]}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email</Text>
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
                    onFocus={handleEmailFocus}
                    onBlur={handleEmailBlur}
                  />
                </Animated.View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Mot de passe</Text>
                <Animated.View
                  style={[
                    styles.inputWrapper,
                    { borderColor: passwordBorderColor },
                  ]}
                >
                  <Text style={styles.icon}>🔒</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="••••••••"
                    placeholderTextColor="#bbb"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    onFocus={handlePasswordFocus}
                    onBlur={handlePasswordBlur}
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                    <Text style={styles.eyeIconText}>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
                  </TouchableOpacity>
                </Animated.View>
              </View>

              <MyPressable
                style={styles.forgotButton}
                onPress={() => navigation.navigate('ForgotPassword' as never)}
              >
                <Text style={styles.forgotText}>Mot de passe oublié?</Text>
              </MyPressable>

              <MyPressable
                style={[styles.signInButton, loading && styles.signInButtonDisabled]}
                android_ripple={{ color: '#6a1b9a' }}
                onPress={async () => {
                  if (loading) return;
                  if (!email || !password) {
                    Alert.alert('Erreur', 'Veuillez remplir tous les champs');
                    return;
                  }
                  const { error } = await signIn({ email, password });
                  if (error) {
                    Alert.alert('Erreur de connexion', error.message);
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
                          Alert.alert('Erreur', 'Données utilisateur introuvables');
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
                              'Accès refusé',
                              'Votre profil n\'est pas encore activé. Veuillez attendre l\'approbation de l\'administrateur.'
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
                        Alert.alert('Erreur', 'Une erreur est survenue lors de la connexion');
                      }
                    }, 500);
                  }
                }}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.signInButtonText}>Se connecter</Text>
                )}
              </MyPressable>


              <View style={styles.signUpContainer}>
                <Text style={styles.signUpText}>Pas encore de compte? </Text>
                <MyPressable
                  onPress={() => navigation.navigate('SignUp' as never)}
                >
                  <Text style={styles.signUpLink}>S'inscrire</Text>
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
});

export default SignInScreen;
