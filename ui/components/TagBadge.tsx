import { View } from "react-native";
import AppText from "./AppText";
import { colors, radius } from "../theme";

type Props = {
  label: string;
  color?: string;
};

export default function TagBadge({ label, color }: Props) {
  return (
    <View
      style={{
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: radius.sm,
        backgroundColor: color || colors.cardSecondary,
      }}
    >
      <AppText
        style={{
          fontSize: 10,
          fontWeight: "700",
          color: colors.text,
        }}
      >
        {label}
      </AppText>
    </View>
  );
}