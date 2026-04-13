import React, { useState, useCallback } from "react";
import {
  View,
  TouchableOpacity,
  FlatList,
  TextInput,
} from "react-native";
import { router, useFocusEffect, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Swipeable } from "react-native-gesture-handler";
import { StyleSheet } from "react-native";
import { Keyboard } from "react-native";

import AppText from "../../ui/components/AppText";
import { colors, radius, spacing } from "../../ui/theme";

import { useTodoStore } from "../../features/todo/todo.store";
import { KeyboardAvoidingView, Platform } from "react-native";
import SectionLabel from "../../ui/components/SectionLabel";

export default function TodoScreen() {

  const router = useRouter();

  const {
    categories,
    tasks,
    selectedCategoryId,
    load,
    setCategory,
    createTask,
    completeTask,
    uncompleteTask,
    updateTask,
    deleteTask,
    randomTask,
  } = useTodoStore();

  const [quickText, setQuickText] = useState("");
  const [showCompleted, setShowCompleted] = useState(false);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingText, setEditingText] = useState("");

  const [isRolling, setIsRolling] = useState(false);
  const [rollingText, setRollingText] = useState("");
  const [isFinishedRolling, setIsFinishedRolling] = useState(false);

  const filteredTasks = tasks.filter((t) =>
    showCompleted ? t.is_completed : !t.is_completed
  );

  // ===== LOAD =====
  useFocusEffect(
    useCallback(() => {
      load();
    }, [])
  );

  // ===== QUICK ADD =====
  const handleQuickAdd = () => {
    if (!quickText.trim()) return;
    if (!selectedCategoryId) return;

    createTask({
      content: quickText,
      category_id: selectedCategoryId,
      custom_difficulty: null,
    });

    setQuickText("");
  };

  // ===== RANDOM =====
  const handleRandom = () => {
    if (filteredTasks.length === 0) return;

    setIsRolling(true);

    const items = filteredTasks;
    let index = 0;
    let speed = 50;
    let totalTime = 0;
    const maxTime = 1500;

    const roll = () => {
      const item = items[index % items.length];
      setRollingText(item.content);
      index++;

      totalTime += speed;
      speed *= 1.15;

      if (totalTime < maxTime) {
        setTimeout(roll, speed);
      } else {
        const random =
          items[Math.floor(Math.random() * items.length)];

        setRollingText(random.content);
        setIsFinishedRolling(true);
      }
    };

    roll();
  };

  const handleSetCategory = (id: number) => {
  setCategory(id);
  setShowCompleted(false);
};

// ===== RENDER ITEM =====
const renderItem = ({ item }: any) => {
  const isCompleted = !!item.is_completed;

  return (
<Swipeable
  enabled={editingId !== item.id}
  overshootLeft={false}
  overshootRight={false}
  friction={2}

  onSwipeableOpen={(direction) => {
    if (!isCompleted) {
      // ACTIVE
      if (direction === "right") {
        completeTask(item.id);
      } else if (direction === "left") {
        deleteTask(item.id);
      }
    } else {
      // COMPLETED
      if (direction === "right") {
        uncompleteTask(item.id);
      } else if (direction === "left") {
        deleteTask(item.id);
      }
    }
  }}

  renderRightActions={() => (
    
    <View
    pointerEvents={isRolling ? "none" : "auto"}
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "flex-end",
        marginVertical: 4,
      }}
    >
      <View
        style={{
          ...StyleSheet.absoluteFillObject,
          backgroundColor: colors.buttonConfirm,
          borderRadius: radius.md,
        }}
      />

    <AppText style={{ color: "#fff", paddingHorizontal: 20 }}>
      {isCompleted ? "restore" : "done"}
    </AppText>
    </View>
  )}

  renderLeftActions={() => (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "flex-start",
        marginVertical: 4,
      }}
    >
      <View
        style={{
          ...StyleSheet.absoluteFillObject,
          backgroundColor: colors.buttonDelete,
          borderRadius: radius.md,
        }}
      />

      <AppText style={{ color: "#fff", paddingHorizontal: 20 }}>
        delete
      </AppText>
    </View>
  )}
>
<TouchableOpacity
  activeOpacity={0.9}
  onLongPress={() => {
    setEditingId(item.id);
    setEditingText(item.content);
  }}
>
  <View
    style={{
      padding: spacing.m,
      marginVertical: 4,
      borderRadius: radius.md,
      backgroundColor: colors.card,
      opacity: isCompleted ? 0.4 : 1,
    }}
  >
    {editingId === item.id ? (
      <TextInput
        value={editingText}
        onChangeText={setEditingText}
        cursorColor={colors.accent}
        selectionColor={colors.accent}
        autoFocus
        onBlur={() => {
          if (editingText.trim()) {
            updateTask(item.id, { content: editingText });
          }
          setEditingId(null);
          Keyboard.dismiss();
        }}
        onSubmitEditing={() => {
          if (editingText.trim()) {
            updateTask(item.id, { content: editingText });
          }
          setEditingId(null);
          Keyboard.dismiss();
        }}
        style={{
          color: colors.text,
        }}
      />
    ) : (
      <AppText
        style={{
          textDecorationLine: isCompleted ? "line-through" : "none",
        }}
      >
        {item.content}
      </AppText>
    )}
  </View>
</TouchableOpacity>
    </Swipeable>
  );
};

return (
  <View
    style={{
      flex: 1,
      padding: 12,
      backgroundColor: colors.background,
    }}
  >

  <View style={{ alignItems: "center", marginBottom: 8 }}>
    <TouchableOpacity
      onPress={() => setShowCompleted(!showCompleted)}
      style={{ paddingTop: 2, paddingHorizontal: 10 }}
    >
      <SectionLabel>
        {showCompleted ? "completed" : "active"}
      </SectionLabel>
    </TouchableOpacity>

    <TouchableOpacity
  onPress={handleRandom}
  style={{
    position: "absolute",
    right: 0,
    top: -4,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: radius.sm,
  }}
>
  <Ionicons name="dice-outline" size={16} color={colors.muted} />
</TouchableOpacity>
  </View>


    {/* ===== CATEGORIES ===== */}
    <View
      style={{
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
        marginBottom: 12,
        alignItems: "center",
      }}
    >
      {categories.map((cat) => {
        const isActive = selectedCategoryId === cat.id;

        return (
          <TouchableOpacity
            key={cat.id}
            onPress={() => setCategory(cat.id)}
            style={{
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: radius.sm,
              backgroundColor: isActive
                ? colors.buttonActive
                : colors.card,
            }}
          >
            <AppText style={{ fontSize: 12 }}>
              {cat.name}
            </AppText>
          </TouchableOpacity>
        );
      })}

      <TouchableOpacity
        onPress={() => router.push("/todo/category-form")}
        style={{
          paddingHorizontal: 12,
          paddingVertical: 8,
          borderRadius: radius.sm,
          backgroundColor: colors.buttonActive,
        }}
      >
        <AppText>+</AppText>
      </TouchableOpacity>
    </View>

          <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={30}
      >

    {filteredTasks.length === 0 ? (
      <View style={{ alignItems: "center", marginTop: 50 }}>
        <AppText style={{ color: colors.muted }}>
          {showCompleted
            ? "no completed tasks"
            : "no tasks yet"}
        </AppText>
      </View>
    ) : (
      <FlatList
        key={showCompleted ? "completed" : "active"}
        data={filteredTasks}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 120 }}
      />
    )}

{/* ===== QUICK ADD (KEYBOARD SAFE) ===== */}
{!showCompleted && (
    
    <View
      style={{
        paddingTop: 12,
        paddingBottom: 0,
        paddingHorizontal: 2,
        backgroundColor: colors.background,
        flexDirection: "row",
        marginTop: "auto",
      }}
    >
      <TextInput
        value={quickText}
        onChangeText={setQuickText}
        placeholder="Quick add..."
        placeholderTextColor={colors.muted}
        cursorColor={colors.accent}
        selectionColor={colors.accent}
        style={{
          flex: 1,
          paddingLeft: 12,
          borderRadius: radius.md,
          backgroundColor: colors.card,
          marginRight: 8,
          color: colors.text,
        }}
      />

      <TouchableOpacity
        onPress={handleQuickAdd}
        style={{
          padding: 12,
          borderRadius: radius.md,
          backgroundColor: colors.accent,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <AppText style={{ color: "#fff" }}>+</AppText>
      </TouchableOpacity>
    </View>
    )}
    </KeyboardAvoidingView>
{/* OVERLAY */}
{isRolling && (
  <View
    style={{
      position: "absolute",
      top: 0, left: 0, right: 0, bottom: 0,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "rgba(0,0,0,0.6)", // Trochę ciemniej, żeby tekst był czytelny
      zIndex: 999,
    }}
  >
    <View
      style={{
        width: "80%",
        backgroundColor: colors.card,
        paddingVertical: 40,
        paddingHorizontal: 24,
        borderRadius: radius.lg,
        alignItems: "center",
        // Dodaj lekkie uniesienie (shadow), żeby modal się odcinał
        elevation: 5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      }}
    >
      <AppText
        style={{
          fontSize: 20,
          fontWeight: "600",
          textAlign: "center",
          marginBottom: isFinishedRolling ? 24 : 0, // Margines tylko gdy pojawi się przycisk
          color: colors.text,
        }}
      >
        {rollingText}
      </AppText>

      {/* PRZYCISK POJAWIA SIĘ TYLKO GDY KONIEC LOSOWANIA */}
      {isFinishedRolling && (
        <TouchableOpacity
          onPress={() => {
            setIsRolling(false);
            setIsFinishedRolling(false); // Reset na przyszłość
          }}
          style={{
            width: "100%",
            alignItems: "center",
            paddingVertical: 14,
            borderRadius: radius.md,
            backgroundColor: colors.buttonConfirm,
          }}
        >
          <AppText style={{ color: "#fff", fontWeight: "bold", textTransform: "uppercase" }}>
            ok
          </AppText>
        </TouchableOpacity>
      )}
    </View>
  </View>
)}
  </View>
);
}