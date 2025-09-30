
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../styles/commonStyles';

interface IconCircleProps {
  emoji?: string;
  backgroundColor?: string;
  size?: number;
}

export function IconCircle({ 
  emoji = "🍕", 
  backgroundColor = colors.primary, 
  size = 60 
}: IconCircleProps) {
  return (
    <View style={[
      styles.container, 
      { 
        backgroundColor, 
        width: size, 
        height: size, 
        borderRadius: size / 2 
      }
    ]}>
      <Text style={[styles.emoji, { fontSize: size * 0.5 }]}>
        {emoji}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emoji: {
    textAlign: 'center',
  },
});
