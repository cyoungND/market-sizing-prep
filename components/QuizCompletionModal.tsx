import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Animated,
  Dimensions,
} from 'react-native';
import { Colors } from '../constants/Colors';
import { Typography, GlobalStyles, Spacing } from '../constants/Styles';
import { formatTime, saveQuizResult, createQuizResult } from '../utils/analyticsUtils';

const { width: screenWidth } = Dimensions.get('window');

interface QuizCompletionModalProps {
  visible: boolean;
  isWin: boolean;
  completionTimeSeconds: number;
  correctGuesses: number;
  totalGuesses: number;
  onShowExplanation: () => void;
  onBackToHome: () => void;
}

export default function QuizCompletionModal({
  visible,
  isWin,
  completionTimeSeconds,
  correctGuesses,
  totalGuesses,
  onShowExplanation,
  onBackToHome,
}: QuizCompletionModalProps) {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.8));
  const [slideAnim] = useState(new Animated.Value(50));

  const accuracy = totalGuesses > 0 ? Math.round((correctGuesses / totalGuesses) * 100) : 0;

  useEffect(() => {
    if (visible) {
      // Save quiz result to storage
      const saveResult = async () => {
        const result = createQuizResult(isWin, completionTimeSeconds, correctGuesses, totalGuesses);
        await saveQuizResult(result);
      };
      saveResult();

      // Animate modal entrance
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Reset animations when modal closes
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.8);
      slideAnim.setValue(50);
    }
  }, [visible]);

  const mainMessage = isWin ? "Well done!" : "Keep practicing!";
  const subMessage = isWin 
    ? "You successfully identified all 5 correct components!"
    : "Don't worry - market sizing takes practice. Try again!";

  const cardBorderColor = isWin ? Colors.secondaryTeal : Colors.coralRed;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      statusBarTranslucent={true}
    >
      <View style={styles.modalOverlay}>
        <Animated.View 
          style={[
            styles.modalContainer,
            {
              opacity: fadeAnim,
              transform: [
                { scale: scaleAnim },
                { translateY: slideAnim }
              ],
            },
          ]}
        >
          {/* Main Message */}
          <View style={styles.messageContainer}>
            <Text style={[Typography.sectionHeader, styles.mainMessage]}>
              {mainMessage}
            </Text>
            <Text style={[Typography.smallText, styles.subMessage]}>
              {subMessage}
            </Text>
          </View>

          {/* Stats Card */}
          <View style={[styles.statsCard, { borderLeftColor: cardBorderColor }]}>
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
              onPress={onShowExplanation}
              activeOpacity={0.8}
            >
              <Text style={GlobalStyles.buttonTextPrimaryLight}>
                SHOW EXPLANATION
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[GlobalStyles.buttonMicro, GlobalStyles.buttonSecondaryLight]}
              onPress={onBackToHome}
              activeOpacity={0.8}
            >
              <Text style={GlobalStyles.buttonTextSecondaryLight}>
                BACK TO HOME
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  },
  modalContainer: {
    backgroundColor: Colors.bgCardWhite,
    borderRadius: 20,
    padding: Spacing.lg,
    width: Math.min(screenWidth - (Spacing.lg * 2), 320),
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  messageContainer: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  mainMessage: {
    color: Colors.textPrimaryLight,
    marginBottom: Spacing.xs,
    textAlign: 'center',
  },
  subMessage: {
    color: Colors.textSecondaryLight,
    textAlign: 'center',
    lineHeight: 20,
  },
  statsCard: {
    backgroundColor: Colors.bgLightGray,
    borderRadius: 12,
    borderLeftWidth: 4,
    marginBottom: Spacing.lg,
    width: '100%',
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
  },
  statSection: {
    flex: 1,
    alignItems: 'center',
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
    width: '100%',
  },
});
