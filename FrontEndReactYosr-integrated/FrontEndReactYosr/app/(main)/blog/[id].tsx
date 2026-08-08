import React, { useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { blogPosts } from "../../../data/blogPosts";
import { BlogComment } from "../../../types/content";
import { Colors } from "../../../constants/home/Colors";
import { Layout, Radius, Spacing } from "../../../constants/home/Layout";
import { Typography } from "../../../constants/home/Typography";

export default function BlogPostScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const post = blogPosts.find((p) => p.id === id);

  const [comments, setComments] = useState<BlogComment[]>(post?.comments ?? []);
  const [draft, setDraft] = useState("");
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post?.likes ?? 0);

  if (!post) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Text style={styles.notFound}>Article introuvable.</Text>
      </SafeAreaView>
    );
  }

  const handleSend = () => {
    if (!draft.trim()) return;
    setComments((prev) => [
      ...prev,
      {
        id: `local-${Date.now()}`,
        author: { name: "Vous", role: "Membre", avatar: "https://i.pravatar.cc/150?img=68" },
        text: draft.trim(),
        time: "à l'instant",
      },
    ]);
    setDraft("");
  };

  const toggleLike = () => {
    setLiked((prev) => {
      setLikeCount((c) => (prev ? c - 1 : c + 1));
      return !prev;
    });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
          <Ionicons name="chevron-back" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Article</Text>
        <View style={styles.iconBtn} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={90}
      >
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.authorRow}>
            <Image source={{ uri: post.author.avatar }} style={styles.avatar} />
            <View>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Text style={styles.name}>{post.author.name}</Text>
                {post.author.premium && (
                  <Ionicons name="star" size={12} color={Colors.warning} style={{ marginLeft: 4 }} />
                )}
              </View>
              <Text style={styles.role}>
                {post.author.role} · {post.time}
              </Text>
            </View>
          </View>

          <Text style={styles.postContent}>{post.content}</Text>

          {post.image && <Image source={{ uri: post.image }} style={styles.image} />}

          <View style={styles.statsRow}>
            <TouchableOpacity style={styles.statBtn} onPress={toggleLike}>
              <Ionicons
                name={liked ? "heart" : "heart-outline"}
                size={19}
                color={liked ? Colors.danger : Colors.textMuted}
              />
              <Text style={styles.statText}>{likeCount} j'aime</Text>
            </TouchableOpacity>
            <View style={styles.statBtn}>
              <Ionicons name="chatbubble-outline" size={17} color={Colors.textMuted} />
              <Text style={styles.statText}>{comments.length} commentaires</Text>
            </View>
            <View style={styles.statBtn}>
              <Ionicons name="share-social-outline" size={18} color={Colors.textMuted} />
              <Text style={styles.statText}>{post.shares}</Text>
            </View>
          </View>

          <Text style={styles.commentsTitle}>Commentaires</Text>
          {comments.map((c) => (
            <View key={c.id} style={styles.commentRow}>
              <Image source={{ uri: c.author.avatar }} style={styles.commentAvatar} />
              <View style={styles.commentBubble}>
                <Text style={styles.commentName}>{c.author.name}</Text>
                <Text style={styles.commentText}>{c.text}</Text>
                <Text style={styles.commentTime}>{c.time}</Text>
              </View>
            </View>
          ))}
          {comments.length === 0 && (
            <Text style={styles.noComments}>Soyez le premier à commenter.</Text>
          )}
        </ScrollView>

        <View style={styles.inputBar}>
          <TextInput
            style={styles.input}
            placeholder="Ajouter un commentaire..."
            placeholderTextColor={Colors.textMuted}
            value={draft}
            onChangeText={setDraft}
          />
          <TouchableOpacity style={styles.sendBtn} onPress={handleSend} activeOpacity={0.8}>
            <Ionicons name="send" size={17} color={Colors.white} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  notFound: { ...Typography.body, color: Colors.textSecondary, padding: Spacing.xl },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Layout.screenPadding,
    paddingBottom: Spacing.md,
  },
  iconBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  title: { ...Typography.h3, color: Colors.textPrimary },
  content: { paddingHorizontal: Layout.screenPadding, paddingBottom: Spacing.xxl },
  authorRow: { flexDirection: "row", alignItems: "center", marginBottom: Spacing.md },
  avatar: { width: 46, height: 46, borderRadius: 23, marginRight: Spacing.sm },
  name: { ...Typography.bodyMedium, color: Colors.textPrimary, fontWeight: "700" },
  role: { ...Typography.caption, color: Colors.textMuted, marginTop: 1 },
  postContent: { ...Typography.body, color: Colors.textSecondary, lineHeight: 21, marginBottom: Spacing.md },
  image: { width: "100%", height: 200, borderRadius: Radius.md, marginBottom: Spacing.md },
  statsRow: {
    flexDirection: "row",
    gap: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.cardBorder,
    marginBottom: Spacing.lg,
  },
  statBtn: { flexDirection: "row", alignItems: "center", gap: 5 },
  statText: { ...Typography.caption, color: Colors.textMuted },
  commentsTitle: { ...Typography.h3, color: Colors.textPrimary, marginBottom: Spacing.md },
  commentRow: { flexDirection: "row", marginBottom: Spacing.md, gap: Spacing.sm },
  commentAvatar: { width: 34, height: 34, borderRadius: 17 },
  commentBubble: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    padding: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  commentName: { ...Typography.captionMedium, color: Colors.textPrimary },
  commentText: { ...Typography.body, color: Colors.textSecondary, marginTop: 2 },
  commentTime: { ...Typography.caption, color: Colors.textMuted, marginTop: 4 },
  noComments: { ...Typography.caption, color: Colors.textMuted, textAlign: "center", marginTop: Spacing.md },
  inputBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    paddingHorizontal: Layout.screenPadding,
    paddingVertical: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.cardBorder,
    backgroundColor: Colors.backgroundAlt,
  },
  input: {
    flex: 1,
    height: 42,
    borderRadius: Radius.pill,
    backgroundColor: Colors.card,
    paddingHorizontal: Spacing.md,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: Radius.pill,
    backgroundColor: Colors.brandBlue,
    alignItems: "center",
    justifyContent: "center",
  },
});