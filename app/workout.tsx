import AppAlert from '@/components/AppAlert';
import AppButton from '@/components/AppButton';
import TimedSetModal from '@/components/TimedSetModal';
import { CategoryImages } from '@/constants/category_images';
import { ALL_EXERCISES, TrackingType } from '@/constants/exercise_list';
import { DatabaseExercise, DatabaseSet, WorkoutRepository } from '@/services/workoutRepository';
import { useTimerStore } from '@/store/userTimerStore';
import { Ionicons } from '@expo/vector-icons';
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetSectionList, BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { useNavigation } from '@react-navigation/native';
import { BlurView } from 'expo-blur';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Image, LayoutAnimation, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, UIManager, View } from 'react-native';
import Animated, { FadeInUp, ZoomIn } from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const formatDuration = (seconds: number) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  return `${m}:${s.toString().padStart(2, '0')}`;
};

const parseDuration = (text: string) => {
  const parts = text.split(':').map(Number);
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return parts[0] || 0;
};

type FullExercise = DatabaseExercise & { sets: DatabaseSet[], prevSets?: DatabaseSet[] | null };

function WorkoutSetRow({ set, index, prevSet, trackingType, showHistory, onSave, onDelete, exerciseName }: {
  set: DatabaseSet,
  index: number,
  prevSet?: DatabaseSet | null,
  trackingType: TrackingType,
  showHistory: boolean,
  exerciseName: string,
  onSave: (id: number, weight: number, reps: number, completed: number, duration: number, calories: number, distance: number) => void,
  onDelete: (id: number) => void
}) {
  const [localWeight, setLocalWeight] = useState(set.weight === 0 ? '' : set.weight.toString());
  const [localReps, setLocalReps] = useState(set.reps === 0 ? '' : set.reps.toString());
  const [localDuration, setLocalDuration] = useState(set.duration === 0 ? '' : formatDuration(set.duration));
  const [localCalories, setLocalCalories] = useState(set.calories === 0 ? '' : set.calories.toString());
  const [localDistance, setLocalDistance] = useState(set.distance === 0 ? '' : set.distance.toString());

  const { startSetTimer, runningSet, setElapsed, toggleSetTimerModal } = useTimerStore();

  const isTimerActive = runningSet?.setId === set.id;

  useEffect(() => {
    if (isTimerActive) {
      setLocalDuration(formatDuration(setElapsed));
    }
  }, [isTimerActive, setElapsed]);

  useEffect(() => {
    setLocalDuration(set.duration === 0 ? '' : formatDuration(set.duration));
  }, [set.duration]);

  const toggleTimer = () => {
    if (isTimerActive) {
      toggleSetTimerModal(true);
    } else {
      startSetTimer(set.id!, exerciseName);
    }
  };

  const renderPrevious = () => {
    if (!prevSet) return null;
    let text = '';
    if (trackingType === 'cardio' || trackingType === 'cardio-distance') {
      const parts = [];
      if (prevSet.duration) parts.push(formatDuration(prevSet.duration));
      if (prevSet.distance) parts.push(`${prevSet.distance}km`);
      if (prevSet.calories) parts.push(`${prevSet.calories}kcal`);
      text = parts.join(' | ');
    } else if (trackingType === 'bodyweight') {
      text = `${prevSet.reps} reps`;
    } else if (trackingType === 'timed') {
      text = formatDuration(prevSet.duration);
    } else {
      text = `${prevSet.weight}kg x ${prevSet.reps}`;
    }

    if (!text) return null;

    return (
      <View style={styles.previousRow}>
        <Ionicons name="time-outline" size={10} color="#8b92a5" style={{ marginRight: 4 }} />
        <Text style={styles.previousText}>Previously: {text}</Text>
      </View>
    );
  };

  return (
    <View style={{ marginBottom: 12 }}>
      <View style={styles.setRow}>
        <Pressable onPress={() => onDelete(set.id!)} style={styles.minusBtn}>
          <Ionicons name="remove-circle-outline" size={20} color="#d94b4b" />
        </Pressable>
        <Text style={[styles.setCellText, { width: 30, fontWeight: '700', textAlign: 'center' }]}>{index + 1}</Text>

        {showHistory && (
          <View style={{ flex: 1.2, display: 'none' }} />
        )}

        {(trackingType === 'strength') && (
          <View style={[styles.setInputContainer, { flex: 1, marginRight: 8 }]}>
            <TextInput
              style={styles.setRowInput}
              keyboardType="numeric"
              value={localWeight}
              onChangeText={setLocalWeight}
              placeholder="0"
            />
          </View>
        )}

        {(trackingType === 'strength' || trackingType === 'bodyweight') && (
          <View style={[styles.setInputContainer, { flex: 1, marginRight: 8 }]}>
            <TextInput
              style={styles.setRowInput}
              keyboardType="numeric"
              value={localReps}
              onChangeText={setLocalReps}
              placeholder="0"
            />
          </View>
        )}

        {(trackingType === 'cardio' || trackingType === 'cardio-distance' || trackingType === 'timed') && (
          <View style={[styles.setInputContainer, { flex: 1.2, marginRight: 8, flexDirection: 'row', alignItems: 'center', paddingRight: 4 }]}>
            <TextInput
              style={[styles.setRowInput, { flex: 1 }]}
              value={localDuration}
              onChangeText={setLocalDuration}
              placeholder="0:00"
            />
            <Pressable onPress={toggleTimer} style={{ padding: 4 }}>
              <Ionicons name={isTimerActive ? "pulse" : "play-circle"} size={22} color={isTimerActive ? "#5C4AE4" : "#5C4AE4"} />
            </Pressable>
          </View>
        )}

        {(trackingType === 'cardio' || trackingType === 'cardio-distance') && (
          <View style={[styles.setInputContainer, { flex: 1, marginRight: 8 }]}>
            <TextInput
              style={styles.setRowInput}
              keyboardType="numeric"
              value={localCalories}
              onChangeText={setLocalCalories}
              placeholder="kcal"
            />
          </View>
        )}

        {(trackingType === 'cardio-distance') && (
          <View style={[styles.setInputContainer, { flex: 1, marginRight: 8 }]}>
            <TextInput
              style={styles.setRowInput}
              keyboardType="numeric"
              value={localDistance}
              onChangeText={setLocalDistance}
              placeholder="km"
            />
          </View>
        )}

        <Pressable
          style={[styles.checkBtn, set.is_completed ? styles.checkBtnComplete : null]}
          onPress={() => {
            onSave(
              set.id!,
              Number(localWeight),
              Number(localReps),
              set.is_completed ? 0 : 1,
              parseDuration(localDuration),
              Number(localCalories),
              Number(localDistance)
            );
          }}
        >
          <Ionicons name="checkmark" size={16} color="#fff" />
        </Pressable>
      </View>
      {showHistory && renderPrevious()}
    </View>
  );
}

function ReadOnlySetRow({ set, index, trackingType }: { set: DatabaseSet; index: number, trackingType: TrackingType }) {
  return (
    <View style={styles.setRow}>
      <View style={{ width: 20, marginRight: 10 }} />
      <Text style={[styles.setCellText, { width: 30, fontWeight: '700', textAlign: 'center' }]}>{index + 1}</Text>

      {(trackingType === 'strength') && (
        <>
          <View style={[styles.setInputContainer, { flex: 1, marginRight: 8, backgroundColor: 'transparent' }]}>
            <Text style={[styles.setRowInput, { color: '#111' }]}>{set.weight || 0}</Text>
          </View>
          <View style={[styles.setInputContainer, { flex: 1, marginRight: 8, backgroundColor: 'transparent' }]}>
            <Text style={[styles.setRowInput, { color: '#111' }]}>{set.reps || 0}</Text>
          </View>
        </>
      )}

      {(trackingType === 'bodyweight') && (
        <View style={[styles.setInputContainer, { flex: 2, marginRight: 8, backgroundColor: 'transparent' }]}>
          <Text style={[styles.setRowInput, { color: '#111' }]}>{set.reps || 0}</Text>
        </View>
      )}

      {(trackingType === 'cardio' || trackingType === 'cardio-distance') && (
        <>
          <View style={[styles.setInputContainer, { flex: 1, marginRight: 8, backgroundColor: 'transparent' }]}>
            <Text style={[styles.setRowInput, { color: '#111' }]}>{formatDuration(set.duration)}</Text>
          </View>
          <View style={[styles.setInputContainer, { flex: 1, marginRight: 8, backgroundColor: 'transparent' }]}>
            <Text style={[styles.setRowInput, { color: '#111' }]}>{set.calories || 0}</Text>
          </View>
          {trackingType === 'cardio-distance' && (
            <View style={[styles.setInputContainer, { flex: 1, marginRight: 8, backgroundColor: 'transparent' }]}>
              <Text style={[styles.setRowInput, { color: '#111' }]}>{set.distance || 0}km</Text>
            </View>
          )}
        </>
      )}

      {(trackingType === 'timed') && (
        <View style={[styles.setInputContainer, { flex: 2, marginRight: 8, backgroundColor: 'transparent' }]}>
          <Text style={[styles.setRowInput, { color: '#111' }]}>{formatDuration(set.duration)}</Text>
        </View>
      )}

      <View style={[styles.checkBtn, set.is_completed ? styles.checkBtnComplete : null]}>
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
  const { startRest, isWorkoutActive, startWorkout, finishWorkout, stopRest, runningSet } = useTimerStore()
  const [exercises, setExercises] = useState<FullExercise[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSummary, setShowSummary] = useState(false);
  const [showStartModal, setShowStartModal] = useState(!isViewOnly);
  const [alertModal, setAlertModal] = useState<{
    visible: boolean;
    title: string;
    message: string;
    type: 'warning' | 'error' | 'success' | 'info';
  }>({
    visible: false,
    title: '',
    message: '',
    type: 'info'
  });
  const [expandedHistory, setExpandedHistory] = useState<Set<number>>(new Set());
  const insets = useSafeAreaInsets();

  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ['50%', '70%'], []);

  const groupedExercises = useMemo(() => {
    const filtered = ALL_EXERCISES.filter(ex =>
      ex.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const groups = filtered.reduce((acc, curr) => {
      const index = acc.findIndex(g => g.title === curr.category);
      if (index >= 0) {
        acc[index].data.push(curr.name);
      } else {
        acc.push({ title: curr.category, data: [curr.name] });
      }
      return acc;
    }, [] as { title: string, data: string[] }[]);

    return groups;
  }, [searchQuery]);

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

  const showAlert = (title: string, message: string, type: 'warning' | 'error' | 'success' | 'info' = 'info') => {
    setAlertModal({ visible: true, title, message, type });
  };

  const validateWorkout = () => {
    if (exercises.length === 0) {
      showAlert("Empty Workout", "Please add at least one exercise before finishing.", "error");
      return false;
    }
    for (const ex of exercises) {
      if (ex.sets.length === 0) {
        showAlert("Incomplete Session", `Please add at least one set for "${ex.name}" or remove the movement.`, "warning");
        return false;
      }
    }
    return true;
  };

  const handleFinishPress = () => {
    if (validateWorkout()) {
      setShowSummary(true);
    }
  };

  const handleStop = async () => {
    if (!workoutId) return;
    if (!validateWorkout()) return;
    try {
      await WorkoutRepository.finishWorkout(Number(workoutId));
      finishWorkout();
      setShowStartModal(false);
      setShowSummary(true);
    } catch (error) {
      console.error("Failed to stop workout:", error);
    }
  };

  const handleStartNew = () => {
    finishWorkout();
    startWorkout(String(workoutId), String(routineName || "Active Workout"));
    setShowStartModal(false);
  };

  const handleUpdateSet = async (id: number, weight: number, reps: number, completed: number, duration: number = 0, calories: number = 0, distance: number = 0) => {
    try {
      await WorkoutRepository.updateSet(id, weight, reps, completed, duration, calories, distance);

      if (completed === 1) {
        startRest(60)
      }
      setExercises(prev => prev.map(ex => ({
        ...ex,
        sets: ex.sets.map(s => s.id === id ? { ...s, weight, reps, is_completed: completed, duration, calories, distance } : s)
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
    if (exercises.some(ex => ex.name === name)) {
      showAlert("Duplicate Movement", `"${name}" is already in your workout list.`, "warning");
      bottomSheetModalRef.current?.dismiss();
      return;
    }
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
      const newSetId = await WorkoutRepository.addSetToExercise(exerciseId, 0, 0, 0, 0, 0);
      const newSet: DatabaseSet = { id: newSetId, exercise_id: exerciseId, weight: 0, reps: 0, duration: 0, calories: 0, distance: 0, is_completed: 0 };
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

  const handleTimedSetComplete = (duration: number) => {
    if (!runningSet) return;
    
    // Find current set values to preserve them
    let targetSet: DatabaseSet | undefined;
    exercises.forEach(ex => {
      const found = ex.sets.find(s => s.id === runningSet.setId);
      if (found) targetSet = found;
    });

    if (targetSet) {
      handleUpdateSet(
        targetSet.id!,
        targetSet.weight || 0,
        targetSet.reps || 0,
        1, // complete
        duration,
        targetSet.calories || 0,
        targetSet.distance || 0
      );
    }
  };

  const toggleHistory = (exerciseId: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedHistory(prev => {
      const next = new Set(prev);
      if (next.has(exerciseId)) next.delete(exerciseId);
      else next.add(exerciseId);
      return next;
    });
  };

  const calculateStats = () => {
    let totalVolume = 0;
    let totalSets = 0;
    let totalDistance = 0;
    let totalCalories = 0;

    exercises.forEach(ex => {
      ex.sets.forEach(s => {
        if (s.is_completed) {
          totalVolume += (s.weight * s.reps);
          totalSets++;
          totalDistance += (s.distance || 0);
          totalCalories += (s.calories || 0);
        }
      });
    });
    return {
      volume: totalVolume,
      sets: totalSets,
      exercises: exercises.length,
      distance: totalDistance,
      calories: totalCalories
    };
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
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <Pressable
                    onPress={() => toggleHistory(item.id!)}
                    style={[styles.iconBtn]}
                  >
                    <Ionicons name={"time-outline"} size={22} color="#5C4AE4" />
                  </Pressable>
                  <Pressable style={styles.iconBtn} onPress={() => handleDeleteExercise(item.id!)}>
                    <Ionicons name="trash-outline" size={20} color="#d94b4b" />
                  </Pressable>
                </View>
              )}

            </View>

            <View style={styles.setsHeader}>
              {!isViewOnly && (
                <>
                  <View style={{ width: 20, marginRight: 10 }} />
                  <Text style={[styles.setHeaderText, { width: 30, textAlign: 'center' }]}>SET</Text>
                </>
              )}
              {isViewOnly && (
                <>
                  <View style={{ width: 20, marginRight: 10 }} />
                  <Text style={[styles.setHeaderText, { width: 30, textAlign: 'center' }]}>SET</Text>
                </>
              )}

              {(() => {
                const exDef = ALL_EXERCISES.find(e => e.name === item.name);
                const type = exDef?.trackingType || 'strength';

                if (type === 'strength') {
                  return (
                    <>
                      <Text style={[styles.setHeaderText, { flex: 1, textAlign: 'center', marginRight: 8 }]}>kg</Text>
                      <Text style={[styles.setHeaderText, { flex: 1, textAlign: 'center', marginRight: 8 }]}>REPS</Text>
                    </>
                  );
                } else if (type === 'cardio') {
                  return (
                    <>
                      <Text style={[styles.setHeaderText, { flex: 1, textAlign: 'center', marginRight: 8 }]}>TIME</Text>
                      <Text style={[styles.setHeaderText, { flex: 1, textAlign: 'center', marginRight: 8 }]}>KCAL</Text>
                    </>
                  );
                } else if (type === 'cardio-distance') {
                  return (
                    <>
                      <Text style={[styles.setHeaderText, { flex: 1, textAlign: 'center', marginRight: 8 }]}>TIME</Text>
                      <Text style={[styles.setHeaderText, { flex: 1, textAlign: 'center', marginRight: 8 }]}>KCAL</Text>
                      <Text style={[styles.setHeaderText, { flex: 1, textAlign: 'center', marginRight: 8 }]}>KM</Text>
                    </>
                  );
                } else if (type === 'bodyweight') {
                  return <Text style={[styles.setHeaderText, { flex: 2, textAlign: 'center', marginRight: 8 }]}>REPS</Text>;
                } else if (type === 'timed') {
                  return <Text style={[styles.setHeaderText, { flex: 2, textAlign: 'center', marginRight: 8 }]}>TIME</Text>;
                }
              })()}
              <View style={{ width: 32 }} />
            </View>

            {item.sets.length > 0 ? (
              item.sets.map((set, sIdx) => {
                const exDef = ALL_EXERCISES.find(e => e.name === item.name);
                const type = exDef?.trackingType || 'strength';
                const showHistory = expandedHistory.has(item.id!);
                return isViewOnly ? (
                  <ReadOnlySetRow key={set.id} set={set} index={sIdx} trackingType={type} />
                ) : (
                  <WorkoutSetRow
                    key={set.id} set={set} index={sIdx}
                    trackingType={type}
                    exerciseName={item.name}
                    showHistory={showHistory}
                    prevSet={item.prevSets?.[sIdx]} onSave={handleUpdateSet} onDelete={handleDeleteSet}
                  />
                );
              })
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
              <View style={styles.addCircle}><Ionicons name="add" size={20} color="#5C4AE4" /></View>
              <Text style={styles.addBtnText}>INJECT NEW MOVEMENT</Text>
            </Pressable>
            <AppButton label="Finish Workout" onPress={handleFinishPress} />
          </>
        )}
      </ScrollView>

      <Modal visible={showStartModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <BlurView intensity={60} tint="dark" style={StyleSheet.absoluteFill} />

          <Animated.View entering={ZoomIn.duration(400)} style={styles.resumeCard}>
            <View style={styles.resumeIconOuter}>
              <View style={styles.iconCircleLarge}>
                <Ionicons name={isWorkoutActive ? "refresh-circle" : "play"} size={42} color="#5C4AE4" />
              </View>
            </View>

            <Text style={styles.resumeTitle}>
              {isWorkoutActive ? "Active Session Found" : "Start Workout?"}
            </Text>

            <Text style={styles.resumeSubtitle}>
              {isWorkoutActive
                ? "You have a workout session currently in progress. Would you like to resume it or finish and view your results?"
                : "Are you ready to begin? The timer will start counting once you confirm your session."}
            </Text>

            <View style={{ width: '100%', gap: 12 }}>
              <View style={{ flexDirection: 'column', gap: 12 }}>
                <AppButton
                  label={isWorkoutActive ? "Resume Session" : "Start Now"}
                  style={{ width: '100%' }}
                  onPress={handleAccept}
                />
                {isWorkoutActive && (
                  <AppButton
                    label='End & View Summary'
                    variant="secondary"
                    style={{ width: '100%' }}
                    onPress={handleStop}
                  />
                )}
              </View>

              <Pressable
                style={styles.cancelLink}
                onPress={isWorkoutActive ? handleStartNew : handleCancel}
              >
                <Text style={[styles.cancelLinkText, isWorkoutActive && { color: '#d94b4b' }]}>
                  {isWorkoutActive ? "Discard & Start Fresh" : "Not yet, go back"}
                </Text>
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
              {stats.volume > 0 && (
                <View style={styles.statBox}>
                  <Text style={styles.statValue}>{stats.volume.toFixed(1)}</Text>
                  <Text style={styles.statLabel}>VOLUME (KG)</Text>
                </View>
              )}
              {stats.distance > 0 && (
                <View style={styles.statBox}>
                  <Text style={styles.statValue}>{stats.distance.toFixed(2)}</Text>
                  <Text style={styles.statLabel}>DISTANCE (KM)</Text>
                </View>
              )}
              {stats.calories > 0 && (
                <View style={styles.statBox}>
                  <Text style={styles.statValue}>{Math.round(stats.calories)}</Text>
                  <Text style={styles.statLabel}>KCAL</Text>
                </View>
              )}
              <View style={styles.statBox}>
                <Text style={styles.statValue}>{stats.sets.toString()}</Text>
                <Text style={styles.statLabel}>SETS DONE</Text>
              </View>
            </View>
            <AppButton label='Done' onPress={confirmFinish} style={{ width: '100%', }} />
          </Animated.View>
        </View>
      </Modal>

      <BottomSheetModal
        ref={bottomSheetModalRef} index={0} snapPoints={snapPoints}
        enableOverDrag={false} backdropComponent={renderBackdrop}
        backgroundStyle={{ borderRadius: 24, backgroundColor: '#fff' }}
      >
        <BottomSheetSectionList
          sections={groupedExercises}
          keyExtractor={(item) => item as string}
          stickySectionHeadersEnabled={false}
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
          renderSectionHeader={({ section: { title } }) => (
            <View style={[styles.sectionHeader, { marginHorizontal: 20 }]}>
              <Text style={styles.sectionHeaderText}>{title}</Text>
            </View>
          )}
          renderItem={({ item, section }) => (
            <Pressable style={[styles.exerciseItem, { marginHorizontal: 20 }]} onPress={() => handleAddExercise(item as string)}>
              <View style={styles.exerciseIcon}>
                <Image
                  source={CategoryImages[section.title] || require('../assets/images/logo.png')}
                  style={{ width: 60, height: 60, resizeMode: 'contain' }}
                />
              </View>
              <Text style={styles.exerciseItemText}>{item as string}</Text>
              <Ionicons name="chevron-forward" size={18} color="#5C4AE4" />
            </Pressable>
          )}
          contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
        />
      </BottomSheetModal>

      <TimedSetModal onComplete={handleTimedSetComplete} />

      <AppAlert
        visible={alertModal.visible}
        title={alertModal.title}
        message={alertModal.message}
        type={alertModal.type}
        onConfirm={() => setAlertModal(prev => ({ ...prev, visible: false }))}
      />
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
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 20 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  exerciseIndex: { fontSize: 12, fontWeight: '700', color: '#5C4AE4', marginLeft: 4, marginRight: 8 },
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
  previousRow: { marginLeft: 64, marginTop: -4, marginBottom: 8, flexDirection: 'row', alignItems: 'center' },
  previousText: { fontSize: 11, color: '#8b92a5', fontWeight: '600', fontStyle: 'italic' },
  addSetBtn: { alignSelf: 'center', paddingVertical: 10, marginTop: 4 },
  addSetBtnText: { fontSize: 12, fontWeight: '700', color: '#5C4AE4' },
  addBtn: { alignItems: 'center', marginTop: 10, marginBottom: 20, padding: 20, borderRadius: 12, backgroundColor: '#fff' },
  addCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#EEF4FF', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  addBtnText: { fontSize: 11, fontWeight: '800', color: '#333', letterSpacing: 1 },
  modalContent: { flex: 1, paddingHorizontal: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 16 },
  modalTitle: { fontSize: 20, fontWeight: '800', color: '#111' },
  closeBtn: { padding: 4 },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f2f4f7', paddingHorizontal: 16, borderRadius: 12, marginBottom: 20 },
  searchInput: { flex: 1, paddingVertical: 12, marginLeft: 10, fontSize: 15, fontWeight: '600', color: '#111' },
  exerciseItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#f0f0f5' },
  exerciseIcon: { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
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
  resumeCard: { backgroundColor: 'rgba(255, 255, 255, 0.98)', width: '100%', borderRadius: 32, padding: 32, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 20 }, shadowOpacity: 0.15, shadowRadius: 30, elevation: 10 },
  resumeIconOuter: { marginBottom: 20 },
  iconCircleLarge: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#EEF4FF', justifyContent: 'center', alignItems: 'center' },
  resumeTitle: { fontSize: 22, fontWeight: '900', color: '#111', marginBottom: 10 },
  resumeSubtitle: { fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 30, lineHeight: 22 },
  cancelLink: { paddingVertical: 10, alignItems: "center" },
  cancelLinkText: { color: '#888', fontSize: 13, fontWeight: '700' },
  sectionHeader: { marginBottom: 10, marginTop: 16 },
  sectionHeaderText: { fontSize: 13, fontWeight: '800', color: '#8b92a5', letterSpacing: 1, textTransform: 'uppercase' },
});
