import React, { useState, useCallback } from "react";
import {
  View,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { useHabitStore } from "../habit/habit.store";
import AppText from "../../ui/components/AppText";
import { colors } from "../../ui/theme";
import { useRouter } from "expo-router";
import FloatingButton from "../../ui/components/FloatingButton";
import { useFocusEffect } from "@react-navigation/native";
import HabitItem from "../habit/habit-item";

export default function HabitScreen() {
  const router = useRouter();

  const { habits, loadMonth, toggleDay } = useHabitStore();
  const [month, setMonth] = useState<string | undefined>(undefined);

  // Load data on screen focus
  useFocusEffect(
    useCallback(() => {
      loadMonth(month);
    }, [month])
  );

  // Toggle today
  const onToggleToday = (habitId: number) => {
    const today = new Date().toISOString().slice(0, 10);
    toggleDay(habitId, today);
  };

  // Toggle specific day
  const onToggleDay = (
    habitId: number,
    date: string,
    newStatus: number
  ) => {
    toggleDay(habitId, date, newStatus, month);
  };

  return (
    <View
      style={{
        flex: 1,
        padding: 12,
        backgroundColor: colors.background,
      }}
    >
      {/* MONTH NAVIGATION */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          marginBottom: 12,
          alignItems: "center",
        }}
      >
        <TouchableOpacity
          onPress={() => {
            const base = month
              ? new Date(month + "-01")
              : new Date();
            base.setMonth(base.getMonth() - 1);
            setMonth(
              `${base.getFullYear()}-${(base.getMonth() + 1)
                .toString()
                .padStart(2, "0")}`
            );
          }}
          style={{ padding: 8 }}
        >
          <AppText style={{ fontSize: 25 }}>{"‹"}</AppText>
        </TouchableOpacity>

        <AppText style={{ fontSize: 16, transform: [{ translateY: 2 }], }}>
          {month ?? new Date().toISOString().slice(0, 7)}
        </AppText>

        <TouchableOpacity
          onPress={() => {
            const base = month
              ? new Date(month + "-01")
              : new Date();
            base.setMonth(base.getMonth() + 1);
            setMonth(
              `${base.getFullYear()}-${(base.getMonth() + 1)
                .toString()
                .padStart(2, "0")}`
            );
          }}
          style={{ padding: 8 }}
        >
          <AppText style={{ fontSize: 25 }}>{"›"}</AppText>
        </TouchableOpacity>
      </View>

      {/* EMPTY */}
      {habits.length === 0 ? (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            marginTop: 50,
          }}
        >
          <AppText style={{ color: colors.muted, fontSize: 16 }}>
            no habits yet, add some!
          </AppText>
        </View>
        
      ) : (
        <>

        {/* HABITS */}
        <FlatList
          showsVerticalScrollIndicator={false}
          data={habits}
          keyExtractor={(item) => item.id!.toString()}
          renderItem={({ item }) => (
            <HabitItem
              item={item}
              onToggleToday={onToggleToday}
              onToggleDay={onToggleDay}
            />
          )}
          contentContainerStyle={{ paddingBottom: 140 }}
        />
        </>
      )}

      {/* ADD BUTTON */}
      <FloatingButton onPress={() => router.push("/habit/habit-form")} />
    </View>
  );
}