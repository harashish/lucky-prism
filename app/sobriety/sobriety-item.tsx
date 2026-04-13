import React, { useEffect, useState, useMemo } from "react";
import { View, TouchableOpacity, Alert } from "react-native";
import AppText from "../../ui/components/AppText";
import { colors, radius, spacing, fonts } from "../../ui/theme";
import { useSobrietyStore } from "../../features/sobriety/sobriety.store";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";

dayjs.extend(duration);

type Props = {
  item: any;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onEdit: () => void;
};

const milestones = [1, 7, 30, 90, 180, 365, 730];

export default function SobrietyItem({
  item,
  isExpanded,
  onToggleExpand,
  onEdit,
}: Props) {
  const { relapse, restart } = useSobrietyStore();

  const [now, setNow] = useState(dayjs());

  // ✅ LIVE UPDATE
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(dayjs());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // =========================
  // TIME CALC
  // =========================

  const { formatted, totalDays } = useMemo(() => {
    const start = dayjs(item.started_at);
    const end = item.is_active ? now : dayjs(item.ended_at);

    const diffMs = Math.max(0, end.diff(start));
    const diff = dayjs.duration(diffMs);

    const days = Math.floor(diff.asDays());
    const hours = diff.hours();
    const minutes = diff.minutes();
    const seconds = diff.seconds();

    let formatted = "";
    if (days > 0) formatted += `${days}d `;
    if (hours > 0 || days > 0) formatted += `${hours}h `;
    if (minutes > 0 || hours > 0 || days > 0)
      formatted += `${minutes}m `;
    formatted += `${seconds}s`;

    return {
      formatted: formatted.trim(),
      totalDays: diff.asDays(),
    };
  }, [now, item.started_at, item.ended_at, item.is_active]);

  // =========================
  // PROGRESS
  // =========================

  const currentMilestone = useMemo(() => {
    for (let i = 0; i < milestones.length; i++) {
      if (totalDays < milestones[i]) return milestones[i];
    }

    const years = Math.floor(totalDays / 365);
    return (years + 1) * 365;
  }, [totalDays]);

  const progressPercent = Math.min(
    (totalDays / currentMilestone) * 100,
    100
  );

  const progressLabel = useMemo(() => {
    if (currentMilestone >= 365) {
      return `(${(totalDays / 365).toFixed(1)} / ${
        currentMilestone / 365
      } years)`;
    }

    return `(${Math.floor(totalDays)} / ${currentMilestone} days)`;
  }, [totalDays, currentMilestone]);

  // =========================
  // ACTIONS
  // =========================

  const confirmRelapse = () => {
    Alert.alert("End sobriety?", "This will reset your streak.", [
      { text: "Cancel" },
      { text: "Relapse", onPress: () => relapse(item.id) },
    ]);
  };

  return (
    <TouchableOpacity onPress={onToggleExpand} onLongPress={onEdit}>
      <View
        style={{
            padding: spacing.m,
            marginVertical: spacing.s,
            borderRadius: radius.md,
            backgroundColor: colors.card,
            opacity: !item.is_active ? 0.5 : 1,
        }}
      >
        {/* NAME */}
        <AppText style={{ fontSize: 16, fontFamily: fonts.interBold }}>
          free from {item.name}
        </AppText>

        {/* TIMER */}
        <AppText
          style={{
            fontSize: 21,
            marginTop: 6,
            color: item.is_active ? colors.text : colors.muted,
          }}
        >
          {formatted}
        </AppText>

        {/* PROGRESS BAR */}
        <View style={{ marginTop: 10 }}>
          <View
            style={{
              height: 10,
              backgroundColor: colors.background,
              borderRadius: 6,
              overflow: "hidden",
            }}
          >
            <View
              style={{
                width: `${progressPercent}%`,
                height: 10,
                backgroundColor: colors.accent,
              }}
            />
          </View>

          <AppText style={{ fontSize: 12, marginTop: 4 }}>
            {Math.floor(progressPercent)}% {progressLabel}
          </AppText>
        </View>

        {!item.is_active && (
          <AppText style={{ fontSize: 12, color: colors.muted }}>
            ended {dayjs(item.ended_at).format("DD MMM YYYY")}
          </AppText>
        )}

        {/* EXPANDED */}
        {isExpanded && (
          <View style={{ marginTop: 12 }}>
            {item.description ? (
              <AppText style={{ fontSize: 12, color: colors.muted }}>
                {item.description}
              </AppText>
            ) : null}

            <AppText style={{ fontSize: 12, marginTop: 6 }}>
              {item.motivation_reason}
            </AppText>

            <View style={{ marginTop: 12 }}>
              {item.is_active ? (
                <TouchableOpacity
                  onPress={confirmRelapse}
                  style={{
                    backgroundColor: colors.buttonDelete,
                    padding: 8,
                    borderRadius: 6,
                    width: "100%",
                    alignItems: "center",
                  }}
                >
                  <AppText style={{ color: "#fff" }}>
                    relapse
                  </AppText>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  onPress={() => restart(item.id)}
                  style={{
                    backgroundColor: colors.buttonConfirm,
                    padding: 8,
                    borderRadius: 6,
                    width: "100%",
                    alignItems: "center",
                  }}
                >
                  <AppText style={{ color: "#fff" }}>
                    restart
                  </AppText>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}