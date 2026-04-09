import { View, ViewProps } from "react-native";
import { colors, radius, spacing } from "../theme";

type Props = ViewProps & {
  variant?: "primary" | "secondary";
};

export default function Card({
  children,
  style,
  variant = "primary",
  ...rest
}: Props) {
  return (
    <View
      style={[
        {
          backgroundColor:
            variant === "primary"
              ? colors.card
              : colors.cardSecondary,
          borderRadius: radius.lg,
          padding: spacing.m,
        },
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
}