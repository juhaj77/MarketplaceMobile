import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import ProductListScreen from '../screens/ProductListScreen';
import ProductDetailScreen from '../screens/ProductDetailScreen';
import ProductFormScreen from '../screens/ProductFormScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { token, loading } = useAuth();
  const isAuthed = !!token;

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#000' }}>
        <ActivityIndicator size="large" color="#4a6bb3" />
      </View>
    );
  }

  return (
    <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: '#0b1a36' },
          headerTintColor: '#fff',
          headerTitleStyle: { color: '#fff' },
          headerTitleAlign: 'center',
        }}>
      {!isAuthed ? (
        <>
          <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Sign In' }} />
          <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'Create Account' }} />
        </>
      ) : (
        <>
          <Stack.Screen name="Products" component={ProductListScreen} options={{ title: 'Products' }} />
          <Stack.Screen name="ProductDetail" component={ProductDetailScreen} options={{ title: 'Product' }} />
          <Stack.Screen name="ProductForm" component={ProductFormScreen} options={{ title: 'New / Edit Product' }} />
        </>
      )}
    </Stack.Navigator>
  );
}
