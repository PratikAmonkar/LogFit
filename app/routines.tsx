import { DatabaseRoutine, RoutineRepository } from '@/services/routineRepository';
import { WorkoutRepository } from '@/services/workoutRepository';
import { useRoutineStore } from '@/store/routineStore';
import { Ionicons } from '@expo/vector-icons';
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const HOURS = [0, 1, 2, 3, 4, 5];
const MINUTES = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];
const QUICK_DURATIONS = ['30 min', '45 min', '60 min', '90 min'];

const RoutineCard = ({ routine, index, onEdit, onStart, onDelete }: any) => {
  const [isEntered, setIsEntered] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsEntered(true), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Animated.View
      entering={FadeIn.delay(index * 50).duration(400)}
      style={[
        styles.card,
        {
          elevation: isEntered ? 2 : 0,
          shadowOpacity: isEntered ? 0.04 : 0
        }
      ]}
    >
      <View style={styles.cardHeaderRow}>
        <Text style={styles.cardTitle}>{routine.name}</Text>
        <Pressable onPress={() => onEdit(routine)} style={styles.editBtn}>
          <Ionicons name="pencil-outline" size={18} color="#8b92a5" />
        </Pressable>
      </View>

      <View style={styles.metaRow}>
        <View style={styles.badge}>
          <Ionicons name="calendar-outline" size={12} color="#555" style={{ marginRight: 4 }} />
          <Text style={styles.badgeText}>{routine.days}</Text>
        </View>
        <View style={styles.badge}>
          <Ionicons name="time-outline" size={12} color="#555" style={{ marginRight: 4 }} />
          <Text style={styles.badgeText}>{routine.duration}</Text>
        </View>
      </View>

      <View style={styles.cardFooter}>
        <Pressable style={styles.startBtn} onPress={() => onStart(routine)}>
          <Text style={styles.startBtnText}>START ROUTINE</Text>
          <Ionicons name="play" size={14} color="#fff" style={{ marginLeft: 6 }} />
        </Pressable>
        <Pressable onPress={() => {
          if (routine.id) {
            onDelete(routine.id)
          }
        }} style={styles.deleteBtn}>
          <Ionicons name="trash-outline" size={20} color="#d94b4b" />
        </Pressable>
      </View>
    </Animated.View>
  );
};

export default function RoutinesScreen() {
  const router = useRouter();
  const { getRoutines, data, addRoutine, updateRoutine, deleteRoutine, isLoading } = useRoutineStore()
  const insets = useSafeAreaInsets();

  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', days: '', duration: '' });
  const [showPicker, setShowPicker] = useState(false);

  const renderBackdrop = useCallback(
    (props: any) => <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} />,
    []
  );

  const [activeWorkout, setActiveWorkout] = useState<any>(null);

  useFocusEffect(
    useCallback(() => {
      checkActiveWorkout();
      getRoutines();
    }, [])
  );

  const checkActiveWorkout = async () => {
    try {
      const active = await WorkoutRepository.getAnyActiveWorkoutToday();
      setActiveWorkout(active);
    } catch (err) {
      console.error("Checking active workout failed", err);
    }
  };

  const openAddModal = () => {
    setEditingId(null);
    setForm({ name: '', days: '', duration: '' });
    setShowPicker(false);
    bottomSheetModalRef.current?.present();
  };

  const openEditModal = (routine: DatabaseRoutine) => {
    setEditingId(routine.id!.toString());
    setForm(routine);
    setShowPicker(false);
    bottomSheetModalRef.current?.present();
  };

  const saveRoutine = () => {
    if (!form.name) return;
    if (editingId) {
      updateRoutine(form);
    } else {
      addRoutine(form);
    }
    bottomSheetModalRef.current?.dismiss();
  };

  const toggleDay = (day: string) => {
    const currentDays = form.days ? form.days.split(', ') : [];
    const isSelected = currentDays.includes(day);
    let updatedDays;

    if (isSelected) {
      updatedDays = currentDays.filter(d => d !== day);
    } else {
      updatedDays = [...currentDays, day];
      updatedDays.sort((a, b) => DAYS_OF_WEEK.indexOf(a) - DAYS_OF_WEEK.indexOf(b));
    }

    setForm({ ...form, days: updatedDays.join(', ') });
  };

  const updateDuration = (h: number, m: number) => {
    let dur = '';
    if (h > 0 && m > 0) dur = `${h} hr ${m} min`;
    else if (h > 0) dur = `${h} hr`;
    else dur = `${m} min`;
    setForm({ ...form, duration: dur });
  };

  const getDurationValues = () => {
    const hMatch = form.duration.match(/(\d+)\s*hr/);
    const mMatch = form.duration.match(/(\d+)\s*min/);
    return {
      h: hMatch ? parseInt(hMatch[1]) : 0,
      m: mMatch ? parseInt(mMatch[1]) : (form.duration.includes('hr') ? 0 : parseInt(form.duration) || 0)
    };
  };

  const handleStartRoutine = async (routine: DatabaseRoutine) => {
    if (!routine.id) return;

    // 1. Check if already started today
    const existing = await WorkoutRepository.getTodayWorkout(routine.name);
    if (existing) {
      return router.push({
        pathname: '/workout',
        params: { workoutId: existing.id, routineName: routine.name }
      });
    }

    // 2. Otherwise check exercises
    const exercises = await RoutineRepository.getRoutineExercises(routine.id);

    if (exercises.length === 0) {
      router.push({
        pathname: '/exercises',
        params: { routineId: routine.id, routineName: routine.name }
      });
    } else {
      // Create session and clone exercises
      const newWorkoutId = await WorkoutRepository.createWorkout(routine.name);
      await RoutineRepository.cloneTemplateToWorkout(routine.id, newWorkoutId);

      router.push({
        pathname: '/workout',
        params: { workoutId: newWorkoutId, routineName: routine.name }
      });
    }
  };


  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color="#111" />
          </Pressable>
          <Text style={styles.title}>My Workouts</Text>
        </View>
        <Pressable onPress={openAddModal} style={styles.addIconBtn}>
          <Ionicons name="add" size={24} color="#0B63C6" />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={[styles.scrollContent, { flex: isLoading ? 1 : 0 }]} showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 40 }}>
            <ActivityIndicator size="large" color="#0B63C6" />
          </View>
        ) : (
          <View style={styles.responsiveWrapper}>
            {data.length > 0 ? (
              data.map((routine, index) => (
                <RoutineCard key={routine.id} routine={routine} index={index} onEdit={openEditModal} onStart={handleStartRoutine} onDelete={deleteRoutine} />
              ))
            ) : (
              <View style={{ alignItems: 'center', marginTop: 100 }}>
                <Ionicons name="fitness-outline" size={60} color="#ccd2e3" />
                <Text style={{ marginTop: 16, fontSize: 16, color: '#8b92a5', fontWeight: '600' }}>No routines created yet.</Text>
                <Pressable onPress={openAddModal} style={{ marginTop: 10 }}>
                  <Text style={{ color: '#0B63C6', fontWeight: '700' }}>Create your first routine</Text>
                </Pressable>
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* Editor Modal */}
      <BottomSheetModal
        ref={bottomSheetModalRef}
        index={0}
        snapPoints={['50%']}
        backdropComponent={renderBackdrop}
        backgroundStyle={{ backgroundColor: '#fff', borderRadius: 24 }}
        handleIndicatorStyle={{ backgroundColor: '#ccc', width: 40 }}
      >
        <BottomSheetScrollView contentContainerStyle={[styles.modalContent, { paddingBottom: Math.max(insets.bottom, 24) }]}>
          <Text style={styles.modalTitle}>{editingId ? 'Edit Routine' : 'Create Routine'}</Text>

          <Text style={styles.label}>Routine Name</Text>
          <TextInput style={styles.input} value={form.name} onChangeText={t => setForm({ ...form, name: t })} placeholder="e.g. Core Day" />

          <Text style={styles.label}>Scheduled Days</Text>
          <View style={styles.daysContainer}>
            {DAYS_OF_WEEK.map(day => {
              const isSelected = form.days.split(', ').includes(day);
              return (
                <Pressable
                  key={day}
                  onPress={() => toggleDay(day)}
                  style={[styles.dayChip, isSelected && styles.dayChipSelected]}
                >
                  <Text style={[styles.dayChipText, isSelected && styles.dayChipTextSelected]}>
                    {day}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={styles.label}>Duration</Text>
          <View style={[styles.daysContainer, { marginBottom: 12 }]}>
            {QUICK_DURATIONS.map(d => (
              <Pressable
                key={d}
                onPress={() => {
                  setForm({ ...form, duration: d });
                  setShowPicker(false);
                }}
                style={[styles.dayChip, form.duration === d && styles.dayChipSelected]}
              >
                <Text style={[styles.dayChipText, form.duration === d && styles.dayChipTextSelected]}>
                  {d}
                </Text>
              </Pressable>
            ))}
            <Pressable
              onPress={() => setShowPicker(!showPicker)}
              style={[styles.dayChip, showPicker && styles.dayChipSelected, { backgroundColor: '#f2f4f7' }]}
            >
              <Text style={[styles.dayChipText, showPicker && styles.dayChipTextSelected]}>
                Custom...
              </Text>
            </Pressable>
          </View>

          {showPicker && (
            <View style={styles.pickerContainer}>
              <View style={styles.pickerColumn}>
                <Text style={styles.pickerLabel}>Hours</Text>
                <ScrollView style={styles.pickerScroll} showsVerticalScrollIndicator={false}>
                  {HOURS.map(h => {
                    const { h: currentH, m: currentM } = getDurationValues();
                    return (
                      <Pressable key={h} onPress={() => updateDuration(h, currentM)} style={[styles.pickerItem, currentH === h && styles.pickerItemActive]}>
                        <Text style={[styles.pickerItemText, currentH === h && styles.pickerItemTextActive]}>{h}</Text>
                      </Pressable>
                    );
                  })}
                </ScrollView>
              </View>
              <View style={styles.pickerColumn}>
                <Text style={styles.pickerLabel}>Mins</Text>
                <ScrollView style={styles.pickerScroll} showsVerticalScrollIndicator={false}>
                  {MINUTES.map(m => {
                    const { h: currentH, m: currentM } = getDurationValues();
                    return (
                      <Pressable key={m} onPress={() => updateDuration(currentH, m)} style={[styles.pickerItem, currentM === m && styles.pickerItemActive]}>
                        <Text style={[styles.pickerItemText, currentM === m && styles.pickerItemTextActive]}>{m}</Text>
                      </Pressable>
                    );
                  })}
                </ScrollView>
              </View>
            </View>
          )}

          <View style={styles.modalActions}>
            <Pressable style={styles.cancelBtn} onPress={() => bottomSheetModalRef.current?.dismiss()}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </Pressable>
            <Pressable style={styles.saveBtn} onPress={saveRoutine}>
              <Text style={styles.saveBtnText}>Save</Text>
            </Pressable>
          </View>
        </BottomSheetScrollView>
      </BottomSheetModal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fc' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 10, paddingBottom: 20 },
  backBtn: { marginRight: 16 },
  title: { fontSize: 24, fontWeight: '800', color: '#111' },
  addIconBtn: { padding: 8, backgroundColor: '#e6f0fa', borderRadius: 8 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
  responsiveWrapper: { width: '100%', maxWidth: 768, alignSelf: 'center' },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 20, marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 10, elevation: 2, borderWidth: 1, borderColor: '#f0f0f5' },
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  cardTitle: { fontSize: 18, fontWeight: '700', color: '#111', flex: 1, paddingRight: 10 },
  editBtn: { padding: 4 },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  badge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f2f4f7', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6 },
  badgeText: { fontSize: 11, fontWeight: '600', color: '#555' },
  cardFooter: { flexDirection: 'row', gap: 12 },
  startBtn: { flex: 1, flexDirection: 'row', backgroundColor: '#0B63C6', paddingVertical: 12, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  startBtnText: { color: '#fff', fontSize: 13, fontWeight: '700', letterSpacing: 1 },
  deleteBtn: { backgroundColor: '#fff0f0', width: 44, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },

  modalContent: { flex: 1, paddingHorizontal: 24, paddingTop: 10 },
  modalTitle: { fontSize: 20, fontWeight: '800', marginBottom: 20 },
  label: { fontSize: 12, fontWeight: '700', color: '#555', marginBottom: 8 },
  input: { backgroundColor: '#f2f4f7', borderRadius: 8, paddingHorizontal: 16, paddingVertical: 12, fontSize: 15, marginBottom: 16 },
  daysContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  dayChip: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, backgroundColor: '#f2f4f7', borderWidth: 1.5, borderColor: '#f2f4f7' },
  dayChipSelected: { backgroundColor: '#eff6ff', borderColor: '#0B63C6' },
  dayChipText: { fontSize: 13, fontWeight: '700', color: '#64748b' },
  dayChipTextSelected: { color: '#0B63C6' },
  pickerTrigger: { backgroundColor: '#f2f4f7', borderRadius: 8, paddingHorizontal: 16, paddingVertical: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  pickerTriggerText: { fontSize: 15, color: '#111', fontWeight: '500' },
  pickerContainer: { flexDirection: 'row', backgroundColor: '#f8f9fc', borderRadius: 12, padding: 12, marginBottom: 16, gap: 12 },
  pickerColumn: { flex: 1, alignItems: 'center' },
  pickerLabel: { fontSize: 10, fontWeight: '700', color: '#8b92a5', marginBottom: 8, textTransform: 'uppercase' },
  pickerScroll: { height: 120, width: '100%' },
  pickerItem: { paddingVertical: 8, width: '100%', alignItems: 'center', borderRadius: 6 },
  pickerItemActive: { backgroundColor: '#fff', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
  pickerItemText: { fontSize: 16, fontWeight: '500', color: '#8b92a5' },
  pickerItemTextActive: { color: '#0B63C6', fontWeight: '700' },
  modalActions: { flexDirection: 'row', marginTop: 10, gap: 12 },
  cancelBtn: { flex: 1, backgroundColor: '#f2f4f7', paddingVertical: 14, borderRadius: 8, alignItems: 'center' },
  cancelBtnText: { fontSize: 15, fontWeight: '700', color: '#555' },
  saveBtn: { flex: 1, backgroundColor: '#0B63C6', paddingVertical: 14, borderRadius: 8, alignItems: 'center' },
  saveBtnText: { fontSize: 15, fontWeight: '700', color: '#fff' },

  banner: {
    backgroundColor: '#eff6ff',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderLeftWidth: 4,
    borderLeftColor: '#0B63C6',
  },
  bannerInfo: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  pulseDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#0B63C6', marginRight: 10 },
  bannerTitle: { fontSize: 13, fontWeight: '700', color: '#1e3a8a' },
  resumeBtnText: { color: '#0B63C6', fontSize: 13, fontWeight: '900', letterSpacing: 0.5 }
});
