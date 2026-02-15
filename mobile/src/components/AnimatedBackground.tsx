import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Animated, Dimensions } from 'react-native';

interface AnimatedBackgroundProps {
  children?: React.ReactNode;
}

const AnimatedBackground: React.FC<AnimatedBackgroundProps> = ({ children }) => {
  const { width, height } = Dimensions.get('window');
  
  const blob1Anim = useRef(new Animated.Value(0)).current;
  const blob2Anim = useRef(new Animated.Value(0)).current;
  const blob3Anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animateBlob = (animValue: Animated.Value, duration: number, delay: number) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(animValue, {
            toValue: 1,
            duration,
            useNativeDriver: true,
          }),
          Animated.timing(animValue, {
            toValue: 0,
            duration,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    animateBlob(blob1Anim, 8000, 0);
    animateBlob(blob2Anim, 10000, 2000);
    animateBlob(blob3Anim, 12000, 4000);
  }, [blob1Anim, blob2Anim, blob3Anim]);

  const blob1Transform = blob1Anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 30],
  });

  const blob2Transform = blob2Anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -40],
  });

  const blob3Transform = blob3Anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 25],
  });

  return (
    <View style={styles.container}>
      <View style={styles.background}>
        {/* Gradient background */}
        <View style={[styles.gradientBase, { backgroundColor: '#f3e5f5' }]} />
        
        {/* Animated blobs */}
        <Animated.View
          style={[
            styles.blob,
            styles.blob1,
            {
              transform: [
                { translateY: blob1Transform },
                { translateX: blob1Transform },
              ],
            },
          ]}
        />
        <Animated.View
          style={[
            styles.blob,
            styles.blob2,
            {
              transform: [
                { translateY: blob2Transform },
                { translateX: blob2Transform },
              ],
            },
          ]}
        />
        <Animated.View
          style={[
            styles.blob,
            styles.blob3,
            {
              transform: [
                { translateY: blob3Transform },
                { translateX: blob3Transform },
              ],
            },
          ]}
        />

        {/* Overlay for content */}
        <View style={styles.overlay} />
      </View>

      {/* Content */}
      <View style={styles.content}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  background: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  gradientBase: {
    ...StyleSheet.absoluteFillObject,
  },
  blob: {
    position: 'absolute',
    borderRadius: 9999,
    opacity: 0.15,
  },
  blob1: {
    width: 300,
    height: 300,
    backgroundColor: '#7b1fa2',
    top: -100,
    right: -50,
  },
  blob2: {
    width: 250,
    height: 250,
    backgroundColor: '#6a1b9a',
    bottom: -80,
    left: -60,
  },
  blob3: {
    width: 200,
    height: 200,
    backgroundColor: '#7b1fa2',
    top: '50%',
    right: '10%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(243, 229, 245, 0.4)',
  },
  content: {
    flex: 1,
    zIndex: 1,
  },
});

export default AnimatedBackground;
