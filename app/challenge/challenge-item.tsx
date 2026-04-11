import React, { useState } from "react";
import { View, Pressable } from "react-native";
import AppText from "../../ui/components/AppText";
import { colors, fonts, radius, spacing } from "../../ui/theme";
import { ChallengeDefinition, ChallengeTag } from "../../features/challenge/challenge.repo";
import { useChallengeStore } from "../../features/challenge/challenge.store";
import { useRouter } from "expo-router";
import DifficultyBadge from "../../ui/components/DifficultyBadge";
import TagBadge from "../../ui/components/TagBadge";

type Props = {
  item: ChallengeDefinition & {
    tags?: ChallengeTag[];
  };
};

export default function ChallengeItem({ item }: Props) {
  const router = useRouter();

  const [expanded, setExpanded] = useState(false);

  const assign = useChallengeStore(s => s.assign);

  const difficultyColor = colors.difficulty[item.difficulty];

  return (
    <Pressable
      onPress={() => setExpanded(prev => !prev)}
      onLongPress={() => {
        router.push(`/challenge/${item.id}`);
      }}
      style={({ pressed }) => [
        {
          padding: spacing.m,
          marginVertical: spacing.s,
          borderRadius: radius.md,
          backgroundColor: colors.card,
        },
        { opacity: pressed ? 0.9 : 1 },
      ]}
    >
      {/* HEADER */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 6,
          flexWrap: "wrap", // 🔥 KLUCZ
        }}
      >
        <AppText style={{ fontFamily: fonts.interBold, fontSize: 15 }}>
          {item.title}
        </AppText>

        <DifficultyBadge difficulty={item.difficulty} />

        {item.tags?.map(tag => (
          <TagBadge key={tag.id} label={tag.name} color={tag.color} />
        ))}
      </View>

      {/* EXPANDED */}
      {expanded && (
        <>
      
          {/* DESCRIPTION */}
          {item.description ? (
            <AppText
              style={{
                fontSize: 13,
                marginTop: spacing.s,
                textAlign: "left",
              }}
            >
              {item.description}
            </AppText>
          ) : null}

          {/* CTA BUTTON */}
          <Pressable
            onPress={() => assign(item)}
            style={({ pressed }) => [
              {
                marginTop: spacing.m,
                paddingVertical: 12,
                borderRadius: radius.sm,
                backgroundColor: colors.buttonConfirm,
                alignItems: "center",
              },
              { opacity: pressed ? 0.85 : 1 },
            ]}
          >
            <AppText style={{ color: colors.white }}>
              try
            </AppText>
          </Pressable>
        </>
      )}
    </Pressable>
  );
}