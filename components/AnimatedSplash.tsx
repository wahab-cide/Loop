import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withTiming } from 'react-native-reanimated';

const DOT_COLOR = '#1ED760';
const DOT_SIZE = 10;
const DOT_SPACING = 12;
const ANIMATION_DURATION = 1600;

export default function AnimatedSplash({ onFinish }: { onFinish?: () => void }) {
  const [fontsLoaded] = useFonts({ 'Inter-Bold': require('../assets/fonts/Inter-Bold.ttf') });

  // Animation values for three dots
  const scales = [useSharedValue(1), useSharedValue(1), useSharedValue(1)];
  const opacities = [useSharedValue(0.5), useSharedValue(0.5), useSharedValue(0.5)];

  useEffect(() => {
    SplashScreen.hideAsync();
    // Animate dots sequentially
    scales.forEach((scale, i) => {
      scale.value = withDelay(
        i * 200,
        withRepeat(
          withTiming(1.5, { duration: ANIMATION_DURATION / 2, easing: Easing.inOut(Easing.ease) }, () => {
            scale.value = withTiming(1, { duration: ANIMATION_DURATION / 2, easing: Easing.inOut(Easing.ease) });
          }),
          -1,
          true
        )
      );
      opacities[i].value = withDelay(
        i * 200,
        withRepeat(
          withTiming(1, { duration: ANIMATION_DURATION / 2, easing: Easing.inOut(Easing.ease) }, () => {
            opacities[i].value = withTiming(0.5, { duration: ANIMATION_DURATION / 2, easing: Easing.inOut(Easing.ease) });
          }),
          -1,
          true
        )
      );
    });
  }, []);

  // Animated styles for dots
  const dotStyles = scales.map((scale, i) =>
    useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
      opacity: opacities[i].value,
    }), [scale, opacities[i]])
  );

  if (!fontsLoaded) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Loop</Text>
      <View style={styles.dotsRow}>
        {[0, 1, 2].map((i) => (
          <Animated.View
            key={i}
            style={[styles.dot, dotStyles[i], i !== 0 && { marginLeft: DOT_SPACING }]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0D0D',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: '#FFFFFF',
    fontFamily: 'Inter-Bold',
    fontSize: 48,
    marginBottom: 32,
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
    backgroundColor: DOT_COLOR,
  },
}); 