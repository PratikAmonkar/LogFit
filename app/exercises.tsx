import { EXERCISE_NAMES } from '@/constants/exercise_list';
import { RoutineRepository } from '@/services/routineRepository';
import { WorkoutRepository } from '@/services/workoutRepository';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ExercisesScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { routineId, routineName } = useLocalSearchParams();
    const [selected, setSelected] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState('');

    const toggleExercise = (name: string) => {
        setSelected(prev => prev.includes(name) ? prev.filter(i => i !== name) : [...prev, name]);
    };

    const handleConfirm = async () => {
        if (selected.length === 0) return alert("Select at least one exercise");

        // 1. Save Template
        await RoutineRepository.addExercisesToRoutine(Number(routineId), selected);

        // 2. Check if already started today
        const existing = await WorkoutRepository.getTodayWorkout(routineName as string);
        if (existing) {
            return router.replace({ pathname: '/workout', params: { workoutId: existing.id, routineName } });
        }

        // 3. Create the first session
        const newId = await WorkoutRepository.createWorkout(routineName as string);

        // 4. Clone exercises to session
        for (const name of selected) {
            await WorkoutRepository.addExerciseToWorkout(newId, name);
        }

        router.replace({ pathname: '/workout', params: { workoutId: newId, routineName } });
    };

    const filteredExercises = EXERCISE_NAMES.filter(name =>
        name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <View style={styles.container}>
            <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right']}>
                <View style={styles.header}>
                    <Pressable onPress={() => router.back()} style={styles.backBtn}>
                        <Ionicons name="chevron-back" size={24} color="#111" />
                    </Pressable>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.title} numberOfLines={2}>Exercises for {routineName}</Text>
                    </View>
                </View>

                <View style={styles.searchBar}>
                    <Ionicons name="search" size={20} color="#aaa" />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search exercise..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        autoCapitalize="none"
                    />
                </View>

                <FlatList
                    data={filteredExercises}
                    contentContainerStyle={[
                        styles.listContainer, 
                        { paddingBottom: insets.bottom + 100 }
                    ]}
                    renderItem={({ item }) => {
                        const isSelected = selected.includes(item);
                        return (
                            <Pressable
                                style={[styles.exerciseItem, isSelected && styles.selectedItem]}
                                onPress={() => toggleExercise(item)}
                            >
                                <View style={[styles.exerciseIcon, isSelected && styles.selectedIcon]}>
                                    <Ionicons name="barbell-outline" size={20} color={isSelected ? "#fff" : "#0B63C6"} />
                                </View>
                                <Text style={[styles.exerciseItemText, isSelected && styles.selectedText]}>{item}</Text>
                                <Ionicons
                                    name={isSelected ? "checkbox" : "square-outline"}
                                    size={22}
                                    color={isSelected ? "#0B63C6" : "#ccc"}
                                />
                            </Pressable>
                        );
                    }}
                    keyExtractor={(item) => item}
                    showsVerticalScrollIndicator={false}
                />

                <View style={[styles.footer, { paddingBottom: insets.bottom + 10 }]}>
                    <Pressable style={styles.btn} onPress={handleConfirm}>
                        <Text style={styles.btnText}>CONFIRM & START ({selected.length})</Text>
                    </Pressable>
                </View>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    header: { flexDirection: 'row', alignItems: 'flex-start', paddingHorizontal: 20, paddingTop: 10, marginBottom: 20 },
    backBtn: { marginRight: 12, marginTop: 4 },
    title: { fontSize: 20, fontWeight: '800', color: '#111', flex: 1, lineHeight: 26 },
    searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f2f4f7', marginHorizontal: 20, paddingHorizontal: 16, borderRadius: 12, marginBottom: 20 },
    searchInput: { flex: 1, paddingVertical: 12, marginLeft: 10, fontSize: 15, fontWeight: '600', color: '#111' },
    listContainer: { paddingHorizontal: 20 },
    exerciseItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 14,
        borderRadius: 12,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#f0f0f5',
        marginBottom: 10
    },
    selectedItem: { backgroundColor: '#e6f0fa', borderColor: '#0B63C6' },
    exerciseIcon: { width: 44, height: 44, borderRadius: 10, backgroundColor: '#e6f0fa', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
    selectedIcon: { backgroundColor: '#0B63C6' },
    exerciseItemText: { flex: 1, fontSize: 16, fontWeight: '700', color: '#333' },
    selectedText: { color: '#0B63C6' },
    footer: { padding: 20, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#f0f0f5' },
    btn: { backgroundColor: '#0B63C6', padding: 18, borderRadius: 12, alignItems: 'center' },
    btnText: { color: '#fff', fontWeight: '800', fontSize: 15, letterSpacing: 0.5 },
});
