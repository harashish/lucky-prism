import { View } from "react-native";
import AppText from "./AppText";
import { colors, radius } from "../theme";
import { Priority } from "../../features/gamification/priority";

type Props = {
  priority?: Priority;
};

export default function PriorityBadge({ priority }: Props) {
  if (!priority) return null;

  return (
    <View
      style={{
        backgroundColor: colors.priority[priority],
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: radius.sm,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <AppText
        style={{
          fontSize: 10,
          lineHeight: 21,
          fontWeight: "700",
          color: "#000",
        }}
      >
        {priority}
      </AppText>
    </View>
  );
}