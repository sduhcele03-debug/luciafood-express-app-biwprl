
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../contexts/AuthContext';
import { commonStyles, colors, buttonStyles } from '../../styles/commonStyles';
import Icon from '../../components/Icon';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../lib/supabase';

interface ProfileData {
  full_name: string;
  phone: string;
  address: string;
  avatar_url?: string;
}

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const [profileData, setProfileData] = useState<ProfileData>({
    full_name: '',
    phone: '',
    address: '',
    avatar_url: '',
  });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const loadProfile = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading profile:', error);
        return;
      }

      if (data) {
        setProfileData({
          full_name: data.full_name || '',
          phone: data.phone_number || '',
          address: data.address || '',
          avatar_url: data.avatar_url || '',
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  }, [user]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const updateProfile = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { error } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          full_name: profileData.full_name,
          phone_number: profileData.phone,
          address: profileData.address,
          avatar_url: profileData.avatar_url,
          email: user.email,
          updated_at: new Date().toISOString(),
        });

      if (error) {
        Alert.alert('Error', 'Failed to update profile');
        console.error('Error updating profile:', error);
        return;
      }

      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile');
      console.error('Error updating profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      uploadAvatar(result.assets[0].uri);
    }
  };

  const uploadAvatar = async (uri: string) => {
    if (!user) return;

    try {
      setUploading(true);
      
      const response = await fetch(uri);
      const blob = await response.blob();
      const fileExt = uri.split('.').pop();
      const fileName = `${user.id}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, blob, {
          upsert: true,
        });

      if (uploadError) {
        Alert.alert('Error', 'Failed to upload avatar');
        console.error('Error uploading avatar:', uploadError);
        return;
      }

      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      setProfileData(prev => ({ ...prev, avatar_url: data.publicUrl }));
    } catch (error) {
      Alert.alert('Error', 'Failed to upload avatar');
      console.error('Error uploading avatar:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await signOut();
            router.replace('/signin');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={[commonStyles.container, { paddingBottom: 80 }]}>
      <LinearGradient
        colors={[colors.primary, colors.secondary]}
        style={commonStyles.gradientBackground}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={commonStyles.container}
        >
          <ScrollView
            contentContainerStyle={{
              flexGrow: 1,
              justifyContent: 'center',
              alignItems: 'center',
              padding: 20,
            }}
            showsVerticalScrollIndicator={false}
          >
            <View style={commonStyles.authCard}>
              <Text style={commonStyles.title}>Profile</Text>
              <Text style={commonStyles.subtitle}>
                Manage your account settings
              </Text>

              {/* Avatar Section */}
              <View style={{ alignItems: 'center', marginBottom: 32 }}>
                <TouchableOpacity onPress={pickImage} disabled={uploading}>
                  <View style={{
                    width: 100,
                    height: 100,
                    borderRadius: 50,
                    backgroundColor: colors.backgroundAlt,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 16,
                    overflow: 'hidden',
                  }}>
                    {profileData.avatar_url ? (
                      <Image
                        source={{ uri: profileData.avatar_url }}
                        style={{ width: 100, height: 100 }}
                        resizeMode="cover"
                      />
                    ) : (
                      <Icon name="person" size={40} color={colors.textLight} />
                    )}
                  </View>
                </TouchableOpacity>
                <TouchableOpacity onPress={pickImage} disabled={uploading}>
                  <Text style={commonStyles.link}>
                    {uploading ? 'Uploading...' : 'Change Avatar'}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Form Fields */}
              <TextInput
                style={commonStyles.input}
                placeholder="Full Name"
                placeholderTextColor={colors.textLight}
                value={profileData.full_name}
                onChangeText={(text) => setProfileData(prev => ({ ...prev, full_name: text }))}
              />

              <TextInput
                style={commonStyles.input}
                placeholder="Email"
                placeholderTextColor={colors.textLight}
                value={user?.email || ''}
                editable={false}
              />

              <TextInput
                style={commonStyles.input}
                placeholder="Phone Number"
                placeholderTextColor={colors.textLight}
                value={profileData.phone}
                onChangeText={(text) => setProfileData(prev => ({ ...prev, phone: text }))}
                keyboardType="phone-pad"
              />

              <TextInput
                style={commonStyles.input}
                placeholder="Default Delivery Address"
                placeholderTextColor={colors.textLight}
                value={profileData.address}
                onChangeText={(text) => setProfileData(prev => ({ ...prev, address: text }))}
                multiline
                numberOfLines={3}
              />

              <TouchableOpacity
                style={buttonStyles.primary}
                onPress={updateProfile}
                disabled={loading}
              >
                <Text style={{ color: colors.white, fontWeight: '700', fontSize: 16 }}>
                  {loading ? 'Saving...' : 'Save Changes'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[buttonStyles.secondary, { marginTop: 16 }]}
                onPress={handleSignOut}
              >
                <Text style={{ color: colors.primary, fontWeight: '700', fontSize: 16 }}>
                  Sign Out
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
}
