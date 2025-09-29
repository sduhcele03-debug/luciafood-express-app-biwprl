
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Linking } from 'expo-linking';
import { commonStyles, colors, buttonStyles } from '../styles/commonStyles';
import Icon from './Icon';
import { generateWhatsAppUrl, openWhatsAppWithFallback } from '../constants/whatsapp';

interface BookingFormProps {
  isVisible: boolean;
  onClose: () => void;
  serviceName: string;
  whatsappNumber: string;
}

export default function BookingForm({ 
  isVisible, 
  onClose, 
  serviceName, 
  whatsappNumber 
}: BookingFormProps) {
  const [problem, setProblem] = useState('');
  const [location, setLocation] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!problem.trim() || !location.trim() || !contactName.trim() || !contactPhone.trim()) {
      Alert.alert('Missing Information', 'Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      console.log(`Submitting booking request for ${serviceName}`);

      const bookingDetails = `LuciaFood Express - ${serviceName} Booking Request 🔧

Name: ${contactName}
Phone: ${contactPhone}
Location: ${location}

Problem Description:
${problem}

Please contact me to arrange a service appointment.`;

      console.log(`Attempting to send ${serviceName} booking request via WhatsApp...`);
      const whatsappOpened = await openWhatsAppWithFallback(whatsappNumber, bookingDetails);
      
      if (whatsappOpened) {
        console.log('WhatsApp opened successfully for booking request');
        
        // Clear form and close modal
        setProblem('');
        setLocation('');
        setContactName('');
        setContactPhone('');
        onClose();
        
        Alert.alert(
          'Booking Request Sent!',
          `Your ${serviceName.toLowerCase()} booking request has been sent via WhatsApp. You will receive a response shortly.`
        );
      } else {
        console.log('WhatsApp could not be opened for booking request, but fallback was handled');
        // Don't clear form if WhatsApp couldn't be opened
        // The fallback function already handles user communication
      }
    } catch (error) {
      console.error('Error sending booking request:', error);
      Alert.alert('Error', 'Failed to send booking request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={{ flex: 1, backgroundColor: colors.background }}>
          {/* Header */}
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: 20,
            paddingTop: 60,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
          }}>
            <View style={{ flex: 1 }}>
              <Text style={[commonStyles.title, { textAlign: 'left', marginBottom: 4 }]}>
                Book {serviceName}
              </Text>
              <Text style={[commonStyles.subtitle, { textAlign: 'left', marginBottom: 0 }]}>
                Fill in the details below
              </Text>
            </View>
            <TouchableOpacity onPress={onClose}>
              <Icon name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20 }}>
            {/* Contact Information */}
            <View style={{ marginBottom: 24 }}>
              <Text style={{
                fontSize: 18,
                fontWeight: '700',
                color: colors.text,
                marginBottom: 16,
              }}>
                Contact Information
              </Text>

              <TextInput
                style={commonStyles.input}
                placeholder="Your Name *"
                placeholderTextColor={colors.textLight}
                value={contactName}
                onChangeText={setContactName}
              />

              <TextInput
                style={commonStyles.input}
                placeholder="Your Phone Number *"
                placeholderTextColor={colors.textLight}
                value={contactPhone}
                onChangeText={setContactPhone}
                keyboardType="phone-pad"
              />
            </View>

            {/* Service Details */}
            <View style={{ marginBottom: 24 }}>
              <Text style={{
                fontSize: 18,
                fontWeight: '700',
                color: colors.text,
                marginBottom: 16,
              }}>
                Service Details
              </Text>

              <TextInput
                style={commonStyles.input}
                placeholder="Location/Address *"
                placeholderTextColor={colors.textLight}
                value={location}
                onChangeText={setLocation}
                multiline
                numberOfLines={2}
              />

              <TextInput
                style={[commonStyles.input, { height: 120, textAlignVertical: 'top' }]}
                placeholder={`Describe the ${serviceName.toLowerCase()} problem or service needed *`}
                placeholderTextColor={colors.textLight}
                value={problem}
                onChangeText={setProblem}
                multiline
                numberOfLines={5}
              />
            </View>

            {/* Info Card */}
            <View style={[commonStyles.card, { backgroundColor: colors.backgroundAlt, marginBottom: 24 }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                <Icon name="information-circle" size={20} color={colors.primary} />
                <Text style={{
                  fontSize: 16,
                  fontWeight: '700',
                  color: colors.primary,
                  marginLeft: 8,
                }}>
                  How it works
                </Text>
              </View>
              <Text style={{ fontSize: 14, color: colors.textLight, lineHeight: 20 }}>
                1. Fill in your details and describe the problem{'\n'}
                2. Your request will be sent via WhatsApp{'\n'}
                3. A verified {serviceName.toLowerCase()} will contact you{'\n'}
                4. Arrange a convenient time for the service
              </Text>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[buttonStyles.primary, { marginBottom: 20 }]}
              onPress={handleSubmit}
              disabled={loading}
            >
              <Text style={{ color: colors.white, fontWeight: '700', fontSize: 16 }}>
                {loading ? 'Sending Request...' : 'Send Booking Request'}
              </Text>
            </TouchableOpacity>

            {/* Cancel Button */}
            <TouchableOpacity
              style={[buttonStyles.secondary, { marginBottom: 40 }]}
              onPress={onClose}
            >
              <Text style={{ color: colors.text, fontWeight: '600', fontSize: 16 }}>
                Cancel
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
