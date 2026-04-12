import { WorkoutRepository } from '@/services/workoutRepository';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';


const weeklyDurationData = [
  { day: 'M', value: 45 },
  { day: 'T', value: 60 },
  { day: 'W', value: 0 },
  { day: 'T', value: 75 },
  { day: 'F', value: 50 },
  { day: 'S', value: 0 },
  { day: 'S', value: 90 }
];
const maxDuration = Math.max(...weeklyDurationData.map(d => d.value), 1);

const currentDate = new Date();
const currentYear = currentDate.getFullYear();
const currentMonth = currentDate.getMonth();
const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

// Mock some active days for presentation
const activeDays = new Set([2, 4, 5, 8, 9, 12, 15, 18, 20, 21, 24, 27, 28]);

const monthActivityData = Array.from({ length: daysInMonth }, (_, index) => {
  const day = index + 1;
  return {
    day,
    active: activeDays.has(day)
  };
});

export default function DashboardScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();

  const [isLoading, setIsLoading] = useState(true);
  const [weeklyStats, setWeeklyStats] = useState({ workouts: 0, volume: 0 });
  const [activeDays, setActiveDays] = useState<number[]>([]);
  const [lastWorkout, setLastWorkout] = useState<any>(null);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      const [stats, attendance, latest] = await Promise.all([
        WorkoutRepository.getWeeklyStats(),
        WorkoutRepository.getMonthAttendance(),
        WorkoutRepository.getLatestWorkout()
      ]);
      if (stats) setWeeklyStats(stats);
      setActiveDays(attendance);
      setLastWorkout(latest);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadDashboardData();
    }, [])
  );

  const currentDate = new Date();
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const monthActivityData = Array.from({ length: daysInMonth }, (_, index) => ({
    day: index + 1,
    active: activeDays.includes(index + 1)
  }));

  const containerWidth = Math.min(width, 768);
  const boxSize = Math.min((containerWidth - 40 - 56) / 7, 48);

  const formatWorkoutDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const daysDiff = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (daysDiff === 0) return 'Today';
    if (daysDiff === 1) return 'Yesterday';
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0B63C6" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollArea}>
        <View style={styles.responsiveWrapper}>

          <Animated.View entering={FadeInUp.delay(50).duration(400)} style={styles.header}>
            <View style={{ flex: 1 }}>
              <Text style={styles.greeting}>Good Evening</Text>
              <Text style={styles.subGreeting}>
                Workouts this week: {weeklyStats.workouts}/4
              </Text>
            </View>
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(100).duration(400)} style={styles.statsCard}>
            <Text style={styles.cardHeader}>THIS WEEK'S PROGRESS</Text>
            <View style={styles.progressRow}>
              <View style={styles.progressItem}>
                <View style={[styles.circle, { borderColor: '#0B63C6' }]}>
                  <Text style={styles.circleText}>{weeklyStats.workouts}</Text>
                </View>
                <Text style={styles.progressLabel}>Workouts</Text>
              </View>

              <View style={styles.progressItem}>
                <View style={[styles.circle, { borderColor: '#4caf50' }]}>
                  <Text style={styles.circleText}>{activeDays.length}</Text>
                </View>
                <Text style={styles.progressLabel}>Active Days</Text>
              </View>

              <View style={styles.progressItem}>
                <View style={[styles.circle, { borderColor: '#f44336' }]}>
                  <Text style={styles.circleText}>
                    {weeklyStats.volume > 1000 ? `${(weeklyStats.volume / 1000).toFixed(1)}k` : weeklyStats.volume}
                  </Text>
                </View>
                <Text style={styles.progressLabel}>Volume (kg)</Text>
              </View>
            </View>
          </Animated.View>

          {/* Consistency Heatmap */}
          <Animated.View entering={FadeInUp.delay(150).duration(400)} style={styles.chartCard}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.cardHeader}>CONSISTENCY RECORD (THIS MONTH)</Text>
            </View>
            <View style={styles.heatmapGrid}>
              {monthActivityData.map((item, i) => (
                <View
                  key={i}
                  style={[
                    styles.heatmapBox,
                    {
                      width: boxSize,
                      height: boxSize,
                      backgroundColor: item.active ? '#0B63C6' : '#f2f4f7'
                    }
                  ]}
                >
                  <Text style={[styles.heatmapDayText, { color: item.active ? '#fff' : '#8b92a5' }]}>
                    {item.day}
                  </Text>
                </View>
              ))}
            </View>
          </Animated.View>

          {/* Main CTA */}
          <Animated.View entering={FadeInUp.delay(200).duration(400)}>
            <Pressable style={styles.startBtn} onPress={() => router.push('/routines')}>
              <Ionicons name="flash" size={20} color="#fff" />
              <Text style={styles.startBtnText}>START NEW WORKOUT</Text>
            </Pressable>
          </Animated.View>

          {/* Last Workout Quick View */}
          {lastWorkout && (
            <Animated.View entering={FadeInUp.delay(250).duration(400)}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.cardHeader}>LAST LOGGED WORKOUT</Text>
              </View>

              <Pressable onPress={() => router.push({
                pathname: '/workout',
                params: { workoutId: lastWorkout.id, routineName: lastWorkout.title }
              })}>
                <View style={styles.lastWorkoutCard}>
                  <View style={styles.lwHeader}>
                    <View style={styles.lwIconBox}>
                      <Ionicons name="barbell" size={20} color="#0B63C6" />
                    </View>
                    <View style={styles.lwTitleBox}>
                      <Text style={styles.lwTitle}>{lastWorkout.title}</Text>
                      <Text style={styles.lwTime}>{formatWorkoutDate(lastWorkout.date)}</Text>
                    </View>
                  </View>

                  <View style={styles.divider} />

                  <View style={styles.lwMetricsRow}>
                    <View style={styles.lwMetric}>
                      <Text style={styles.lwMetricVal}>{lastWorkout.exercise_count}</Text>
                      <Text style={styles.lwMetricLabel}>EXERCISES</Text>
                    </View>
                    <View style={styles.lwMetric}>
                      <Text style={styles.lwMetricVal}>{lastWorkout.total_volume}<Text style={styles.lwMetricUnit}> kg</Text></Text>
                      <Text style={styles.lwMetricLabel}>TOTAL VOLUME</Text>
                    </View>
                  </View>
                </View>
              </Pressable>
            </Animated.View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fc' },
  scrollArea: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 20 },
  responsiveWrapper: { width: '100%', maxWidth: 768, alignSelf: 'center' },

  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  greeting: { fontSize: 26, fontWeight: '800', color: '#111', marginBottom: 4 },
  subGreeting: { fontSize: 14, color: '#555', fontWeight: '500' },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#eef0f5', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#fff', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5, elevation: 3 },

  cardHeader: { fontSize: 11, fontWeight: '700', color: '#8b92a5', letterSpacing: 1, marginBottom: 12 },

  statsCard: { backgroundColor: '#fff', borderRadius: 16, padding: 20, marginBottom: 20, borderWidth: 1, borderColor: '#f0f0f5' },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between' },
  progressItem: { alignItems: 'center', flex: 1 },
  circle: { width: 64, height: 64, borderRadius: 32, borderWidth: 4, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  circleText: { fontSize: 18, fontWeight: '800', color: '#111' },
  progressLabel: { fontSize: 12, fontWeight: '600', color: '#555' },

  chartCard: { backgroundColor: '#fff', borderRadius: 16, padding: 20, marginBottom: 20, borderWidth: 1, borderColor: '#f0f0f5' },
  chartContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 160, marginTop: 12 },
  barItem: { alignItems: 'center', flex: 1 },
  barBackground: { height: 120, width: 28, backgroundColor: '#f2f4f7', borderRadius: 8, justifyContent: 'flex-end', overflow: 'hidden', marginBottom: 8 },
  barFill: { width: '100%', borderRadius: 8, minHeight: 4 },
  barLabel: { fontSize: 13, fontWeight: '600', color: '#888' },

  heatmapGrid: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 16, justifyContent: 'center', marginHorizontal: -4 },
  heatmapBox: { borderRadius: 8, justifyContent: 'center', alignItems: 'center', margin: 4 },
  heatmapDayText: { fontSize: 13, fontWeight: '700', textAlign: 'center' },

  startBtn: { flexDirection: 'row', backgroundColor: '#0B63C6', paddingVertical: 18, borderRadius: 16, justifyContent: 'center', alignItems: 'center', gap: 8, marginBottom: 30, shadowColor: '#0B63C6', shadowOpacity: 0.3, shadowRadius: 15, elevation: 5 },
  startBtnText: { color: '#fff', fontSize: 15, fontWeight: '800', letterSpacing: 1 },

  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  seeAll: { fontSize: 12, fontWeight: '700', color: '#0B63C6' },

  lastWorkoutCard: { backgroundColor: '#fff', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: '#f0f0f5' },
  lwHeader: { flexDirection: 'row', alignItems: 'center' },
  lwIconBox: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#e6f0fa', justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  lwTitleBox: { flex: 1 },
  lwTitle: { fontSize: 15, fontWeight: '800', color: '#111', marginBottom: 4 },
  lwTime: { fontSize: 12, color: '#888', fontWeight: '600' },

  divider: { height: 1, backgroundColor: '#f0f0f5', marginVertical: 16 },

  lwMetricsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  lwMetric: { flex: 1 },
  lwMetricVal: { fontSize: 16, fontWeight: '800', color: '#333', marginBottom: 4 },
  lwMetricUnit: { fontSize: 12, fontWeight: '600', color: '#888' },
  lwMetricLabel: { fontSize: 10, fontWeight: '700', color: '#8b92a5', letterSpacing: 0.5 },
});
