import AppButton from '@/components/AppButton';
import { useUserStore } from '@/store/userStore';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HeightScreen() {
  const router = useRouter()
  const { updateProfile } = useUserStore()
  const { gender, weight, mode, initialHeight, initialUnit, weightUnit } = useLocalSearchParams();
  const [unit, setUnit] = useState<'cm' | 'ft'>((initialUnit as 'cm' | 'ft') || 'cm');
  const [personHeight, setPersonHeight] = useState(initialHeight ? parseFloat(initialHeight as string) : 170);
  const scrollRef = useRef<ScrollView>(null);

  const isEdit = mode === 'edit';

  const toggleX = useSharedValue(initialUnit === 'ft' ? 56 : 0);

  const toggleAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: withSpring(toggleX.value, { damping: 50 }) }]
  }));

  const handleUnitChange = (u: 'cm' | 'ft') => {
    if (u === unit) return;

    let newHeight;
    if (u === 'ft') {
      newHeight = parseFloat((personHeight * 0.0328084).toFixed(1));
    } else {
      newHeight = Math.round(personHeight / 0.0328084);
    }

    setUnit(u);
    setPersonHeight(newHeight);
    toggleX.value = u === 'cm' ? 0 : 56;
    const offset = u === 'cm' ? 100 : 3.0;
    const step = u === 'cm' ? 1 : 0.1;
    setTimeout(() => {
      scrollRef.current?.scrollTo({ y: ((newHeight - offset) / step) * 20, animated: true });
    }, 100);
  };

  useEffect(() => {
    const offset = unit === 'cm' ? 100 : 3.0;
    const step = unit === 'cm' ? 1 : 0.1;
    setTimeout(() => {
      scrollRef.current?.scrollTo({ y: ((personHeight - offset) / step) * 20, animated: false });
    }, 100);
  }, []);

  const heights = unit === 'cm'
    ? Array.from({ length: 151 }, (_, i) => i + 100)
    : Array.from({ length: 56 }, (_, i) => parseFloat(((i + 30) / 10).toFixed(1))); // 3.0 to 8.5 ft

  const handlePress = async () => {
    if (isEdit) {
      await updateProfile({
        height: personHeight,
        height_unit: unit
      })
      router.back();
    } else {
      router.push({
        pathname: '/schedule',
        params: {
          gender,
          weight,
          height: personHeight.toString(),
          heightUnit: unit,
          weightUnit
        }
      })
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View entering={FadeInDown.duration(500)} style={styles.content}>
        <View style={styles.header}>
          {isEdit && (
            <Pressable onPress={() => router.back()} style={{ padding: 10, paddingLeft: 0 }}>
              <Ionicons name="chevron-back" size={24} color="#000" />
            </Pressable>
          )}
          <Text style={styles.title}>{isEdit ? 'Update Height' : "What's your height?"}</Text>
          {isEdit && <View style={{ width: 60 }} />}
        </View>

        <View style={styles.toggleContainer}>
          <Animated.View style={[styles.toggleActiveBg, toggleAnimatedStyle]} />
          <Pressable
            style={styles.toggleBtn}
            onPress={() => handleUnitChange('cm')}
          >
            <Text style={[styles.toggleText, unit === 'cm' && styles.toggleTextActive]}>cm</Text>
          </Pressable>
          <Pressable
            style={styles.toggleBtn}
            onPress={() => handleUnitChange('ft')}
          >
            <Text style={[styles.toggleText, unit === 'ft' && styles.toggleTextActive]}>ft</Text>
          </Pressable>
        </View>

        <View style={styles.mainArea}>
          <Text style={styles.valueText}>{personHeight} {unit}</Text>

          <View style={styles.visualContainer}>
            <View style={styles.avatar}>
              {gender === 'female' ? (
                <Image source={require('../assets/images/female_fitness_model.png')} style={styles.image} resizeMode="contain" />
              ) : (
                <Image source={require('../assets/images/male_fitness_model.png')} style={styles.image} resizeMode="contain" />
              )}
            </View>

            <View style={styles.rulerContainer}>
              <ScrollView
                ref={scrollRef}
                showsVerticalScrollIndicator={false}
                snapToInterval={20}
                decelerationRate="fast"
                contentContainerStyle={styles.scrollContent}
                onScroll={(e) => {
                  const y = e.nativeEvent.contentOffset.y;
                  const offset = unit === 'cm' ? 100 : 3.0;
                  const step = unit === 'cm' ? 1 : 0.1;
                  const val = (Math.round(y / 20) * step) + offset;

                  const finalVal = unit === 'cm' ? Math.round(val) : parseFloat(val.toFixed(1));

                  const max = unit === 'cm' ? 250 : 8.5;
                  if (finalVal >= offset && finalVal <= max) {
                    setPersonHeight(finalVal);
                  }
                }}
                scrollEventThrottle={16}
              >
                {heights.map((h, i) => (
                  <View key={i} style={styles.rulerMarker}>
                    {unit === 'cm' ? (
                      h % 10 === 0 && <Text style={styles.rulerText}>{h}</Text>
                    ) : (
                      (Math.round(h * 10) % 5 === 0) && <Text style={styles.rulerText}>{h}</Text>
                    )}
                    <View style={[
                      styles.rulerLine,
                      unit === 'cm'
                        ? (h % 10 === 0 && styles.rulerLineLong)
                        : (Math.round(h * 10) % 5 === 0 && styles.rulerLineLong)
                    ]} />
                  </View>
                ))}
              </ScrollView>
              <View style={styles.pointer} />
            </View>
          </View>
        </View>
        <AppButton label={isEdit ? 'Save Changes' : 'Next'} onPress={handlePress} />
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { flex: 1, padding: 24, justifyContent: 'space-between' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10, marginBottom: 10 },
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
    width: 120,
    height: 44,
    justifyContent: 'space-between',
    marginBottom: 20,
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
  mainArea: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  valueText: { fontSize: 40, fontWeight: 'bold', marginBottom: 20 },
  visualContainer: { flexDirection: 'row', height: 450, alignItems: 'center', width: '100%', justifyContent: 'space-evenly' },
  avatar: { justifyContent: 'flex-end', height: 450, paddingRight: 20 },
  image: { width: 220, height: 450 },
  rulerContainer: { height: 450, width: 80, justifyContent: 'center' },
  scrollContent: { paddingVertical: 215, alignItems: 'center' },
  rulerMarker: { height: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', width: 80 },
  rulerText: { position: 'absolute', left: 4, fontSize: 14, color: '#aaa' },
  rulerLine: { height: 2, width: 20, backgroundColor: '#ddd' },
  rulerLineLong: { width: 40, backgroundColor: '#aaa' },
  pointer: { position: 'absolute', left: 0, right: 0, top: 224, height: 2, backgroundColor: '#5C4AE4', zIndex: 10 },
});
