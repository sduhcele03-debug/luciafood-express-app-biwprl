
import React, { useState, useEffect } from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { supabase, Restaurant, MenuItem } from '../../lib/supabase';
import { commonStyles, colors, buttonStyles } from '../../styles/commonStyles';
import Icon from '../../components/Icon';

// Mock data for menu items
const mockMenuItems: { [key: string]: MenuItem[] } = {
  '1': [
    {
      id: '1',
      restaurant_id: '1',
      category: 'Starters',
      name: 'Samosas (4 pieces)',
      price: 35,
      image_url: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=300&h=200&fit=crop',
    },
    {
      id: '2',
      restaurant_id: '1',
      category: 'Main Course',
      name: 'Chicken Curry',
      price: 85,
      image_url: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=300&h=200&fit=crop',
    },
    {
      id: '3',
      restaurant_id: '1',
      category: 'Main Course',
      name: 'Lamb Biryani',
      price: 120,
      image_url: 'https://images.unsplash.com/photo-1563379091339-03246963d96c?w=300&h=200&fit=crop',
    },
  ],
  '2': [
    {
      id: '4',
      restaurant_id: '2',
      category: 'Seafood',
      name: 'Grilled Prawns',
      price: 150,
      image_url: 'https://images.unsplash.com/photo-1565299585323-38174c4a6471?w=300&h=200&fit=crop',
    },
    {
      id: '5',
      restaurant_id: '2',
      category: 'Seafood',
      name: 'Fish & Chips',
      price: 95,
      image_url: 'https://images.unsplash.com/photo-1544943910-4c1dc44aab44?w=300&h=200&fit=crop',
    },
  ],
  '3': [
    {
      id: '6',
      restaurant_id: '3',
      category: 'Traditional',
      name: 'Pap & Wors',
      price: 65,
      image_url: 'https://images.unsplash.com/photo-1529042410759-befb1204b468?w=300&h=200&fit=crop',
    },
    {
      id: '7',
      restaurant_id: '3',
      category: 'Traditional',
      name: 'Chicken Stew',
      price: 75,
      image_url: 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=300&h=200&fit=crop',
    },
  ],
  '4': [
    {
      id: '8',
      restaurant_id: '4',
      category: 'Pizza',
      name: 'Margherita Pizza',
      price: 80,
      image_url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=300&h=200&fit=crop',
    },
    {
      id: '9',
      restaurant_id: '4',
      category: 'Pizza',
      name: 'Pepperoni Pizza',
      price: 95,
      image_url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=300&h=200&fit=crop',
    },
  ],
};

const mockRestaurants: { [key: string]: Restaurant } = {
  '1': {
    id: '1',
    name: 'Spice Garden',
    tags: ['Indian', 'Curry', 'Vegetarian'],
    logo_url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=200&h=200&fit=crop',
    min_order: 50,
    delivery_from: 30,
    eta: '25-35 min',
    available_in: ['Mtubatuba', 'St Lucia'],
  },
  '2': {
    id: '2',
    name: 'Ocean Breeze Seafood',
    tags: ['Seafood', 'Fresh Fish', 'Prawns'],
    logo_url: 'https://images.unsplash.com/photo-1544943910-4c1dc44aab44?w=200&h=200&fit=crop',
    min_order: 80,
    delivery_from: 45,
    eta: '30-40 min',
    available_in: ['St Lucia', 'Richards Bay'],
  },
  '3': {
    id: '3',
    name: 'Mama\'s Kitchen',
    tags: ['Traditional', 'Home Cooking', 'African'],
    logo_url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=200&h=200&fit=crop',
    min_order: 40,
    delivery_from: 25,
    eta: '20-30 min',
    available_in: ['Empangeni', 'Richards Bay'],
  },
  '4': {
    id: '4',
    name: 'Pizza Palace',
    tags: ['Pizza', 'Italian', 'Fast Food'],
    logo_url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=200&h=200&fit=crop',
    min_order: 60,
    delivery_from: 20,
    eta: '15-25 min',
    available_in: ['Mtubatuba', 'St Lucia', 'Empangeni', 'Richards Bay'],
  },
};

export default function RestaurantScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const { 
    cart, 
    addToCart, 
    removeFromCart, 
    clearCart,
    getItemQuantity, 
    getCartTotal, 
    getCartItemCount 
  } = useCart();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadRestaurantData();
    }
  }, [id]);

  const loadRestaurantData = async () => {
    if (!id) return;

    setLoading(true);
    console.log('Restaurant: Loading data for restaurant:', id);

    try {
      // Try to load from Supabase first
      const [restaurantResult, menuResult] = await Promise.all([
        supabase.from('restaurants').select('*').eq('id', id).single(),
        supabase.from('menu_items').select('*').eq('restaurant_id', id),
      ]);

      if (restaurantResult.error || menuResult.error) {
        console.log('Restaurant: Supabase not configured, using mock data');
        // Use mock data if Supabase is not set up
        setRestaurant(mockRestaurants[id] || null);
        setMenuItems(mockMenuItems[id] || []);
      } else {
        console.log('Restaurant: Loaded data from Supabase');
        setRestaurant(restaurantResult.data);
        setMenuItems(menuResult.data || []);
      }
    } catch (error) {
      console.log('Restaurant: Error loading data, using mock data:', error);
      setRestaurant(mockRestaurants[id] || null);
      setMenuItems(mockMenuItems[id] || []);
    }

    setLoading(false);
  };



  const handleCheckout = () => {
    if (!restaurant) return;

    const cartTotal = getCartTotal();
    if (cartTotal < restaurant.min_order) {
      Alert.alert(
        'Minimum Order Not Met',
        `Minimum order for ${restaurant.name} is R${restaurant.min_order}. Your current total is R${cartTotal}.`
      );
      return;
    }

    // Create WhatsApp message
    const deliveryFee = 25;
    const total = cartTotal + deliveryFee;
    
    let message = `🍽️ *LuciaFood Express Order*\n\n`;
    message += `📍 *Restaurant:* ${restaurant.name}\n`;
    message += `👤 *Customer:* ${user?.email}\n\n`;
    message += `📋 *Order Details:*\n`;
    
    cart.forEach(item => {
      message += `• ${item.name} x${item.quantity} - R${item.price * item.quantity}\n`;
    });
    
    message += `\n💰 *Order Summary:*\n`;
    message += `Subtotal: R${cartTotal}\n`;
    message += `Delivery Fee: R${deliveryFee}\n`;
    message += `*Total: R${total}*\n\n`;
    message += `⏰ Estimated delivery: ${restaurant.eta}\n`;
    message += `📱 Please confirm this order and provide delivery address.`;

    const whatsappUrl = `https://wa.me/27787549186?text=${encodeURIComponent(message)}`;
    
    console.log('Restaurant: Opening WhatsApp with order:', whatsappUrl);
    
    // In a real app, you would use Linking.openURL(whatsappUrl)
    Alert.alert(
      'Order Placed!',
      'Your order has been prepared for WhatsApp. In a real app, this would open WhatsApp with your order details.',
      [
        {
          text: 'OK',
          onPress: () => {
            clearCart();
            router.back();
          },
        },
      ]
    );
  };

  const groupedMenuItems = menuItems.reduce((groups, item) => {
    const category = item.category;
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(item);
    return groups;
  }, {} as { [key: string]: MenuItem[] });

  if (loading) {
    return (
      <SafeAreaView style={[commonStyles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[commonStyles.text, { marginTop: 16 }]}>Loading menu...</Text>
      </SafeAreaView>
    );
  }

  if (!restaurant) {
    return (
      <SafeAreaView style={[commonStyles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Icon name="restaurant" size={60} color={colors.textLight} />
        <Text style={[commonStyles.text, { marginTop: 16 }]}>Restaurant not found</Text>
        <TouchableOpacity
          onPress={() => router.back()}
          style={[buttonStyles.primary, { marginTop: 20, width: 200 }]}
        >
          <Text style={{ color: colors.white, fontWeight: '600' }}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={commonStyles.container}>
      {/* Header */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: colors.background,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
      }}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: colors.backgroundAlt,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 16,
          }}
        >
          <Icon name="arrow-back" size={20} color={colors.text} />
        </TouchableOpacity>
        
        <View style={{ flex: 1 }}>
          <Text style={[commonStyles.title, { textAlign: 'left', marginBottom: 4 }]}>
            {restaurant.name}
          </Text>
          <Text style={[commonStyles.text, { fontSize: 14, color: colors.textLight, marginBottom: 0 }]}>
            Min R{restaurant.min_order} • {restaurant.eta}
          </Text>
        </View>
      </View>

      {/* Restaurant Info */}
      <View style={{
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: colors.backgroundAlt,
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
          <Image
            source={{ uri: restaurant.logo_url }}
            style={{
              width: 60,
              height: 60,
              borderRadius: 8,
              marginRight: 16,
            }}
          />
          
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 }}>
              {restaurant.tags.map((tag, index) => (
                <View
                  key={index}
                  style={{
                    backgroundColor: colors.primary,
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                    borderRadius: 12,
                    marginRight: 6,
                    marginBottom: 4,
                  }}
                >
                  <Text style={{ fontSize: 12, color: colors.white, fontWeight: '600' }}>
                    {tag}
                  </Text>
                </View>
              ))}
            </View>
            
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Icon name="location" size={14} color={colors.primary} />
              <Text style={{ fontSize: 12, color: colors.primary, marginLeft: 4 }}>
                Delivering to: {restaurant.available_in.join(', ')}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Menu */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: getCartItemCount() > 0 ? 100 : 20 }}
        showsVerticalScrollIndicator={false}
      >
        {Object.entries(groupedMenuItems).map(([category, items]) => (
          <View key={category} style={{ paddingHorizontal: 20, marginTop: 20 }}>
            <Text style={[commonStyles.text, { fontSize: 20, fontWeight: '700', marginBottom: 16 }]}>
              {category}
            </Text>
            
            {items.map(item => {
              const quantity = getItemQuantity(item.id);
              
              return (
                <View key={item.id} style={[commonStyles.card, { marginBottom: 16 }]}>
                  <View style={{ flexDirection: 'row' }}>
                    <Image
                      source={{ uri: item.image_url || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=300&h=200&fit=crop' }}
                      style={{
                        width: 80,
                        height: 80,
                        borderRadius: 8,
                        marginRight: 16,
                      }}
                    />
                    
                    <View style={{ flex: 1 }}>
                      <Text style={[commonStyles.text, { fontSize: 16, fontWeight: '600', marginBottom: 4 }]}>
                        {item.name}
                      </Text>
                      
                      <Text style={[commonStyles.text, { fontSize: 18, fontWeight: '700', color: colors.primary, marginBottom: 8 }]}>
                        R{item.price}
                      </Text>
                      
                      {quantity > 0 ? (
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          <TouchableOpacity
                            onPress={() => removeFromCart(item.id)}
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: 16,
                              backgroundColor: colors.backgroundAlt,
                              alignItems: 'center',
                              justifyContent: 'center',
                              borderWidth: 1,
                              borderColor: colors.primary,
                            }}
                          >
                            <Icon name="remove" size={16} color={colors.primary} />
                          </TouchableOpacity>
                          
                          <Text style={{
                            marginHorizontal: 16,
                            fontSize: 16,
                            fontWeight: '600',
                            color: colors.text,
                          }}>
                            {quantity}
                          </Text>
                          
                          <TouchableOpacity
                            onPress={() => addToCart(item)}
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: 16,
                              backgroundColor: colors.primary,
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <Icon name="add" size={16} color={colors.white} />
                          </TouchableOpacity>
                        </View>
                      ) : (
                        <TouchableOpacity
                          onPress={() => addToCart(item)}
                          style={{
                            backgroundColor: colors.primary,
                            paddingHorizontal: 16,
                            paddingVertical: 8,
                            borderRadius: 8,
                            alignSelf: 'flex-start',
                          }}
                        >
                          <Text style={{ color: colors.white, fontWeight: '600' }}>
                            Add to Cart
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        ))}
      </ScrollView>

      {/* Cart Summary */}
      {getCartItemCount() > 0 && (
        <View style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: colors.white,
          paddingHorizontal: 20,
          paddingVertical: 16,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          boxShadow: '0px -4px 16px rgba(0, 0, 0, 0.1)',
          elevation: 8,
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <Text style={[commonStyles.text, { fontSize: 16, fontWeight: '600' }]}>
              {getCartItemCount()} items • R{getCartTotal()}
            </Text>
            
            <Text style={[commonStyles.text, { fontSize: 14, color: colors.textLight }]}>
              + R25 delivery
            </Text>
          </View>
          
          <TouchableOpacity
            style={buttonStyles.primary}
            onPress={handleCheckout}
          >
            <Text style={{ color: colors.white, fontSize: 16, fontWeight: '600' }}>
              Checkout • R{getCartTotal() + 25}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}
