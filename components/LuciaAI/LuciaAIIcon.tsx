
import React from 'react';
import { TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useLuciaAI } from '../../contexts/LuciaAIContext';
import Icon from '../Icon';

const LUCIA_BLUE = '#4A90E2';

export default function LuciaAIIcon() {
  const { toggleLucia } = useLuciaAI();

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={toggleLucia}
      activeOpacity={0.8}
    >
      <Icon name="chatbubble-ellipses" size={20} color="#FFFFFF" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: LUCIA_BLUE,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0px 4px 12px rgba(74, 144, 226, 0.4)',
    elevation: 6,
    marginRight: 16,
  },
});
