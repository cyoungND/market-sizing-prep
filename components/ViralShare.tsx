import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Share,
  Alert,
  Clipboard,
  Dimensions,
  Modal,
  Animated,
} from 'react-native';
import { IconSymbol } from '@/components/ui/IconSymbol';
import analyticsService from '@/services/analyticsService';

const { width } = Dimensions.get('window');

interface ViralShareProps {
  visible: boolean;
  onClose: () => void;
  sessionData?: {
    accuracy: number;
    questionsCorrect: number;
    totalQuestions: number;
    streak: number;
  };
  trigger?: 'session' | 'analytics' | 'achievement';
}

interface ShareContent {
  title: string;
  emojis: string;
  summary: string;
  rank: string;
  hashtags: string[];
}

export default function ViralShare({ visible, onClose, sessionData, trigger = 'analytics' }: ViralShareProps) {
  const [shareContent, setShareContent] = useState<ShareContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  
  // Animation values
  const fadeAnim = new Animated.Value(0);
  const scaleAnim = new Animated.Value(0.8);

  useEffect(() => {
    if (visible) {
      generateShareContent();
      startAnimations();
    }
  }, [visible, sessionData]);

  const startAnimations = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const generateShareContent = async () => {
    try {
      setLoading(true);
      
      if (sessionData && trigger === 'session') {
        // Generate session-specific share content
        const emojis = generateSessionEmojis(sessionData);
        const content: ShareContent = {
          title: getSessionTitle(sessionData.accuracy),
          emojis,
          summary: `Market Sizing Practice Complete! 🎯\n${sessionData.questionsCorrect}/${sessionData.totalQuestions} correct • ${sessionData.accuracy}% accuracy`,
          rank: getRankFromAccuracy(sessionData.accuracy),
          hashtags: ['#MarketSizing', '#InterviewPrep', '#BusinessStrategy', '#Consulting'],
        };
        setShareContent(content);
      } else {
        // Get overall analytics share data
        const shareData = await analyticsService.getShareData();
        const userStats = await analyticsService.getUserStats();
        
        const content: ShareContent = {
          title: getOverallTitle(userStats.averageAccuracy, userStats.currentStreak),
          emojis: shareData.emojis || generateOverallEmojis(userStats),
          summary: shareData.summary || `Market Sizing Master 🎯\n${userStats.currentStreak}-day streak • ${userStats.averageAccuracy.toFixed(1)}% accuracy`,
          rank: shareData.rank || getRankFromAccuracy(userStats.averageAccuracy),
          hashtags: ['#MarketSizing', '#InterviewPrep', '#BusinessStrategy', '#Consulting', '#SkillBuilding'],
        };
        setShareContent(content);
      }
    } catch (error) {
      console.error('Error generating share content:', error);
      // Fallback content
      setShareContent({
        title: 'Market Sizing Progress',
        emojis: '🎯📊💼',
        summary: 'Practicing market sizing skills!',
        rank: 'Learner',
        hashtags: ['#MarketSizing', '#InterviewPrep'],
      });
    } finally {
      setLoading(false);
    }
  };

  const generateSessionEmojis = (data: { accuracy: number; questionsCorrect: number; totalQuestions: number; streak: number }) => {
    const correctEmojis = '🟢'.repeat(data.questionsCorrect);
    const incorrectEmojis = '🔴'.repeat(data.totalQuestions - data.questionsCorrect);
    const streakEmojis = data.streak >= 3 ? ' 🔥'.repeat(Math.min(data.streak, 5)) : '';
    return correctEmojis + incorrectEmojis + streakEmojis;
  };

  const generateOverallEmojis = (stats: any) => {
    const accuracy = stats.averageAccuracy;
    const streak = stats.currentStreak;
    
    let performanceEmojis = '';
    if (accuracy >= 90) performanceEmojis = '🏆🎯⭐';
    else if (accuracy >= 80) performanceEmojis = '🎯💪📈';
    else if (accuracy >= 70) performanceEmojis = '📊👍💯';
    else performanceEmojis = '📚🎯💪';
    
    const streakEmojis = streak >= 3 ? ' 🔥'.repeat(Math.min(streak, 5)) : '';
    
    return performanceEmojis + streakEmojis;
  };

  const getSessionTitle = (accuracy: number) => {
    if (accuracy >= 90) return 'Market Sizing Ace! 🏆';
    if (accuracy >= 80) return 'Market Sizing Pro! 🎯';
    if (accuracy >= 70) return 'Market Sizing Star! ⭐';
    if (accuracy >= 60) return 'Market Sizing Progress! 📈';
    return 'Market Sizing Practice! 💪';
  };

  const getOverallTitle = (accuracy: number, streak: number) => {
    if (streak >= 10) return 'Market Sizing Legend! 🏆';
    if (streak >= 5) return 'Market Sizing Master! 🔥';
    if (accuracy >= 85) return 'Market Sizing Expert! 🎯';
    if (accuracy >= 75) return 'Market Sizing Pro! 📊';
    return 'Market Sizing Journey! 🚀';
  };

  const getRankFromAccuracy = (accuracy: number) => {
    if (accuracy >= 90) return 'Master';
    if (accuracy >= 80) return 'Expert';
    if (accuracy >= 70) return 'Advanced';
    if (accuracy >= 60) return 'Intermediate';
    return 'Beginner';
  };

  const handleShare = async (platform: 'general' | 'linkedin' | 'twitter') => {
    if (!shareContent) return;

    try {
      let message = '';
      
      switch (platform) {
        case 'linkedin':
          message = `${shareContent.title}\n\n${shareContent.summary}\n\n${shareContent.emojis}\n\nRank: ${shareContent.rank}\n\nSharpening my market sizing skills for consulting interviews! 💼\n\n${shareContent.hashtags.join(' ')}\n\nTry Market Sizing Prep!`;
          break;
        case 'twitter':
          message = `${shareContent.title}\n\n${shareContent.emojis}\n\n${shareContent.summary}\nRank: ${shareContent.rank}\n\n${shareContent.hashtags.slice(0, 3).join(' ')}\n\nTry Market Sizing Prep! 🚀`;
          break;
        default:
          message = `${shareContent.title}\n\n${shareContent.summary}\n\n${shareContent.emojis}\n\nRank: ${shareContent.rank}\n\nTry Market Sizing Prep!`;
      }

      await Share.share({ message });
      onClose();
    } catch (error) {
      console.error('Error sharing:', error);
      Alert.alert('Error', 'Failed to share content');
    }
  };

  const handleCopyToClipboard = async () => {
    if (!shareContent) return;

    const message = `${shareContent.title}\n\n${shareContent.summary}\n\n${shareContent.emojis}\n\nRank: ${shareContent.rank}\n\nTry Market Sizing Prep!`;
    
    try {
      await Clipboard.setString(message);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      Alert.alert('Error', 'Failed to copy to clipboard');
    }
  };

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.8,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
      // Reset animations for next time
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.8);
    });
  };

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={handleClose}
    >
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        <Animated.View 
          style={[
            styles.container,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {loading || !shareContent ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Preparing your share...</Text>
            </View>
          ) : (
            <>
              <View style={styles.header}>
                <Text style={styles.title}>{shareContent.title}</Text>
                <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
                  <IconSymbol name="chevron.right" size={20} color="#64748b" style={{ transform: [{ rotate: '45deg' }] }} />
                </TouchableOpacity>
              </View>

              <View style={styles.preview}>
                <Text style={styles.emojis}>{shareContent.emojis}</Text>
                <Text style={styles.summary}>{shareContent.summary}</Text>
                <View style={styles.rankBadge}>
                  <Text style={styles.rankText}>Rank: {shareContent.rank}</Text>
                </View>
                <View style={styles.hashtags}>
                  {shareContent.hashtags.slice(0, 4).map((tag, index) => (
                    <Text key={index} style={styles.hashtag}>{tag}</Text>
                  ))}
                </View>
              </View>

              <View style={styles.actions}>
                <TouchableOpacity style={styles.shareButton} onPress={() => handleShare('general')}>
                  <IconSymbol name="square.and.arrow.up" size={20} color="#fff" />
                  <Text style={styles.shareButtonText}>Share</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.copyButton} onPress={handleCopyToClipboard}>
                  <IconSymbol name="square.and.arrow.up" size={16} color="#3478f6" />
                  <Text style={styles.copyButtonText}>{copied ? 'Copied!' : 'Copy'}</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.platformButtons}>
                <TouchableOpacity style={styles.platformButton} onPress={() => handleShare('linkedin')}>
                  <Text style={styles.platformButtonText}>LinkedIn</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.platformButton} onPress={() => handleShare('twitter')}>
                  <Text style={styles.platformButtonText}>Twitter</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    width: width * 0.9,
    maxWidth: 400,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#64748b',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a202c',
    flex: 1,
  },
  closeButton: {
    padding: 4,
  },
  preview: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    alignItems: 'center',
  },
  emojis: {
    fontSize: 28,
    marginBottom: 16,
    textAlign: 'center',
  },
  summary: {
    fontSize: 16,
    color: '#1a202c',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 22,
  },
  rankBadge: {
    backgroundColor: '#3478f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 16,
  },
  rankText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  hashtags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  hashtag: {
    color: '#3478f6',
    fontSize: 12,
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  shareButton: {
    flex: 1,
    backgroundColor: '#3478f6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 10,
  },
  shareButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  copyButton: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  copyButtonText: {
    color: '#3478f6',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 6,
  },
  platformButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  platformButton: {
    flex: 1,
    backgroundColor: '#fff',
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
  },
  platformButtonText: {
    color: '#64748b',
    fontSize: 14,
    fontWeight: '500',
  },
});
