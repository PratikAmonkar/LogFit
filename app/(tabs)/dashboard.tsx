import { WorkoutRepository } from "@/services/workoutRepository";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

export default function DashboardScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();

  const [isLoading, setIsLoading] = useState(true);
  const [isReady, setIsReady] = useState(false);
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

  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => setIsReady(true), 500);
      return () => clearTimeout(timer);
    } else {
      setIsReady(false);
    }
  }, [isLoading]);

  useFocusEffect(
    useCallback(() => {
      loadDashboardData();
    }, [])
  );

  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const monthActivityData = Array.from({ length: daysInMonth }, (_, index) => ({
    day: index + 1,
    active: activeDays.includes(index + 1)
  }));

  const containerWidth = Math.min(width, 768);
  const boxSize = Math.min((containerWidth - 40 - 70) / 7, 44);

  const formatDateInfo = (dateStr: string) => {
    const date = new Date(dateStr);
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    return {
      month: months[date.getMonth()],
      day: date.getDate().toString().padStart(2, '0')
    };
  };

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
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#0B63C6" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollArea}>
        <View style={styles.responsiveWrapper}>

          {/* Modern Header */}
          <Animated.View entering={FadeInUp.delay(50).duration(400)} style={styles.header}>
            <View style={{ flex: 1 }}>
              <Text style={styles.dateLabel}>{formattedDate}</Text>
              <Text style={styles.greeting}>Hey Hero!</Text>
            </View>
          </Animated.View>

          {/* Activity Overiew Grid */}
          <Text style={styles.sectionTitle}>ACTIVITY OVERVIEW</Text>
          <View style={styles.statsRow}>
            <Animated.View entering={FadeInUp.delay(150).duration(400)} style={[styles.statMiniCard, { backgroundColor: '#EEF4FF' }]}>
              <View style={[styles.miniIconBox, { backgroundColor: '#D9E8FF' }]}>
                <Ionicons name="flame" size={20} color="#0B63C6" />
              </View>
              <Text style={styles.miniVal}>{weeklyStats.workouts}</Text>
              <Text style={styles.miniLabel}>Workouts</Text>
            </Animated.View>

            <Animated.View entering={FadeInUp.delay(200).duration(400)} style={[styles.statMiniCard, { backgroundColor: '#F0FFF4' }]}>
              <View style={[styles.miniIconBox, { backgroundColor: '#DCFCE7' }]}>
                <Ionicons name="stats-chart" size={20} color="#22C55E" />
              </View>
              <Text style={styles.miniVal}>{activeDays.length}</Text>
              <Text style={styles.miniLabel}>Active Days</Text>
            </Animated.View>

            <Animated.View entering={FadeInUp.delay(250).duration(400)} style={[styles.statMiniCard, { backgroundColor: '#FFF5F5' }]}>
              <View style={[styles.miniIconBox, { backgroundColor: '#FFE4E4' }]}>
                <Ionicons name="barbell" size={20} color="#EF4444" />
              </View>
              <Text style={styles.miniVal}>{weeklyStats.volume > 1000 ? `${(weeklyStats.volume / 1000).toFixed(1)}k` : weeklyStats.volume}</Text>
              <Text style={styles.miniLabel}>Vol (kg)</Text>
            </Animated.View>
          </View>

          {/* Consistency Heatmap */}
          <Animated.View
            entering={FadeInUp.delay(300).duration(400)}
            style={[styles.chartCard, {
              shadowOpacity: isReady ? 0.02 : 0,
              elevation: isReady ? 1 : 0
            }]}
          >
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.cardHeader}>MONTHLY CONSISTENCY</Text>
              <Ionicons name="information-circle-outline" size={16} color="#8b92a5" />
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
                      backgroundColor: item.active ? '#5C4AE4' : '#F8FAFC',
                      borderWidth: item.active ? 0 : 1,
                      borderColor: '#F1F5F9'
                    }
                  ]}
                >
                  <Text style={[styles.heatmapDayText, { color: item.active ? '#fff' : '#CBD5E1' }]}>
                    {item.day}
                  </Text>
                </View>
              ))}
            </View>
          </Animated.View>

          {/* Last Workout Quick View - History Style */}
          {lastWorkout && (
            <Animated.View entering={FadeInUp.delay(350).duration(400)}>
              <Text style={styles.sectionTitle}>LAST SESSION RESULTS</Text>
              <Pressable
                style={[styles.historyStyleCard, {
                  shadowOpacity: isReady ? 0.02 : 0,
                  elevation: isReady ? 1 : 0
                }]}
                onPress={() => router.push({
                  pathname: '/workout',
                  params: { workoutId: lastWorkout.id, routineName: lastWorkout.title }
                })}
              >
                <View style={styles.dateSection}>
                  <Text style={styles.monthText}>{formatDateInfo(lastWorkout.date).month}</Text>
                  <Text style={styles.dayText}>{formatDateInfo(lastWorkout.date).day}</Text>
                </View>

                <View style={styles.verticalDivider} />

                <View style={styles.contentSection}>
                  <View style={styles.titleRow}>
                    <Text style={styles.cardTitle} numberOfLines={1}>{lastWorkout.title}</Text>
                  </View>

                  <View style={styles.metricsRow}>
                    <View style={styles.statBox}>
                      <Text style={styles.statLabel}>VOLUME</Text>
                      <Text style={[styles.statValue, styles.statValueHighlight]}>
                        {lastWorkout.total_volume} kg
                      </Text>
                    </View>
                    <View style={styles.statBox}>
                      <Text style={styles.statLabel}>EXERCISES</Text>
                      <Text style={styles.statValue}>
                        {lastWorkout.exercise_count} items
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color="#ccc" style={styles.chevron} />
                  </View>
                </View>
              </Pressable>
            </Animated.View>
          )}
        </View>
      </ScrollView>

      {/* Modern Circular FAB */}
      <Animated.View entering={FadeInUp.delay(600).duration(500)} style={styles.fabContainer}>
        <Pressable
          style={[styles.fab, {
            shadowOpacity: isReady ? 0.1 : 0,
            elevation: isReady ? 2 : 0
          }]}
          onPress={() => router.push('/routines')}
        >
          <Ionicons name="add" size={32} color="#fff" />
        </Pressable>
      </Animated.View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scrollArea: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 100 },
  responsiveWrapper: { width: '100%', maxWidth: 768, alignSelf: 'center' },

  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 28, marginTop: 10 },
  dateLabel: { fontSize: 13, fontWeight: '700', color: '#8b92a5', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 },
  greeting: { fontSize: 32, fontWeight: '900', color: '#111' },
  profileBtn: { marginLeft: 10 },
  avatarPlaceholder: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#f2f4f7', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#fff' },
  avatarText: { fontSize: 16, fontWeight: '900', color: '#333' },

  sectionTitle: { fontSize: 12, fontWeight: '800', color: '#cbd5e1', letterSpacing: 1, marginBottom: 16, marginTop: 10 },

  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 28 },
  statMiniCard: { flex: 1, padding: 16, borderRadius: 20, alignItems: 'flex-start' },
  miniIconBox: { width: 36, height: 36, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  miniVal: { fontSize: 20, fontWeight: '900', color: '#111', marginBottom: 2 },
  miniLabel: { fontSize: 10, fontWeight: '700', color: '#666', textTransform: 'uppercase' },

  chartCard: { backgroundColor: '#fff', borderRadius: 28, padding: 24, marginBottom: 20, borderWidth: 1, borderColor: '#f1f5f9' },
  cardHeader: { fontSize: 13, fontWeight: '800', color: '#111', letterSpacing: 0.5 },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },

  heatmapGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-start', marginHorizontal: -4 },
  heatmapBox: { borderRadius: 10, justifyContent: 'center', alignItems: 'center', margin: 4 },
  heatmapDayText: { fontSize: 11, fontWeight: '800', textAlign: 'center' },

  fabContainer: { position: 'absolute', bottom: 30, right: 30 },
  fab: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#5C4AE4', justifyContent: 'center', alignItems: 'center', elevation: 8, shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 10 },

  // History style card for Dashboard - Flat version
  historyStyleCard: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: '#f1f5f9' },
  dateSection: { width: 50, alignItems: 'center', justifyContent: 'center' },
  monthText: { fontSize: 12, fontWeight: '700', color: '#64748b', marginBottom: 2 },
  dayText: { fontSize: 24, fontWeight: '800', color: '#0f172a' },
  verticalDivider: { width: 1, backgroundColor: '#f1f5f9', marginHorizontal: 16 },
  contentSection: { flex: 1, justifyContent: 'center' },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  cardTitle: { flex: 1, fontSize: 16, fontWeight: '800', color: '#0f172a', marginRight: 8 },
  metricsRow: { flexDirection: 'row', alignItems: 'center' },
  statBox: { marginRight: 24 },
  statLabel: { fontSize: 9, color: '#94a3b8', fontWeight: '800', marginBottom: 2, letterSpacing: 0.5 },
  statValue: { fontSize: 14, color: '#334155', fontWeight: '700' },
  statValueHighlight: { color: '#0B63C6' },
  chevron: { position: 'absolute', right: 0 },
});
