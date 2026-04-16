import { useTimerStore } from '@/store/userTimerStore';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import React, { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, withRepeat, withSequence, withTiming, ZoomIn } from 'react-native-reanimated';
import AppButton from './AppButton';

const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
};

interface TimedSetModalProps {
    onComplete: (duration: number) => void;
}

export default function TimedSetModal({ onComplete }: TimedSetModalProps) {
    const { runningSet, setElapsed, stopSetTimer, isSetTimerModalOpen, toggleSetTimerModal } = useTimerStore();

    const pulseStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: withRepeat(withSequence(withTiming(1.2, { duration: 1000 }), withTiming(1, { duration: 1000 })), -1) }],
            opacity: withRepeat(withSequence(withTiming(0.3, { duration: 1000 }), withTiming(0.1, { duration: 1000 })), -1),
        };
    });

    if (!runningSet) return null;

    return (
        <Modal visible={isSetTimerModalOpen} transparent animationType="fade">
            <View style={styles.overlay}>
                <Pressable style={StyleSheet.absoluteFill} onPress={() => toggleSetTimerModal(false)}>
                    <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
                </Pressable>
                
                <Animated.View entering={ZoomIn.duration(400)} style={styles.card}>
                    <View style={styles.header}>
                        <Text style={styles.exerciseName}>{runningSet.exerciseName}</Text>
                        <View style={styles.badge}>
                            <Ionicons name="stopwatch" size={14} color="#5C4AE4" />
                            <Text style={styles.status}>LIVE STOPWATCH</Text>
                        </View>
                    </View>

                    <View style={styles.timerContainer}>
                        <Animated.View style={[styles.pulseCircle, pulseStyle]} />
                        <View style={styles.clockBody}>
                            <Text style={styles.timeText}>{formatTime(setElapsed)}</Text>
                        </View>
                    </View>

                    <View style={styles.actionRow}>
                        <AppButton 
                            label="Stop & Save" 
                            onPress={() => {
                                onComplete(setElapsed);
                                stopSetTimer();
                            }} 
                            style={{ flex: 1 }}
                            buttonStyle={{ height: 56 }}
                        />
                        <Pressable 
                            style={styles.discardBtn}
                            onPress={() => {
                                stopSetTimer();
                            }}
                        >
                            <Ionicons name="trash-outline" size={24} color="#fff" />
                        </Pressable>
                    </View>

                    <Pressable 
                        style={styles.minimizeBtn}
                        onPress={() => toggleSetTimerModal(false)}
                    >
                        <Text style={styles.minimizeText}>Minimize & Continue</Text>
                    </Pressable>
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
        padding: 20,
    },
    card: {
        width: '100%',
        maxWidth: 340,
        backgroundColor: '#fff',
        borderRadius: 32,
        padding: 24,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 20 },
        shadowOpacity: 0.2,
        shadowRadius: 30,
        elevation: 10,
    },
    header: {
        alignItems: 'center',
        marginBottom: 30,
    },
    exerciseName: {
        fontSize: 22,
        fontWeight: '900',
        color: '#111',
        textAlign: 'center',
        marginBottom: 8,
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#EEF4FF',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
        gap: 6,
    },
    status: {
        fontSize: 10,
        fontWeight: '800',
        color: '#5C4AE4',
        letterSpacing: 1,
    },
    timerContainer: {
        width: 200,
        height: 200,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 40,
    },
    pulseCircle: {
        position: 'absolute',
        width: 160,
        height: 160,
        borderRadius: 80,
        backgroundColor: '#5C4AE4',
    },
    clockBody: {
        width: 170,
        height: 170,
        borderRadius: 85,
        backgroundColor: '#fff',
        borderWidth: 1.5,
        borderColor: 'rgba(0,0,0,0.03)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1,
        shadowColor: '#5C4AE4',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 15,
        elevation: 4,
    },
    timeText: {
        fontSize: 48,
        fontWeight: '900',
        color: '#111',
        fontVariant: ['tabular-nums'],
    },
    actionRow: {
        flexDirection: 'row',
        width: '100%',
        gap: 12,
        marginBottom: 16,
        alignItems: 'center',
    },
    discardBtn: {
        width: 56,
        height: 56,
        borderRadius: 16,
        backgroundColor: '#d94b4b',
        justifyContent: 'center',
        alignItems: 'center',
    },
    minimizeBtn: {
        padding: 4,
    },
    minimizeText: {
       color: '#8b92a5',
       fontSize: 13,
       fontWeight: '700',
    }
});
