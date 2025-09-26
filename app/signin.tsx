
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

export default function SignInScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const { signIn } = useAuth();

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    console.log('SignIn: Attempting to sign in with email:', email);

    const { error } = await signIn(email, password);

    if (error) {
      console.log('SignIn: Error occurred:', error.message);
      Alert.alert('Sign In Failed', error.message);
    } else {
      console.log('SignIn: Success, redirecting to home');
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
              <Text style={commonStyles.title}>Welcome Back</Text>
              <Text style={commonStyles.subtitle}>Sign in to your account</Text>

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

              {/* Password Input */}
              <TextInput
                style={[
                  commonStyles.input,
                  passwordFocused && commonStyles.inputFocused,
                ]}
                placeholder="Password"
                placeholderTextColor={colors.textLight}
                value={password}
                onChangeText={setPassword}
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
                secureTextEntry
                autoComplete="password"
              />

              {/* Sign In Button */}
              <TouchableOpacity
                style={[
                  buttonStyles.primary,
                  loading && buttonStyles.disabled,
                ]}
                onPress={handleSignIn}
                disabled={loading}
              >
                <Text
                  style={{
                    color: colors.white,
                    fontSize: 16,
                    fontWeight: '600',
                  }}
                >
                  {loading ? 'Signing In...' : 'Sign In'}
                </Text>
              </TouchableOpacity>

              {/* Forgot Password Link */}
              <Link href="/forgotpassword" asChild>
                <TouchableOpacity>
                  <Text style={commonStyles.link}>Forgot Password?</Text>
                </TouchableOpacity>
              </Link>

              {/* Sign Up Link */}
              <Link href="/signup" asChild>
                <TouchableOpacity>
                  <Text style={[commonStyles.link, { marginTop: 8 }]}>
                    Don&apos;t have an account? Sign up
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
