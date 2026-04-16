import { useTimerStore } from '@/store/userTimerStore';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';
import AppButton from './AppButton';

const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
};

interface WorkoutStatusModalProps {
    visible: boolean;
    onClose: () => void;
}

export default function WorkoutStatusModal({ visible, onClose }: WorkoutStatusModalProps) {
    const router = useRouter();
    const { workoutElapsed, activeRoutineName, activeWorkoutId } = useTimerStore();

    const handleResume = () => {
        onClose();
        if (activeWorkoutId) {
            router.push({
                pathname: '/workout',
                params: {
                    workoutId: activeWorkoutId,
                    routineName: activeRoutineName
                }
            });
        }
    };

    return (
        <Modal visible={visible} transparent animationType="fade">
            <View style={styles.overlay}>
                <Pressable style={StyleSheet.absoluteFill} onPress={onClose}>
                    <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
                </Pressable>

                <Animated.View entering={ZoomIn.duration(400)} style={styles.card}>
                    <View style={styles.header}>
                        <View style={styles.iconCircle}>
                            <Ionicons name="fitness" size={32} color="#5C4AE4" />
                        </View>
                        <Text style={styles.title}>{activeRoutineName || 'Active Workout'}</Text>
                        <Text style={styles.subtitle}>Session in progress</Text>
                    </View>

                    <View style={styles.timerSection}>
                        <Text style={styles.timerLabel}>ELAPSED TIME</Text>
                        <Text style={styles.timeText}>{formatTime(workoutElapsed)}</Text>
                    </View>

                    <View style={styles.footer}>
                        <AppButton 
                            label="Resume Workout" 
                            onPress={handleResume}
                            style={{ width: '100%' }}
                        />
                        <Pressable style={styles.closeLink} onPress={onClose}>
                            <Text style={styles.closeText}>Keep Running in Background</Text>
                        </Pressable>
                    </View>
                </Animated.View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    card: {
        width: '100%',
        maxWidth: 340,
        backgroundColor: '#fff',
        borderRadius: 32,
        padding: 32,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 20 },
        shadowOpacity: 0.2,
        shadowRadius: 30,
        elevation: 10,
    },
    header: {
        alignItems: 'center',
        marginBottom: 32,
    },
    iconCircle: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#EEF4FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 22,
        fontWeight: '900',
        color: '#111',
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 13,
        fontWeight: '600',
        color: '#8b92a5',
        marginTop: 4,
    },
    timerSection: {
        alignItems: 'center',
        marginBottom: 40,
        backgroundColor: '#f8f9fb',
        paddingVertical: 20,
        paddingHorizontal: 40,
        borderRadius: 24,
        width: '100%',
    },
    timerLabel: {
        fontSize: 10,
        fontWeight: '800',
        color: '#8b92a5',
        letterSpacing: 1.5,
        marginBottom: 8,
    },
    timeText: {
        fontSize: 42,
        fontWeight: '900',
        color: '#111',
        fontVariant: ['tabular-nums'],
    },
    footer: {
        width: '100%',
        alignItems: 'center',
    },
    closeLink: {
        marginTop: 20,
        padding: 10,
    },
    closeText: {
        fontSize: 13,
        color: '#8b92a5',
        fontWeight: '700',
    }
});
