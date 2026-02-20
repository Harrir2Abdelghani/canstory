import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Modal,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import MyPressable from '../components/MyPressable';
import AnimatedBackground from '../components/AnimatedBackground';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import LanguageModal from '../components/LanguageModal';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { UserRole } from '../types';
import WilayaData from '../../assets/Wilaya_Of_Algeria.json';
import CommuneData from '../../assets/Commune_Of_Algeria.json';

const getRoles = (t: any) => [
  { id: 'patient', label: t('role_patient') || 'Patient / Proche', icon: 'person-outline' },
  { id: 'doctor', label: t('role_doctor') || 'Médecin', icon: 'medical-outline' },
  { id: 'pharmacy', label: t('role_pharmacy') || 'Pharmacie', icon: 'bandage-outline' },
  { id: 'association', label: t('role_association') || 'Association', icon: 'heart-outline' },
  { id: 'cancer_center', label: t('role_cancer_center') || 'Centre Cancer', icon: 'business-outline' },
  { id: 'laboratory', label: t('role_laboratory') || 'Laboratoire', icon: 'flask-outline' },
];

const PRIMARY_COLOR = '#7D5AB4';

const SignUpScreen: React.FC = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { signUp, loading } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [wilaya, setWilaya] = useState('');
  const [commune, setCommune] = useState('');
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showWilayaModal, setShowWilayaModal] = useState(false);
  const [showCommuneModal, setShowCommuneModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [filteredCommunes, setFilteredCommunes] = useState<any[]>([]);
  const { language, t } = useLanguage();
  const [showLangModal, setShowLangModal] = useState(false);

  const nameBorderAnim = useRef(new Animated.Value(0)).current;
  const emailBorderAnim = useRef(new Animated.Value(0)).current;
  const passwordBorderAnim = useRef(new Animated.Value(0)).current;
  const confirmPasswordBorderAnim = useRef(new Animated.Value(0)).current;
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

  const handleFocus = (anim: Animated.Value) => {
    Animated.timing(anim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const handleBlur = (anim: Animated.Value) => {
    Animated.timing(anim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const createBorderColor = (anim: Animated.Value) =>
    anim.interpolate({
      inputRange: [0, 1],
      outputRange: ['#e0e0e0', PRIMARY_COLOR],
    });

  const rolesList = useMemo(() => getRoles(t), [t]);

  const getRoleLabel = () => {
    const role = rolesList.find((r: any) => r.id === selectedRole);
    return role ? role.label : t('select_role') || 'Sélectionnez votre rôle';
  };
 
  const getRoleIcon = () => {
    const role = rolesList.find((r: any) => r.id === selectedRole);
    return role ? role.icon : 'person-outline';
  };

  const handleWilayaSelect = (wilayaName: string) => {
    setWilaya(wilayaName);
    setCommune('');
    const selectedWilaya = WilayaData.find((w: any) => w.name === wilayaName);
    if (selectedWilaya) {
      const communes = CommuneData.filter((c: any) => {
        return c.wilaya_id === selectedWilaya.code || c.wilaya_id === selectedWilaya.id;
      });
      setFilteredCommunes(communes);
    }
    setShowWilayaModal(false);
  };

  const handleCommuneSelect = (communeName: string) => {
    setCommune(communeName);
    setShowCommuneModal(false);
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
          <View style={[styles.container, { paddingTop: insets.top + 30 }]}>
            <Animated.View style={{ opacity: titleOpacityAnim }}>
              <Text style={styles.title}>{t('signup_title') || 'Rejoignez Canstory'}</Text>
              <Text style={styles.subtitle}>{t('signup_subtitle') || 'Créez votre compte'}</Text>
            </Animated.View>

            <Animated.View style={[styles.formContainer, { opacity: formOpacityAnim }]}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>{t('full_name_label') || 'Nom Complet'}</Text>
                <Animated.View
                  style={[
                    styles.inputWrapper,
                    { borderColor: createBorderColor(nameBorderAnim) },
                  ]}
                >
                  <Ionicons name="person-outline" size={20} color={PRIMARY_COLOR} style={{ marginRight: 12 }} />
                  <TextInput
                    style={styles.input}
                    placeholder={t('full_name_placeholder') || "Votre nom"}
                    placeholderTextColor="#bbb"
                    value={name}
                    onChangeText={setName}
                    onFocus={() => handleFocus(nameBorderAnim)}
                    onBlur={() => handleBlur(nameBorderAnim)}
                  />
                </Animated.View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>{t('email')}</Text>
                <Animated.View
                  style={[
                    styles.inputWrapper,
                    { borderColor: createBorderColor(emailBorderAnim) },
                  ]}
                >
                  <Ionicons name="mail-outline" size={20} color={PRIMARY_COLOR} style={{ marginRight: 12 }} />
                  <TextInput
                    style={styles.input}
                    placeholder={t('email_placeholder') || "votre@email.com"}
                    placeholderTextColor="#bbb"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    onFocus={() => handleFocus(emailBorderAnim)}
                    onBlur={() => handleBlur(emailBorderAnim)}
                  />
                </Animated.View>
              </View>
 
              <View style={styles.inputGroup}>
                <Text style={styles.label}>{t('role_label') || 'Rôle'}</Text>
                <MyPressable
                  style={[
                    styles.inputWrapper,
                    { borderColor: selectedRole ? PRIMARY_COLOR : '#e0e0e0' },
                  ]}
                  onPress={() => setShowRoleModal(true)}
                >
                  <Ionicons name={getRoleIcon() as any} size={20} color={PRIMARY_COLOR} style={{ marginRight: 12 }} />
                  <Text style={[styles.input, { color: selectedRole ? '#333' : '#bbb' }]}>
                    {selectedRole ? getRoleLabel() : (t('select_role') || 'Sélectionnez votre rôle')}
                  </Text>
                  <Ionicons name="chevron-down" size={16} color={PRIMARY_COLOR} />
                </MyPressable>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>{t('password')}</Text>
                <Animated.View
                  style={[
                    styles.inputWrapper,
                    { borderColor: createBorderColor(passwordBorderAnim) },
                  ]}
                >
                  <Ionicons name="lock-closed-outline" size={20} color={PRIMARY_COLOR} style={{ marginRight: 12 }} />
                  <TextInput
                    style={styles.input}
                    placeholder={t('password_placeholder') || "••••••••"}
                    placeholderTextColor="#bbb"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    onFocus={() => handleFocus(passwordBorderAnim)}
                    onBlur={() => handleBlur(passwordBorderAnim)}
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                    <Ionicons name={showPassword ? "eye-outline" : "eye-off-outline"} size={22} color={PRIMARY_COLOR} />
                  </TouchableOpacity>
                </Animated.View>
              </View>
 
              <View style={styles.inputGroup}>
                <Text style={styles.label}>{t('confirm_password') || 'Confirmer le mot de passe'}</Text>
                <Animated.View
                  style={[
                    styles.inputWrapper,
                    { borderColor: createBorderColor(confirmPasswordBorderAnim) },
                  ]}
                >
                  <Ionicons name="checkmark-circle-outline" size={20} color={PRIMARY_COLOR} style={{ marginRight: 12 }} />
                  <TextInput
                    style={styles.input}
                    placeholder={t('confirm_password_placeholder') || "••••••••"}
                    placeholderTextColor="#bbb"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showConfirmPassword}
                    onFocus={() => handleFocus(confirmPasswordBorderAnim)}
                    onBlur={() => handleBlur(confirmPasswordBorderAnim)}
                  />
                  <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeIcon}>
                    <Ionicons name={showConfirmPassword ? "eye-outline" : "eye-off-outline"} size={22} color={PRIMARY_COLOR} />
                  </TouchableOpacity>
                </Animated.View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>{t('wilaya_label') || 'Wilaya'}</Text>
                <MyPressable
                  style={[
                    styles.inputWrapper,
                    { borderColor: wilaya ? PRIMARY_COLOR : '#e0e0e0' },
                  ]}
                  onPress={() => setShowWilayaModal(true)}
                >
                  <Ionicons name="location-outline" size={20} color={PRIMARY_COLOR} style={{ marginRight: 12 }} />
                  <Text style={[styles.input, { color: wilaya ? '#333' : '#bbb' }]}>
                    {wilaya || (t('select_wilaya') || 'Sélectionnez votre wilaya')}
                  </Text>
                  <Ionicons name="chevron-down" size={16} color={PRIMARY_COLOR} />
                </MyPressable>
              </View>
 
              <View style={styles.inputGroup}>
                <Text style={styles.label}>{t('commune_label') || 'Commune'}</Text>
                <MyPressable
                  style={[
                    styles.inputWrapper,
                    { borderColor: commune ? PRIMARY_COLOR : '#e0e0e0' },
                  ]}
                  onPress={() => wilaya ? setShowCommuneModal(true) : Alert.alert(t('error') || 'Erreur', t('error_wilaya_required') || 'Veuillez d\'abord sélectionner une wilaya', [{ text: t('ok') || 'OK' }])}
                >
                  <Ionicons name="business-outline" size={20} color={PRIMARY_COLOR} style={{ marginRight: 12 }} />
                  <Text style={[styles.input, { color: commune ? '#333' : '#bbb' }]}>
                    {commune || (t('select_commune') || 'Sélectionnez votre commune')}
                  </Text>
                  <Ionicons name="chevron-down" size={16} color={PRIMARY_COLOR} />
                </MyPressable>
              </View>

              <MyPressable
                style={[styles.signUpButton, loading && styles.signUpButtonDisabled]}
                android_ripple={{ color: PRIMARY_COLOR }}
                onPress={async () => {
                  if (loading) return;
                  if (!name || !email || !password || !confirmPassword || !selectedRole || !wilaya || !commune) {
                    Alert.alert(t('error') || 'Erreur', t('error_fill_all_fields') || 'Veuillez remplir tous les champs', [{ text: t('ok') || 'OK' }]);
                    return;
                  }
                  if (password !== confirmPassword) {
                    Alert.alert(t('error') || 'Erreur', t('error_passwords_not_match') || 'Les mots de passe ne correspondent pas', [{ text: t('ok') || 'OK' }]);
                    return;
                  }
                  if (password.length < 6) {
                    Alert.alert(t('error') || 'Erreur', t('error_password_length') || 'Le mot de passe doit contenir au moins 6 caractères', [{ text: t('ok') || 'OK' }]);
                    return;
                  }
                  const { error } = await signUp({
                    email,
                    password,
                    full_name: name,
                    role: selectedRole as UserRole,
                    wilaya,
                    commune,
                  });
                  if (error) {
                    Alert.alert(t('signup_error_title') || 'Erreur d\'inscription', error.message, [{ text: t('ok') || 'OK' }]);
                  } else {
                    if (selectedRole === 'doctor') {
                      Alert.alert(t('success') || 'Succès', t('signup_success_doctor_message') || 'Compte créé avec succès! Veuillez vous connecter pour compléter votre profil.', [
                        { text: t('ok') || 'OK', onPress: () => navigation.navigate('SignIn' as never) },
                      ]);
                    } else {
                      Alert.alert(t('success') || 'Succès', t('signup_success_message') || 'Compte créé avec succès! Veuillez vous connecter.', [
                        { text: t('ok') || 'OK', onPress: () => navigation.navigate('SignIn' as never) },
                      ]);
                    }
                  }
                }}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.signUpButtonText}>{t('signup_button') || 'Créer mon compte'}</Text>
                )}
              </MyPressable>

              <View style={styles.signInContainer}>
                <Text style={styles.signInText}>{t('already_account') || 'Vous avez déjà un compte?'} </Text>
                <MyPressable
                  onPress={() => navigation.navigate('SignIn' as never)}
                >
                  <Text style={styles.signInLink}>{t('login_button') || 'Se connecter'}</Text>
                </MyPressable>
              </View>
            </Animated.View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal
        visible={showRoleModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowRoleModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('select_role') || 'Sélectionnez votre rôle'}</Text>
              <MyPressable onPress={() => setShowRoleModal(false)}>
                <Ionicons name="close" size={24} color="#999" />
              </MyPressable>
            </View>

            <ScrollView style={styles.rolesList}>
              {rolesList.map((role: any) => (
                <MyPressable
                  key={role.id}
                  style={[
                    styles.roleOption,
                    selectedRole === role.id && styles.roleOptionSelected,
                  ]}
                  onPress={() => {
                    setSelectedRole(role.id);
                    setShowRoleModal(false);
                  }}
                >
                  <Ionicons name={role.icon as any} size={28} color={PRIMARY_COLOR} style={{ marginRight: 12 }} />
                  <View style={styles.roleInfo}>
                    <Text style={styles.roleLabel}>{role.label}</Text>
                  </View>
                  {selectedRole === role.id && (
                    <Ionicons name="checkmark-circle" size={20} color={PRIMARY_COLOR} />
                  )}
                </MyPressable>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showWilayaModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowWilayaModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('select_wilaya') || 'Sélectionnez votre wilaya'}</Text>
              <MyPressable onPress={() => setShowWilayaModal(false)}>
                <Ionicons name="close" size={24} color="#999" />
              </MyPressable>
            </View>

            <FlatList
              data={WilayaData}
              keyExtractor={(item) => item.id}
              scrollEnabled={true}
              nestedScrollEnabled={true}
              renderItem={({ item }) => (
                <MyPressable
                  style={[
                    styles.wilayaOption,
                    wilaya === item.name && styles.wilayaOptionSelected,
                  ]}
                  onPress={() => handleWilayaSelect(item.name)}
                >
                  <Text style={[styles.wilayaLabel, wilaya === item.name && styles.wilayaLabelSelected]}>
                    {item.name}
                  </Text>
                  {wilaya === item.name && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </MyPressable>
              )}
            />
          </View>
        </View>
      </Modal>

      <Modal
        visible={showCommuneModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCommuneModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('select_commune') || 'Sélectionnez votre commune'}</Text>
              <MyPressable onPress={() => setShowCommuneModal(false)}>
                <Ionicons name="close" size={24} color="#999" />
              </MyPressable>
            </View>

            <FlatList
              data={filteredCommunes}
              keyExtractor={(item) => item.id}
              scrollEnabled={true}
              nestedScrollEnabled={true}
              renderItem={({ item }) => (
                <MyPressable
                  style={[
                    styles.wilayaOption,
                    commune === item.name && styles.wilayaOptionSelected,
                  ]}
                  onPress={() => handleCommuneSelect(item.name)}
                >
                  <Text style={[styles.wilayaLabel, commune === item.name && styles.wilayaLabelSelected]}>
                    {item.name}
                  </Text>
                  {commune === item.name && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </MyPressable>
              )}
            />
          </View>
        </View>
      </Modal>

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
    marginBottom: 32,
  },
  formContainer: {
    flex: 1,
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
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    height: 52,
  },
  icon: {
    fontSize: 18,
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  signUpButton: {
    backgroundColor: PRIMARY_COLOR,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 20,
    shadowColor: PRIMARY_COLOR,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  signUpButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
  },
  signUpButtonDisabled: {
    opacity: 0.6,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
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
    marginBottom: 20,
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
    color: PRIMARY_COLOR,
  },
  signInContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signInText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#888',
  },
  signInLink: {
    fontSize: 14,
    fontWeight: '700',
    color: PRIMARY_COLOR,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#6a1b9a',
  },
  modalClose: {
    fontSize: 24,
    color: '#999',
    fontWeight: '600',
  },
  rolesList: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  roleOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginVertical: 6,
    borderRadius: 12,
    backgroundColor: '#f9f9f9',
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  roleOptionSelected: {
    backgroundColor: '#f3e5f5',
    borderColor: PRIMARY_COLOR,
  },
  roleIcon: {
    fontSize: 28,
    marginRight: 12,
  },
  roleInfo: {
    flex: 1,
  },
  roleLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  roleCheckmark: {
    fontSize: 20,
    color: PRIMARY_COLOR,
    fontWeight: '700',
  },
  wilayaOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginVertical: 4,
    marginHorizontal: 8,
    borderRadius: 10,
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  wilayaOptionSelected: {
    backgroundColor: '#f3e5f5',
    borderColor: PRIMARY_COLOR,
    borderWidth: 2,
  },
  wilayaLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
  },
  wilayaLabelSelected: {
    fontWeight: '700',
    color: PRIMARY_COLOR,
  },
  checkmark: {
    fontSize: 18,
    color: PRIMARY_COLOR,
    fontWeight: '700',
    marginLeft: 8,
  },
  eyeIcon: {
    padding: 8,
  },
  eyeIconText: {
    fontSize: 20,
    color: PRIMARY_COLOR,
    fontWeight: '700',
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
    borderColor: PRIMARY_COLOR,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  languageText: {
    color: PRIMARY_COLOR,
    fontSize: 12,
    fontWeight: '900',
  },
});

export default SignUpScreen;
