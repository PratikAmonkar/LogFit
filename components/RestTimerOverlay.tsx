import { useTimerStore } from '@/store/userTimerStore';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import React, { useMemo } from 'react';
import { Dimensions, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeOut, useAnimatedProps, withTiming, ZoomIn } from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';

const { width } = Dimensions.get('window');
const CIRCLE_LENGTH = 565;
const R = 90;

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export const RestTimerOverlay = () => {
    const { restTimeLeft, restTotalTime, isResting, stopRest, startRest } = useTimerStore();

    const progress = useMemo(() => {
        if (!isResting || restTotalTime === 0) return 0;
        return restTimeLeft / restTotalTime;
    }, [restTimeLeft, restTotalTime, isResting]);

    const animatedProps = useAnimatedProps(() => ({
        strokeDashoffset: withTiming(CIRCLE_LENGTH * (1 - progress), { duration: 1000 }),
    }));

    if (!isResting) return null;

    return (
        <Modal visible={isResting} transparent animationType="none">
            <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.fullScreen}>
                <BlurView intensity={70} tint="dark" style={StyleSheet.absoluteFill} />

                <Animated.View entering={ZoomIn.duration(400)} style={styles.card}>
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>RECOVERY PHASE</Text>
                    </View>

                    <View style={styles.timerContainer}>
                        <Svg width={220} height={220} style={styles.svg}>
                            <Circle
                                cx={110} cy={110} r={R}
                                stroke="#f2f4f7"
                                strokeWidth={10}
                                fill="transparent"
                            />
                            <AnimatedCircle
                                cx={110} cy={110} r={R}
                                stroke="#5C4AE4"
                                strokeWidth={10}
                                fill="transparent"
                                strokeDasharray={CIRCLE_LENGTH}
                                animatedProps={animatedProps}
                                strokeLinecap="round"
                                transform={`rotate(-90, 110, 110)`}
                            />
                        </Svg>

                        <View style={styles.timerContent}>
                            <Text style={styles.timerText}>{restTimeLeft}</Text>
                            <Text style={styles.secondsLabel}>sec remaining</Text>
                        </View>
                    </View>

                    <View style={styles.footer}>
                        <Pressable
                            style={({ pressed }) => [styles.outlineBtn, pressed && styles.btnPressed]}
                            onPress={() => startRest(restTimeLeft + 30)}
                        >
                            <View style={styles.plusIcon}>
                                <Ionicons name="add" size={18} color="#0B63C6" />
                            </View>
                            <Text style={styles.outlineBtnText}>+30s</Text>
                        </Pressable>

                        <Pressable
                            style={({ pressed }) => [styles.primaryBtn, pressed && styles.btnPressed]}
                            onPress={stopRest}
                        >
                            <Text style={styles.primaryBtnText}>Skip Rest</Text>
                            <View style={styles.arrowIcon}>
                                <Ionicons name="play-skip-forward" size={14} color="#fff" />
                            </View>
                        </Pressable>
                    </View>
                </Animated.View>
            </Animated.View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    fullScreen: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    card: {
        backgroundColor: 'rgba(255, 255, 255, 0.98)',
        width: width * 0.88,
        borderRadius: 40,
        padding: 32,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 20 },
        shadowOpacity: 0.15,
        shadowRadius: 40,
        elevation: 10,
    },
    badge: {
        backgroundColor: '#EEF4FF',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        marginBottom: 20,
    },
    badgeText: { color: '#5C4AE4', fontSize: 10, fontWeight: '900', letterSpacing: 1.2 },
    timerContainer: {
        width: 220,
        height: 220,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 30,
    },
    svg: { position: 'absolute' },
    timerContent: { alignItems: 'center' },
    timerText: { fontSize: 72, fontWeight: '900', color: '#111' },
    secondsLabel: { fontSize: 13, color: '#8b92a5', fontWeight: '700', marginTop: -5 },
    footer: { flexDirection: 'row', gap: 15, width: '100%' },
    btnPressed: { opacity: 0.7, transform: [{ scale: 0.98 }] },
    outlineBtn: {
        flex: 1,
        height: 60,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#EEF4FF',
        borderRadius: 20,
        gap: 8,
    },
    plusIcon: { backgroundColor: '#fff', padding: 2, borderRadius: 6 },
    outlineBtnText: { color: '#5C4AE4', fontWeight: '800', fontSize: 15 },
    primaryBtn: {
        flex: 1.5,
        height: 60,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#5C4AE4',
        borderRadius: 20,
        gap: 10,
        shadowColor: '#0B63C6',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
    },
    arrowIcon: { backgroundColor: 'rgba(255,255,255,0.2)', padding: 4, borderRadius: 8 },
    primaryBtnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
});
