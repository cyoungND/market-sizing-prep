import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import ViralShare from '@/components/ViralShare';
import analyticsService from '@/services/analyticsService';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  SafeAreaView
} from 'react-native';
import { Colors } from '@/constants/Colors';
import { Typography, GlobalStyles, Spacing } from '@/constants/Styles';

const { width } = Dimensions.get('window');

interface UserStats {
  totalSessions: number;
  completedSessions: number;
  averageAccuracy: number;
  currentStreak: number;
  longestStreak: number;
  averageTimePerQuestion: number;
  fastestTime: number;
  totalQuestions: number;
  correctAnswers: number;
}

interface DailyStats {
  date: string;
  sessionsCompleted: number;
  averageAccuracy: number;
  questionsAnswered: number;
}

interface ShareData {
  summary: string;
  rank: string;
  emojis: string;
}

export default function AnalyticsScreen() {
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
  const [shareData, setShareData] = useState<ShareData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedView, setSelectedView] = useState<'overview' | 'trends' | 'detailed'>('overview');
  const [showViralShare, setShowViralShare] = useState(false);

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      
      // Fetch real data from analytics service
      const [userStatsData, dailyStatsData, shareDataData] = await Promise.all([
        analyticsService.getUserStats(),
        analyticsService.getDailyTrends(7),
        analyticsService.getShareData(),
      ]);

      setUserStats(userStatsData);
      setDailyStats(dailyStatsData);
      setShareData(shareDataData);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      Alert.alert('Error', 'Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = () => {
    setShowViralShare(true);
  };

  const renderStatCard = (title: string, value: string | number, subtitle?: string, icon?: 'target' | 'flame.fill' | 'checkmark.circle.fill' | 'clock.fill') => (
    <View style={styles.statCard}>
      <View style={styles.statHeader}>
        {icon && <IconSymbol name={icon} size={20} color="#3478f6" />}
        <Text style={styles.statTitle}>{title}</Text>
      </View>
      <Text style={styles.statValue}>{value}</Text>
      {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
    </View>
  );

  const renderOverviewTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Performance Overview</Text>
        <View style={styles.statsGrid2x2}>
          {renderStatCard('Accuracy', `${userStats?.averageAccuracy.toFixed(1)}%`, 'Overall performance', 'target')}
          {renderStatCard('Current Streak', userStats?.currentStreak || 0, 'Correct in a row', 'flame.fill')}
          {renderStatCard('Sessions', `${userStats?.completedSessions}/${userStats?.totalSessions}`, 'Completed', 'checkmark.circle.fill')}
          {renderStatCard('Avg Time', `${userStats?.averageTimePerQuestion}s`, 'Per question', 'clock.fill')}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Achievements</Text>
        <View style={styles.achievementsGrid}>
          <View style={[styles.achievementCard, styles.achievementCardCompact]}>
            <View style={styles.achievementHeader}>
              <IconSymbol name="trophy.fill" size={20} color={Colors.goldenYellow} />
              <Text style={styles.achievementTitle}>Longest Streak</Text>
            </View>
            <Text style={styles.achievementValue}>{userStats?.longestStreak}</Text>
            <Text style={styles.achievementSubtitle}>questions</Text>
          </View>
          
          <View style={[styles.achievementCard, styles.achievementCardCompact]}>
            <View style={styles.achievementHeader}>
              <IconSymbol name="bolt.fill" size={20} color={Colors.warmOrange} />
              <Text style={styles.achievementTitle}>Fastest Time</Text>
            </View>
            <Text style={styles.achievementValue}>{userStats?.fastestTime}s</Text>
            <Text style={styles.achievementSubtitle}>lightning fast!</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
        <IconSymbol name="square.and.arrow.up" size={20} color={Colors.textPrimaryDark} />
        <Text style={styles.shareButtonText}>Share Your Progress</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  const renderTrendsTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        {dailyStats.map((day, index) => (
          <View key={day.date} style={styles.trendCard}>
            <View style={styles.trendHeader}>
              <Text style={styles.trendDate}>{new Date(day.date).toLocaleDateString()}</Text>
              <View style={styles.trendBadge}>
                <Text style={styles.trendBadgeText}>{day.averageAccuracy}%</Text>
              </View>
            </View>
            <View style={styles.trendStats}>
              <Text style={styles.trendStat}>{day.sessionsCompleted} sessions</Text>
              <Text style={styles.trendStat}>•</Text>
              <Text style={styles.trendStat}>{day.questionsAnswered} questions</Text>
            </View>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${day.averageAccuracy}%` }
                ]} 
              />
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );

  const renderDetailedTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Detailed Statistics</Text>
        <View style={styles.detailedStats}>
          <View style={styles.detailedRow}>
            <Text style={styles.detailedLabel}>Total Questions Answered</Text>
            <Text style={styles.detailedValue}>{userStats?.totalQuestions}</Text>
          </View>
          <View style={styles.detailedRow}>
            <Text style={styles.detailedLabel}>Correct Answers</Text>
            <Text style={styles.detailedValue}>{userStats?.correctAnswers}</Text>
          </View>
          <View style={styles.detailedRow}>
            <Text style={styles.detailedLabel}>Completion Rate</Text>
            <Text style={styles.detailedValue}>
              {userStats ? ((userStats.completedSessions / userStats.totalSessions) * 100).toFixed(1) : 0}%
            </Text>
          </View>
          <View style={styles.detailedRow}>
            <Text style={styles.detailedLabel}>Average Session Length</Text>
            <Text style={styles.detailedValue}>
              {userStats ? Math.round((userStats.totalQuestions / userStats.completedSessions) * userStats.averageTimePerQuestion / 60) : 0} min
            </Text>
          </View>
        </View>
      </View>

      {shareData && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Share Preview</Text>
          <View style={styles.sharePreview}>
            <Text style={styles.shareEmojis}>{shareData.emojis}</Text>
            <Text style={styles.shareSummary}>{shareData.summary}</Text>
            <Text style={styles.shareRank}>Rank: {shareData.rank}</Text>
          </View>
        </View>
      )}
    </ScrollView>
  );

  if (loading) {
    return (
      <SafeAreaView style={[GlobalStyles.screenWelcome, styles.container]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.goldenYellow} />
          <Text style={[Typography.bodyText, styles.loadingText]}>Loading your analytics...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[GlobalStyles.screenWelcome, styles.container]}>
      <View style={styles.header}>
        <Text style={[Typography.sectionHeader, styles.title]}>Analytics Dashboard</Text>
        <TouchableOpacity onPress={fetchAnalyticsData} style={styles.refreshButton}>
          <IconSymbol name="arrow.clockwise" size={24} color={Colors.goldenYellow} />
        </TouchableOpacity>
      </View>

      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, selectedView === 'overview' && styles.activeTab]}
          onPress={() => setSelectedView('overview')}
        >
          <Text style={[Typography.buttonText, styles.tabText, selectedView === 'overview' && styles.activeTabText]}>
            Overview
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedView === 'trends' && styles.activeTab]}
          onPress={() => setSelectedView('trends')}
        >
          <Text style={[Typography.buttonText, styles.tabText, selectedView === 'trends' && styles.activeTabText]}>
            Trends
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedView === 'detailed' && styles.activeTab]}
          onPress={() => setSelectedView('detailed')}
        >
          <Text style={[Typography.buttonText, styles.tabText, selectedView === 'detailed' && styles.activeTabText]}>
            Detailed
          </Text>
        </TouchableOpacity>
      </View>

      {selectedView === 'overview' && renderOverviewTab()}
      {selectedView === 'trends' && renderTrendsTab()}
      {selectedView === 'detailed' && renderDetailedTab()}
      
      <ViralShare
        visible={showViralShare}
        onClose={() => setShowViralShare(false)}
        trigger="analytics"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: Colors.textPrimaryDark,
    marginTop: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    marginTop: Spacing.sm,
  },
  title: {
    color: Colors.textPrimaryDark,
    flex: 1,
  },
  refreshButton: {
    padding: Spacing.xs,
  },
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.md,
  },
  tab: {
    flex: 1,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    borderRadius: 8,
    marginHorizontal: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  activeTab: {
    backgroundColor: Colors.goldenYellow,
  },
  tabText: {
    color: Colors.textSecondaryDark,
    fontSize: 12,
    textTransform: 'uppercase',
  },
  activeTabText: {
    color: Colors.primaryDark,
  },
  tabContent: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    ...Typography.smallText,
    color: Colors.textPrimaryDark,
    marginBottom: Spacing.md,
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statsGrid2x2: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    ...GlobalStyles.cardOnDark,
    width: '48%',
    marginBottom: Spacing.sm,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  statTitle: {
    ...Typography.statLabel,
    color: Colors.textSecondaryDark,
    marginLeft: 6,
  },
  statValue: {
    ...Typography.statNumber,
    color: Colors.textPrimaryDark,
    marginBottom: 4,
  },
  statSubtitle: {
    ...Typography.statLabel,
    color: Colors.textSecondaryDark,
  },
  achievementCard: {
    ...GlobalStyles.cardOnDark,
    marginBottom: Spacing.sm,
  },
  achievementsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  achievementCardCompact: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  achievementHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  achievementTitle: {
    ...Typography.bodyText,
    color: Colors.textPrimaryDark,
    marginLeft: Spacing.xs,
    fontWeight: '600',
  },
  achievementValue: {
    ...Typography.sectionHeader,
    color: Colors.goldenYellow,
    marginBottom: 4,
  },
  achievementSubtitle: {
    ...Typography.smallText,
    color: Colors.textSecondaryDark,
  },
  shareButton: {
    ...GlobalStyles.buttonMicro,
    ...GlobalStyles.buttonPrimaryDark,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginTop: Spacing.xs,
  },
  shareButtonText: {
    ...GlobalStyles.buttonTextPrimaryDark,
    marginLeft: Spacing.xs,
  },
  trendCard: {
    ...GlobalStyles.cardOnDark,
    marginBottom: Spacing.sm,
  },
  trendHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  trendDate: {
    ...Typography.bodyText,
    color: Colors.textPrimaryDark,
    fontWeight: '600',
  },
  trendBadge: {
    backgroundColor: Colors.secondaryTeal,
    paddingHorizontal: Spacing.xs,
    paddingVertical: 4,
    borderRadius: 6,
  },
  trendBadgeText: {
    ...Typography.statLabel,
    color: Colors.textPrimaryDark,
  },
  trendStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  trendStat: {
    ...Typography.smallText,
    color: Colors.textSecondaryDark,
    marginRight: Spacing.xs,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.secondaryTeal,
    borderRadius: 2,
  },
  detailedStats: {
    ...GlobalStyles.cardOnDark,
  },
  detailedRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  detailedLabel: {
    ...Typography.bodyText,
    color: Colors.textSecondaryDark,
    flex: 1,
  },
  detailedValue: {
    ...Typography.bodyText,
    color: Colors.textPrimaryDark,
    fontWeight: '600',
  },
  sharePreview: {
    ...GlobalStyles.cardOnDark,
    alignItems: 'center',
  },
  shareEmojis: {
    fontSize: 24,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  shareSummary: {
    ...Typography.bodyText,
    color: Colors.textPrimaryDark,
    textAlign: 'center',
    marginBottom: Spacing.xs,
    fontWeight: '600',
  },
  shareRank: {
    ...Typography.smallText,
    color: Colors.goldenYellow,
    fontWeight: '600',
  },
});
