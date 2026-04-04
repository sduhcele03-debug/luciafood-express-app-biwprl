
import React, { useState, useEffect, useCallback } from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Image,
  ImageSourcePropType,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { supabase, Restaurant, MenuItem, sortMenuItemsByCategory, getMenuItems } from '../../lib/supabase';
import { commonStyles, colors, buttonStyles } from '../../styles/commonStyles';
import Icon from '../../components/Icon';

// ─── Local asset map for menu item images ────────────────────────────────────
const localImageMap: Record<string, any> = {
  '/assets/images/a8ffa169-40c1-4b5f-bb3a-54889b8b3ae9.jpeg': require('../../assets/images/a8ffa169-40c1-4b5f-bb3a-54889b8b3ae9.jpeg'),
  '/assets/images/f79b2610-cf2d-4906-96fe-3f78ae9e8470.jpeg': require('../../assets/images/f79b2610-cf2d-4906-96fe-3f78ae9e8470.jpeg'),
  '/assets/images/731a3c9c-1610-4eb0-899b-6fd1e06c2a07.jpeg': require('../../assets/images/731a3c9c-1610-4eb0-899b-6fd1e06c2a07.jpeg'),
  '/assets/images/9092f282-747d-4ca6-97d5-970856c98296.jpeg': require('../../assets/images/9092f282-747d-4ca6-97d5-970856c98296.jpeg'),
  '/assets/images/0ced4dbb-d21b-4642-a5f0-1c1aae5e4cb9.jpeg': require('../../assets/images/0ced4dbb-d21b-4642-a5f0-1c1aae5e4cb9.jpeg'),
};

function getImageSource(url?: string): ImageSourcePropType {
  if (!url) return require('../../assets/images/d7f42a0a-5ef2-4a49-861b-adbd16c8aad5.jpeg');
  if (localImageMap[url]) return localImageMap[url];
  if (url.startsWith('http')) return { uri: url };
  return require('../../assets/images/d7f42a0a-5ef2-4a49-861b-adbd16c8aad5.jpeg');
}

export default function RestaurantScreen() {
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  const { cart, addItem, getItemQuantity, getCartItemCount, getRestaurantCount, getRestaurantIds } = useCart();

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const loadRestaurantData = useCallback(async () => {
    if (!id) {
      console.error('[RestaurantScreen] No restaurant ID provided');
      return;
    }

    try {
      setLoading(true);
      console.log('[RestaurantScreen] Loading restaurant data for ID:', id);

      const { data: restaurantData, error: restaurantError } = await supabase
        .from('restaurants')
        .select('*')
        .eq('id', id)
        .single();

      if (restaurantError) {
        console.error('[RestaurantScreen] Error loading restaurant:', restaurantError);
        Alert.alert('Error', 'Failed to load restaurant details');
        return;
      }

      if (!restaurantData) {
        console.error('[RestaurantScreen] Restaurant not found');
        Alert.alert('Error', 'Restaurant not found');
        return;
      }

      console.log('[RestaurantScreen] Loaded restaurant:', restaurantData.name);
      setRestaurant(restaurantData);

      const { data: menuData, error: menuError } = await getMenuItems(id as string);

      if (menuError) {
        console.error('[RestaurantScreen] Error loading menu items:', menuError);
        Alert.alert('Error', 'Failed to load menu items');
        return;
      }

      console.log(`[RestaurantScreen] Loaded ${menuData?.length || 0} menu items`);
      const sortedMenuItems = sortMenuItemsByCategory(menuData || []);
      setMenuItems(sortedMenuItems);

      const uniqueCategories = Array.from(
        new Set(sortedMenuItems.map(item => item.category))
      );
      console.log('[RestaurantScreen] Found categories:', uniqueCategories);
      setCategories(uniqueCategories);
    } catch (error) {
      console.error('[RestaurantScreen] Unexpected error loading data:', error);
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadRestaurantData().catch(error => {
      console.error('[RestaurantScreen] Failed to load restaurant data:', error);
    });
  }, [loadRestaurantData]);

  const handleAddToCart = useCallback((item: MenuItem) => {
    console.log("✅ Adding to cart:", item);

    if (!restaurant) return;

    console.log('[RestaurantScreen] Add to cart pressed:', item.name, 'from', restaurant.name);

    const cartItem = {
      id: item.id,
      name: item.name,
      price: item.lucia_price ?? item.price,
      lucia_price: item.lucia_price,
      quantity: 1,
      image: item.image_url,
    };

    const result = addItem(item.restaurant_id, restaurant.name, cartItem);

    if (!result.success) {
      console.log('[RestaurantScreen] addItem failed:', result.error);
      Alert.alert('Cannot Add Item', result.error || 'Failed to add item to cart');
      return;
    }

    console.log('[RestaurantScreen] Item added successfully:', item.name);
    Alert.alert('Added to Cart', `${item.name} has been added to your cart`);
  }, [user, restaurant, addItem]);

  const handleCheckout = useCallback(() => {
    console.log("✅ Checkout clicked - cart items:", cart);
    console.log('[RestaurantScreen] Navigating to cart');
    router.push('/cart');
  }, [cart]);

  const renderMenuItem = useCallback((item: MenuItem) => {
    const cartCount = getItemQuantity(item.id);
    const rawPrice = item.lucia_price ?? item.base_price ?? item.price;
    const displayPrice = Number(rawPrice).toFixed(2);
    const imageSource = getImageSource(item.image_url);

    return (
      <View key={item.id} style={[commonStyles.card, { marginBottom: 16 }]}>
        <View style={{ flexDirection: 'row' }}>
          {restaurant?.name !== 'Spur' && (
            <Image
              source={imageSource}
              style={{ width: 100, height: 100, borderRadius: 12, marginRight: 16 }}
              resizeMode="cover"
              onError={() => {
                console.log('[RestaurantScreen] Image load error for item:', item.name);
              }}
            />
          )}

          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 4 }}>
              {item.name}
            </Text>

            <Text style={{ fontSize: 12, color: colors.primary, fontWeight: '600', marginBottom: 8 }}>
              {item.category}
            </Text>

            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <Text style={{ fontSize: 18, fontWeight: '700', color: colors.primary }}>
                R{displayPrice}
              </Text>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <TouchableOpacity
                style={[buttonStyles.primary, {
                  paddingVertical: 8,
                  paddingHorizontal: 16,
                  flex: 1,
                  marginRight: cartCount > 0 ? 12 : 0,
                }]}
                onPress={() => handleAddToCart(item)}
              >
                <Text style={{ color: colors.white, fontWeight: '600', fontSize: 14 }}>
                  Add to Cart
                </Text>
              </TouchableOpacity>

              {cartCount > 0 && (
                <View style={{ backgroundColor: colors.primary, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 }}>
                  <Text style={{ color: colors.white, fontWeight: '700', fontSize: 14 }}>
                    {cartCount}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </View>
    );
  }, [restaurant, getItemQuantity, handleAddToCart]);

  if (loading) {
    return (
      <SafeAreaView style={[commonStyles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ marginTop: 16, color: colors.textLight }}>Loading restaurant...</Text>
      </SafeAreaView>
    );
  }

  if (!restaurant) {
    return (
      <SafeAreaView style={[commonStyles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Icon name="restaurant" size={60} color={colors.textLight} />
        <Text style={{ fontSize: 18, fontWeight: '600', color: colors.text, marginTop: 16, textAlign: 'center' }}>
          Restaurant not found
        </Text>
        <TouchableOpacity style={[buttonStyles.primary, { marginTop: 16 }]} onPress={() => router.back()}>
          <Text style={{ color: colors.white, fontWeight: '600' }}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const filteredMenuItems = selectedCategory === 'all'
    ? menuItems
    : menuItems.filter(item => item.category === selectedCategory);

  const restaurantCount = getRestaurantCount();
  const cartItemCount = getCartItemCount();

  return (
    <SafeAreaView style={[commonStyles.container, { paddingBottom: 80 }]}>
      {/* Header */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: colors.backgroundAlt,
      }}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 16 }}>
          <Icon name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={[commonStyles.title, { marginBottom: 4 }]}>{restaurant.name}</Text>
          <Text style={{ color: colors.textLight, fontSize: 14 }}>
            {restaurant.cuisine_type || 'Restaurant'}
          </Text>
        </View>
        <TouchableOpacity
          onPress={handleCheckout}
          style={{ backgroundColor: colors.primary, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8 }}
        >
          <Text style={{ color: colors.white, fontWeight: '600' }}>
            Cart ({cartItemCount})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Multi-Restaurant Status */}
      {restaurantCount > 0 && (
        <View style={{
          padding: 16,
          backgroundColor: restaurantCount > 1 ? colors.primary + '10' : colors.backgroundAlt,
          borderBottomWidth: 1,
          borderBottomColor: colors.backgroundAlt,
        }}>
          <Text style={{
            color: restaurantCount > 1 ? colors.primary : colors.textLight,
            fontSize: 14,
            fontWeight: '600',
            textAlign: 'center',
          }}>
            {restaurantCount === 1
              ? '🏪 Single restaurant order'
              : `🏪 Multi-restaurant order (${restaurantCount}/3 restaurants)`}
          </Text>
        </View>
      )}

      {/* Restaurant Info */}
      <View style={{ padding: 20, backgroundColor: colors.backgroundAlt }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
          <Text style={{ color: colors.textLight }}>Min order: R{restaurant.min_order}</Text>
          <Text style={{ color: colors.textLight }}>Delivery: R{restaurant.delivery_from}</Text>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={{ color: colors.textLight }}>Rating: {restaurant.rating || '4.5'} ⭐</Text>
          <Text style={{ color: colors.textLight }}>Time: {restaurant.delivery_time || restaurant.eta}</Text>
        </View>
      </View>

      {/* Category Filter */}
      {categories.length > 1 && (
        <View style={{ paddingVertical: 16 }}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20 }}
          >
            <TouchableOpacity
              style={{
                backgroundColor: selectedCategory === 'all' ? colors.primary : colors.backgroundAlt,
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 20,
                marginRight: 12,
                minWidth: 60,
                alignItems: 'center',
              }}
              onPress={() => {
                console.log('[RestaurantScreen] Category filter: all');
                setSelectedCategory('all');
              }}
            >
              <Text style={{ color: selectedCategory === 'all' ? colors.white : colors.text, fontWeight: '600', fontSize: 14 }}>
                All ({menuItems.length})
              </Text>
            </TouchableOpacity>

            {categories.map(category => {
              const categoryCount = menuItems.filter(item => item.category === category).length;
              return (
                <TouchableOpacity
                  key={category}
                  style={{
                    backgroundColor: selectedCategory === category ? colors.primary : colors.backgroundAlt,
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    borderRadius: 20,
                    marginRight: 12,
                    minWidth: 80,
                    alignItems: 'center',
                  }}
                  onPress={() => {
                    console.log('[RestaurantScreen] Category filter:', category);
                    setSelectedCategory(category);
                  }}
                >
                  <Text style={{ color: selectedCategory === category ? colors.white : colors.text, fontWeight: '600', fontSize: 14 }}>
                    {category} ({categoryCount})
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* Menu Items */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 20 }}
      >
        {filteredMenuItems.length === 0 ? (
          <View style={{ alignItems: 'center', marginTop: 40 }}>
            <Icon name="restaurant" size={60} color={colors.textLight} />
            <Text style={{ fontSize: 18, fontWeight: '600', color: colors.text, marginTop: 16, textAlign: 'center' }}>
              No menu items available
            </Text>
            <Text style={{ fontSize: 14, color: colors.textLight, marginTop: 8, textAlign: 'center' }}>
              {selectedCategory !== 'all'
                ? `No items in ${selectedCategory} category`
                : 'Menu items will be added soon'}
            </Text>
          </View>
        ) : (
          <>
            <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 16 }}>
              {filteredMenuItems.length} items{selectedCategory !== 'all' ? ` in ${selectedCategory}` : ''}
            </Text>
            {filteredMenuItems.map(renderMenuItem)}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
