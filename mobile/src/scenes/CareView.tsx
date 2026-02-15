import React, { useRef } from 'react';
import { StyleSheet, Text, Animated, useWindowDimensions } from 'react-native';

interface Props {
  animationController: React.RefObject<Animated.Value>;
}

const IMAGE_WIDTH = 350;
const IMAGE_HEIGHT = 250;

const CareView: React.FC<Props> = ({ animationController }) => {
  const window = useWindowDimensions();

  const careRef = useRef<Text | null>(null);

  const slideAnim = animationController.current.interpolate({
    inputRange: [0, 0.2, 0.4, 0.6, 0.8],
    outputRange: [window.width, window.width, 0, -window.width, -window.width],
  });

  const careEndVal = 26 * 2;
  const careAnim = animationController.current.interpolate({
    inputRange: [0, 0.2, 0.4, 0.6, 0.8],
    outputRange: [careEndVal, careEndVal, 0, -careEndVal, -careEndVal],
  });

  const imageEndVal = IMAGE_WIDTH * 4;
  const imageAnim = animationController.current.interpolate({
    inputRange: [0, 0.2, 0.4, 0.6, 0.8],
    outputRange: [imageEndVal, imageEndVal, 0, -imageEndVal, -imageEndVal],
  });

  return (
    <Animated.View
      style={[styles.container, { transform: [{ translateX: slideAnim }] }]}
    >
      <Animated.View
        style={[
          styles.image,
          { transform: [{ translateX: imageAnim }] },
        ]}
      >
        <Text style={{ fontSize: 100 }}>⚗️</Text>
      </Animated.View>
      <Animated.Text
        style={[styles.title, { transform: [{ translateX: careAnim }] }]}
        ref={careRef}
      >
        Professionnels
      </Animated.Text>
      <Text style={styles.subtitle}>
        Connectez-vous avec des médecins,{'\n'}pharmaciens et centres spécialisés{'\n'}par wilaya
      </Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingBottom: 100,
  },
  image: {
    maxWidth: 350,
    maxHeight: 250,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    color: '#6a1b9a',
    fontSize: 26,
    textAlign: 'center',
    fontWeight: '700',
  },
  subtitle: {
    color: '#666',
    textAlign: 'center',
    fontWeight: '400',
    paddingHorizontal: 64,
    paddingVertical: 16,
  },
});

export default CareView;
