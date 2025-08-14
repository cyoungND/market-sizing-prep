import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
} from 'react-native-reanimated';
import { Colors } from '../../constants/Colors';
import { GlobalStyles } from '../../constants/Styles';

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

interface AnimatedQuizCardProps {
  children: React.ReactNode;
  onPress: () => void;
  isSelected?: boolean;
  isCorrect?: boolean | null;
  isIncorrect?: boolean | null;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export default function AnimatedQuizCard({
  children,
  onPress,
  isSelected = false,
  isCorrect = null,
  isIncorrect = null,
  disabled = false,
  style,
  textStyle,
}: AnimatedQuizCardProps) {
  const scale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const backgroundColor = useSharedValue('transparent');
  const borderColor = useSharedValue('#e9ecef');

  const animatedStyle = useAnimatedStyle(() => {
    // Determine background color priority: animation > selection > default
    let bgColor = Colors.bgCardWhite;
    if (isSelected) {
      bgColor = 'rgba(42, 157, 143, 0.05)'; // Light teal for selected
    }
    if (backgroundColor.value !== 'transparent') {
      bgColor = backgroundColor.value; // Animation overrides selection
    }

    // Determine border color priority: animation > selection > default  
    let bColor = '#e9ecef';
    if (isSelected) {
      bColor = Colors.secondaryTeal; // Teal border for selected
    }
    if (borderColor.value !== '#e9ecef') {
      bColor = borderColor.value; // Animation overrides selection
    }

    return {
      transform: [
        { scale: scale.value },
        { translateX: translateX.value },
      ],
      backgroundColor: bgColor,
      borderColor: bColor,
    };
  });



  const handlePressIn = () => {
    if (!disabled) {
      scale.value = withSpring(0.98);
    }
  };

  const handlePressOut = () => {
    if (!disabled) {
      scale.value = withSpring(1);
    }
  };

  const handlePress = () => {
    if (!disabled) {
      onPress();
    }
  };

  // Animate correct answer
  React.useEffect(() => {
    if (isCorrect) {
      // Flash green and bounce
      backgroundColor.value = withSequence(
        withTiming(Colors.secondaryTeal, { duration: 100 }),
        withTiming('transparent', { duration: 300 })
      );
      borderColor.value = withSequence(
        withTiming(Colors.secondaryTeal, { duration: 100 }),
        withTiming('#e9ecef', { duration: 300 })
      );
      scale.value = withSequence(
        withSpring(1.05),
        withSpring(1)
      );
    }
  }, [isCorrect]);

  // Animate incorrect answer
  React.useEffect(() => {
    if (isIncorrect) {
      // Shake horizontally and flash red
      backgroundColor.value = withSequence(
        withTiming(Colors.coralRed, { duration: 100 }),
        withTiming('transparent', { duration: 300 })
      );
      borderColor.value = withSequence(
        withTiming(Colors.coralRed, { duration: 100 }),
        withTiming('#e9ecef', { duration: 300 })
      );
      translateX.value = withSequence(
        withTiming(-10, { duration: 50 }),
        withTiming(10, { duration: 50 }),
        withTiming(-10, { duration: 50 }),
        withTiming(10, { duration: 50 }),
        withTiming(0, { duration: 50 })
      );
    }
  }, [isIncorrect]);

  return (
    <View style={styles.container}>
      <AnimatedTouchableOpacity
        style={[
          styles.card,
          animatedStyle,
          disabled && styles.disabled,
          style,
        ]}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        disabled={disabled}
        activeOpacity={1}
      >
        {typeof children === 'string' ? (
          <Text style={[styles.text, textStyle]}>{children}</Text>
        ) : (
          children
        )}
      </AnimatedTouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  card: {
    backgroundColor: Colors.bgCardWhite,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e9ecef',
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    marginVertical: 6,
  },
  selected: {
    borderColor: Colors.secondaryTeal,
    backgroundColor: 'rgba(42, 157, 143, 0.05)',
  },
  disabled: {
    opacity: 0.6,
  },
  text: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textPrimaryLight,
    textAlign: 'center',
    lineHeight: 18,
    flexWrap: 'wrap',
    width: '100%',
    fontFamily: 'Inter',
  },

});
