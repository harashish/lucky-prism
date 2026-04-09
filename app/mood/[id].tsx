import { View, TouchableOpacity, ScrollView } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMoodStore } from "./mood.store";
import AppText from "../../ui/components/AppText";
import { colors, spacing, radius } from "../../ui/theme";
import { EMOTIONS } from "./mood.constants";
import { MOOD_COLORS } from "./mood.constants";

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

export default function MoodDayScreen() {
  const params = useLocalSearchParams();
  const id = params.id ? Number(params.id) : undefined;

  const router = useRouter();
  const { entries } = useMoodStore();

  const entry = entries.find(e => e.id === Number(id));
  

  if (!entry) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <AppText style={{ color: colors.muted }}>
          No mood entry found
        </AppText>
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={{
        padding: spacing.l,
        paddingBottom: 40,
      }}
    >

      {/* ===== DATE HEADER ===== */}
      <View
        style={{
          alignItems: "center",
          marginBottom: spacing.l,
        }}
      >
        <AppText
          style={{
            fontSize: 15,
            color: colors.muted,
            letterSpacing: 0.3,
          }}
        >
          {formatDate(entry.date)} · {entry.time.slice(0, 5)}
        </AppText>
      </View>

      {/* ===== MOOD HERO ===== */}
      <View
        style={{
          backgroundColor: MOOD_COLORS[entry.mood],
          paddingVertical: 28,
          borderRadius: radius.lg,
          alignItems: "center",
          marginBottom: spacing.l,
          opacity: 0.9,
        }}
      >
        <AppText
          style={{
            fontSize: 14,
            opacity: 0.7,
            marginBottom: 6,
          }}
        >
          Mood
        </AppText>

        <AppText
          style={{
            fontSize: 28,
            fontWeight: "800",
            textTransform: "capitalize",
            lineHeight: 24,
            includeFontPadding: false,
          }}
        >
          {entry.mood}
        </AppText>
      </View>

      {/* ===== EMOTIONS ===== */}
      {entry.emotions?.length ? (
        <View
          style={{ 
            padding: 10,
            borderRadius: radius.lg,
            marginBottom: spacing.l,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: 8,
            }}
          >
            {entry.emotions.map((emotion) => {
              const color =
                EMOTIONS.find(e => e.name === emotion)?.color ?? "#888";

              return (
                <View
                  key={emotion}
                  style={{
                    paddingVertical: 8,
                    paddingHorizontal: 14,
                    borderRadius: radius.md,
                    backgroundColor: "#2a2a35",
                    borderWidth: 1,
                    borderColor: color,
                  }}
                >
                  <AppText
                    style={{
                      color: color,
                      fontSize: 13,
                      fontWeight: "600",
                      textTransform: "capitalize",
                    }}
                  >
                    {emotion}
                  </AppText>
                </View>
              );
            })}
          </View>
        </View>
      ) : null}

      {/* ===== NOTE ===== */}
      {entry.note ? (
        <View
          style={{
            backgroundColor: colors.card,
            padding: 18,
            borderRadius: radius.lg,
            marginBottom: spacing.l,
          }}
        >
          <AppText style={{ lineHeight: 22 }}>
            {entry.note}
          </AppText>
        </View>
      ) : (
        <View
          style={{
            backgroundColor: colors.card,
            padding: 18,
            borderRadius: radius.lg,
            marginBottom: spacing.l,
            alignItems: "center",
          }}
        >
          <AppText style={{ color: colors.muted }}>
            No note for this day
          </AppText>
        </View>
      )}

      {/* ===== EDIT ===== */}
      <TouchableOpacity
        onPress={() => router.push(`/mood/mood-form?id=${entry.id}`)}
        style={{
          paddingVertical: 16,
          backgroundColor: colors.buttonActive,
          borderRadius: radius.lg,
          alignItems: "center",
        }}
      >
        <AppText style={{ fontWeight: "700" }}>
          Edit entry
        </AppText>
      </TouchableOpacity>

    </ScrollView>
  );
}