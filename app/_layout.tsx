
import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { AuthProvider } from '../contexts/AuthContext';
import { CartProvider } from '../contexts/CartContext';
import { LuciaAIProvider } from '../contexts/LuciaAIContext';
import LuciaAIContainer from '../components/LuciaAI/LuciaAIContainer';

export default function RootLayout() {
  useEffect(() => {
    console.log('🚀 LuciaFood Express App initialized');
  }, []);

  return (
    <AuthProvider>
      <CartProvider>
        <LuciaAIProvider>
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
          <LuciaAIContainer />
        </LuciaAIProvider>
      </CartProvider>
    </AuthProvider>
  );
}
