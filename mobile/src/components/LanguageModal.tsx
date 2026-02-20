import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Modal,
  Dimensions,
} from 'react-native';
import { useLanguage } from '../contexts/LanguageContext';

const { width } = Dimensions.get('window');

interface Props {
  visible: boolean;
  onClose: () => void;
}

const LanguageModal: React.FC<Props> = ({ visible, onClose }) => {
  const { language: currentLang, setLanguage, t } = useLanguage();

  const handleSelect = async (lang: 'FR' | 'AR' | 'EN') => {
    await setLanguage(lang);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <TouchableOpacity 
        style={styles.modalOverlay} 
        activeOpacity={1} 
        onPress={onClose}
      >
        <View style={styles.modalContent}>
          <View style={styles.modalHandle} />
          <Text style={styles.modalTitle}>{t('choose_lang') || 'Choisir la langue'}</Text>
          
          <TouchableOpacity 
            style={[styles.langItem, currentLang === 'FR' && styles.langItemActive]} 
            onPress={() => handleSelect('FR')}
          >
            <View style={styles.langLeft}>
              <Text style={styles.langItemIcon}>🇫🇷</Text>
              <Text style={styles.langItemText}>Français</Text>
            </View>
            {currentLang === 'FR' && <Text style={styles.checkIcon}>✓</Text>}
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.langItem, currentLang === 'AR' && styles.langItemActive]} 
            onPress={() => handleSelect('AR')}
          >
            <View style={styles.langLeft}>
              <Text style={styles.langItemIcon}>🇩🇿</Text>
              <Text style={styles.langItemText}>العربية</Text>
            </View>
            {currentLang === 'AR' && <Text style={styles.checkIcon}>✓</Text>}
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.langItem, currentLang === 'EN' && styles.langItemActive]} 
            onPress={() => handleSelect('EN')}
          >
            <View style={styles.langLeft}>
              <Text style={styles.langItemIcon}>🇬🇧</Text>
              <Text style={styles.langItemText}>English</Text>
            </View>
            {currentLang === 'EN' && <Text style={styles.checkIcon}>✓</Text>}
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    paddingBottom: 40,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 20,
  },
  modalHandle: {
    width: 40,
    height: 5,
    backgroundColor: '#eee',
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 20,
  },
  langItem: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#f5f5f5',
  },
  langItemActive: {
    backgroundColor: '#f3e5f5',
    borderColor: '#7b1fa2',
    borderWidth: 1,
  },
  langLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  langItemIcon: {
    fontSize: 24,
    marginRight: 15,
  },
  langItemText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  checkIcon: {
    fontSize: 18,
    color: '#7b1fa2',
    fontWeight: 'bold',
  },
});

export default LanguageModal;
