import { TouchableOpacity, View } from "react-native";
import { colors, radius } from "../theme";
import AppText from "./AppText";

type Option<T> = {
  label: string;
  value: T;
};

type Props<T> = {
  options: Option<T>[];
  selected?: T | T[];
  onSelect: (v: T) => void;
  multiple?: boolean;
};

export function SelectChips<T>({
  options,
  selected,
  onSelect,
  multiple,
}: Props<T>) {
const isSelected = (v: T) => {
    if (!selected) return false;

    return multiple
      ? (selected as T[]).includes(v)
      : selected === v;
  };
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
      {options.map((o) => {
        const active = isSelected(o.value);

        return (
          <TouchableOpacity
            key={String(o.value)}
            onPress={() => onSelect(o.value)}
            style={{
              paddingVertical: 8,
              paddingHorizontal: 14,
              borderRadius: radius.sm,
              backgroundColor: active
                ? colors.buttonActive
                : colors.card,
            }}
          >
            <AppText>{o.label}</AppText>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}