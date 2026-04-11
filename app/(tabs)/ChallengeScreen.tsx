import React, { useState, useCallback, useMemo, useEffect } from "react";
import {
  View,
  TouchableOpacity,
  FlatList,
  Animated,
  Easing,
} from "react-native";
import AppText from "../../ui/components/AppText";
import { colors, fonts, radius, spacing } from "../../ui/theme";
import { useFocusEffect, useRouter } from "expo-router";

import { useChallengeStore } from "../../features/challenge/challenge.store";
import ChallengeItem from "../challenge/challenge-item";
import FloatingButton from "../../ui/components/FloatingButton";
import FormButton from "../../ui/components/FormButton";
import { ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

const PERIODS = ["daily", "weekly"] as const;
type Period = typeof PERIODS[number];

export default function ChallengeScreen() {
  const router = useRouter();

  const { active, definitions, tags, load, complete, discard, assign } =
    useChallengeStore();

  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  const [selectedPeriod, setSelectedPeriod] =
    useState<Period>("daily");

  const [isRolling, setIsRolling] = useState(false);
  const [rollingText, setRollingText] = useState("");

  // ===== LOAD =====
  useFocusEffect(
    useCallback(() => {
      load();
    }, [])
  );

  // ===== ACTIVE =====
  const activeForPeriod = useMemo(() => {
    return active.find(
      (c: any) => c.challenge_type === selectedPeriod
    );
  }, [active, selectedPeriod]);
  

  // ===== FILTER =====
  const filteredDefinitions = useMemo(() => {
    return definitions.filter((d: any) => {
      if (d.type !== selectedPeriod) return false;

      if (selectedTags.length === 0) return true;

      const defTagIds = d.tags.map((t: any) => t.id);

      return selectedTags.some((id) => defTagIds.includes(id));
    });
  }, [definitions, selectedPeriod, selectedTags]);

  const toggleTag = (id: number) => {
    setSelectedTags((prev) =>
      prev.includes(id)
        ? prev.filter((t) => t !== id)
        : [...prev, id]
    );
  };

  // random

const handleRandom = () => {
  if (hasActive) return;
  if (filteredDefinitions.length === 0) return;

  setIsRolling(true);

  const items = filteredDefinitions;
  let index = 0;
  let speed = 50; // start szybko
  let totalTime = 0;

  const maxTime = 2000;

  const roll = () => {
    const item = items[index % items.length];
    setRollingText(item.title);
    index++;

    totalTime += speed;

    // easing: im bliżej końca, tym wolniej
    speed *= 1.12;

    if (totalTime < maxTime) {
      setTimeout(roll, speed);
    } else {
      // FINAL PICK
      const random =
        items[Math.floor(Math.random() * items.length)];

      setRollingText(random.title);

      setTimeout(() => {
        assign(random);
        setIsRolling(false);
      }, 600);
    }
  };

  roll();
};

  const hasActive = !!activeForPeriod;

  return (
    <View
      style={{
        flex: 1,
        padding: 12,
        backgroundColor: colors.background,
      }}
    >
      {/* PERIOD SWITCH */}
      <View style={{ flexDirection: "row", marginBottom: 12 }}>
    {PERIODS.map((p) => {
      const isActive = selectedPeriod === p;

      return (
        <TouchableOpacity
          key={p}
          onPress={() => setSelectedPeriod(p)}
          style={{
            flex: 1,
            marginHorizontal: 4,
            padding: 14,
            borderRadius: 12,
            backgroundColor: isActive
              ? colors.buttonActive
              : colors.card,
            alignItems: "center",
          }}
        >
          <AppText
            style={{
              fontFamily: fonts.poppinsSemiBold,
              textTransform: "capitalize",
              fontSize: 13,
            }}
          >
            {p}
          </AppText>
        </TouchableOpacity>
      );
    })}

    {/* 🎲 RANDOM BUTTON */}
    <TouchableOpacity
      onPress={handleRandom}
      style={{
        width: 50,
        marginLeft: 4,
        borderRadius: 12,
        backgroundColor: colors.card,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Ionicons name="dice-outline" size={20} color={colors.text} />
    </TouchableOpacity>
  </View>

      {/* TAG FILTER */}
      {!hasActive && !isRolling && (
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            gap: 8,
            marginBottom: 12,
            alignItems: "center",
          }}
        >
          {tags.map((tag) => {
            const isActive = selectedTags.includes(tag.id!);

            return (
              <TouchableOpacity
                key={tag.id}
                onPress={() => toggleTag(tag.id!)}
                onLongPress={() => {
                  router.push(`/challenge/tag-form?id=${tag.id}`);
                }}
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  borderRadius: radius.sm,
                  backgroundColor: isActive
                    ? colors.buttonActive
                    : colors.card,
                }}
              >
                <AppText style={{ fontSize: 12 }}>
                  {tag.name}
                </AppText>
              </TouchableOpacity>
            );
          })}

          <TouchableOpacity
            onPress={() => router.push("/challenge/tag-form")}
            style={{
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: radius.sm,
              backgroundColor: colors.buttonActive,
            }}
          >
            <AppText>+</AppText>
          </TouchableOpacity>
        </View>
      )}

      {/* ACTIVE MODE */}
      {isRolling ? (
        // 🎲 rolling UI
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <AppText
            style={{
              fontSize: 22,
              fontFamily: fonts.poppinsSemiBold,
              lineHeight: 28, 
              paddingBottom: 2, 
            }}
          >
            {rollingText}
          </AppText>
        </View>
      ) : hasActive ? (

        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "center",
            paddingBottom: 40,
          }}
        >
          {/* GLOW WRAPPER */}
          <View style={{ borderRadius: radius.lg, overflow: "hidden" }}>
            {/* CARD */}
            <View
              style={{
                padding: spacing.l,
                borderRadius: radius.lg,
                backgroundColor: colors.card,
                paddingVertical: 32,
              }}
            >
              
              <AppText style={{ fontSize: 18, fontFamily: fonts.poppinsSemiBold, textAlign: "center" }}>
                {activeForPeriod.definition?.title}
              </AppText>

              {activeForPeriod.definition?.description && (
                <AppText
                  style={{
                    textAlign: "center",
                    marginVertical: 20,
                  }}
                >
                  {activeForPeriod.definition.description}
                </AppText>
              )}

              {/* WEEKLY PROGRESS */}
              {activeForPeriod.challenge_type === "weekly" &&
                activeForPeriod.progress_days && (
                  <View style={{ marginTop: spacing.m }}>
                    
                    {/* BAR */}
                    <View
                      style={{
                        height: 8,
                        backgroundColor: colors.background,
                        borderRadius: 6,
                        overflow: "hidden",
                      }}
                    >
                      <View
                        style={{
                          height: 8,
                          width: `${
                            (activeForPeriod.progress_days / 7) * 100
                          }%`,
                          backgroundColor: colors.accent,
                        }}
                      />
                    </View>

                    {/* LABEL */}
                    <AppText
                      style={{
                        marginTop: 18,
                        textAlign: "center",
                      }}
                    >
                      {activeForPeriod.progress_days}/7 days
                    </AppText>
                  </View>
              )}
            </View>
          </View>

          {/* BUTTONS */}
          <View style={{ margin: 0,  }}>
            <FormButton
              label="complete"
              onPress={() => complete(activeForPeriod.id)}
            />

            <FormButton
              label="discard"
              variant="danger"
              onPress={() => discard(activeForPeriod.id)}
            />
          </View>
        </ScrollView>
      ) : !isRolling && (
        <FlatList
          data={filteredDefinitions}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ paddingBottom: 120 }}
          renderItem={({ item }) => (
            <ChallengeItem item={item} />
          )}
        />
      )}

      {/* ADD BUTTON */}
      {!hasActive && !isRolling && (
      <FloatingButton
        onPress={() => router.push("/challenge/challenge-form")}
      />
      )}
    </View>
  );
}