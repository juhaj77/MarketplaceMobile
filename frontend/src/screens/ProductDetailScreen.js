import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Alert,
  Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import { api } from '../services/api';

export default function ProductDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { id } = route.params || {};
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await api.get(`/products/${id}`);
        const payload = res.data;
        const product = payload?.product ?? payload;
        if (mounted) setItem(product);
      } catch (e) {
        const msg = e?.response?.data?.message || 'Failed to load product';
        Alert.alert('Error', msg);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [id]);

  const confirmDelete = () => {
    Alert.alert('Delete product', 'Are you sure you want to delete this product?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: onDelete },
    ]);
  };

  const onDelete = async () => {
    try {
      setDeleting(true);
      await api.delete(`/products/${id}`);
      navigation.goBack();
    } catch (e) {
      const msg = e?.response?.data?.message || 'Failed to delete product';
      Alert.alert('Error', msg);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <LinearGradient colors={["#0a1a3d", "#000000"]} style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.content}>
        <Text style={styles.title}>Product details</Text>
        <Text style={styles.subtitle}>ID: {id ?? '—'}</Text>

        {loading ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator color="#eaf0ff" />
          </View>
        ) : item ? (
          <>
            {item.imageUrl ? (
              <Image source={{ uri: item.imageUrl }} style={styles.image} />
            ) : null}

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Name</Text>
              <Text style={styles.cardText}>{item.title}</Text>

              <Text style={[styles.cardTitle, { marginTop: 12 }]}>Price</Text>
              <Text style={styles.cardText}>€{Number(item.price).toFixed(2)}</Text>

              <Text style={[styles.cardTitle, { marginTop: 12 }]}>Description</Text>
              <Text style={styles.cardText}>{item.description || '—'}</Text>
            </View>

            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('ProductForm', { id })}>
                <Text style={styles.buttonText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.button, { borderColor: '#b34a4a', backgroundColor: '#732121' }]} onPress={confirmDelete} disabled={deleting}>
                <Text style={styles.buttonText}>{deleting ? 'Deleting...' : 'Delete'}</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <Text style={{ color: '#cfd8ff' }}>Product not found.</Text>
        )}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, padding: 16 },
  title: { color: '#ffffff', fontSize: 24, fontWeight: '700', marginBottom: 4 },
  subtitle: { color: '#cfd8ff', marginBottom: 16 },
  card: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  cardTitle: { color: '#eaf0ff', fontSize: 14, fontWeight: '600' },
  cardText: { color: '#ffffff', fontSize: 16, marginTop: 4 },
  image: {
    width: '100%',
    aspectRatio: 1.6,
    borderRadius: 12,
    marginBottom: 16,
    backgroundColor: 'rgba(255,255,255,0.08)'
  },
  button: {
    alignSelf: 'flex-start',
    backgroundColor: '#1f3b73',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#4a6bb3',
  },
  buttonText: { color: '#eaf0ff', fontSize: 16, fontWeight: '600' },
});
