import { View } from "react-native";
import AppText from "./AppText";
import { colors } from "../theme";

type Props = {
  children: string;
  centered?: boolean;
};

export default function SectionLabel({ children, centered = true }: Props) {
  return (
    <View
      style={{
        alignItems: centered ? "center" : "flex-start",
        marginBottom: 10,
      }}
    >
      <AppText
        style={{
          fontSize: 11,
          letterSpacing: 1,
          color: colors.muted,
          textTransform: "uppercase",
        }}
      >
        {children}
      </AppText>
    </View>
  );
}