import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

import { Colors } from "../constants/home/Colors";
import { Radius, Spacing } from "../constants/home/Layout";
import { Typography } from "../constants/home/Typography";

interface EditCommentModalProps {
  visible: boolean;
  initialText: string;
  loading?: boolean;
  onCancel: () => void;
  onSave: (text: string) => void;
}

export default function EditCommentModal({
  visible,
  initialText,
  loading = false,
  onCancel,
  onSave,
}: EditCommentModalProps) {

  const [text, setText] = useState(initialText);

  useEffect(() => {
    if (visible) {
      setText(initialText);
    }
  }, [visible, initialText]);

  const handleSave = () => {
    const value = text.trim();

    if (!value) {
      return;
    }

    onSave(value);
  };

  return (
 <Modal
  visible={visible}
  transparent
  animationType="fade"
  onRequestClose={onCancel}
>
  <KeyboardAvoidingView
    style={styles.keyboardContainer}
    behavior={
      Platform.OS === "ios"
        ? "padding"
        : "height"
    }
  >
    <View style={styles.overlay}>

      <View style={styles.modal}>

        {/* HEADER */}

        <View style={styles.header}>

          <View style={styles.titleContainer}>
            <Ionicons
              name="create-outline"
              size={20}
              color={Colors.brandBlue}
            />

            <Text style={styles.title}>
              Modifier le commentaire
            </Text>
          </View>

          <TouchableOpacity
            onPress={onCancel}
            disabled={loading}
            style={styles.closeButton}
          >
            <Ionicons
              name="close"
              size={21}
              color={Colors.textMuted}
            />
          </TouchableOpacity>

        </View>

        {/* INPUT */}

        <TextInput
          style={styles.input}
          value={text}
          onChangeText={setText}
          multiline
          autoFocus
          placeholder="Votre commentaire..."
          placeholderTextColor={Colors.textMuted}
          editable={!loading}
          textAlignVertical="top"
        />

        {/* CHARACTER COUNT */}

        <Text style={styles.counter}>
          {text.length} caractères
        </Text>

        {/* ACTIONS */}

        <View style={styles.actions}>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={onCancel}
            disabled={loading}
            activeOpacity={0.8}
          >
            <Text style={styles.cancelText}>
              Annuler
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.saveButton,
              (!text.trim() || loading) &&
                styles.saveButtonDisabled,
            ]}
            onPress={handleSave}
            disabled={!text.trim() || loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator
                size="small"
                color={Colors.white}
              />
            ) : (
              <>
                <Ionicons
                  name="checkmark"
                  size={17}
                  color={Colors.white}
                />

                <Text style={styles.saveText}>
                  Enregistrer
                </Text>
              </>
            )}
          </TouchableOpacity>

        </View>

      </View>

    </View>
  </KeyboardAvoidingView>
</Modal>
  );
}

const styles = StyleSheet.create({
keyboardContainer: {
  flex: 1,
},
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
  },

  modal: {
    width: "100%",
    maxWidth: 500,
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.cardBorder,

    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.md,
  },

  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    flex: 1,
  },

  title: {
    ...Typography.bodyMedium,
    color: Colors.textPrimary,
    fontWeight: "700",
  },

  closeButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.cardAlt,
  },

  input: {
    minHeight: 110,
    maxHeight: 180,

    backgroundColor: Colors.backgroundAlt,

    borderWidth: 1,
    borderColor: Colors.cardBorder,

    borderRadius: Radius.md,

    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,

    color: Colors.textPrimary,

    ...Typography.body,

    textAlignVertical: "top",
  },

  counter: {
    ...Typography.caption,
    color: Colors.textMuted,
    textAlign: "right",
    marginTop: 5,
  },

  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: Spacing.sm,
    marginTop: Spacing.lg,
  },

  cancelButton: {
    height: 42,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.cardAlt,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },

  cancelText: {
    ...Typography.captionMedium,
    color: Colors.textSecondary,
  },

  saveButton: {
    height: 42,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.pill,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: Colors.brandBlue,
  },

  saveButtonDisabled: {
    opacity: 0.45,
  },

  saveText: {
    ...Typography.captionMedium,
    color: Colors.white,
    fontWeight: "700",
  },

});