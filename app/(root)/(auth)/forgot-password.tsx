// File: app/(root)/(auth)/forgot-password.tsx
import CustomButton from '@/components/CustomButton';
import InputField from '@/components/InputField';
import { icons } from '@/constants';
import { useAuth, useSignIn } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [successfulCreation, setSuccessfulCreation] = useState(false);
  const [secondFactor, setSecondFactor] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  const { isSignedIn } = useAuth();
  const { isLoaded, signIn, setActive } = useSignIn();

  useEffect(() => {
    if (isSignedIn) {
      router.replace('/');
    }
  }, [isSignedIn, router]);

  if (!isLoaded) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  // Send the password reset code to the user's email
  const create = async () => {
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await signIn?.create({
        strategy: 'reset_password_email_code',
        identifier: email,
      });

      setSuccessfulCreation(true);
      setError('');
      Alert.alert(
        'Reset Code Sent',
        'Check your email for the password reset code.',
        [{ text: 'OK' }]
      );
    } catch (err: any) {
      console.error('error', err.errors?.[0]?.longMessage || err.message);
      const errorMessage = err.errors?.[0]?.longMessage || 'Failed to send reset code';
      setError(errorMessage);
      Alert.alert('Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Reset the user's password
  const reset = async () => {
    if (!password.trim()) {
      setError('Please enter your new password');
      return;
    }

    if (!code.trim()) {
      setError('Please enter the reset code');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const result = await signIn?.attemptFirstFactor({
        strategy: 'reset_password_email_code',
        code,
        password,
      });

      if (result?.status === 'needs_second_factor') {
        setSecondFactor(true);
        setError('');
        Alert.alert('2FA Required', '2FA is required, but this UI does not handle that yet.');
      } else if (result?.status === 'complete') {
        // Set the active session (user is now signed in)
        await setActive({ session: result.createdSessionId });
        setError('');
        Alert.alert(
          'Password Reset Successful',
          'Your password has been reset and you are now signed in.',
          [{ text: 'OK', onPress: () => router.replace('/(root)/(tabs)/home') }]
        );
      } else {
        console.log('Unexpected result:', result);
        setError('An unexpected error occurred');
      }
    } catch (err: any) {
      console.error('error', err.errors?.[0]?.longMessage || err.message);
      const errorMessage = err.errors?.[0]?.longMessage || 'Failed to reset password';
      setError(errorMessage);
      Alert.alert('Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView className="flex-1 px-6 pt-12">
        <View className="flex-1 items-center justify-center min-h-[500px]">
          <View className="mb-8 w-full items-center">
            <Text className="text-3xl font-bold text-gray-900 mb-2 text-center">
              Forgot Password?
            </Text>
            <Text className="text-gray-600 text-center">
              {!successfulCreation
                ? 'Enter your email address and we\'ll send you a reset code.'
                : 'Enter the code sent to your email and your new password.'}
            </Text>
          </View>

          {!successfulCreation ? (
            // Email Input Step
            <View className="space-y-6 w-full items-center">
              <InputField
                label="Email Address"
                placeholder="e.g. john@doe.com"
                icon={icons.email}
                iconTintColor="#222"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                containerStyle="w-72 h-14"
                inputStyle="w-72 h-14"
                editable={!isLoading}
              />

              {error ? (
                <Text className="text-red-600 text-sm text-center">{error}</Text>
              ) : null}

              <CustomButton
                title="Send Reset Code"
                onPress={create}
                loading={isLoading}
                disabled={isLoading}
                textVariant="default"
                className="mt-4 w-72 h-14 bg-black"
              />
            </View>
          ) : (
            // Password Reset Step
            <View className="space-y-6 w-full items-center">
              <InputField
                label="New Password"
                placeholder="Enter your new password"
                icon={icons.lock}
                iconTintColor="#222"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                containerStyle="w-72 h-14"
                inputStyle="w-72 h-14"
                editable={!isLoading}
              />
              <InputField
                label="Reset Code"
                placeholder="Enter the code"
                icon={icons.lock}
                iconTintColor="#222"
                value={code}
                onChangeText={setCode}
                keyboardType="numeric"
                autoCapitalize="none"
                containerStyle="w-72 h-14"
                inputStyle="w-72 h-14"
                editable={!isLoading}
              />
              {error ? (
                <Text className="text-red-600 text-sm text-center">{error}</Text>
              ) : null}
              <CustomButton
                title="Reset Password"
                onPress={reset}
                loading={isLoading}
                disabled={isLoading}
                textVariant="default"
                className="mt-4 w-72 h-14 bg-black"
              />
              <TouchableOpacity
                onPress={() => router.back()}
                disabled={isLoading}
                className="mt-8 p-4"
              >
                <Text className="text-blue-600 text-center font-medium">
                  Back to Sign In
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}