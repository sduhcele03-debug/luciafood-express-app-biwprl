
import React, { useState, useEffect, useCallback } from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { supabase } from '../lib/supabase';
import { commonStyles, colors, buttonStyles } from '../styles/commonStyles';
import Icon from '../components/Icon';
import { FOOD_ORDER_CHECKOUT_NUMBER, generateWhatsAppUrl, openWhatsAppWithFallback } from '../constants/whatsapp';

const deliveryFees = {
  'Nordale': 30,
  'KwaMsane': 30,
  'Nkodibe': 30,
  'Mtubatuba Town': 25,
  'Riverview': 25,
  'Dukuduku': 55,
  'St Lucia': 65,
  'Mzingazi': 45,
  'Meerensee': 40,
  'Esikhawini': 35,
  'Richards Bay': 30,
  'Brackenham': 45,
  'Alton': 45,
};

export default function CartScreen() {
  const { user } = useAuth();
  const { cart, removeFromCart, getCartTotal, clearCart } = useCart();
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [address, setAddress] = useState('');
  const [selectedTown, setSelectedTown] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [loading, setLoading] = useState(false);
  const [restaurantsByOrder, setRestaurantsByOrder] = useState<{[key: string]: any}>({});

  useEffect(() => {
    loadUserProfile();
    groupCartByRestaurant();
  }, [loadUserProfile, groupCartByRestaurant]);

  const loadUserProfile = useCallback(async () => {
    if (!user) return;

    try {
      console.log('Loading user profile for cart...');
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (data) {
        console.log('Profile loaded successfully');
        setCustomerName(data.full_name || '');
        setCustomerPhone(data.phone_number || '');
        setAddress(data.address || '');
      } else if (error) {
        console.log('Profile not found, using user metadata');
        // Fallback to user metadata if profile doesn't exist
        setCustomerName(user.user_metadata?.full_name || '');
        setCustomerPhone(user.user_metadata?.phone || '');
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  }, [user]);

  const groupCartByRestaurant = useCallback(async () => {
    if (cart.length === 0) return;

    try {
      console.log('Grouping cart items by restaurant...');
      const restaurantIds = [...new Set(cart.map(item => item.restaurant_id))];
      
      const { data: restaurants, error } = await supabase
        .from('restaurants')
        .select('id, name, min_order, delivery_from')
        .in('id', restaurantIds);

      if (error) {
        console.error('Error loading restaurant details:', error);
        return;
      }

      const grouped: {[key: string]: any} = {};
      
      restaurants?.forEach(restaurant => {
        const restaurantItems = cart.filter(item => item.restaurant_id === restaurant.id);
        const restaurantSubtotal = restaurantItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        grouped[restaurant.id] = {
          restaurant,
          items: restaurantItems,
          subtotal: restaurantSubtotal,
        };
      });

      console.log(`Grouped cart into ${Object.keys(grouped).length} restaurant orders`);
      setRestaurantsByOrder(grouped);
    } catch (error) {
      console.error('Error grouping cart by restaurant:', error);
    }
  }, [cart]);

  const subtotal = getCartTotal();
  const restaurantCount = Object.keys(restaurantsByOrder).length;
  const baseDeliveryFee = selectedTown ? deliveryFees[selectedTown as keyof typeof deliveryFees] || 0 : 0;
  
  // Multi-restaurant fee: base fee + R10 for each additional restaurant
  const deliveryFee = restaurantCount > 1 ? baseDeliveryFee + ((restaurantCount - 1) * 10) : baseDeliveryFee;
  const total = subtotal + deliveryFee;

  const handleCheckout = async () => {
    if (!customerName.trim() || !customerPhone.trim() || !address.trim() || !selectedTown) {
      Alert.alert('Missing Information', 'Please fill in all required fields');
      return;
    }

    if (cart.length === 0) {
      Alert.alert('Empty Cart', 'Please add items to your cart before checkout');
      return;
    }

    // Check minimum order requirements for each restaurant
    const failedMinOrders: string[] = [];
    Object.values(restaurantsByOrder).forEach((order: any) => {
      if (order.subtotal < order.restaurant.min_order) {
        failedMinOrders.push(`${order.restaurant.name} (min: R${order.restaurant.min_order}, current: R${order.subtotal.toFixed(2)})`);
      }
    });

    if (failedMinOrders.length > 0) {
      Alert.alert(
        'Minimum Order Not Met',
        `The following restaurants have minimum order requirements:\n\n${failedMinOrders.join('\n')}`
      );
      return;
    }

    try {
      setLoading(true);
      console.log('Processing checkout for multi-restaurant order...');

      // Create order details message for multi-restaurant orders
      let orderDetails = `LuciaFood Express Order 🚀

Name: ${customerName}
Phone: ${customerPhone}
Address: ${address}, ${selectedTown}

`;

      if (restaurantCount > 1) {
        orderDetails += `📍 MULTI-RESTAURANT ORDER (${restaurantCount} restaurants)\n\n`;
        
        Object.values(restaurantsByOrder).forEach((order: any, index) => {
          orderDetails += `🏪 Restaurant ${index + 1}: ${order.restaurant.name}\n`;
          order.items.forEach((item: any) => {
            orderDetails += `  ${item.quantity} x ${item.name} - R${(item.price * item.quantity).toFixed(2)}\n`;
          });
          orderDetails += `  Subtotal: R${order.subtotal.toFixed(2)}\n\n`;
        });
      } else {
        const singleOrder = Object.values(restaurantsByOrder)[0] as any;
        orderDetails += `Restaurant: ${singleOrder.restaurant.name}\n\nItems:\n`;
        singleOrder.items.forEach((item: any) => {
          orderDetails += `${item.quantity} x ${item.name} - R${(item.price * item.quantity).toFixed(2)}\n`;
        });
        orderDetails += '\n';
      }

      orderDetails += `Subtotal: R${subtotal.toFixed(2)}
Delivery: R${deliveryFee.toFixed(2)}${restaurantCount > 1 ? ` (Base: R${baseDeliveryFee} + Multi-restaurant: R${(restaurantCount - 1) * 10})` : ''}
Total: R${total.toFixed(2)}

Payment Method: ${paymentMethod}`;

      // Save separate orders for each restaurant
      const orderPromises = Object.values(restaurantsByOrder).map(async (order: any) => {
        return supabase.from('orders').insert({
          customer_name: customerName,
          phone: customerPhone,
          address: `${address}, ${selectedTown}`,
          town: selectedTown,
          restaurant_id: order.restaurant.id,
          items: order.items,
          subtotal: order.subtotal,
          delivery_fee: restaurantCount > 1 ? Math.round(deliveryFee / restaurantCount) : deliveryFee,
          total: order.subtotal + (restaurantCount > 1 ? Math.round(deliveryFee / restaurantCount) : deliveryFee),
          payment_method: paymentMethod,
          status: 'pending',
        });
      });

      const orderResults = await Promise.all(orderPromises);
      const orderErrors = orderResults.filter(result => result.error);
      
      if (orderErrors.length > 0) {
        console.error('Error saving some orders:', orderErrors);
      } else {
        console.log(`Successfully saved ${orderResults.length} orders`);
      }

      // Open WhatsApp with enhanced fallback handling
      console.log('Attempting to send order via WhatsApp...');
      const whatsappOpened = await openWhatsAppWithFallback(FOOD_ORDER_CHECKOUT_NUMBER, orderDetails);
      
      if (whatsappOpened) {
        console.log('WhatsApp opened successfully, clearing cart...');
        clearCart();
        Alert.alert(
          'Order Sent!',
          restaurantCount > 1 
            ? `Your multi-restaurant order from ${restaurantCount} restaurants has been sent via WhatsApp. You will receive a confirmation shortly.`
            : 'Your order has been sent via WhatsApp. You will receive a confirmation shortly.',
          [{ text: 'OK', onPress: () => router.push('/(tabs)/') }]
        );
      } else {
        console.log('WhatsApp could not be opened, but fallback was handled');
        // Don't clear cart if WhatsApp couldn't be opened
        // The fallback function already handles user communication
      }
    } catch (error) {
      console.error('Error during checkout:', error);
      Alert.alert('Error', 'Failed to process order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <SafeAreaView style={commonStyles.container}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <Icon name="basket" size={80} color={colors.textLight} />
          <Text style={[commonStyles.title, { marginTop: 20, marginBottom: 8 }]}>
            Your cart is empty
          </Text>
          <Text style={[commonStyles.subtitle, { marginBottom: 32 }]}>
            Add some delicious items to get started
          </Text>
          <TouchableOpacity
            style={buttonStyles.primary}
            onPress={() => router.push('/(tabs)/restaurants')}
          >
            <Text style={{ color: colors.white, fontWeight: '700', fontSize: 16 }}>
              Browse Restaurants
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={commonStyles.container}>
      <View style={{ flexDirection: 'row', alignItems: 'center', padding: 20, paddingBottom: 10 }}>
        <TouchableOpacity onPress={() => router.back()}>
          <Icon name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[commonStyles.title, { marginLeft: 16, marginBottom: 0 }]}>
          Cart & Checkout
        </Text>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 20 }}>
        {/* Cart Items - Grouped by Restaurant */}
        <View style={{ padding: 20 }}>
          <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: 16 }}>
            Order Summary
          </Text>
          
          {restaurantCount > 1 && (
            <View style={[commonStyles.card, { backgroundColor: colors.backgroundAlt, marginBottom: 16 }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                <Icon name="restaurant" size={20} color={colors.primary} />
                <Text style={{ fontSize: 16, fontWeight: '700', color: colors.primary, marginLeft: 8 }}>
                  Multi-Restaurant Order
                </Text>
              </View>
              <Text style={{ fontSize: 14, color: colors.textLight }}>
                You're ordering from {restaurantCount} different restaurants. Additional R10 delivery fee applies for each extra restaurant.
              </Text>
            </View>
          )}
          
          {Object.values(restaurantsByOrder).map((order: any) => (
            <View key={order.restaurant.id} style={[commonStyles.card, { marginBottom: 16 }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: colors.border }}>
                <Icon name="restaurant" size={18} color={colors.primary} />
                <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text, marginLeft: 8, flex: 1 }}>
                  {order.restaurant.name}
                </Text>
                <Text style={{ fontSize: 14, color: colors.textLight }}>
                  Min: R{order.restaurant.min_order}
                </Text>
              </View>
              
              {order.items.map((item: any) => (
                <View key={`${item.id}-${item.restaurant_id}`} style={{ marginBottom: 8 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 15, fontWeight: '600', color: colors.text }}>
                        {item.name}
                      </Text>
                      <Text style={{ fontSize: 13, color: colors.textLight, marginTop: 2 }}>
                        R{item.price.toFixed(2)} x {item.quantity}
                      </Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Text style={{ fontSize: 15, fontWeight: '700', color: colors.text, marginRight: 12 }}>
                        R{(item.price * item.quantity).toFixed(2)}
                      </Text>
                      <TouchableOpacity onPress={() => removeFromCart(item.id)}>
                        <Icon name="trash" size={18} color={colors.error} />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ))}
              
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: colors.border }}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text }}>
                  Restaurant Subtotal:
                </Text>
                <Text style={{ fontSize: 14, fontWeight: '700', color: colors.primary }}>
                  R{order.subtotal.toFixed(2)}
                </Text>
              </View>
              
              {order.subtotal < order.restaurant.min_order && (
                <View style={{ backgroundColor: colors.error + '20', padding: 8, borderRadius: 8, marginTop: 8 }}>
                  <Text style={{ fontSize: 12, color: colors.error, textAlign: 'center' }}>
                    ⚠️ Minimum order of R{order.restaurant.min_order} required
                  </Text>
                </View>
              )}
            </View>
          ))}
        </View>

        {/* Customer Information */}
        <View style={{ padding: 20 }}>
          <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: 16 }}>
            Delivery Information
          </Text>

          <TextInput
            style={commonStyles.input}
            placeholder="Full Name *"
            placeholderTextColor={colors.textLight}
            value={customerName}
            onChangeText={setCustomerName}
          />

          <TextInput
            style={commonStyles.input}
            placeholder="Phone Number *"
            placeholderTextColor={colors.textLight}
            value={customerPhone}
            onChangeText={setCustomerPhone}
            keyboardType="phone-pad"
          />

          <TextInput
            style={commonStyles.input}
            placeholder="Delivery Address *"
            placeholderTextColor={colors.textLight}
            value={address}
            onChangeText={setAddress}
            multiline
            numberOfLines={2}
          />

          <View style={[commonStyles.input, { paddingVertical: 0 }]}>
            <Picker
              selectedValue={selectedTown}
              onValueChange={setSelectedTown}
              style={{ color: colors.text }}
            >
              <Picker.Item label="Select Town *" value="" />
              {Object.keys(deliveryFees).map((town) => (
                <Picker.Item key={town} label={`${town} (R${deliveryFees[town as keyof typeof deliveryFees]})`} value={town} />
              ))}
            </Picker>
          </View>

          <View style={[commonStyles.input, { paddingVertical: 0 }]}>
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

        {/* Order Total */}
        <View style={{ padding: 20 }}>
          <View style={[commonStyles.card, { backgroundColor: colors.backgroundAlt }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
              <Text style={{ fontSize: 16, color: colors.text }}>Subtotal:</Text>
              <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text }}>
                R{subtotal.toFixed(2)}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
              <Text style={{ fontSize: 16, color: colors.text }}>
                Delivery Fee{restaurantCount > 1 ? ` (${restaurantCount} restaurants)` : ''}:
              </Text>
              <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text }}>
                R{deliveryFee.toFixed(2)}
              </Text>
            </View>
            {restaurantCount > 1 && (
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text style={{ fontSize: 14, color: colors.textLight, paddingLeft: 8 }}>
                  • Base fee: R{baseDeliveryFee}
                </Text>
                <Text style={{ fontSize: 14, color: colors.textLight }}>
                  • Multi-restaurant: +R{(restaurantCount - 1) * 10}
                </Text>
              </View>
            )}
            <View style={{ 
              flexDirection: 'row', 
              justifyContent: 'space-between', 
              paddingTop: 8, 
              borderTopWidth: 1, 
              borderTopColor: colors.border 
            }}>
              <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text }}>Total:</Text>
              <Text style={{ fontSize: 18, fontWeight: '700', color: colors.primary }}>
                R{total.toFixed(2)}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={[buttonStyles.primary, { marginTop: 20 }]}
            onPress={handleCheckout}
            disabled={loading}
          >
            <Text style={{ color: colors.white, fontWeight: '700', fontSize: 16 }}>
              {loading ? 'Processing...' : 'Checkout via WhatsApp'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
