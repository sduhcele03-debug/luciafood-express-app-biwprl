
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
  Image,
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

  // SOCIAL LOGIN INTEGRATION: Handle social login (placeholder for now)
  const handleGoogleSignIn = () => {
    Alert.alert('Coming Soon', 'Google Sign-In will be available soon!');
  };

  const handleFacebookSignIn = () => {
    Alert.alert('Coming Soon', 'Facebook Sign-In will be available soon!');
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

              {/* SOCIAL LOGIN INTEGRATION: Updated Social Buttons with Logos */}
              <View style={{ marginTop: 24 }}>
                <Text style={{
                  textAlign: 'center',
                  color: colors.textLight,
                  marginBottom: 16,
                  fontSize: 14,
                }}>
                  Or continue with
                </Text>

                {/* Google Sign In Button */}
                <TouchableOpacity
                  style={[
                    buttonStyles.secondary,
                    {
                      backgroundColor: colors.white,
                      borderWidth: 1,
                      borderColor: colors.backgroundAlt,
                      marginBottom: 12,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }
                  ]}
                  onPress={handleGoogleSignIn}
                >
                  <Image
                    source={require('../assets/images/85d5d39b-a3aa-4024-a986-fca54251b8e2.jpeg')}
                    style={{
                      width: 24,
                      height: 24,
                      marginRight: 12,
                    }}
                    resizeMode="contain"
                  />
                  <Text
                    style={{
                      color: colors.text,
                      fontSize: 16,
                      fontWeight: '600',
                    }}
                  >
                    Continue with Google
                  </Text>
                </TouchableOpacity>

                {/* Facebook Sign In Button */}
                <TouchableOpacity
                  style={[
                    buttonStyles.secondary,
                    {
                      backgroundColor: '#1877F2',
                      marginBottom: 12,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }
                  ]}
                  onPress={handleFacebookSignIn}
                >
                  <Image
                    source={require('../assets/images/b53bee48-3371-4ac8-8a54-bfa7dd93ce4e.jpeg')}
                    style={{
                      width: 24,
                      height: 24,
                      marginRight: 12,
                    }}
                    resizeMode="contain"
                  />
                  <Text
                    style={{
                      color: colors.white,
                      fontSize: 16,
                      fontWeight: '600',
                    }}
                  >
                    Continue with Facebook
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
