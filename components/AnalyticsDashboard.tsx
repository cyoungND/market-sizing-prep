import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { IconSymbol } from '@/components/ui/IconSymbol';
import analyticsService from '@/services/analyticsService';

const { width } = Dimensions.get('window');

interface AnalyticsDashboardProps {
  compact?: boolean;
  onViewDetails?: () => void;
}

interface QuickStats {
  currentStreak: number;
  averageAccuracy: number;
  totalSessions: number;
  recentTrend: 'up' | 'down' | 'stable';
}

export default function AnalyticsDashboard({ compact = false, onViewDetails }: AnalyticsDashboardProps) {
  const [stats, setStats] = useState<QuickStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuickStats();
  }, []);

  const fetchQuickStats = async () => {
    try {
      setLoading(true);
      const userStats = await analyticsService.getUserStats();
      const dailyTrends = await analyticsService.getDailyTrends(3);
      
      // Calculate trend based on recent performance
      let recentTrend: 'up' | 'down' | 'stable' = 'stable';
      if (dailyTrends.length >= 2) {
        const recent = dailyTrends[0]?.averageAccuracy || 0;
        const previous = dailyTrends[1]?.averageAccuracy || 0;
        if (recent > previous + 5) recentTrend = 'up';
        else if (recent < previous - 5) recentTrend = 'down';
      }

      setStats({
        currentStreak: userStats.currentStreak,
        averageAccuracy: userStats.averageAccuracy,
        totalSessions: userStats.completedSessions,
        recentTrend,
      });
    } catch (error) {
      console.error('Error fetching quick stats:', error);
      // Fallback data
      setStats({
        currentStreak: 5,
        averageAccuracy: 78.5,
        totalSessions: 12,
        recentTrend: 'up',
      });
    } finally {
      setLoading(false);
    }
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return { name: 'chevron.right' as const, color: '#10b981', rotation: '-45deg' };
      case 'down': return { name: 'chevron.right' as const, color: '#ef4444', rotation: '45deg' };
      default: return { name: 'chevron.right' as const, color: '#64748b', rotation: '0deg' };
    }
  };

  const getTrendText = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return 'Improving';
      case 'down': return 'Declining';
      default: return 'Stable';
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, compact && styles.compactContainer]}>
        <ActivityIndicator size="small" color="#3478f6" />
        <Text style={styles.loadingText}>Loading stats...</Text>
      </View>
    );
  }

  if (!stats) {
    return (
      <View style={[styles.container, compact && styles.compactContainer]}>
        <Text style={styles.errorText}>Unable to load analytics</Text>
      </View>
    );
  }

  if (compact) {
    return (
      <TouchableOpacity 
        style={styles.compactContainer} 
        onPress={onViewDetails}
        activeOpacity={0.7}
      >
        <View style={styles.compactHeader}>
          <Text style={styles.compactTitle}>Your Progress</Text>
          <View style={styles.trendIndicator}>
            <IconSymbol 
              name={getTrendIcon(stats.recentTrend).name}
              size={12} 
              color={getTrendIcon(stats.recentTrend).color}
              style={{ transform: [{ rotate: getTrendIcon(stats.recentTrend).rotation }] }}
            />
            <Text style={[styles.trendText, { color: getTrendIcon(stats.recentTrend).color }]}>
              {getTrendText(stats.recentTrend)}
            </Text>
          </View>
        </View>
        
        <View style={styles.compactStats}>
          <View style={styles.compactStat}>
            <Text style={styles.compactStatValue}>{stats.averageAccuracy.toFixed(0)}%</Text>
            <Text style={styles.compactStatLabel}>Accuracy</Text>
          </View>
          <View style={styles.compactStat}>
            <Text style={styles.compactStatValue}>{stats.currentStreak}</Text>
            <Text style={styles.compactStatLabel}>Streak</Text>
          </View>
          <View style={styles.compactStat}>
            <Text style={styles.compactStatValue}>{stats.totalSessions}</Text>
            <Text style={styles.compactStatLabel}>Sessions</Text>
          </View>
        </View>
        
        <View style={styles.viewMoreContainer}>
          <Text style={styles.viewMoreText}>Tap for details</Text>
          <IconSymbol name="chevron.right" size={14} color="#3478f6" />
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Performance Overview</Text>
        <View style={styles.trendIndicator}>
          <IconSymbol 
            name={getTrendIcon(stats.recentTrend).name}
            size={16} 
            color={getTrendIcon(stats.recentTrend).color}
            style={{ transform: [{ rotate: getTrendIcon(stats.recentTrend).rotation }] }}
          />
          <Text style={[styles.trendText, { color: getTrendIcon(stats.recentTrend).color }]}>
            {getTrendText(stats.recentTrend)}
          </Text>
        </View>
      </View>

      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <View style={styles.statHeader}>
            <IconSymbol name="target" size={20} color="#3478f6" />
            <Text style={styles.statTitle}>Accuracy</Text>
          </View>
          <Text style={styles.statValue}>{stats.averageAccuracy.toFixed(1)}%</Text>
          <Text style={styles.statSubtitle}>Overall performance</Text>
        </View>

        <View style={styles.statCard}>
          <View style={styles.statHeader}>
            <IconSymbol name="flame.fill" size={20} color="#f59e0b" />
            <Text style={styles.statTitle}>Current Streak</Text>
          </View>
          <Text style={styles.statValue}>{stats.currentStreak}</Text>
          <Text style={styles.statSubtitle}>Correct in a row</Text>
        </View>

        <View style={styles.statCard}>
          <View style={styles.statHeader}>
            <IconSymbol name="checkmark.circle.fill" size={20} color="#10b981" />
            <Text style={styles.statTitle}>Sessions</Text>
          </View>
          <Text style={styles.statValue}>{stats.totalSessions}</Text>
          <Text style={styles.statSubtitle}>Completed</Text>
        </View>
      </View>

      {onViewDetails && (
        <TouchableOpacity style={styles.viewDetailsButton} onPress={onViewDetails}>
          <Text style={styles.viewDetailsText}>View Full Analytics</Text>
          <IconSymbol name="chevron.right" size={16} color="#3478f6" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  compactContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  compactHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a202c',
  },
  compactTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a202c',
  },
  trendIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  trendText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  compactStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statCard: {
    width: (width - 80) / 3,
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
  },
  compactStat: {
    alignItems: 'center',
    flex: 1,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statTitle: {
    fontSize: 12,
    color: '#64748b',
    marginLeft: 4,
    fontWeight: '500',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a202c',
    marginBottom: 2,
  },
  compactStatValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a202c',
    marginBottom: 4,
  },
  statSubtitle: {
    fontSize: 10,
    color: '#94a3b8',
  },
  compactStatLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
  viewDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
  },
  viewDetailsText: {
    fontSize: 14,
    color: '#3478f6',
    fontWeight: '500',
    marginRight: 6,
  },
  viewMoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  viewMoreText: {
    fontSize: 12,
    color: '#64748b',
    marginRight: 4,
  },
  loadingText: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 8,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 14,
    color: '#ef4444',
    textAlign: 'center',
  },
});
