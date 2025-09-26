
import React, { useState, useEffect } from 'react';
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
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { commonStyles, colors, buttonStyles } from '../styles/commonStyles';
import Icon from '../components/Icon';

interface ProfileData {
  full_name: string;
  phone: string;
  address: string;
  avatar_url?: string;
}

export default function ProfileScreen() {
  const [profileData, setProfileData] = useState<ProfileData>({
    full_name: '',
    phone: '',
    address: '',
    avatar_url: '',
  });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const { user, signOut } = useAuth();

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;

    console.log('Profile: Loading profile for user:', user.id);
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      console.log('Profile: Error loading profile:', error.message);
      // If profile doesn't exist, create one with user metadata
      const { data: userData } = await supabase.auth.getUser();
      if (userData.user) {
        setProfileData({
          full_name: userData.user.user_metadata?.full_name || '',
          phone: userData.user.user_metadata?.phone || '',
          address: '',
          avatar_url: '',
        });
      }
    } else {
      console.log('Profile: Profile loaded successfully');
      setProfileData({
        full_name: data.full_name || '',
        phone: data.phone || '',
        address: data.address || '',
        avatar_url: data.avatar_url || '',
      });
    }
  };

  const updateProfile = async () => {
    if (!user) return;

    if (!profileData.full_name || !profileData.phone) {
      Alert.alert('Error', 'Please fill in your name and phone number');
      return;
    }

    setLoading(true);
    console.log('Profile: Updating profile for user:', user.id);

    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        full_name: profileData.full_name,
        phone: profileData.phone,
        address: profileData.address,
        avatar_url: profileData.avatar_url,
        updated_at: new Date().toISOString(),
      });

    if (error) {
      console.log('Profile: Error updating profile:', error.message);
      Alert.alert('Update Failed', error.message);
    } else {
      console.log('Profile: Profile updated successfully');
      Alert.alert('Success', 'Profile updated successfully');
    }

    setLoading(false);
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant camera roll permissions to upload an avatar.');
      return;
    }

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

    setUploading(true);
    console.log('Profile: Uploading avatar for user:', user.id);

    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      const fileExt = uri.split('.').pop();
      const fileName = `${user.id}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, blob, {
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) {
        console.log('Profile: Avatar upload error:', uploadError.message);
        Alert.alert('Upload Failed', uploadError.message);
        return;
      }

      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      setProfileData(prev => ({ ...prev, avatar_url: data.publicUrl }));
      console.log('Profile: Avatar uploaded successfully');
    } catch (error) {
      console.log('Profile: Avatar upload error:', error);
      Alert.alert('Upload Failed', 'Failed to upload avatar');
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
            console.log('Profile: User signing out');
            await signOut();
            router.replace('/signin');
          },
        },
      ]
    );
  };

  return (
    <LinearGradient
      colors={[colors.primary, colors.secondary]}
      style={commonStyles.gradientBackground}
    >
      <SafeAreaView style={commonStyles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={commonStyles.container}
        >
          <ScrollView
            contentContainerStyle={commonStyles.content}
            showsVerticalScrollIndicator={false}
          >
            {/* Header */}
            <View style={{ alignItems: 'center', marginBottom: 32 }}>
              <Text style={[commonStyles.logo, { marginBottom: 16 }]}>Profile</Text>
            </View>

            {/* Profile Card */}
            <View style={commonStyles.authCard}>
              {/* Avatar Section */}
              <View style={{ alignItems: 'center', marginBottom: 24 }}>
                <TouchableOpacity
                  onPress={pickImage}
                  style={{
                    width: 100,
                    height: 100,
                    borderRadius: 50,
                    backgroundColor: colors.backgroundAlt,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 12,
                    borderWidth: 3,
                    borderColor: colors.primary,
                  }}
                >
                  {profileData.avatar_url ? (
                    <Image
                      source={{ uri: profileData.avatar_url }}
                      style={{
                        width: 94,
                        height: 94,
                        borderRadius: 47,
                      }}
                    />
                  ) : (
                    <Icon name="person" size={40} color={colors.textLight} />
                  )}
                </TouchableOpacity>
                
                <TouchableOpacity onPress={pickImage} disabled={uploading}>
                  <Text style={[commonStyles.link, { fontSize: 14 }]}>
                    {uploading ? 'Uploading...' : 'Change Avatar'}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* User Email */}
              <View style={{ marginBottom: 24 }}>
                <Text style={[commonStyles.text, { fontSize: 14, color: colors.textLight }]}>
                  Email
                </Text>
                <Text style={[commonStyles.text, { fontSize: 16, marginBottom: 0 }]}>
                  {user?.email}
                </Text>
              </View>

              {/* Full Name Input */}
              <TextInput
                style={[
                  commonStyles.input,
                  focusedField === 'fullName' && commonStyles.inputFocused,
                ]}
                placeholder="Full Name"
                placeholderTextColor={colors.textLight}
                value={profileData.full_name}
                onChangeText={(text) => setProfileData(prev => ({ ...prev, full_name: text }))}
                onFocus={() => setFocusedField('fullName')}
                onBlur={() => setFocusedField(null)}
              />

              {/* Phone Input */}
              <TextInput
                style={[
                  commonStyles.input,
                  focusedField === 'phone' && commonStyles.inputFocused,
                ]}
                placeholder="Phone Number"
                placeholderTextColor={colors.textLight}
                value={profileData.phone}
                onChangeText={(text) => setProfileData(prev => ({ ...prev, phone: text }))}
                onFocus={() => setFocusedField('phone')}
                onBlur={() => setFocusedField(null)}
                keyboardType="phone-pad"
              />

              {/* Address Input */}
              <TextInput
                style={[
                  commonStyles.input,
                  focusedField === 'address' && commonStyles.inputFocused,
                ]}
                placeholder="Default Delivery Address"
                placeholderTextColor={colors.textLight}
                value={profileData.address}
                onChangeText={(text) => setProfileData(prev => ({ ...prev, address: text }))}
                onFocus={() => setFocusedField('address')}
                onBlur={() => setFocusedField(null)}
                multiline
                numberOfLines={3}
              />

              {/* Save Changes Button */}
              <TouchableOpacity
                style={[
                  buttonStyles.primary,
                  loading && buttonStyles.disabled,
                ]}
                onPress={updateProfile}
                disabled={loading}
              >
                <Text
                  style={{
                    color: colors.white,
                    fontSize: 16,
                    fontWeight: '600',
                  }}
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </Text>
              </TouchableOpacity>

              {/* Sign Out Button */}
              <TouchableOpacity
                style={[
                  buttonStyles.secondary,
                  { marginTop: 16, borderColor: colors.error },
                ]}
                onPress={handleSignOut}
              >
                <Text
                  style={{
                    color: colors.error,
                    fontSize: 16,
                    fontWeight: '600',
                  }}
                >
                  Sign Out
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}
