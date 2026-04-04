
import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

// ─── Delivery Zone Data ───────────────────────────────────────────────────────

export const DELIVERY_ZONES = [
  'Nordale',
  'KwaMsane',
  'Nkodibe',
  'Mtubatuba Town',
  'Riverview',
  'Dukuduku (Ezwenelisha)',
  'Monzi Golf Club',
  'Khula Village',
  'St Lucia',
] as const;

export type DeliveryZone = typeof DELIVERY_ZONES[number];

export const RESTAURANT_DELIVERY_FEES: Record<string, Record<string, number>> = {
  DEFAULT_TOWN_BASE: {
    'Nordale': 30,
    'KwaMsane': 30,
    'Nkodibe': 25,
    'Mtubatuba Town': 15,
    'Riverview': 25,
    'Dukuduku (Ezwenelisha)': 55,
    'Monzi Golf Club': 55,
    'Khula Village': 55,
    'St Lucia': 65,
  },
  BUYIES_BASE: {
    'Nordale': 35,
    'KwaMsane': 60,
    'Nkodibe': 45,
    'Mtubatuba Town': 40,
    'Riverview': 45,
    'Dukuduku (Ezwenelisha)': 25,
    'Monzi Golf Club': 25,
    'Khula Village': 15,
    'St Lucia': 20,
  },
};

function getDeliveryFee(restaurantName: string, zone: string): number | undefined {
  const name = restaurantName.toLowerCase();
  const table =
    name.includes('buyie') || name.includes('breeze')
      ? RESTAURANT_DELIVERY_FEES.BUYIES_BASE
      : RESTAURANT_DELIVERY_FEES.DEFAULT_TOWN_BASE;
  return table[zone];
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

export interface CartRestaurant {
  restaurantId: string;
  restaurantName: string;
  items: CartItem[];
  deliveryFee: number;
}

export interface CartState {
  restaurants: CartRestaurant[];
  selectedZone: string;
  userDetails: {
    name: string;
    phone: string;
    address: string;
  };
}

interface CartContextType {
  cart: CartState;
  addItem: (
    restaurantId: string,
    restaurantName: string,
    item: CartItem
  ) => { success: boolean; error?: string };
  removeItem: (restaurantId: string, itemId: string) => void;
  updateQuantity: (restaurantId: string, itemId: string, quantity: number) => void;
  clearCart: () => void;
  clearRestaurant: (restaurantId: string) => void;
  setDeliveryZone: (zone: string) => void;
  setUserDetails: (details: { name: string; phone: string; address: string }) => void;
  getTotalItems: () => number;
  getSubtotal: () => number;
  getTotalDelivery: () => number;
  getGrandTotal: () => number;
  getRestaurantItemCount: (restaurantId: string) => number;
  // Legacy compatibility helpers used by restaurant screen
  getCartItemCount: () => number;
  getItemQuantity: (itemId: string) => number;
  getRestaurantCount: () => number;
  getRestaurantIds: () => string[];
}

// ─── Initial State ────────────────────────────────────────────────────────────

const INITIAL_CART: CartState = {
  restaurants: [],
  selectedZone: '',
  userDetails: { name: '', phone: '', address: '' },
};

// ─── Context ──────────────────────────────────────────────────────────────────

const CartContext = createContext<CartContextType | undefined>(undefined);

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartState>(INITIAL_CART);

  const addItem = useCallback(
    (
      restaurantId: string,
      restaurantName: string,
      item: CartItem
    ): { success: boolean; error?: string } => {
      console.log(`[Cart] addItem: "${item.name}" from "${restaurantName}" (${restaurantId})`);

      let result: { success: boolean; error?: string } = { success: true };

      setCart(prev => {
        const existingRestaurant = prev.restaurants.find(r => r.restaurantId === restaurantId);

        // Restaurant already in cart — just add/increment item
        if (existingRestaurant) {
          const updatedRestaurants = prev.restaurants.map(r => {
            if (r.restaurantId !== restaurantId) return r;
            const existingItem = r.items.find(i => i.id === item.id);
            const updatedItems = existingItem
              ? r.items.map(i =>
                  i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i
                )
              : [...r.items, { ...item }];
            return { ...r, items: updatedItems };
          });
          console.log(`[Cart] Item added to existing restaurant cart`);
          return { ...prev, restaurants: updatedRestaurants };
        }

        // New restaurant — check 3-restaurant limit
        if (prev.restaurants.length >= 3) {
          console.log('[Cart] addItem blocked: 3-restaurant limit reached');
          result = {
            success: false,
            error: 'You can only order from up to 3 restaurants at a time',
          };
          return prev;
        }

        // Check zone support (only if a zone is selected)
        if (prev.selectedZone) {
          const fee = getDeliveryFee(restaurantName, prev.selectedZone);
          if (fee === undefined) {
            console.log(`[Cart] addItem blocked: restaurant does not deliver to ${prev.selectedZone}`);
            result = {
              success: false,
              error: 'This restaurant does not deliver to your selected area',
            };
            return prev;
          }

          const newRestaurant: CartRestaurant = {
            restaurantId,
            restaurantName,
            items: [{ ...item }],
            deliveryFee: fee,
          };
          console.log(`[Cart] New restaurant added with delivery fee R${fee}`);
          return { ...prev, restaurants: [...prev.restaurants, newRestaurant] };
        }

        // No zone selected yet — add with fee 0, will recalculate when zone is set
        const newRestaurant: CartRestaurant = {
          restaurantId,
          restaurantName,
          items: [{ ...item }],
          deliveryFee: 0,
        };
        console.log(`[Cart] New restaurant added (no zone selected yet)`);
        return { ...prev, restaurants: [...prev.restaurants, newRestaurant] };
      });

      return result;
    },
    []
  );

  const removeItem = useCallback((restaurantId: string, itemId: string) => {
    console.log(`[Cart] removeItem: itemId=${itemId} from restaurantId=${restaurantId}`);
    setCart(prev => {
      const updatedRestaurants = prev.restaurants
        .map(r => {
          if (r.restaurantId !== restaurantId) return r;
          const existingItem = r.items.find(i => i.id === itemId);
          if (!existingItem) return r;
          if (existingItem.quantity > 1) {
            return {
              ...r,
              items: r.items.map(i =>
                i.id === itemId ? { ...i, quantity: i.quantity - 1 } : i
              ),
            };
          }
          return { ...r, items: r.items.filter(i => i.id !== itemId) };
        })
        .filter(r => r.items.length > 0);
      return { ...prev, restaurants: updatedRestaurants };
    });
  }, []);

  const updateQuantity = useCallback((restaurantId: string, itemId: string, quantity: number) => {
    console.log(`[Cart] updateQuantity: itemId=${itemId}, quantity=${quantity}`);
    setCart(prev => {
      const updatedRestaurants = prev.restaurants
        .map(r => {
          if (r.restaurantId !== restaurantId) return r;
          if (quantity <= 0) {
            return { ...r, items: r.items.filter(i => i.id !== itemId) };
          }
          return {
            ...r,
            items: r.items.map(i => (i.id === itemId ? { ...i, quantity } : i)),
          };
        })
        .filter(r => r.items.length > 0);
      return { ...prev, restaurants: updatedRestaurants };
    });
  }, []);

  const clearCart = useCallback(() => {
    console.log('[Cart] clearCart');
    setCart(INITIAL_CART);
  }, []);

  const clearRestaurant = useCallback((restaurantId: string) => {
    console.log(`[Cart] clearRestaurant: ${restaurantId}`);
    setCart(prev => ({
      ...prev,
      restaurants: prev.restaurants.filter(r => r.restaurantId !== restaurantId),
    }));
  }, []);

  const setDeliveryZone = useCallback((zone: string) => {
    console.log(`[Cart] setDeliveryZone: "${zone}"`);
    setCart(prev => {
      const updatedRestaurants = prev.restaurants.map(r => {
        const fee = getDeliveryFee(r.restaurantName, zone);
        return { ...r, deliveryFee: fee ?? 0 };
      });
      return { ...prev, selectedZone: zone, restaurants: updatedRestaurants };
    });
  }, []);

  const setUserDetails = useCallback(
    (details: { name: string; phone: string; address: string }) => {
      console.log('[Cart] setUserDetails:', details.name);
      setCart(prev => ({ ...prev, userDetails: details }));
    },
    []
  );

  const getTotalItems = useCallback(() => {
    return cart.restaurants.reduce(
      (total, r) => total + r.items.reduce((s, i) => s + i.quantity, 0),
      0
    );
  }, [cart]);

  const getSubtotal = useCallback(() => {
    return cart.restaurants.reduce(
      (total, r) =>
        total + r.items.reduce((s, i) => s + i.price * i.quantity, 0),
      0
    );
  }, [cart]);

  const getTotalDelivery = useCallback(() => {
    return cart.restaurants.reduce((total, r) => total + r.deliveryFee, 0);
  }, [cart]);

  const getGrandTotal = useCallback(() => {
    return getSubtotal() + getTotalDelivery();
  }, [getSubtotal, getTotalDelivery]);

  const getRestaurantItemCount = useCallback(
    (restaurantId: string) => {
      const r = cart.restaurants.find(r => r.restaurantId === restaurantId);
      if (!r) return 0;
      return r.items.reduce((s, i) => s + i.quantity, 0);
    },
    [cart]
  );

  // ── Legacy compatibility ──────────────────────────────────────────────────

  const getCartItemCount = useCallback(() => getTotalItems(), [getTotalItems]);

  const getItemQuantity = useCallback(
    (itemId: string) => {
      for (const r of cart.restaurants) {
        const item = r.items.find(i => i.id === itemId);
        if (item) return item.quantity;
      }
      return 0;
    },
    [cart]
  );

  const getRestaurantCount = useCallback(
    () => cart.restaurants.length,
    [cart]
  );

  const getRestaurantIds = useCallback(
    () => cart.restaurants.map(r => r.restaurantId),
    [cart]
  );

  const value: CartContextType = {
    cart,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    clearRestaurant,
    setDeliveryZone,
    setUserDetails,
    getTotalItems,
    getSubtotal,
    getTotalDelivery,
    getGrandTotal,
    getRestaurantItemCount,
    // Legacy
    getCartItemCount,
    getItemQuantity,
    getRestaurantCount,
    getRestaurantIds,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
