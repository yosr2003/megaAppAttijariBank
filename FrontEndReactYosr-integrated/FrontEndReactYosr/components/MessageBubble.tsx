import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { ChatMessage } from "../types/content";
import { Colors } from "../constants/home/Colors";
import { Radius, Spacing } from "../constants/home/Layout";
import { Typography } from "../constants/home/Typography";

interface MessageBubbleProps {
  message: ChatMessage;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isMe = message.sender === "me";
  return (
    <View style={[styles.row, isMe ? styles.rowMe : styles.rowThem]}>
      <View style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleThem]}>
        <Text style={[styles.text, isMe ? styles.textMe : styles.textThem]}>{message.text}</Text>
      </View>
      <Text style={styles.time}>{message.time}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { marginBottom: Spacing.sm, maxWidth: "78%" },
  rowMe: { alignSelf: "flex-end", alignItems: "flex-end" },
  rowThem: { alignSelf: "flex-start", alignItems: "flex-start" },
  bubble: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: Radius.lg },
  bubbleMe: { backgroundColor: Colors.brandBlue, borderBottomRightRadius: 4 },
  bubbleThem: {
    backgroundColor: Colors.card,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  text: { ...Typography.body, lineHeight: 20 },
  textMe: { color: Colors.white },
  textThem: { color: Colors.textPrimary },
  time: { ...Typography.caption, color: Colors.textMuted, marginTop: 3, fontSize: 10 },
});