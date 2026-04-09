import { View, TouchableOpacity, ScrollView } from "react-native";
import { useState, useCallback, useMemo } from "react";
import { useMoodStore } from "../../features/mood/mood.store";
import { colors, spacing } from "../../ui/theme";
import FloatingButton from "../../ui/components/FloatingButton";
import { useRouter, useFocusEffect } from "expo-router";
import AppText from "../../ui/components/AppText";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { MOOD_COLORS } from "../../features/mood/mood.constants";

// poza komponentem, bo to stała + typ, nie zależy od renderu
// gdyby było w środku to było by tworzone przy każdym renderze, a tak jest tylko raz
const CELL_SIZE = 18;
const CELL_MARGIN = 2;
const DAY_LABEL_WIDTH = 28;

const getStreakColor = (value: number) => {
  if (value >= 30) return "#f1c40f";
  if (value >= 8) return "#c47d27";
  if (value >= 4) return "#2ecc71";
  return colors.muted;
};

const monthShort = [
  "Jan","Feb","Mar","Apr","May","Jun",
  "Jul","Aug","Sep","Oct","Nov","Dec"
];

export default function MoodScreen() {
  const { entries, loadYear, streak } = useMoodStore();
  const router = useRouter();

  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);

  const entriesMap = useMemo(() => {
    const map: Record<string, any> = {};
    entries.forEach(e => {
      map[e.date] = e;
    });
    return map;
  }, [entries]);

  /*
    // jak było tak to ładowało się 2-3 sekundy
      useFocusEffect(
        useCallback(() => {
          loadYear(year);
        }, [year])
      );
  */

  /*
  // to działało ale podobno było niezgodne 
    useFocusEffect(
    useCallback(() => {
      setTimeout(() => {
        loadYear(year);
      }, 0);
    }, [year])
  );
  */

  // ładowanie w taki sposób żeby nie lagowało animacji przejścia, bo loadYear jest dość ciężkie, a useFocusEffect odpala się zanim animacja się skończy. 
  // dzięki temu animacja jest płynna, a dane ładują się zaraz po niej
  useFocusEffect(
    useCallback(() => {
      requestAnimationFrame(() => {
        loadYear(year);
      });
    }, [year])
  );

  const daysInMonth = (year: number, month: number) =>
    new Date(year, month + 1, 0).getDate();

  return (
    <View style={{ flex: 1, padding: 12, backgroundColor: colors.background }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <ScrollView horizontal>
          <View>

            {/* YEAR + STREAK */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginTop: spacing.s,
                marginBottom: 4,
              }}
            >
              <View style={{ width: DAY_LABEL_WIDTH }} />

              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  width: (CELL_SIZE + CELL_MARGIN * 2) * 11,
                }}
              >
                {/* YEAR */}
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <TouchableOpacity
                    onPress={() => setYear((y) => y - 1)}
                    style={{ paddingHorizontal: 12 }}
                  >
                    <AppText style={{ fontSize: 18 }}>‹</AppText>
                  </TouchableOpacity>

                  <AppText
                    style={{
                      fontSize: 18,
                      minWidth: 80,
                      textAlign: "center",
                      transform: [{ translateY: 2 }],
                    }}
                  >
                    {year}
                  </AppText>

                  <TouchableOpacity
                    disabled={year >= currentYear}
                    onPress={() => setYear((y) => y + 1)}
                    style={{
                      paddingHorizontal: 12,
                      opacity: year >= currentYear ? 0.3 : 1,
                    }}
                  >
                    <AppText style={{ fontSize: 18 }}>›</AppText>
                  </TouchableOpacity>
                </View>

                {/* STREAK */}
                {streak && (
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 6,
                      transform: [{ translateY: 2 }],
                    }}
                  >
                    <MaterialCommunityIcons
                      name="fire"
                      size={20}
                      color={getStreakColor(streak.current)}
                    />

                    <AppText
                      style={{
                        fontSize: 16,
                        color: getStreakColor(streak.current),
                        fontWeight: "600",
                      }}
                    >
                      {streak.current} days
                    </AppText>
                  </View>
                )}
              </View>
            </View>

            {/* MONTH NAMES */}
            <View style={{ flexDirection: "row", height: 60 }}>
              <View style={{ width: DAY_LABEL_WIDTH }} />

              {monthShort.map((m) => (
                <View
                  key={m}
                  style={{
                    width: CELL_SIZE + CELL_MARGIN * 2,
                    alignItems: "center",
                    justifyContent: "flex-end",
                  }}
                >
                  {m.split("").map((letter, i) => (
                    <AppText
                      key={i}
                      style={{
                        fontSize: 9,
                        lineHeight: 10,
                      }}
                    >
                      {letter}
                    </AppText>
                  ))}
                </View>
              ))}
            </View>

            {/* GRID */}
            {[...Array(31)].map((_, dayIndex) => {
              const day = dayIndex + 1;

              return (
                <View
                  key={day}
                  style={{ flexDirection: "row", alignItems: "center" }}
                >
                  {/* DAY */}
                  <View
                    style={{
                      width: DAY_LABEL_WIDTH,
                      alignItems: "flex-end",
                      paddingRight: 4,
                    }}
                  >
                    <AppText style={{ fontSize: 10 }}>
                      {day}
                    </AppText>
                  </View>

                  {monthShort.map((_, monthIndex) => {
                    if (day > daysInMonth(year, monthIndex)) {
                      return (
                        <View
                          key={monthIndex}
                          style={{
                            width: CELL_SIZE,
                            height: CELL_SIZE,
                            margin: CELL_MARGIN,
                          }}
                        />
                      );
                    }

                    const dateStr = `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

                    const todayStr = new Date().toISOString().slice(0, 10);
                    const isToday = dateStr === todayStr;
                    const isFuture = dateStr > todayStr;
                    const entry = entriesMap[dateStr];

                    return (
                      <TouchableOpacity
                        key={monthIndex}
                        onPress={() => {
                          if (isFuture) return;

                          if (entry) {
                            router.push(`/mood/${entry.id}`);
                          } else {
                            router.push({
                              pathname: "/mood/mood-form",
                              params: { date: dateStr },
                            });
                          }
                        }}
                          style={{
                            width: CELL_SIZE,
                            height: CELL_SIZE,
                            margin: CELL_MARGIN,
                            borderRadius: 2,
                            backgroundColor: entry
                              ? MOOD_COLORS[entry.mood as keyof typeof MOOD_COLORS]
                              : colors.card,
                            justifyContent: "center",
                            alignItems: "center",

                            // today border
                            borderWidth: isToday ? 1.5 : 0,
                            borderColor: isToday ? colors.white : "transparent",
                          }}
                      >
                        {entry?.note && (
                          <View
                            style={{
                              position: "absolute",
                              top: 2,
                              right: 2,
                              width: 4,
                              height: 4,
                              borderRadius: 2,
                              backgroundColor: colors.white,
                              opacity: 0.9,
                            }}
                          />
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              );
            })}
          </View>
        </ScrollView>
      </ScrollView>

      {/* ADD BUTTON */}
      <FloatingButton
        onPress={() => router.push("/mood/mood-form")}
      />
    </View>
  );
}