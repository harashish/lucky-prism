import { View, TouchableOpacity, ScrollView } from "react-native";
import { useEffect, useState } from "react";
import AppText from "../../ui/components/AppText";
import { useHabitStore } from "../../features/habit/habit.store";
import { colors, spacing, radius } from "../../ui/theme";
import { useRouter, useLocalSearchParams } from "expo-router";
import FormErrorModal from "../../ui/components/FormErrorModal";
import { confirmDelete as confirmDelete } from "../../ui/components/confirmDelete";
import FormField from "../../ui/components/FormField";
import { SelectChips } from "../../ui/components/SelectChips";
import FormButton from "../../ui/components/FormButton";
import { DIFFICULTIES, Difficulty } from "../../features/gamification/difficulty";
import FormSection from "../../ui/components/FormSection";
import { habitRepo } from "../../features/habit/habit.repo";
import FormToggleSection from "../../ui/components/FormToggleSelection";

const difficulties = Object.keys(DIFFICULTIES) as Difficulty[];

/*const colorPalette = [
  "#908bab",
  "#E5FE86",
  "#825BA5",
  "#83CDEE",
  "#E4BEE6",
  "#EA97DC",
  "#A0B4EF",
];*/

const colorPalette = [
  "#9487b9",
  "#87b987",
  "#87adb9",
  "#b98787",
  "#b9b687",
  "#b987b5",
  "rgb(181, 160, 239)",
];

export default function HabitFormScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const id = params.id ? Number(params.id) : undefined;

  const { upsertHabit, deleteHabit } = useHabitStore();

  //const existing = id ? habitRepo.getById(id) : undefined;
  const [existing, setExisting] = useState<any>();

  useEffect(() => {
    if (!id) return;
    setExisting(habitRepo.getById(id));
  }, [id]);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [why, setWhy] = useState("");

  const [floor, setFloor] = useState("");
  const [target, setTarget] = useState("");
  const [ceiling, setCeiling] = useState("");

  const [color, setColor] = useState(colorPalette[0]);
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");

  const [showHelpers, setShowHelpers] = useState(false);
  const [showGoals, setShowGoals] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!existing) return;

    setTitle(existing.title || "");
    setDescription(existing.description || "");
    setWhy(existing.motivation_reason || "");

    setFloor(existing.floor_goal || "");
    setTarget(existing.target_goal || "");
    setCeiling(existing.ceiling_goal || "");

    setColor(existing.color || colorPalette[0]);
    setDifficulty(existing.difficulty as Difficulty);
  }, [existing]);

  const handleSubmit = () => {
    if (!title.trim()) {
      setError("Name is required");
      return;
    }

    if (!why.trim()) {
      setError("Motivation is required");
      return;
    }

    if (!difficulty) {
      setError("Select difficulty");
      return;
    }

    const payload = {
      title,
      description,
      motivation_reason: why,
      floor_goal: floor,
      target_goal: target,
      ceiling_goal: ceiling,
      color,
      difficulty,
      is_active: true,
    };

        upsertHabit({
      ...payload,
      id: existing?.id,
    });
    
    router.back();
  };

  const handleDelete = () => {
    if (!id) return;

    confirmDelete({
      onConfirm: () => {
        deleteHabit(id);
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
      <FormSection title="Name">
        <FormField value={title} onChange={setTitle} />
      </FormSection>

      <FormSection title="Description">
        <FormField
          value={description}
          onChange={setDescription}
          multiline
        />
      </FormSection>

      <FormSection title="Why it's important">
        <FormField
          value={why}
          onChange={setWhy}
          multiline
        />

      {/* HELPER QUESTIONS TOGGLE */}
      <FormToggleSection
        title="helper questions"
        expanded={showHelpers}
        onToggle={() => setShowHelpers(prev => !prev)}
      >
        <View
          style={{
            borderRadius: radius.md,
            padding: 10,
            marginBottom: spacing.m,
          }}
        >
          {[
            "How will this help me grow?",
            "What will I strengthen in myself?",
            "What skills will I develop?",
            "In which area of my life will this support me?",
            "What will happen if I don't do this?",
            "How do I feel when I avoid doing this?",
            "Why is this goal so important to me?",
            "What will I gain by achieving this goal?",
            "Why didn't I achieve this goal already? what's stopping me?",
          ].map((q, i) => (
            <AppText
              key={i}
              style={{
                fontSize: 13,
                marginBottom: 6,
              }}
            >
              - {q}
            </AppText>
          ))}
        </View>
      </FormToggleSection>

        {/* GOALS TOGGLE */}
        <FormToggleSection
          title="targets"
          expanded={showGoals}
          onToggle={() => setShowGoals(p => !p)}
        >
          <View
            style={{
              borderRadius: radius.md,
              padding: 10,
              marginBottom: spacing.m,
              gap: 10,
            }}
          >
            <FormField label="Floor" value={floor} onChange={setFloor} />
            <FormField label="Target" value={target} onChange={setTarget} />
            <FormField label="Ceiling" value={ceiling} onChange={setCeiling} />
          </View>
        </FormToggleSection>
      </FormSection>

      <FormSection title="Color">
        <View style={{ flexDirection: "row" }}>
          {colorPalette.map(c => (
            <TouchableOpacity
              key={c}
              onPress={() => setColor(c)}
              style={{
                width: 36,
                height: 36,
                borderRadius: radius.sm,
                backgroundColor: c,
                marginRight: 8,
                borderWidth: color === c ? 2 : 0,
                borderColor: colors.white,
              }}
            />
          ))}
        </View>
      </FormSection>

      <FormSection title="Difficulty">
        <SelectChips
          options={difficulties.map(d => ({
            value: d,
            label: d,
          }))}
          selected={difficulty}
          onSelect={setDifficulty}
        />
      </FormSection>

      <FormButton label="Save" onPress={handleSubmit} />

      {id ? (
        <FormButton
          label="Delete"
          variant="danger"
          onPress={handleDelete}
        />
      ) : null}
    </ScrollView>

    <FormErrorModal
      visible={!!error}
      message={error}
      onClose={() => setError("")}
    />
  </>
);
}
