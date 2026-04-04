
import React, { useState } from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { useCart } from '../contexts/CartContext';
import { commonStyles, colors, buttonStyles } from '../styles/commonStyles';
import Icon from '../components/Icon';

export default function CheckoutScreen() {
  const {
    cart,
    clearCart,
    getSubtotal,
    getTotalDelivery,
    getGrandTotal,
  } = useCart();

  const { specialNote, paymentMethod } = useLocalSearchParams<{ specialNote?: string; paymentMethod?: string }>();
  const [placing, setPlacing] = useState(false);

  const subtotal = getSubtotal();
  const totalDelivery = getTotalDelivery();
  const grandTotal = getGrandTotal();

  const subtotalDisplay = Number(subtotal).toFixed(2);
  const totalDeliveryDisplay = Number(totalDelivery).toFixed(2);
  const grandTotalDisplay = Number(grandTotal).toFixed(2);

  const handlePlaceOrder = async () => {
    console.log('[CheckoutScreen] Place Order button pressed');
    setPlacing(true);

    const restaurantBlocks = cart.restaurants.map(restaurant => {
      const restaurantSubtotal = restaurant.items.reduce(
        (sum, item) => sum + (item.lucia_price ?? item.price) * item.quantity,
        0
      );
      const itemLines = restaurant.items
        .map(item => {
          const price = item.lucia_price ?? item.price;
          return `${item.quantity} x ${item.name} - R${Number(price).toFixed(2)}`;
        })
        .join('\n');
      return `🏪 ${restaurant.restaurantName}:\n${itemLines}\nSubtotal: R${Number(restaurantSubtotal).toFixed(2)}`;
    }).join('\n\n');

    const noteText = specialNote && specialNote.trim() ? specialNote.trim() : 'None';

    const message =
`🍽️ New Order from LuciaFood Express

👤 Customer Details:
Name: ${cart.userDetails.name}
Phone: ${cart.userDetails.phone}
Address: ${cart.userDetails.address}
Town: ${cart.selectedZone}

${restaurantBlocks}

💰 Order Summary:
Items Total: R${subtotalDisplay}
Delivery Fee (${cart.selectedZone}): R${totalDeliveryDisplay}
Total to Pay: R${grandTotalDisplay}

💳 Payment Method: ${paymentMethod || 'Cash'}

📝 Special Note:
${noteText}

Please confirm this order and provide estimated delivery time.`;

    console.log('✅ WhatsApp message generated');

    const encoded = encodeURIComponent(message);
    const url = `https://wa.me/27743844253?text=${encoded}`;

    console.log('[CheckoutScreen] Opening WhatsApp URL');
    await Linking.openURL(url);

    setPlacing(false);
    clearCart();
    router.replace('/(tabs)/');
  };

  return (
    <SafeAreaView style={commonStyles.container}>
      {/* Header */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: colors.white,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      }}>
        <TouchableOpacity
          onPress={() => {
            console.log('[CheckoutScreen] Back button pressed');
            router.back();
          }}
          style={{
            width: 40,
            height: 40,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 20,
            backgroundColor: colors.backgroundAlt,
            marginRight: 12,
          }}
        >
          <Icon name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={{ fontSize: 20, fontWeight: '700', color: colors.text, flex: 1 }}>
          Order Summary
        </Text>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>

        {/* Delivery Details */}
        <View style={[commonStyles.card, { marginBottom: 16 }]}>
          <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: 16 }}>
            📍 Delivery Details
          </Text>

          <View style={{ flexDirection: 'row', marginBottom: 10 }}>
            <Text style={{ fontSize: 14, color: colors.textLight, width: 80 }}>Zone</Text>
            <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text, flex: 1 }}>
              {cart.selectedZone}
            </Text>
          </View>

          <View style={{ flexDirection: 'row', marginBottom: 10 }}>
            <Text style={{ fontSize: 14, color: colors.textLight, width: 80 }}>Name</Text>
            <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text, flex: 1 }}>
              {cart.userDetails.name}
            </Text>
          </View>

          <View style={{ flexDirection: 'row', marginBottom: 10 }}>
            <Text style={{ fontSize: 14, color: colors.textLight, width: 80 }}>Phone</Text>
            <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text, flex: 1 }}>
              {cart.userDetails.phone}
            </Text>
          </View>

          <View style={{ flexDirection: 'row' }}>
            <Text style={{ fontSize: 14, color: colors.textLight, width: 80 }}>Address</Text>
            <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text, flex: 1 }}>
              {cart.userDetails.address}
            </Text>
          </View>
        </View>

        {/* Items grouped by restaurant */}
        {cart.restaurants.map(restaurant => {
          const restaurantSubtotal = restaurant.items.reduce(
            (sum, item) => sum + (item.lucia_price ?? item.price) * item.quantity,
            0
          );
          const restaurantSubtotalDisplay = Number(restaurantSubtotal).toFixed(2);
          const deliveryFeeDisplay = Number(restaurant.deliveryFee).toFixed(2);

          return (
            <View key={restaurant.restaurantId} style={[commonStyles.card, { marginBottom: 16 }]}>
              <Text style={{ fontSize: 17, fontWeight: '700', color: colors.text, marginBottom: 14 }}>
                🏪 {restaurant.restaurantName}
              </Text>

              {restaurant.items.map(item => {
                const effectivePrice = item.lucia_price ?? item.price;
                const itemTotal = effectivePrice * item.quantity;
                const itemTotalDisplay = Number(itemTotal).toFixed(2);
                const itemPriceDisplay = Number(effectivePrice).toFixed(2);

                return (
                  <View
                    key={item.id}
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      paddingVertical: 10,
                      borderBottomWidth: 1,
                      borderBottomColor: colors.backgroundAlt,
                    }}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 15, fontWeight: '600', color: colors.text, marginBottom: 2 }}>
                        {item.name}
                      </Text>
                      <Text style={{ fontSize: 13, color: colors.textLight }}>
                        R{itemPriceDisplay}
                      </Text>
                      <Text style={{ fontSize: 13, color: colors.textLight }}>
                        x{item.quantity}
                      </Text>
                    </View>
                    <Text style={{ fontSize: 15, fontWeight: '700', color: colors.primary }}>
                      R{itemTotalDisplay}
                    </Text>
                  </View>
                );
              })}

              <View style={{ paddingTop: 12, marginTop: 4 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                  <Text style={{ fontSize: 14, color: colors.textLight }}>Subtotal</Text>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text }}>
                    R{restaurantSubtotalDisplay}
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ fontSize: 14, color: colors.textLight }}>
                    Delivery to {cart.selectedZone}
                  </Text>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: colors.primary }}>
                    R{deliveryFeeDisplay}
                  </Text>
                </View>
              </View>
            </View>
          );
        })}

        {/* Special Note */}
        {specialNote && specialNote.trim() ? (
          <View style={[commonStyles.card, { marginBottom: 16 }]}>
            <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 8 }}>
              📝 Special Note
            </Text>
            <Text style={{ fontSize: 14, color: colors.textLight }}>
              {specialNote}
            </Text>
          </View>
        ) : null}

        {/* Grand Total */}
        <View style={[commonStyles.card, { marginBottom: 24 }]}>
          <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: 16 }}>
            💰 Payment Summary
          </Text>

          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: 10,
            paddingBottom: 10,
            borderBottomWidth: 1,
            borderBottomColor: colors.backgroundAlt,
          }}>
            <Text style={{ fontSize: 15, color: colors.text, fontWeight: '500' }}>Food subtotal</Text>
            <Text style={{ fontSize: 15, color: colors.text, fontWeight: '600' }}>R{subtotalDisplay}</Text>
          </View>

          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: 10,
            paddingBottom: 10,
            borderBottomWidth: 1,
            borderBottomColor: colors.backgroundAlt,
          }}>
            <Text style={{ fontSize: 15, color: colors.text, fontWeight: '500' }}>Total delivery</Text>
            <Text style={{ fontSize: 15, color: colors.text, fontWeight: '600' }}>R{totalDeliveryDisplay}</Text>
          </View>

          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            paddingTop: 14,
            paddingBottom: 8,
            backgroundColor: colors.primary + '08',
            marginHorizontal: -16,
            paddingHorizontal: 16,
            borderRadius: 12,
          }}>
            <Text style={{ fontSize: 20, fontWeight: '700', color: colors.text }}>Total</Text>
            <Text style={{ fontSize: 22, fontWeight: '700', color: colors.primary }}>R{grandTotalDisplay}</Text>
          </View>
        </View>

        {/* Place Order Button */}
        <TouchableOpacity
          style={[buttonStyles.primary, { opacity: placing ? 0.6 : 1 }]}
          onPress={handlePlaceOrder}
          disabled={placing}
        >
          <Text style={{ color: colors.white, fontWeight: '700', fontSize: 17 }}>
            Place Order via WhatsApp
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
