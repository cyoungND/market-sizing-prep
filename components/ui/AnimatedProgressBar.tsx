import React, { useEffect } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { ModernColors, Animations } from '../../constants/Colors';

interface AnimatedProgressBarProps {
  progress: number; // 0 to 1
  height?: number;
  style?: ViewStyle;
  animated?: boolean;
  showGradient?: boolean;
}

export default function AnimatedProgressBar({
  progress,
  height = 8,
  style,
  animated = true,
  showGradient = true,
}: AnimatedProgressBarProps) {
  const progressWidth = useSharedValue(0);
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value * 100}%`,
    transform: [{ scale: scale.value }],
  }));

  const containerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  useEffect(() => {
    if (animated) {
      // Animate progress from 0 to target value
      progressWidth.value = withTiming(progress, {
        duration: Animations.slow,
      });
      
      // Add a subtle pulse effect when progress updates
      scale.value = withSpring(1.02, Animations.spring, () => {
        scale.value = withSpring(1, Animations.spring);
      });
    } else {
      progressWidth.value = progress;
    }
  }, [progress, animated]);

  return (
    <Animated.View style={[styles.container, { height }, containerAnimatedStyle, style]}>
      <View style={[styles.track, { height }]} />
      <Animated.View style={[styles.progressContainer, { height }, animatedStyle]}>
        {showGradient ? (
          <LinearGradient
            colors={[ModernColors.gradientStart, ModernColors.gradientEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.progress, { height }]}
          />
        ) : (
          <View style={[styles.progress, styles.solidProgress, { height }]} />
        )}
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    width: '100%',
    borderRadius: 100,
    overflow: 'hidden',
  },
  track: {
    position: 'absolute',
    width: '100%',
    backgroundColor: ModernColors.gray[200],
    borderRadius: 100,
  },
  progressContainer: {
    position: 'absolute',
    borderRadius: 100,
    overflow: 'hidden',
  },
  progress: {
    width: '100%',
    borderRadius: 100,
  },
  solidProgress: {
    backgroundColor: ModernColors.primary,
  },
});
