import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Conversation } from "../types/content";
import { Colors } from "../constants/home/Colors";
import { Spacing } from "../constants/home/Layout";
import { Typography } from "../constants/home/Typography";

interface ConversationItemProps {
  conversation: Conversation;
  onPress?: () => void;
}

export default function ConversationItem({ conversation, onPress }: ConversationItemProps) {
  const last = conversation.messages[conversation.messages.length - 1];

  return (
    <TouchableOpacity style={styles.row} activeOpacity={0.8} onPress={onPress}>
      <View style={styles.avatarWrap}>
        <Image source={{ uri: conversation.user.avatar }} style={styles.avatar} />
        {conversation.user.online && <View style={styles.onlineDot} />}
      </View>

      <View style={styles.body}>
        <View style={styles.topRow}>
          <Text style={styles.name}>{conversation.user.name}</Text>
          <Text style={styles.time}>{last?.time}</Text>
        </View>
        <View style={styles.bottomRow}>
          <Text style={styles.lastMessage} numberOfLines={1}>
            {last?.text}
          </Text>
          {conversation.unread > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>{conversation.unread}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardBorder,
    gap: Spacing.sm,
  },
  avatarWrap: { position: "relative" },
  avatar: { width: 52, height: 52, borderRadius: 26 },
  onlineDot: {
    position: "absolute",
    bottom: 1,
    right: 1,
    width: 13,
    height: 13,
    borderRadius: 7,
    backgroundColor: Colors.success,
    borderWidth: 2,
    borderColor: Colors.background,
  },
  body: { flex: 1 },
  topRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 3 },
  name: { ...Typography.bodyMedium, color: Colors.textPrimary, fontWeight: "700" },
  time: { ...Typography.caption, color: Colors.textMuted },
  bottomRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  lastMessage: { ...Typography.body, color: Colors.textSecondary, flex: 1, marginRight: Spacing.sm },
  unreadBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.brandBlue,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 5,
  },
  unreadText: { color: Colors.white, fontSize: 11, fontWeight: "700" },
});