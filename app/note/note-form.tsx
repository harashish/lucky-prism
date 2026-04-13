import { View, ScrollView } from "react-native";
import { useEffect, useState } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";

import AppText from "../../ui/components/AppText";
import FormField from "../../ui/components/FormField";
import FormButton from "../../ui/components/FormButton";
import FormErrorModal from "../../ui/components/FormErrorModal";
import { confirmDelete } from "../../ui/components/confirmDelete";

import { spacing } from "../../ui/theme";

import { useNotesStore } from "../../features/note/note.store";
import { notesRepo } from "../../features/note/note.repo";

export default function NoteFormScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const id = params.id ? Number(params.id) : undefined;

  const { upsert, delete: deleteNote } = useNotesStore();

  const [existing, setExisting] = useState<any>();

  useEffect(() => {
    if (!id) return;
    setExisting(notesRepo.getById(id));
  }, [id]);

  const [content, setContent] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!existing) return;
    setContent(existing.content || "");
  }, [existing]);

  // =========================
  // SUBMIT
  // =========================

  const handleSubmit = () => {
    if (!content.trim()) {
      setError("Note is empty");
      return;
    }

    upsert({
      id: existing?.id,
      content,

      created_at:
        existing?.created_at ?? new Date().toISOString(),
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
        deleteNote(id);
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
          flexGrow: 1,

          
            justifyContent: "center",
            alignItems: "center",
        }}
        keyboardShouldPersistTaps="handled"
      >
        {/* NOTE FIELD */}
        <View style={{ width: "100%", maxWidth: 500 }}>
          <FormField
            value={content}
            onChange={setContent}
            multiline
            placeholder="Write your note..."
            inputStyle={{
                minHeight: 200,
            }}
          />
        </View>

        {/* ACTIONS */}

        <View style={{ width: "100%" }}>
        <FormButton
            label={id ? "Save" : "Create"}
            onPress={handleSubmit}
        />
        </View>

        { id && (
        <View style={{ width: "100%" }}>
            <FormButton
            label="Delete"
            variant="danger"
            onPress={handleDelete}
            />
        </View>
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