// File: app/post-ride.tsx
import GoogleTextInput from '@/components/GoogleTextInput';
import { icons } from '@/constants';
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
  View,
} from 'react-native';

interface RideFormData {
  originLabel: string;
  destinationLabel: string;
  originLat: number | null;
  originLng: number | null;
  destinationLat: number | null;
  destinationLng: number | null;
  departureDate: string;
  departureTime: string;
  seatsTotal: string;
  price: string;
}

interface CreateRideResponse {
  success: boolean;
  rideId?: string;
  message?: string;
  error?: string;
}

export default function PostRideScreen() {
  const router = useRouter();
  const { user } = useUser();


  const [formData, setFormData] = useState<RideFormData>({
    originLabel: '',
    destinationLabel: '',
    originLat: null,
    originLng: null,
    destinationLat: null,
    destinationLng: null,
    departureDate: '',
    departureTime: '',
    seatsTotal: '',
    price: '',
  });


  const [isLoading, setIsLoading] = useState(false);

  const validateForm = (): string | null => {
    const {
      originLabel,
      destinationLabel,
      originLat,
      originLng,
      destinationLat,
      destinationLng,
      departureDate,
      departureTime,
      seatsTotal,
      price,
    } = formData;

    if (!originLabel.trim()) return 'Origin location is required';
    if (!destinationLabel.trim()) return 'Destination location is required';
    if (originLat === null || originLng === null) return 'Please select a valid origin location';
    if (destinationLat === null || destinationLng === null) return 'Please select a valid destination location';
    if (!seatsTotal.trim()) return 'Number of seats is required';
    if (!price.trim()) return 'Price is required';

    // Validate seats
    const seats = parseInt(seatsTotal);
    if (isNaN(seats) || seats < 1 || seats > 8) {
      return 'Seats must be between 1 and 8';
    }

    // Validate price
    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum <= 0) {
      return 'Price must be a positive number';
    }

    // Basic date format validation
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    const timeRegex = /^\d{2}:\d{2}$/;
    
    if (!dateRegex.test(departureDate)) {
      return 'Please enter date in YYYY-MM-DD format';
    }
    
    if (!timeRegex.test(departureTime)) {
      return 'Please enter time in HH:MM format';
    }
    
    // Validate departure time is in the future
    const departureDateTime = new Date(`${departureDate}T${departureTime}`);
    if (departureDateTime <= new Date()) {
      return 'Departure time must be in the future';
    }

    return null;
  };

  const createRide = async (): Promise<void> => {
    const departureDateTime = new Date(`${formData.departureDate}T${formData.departureTime}`);
    const requestBody = {
      clerkId: user?.id,
      originLabel: formData.originLabel.trim(),
      originLat: formData.originLat,
      originLng: formData.originLng,
      destinationLabel: formData.destinationLabel.trim(),
      destinationLat: formData.destinationLat,
      destinationLng: formData.destinationLng,
      departureTime: departureDateTime.toISOString(),
      seatsTotal: parseInt(formData.seatsTotal),
      price: parseFloat(formData.price),
    };

    try {
      const response = await fetch('/(api)/rides/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data: CreateRideResponse = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to create ride');
      }
    } catch (error) {
      console.error('Create ride failed:', error);
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
      await createRide();

      Alert.alert(
        'Success!',
        'Your ride has been posted successfully.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error) {
      Alert.alert(
        'Failed to Post Ride',
        error instanceof Error ? error.message : 'Failed to create ride. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const updateFormField = (field: keyof RideFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleOriginSelect = (location: { latitude: number; longitude: number; address: string }) => {
    setFormData(prev => ({
      ...prev,
      originLabel: location.address,
      originLat: location.latitude,
      originLng: location.longitude,
    }));
  };

  const handleDestinationSelect = (location: { latitude: number; longitude: number; address: string }) => {
    setFormData(prev => ({
      ...prev,
      destinationLabel: location.address,
      destinationLat: location.latitude,
      destinationLng: location.longitude,
    }));
  };


  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <ScrollView className="flex-1 bg-white" contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 20, paddingVertical: 40 }} keyboardShouldPersistTaps="handled">
          <View className="w-full items-center justify-center">
            <View className="mb-12 w-full items-center">
              <Text className="text-4xl font-InterBold text-black mb-3 mt-4 text-center">
                Post a Ride
              </Text>
              <Text className="text-lg text-gray-600 text-center">
                Enter ride details below.
              </Text>
            </View>
            <View className="space-y-5 w-full items-center">
              <View className="w-full mb-1">
                <Text className="text-base font-medium text-gray-700 mb-3 ml-1">
                  Origin *
                </Text>
                <GoogleTextInput
                  icon={icons.search}
                  placeholder="From"
                  containerStyle="bg-white border border-gray-300 rounded-2xl w-full"
                  handlePress={handleOriginSelect}
                />
              </View>
              <View className="w-full mb-1">
                <Text className="text-base font-medium text-gray-700 mb-3 ml-1">
                  Destination *
                </Text>
                <GoogleTextInput
                  icon={icons.search}
                  placeholder="To"
                  containerStyle="bg-white border border-gray-300 rounded-2xl w-full"
                  handlePress={handleDestinationSelect}
                />
              </View>
              <View className="w-full mb-1">
                <Text className="text-base font-medium text-gray-700 mb-3 ml-1">
                  Departure Date *
                </Text>
                <TextInput
                  placeholder="YYYY-MM-DD"
                  value={formData.departureDate}
                  onChangeText={(text) => updateFormField('departureDate', text)}
                  className="border border-gray-300 rounded-2xl p-3 text-base bg-white w-full"
                  keyboardType={Platform.OS === 'ios' ? 'numbers-and-punctuation' : 'default'}
                />
              </View>
              <View className="w-full mb-1">
                <Text className="text-base font-medium text-gray-700 mb-3 ml-1">
                  Departure Time *
                </Text>
                <TextInput
                  placeholder="HH:MM"
                  value={formData.departureTime}
                  onChangeText={(text) => updateFormField('departureTime', text)}
                  className="border border-gray-300 rounded-2xl p-3 text-base bg-white w-full"
                  keyboardType={Platform.OS === 'ios' ? 'numbers-and-punctuation' : 'default'}
                />
              </View>
              <View className="w-full mb-1">
                <Text className="text-base font-medium text-gray-700 mb-3 ml-1">
                  Seats Available *
                </Text>
                <TextInput
                  placeholder="e.g., 3"
                  value={formData.seatsTotal}
                  onChangeText={(text) => updateFormField('seatsTotal', text)}
                  className="border border-gray-300 rounded-2xl p-3 text-base bg-white w-full"
                  keyboardType="numeric"
                />
              </View>
              <View className="w-full mb-1">
                <Text className="text-base font-medium text-gray-700 mb-3 ml-1">
                  Price *
                </Text>
                <TextInput
                  placeholder="e.g., 10.00"
                  value={formData.price}
                  onChangeText={(text) => updateFormField('price', text)}
                  className="border border-gray-300 rounded-2xl p-3 text-base bg-white w-full"
                  keyboardType="numeric"
                />
              </View>
            </View>
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={isLoading}
              className="mt-8 rounded-2xl p-3 w-full bg-black items-center justify-center"
              style={{ opacity: isLoading ? 0.7 : 1 }}
            >
              <Text className="text-white text-center font-bold text-base">
                {isLoading ? 'Posting...' : 'Post Ride'}
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
      </TouchableWithoutFeedback>
      
    </KeyboardAvoidingView>
  );
}