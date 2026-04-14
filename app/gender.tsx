import AppButton from '@/components/AppButton';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function GenderScreen() {
  const router = useRouter();
  const [gender, setGender] = useState<'male' | 'female' | null>(null);

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View entering={FadeInDown.duration(500)} style={styles.content}>
        <Text style={styles.title}>What's your gender?</Text>

        <View style={styles.cardsContainer}>
          <Pressable
            style={[styles.card, gender === 'male' && styles.cardSelected]}
            onPress={() => setGender('male')}
          >
            <Image
              source={require('../assets/images/male_fitness_model.png')}
              style={styles.image}
              resizeMode="contain"
            />
            <Text style={styles.cardText}>Male</Text>
          </Pressable>

          <Pressable
            style={[styles.card, gender === 'female' && styles.cardSelected]}
            onPress={() => setGender('female')}
          >
            <Image
              source={require('../assets/images/female_fitness_model.png')}
              style={styles.image}
              resizeMode="contain"
            />
            <Text style={styles.cardText}>Female</Text>
          </Pressable>
        </View>
        <AppButton label='Next' onPress={() => router.push({ pathname: '/weight', params: { gender } })} disabled={!gender} />
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { flex: 1, padding: 24, justifyContent: 'space-between' },
  title: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginTop: 40 },
  cardsContainer: { flexDirection: 'row', justifyContent: 'center', gap: 20 },
  card: {
    width: 160,
    height: 240,
    borderWidth: 2,
    borderColor: '#eee',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  cardSelected: { borderColor: '#5C4AE4', backgroundColor: '#fff' },
  image: { width: 140, height: 180, marginBottom: 12 },
  cardText: { fontSize: 18, fontWeight: '600' },
  footer: { marginBottom: 20 },
  button: {
    backgroundColor: '#5C4AE4',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonDisabled: { backgroundColor: '#a8a2dc' },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});
