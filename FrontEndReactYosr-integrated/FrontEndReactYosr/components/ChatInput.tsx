import React, { useState } from "react";
import { StyleSheet, TextInput, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../constants/home/Colors";
import { Radius, Spacing } from "../constants/home/Layout";

interface ChatInputProps {
  onSend: (text: string) => void;
}

export default function ChatInput({ onSend }: ChatInputProps) {
  const [text, setText] = useState("");

  const handleSend = () => {
    if (!text.trim()) return;
    onSend(text.trim());
    setText("");
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7}>
        <Ionicons name="add-circle-outline" size={26} color={Colors.textMuted} />
      </TouchableOpacity>

      <TextInput
        style={styles.input}
        placeholder="Écrire un message..."
        placeholderTextColor={Colors.textMuted}
        value={text}
        onChangeText={setText}
        multiline
      />

      <TouchableOpacity style={styles.sendBtn} activeOpacity={0.8} onPress={handleSend}>
        <Ionicons name="send" size={17} color={Colors.white} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.cardBorder,
    backgroundColor: Colors.backgroundAlt,
  },
  iconBtn: { paddingBottom: 8 },
  input: {
    flex: 1,
    maxHeight: 100,
    minHeight: 42,
    borderRadius: Radius.lg,
    backgroundColor: Colors.card,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
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