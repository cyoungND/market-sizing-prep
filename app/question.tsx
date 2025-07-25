import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { FlatList, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import questions from '../assets/questions.json';

// Helper to shuffle array
function shuffle(array: any[]) {
  const arr = array.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

const numColumns = 2;

export default function QuestionScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const isSession = params.session === '1';

  // Session state
  const [sessionQuestions, setSessionQuestions] = useState<any[]>([]);
  const [current, setCurrent] = useState(0);
  const [shuffled, setShuffled] = useState([] as typeof questions[0]['components']);
  const [selected, setSelected] = useState<number[]>([]);
  const [tries, setTries] = useState(0);
  const [showResult, setShowResult] = useState<'none' | 'correct' | 'fail' | 'explanation'>('none');
  const [feedback, setFeedback] = useState('');
  // Performance tracking
  const [numCorrect, setNumCorrect] = useState(0);
  const [numAttempted, setNumAttempted] = useState(0);
  const [triesPerQuestion, setTriesPerQuestion] = useState<number[]>([]);

  // On mount: if session, shuffle questions for this session
  useEffect(() => {
    if (isSession) {
      const shuffledQs = shuffle(questions);
      setSessionQuestions(shuffledQs);
      setCurrent(0);
      setNumCorrect(0);
      setNumAttempted(0);
      setTriesPerQuestion([]);
    } else {
      setSessionQuestions(questions);
      setCurrent(0);
    }
  }, [isSession]);

  // Shuffle components on question change
  useEffect(() => {
    if (sessionQuestions.length > 0) {
      setShuffled(shuffle(sessionQuestions[current].components));
      setSelected([]);
      setTries(0);
      setShowResult('none');
      setFeedback('');
    }
  }, [current, sessionQuestions]);

  if (sessionQuestions.length === 0) {
    return <View style={styles.container}><Text>Loading questions...</Text></View>;
  }

  const handleCheck = () => {
    const correctIndices = shuffled
      .map((c, i) => (c.correct ? i : null))
      .filter(i => i !== null);
    const selectedCorrect = selected.filter(i => shuffled[i].correct);
    const selectedWrong = selected.filter(i => !shuffled[i].correct);
    const allCorrect =
      selectedCorrect.length === correctIndices.length &&
      selectedWrong.length === 0;
    if (allCorrect) {
      setShowResult('correct');
      setFeedback('Great job!');
      if (isSession) {
        setNumCorrect(n => n + 1);
        setNumAttempted(n => n + 1);
        setTriesPerQuestion(arr => [...arr, tries + 1]);
      }
    } else {
      if (tries < 2) {
        setTries(tries + 1);
        setFeedback('Incorrect, try again!');
      } else {
        setShowResult('fail');
        setFeedback('Here are the correct answers:');
        if (isSession) {
          setNumAttempted(n => n + 1);
          setTriesPerQuestion(arr => [...arr, tries + 1]);
        }
      }
    }
  };

  const goToNext = () => {
    if (current < sessionQuestions.length - 1) {
      setCurrent(current + 1);
    } else if (isSession) {
      // End of session: go to summary
      router.replace({ pathname: '/sessionSummary', params: {
        correct: numCorrect.toString(),
        attempted: numAttempted.toString(),
        total: sessionQuestions.length.toString(),
        tries: JSON.stringify(triesPerQuestion),
      }});
    } else {
      setCurrent(0);
    }
  };

  // Show explanation screen after correct or fail
  if (showResult === 'explanation') {
    const q = sessionQuestions[current];
    return (
      <ScrollView contentContainerStyle={styles.explanationContainer}>
        <Text style={styles.prompt}>{q.prompt}</Text>
        <Text style={styles.explanationTitle}>Framework Explanations</Text>
        {q.components
          .filter(c => c.text && c.text.trim() !== '' && c.text.trim() !== '-')
          .map((c, idx) => (
            <View key={idx} style={[styles.explanationBox, {backgroundColor: c.correct ? '#b4f2c3' : '#f7b4b4'}]}>
              <Text style={styles.explanationComponent}>{c.text}</Text>
              <Text style={styles.explanationText}>{c.explanation}</Text>
            </View>
          ))}
        <Text style={styles.explanationSummary}>{q.explanation}</Text>
        <TouchableOpacity style={styles.button} onPress={goToNext}>
          <Text style={styles.buttonText}>Next Question</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, { backgroundColor: '#aaa' }]} onPress={() => router.back()}>
          <Text style={styles.buttonText}>Back to Home</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  // Filter out empty or whitespace-only component texts
  const visibleComponents = shuffled.filter(
    c => c.text && c.text.trim() !== '' && c.text.trim() !== '-'
  );

  return (
    <View style={styles.container}>
      <Text style={styles.prompt}>{sessionQuestions[current].prompt}</Text>
      <FlatList
        data={visibleComponents}
        keyExtractor={(_, i) => i.toString()}
        numColumns={numColumns}
        renderItem={({ item, index }) => {
          const isSelected = selected.includes(index);
          let backgroundColor = '#fff';
          if (showResult === 'fail') {
            backgroundColor = item.correct ? '#b4f2c3' : '#f7b4b4';
          } else if (showResult === 'correct') {
            backgroundColor = item.correct ? '#b4f2c3' : '#fff';
          } else if (isSelected) {
            backgroundColor = '#d0e7ff';
          }
          return (
            <TouchableOpacity
              style={[styles.option, { backgroundColor }]}
              onPress={() => {
                if (showResult === 'none') {
                  setSelected(
                    isSelected
                      ? selected.filter(i => i !== index)
                      : [...selected, index]
                  );
                }
              }}
              disabled={showResult !== 'none'}
            >
              <Text style={styles.optionText}>
                {item.text}
              </Text>
            </TouchableOpacity>
          );
        }}
        contentContainerStyle={styles.grid}
      />
      {feedback ? <Text style={styles.feedback}>{feedback}</Text> : null}
      {showResult === 'none' && (
        <TouchableOpacity style={styles.button} onPress={handleCheck} disabled={selected.length === 0}>
          <Text style={styles.buttonText}>Check Answer</Text>
        </TouchableOpacity>
      )}
      {(showResult === 'correct' || showResult === 'fail') && (
        <TouchableOpacity style={styles.button} onPress={() => setShowResult('explanation')}>
          <Text style={styles.buttonText}>Show Explanation</Text>
        </TouchableOpacity>
      )}
      <TouchableOpacity style={[styles.button, { backgroundColor: '#aaa' }]} onPress={() => router.back()}>
        <Text style={styles.buttonText}>Back to Home</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#f7fafc',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  prompt: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  grid: {
    alignItems: 'stretch',
    justifyContent: 'center',
    marginBottom: 16,
  },
  option: {
    width: '48%',
    margin: '1%',
    padding: 18,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#d0d0d0',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  optionText: {
    fontSize: 16,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#3478f6',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 10,
    marginTop: 14,
    alignSelf: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    textAlign: 'center',
  },
  feedback: {
    fontSize: 16,
    color: '#d9534f',
    marginTop: 12,
    marginBottom: 8,
    textAlign: 'center',
  },
  explanationContainer: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'flex-start',
    backgroundColor: '#f7fafc',
  },
  explanationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 24,
    marginBottom: 12,
    textAlign: 'center',
  },
  explanationBox: {
    padding: 14,
    borderRadius: 10,
    marginVertical: 6,
    width: '100%',
  },
  explanationComponent: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 4,
  },
  explanationText: {
    fontSize: 15,
    color: '#333',
  },
  explanationSummary: {
    fontSize: 16,
    marginTop: 16,
    marginBottom: 24,
    textAlign: 'center',
    color: '#222',
  },
});