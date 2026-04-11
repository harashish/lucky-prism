import { View, ScrollView } from "react-native";
import AppText from "../../ui/components/AppText";
import { useGamificationStore } from "../../features/gamification/gamification.store";
import { colors, spacing, radius } from "../../ui/theme";
import SectionLabel from "../../ui/components/SectionLabel";

export default function GamificationScreen() {
  const { totalXp, currentLevel, logs } = useGamificationStore();

  // progress
  const xpForNextLevel = currentLevel * 100;
  const xpCurrentLevel = totalXp % xpForNextLevel;
  const progress = xpCurrentLevel / xpForNextLevel;

  // nie potrzeba useState, bo dane są w zustand store, który sam triggeruje render. nie potrzeba duplikacji
  // global state xp

  return (
  <View style={{ flex: 1, padding: 12, backgroundColor: colors.background }}>
    <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>

      {/* LEVEL CARD */}
      <View
        style={{
          backgroundColor: colors.card,
          padding: spacing.l,
          borderRadius: radius.lg,
          marginBottom: spacing.l,
        }}
      >
        {/* LEVEL INLINE */}
        <View style={{ flexDirection: "row", alignItems: "baseline", gap: 8 }}>
          <AppText style={{ fontSize: 20, fontWeight: "800" }}>
            Level {currentLevel}
          </AppText>
        </View>

        {/* PROGRESS */}
        <View
          style={{
            height: 8,
            backgroundColor: colors.cardTertiary,
            borderRadius: radius.xs,
            marginTop: spacing.m,
            overflow: "hidden",
          }}
        >
          <View
            style={{
              width: `${progress * 100}%`,
              height: "100%",
              backgroundColor: colors.accent,
            }}
          />
        </View>

        <AppText
          style={{
            marginTop: 6,
            fontSize: 12,
            color: colors.muted,
          }}
        >
          {xpCurrentLevel} / {xpForNextLevel} XP
        </AppText>
      </View>

      {/* TOTAL XP */}
      <View
        style={{
          backgroundColor: colors.cardSecondary,
          padding: spacing.m,
          borderRadius: radius.md,
          marginBottom: spacing.m,        
        }}
      >
        <AppText style={{ fontSize: 14, color: colors.muted}}>
          Total
        </AppText>

        <AppText
          style={{
            fontSize: 25,
            fontWeight: "700",
            marginVertical: 14,
            textAlign: "center" 
          }}
        >
          {totalXp} XP
        </AppText>
      </View>

      {/* ACTIVITY SECTION */}
      <View
        style={{
          alignItems: "center",
          marginBottom: 10,
        }}
      >
          <SectionLabel>activity</SectionLabel>
      </View>

      {/* LOGS */}
      {logs.length === 0 ? (
        <AppText style={{ color: colors.muted, textAlign: "center" }}>
          No activity yet
        </AppText>
      ) : (
        logs.map((log) => (
          <View
            key={log.id}
            style={{
              backgroundColor: colors.card,
              padding: spacing.m,
              borderRadius: radius.md,
              marginBottom: spacing.s,
            }}
          >
            <AppText style={{ fontWeight: "600" }}>
              +{log.xp} XP
            </AppText>

            <AppText
              style={{
                fontSize: 12,
                color: colors.muted,
                marginTop: 2,
              }}
            >
              {log.source}
            </AppText>
          </View>
        ))
      )}
    </ScrollView>
    </View>
  );
}