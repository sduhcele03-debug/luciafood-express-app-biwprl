
import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { AuthProvider } from '../contexts/AuthContext';
import { CartProvider } from '../contexts/CartContext';
import { setupErrorLogging } from '../utils/errorLogger';

export default function RootLayout() {
  useEffect(() => {
    // CRITICAL FIX: Initialize error logging as early as possible
    try {
      setupErrorLogging();
      console.log('🚀 LuciaFood Express App initialized with enhanced error logging');
    } catch (error) {
      console.error('❌ Failed to setup error logging:', error);
    }
  }, []);

  return (
    <AuthProvider>
      <CartProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="signin" />
          <Stack.Screen name="signup" />
          <Stack.Screen name="forgotpassword" />
          <Stack.Screen name="profile" />
          <Stack.Screen name="cart" />
          <Stack.Screen name="restaurant/[id]" />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack>
      </CartProvider>
    </AuthProvider>
  );
}
