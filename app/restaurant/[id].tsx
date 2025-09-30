
import React, { useState, useEffect, useCallback } from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { supabase, Restaurant, MenuItem } from '../../lib/supabase';
import { commonStyles, colors, buttonStyles } from '../../styles/commonStyles';
import Icon from '../../components/Icon';

export default function RestaurantScreen() {
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  const { addToCart, getCartItemCount } = useCart();
  
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // RUNTIME ERROR FIX: Define loadRestaurantData function BEFORE useEffect
  const loadRestaurantData = useCallback(async () => {
    if (!id) {
      console.error('RestaurantScreen: No restaurant ID provided');
      return;
    }

    try {
      setLoading(true);
      console.log('RestaurantScreen: Loading restaurant data for ID:', id);

      // Load restaurant details with proper error handling
      const { data: restaurantData, error: restaurantError } = await supabase
        .from('restaurants')
        .select('*')
        .eq('id', id)
        .single();

      if (restaurantError) {
        console.error('RestaurantScreen: Error loading restaurant:', restaurantError);
        Alert.alert('Error', 'Failed to load restaurant details');
        return;
      }

      if (!restaurantData) {
        console.error('RestaurantScreen: Restaurant not found');
        Alert.alert('Error', 'Restaurant not found');
        return;
      }

      console.log('RestaurantScreen: Loaded restaurant:', restaurantData.name);
      setRestaurant(restaurantData);

      // Load menu items with proper error handling
      const { data: menuData, error: menuError } = await supabase
        .from('menu_items')
        .select('*')
        .eq('restaurant_id', id)
        .order('category', { ascending: true })
        .order('name', { ascending: true });

      if (menuError) {
        console.error('RestaurantScreen: Error loading menu items:', menuError);
        Alert.alert('Error', 'Failed to load menu items');
        return;
      }

      console.log(`RestaurantScreen: Loaded ${menuData?.length || 0} menu items`);
      setMenuItems(menuData || []);

      // Extract unique categories
      const uniqueCategories = Array.from(
        new Set(menuData?.map(item => item.category) || [])
      );
      console.log('RestaurantScreen: Found categories:', uniqueCategories);
      setCategories(uniqueCategories);

    } catch (error) {
      console.error('RestaurantScreen: Unexpected error loading data:', error);
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadRestaurantData().catch(error => {
      console.error('RestaurantScreen: Failed to load restaurant data:', error);
    });
  }, [loadRestaurantData]);

  const handleAddToCart = useCallback((item: MenuItem) => {
    if (!user) {
      Alert.alert('Sign In Required', 'Please sign in to add items to cart', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign In', onPress: () => router.push('/signin') }
      ]);
      return;
    }

    try {
      console.log('RestaurantScreen: Adding item to cart:', item.name);
      addToCart(item);
      Alert.alert('Added to Cart', `${item.name} has been added to your cart`);
    } catch (error) {
      console.error('RestaurantScreen: Error adding item to cart:', error);
      Alert.alert('Error', 'Failed to add item to cart');
    }
  }, [user, addToCart]);

  const handleCheckout = useCallback(() => {
    if (!user) {
      Alert.alert('Sign In Required', 'Please sign in to proceed to checkout', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign In', onPress: () => router.push('/signin') }
      ]);
      return;
    }

    console.log('RestaurantScreen: Navigating to cart');
    router.push('/cart');
  }, [user]);

  const renderMenuItem = useCallback((item: MenuItem) => {
    const cartCount = getCartItemCount(item.id);
    
    return (
      <View key={item.id} style={[commonStyles.card, { marginBottom: 16 }]}>
        <View style={{ flexDirection: 'row' }}>
          {/* RUNTIME ERROR FIX: Only show image if URL exists and restaurant is not Spur */}
          {item.image_url && restaurant?.name !== 'Spur' && (
            <Image
              source={{ uri: item.image_url }}
              style={{
                width: 100,
                height: 100,
                borderRadius: 12,
                marginRight: 16,
              }}
              resizeMode="cover"
              onError={(error) => {
                console.log('RestaurantScreen: Image load error for item:', item.name, error);
              }}
            />
          )}
          
          <View style={{ flex: 1 }}>
            <Text style={{
              fontSize: 16,
              fontWeight: '700',
              color: colors.text,
              marginBottom: 8,
            }}>
              {item.name}
            </Text>
            
            {/* RUNTIME ERROR FIX: Proper price display with lucia_price handling */}
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <Text style={{
                fontSize: 18,
                fontWeight: '700',
                color: colors.primary,
                marginRight: 8,
              }}>
                R{(item.lucia_price || item.price).toFixed(2)}
              </Text>
              
              {/* Show original price if different from lucia_price */}
              {item.original_price && item.lucia_price && 
               item.original_price !== item.lucia_price && (
                <Text style={{
                  fontSize: 14,
                  color: colors.textLight,
                  textDecorationLine: 'line-through',
                }}>
                  R{item.original_price.toFixed(2)}
                </Text>
              )}
              
              {/* Show 7% markup indicator */}
              {item.lucia_price && item.original_price && 
               item.lucia_price > item.original_price && (
                <View style={{
                  backgroundColor: colors.primary,
                  paddingHorizontal: 6,
                  paddingVertical: 2,
                  borderRadius: 4,
                  marginLeft: 8,
                }}>
                  <Text style={{
                    fontSize: 10,
                    color: colors.white,
                    fontWeight: '600',
                  }}>
                    +7%
                  </Text>
                </View>
              )}
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
                <Text style={{ 
                  color: colors.white, 
                  fontWeight: '600',
                  fontSize: 14,
                }}>
                  Add to Cart
                </Text>
              </TouchableOpacity>
              
              {cartCount > 0 && (
                <View style={{
                  backgroundColor: colors.primary,
                  borderRadius: 20,
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                }}>
                  <Text style={{
                    color: colors.white,
                    fontWeight: '700',
                    fontSize: 14,
                  }}>
                    {cartCount}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </View>
    );
  }, [restaurant, getCartItemCount, handleAddToCart]);

  if (loading) {
    return (
      <SafeAreaView style={[commonStyles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ marginTop: 16, color: colors.textLight }}>
          Loading restaurant...
        </Text>
      </SafeAreaView>
    );
  }

  if (!restaurant) {
    return (
      <SafeAreaView style={[commonStyles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Icon name="restaurant" size={60} color={colors.textLight} />
        <Text style={{
          fontSize: 18,
          fontWeight: '600',
          color: colors.text,
          marginTop: 16,
          textAlign: 'center',
        }}>
          Restaurant not found
        </Text>
        <TouchableOpacity
          style={[buttonStyles.primary, { marginTop: 16 }]}
          onPress={() => router.back()}
        >
          <Text style={{ color: colors.white, fontWeight: '600' }}>
            Go Back
          </Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // Filter menu items by selected category
  const filteredMenuItems = selectedCategory === 'all' 
    ? menuItems 
    : menuItems.filter(item => item.category === selectedCategory);

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
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ marginRight: 16 }}
        >
          <Icon name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={[commonStyles.title, { marginBottom: 4 }]}>
            {restaurant.name}
          </Text>
          <Text style={{ color: colors.textLight, fontSize: 14 }}>
            {restaurant.cuisine_type || 'Restaurant'}
          </Text>
        </View>
        <TouchableOpacity
          onPress={handleCheckout}
          style={{
            backgroundColor: colors.primary,
            borderRadius: 20,
            paddingHorizontal: 16,
            paddingVertical: 8,
          }}
        >
          <Text style={{ color: colors.white, fontWeight: '600' }}>
            Cart ({getCartItemCount()})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Restaurant Info */}
      <View style={{ padding: 20, backgroundColor: colors.backgroundAlt }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
          <Text style={{ color: colors.textLight }}>
            Min order: R{restaurant.min_order}
          </Text>
          <Text style={{ color: colors.textLight }}>
            Delivery: R{restaurant.delivery_from}
          </Text>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={{ color: colors.textLight }}>
            Rating: {restaurant.rating || '4.5'} ⭐
          </Text>
          <Text style={{ color: colors.textLight }}>
            Time: {restaurant.delivery_time || restaurant.eta}
          </Text>
        </View>
      </View>

      {/* Category Filter */}
      {categories.length > 1 && (
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={{ padding: 20, paddingBottom: 0 }}
        >
          <TouchableOpacity
            style={{
              backgroundColor: selectedCategory === 'all' ? colors.primary : colors.backgroundAlt,
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 20,
              marginRight: 12,
            }}
            onPress={() => setSelectedCategory('all')}
          >
            <Text style={{
              color: selectedCategory === 'all' ? colors.white : colors.text,
              fontWeight: '600',
            }}>
              All ({menuItems.length})
            </Text>
          </TouchableOpacity>
          
          {categories.map((category) => {
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
                }}
                onPress={() => setSelectedCategory(category)}
              >
                <Text style={{
                  color: selectedCategory === category ? colors.white : colors.text,
                  fontWeight: '600',
                }}>
                  {category} ({categoryCount})
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
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
            <Text style={{
              fontSize: 18,
              fontWeight: '600',
              color: colors.text,
              marginTop: 16,
              textAlign: 'center',
            }}>
              No menu items available
            </Text>
            <Text style={{
              fontSize: 14,
              color: colors.textLight,
              marginTop: 8,
              textAlign: 'center',
            }}>
              {selectedCategory !== 'all' 
                ? `No items in ${selectedCategory} category`
                : 'Menu items will be added soon'
              }
            </Text>
          </View>
        ) : (
          <>
            <Text style={{
              fontSize: 16,
              fontWeight: '600',
              color: colors.text,
              marginBottom: 16,
            }}>
              {filteredMenuItems.length} items
              {selectedCategory !== 'all' && ` in ${selectedCategory}`}
            </Text>
            {filteredMenuItems.map(renderMenuItem)}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
