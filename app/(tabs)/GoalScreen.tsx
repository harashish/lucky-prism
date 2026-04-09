import React, { useEffect, useState, useMemo, useCallback } from "react";
import { View, TouchableOpacity, FlatList, Alert } from "react-native";
import AppText from "../../ui/components/AppText";
import { colors, radius } from "../../ui/theme";
import { useGoalStore } from "../goal/goal.store";
import { useFocusEffect, useRouter } from "expo-router";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import FloatingButton from "../../ui/components/FloatingButton";
import GoalItem from "../goal/goal-item";
import SectionLabel from "../../ui/components/SectionLabel";
import { calculateGoalProgress, calculateTimeProgress, groupGoalsByPeriod } from "../goal/goal.service";

dayjs.extend(isoWeek);

// poza komponentem, bo to stała + typ, nie zależy od renderu
// gdyby było w środku to było by tworzone przy każdym renderze, a tak jest tylko raz
const periodNames = ["weekly", "monthly", "yearly"] as const;
type Period = typeof periodNames[number];

export default function GoalsScreen() {
  const router = useRouter();

  const {
    goals,
    loadGoals,
    completeGoal,
    toggleStep,
    showArchived,
    setShowArchived,
    toggleArchive,
  } = useGoalStore();

  // useState = pamięć komponentu
  const [expandedGoalId, setExpandedGoalId] = useState<number | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<Period>("weekly");

  // LOAD
  // useEffect odpala się przy pierwszym renderze i za każdym razem, gdy zmieni się selectedPeriod lub showArchived
  // czyli zmieniając filtr dane się przeładowują
  // useEffect = reakcja na zmianę stanu
  /*useEffect(() => {
    loadGoals(selectedPeriod, showArchived);
  }, [selectedPeriod, showArchived]);*/

  useFocusEffect(
    useCallback(() => {
      loadGoals(selectedPeriod, showArchived);
    }, [selectedPeriod, showArchived])
  );

  // PROGRESS
  const progress = calculateGoalProgress(goals);

  // TIME PROGRESS
  const timeProgress = calculateTimeProgress(selectedPeriod);

  // COMPLETE
  const onComplete = (goalId: number, title: string) => {
    Alert.alert("Complete goal?", title, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Yes",
        onPress: () => {
          completeGoal(goalId);
          loadGoals(selectedPeriod);
        },
      },
    ]);
  };

  const groupedGoals = useMemo(
    () => groupGoalsByPeriod(goals, selectedPeriod),
    [goals, selectedPeriod]
  );

  return (
    <View
      style={{
        flex: 1,
        padding: 12,
        backgroundColor: colors.background,
      }}
    >
      {/* ARCHIVED TOGGLE */}
      <View style={{ alignItems: "center", marginBottom: 8 }}>
        <TouchableOpacity
          onPress={() => setShowArchived(!showArchived)}
          style={{ paddingVertical: 2, paddingHorizontal: 10 }}
        >
          <SectionLabel>{showArchived ? "archived" : "active"}</SectionLabel>
        </TouchableOpacity>
      </View>

      {/* PERIOD SWITCH */}
      <View style={{ flexDirection: "row", marginBottom: 12 }}>
        {periodNames.map((p) => (
          <TouchableOpacity
            key={p}
            onPress={() => setSelectedPeriod(p)}
            style={{
              flex: 1,
              marginHorizontal: 4,
              padding: 14,
              borderRadius: 12,
              backgroundColor:
                selectedPeriod === p
                  ? colors.buttonActive
                  : colors.card,
              alignItems: "center",
            }}
          >
            <AppText
              style={{
                fontWeight: "bold",
                textTransform: "capitalize",
              }}
            >
              {p}
            </AppText>
          </TouchableOpacity>
        ))}
      </View>

      {/* PROGRESS */}
      {!showArchived && (
        <View
          style={{
            backgroundColor: colors.card,
            borderRadius: 12,
            padding: 10,
            marginBottom: 12,
          }}
        >
          <AppText style={{ fontSize: 12 }}>
            Goals progress: {Math.round(progress * 100)}%
          </AppText>

          <View
            style={{
              height: 6,
              backgroundColor: colors.background,
              borderRadius: 4,
              marginBottom: 8,
            }}
          >
            <View
              style={{
                height: 6,
                width: `${progress * 100}%`,
                backgroundColor: colors.buttonActive,
                borderRadius: radius.xs,
              }}
            />
          </View>

          <AppText style={{ fontSize: 12 }}>
            Time ({selectedPeriod}):{" "}
            {Math.round(timeProgress * 100)}%
          </AppText>

          <View
            style={{
              height: 6,
              backgroundColor: colors.background,
              borderRadius: 4,
            }}
          >
            <View
              style={{
                height: 6,
                width: `${timeProgress * 100}%`,
                backgroundColor: colors.buttonActive,
                borderRadius: radius.xs,
              }}
            />
          </View>
        </View>
      )}

      {/* EMPTY */}
      {goals.length === 0 ? (
        <View style={{ alignItems: "center", marginTop: 50 }}>
          <AppText style={{ color: colors.muted }}>
            no goals yet for this period
          </AppText>
        </View>
      ) : (
        <FlatList
          showsVerticalScrollIndicator={false}
          key={selectedPeriod + String(showArchived)}
          data={groupedGoals}
          keyExtractor={(item) => item.label}
          contentContainerStyle={{ paddingBottom: 140 }}
          renderItem={({ item }) => (
            <View style={{ marginBottom: 16 }}>

              {/* HEADER - Z LINIAMI PO BOKACH */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 8,
                }}
              >
                <View
                  style={{
                    flex: 1,
                    height: 1,
                    backgroundColor: colors.disabled,
                  }}
                />

                <AppText
                  style={{
                    marginHorizontal: 8,
                    fontSize: 12,
                    color: colors.muted,
                  }}
                >
                  {item.label}
                </AppText>

                <View
                  style={{
                    flex: 1,
                    height: 1,
                    backgroundColor: colors.disabled,
                  }}
                />
              </View>

              {/* GOALS */}
              {item.items.map((goal) => (
                <GoalItem
                  key={goal.id}
                  item={goal}
                  isCompleted={!!goal.is_completed}
                  isExpanded={expandedGoalId === goal.id}
                  onToggleExpand={() =>
                    setExpandedGoalId(
                    expandedGoalId === goal.id ? null : goal.id ?? null
                    )
                  }
                  onEdit={() => goal.id && router.push(`/goal/${goal.id}`)}
                  onComplete={() => goal.id && onComplete(goal.id, goal.title)}
                  toggleStep={toggleStep}
                  toggleArchive={toggleArchive}
                />
              ))}
            </View>
          )}
        />
      )}

      {/* ADD BUTTON */}
      <FloatingButton
        onPress={() => router.push({
        pathname: "/goal/goal-form",
        params: { period: selectedPeriod },
      })}
      />
    </View>
  );
}