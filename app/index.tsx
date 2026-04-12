import { StorageRepository } from '@/services/storageRepository';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function WelcomeScreen() {
  const router = useRouter();
  const [isSetupCompleted, setIsSetupCompleted] = useState<boolean | null>(null);

  useEffect(() => {
    const checkSetup = async () => {
      const completed = await StorageRepository.isSetupCompleted();
      setIsSetupCompleted(completed);

      if (completed) {
        setTimeout(() => {
          router.replace('/(tabs)/dashboard');
        }, 2000);
      }
    };
    checkSetup();
  }, []);

  return (
    <View style={styles.responsiveWrapper}>
      <View style={styles.heroBox}>
        <Animated.View entering={FadeInDown.delay(100).duration(500)} style={styles.iconCircle}>
          <Image source={require('../assets/images/logo.png')} style={styles.image} resizeMode="contain" />
        </Animated.View>
        <Animated.Text entering={FadeInDown.delay(200).duration(500)} style={styles.title}>
          LogFit
        </Animated.Text>
        <Animated.Text entering={FadeInDown.delay(300).duration(500)} style={styles.subtitle}>
          Track your progress. Crush your limits.
        </Animated.Text>
      </View>

      {!isSetupCompleted && (
        <Animated.View entering={FadeInDown.delay(500).duration(500)} style={styles.footer}>
          <Pressable style={styles.primaryBtn} onPress={() => router.replace('/gender')}>
            <Text style={styles.primaryBtnText}>Get Started</Text>
          </Pressable>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  responsiveWrapper: { width: '100%', maxWidth: 768, alignSelf: 'center', flex: 1, backgroundColor: "#fff" },
  heroBox: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 },
  iconCircle: { width: 150, height: 150, justifyContent: 'center', alignItems: 'center', marginBottom: 30, overflow: 'hidden' },
  image: { width: 150, height: 150 },
  title: { fontSize: 48, fontWeight: '900', color: '#000000', letterSpacing: -1, marginBottom: 12 },
  subtitle: { fontSize: 18, color: '#000', textAlign: 'center', fontWeight: '500', lineHeight: 26 },
  footer: { padding: 30, paddingBottom: 50, backgroundColor: '#fff' },
  primaryBtn: { backgroundColor: '#0B63C6', paddingVertical: 18, borderRadius: 16, alignItems: 'center', marginBottom: 16 },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '800', letterSpacing: 1 },
  secondaryBtn: { paddingVertical: 16, alignItems: 'center' },
  secondaryBtnText: { color: '#000', fontSize: 15, fontWeight: '700' }
});
