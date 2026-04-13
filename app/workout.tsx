import { RestTimerOverlay } from '@/components/RestTimerOverlay';
import { WorkoutTimer } from '@/components/WorkoutTimer';
import { EXERCISE_NAMES } from '@/constants/exercise_list';
import { DatabaseExercise, DatabaseSet, WorkoutRepository } from '@/services/workoutRepository';
import { useTimerStore } from '@/store/userTimerStore';
import { Ionicons } from '@expo/vector-icons';
import { BottomSheetBackdrop, BottomSheetFlatList, BottomSheetModal, BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { useNavigation } from '@react-navigation/native';
import { BlurView } from 'expo-blur';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import Animated, { FadeInUp, ZoomIn } from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

type FullExercise = DatabaseExercise & { sets: DatabaseSet[], prevSets?: DatabaseSet[] | null };

function WorkoutSetRow({ set, index, prevSet, onSave, onDelete }: {
  set: DatabaseSet,
  index: number,
  prevSet?: DatabaseSet | null,
  onSave: (id: number, weight: number, reps: number, completed: number) => void,
  onDelete: (id: number) => void
}) {
  const [localWeight, setLocalWeight] = useState(set.weight === 0 ? '' : set.weight.toString());
  const [localReps, setLocalReps] = useState(set.reps === 0 ? '' : set.reps.toString());

  return (
    <View style={styles.setRow}>
      <Pressable onPress={() => onDelete(set.id!)} style={styles.minusBtn}>
        <Ionicons name="remove-circle-outline" size={20} color="#d94b4b" />
      </Pressable>
      <Text style={[styles.setCellText, { width: 30, fontWeight: '700', textAlign: 'center' }]}>{index + 1}</Text>
      <Text style={[styles.setCellText, { flex: 1.5, color: '#888', paddingLeft: 8 }]}>
        {prevSet ? `${prevSet.weight}kg x ${prevSet.reps}` : '-'}
      </Text>
      <View style={[styles.setInputContainer, { flex: 1, marginRight: 8 }]}>
        <TextInput
          style={styles.setRowInput}
          keyboardType="numeric"
          value={localWeight}
          onChangeText={setLocalWeight}
          placeholder="0"
        />
      </View>
      <View style={[styles.setInputContainer, { flex: 1, marginRight: 8 }]}>
        <TextInput
          style={styles.setRowInput}
          keyboardType="numeric"
          value={localReps}
          onChangeText={setLocalReps}
          placeholder="0"
        />
      </View>
      <Pressable
        style={[styles.checkBtn, set.is_completed ? styles.checkBtnComplete : null]}
        onPress={() => onSave(set.id!, Number(localWeight), Number(localReps), set.is_completed ? 0 : 1)}
      >
        <Ionicons name="checkmark" size={16} color="#fff" />
      </Pressable>
    </View>
  );
}

function ReadOnlySetRow({ set, index }: { set: DatabaseSet; index: number }) {
  return (
    <View style={styles.setRow}>
      <View style={{ width: 20, marginRight: 10 }} />
      <Text style={[styles.setCellText, { width: 30, fontWeight: '700', textAlign: 'center' }]}>{index + 1}</Text>
      <Text style={[styles.setCellText, { flex: 1.5, paddingLeft: 8 }]}>
        {set.weight > 0 || set.reps > 0 ? `${set.weight}kg x ${set.reps}` : '-'}
      </Text>
      <View style={[styles.setInputContainer, { flex: 1, marginRight: 8, justifyContent: 'center' }]}>
        <Text style={[styles.setRowInput, { textAlign: 'center', paddingVertical: 8, fontWeight: '700', color: '#111' }]}>
          {set.weight || 0}
        </Text>
      </View>
      <View style={[styles.setInputContainer, { flex: 1, marginRight: 8, justifyContent: 'center' }]}>
        <Text style={[styles.setRowInput, { textAlign: 'center', paddingVertical: 8, fontWeight: '700', color: '#111' }]}>
          {set.reps || 0}
        </Text>
      </View>
      <View
        style={[styles.checkBtn, set.is_completed ? styles.checkBtnComplete : null]}
      >
        <Ionicons name="checkmark" size={16} color="#fff" />
      </View>
    </View>
  );
}

export default function WorkoutScreen() {
  const router = useRouter();
  const navigation = useNavigation();

  const { workoutId, routineName, viewOnly } = useLocalSearchParams();
  const isViewOnly = viewOnly === 'true';
  const { startRest, isWorkoutActive, startWorkout, finishWorkout, stopRest } = useTimerStore()
  const [exercises, setExercises] = useState<FullExercise[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSummary, setShowSummary] = useState(false);
  const [showStartModal, setShowStartModal] = useState(!isViewOnly);
  const insets = useSafeAreaInsets();

  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ['70%'], []);

  useEffect(() => { loadExercises() }, [workoutId]);

  const loadExercises = async () => {
    if (!workoutId) return setIsLoading(false);
    setIsLoading(true);
    try {
      const data = await WorkoutRepository.getExercisesForWorkout(Number(workoutId));
      const fullExercises = await Promise.all(data.map(async (ex) => {
        const sets = await WorkoutRepository.getSetsForExercise(ex.id!);
        const prevSets = await WorkoutRepository.getPreviousPerformance(ex.name, Number(workoutId));


        return { ...ex, sets, prevSets };
      }));

      setExercises(fullExercises);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccept = () => {
    if (!isWorkoutActive) {
      startWorkout(String(workoutId), String(routineName || "Active Workout"));
    }
    setShowStartModal(false);
  };

  const handleCancel = () => {
    setShowStartModal(false);
    router.back();
  };

  const handleStartNew = () => {
    finishWorkout();
    startWorkout(String(workoutId), String(routineName || "Active Workout"));
    setShowStartModal(false);
  };

  const handleUpdateSet = async (id: number, weight: number, reps: number, completed: number) => {
    try {
      await WorkoutRepository.updateSet(id, weight, reps, completed);

      if (completed === 1) {
        startRest(60)
      }
      setExercises(prev => prev.map(ex => ({
        ...ex,
        sets: ex.sets.map(s => s.id === id ? { ...s, weight, reps, is_completed: completed } : s)
      })));
    } catch (error) {
      console.error("Failed to update set:", error);
    }
  };

  const handleDeleteSet = async (setId: number) => {
    try {
      await WorkoutRepository.deleteSet(setId);
      setExercises(prev => prev.map(ex => ({
        ...ex,
        sets: ex.sets.filter(s => s.id !== setId)
      })));
    } catch (error) {
      console.error("Failed to delete set:", error);
    }
  };

  const handleAddExercise = async (name: string) => {
    if (!workoutId) return;
    try {
      const newId = await WorkoutRepository.addExerciseToWorkout(Number(workoutId), name);
      const prevSets = await WorkoutRepository.getPreviousPerformance(name, Number(workoutId));
      const newExercise: FullExercise = { id: newId, workout_id: Number(workoutId), name: name, sets: [], prevSets: prevSets };
      setExercises(prev => [...prev, newExercise]);
      bottomSheetModalRef.current?.dismiss();
    } catch (error) {
      console.error("Failed to inject movement:", error);
    }
  };

  const handleAddSet = async (exerciseId: number) => {
    try {
      const newSetId = await WorkoutRepository.addSetToExercise(exerciseId, 0, 0);
      const newSet = { id: newSetId, exercise_id: exerciseId, weight: 0, reps: 0, is_completed: 0 };
      setExercises(prev => prev.map(ex => ex.id === exerciseId ? { ...ex, sets: [...ex.sets, newSet] } : ex));
    } catch (error) {
      console.error("Failed to add set:", error);
    }
  };

  const handleDeleteExercise = async (exerciseId: number) => {
    try {
      await WorkoutRepository.deleteExercise(exerciseId);
      setExercises(prev => prev.filter(ex => ex.id !== exerciseId));
    } catch (error) {
      console.error("Failed to delete exercise:", error);
    }
  };

  const calculateStats = () => {
    let totalVolume = 0;
    let totalSets = 0;
    exercises.forEach(ex => {
      ex.sets.forEach(s => {
        if (s.is_completed) {
          totalVolume += (s.weight * s.reps);
          totalSets++;
        }
      });
    });
    return { volume: totalVolume, sets: totalSets, exercises: exercises.length };
  };

  const confirmFinish = async () => {
    if (!workoutId) return;
    try {
      await WorkoutRepository.finishWorkout(Number(workoutId));
      finishWorkout()
      setShowSummary(false);
      (navigation as any).reset({
        index: 0,
        routes: [{ name: '(tabs)' }],
      });
    } catch (error) {
      console.error("Failed to finish workout:", error);
    }
  };

  const stats = calculateStats();
  const renderBackdrop = useCallback((props: any) => <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} />, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0B63C6" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.topNav}>
          <Pressable style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={28} color="#111" />
          </Pressable>
        </View>

        <View style={styles.header}>
          <Text style={styles.title}>{routineName || 'ACTIVE WORKOUT'}</Text>
        </View>

        {exercises.map((item, index) => (
          <Animated.View key={item.id} entering={FadeInUp.delay(index * 100).duration(400)} style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.cardTitleRow}>
                <Text style={styles.exerciseIndex}>0{index + 1}</Text>
                <Text style={styles.exerciseName}>{item.name}</Text>
              </View>
              {!isViewOnly && (
                <Pressable style={styles.iconBtn} onPress={() => handleDeleteExercise(item.id!)}>
                  <Ionicons name="trash-outline" size={20} color="#d94b4b" />
                </Pressable>
              )}
            </View>

            <View style={styles.setsHeader}>
              {!isViewOnly && <View style={{ width: 20, marginRight: 10 }} />}
              <Text style={[styles.setHeaderText, { width: 30, textAlign: 'center' }]}>SET</Text>
              <Text style={[styles.setHeaderText, { flex: 1.5, paddingLeft: 8 }]}>{isViewOnly ? 'WEIGHT × REPS' : 'PREVIOUS'}</Text>
              <Text style={[styles.setHeaderText, { flex: 1, textAlign: 'center' }]}>kg</Text>
              <Text style={[styles.setHeaderText, { flex: 1, textAlign: 'center' }]}>REPS</Text>
              <View style={{ width: 32 }} />
            </View>

            {item.sets.length > 0 ? (
              item.sets.map((set, sIdx) => (
                isViewOnly ? (
                  <ReadOnlySetRow key={set.id} set={set} index={sIdx} />
                ) : (
                  <WorkoutSetRow
                    key={set.id} set={set} index={sIdx}
                    prevSet={item.prevSets?.[sIdx]} onSave={handleUpdateSet} onDelete={handleDeleteSet}
                  />
                )
              ))
            ) : (
              <View style={{ paddingVertical: 10, alignItems: 'center' }}>
                <Text style={{ color: '#8b92a5', fontSize: 12, fontWeight: '600' }}>No sets recorded</Text>
              </View>
            )}

            {!isViewOnly && (
              <Pressable style={styles.addSetBtn} onPress={() => handleAddSet(item.id!)}>
                <Text style={styles.addSetBtnText}>+ Add Set</Text>
              </Pressable>
            )}
          </Animated.View>
        ))}

        {!isViewOnly && (
          <>
            <Pressable style={styles.addBtn} onPress={() => bottomSheetModalRef.current?.present()}>
              <View style={styles.addCircle}><Ionicons name="add" size={20} color="#555" /></View>
              <Text style={styles.addBtnText}>INJECT NEW MOVEMENT</Text>
            </Pressable>

            <Pressable style={styles.finishBtnContainer} onPress={() => setShowSummary(true)}>
              <Text style={styles.finishBtnText}>FINISH WORKOUT</Text>
            </Pressable>
          </>
        )}
      </ScrollView>

      <Modal visible={showStartModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <BlurView intensity={60} tint="dark" style={StyleSheet.absoluteFill} />

          <Animated.View entering={ZoomIn.duration(400)} style={styles.resumeCard}>
            <View style={styles.resumeIconOuter}>
              <View style={styles.iconCircleLarge}>
                <Ionicons name={isWorkoutActive ? "refresh-circle" : "play"} size={42} color="#0B63C6" />
              </View>
            </View>

            <Text style={styles.resumeTitle}>
              {isWorkoutActive ? "Active Session" : "Start Workout?"}
            </Text>

            <Text style={styles.resumeSubtitle}>
              {isWorkoutActive
                ? "You have a workout session already in progress. Would you like to resume it or start fresh?"
                : "Are you ready to begin? The timer will start counting once you confirm your session."}
            </Text>

            <View style={{ width: '100%', gap: 12 }}>
              <Pressable style={styles.resumeBtn} onPress={handleAccept}>
                <Text style={styles.resumeBtnText}>
                  {isWorkoutActive ? "RESUME SESSION" : "START NOW"}
                </Text>
              </Pressable>

              {isWorkoutActive && (
                <Pressable style={styles.startNewBtn} onPress={handleStartNew}>
                  <Text style={styles.startNewBtnText}>START NEW WORKOUT</Text>
                </Pressable>
              )}

              <Pressable style={styles.cancelLink} onPress={handleCancel}>
                <Text style={styles.cancelLinkText}>Not yet, go back</Text>
              </Pressable>
            </View>
          </Animated.View>
        </View>
      </Modal>

      <Modal visible={showSummary} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <Animated.View entering={ZoomIn.duration(400)} style={styles.summaryCard}>
            <View style={styles.successIconOuter}>
              <View style={styles.successIconInner}><Ionicons name="checkmark" size={40} color="#fff" /></View>
            </View>
            <Text style={styles.summaryTitle}>Workout Complete!</Text>
            <Text style={styles.summarySubtitle}>Great job! You crushed your session.</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>{stats.volume.toString()}</Text>
                <Text style={styles.statLabel}>VOLUME (KG)</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>{stats.sets.toString()}</Text>
                <Text style={styles.statLabel}>SETS DONE</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>{stats.exercises.toString()}</Text>
                <Text style={styles.statLabel}>EXERCISES</Text>
              </View>
            </View>
            <Pressable style={styles.doneBtn} onPress={confirmFinish}>
              <Text style={styles.doneBtnText}>DONE</Text>
            </Pressable>
          </Animated.View>
        </View>
      </Modal>

      <BottomSheetModal
        ref={bottomSheetModalRef} index={0} snapPoints={snapPoints}
        enableOverDrag={false} backdropComponent={renderBackdrop}
        backgroundStyle={{ borderRadius: 24, backgroundColor: '#fff' }}
      >
        <BottomSheetFlatList
          data={EXERCISE_NAMES.filter(ex => ex.toLowerCase().includes(searchQuery.toLowerCase()))}
          keyExtractor={(item) => item}
          ListHeaderComponent={
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select Movement</Text>
                <Pressable style={styles.closeBtn} onPress={() => bottomSheetModalRef.current?.dismiss()}>
                  <Ionicons name="close" size={24} color="#333" />
                </Pressable>
              </View>
              <View style={styles.searchBar}>
                <Ionicons name="search" size={20} color="#aaa" />
                <BottomSheetTextInput
                  style={styles.searchInput} placeholder="Search exercise..."
                  value={searchQuery} onChangeText={setSearchQuery}
                />
              </View>
            </View>
          }
          renderItem={({ item }) => (
            <Pressable style={[styles.exerciseItem, { marginHorizontal: 20 }]} onPress={() => handleAddExercise(item)}>
              <View style={styles.exerciseIcon}><Ionicons name="barbell-outline" size={20} color="#0B63C6" /></View>
              <Text style={styles.exerciseItemText}>{item}</Text>
              <Ionicons name="chevron-forward" size={18} color="#ccc" />
            </Pressable>
          )}
          contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
        />
      </BottomSheetModal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fc' },
  scrollContent: { padding: 20, paddingBottom: 60 },
  topNav: { marginBottom: 12, marginLeft: -10 },
  backBtn: { padding: 10, borderRadius: 12 },
  header: { marginBottom: 24 },
  title: { fontSize: 26, fontWeight: '800', color: '#111', width: '100%', lineHeight: 32 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: '#e8eaf0', borderStyle: 'dashed' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  exerciseIndex: { fontSize: 12, fontWeight: '700', color: '#0B63C6', marginLeft: 4, marginRight: 8 },
  exerciseName: { fontSize: 14, fontWeight: '800', color: '#111', flex: 1 },
  iconBtn: { padding: 4 },
  setsHeader: { flexDirection: 'row', paddingHorizontal: 4, marginBottom: 8, alignItems: 'center' },
  setHeaderText: { fontSize: 10, fontWeight: '700', color: '#8b92a5' },
  setRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', marginBottom: 8, paddingHorizontal: 4 },
  setCellText: { fontSize: 13, color: '#333', fontWeight: '500' },
  setInputContainer: { backgroundColor: '#f2f4f7', borderRadius: 8, flex: 1 },
  setRowInput: { textAlign: 'center', paddingVertical: 8, fontWeight: '700', color: '#111', fontSize: 14 },
  checkBtn: { width: 32, height: 32, borderRadius: 8, backgroundColor: '#d0d5df', justifyContent: 'center', alignItems: 'center' },
  checkBtnComplete: { backgroundColor: '#4caf50' },
  minusBtn: { width: 20, marginRight: 10, justifyContent: 'center', alignItems: 'center' },
  addSetBtn: { alignSelf: 'center', paddingVertical: 10, marginTop: 4 },
  addSetBtnText: { fontSize: 12, fontWeight: '700', color: '#0B63C6' },
  addBtn: { alignItems: 'center', marginTop: 10, marginBottom: 20, padding: 20, borderRadius: 12, backgroundColor: '#fff', borderWidth: 1, borderColor: '#e8eaf0', borderStyle: 'dashed' },
  addCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#f2f4f7', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  addBtnText: { fontSize: 11, fontWeight: '800', color: '#333', letterSpacing: 1 },
  finishBtnContainer: { backgroundColor: '#0B63C6', padding: 18, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  finishBtnText: { color: '#fff', fontSize: 14, fontWeight: '800', letterSpacing: 1 },
  modalContent: { flex: 1, paddingHorizontal: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 16 },
  modalTitle: { fontSize: 20, fontWeight: '800', color: '#111' },
  closeBtn: { padding: 4 },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f2f4f7', paddingHorizontal: 16, borderRadius: 12, marginBottom: 20 },
  searchInput: { flex: 1, paddingVertical: 12, marginLeft: 10, fontSize: 15, fontWeight: '600', color: '#111' },
  exerciseItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#f0f0f5' },
  exerciseIcon: { width: 40, height: 40, borderRadius: 10, backgroundColor: '#e6f0fa', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  exerciseItemText: { flex: 1, fontSize: 15, fontWeight: '700', color: '#333' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  summaryCard: { backgroundColor: '#fff', width: '100%', borderRadius: 24, padding: 32, alignItems: 'center', zIndex: 10 },
  successIconOuter: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#e8f5e9', justifyContent: 'center', alignItems: 'center', marginBottom: 24 },
  successIconInner: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#4caf50', justifyContent: 'center', alignItems: 'center' },
  summaryTitle: { fontSize: 24, fontWeight: '900', color: '#111', marginBottom: 8 },
  summarySubtitle: { fontSize: 14, color: '#555', textAlign: 'center', marginBottom: 32, lineHeight: 20 },
  statsGrid: { flexDirection: 'row', width: '100%', justifyContent: 'space-between', marginBottom: 32 },
  statBox: { alignItems: 'center', flex: 1 },
  statValue: { fontSize: 20, fontWeight: '900', color: '#111', marginBottom: 4 },
  statLabel: { fontSize: 9, fontWeight: '700', color: '#8b92a5', letterSpacing: 1 },
  doneBtn: { backgroundColor: '#111', width: '100%', paddingVertical: 18, borderRadius: 16, alignItems: 'center' },
  doneBtnText: { color: '#fff', fontSize: 14, fontWeight: '800', letterSpacing: 1 },
  confetti: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none', zIndex: 100 },

  // Resume Modal Styles
  resumeCard: { backgroundColor: 'rgba(255, 255, 255, 0.98)', width: '100%', borderRadius: 32, padding: 32, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 20 }, shadowOpacity: 0.15, shadowRadius: 30, elevation: 10 },
  resumeIconOuter: { marginBottom: 20 },
  iconCircleLarge: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#e6f0fa', justifyContent: 'center', alignItems: 'center' },
  resumeTitle: { fontSize: 22, fontWeight: '900', color: '#111', marginBottom: 10 },
  resumeSubtitle: { fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 30, lineHeight: 22 },
  resumeBtn: { backgroundColor: '#0B63C6', width: '100%', paddingVertical: 18, borderRadius: 18, alignItems: 'center' },
  resumeBtnText: { color: '#fff', fontSize: 14, fontWeight: '800', letterSpacing: 1 },
  startNewBtn: { backgroundColor: '#f2f4f7', width: '100%', paddingVertical: 16, borderRadius: 18, alignItems: 'center' },
  startNewBtnText: { color: '#444', fontSize: 13, fontWeight: '700' },
  cancelLink: { marginTop: 15, paddingVertical: 10 },
  cancelLinkText: { color: '#888', fontSize: 13, fontWeight: '700' },
});
