import React from 'react';
import { TouchableOpacity, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { ModernColors, Animations } from '../../constants/Colors';

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

interface AnimatedIconProps {
  name: keyof typeof Ionicons.glyphMap;
  size?: number;
  color?: string;
  onPress?: () => void;
  style?: ViewStyle;
  disabled?: boolean;
}

export default function AnimatedIcon({
  name,
  size = 24,
  color = ModernColors.gray[600],
  onPress,
  style,
  disabled = false,
}: AnimatedIconProps) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const handlePressIn = () => {
    if (!disabled && onPress) {
      scale.value = withSpring(Animations.scaleTap, Animations.spring);
      opacity.value = withTiming(0.7, { duration: Animations.fast });
    }
  };

  const handlePressOut = () => {
    if (!disabled && onPress) {
      scale.value = withSpring(1, Animations.spring);
      opacity.value = withTiming(1, { duration: Animations.fast });
    }
  };

  const handleHoverIn = () => {
    if (!disabled && onPress) {
      scale.value = withSpring(Animations.scaleUp, Animations.spring);
    }
  };

  const handleHoverOut = () => {
    if (!disabled && onPress) {
      scale.value = withSpring(1, Animations.spring);
    }
  };

  if (onPress) {
    return (
      <AnimatedTouchableOpacity
        style={[animatedStyle, style]}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
        disabled={disabled}
        activeOpacity={1}
      >
        <Ionicons name={name} size={size} color={color} />
      </AnimatedTouchableOpacity>
    );
  }

  return (
    <Animated.View style={[animatedStyle, style]}>
      <Ionicons name={name} size={size} color={color} />
    </Animated.View>
  );
}
