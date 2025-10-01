
import { Picker } from '@react-native-picker/picker';
import Icon from '../components/Icon';
import { router } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import React, { useState, useEffect, useCallback } from 'react';
import { FOOD_ORDER_CHECKOUT_NUMBER, generateWhatsAppUrl, openWhatsAppWithFallback } from '../constants/whatsapp';
import { commonStyles, colors, buttonStyles } from '../styles/commonStyles';
import {
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Linking,
} from 'react-native';
import { supabase } from '../lib/supabase';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCart } from '../contexts/CartContext';

interface ProfileData {
  full_name: string;
  phone: string;
  address: string;
}

// FEATURE IMPLEMENTATION: Town list and dynamic delivery fee calculation
const TOWN_DELIVERY_FEES = {
  'Mtubatuba Town': 25,
  'Riverview': 25,
  'Nordale': 30,
  'KwaMsane': 30,
  'Nkodibe': 30,
  'Richards Bay': 30,
  'Esikhawini': 35,
  'Meerensee': 40,
  'Mzingazi': 45,
  'Brackenham': 45,
  'Alton': 45,
  'Dukuduku': 55,
  'St Lucia': 65,
};

export default function CartScreen() {
  const { user } = useAuth();
  const { cart, removeItem, updateQuantity, clearCart, getCartTotal, getCartItemCount, getRestaurantCount } = useCart();
  
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [town, setTown] = useState('Mtubatuba Town');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [loading, setLoading] = useState(false);

  // CRITICAL FIX: Define loadUserProfile function BEFORE useEffect
  const loadUserProfile = useCallback(async () => {
    if (!user) return;

    try {
      console.log('CartScreen: Loading user profile...');
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, phone_number, address')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.log('CartScreen: No existing profile found, using defaults');
        return;
      }

      if (data) {
        console.log('CartScreen: Loaded user profile data');
        setCustomerName(data.full_name || '');
        setPhone(data.phone_number || '');
        setAddress(data.address || '');
      }
    } catch (error) {
      console.error('CartScreen: Error loading user profile:', error);
    }
  }, [user]);

  // Group cart items by restaurant
  const groupCartByRestaurant = useCallback(() => {
    const grouped: { [key: string]: any[] } = {};
    
    cart.forEach(item => {
      if (!grouped[item.restaurant_id]) {
        grouped[item.restaurant_id] = [];
      }
      grouped[item.restaurant_id].push(item);
    });
    
    return grouped;
  }, [cart]);

  useEffect(() => {
    loadUserProfile().catch(error => {
      console.error('CartScreen: Failed to load user profile:', error);
    });
  }, [loadUserProfile]);

  // FEATURE IMPLEMENTATION: Dynamic delivery fee calculation
  const getDeliveryFee = useCallback(() => {
    return TOWN_DELIVERY_FEES[town as keyof typeof TOWN_DELIVERY_FEES] || 25;
  }, [town]);

  const handleCheckout = async () => {
    if (cart.length === 0) {
      Alert.alert('Empty Cart', 'Please add items to your cart before checkout');
      return;
    }

    if (!customerName.trim() || !phone.trim() || !address.trim()) {
      Alert.alert('Missing Information', 'Please fill in all required fields');
      return;
    }

    if (getRestaurantCount() > 1) {
      Alert.alert(
        'Multiple Restaurants',
        'You can only order from one restaurant at a time. Please remove items from other restaurants.',
        [{ text: 'OK' }]
      );
      return;
    }

    setLoading(true);

    try {
      // Calculate totals with dynamic delivery fee
      const subtotal = getCartTotal();
      const deliveryFee = getDeliveryFee();
      const total = subtotal + deliveryFee;

      // Get restaurant info
      const restaurantId = cart[0]?.restaurant_id;
      const { data: restaurant } = await supabase
        .from('restaurants')
        .select('name')
        .eq('id', restaurantId)
        .single();

      // Create order object
      const orderData = {
        customer_name: customerName.trim(),
        phone: phone.trim(),
        address: address.trim(),
        town,
        restaurant_id: restaurantId,
        items: cart.map(item => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.lucia_price || item.price, // PRICE DISPLAY FIX: Use lucia_price
          total: (item.lucia_price || item.price) * item.quantity
        })),
        subtotal,
        delivery_fee: deliveryFee,
        total,
        payment_method: paymentMethod,
        status: 'pending'
      };

      // Save order to database
      const { error: orderError } = await supabase
        .from('orders')
        .insert(orderData);

      if (orderError) {
        console.error('Error saving order:', orderError);
        Alert.alert('Error', 'Failed to save order. Please try again.');
        return;
      }

      // Generate WhatsApp message
      const itemsList = cart.map(item => 
        `• ${item.name} x${item.quantity} - R${((item.lucia_price || item.price) * item.quantity).toFixed(2)}`
      ).join('\n');

      const message = `🍽️ *New Order from LuciaFood Express*

👤 *Customer Details:*
Name: ${customerName}
Phone: ${phone}
Address: ${address}
Town: ${town}

🏪 *Restaurant:* ${restaurant?.name || 'Unknown'}

📋 *Order Items:*
${itemsList}

💰 *Order Summary:*
Subtotal: R${subtotal.toFixed(2)}
Delivery Fee: R${deliveryFee.toFixed(2)}
*Total: R${total.toFixed(2)}*

💳 *Payment Method:* ${paymentMethod}

Please confirm this order and provide estimated delivery time.`;

      // Open WhatsApp
      const whatsappUrl = generateWhatsAppUrl(FOOD_ORDER_CHECKOUT_NUMBER, message);
      const success = await openWhatsAppWithFallback(whatsappUrl);

      if (success) {
        // Clear cart and show success
        clearCart();
        Alert.alert(
          'Order Sent!',
          'Your order has been sent via WhatsApp. You will receive confirmation shortly.',
          [
            {
              text: 'OK',
              onPress: () => router.push('/(tabs)/')
            }
          ]
        );
      }
    } catch (error) {
      console.error('Checkout error:', error);
      Alert.alert('Error', 'Failed to process order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <SafeAreaView style={[commonStyles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Icon name="basket" size={80} color={colors.textLight} />
        <Text style={{
          fontSize: 24,
          fontWeight: '700',
          color: colors.text,
          marginTop: 20,
          marginBottom: 8,
        }}>
          Your cart is empty
        </Text>
        <Text style={{
          fontSize: 16,
          color: colors.textLight,
          textAlign: 'center',
          marginBottom: 32,
        }}>
          Add some delicious items from our restaurants
        </Text>
        <TouchableOpacity
          style={buttonStyles.primary}
          onPress={() => router.push('/(tabs)/restaurants')}
        >
          <Text style={{ color: colors.white, fontWeight: '600', fontSize: 16 }}>
            Browse Restaurants
          </Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const subtotal = getCartTotal();
  const deliveryFee = getDeliveryFee();
  const total = subtotal + deliveryFee;
  const groupedCart = groupCartByRestaurant();

  return (
    <SafeAreaView style={[commonStyles.container, { paddingBottom: 80 }]}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20 }}>
        <Text style={[commonStyles.title, { marginBottom: 20 }]}>
          Your Cart
        </Text>

        {/* Cart Items */}
        {Object.entries(groupedCart).map(([restaurantId, items]) => (
          <View key={restaurantId} style={[commonStyles.card, { marginBottom: 20 }]}>
            <Text style={{
              fontSize: 18,
              fontWeight: '700',
              color: colors.text,
              marginBottom: 16,
            }}>
              Restaurant Order
            </Text>
            
            {items.map((item) => (
              <View key={item.id} style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingVertical: 12,
                borderBottomWidth: 1,
                borderBottomColor: colors.backgroundAlt,
              }}>
                <View style={{ flex: 1 }}>
                  <Text style={{
                    fontSize: 16,
                    fontWeight: '600',
                    color: colors.text,
                    marginBottom: 4,
                  }}>
                    {item.name}
                  </Text>
                  {/* PRICE DISPLAY FIX: Only show lucia_price */}
                  <Text style={{
                    fontSize: 14,
                    color: colors.primary,
                    fontWeight: '600',
                    marginBottom: 4,
                  }}>
                    R{(item.lucia_price || item.price).toFixed(2)} each
                  </Text>
                </View>
                
                <View style={{ alignItems: 'center', flexDirection: 'row' }}>
                  {/* CART QUANTITY CONTROLS: Enhanced quantity management */}
                  <TouchableOpacity
                    onPress={() => removeItem(item.id)}
                    style={{
                      backgroundColor: colors.backgroundAlt,
                      borderRadius: 20,
                      width: 32,
                      height: 32,
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: 12,
                    }}
                  >
                    <Icon name="remove" size={16} color={colors.text} />
                  </TouchableOpacity>
                  
                  <Text style={{
                    fontSize: 16,
                    fontWeight: '700',
                    color: colors.text,
                    minWidth: 30,
                    textAlign: 'center',
                    marginRight: 12,
                  }}>
                    {item.quantity}
                  </Text>
                  
                  <TouchableOpacity
                    onPress={() => updateQuantity(item.id, item.quantity + 1)}
                    style={{
                      backgroundColor: colors.primary,
                      borderRadius: 20,
                      width: 32,
                      height: 32,
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: 16,
                    }}
                  >
                    <Icon name="add" size={16} color={colors.white} />
                  </TouchableOpacity>
                  
                  <Text style={{
                    fontSize: 16,
                    fontWeight: '700',
                    color: colors.primary,
                  }}>
                    R{((item.lucia_price || item.price) * item.quantity).toFixed(2)}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        ))}

        {/* Order Summary */}
        <View style={[commonStyles.card, { marginBottom: 20 }]}>
          <Text style={{
            fontSize: 18,
            fontWeight: '700',
            color: colors.text,
            marginBottom: 16,
          }}>
            Order Summary
          </Text>
          
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
            <Text style={{ color: colors.textLight }}>Subtotal</Text>
            <Text style={{ color: colors.text, fontWeight: '600' }}>R{subtotal.toFixed(2)}</Text>
          </View>
          
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
            <Text style={{ color: colors.textLight }}>Delivery Fee ({town})</Text>
            <Text style={{ color: colors.text, fontWeight: '600' }}>R{getDeliveryFee().toFixed(2)}</Text>
          </View>
          
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            paddingTop: 8,
            borderTopWidth: 1,
            borderTopColor: colors.backgroundAlt,
          }}>
            <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text }}>Total</Text>
            <Text style={{ fontSize: 18, fontWeight: '700', color: colors.primary }}>R{total.toFixed(2)}</Text>
          </View>
        </View>

        {/* Customer Information */}
        <View style={[commonStyles.card, { marginBottom: 20 }]}>
          <Text style={{
            fontSize: 18,
            fontWeight: '700',
            color: colors.text,
            marginBottom: 16,
          }}>
            Delivery Information
          </Text>
          
          <TextInput
            style={commonStyles.input}
            placeholder="Full Name"
            value={customerName}
            onChangeText={setCustomerName}
            placeholderTextColor={colors.textLight}
          />
          
          <TextInput
            style={commonStyles.input}
            placeholder="Phone Number"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            placeholderTextColor={colors.textLight}
          />
          
          <TextInput
            style={commonStyles.input}
            placeholder="Delivery Address"
            value={address}
            onChangeText={setAddress}
            multiline
            numberOfLines={3}
            placeholderTextColor={colors.textLight}
          />
          
          {/* FEATURE IMPLEMENTATION: Town dropdown with delivery fees */}
          <Text style={{
            fontSize: 14,
            fontWeight: '600',
            color: colors.text,
            marginBottom: 8,
          }}>
            Select Town (Delivery Fee: R{getDeliveryFee()})
          </Text>
          <View style={{
            backgroundColor: colors.backgroundAlt,
            borderRadius: 12,
            marginBottom: 16,
          }}>
            <Picker
              selectedValue={town}
              onValueChange={setTown}
              style={{ color: colors.text }}
            >
              {Object.entries(TOWN_DELIVERY_FEES).map(([townName, fee]) => (
                <Picker.Item 
                  key={townName}
                  label={`${townName} (R${fee})`} 
                  value={townName} 
                />
              ))}
            </Picker>
          </View>
          
          {/* FEATURE IMPLEMENTATION: Payment method selection */}
          <Text style={{
            fontSize: 14,
            fontWeight: '600',
            color: colors.text,
            marginBottom: 8,
          }}>
            Payment Method
          </Text>
          <View style={{
            backgroundColor: colors.backgroundAlt,
            borderRadius: 12,
            marginBottom: 16,
          }}>
            <Picker
              selectedValue={paymentMethod}
              onValueChange={setPaymentMethod}
              style={{ color: colors.text }}
            >
              <Picker.Item label="Cash" value="Cash" />
              <Picker.Item label="EFT" value="EFT" />
            </Picker>
          </View>
        </View>

        {/* Checkout Button */}
        <TouchableOpacity
          style={[buttonStyles.primary, { opacity: loading ? 0.6 : 1 }]}
          onPress={handleCheckout}
          disabled={loading}
        >
          <Text style={{ color: colors.white, fontWeight: '700', fontSize: 16 }}>
            {loading ? 'Processing...' : `Checkout - R${total.toFixed(2)}`}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
