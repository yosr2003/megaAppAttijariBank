import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import ConversationItem from "../../../components/ConversationItem";
import { conversations } from "../../../data/conversations";
import { Colors } from "../../../constants/home/Colors";
import { Layout, Radius, Spacing } from "../../../constants/home/Layout";
import { Typography } from "../../../constants/home/Typography";

export default function MessagesScreen() {
  const [search, setSearch] = useState("");

  const filtered = conversations.filter((c) =>
    c.user.name.toLowerCase().includes(search.trim().toLowerCase())
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
          <Ionicons name="chevron-back" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Messages</Text>
        <View style={styles.iconBtn} />
      </View>

      <View style={styles.searchBar}>
        <Ionicons name="search" size={16} color={Colors.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher une conversation..."
          placeholderTextColor={Colors.textMuted}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {filtered.map((c) => (
          <ConversationItem key={c.id} conversation={c} onPress={() => router.push(`/messages/${c.id}`)} />
        ))}
        {filtered.length === 0 && <Text style={styles.empty}>Aucune conversation trouvée.</Text>}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Layout.screenPadding,
    paddingBottom: Spacing.md,
  },
  iconBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  title: { ...Typography.h2, color: Colors.textPrimary },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginHorizontal: Layout.screenPadding,
    marginBottom: Spacing.sm,
    backgroundColor: Colors.card,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    paddingHorizontal: Spacing.md,
    height: 42,
  },
  searchInput: { flex: 1, color: Colors.textPrimary, ...Typography.body },
  list: { paddingHorizontal: Layout.screenPadding, paddingBottom: Spacing.xl },
  empty: { ...Typography.body, color: Colors.textMuted, textAlign: "center", marginTop: Spacing.xl },
});