import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, TextInput, ActivityIndicator, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';

export default function RegisterScreen() {
  const navigation = useNavigation();
  const { register } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async () => {
    if (!displayName || !email || !password) {
      Alert.alert('Missing info', 'Please fill name, email and password.');
      return;
    }
    if (password.length < 8) {
      Alert.alert('Weak password', 'Password must be at least 8 characters.');
      return;
    }
    const emailTrimmed = email.trim().toLowerCase();
    try {
      setSubmitting(true);
      await register(displayName.trim(), emailTrimmed, password);
      // navigation switches automatically based on token
    } catch (e) {
      // Prefer backend messages; fall back to a helpful network hint
      const backendMsg = e?.response?.data?.message ||
        (Array.isArray(e?.response?.data?.errors) ? e.response.data.errors.join('\n') : null);
      if (backendMsg) {
        Alert.alert('Registration failed', backendMsg);
      } else if (e?.request && !e?.response) {
        // Likely network/baseURL issue
        const apiModule = require('../services/api');
        const base = apiModule?.api?.defaults?.baseURL || 'unknown';
        Alert.alert('Network error', `Could not reach API at:\n${base}\n\nIf you are on Android emulator, the API must be available at 10.0.2.2. On a real device, use your computer's LAN IP.`);
      } else {
        Alert.alert('Registration failed', 'Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <LinearGradient colors={["#0a1a3d", "#000000"]} style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.content}>
        <Text style={styles.title}>Create account</Text>
        <Text style={styles.subtitle}>Sign up to get started</Text>

        <View style={{ alignSelf: 'stretch', gap: 12 }}>
          <TextInput
            style={styles.input}
            placeholder="Display name"
            placeholderTextColor="#9fb0ff"
            value={displayName}
            onChangeText={setDisplayName}
          />
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#9fb0ff"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
          <TextInput
            style={styles.input}
            placeholder="Password (min 8)"
            placeholderTextColor="#9fb0ff"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity style={[styles.button, submitting && { opacity: 0.7 }]} onPress={onSubmit} disabled={submitting}>
            {submitting ? <ActivityIndicator color="#eaf0ff" /> : <Text style={styles.buttonText}>Sign up</Text>}
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={[styles.linkBtn]} onPress={() => navigation.navigate('Login')} disabled={submitting}>
          <Text style={styles.linkText}>I already have an account</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 16,
  },
  title: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
  },
  subtitle: {
    color: '#cfd8ff',
    fontSize: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    color: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
  },
  button: {
    backgroundColor: '#1f3b73',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#4a6bb3',
    alignItems: 'center',
  },
  buttonText: {
    color: '#eaf0ff',
    fontSize: 16,
    fontWeight: '600',
  },
  linkBtn: { paddingTop: 12 },
  linkText: { color: '#9fb0ff' },
});
