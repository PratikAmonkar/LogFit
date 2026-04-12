import { useUserStore } from '@/store/userStore';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Dimensions, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');
const RULER_WIDTH = width - 48; // Account for 24px padding on both sides in styles.content

export default function WeightScreen() {
  const router = useRouter();
  const { isLoading, updateProfile } = useUserStore();
  const { gender, mode, initialWeight, initialUnit } = useLocalSearchParams();
  const [unit, setUnit] = useState<'kg' | 'lb'>((initialUnit as 'kg' | 'lb') || 'kg');
  const [weight, setWeight] = useState(initialWeight ? parseInt(initialWeight as string) : 60);
  const scrollRef = useRef<ScrollView>(null);

  const isEdit = mode === 'edit';

  const toggleX = useSharedValue(initialUnit === 'lb' ? 56 : 0);

  const toggleAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: withSpring(toggleX.value, { damping: 50 }) }]
  }));

  const weights = unit === 'kg'
    ? Array.from({ length: 231 }, (_, i) => i + 20)  // 20 to 250
    : Array.from({ length: 511 }, (_, i) => i + 40); // 40 to 550

  const handleUnitChange = (u: 'kg' | 'lb') => {
    if (u === unit) return;

    let newWeight;
    if (u === 'lb') {
      newWeight = Math.round(weight * 2.20462);
    } else {
      newWeight = Math.round(weight / 2.20462);
    }

    const min = u === 'kg' ? 20 : 40;
    const max = u === 'kg' ? 250 : 550;
    newWeight = Math.max(min, Math.min(max, newWeight));

    setUnit(u);
    setWeight(newWeight);
    toggleX.value = u === 'kg' ? 0 : 56;

    setTimeout(() => {
      scrollRef.current?.scrollTo({ x: (newWeight - min) * 20, animated: true });
    }, 100);
  };

  useEffect(() => {
    const min = unit === 'kg' ? 20 : 40;
    setTimeout(() => {
      scrollRef.current?.scrollTo({ x: (weight - min) * 20, animated: false });
    }, 100);
  }, []);

  const handlePress = async () => {
    if (isEdit) {
      await updateProfile({
        weight: weight,
        weight_unit: unit
      });
      router.back();
    } else {
      router.push({
        pathname: '/height',
        params: { gender, weight: weight.toString(), unit }
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View entering={FadeInDown.duration(500)} style={styles.content}>
        <View style={{ height: 40, flexDirection: 'row', alignItems: 'center' }}>
          {isEdit && (
            <Pressable onPress={() => router.back()} style={{ padding: 10, paddingLeft: 0 }}>
              <Ionicons name="chevron-back" size={24} color="#000" />
            </Pressable>
          )}
          <Text style={styles.title}>{isEdit ? 'Update Weight' : "What's your weight?"}</Text>
          {isEdit && <View style={{ width: 60 }} />}
        </View>

        <View style={styles.toggleContainer}>
          <Animated.View style={[styles.toggleActiveBg, toggleAnimatedStyle]} />
          <Pressable
            style={styles.toggleBtn}
            onPress={() => handleUnitChange('kg')}
          >
            <Text style={[styles.toggleText, unit === 'kg' && styles.toggleTextActive]}>kg</Text>
          </Pressable>
          <Pressable
            style={styles.toggleBtn}
            onPress={() => handleUnitChange('lb')}
          >
            <Text style={[styles.toggleText, unit === 'lb' && styles.toggleTextActive]}>lb</Text>
          </Pressable>
        </View>

        <View style={styles.rulerContainer}>
          <Text style={styles.valueText}>{weight} {unit}</Text>

          <ScrollView
            ref={scrollRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToInterval={20}
            decelerationRate="fast"
            contentContainerStyle={styles.scrollContent}
            onScroll={(e) => {
              const x = e.nativeEvent.contentOffset.x;
              const min = unit === 'kg' ? 20 : 40;
              const val = Math.round(x / 20) + min;
              const max = unit === 'kg' ? 250 : 550;
              if (val >= min && val <= max) {
                setWeight(val);
              }
            }}
            scrollEventThrottle={16}
          >
            {weights.map((w, i) => (
              <View key={i} style={styles.rulerMarker}>
                {w % 10 === 0 && <Text style={styles.rulerText}>{w}</Text>}
                <View style={[styles.rulerLine, w % 10 === 0 && styles.rulerLineLong]} />
              </View>
            ))}
          </ScrollView>
          <View style={styles.pointer} />
        </View>

        <View style={styles.footer}>
          <Pressable
            style={styles.button}
            onPress={handlePress}
          >
            <Text style={styles.buttonText}>{isEdit ? 'Save Changes' : 'Next'}</Text>
          </Pressable>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { flex: 1, padding: 24, justifyContent: 'space-between' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10, marginBottom: 20 },
  backBtn: { padding: 10, paddingLeft: 0 },
  title: { fontSize: 26, fontWeight: 'bold', textAlign: 'center', flex: 1 },
  toggleContainer: {
    flexDirection: 'row',
    alignSelf: 'center',
    backgroundColor: '#fff',
    borderRadius: 30,
    borderWidth: 1,
    borderColor: '#eee',
    marginTop: 20,
    position: 'relative',
    width: 120, // (24*2) + (36*2) approx
    height: 44,
    justifyContent: 'space-between'
  },
  toggleActiveBg: {
    position: 'absolute',
    top: 2,
    left: 2,
    bottom: 2,
    width: 58,
    backgroundColor: '#000',
    borderRadius: 24,
  },
  toggleBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', justifyContent: 'center', zIndex: 1 },
  toggleText: { fontSize: 16, color: '#000', fontWeight: '500' },
  toggleTextActive: { color: '#fff' },
  rulerContainer: { alignItems: 'center', marginTop: 40, height: 250, justifyContent: 'center' },
  valueText: { fontSize: 40, fontWeight: 'bold', marginBottom: 40 },
  scrollContent: { paddingHorizontal: RULER_WIDTH / 2 - 10, alignItems: 'center' },
  rulerMarker: { width: 20, alignItems: 'center', justifyContent: 'flex-end', height: 80 },
  rulerText: { position: 'absolute', top: 0, fontSize: 14, color: '#aaa', width: 40, textAlign: 'center' },
  rulerLine: { width: 2, height: 25, backgroundColor: '#ddd', marginTop: 25 },
  rulerLineLong: { height: 45, backgroundColor: '#aaa' },
  pointer: {
    position: 'absolute',
    bottom: 30,
    width: 2,
    height: 75,
    backgroundColor: '#5C4AE4',
    zIndex: 10,
    left: RULER_WIDTH / 2 - 1
  },
  footer: { marginBottom: 20 },
  button: { backgroundColor: '#5C4AE4', paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});
