import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Animated,
} from 'react-native';
import { Colors, Typography, GlobalStyles, Spacing } from '../constants/Styles';
import { QuizCompletionData } from '../types/Analytics';
import { formatTime, saveQuizResult, createQuizResult } from '../utils/analyticsUtils';

interface QuizCompletionScreenProps {
  route: {
    params: QuizCompletionData & {
      correctGuesses: number;
      totalGuesses: number;
    };
  };
  navigation: any;
}

export default function QuizCompletionScreen({ route, navigation }: QuizCompletionScreenProps) {
  const { isWin, completionTimeSeconds, accuracy, correctGuesses, totalGuesses } = route.params;
  
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.8));

  useEffect(() => {
    // Save quiz result to storage
    const saveResult = async () => {
      const result = createQuizResult(isWin, completionTimeSeconds, correctGuesses, totalGuesses);
      await saveQuizResult(result);
    };
    saveResult();

    // Animate screen entrance
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleNextQuestion = () => {
    navigation.navigate('Quiz'); // Adjust navigation target as needed
  };

  const handleViewProgress = () => {
    navigation.navigate('ProgressAnalytics');
  };

  const mainMessage = isWin ? "Well done!" : "Keep practicing!";
  const subMessage = isWin 
    ? "You successfully identified all 5 correct components!"
    : "Don't worry - market sizing takes practice. Try again!";

  const screenStyle = isWin ? styles.screenWin : styles.screenLoss;
  const cardStyle = isWin ? styles.cardWin : styles.cardLoss;

  return (
    <SafeAreaView style={[GlobalStyles.screenQuestion, screenStyle]}>
      <Animated.View 
        style={[
          styles.container,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* Main Message */}
        <View style={styles.messageContainer}>
          <Text style={[styles.mainMessage, GlobalStyles.appTitleLight]}>
            {mainMessage}
          </Text>
          <Text style={[styles.subMessage, GlobalStyles.subtitleLight]}>
            {subMessage}
          </Text>
        </View>

        {/* Stats Card */}
        <View style={[GlobalStyles.cardOnLight, cardStyle, styles.statsCard]}>
          <View style={styles.statsContainer}>
            {/* Time Stat */}
            <View style={styles.statSection}>
              <Text style={[Typography.statNumber, styles.statNumber]}>
                {formatTime(completionTimeSeconds)}
              </Text>
              <Text style={[Typography.statLabel, styles.statLabel]}>
                TIME
              </Text>
            </View>

            {/* Vertical Divider */}
            <View style={styles.divider} />

            {/* Accuracy Stat */}
            <View style={styles.statSection}>
              <Text style={[Typography.statNumber, styles.statNumber]}>
                {accuracy}%
              </Text>
              <Text style={[Typography.statLabel, styles.statLabel]}>
                ACCURACY
              </Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={[GlobalStyles.buttonMicro, GlobalStyles.buttonPrimaryLight]}
            onPress={handleNextQuestion}
            activeOpacity={0.8}
          >
            <Text style={GlobalStyles.buttonTextPrimaryLight}>
              NEXT QUESTION
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[GlobalStyles.buttonMicro, GlobalStyles.buttonSecondaryLight]}
            onPress={handleViewProgress}
            activeOpacity={0.8}
          >
            <Text style={GlobalStyles.buttonTextSecondaryLight}>
              VIEW PROGRESS
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screenWin: {
    backgroundColor: Colors.bgLightSage,
  },
  screenLoss: {
    backgroundColor: Colors.bgLightSage,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  },
  messageContainer: {
    alignItems: 'center',
    marginBottom: Spacing.xxl,
  },
  mainMessage: {
    marginBottom: Spacing.sm,
  },
  subMessage: {
    textAlign: 'center',
    paddingHorizontal: Spacing.md,
  },
  statsCard: {
    marginBottom: Spacing.xxl,
    minWidth: 280,
  },
  cardWin: {
    borderLeftWidth: 4,
    borderLeftColor: Colors.secondaryTeal,
  },
  cardLoss: {
    borderLeftWidth: 4,
    borderLeftColor: Colors.coralRed,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statSection: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  statNumber: {
    color: Colors.textPrimaryLight,
    marginBottom: 4,
  },
  statLabel: {
    color: Colors.textSecondaryLight,
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: Colors.textSecondaryLight,
    opacity: 0.3,
    marginHorizontal: Spacing.md,
  },
  buttonsContainer: {
    alignItems: 'center',
    gap: Spacing.sm,
  },
});
