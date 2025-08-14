import React, { useRef } from 'react';
import { Animated, Text, TouchableOpacity } from 'react-native';
import { GlobalStyles } from '../../constants/Styles';

interface AnimatedButtonProps {
  title: string;
  onPress?: () => void;
  variant?: 'primary-dark' | 'secondary-dark' | 'primary-light' | 'secondary-light' | 'tertiary';
  style?: object;
}

export default function AnimatedButton({ 
  title, 
  onPress, 
  variant = 'primary-light',
  style = {}
}: AnimatedButtonProps) {
  const scaleValue = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.98,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const getButtonStyle = () => {
    const baseStyle = [GlobalStyles.buttonMicro];
    
    switch (variant) {
      case 'primary-dark':
        return [...baseStyle, GlobalStyles.buttonPrimaryDark, style];
      case 'secondary-dark':
        return [...baseStyle, GlobalStyles.buttonSecondaryDark, style];
      case 'primary-light':
        return [...baseStyle, GlobalStyles.buttonPrimaryLight, style];
      case 'secondary-light':
        return [...baseStyle, GlobalStyles.buttonSecondaryLight, style];
      case 'tertiary':
        return [...baseStyle, GlobalStyles.buttonTertiary, style];
      default:
        return [...baseStyle, GlobalStyles.buttonPrimaryLight, style];
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case 'primary-dark':
        return GlobalStyles.buttonTextPrimaryDark;
      case 'secondary-dark':
        return GlobalStyles.buttonTextSecondaryDark;
      case 'primary-light':
        return GlobalStyles.buttonTextPrimaryLight;
      case 'secondary-light':
        return GlobalStyles.buttonTextSecondaryLight;
      case 'tertiary':
        return GlobalStyles.buttonTextTertiary;
      default:
        return GlobalStyles.buttonTextPrimaryLight;
    }
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
      <TouchableOpacity
        style={getButtonStyle()}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.8}
      >
        <Text style={getTextStyle()}>
          {title}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}