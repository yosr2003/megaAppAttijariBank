import React, { useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { BlogPost } from "../types/content";
import { Colors } from "../constants/home/Colors";
import { Radius, Spacing } from "../constants/home/Layout";
import { Typography } from "../constants/home/Typography";

interface BlogPostCardProps {
  post: BlogPost;
}

function renderContent(text: string) {
  return text.split(/(\s+)/).map((part, i) =>
    part.startsWith("#") ? (
      <Text key={i} style={styles.hashtag}>
        {part}
      </Text>
    ) : (
      <Text key={i}>{part}</Text>
    )
  );
}

export default function BlogPostCard({ post }: BlogPostCardProps) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes);

  const toggleLike = () => {
    setLiked((prev) => {
      setLikeCount((c) => (prev ? c - 1 : c + 1));
      return !prev;
    });
  };

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.9}
      onPress={() => router.push(`/blog/${post.id}`)}
    >
      <View style={styles.header}>
        <Image source={{ uri: post.author.avatar }} style={styles.avatar} />
        <View style={{ flex: 1 }}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>{post.author.name}</Text>
            {post.author.verified && (
              <Ionicons name="checkmark-circle" size={14} color={Colors.brandBlue} style={{ marginLeft: 4 }} />
            )}
          </View>
          {post.author.handle && (
            <Text style={styles.handle}>
              {post.author.handle} · {post.time}
            </Text>
          )}
          <Text style={styles.role}>{post.author.role}</Text>
        </View>
        <Ionicons name="ellipsis-horizontal" size={18} color={Colors.textMuted} />
      </View>

      <Text style={styles.content}>{renderContent(post.content)}</Text>

      {post.image && (
        <Image source={{ uri: post.image }} style={styles.image} resizeMode="cover" />
      )}

      {post.poll && (
        <View style={styles.poll}>
          {post.poll.options.map((opt) => (
            <View key={opt.label} style={styles.pollRow}>
              <View style={styles.pollBarTrack}>
                <View style={[styles.pollBarFill, { width: `${opt.percent}%` }]} />
                <Text style={styles.pollLabel}>{opt.label}</Text>
              </View>
              <Text style={styles.pollPercent}>{opt.percent}%</Text>
            </View>
          ))}
          <Text style={styles.pollVotes}>{post.poll.totalVotes} votes</Text>
        </View>
      )}

      <View style={styles.footer}>
        <TouchableOpacity style={styles.actionBtn} onPress={toggleLike} activeOpacity={0.7}>
          <Ionicons
            name={liked ? "heart" : "heart-outline"}
            size={18}
            color={liked ? Colors.danger : Colors.textMuted}
          />
          <Text style={styles.actionText}>{likeCount}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionBtn}
          activeOpacity={0.7}
          onPress={() => router.push(`/blog/${post.id}`)}
        >
          <Ionicons name="chatbubble-outline" size={17} color={Colors.textMuted} />
          <Text style={styles.actionText}>{post.commentsCount}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionBtn} activeOpacity={0.7}>
          <Ionicons name="share-social-outline" size={18} color={Colors.textMuted} />
          <Text style={styles.actionText}>{post.shares}</Text>
        </TouchableOpacity>

        <TouchableOpacity activeOpacity={0.7}>
          <Ionicons name="bookmark-outline" size={18} color={Colors.textMuted} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  header: { flexDirection: "row", alignItems: "flex-start", marginBottom: Spacing.sm },
  avatar: { width: 40, height: 40, borderRadius: 20, marginRight: Spacing.sm },
  nameRow: { flexDirection: "row", alignItems: "center" },
  name: { ...Typography.bodyMedium, color: Colors.textPrimary, fontWeight: "700" },
  handle: { ...Typography.caption, color: Colors.textMuted, marginTop: 1 },
  role: { ...Typography.captionMedium, color: Colors.brandBlue, marginTop: 1 },
  content: { ...Typography.body, color: Colors.textSecondary, lineHeight: 20, marginBottom: Spacing.sm },
  hashtag: { color: Colors.brandBlue, fontWeight: "600" },
  image: { width: "100%", height: 160, borderRadius: Radius.md, marginBottom: Spacing.sm },
  poll: { marginBottom: Spacing.sm, gap: 8 },
  pollRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  pollBarTrack: {
    flex: 1,
    height: 30,
    borderRadius: Radius.sm,
    backgroundColor: Colors.cardAlt,
    justifyContent: "center",
    overflow: "hidden",
  },
  pollBarFill: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: `${Colors.brandBlue}55`,
  },
  pollLabel: { ...Typography.caption, color: Colors.textPrimary, paddingHorizontal: 10, fontWeight: "600" },
  pollPercent: { ...Typography.captionMedium, color: Colors.textSecondary, width: 36, textAlign: "right" },
  pollVotes: { ...Typography.caption, color: Colors.textMuted },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.cardBorder,
  },
  actionBtn: { flexDirection: "row", alignItems: "center", gap: 5 },
  actionText: { ...Typography.caption, color: Colors.textMuted },
});