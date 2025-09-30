
import React from 'react';
import { ScrollView, ScrollViewProps, StyleSheet } from 'react-native';
import { colors } from '../styles/commonStyles';

interface BodyScrollViewProps extends ScrollViewProps {
  children: React.ReactNode;
}

export function BodyScrollView({ children, style, contentContainerStyle, ...props }: BodyScrollViewProps) {
  return (
    <ScrollView
      style={[styles.container, style]}
      contentContainerStyle={[styles.contentContainer, contentContainerStyle]}
      showsVerticalScrollIndicator={false}
      {...props}
    >
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    flexGrow: 1,
    padding: 16,
  },
});
