import React from 'react';
import { Image, View, StyleSheet, ImageSourcePropType } from 'react-native';

const canstoryLogo = require('../../assets/images/canstory_logo.png') as ImageSourcePropType;

interface CanstoryLogoProps {
  width?: number;
  height?: number;
  animated?: boolean;
}

const CanstoryLogo: React.FC<CanstoryLogoProps> = ({ width = 120, height = 120, animated = false }) => {
  return (
    <View style={[styles.container, { width, height }]}>
      <Image source={canstoryLogo} style={[styles.image, { width, height }]} resizeMode="contain" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
});

export default CanstoryLogo;
