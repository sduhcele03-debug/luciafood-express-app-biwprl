
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, router } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { commonStyles, colors, buttonStyles } from '../styles/commonStyles';

export default function SignUpScreen() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const { signUp } = useAuth();

  const handleSignUp = async () => {
    if (!fullName || !email || !password || !phone) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    console.log('SignUp: Attempting to sign up with email:', email);

    const { error } = await signUp(email, password, fullName, phone);

    if (error) {
      console.log('SignUp: Error occurred:', error.message);
      Alert.alert('Sign Up Failed', error.message);
    } else {
      console.log('SignUp: Success, redirecting to home');
      router.replace('/');
    }

    setLoading(false);
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
            {/* Logo */}
            <Text style={commonStyles.logo}>LuciaFood Express</Text>

            {/* Auth Card */}
            <View style={commonStyles.authCard}>
              <Text style={commonStyles.title}>Create Your Account</Text>
              <Text style={commonStyles.subtitle}>Join LuciaFood Express today</Text>

              {/* Full Name Input */}
              <TextInput
                style={[
                  commonStyles.input,
                  focusedField === 'fullName' && commonStyles.inputFocused,
                ]}
                placeholder="Full Name"
                placeholderTextColor={colors.textLight}
                value={fullName}
                onChangeText={setFullName}
                onFocus={() => setFocusedField('fullName')}
                onBlur={() => setFocusedField(null)}
                autoComplete="name"
              />

              {/* Email Input */}
              <TextInput
                style={[
                  commonStyles.input,
                  focusedField === 'email' && commonStyles.inputFocused,
                ]}
                placeholder="Email"
                placeholderTextColor={colors.textLight}
                value={email}
                onChangeText={setEmail}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField(null)}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />

              {/* Password Input */}
              <TextInput
                style={[
                  commonStyles.input,
                  focusedField === 'password' && commonStyles.inputFocused,
                ]}
                placeholder="Password (min. 6 characters)"
                placeholderTextColor={colors.textLight}
                value={password}
                onChangeText={setPassword}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
                secureTextEntry
                autoComplete="password"
              />

              {/* Phone Input */}
              <TextInput
                style={[
                  commonStyles.input,
                  focusedField === 'phone' && commonStyles.inputFocused,
                ]}
                placeholder="Phone Number"
                placeholderTextColor={colors.textLight}
                value={phone}
                onChangeText={setPhone}
                onFocus={() => setFocusedField('phone')}
                onBlur={() => setFocusedField(null)}
                keyboardType="phone-pad"
                autoComplete="tel"
              />

              {/* Sign Up Button */}
              <TouchableOpacity
                style={[
                  buttonStyles.primary,
                  loading && buttonStyles.disabled,
                ]}
                onPress={handleSignUp}
                disabled={loading}
              >
                <Text
                  style={{
                    color: colors.white,
                    fontSize: 16,
                    fontWeight: '600',
                  }}
                >
                  {loading ? 'Creating Account...' : 'Sign Up'}
                </Text>
              </TouchableOpacity>

              {/* Sign In Link */}
              <Link href="/signin" asChild>
                <TouchableOpacity>
                  <Text style={commonStyles.link}>
                    Already have an account? Sign in
                  </Text>
                </TouchableOpacity>
              </Link>

              {/* Social Buttons (Disabled) */}
              <View style={{ marginTop: 24 }}>
                <TouchableOpacity
                  style={[buttonStyles.disabled, { marginBottom: 12 }]}
                  disabled
                >
                  <Text
                    style={{
                      color: colors.textLight,
                      fontSize: 16,
                      fontWeight: '600',
                    }}
                  >
                    Continue with Google (Coming Soon)
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity style={buttonStyles.disabled} disabled>
                  <Text
                    style={{
                      color: colors.textLight,
                      fontSize: 16,
                      fontWeight: '600',
                    }}
                  >
                    Continue with Facebook (Coming Soon)
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}
