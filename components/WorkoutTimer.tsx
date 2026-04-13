import { useTimerStore } from '@/store/userTimerStore';
import { StyleSheet, Text, View } from 'react-native';

export const WorkoutTimer = () => {
    const { workoutElapsed, isWorkoutActive } = useTimerStore();

    if (!isWorkoutActive) return null;

    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h > 0 ? h + ':' : ''}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    return (
        <View style={styles.banner}>
            <Text style={styles.timeText}>{formatTime(workoutElapsed)}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    banner: {
        position: 'absolute',
        top: 50, // Adjust for safe area
        right: 20,
        backgroundColor: '#0B63C6',
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 20,
        zIndex: 1000,
    },
    timeText: { color: '#fff', fontWeight: 'bold', fontSize: 14 }
});
