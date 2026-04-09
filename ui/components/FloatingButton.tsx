import { TouchableOpacity, StyleSheet } from "react-native";
import AppText from "./AppText";
import { colors } from "../theme";

export default function FloatingButton({ onPress, style, children }: any) {
  return (
    <TouchableOpacity onPress={onPress} style={[styles.button, style]}>
      {children ?? <AppText style={{ fontSize: 32 }}>+</AppText>}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    position: "absolute",
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.buttonActive,
    justifyContent: "center",
    alignItems: "center",
  },
});