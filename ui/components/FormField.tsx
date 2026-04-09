import { View, TextInput } from "react-native";
import AppText from "./AppText";
import { colors, spacing, radius } from "../theme";

type Props = {
  label?: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
  placeholder?: string;
};

export default function FormField({
  label,
  value,
  onChange,
  multiline,
  placeholder,
}: Props) {
  return (
    <View style={{ marginBottom: spacing.m }}>
      {label && (
        <AppText
          style={{
            fontSize: 12,
            color: colors.muted,
            marginBottom: 6,
          }}
        >
          {label}
        </AppText>
      )}

      <TextInput
        value={value}
        onChangeText={onChange}
        multiline={multiline}
        cursorColor={colors.buttonActive}
        selectionColor={colors.buttonActive}
        style={{
          backgroundColor: colors.card,
          padding: 12,
          borderRadius: radius.md,
          color: colors.text,
          minHeight: multiline ? 100 : undefined,
          textAlignVertical: multiline ? "top" : "center",
        }}
      />
    </View>
  );
}