import { View, TouchableOpacity, ScrollView } from "react-native";
import { useEffect, useState } from "react";
import AppText from "../../ui/components/AppText";
import { useMoodStore } from "./mood.store";
import { colors, radius, spacing } from "../../ui/theme";
import { useRouter, useLocalSearchParams } from "expo-router";
import DateTimePicker from "@react-native-community/datetimepicker";
import { EMOTIONS } from "./mood.constants";
import { confirmDelete } from "../../ui/components/confirmDelete";
import FormErrorModal from "../../ui/components/FormErrorModal";
import { SelectChips } from "../../ui/components/SelectChips";
import FormButton from "../../ui/components/FormButton";
import { MOODS } from "./mood.constants";
import FormSection from "../../ui/components/FormSection";
import FormField from "../../ui/components/FormField";
import { moodRepo } from "./mood.repo";

// MOODS is a readonly array (because of "as const")
// SelectChips expects a mutable array (T[])
// spreading (...) creates a new mutable copy so TS stops complaining
const moods = [...MOODS];

export default function MoodFormScreen() {
  const router = useRouter();

  const params = useLocalSearchParams();

  //const id = Number(params.id);
  const id = params.id ? Number(params.id) : undefined;
  const paramDate = Array.isArray(params.date) ? params.date[0] : params.date;

  const { entries, addMood, updateMood, deleteMood } = useMoodStore();

  // stary sposób ze store
  // zły bo store = snapshop UI, może być nieaktualny, np. po odświeżeniu lub jeśli ktoś wszedł bezpośrednio w edycję (nie z listy)
  //const existing = entries.find(e => e.id === Number(id));

  // nowy sposób - bezpośrednio z repo, które jest single source of truth
  //const existing = id ? moodRepo.getById(id) : undefined;
  // tylko że nie działało

  const [existing, setExisting] = useState<any>();

  useEffect(() => {
    if (!id) return;
    setExisting(moodRepo.getById(id));
  }, [id]);
  

  const [showEmotions, setShowEmotions] = useState(false);
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([]);

  const [date, setDate] = useState(
    paramDate
      ? new Date(paramDate)
      : new Date()
  );

  const [time, setTime] = useState(new Date());

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);


  type Mood = (typeof MOODS)[number];
  const [mood, setMood] = useState<Mood>(
    existing?.mood ?? "neutral"
  );

  const [note, setNote] = useState(existing?.note || "");

  const [error, setError] = useState("");

  useEffect(() => {
    if (!existing) return;

    setDate(new Date(existing.date));
    setTime(new Date(`1970-01-01T${existing.time}`));
    setMood(existing.mood);
    setNote(existing.note);
    setSelectedEmotions(existing.emotions || []);
  }, [existing]);

  const toggleEmotion = (e: string) => {
    setSelectedEmotions(prev =>
      prev.includes(e)
        ? prev.filter(x => x !== e)
        : [...prev, e]
    );
  };

  const handleSubmit = () => {
    const formattedDate = date.toISOString().slice(0, 10);

    const existingForDate = entries.find(
      e => e.date === formattedDate
    );

    // prevent duplicate day
    if (!existing && existingForDate) {
      setError("Mood already exists for this date");
      return;
    }

    // optional: prevent future (spójne z gridem)
    const today = new Date().toISOString().slice(0, 10);
    if (formattedDate > today) {
      setError("Cannot create mood in the future");
      return;
    }

    const payload = {
      mood,
      note,
      emotions: selectedEmotions,
      date: formattedDate,
      time: time.toTimeString().slice(0, 8),
    };

    if (existing) {
      updateMood({ ...payload, id: existing.id });
    } else {
      addMood(payload);
    }

    router.back();
  };

  const handleDelete = () => {
    if (!existing) return;

    confirmDelete({
      title: "Delete mood?",
      onConfirm: () => {
        deleteMood(existing.id!);
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
        {/* MOOD */}
        <FormSection title="Mood">
          <SelectChips
            options={moods}
            selected={mood}
            onSelect={setMood}
          />
        </FormSection>


        {/* EMOTIONS */}
        <FormSection title="Emotions">
          <TouchableOpacity
            onPress={() => setShowEmotions((s) => !s)}
            style={{
              marginTop: spacing.s,
              padding: 12,
              backgroundColor: colors.card,
              borderRadius: radius.sm,
            }}
          >
          <AppText>
            {selectedEmotions.length
              ? selectedEmotions.join(", ")
              : "Select emotions"}
          </AppText>
        </TouchableOpacity>

        {showEmotions && (
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              gap: 10,
              marginTop: spacing.l,
            }}
          >
            {EMOTIONS.map((e) => {
              const selected = selectedEmotions.includes(e.name);

              return (
                <TouchableOpacity
                  key={e.name}
                  onPress={() => toggleEmotion(e.name)}
                  style={{
                    paddingVertical: 8,
                    paddingHorizontal: 14,
                    borderRadius: radius.md,
                    backgroundColor: selected ? e.color : "#2a2a35",
                    borderWidth: selected ? 0 : 1,
                    borderColor: e.color,
                  }}
                >
                  <AppText
                    style={{
                      color: selected ? "#fff" : e.color,
                      fontWeight: "600",
                    }}
                  >
                    {e.name}
                  </AppText>
                </TouchableOpacity>
                
              );
            })}
            
          </View>
        )}
        </FormSection>

        {/* DATE + TIME */}
        <FormSection title="Date & Time">
          <View
            style={{
              flexDirection: "row",
              gap: 12,
            }}
          >
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

        {/* NOTE */}
        <FormSection title="Note">
          <FormField
            value={note}
            onChange={setNote}
            multiline
          />
        </FormSection>

        {/* SAVE */}
        <FormButton label="Save" onPress={handleSubmit} />

        {/* DELETE */}
        {existing && (
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