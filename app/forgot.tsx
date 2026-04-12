import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';

export default function ForgotScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');

  return (
    <SafeAreaView style={styles.container}>
      <Pressable style={styles.backBtn} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color="#111" />
      </Pressable>

      <Animated.View entering={FadeInUp.duration(400)} style={styles.content}>
        <Text style={styles.title}>Reset Password</Text>
        <Text style={styles.subtitle}>Enter your email account and we will send you a reset link.</Text>

        <View style={styles.form}>
          <Text style={styles.label}>Email Address</Text>
          <TextInput style={styles.input} placeholder="name@example.com" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
        </View>

        <View style={styles.footer}>
          <Pressable style={styles.loginBtn} onPress={() => { alert('Link Sent!'); router.back(); }}>
            <Text style={styles.loginBtnText}>Send Reset Link</Text>
          </Pressable>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  backBtn: { padding: 20 },
  content: { flex: 1, paddingHorizontal: 24, paddingTop: 10 },
  title: { fontSize: 32, fontWeight: '900', color: '#111', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#666', marginBottom: 40, fontWeight: '500', lineHeight: 24 },
  form: { flex: 1 },
  label: { fontSize: 12, fontWeight: '700', color: '#555', marginBottom: 8 },
  input: { backgroundColor: '#f2f4f7', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 16, fontSize: 16, fontWeight: '600', color: '#111', marginBottom: 20 },
  footer: { paddingBottom: 40 },
  loginBtn: { backgroundColor: '#0B63C6', paddingVertical: 18, borderRadius: 16, alignItems: 'center' },
  loginBtnText: { color: '#fff', fontSize: 16, fontWeight: '800', letterSpacing: 1 }
});
