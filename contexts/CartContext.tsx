
import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { MenuItem } from '../lib/supabase';
import { Alert } from 'react-native';

interface CartItem extends MenuItem {
  quantity: number;
}

interface CartContextType {
  cart: CartItem[];
  addItem: (item: MenuItem, quantity?: number) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  getItemQuantity: (itemId: string) => number;
  getCartTotal: () => number;
  getCartItemCount: () => number;
  getRestaurantCount: () => number;
  getRestaurantIds: () => string[];
  getCartByRestaurant: () => { [key: string]: CartItem[] };
  // Legacy methods for backward compatibility
  addToCart: (item: MenuItem) => void;
  removeFromCart: (itemId: string) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);

  // MULTI-RESTAURANT VALIDATION: Check if adding item would exceed 3-restaurant limit
  const validateMultiRestaurantLimit = useCallback((newRestaurantId: string) => {
    const currentRestaurantIds = new Set(cart.map(item => item.restaurant_id));
    
    // If this restaurant is already in cart, allow it
    if (currentRestaurantIds.has(newRestaurantId)) {
      return true;
    }
    
    // If adding this restaurant would exceed 3 restaurants, block it
    if (currentRestaurantIds.size >= 3) {
      Alert.alert(
        'Restaurant Limit Reached',
        'You can only order from a maximum of 3 restaurants at once. Please remove items from other restaurants or complete this order first.',
        [{ text: 'OK' }]
      );
      return false;
    }
    
    return true;
  }, [cart]);

  // CRITICAL FIX: Enhanced addItem function with multi-restaurant validation
  const addItem = useCallback((item: MenuItem, quantity: number = 1) => {
    console.log(`🛒 Adding ${quantity} of "${item.name}" from restaurant ${item.restaurant_id} to cart`);
    
    // MULTI-RESTAURANT VALIDATION: Check restaurant limit before adding
    if (!validateMultiRestaurantLimit(item.restaurant_id)) {
      console.log('❌ Multi-restaurant limit exceeded, item not added');
      return;
    }
    
    setCart(currentCart => {
      const existingItem = currentCart.find(cartItem => cartItem.id === item.id);
      
      if (existingItem) {
        console.log(`📦 Item exists, updating quantity from ${existingItem.quantity} to ${existingItem.quantity + quantity}`);
        const updatedCart = currentCart.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + quantity }
            : cartItem
        );
        return updatedCart;
      } else {
        console.log(`🆕 Adding new item with quantity ${quantity}`);
        const newCart = [...currentCart, { ...item, quantity }];
        return newCart;
      }
    });
  }, [validateMultiRestaurantLimit]);

  // CRITICAL FIX: Enhanced removeItem function
  const removeItem = useCallback((itemId: string) => {
    console.log(`🗑️ Removing item with ID: ${itemId}`);
    
    setCart(currentCart => {
      const existingItem = currentCart.find(cartItem => cartItem.id === itemId);
      
      if (existingItem && existingItem.quantity > 1) {
        console.log(`📉 Decreasing quantity from ${existingItem.quantity} to ${existingItem.quantity - 1}`);
        const updatedCart = currentCart.map(cartItem =>
          cartItem.id === itemId
            ? { ...cartItem, quantity: cartItem.quantity - 1 }
            : cartItem
        );
        return updatedCart;
      } else {
        console.log(`🚮 Removing item completely from cart`);
        const filteredCart = currentCart.filter(cartItem => cartItem.id !== itemId);
        return filteredCart;
      }
    });
  }, []);

  // CRITICAL FIX: New updateQuantity function for direct quantity updates
  const updateQuantity = useCallback((itemId: string, quantity: number) => {
    console.log(`🔄 Updating quantity for item ${itemId} to ${quantity}`);
    
    if (quantity <= 0) {
      console.log(`❌ Quantity is 0 or less, removing item`);
      setCart(currentCart => currentCart.filter(cartItem => cartItem.id !== itemId));
      return;
    }
    
    setCart(currentCart => {
      const updatedCart = currentCart.map(cartItem =>
        cartItem.id === itemId
          ? { ...cartItem, quantity }
          : cartItem
      );
      return updatedCart;
    });
  }, []);

  const clearCart = useCallback(() => {
    console.log('🧹 Clearing cart');
    setCart([]);
  }, []);

  const getItemQuantity = useCallback((itemId: string) => {
    const item = cart.find(cartItem => cartItem.id === itemId);
    const quantity = item ? item.quantity : 0;
    return quantity;
  }, [cart]);

  const getCartTotal = useCallback(() => {
    const total = cart.reduce((total, item) => {
      const itemPrice = item.lucia_price || item.price;
      return total + (itemPrice * item.quantity);
    }, 0);
    return total;
  }, [cart]);

  const getCartItemCount = useCallback(() => {
    const count = cart.reduce((total, item) => total + item.quantity, 0);
    return count;
  }, [cart]);

  const getRestaurantCount = useCallback(() => {
    const restaurantIds = new Set(cart.map(item => item.restaurant_id));
    return restaurantIds.size;
  }, [cart]);

  // MULTI-RESTAURANT FEATURE: Get list of restaurant IDs in cart
  const getRestaurantIds = useCallback(() => {
    const restaurantIds = Array.from(new Set(cart.map(item => item.restaurant_id)));
    return restaurantIds;
  }, [cart]);

  // MULTI-RESTAURANT FEATURE: Group cart items by restaurant
  const getCartByRestaurant = useCallback(() => {
    const grouped: { [key: string]: CartItem[] } = {};
    
    cart.forEach(item => {
      if (!grouped[item.restaurant_id]) {
        grouped[item.restaurant_id] = [];
      }
      grouped[item.restaurant_id].push(item);
    });
    
    return grouped;
  }, [cart]);

  // Legacy methods for backward compatibility
  const addToCart = useCallback((item: MenuItem) => {
    addItem(item, 1);
  }, [addItem]);

  const removeFromCart = useCallback((itemId: string) => {
    removeItem(itemId);
  }, [removeItem]);

  const value: CartContextType = {
    cart,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    getItemQuantity,
    getCartTotal,
    getCartItemCount,
    getRestaurantCount,
    getRestaurantIds,
    getCartByRestaurant,
    // Legacy methods
    addToCart,
    removeFromCart,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}
