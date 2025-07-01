import React, { useEffect, useRef } from 'react';
import { Animated, Image, StyleSheet } from 'react-native';

const splashBg = require('../assets/images/splash.png');

export default function AnimatedSplash({ onFinish }: { onFinish?: () => void }) {
  const splashOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Fade out splash after a short delay
    setTimeout(() => {
      Animated.timing(splashOpacity, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }).start(() => {
        if (onFinish) onFinish();
      });
    }, 1200);
  }, []);

  return (
    <Animated.View style={[styles.container, { opacity: splashOpacity }]}>      
      <Image source={splashBg} style={styles.bg} resizeMode="cover" />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0D0D0D',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
  },
  bg: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
}); 