import { ScrollView } from "react-native";
import { useEffect, useState } from "react";
import { spacing } from "../../ui/theme";
import { useRouter, useLocalSearchParams } from "expo-router";

import FormErrorModal from "../../ui/components/FormErrorModal";
import FormField from "../../ui/components/FormField";
import FormButton from "../../ui/components/FormButton";
import FormSection from "../../ui/components/FormSection";
import { SelectChips } from "../../ui/components/SelectChips";

import { DIFFICULTIES, Difficulty } from "../../features/gamification/difficulty";
import { Period, PERIODS } from "../../features/challenge/challenge.types";
import { useChallengeStore } from "../../features/challenge/challenge.store";
import { challengeRepo } from "../../features/challenge/challenge.repo";

const difficulties = Object.keys(DIFFICULTIES) as Difficulty[];

const periods = PERIODS.map(p => ({
  value: p,
  label: p,
}));

export default function ChallengeFormScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const id = params.id ? Number(params.id) : undefined;

  const {
    upsertDefinition,
    deleteDefinition,
    tags,
  } = useChallengeStore();

  const [existing, setExisting] = useState<any>();

  useEffect(() => {
    if (!id) return;

    const def = challengeRepo.getDefinitionById(id);
    const defTags = def ? challengeRepo.getTagsForDefinition(id) : [];

    setExisting({
      ...def,
      tags: defTags,
    });
  }, [id]);

  useEffect(() => {
    // tylko create mode
    if (id) return;

    // tylko jeśli jeszcze nic nie wybrane
    if (selectedTags.length > 0) return;

    // jeśli jest przynajmniej jeden tag
    if (tags.length > 0) {
      setSelectedTags([tags[0].id!]);
    }
  }, [tags, id]);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [type, setType] = useState<Period>("daily");

  const [selectedTags, setSelectedTags] = useState<number[]>([]);

  const [error, setError] = useState("");

  // LOAD EXISTING
  useEffect(() => {
    if (!existing) return;

    setTitle(existing.title || "");
    setDescription(existing.description || "");
    setDifficulty(existing.difficulty);
    setType(existing.type);

    setSelectedTags(existing.tags?.map((t: any) => t.id) || []);
  }, [existing]);

  const handleSubmit = () => {
    if (!title.trim()) {
      setError("Name is required");
      return;
    }

    if (selectedTags.length === 0) {
      setError("Select at least one tag");
      return;
    }

    upsertDefinition(
      {
        id: existing?.id,
        title,
        description,
        difficulty,
        type,
      },
      selectedTags
    );

    router.back();
  };

  const handleDelete = () => {
    if (!id) return;

    deleteDefinition(id);
    router.back();
  };

  const getTagIdByName = (name: string) => {
    return tags.find((t) => t.name === name)?.id;
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
          <FormField value={title} onChange={setTitle} />
        </FormSection>

        {/* DESCRIPTION */}
        <FormSection title="Description">
          <FormField
            value={description}
            onChange={setDescription}
            multiline
          />
        </FormSection>

        {/* TYPE */}
        <FormSection title="Type">
          <SelectChips
            options={periods}
            selected={type}
            onSelect={setType}
          />
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

        {/* TAGS */}
        <FormSection title="Tags">
          <SelectChips
            options={tags.map(t => ({
              value: t.id!,
              label: t.name,
            }))}
            selected={selectedTags}
            onSelect={(id) => {
              setSelectedTags((prev) =>
                prev.includes(id)
                  ? prev.filter((i) => i !== id)
                  : [...prev, id]
              );
            }}
            multiple
          />
        </FormSection>

        <FormButton label="Save" onPress={handleSubmit} />

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