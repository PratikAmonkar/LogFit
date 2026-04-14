import { useTimerStore } from '@/store/userTimerStore';
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
    FadeInRight,
    FadeOutRight,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming,
} from 'react-native-reanimated';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export const WorkoutTimer = () => {
    const router = useRouter();
    const { workoutElapsed, isWorkoutActive, activeWorkoutId, activeRoutineName } = useTimerStore();

    // Dragging Logic
    const translateY = useSharedValue(0);
    const context = useSharedValue({ y: 0 });

    const panGesture = Gesture.Pan()
        .onStart(() => {
            context.value = { y: translateY.value };
        })
        .onUpdate((event) => {
            // Constrain movement within screen bounds
            const newY = event.translationY + context.value.y;
            translateY.value = Math.max(-20, Math.min(newY, SCREEN_HEIGHT - 200));
        });

    const animatedWrapperStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: translateY.value }]
    }));

    // Pulsing Logic
    const pulse = useSharedValue(1);
    useEffect(() => {
        if (isWorkoutActive) {
            pulse.value = withRepeat(withTiming(0.4, { duration: 1000 }), -1, true);
        }
    }, [isWorkoutActive]);

    const pulseStyle = useAnimatedStyle(() => ({
        opacity: pulse.value,
        transform: [{ scale: pulse.value * 0.5 + 0.5 }]
    }));

    if (!isWorkoutActive) return null;

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    const handleNavigate = () => {
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
        <GestureDetector gesture={panGesture}>
            <Animated.View
                entering={FadeInRight}
                exiting={FadeOutRight}
                style={[styles.container, animatedWrapperStyle]}
            >
                <Pressable
                    style={styles.bubble}
                    onPress={handleNavigate}
                >
                    <View style={styles.content}>
                        <Text style={styles.timeText}>{formatTime(workoutElapsed)}</Text>
                    </View>
                </Pressable>
            </Animated.View>
        </GestureDetector>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 65,
        right: 0,
        zIndex: 9999,
    },
    bubble: {
        backgroundColor: '#5C4AE4',
        paddingLeft: 14,
        paddingRight: 10,
        paddingVertical: 10,
        borderTopLeftRadius: 18,
        borderBottomLeftRadius: 18,
        shadowColor: '#000',
        shadowOffset: { width: -4, height: 6 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 12,
        borderLeftWidth: 1.5,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    liveContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,59,48,0.1)',
        paddingHorizontal: 7,
        paddingVertical: 4,
        borderRadius: 8,
        gap: 5,
    },
    dot: {
        width: 7,
        height: 7,
        borderRadius: 3.5,
        backgroundColor: '#ff3b30',
        shadowColor: '#ff3b30',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 4,
    },
    liveText: {
        color: '#ff3b30',
        fontSize: 10,
        fontWeight: '900',
        letterSpacing: 0.8,
    },
    timeText: {
        color: '#fff',
        fontWeight: '900',
        fontSize: 15,
        width: 50,
        textAlign: 'center',
        letterSpacing: 0.5,
    }
});
