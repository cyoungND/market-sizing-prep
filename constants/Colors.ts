/**
 * Sophisticated color palette for Market Sizing Interview Prep
 * Earthy, professional colors designed for zen interview experience
 */

// Base Color Palette
const BaseColors = {
  // Main Brand Colors
  primaryDark: '#264653',    // Forest green - primary buttons, headers
  secondaryTeal: '#2a9d8f',  // Teal - accents, success states
  goldenYellow: '#e9c46a',   // Golden yellow - highlights, progress
  warmOrange: '#f4a261',     // Warm orange - accent elements
  coralRed: '#e76f51',       // Coral red - errors, incorrect answers
  
  // Background Colors
  bgDarkGreen: '#264653',    // Welcome/analytics screens
  bgLightSage: '#f0f4f3',    // Question/gameplay screens  
  bgCardWhite: '#ffffff',    // Card backgrounds
  bgLightGray: '#f8f9fa',    // Alternative light background
  
  // Text Colors
  textPrimaryLight: '#264653',              // Dark text on light backgrounds
  textPrimaryDark: '#ffffff',               // White text on dark backgrounds
  textSecondaryLight: '#6c757d',            // Secondary text on light
  textSecondaryDark: 'rgba(255, 255, 255, 0.75)', // Secondary text on dark
  
  // Legacy support (in case other components use these)
  primary: '#264653',
  secondary: '#2a9d8f', 
  success: '#2a9d8f',
  error: '#e76f51',
  warning: '#e9c46a',
  white: '#ffffff',
  black: '#000000',
};

// Theme-based color structure for app layout
const tintColorLight = '#2a9d8f';
const tintColorDark = '#e9c46a';

// Create Colors export with theme structure
export const Colors = {
  ...BaseColors,
  light: {
    text: '#000',
    background: '#fff',
    tint: tintColorLight,
    tabIconDefault: '#ccc',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#fff',
    background: '#000',
    tint: tintColorDark,
    tabIconDefault: '#ccc',
    tabIconSelected: tintColorDark,
  },
};

// Modern Color Palette (keeping the export name for compatibility)
export const ModernColors = {
  ...BaseColors,
  // Additional ModernColors properties that components expect
  gray: {
    50: '#f9fafb',
    200: '#e5e7eb',
    300: '#d1d5db',
    600: '#6b7280',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },
  white: '#ffffff',
  black: '#000000',
  primary: '#2a9d8f',
  gradientStart: '#2a9d8f',
  gradientEnd: '#e9c46a',
  correct: '#2a9d8f',
  correctLight: 'rgba(42, 157, 143, 0.1)',
  incorrect: '#e76f51',
  incorrectLight: 'rgba(231, 111, 81, 0.1)',
};

// Animation constants that components expect
export const Animations = {
  fast: 150,
  medium: 300,
  slow: 800,
  scaleTap: 0.95,
  scaleUp: 1.05,
  spring: { damping: 15, stiffness: 150 },
  bounce: { damping: 10, stiffness: 100 },
};

export default Colors;