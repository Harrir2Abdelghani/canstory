import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import LanguageModal from './LanguageModal';
import CanstoryLogo from './CanstoryLogo';
import Ionicons from 'react-native-vector-icons/Ionicons';

const MainHeader: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const [showLangModal, setShowLangModal] = useState(false);
  const { language: currentLang } = useLanguage();

  return (
    <View style={[styles.outerContainer, { paddingTop: insets.top }]}>
      <View style={styles.content}>
        <View style={styles.leftSection}>
          <TouchableOpacity 
            style={styles.logoWrapper}
            onPress={() => navigation.navigate('HomeTab')}
            activeOpacity={0.7}
          >
            <CanstoryLogo width={34} height={34} />
            <Text style={styles.appName}>CANSTORY</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.rightSection}>
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={() => setShowLangModal(true)}
            activeOpacity={0.6}
            hitSlop={{ top: 15, bottom: 15, left: 8, right: 8 }}
          >
            <View style={styles.iconCircle}>
              <Ionicons name="globe-outline" size={22} color="#7b1fa2" />
              <View style={styles.langTag}>
                <Text style={styles.langText}>{currentLang}</Text>
              </View>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('Notifications')}
            activeOpacity={0.6}
            hitSlop={{ top: 15, bottom: 15, left: 8, right: 8 }}
          >
            <View style={styles.iconCircle}>
              <Ionicons name="notifications-outline" size={22} color="#7b1fa2" />
              <View style={styles.badge}>
                <Text style={styles.badgeText}>3</Text>
              </View>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.avatarButton}
            onPress={() => navigation.navigate('Profile')}
            activeOpacity={0.6}
            hitSlop={{ top: 15, bottom: 15, left: 10, right: 10 }}
          >
            <View style={styles.avatarBorder}>
              {user?.avatar_url ? (
                <Image source={{ uri: user.avatar_url }} style={styles.avatarImage} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarInitial}>
                    {user?.full_name?.charAt(0).toUpperCase() || 'A'}
                  </Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <LanguageModal 
        visible={showLangModal} 
        onClose={() => setShowLangModal(false)} 
      />
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(123, 31, 162, 0.1)',
    zIndex: 1000,
    ...Platform.select({
      ios: {
        shadowColor: '#7b1fa2',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  content: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  leftSection: {
    flex: 1,
  },
  logoWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  appName: {
    fontSize: 20,
    fontWeight: '900',
    color: '#7b1fa2',
    marginLeft: 10,
    letterSpacing: 1,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: '#f8f4ff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#f3e5f5',
  },
  langTag: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: '#7b1fa2',
    borderRadius: 6,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderWidth: 1.5,
    borderColor: '#fff',
  },
  langText: {
    fontSize: 8,
    fontWeight: '900',
    color: '#fff',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#ff5252',
    borderRadius: 9,
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  badgeText: {
    color: '#fff',
    fontSize: 8,
    fontWeight: '900',
  },
  avatarButton: {
    marginLeft: 12,
    padding: 2,
  },
  avatarBorder: {
    width: 40,
    height: 40,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#7b1fa2',
    padding: 2,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
    backgroundColor: '#7b1fa2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },
});

export default MainHeader;
