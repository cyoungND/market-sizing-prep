import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { FlatList, ScrollView, Text, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp, SlideInLeft } from 'react-native-reanimated';
import questions from '../assets/questions.json';
import AnimatedButton from '../components/ui/AnimatedButton';
import AnimatedQuizCard from '../components/ui/AnimatedQuizCard';
import AnimatedProgressBar from '../components/ui/AnimatedProgressBar';
import AnimatedIcon from '../components/ui/AnimatedIcon';
import QuizCompletionModal from '../components/QuizCompletionModal';
import { Colors } from '../constants/Colors';
import { GlobalStyles, Typography } from '../constants/Styles';

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
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
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
      setShowCompletionModal(false);
      setQuestionStartTime(Date.now());
    }
  }, [current, sessionQuestions]);

  if (sessionQuestions.length === 0) {
    return (
      <View style={GlobalStyles.screenQuestion}>
        <Text style={[Typography.bodyText, { color: Colors.textPrimaryLight }]}>Loading questions...</Text>
      </View>
    );
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
    
    const completionTime = Math.round((Date.now() - questionStartTime) / 1000);
    
    if (allCorrect) {
      setShowResult('correct');
      setFeedback('Great job!');
      if (isSession) {
        setNumCorrect(n => n + 1);
        setNumAttempted(n => n + 1);
        setTriesPerQuestion(arr => [...arr, tries + 1]);
      }
      // Show completion modal for wins
      setTimeout(() => setShowCompletionModal(true), 800);
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
        // Show completion modal for failures
        setTimeout(() => setShowCompletionModal(true), 800);
      }
    }
  };

  const handleShowExplanation = () => {
    setShowCompletionModal(false);
    setShowResult('explanation');
  };

  const handleBackToHome = () => {
    setShowCompletionModal(false);
    router.back();
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
      <View style={GlobalStyles.screenQuestion}>
        <ScrollView contentContainerStyle={styles.explanationContainer}>
          <Animated.View entering={FadeInUp.delay(200)}>
            <Text style={[Typography.sectionHeader, { color: Colors.textPrimaryLight, textAlign: 'center', fontFamily: 'Inter' }]}>{q.prompt}</Text>
          </Animated.View>
          
          <Animated.View entering={FadeInUp.delay(400)}>
            <Text style={[Typography.sectionHeader, { color: Colors.textPrimaryLight, textAlign: 'center', fontFamily: 'Inter' }]}>Framework Explanations</Text>
          </Animated.View>
          
          {q.components
            .filter((c: any) => c.text && c.text.trim() !== '' && c.text.trim() !== '-')
            .map((c: any, idx: number) => (
              <Animated.View 
                key={idx} 
                entering={FadeInDown.delay(600 + idx * 100)}
                style={[GlobalStyles.cardOnLight, styles.explanationBox, { 
                  backgroundColor: c.correct ? Colors.secondaryTeal + '20' : Colors.coralRed + '20',
                  borderColor: c.correct ? Colors.secondaryTeal : Colors.coralRed,
                  borderWidth: 1,
                }]}
              >
                <Text style={[Typography.bodyText, { color: Colors.textPrimaryLight, fontWeight: '600', fontFamily: 'Inter' }]}>{c.text}</Text>
                <Text style={[Typography.smallText, { color: Colors.textSecondaryLight, fontFamily: 'Inter' }]}>{c.explanation}</Text>
              </Animated.View>
            ))}
          
          <Animated.View entering={FadeInUp.delay(800)}>
            <Text style={[Typography.bodyText, { color: Colors.textSecondaryLight, textAlign: 'center', fontFamily: 'Inter' }]}>{q.summary}</Text>
          </Animated.View>
          
          <Animated.View entering={FadeInUp.delay(1000)}>
            <AnimatedButton
              title="Next Question"
              onPress={goToNext}
              variant="primary-light"
            />
          </Animated.View>
        </ScrollView>
      </View>
    );
  }

  // Filter out empty or whitespace-only component texts
  const visibleComponents = shuffled.filter(
    c => c.text && c.text.trim() !== '' && c.text.trim() !== '-'
  );

  const progress = (current + 1) / sessionQuestions.length;

  return (
    <View style={GlobalStyles.screenQuestion}>
      {/* Header with progress */}
      <Animated.View entering={FadeInUp.delay(100)} style={styles.header}>
        <Text style={[Typography.sectionHeader, { color: Colors.textPrimaryLight, textAlign: 'center', fontFamily: 'Inter' }]}>{sessionQuestions[current].prompt}</Text>
        {isSession && (
          <View style={styles.progressContainer}>
            <Text style={[Typography.smallText, { color: Colors.textSecondaryLight, textAlign: 'center', fontFamily: 'Inter' }]}>
              Question {current + 1} of {sessionQuestions.length}
            </Text>
            <AnimatedProgressBar progress={progress} height={6} />
          </View>
        )}
      </Animated.View>

      {/* Quiz Cards */}
      <Animated.View entering={FadeInDown.delay(300)} style={styles.cardsContainer}>
        <FlatList
          data={visibleComponents}
          keyExtractor={(_, i) => i.toString()}
          numColumns={numColumns}
          renderItem={({ item, index }) => {
            const isSelected = selected.includes(index);
            const isCorrect = showResult === 'correct' && item.correct;
            const isIncorrect = isSelected && !item.correct && (showResult === 'fail' || showResult === 'correct');
            
            return (
              <Animated.View 
                entering={FadeInDown.delay(400 + index * 100)}
                style={styles.cardWrapper}
              >
                <AnimatedQuizCard
                  onPress={() => {
                    if (showResult === 'none') {
                      setSelected(
                        isSelected
                          ? selected.filter(i => i !== index)
                          : [...selected, index]
                      );
                    }
                  }}
                  isSelected={isSelected}
                  isCorrect={isCorrect}
                  isIncorrect={isIncorrect}
                  disabled={showResult !== 'none'}
                >
                  {item.text}
                </AnimatedQuizCard>
              </Animated.View>
            );
          }}
          contentContainerStyle={styles.modernGrid}
          showsVerticalScrollIndicator={false}
        />
      </Animated.View>

      {/* Feedback */}
      {feedback && (
        <Animated.View entering={FadeInUp.delay(200)} style={styles.feedbackContainer}>
          <Text style={[
            Typography.bodyText,
            {
              color: Colors.textPrimaryLight,
              textAlign: 'center',
              fontFamily: 'Inter',
              paddingVertical: 12,
              paddingHorizontal: 20,
              borderRadius: 12,
              backgroundColor: showResult === 'correct' ? Colors.secondaryTeal + '20' : 
                             showResult === 'fail' ? Colors.coralRed + '20' : Colors.bgCardWhite,
            }
          ]}>
            {feedback}
          </Text>
        </Animated.View>
      )}

      {/* Action Buttons */}
      <Animated.View entering={FadeInUp.delay(600)} style={GlobalStyles.buttonsContainer}>
        {showResult === 'none' && (
          <AnimatedButton
            title="Check Answer"
            onPress={handleCheck}
            variant="primary-light"
            style={{ opacity: selected.length === 0 ? 0.5 : 1 }}
          />
        )}
        
        {(showResult === 'correct' || showResult === 'fail') && !showCompletionModal && (
          <AnimatedButton
            title="Show Explanation"
            onPress={() => setShowResult('explanation')}
            variant="primary-light"
          />
        )}
        
        {!showCompletionModal && (
          <AnimatedButton
            title="Back to Home"
            onPress={() => router.back()}
            variant="secondary-light"
          />
        )}
      </Animated.View>

      {/* Quiz Completion Modal */}
      <QuizCompletionModal
        visible={showCompletionModal}
        isWin={showResult === 'correct'}
        completionTimeSeconds={Math.round((Date.now() - questionStartTime) / 1000)}
        correctGuesses={showResult === 'correct' ? 5 : selected.filter(i => shuffled[i]?.correct).length}
        totalGuesses={selected.length}
        onShowExplanation={handleShowExplanation}
        onBackToHome={handleBackToHome}
      />
    </View>
  );
}

const styles = {
  header: {
    marginBottom: 24,
  },
  progressContainer: {
    marginTop: 16,
  },
  cardsContainer: {
    flex: 1,
    marginBottom: 20,
  },
  modernGrid: {
    paddingHorizontal: 4,
  },
  cardWrapper: {
    width: '48%' as const,
    marginHorizontal: 4,
    marginBottom: 12,
  },
  feedbackContainer: {
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  explanationContainer: {
    padding: 24,
    alignItems: 'center' as const,
    justifyContent: 'flex-start' as const,
    minHeight: '100%' as const,
  },
  explanationBox: {
    marginVertical: 8,
    width: '100%' as const,
  },
};