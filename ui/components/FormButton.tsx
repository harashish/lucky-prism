import { TouchableOpacity } from "react-native";
import { colors, radius, spacing } from "../theme";
import AppText from "./AppText";

type Props = {
  label: string;
  onPress: () => void;
  variant?: "primary" | "danger";
};

export default function FormButton({
  label,
  onPress,
  variant = "primary",
}: Props) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        backgroundColor:
          variant === "danger"
            ? colors.buttonDelete
            : colors.buttonActive,
        padding: spacing.m,
        borderRadius: radius.md,
        alignItems: "center",
        marginTop: spacing.m,
      }}
    >
      <AppText>{label}</AppText>
    </TouchableOpacity>
  );
}