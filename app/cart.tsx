
import React, { useState, useEffect } from 'react';
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

  useEffect(() => {
    loadUserProfile();
  }, [user]);

  const loadUserProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (data) {
        setCustomerName(data.full_name || '');
        setCustomerPhone(data.phone_number || '');
        setAddress(data.address || '');
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const subtotal = getCartTotal();
  const deliveryFee = selectedTown ? deliveryFees[selectedTown as keyof typeof deliveryFees] || 0 : 0;
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

    try {
      setLoading(true);

      // Get restaurant name from first item
      const firstItem = cart[0];
      const { data: restaurantData } = await supabase
        .from('restaurants')
        .select('name')
        .eq('id', firstItem.restaurant_id)
        .single();

      const restaurantName = restaurantData?.name || 'Unknown Restaurant';

      // Create order details message
      const itemsList = cart.map(item => 
        `${item.quantity} x ${item.name} - R${(item.price * item.quantity).toFixed(2)}`
      ).join('\n');

      const orderDetails = `LuciaFood Express Order 🚀

Name: ${customerName}
Phone: ${customerPhone}
Address: ${address}, ${selectedTown}

Restaurant: ${restaurantName}

Items:
${itemsList}

Subtotal: R${subtotal.toFixed(2)}
Delivery: R${deliveryFee.toFixed(2)}
Total: R${total.toFixed(2)}

Payment Method: ${paymentMethod}`;

      // Save order to database
      const { error: orderError } = await supabase
        .from('orders')
        .insert({
          customer_name: customerName,
          phone: customerPhone,
          address: `${address}, ${selectedTown}`,
          town: selectedTown,
          restaurant_id: firstItem.restaurant_id,
          items: cart,
          subtotal: subtotal,
          delivery_fee: deliveryFee,
          total: total,
          payment_method: paymentMethod,
          status: 'pending',
        });

      if (orderError) {
        console.error('Error saving order:', orderError);
      }

      // Open WhatsApp
      const encodedMessage = encodeURIComponent(orderDetails);
      const whatsappUrl = `https://wa.me/27822116064?text=${encodedMessage}`;
      
      const supported = await Linking.canOpenURL(whatsappUrl);
      if (supported) {
        await Linking.openURL(whatsappUrl);
        clearCart();
        Alert.alert(
          'Order Sent!',
          'Your order has been sent via WhatsApp. You will receive a confirmation shortly.',
          [{ text: 'OK', onPress: () => router.push('/(tabs)/') }]
        );
      } else {
        Alert.alert('Error', 'WhatsApp is not installed on this device');
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
        {/* Cart Items */}
        <View style={{ padding: 20 }}>
          <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: 16 }}>
            Order Summary
          </Text>
          
          {cart.map((item) => (
            <View key={`${item.id}-${item.restaurant_id}`} style={[commonStyles.card, { marginBottom: 12 }]}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text }}>
                    {item.name}
                  </Text>
                  <Text style={{ fontSize: 14, color: colors.textLight, marginTop: 4 }}>
                    R{item.price.toFixed(2)} x {item.quantity}
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text, marginRight: 12 }}>
                    R{(item.price * item.quantity).toFixed(2)}
                  </Text>
                  <TouchableOpacity onPress={() => removeFromCart(item.id)}>
                    <Icon name="trash" size={20} color={colors.error} />
                  </TouchableOpacity>
                </View>
              </View>
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
              <Text style={{ fontSize: 16, color: colors.text }}>Delivery Fee:</Text>
              <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text }}>
                R{deliveryFee.toFixed(2)}
              </Text>
            </View>
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
