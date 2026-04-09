import React from "react";
import { View, TouchableOpacity } from "react-native";
import AppText from "../../ui/components/AppText";
import { colors, radius, spacing } from "../../ui/theme";
import { Ionicons } from "@expo/vector-icons";
import { Difficulty } from "../gamification/difficulty";

type GoalItemProps = {
  item: any;

  isCompleted: boolean;
  isExpanded: boolean;

  onToggleExpand: () => void;
  onComplete: () => void;
  onEdit: () => void;

  toggleStep: (goalId: number, stepId: number) => void;
  toggleArchive: (goalId: number) => void;
};

export default function GoalItem({
  item,
  isCompleted,
  isExpanded,
  onToggleExpand,
  onComplete,
  onEdit,
  toggleStep,
  toggleArchive,
}: GoalItemProps) {
  return (
    <TouchableOpacity onPress={onToggleExpand} onLongPress={onEdit}>
      <View
        style={{
            padding: spacing.m,
            marginVertical: spacing.s,
            borderRadius: radius.md,
            backgroundColor: colors.card,
          opacity: isCompleted || item.is_archived ? 0.5 : 1,
        }}
      >
      {/* HEADER */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
        }}
      >
        <View style={{ flex: 1 }}>
          {/* TITLE */}
          <AppText
            style={{
              fontWeight: "bold",
              textDecorationLine: isCompleted ? "line-through" : "none",
              opacity: isCompleted || item.is_archived ? 0.5 : 1,
            }}
          >
            {item.title}
          </AppText>

          {item.motivation_reason && (
            <AppText
              style={{
                fontSize: 12,
                fontStyle: "italic",
                color: colors.text,
                opacity: 0.8,
                marginTop: 2,
              }}
              numberOfLines={2}
            >
              {item.motivation_reason}
            </AppText>
          )}
        </View>

        {/* COMPLETE */}
        {!isCompleted && !item.is_archived && (
          <TouchableOpacity onPress={onComplete} style={{ marginLeft: 8 }}>
            <Ionicons
              name="checkmark-circle-outline"
              size={22}
              color={colors.buttonActive}
            />
          </TouchableOpacity>
        )}

        {/* ARCHIVE */}
        {!item.is_completed && (
          <TouchableOpacity
            onPress={() => toggleArchive(item.id)}
            style={{ marginLeft: 8 }}
          >
            <Ionicons
              name={
                item.is_archived
                  ? "refresh-circle-outline"
                  : "archive-outline"
              }
              size={22}
              color={colors.muted}
            />
          </TouchableOpacity>
        )}
      </View>

      {isExpanded && (
        <>

          {(item.difficulty || item.description) && (
            <AppText
              style={{
                fontSize: 13,
                marginBottom: 6,
              }}
            >
              {item.difficulty && (
                <AppText
                  style={{
                    color: colors.difficulty[item.difficulty as Difficulty],
                    fontWeight: "600",
                  }}
                >
                  {item.difficulty}
                </AppText>
              )}

              {item.description ? ` ${item.description}` : ""}
            </AppText>
          )}

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

          {/* 🔹 STEPS */}
          {item.steps?.length > 0 && (
            <View style={{ marginTop: 6 }}>
              {item.steps.map((step: any) => (
                <TouchableOpacity
                  key={step.id}
                  onPress={() => toggleStep(item.id, step.id)}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 6,
                  }}
                >
                  {/* checkbox */}
                  <View
                    style={{
                      width: 18,
                      height: 18,
                      marginRight: 8,
                      borderRadius: 4,
                      borderWidth: 1,
                      borderColor: colors.muted,
                      backgroundColor: step.is_completed
                        ? colors.buttonActive
                        : "transparent",
                    }}
                  />

                  {/* text */}
                  <AppText
                    style={{
                      textDecorationLine: step.is_completed
                        ? "line-through"
                        : "none",
                      color: step.is_completed
                        ? colors.muted
                        : colors.text,
                      opacity: step.is_completed ? 0.5 : 1,
                      fontSize: 12,
                    }}
                  >
                    {step.title}
                  </AppText>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </>
      )}

      </View>
    </TouchableOpacity>
  );
}