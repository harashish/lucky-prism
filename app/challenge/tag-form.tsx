import { ScrollView, TouchableOpacity, View } from "react-native";
import { useEffect, useState } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";

import { colors, radius, spacing } from "../../ui/theme";
import FormSection from "../../ui/components/FormSection";
import FormField from "../../ui/components/FormField";
import FormButton from "../../ui/components/FormButton";
import FormErrorModal from "../../ui/components/FormErrorModal";

import { useChallengeStore } from "../../features/challenge/challenge.store";
import { challengeRepo } from "../../features/challenge/challenge.repo";
import { DELETE_TAG_ERROR_MESSAGES } from "../../features/challenge/challenge.service";


const colorPalette = [
  "#6C5CE7",
  "#00B894",
  "#E17055",
  "#0984E3",
  "#E84393",
];

export default function TagFormScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const id = params.id ? Number(params.id) : undefined;

  const {
    createTag,
    updateTag,
    deleteTag,
  } = useChallengeStore();

  const [name, setName] = useState("");
  const [color, setColor] = useState(colors.cardSecondary);
  const [error, setError] = useState("");

  // LOAD EXISTING
  useEffect(() => {
    if (!id) return;

    const tag = challengeRepo.getTagById(id);
    if (!tag) return;

    setName(tag.name);
  }, [id]);

  const handleSubmit = () => {
    if (!name.trim()) {
      setError("Name is required");
      return;
    }

    if (id) {
      updateTag(id, name, color);
    } else {
      createTag(name, color);
    }

    router.back();
  };

  const handleDelete = () => {
    if (!id) return;

    const result = deleteTag(id);

    if (!result.ok) {
    setError(DELETE_TAG_ERROR_MESSAGES[result.reason]);
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
        <FormSection title="Tag name">
          <FormField value={name} onChange={setName} />
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