import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ModernColors } from '../../constants/Colors';

interface GradientBackgroundProps {
  children: React.ReactNode;
  variant?: 'primary' | 'light' | 'warm';
  style?: ViewStyle;
}

export default function GradientBackground({
  children,
  variant = 'light',
  style,
}: GradientBackgroundProps) {
  const getGradientColors = (): [string, string] => {
    switch (variant) {
      case 'primary':
        return [ModernColors.gradientStart, ModernColors.gradientEnd];
      case 'light':
        return [ModernColors.gray[50], ModernColors.white];
      case 'warm':
        return ['#FEF7F0', '#FFFFFF'];
      default:
        return [ModernColors.gray[50], ModernColors.white];
    }
  };

  return (
    <LinearGradient
      colors={getGradientColors()}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.container, style]}
    >
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
