import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, TextInput, ActivityIndicator, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen() {
  const navigation = useNavigation();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async () => {
    if (!email || !password) {
      Alert.alert('Missing info', 'Please enter email and password.');
      return;
    }
    try {
      setSubmitting(true);
      await login(email.trim(), password);
      // navigation will switch automatically based on token
    } catch (e) {
      const msg = e?.response?.data?.message || 'Login failed. Please check your credentials.';
      Alert.alert('Login failed', msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <LinearGradient colors={["#0a1a3d", "#000000"]} style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.content}>
        <Text style={styles.title}>Welcome back</Text>
        <Text style={styles.subtitle}>Sign in to continue</Text>

        <View style={{ alignSelf: 'stretch', gap: 12 }}>
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
            placeholder="Password"
            placeholderTextColor="#9fb0ff"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity style={[styles.button, submitting && { opacity: 0.7 }]} onPress={onSubmit} disabled={submitting}>
            {submitting ? <ActivityIndicator color="#eaf0ff" /> : <Text style={styles.buttonText}>Sign in</Text>}
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={[styles.linkBtn]} onPress={() => navigation.navigate('Register')} disabled={submitting}>
          <Text style={styles.linkText}>Create account</Text>
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
