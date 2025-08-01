import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Dimensions,
  Animated,
  Share,
  ScrollView,
} from 'react-native';
import { IconSymbol } from '@/components/ui/IconSymbol';
import analyticsService from '@/services/analyticsService';
import ViralShare from '@/components/ViralShare';

const { width } = Dimensions.get('window');

interface SessionResultsProps {
  sessionId: string;
  onClose: () => void;
  onShareSuccess?: () => void;
}

interface QuestionResult {
  questionId: string;
  isCorrect: boolean;
  timeSpent: number;
  attempts: number;
}

interface SessionData {
  sessionId: string;
  questions: QuestionResult[];
  totalTime: number;
  accuracy: number;
  completedAt: string;
}

export default function SessionResults({ sessionId, onClose, onShareSuccess }: SessionResultsProps) {
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [shareData, setShareData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showDetails, setShowDetails] = useState(false);
  const [showViralShare, setShowViralShare] = useState(false);
  
  // Animation values
  const fadeAnim = new Animated.Value(0);
  const slideAnim = new Animated.Value(50);

  useEffect(() => {
    fetchSessionData();
    startAnimations();
  }, []);

  const startAnimations = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const fetchSessionData = async () => {
    try {
      setLoading(true);
      const [sessionResult, shareResult] = await Promise.all([
        analyticsService.getSessionResults(sessionId),
        analyticsService.getShareData(),
      ]);
      
      if (sessionResult) {
        setSessionData(sessionResult);
      }
      setShareData(shareResult);
    } catch (error) {
      console.error('Error fetching session data:', error);
      // Mock data for demonstration
      setSessionData({
        sessionId,
        questions: [
          { questionId: '1', isCorrect: true, timeSpent: 45, attempts: 1 },
          { questionId: '2', isCorrect: false, timeSpent: 60, attempts: 2 },
          { questionId: '3', isCorrect: true, timeSpent: 30, attempts: 1 },
          { questionId: '4', isCorrect: true, timeSpent: 50, attempts: 1 },
        ],
        totalTime: 185,
        accuracy: 75,
        completedAt: new Date().toISOString(),
      });
      setShareData({
        summary: "Market Sizing Practice Complete! 🎯\n3/4 correct • 75% accuracy",
        rank: "Advanced",
        emojis: "🟢🔴🟢🟢",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleShare = () => {
    setShowViralShare(true);
  };

  const getPerformanceColor = (accuracy: number) => {
    if (accuracy >= 80) return '#10b981'; // Green
    if (accuracy >= 60) return '#f59e0b'; // Yellow
    return '#ef4444'; // Red
  };

  const getPerformanceEmoji = (accuracy: number) => {
    if (accuracy >= 90) return '🏆';
    if (accuracy >= 80) return '🎯';
    if (accuracy >= 70) return '👍';
    if (accuracy >= 60) return '📈';
    return '💪';
  };

  if (loading || !sessionData) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Calculating your results...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Animated.View 
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.performanceIcon}>
              <Text style={styles.performanceEmoji}>
                {getPerformanceEmoji(sessionData.accuracy)}
              </Text>
            </View>
            <Text style={styles.title}>Session Complete!</Text>
            <Text style={styles.subtitle}>Great work on your practice session</Text>
          </View>

          {/* Main Stats */}
          <View style={styles.mainStats}>
            <View style={styles.accuracyContainer}>
              <Text style={[styles.accuracyText, { color: getPerformanceColor(sessionData.accuracy) }]}>
                {sessionData.accuracy}%
              </Text>
              <Text style={styles.accuracyLabel}>Accuracy</Text>
            </View>
            
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <IconSymbol name="checkmark.circle.fill" size={20} color="#10b981" />
                <Text style={styles.statValue}>
                  {sessionData.questions.filter(q => q.isCorrect).length}/{sessionData.questions.length}
                </Text>
                <Text style={styles.statLabel}>Correct</Text>
              </View>
              
              <View style={styles.statItem}>
                <IconSymbol name="clock.fill" size={20} color="#3478f6" />
                <Text style={styles.statValue}>
                  {analyticsService.formatTime(sessionData.totalTime)}
                </Text>
                <Text style={styles.statLabel}>Total Time</Text>
              </View>
            </View>
          </View>

          {/* Visual Progress */}
          <View style={styles.progressSection}>
            <Text style={styles.progressTitle}>Question Breakdown</Text>
            <View style={styles.progressBar}>
              {sessionData.questions.map((question, index) => (
                <View
                  key={question.questionId}
                  style={[
                    styles.progressSegment,
                    {
                      backgroundColor: question.isCorrect ? '#10b981' : '#ef4444',
                      width: `${100 / sessionData.questions.length}%`,
                    },
                  ]}
                />
              ))}
            </View>
            <View style={styles.emojiRow}>
              {sessionData.questions.map((question, index) => (
                <Text key={question.questionId} style={styles.resultEmoji}>
                  {question.isCorrect ? '🟢' : '🔴'}
                </Text>
              ))}
            </View>
          </View>

          {/* Detailed Results */}
          <TouchableOpacity
            style={styles.detailsToggle}
            onPress={() => setShowDetails(!showDetails)}
          >
            <Text style={styles.detailsToggleText}>
              {showDetails ? 'Hide Details' : 'View Details'}
            </Text>
            <IconSymbol 
              name="chevron.right" 
              size={16} 
              color="#3478f6"
              style={{ transform: [{ rotate: showDetails ? '90deg' : '0deg' }] }}
            />
          </TouchableOpacity>

          {showDetails && (
            <View style={styles.detailsContainer}>
              {sessionData.questions.map((question, index) => (
                <View key={question.questionId} style={styles.questionDetail}>
                  <View style={styles.questionHeader}>
                    <Text style={styles.questionNumber}>Question {index + 1}</Text>
                    <View style={[
                      styles.resultBadge,
                      { backgroundColor: question.isCorrect ? '#10b981' : '#ef4444' }
                    ]}>
                      <Text style={styles.resultBadgeText}>
                        {question.isCorrect ? 'Correct' : 'Incorrect'}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.questionStats}>
                    <Text style={styles.questionStat}>
                      Time: {analyticsService.formatTime(question.timeSpent)}
                    </Text>
                    <Text style={styles.questionStat}>
                      Attempts: {question.attempts}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.actions}>
            <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
              <IconSymbol name="square.and.arrow.up" size={20} color="#fff" />
              <Text style={styles.shareButtonText}>Share Results</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.continueButton} onPress={onClose}>
              <Text style={styles.continueButtonText}>Continue</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </Animated.View>
      
      {sessionData && (
        <ViralShare
          visible={showViralShare}
          onClose={() => {
            setShowViralShare(false);
            onShareSuccess?.();
          }}
          trigger="session"
          sessionData={{
            accuracy: sessionData.accuracy,
            questionsCorrect: sessionData.questions.filter(q => q.isCorrect).length,
            totalQuestions: sessionData.questions.length,
            streak: sessionData.questions.filter(q => q.isCorrect).length,
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    width: width * 0.9,
    maxHeight: '80%',
  },
  loadingContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  performanceIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  performanceEmoji: {
    fontSize: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a202c',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
  },
  mainStats: {
    alignItems: 'center',
    marginBottom: 32,
  },
  accuracyContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  accuracyText: {
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  accuracyLabel: {
    fontSize: 16,
    color: '#64748b',
    fontWeight: '500',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a202c',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#64748b',
  },
  progressSection: {
    marginBottom: 24,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a202c',
    marginBottom: 16,
    textAlign: 'center',
  },
  progressBar: {
    flexDirection: 'row',
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressSegment: {
    height: '100%',
  },
  emojiRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 8,
  },
  resultEmoji: {
    fontSize: 20,
  },
  detailsToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginBottom: 16,
  },
  detailsToggleText: {
    fontSize: 16,
    color: '#3478f6',
    fontWeight: '500',
    marginRight: 8,
  },
  detailsContainer: {
    marginBottom: 24,
  },
  questionDetail: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  questionNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a202c',
  },
  resultBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  resultBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  questionStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  questionStat: {
    fontSize: 14,
    color: '#64748b',
  },
  actions: {
    gap: 12,
  },
  shareButton: {
    backgroundColor: '#3478f6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
  },
  shareButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  continueButton: {
    backgroundColor: '#f1f5f9',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  continueButtonText: {
    color: '#1a202c',
    fontSize: 16,
    fontWeight: '600',
  },
});
