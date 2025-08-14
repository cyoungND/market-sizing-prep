# Market Sizing Interview Prep - iOS App Style Guide

## Design Philosophy
Professional, zen-like interview preparation app with sophisticated entry experience that transitions to calming practice environment. NYT Connections-inspired micro-interactions with tiny, delicate UI elements. Built for iOS using React Native/Expo.

## Color System
```typescript
export const Colors = {
  // Primary Colors
  primaryDark: '#264653',
  secondaryTeal: '#2a9d8f', 
  goldenYellow: '#e9c46a',
  warmOrange: '#f4a261',
  coralRed: '#e76f51',
  
  // Background Colors
  bgDarkGreen: '#264653', // welcome/analytics screens
  bgLightSage: '#f0f4f3', // question/gameplay screens
  bgCardWhite: '#ffffff',
  bgLightGray: '#f8f9fa',
  
  // Text Colors
  textPrimaryLight: '#264653', // on light backgrounds
  textPrimaryDark: '#ffffff',  // on dark backgrounds
  textSecondaryLight: '#6c757d',
  textSecondaryDark: 'rgba(255, 255, 255, 0.75)',
};
```

## Typography System
**Font Family: Inter (loaded via Expo Google Fonts)**
```bash
npx expo install expo-font @expo-google-fonts/inter
```

### Font Imports Required:
```typescript
import { 
  Inter_400Regular, 
  Inter_500Medium, 
  Inter_600SemiBold, 
  Inter_700Bold 
} from '@expo-google-fonts/inter';
```

### Typography Constants:
```typescript
export const Typography = {
  appTitle: {
    fontSize: 22,
    fontWeight: '600',
    letterSpacing: -0.01,
    lineHeight: 28,
    fontFamily: 'Inter_600SemiBold',
  },
  sectionHeader: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.01,
    lineHeight: 24,
    fontFamily: 'Inter_700Bold',
  },
  bodyText: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
    fontFamily: 'Inter_400Regular',
  },
  smallText: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
    fontFamily: 'Inter_400Regular',
  },
  buttonText: {
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 0.005,
    fontFamily: 'Inter_500Medium',
  },
  statNumber: {
    fontSize: 20, // Reduced from 24 for mobile fit
    fontWeight: '700',
    letterSpacing: -0.02,
    fontFamily: 'Inter_700Bold',
  },
  statLabel: {
    fontSize: 9, // Reduced from 11 for mobile fit
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.05,
    fontFamily: 'Inter_600SemiBold',
  },
};
```

## Screen Background System

### Screen Types & Styling

**Dark Green Screens (Welcome/Analytics):**
```typescript
screenWelcome: {
  flex: 1,
  backgroundColor: Colors.bgDarkGreen,
  paddingHorizontal: 24,
  paddingTop: 40,
  paddingBottom: 24,
},
```
*Text colors: Colors.textPrimaryDark, Colors.textSecondaryDark*

**Light Sage Screens (Questions/Practice):**
```typescript
screenQuestion: {
  flex: 1,
  backgroundColor: Colors.bgLightSage,
  paddingHorizontal: 24,
  paddingTop: 24,
  paddingBottom: 24,
},
```
*Text colors: Colors.textPrimaryLight, Colors.textSecondaryLight*

### Card Styling by Background

**Cards on Dark Green:**
```typescript
cardOnDark: {
  backgroundColor: 'rgba(255, 255, 255, 0.15)',
  borderWidth: 1,
  borderColor: 'rgba(255, 255, 255, 0.25)',
  borderRadius: 16,
  padding: 16,
  // Glassmorphism effect
},
```

**Cards on Light Sage:**
```typescript
cardOnLight: {
  backgroundColor: Colors.bgCardWhite,
  borderRadius: 16,
  padding: 16,
  shadowColor: Colors.primaryDark,
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.08,
  shadowRadius: 3,
  elevation: 2, // Android shadow
},
```

## Button System (Micro Buttons)

### Base Button Specifications
**All buttons: 140px width × 36px height × 16px borderRadius**

```typescript
buttonMicro: {
  width: 140,
  height: 36,
  borderRadius: 16,
  alignItems: 'center',
  justifyContent: 'center',
  marginVertical: 8,
},
```

### Button Variants

**Primary Button (Dark Screens):**
```typescript
buttonPrimaryDark: {
  backgroundColor: 'rgba(255, 255, 255, 0.9)',
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.15,
  shadowRadius: 3,
  elevation: 2,
},
// Text color: Colors.primaryDark
```

**Primary Button (Light Screens):**
```typescript
buttonPrimaryLight: {
  backgroundColor: Colors.primaryDark,
  shadowColor: Colors.primaryDark,
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.12,
  shadowRadius: 3,
  elevation: 2,
},
// Text color: Colors.textPrimaryDark (white)
```

**Secondary Button (Dark Screens):**
```typescript
buttonSecondaryDark: {
  backgroundColor: 'transparent',
  borderWidth: 1,
  borderColor: 'rgba(233, 196, 106, 0.7)',
},
// Text color: Colors.goldenYellow
```

**Secondary Button (Light Screens):**
```typescript
buttonSecondaryLight: {
  backgroundColor: 'transparent',
  borderWidth: 1,
  borderColor: 'rgba(42, 157, 143, 0.4)',
},
// Text color: Colors.secondaryTeal
```

**Tertiary/Small Button:**
```typescript
buttonTertiary: {
  backgroundColor: 'rgba(42, 157, 143, 0.08)',
},
// Text color: Colors.secondaryTeal
```

### Button Animations (React Native)
```typescript
// Press animation
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
```

## Quiz Card Components

### Quiz Selection Cards
```typescript
quizCard: {
  backgroundColor: Colors.bgCardWhite,
  borderWidth: 2,
  borderColor: '#e9ecef',
  borderRadius: 12,
  height: 64,
  alignItems: 'center',
  justifyContent: 'center',
  paddingHorizontal: 10,
  marginVertical: 6,
},
```

**Card States:**
```typescript
quizCardSelected: {
  borderColor: Colors.secondaryTeal,
  backgroundColor: 'rgba(42, 157, 143, 0.05)',
},
quizCardCorrect: {
  backgroundColor: Colors.secondaryTeal,
  borderColor: Colors.secondaryTeal,
},
quizCardIncorrect: {
  backgroundColor: Colors.coralRed,
  borderColor: Colors.coralRed,
},
```

**Text Styling:**
```typescript
quizCardText: {
  fontSize: 15,
  fontWeight: '600',
  color: Colors.textPrimaryLight,
  textAlign: 'center',
  lineHeight: 20,
  fontFamily: 'Inter_600SemiBold',
},
quizCardTextSelected: {
  color: Colors.textPrimaryLight,
},
quizCardTextCorrect: {
  color: Colors.textPrimaryDark, // white
},
quizCardTextIncorrect: {
  color: Colors.textPrimaryDark, // white
},
```

## Progress Elements

### Progress Bar
```typescript
progressContainer: {
  height: 4,
  backgroundColor: '#e9ecef',
  borderRadius: 2,
  marginVertical: 8,
  overflow: 'hidden',
},
progressFill: {
  height: '100%',
  backgroundColor: Colors.secondaryTeal, // or gradient if supported
  borderRadius: 2,
},
```

<!-- 
### Status Badge (Future Feature - Analytics Phase)
```typescript
statusBadge: {
  backgroundColor: Colors.secondaryTeal,
  paddingHorizontal: 14,
  paddingVertical: 6,
  borderRadius: 16,
  alignItems: 'center',
  justifyContent: 'center',
  shadowColor: Colors.secondaryTeal,
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.2,
  shadowRadius: 6,
  elevation: 3,
},
statusBadgeText: {
  fontSize: 11,
  fontWeight: '600',
  color: Colors.textPrimaryDark,
  fontFamily: 'Inter_600SemiBold',
},
```
Note: Status badge for showing performance trends like "Improving", "Consistent", etc. 
Visual design is complete but analytics logic needs to be implemented in future phase.
-->

## Layout & Spacing

### Spacing Constants
```typescript
export const Spacing = {
  xs: 8,   // 8px
  sm: 12,  // 12px  
  md: 16,  // 16px
  lg: 24,  // 24px
  xl: 32,  // 32px
  xxl: 40, // 40px
};
```

### Screen Layout Structures

**Welcome Screen Layout:**
```typescript
// Container: GlobalStyles.screenWelcome
// - App title (Typography.appTitle + textPrimaryDark)
// - Subtitle (Typography.smallText + textSecondaryDark)  
// - 40px margin
// - Stats grid (flexDirection: 'row', gap: 12)
// - 32px margin
// <!-- Status badge (centered) - Future Feature -->
// <!-- 32px margin -->
// - Primary button (variant: primary-dark)
// - 16px margin
// - Secondary button (variant: secondary-dark)
```

**Question Screen Layout:**
```typescript
// Container: GlobalStyles.screenQuestion
// - Back button (top left, variant: tertiary)
// - 16px margin
// - Question title (Typography.sectionHeader + textPrimaryLight)
// - Progress indicator text
// - Progress bar component
// - 24px margin
// - Quiz cards (2-column grid with 12px gap)
// - 24px margin
// - Primary action button (variant: primary-light)
// - 16px margin
// - Secondary action button (variant: secondary-light)
```

## React Native Implementation Notes

### File Structure
```
constants/
  Styles.ts          // All colors, typography, spacing
components/
  AnimatedButton.tsx // Micro button component
  ScreenContainer.tsx // Background containers
  QuizCard.tsx       // Interactive selection cards
```

### Key React Native Patterns
- **Use StyleSheet.create()** for all styling
- **TouchableOpacity** for all interactive elements
- **Animated.View** for micro-interactions
- **flexDirection: 'row'** for horizontal layouts
- **Shadow properties** differ iOS vs Android (elevation)
- **Font loading** via Expo Google Fonts

### Animation Considerations
- **Use native driver** for transforms (scale, translate)
- **Spring animations** for button presses
- **Timing animations** for state changes
- **LayoutAnimation** for card flips/reveals

### Responsive Design
- **Use Dimensions.get('window')** for screen size
- **Percentage widths** for flexible layouts
- **Maintain 140px button width** across all screen sizes
- **Scale fonts** only if absolutely necessary

## Accessibility (iOS)

### Required Properties
```typescript
// Buttons
accessibilityRole="button"
accessibilityLabel="Start practice session"
accessibilityHint="Begins a new practice session"

// Cards  
accessibilityRole="button"
accessibilityState={{ selected: isSelected }}
accessibilityLabel="Quiz option: Percentage of households"
```

### Focus Management
- **Use accessible={true}** for interactive elements
- **Proper navigation order** with accessibilityElementsHidden
- **VoiceOver support** with clear labels

---

*This style guide is specifically designed for iOS development using React Native/Expo. All measurements are in React Native units (not pixels), and styling follows React Native conventions.*