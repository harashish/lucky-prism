import React, { useCallback, useState } from "react";
import { View, FlatList } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";

import AppText from "../../ui/components/AppText";
import FloatingButton from "../../ui/components/FloatingButton";
import { colors } from "../../ui/theme";

import SobrietyItem from "../sobriety/sobriety-item";
import { useSobrietyStore } from "../../features/sobriety/sobriety.store";

export default function SobrietyScreen() {
  const router = useRouter();
  const { list, load } = useSobrietyStore();

  const [expandedId, setExpandedId] = useState<number | null>(null);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [])
  );

  return (
    <View style={{ flex: 1, padding: 12, backgroundColor: colors.background }}>
      {list.length === 0 ? (
        <View style={{ alignItems: "center", marginTop: 60 }}>
          <AppText style={{ color: colors.muted }}>
            no sobriety trackers yet
          </AppText>
        </View>
      ) : (
        <FlatList
          data={list}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ paddingBottom: 140 }}
          renderItem={({ item }) => (
            <SobrietyItem
              item={item}
              isExpanded={expandedId === item.id}
              onToggleExpand={() =>
                setExpandedId(expandedId === item.id ? null : item.id!)
              }
              onEdit={() =>
                router.push(`/sobriety/${item.id}`)
              }
            />
          )}
        />
      )}

      <FloatingButton onPress={() => router.push("/sobriety/sobriety-form")} />
    </View>
  );
}