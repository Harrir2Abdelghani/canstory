import React, { useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import AnimatedBackground from '../components/AnimatedBackground';
import CanstoryLogo from '../components/CanstoryLogo';

const WelcomeBackScreen: React.FC = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.navigate('MainHome' as never);
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <AnimatedBackground>
      <View style={[styles.container, { paddingTop: insets.top + 60, paddingBottom: insets.bottom + 40 }]}>
        <View style={styles.logoContainer}>
          <CanstoryLogo width={180} height={180} />
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.welcomeText}>Bienvenue!</Text>
          <Text style={styles.subtitleText}>Explorez Canstory dès maintenant</Text>
        </View>
      </View>
    </AnimatedBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  logoContainer: {
    marginBottom: 50,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 80,
  },
  welcomeText: {
    fontSize: 48,
    fontWeight: '800',
    color: '#6a1b9a',
    marginBottom: 16,
  },
  subtitleText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#888',
    textAlign: 'center',
  },
});

export default WelcomeBackScreen;
