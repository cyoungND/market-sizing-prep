import { Dimensions, StyleSheet } from 'react-native';
import { Colors } from './Colors';

const { width, height } = Dimensions.get('window');

// Typography constants
export const Typography = {
  appTitle: {
    fontSize: 22,
    fontWeight: '600' as const,
    letterSpacing: -0.01,
    lineHeight: 28,
  },
  sectionHeader: {
    fontSize: 20,
    fontWeight: '700' as const,
    letterSpacing: -0.01,
    lineHeight: 24,
  },
  bodyText: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
  },
  smallText: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
  },
  buttonText: {
    fontSize: 11,
    fontWeight: '500' as const,
    letterSpacing: 0.005,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700' as const,
    letterSpacing: -0.02,
  },
  statLabel: {
    fontSize: 9,
    fontWeight: '600' as const,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.05,
  },
};

// Spacing constants
export const Spacing = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
};

// Component styles
export const GlobalStyles = StyleSheet.create({
  // Screen containers
  screenWelcome: {
    flex: 1,
    backgroundColor: Colors.bgDarkGreen,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xxl,
    paddingBottom: Spacing.lg,
  },
  screenQuestion: {
    flex: 1,
    backgroundColor: Colors.bgLightSage,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
  
  // Button base (micro button system)
  buttonMicro: {
    width: 140,
    height: 36,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: Spacing.xs,
  },
  
  // Button variants for dark backgrounds
  buttonPrimaryDark: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
  buttonSecondaryDark: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(233, 196, 106, 0.7)',
  },
  
  // Button variants for light backgrounds
  buttonPrimaryLight: {
    backgroundColor: Colors.primaryDark,
    shadowColor: Colors.primaryDark,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 2,
  },
  buttonSecondaryLight: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(42, 157, 143, 0.4)',
  },
  buttonTertiary: {
    backgroundColor: 'rgba(42, 157, 143, 0.08)',
  },
  
  // Text styles for buttons
  buttonTextPrimaryDark: {
    ...Typography.buttonText,
    color: Colors.primaryDark,
  },
  buttonTextSecondaryDark: {
    ...Typography.buttonText,
    color: Colors.goldenYellow,
  },
  buttonTextPrimaryLight: {
    ...Typography.buttonText,
    color: Colors.textPrimaryDark,
  },
  buttonTextSecondaryLight: {
    ...Typography.buttonText,
    color: Colors.secondaryTeal,
  },
  buttonTextTertiary: {
    ...Typography.buttonText,
    color: Colors.secondaryTeal,
  },
  
  // Cards
  cardOnDark: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 16,
    padding: Spacing.md,
  },
  cardOnLight: {
    backgroundColor: Colors.bgCardWhite,
    borderRadius: 16,
    padding: Spacing.md,
    shadowColor: Colors.primaryDark,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  
  // Quiz cards
  quizCard: {
    backgroundColor: Colors.bgCardWhite,
    borderWidth: 2,
    borderColor: '#e9ecef',
    borderRadius: 12,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    marginVertical: 6,
  },
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
  
  // Text styles
  appTitle: {
    ...Typography.appTitle,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  appTitleDark: {
    color: Colors.textPrimaryDark,
  },
  appTitleLight: {
    color: Colors.textPrimaryLight,
  },
  subtitle: {
    ...Typography.smallText,
    textAlign: 'center',
    marginBottom: Spacing.xxl,
    opacity: 0.8,
  },
  subtitleDark: {
    color: Colors.textSecondaryDark,
  },
  subtitleLight: {
    color: Colors.textSecondaryLight,
  },
  
  // Layout helpers
  centerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.xl,
    gap: 8,
  },
  statCard: {
    flex: 1,
    minWidth: 0,
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
  },
  buttonsContainer: {
    alignItems: 'center',
    gap: Spacing.sm,
  },
});