import { WorkoutRepository } from '@/services/workoutRepository';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';


interface WorkoutHistoryItem {
  id: number;
  title: string;
  date: string;
  exercise_count: number;
  total_volume: number;
}


const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  return {
    month: months[date.getMonth()],
    day: date.getDate().toString().padStart(2, '0')
  };
};

export default function HistoryScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('DAILY');
  const [history, setHistory] = useState<WorkoutHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadHistory = async () => {
    try {
      setIsLoading(true);
      const data = await WorkoutRepository.getWorkoutHistory();
      setHistory(data);
    } catch (error) {
      console.error('Failed to load history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getFilteredHistory = () => {
    const now = new Date();
    if (activeTab === 'DAILY') return history;

    if (activeTab === 'WEEKLY') {
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday
      startOfWeek.setHours(0, 0, 0, 0);
      return history.filter(item => new Date(item.date) >= startOfWeek);
    }

    if (activeTab === 'MONTHLY') {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      startOfMonth.setHours(0, 0, 0, 0);
      return history.filter(item => new Date(item.date) >= startOfMonth);
    }
    return history;
  };

  const filteredHistory = getFilteredHistory();

  useFocusEffect(
    useCallback(() => {
      loadHistory();
    }, [])
  );

  const getSectionTitle = () => {
    switch (activeTab) {
      case 'DAILY': return 'CHRONOLOGICAL SEQUENCE';
      case 'WEEKLY': return 'SESSIONS THIS WEEK';
      case 'MONTHLY': return 'SESSIONS THIS MONTH';
      default: return 'WORKOUT HISTORY';
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.tabsContainer}>
          {['DAILY', 'WEEKLY', 'MONTHLY'].map(tab => (
            <Pressable
              key={tab}
              style={[styles.tab, activeTab === tab && styles.activeTab]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>{tab}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>{getSectionTitle()}</Text>

        {isLoading ? (
          <View style={{ paddingVertical: 40 }}>
            <ActivityIndicator size="large" color="#0B63C6" />
          </View>
        ) : filteredHistory.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-outline" size={48} color="#ccc" />
            <Text style={styles.emptyText}>
              {activeTab === 'DAILY'
                ? 'No workout history yet.'
                : `No workouts found for this ${activeTab.toLowerCase().replace('ly', '')}.`}
            </Text>
            <Pressable style={styles.startBtn} onPress={() => router.push('/routines')}>
              <Text style={styles.startBtnText}>START YOUR FIRST WORKOUT</Text>
            </Pressable>
          </View>
        ) : (
          filteredHistory.map((item, index) => {
            const dateInfo = formatDate(item.date);
            return (
              <Animated.View
                key={item.id}
                entering={FadeInUp.delay(index * 100).duration(400)}
              >
                <Pressable
                  style={styles.card}
                  onPress={() => router.push({
                    pathname: '/workout',
                    params: { workoutId: item.id, routineName: item.title, viewOnly: 'true' }
                  })}
                >
                  <View style={styles.dateSection}>
                    <Text style={styles.monthText}>{dateInfo.month}</Text>
                    <Text style={styles.dayText}>{dateInfo.day}</Text>
                  </View>

                  <View style={styles.divider} />

                  <View style={styles.contentSection}>
                    <View style={styles.titleRow}>
                      <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
                    </View>

                    <View style={styles.statsRow}>
                      <View style={styles.statBox}>
                        <Text style={styles.statLabel}>VOLUME</Text>
                        <Text style={[styles.statValue, styles.statValueHighlight]}>
                          {item.total_volume} kg
                        </Text>
                      </View>
                      <View style={styles.statBox}>
                        <Text style={styles.statLabel}>EXERCISES</Text>
                        <Text style={styles.statValue}>
                          {item.exercise_count} items
                        </Text>
                      </View>
                      <Ionicons name="chevron-forward" size={16} color="#ccc" style={styles.chevron} />
                    </View>
                  </View>
                </Pressable>
              </Animated.View>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fc' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
    gap: 12
  },
  tabsContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 4,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 6,
  },
  activeTab: { backgroundColor: '#5C4AE4' },
  tabText: { fontSize: 13, fontWeight: '700', color: '#555' },
  activeTabText: { color: '#fff' },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 20 },
  emptyContainer: {
    marginTop: 60,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyText: {
    fontSize: 14,
    color: '#8b92a5',
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 24,
  },
  startBtn: {
    backgroundColor: '#0B63C6',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  startBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
  },
  sectionTitle: { fontSize: 12, fontWeight: '700', color: '#8b92a5', letterSpacing: 1, marginBottom: 16 },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#f0f0f5'
  },
  dateSection: { width: 50, alignItems: 'center', justifyContent: 'center' },
  monthText: { fontSize: 12, fontWeight: '700', color: '#555', marginBottom: 2 },
  dayText: { fontSize: 24, fontWeight: '800', color: '#111' },
  divider: { width: 1, backgroundColor: '#f0f0f5', marginHorizontal: 16 },
  contentSection: { flex: 1, justifyContent: 'center' },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  cardTitle: { flex: 1, fontSize: 14, fontWeight: '700', color: '#111', marginRight: 8 },
  statsRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' },
  statBox: { marginRight: 24, marginBottom: 4 },
  statLabel: { fontSize: 10, color: '#888', fontWeight: '600', marginBottom: 2 },
  statValue: { fontSize: 13, color: '#333', fontWeight: '500' },
  statValueHighlight: { color: '#5C4AE4' },
  chevron: { position: 'absolute', right: 0, alignSelf: 'center' }
});
