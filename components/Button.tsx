import React from 'react';
import { Text, TouchableOpacity, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { colors, buttonStyles } from '../styles/commonStyles';

interface ButtonProps {
  text: string;
  onPress: () => void;
  style?: ViewStyle | ViewStyle[];
  textStyle?: TextStyle;
  variant?: 'primary' | 'secondary' | 'disabled';
  disabled?: boolean;
}

const textStyles = StyleSheet.create({
  primary: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  secondary: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  disabled: {
    color: colors.textLight,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default function Button({ 
  text, 
  onPress, 
  style, 
  textStyle, 
  variant = 'primary',
  disabled = false 
}: ButtonProps) {
  const buttonStyle = disabled ? buttonStyles.disabled : buttonStyles[variant];
  const defaultTextStyle = disabled ? textStyles.disabled : textStyles[variant];

  return (
    <TouchableOpacity 
      style={[buttonStyle, style]} 
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <Text style={[defaultTextStyle, textStyle]}>{text}</Text>
    </TouchableOpacity>
  );
}
