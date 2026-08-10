import React from "react";

import {
  Image,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { ChatMessage } from "../types/content";

import { Colors } from "../constants/home/Colors";

import {
  Radius,
  Spacing,
} from "../constants/home/Layout";

import { Typography } from "../constants/home/Typography";

interface MessageBubbleProps {
  message: ChatMessage;
  currentUserId: number;
}

export default function MessageBubble({
  message,
  currentUserId,
}: MessageBubbleProps) {

  /**
   * Si le senderId du message correspond
   * à l'utilisateur connecté,
   * alors le message est le mien.
   */
  const isMe =
    Number(message.senderId) ===
    Number(currentUserId);

  /**
   * Conversion de la date du backend
   * en heure lisible.
   */
  const time = message.sentAt
    ? new Date(
        message.sentAt
      ).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  return (
    <View
      style={[
        styles.row,
        isMe
          ? styles.rowMe
          : styles.rowThem,
      ]}
    >

      <View
        style={[
          styles.bubble,
          isMe
            ? styles.bubbleMe
            : styles.bubbleThem,
        ]}
      >

        {/* TEXTE */}
        {message.contenu ? (
          <Text
            style={[
              styles.text,
              isMe
                ? styles.textMe
                : styles.textThem,
            ]}
          >
            {message.contenu}
          </Text>
        ) : null}

        {/* IMAGE */}
        {message.image ? (
          <Image
            source={{
              uri: message.image,
            }}
            style={styles.messageImage}
          />
        ) : null}

      </View>

      {/* HEURE */}
      <Text style={styles.time}>
        {time}
      </Text>

    </View>
  );
}

const styles = StyleSheet.create({

  row: {
    marginBottom: Spacing.sm,
    maxWidth: "78%",
  },

  rowMe: {
    alignSelf: "flex-end",
    alignItems: "flex-end",
  },

  rowThem: {
    alignSelf: "flex-start",
    alignItems: "flex-start",
  },

  bubble: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: Radius.lg,
  },

  bubbleMe: {
    backgroundColor:
      Colors.brandBlue,

    borderBottomRightRadius: 4,
  },

  bubbleThem: {
    backgroundColor:
      Colors.card,

    borderBottomLeftRadius: 4,

    borderWidth: 1,

    borderColor:
      Colors.cardBorder,
  },

  text: {
    ...Typography.body,
    lineHeight: 20,
  },

  textMe: {
    color: Colors.white,
  },

  textThem: {
    color:
      Colors.textPrimary,
  },

  time: {
    ...Typography.caption,

    color:
      Colors.textMuted,

    marginTop: 3,

    fontSize: 10,
  },

  messageImage: {
    width: 200,
    height: 200,
    borderRadius: Radius.lg,
    marginTop: 5,
  },
});