import { StorageRepository } from '@/services/storageRepository';
import { UserRepository } from '@/services/userRepository';
import { useUserStore } from '@/store/userStore';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const DAYS = [
  { full: 'Monday', short: 'M' },
  { full: 'Tuesday', short: 'T' },
  { full: 'Wednesday', short: 'W' },
  { full: 'Thursday', short: 'Th' },
  { full: 'Friday', short: 'F' },
  { full: 'Saturday', short: 'S' },
];

export default function ScheduleScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const { isLoading, updateProfile, loadProfile } = useUserStore()
  const { gender, weight, height, weightUnit, heightUnit, mode, time, days } = useLocalSearchParams();
  const initialDays = days ? (days as string).split(', ') : ['M', 'T', 'W', 'Th', 'F', 'S'];
  const [selectedDays, setSelectedDays] = useState<string[]>(initialDays);

  const isEdit = mode === 'edit';

  const parseTime = () => {
    if (!time) return { h: 6, m: 30, p: 'AM' as const };

    const [t, p] = (time as string).split(' ');
    const [h, m] = t.split(':');

    return {
      h: parseInt(h),
      m: parseInt(m),
      p: p as 'AM' | 'PM'
    };
  };

  const timeData = parseTime();

  const [hour, setHour] = useState(timeData.h);
  const [minute, setMinute] = useState(timeData.m);
  const [period, setPeriod] = useState<'AM' | 'PM'>(timeData.p);


  const toggleDay = (short: string) => {
    if (selectedDays.includes(short)) {
      setSelectedDays(selectedDays.filter(d => d !== short));
    } else {
      setSelectedDays([...selectedDays, short]);
    }
  };

  const periodStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: withSpring(period === 'AM' ? 0 : 50) }]
  }));

  const handleFinish = async () => {
    const formattedHour = hour < 10 ? `0${hour}` : hour;
    const formattedMinute = minute < 10 ? `0${minute}` : minute;
    const gymTime = `${formattedHour}:${formattedMinute} ${period}`;
    const daysOrder = ['M', 'T', 'W', 'Th', 'F', 'S', 'Su'];
    const gymDays = [...selectedDays]
      .sort((a, b) => daysOrder.indexOf(a) - daysOrder.indexOf(b))
      .join(', ');
    if (isEdit) {
      await updateProfile({
        gym_time: gymTime,
        gym_days: gymDays,
      });
      router.back();
    } else {
      await UserRepository.saveProfile({
        gender: gender as string,
        weight: parseFloat(weight as string),
        height: parseFloat(height as string),
        weight_unit: weightUnit as string,
        height_unit: heightUnit as string,
        timer_value: 60,
        gym_time: gymTime,
        gym_days: gymDays,
      });
      await StorageRepository.setSetupCompleted(true);
      await loadProfile();

      (navigation as any).reset({
        index: 0,
        routes: [{ name: '(tabs)' }],
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={{ height: 40, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24 }}>
        {isEdit && (
          <Pressable onPress={() => router.back()} style={{ padding: 10, paddingLeft: 0 }}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </Pressable>
        )}
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.delay(100).duration(600)}>
          <Text style={styles.title}>{isEdit ? 'Update Schedule' : "What's your gym schedule?"}</Text>
          <Text style={styles.subtitle}>{isEdit ? 'Change your active days and time preference.' : 'Specify the days and time you plan to hit the weights.'}</Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).duration(600)} style={styles.section}>
          <Text style={styles.sectionLabel}>ACTIVE DAYS</Text>
          <View style={styles.daysGrid}>
            {DAYS.map((day, i) => {
              const isActive = selectedDays.includes(day.short);
              return (
                <Pressable
                  key={i}
                  onPress={() => toggleDay(day.short)}
                  style={[styles.dayCircle, isActive && styles.dayCircleActive]}
                >
                  <Text style={[styles.dayText, isActive && styles.dayTextActive]}>{day.short}</Text>
                </Pressable>
              );
            })}
          </View>
          <Text style={styles.hintText}>
            Selected: {selectedDays.length} days per week
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(300).duration(600)} style={styles.section}>
          <Text style={styles.sectionLabel}>PREFERRED TIME</Text>
          <View style={styles.timeSelector}>
            <View style={styles.timeInputs}>
              <View style={styles.timeBox}>
                <Pressable onPress={() => setHour(h => h === 12 ? 1 : h + 1)} style={styles.arrow}>
                  <Ionicons name="chevron-up" size={20} color="#0B63C6" />
                </Pressable>
                <Text style={styles.timeVal}>{hour < 10 ? `0${hour}` : hour}</Text>
                <Pressable onPress={() => setHour(h => h === 1 ? 12 : h - 1)} style={styles.arrow}>
                  <Ionicons name="chevron-down" size={20} color="#0B63C6" />
                </Pressable>
              </View>
              <Text style={styles.colon}>:</Text>
              <View style={styles.timeBox}>
                <Pressable onPress={() => setMinute(m => m === 55 ? 0 : m + 5)} style={styles.arrow}>
                  <Ionicons name="chevron-up" size={20} color="#0B63C6" />
                </Pressable>
                <Text style={styles.timeVal}>{minute < 10 ? `0${minute}` : minute}</Text>
                <Pressable onPress={() => setMinute(m => m === 0 ? 55 : m - 5)} style={styles.arrow}>
                  <Ionicons name="chevron-down" size={20} color="#0B63C6" />
                </Pressable>
              </View>
            </View>

            <View style={styles.periodToggle}>
              <Animated.View style={[styles.periodSlider, periodStyle]} />
              <Pressable style={styles.periodOption} onPress={() => setPeriod('AM')}>
                <Text style={[styles.periodText, period === 'AM' && styles.periodTextActive]}>AM</Text>
              </Pressable>
              <Pressable style={styles.periodOption} onPress={() => setPeriod('PM')}>
                <Text style={[styles.periodText, period === 'PM' && styles.periodTextActive]}>PM</Text>
              </Pressable>
            </View>
          </View>
        </Animated.View>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable style={styles.button} onPress={handleFinish}>
          <Text style={styles.buttonText}>FINISH</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  headerNav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, height: 56 },
  backBtn: { width: 44, height: 44, justifyContent: 'center' },
  stepText: { fontSize: 13, fontWeight: '700', color: '#888', letterSpacing: 1 },
  content: { paddingHorizontal: 24, paddingTop: 20 },
  title: { fontSize: 32, fontWeight: '800', color: '#111', marginBottom: 12, lineHeight: 40 },
  subtitle: { fontSize: 15, color: '#666', lineHeight: 22, marginBottom: 32 },
  section: { marginBottom: 40 },
  sectionLabel: { fontSize: 12, fontWeight: '800', color: '#8b92a5', letterSpacing: 2, marginBottom: 20 },
  daysGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  dayCircle: { width: 42, height: 42, borderRadius: 21, borderWidth: 1.5, borderColor: '#f2f4f7', justifyContent: 'center', alignItems: 'center', backgroundColor: '#fcfdfe' },
  dayCircleActive: { backgroundColor: '#0B63C6', borderColor: '#0B63C6' },
  dayText: { fontSize: 15, fontWeight: '700', color: '#555' },
  dayTextActive: { color: '#fff' },
  hintText: { fontSize: 13, color: '#8b92a5', fontWeight: '600', marginTop: 8 },
  timeSelector: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#f8f9fc', padding: 24, borderRadius: 24 },
  timeInputs: { flexDirection: 'row', alignItems: 'center' },
  timeBox: { alignItems: 'center' },
  arrow: { padding: 8 },
  timeVal: { fontSize: 36, fontWeight: '900', color: '#111', marginVertical: 4, width: 60, textAlign: 'center' },
  colon: { fontSize: 32, fontWeight: '800', color: '#111', marginHorizontal: 8, marginTop: 16 },
  periodToggle: { width: 100, height: 50, backgroundColor: '#fff', borderRadius: 25, flexDirection: 'row', padding: 4, position: 'relative', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
  periodSlider: { position: 'absolute', top: 4, left: 4, width: 42, height: 42, borderRadius: 21, backgroundColor: '#0B63C6' },
  periodOption: { flex: 1, justifyContent: 'center', alignItems: 'center', zIndex: 1 },
  periodText: { fontSize: 13, fontWeight: '800', color: '#8b92a5' },
  periodTextActive: { color: '#fff' },
  footer: { padding: 24, paddingBottom: 32 },
  button: { backgroundColor: '#5C4AE4', paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});
