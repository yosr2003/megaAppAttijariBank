import React, { useState } from "react";

import {
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
  Text,
  Image,
} from "react-native";

import {
  Ionicons,
} from "@expo/vector-icons";

import * as ImagePicker from "expo-image-picker";

import {
  Colors,
} from "../constants/home/Colors";

import {
  Radius,
  Spacing,
} from "../constants/home/Layout";

interface ChatInputProps {
  onSend: (
    text: string,
    image?: string | null
  ) => void;
}

export default function ChatInput({
  onSend,
}: ChatInputProps) {

  const [text, setText] =
    useState("");

  const [selectedImage, setSelectedImage] =
    useState<string | null>(null);


  /* =========================
     CHOISIR UNE IMAGE
  ========================= */

  const handlePickImage = async () => {

    const permission =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      return;
    }

    const result =
      await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        quality: 0.8,
      });

    if (
      !result.canceled &&
      result.assets.length > 0
    ) {

      setSelectedImage(
        result.assets[0].uri
      );
    }
  };


  /* =========================
     ENVOYER
  ========================= */

  const handleSend = () => {

    const value =
      text.trim();

    /*
     * Rien à envoyer
     */
    if (
      !value &&
      !selectedImage
    ) {
      return;
    }

    onSend(
      value,
      selectedImage
    );

    setText("");
    setSelectedImage(null);
  };


  /* =========================
     SUPPRIMER IMAGE
  ========================= */

  const removeImage = () => {
    setSelectedImage(null);
  };


  return (
    <View style={styles.container}>

      {/* =========================
          APERÇU IMAGE
      ========================= */}

      {selectedImage && (
        <View style={styles.previewContainer}>

          <Image
            source={{
              uri: selectedImage,
            }}
            style={styles.previewImage}
          />

          <TouchableOpacity
            style={styles.removeButton}
            onPress={removeImage}
          >
            <Ionicons
              name="close"
              size={16}
              color={Colors.white}
            />
          </TouchableOpacity>

        </View>
      )}


      {/* =========================
          BOUTON IMAGE
      ========================= */}

      <TouchableOpacity
        style={styles.imageButton}
        activeOpacity={0.8}
        onPress={handlePickImage}
      >
        <Ionicons
          name="image-outline"
          size={23}
          color={Colors.brandBlue}
        />
      </TouchableOpacity>


      {/* =========================
          INPUT
      ========================= */}

      <TextInput
        style={styles.input}
        placeholder="Écrire un message..."
        placeholderTextColor={
          Colors.textMuted
        }
        value={text}
        onChangeText={setText}
        multiline
      />


      {/* =========================
          ENVOYER
      ========================= */}

      <TouchableOpacity
        style={styles.sendBtn}
        activeOpacity={0.8}
        onPress={handleSend}
      >
        <Ionicons
          name="send"
          size={17}
          color={Colors.white}
        />
      </TouchableOpacity>

    </View>
  );
}


const styles = StyleSheet.create({

  container: {
    flexDirection: "row",
    alignItems: "flex-end",

    gap: Spacing.sm,

    paddingHorizontal:
      Spacing.lg,

    paddingVertical:
      Spacing.sm,

    borderTopWidth: 1,

    borderTopColor:
      Colors.cardBorder,

    backgroundColor:
      Colors.backgroundAlt,

    flexWrap: "wrap",
  },


  /* =========================
     APERÇU
  ========================= */

  previewContainer: {
    width: "100%",
    position: "relative",
    marginBottom: Spacing.sm,
  },

  previewImage: {
    width: 90,
    height: 90,
    borderRadius: Radius.lg,
  },

  removeButton: {
    position: "absolute",

    top: -6,
    left: 78,

    width: 24,
    height: 24,

    borderRadius: 12,

    backgroundColor:
      Colors.textPrimary,

    alignItems: "center",
    justifyContent: "center",
  },


  /* =========================
     IMAGE BUTTON
  ========================= */

  imageButton: {
    width: 42,
    height: 42,

    borderRadius: Radius.pill,

    backgroundColor:
      Colors.card,

    alignItems: "center",
    justifyContent: "center",

    borderWidth: 1,

    borderColor:
      Colors.cardBorder,
  },


  /* =========================
     INPUT
  ========================= */

  input: {
    flex: 1,

    maxHeight: 100,

    minHeight: 42,

    borderRadius:
      Radius.lg,

    backgroundColor:
      Colors.card,

    paddingHorizontal:
      Spacing.md,

    paddingVertical: 10,

    color:
      Colors.textPrimary,

    borderWidth: 1,

    borderColor:
      Colors.cardBorder,
  },


  /* =========================
     SEND
  ========================= */

  sendBtn: {
    width: 42,
    height: 42,

    borderRadius:
      Radius.pill,

    backgroundColor:
      Colors.brandBlue,

    alignItems: "center",

    justifyContent: "center",
  },

});

