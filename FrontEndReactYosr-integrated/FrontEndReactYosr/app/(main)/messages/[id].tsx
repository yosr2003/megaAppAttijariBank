import React, { useRef, useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import MessageBubble from "../../../components/MessageBubble";
import ChatInput from "../../../components/ChatInput";
import { conversations } from "../../../data/conversations";
import { ChatMessage } from "../../../types/content";
import { Colors } from "../../../constants/home/Colors";
import { Layout, Spacing } from "../../../constants/home/Layout";
import { Typography } from "../../../constants/home/Typography";

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const conversation = conversations.find((c) => c.id === id);
  const scrollRef = useRef<ScrollView>(null);

  const [messages, setMessages] = useState<ChatMessage[]>(conversation?.messages ?? []);

  if (!conversation) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Text style={styles.notFound}>Conversation introuvable.</Text>
      </SafeAreaView>
    );
  }

  const handleSend = (text: string) => {
    setMessages((prev) => [
      ...prev,
      {
        id: `local-${Date.now()}`,
        text,
        sender: "me",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 50);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
          <Ionicons name="chevron-back" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Image source={{ uri: conversation.user.avatar }} style={styles.avatar} />
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{conversation.user.name}</Text>
          <Text style={styles.status}>{conversation.user.online ? "En ligne" : "Hors ligne"}</Text>
        </View>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={90}
      >
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}
        >
          {messages.map((m) => (
            <MessageBubble key={m.id} message={m} />
          ))}
        </ScrollView>

        <ChatInput onSend={handleSend} />
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
    gap: Spacing.sm,
    paddingHorizontal: Layout.screenPadding,
    paddingBottom: Spacing.md,
  },
  iconBtn: { width: 30, height: 30, alignItems: "center", justifyContent: "center" },
  avatar: { width: 38, height: 38, borderRadius: 19 },
  name: { ...Typography.bodyMedium, color: Colors.textPrimary, fontWeight: "700" },
  status: { ...Typography.caption, color: Colors.textMuted },
  messagesList: { paddingHorizontal: Layout.screenPadding, paddingVertical: Spacing.md },
});