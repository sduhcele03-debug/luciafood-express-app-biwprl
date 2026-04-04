
import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useCart, DELIVERY_ZONES, RESTAURANT_DELIVERY_FEES } from '../contexts/CartContext';
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
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useAuth } from '../contexts/AuthContext';

export default function CartScreen() {
  const { user } = useAuth();
  const {
    cart,
    removeItem,
    updateQuantity,
    clearCart,
    clearRestaurant,
    setDeliveryZone,
    setUserDetails,
    getSubtotal,
    getTotalDelivery,
    getGrandTotal,
  } = useCart();

  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [promoCode, setPromoCode] = useState('');
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [promoApplied, setPromoApplied] = useState(false);

  // Local mirrors of userDetails so TextInputs feel instant
  const [localName, setLocalName] = useState(cart.userDetails.name);
  const [localPhone, setLocalPhone] = useState(cart.userDetails.phone);
  const [localAddress, setLocalAddress] = useState(cart.userDetails.address);

  // Sync local state when cart.userDetails changes externally
  useEffect(() => {
    setLocalName(cart.userDetails.name);
    setLocalPhone(cart.userDetails.phone);
    setLocalAddress(cart.userDetails.address);
  }, [cart.userDetails.name, cart.userDetails.phone, cart.userDetails.address]);

  // Load user profile from Supabase on mount
  const loadUserProfile = useCallback(async () => {
    if (!user) return;
    try {
      console.log('[CartScreen] Loading user profile...');
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, phone_number, address')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.log('[CartScreen] No existing profile found');
        return;
      }

      if (data) {
        console.log('[CartScreen] Loaded user profile');
        const name = data.full_name || '';
        const phone = data.phone_number || '';
        const address = data.address || '';
        setLocalName(name);
        setLocalPhone(phone);
        setLocalAddress(address);
        setUserDetails({ name, phone, address });
      }
    } catch (err) {
      console.error('[CartScreen] Error loading user profile:', err);
    }
  }, [user, setUserDetails]);

  useEffect(() => {
    loadUserProfile().catch(err => {
      console.error('[CartScreen] Failed to load user profile:', err);
    });
  }, [loadUserProfile]);

  const handleNameChange = useCallback((text: string) => {
    setLocalName(text);
    setUserDetails({ name: text, phone: localPhone, address: localAddress });
  }, [localPhone, localAddress, setUserDetails]);

  const handlePhoneChange = useCallback((text: string) => {
    setLocalPhone(text);
    setUserDetails({ name: localName, phone: text, address: localAddress });
  }, [localName, localAddress, setUserDetails]);

  const handleAddressChange = useCallback((text: string) => {
    setLocalAddress(text);
    setUserDetails({ name: localName, phone: localPhone, address: text });
  }, [localName, localPhone, setUserDetails]);

  const handleZoneChange = useCallback((zone: string) => {
    console.log('[CartScreen] Zone changed to:', zone);
    setDeliveryZone(zone);
    // Reset promo when zone changes since delivery fee changes
    if (promoApplied) {
      setPromoDiscount(0);
      setPromoApplied(false);
      setPromoCode('');
    }
  }, [setDeliveryZone, promoApplied]);

  const handleApplyPromoCode = useCallback(() => {
    console.log('[CartScreen] Apply promo code pressed:', promoCode);
    if (!promoCode.trim()) {
      Alert.alert('Invalid Code', 'Please enter a promotion code');
      return;
    }
    if (!cart.selectedZone) {
      Alert.alert('Select Delivery Area', 'Please select your delivery area first to apply the promo code');
      return;
    }
    if (promoCode.toUpperCase() === 'LUCIA15') {
      const deliveryFee = getTotalDelivery();
      const discount = deliveryFee * 0.05;
      setPromoDiscount(discount);
      setPromoApplied(true);
      Alert.alert(
        'Promo Code Applied!',
        `You saved R${Number(discount).toFixed(2)} (5% off delivery fee)`,
        [{ text: 'Great!' }]
      );
      console.log('[CartScreen] LUCIA15 promo applied, discount:', discount);
    } else {
      Alert.alert('Invalid Promo Code', 'The promo code you entered is not valid. Please check and try again.');
      setPromoDiscount(0);
      setPromoApplied(false);
    }
  }, [promoCode, cart.selectedZone, getTotalDelivery]);

  const handleCheckout = useCallback(() => {
    console.log('[CartScreen] Checkout button pressed');

    if (cart.restaurants.length === 0) {
      Alert.alert('Empty Cart', 'Please add items to your cart before checkout');
      return;
    }
    if (!cart.selectedZone) {
      Alert.alert('Missing Delivery Zone', 'Please select your delivery area to continue');
      return;
    }
    if (!localName.trim()) {
      Alert.alert('Missing Information', 'Please enter your full name');
      return;
    }
    if (!localPhone.trim()) {
      Alert.alert('Missing Information', 'Please enter your phone number');
      return;
    }
    if (!localAddress.trim()) {
      Alert.alert('Missing Information', 'Please enter your street name or landmark');
      return;
    }

    console.log('[CartScreen] Validation passed, navigating to checkout');
    router.push('/checkout');
  }, [cart, localName, localPhone, localAddress]);

  // ── Empty state ─────────────────────────────────────────────────────────────

  if (cart.restaurants.length === 0) {
    return (
      <SafeAreaView style={[commonStyles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <View style={{ position: 'absolute', top: 16, right: 16, zIndex: 10 }}>
          <LuciaAIIcon />
        </View>
        <Icon name="basket" size={80} color={colors.textLight} />
        <Text style={{ fontSize: 24, fontWeight: '700', color: colors.text, marginTop: 20, marginBottom: 8 }}>
          Your cart is empty
        </Text>
        <Text style={{ fontSize: 16, color: colors.textLight, textAlign: 'center', marginBottom: 32 }}>
          Add some delicious items from our restaurants
        </Text>
        <TouchableOpacity
          style={buttonStyles.primary}
          onPress={() => {
            console.log('[CartScreen] Browse Restaurants pressed');
            router.push('/(tabs)/restaurants');
          }}
        >
          <Text style={{ color: colors.white, fontWeight: '600', fontSize: 16 }}>
            Browse Restaurants
          </Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // ── Derived values ──────────────────────────────────────────────────────────

  const subtotal = getSubtotal();
  const totalDelivery = getTotalDelivery();
  const grandTotal = getGrandTotal() - promoDiscount;
  const subtotalDisplay = Number(subtotal).toFixed(2);
  const totalDeliveryDisplay = Number(totalDelivery).toFixed(2);
  const grandTotalDisplay = Number(grandTotal).toFixed(2);
  const checkoutLabel = `Review Order - R${grandTotalDisplay}`;

  return (
    <SafeAreaView style={[commonStyles.container, { paddingBottom: 80 }]}>
      <View style={{ position: 'absolute', top: 16, right: 16, zIndex: 10 }}>
        <LuciaAIIcon />
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20 }}>
        <Text style={[commonStyles.title, { marginBottom: 20 }]}>Your Cart</Text>

        {/* ── Delivery Zone Selector ─────────────────────────────────────── */}
        <View style={[commonStyles.card, { marginBottom: 20 }]}>
          <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: 12 }}>
            📍 Delivery Zone
          </Text>
          <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 8 }}>
            Select your delivery area *
          </Text>
          <View style={{
            backgroundColor: colors.backgroundAlt,
            borderRadius: 12,
            marginBottom: 8,
            borderWidth: 1,
            borderColor: cart.selectedZone ? colors.primary + '40' : colors.textLight + '40',
          }}>
            <Picker
              selectedValue={cart.selectedZone}
              onValueChange={handleZoneChange}
              style={{ color: cart.selectedZone ? colors.text : colors.textLight }}
            >
              <Picker.Item label="Select delivery zone..." value="" color={colors.textLight} />
              {DELIVERY_ZONES.map(zone => {
                const isBuyies = cart.restaurants.length > 0 &&
                  (cart.restaurants[0].restaurantName.toLowerCase().includes('buyie') ||
                   cart.restaurants[0].restaurantName.toLowerCase().includes('breeze'));
                const feeTable = isBuyies
                  ? RESTAURANT_DELIVERY_FEES.BUYIES_BASE
                  : RESTAURANT_DELIVERY_FEES.DEFAULT_TOWN_BASE;
                const fee = feeTable[zone];
                const feeLabel = fee !== undefined ? ` - R${fee}` : '';
                return (
                  <Picker.Item
                    key={zone}
                    label={`${zone}${feeLabel}`}
                    value={zone}
                  />
                );
              })}
            </Picker>
          </View>
          {!cart.selectedZone && (
            <Text style={{ fontSize: 12, color: colors.error, fontStyle: 'italic' }}>
              Please select a zone to see delivery fees
            </Text>
          )}
        </View>

        {/* ── User Details ───────────────────────────────────────────────── */}
        <View style={[commonStyles.card, { marginBottom: 20 }]}>
          <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: 16 }}>
            👤 Your Details
          </Text>
          <TextInput
            style={commonStyles.input}
            placeholder="Full Name *"
            value={localName}
            onChangeText={handleNameChange}
            placeholderTextColor={colors.textLight}
          />
          <TextInput
            style={commonStyles.input}
            placeholder="Phone Number *"
            value={localPhone}
            onChangeText={handlePhoneChange}
            keyboardType="phone-pad"
            placeholderTextColor={colors.textLight}
          />
          <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 8 }}>
            Street Name or Landmark *
          </Text>
          <TextInput
            style={[commonStyles.input, { minHeight: 80, textAlignVertical: 'top', paddingTop: 12 }]}
            placeholder="e.g., 123 Main Street, near Pick n Pay"
            value={localAddress}
            onChangeText={handleAddressChange}
            multiline
            numberOfLines={3}
            placeholderTextColor={colors.textLight}
          />
          <Text style={{ fontSize: 12, color: colors.textLight, marginTop: -8, marginBottom: 8, fontStyle: 'italic' }}>
            This helps the driver find you easily
          </Text>
        </View>

        {/* ── Cart Items Grouped by Restaurant ──────────────────────────── */}
        {cart.restaurants.map(restaurant => {
          const restaurantSubtotal = restaurant.items.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
          );
          const restaurantSubtotalDisplay = Number(restaurantSubtotal).toFixed(2);
          const deliveryFeeDisplay = Number(restaurant.deliveryFee).toFixed(2);

          return (
            <View key={restaurant.restaurantId} style={[commonStyles.card, { marginBottom: 20 }]}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text, flex: 1 }}>
                  🏪 {restaurant.restaurantName}
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    console.log('[CartScreen] Remove restaurant pressed:', restaurant.restaurantName);
                    Alert.alert(
                      'Remove Restaurant',
                      `Remove all items from ${restaurant.restaurantName}?`,
                      [
                        { text: 'Cancel', style: 'cancel' },
                        {
                          text: 'Remove',
                          style: 'destructive',
                          onPress: () => clearRestaurant(restaurant.restaurantId),
                        },
                      ]
                    );
                  }}
                  style={{
                    backgroundColor: colors.error + '15',
                    borderRadius: 8,
                    paddingHorizontal: 10,
                    paddingVertical: 6,
                    marginLeft: 8,
                  }}
                >
                  <Text style={{ color: colors.error, fontWeight: '600', fontSize: 13 }}>Remove</Text>
                </TouchableOpacity>
              </View>

              {restaurant.items.map(item => {
                const itemTotal = item.price * item.quantity;
                const itemTotalDisplay = Number(itemTotal).toFixed(2);
                const itemPriceDisplay = Number(item.price).toFixed(2);

                return (
                  <View
                    key={item.id}
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      paddingVertical: 12,
                      borderBottomWidth: 1,
                      borderBottomColor: colors.backgroundAlt,
                    }}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 4 }}>
                        {item.name}
                      </Text>
                      <Text style={{ fontSize: 14, color: colors.primary, fontWeight: '600' }}>
                        R{itemPriceDisplay} each
                      </Text>
                    </View>

                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <TouchableOpacity
                        onPress={() => {
                          console.log('[CartScreen] Decrease quantity:', item.name);
                          if (item.quantity <= 1) {
                            removeItem(restaurant.restaurantId, item.id);
                          } else {
                            updateQuantity(restaurant.restaurantId, item.id, item.quantity - 1);
                          }
                        }}
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

                      <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text, minWidth: 24, textAlign: 'center', marginRight: 12 }}>
                        {item.quantity}
                      </Text>

                      <TouchableOpacity
                        onPress={() => {
                          console.log('[CartScreen] Increase quantity:', item.name);
                          updateQuantity(restaurant.restaurantId, item.id, item.quantity + 1);
                        }}
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

                      <Text style={{ fontSize: 16, fontWeight: '700', color: colors.primary, minWidth: 60, textAlign: 'right' }}>
                        R{itemTotalDisplay}
                      </Text>
                    </View>
                  </View>
                );
              })}

              <View style={{ paddingTop: 12, marginTop: 4 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                  <Text style={{ fontSize: 14, color: colors.textLight }}>Restaurant subtotal</Text>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text }}>
                    R{restaurantSubtotalDisplay}
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ fontSize: 14, color: colors.textLight }}>
                    Delivery{cart.selectedZone ? ` to ${cart.selectedZone}` : ''}
                  </Text>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: colors.primary }}>
                    R{deliveryFeeDisplay}
                  </Text>
                </View>
              </View>
            </View>
          );
        })}

        {/* ── Order Summary ──────────────────────────────────────────────── */}
        <View style={[commonStyles.card, { marginBottom: 20 }]}>
          <Text style={{ fontSize: 20, fontWeight: '700', color: colors.text, marginBottom: 20 }}>
            💰 Order Summary
          </Text>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: colors.backgroundAlt + '40' }}>
            <Text style={{ fontSize: 16, color: colors.text, fontWeight: '500' }}>Food subtotal</Text>
            <Text style={{ fontSize: 16, color: colors.text, fontWeight: '600' }}>R{subtotalDisplay}</Text>
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: colors.backgroundAlt + '40' }}>
            <Text style={{ fontSize: 16, color: colors.text, fontWeight: '500' }}>Total delivery</Text>
            <Text style={{ fontSize: 16, color: colors.text, fontWeight: '600' }}>R{totalDeliveryDisplay}</Text>
          </View>

          {promoDiscount > 0 && (
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: colors.backgroundAlt + '40' }}>
              <Text style={{ fontSize: 16, color: colors.primary, fontWeight: '500' }}>Promo Discount</Text>
              <Text style={{ fontSize: 16, color: colors.primary, fontWeight: '600' }}>
                -R{Number(promoDiscount).toFixed(2)}
              </Text>
            </View>
          )}

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingTop: 16, paddingBottom: 8, backgroundColor: colors.primary + '08', marginHorizontal: -16, paddingHorizontal: 16, borderRadius: 12 }}>
            <Text style={{ fontSize: 20, fontWeight: '700', color: colors.text }}>Total</Text>
            <Text style={{ fontSize: 22, fontWeight: '700', color: colors.primary }}>R{grandTotalDisplay}</Text>
          </View>
        </View>

        {/* ── Payment Method ─────────────────────────────────────────────── */}
        <View style={[commonStyles.card, { marginBottom: 20 }]}>
          <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: 12 }}>
            💳 Payment Method
          </Text>
          <View style={{ backgroundColor: colors.backgroundAlt, borderRadius: 12, borderWidth: 1, borderColor: colors.primary + '20' }}>
            <Picker
              selectedValue={paymentMethod}
              onValueChange={(val) => {
                console.log('[CartScreen] Payment method changed:', val);
                setPaymentMethod(val);
              }}
              style={{ color: colors.text }}
            >
              <Picker.Item label="💵 Cash" value="Cash" />
              <Picker.Item label="💳 EFT" value="EFT" />
            </Picker>
          </View>
        </View>

        {/* ── Promo Code ─────────────────────────────────────────────────── */}
        <View style={[commonStyles.card, { marginBottom: 20 }]}>
          <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: 8 }}>
            🎁 Promotion Code
          </Text>
          <Text style={{ fontSize: 13, color: colors.textLight, marginBottom: 16 }}>
            Have a promo code? Enter it below to receive 5% off your delivery fee
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <TextInput
              style={[commonStyles.input, { flex: 1, marginBottom: 0, textTransform: 'uppercase' }]}
              placeholder="Enter promo code"
              value={promoCode}
              onChangeText={text => setPromoCode(text.toUpperCase())}
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
              <Text style={{ color: promoCode.trim() && !promoApplied ? colors.white : colors.textLight, fontWeight: '700', fontSize: 15 }}>
                {promoApplied ? 'Applied' : 'Apply'}
              </Text>
            </TouchableOpacity>
          </View>
          {promoApplied && (
            <View style={{ marginTop: 12, padding: 12, backgroundColor: colors.primary + '10', borderRadius: 8, flexDirection: 'row', alignItems: 'center' }}>
              <Icon name="checkmark-circle" size={20} color={colors.primary} />
              <Text style={{ marginLeft: 8, color: colors.primary, fontWeight: '600', fontSize: 14 }}>
                Promo code applied! You saved R{Number(promoDiscount).toFixed(2)}
              </Text>
            </View>
          )}
        </View>

        {/* ── Checkout Button ────────────────────────────────────────────── */}
        <TouchableOpacity
          style={[buttonStyles.primary, { marginBottom: 20 }]}
          onPress={handleCheckout}
        >
          <Text style={{ color: colors.white, fontWeight: '700', fontSize: 16 }}>
            {checkoutLabel}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
