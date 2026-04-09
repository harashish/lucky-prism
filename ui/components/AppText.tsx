import { Text, TextProps } from "react-native";
import { colors, fonts } from "../theme";

export default function AppText({ style, ...props }: TextProps) {
  return (
    <Text
      {...props}
      style={[
        {
          color: colors.text,
          fontFamily: fonts.poppinsRegular,
          lineHeight: 20,
        },
        style,
      ]}
    />
  );
}
