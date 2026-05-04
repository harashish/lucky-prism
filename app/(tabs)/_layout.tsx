import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { View } from "react-native";
import { colors } from "../../ui/theme";
import { ComponentProps, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSettingsStore } from "../../features/settings/settings.store";

type IconName = ComponentProps<typeof Ionicons>["name"];

const TAB_CONFIG: Record<
  string,
  { icon: IconName; outline: IconName }
> = {
  HabitScreen: { icon: "repeat", outline: "repeat-outline" },
  MoodScreen: { icon: "happy", outline: "happy-outline" },
  GoalScreen: { icon: "flag", outline: "flag-outline" },
  GamificationScreen: { icon: "game-controller", outline: "game-controller-outline" },
  TodoScreen: { icon: "checkbox", outline: "checkbox-outline" },
  ChallengeScreen: { icon: "flame", outline: "flame-outline" },
  SobrietyScreen: { icon: "link", outline: "link-outline" },
  NoteScreen: { icon: "document-text", outline: "document-text-outline" },
  SettingsScreen: { icon: "settings", outline: "settings-outline" },
};

export default function TabsLayout() {
  const load = useSettingsStore((s) => s.load);
  const settings = useSettingsStore((s) => s.settings);
  const getBool = useSettingsStore((s) => s.getBool);

  useEffect(() => {
    load();
  }, []);

    if (!Object.keys(settings).length) return null;

  const isVisible = (routeName: string) => {
    return getBool(`module_${routeName}`);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <Tabs
        screenOptions={({ route }) => {
          const config =
            TAB_CONFIG[route.name as keyof typeof TAB_CONFIG];

          return {
            headerShown: false,
            tabBarShowLabel: false,

            tabBarStyle: {
              backgroundColor: "#15151a",
              borderTopColor: "transparent",
              height: 68,
              paddingBottom: 8,
              paddingTop: 6,
            },

            tabBarIcon: ({ focused }) => {
              if (!config) return null;

              return (
                <View
                  style={{
                    alignItems: "center",
                    justifyContent: "center",
                    minWidth: 80,
                    height: 40,
                    marginTop: 25,
                  }}
                >
                  <Ionicons
                    name={focused ? config.icon : config.outline}
                    size={20}
                    color={
                      focused ? colors.accent : colors.muted
                    }
                  />
                </View>
              );
            },
          };
        }}
      >
        <Tabs.Screen
          name="HabitScreen"
          options={{ href: isVisible("HabitScreen") ? undefined : null }}
        />
        <Tabs.Screen
          name="MoodScreen"
          options={{ href: isVisible("MoodScreen") ? undefined : null }}
        />
        <Tabs.Screen
          name="GoalScreen"
          options={{ href: isVisible("GoalScreen") ? undefined : null }}
        />
        <Tabs.Screen
          name="ChallengeScreen"
          options={{ href: isVisible("ChallengeScreen") ? undefined : null }}
        />
        <Tabs.Screen
          name="TodoScreen"
          options={{ href: isVisible("TodoScreen") ? undefined : null }}
        />
        <Tabs.Screen
          name="SobrietyScreen"
          options={{ href: isVisible("SobrietyScreen") ? undefined : null }}
        />
        <Tabs.Screen
          name="NoteScreen"
          options={{ href: isVisible("NoteScreen") ? undefined : null }}
        />
        <Tabs.Screen
          name="GamificationScreen"
          options={{ href: isVisible("GamificationScreen") ? undefined : null }}
        />
      </Tabs>
    </SafeAreaView>
  );
}