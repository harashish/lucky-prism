import { View, TouchableOpacity, ScrollView } from "react-native";
import { useEffect, useState } from "react";
import AppText from "../../ui/components/AppText";
import { useGoalStore } from "./goal.store";
import { colors, spacing, radius } from "../../ui/theme";
import { useRouter, useLocalSearchParams } from "expo-router";
import FormErrorModal from "../../ui/components/FormErrorModal";
import { confirmDelete } from "../../ui/components/confirmDelete";
import FormField from "../../ui/components/FormField";
import { SelectChips } from "../../ui/components/SelectChips";
import FormButton from "../../ui/components/FormButton";
import FormSection from "../../ui/components/FormSection";
import FormToggleSection from "../../ui/components/FormToggleSelection";
import { DIFFICULTIES, Difficulty } from "../gamification/difficulty";
import { PERIODS, Period } from "./goal.types";
import { goalRepo } from "./goal.repo";

const difficulties = Object.keys(DIFFICULTIES) as Difficulty[];
const periods = Object.keys(PERIODS) as Period[];

export default function GoalFormScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const id = params.id ? Number(params.id) : undefined;

  const initialPeriod =
    (params.period as Period) || "weekly";

  const { upsertGoal, deleteGoal, addStep, deleteStep } =
    useGoalStore();

  // bez tego nie dało się zmienić nazwy jak było:
  // const existing = id ? goalRepo.getById(id) : undefined;
  const [existing, setExisting] = useState<any>();

  useEffect(() => {
    if (!id) return;
    setExisting(goalRepo.getById(id));
  }, [id]);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [why, setWhy] = useState("");

  const [floor, setFloor] = useState("");
  const [target, setTarget] = useState("");
  const [ceiling, setCeiling] = useState("");

  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [period, setPeriod] = useState<Period>(initialPeriod);

  const [steps, setSteps] = useState<any[]>([]);

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

    setDifficulty(existing.difficulty);
    setPeriod(existing.period);

    setSteps(goalRepo.getSteps(existing.id!));
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

      if (!period) {
        setError("Select period");
        return;
      }

    // zapis goal
    const goalId = upsertGoal({
      id: existing?.id,
      title,
      description,
      motivation_reason: why,
      floor_goal: floor,
      target_goal: target,
      ceiling_goal: ceiling,
      difficulty,
      period,
      is_completed: existing?.is_completed ?? 0,
      is_archived: existing?.is_archived ?? 0,
      created_at: existing?.created_at ?? new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    if (!existing && goalId) {
      steps.forEach((s) => {
        addStep(goalId, s.title);
      });
    }

    router.back();
        };

  const handleDelete = () => {
    if (!id) return;

    confirmDelete({
      onConfirm: () => {
        deleteGoal(id);
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
          <FormField value={why} onChange={setWhy} multiline />

          {/* HELPERS */}
          <FormToggleSection
            title="helper questions"
            expanded={showHelpers}
            onToggle={() => setShowHelpers(p => !p)}
          >
            <View style={{ padding: 10 }}>
              {[
                "How will this help me grow?",
                "What will I strengthen in myself?",
                "What skills will I develop?",
                "What will happen if I don't do this?",
                "Why is this goal important?",
              ].map((q, i) => (
                <AppText key={i} style={{ fontSize: 13 }}>
                  - {q}
                </AppText>
              ))}
            </View>
          </FormToggleSection>

          {/* TARGETS */}
        <FormToggleSection
          title="targets"
          expanded={showGoals}
          onToggle={() => setShowGoals(p => !p)}
        >
      <View style={{ gap: 10 }}>

        <FormField label="Floor" value={floor} onChange={setFloor} />
          <FormField label="Target" value={target} onChange={setTarget} />
          <FormField label="Ceiling" value={ceiling} onChange={setCeiling} />

        {/* STEPS */}
        <View style={{ marginTop: 10 }}>
          {/* HEADER */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 6,
            }}
          >
            <AppText style={{ fontSize: 12, color: "#777" }}>
              Steps
            </AppText>

            <TouchableOpacity
              onPress={() => {
                setSteps((prev) => [
                  ...prev,
                  {
                    id: Date.now(),
                    title: "",
                    is_completed: 0,
                    temp: true,
                  },
                ]);
              }}
              style={{
                width: 28,
                height: 28,
                borderRadius: radius.sm,
                backgroundColor: colors.buttonActive,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <AppText style={{ color: "#fff", fontSize: 16 }}>+</AppText>
            </TouchableOpacity>
          </View>

          {/* LISTA */}
          {steps.map((s, i) => (
            <View
              key={s.id}
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 8,
              }}
            >
              <View style={{ flex: 1 }}>
                <FormField
                  value={s.title}
                  onChange={(text) => {
                    const copy = [...steps];
                    copy[i].title = text;
                    setSteps(copy);
                  }}
                  placeholder="Step..."
                />
              </View>

              {/* DELETE */}
              <TouchableOpacity
                onPress={() => {
                  setSteps((prev) => prev.filter((x) => x.id !== s.id));

                  if (existing?.id && !s.temp) {
                    deleteStep(s.id);
                  }
                }}
                style={{
                  marginLeft: 8,
                  width: 28,
                  height: 28,
                  borderRadius: radius.sm,
                  backgroundColor: "#3a2f2d",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <AppText style={{ color: "#fff", fontSize: 16 }}>×</AppText>
              </TouchableOpacity>
            </View>
          ))}
        </View>
          </View>
        </FormToggleSection>
            </FormSection>

            {/* PERIOD */}
            <FormSection title="Period">
              <SelectChips
                options={periods}
                selected={period}
                onSelect={setPeriod}
              />
            </FormSection>

            {/* DIFFICULTY */}
            <FormSection title="Difficulty">
              <SelectChips
                options={difficulties}
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