import { useUser } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native';

interface VehicleFormData {
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear: string;
  vehicleColor: string;
  vehiclePlate: string;
}

interface DriverUpgradeResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export const options = { headerShown: false };

export default function VerifyDriverScreen() {
  const router = useRouter();
  const { user } = useUser();
  
  const [formData, setFormData] = useState<VehicleFormData>({
    vehicleMake: '',
    vehicleModel: '',
    vehicleYear: '',
    vehicleColor: '',
    vehiclePlate: '',
  });
  
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = (): string | null => {
    const { vehicleMake, vehicleModel, vehicleYear, vehicleColor, vehiclePlate } = formData;
    
    if (!vehicleMake.trim()) return 'Vehicle make is required';
    if (!vehicleModel.trim()) return 'Vehicle model is required';
    if (!vehicleYear.trim()) return 'Vehicle year is required';
    if (!vehicleColor.trim()) return 'Vehicle color is required';
    if (!vehiclePlate.trim()) return 'License plate is required';
    
    const year = parseInt(vehicleYear);
    const currentYear = new Date().getFullYear();
    
    if (isNaN(year) || year < 1900 || year > currentYear + 1) {
      return 'Please enter a valid vehicle year';
    }
    
    if (vehiclePlate.length < 2 || vehiclePlate.length > 20) {
      return 'License plate must be between 2-20 characters';
    }
    
    return null;
  };

  const upgradeToDriver = async (): Promise<void> => {
    try {
      const response = await fetch('/(api)/driver/upgrade', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clerkId: user?.id,
          vehicleMake: formData.vehicleMake.trim(),
          vehicleModel: formData.vehicleModel.trim(),
          vehicleYear: parseInt(formData.vehicleYear),
          vehicleColor: formData.vehicleColor.trim(),
          vehiclePlate: formData.vehiclePlate.trim().toUpperCase(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data: DriverUpgradeResponse = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to register as driver');
      }
    } catch (error) {
      console.error('Driver upgrade failed:', error);
      throw error;
    }
  };

  const handleSubmit = async () => {
    const validationError = validateForm();
    if (validationError) {
      Alert.alert('Validation Error', validationError);
      return;
    }

    if (!user?.id) {
      Alert.alert('Error', 'User not authenticated');
      return;
    }

    setIsLoading(true);
    
    try {
      await upgradeToDriver();
      await user?.reload();
      Alert.alert(
        'Success!',
        'You are now registered as a driver.',
        [{ text: 'Continue', onPress: () => router.replace('/post-ride') }]
      );
    } catch (error) {
      Alert.alert(
        'Registration Failed',
        error instanceof Error ? error.message : 'Failed to register as driver. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const updateFormField = (field: keyof VehicleFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <KeyboardAvoidingView 
      className="flex-1 bg-white"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View className="flex-1 w-full items-center justify-center">
          <ScrollView className="w-full" contentContainerStyle={{ alignItems: 'center', justifyContent: 'center', flexGrow: 1 }} keyboardShouldPersistTaps="handled">
            <View className="w-11/12 max-w-sm mx-auto flex items-center justify-center rounded-3xl bg-white shadow-lg p-3 my-16 border border-gray-100 min-h-[500px]">
              <View className="mb-12 w-full items-center">
                <Text className="text-4xl font-InterBold text-black mb-3 mt-4 text-center">
                  Become a Driver
                </Text>
                <Text className="text-lg text-gray-600 text-center">
                  Enter details to start offering rides.
                </Text>
              </View>
              <View className="space-y-5 w-full items-center">
                <View className="w-64 mb-1">
                  <Text className="text-base font-medium text-gray-700 mb-3 ml-1">
                    Vehicle Make *
                  </Text>
                  <TextInput
                    placeholder="e.g., Toyota, Honda, Ford"
                    value={formData.vehicleMake}
                    onChangeText={(text) => updateFormField('vehicleMake', text)}
                    className="border border-gray-300 rounded-2xl p-3 text-base bg-white"
                    autoCapitalize="words"
                  />
                </View>
                <View className="w-64 mb-1">
                  <Text className="text-base font-medium text-gray-700 mb-3 ml-1">
                    Vehicle Model *
                  </Text>
                  <TextInput
                    placeholder="e.g., Camry, Civic, Focus"
                    value={formData.vehicleModel}
                    onChangeText={(text) => updateFormField('vehicleModel', text)}
                    className="border border-gray-300 rounded-2xl p-3 text-base bg-white"
                    autoCapitalize="words"
                  />
                </View>
                <View className="w-64 mb-1">
                  <Text className="text-base font-medium text-gray-700 mb-3 ml-1">
                    Vehicle Year *
                  </Text>
                  <TextInput
                    placeholder="e.g., 2020"
                    value={formData.vehicleYear}
                    onChangeText={(text) => updateFormField('vehicleYear', text)}
                    className="border border-gray-300 rounded-2xl p-3 text-base bg-white"
                    keyboardType="numeric"
                    maxLength={4}
                  />
                </View>
                <View className="w-64 mb-1">
                  <Text className="text-base font-medium text-gray-700 mb-3 ml-1">
                    Vehicle Color *
                  </Text>
                  <TextInput
                    placeholder="e.g., Black, White, Silver"
                    value={formData.vehicleColor}
                    onChangeText={(text) => updateFormField('vehicleColor', text)}
                    className="border border-gray-300 rounded-2xl p-3 text-base bg-white"
                    autoCapitalize="words"
                  />
                </View>
                <View className="w-64 mb-1">
                  <Text className="text-base font-medium text-gray-700 mb-3 ml-1">
                    License Plate *
                  </Text>
                  <TextInput
                    placeholder="e.g., ABC123"
                    value={formData.vehiclePlate}
                    onChangeText={(text) => updateFormField('vehiclePlate', text)}
                    className="border border-gray-300 rounded-2xl p-3 text-base bg-white"
                    autoCapitalize="characters"
                    maxLength={20}
                  />
                </View>
              </View>
              <TouchableOpacity
                onPress={handleSubmit}
                disabled={isLoading}
                className="mt-8 rounded-2xl p-3 w-64 bg-black items-center justify-center shadow-lg"
                style={{ opacity: isLoading ? 0.7 : 1 }}
              >
                <Text className="text-white text-center font-bold text-base">
                  {isLoading ? 'Registering...' : 'Register as Driver'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => router.back()}
                disabled={isLoading}
                className="mt-4 p-2"
              >
                <Text className="text-gray-600 text-center text-sm">Cancel</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}