
import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { FOOD_ORDER_CHECKOUT_NUMBER, generateWhatsAppUrl, openWhatsAppWithFallback } from '../constants/whatsapp';
import { useCart } from '../contexts/CartContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from '../components/Icon';
import LuciaAIIcon from '../components/LuciaAI/LuciaAIIcon';
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
  const [detailedAddress, setDetailedAddress] = useState('');
  const [town, setTown] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [promoCode, setPromoCode] = useState('');
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [promoApplied, setPromoApplied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [restaurantNames, setRestaurantNames] = useState<{ [key: string]: string }>({});

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

  const getDeliveryFee = useCallback(() => {
    if (!town) return 0;
    
    const baseFee = TOWN_DELIVERY_FEES[town as keyof typeof TOWN_DELIVERY_FEES] || 25;
    const restaurantCount = getRestaurantCount();
    
    const additionalFee = Math.max(0, restaurantCount - 1) * 10;
    
    return baseFee + additionalFee;
  }, [town, getRestaurantCount]);

  const handleApplyPromoCode = () => {
    if (!promoCode.trim()) {
      Alert.alert('Invalid Code', 'Please enter a promotion code');
      return;
    }

    if (!town) {
      Alert.alert('Select Delivery Area', 'Please select your delivery area first to apply the promo code');
      return;
    }

    if (promoCode.toUpperCase() === 'LUCIA15') {
      const deliveryFee = getDeliveryFee();
      
      const discount = deliveryFee * 0.05;
      
      setPromoDiscount(discount);
      setPromoApplied(true);
      
      Alert.alert(
        'Promo Code Applied! 🎉',
        `You saved R${discount.toFixed(2)} (5% off delivery fee)`,
        [{ text: 'Great!' }]
      );
      
      console.log('LUCIA15 promo code applied:', {
        deliveryFee,
        discount,
        discountPercentage: '5%'
      });
    } else {
      Alert.alert(
        'Invalid Promo Code',
        'The promo code you entered is not valid. Please check and try again.',
        [{ text: 'OK' }]
      );
      
      setPromoDiscount(0);
      setPromoApplied(false);
    }
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

    if (!town) {
      Alert.alert('Select Delivery Area', 'Please select your delivery area to continue');
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
      const subtotal = getCartTotal();
      const deliveryFee = getDeliveryFee();
      const total = subtotal + deliveryFee - promoDiscount;

      const groupedCart = getCartByRestaurant();

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

      let message = `🍽️ *New Order from LuciaFood Express*

👤 *Customer Details:*
Name: ${customerName}
Phone: ${phone}
Address: ${detailedAddress}
Town: ${town}

`;

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
Promo Discount (LUCIA15): -R${promoDiscount.toFixed(2)}`;
      }

      message += `
*Total to Pay: R${total.toFixed(2)}*

💳 *Payment Method:* ${paymentMethod}

Please confirm this order and provide estimated delivery time.`;

      console.log('Opening WhatsApp with number:', FOOD_ORDER_CHECKOUT_NUMBER);
      console.log('WhatsApp message preview:', message);
      
      const success = await openWhatsAppWithFallback(FOOD_ORDER_CHECKOUT_NUMBER, message);

      if (success) {
        clearCart();
        Alert.alert(
          'Order Sent!',
          'Your order has been sent via WhatsApp to 0743844253. You will receive confirmation shortly.',
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
        <View style={{ 
          position: 'absolute', 
          top: 16, 
          right: 16, 
          zIndex: 10 
        }}>
          <LuciaAIIcon />
        </View>
        
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
      <View style={{ 
        position: 'absolute', 
        top: 16, 
        right: 16, 
        zIndex: 10 
      }}>
        <LuciaAIIcon />
      </View>
      
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20 }}>
        <Text style={[commonStyles.title, { marginBottom: 20 }]}>
          Your Cart
        </Text>

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

        <View style={[commonStyles.card, { marginBottom: 20 }]}>
          <Text style={{
            fontSize: 20,
            fontWeight: '700',
            color: colors.text,
            marginBottom: 20,
          }}>
            💰 Order Summary
          </Text>
          
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
              {town ? (
                <>
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
                </>
              ) : (
                <Text style={{ 
                  fontSize: 13,
                  color: colors.textLight,
                  fontStyle: 'italic',
                }}>
                  Select delivery area below
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
          
          <Text style={{
            fontSize: 14,
            fontWeight: '600',
            color: colors.text,
            marginBottom: 8,
            marginTop: 8,
          }}>
            Delivery Area *
          </Text>
          <View style={{
            backgroundColor: colors.backgroundAlt,
            borderRadius: 12,
            marginBottom: 16,
            borderWidth: 1,
            borderColor: town ? colors.primary + '20' : colors.textLight + '40',
          }}>
            <Picker
              selectedValue={town}
              onValueChange={setTown}
              style={{ color: town ? colors.text : colors.textLight }}
            >
              <Picker.Item 
                label="Select Delivery Area..." 
                value="" 
                color={colors.textLight}
              />
              {Object.entries(TOWN_DELIVERY_FEES).map(([townName, fee]) => (
                <Picker.Item 
                  key={townName}
                  label={`${townName} - R${fee.toFixed(2)}`} 
                  value={townName} 
                />
              ))}
            </Picker>
          </View>
          
          <Text style={{
            fontSize: 14,
            fontWeight: '600',
            color: colors.text,
            marginBottom: 8,
          }}>
            Street Name or Landmark *
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
            Have a promo code? Enter it below to receive 5% off your delivery fee
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
              editable={!promoApplied}
            />
            
            <TouchableOpacity
              style={{
                backgroundColor: promoCode.trim() && !promoApplied ? colors.primary : colors.backgroundAlt,
                paddingHorizontal: 24,
                paddingVertical: 14,
                borderRadius: 12,
                minWidth: 100,
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onPress={handleApplyPromoCode}
              disabled={!promoCode.trim() || promoApplied}
            >
              <Text style={{ 
                color: promoCode.trim() && !promoApplied ? colors.white : colors.textLight, 
                fontWeight: '700',
                fontSize: 15,
              }}>
                {promoApplied ? 'Applied' : 'Apply'}
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
