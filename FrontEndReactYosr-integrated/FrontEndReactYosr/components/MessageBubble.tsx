import React, {
  useEffect,
  useState,
} from "react";

import {
  Image,
  ImageSourcePropType,
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

import { api } from "@/services/api";
import { getToken } from "@/utils/storage";

interface MessageBubbleProps {
  message: ChatMessage;
  currentUserId: number;
}

export default function MessageBubble({
  message,
  currentUserId,
}: MessageBubbleProps) {

  const [imageSource, setImageSource] =
    useState<ImageSourcePropType | null>(null);

  /*
   * Vérifier si le message appartient
   * à l'utilisateur connecté.
   */
  const isMe =
    Number(message.senderId) ===
    Number(currentUserId);

  /*
   * Formater l'heure du message.
   */
  const time = message.sentAt
    ? new Date(
        message.sentAt
      ).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  /*
   * Préparer l'image avec l'URL complète
   * et le token JWT.
   */
  useEffect(() => {

    const prepareImage = async () => {

      if (!message.image) {
        setImageSource(null);
        return;
      }

      try {

        const token = await getToken();

        /*
         * Le backend retourne par exemple :
         *
         * /api/messages/images/photo.jpg
         *
         * Comme api.ts contient déjà :
         *
         * http://192.168.1.198:8082/api
         *
         * on retire /api pour éviter :
         *
         * /api/api/messages/...
         */

        const imagePath =
          message.image.startsWith("/api/")
            ? message.image.substring(4)
            : message.image;

        const imageUrl =
          api.getUri({
            url: imagePath,
          });

        console.log(
          "🖼️ IMAGE DB :",
          message.image
        );

        console.log(
          "🌐 IMAGE URL :",
          imageUrl
        );

        setImageSource({
          uri: imageUrl,

          headers: token
            ? {
                Authorization:
                  `Bearer ${token}`,
              }
            : undefined,
        });

      } catch (error) {

        console.error(
          "❌ Erreur préparation image :",
          error
        );

        setImageSource(null);
      }
    };

    prepareImage();

  }, [message.image]);

  /*
   * Photo seule :
   * pas de bulle colorée derrière.
   */
  const isImageOnly =
    !!message.image &&
    !message.contenu;

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

          isImageOnly
            ? styles.imageBubble
            : isMe
            ? styles.bubbleMe
            : styles.bubbleThem,
        ]}
      >

        {/* =========================
            TEXTE
        ========================== */}

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

        {/* =========================
            IMAGE
        ========================== */}

        {imageSource ? (
          <Image
            source={imageSource}

            style={[
              styles.messageImage,

              message.contenu
                ? styles.imageWithText
                : undefined,
            ]}

            resizeMode="cover"

            onLoad={() => {
              console.log(
                "✅ IMAGE MESSAGE CHARGÉE"
              );
            }}

            onError={(error) => {
              console.error(
                "❌ ERREUR IMAGE MESSAGE :",
                error.nativeEvent
              );
            }}
          />
        ) : null}

      </View>

      {/* =========================
          HEURE
      ========================== */}

      <Text style={styles.time}>
        {time}
      </Text>

    </View>
  );
}

const styles = StyleSheet.create({

  /* =========================
      CONTENEUR DU MESSAGE
  ========================== */

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

  /* =========================
      BULLE DE BASE
  ========================== */

  bubble: {
    borderRadius: Radius.lg,
    overflow: "hidden",
    maxWidth: "100%",
  },

  /* =========================
      MES MESSAGES TEXTE
  ========================== */

  bubbleMe: {
    backgroundColor: Colors.brandBlue,

    paddingHorizontal: 14,
    paddingVertical: 10,

    borderBottomRightRadius: 4,
  },

  /* =========================
      MESSAGES REÇUS
  ========================== */

  bubbleThem: {
    backgroundColor: Colors.card,

    paddingHorizontal: 14,
    paddingVertical: 10,

    borderBottomLeftRadius: 4,

    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },

  /* =========================
      PHOTO SEULE
      Style Messenger :
      pas de fond bleu autour.
  ========================== */

  imageBubble: {
    backgroundColor: "transparent",

    paddingHorizontal: 0,
    paddingVertical: 0,

    borderRadius: 18,

    overflow: "hidden",
  },

  /* =========================
      TEXTE
  ========================== */

  text: {
    ...Typography.body,
    lineHeight: 20,
  },

  textMe: {
    color: Colors.white,
  },

  textThem: {
    color: Colors.textPrimary,
  },

  /* =========================
      IMAGE
  ========================== */

  messageImage: {
    width: 240,
    height: 280,

    borderRadius: 18,
  },

  /*
   * Quand il y a un texte
   * ET une photo.
   */
  imageWithText: {
    marginTop: 8,
  },

  /* =========================
      HEURE
  ========================== */

  time: {
    ...Typography.caption,

    color: Colors.textMuted,

    marginTop: 3,

    fontSize: 10,
  },

});