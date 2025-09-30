
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
import { useAuth } from '../../contexts/AuthContext';
import { supabase, Restaurant, MenuItem } from '../../lib/supabase';
import { useLocalSearchParams, router } from 'expo-router';
import { useCart } from '../../contexts/CartContext';
import { commonStyles, colors, buttonStyles } from '../../styles/commonStyles';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from '../../components/Icon';

// Import restaurant logos
const restaurantLogos = {
  'KFC': require('../../assets/images/ea004ca1-a296-4e39-984b-2089e42444f5.jpeg'),
  'Galito\'s Chicken': require('../../assets/images/f3b869c8-2861-4512-997d-1c12896caf88.jpeg'),
  'Nando\'s': require('../../assets/images/23f5887f-3eee-46c9-a4fe-38bc1310eb7a.jpeg'),
  'Spur': require('../../assets/images/a49cf35b-b89b-413e-8d90-f264b2fd9558.jpeg'),
  'Steers': require('../../assets/images/835fe18b-a4b8-43eb-be23-24259d345053.jpeg'),
};

export default function RestaurantScreen() {
  const { user } = useAuth();
  const { addToCart, getItemQuantity } = useCart();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>([]);

  const loadRestaurantData = useCallback(async () => {
    if (!id) return;

    try {
      setLoading(true);
      
      // Load restaurant details
      const { data: restaurantData, error: restaurantError } = await supabase
        .from('restaurants')
        .select('*')
        .eq('id', id)
        .single();

      if (restaurantError) {
        console.error('Error loading restaurant:', restaurantError);
        Alert.alert('Error', 'Failed to load restaurant details');
        return;
      }

      setRestaurant(restaurantData);

      // Load menu items
      const { data: menuData, error: menuError } = await supabase
        .from('menu_items')
        .select('*')
        .eq('restaurant_id', id)
        .order('category', { ascending: true })
        .order('name', { ascending: true });

      if (menuError) {
        console.error('Error loading menu:', menuError);
        Alert.alert('Error', 'Failed to load menu items');
        return;
      }

      setMenuItems(menuData || []);
      
      // Extract unique categories
      const uniqueCategories = [...new Set(menuData?.map(item => item.category) || [])];
      setCategories(uniqueCategories);

    } catch (error) {
      console.error('Error loading restaurant data:', error);
      Alert.alert('Error', 'Failed to load restaurant data');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadRestaurantData();
  }, [loadRestaurantData]);

  const handleAddToCart = (item: MenuItem) => {
    if (!user) {
      Alert.alert(
        'Sign In Required',
        'Please sign in to add items to your cart',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Sign In', onPress: () => router.push('/signin') },
        ]
      );
      return;
    }

    addToCart(item);
    Alert.alert('Added to Cart', `${item.name} has been added to your cart`);
  };

  const handleCheckout = () => {
    router.push('/cart');
  };

  const renderMenuItem = (item: MenuItem) => {
    const quantity = getItemQuantity(item.id);
    const shouldShowImage = restaurant?.name !== 'Spur';
    
    return (
      <View key={item.id} style={[commonStyles.card, { marginBottom: 16 }]}>
        <View style={{ flexDirection: 'row' }}>
          {shouldShowImage && (
            <Image
              source={{ 
                uri: item.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=150&h=150&fit=crop'
              }}
              style={{
                width: 80,
                height: 80,
                borderRadius: 12,
                marginRight: 16,
              }}
              resizeMode="cover"
            />
          )}
          <View style={{ flex: 1 }}>
            <Text style={{
              fontSize: 16,
              fontWeight: '700',
              color: colors.text,
              marginBottom: 4,
            }}>
              {item.name}
            </Text>
            {item.tags && item.tags.length > 0 && (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 }}>
                {item.tags.map((tag, index) => (
                  <View
                    key={index}
                    style={{
                      backgroundColor: colors.backgroundAlt,
                      paddingHorizontal: 8,
                      paddingVertical: 2,
                      borderRadius: 12,
                      marginRight: 6,
                      marginBottom: 4,
                    }}
                  >
                    <Text style={{
                      fontSize: 10,
                      color: colors.textLight,
                      fontWeight: '500',
                    }}>
                      {tag}
                    </Text>
                  </View>
                ))}
              </View>
            )}
            <Text style={{
              fontSize: 18,
              fontWeight: '700',
              color: colors.primary,
              marginBottom: 12,
            }}>
              R{(item.lucia_price || item.price).toFixed(2)}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <TouchableOpacity
                style={[buttonStyles.primary, { 
                  paddingVertical: 8, 
                  paddingHorizontal: 16,
                  flex: 1,
                }]}
                onPress={() => handleAddToCart(item)}
              >
                <Text style={{ 
                  color: colors.white, 
                  fontWeight: '600', 
                  fontSize: 14,
                  textAlign: 'center',
                }}>
                  Add to Cart
                </Text>
              </TouchableOpacity>
              {quantity > 0 && (
                <View style={{
                  backgroundColor: colors.primary,
                  borderRadius: 12,
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  marginLeft: 8,
                }}>
                  <Text style={{
                    color: colors.white,
                    fontWeight: '700',
                    fontSize: 12,
                  }}>
                    {quantity}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={commonStyles.container}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={{ marginTop: 16, color: colors.textLight }}>
            Loading restaurant...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!restaurant) {
    return (
      <SafeAreaView style={commonStyles.container}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <Icon name="restaurant" size={60} color={colors.textLight} />
          <Text style={[commonStyles.title, { marginTop: 16 }]}>
            Restaurant not found
          </Text>
          <TouchableOpacity
            style={[buttonStyles.primary, { marginTop: 20 }]}
            onPress={() => router.back()}
          >
            <Text style={{ color: colors.white, fontWeight: '700', fontSize: 16 }}>
              Go Back
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={commonStyles.container}>
      {/* Header */}
      <View style={{ 
        flexDirection: 'row', 
        alignItems: 'center', 
        padding: 20, 
        paddingBottom: 10,
        backgroundColor: colors.white,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
      }}>
        <TouchableOpacity onPress={() => router.back()}>
          <Icon name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[commonStyles.title, { marginLeft: 16, marginBottom: 0, flex: 1 }]}>
          {restaurant.name}
        </Text>
        <TouchableOpacity onPress={handleCheckout}>
          <Icon name="basket" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 20 }}>
        {/* Restaurant Header */}
        <View style={{ padding: 20 }}>
          <Image
            source={
              restaurantLogos[restaurant.name as keyof typeof restaurantLogos] ||
              { uri: restaurant.image || restaurant.logo_url || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=200&fit=crop' }
            }
            style={{
              width: '100%',
              height: 200,
              borderRadius: 16,
              marginBottom: 16,
            }}
            resizeMode="cover"
          />
          
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <View>
              <Text style={{
                fontSize: 24,
                fontWeight: '800',
                color: colors.text,
                marginBottom: 4,
              }}>
                {restaurant.name}
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Icon name="star" size={16} color={colors.primary} />
                <Text style={{
                  fontSize: 16,
                  fontWeight: '600',
                  color: colors.text,
                  marginLeft: 4,
                }}>
                  {restaurant.rating || '4.5'}
                </Text>
                <Text style={{
                  fontSize: 14,
                  color: colors.textLight,
                  marginLeft: 8,
                }}>
                  • {restaurant.eta || '30-45 min'}
                </Text>
              </View>
            </View>
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{
              fontSize: 14,
              color: colors.textLight,
            }}>
              Min order: R{restaurant.min_order}
            </Text>
            <Text style={{
              fontSize: 14,
              color: colors.textLight,
            }}>
              Delivery from: R{restaurant.delivery_from}
            </Text>
          </View>

          {restaurant.tags && restaurant.tags.length > 0 && (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 12 }}>
              {restaurant.tags.map((tag, index) => (
                <View
                  key={index}
                  style={{
                    backgroundColor: colors.backgroundAlt,
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 16,
                    marginRight: 8,
                    marginBottom: 8,
                  }}
                >
                  <Text style={{
                    fontSize: 12,
                    color: colors.textLight,
                    fontWeight: '500',
                  }}>
                    {tag}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Menu Items by Category */}
        <View style={{ padding: 20 }}>
          {categories.map((category) => (
            <View key={category} style={{ marginBottom: 32 }}>
              <Text style={{
                fontSize: 20,
                fontWeight: '700',
                color: colors.text,
                marginBottom: 16,
              }}>
                {category}
              </Text>
              {menuItems
                .filter(item => item.category === category)
                .map(renderMenuItem)
              }
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
