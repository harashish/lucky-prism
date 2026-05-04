import { View, TouchableOpacity, ScrollView } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";

import AppText from "../../ui/components/AppText";
import { colors, spacing, radius } from "../../ui/theme";

import { useSettingsStore } from "../../features/settings/settings.store";

import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import * as DocumentPicker from "expo-document-picker";

import { exportAllTables, importAllTables } from "../../core/db/db";
import { resetDatabase } from "../../core/db/db";
import { initDb } from "../../core/db/init";
import { confirmDelete } from "../../ui/components/confirmDelete";
import { useGamificationStore } from "../../features/gamification/gamification.store";

import { calculateXp } from "../../features/gamification/xpCalculator";
import { DIFFICULTIES } from "../../features/gamification/difficulty";
import { GOAL_PERIOD_MULTIPLIER, CHALLENGE_PERIOD_MULTIPLIER } from "../../features/gamification/xpConfig";


// 🔥 SOURCE OF TRUTH
const MODULE_KEYS = [
  "HabitScreen",
  "MoodScreen",
  "GoalScreen",
  "ChallengeScreen",
  "TodoScreen",
  "SobrietyScreen",
  "NoteScreen",
  "GamificationScreen",
];

const DIFF_KEYS = Object.keys(DIFFICULTIES) as (keyof typeof DIFFICULTIES)[];

function buildXpTable() {
  return {
    habit: DIFF_KEYS.map((d) => ({
      difficulty: d,
      xp: calculateXp({ module: "habit", difficulty: d, streak: 7 }),
    })),

    mood: DIFF_KEYS.map((d) => ({
      difficulty: d,
      xp: calculateXp({ module: "mood", difficulty: d, streak: 7 }),
    })),

    todo: DIFF_KEYS.map((d) => ({
      difficulty: d,
      xp: calculateXp({ module: "todo", difficulty: d }),
    })),

    goal: Object.keys(GOAL_PERIOD_MULTIPLIER).map((period) => ({
      period,
      values: DIFF_KEYS.map((d) => ({
        difficulty: d,
        xp: calculateXp({
          module: "goal",
          difficulty: d,
          period,
        }),
      })),
    })),

    challenge: Object.keys(CHALLENGE_PERIOD_MULTIPLIER).map((period) => ({
      period,
      values: DIFF_KEYS.map((d) => ({
        difficulty: d,
        xp: calculateXp({
          module: "challenge",
          difficulty: d,
          period,
        }),
      })),
    })),
  };
}

export default function SettingsScreen() {
  const router = useRouter();

  const load = useSettingsStore((s) => s.load);
  const toggle = useSettingsStore((s) => s.toggle);
  const settings = useSettingsStore((s) => s.settings);

  const [openSection, setOpenSection] = useState<string | null>("modules");

  useFocusEffect(
    useCallback(() => {
      load();
    }, [])
  );

  const toggleSection = (key: string) => {
    setOpenSection((prev) => (prev === key ? null : key));
  };

  const formatName = (key: string) =>
    key.replace("Screen", "");

  // ================= EXPORT
  const handleExport = async () => {
    const data = exportAllTables();
    const json = JSON.stringify(data, null, 2);

    const path = FileSystem.documentDirectory + "backup.json";

    await FileSystem.writeAsStringAsync(path, json);
    await Sharing.shareAsync(path);
  };

  // ================= IMPORT
  const handleImport = async () => {
    const res = await DocumentPicker.getDocumentAsync({
      type: "application/json",
    });

    if (res.canceled) return;

    const file = res.assets[0];
    const content = await FileSystem.readAsStringAsync(file.uri);
    const parsed = JSON.parse(content);

    importAllTables(parsed);
    load();
    useGamificationStore.getState().init();
  };

  const handleReset = () => {
    confirmDelete({
      title: "Reset all data?",
      onConfirm: () => {
        resetDatabase();
        initDb();

        load(); // settings reload
        useGamificationStore.getState().init();
      },
    });
  };

  return (
    <ScrollView
      contentContainerStyle={{
        padding: spacing.l,
        paddingBottom: 40,
        backgroundColor: colors.background,
      }}
    >
      {/* ================= MODULES ================= */}
      <TouchableOpacity onPress={() => toggleSection("modules")}>
        <View style={{ marginTop: 20, marginBottom: 10 }}>
  <AppText
    style={{
      fontSize: 16,
      fontWeight: "600",
      color: colors.text,
      opacity: 0.9,
    }}
  >
    modules
  </AppText>

  <View
    style={{
      height: 1,
      backgroundColor: colors.accent ?? "#2a2a35",
      marginTop: 6,
    }}
  />
</View>
      </TouchableOpacity>

      {openSection === "modules" &&
        MODULE_KEYS.map((key) => (
          <TouchableOpacity
            key={key}
            onPress={() => router.push(`/${key}`)}
          >
            <View
              style={{
                padding: spacing.m,
                marginBottom: spacing.s,
                borderRadius: radius.md,
                backgroundColor: colors.card,
              }}
            >
              <AppText>{formatName(key)}</AppText>
            </View>
          </TouchableOpacity>
        ))}

      {/* ================= VISIBILITY ================= */}
      <TouchableOpacity onPress={() => toggleSection("visibility")}>
<View style={{ marginTop: 20, marginBottom: 10 }}>
  <AppText
    style={{
      fontSize: 16,
      fontWeight: "600",
      color: colors.text,
      opacity: 0.9,
    }}
  >
    modules on /off
  </AppText>

  <View
    style={{
      height: 1,
      backgroundColor: colors.accent ?? "#2a2a35",
      marginTop: 6,
    }}
  />
</View>
      </TouchableOpacity>

      {openSection === "visibility" &&
        MODULE_KEYS.map((key) => {
          const enabled = settings[`module_${key}`] === "1";

          return (
            <View
              key={key}
              style={{
                padding: spacing.m,
                marginBottom: spacing.s,
                borderRadius: radius.md,
                backgroundColor: colors.card,
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <AppText>{formatName(key)}</AppText>

              <TouchableOpacity
                onPress={() => toggle(`module_${key}`)}
              >
                <View
                  style={{
                    width: 40,
                    height: 24,
                    borderRadius: 12,
                    backgroundColor: enabled
                      ? colors.accent
                      : colors.disabled,
                    justifyContent: "center",
                    padding: 3,
                  }}
                >
                  <View
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: 9,
                      backgroundColor: "#fff",
                      alignSelf: enabled
                        ? "flex-end"
                        : "flex-start",
                    }}
                  />
                </View>
              </TouchableOpacity>
            </View>
          );
        })}

        {/* ================= XP TABLE ================= */}
<TouchableOpacity onPress={() => toggleSection("xp")}>
  <View style={{ marginTop: 20, marginBottom: 10 }}>
    <AppText
      style={{
        fontSize: 16,
        fontWeight: "600",
        color: colors.text,
        opacity: 0.9,
      }}
    >
      xp system
    </AppText>

    <View
      style={{
        height: 1,
        backgroundColor: colors.accent ?? "#2a2a35",
        marginTop: 6,
      }}
    />
  </View>
</TouchableOpacity>

{openSection === "xp" && (() => {
  const table = buildXpTable();

  return (
    <View style={{ gap: 16 }}>
      
      {/* HABIT */}
      <View style={{ backgroundColor: colors.card, padding: spacing.m, borderRadius: radius.md }}>
        <AppText>habit (streak max)</AppText>
        {table.habit.map((row) => (
          <AppText key={row.difficulty}>
            {row.difficulty}: {row.xp} XP
          </AppText>
        ))}
      </View>

      {/* MOOD */}
      <View style={{ backgroundColor: colors.card, padding: spacing.m, borderRadius: radius.md }}>
        <AppText>mood (streak max)</AppText>
        {table.mood.map((row) => (
          <AppText key={row.difficulty}>
            {row.difficulty}: {row.xp} XP
          </AppText>
        ))}
      </View>

      {/* TODO */}
      <View style={{ backgroundColor: colors.card, padding: spacing.m, borderRadius: radius.md }}>
        <AppText>todo</AppText>
        {table.todo.map((row) => (
          <AppText key={row.difficulty}>
            {row.difficulty}: {row.xp} XP
          </AppText>
        ))}
      </View>

      {/* GOALS */}
      {table.goal.map((g) => (
        <View
          key={g.period}
          style={{
            backgroundColor: colors.card,
            padding: spacing.m,
            borderRadius: radius.md,
          }}
        >
          <AppText>goal ({g.period})</AppText>
          {g.values.map((row) => (
            <AppText key={row.difficulty}>
              {row.difficulty}: {row.xp} XP
            </AppText>
          ))}
        </View>
      ))}

      {/* CHALLENGE */}
      {table.challenge.map((c) => (
        <View
          key={c.period}
          style={{
            backgroundColor: colors.card,
            padding: spacing.m,
            borderRadius: radius.md,
          }}
        >
          <AppText>challenge ({c.period})</AppText>
          {c.values.map((row) => (
            <AppText key={row.difficulty}>
              {row.difficulty}: {row.xp} XP
            </AppText>
          ))}
        </View>
      ))}

    </View>
  );
})()}

      {/* ================= IMPORT / EXPORT ================= */}
      <TouchableOpacity onPress={() => toggleSection("data")}>
<View style={{ marginTop: 20, marginBottom: 10 }}>
  <AppText
    style={{
      fontSize: 16,
      fontWeight: "600",
      color: colors.text,
      opacity: 0.9,
    }}
  >
    import / export
  </AppText>

  <View
    style={{
      height: 1,
      backgroundColor: colors.accent ?? "#2a2a35",
      marginTop: 6,
    }}
  />
</View>
      </TouchableOpacity>

      {openSection === "data" && (
        <View
          style={{
            padding: spacing.m,
            borderRadius: radius.md,
            gap: 10,
          }}
        >
          <TouchableOpacity onPress={handleExport}>
            <View
              style={{
                padding: spacing.m,
                borderRadius: radius.md,
                backgroundColor: colors.buttonConfirm,
              }}
            >
              <AppText style={{ color: "#fff", textAlign: "center" }}>
                export data
              </AppText>
            </View>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleImport}>
            <View
              style={{
                padding: spacing.m,
                borderRadius: radius.md,
                backgroundColor: colors.buttonConfirm,
              }}
            >
              <AppText style={{ color: "#fff", textAlign: "center" }}>
                import data
              </AppText>
            </View>

          </TouchableOpacity>
          <TouchableOpacity onPress={handleReset}>
  <View
    style={{
      padding: spacing.m,
      borderRadius: radius.md,
      backgroundColor: colors.buttonDelete,
    }}
  >
    <AppText style={{ color: "#fff", textAlign: "center" }}>
      reset all data
    </AppText>
  </View>
</TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}