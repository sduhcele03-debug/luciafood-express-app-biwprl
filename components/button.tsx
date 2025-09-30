
import React from 'react';
import { Text, TouchableOpacity, StyleSheet, ViewStyle, TextStyle, ActivityIndicator } from 'react-native';
import { colors } from '../styles/commonStyles';

interface ButtonProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle | ViewStyle[];
  textStyle?: TextStyle;
  variant?: 'primary' | 'secondary' | 'outline' | 'disabled';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
}

const buttonStyles = StyleSheet.create({
  base: {
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  primary: {
    backgroundColor: colors.primary,
  },
  secondary: {
    backgroundColor: colors.secondary,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  disabled: {
    backgroundColor: colors.backgroundAlt,
  },
  sm: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  md: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  lg: {
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
});

const textStyles = StyleSheet.create({
  primary: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  secondary: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  outline: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  disabled: {
    color: colors.textLight,
    fontSize: 16,
    fontWeight: '600',
  },
  sm: {
    fontSize: 14,
  },
  md: {
    fontSize: 16,
  },
  lg: {
    fontSize: 18,
  },
});

export function Button({ 
  children, 
  onPress, 
  style, 
  textStyle, 
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
}: ButtonProps) {
  const isDisabled = disabled || loading;
  const buttonVariant = isDisabled ? 'disabled' : variant;
  
  return (
    <TouchableOpacity 
      style={[
        buttonStyles.base,
        buttonStyles[buttonVariant],
        buttonStyles[size],
        style
      ]} 
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
    >
      {loading && (
        <ActivityIndicator 
          size="small" 
          color={variant === 'outline' ? colors.primary : colors.white} 
          style={{ marginRight: 8 }}
        />
      )}
      {typeof children === 'string' ? (
        <Text style={[
          textStyles[buttonVariant],
          textStyles[size],
          textStyle
        ]}>
          {children}
        </Text>
      ) : (
        children
      )}
    </TouchableOpacity>
  );
}
