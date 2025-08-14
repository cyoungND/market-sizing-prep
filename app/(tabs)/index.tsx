import { useRouter } from 'expo-router';
import { Text, View, ScrollView } from 'react-native';
import AnalyticsDashboard from '@/components/AnalyticsDashboard';
import AnimatedButton from '@/components/ui/AnimatedButton';
import { GlobalStyles, Typography } from '@/constants/Styles';
import { Colors } from '@/constants/Colors';

export default function HomeScreen() {
  const router = useRouter();

  const handleViewAnalytics = () => {
    router.push('/(tabs)/analytics');
  };

  return (
    <ScrollView style={GlobalStyles.screenWelcome}>
      <View style={styles.header}>
        <Text style={[GlobalStyles.appTitle, GlobalStyles.appTitleDark, styles.titleText]}>Market Sizing Interview Prep</Text>
        <Text style={[GlobalStyles.subtitle, GlobalStyles.subtitleDark, styles.subtitleText]}>Sharpen your skills with intuitive practice!</Text>
      </View>

      <View style={[GlobalStyles.cardOnDark, styles.analyticsContainer]}>
        <AnalyticsDashboard compact onViewDetails={handleViewAnalytics} />
      </View>

      <View style={GlobalStyles.buttonsContainer}>
        <AnimatedButton
          title="Start Practice Session"
          variant="primary-dark"
          onPress={() => router.push({ pathname: '/question', params: { session: '1' } })}
        />
        
        <AnimatedButton
          title="View Full Analytics"
          variant="secondary-dark"
          onPress={handleViewAnalytics}
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
  analyticsContainer: {
    marginBottom: 32,
  },
};