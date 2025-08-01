import { useRouter } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View, ScrollView } from 'react-native';
import AnalyticsDashboard from '@/components/AnalyticsDashboard';

export default function HomeScreen() {
  const router = useRouter();

  const handleViewAnalytics = () => {
    router.push('/(tabs)/analytics');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.title}>Market Sizing Interview Prep</Text>
        <Text style={styles.subtitle}>Sharpen your skills with intuitive practice!</Text>
      </View>

      <AnalyticsDashboard compact onViewDetails={handleViewAnalytics} />

      <TouchableOpacity 
        style={styles.button} 
        onPress={() => router.push({ pathname: '/question', params: { session: '1' } })}
      >
        <Text style={styles.buttonText}>Start Practice Session</Text>
      </TouchableOpacity>

      <View style={styles.quickActions}>
        <TouchableOpacity 
          style={styles.secondaryButton} 
          onPress={handleViewAnalytics}
        >
          <Text style={styles.secondaryButtonText}>View Full Analytics</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7fafc',
  },
  contentContainer: {
    padding: 24,
    paddingTop: 60,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#222',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 20,
    color: '#555',
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#3478f6',
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
    marginVertical: 16,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    textAlign: 'center',
  },
  quickActions: {
    marginTop: 16,
    gap: 12,
  },
  secondaryButton: {
    backgroundColor: '#fff',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#3478f6',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  secondaryButtonText: {
    color: '#3478f6',
    fontWeight: '600',
    fontSize: 16,
    textAlign: 'center',
  },
});