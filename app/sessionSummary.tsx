import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity } from 'react-native';

export default function SessionSummary() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const correct = Number(params.correct || 0);
  const attempted = Number(params.attempted || 0);
  const total = Number(params.total || 0);
  const tries = params.tries ? JSON.parse(params.tries as string) : [];
  const accuracy = attempted > 0 ? Math.round((correct / attempted) * 100) : 0;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Practice Session Summary</Text>
      <Text style={styles.stat}>Questions Attempted: {attempted} / {total}</Text>
      <Text style={styles.stat}>Correct Answers: {correct}</Text>
      <Text style={styles.stat}>Accuracy: {accuracy}%</Text>
      <Text style={styles.stat}>Tries per Question:</Text>
      {tries.map((t: number, i: number) => (
        <Text key={i} style={styles.tries}>Q{i+1}: {t} tries</Text>
      ))}
      <TouchableOpacity style={styles.button} onPress={() => router.replace({ pathname: '/question', params: { session: '1' } })}>
        <Text style={styles.buttonText}>Restart Practice Session</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.button, { backgroundColor: '#aaa' }]} onPress={() => router.replace('/') }>
        <Text style={styles.buttonText}>Back to Home</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#f7fafc',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 18,
    textAlign: 'center',
  },
  stat: {
    fontSize: 18,
    marginBottom: 8,
    textAlign: 'center',
  },
  tries: {
    fontSize: 16,
    marginBottom: 2,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#3478f6',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 10,
    marginTop: 18,
    alignSelf: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
});
