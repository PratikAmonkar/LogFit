import { useTimerStore } from '@/store/userTimerStore';
import { useRouter } from 'expo-router';
import React from 'react';
import { Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
    FadeInRight,
    FadeOutRight,
    useAnimatedStyle,
    useSharedValue,
} from 'react-native-reanimated';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export const WorkoutTimer = () => {
    const router = useRouter();
    const { workoutElapsed, isWorkoutActive, activeWorkoutId, activeRoutineName } = useTimerStore();

    const translateY = useSharedValue(0);
    const context = useSharedValue({ y: 0 });

    const panGesture = Gesture.Pan()
        .onStart(() => {
            context.value = { y: translateY.value };
        })
        .onUpdate((event) => {
            const newY = event.translationY + context.value.y;
            translateY.value = Math.max(-20, Math.min(newY, SCREEN_HEIGHT - 200));
        });

    const animatedWrapperStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: translateY.value }]
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
    timeText: {
        color: '#fff',
        fontWeight: '900',
        fontSize: 15,
        width: 50,
        textAlign: 'center',
        letterSpacing: 0.5,
    }
});
