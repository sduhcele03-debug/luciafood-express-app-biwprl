
import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { MenuItem } from '../lib/supabase';

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

  // CRITICAL FIX: Enhanced addItem function with proper quantity handling
  const addItem = useCallback((item: MenuItem, quantity: number = 1) => {
    console.log(`🛒 Adding ${quantity} of "${item.name}" to cart`);
    
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
  }, []);

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
