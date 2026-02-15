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
import { UserRole } from '../types';
import WilayaData from '../../assets/Wilaya_Of_Algeria.json';
import CommuneData from '../../assets/Commune_Of_Algeria.json';

const ROLES = [
  { id: 'patient', label: 'Patient / Proche', icon: '👤' },
  { id: 'doctor', label: 'Médecin', icon: '👨‍⚕️' },
  { id: 'pharmacy', label: 'Pharmacie', icon: '💊' },
  { id: 'association', label: 'Association', icon: '🤝' },
  { id: 'cancer_center', label: 'Centre Cancer', icon: '🏥' },
  { id: 'laboratory', label: 'Laboratoire', icon: '🔬' },
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

  const getRoleLabel = () => {
    const role = ROLES.find(r => r.id === selectedRole);
    return role ? `${role.icon} ${role.label}` : 'Sélectionnez votre rôle';
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
              <Text style={styles.title}>Rejoignez Canstory</Text>
              <Text style={styles.subtitle}>Créez votre compte</Text>
            </Animated.View>

            <Animated.View style={[styles.formContainer, { opacity: formOpacityAnim }]}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Nom Complet</Text>
                <Animated.View
                  style={[
                    styles.inputWrapper,
                    { borderColor: createBorderColor(nameBorderAnim) },
                  ]}
                >
                  <Text style={styles.icon}>👤</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Votre nom"
                    placeholderTextColor="#bbb"
                    value={name}
                    onChangeText={setName}
                    onFocus={() => handleFocus(nameBorderAnim)}
                    onBlur={() => handleBlur(nameBorderAnim)}
                  />
                </Animated.View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email</Text>
                <Animated.View
                  style={[
                    styles.inputWrapper,
                    { borderColor: createBorderColor(emailBorderAnim) },
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
                    onFocus={() => handleFocus(emailBorderAnim)}
                    onBlur={() => handleBlur(emailBorderAnim)}
                  />
                </Animated.View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Rôle</Text>
                <MyPressable
                  style={[
                    styles.inputWrapper,
                    { borderColor: selectedRole ? PRIMARY_COLOR : '#e0e0e0' },
                  ]}
                  onPress={() => setShowRoleModal(true)}
                >
                  <Text style={styles.icon}>👥</Text>
                  <Text style={[styles.input, { color: selectedRole ? '#333' : '#bbb' }]}>
                    {getRoleLabel()}
                  </Text>
                  <Text style={{ fontSize: 16, color: PRIMARY_COLOR }}>▼</Text>
                </MyPressable>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Mot de passe</Text>
                <Animated.View
                  style={[
                    styles.inputWrapper,
                    { borderColor: createBorderColor(passwordBorderAnim) },
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
                    onFocus={() => handleFocus(passwordBorderAnim)}
                    onBlur={() => handleBlur(passwordBorderAnim)}
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                    <Text style={styles.eyeIconText}>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
                  </TouchableOpacity>
                </Animated.View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Confirmer le mot de passe</Text>
                <Animated.View
                  style={[
                    styles.inputWrapper,
                    { borderColor: createBorderColor(confirmPasswordBorderAnim) },
                  ]}
                >
                  <Text style={styles.icon}>✓</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="••••••••"
                    placeholderTextColor="#bbb"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showConfirmPassword}
                    onFocus={() => handleFocus(confirmPasswordBorderAnim)}
                    onBlur={() => handleBlur(confirmPasswordBorderAnim)}
                  />
                  <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeIcon}>
                    <Text style={styles.eyeIconText}>{showConfirmPassword ? '👁️' : '👁️‍🗨️'}</Text>
                  </TouchableOpacity>
                </Animated.View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Wilaya</Text>
                <MyPressable
                  style={[
                    styles.inputWrapper,
                    { borderColor: wilaya ? PRIMARY_COLOR : '#e0e0e0' },
                  ]}
                  onPress={() => setShowWilayaModal(true)}
                >
                  <Text style={styles.icon}>📍</Text>
                  <Text style={[styles.input, { color: wilaya ? '#333' : '#bbb' }]}>
                    {wilaya || 'Sélectionnez votre wilaya'}
                  </Text>
                  <Text style={{ fontSize: 16, color: PRIMARY_COLOR }}>▼</Text>
                </MyPressable>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Commune</Text>
                <MyPressable
                  style={[
                    styles.inputWrapper,
                    { borderColor: commune ? PRIMARY_COLOR : '#e0e0e0' },
                  ]}
                  onPress={() => wilaya ? setShowCommuneModal(true) : Alert.alert('Erreur', 'Veuillez d\'abord sélectionner une wilaya')}
                >
                  <Text style={styles.icon}>🏘️</Text>
                  <Text style={[styles.input, { color: commune ? '#333' : '#bbb' }]}>
                    {commune || 'Sélectionnez votre commune'}
                  </Text>
                  <Text style={{ fontSize: 16, color: PRIMARY_COLOR }}>▼</Text>
                </MyPressable>
              </View>

              <MyPressable
                style={[styles.signUpButton, loading && styles.signUpButtonDisabled]}
                android_ripple={{ color: PRIMARY_COLOR }}
                onPress={async () => {
                  if (loading) return;
                  if (!name || !email || !password || !confirmPassword || !selectedRole || !wilaya || !commune) {
                    Alert.alert('Erreur', 'Veuillez remplir tous les champs');
                    return;
                  }
                  if (password !== confirmPassword) {
                    Alert.alert('Erreur', 'Les mots de passe ne correspondent pas');
                    return;
                  }
                  if (password.length < 6) {
                    Alert.alert('Erreur', 'Le mot de passe doit contenir au moins 6 caractères');
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
                    Alert.alert('Erreur d\'inscription', error.message);
                  } else {
                    if (selectedRole === 'doctor') {
                      Alert.alert('Succès', 'Compte créé avec succès! Veuillez vous connecter pour compléter votre profil.', [
                        { text: 'OK', onPress: () => navigation.navigate('SignIn' as never) },
                      ]);
                    } else {
                      Alert.alert('Succès', 'Compte créé avec succès! Veuillez vous connecter.', [
                        { text: 'OK', onPress: () => navigation.navigate('SignIn' as never) },
                      ]);
                    }
                  }
                }}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.signUpButtonText}>Créer mon compte</Text>
                )}
              </MyPressable>

              <View style={styles.signInContainer}>
                <Text style={styles.signInText}>Vous avez déjà un compte? </Text>
                <MyPressable
                  onPress={() => navigation.navigate('SignIn' as never)}
                >
                  <Text style={styles.signInLink}>Se connecter</Text>
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
              <Text style={styles.modalTitle}>Sélectionnez votre rôle</Text>
              <MyPressable onPress={() => setShowRoleModal(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </MyPressable>
            </View>

            <ScrollView style={styles.rolesList}>
              {ROLES.map(role => (
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
                  <Text style={styles.roleIcon}>{role.icon}</Text>
                  <View style={styles.roleInfo}>
                    <Text style={styles.roleLabel}>{role.label}</Text>
                  </View>
                  {selectedRole === role.id && (
                    <Text style={styles.roleCheckmark}>✓</Text>
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
              <Text style={styles.modalTitle}>Sélectionnez votre wilaya</Text>
              <MyPressable onPress={() => setShowWilayaModal(false)}>
                <Text style={styles.modalClose}>✕</Text>
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
              <Text style={styles.modalTitle}>Sélectionnez votre commune</Text>
              <MyPressable onPress={() => setShowCommuneModal(false)}>
                <Text style={styles.modalClose}>✕</Text>
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
});

export default SignUpScreen;
