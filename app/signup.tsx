import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SignupScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.responsiveWrapper}>
        <Animated.View entering={FadeInUp.duration(400)} style={styles.content}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Enter your details to track your first workout</Text>

          <View style={styles.form}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput style={styles.input} placeholder="John Doe" value={name} onChangeText={setName} returnKeyType='next' />

            <Text style={styles.label}>Email Address</Text>
            <TextInput style={styles.input} placeholder="name@example.com" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" returnKeyType='next' />

            <Text style={styles.label}>Password</Text>
            <TextInput style={styles.input} placeholder="••••••••" value={password} onChangeText={setPassword} secureTextEntry />
          </View>

          <View style={styles.footer}>
            <Pressable style={styles.loginBtn} onPress={() => router.replace('/gender')}>
              <Text style={styles.loginBtnText}>Create Account</Text>
            </Pressable>
          </View>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  responsiveWrapper: { width: '100%', maxWidth: 768, alignSelf: 'center', flex: 1 },
  content: { flex: 1, paddingHorizontal: 24, paddingTop: 30 },
  title: { fontSize: 32, fontWeight: '900', color: '#111', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#666', marginBottom: 40, fontWeight: '500' },
  form: { flex: 1 },
  label: { fontSize: 12, fontWeight: '700', color: '#555', marginBottom: 8 },
  input: { backgroundColor: '#f2f4f7', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 16, fontSize: 16, fontWeight: '600', color: '#111', marginBottom: 20 },
  footer: { paddingBottom: 40 },
  loginBtn: { backgroundColor: '#0B63C6', paddingVertical: 18, borderRadius: 16, alignItems: 'center' },
  loginBtnText: { color: '#fff', fontSize: 16, fontWeight: '800', letterSpacing: 1 }
});
