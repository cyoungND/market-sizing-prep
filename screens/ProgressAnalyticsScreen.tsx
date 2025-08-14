import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Animated,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import Svg, { Rect, Text as SvgText } from 'react-native-svg';
import { Colors, Typography, GlobalStyles, Spacing } from '../constants/Styles';
import { ProgressAnalyticsData, BarChartData, ChartProps } from '../types/Analytics';
import { 
  getProgressAnalytics, 
  generateAccuracyChartData, 
  generateSpeedChartData,
  formatTime 
} from '../utils/analyticsUtils';

const { width: screenWidth } = Dimensions.get('window');
const chartWidth = screenWidth - (Spacing.lg * 4); // Account for card padding
const chartHeight = 120;

interface ProgressAnalyticsScreenProps {
  navigation: any;
}

const BarChart: React.FC<ChartProps> = ({ data, width, height, showValues = true }) => {
  if (data.length === 0) return null;

  const maxValue = Math.max(...data.map(d => d.value), 1);
  const barWidth = (width - (data.length - 1) * 8) / data.length; // 8px gap between bars
  
  return (
    <View style={styles.chartContainer}>
      <Svg width={width} height={height}>
        {data.map((item, index) => {
          const barHeight = (item.value / maxValue) * (height - 30); // Leave space for labels
          const x = index * (barWidth + 8);
          const y = height - barHeight - 20; // Leave space for bottom label
          
          return (
            <React.Fragment key={index}>
              <Rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                fill={item.color}
                rx={4}
              />
              {showValues && (
                <SvgText
                  x={x + barWidth / 2}
                  y={y - 5}
                  fontSize="10"
                  fill={Colors.textPrimaryDark}
                  textAnchor="middle"
                  fontWeight="600"
                >
                  {item.label}
                </SvgText>
              )}
            </React.Fragment>
          );
        })}
      </Svg>
    </View>
  );
};

export default function ProgressAnalyticsScreen({ navigation }: ProgressAnalyticsScreenProps) {
  const [analyticsData, setAnalyticsData] = useState<ProgressAnalyticsData | null>(null);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));

  useEffect(() => {
    loadAnalyticsData();
    
    // Animate screen entrance
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const loadAnalyticsData = async () => {
    const data = await getProgressAnalytics();
    setAnalyticsData(data);
  };

  const handleBack = () => {
    navigation.goBack();
  };

  if (!analyticsData) {
    return (
      <SafeAreaView style={[GlobalStyles.screenWelcome, styles.screen]}>
        <View style={styles.loadingContainer}>
          <Text style={[Typography.bodyText, styles.loadingText]}>
            Loading analytics...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const accuracyChartData = generateAccuracyChartData(analyticsData.recentAccuracy);
  const speedChartData = generateSpeedChartData(analyticsData.recentTimes);

  return (
    <SafeAreaView style={[GlobalStyles.screenWelcome, styles.screen]}>
      <Animated.View 
        style={[
          styles.container,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={handleBack}
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={[Typography.sectionHeader, styles.headerTitle]}>
            Your Progress
          </Text>
        </View>

        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Win Streak Card */}
          <View style={[GlobalStyles.cardOnDark, styles.card]}>
            <Text style={[Typography.smallText, styles.cardTitle]}>
              Win Streak
            </Text>
            <View style={styles.streakContainer}>
              <View style={styles.streakItem}>
                <Text style={[Typography.statNumber, styles.streakNumber]}>
                  {analyticsData.currentStreak}
                </Text>
                <Text style={[Typography.statLabel, styles.streakLabel]}>
                  CURRENT
                </Text>
              </View>
              <View style={styles.streakDivider} />
              <View style={styles.streakItem}>
                <Text style={[Typography.statNumber, styles.streakNumber]}>
                  {analyticsData.bestStreak}
                </Text>
                <Text style={[Typography.statLabel, styles.streakLabel]}>
                  PERSONAL BEST
                </Text>
              </View>
            </View>
          </View>

          {/* Key Stats Grid */}
          <View style={styles.statsGrid}>
            <View style={[GlobalStyles.cardOnDark, styles.statCard]}>
              <Text style={[Typography.statNumber, styles.statNumber]}>
                {analyticsData.totalQuizzes}
              </Text>
              <Text style={[Typography.statLabel, styles.statLabel]}>
                TOTAL COMPLETED
              </Text>
            </View>
            <View style={[GlobalStyles.cardOnDark, styles.statCard]}>
              <Text style={[Typography.statNumber, styles.statNumber]}>
                {analyticsData.totalQuizzes > 0 
                  ? Math.round((analyticsData.recentAccuracy.filter(a => a >= 100).length / Math.min(analyticsData.totalQuizzes, 7)) * 100)
                  : 0}%
              </Text>
              <Text style={[Typography.statLabel, styles.statLabel]}>
                WIN RATE
              </Text>
            </View>
          </View>

          {/* Accuracy Chart */}
          {accuracyChartData.length > 0 && (
            <View style={[GlobalStyles.cardOnDark, styles.card]}>
              <Text style={[Typography.smallText, styles.cardTitle]}>
                Accuracy Trends
              </Text>
              <Text style={[Typography.statLabel, styles.cardSubtitle]}>
                Last {accuracyChartData.length} quizzes
              </Text>
              <BarChart
                data={accuracyChartData}
                width={chartWidth}
                height={chartHeight}
                showValues={true}
              />
            </View>
          )}

          {/* Speed Chart */}
          {speedChartData.length > 0 && (
            <View style={[GlobalStyles.cardOnDark, styles.card]}>
              <Text style={[Typography.smallText, styles.cardTitle]}>
                Speed Trends
              </Text>
              <Text style={[Typography.statLabel, styles.cardSubtitle]}>
                Completion times for last {speedChartData.length} quizzes
              </Text>
              <BarChart
                data={speedChartData}
                width={chartWidth}
                height={chartHeight}
                showValues={true}
              />
            </View>
          )}

          {/* Empty State */}
          {analyticsData.totalQuizzes === 0 && (
            <View style={[GlobalStyles.cardOnDark, styles.card, styles.emptyCard]}>
              <Text style={[Typography.bodyText, styles.emptyTitle]}>
                No Data Yet
              </Text>
              <Text style={[Typography.smallText, styles.emptySubtitle]}>
                Complete a few quizzes to see your progress analytics here!
              </Text>
            </View>
          )}
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: Colors.bgDarkGreen,
  },
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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    marginTop: Spacing.sm,
  },
  backButton: {
    marginRight: Spacing.md,
  },
  backButtonText: {
    ...Typography.buttonText,
    color: Colors.goldenYellow,
    fontSize: 14,
  },
  headerTitle: {
    color: Colors.textPrimaryDark,
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  card: {
    marginBottom: Spacing.lg,
  },
  cardTitle: {
    color: Colors.textPrimaryDark,
    marginBottom: Spacing.sm,
    fontWeight: '600',
  },
  cardSubtitle: {
    color: Colors.textSecondaryDark,
    marginBottom: Spacing.md,
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
  },
  streakItem: {
    flex: 1,
    alignItems: 'center',
  },
  streakNumber: {
    color: Colors.textPrimaryDark,
    marginBottom: 4,
  },
  streakLabel: {
    color: Colors.textSecondaryDark,
  },
  streakDivider: {
    width: 1,
    height: 40,
    backgroundColor: Colors.textSecondaryDark,
    opacity: 0.3,
    marginHorizontal: Spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  statNumber: {
    color: Colors.textPrimaryDark,
    marginBottom: 4,
  },
  statLabel: {
    color: Colors.textSecondaryDark,
  },
  chartContainer: {
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
  },
  emptyTitle: {
    color: Colors.textPrimaryDark,
    marginBottom: Spacing.sm,
    fontWeight: '600',
  },
  emptySubtitle: {
    color: Colors.textSecondaryDark,
    textAlign: 'center',
    lineHeight: 20,
  },
});
