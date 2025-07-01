import {
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native";
  
import { InputFieldProps } from "@/types/type";

// Extend InputFieldProps to include iconTintColor
interface AuthInputFieldProps extends InputFieldProps {
  iconTintColor?: string;
}

const InputField = ({
  label,
  icon,
  secureTextEntry = false,
  labelStyle,
  containerStyle,
  inputStyle,
  iconStyle,
  iconTintColor = '#222',
  className, // keeps custom overrides
  ...props
}: AuthInputFieldProps) => {
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View className="my-2 w-full">
          {/* Label */}
          <Text
            className={`text-black text-lg font-InterSemiBold mb-3 ${labelStyle}`}
          >
            {label}
          </Text>
  
          {/* Input wrapper */}
          <View
            className={`flex flex-row items-center bg-[#F2F2F2] rounded-full border border-neutral-200 ${containerStyle}`}
          >
            {/* Optional icon */}
            {icon && (
              <Image source={icon} className={`w-6 h-6 ml-4 ${iconStyle}`} style={{ tintColor: iconTintColor }} />
            )}
  
            {/* Text input */}
            <TextInput
              placeholderTextColor="#0D0D0D"
              className={`flex-1 rounded-full p-4 text-[15px] text-black font-InterSemiBold ${inputStyle}`}
              secureTextEntry={secureTextEntry}
              {...props}
            />
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};
  
export default InputField;
  