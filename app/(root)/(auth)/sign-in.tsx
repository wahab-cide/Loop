import { useSignIn } from "@clerk/clerk-expo";
import { Link, router } from "expo-router";
import { useCallback, useState } from "react";
import { Alert, Keyboard, Text, TouchableWithoutFeedback, View } from "react-native";

import CustomButton from "@/components/CustomButton";
import InputField from "@/components/InputField";
import OAuth from "@/components/OAuth";
import { icons } from "@/constants";
import { SafeAreaView } from "react-native-safe-area-context";

const SignIn = () => {
  const { signIn, setActive, isLoaded } = useSignIn();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const onSignInPress = useCallback(async () => {
    if (!isLoaded) return;

    try {
      const signInAttempt = await signIn.create({
        identifier: form.email,
        password: form.password,
      });

      if (signInAttempt.status === "complete") {
        await setActive({ session: signInAttempt.createdSessionId });
        router.push(`/(root)/(tabs)/home`);
      } else {
        // See https://clerk.com/docs/custom-flows/error-handling for more info on error handling
        console.log(JSON.stringify(signInAttempt, null, 2));
        Alert.alert("Error", "Log in failed. Please try again.");
      }
    } catch (err: any) {
      console.log(JSON.stringify(err, null, 2));
      Alert.alert("Error", err.errors[0].longMessage);
    }
  }, [isLoaded, form]);

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
              title="Sign In"
              onPress={onSignInPress}
              className="mt-4 w-72 h-14"
            />
            <OAuth title="Log In with Google" />
            <Link
              href="/sign-up"
              className="text-lg text-center text-general-200 mt-6"
            >
              Don't have an account?{" "}
              <Text className="text-primary-500">Sign Up</Text>
            </Link>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
};

export default SignIn;