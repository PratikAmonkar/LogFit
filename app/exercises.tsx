import AppButton from '@/components/AppButton';
import { CategoryImages } from '@/constants/category_images';
import { ALL_EXERCISES } from '@/constants/exercise_list';
import { RoutineRepository } from '@/services/routineRepository';
import { WorkoutRepository } from '@/services/workoutRepository';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Image, Pressable, SectionList, StyleSheet, Text, TextInput, View } from 'react-native';
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
        await RoutineRepository.addExercisesToRoutine(Number(routineId), selected);
        const existing = await WorkoutRepository.getTodayWorkout(routineName as string);
        if (existing) {
            return router.replace({ pathname: '/workout', params: { workoutId: existing.id, routineName } });
        }
        const newId = await WorkoutRepository.createWorkout(routineName as string);
        for (const name of selected) {
            await WorkoutRepository.addExerciseToWorkout(newId, name);
        }
        router.replace({ pathname: '/workout', params: { workoutId: newId, routineName } });
    };

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

                <SectionList
                    sections={groupedExercises}
                    contentContainerStyle={[
                        styles.listContainer,
                        { paddingBottom: insets.bottom + 100 }
                    ]}
                    renderSectionHeader={({ section: { title } }) => (
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionHeaderText}>{title}</Text>
                        </View>
                    )}
                    renderItem={({ item, section }) => {
                        const isSelected = selected.includes(item);
                        return (
                            <Pressable
                                style={[styles.exerciseItem, isSelected && styles.selectedItem]}
                                onPress={() => toggleExercise(item)}
                            >
                                <View style={[styles.exerciseIcon]}>
                                    <Image
                                        source={CategoryImages[section.title] || require('../assets/images/logo.png')}
                                        style={{ width: 60, height: 60, resizeMode: 'contain' }}
                                    />
                                </View>
                                <Text style={[styles.exerciseItemText, isSelected && styles.selectedText]} numberOfLines={2}>{item}</Text>
                                <Ionicons
                                    name={isSelected ? "checkbox" : "square-outline"}
                                    size={22}
                                    color={isSelected ? "#0B63C6" : "#5C4AE4"}
                                />
                            </Pressable>
                        );
                    }}
                    keyExtractor={(item) => item}
                    showsVerticalScrollIndicator={false}
                    stickySectionHeadersEnabled={false}
                />
                <View style={[styles.footer, { paddingBottom: insets.bottom + 10 }]}>
                    <AppButton label={`Confirm & Start ${selected.length}`} onPress={handleConfirm} />
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
    exerciseIcon: { width: 44, height: 44, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
    exerciseItemText: { flex: 1, fontSize: 15, fontWeight: '700', color: '#333' },
    selectedText: { color: '#0B63C6' },
    footer: { padding: 20, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#f0f0f5' },
    sectionHeader: { marginBottom: 12, marginTop: 8 },
    sectionHeaderText: { fontSize: 13, fontWeight: '800', color: '#8b92a5', letterSpacing: 1, textTransform: 'uppercase' },
});
