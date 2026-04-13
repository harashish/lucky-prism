import {
  View,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useEffect, useState } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";

import AppText from "../../ui/components/AppText";
import FormSection from "../../ui/components/FormSection";
import FormField from "../../ui/components/FormField";
import FormButton from "../../ui/components/FormButton";
import FormErrorModal from "../../ui/components/FormErrorModal";
import FormToggleSection from "../../ui/components/FormToggleSelection";
import { confirmDelete } from "../../ui/components/confirmDelete";

import { colors, spacing, radius } from "../../ui/theme";

import { useSobrietyStore } from "../../features/sobriety/sobriety.store";
import { sobrietyRepo } from "../../features/sobriety/sobriety.repo";

import DateTimePicker from "@react-native-community/datetimepicker";

export default function SobrietyFormScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const id = params.id ? Number(params.id) : undefined;

  const { upsert, delete: deleteSobriety } = useSobrietyStore();

  const [existing, setExisting] = useState<any>();

  useEffect(() => {
    if (!id) return;
    setExisting(sobrietyRepo.getById(id));
  }, [id]);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [why, setWhy] = useState("");

  // 🔥 DATE + TIME
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const [showHelpers, setShowHelpers] = useState(false);
  const [error, setError] = useState("");

  // =========================
  // LOAD EXISTING
  // =========================

  useEffect(() => {
    if (!existing) return;

    setName(existing.name || "");
    setDescription(existing.description || "");
    setWhy(existing.motivation_reason || "");

    if (existing.started_at) {
      const d = new Date(existing.started_at);
      setDate(d);
      setTime(d);
    }
  }, [existing]);

  // =========================
  // SUBMIT
  // =========================

  const handleSubmit = () => {
    if (!name.trim()) {
      setError("Name is required");
      return;
    }

    if (!why.trim()) {
      setError("Motivation is required");
      return;
    }

    // 🔥 merge date + time
    const started = new Date(date);
    started.setHours(time.getHours());
    started.setMinutes(time.getMinutes());
    started.setSeconds(0);

    upsert({
      id: existing?.id,

      name,
      description,
      motivation_reason: why,

      started_at: started.toISOString(),
      ended_at: existing?.ended_at ?? null,

      is_active: existing?.is_active ?? 1,

      created_at: existing?.created_at ?? new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    router.back();
  };

  // =========================
  // DELETE
  // =========================

  const handleDelete = () => {
    if (!id) return;

    confirmDelete({
      onConfirm: () => {
        deleteSobriety(id);
        router.back();
      },
    });
  };

  return (
    <>
      <ScrollView
        contentContainerStyle={{
          padding: spacing.l,
          paddingBottom: 40,
        }}
        keyboardShouldPersistTaps="handled"
      >
        {/* NAME */}
        <FormSection title="Name">
          <FormField value={name} onChange={setName} />
        </FormSection>

        {/* DESCRIPTION */}
        <FormSection title="Description">
          <FormField
            value={description}
            onChange={setDescription}
            multiline
          />
        </FormSection>

        {/* WHY */}
        <FormSection title="Why it's important">
          <FormField value={why} onChange={setWhy} multiline />

          <FormToggleSection
            title="helper questions"
            expanded={showHelpers}
            onToggle={() => setShowHelpers((p) => !p)}
          >
            <View style={{ padding: 10 }}>
              {[
                "What triggers this habit?",
                "When do I feel the urge most?",
                "What emotion am I escaping?",
                "What will improve if I stay sober?",
                "How do I feel after relapse?",
              ].map((q, i) => (
                <AppText key={i} style={{ fontSize: 13 }}>
                  - {q}
                </AppText>
              ))}
            </View>
          </FormToggleSection>
        </FormSection>

        {/* 🔥 DATE + TIME */}
        <FormSection title="Start date & time">
          <View style={{ flexDirection: "row", gap: 12 }}>
            {/* DATE */}
            <View style={{ flex: 1 }}>
              <TouchableOpacity
                onPress={() => setShowDatePicker(true)}
                style={{
                  backgroundColor: colors.card,
                  padding: 12,
                  borderRadius: radius.xs,
                }}
              >
                <AppText>
                  {date.toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </AppText>
              </TouchableOpacity>
            </View>

            {/* TIME */}
            <View style={{ flex: 1 }}>
              <TouchableOpacity
                onPress={() => setShowTimePicker(true)}
                style={{
                  backgroundColor: colors.card,
                  padding: 12,
                  borderRadius: radius.md,
                }}
              >
                <AppText>
                  {time.toTimeString().slice(0, 5)}
                </AppText>
              </TouchableOpacity>
            </View>
          </View>
        </FormSection>

        {/* PICKERS */}
        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            onChange={(e, d) => {
              setShowDatePicker(false);
              if (d) setDate(d);
            }}
          />
        )}

        {showTimePicker && (
          <DateTimePicker
            value={time}
            mode="time"
            onChange={(e, t) => {
              setShowTimePicker(false);
              if (t) setTime(t);
            }}
          />
        )}

        {/* ACTIONS */}
        <FormButton
          label={id ? "Save" : "Start"}
          onPress={handleSubmit}
        />

        {id && (
          <FormButton
            label="Delete"
            variant="danger"
            onPress={handleDelete}
          />
        )}
      </ScrollView>

      <FormErrorModal
        visible={!!error}
        message={error}
        onClose={() => setError("")}
      />
    </>
  );
}