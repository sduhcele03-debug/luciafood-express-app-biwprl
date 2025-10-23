
import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { FOOD_ORDER_CHECKOUT_NUMBER, generateWhatsAppUrl, openWhatsAppWithFallback } from '../constants/whatsapp';
import { useCart } from '../contexts/CartContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from '../components/Icon';
import { router } from 'expo-router';
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
import { Picker } from '@react-native-picker/picker';
import { useAuth } from '../contexts/AuthContext';

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
  const { 
    cart, 
    removeItem, 
    updateQuantity, 
    clearCart, 
    getCartTotal, 
    getCartItemCount, 
    getRestaurantCount,
    getCartByRestaurant 
  } = useCart();
  
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [detailedAddress, setDetailedAddress] = useState(''); // NEW: Separate field for street/landmark
  const [town, setTown] = useState('Mtubatuba Town');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [promoCode, setPromoCode] = useState(''); // NEW: Promo code state
  const [promoDiscount, setPromoDiscount] = useState(0); // NEW: Promo discount amount
  const [promoApplied, setPromoApplied] = useState(false); // NEW: Promo applied status
  const [loading, setLoading] = useState(false);
  const [restaurantNames, setRestaurantNames] = useState<{ [key: string]: string }>({});

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
        setDetailedAddress(data.address || '');
      }
    } catch (error) {
      console.error('CartScreen: Error loading user profile:', error);
    }
  }, [user]);

  // Load restaurant names for multi-restaurant display
  const loadRestaurantNames = useCallback(async () => {
    const groupedCart = getCartByRestaurant();
    const restaurantIds = Object.keys(groupedCart);
    
    if (restaurantIds.length === 0) return;

    try {
      const { data, error } = await supabase
        .from('restaurants')
        .select('id, name')
        .in('id', restaurantIds);

      if (error) {
        console.error('CartScreen: Error loading restaurant names:', error);
        return;
      }

      const nameMap: { [key: string]: string } = {};
      data?.forEach(restaurant => {
        nameMap[restaurant.id] = restaurant.name;
      });
      
      setRestaurantNames(nameMap);
    } catch (error) {
      console.error('CartScreen: Error loading restaurant names:', error);
    }
  }, [getCartByRestaurant]);

  useEffect(() => {
    loadUserProfile().catch(error => {
      console.error('CartScreen: Failed to load user profile:', error);
    });
  }, [loadUserProfile]);

  useEffect(() => {
    loadRestaurantNames().catch(error => {
      console.error('CartScreen: Failed to load restaurant names:', error);
    });
  }, [loadRestaurantNames]);

  // MULTI-RESTAURANT FEATURE: Dynamic delivery fee calculation
  const getDeliveryFee = useCallback(() => {
    const baseFee = TOWN_DELIVERY_FEES[town as keyof typeof TOWN_DELIVERY_FEES] || 25;
    const restaurantCount = getRestaurantCount();
    
    // Base fee for first restaurant + R10 for each additional restaurant (up to 3)
    const additionalFee = Math.max(0, restaurantCount - 1) * 10;
    
    return baseFee + additionalFee;
  }, [town, getRestaurantCount]);

  // NEW: Promo code application handler (placeholder for future AI integration)
  const handleApplyPromoCode = () => {
    if (!promoCode.trim()) {
      Alert.alert('Invalid Code', 'Please enter a promotion code');
      return;
    }

    // PLACEHOLDER: This is where AI/server logic will be integrated
    // For now, show a message that the feature is coming soon
    Alert.alert(
      'Feature Coming Soon',
      'Promotion code validation will be available soon. This feature will be powered by AI to provide personalized discounts.',
      [{ text: 'OK' }]
    );
    
    // Example of how discount would be applied in the future:
    // setPromoDiscount(calculatedDiscount);
    // setPromoApplied(true);
    
    console.log('Promo code entered:', promoCode);
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      Alert.alert('Empty Cart', 'Please add items to your cart before checkout');
      return;
    }

    if (!customerName.trim() || !phone.trim() || !detailedAddress.trim()) {
      Alert.alert('Missing Information', 'Please fill in all required fields including your detailed address');
      return;
    }

    const restaurantCount = getRestaurantCount();
    if (restaurantCount > 3) {
      Alert.alert(
        'Too Many Restaurants',
        'You can only order from a maximum of 3 restaurants at once. Please remove items from some restaurants.',
        [{ text: 'OK' }]
      );
      return;
    }

    setLoading(true);

    try {
      // Calculate totals with multi-restaurant delivery fee and promo discount
      const subtotal = getCartTotal();
      const deliveryFee = getDeliveryFee();
      const total = subtotal + deliveryFee - promoDiscount;

      // Group items by restaurant for multi-restaurant invoice
      const groupedCart = getCartByRestaurant();

      // Create order objects for each restaurant
      const orders = [];
      for (const [restaurantId, items] of Object.entries(groupedCart)) {
        const restaurantSubtotal = items.reduce((sum, item) => {
          return sum + ((item.lucia_price || item.price) * item.quantity);
        }, 0);

        const orderData = {
          customer_name: customerName.trim(),
          phone: phone.trim(),
          address: `${detailedAddress.trim()}, ${town}`,
          town,
          restaurant_id: restaurantId,
          items: items.map(item => ({
            id: item.id,
            name: item.name,
            quantity: item.quantity,
            price: item.lucia_price || item.price,
            total: (item.lucia_price || item.price) * item.quantity
          })),
          subtotal: restaurantSubtotal,
          delivery_fee: restaurantCount === 1 ? deliveryFee : Math.round(deliveryFee / restaurantCount),
          total: restaurantCount === 1 ? total : restaurantSubtotal + Math.round(deliveryFee / restaurantCount) - (promoDiscount / restaurantCount),
          payment_method: paymentMethod,
          status: 'pending'
        };

        orders.push(orderData);
      }

      // Save all orders to database
      for (const order of orders) {
        const { error: orderError } = await supabase
          .from('orders')
          .insert(order);

        if (orderError) {
          console.error('Error saving order:', orderError);
          Alert.alert('Error', 'Failed to save order. Please try again.');
          return;
        }
      }

      // WHATSAPP CHECKOUT: Generate multi-restaurant invoice structure
      let message = `🍽️ *New Order from LuciaFood Express*

👤 *Customer Details:*
Name: ${customerName}
Phone: ${phone}
Address: ${detailedAddress}
Town: ${town}

`;

      // Add items grouped by restaurant
      for (const [restaurantId, items] of Object.entries(groupedCart)) {
        const restaurantName = restaurantNames[restaurantId] || 'Unknown Restaurant';
        const restaurantSubtotal = items.reduce((sum, item) => {
          return sum + ((item.lucia_price || item.price) * item.quantity);
        }, 0);

        message += `🏪 *${restaurantName}:*
`;
        
        items.forEach(item => {
          message += `• ${item.name} x${item.quantity} - R${((item.lucia_price || item.price) * item.quantity).toFixed(2)}
`;
        });
        
        message += `Subtotal: R${restaurantSubtotal.toFixed(2)}

`;
      }

      // Add order summary with new structure
      message += `💰 *Order Summary:*
Items Total: R${subtotal.toFixed(2)}
Delivery Fee (${town}): R${deliveryFee.toFixed(2)}`;

      if (restaurantCount > 1) {
        message += `
  Base fee: R${TOWN_DELIVERY_FEES[town as keyof typeof TOWN_DELIVERY_FEES] || 25}
  Additional restaurants (${restaurantCount - 1}): R${(restaurantCount - 1) * 10}`;
      }

      if (promoDiscount > 0) {
        message += `
Promo Discount: -R${promoDiscount.toFixed(2)}`;
      }

      message += `
*Total to Pay: R${total.toFixed(2)}*

💳 *Payment Method:* ${paymentMethod}

Please confirm this order and provide estimated delivery time.`;

      // WHATSAPP NUMBER VERIFICATION: Use correct number (0822116064)
      console.log('Opening WhatsApp with number:', FOOD_ORDER_CHECKOUT_NUMBER);
      const success = await openWhatsAppWithFallback(FOOD_ORDER_CHECKOUT_NUMBER, message);

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
  const total = subtotal + deliveryFee - promoDiscount;
  const groupedCart = getCartByRestaurant();
  const restaurantCount = getRestaurantCount();

  return (
    <SafeAreaView style={[commonStyles.container, { paddingBottom: 80 }]}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20 }}>
        <Text style={[commonStyles.title, { marginBottom: 20 }]}>
          Your Cart
        </Text>

        {/* Multi-Restaurant Warning */}
        {restaurantCount > 1 && (
          <View style={[commonStyles.card, { 
            marginBottom: 20, 
            backgroundColor: colors.primary + '10',
            borderLeftWidth: 4,
            borderLeftColor: colors.primary,
          }]}>
            <Text style={{
              fontSize: 16,
              fontWeight: '700',
              color: colors.primary,
              marginBottom: 8,
            }}>
              Multi-Restaurant Order
            </Text>
            <Text style={{
              fontSize: 14,
              color: colors.text,
              marginBottom: 4,
            }}>
              You&apos;re ordering from {restaurantCount} restaurants.
            </Text>
            <Text style={{
              fontSize: 14,
              color: colors.textLight,
            }}>
              Additional delivery fee: R{(restaurantCount - 1) * 10} (R10 per extra restaurant)
            </Text>
          </View>
        )}

        {/* Cart Items Grouped by Restaurant */}
        {Object.entries(groupedCart).map(([restaurantId, items]) => {
          const restaurantName = restaurantNames[restaurantId] || 'Loading...';
          const restaurantSubtotal = items.reduce((sum, item) => {
            return sum + ((item.lucia_price || item.price) * item.quantity);
          }, 0);

          return (
            <View key={restaurantId} style={[commonStyles.card, { marginBottom: 20 }]}>
              <Text style={{
                fontSize: 18,
                fontWeight: '700',
                color: colors.text,
                marginBottom: 16,
              }}>
                🏪 {restaurantName}
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

              {/* Restaurant Subtotal */}
              <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                paddingTop: 12,
                borderTopWidth: 1,
                borderTopColor: colors.backgroundAlt,
                marginTop: 8,
              }}>
                <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text }}>
                  Restaurant Subtotal
                </Text>
                <Text style={{ fontSize: 16, fontWeight: '700', color: colors.primary }}>
                  R{restaurantSubtotal.toFixed(2)}
                </Text>
              </View>
            </View>
          );
        })}

        {/* FEATURE 3: REFACTORED ORDER SUMMARY - Clear Visual Distinction */}
        <View style={[commonStyles.card, { marginBottom: 20 }]}>
          <Text style={{
            fontSize: 20,
            fontWeight: '700',
            color: colors.text,
            marginBottom: 20,
          }}>
            💰 Order Summary
          </Text>
          
          {/* Items Total */}
          <View style={{ 
            flexDirection: 'row', 
            justifyContent: 'space-between', 
            marginBottom: 12,
            paddingBottom: 12,
            borderBottomWidth: 1,
            borderBottomColor: colors.backgroundAlt + '40',
          }}>
            <Text style={{ 
              fontSize: 16,
              color: colors.text,
              fontWeight: '500',
            }}>
              Items Total
            </Text>
            <Text style={{ 
              fontSize: 16,
              color: colors.text, 
              fontWeight: '600',
            }}>
              R{subtotal.toFixed(2)}
            </Text>
          </View>
          
          {/* Delivery Fee - Shows town and breakdown */}
          <View style={{ 
            flexDirection: 'row', 
            justifyContent: 'space-between', 
            marginBottom: 12,
            paddingBottom: 12,
            borderBottomWidth: 1,
            borderBottomColor: colors.backgroundAlt + '40',
          }}>
            <View style={{ flex: 1 }}>
              <Text style={{ 
                fontSize: 16,
                color: colors.text,
                fontWeight: '500',
                marginBottom: 4,
              }}>
                Delivery Fee
              </Text>
              <Text style={{ 
                fontSize: 13,
                color: colors.textLight,
              }}>
                {town} - Base: R{TOWN_DELIVERY_FEES[town as keyof typeof TOWN_DELIVERY_FEES] || 25}
              </Text>
              {restaurantCount > 1 && (
                <Text style={{ 
                  fontSize: 13,
                  color: colors.textLight,
                }}>
                  + R{(restaurantCount - 1) * 10} ({restaurantCount - 1} extra restaurant{restaurantCount > 2 ? 's' : ''})
                </Text>
              )}
            </View>
            <Text style={{ 
              fontSize: 16,
              color: colors.text, 
              fontWeight: '600',
            }}>
              R{deliveryFee.toFixed(2)}
            </Text>
          </View>
          
          {/* Promo Discount - Only shown if applied */}
          {promoDiscount > 0 && (
            <View style={{ 
              flexDirection: 'row', 
              justifyContent: 'space-between', 
              marginBottom: 12,
              paddingBottom: 12,
              borderBottomWidth: 1,
              borderBottomColor: colors.backgroundAlt + '40',
            }}>
              <Text style={{ 
                fontSize: 16,
                color: colors.primary,
                fontWeight: '500',
              }}>
                Promo Discount
              </Text>
              <Text style={{ 
                fontSize: 16,
                color: colors.primary, 
                fontWeight: '600',
              }}>
                -R{promoDiscount.toFixed(2)}
              </Text>
            </View>
          )}
          
          {/* Total to Pay - Prominent bottom line */}
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            paddingTop: 16,
            paddingBottom: 8,
            backgroundColor: colors.primary + '08',
            marginHorizontal: -16,
            paddingHorizontal: 16,
            borderRadius: 12,
          }}>
            <Text style={{ 
              fontSize: 20, 
              fontWeight: '700', 
              color: colors.text,
            }}>
              Total to Pay
            </Text>
            <Text style={{ 
              fontSize: 22, 
              fontWeight: '700', 
              color: colors.primary,
            }}>
              R{total.toFixed(2)}
            </Text>
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
            📍 Delivery Information
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
          
          {/* FEATURE 1A: Town/Area Dropdown with Fee Display */}
          <Text style={{
            fontSize: 14,
            fontWeight: '600',
            color: colors.text,
            marginBottom: 8,
            marginTop: 8,
          }}>
            Delivery Area
          </Text>
          <View style={{
            backgroundColor: colors.backgroundAlt,
            borderRadius: 12,
            marginBottom: 16,
            borderWidth: 1,
            borderColor: colors.primary + '20',
          }}>
            <Picker
              selectedValue={town}
              onValueChange={setTown}
              style={{ color: colors.text }}
            >
              {Object.entries(TOWN_DELIVERY_FEES).map(([townName, fee]) => (
                <Picker.Item 
                  key={townName}
                  label={`${townName} - R${fee.toFixed(2)}`} 
                  value={townName} 
                />
              ))}
            </Picker>
          </View>
          
          {/* FEATURE 1B: Detailed Address Input (Street/Landmark) */}
          <Text style={{
            fontSize: 14,
            fontWeight: '600',
            color: colors.text,
            marginBottom: 8,
          }}>
            Street Name or Landmark
          </Text>
          <TextInput
            style={[commonStyles.input, { 
              minHeight: 80,
              textAlignVertical: 'top',
              paddingTop: 12,
            }]}
            placeholder="e.g., 123 Main Street, near Pick n Pay"
            value={detailedAddress}
            onChangeText={setDetailedAddress}
            multiline
            numberOfLines={3}
            placeholderTextColor={colors.textLight}
          />
          <Text style={{
            fontSize: 12,
            color: colors.textLight,
            marginTop: -8,
            marginBottom: 16,
            fontStyle: 'italic',
          }}>
            This helps the driver find you easily
          </Text>
          
          {/* Payment Method Selection */}
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
            borderWidth: 1,
            borderColor: colors.primary + '20',
          }}>
            <Picker
              selectedValue={paymentMethod}
              onValueChange={setPaymentMethod}
              style={{ color: colors.text }}
            >
              <Picker.Item label="💵 Cash" value="Cash" />
              <Picker.Item label="💳 EFT" value="EFT" />
            </Picker>
          </View>
        </View>

        {/* FEATURE 2: PROMOTION CODE INTEGRATION (AI-Ready Placeholder) */}
        <View style={[commonStyles.card, { marginBottom: 20 }]}>
          <Text style={{
            fontSize: 18,
            fontWeight: '700',
            color: colors.text,
            marginBottom: 8,
          }}>
            🎁 Promotion Code
          </Text>
          <Text style={{
            fontSize: 13,
            color: colors.textLight,
            marginBottom: 16,
          }}>
            Have a promo code? Enter it below to receive your discount
          </Text>
          
          <View style={{ 
            flexDirection: 'row', 
            alignItems: 'center',
            gap: 12,
          }}>
            <TextInput
              style={[commonStyles.input, { 
                flex: 1,
                marginBottom: 0,
                textTransform: 'uppercase',
              }]}
              placeholder="Enter promo code"
              value={promoCode}
              onChangeText={(text) => setPromoCode(text.toUpperCase())}
              placeholderTextColor={colors.textLight}
              autoCapitalize="characters"
            />
            
            <TouchableOpacity
              style={{
                backgroundColor: promoCode.trim() ? colors.primary : colors.backgroundAlt,
                paddingHorizontal: 24,
                paddingVertical: 14,
                borderRadius: 12,
                minWidth: 100,
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onPress={handleApplyPromoCode}
              disabled={!promoCode.trim()}
            >
              <Text style={{ 
                color: promoCode.trim() ? colors.white : colors.textLight, 
                fontWeight: '700',
                fontSize: 15,
              }}>
                Apply
              </Text>
            </TouchableOpacity>
          </View>
          
          {promoApplied && (
            <View style={{
              marginTop: 12,
              padding: 12,
              backgroundColor: colors.primary + '10',
              borderRadius: 8,
              flexDirection: 'row',
              alignItems: 'center',
            }}>
              <Icon name="checkmark-circle" size={20} color={colors.primary} />
              <Text style={{
                marginLeft: 8,
                color: colors.primary,
                fontWeight: '600',
                fontSize: 14,
              }}>
                Promo code applied! You saved R{promoDiscount.toFixed(2)}
              </Text>
            </View>
          )}
        </View>

        {/* Checkout Button */}
        <TouchableOpacity
          style={[buttonStyles.primary, { 
            opacity: loading ? 0.6 : 1,
            marginBottom: 20,
          }]}
          onPress={handleCheckout}
          disabled={loading}
        >
          <Icon 
            name="logo-whatsapp" 
            size={20} 
            color={colors.white} 
            style={{ marginRight: 8 }} 
          />
          <Text style={{ color: colors.white, fontWeight: '700', fontSize: 16 }}>
            {loading ? 'Processing...' : `Checkout via WhatsApp - R${total.toFixed(2)}`}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
