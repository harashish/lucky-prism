import { View, TouchableOpacity } from "react-native";
import AppText from "./AppText";
import { colors } from "../theme";

type Props = {
  title: string;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
};

export default function FormToggleSection({
  title,
  expanded,
  onToggle,
  children,
}: Props) {
  return (
    <View>
      <TouchableOpacity
        onPress={onToggle}
        style={{ marginBottom: 6 }}
      >
        <AppText
          style={{
            fontSize: 12,
            color: colors.muted,
            marginVertical: 12,
            textTransform: "uppercase",
            letterSpacing: 1,
          }}
        >
          {title}
        </AppText>
      </TouchableOpacity>

      {expanded && children}
    </View>
  );
}