import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.responsiveWrapper}>
        <Animated.View entering={FadeInUp.duration(400)} style={styles.content}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Log in to continue your fitness journey</Text>

          <View style={styles.form}>
            <Text style={styles.label}>Email Address</Text>
            <TextInput style={styles.input} placeholder="name@example.com" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />

            <Text style={styles.label}>Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[styles.input, { marginBottom: 0, flex: 1 }]}
                placeholder="••••••••"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <Pressable style={styles.eyeIcon} onPress={() => setShowPassword(!showPassword)}>
                <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={22} color="#8b92a5" />
              </Pressable>
            </View>

            <Pressable style={styles.forgotBox} onPress={() => router.push('/forgot')}>
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </Pressable>
          </View>

          <View style={styles.footer}>
            <Pressable style={styles.loginBtn} onPress={() => router.replace('/dashboard')}>
              <Text style={styles.loginBtnText}>Log In</Text>
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
  backBtn: { padding: 20 },
  content: { flex: 1, paddingHorizontal: 24, paddingTop: 30 },
  title: { fontSize: 32, fontWeight: '900', color: '#111', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#666', marginBottom: 40, fontWeight: '500' },
  form: { flex: 1 },
  label: { fontSize: 12, fontWeight: '700', color: '#555', marginBottom: 8 },
  input: { backgroundColor: '#f2f4f7', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 16, fontSize: 16, fontWeight: '600', color: '#111', marginBottom: 20 },
  passwordContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f2f4f7', borderRadius: 12, marginBottom: 20 },
  eyeIcon: { paddingHorizontal: 16 },
  forgotBox: { alignItems: 'flex-end', marginTop: 4 },
  forgotText: { fontSize: 14, fontWeight: '700', color: '#0B63C6' },
  footer: { paddingBottom: 40 },
  loginBtn: { backgroundColor: '#0B63C6', paddingVertical: 18, borderRadius: 16, alignItems: 'center' },
  loginBtnText: { color: '#fff', fontSize: 16, fontWeight: '800', letterSpacing: 1 }
});
