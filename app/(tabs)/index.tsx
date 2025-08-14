import { useRouter } from 'expo-router';
import { Text, View, ScrollView } from 'react-native';
import AnimatedButton from '@/components/ui/AnimatedButton';
import { GlobalStyles, Typography } from '@/constants/Styles';
import { Colors } from '@/constants/Colors';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <ScrollView style={GlobalStyles.screenWelcome}>
      <View style={styles.header}>
        <Text style={[GlobalStyles.appTitle, GlobalStyles.appTitleDark, styles.titleText]}>Market Sizing Interview Prep</Text>
        <Text style={[GlobalStyles.subtitle, GlobalStyles.subtitleDark, styles.subtitleText]}>Sharpen your skills with intuitive practice!</Text>
      </View>

      {/* Logo Placeholder */}
      <View style={styles.logoContainer}>
        <Text style={[Typography.sectionHeader, styles.logoText]}>Market Mentor</Text>
      </View>

      <View style={GlobalStyles.buttonsContainer}>
        <AnimatedButton
          title="Start Practice Session"
          variant="primary-dark"
          onPress={() => router.push({ pathname: '/question', params: { session: '1' } })}
        />
        
        <AnimatedButton
          title="View Analytics"
          variant="secondary-dark"
          onPress={() => router.push('/(tabs)/analytics')}
        />
      </View>
    </ScrollView>
  );
}

const styles = {
  header: {
    alignItems: 'center' as const,
    marginBottom: 32,
  },
  titleText: {
    fontFamily: 'Inter',
  },
  subtitleText: {
    fontFamily: 'Inter',
  },
  logoContainer: {
    alignItems: 'center' as const,
    marginBottom: 48,
    paddingVertical: 32,
  },
  logoText: {
    color: Colors.goldenYellow,
    fontFamily: 'Inter',
    letterSpacing: 1,
    opacity: 0.8,
  },
};