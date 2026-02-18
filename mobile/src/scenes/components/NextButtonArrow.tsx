import React, { useRef } from 'react';
import { StyleSheet, Text, Animated } from 'react-native';
import MyPressable from '../../components/MyPressable';

interface Props {
  onBtnPress: () => void;
  animationController: React.MutableRefObject<Animated.Value>;
}

const NextButtonArrow: React.FC<Props> = ({
  onBtnPress,
  animationController,
}) => {
  const arrowAnim = useRef<Animated.AnimatedInterpolation<number>>(
    new Animated.Value(0),
  );

  arrowAnim.current = animationController.current.interpolate({
    inputRange: [0, 0.2, 0.4, 0.6, 0.8],
    outputRange: [0, 0, 0, 0, 1],
  });

  const transitionAnim = arrowAnim.current.interpolate({
    inputRange: [0, 0.85, 1],
    outputRange: [36, 0, 0],
  });
  const opacityAnim = arrowAnim.current.interpolate({
    inputRange: [0, 0.7, 0.75, 1],
    outputRange: [0, 0, 1, 0],
  });
  const iconTransitionAnim = arrowAnim.current.interpolate({
    inputRange: [0, 0.35, 0.85, 1],
    outputRange: [0, 0, -36, -36],
  });
  const iconOpacityAnim = arrowAnim.current.interpolate({
    inputRange: [0, 0.7, 0.75, 1],
    outputRange: [1, 0, 0, 0],
  });

  const widthAnim = arrowAnim.current.interpolate({
    inputRange: [0, 1],
    outputRange: [58, 258],
  });

  const marginBottomAnim = arrowAnim.current.interpolate({
    inputRange: [0, 1],
    outputRange: [38, 0],
  });

  const radiusAnim = arrowAnim.current.interpolate({
    inputRange: [0, 1],
    outputRange: [40, 8],
  });

  return (
    <Animated.View
      style={[
        styles.container,
        {
          width: widthAnim,
          borderRadius: radiusAnim,
          marginBottom: marginBottomAnim,
        },
      ]}
    >
      <MyPressable
        style={{ flex: 1, justifyContent: 'center' }}
        android_ripple={{ color: 'darkgrey' }}
        onPress={() => onBtnPress()}
      >
        <Animated.View
          style={[
            styles.signupContainer,
            {
              opacity: opacityAnim,
              transform: [{ translateY: transitionAnim }],
            },
          ]}
        >
          <Text style={styles.signupText}>Se connecter</Text>
          <Text style={{ fontSize: 24, color: 'white' }}>→</Text>
        </Animated.View>
        

        <Animated.Text
          style={[
            styles.icon,
            {
              opacity: iconOpacityAnim,
              transform: [{ translateY: iconTransitionAnim }],
            },
          ]}
        >
          →
        </Animated.Text>
        
      </MyPressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 58,
    backgroundColor: '#7b1fa2',
    overflow: 'hidden',
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  signupText: {
    fontSize: 18,
    fontWeight: '500',
    color: 'white',
  },
  icon: {
    position: 'absolute',
    alignSelf: 'center',
    fontSize: 24,
    color: 'white',
  },
});

export default NextButtonArrow;
