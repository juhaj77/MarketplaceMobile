import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, StatusBar, RefreshControl, ActivityIndicator, Alert, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function ProductListScreen() {
  const navigation = useNavigation();
  const { logout } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchProducts = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const res = await api.get('/products');
      const payload = res.data;
      const list = Array.isArray(payload?.data)
        ? payload.data
        : Array.isArray(payload?.items)
        ? payload.items
        : Array.isArray(payload)
        ? payload
        : [];
      setProducts(list);
    } catch (e) {
      const msg = e?.response?.data?.message || 'Failed to load products';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchProducts(true);
    }, [])
  );

  useEffect(() => {
    fetchProducts();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchProducts(true);
  };

  return (
    <LinearGradient colors={["#0a1a3d", "#000000"]} style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Products</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('ProductForm')}
        >
          <Text style={styles.addButtonText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color="#eaf0ff" />
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item, idx) => String(item.id || item._id || idx)}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#eaf0ff" />}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => navigation.navigate('ProductDetail', { id: item.id || item._id })}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                {item.imageUrl ? (
                  <Image source={{ uri: item.imageUrl }} style={styles.thumb} />
                ) : null}
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>{item.title}</Text>
                  <Text style={styles.cardSubtitle}>€{Number(item.price).toFixed(2)}</Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={!loading ? (
            <Text style={{ color: '#cfd8ff', textAlign: 'center', marginTop: 24 }}>No products yet.</Text>
          ) : null}
        />
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 8 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
  },
  title: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '700',
  },
  addButton: {
    backgroundColor: '#1f3b73',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#4a6bb3',
  },
  addButtonText: { color: '#eaf0ff', fontSize: 14, fontWeight: '600' },
  listContent: { padding: 16, flexGrow: 1 },
  card: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  cardTitle: { color: '#ffffff', fontSize: 18, fontWeight: '600' },
  cardSubtitle: { color: '#cfd8ff', marginTop: 4 },
  thumb: {
    width: 56,
    height: 56,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: 'rgba(255,255,255,0.08)'
  },
  logoutButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#4a6bb3',
    backgroundColor: 'transparent',
  },
  logoutButtonText: { color: '#9fb0ff', fontWeight: '600' },
});
