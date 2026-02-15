import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import AnimatedBackground from '../components/AnimatedBackground';
import CanstoryLogo from '../components/CanstoryLogo';
import MyPressable from '../components/MyPressable';

const MainHomeScreen: React.FC = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  return (
    <AnimatedBackground>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.container, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 }]}>
          <View style={styles.header}>
            <CanstoryLogo width={100} height={100} />
            <Text style={styles.title}>Canstory</Text>
            <Text style={styles.subtitle}>Votre plateforme de soutien</Text>
          </View>

          <View style={styles.content}>
            <View style={styles.card}>
              <Text style={styles.cardIcon}>📚</Text>
              <Text style={styles.cardTitle}>Ressources</Text>
              <Text style={styles.cardDescription}>Accédez à des informations médicales et administratives</Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardIcon}>⚗️</Text>
              <Text style={styles.cardTitle}>Professionnels</Text>
              <Text style={styles.cardDescription}>Connectez-vous avec des experts de santé</Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardIcon}>🥗</Text>
              <Text style={styles.cardTitle}>Nutrition</Text>
              <Text style={styles.cardDescription}>Conseils nutritionnels personnalisés</Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardIcon}>🤝</Text>
              <Text style={styles.cardTitle}>Communauté</Text>
              <Text style={styles.cardDescription}>Rejoignez notre réseau de solidarité</Text>
            </View>
          </View>

          <View style={styles.footer}>
            <MyPressable
              style={styles.logoutButton}
              android_ripple={{ color: '#6a1b9a' }}
              onPress={() => navigation.navigate('Onboarding' as never)}
            >
              <Text style={styles.logoutButtonText}>Retour</Text>
            </MyPressable>
          </View>
        </View>
      </ScrollView>
    </AnimatedBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#6a1b9a',
    marginTop: 12,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#888',
    marginTop: 4,
  },
  content: {
    flex: 1,
    gap: 16,
    marginBottom: 30,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f3e5f5',
  },
  cardIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#6a1b9a',
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    fontWeight: '400',
    color: '#666',
    textAlign: 'center',
  },
  footer: {
    marginTop: 20,
  },
  logoutButton: {
    backgroundColor: '#7b1fa2',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});

export default MainHomeScreen;
