
import AppButton from '@/components/AppButton';
import { StorageRepository } from '@/services/storageRepository';
import { useUserStore } from '@/store/userStore';
import { Asset } from 'expo-asset';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Image, StyleSheet, Text, View } from 'react-native';
import AnimatedRN, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function WelcomeScreen() {
  const router = useRouter();

  const [isSetupCompleted, setIsSetupCompleted] = useState<boolean | null>(null);
  const [setupDone, setSetupDone] = useState(false);
  const [animDone, setAnimDone] = useState(false);
  const { version } = useUserStore();

  const showButton = setupDone && animDone;
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: 1,
      duration: 2500,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      useNativeDriver: false,
    }).start(() => setAnimDone(true));
    const checkSetup = async () => {
      try {
        await preloadImages();
        const completed = await StorageRepository.isSetupCompleted();
        setIsSetupCompleted(completed);
      } catch (error) {
        console.log('Setup error:', error);
        setIsSetupCompleted(false);
      } finally {
        setSetupDone(true);
      }
    };
    checkSetup();
  }, []);
  const handleGetStarted = () => {
    if (isSetupCompleted) {
      router.replace('/(tabs)/dashboard');
    } else {
      router.replace('/onboarding');
    }
  };

  useEffect(() => {
    if (showButton && isSetupCompleted === true) {
      // router.replace('/(tabs)/dashboard');
      router.replace('/onboarding');

    }
  }, [showButton, isSetupCompleted]);


  const preloadImages = async () => {
    const images = [
      require('../assets/images/onboarding1.png'),
      require('../assets/images/onboarding2.png'),
      require('../assets/images/onboarding3.png'),
      require('../assets/images/male_fitness_model.png'),
      require('../assets/images/female_fitness_model.png'),
    ];
    await Promise.allSettled(
      images.map(async (img) => {
        const asset = Asset.fromModule(img);
        if (!asset.downloaded) {
          await asset.downloadAsync();
        }
      })
    );
  };

  return (
    <SafeAreaView style={styles.responsiveWrapper}>
      <View style={styles.heroBox}>
        <AnimatedRN.View entering={FadeInDown.delay(100).duration(500)} style={styles.iconCircle}>
          <Image source={require('../assets/images/logo.png')} style={styles.image} resizeMode="contain" />
        </AnimatedRN.View>
        <AnimatedRN.Text entering={FadeInDown.delay(200).duration(500)} style={styles.title}>
          LogFit
        </AnimatedRN.Text>
        <AnimatedRN.Text entering={FadeInDown.delay(300).duration(500)} style={styles.subtitle}>
          Track your progress. Crush your limits.
        </AnimatedRN.Text>
      </View>

      <View style={styles.footer}>
        {showButton && isSetupCompleted === false ? (
          <AppButton label='Get Started' onPress={handleGetStarted} />
        ) : (
          <AnimatedRN.View entering={FadeInDown.delay(400).duration(500)} style={styles.progressWrapper}>
            <Text style={styles.loadingLabel}>Setting things up…</Text>
            <View style={styles.progressTrack}>
              <Animated.View
                style={[
                  styles.progressFill,
                  {
                    width: progress.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0%', '100%'],
                    }),
                  },
                ]}
              >
                <LinearGradient
                  colors={['#5C4AE4', '#0B63C6']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={StyleSheet.absoluteFill}
                />
              </Animated.View>
            </View>
          </AnimatedRN.View>
        )}

      </View>

      {version ? (
        <Text style={styles.versionText}>Version {version}</Text>
      ) : null}

    </SafeAreaView >
  );
}

const styles = StyleSheet.create({
  responsiveWrapper: {
    width: '100%',
    maxWidth: 768,
    alignSelf: 'center',
    flex: 1,
    backgroundColor: '#fff',
  },
  heroBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  iconCircle: {
    width: 150,
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    overflow: 'hidden',
  },
  image: { width: 150, height: 150 },
  title: {
    fontSize: 48,
    fontWeight: '900',
    color: '#000',
    letterSpacing: -1,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 18,
    color: '#6B7280',
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 26,
  },

  footer: {
    paddingHorizontal: 30,
    paddingBottom: 50,
    backgroundColor: '#fff',
  },

  progressWrapper: {
    alignItems: 'center',
    gap: 12,
  },
  loadingLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9CA3AF',
    letterSpacing: 0.3,
  },
  progressTrack: {
    width: '100%',
    height: 6,
    backgroundColor: '#F3F4F6',
    borderRadius: 99,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 99,
    overflow: 'hidden',
  },

  versionText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#bcc0c7ff',
    fontWeight: '600',
    paddingBottom: 16,
    letterSpacing: 0.5,
  },
});
