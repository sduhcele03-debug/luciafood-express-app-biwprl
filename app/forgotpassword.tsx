
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
import { Link } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { commonStyles, colors, buttonStyles } from '../styles/commonStyles';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);

  const { resetPassword } = useAuth();

  const handleResetPassword = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    setLoading(true);
    console.log('ForgotPassword: Requesting password reset for:', email);

    const { error } = await resetPassword(email);

    if (error) {
      console.log('ForgotPassword: Error occurred:', error.message);
      Alert.alert('Reset Failed', error.message);
    } else {
      console.log('ForgotPassword: Reset email sent');
      setEmailSent(true);
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
              <Text style={commonStyles.title}>Reset Your Password</Text>
              <Text style={commonStyles.subtitle}>
                Enter your email address and we&apos;ll send you a link to reset your password
              </Text>

              {!emailSent ? (
                <>
                  {/* Email Input */}
                  <TextInput
                    style={[
                      commonStyles.input,
                      emailFocused && commonStyles.inputFocused,
                    ]}
                    placeholder="Email"
                    placeholderTextColor={colors.textLight}
                    value={email}
                    onChangeText={setEmail}
                    onFocus={() => setEmailFocused(true)}
                    onBlur={() => setEmailFocused(false)}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                  />

                  {/* Reset Button */}
                  <TouchableOpacity
                    style={[
                      buttonStyles.primary,
                      loading && buttonStyles.disabled,
                    ]}
                    onPress={handleResetPassword}
                    disabled={loading}
                  >
                    <Text
                      style={{
                        color: colors.white,
                        fontSize: 16,
                        fontWeight: '600',
                      }}
                    >
                      {loading ? 'Sending...' : 'Send Reset Link'}
                    </Text>
                  </TouchableOpacity>
                </>
              ) : (
                <View style={{ alignItems: 'center', marginVertical: 20 }}>
                  <Text style={[commonStyles.text, commonStyles.textCenter]}>
                    If an account exists for this email, a password reset link has been sent.
                  </Text>
                  <Text style={[commonStyles.text, commonStyles.textCenter, { marginTop: 16, color: colors.textLight }]}>
                    Please check your email and follow the instructions to reset your password.
                  </Text>
                </View>
              )}

              {/* Back to Sign In Link */}
              <Link href="/signin" asChild>
                <TouchableOpacity>
                  <Text style={commonStyles.link}>Back to Sign In</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}
