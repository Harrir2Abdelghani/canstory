import React, { useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, Text, Animated, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import NextButtonArrow from './components/NextButtonArrow';
import MyPressable from '../components/MyPressable';

interface Props {
  onNextClick: () => void;
  animationController: React.RefObject<Animated.Value>;
}

interface DotIndicatorProps {
  index: number;
  selectedIndex: number;
}

const DotIndicator: React.FC<DotIndicatorProps> = ({
  index,
  selectedIndex,
}) => {
  const activeIndexRef = useRef(new Animated.Value(0));

  useEffect(() => {
    Animated.timing(activeIndexRef.current, {
      toValue: index === selectedIndex ? 1 : 0,
      duration: 480,
      useNativeDriver: false,
    }).start();
  }, [selectedIndex, index]);

  const bgColor = activeIndexRef.current.interpolate({
    inputRange: [0, 1],
    outputRange: ['#E3E4E4', '#7b1fa2'],
  });

  return (
    <Animated.View
      style={[styles.pageIndicator, { backgroundColor: bgColor }]}
    />
  );
};

const CenterNextButton: React.FC<Props> = ({
  onNextClick,
  animationController,
}) => {
  const navigation = useNavigation();
  const opacity = useRef<Animated.Value>(new Animated.Value(0));
  const currentOpacity = useRef<number>(0);
  const authButtonsOpacity = useRef<Animated.Value>(new Animated.Value(0));
  const currentAuthOpacity = useRef<number>(0);

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showNextArrow, setShowNextArrow] = useState(true);

  const { bottom } = useSafeAreaInsets();
  const paddingBottom = 16 + bottom;

  const dots = useMemo(() => [0, 1, 2, 3], []);

  useEffect(() => {
    const listener = animationController.current.addListener(({ value }) => {
      const isVisible = value >= 0.2 && value <= 0.6;
      const showAuthButtons = value >= 0.7;
      const nextArrowVisible = value < 0.7;

      setShowNextArrow(nextArrowVisible);

      if (
        (isVisible && currentOpacity.current === 0) ||
        (!isVisible && currentOpacity.current === 1)
      ) {
        Animated.timing(opacity.current, {
          toValue: isVisible ? 1 : 0,
          duration: 480,
          useNativeDriver: true,
        }).start();
        currentOpacity.current = isVisible ? 1 : 0;
      }

      if (
        (showAuthButtons && currentAuthOpacity.current === 0) ||
        (!showAuthButtons && currentAuthOpacity.current === 1)
      ) {
        Animated.timing(authButtonsOpacity.current, {
          toValue: showAuthButtons ? 1 : 0,
          duration: 480,
          useNativeDriver: true,
        }).start();
        currentAuthOpacity.current = showAuthButtons ? 1 : 0;
      }

      if (value >= 0.7) {
        setSelectedIndex(3);
      } else if (value >= 0.5) {
        setSelectedIndex(2);
      } else if (value >= 0.3) {
        setSelectedIndex(1);
      } else if (value >= 0.1) {
        setSelectedIndex(0);
      }
    });

    return () => {
      animationController.current.removeListener(listener);
    };
  }, [animationController]);

  const topViewAnim = animationController.current.interpolate({
    inputRange: [0, 0.2, 0.4, 0.6, 0.8],
    outputRange: [96 * 5, 0, 0, 0, 0],
  });
  const loginTextMoveAnimation = animationController.current.interpolate({
    inputRange: [0, 0.2, 0.4, 0.6, 0.8],
    outputRange: [30 * 5, 30 * 5, 30 * 5, 30 * 5, 0],
  });

  return (
    <Animated.View
      style={[
        styles.container,
        { paddingBottom, transform: [{ translateY: topViewAnim }] },
      ]}
    >
      <Animated.View
        style={[styles.dotsContainer, { opacity: opacity.current }]}
      >
        {dots.map(item => (
          <DotIndicator
            key={item}
            index={item}
            {...{ selectedIndex, animationController }}
          />
        ))}
      </Animated.View>

      {showNextArrow && (
        <NextButtonArrow {...{ animationController }} onBtnPress={onNextClick} />
      )}

      <Animated.View
        style={[
          styles.authButtonsContainer,
          { opacity: authButtonsOpacity.current },
        ]}
      >
        <MyPressable
          style={styles.signInAuthButton}
          android_ripple={{ color: '#f3e5f5' }}
          onPress={() => navigation.navigate('SignIn' as never)}
        >
          <Text style={styles.signInAuthButtonText}>Se connecter</Text>
        </MyPressable>

        <MyPressable
          style={styles.signUpAuthButton}
          android_ripple={{ color: '#6a1b9a' }}
          onPress={() => navigation.navigate('SignUp' as never)}
        >
          <Text style={styles.signUpAuthButtonText}>S'inscrire</Text>
        </MyPressable>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  dotsContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  pageIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    margin: 4,
  },
  footerTextContainer: {
    flexDirection: 'row',
    marginTop: 8,
  },
  loginText: {
    color: '#7b1fa2',
    fontSize: 16,
    fontWeight: '700',
  },
  authButtonsContainer: {
    flexDirection: 'column',
    gap: 12,
    marginTop: 16,
    paddingHorizontal: 20,
    width: '100%',
    justifyContent: 'center',
  },
  signUpAuthButton: {
    backgroundColor: '#7b1fa2',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    width: '100%',
  },
  signUpAuthButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  signInAuthButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#7b1fa2',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    width: '100%',
  },
  signInAuthButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#7b1fa2',
  },
});

export default CenterNextButton;
