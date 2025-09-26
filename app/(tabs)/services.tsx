
import React, { useState } from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { commonStyles, colors } from '../../styles/commonStyles';
import Icon from '../../components/Icon';

export default function ServicesScreen() {
  const services = [
    {
      id: 1,
      name: 'Food Delivery',
      icon: 'restaurant',
      description: 'Order from your favorite restaurants',
    },
    {
      id: 2,
      name: 'Grocery Delivery',
      icon: 'basket',
      description: 'Fresh groceries delivered to your door',
    },
    {
      id: 3,
      name: 'Medication Delivery',
      icon: 'medical',
      description: 'Prescription and over-the-counter medicines',
    },
    {
      id: 4,
      name: 'People Transportation',
      icon: 'car',
      description: 'Safe and reliable rides',
    },
    {
      id: 5,
      name: 'Cleaning Services',
      icon: 'sparkles',
      description: 'Professional home and office cleaning',
    },
  ];

  const handleServicePress = (serviceName: string) => {
    Alert.alert(
      'Coming Soon',
      `${serviceName} will be available soon! Stay tuned for updates.`,
      [{ text: 'OK', style: 'default' }]
    );
  };

  return (
    <SafeAreaView style={[commonStyles.container, { paddingBottom: 80 }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{ padding: 20 }}>
          <Text style={[commonStyles.title, { marginBottom: 8 }]}>
            Our Services
          </Text>
          <Text style={[commonStyles.subtitle, { marginBottom: 32 }]}>
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
              onPress={() => handleServicePress(service.name)}
            >
              <View style={{
                backgroundColor: colors.backgroundAlt,
                borderRadius: 12,
                padding: 12,
                marginRight: 16,
              }}>
                <Icon 
                  name={service.icon as any} 
                  size={24} 
                  color={colors.primary}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{
                  fontSize: 18,
                  fontWeight: '700',
                  color: colors.text,
                  marginBottom: 4,
                }}>
                  {service.name}
                </Text>
                <Text style={{
                  fontSize: 14,
                  color: colors.textLight,
                  lineHeight: 20,
                }}>
                  {service.description}
                </Text>
              </View>
              <Icon 
                name="chevron-forward" 
                size={20} 
                color={colors.textLight}
              />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
