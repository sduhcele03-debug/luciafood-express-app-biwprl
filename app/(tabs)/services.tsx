
import React, { useState } from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Linking } from 'expo-linking';
import { commonStyles, colors, buttonStyles } from '../../styles/commonStyles';
import Icon from '../../components/Icon';
import BookingForm from '../../components/BookingForm';
import { 
  LOCAL_TRADES_BOOKING_NUMBER, 
  ADVERTISING_NUMBER, 
  generateWhatsAppUrl 
} from '../../constants/whatsapp';

interface Service {
  id: number;
  name: string;
  icon: keyof typeof import('@expo/vector-icons').Ionicons.glyphMap;
  description?: string;
  action: 'restaurant' | 'comingSoon' | 'plumber' | 'electrician';
}

export default function ServicesScreen() {
  const [bookingModalVisible, setBookingModalVisible] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  const services: Service[] = [
    {
      id: 1,
      name: 'Food Delivery',
      icon: 'restaurant',
      action: 'restaurant',
    },
    {
      id: 2,
      name: 'Grocery Delivery',
      icon: 'basket',
      description: 'Order a grocery and it\'s delivered to you from Shoprite and Boxer.',
      action: 'comingSoon',
    },
    {
      id: 3,
      name: 'Medication Delivery',
      icon: 'medical',
      description: 'Get medication delivered to you from Clicks and Dis-Chem.',
      action: 'comingSoon',
    },
    {
      id: 4,
      name: 'People Transportation',
      icon: 'car',
      description: 'Request a ride from wherever you are and get to be transported to anyplace nearby.',
      action: 'comingSoon',
    },
    {
      id: 5,
      name: 'Cleaning Services',
      icon: 'sparkles',
      description: 'Get to book cleaning or cleaners here.',
      action: 'comingSoon',
    },
    {
      id: 6,
      name: 'Verified Plumbers',
      icon: 'build',
      action: 'plumber',
    },
    {
      id: 7,
      name: 'Verified Electricians',
      icon: 'flash',
      action: 'electrician',
    },
  ];

  const handleServicePress = (service: Service) => {
    console.log(`Service pressed: ${service.name} - Action: ${service.action}`);
    
    switch (service.action) {
      case 'restaurant':
        console.log('Navigating to restaurants page');
        router.push('/(tabs)/restaurants');
        break;
        
      case 'comingSoon':
        Alert.alert('Coming soon.');
        break;
        
      case 'plumber':
      case 'electrician':
        console.log(`Opening booking form for ${service.name}`);
        setSelectedService(service);
        setBookingModalVisible(true);
        break;
        
      default:
        console.log('Unknown service action');
        Alert.alert('Coming soon.');
    }
  };

  const handleAdvertisingPress = async () => {
    try {
      console.log('Opening advertising WhatsApp link');
      const advertisingMessage = 'I am interested in advertising my local business on LuciaFood Express.';
      const whatsappUrl = generateWhatsAppUrl(ADVERTISING_NUMBER, advertisingMessage);
      
      const supported = await Linking.canOpenURL(whatsappUrl);
      if (supported) {
        await Linking.openURL(whatsappUrl);
      } else {
        Alert.alert('Error', 'WhatsApp is not installed on this device');
      }
    } catch (error) {
      console.error('Error opening advertising WhatsApp link:', error);
      Alert.alert('Error', 'Failed to open WhatsApp. Please try again.');
    }
  };

  const closeBookingModal = () => {
    setBookingModalVisible(false);
    setSelectedService(null);
  };

  return (
    <SafeAreaView style={[commonStyles.container, { paddingBottom: 80 }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{ padding: 20 }}>
          <Text style={[commonStyles.title, { marginBottom: 8, textAlign: 'left' }]}>
            Our Services
          </Text>
          <Text style={[commonStyles.subtitle, { marginBottom: 32, textAlign: 'left' }]}>
            Discover all the ways we can help you
          </Text>

          {services.map((service) => (
            <TouchableOpacity
              key={service.id}
              style={[commonStyles.card, {
                flexDirection: 'row',
                alignItems: 'center',
                padding: 20,
                marginBottom: 16,
              }]}
              onPress={() => handleServicePress(service)}
            >
              {/* Left-aligned orange icon */}
              <View style={{
                backgroundColor: colors.backgroundAlt,
                borderRadius: 12,
                padding: 12,
                marginRight: 16,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Icon 
                  name={service.icon} 
                  size={24} 
                  color={colors.primary}
                />
              </View>
              
              {/* Service content */}
              <View style={{ flex: 1 }}>
                <Text style={{
                  fontSize: 18,
                  fontWeight: '700',
                  color: colors.text,
                  marginBottom: service.description ? 4 : 0,
                }}>
                  {service.name}
                </Text>
                {service.description && (
                  <Text style={{
                    fontSize: 14,
                    color: colors.textLight,
                    lineHeight: 20,
                  }}>
                    {service.description}
                  </Text>
                )}
              </View>
              
              {/* Right arrow */}
              <Icon 
                name="chevron-forward" 
                size={20} 
                color={colors.textLight}
              />
            </TouchableOpacity>
          ))}

          {/* Strategic Advertising CTA */}
          <View style={[commonStyles.card, {
            backgroundColor: colors.backgroundAlt,
            padding: 24,
            marginTop: 20,
            alignItems: 'center',
          }]}>
            <View style={{
              backgroundColor: colors.primary + '20',
              borderRadius: 50,
              padding: 16,
              marginBottom: 16,
            }}>
              <Icon name="megaphone" size={32} color={colors.primary} />
            </View>
            
            <Text style={{
              fontSize: 18,
              fontWeight: '700',
              color: colors.text,
              textAlign: 'center',
              marginBottom: 8,
            }}>
              Advertise Your Business
            </Text>
            
            <Text style={{
              fontSize: 16,
              color: colors.textLight,
              textAlign: 'center',
              marginBottom: 20,
              lineHeight: 22,
            }}>
              Advertise your local business here and be seen by{' '}
              <Text style={{ fontWeight: '700', color: colors.primary }}>
                2,000+ monthly users
              </Text>
              .
            </Text>
            
            <TouchableOpacity
              style={[buttonStyles.primary, { width: '100%' }]}
              onPress={handleAdvertisingPress}
            >
              <Text style={{ 
                color: colors.white, 
                fontWeight: '700', 
                fontSize: 16 
              }}>
                Click here for advertising
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Booking Form Modal */}
      {selectedService && (
        <BookingForm
          isVisible={bookingModalVisible}
          onClose={closeBookingModal}
          serviceName={selectedService.name}
          whatsappNumber={LOCAL_TRADES_BOOKING_NUMBER}
        />
      )}
    </SafeAreaView>
  );
}
