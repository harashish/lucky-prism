import React, { useState, useCallback } from "react";
import {
  View,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import AppText from "../../ui/components/AppText";
import FloatingButton from "../../ui/components/FloatingButton";
import { colors, spacing, radius } from "../../ui/theme";

import { useNotesStore } from "../../features/note/note.store";

export default function NotesScreen() {
  const router = useRouter();
  const { list, load } = useNotesStore();

  const [expandedId, setExpandedId] = useState<number | null>(null);

  // RANDOM
  const [isRolling, setIsRolling] = useState(false);
  const [rollingText, setRollingText] = useState("");
  const [isFinishedRolling, setIsFinishedRolling] = useState(false);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [])
  );

  // =========================
  // RANDOM
  // =========================

  const handleRandom = () => {
    if (list.length === 0) return;

    setIsRolling(true);

    let index = 0;
    let speed = 50;
    let totalTime = 0;
    const maxTime = 1500;

    const roll = () => {
      const item = list[index % list.length];
      setRollingText(item.content);
      index++;

      totalTime += speed;
      speed *= 1.15;

      if (totalTime < maxTime) {
        setTimeout(roll, speed);
      } else {
        const random =
          list[Math.floor(Math.random() * list.length)];

        setRollingText(random.content);
        setIsFinishedRolling(true);
      }
    };

    roll();
  };

  // =========================
  // RENDER ITEM
  // =========================

  const renderItem = ({ item }: any) => {
    const isExpanded = expandedId === item.id;

    return (
      <TouchableOpacity
        onPress={() =>
          setExpandedId(isExpanded ? null : item.id)
        }
        onLongPress={() =>
          router.push(`/note/${item.id}`)
        }
      >
        <View
          style={{
            padding: spacing.m,
            marginVertical: spacing.s,
            borderRadius: radius.md,
            backgroundColor: colors.card,
          }}
        >
          <AppText
            numberOfLines={isExpanded ? undefined : 3}
          >
            {item.content.slice(0, 200)}
          </AppText>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View
      style={{
        flex: 1,
        padding: 12,
        backgroundColor: colors.background,
      }}
    >
      {/* HEADER */}
<TouchableOpacity
  onPress={handleRandom}
  style={{
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 10,

    borderRadius: 12,
    backgroundColor: colors.card,
    alignItems: "center",

    paddingVertical: 10, // 🔥 ważne żeby był klikalny obszar
  }}
>
  <Ionicons
    name="dice-outline"
    size={18}
    color={colors.white}
  />
</TouchableOpacity>

      {/* EMPTY */}
      {list.length === 0 ? (
        <View style={{ alignItems: "center", marginTop: 50 }}>
          <AppText style={{ color: colors.muted }}>
            no notes yet
          </AppText>
        </View>
      ) : (
        <FlatList
          data={list}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 140 }}
        />
      )}

      {/* FLOATING */}
      <FloatingButton
        onPress={() => router.push("/note/note-form")}
      />

      {/* RANDOM OVERLAY */}
      {isRolling && (
        <View
          style={{
            position: "absolute",
            top: 0, left: 0, right: 0, bottom: 0,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(0,0,0,0.6)",
          }}
        >
          <View
            style={{
              width: "85%",
              maxWidth: 500,
              height: 260,
              backgroundColor: colors.card,
              borderRadius: radius.lg,
              padding: 20,
            }}
        >
        <View style={{ flex: 1, marginBottom: 10 }}>
          <FlatList
            data={[rollingText]}
            keyExtractor={(_, i) => String(i)}
            renderItem={() => (
              <AppText
                style={{
                  fontSize: 16,
                  textAlign: "center",
                  opacity: isFinishedRolling ? 1 : 0.6,
                }}
              >
                {rollingText}
              </AppText>
            )}
            showsVerticalScrollIndicator={false}
              contentContainerStyle={{
              flexGrow: 1,  
              justifyContent: "center",
            }}
          />
        </View>

            {isFinishedRolling && (
              <TouchableOpacity
                onPress={() => {
                  setIsRolling(false);
                  setIsFinishedRolling(false);
                }}
                style={{
                  marginTop: 20,
                  padding: 12,
                  borderRadius: radius.md,
                  backgroundColor: colors.buttonConfirm,
                  width: "100%",
                  alignItems: "center",
                }}
              >
                <AppText style={{ color: "#fff" }}>
                  ok
                </AppText>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}
    </View>
  );
}