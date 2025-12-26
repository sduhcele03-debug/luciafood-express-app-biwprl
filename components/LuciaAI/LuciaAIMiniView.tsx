
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useLuciaAI } from '../../contexts/LuciaAIContext';
import { colors } from '../../styles/commonStyles';
import Icon from '../Icon';
import { openWhatsAppWithFallback } from '../../constants/whatsapp';

const LUCIA_BLUE = '#4A90E2';

const QUICK_ACTIONS = [
  { id: '1', icon: 'fast-food', label: 'How to order', emoji: '🍔' },
  { id: '2', icon: 'cube', label: 'Delivery & pricing', emoji: '📦' },
  { id: '3', icon: 'logo-whatsapp', label: 'Order via WhatsApp', emoji: '💬' },
  { id: '4', icon: 'business', label: 'Partner with LuciaFood', emoji: '🏪' },
];

export default function LuciaAIMiniView() {
  const { expandLucia, sendMessage, hideLucia } = useLuciaAI();

  const handleQuickAction = async (action: typeof QUICK_ACTIONS[0]) => {
    if (action.id === '3') {
      const message = `Hi! I'd like to place an order with LuciaFood Express.`;
      await openWhatsAppWithFallback('0743844253', message);
      return;
    }

    expandLucia();
    
    setTimeout(() => {
      sendMessage(action.label);
    }, 300);
  };

  return (
    <View style={styles.container}>
      <View style={styles.handle} />
      
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.iconCircle}>
            <Icon name="chatbubble-ellipses" size={20} color="#FFFFFF" />
          </View>
          <View>
            <Text style={styles.title}>Lucia AI</Text>
            <Text style={styles.subtitle}>Your smart assistant</Text>
          </View>
        </View>
        <TouchableOpacity onPress={hideLucia} style={styles.closeButton}>
          <Icon name="close" size={20} color={colors.textLight} />
        </TouchableOpacity>
      </View>

      <Text style={styles.greeting}>
        Hi there! 👋 How can I help you today?
      </Text>

      <View style={styles.quickActions}>
        {QUICK_ACTIONS.map((action) => (
          <TouchableOpacity
            key={action.id}
            style={styles.actionButton}
            onPress={() => handleQuickAction(action)}
            activeOpacity={0.7}
          >
            <Text style={styles.actionEmoji}>{action.emoji}</Text>
            <Text style={styles.actionLabel}>{action.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={styles.expandButton}
        onPress={expandLucia}
        activeOpacity={0.8}
      >
        <Text style={styles.expandText}>Open full chat</Text>
        <Icon name="expand" size={16} color={LUCIA_BLUE} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 30,
    boxShadow: '0px -4px 20px rgba(0, 0, 0, 0.1)',
    elevation: 10,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: colors.grey,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: LUCIA_BLUE,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  subtitle: {
    fontSize: 12,
    color: colors.textLight,
  },
  closeButton: {
    padding: 4,
  },
  greeting: {
    fontSize: 16,
    color: colors.text,
    marginBottom: 20,
    lineHeight: 24,
  },
  quickActions: {
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundAlt,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionEmoji: {
    fontSize: 20,
    marginRight: 12,
  },
  actionLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
  expandButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    padding: 12,
    gap: 8,
  },
  expandText: {
    fontSize: 14,
    fontWeight: '600',
    color: LUCIA_BLUE,
  },
});
