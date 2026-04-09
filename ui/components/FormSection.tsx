import { View } from "react-native";
import AppText from "./AppText";
import { spacing } from "../theme";

export default function FormSection({
  title,
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <View style={{ marginBottom: spacing.m }}>
      <AppText
        style={{
          fontWeight: "700",
          marginBottom: 10,
        }}
      >
        {title}
      </AppText>

      {children}
    </View>
  );
}