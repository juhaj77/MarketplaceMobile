import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, StatusBar, KeyboardAvoidingView, Platform, ScrollView, Image, ActivityIndicator, Alert, Linking } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { api } from '../services/api';

export default function ProductFormScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { id } = route.params || {};

  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [imageUri, setImageUri] = useState(null);
  const [loading, setLoading] = useState(!!id);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;
    let mounted = true;
    (async () => {
      try {
        const res = await api.get(`/products/${id}`);
        const payload = res.data;
        const p = payload?.product ?? payload;
        if (!mounted) return;
        setTitle(p?.title || '');
        setPrice(p?.price != null ? String(p.price) : '');
        setDescription(p?.description || '');
        if (p?.imageUrl) setImageUri(p.imageUrl);
      } catch (e) {
        const msg = e?.response?.data?.message || 'Failed to load product';
        Alert.alert('Error', msg);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [id]);

  const pickImage = async () => {
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      const granted = perm?.granted || perm?.status === 'granted';
      const canAskAgain = perm?.canAskAgain !== false;
      if (!granted) {
        if (!canAskAgain) {
          Alert.alert(
            'Permission required',
            'Photo library access is blocked. Please enable Photos permission in system settings.',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Open Settings', onPress: () => Linking.openSettings?.() }
            ]
          );
        } else {
          Alert.alert('Permission required', 'We need access to your photo library to select images.');
        }
        return;
      }

      // Build options compatible with Expo SDK 51. Some environments mistakenly
      // end up passing an array for mediaTypes; sanitize to a string or omit.
      const rawOptions = {
        mediaTypes: 'images',
        quality: 0.8,
        exif: false,
      };
      const options = Array.isArray(rawOptions.mediaTypes)
        ? { quality: rawOptions.quality, exif: rawOptions.exif }
        : rawOptions;
      if (__DEV__) {
        // eslint-disable-next-line no-console
        console.log('[ImagePicker] options (final) ->', options, 'mediaTypes type=', typeof options.mediaTypes);
      }
      let result;
      try {
        result = await ImagePicker.launchImageLibraryAsync(options);
      } catch (err) {
        // Retry with no options if the native module complains about a type mismatch
        const msg = String(err?.message || err);
        if (__DEV__) {
          // eslint-disable-next-line no-console
          console.warn('[ImagePicker] first attempt failed, retrying with no options. Error:', msg);
        }
        result = await ImagePicker.launchImageLibraryAsync();
      }

      if (!result?.canceled && result?.assets?.length) {
        setImageUri(result.assets[0].uri);
      }
    } catch (e) {
      // Surface the error so it doesn't become an unhandled promise rejection
      const msg = e?.message || 'Could not open image library.';
      console.warn('[ImagePicker] Error:', e);
      Alert.alert('Image picker error', msg);
    }
  };

  const onSave = async () => {
    if (!title || !price || !String(description).trim()) {
      Alert.alert('Missing info', 'Please provide name, price, and description.');
      return;
    }
    const priceNumber = Number(String(price).replace(',', '.'));
    if (Number.isNaN(priceNumber)) {
      Alert.alert('Invalid price', 'Please enter a valid number for price.');
      return;
    }

    // Preflight auth: ensure we have a token before attempting a protected request
    let token;
    try {
      token = await SecureStore.getItemAsync('token');
    } catch (_) { /* ignore */ }
    if (!token) {
      Alert.alert('Session expired', 'Please sign in again.');
      try { navigation.navigate('Login'); } catch (_) {}
      return;
    }

    try {
      setSubmitting(true);
      const form = new FormData();
      form.append('title', String(title));
      form.append('description', String(description));
      // RN + Axios can throw ERR_NETWORK if a number is appended to FormData; always send strings
      form.append('price', String(priceNumber));
      const isLocalAsset = typeof imageUri === 'string' && (imageUri.startsWith('file:') || imageUri.startsWith('content:'));
      if (isLocalAsset) {
        const filename = imageUri.split('/').pop() || 'image.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const ext = match ? match[1].toLowerCase() : 'jpg';
        const type = ext === 'png' ? 'image/png' : 'image/jpeg';
        form.append('image', { uri: imageUri, name: filename, type });
      }
      const reqConfig = { timeout: 60000 };
      try {
        if (id) {
          await api.put(`/products/${id}`, form, reqConfig); // let axios set multipart boundary
        } else {
          await api.post('/products', form, reqConfig); // let axios set multipart boundary
        }
      } catch (err) {
        // Axios on RN can sometimes throw ERR_NETWORK for multipart even with correct baseURL.
        // Fallback to fetch which is often more reliable for multipart uploads on device.
        const isNetworkErr = err?.code === 'ERR_NETWORK' || /Network Error/i.test(String(err?.message || ''));
        if (!isNetworkErr) throw err;
        if (__DEV__) {
          // eslint-disable-next-line no-console
          console.warn('[Upload] Axios failed with ERR_NETWORK, retrying with fetch...');
        }
        const base = api?.defaults?.baseURL?.replace(/\/$/, '') || '';
        const path = id ? `/products/${id}` : '/products';
        const url = `${base}${path}`;
        const headers = { Accept: 'application/json' };
        try {
          const token = await SecureStore.getItemAsync('token');
          if (token) headers.Authorization = `Bearer ${token}`;
        } catch (_) { /* ignore */ }
        const res = await fetch(url, { method: id ? 'PUT' : 'POST', headers, body: form });
        if (!res.ok) {
          let msg = `Upload failed (${res.status})`;
          try {
            const data = await res.json();
            const backMsg = data?.message || (Array.isArray(data?.errors) ? data.errors.join('\n') : null);
            if (backMsg) msg = backMsg;
          } catch (_) { /* ignore json parse */ }
          throw new Error(msg);
        }
      }
      navigation.goBack();
    } catch (e) {
      const backendMsg = e?.response?.data?.message || (Array.isArray(e?.response?.data?.errors) ? e.response.data.errors.join('\n') : null);
      const msg = backendMsg || 'Failed to save product';
      Alert.alert('Error', msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <LinearGradient colors={["#0a1a3d", "#000000"]} style={styles.container}>
      <StatusBar barStyle="light-content" />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>{id ? 'Edit product' : 'New product'}</Text>
          {id ? <Text style={styles.subtitle}>ID: {id}</Text> : null}

          {loading ? (
            <View style={{ paddingVertical: 24 }}>
              <ActivityIndicator color="#eaf0ff" />
            </View>
          ) : (
            <>
              <View style={styles.field}> 
                <Text style={styles.label}>Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Example: Gaming mouse"
                  placeholderTextColor="#9fb0ff"
                  value={title}
                  onChangeText={setTitle}
                />
              </View>

              <View style={styles.field}> 
                <Text style={styles.label}>Price (€)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. 29.90"
                  placeholderTextColor="#9fb0ff"
                  value={price}
                  onChangeText={setPrice}
                  keyboardType="decimal-pad"
                />
              </View>

              <View style={styles.field}> 
                <Text style={styles.label}>Description</Text>
                <TextInput
                  style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
                  placeholder="Short description..."
                  placeholderTextColor="#9fb0ff"
                  value={description}
                  onChangeText={setDescription}
                  multiline
                />
              </View>

              <View style={[styles.field, { alignItems: 'flex-start' }]}> 
                <Text style={styles.label}>Image (optional)</Text>
                {imageUri ? (
                  <Image source={{ uri: imageUri }} style={{ width: 160, height: 160, borderRadius: 12, marginBottom: 8 }} />
                ) : null}
                <TouchableOpacity style={styles.smallButton} onPress={pickImage}>
                  <Text style={styles.smallButtonText}>{imageUri ? 'Change image' : 'Pick image'}</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={[styles.button, submitting && { opacity: 0.7 }]} onPress={onSave} disabled={submitting}>
                <Text style={styles.buttonText}>{submitting ? 'Saving...' : 'Save'}</Text>
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16 },
  title: { color: '#ffffff', fontSize: 24, fontWeight: '700', marginBottom: 4 },
  subtitle: { color: '#cfd8ff', marginBottom: 16 },
  field: { marginBottom: 14 },
  label: { color: '#eaf0ff', marginBottom: 6, fontWeight: '600' },
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
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  smallButton: {
    backgroundColor: 'transparent',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#4a6bb3',
  },
  smallButtonText: { color: '#eaf0ff' },
  buttonText: { color: '#eaf0ff', fontSize: 16, fontWeight: '600' },
});
