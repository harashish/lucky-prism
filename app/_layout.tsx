import { Stack } from "expo-router";
import { ThemeProvider, DarkTheme } from "@react-navigation/native";
import { colors } from "../ui/theme";
import { useEffect, useState } from "react";
import { initDb } from "../core/db/init";
import { View, ActivityIndicator } from "react-native";
import XPPopup from "../ui/components/XPPopup";
import { useGamificationStore } from "../features/gamification/gamification.store";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { useFonts } from "expo-font";
import { fontsToLoad } from "../ui/theme/fonts";
import { useMoodStore } from "../features/mood/mood.store";
import { useSettingsStore } from "../features/settings/settings.store";

export default function RootLayout() {
  const [ready, setReady] = useState(false);
  const [fontsLoaded] = useFonts(fontsToLoad);

  // initialize database before any screen renders
  /*useEffect(() => {
  initDb();
    useGamificationStore.getState().init();
    useMoodStore.getState().loadAll();
    useSettingsStore.getState().load();
    setReady(true);
  }, []);*/

  useEffect(() => {
  const init = async () => {
      await initDb();
      await Promise.all([
        useGamificationStore.getState().init(),
        useMoodStore.getState().loadAll(),
        useSettingsStore.getState().load(),
      ]);
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

  if (!ready || !fontsLoaded) {
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
    <GestureHandlerRootView style={{ flex: 1 }}>
    <ThemeProvider value={AppTheme}>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      />

      <XPPopup />
    </ThemeProvider>
   </GestureHandlerRootView> 
  );
}