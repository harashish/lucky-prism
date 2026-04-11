import { View } from "react-native";
import AppText from "./AppText";
import { colors, radius } from "../theme";
import { Difficulty } from "../../features/gamification/difficulty";

type Props = {
  difficulty: Difficulty;
};

export default function DifficultyBadge({ difficulty }: Props) {
  const color = colors.difficulty[difficulty];

  return (
    <View
      style={{
        backgroundColor: color,
        paddingHorizontal: 10,
        paddingVertical: 2,
        borderRadius: radius.sm,
        marginLeft: 4,
      }}
    >
      <AppText
        style={{
          fontSize: 10,
          fontWeight: "700",
          color: "#000",

        }}
      >
        {difficulty}
      </AppText>
    </View>
  );
}