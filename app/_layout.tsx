import { Stack } from "expo-router";
import { ThemeProvider, DarkTheme } from "@react-navigation/native";
import { colors } from "../ui/theme";
import { useEffect, useState } from "react";
import { initDb } from "../core/db/init";
import { View, ActivityIndicator } from "react-native";
import XPPopup from "../ui/components/XPPopup";

export default function RootLayout() {
  const [ready, setReady] = useState(false);

  // initialize database before any screen renders
  useEffect(() => {
    const init = () => {
      initDb();
      setReady(true);
    };

    init();
  }, []);

  const AppTheme = {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      background: colors.background,
      card: colors.background,
    },
  };

  // block rendering until DB is ready
  if (!ready) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.background,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator size="large" color={colors.buttonActive} />
      </View>
    );
  }

  return (
    <ThemeProvider value={AppTheme}>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      />

      <XPPopup />
    </ThemeProvider>
  );
}