import React, { useState } from "react";
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import BlogPostCard from "../../../components/BlogPostCard";
import StoryCircle from "../../../components/StoryCircle";
import SuggestedPanel from "../../../components/SuggestedPanel";
import { blogPosts } from "../../../data/blogPosts";
import { stories } from "../../../data/stories";
import { Colors } from "../../../constants/home/Colors";
import { Layout, Radius, Spacing } from "../../../constants/home/Layout";
import { Typography } from "../../../constants/home/Typography";

const TRENDING = ["#SuperTounsi", "#Fintech", "#SavingMoney", "#Tunisia", "#Crypto", "#Business"];
const ME_AVATAR = "https://i.pravatar.cc/150?img=68";

export default function BlogScreen() {
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [suggestedOpen, setSuggestedOpen] = useState(false);

  const filtered = activeTag ? blogPosts.filter((p) => p.hashtags.includes(activeTag)) : blogPosts;

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
          <Ionicons name="chevron-back" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.title}>Community</Text>
          <Text style={styles.subtitle}>Partagez votre parcours financier</Text>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.iconBtn} activeOpacity={0.8} onPress={() => router.push("/messages")}>
            <Ionicons name="chatbubbles" size={19} color={Colors.textPrimary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.iconBtn} activeOpacity={0.8}>
            <Ionicons name="notifications" size={19} color={Colors.textPrimary} />
            <View style={styles.dot} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.iconBtn, suggestedOpen && styles.iconBtnActive]}
            activeOpacity={0.8}
            onPress={() => setSuggestedOpen((v) => !v)}
          >
            <Ionicons name="people" size={19} color={Colors.textPrimary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <ScrollView
          horizontal
          style={styles.storiesScroll}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.storiesRow}
        >
          {stories.map((story) => (
            <StoryCircle key={story.id} story={story} />
          ))}
        </ScrollView>

        <TouchableOpacity style={styles.composer} activeOpacity={0.85}>
          <Image source={{ uri: ME_AVATAR }} style={styles.composerAvatar} />
          <Text style={styles.composerText}>Quoi de neuf ?</Text>
          <View style={styles.composerIcons}>
            <Ionicons name="image-outline" size={17} color={Colors.brandBlue} />
            <Ionicons name="bar-chart-outline" size={17} color={Colors.brandPurple} />
          </View>
        </TouchableOpacity>

        <ScrollView
          horizontal
          style={styles.tagsScroll}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tagsRow}
        >
          {TRENDING.map((tag) => {
            const active = tag === activeTag;
            return (
              <TouchableOpacity
                key={tag}
                style={[styles.tagChip, active && styles.tagChipActive]}
                activeOpacity={0.8}
                onPress={() => setActiveTag(active ? null : tag)}
              >
                <Text style={[styles.tagText, active && styles.tagTextActive]}>{tag}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View style={styles.feed}>
          {filtered.map((post) => (
            <BlogPostCard key={post.id} post={post} />
          ))}
        </View>
      </ScrollView>

      <SuggestedPanel visible={suggestedOpen} onClose={() => setSuggestedOpen(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Layout.screenPadding,
    paddingBottom: Spacing.md,
    gap: Spacing.sm,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: Radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.card,
  },
  iconBtnActive: { backgroundColor: Colors.brandBlue },
  headerCenter: { flex: 1 },
  title: { ...Typography.h3, color: Colors.textPrimary },
  subtitle: { ...Typography.caption, color: Colors.textMuted, marginTop: 1 },
  headerActions: { flexDirection: "row", gap: 8 },
  dot: {
    position: "absolute",
    top: 6,
    right: 7,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: Colors.danger,
    borderWidth: 1.5,
    borderColor: Colors.background,
  },

  content: { paddingBottom: Spacing.xl },

  storiesScroll: { flexGrow: 0, flexShrink: 0, height: 92, marginBottom: Spacing.md },
  storiesRow: { paddingHorizontal: Layout.screenPadding, gap: 14, alignItems: "flex-start" },

  composer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: Layout.screenPadding,
    marginBottom: Spacing.md,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.md,
    height: 52,
    gap: Spacing.sm,
  },
  composerAvatar: { width: 34, height: 34, borderRadius: 17 },
  composerText: { flex: 1, ...Typography.body, color: Colors.textMuted },
  composerIcons: { flexDirection: "row", gap: 10 },

  tagsScroll: { flexGrow: 0, flexShrink: 0, height: 44, marginBottom: Spacing.md },
  tagsRow: { paddingHorizontal: Layout.screenPadding, gap: 8, alignItems: "center" },
  tagChip: {
    height: 36,
    paddingHorizontal: 14,
    justifyContent: "center",
    borderRadius: Radius.pill,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  tagChipActive: { backgroundColor: Colors.brandBlue, borderColor: Colors.brandBlue },
  tagText: { ...Typography.caption, color: Colors.textSecondary, fontWeight: "600" },
  tagTextActive: { color: Colors.white },

  feed: { paddingHorizontal: Layout.screenPadding },
});