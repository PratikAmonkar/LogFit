import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const generateMockMonth = (days: number, actives: number[]) => {
  const activeSet = new Set(actives);
  return Array.from({ length: days }, (_, i) => ({
    day: i + 1,
    active: activeSet.has(i + 1)
  }));
};

const monthsData = [
  { name: 'April 2026', data: generateMockMonth(30, [2, 4, 5, 8, 9, 12, 15, 18, 20, 21, 24, 27, 28]) },
  { name: 'March 2026', data: generateMockMonth(31, [1, 3, 4, 7, 10, 11, 14, 15, 18, 20, 22, 25, 28, 29, 31]) },
  { name: 'February 2026', data: generateMockMonth(28, [2, 5, 6, 9, 12, 14, 16, 17, 20, 23, 24, 26, 27]) },
  { name: 'January 2026', data: generateMockMonth(31, [3, 4, 8, 10, 12, 15, 18, 21, 22, 25, 27, 29, 30]) }
];

export default function AttendanceScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#111" />
        </Pressable>
        <Text style={styles.title}>All Attendance</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollArea} showsVerticalScrollIndicator={false}>
        <View style={styles.responsiveWrapper}>
          <Animated.View entering={FadeInUp.delay(50).duration(400)} style={styles.statsRow}>
            <View style={styles.statBox}>
              <Ionicons name="flame" size={28} color="#ff9800" marginBottom={8} />
              <Text style={styles.statVal}>12</Text>
              <Text style={styles.statLabel}>Day Streak</Text>
            </View>
            <View style={styles.statBox}>
              <Ionicons name="calendar-outline" size={28} color="#0B63C6" marginBottom={8} />
              <Text style={styles.statVal}>114</Text>
              <Text style={styles.statLabel}>Total Visits</Text>
            </View>
            <View style={styles.statBox}>
              <Ionicons name="trophy-outline" size={28} color="#4caf50" marginBottom={8} />
              <Text style={styles.statVal}>48%</Text>
              <Text style={styles.statLabel}>Consistency</Text>
            </View>
          </Animated.View>

          {monthsData.map((month, mIdx) => (
            <Animated.View key={month.name} entering={FadeInUp.delay(100 + mIdx * 100).duration(400)} style={styles.card}>
              <Text style={styles.monthTitle}>{month.name}</Text>

              <View style={styles.heatmapGrid}>
                {month.data.map((item, i) => (
                  <View key={i} style={[styles.heatmapBox, { backgroundColor: item.active ? '#0B63C6' : '#f2f4f7' }]}>
                    <Text style={[styles.heatmapDayText, { color: item.active ? '#fff' : '#8b92a5' }]}>{item.day}</Text>
                  </View>
                ))}
              </View>

            </Animated.View>
          ))}

          <View style={{ height: 40 }} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fc' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 10, paddingBottom: 20 },
  backBtn: { marginRight: 16 },
  title: { fontSize: 24, fontWeight: '800', color: '#111' },
  scrollArea: { paddingHorizontal: 20 },
  responsiveWrapper: { width: '100%', maxWidth: 768, alignSelf: 'center' },

  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24, gap: 12 },
  statBox: { flex: 1, backgroundColor: '#fff', paddingVertical: 20, borderRadius: 16, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 10, elevation: 2, borderWidth: 1, borderColor: '#f0f0f5' },
  statVal: { fontSize: 22, fontWeight: '900', color: '#111', marginBottom: 2 },
  statLabel: { fontSize: 11, fontWeight: '700', color: '#888', textTransform: 'uppercase' },

  card: { backgroundColor: '#fff', borderRadius: 16, padding: 20, marginBottom: 20, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 10, elevation: 2, borderWidth: 1, borderColor: '#f0f0f5' },
  monthTitle: { fontSize: 16, fontWeight: '800', color: '#111', marginBottom: 16 },

  heatmapGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-start', marginHorizontal: -4 },
  heatmapBox: { width: 38, height: 38, borderRadius: 8, justifyContent: 'center', alignItems: 'center', margin: 4 },
  heatmapDayText: { fontSize: 13, fontWeight: '700', textAlign: 'center' }
});
