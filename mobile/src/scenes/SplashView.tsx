import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Animated,
  useWindowDimensions,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MyPressable from '../components/MyPressable';
import CanstoryLogo from '../components/CanstoryLogo';
import { useLanguage } from '../contexts/LanguageContext';

interface Props {
  onNextClick: () => void;
  animationController: React.RefObject<Animated.Value>;
}

const SplashView: React.FC<Props> = ({ onNextClick, animationController }) => {
  const window = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { t } = useLanguage();

  const splashTranslateY = animationController.current.interpolate({
    inputRange: [0, 0.2, 0.8],
    outputRange: [0, -window.height, -window.height],
  });

  return (
    <Animated.View
      style={{ flex: 1, transform: [{ translateY: splashTranslateY }] }}
    >
      <LinearGradient
        colors={['#e6a3e9ff', '#ffffff']}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ paddingTop: 80 }}
          alwaysBounceVertical={false}
        >
          <View style={styles.logoContainer}>
            <CanstoryLogo width={150} height={150} />
          </View>

          <Text style={styles.title}>{t('splash_title')}</Text>

          <Text style={styles.subtitle}>
            {t('splash_subtitle')}
          </Text>

          <View style={styles.featuresContainer}>
            <Text style={styles.featureItem}>{t('splash_feature1')}</Text>
            <Text style={styles.featureItem}>{t('splash_feature2')}</Text>
            <Text style={styles.featureItem}>{t('splash_feature3')}</Text>
          </View>

          <Text style={styles.algeriaText}>
            {t('splash_algeria')}
          </Text>
        </ScrollView>

        <View style={[styles.footer, { paddingBottom: 16 + insets.bottom }]}>
          <Text style={styles.trustText}>
            {t('splash_footer')}
          </Text>

          <MyPressable
            style={styles.button}
            android_ripple={{ color: '#ce93d8' }}
            touchOpacity={0.7}
            onPress={onNextClick}
          >
            <Text style={styles.buttonText}>{t('splash_button')}</Text>
          </MyPressable>
        </View>
      </LinearGradient>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    textAlign: 'center',
    color: '#4a148c',
    letterSpacing: 1,
  },
  subtitle: {
    textAlign: 'center',
    marginTop: 10,
    paddingHorizontal: 30,
    fontSize: 16,
    color: '#444',
    lineHeight: 22,
  },
  featuresContainer: {
    marginTop: 30,
    paddingHorizontal: 30,
  },
  featureItem: {
    fontSize: 14,
    marginBottom: 10,
    color: '#555',
  },
  algeriaText: {
    textAlign: 'center',
    marginTop: 25,
    fontSize: 14,
    fontWeight: '500',
    color: '#7b1fa2',
  },
  footer: {
    alignItems: 'center',
  },
  trustText: {
    fontSize: 12,
    marginBottom: 14,
    color: '#777',
  },
  button: {
    height: 58,
    backgroundColor: '#7b1fa2',
    paddingHorizontal: 70,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 32,
    elevation: 3,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
  },
});

export default SplashView;
