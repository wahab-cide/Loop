import { useSignUp } from "@clerk/clerk-expo";
import { Link, router } from "expo-router";
import { useState } from "react";
import { Alert, Keyboard, Text, TouchableWithoutFeedback, View } from "react-native";
import { ReactNativeModal } from "react-native-modal";

import CustomButton from "@/components/CustomButton";
import InputField from "@/components/InputField";
import OAuth from "@/components/OAuth";
import { icons } from "@/constants";
import { fetchAPI } from "@/lib/fetch";
import { SafeAreaView } from "react-native-safe-area-context";

const SignUp = () => {
  const { isLoaded, signUp, setActive } = useSignUp();
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [verification, setVerification] = useState({
    state: "default",
    error: "",
    code: "",
  });

  const onSignUpPress = async () => {
    if (!isLoaded) return;
    try {
      await signUp.create({
        emailAddress: form.email,
        password: form.password,
      });
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setVerification({
        ...verification,
        state: "pending",
      });
    } catch (err: any) {
      // See https://clerk.com/docs/custom-flows/error-handling
      // for more info on error handling
      console.log(JSON.stringify(err, null, 2));
      Alert.alert("Error", err.errors[0].longMessage);
    }
  };
  const onPressVerify = async () => {
    if (!isLoaded) return;
    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code: verification.code,
      });
      if (completeSignUp.status === "complete") {
        await setActive({ session: completeSignUp.createdSessionId });
        router.replace("/(root)/(tabs)/home");
        // Fire and forget the API call
        fetchAPI("/(api)/user", {
          method: "POST",
          body: JSON.stringify({
            name: form.name,
            email: form.email,
            clerkId: completeSignUp.createdUserId,
          }),
        }).catch(console.error);
        return;
      } else {
        setVerification({
          ...verification,
          error: "Verification failed. Please try again.",
          state: "failed",
        });
      }
    } catch (err: any) {
      // See https://clerk.com/docs/custom-flows/error-handling
      // for more info on error handling
      setVerification({
        ...verification,
        error: err.errors[0].longMessage,
        state: "failed",
      });
    }
  };
  return (
    <SafeAreaView className="flex-1 bg-white">
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View className="flex-1 bg-white items-center justify-center pt-12">
          {/* Logo and Branding */}
          <View className="flex-row items-center mb-8">
            <View className="w-10 h-10 rounded-full bg-black items-center justify-center mr-3">
              <View className="w-3 h-3 rounded-full bg-white" />
            </View>
            <Text className="text-3xl font-InterBold text-black">Loop</Text>
          </View>
          <View className="w-full items-center">
            <InputField
              label="Name"
              placeholder="Enter name"
              icon={icons.person}
              iconTintColor="#222"
              value={form.name}
              onChangeText={(value) => setForm({ ...form, name: value })}
              containerStyle="w-72 h-14"
              inputStyle="w-72 h-14"
            />
            <InputField
              label="Email"
              placeholder="Enter email"
              icon={icons.email}
              iconTintColor="#222"
              textContentType="emailAddress"
              value={form.email}
              onChangeText={(value) => setForm({ ...form, email: value })}
              containerStyle="w-72 h-14"
              inputStyle="w-72 h-14"
            />
            <InputField
              label="Password"
              placeholder="Enter password"
              icon={icons.lock}
              iconTintColor="#222"
              secureTextEntry={true}
              textContentType="password"
              value={form.password}
              onChangeText={(value) => setForm({ ...form, password: value })}
              containerStyle="w-72 h-14"
              inputStyle="w-72 h-14"
            />
            <CustomButton
              title="Sign Up"
              onPress={onSignUpPress}
              className="mt-4 w-72 h-14"
            />
            <OAuth title="Sign Up with Google" />
            <Link
              href="/sign-in"
              className="text-lg text-center text-general-200 mt-6"
            >
              Already have an account?{" "}
              <Text className="text-primary-500">Sign In</Text>
            </Link>
          </View>
          <ReactNativeModal
            isVisible={verification.state === "pending"}
            // No longer needed: onModalHide
          >
            <View className="bg-white px-7 py-9 rounded-2xl min-h-[300px] items-center">
              <Text className="font-JakartaExtraBold text-2xl mb-2">
                Verification
              </Text>
              <Text className="font-Jakarta mb-5">
                We've sent a verification code to {form.email}.
              </Text>
              <InputField
                label={"Code"}
                icon={icons.lock}
                iconTintColor="#222"
                placeholder={"12345"}
                value={verification.code}
                keyboardType="numeric"
                onChangeText={(code) =>
                  setVerification({ ...verification, code })
                }
                containerStyle="w-72 h-14"
                inputStyle="w-72 h-14"
              />
              {verification.error && (
                <Text className="text-red-500 text-sm mt-1">
                  {verification.error}
                </Text>
              )}
              <CustomButton
                title="Verify Email"
                onPress={onPressVerify}
                className="mt-4 w-72 h-14 bg-success-500"
              />
            </View>
          </ReactNativeModal>
        </View>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
};
export default SignUp;