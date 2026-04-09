import { TouchableOpacity, View } from "react-native";
import { colors, radius } from "../theme";
import AppText from "./AppText";

type Props<T> = {
  options: T[];
  selected: T | T[];
  onSelect: (v: T) => void;
  multiple?: boolean;
};

export function SelectChips<T extends string>({
  options,
  selected,
  onSelect,
  multiple,
}: Props<T>) {
  const isSelected = (v: T) =>
    multiple
      ? (selected as T[]).includes(v)
      : selected === v;

  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
      {options.map((o) => {
        const active = isSelected(o);

        return (
          <TouchableOpacity
            key={o}
            onPress={() => onSelect(o)}
            style={{
            paddingVertical: 8,
            paddingHorizontal: 14,
            borderRadius: radius.sm,
              backgroundColor: active
                ? colors.buttonActive
                : colors.card,
            }}
          >
            <AppText>{o}</AppText>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}