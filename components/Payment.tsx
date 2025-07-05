import { useAuth } from "@clerk/clerk-expo";
import { useStripe } from "@stripe/stripe-react-native";
import { router } from "expo-router";
import React, { useState } from "react";
import { Alert, Image, Text, View } from "react-native";
import { ReactNativeModal } from "react-native-modal";

import CustomButton from "@/components/CustomButton";
import { icons } from "@/constants";
import { fetchAPI } from "@/lib/fetch";
import { useLocationStore } from "@/store";

interface PaymentProps {
  fullName: string;
  email: string;
  amount: string;
  rideId: string; // Changed from driverId to rideId for booking
  driverId?: number; // Keep for compatibility but not the primary field
  rideTime: number;
  seatsRequested?: number; // Number of seats to book (default 1)
}

const Payment = ({
  fullName,
  email,
  amount,
  rideId,
  driverId,
  rideTime,
  seatsRequested = 1,
}: PaymentProps) => {
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const {
    userAddress,
    userLongitude,
    userLatitude,
    destinationLatitude,
    destinationAddress,
    destinationLongitude,
  } = useLocationStore();

  const { userId } = useAuth();
  const [success, setSuccess] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const openPaymentSheet = async () => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    
    try {
      await initializePaymentSheet();
      const { error } = await presentPaymentSheet();

      if (error) {
        Alert.alert(`Payment Error: ${error.code}`, error.message);
      } else {
        setSuccess(true);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to process payment. Please try again.');
      console.error('Payment error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const initializePaymentSheet = async () => {
    const { error } = await initPaymentSheet({
      merchantDisplayName: "Loop Rideshare",
      intentConfiguration: {
        mode: {
          amount: parseInt(amount) * 100, // Convert to cents
          currencyCode: "usd",
        },
        confirmHandler: async (
          paymentMethod,
          shouldSavePaymentMethod,
          intentCreationCallback,
        ) => {
          try {
            console.log('Creating payment intent...');
            
            // Step 1: Create Stripe payment intent
            const { paymentIntent, customer } = await fetchAPI(
              "/(api)/(stripe)/create",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  name: fullName || email.split("@")[0],
                  email: email,
                  amount: amount,
                  paymentMethodId: paymentMethod.id,
                }),
              },
            );

            if (!paymentIntent.client_secret) {
              throw new Error('Failed to create payment intent');
            }

            console.log('Processing payment...');
            
            // Step 2: Process the payment
            const { result } = await fetchAPI("/(api)/(stripe)/pay", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                payment_method_id: paymentMethod.id,
                payment_intent_id: paymentIntent.id,
                customer_id: customer,
                client_secret: paymentIntent.client_secret,
              }),
            });

            if (!result.client_secret) {
              throw new Error('Payment processing failed');
            }

            console.log('Payment successful, creating booking...');
            
            // Step 3: Create the booking in our database
            const bookingResult = await fetchAPI("/(api)/bookings/create", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                clerkId: userId,
                rideId: rideId,
                seatsRequested: seatsRequested,
                paymentIntentId: paymentIntent.id,
              }),
            });

            if (!bookingResult.success) {
              throw new Error(bookingResult.error || 'Failed to create booking');
            }

            console.log('Booking created successfully:', bookingResult.bookingId);

            // Step 4: Return the client secret to complete the payment
            intentCreationCallback({
              clientSecret: result.client_secret,
            });

          } catch (error) {
            console.error('Payment confirmation error:', error);
            
            // Show user-friendly error message
            const errorMessage = error instanceof Error ? error.message : 'Payment failed';
            Alert.alert('Booking Failed', errorMessage);
            
            // Call the callback with an error to fail the payment
            intentCreationCallback({
              error: {
                code: 'Failed',
                message: errorMessage,
              }
            });
          }
        },
      },
      returnURL: "myapp://book-ride",
    });

    if (error) {
      console.error('Payment sheet initialization error:', error);
      throw new Error('Failed to initialize payment');
    }
  };

  return (
    <>
      <CustomButton
        title={isProcessing ? "Processing..." : "Confirm Ride"}
        className="my-10"
        onPress={openPaymentSheet}
        disabled={isProcessing}
      />

      <ReactNativeModal
        isVisible={success}
        onBackdropPress={() => setSuccess(false)}
      >
        <View className="flex flex-col items-center justify-center bg-white p-7 rounded-2xl">
          <Image source={icons.check} className="w-28 h-28 mt-5" />

          <Text className="text-2xl text-center font-JakartaBold mt-5">
            Ride Booked Successfully!
          </Text>

          <Text className="text-md text-general-200 font-JakartaRegular text-center mt-3">
            Your seat{seatsRequested > 1 ? 's have' : ' has'} been reserved. 
            The driver will pick you up from {userAddress} at the scheduled time.
          </Text>

          <View className="bg-gray-100 rounded-lg p-4 mt-4 w-full">
            <Text className="text-sm text-gray-600 text-center">
              <Text className="font-semibold">Pickup:</Text> {userAddress}
            </Text>
            <Text className="text-sm text-gray-600 text-center mt-1">
              <Text className="font-semibold">Destination:</Text> {destinationAddress}
            </Text>
            <Text className="text-sm text-gray-600 text-center mt-1">
              <Text className="font-semibold">Seats booked:</Text> {seatsRequested}
            </Text>
            <Text className="text-sm text-gray-600 text-center mt-1">
              <Text className="font-semibold">Total paid:</Text> ${(parseFloat(amount) * seatsRequested).toFixed(2)}
            </Text>
          </View>

          <CustomButton
            title="View My Rides"
            onPress={() => {
              setSuccess(false);
              router.push("/(root)/(tabs)/rides"); // Navigate to rides history
            }}
            className="mt-5 w-full"
          />
          
          <CustomButton
            title="Back Home"
            onPress={() => {
              setSuccess(false);
              router.push("/(root)/(tabs)/home");
            }}
            className="mt-3 w-full bg-gray-100"
            textVariant="primary"
          />
        </View>
      </ReactNativeModal>
    </>
  );
};

export default Payment;