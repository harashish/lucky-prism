import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { View } from "react-native";
import { colors } from "../../ui/theme";
import { ComponentProps } from "react";
import { SafeAreaView } from "react-native-safe-area-context";

// wyciągnięcie typu z komponentu 
// Ionicons ma prop name i ten prop ma określony zbiór stringów (home, repeat etc), które są nazwami ikon
// tldr bierzemy typ z biblioteki zeby nie wpisać złej nazwy ikony (nie 'icon: string' tylko 'icon: IconName')
type IconName = ComponentProps<typeof Ionicons>["name"];

const TAB_CONFIG: Record<
  string,
  { icon: IconName; outline: IconName }
> = {
  index: { icon: "home", outline: "home-outline" },
  HabitScreen: { icon: "repeat", outline: "repeat-outline" },
  MoodScreen: { icon: "happy", outline: "happy-outline" },
  GoalScreen: { icon: "flag", outline: "flag-outline" },
  GamificationScreen: { icon: "game-controller", outline: "game-controller-outline" },
  TodosScreen: { icon: "checkbox", outline: "checkbox-outline" },
  ChallengeScreen: {  icon: "flame", outline: "flame-outline" },
  RandomScreen: {  icon: "shuffle", outline: "shuffle-outline" },
  SobrietyScreen: {  icon: "link", outline: "link-outline" },
  SettingsScreen: {  icon: "settings", outline: "settings-outline" },
};

export default function TabsLayout() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
    <Tabs
      screenOptions={({ route }) => {
        const config = TAB_CONFIG[route.name as keyof typeof TAB_CONFIG];

        return {
          // ukrywa górny header od nawigacji
          headerShown: false,

          // ukrywa tekst pod ikoną w barze
          tabBarShowLabel: false,

          tabBarStyle: {
            backgroundColor: "#15151a",
            borderTopColor: "transparent",
            height: 68,
            paddingBottom: 8,
            paddingTop: 6,
          },

          tabBarIcon: ({ focused }) => {

            // jeśli route nie ma configu → nic nie renderuj
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
                  color={focused ? colors.accent : colors.muted}
                />
              </View>
            );
          },
        };
      }}
    >
      <Tabs.Screen name="HabitScreen" />
      <Tabs.Screen name="MoodScreen" />
      <Tabs.Screen name="GoalScreen" />
      <Tabs.Screen name="ChallengeScreen" />
      <Tabs.Screen name="GamificationScreen" />
    </Tabs>
    </SafeAreaView>
  );
}

