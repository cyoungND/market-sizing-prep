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
  View
} from 'react-native';

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
        <View style={styles.statsGrid}>
          {renderStatCard('Accuracy', `${userStats?.averageAccuracy.toFixed(1)}%`, 'Overall performance', 'target')}
          {renderStatCard('Current Streak', userStats?.currentStreak || 0, 'Correct in a row', 'flame.fill')}
          {renderStatCard('Sessions', `${userStats?.completedSessions}/${userStats?.totalSessions}`, 'Completed', 'checkmark.circle.fill')}
          {renderStatCard('Avg Time', `${userStats?.averageTimePerQuestion}s`, 'Per question', 'clock.fill')}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Achievements</Text>
        <View style={styles.achievementCard}>
          <View style={styles.achievementHeader}>
            <IconSymbol name="trophy.fill" size={24} color="#FFD700" />
            <Text style={styles.achievementTitle}>Longest Streak</Text>
          </View>
          <Text style={styles.achievementValue}>{userStats?.longestStreak} questions</Text>
          <Text style={styles.achievementSubtitle}>Your best performance!</Text>
        </View>
        
        <View style={styles.achievementCard}>
          <View style={styles.achievementHeader}>
            <IconSymbol name="bolt.fill" size={24} color="#FF6B35" />
            <Text style={styles.achievementTitle}>Fastest Time</Text>
          </View>
          <Text style={styles.achievementValue}>{userStats?.fastestTime}s</Text>
          <Text style={styles.achievementSubtitle}>Lightning fast!</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
        <IconSymbol name="square.and.arrow.up" size={20} color="#fff" />
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
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3478f6" />
        <Text style={styles.loadingText}>Loading your analytics...</Text>
      </View>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Analytics Dashboard</Text>
        <TouchableOpacity onPress={fetchAnalyticsData}>
          <IconSymbol name="arrow.clockwise" size={24} color="#3478f6" />
        </TouchableOpacity>
      </View>

      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, selectedView === 'overview' && styles.activeTab]}
          onPress={() => setSelectedView('overview')}
        >
          <Text style={[styles.tabText, selectedView === 'overview' && styles.activeTabText]}>
            Overview
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedView === 'trends' && styles.activeTab]}
          onPress={() => setSelectedView('trends')}
        >
          <Text style={[styles.tabText, selectedView === 'trends' && styles.activeTabText]}>
            Trends
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedView === 'detailed' && styles.activeTab]}
          onPress={() => setSelectedView('detailed')}
        >
          <Text style={[styles.tabText, selectedView === 'detailed' && styles.activeTabText]}>
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
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7fafc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f7fafc',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a202c',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
    marginHorizontal: 4,
  },
  activeTab: {
    backgroundColor: '#3478f6',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748b',
  },
  activeTabText: {
    color: '#fff',
  },
  tabContent: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a202c',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: (width - 60) / 2,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statTitle: {
    fontSize: 14,
    color: '#64748b',
    marginLeft: 6,
    fontWeight: '500',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a202c',
    marginBottom: 4,
  },
  statSubtitle: {
    fontSize: 12,
    color: '#94a3b8',
  },
  achievementCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  achievementHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a202c',
    marginLeft: 8,
  },
  achievementValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#3478f6',
    marginBottom: 4,
  },
  achievementSubtitle: {
    fontSize: 14,
    color: '#64748b',
  },
  shareButton: {
    backgroundColor: '#3478f6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  shareButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  trendCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  trendHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  trendDate: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a202c',
  },
  trendBadge: {
    backgroundColor: '#10b981',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  trendBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  trendStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  trendStat: {
    fontSize: 14,
    color: '#64748b',
    marginRight: 8,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#e2e8f0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10b981',
    borderRadius: 2,
  },
  detailedStats: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  detailedRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  detailedLabel: {
    fontSize: 16,
    color: '#64748b',
    flex: 1,
  },
  detailedValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a202c',
  },
  sharePreview: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  shareEmojis: {
    fontSize: 24,
    marginBottom: 12,
    textAlign: 'center',
  },
  shareSummary: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a202c',
    textAlign: 'center',
    marginBottom: 8,
  },
  shareRank: {
    fontSize: 14,
    color: '#3478f6',
    fontWeight: '600',
  },
});
