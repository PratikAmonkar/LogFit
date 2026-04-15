import AppButton from '@/components/AppButton';
import { NotificationService } from '@/services/notificationService';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
    Dimensions,
    FlatList,
    Image,
    Pressable,
    StyleSheet,
    Text,
    View,
    ViewToken,
} from 'react-native';
import Animated, {
    FadeIn,
    FadeInDown,
    useAnimatedStyle,
    withSpring
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const SLIDES = [
    {
        id: '1',
        image: require('../assets/images/onboarding1.png'),
        title: 'Build Your\nPerfect Routine',
        subtitle: 'Create custom workout plans tailored to your goals. Every rep, every set — tracked perfectly.',
    },
    {
        id: '2',
        image: require('../assets/images/onboarding2.png'),
        title: 'Track Every\nGain You Make',
        subtitle: 'Monitor your progress with detailed history and stats. Watch yourself grow stronger every week.',
    },
    {
        id: '3',
        image: require('../assets/images/onboarding3.png'),
        title: 'Crush Your\nLimits Daily',
        subtitle: 'Stay consistent, hit your targets, and become the strongest version of yourself.',
    },
    {
        id: '4',
        image: require('../assets/images/onboarding4.png'),
        title: 'Stay Notified,\nStay Consistent',
        subtitle: 'Get gym reminders, streak alerts, and stay on track with your fitness goals.',
    },

];

export default function OnboardingScreen() {
    const router = useRouter();
    const flatListRef = useRef<FlatList>(null);
    const [activeIndex, setActiveIndex] = useState(0);

    const onViewableItemsChanged = useRef(
        ({ viewableItems }: { viewableItems: ViewToken[] }) => {
            if (viewableItems.length > 0) {
                setActiveIndex(viewableItems[0].index ?? 0);
            }
        }
    ).current;

    const goNext = async () => {
        if (activeIndex < SLIDES.length - 1) {
            flatListRef.current?.scrollToIndex({ index: activeIndex + 1 });
        } else {
            await NotificationService.requestPermission()
            router.replace('/gender');
        }
    };

    const goSkip = () => {
        flatListRef.current?.scrollToEnd({ animated: true });
    };

    return (
        <SafeAreaView style={styles.container}>
            <Animated.View
                entering={FadeIn.duration(400)}
                style={[
                    styles.skipRow,
                    { opacity: activeIndex < SLIDES.length - 1 ? 1 : 0 }
                ]}
            >
                <Pressable onPress={goSkip} style={styles.skipBtn}>
                    <Text style={styles.skipText}>Skip</Text>
                </Pressable>
            </Animated.View>

            <FlatList
                ref={flatListRef}
                data={SLIDES}
                keyExtractor={(item) => item.id}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onViewableItemsChanged={onViewableItemsChanged}
                viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
                renderItem={({ item, index }) => (
                    <Slide item={item} isActive={activeIndex === index} />
                )}
            />

            <View style={styles.footer}>
                <View style={styles.dotsRow}>
                    {SLIDES.map((_, i) => (
                        <Dot key={i} index={i} activeIndex={activeIndex} />
                    ))}
                </View>
                <AppButton
                    label={activeIndex === SLIDES.length - 1 ? "Let's Go 🚀" : 'Continue'}
                    onPress={goNext}
                />
            </View>
        </SafeAreaView>
    );
}

function Slide({ item, isActive }: { item: typeof SLIDES[0]; isActive: boolean }) {
    return (
        <View style={[styles.slide]}>
            <Animated.View
                entering={isActive ? FadeInDown.delay(100).duration(500) : undefined}
                style={[styles.illustrationCard]}
            >
                <Image
                    source={item.image}
                    style={styles.slideImage}
                    resizeMode="contain"
                />
            </Animated.View>
            <Animated.View
                entering={isActive ? FadeInDown.delay(200).duration(500) : undefined}
                style={styles.textBlock}
            >
                <Text style={[styles.slideTitle]}>{item.title}</Text>
                <Text style={styles.slideSubtitle}>{item.subtitle}</Text>
            </Animated.View>
        </View>
    );
}

function Dot({ index, activeIndex }: { index: number; activeIndex: number }) {
    const isActive = index === activeIndex;
    const animStyle = useAnimatedStyle(() => ({
        width: withSpring(isActive ? 28 : 8, { damping: 40 }),
        opacity: withSpring(isActive ? 1 : 0.35),
    }));

    return (
        <Animated.View
            style={[
                styles.dot,
                { backgroundColor: "#5C4AE4" },
                animStyle,
            ]}
        />
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    skipRow: {
        alignItems: 'flex-end',
        paddingHorizontal: 24,
        paddingTop: 8,
        paddingBottom: 4,
    },
    skipBtn: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#5C4AE4',
    },
    skipText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#ffffff',
    },

    slide: {
        width,
        flex: 1,
        paddingHorizontal: 28,
        paddingTop: 16,
        alignItems: 'center',
    },
    illustrationCard: {
        width: '100%',
        height: 320,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        marginBottom: 40,
    },
    slideImage: {
        width: '85%',
        height: '100%',
    },
    textBlock: {
        alignItems: 'center',
        paddingHorizontal: 8,
    },
    slideTitle: {
        fontSize: 34,
        fontWeight: '900',
        textAlign: 'center',
        letterSpacing: -0.5,
        lineHeight: 42,
        marginBottom: 16,
    },
    slideSubtitle: {
        fontSize: 16,
        color: '#6B7280',
        textAlign: 'center',
        lineHeight: 26,
        fontWeight: '400',
    },

    footer: {
        paddingHorizontal: 28,
        paddingBottom: 36,
        paddingTop: 20,
        gap: 20,
    },
    dotsRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 6,
    },
    dot: {
        height: 8,
        borderRadius: 4,
    },
});
