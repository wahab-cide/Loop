import { ButtonProps } from "@/types/type";
import { Text, TouchableOpacity } from "react-native";

/* ───────────────────────── helpers ───────────────────────── */

const getBgVariantStyle = (variant: ButtonProps["bgVariant"]) => {
  switch (variant) {
    case "secondary":
      return "bg-neutral-200";                // muted gray surface
    case "danger":
      return "bg-red-700";                    // Loop danger red
    case "success":
      return "bg-green-700";                  // Loop success green
    case "outline":
      return "bg-transparent border border-neutral-200";
    default:
      return "bg-brand-600";                  // primary brand blue 🟦
  }
};

const getTextVariantStyle = (variant: ButtonProps["textVariant"]) => {
  switch (variant) {
    case "primary":
      return "text-bg.page";                  // black text on white btn
    case "secondary":
      return "text-text-secondary";           // muted gray
    case "danger":
      return "text-red-100";
    case "success":
      return "text-green-100";
    default:
      return "text-white";                    // default on brand blue
  }
};

/* ───────────────────────── component ───────────────────────── */

const CustomButton = ({
  onPress,
  title,
  bgVariant = "primary",
  textVariant = "default",
  IconLeft,
  IconRight,
  className = "",
  ...props
}: ButtonProps) => (
  <TouchableOpacity
    onPress={onPress}
    className={`w-72 max-w-full h-14 rounded-full flex flex-row justify-center items-center shadow-md shadow-neutral-700 ${getBgVariantStyle(
      bgVariant,
    )} ${className}`}
    {...props}
  >
    {IconLeft && <IconLeft />}
    <Text className={`text-lg font-bold ${getTextVariantStyle(textVariant)}`}>
      {title}
    </Text>
    {IconRight && <IconRight />}
  </TouchableOpacity>
);

export default CustomButton;
