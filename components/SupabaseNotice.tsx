
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { commonStyles, colors } from '../styles/commonStyles';
import Icon from './Icon';

interface SupabaseNoticeProps {
  onDismiss?: () => void;
}

export default function SupabaseNotice({ onDismiss }: SupabaseNoticeProps) {
  return (
    <View style={{
      backgroundColor: colors.secondary,
      margin: 20,
      padding: 16,
      borderRadius: 12,
      flexDirection: 'row',
      alignItems: 'center',
    }}>
      <Icon name="information-circle" size={24} color={colors.white} />
      
      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text style={[commonStyles.text, { color: colors.white, fontWeight: '600', marginBottom: 4 }]}>
          Demo Mode
        </Text>
        <Text style={[commonStyles.text, { color: colors.white, fontSize: 14, marginBottom: 0 }]}>
          This app is using mock data. To enable full functionality with authentication and database, please connect to Supabase using the Supabase button.
        </Text>
      </View>
      
      {onDismiss && (
        <TouchableOpacity onPress={onDismiss} style={{ marginLeft: 8 }}>
          <Icon name="close" size={20} color={colors.white} />
        </TouchableOpacity>
      )}
    </View>
  );
}
