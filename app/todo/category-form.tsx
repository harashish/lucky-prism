import { ScrollView, TouchableOpacity, View } from "react-native";
import { useEffect, useState } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";

import { colors, radius, spacing } from "../../ui/theme";
import FormSection from "../../ui/components/FormSection";
import FormField from "../../ui/components/FormField";
import FormButton from "../../ui/components/FormButton";
import FormErrorModal from "../../ui/components/FormErrorModal";
import { SelectChips } from "../../ui/components/SelectChips";

import { useTodoStore } from "../../features/todo/todo.store";
import { todoRepo } from "../../features/todo/todo.repo";
import { DIFFICULTIES, Difficulty } from "../../features/gamification/difficulty";

// ===== CONFIG =====

const colorPalette = [
  "#6C5CE7",
  "#00B894",
  "#E17055",
  "#0984E3",
  "#E84393",
];

const difficulties = Object.keys(DIFFICULTIES) as Difficulty[];

export default function CategoryFormScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const id = params.id ? Number(params.id) : undefined;

  const {
    createCategory,
    updateCategory,
    deleteCategory,
  } = useTodoStore();

  const [name, setName] = useState("");
  const [color, setColor] = useState(colors.cardSecondary);
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [isDefault, setIsDefault] = useState(false);

  const [error, setError] = useState("");

  // ===== LOAD EXISTING =====

  useEffect(() => {
    if (!id) return;

    const category = todoRepo.getCategoryById(id);
    if (!category) return;

    setName(category.name);
    setColor(category.color || colors.cardSecondary);
    setDifficulty(category.difficulty);
    setIsDefault(!!category.is_default);
  }, [id]);

  // ===== SUBMIT =====

  const handleSubmit = () => {
    if (!name.trim()) {
      setError("Name is required");
      return;
    }

    const data = {
      id,
      name,
      color,
      difficulty,
    };

    if (id) {
      updateCategory(id, data);
    } else {
      createCategory(data);
    }

    router.back();
  };

  // ===== DELETE =====

  const handleDelete = () => {
    if (!id) return;

    const result = deleteCategory(id);

    if (!result.ok) {
      if (result.reason === "default_category") {
        setError("Default category cannot be deleted");
      } else if (result.reason === "last_category") {
        setError("You must have at least one category");
      }
      return;
    }

    router.back();
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
        <FormSection title="Category name">
          <FormField value={name} onChange={setName} />
        </FormSection>

        {/* DIFFICULTY */}
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

        {/* COLOR */}
        {/*
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
        */}

        <FormButton label="Save" onPress={handleSubmit} />

        {/* DELETE */}
        {id && !isDefault && (
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