import React, { useState } from "react";
import { View, Pressable } from "react-native";
import AppText from "../../ui/components/AppText";
import { colors, radius, spacing } from "../../ui/theme";
import { useRouter } from "expo-router";
import { Habit } from "./habit.repo";

type HabitProps = {
  item: Habit & { days?: any[] };
  onToggleToday: (habitId: number) => void;
  onToggleDay: (habitId: number, date: string, newStatus: number) => void;
};

export default function HabitItem({ item, onToggleToday, onToggleDay }: HabitProps) {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);

  const days = item.days || [];

  const difficultyColor =
     colors.difficulty[item.difficulty];

  return (
    <Pressable
      onPress={() => setExpanded(prev => !prev)}
      onLongPress={() => router.push(`/habit/${item.id}`)}  
      delayLongPress={300}
      style={({ pressed }) => [
        {
          padding: spacing.m,
          marginVertical: spacing.s,
          borderRadius: radius.md,
          backgroundColor: colors.card,
        },
        { opacity: pressed ? 0.9 : 1 }
      ]}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <View style={{ flex: 1 }}>
          <AppText style={{ fontWeight: "bold" }}>
            {item.title}
          </AppText>
        </View>

        <Pressable
          onLongPress={() => router.push(`/habit/${item.id!}`)}
          style={{
            width: 38,
            height: 38,
            borderRadius: radius.md,
            marginRight: 10,
            marginBottom: 12,
            backgroundColor: item.color || colors.buttonActive,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <AppText style={{ color: colors.white, fontSize: 16 }}>+</AppText>
        </Pressable>

      </View>

{expanded && (
  <>
    {(item.difficulty || item.description) && (
      <AppText
        style={{
          fontSize: 13,
          marginBottom: 6,
        }}
      >
        <AppText
          style={{
            color: difficultyColor,
            fontWeight: "600",
          }}
        >
          {item.difficulty}
        </AppText>

        {item.description ? ` ${item.description}` : ""}
      </AppText>
    )}

    {/* MOTIVATION (bez labela) */}
    {item.motivation_reason ? (
      <AppText
        style={{
          fontStyle: "italic",
          marginBottom: 10,
        }}
      >
        {item.motivation_reason}
      </AppText>
    ) : null}

    {/* GOALS */}
    {(item.floor_goal || item.target_goal || item.ceiling_goal) && (
      <View style={{ gap: 4, marginBottom: 10 }}>
        {item.floor_goal && (
          <AppText style={{ fontSize: 12 }}>
            ☉ {item.floor_goal}
          </AppText>
        )}

        {item.target_goal && (
          <AppText style={{ fontSize: 12 }}>
            ⦾ {item.target_goal}
          </AppText>
        )}

        {item.ceiling_goal && (
          <AppText style={{ fontSize: 12 }}>
            ⊛ {item.ceiling_goal}
          </AppText>
        )}
      </View>
    )}
  </>
)}


      <View style={{ flexDirection: "row", flexWrap: "wrap", marginTop: spacing.s }}>
        {days.map((d: any) => {
          const status = d.status;
          const todayStr = new Date().toISOString().slice(0, 10);
          const isFuture = d.date > todayStr;
          const squareStyle: any = {
            width: 26,
            height: 26,
            marginRight: 6,
            marginBottom: 6,
            borderRadius: 6,
            justifyContent: "center",
            alignItems: "center",
          };

        if (isFuture) {
          squareStyle.backgroundColor = colors.habit.future;
        } else if (status === 2) {
          squareStyle.backgroundColor = item.color || colors.buttonActive;
        } else if (status === 1) {
          squareStyle.backgroundColor = colors.habit.skipped;
        } else {
          squareStyle.backgroundColor = colors.habit.empty;
          squareStyle.borderWidth = 1;
          squareStyle.borderColor = item.color || colors.inputBorder;
        }

          return (
            <Pressable
              key={d.date}
              onPress={async () => {
                const todayStr = new Date().toISOString().slice(0, 10);
                if (d.date > todayStr) {
                  return;
                }
                const newStatus = d.status === 2 ? 1 : 2;
                await onToggleDay(item.id!, d.date, newStatus)
              }}
              onLongPress={() => router.push(`/habit/${item.id}`)}
              delayLongPress={300}
            >
              <View style={squareStyle}>
                <AppText style={{ fontSize: 10, color: colors.white }}>
                  {new Date(d.date).getDate()}
                </AppText>
              </View>
            </Pressable>
          );
        })}
      </View>
    </Pressable>
  );
}
