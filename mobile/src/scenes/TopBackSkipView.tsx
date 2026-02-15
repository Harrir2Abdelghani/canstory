import React from 'react';
import { StyleSheet, Text, Animated, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MyPressable from '../components/MyPressable';
import Config from '../Config';

interface Props {
  onBackClick: () => void;
  onSkipClick: () => void;
  animationController: React.RefObject<Animated.Value>;
}

const TopBackSkipView: React.FC<Props> = ({
  onBackClick,
  onSkipClick,
  animationController,
}) => {
  const { top } = useSafeAreaInsets();
  const marginTop = Config.isIos ? top : StatusBar.currentHeight;

  const headerTranslateY = animationController.current.interpolate({
    inputRange: [0, 0.2, 0.4, 0.6, 0.8],
    outputRange: [-(58 + (marginTop ?? 0)), 0, 0, 0, 0],
  });
  const skipAnim = animationController.current.interpolate({
    inputRange: [0, 0.2, 0.4, 0.6, 0.8],
    outputRange: [0, 0, 0, 0, 80],
  });

  return (
    <Animated.View
      style={[
        styles.buttonContainer,
        { marginTop, transform: [{ translateY: headerTranslateY }] },
      ]}
    >
      <MyPressable
        style={styles.backBtn}
        android_ripple={{ color: 'darkgrey', borderless: true, radius: 28 }}
        onPress={() => onBackClick()}
      >
        <Text style={{ fontSize: 24, color: '#7b1fa2' }}>←</Text>
      </MyPressable>

      <Animated.View style={{ transform: [{ translateX: skipAnim }] }}>
        <MyPressable
          android_ripple={{ color: 'darkgrey', borderless: true, radius: 28 }}
          onPress={() => onSkipClick()}
        >
          <Text style={{ color: '#7b1fa2', fontWeight: '600' }}>
            Skip
          </Text>
        </MyPressable>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    height: 58,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: 8,
    paddingRight: 16,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  backBtn: {
    width: 56,
    height: 56,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default TopBackSkipView;
