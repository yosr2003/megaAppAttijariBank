import React, { useEffect, useState } from "react";
import * as ImagePicker from "expo-image-picker";

import {
  Alert,
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
import { LinearGradient } from "expo-linear-gradient";

import { Colors, Gradients } from "../../../../constants/home/Colors";
import { Layout, Radius, Spacing } from "../../../../constants/home/Layout";
import { Typography } from "../../../../constants/home/Typography";
import { getPostById, updatePost } from "@/services/postService";
import { getUser } from "@/utils/storage";

const LOGO = require("../../../../assets/images/logoSuperTounsi.jpg");

/**
 * Écran STATIQUE (aucune logique backend pour le moment).
 * Design "hero + carte flottante", même palette que le reste de l'app.
 */
export default function UpdatePostScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const [titre, setTitre] = useState("");
  const [contenu, setContenu] = useState("");
  const [image, setImage] = useState<string | null>(null);
const [loading, setLoading] = useState(false);
useEffect(() => {
  const loadPost = async () => {
    try {
      const user = await getUser();

      const data = await getPostById(id, user.id);

      setContenu(data.contenu || "");
      setTitre(data.titre || "");
    } catch (error) {
      console.error("Erreur chargement post :", error);
    }
  };

  loadPost();
}, []);
const handleSave = async () => {
  if (!contenu.trim()) {
    Alert.alert("Erreur", "Le contenu est requis");
    return;
  }

  try {
    setLoading(true);

    await updatePost(Number(id), contenu.trim(), image);

    Alert.alert("Succès", "Post mis à jour");

    router.back();
  } catch (error: any) {
    console.error("Erreur update :", error?.response?.data || error);

    Alert.alert("Erreur", "Échec de la mise à jour");
  } finally {
    setLoading(false);
  }
};


const pickImage = async () => {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

  if (!permission.granted) {
    Alert.alert("Permission requise");
    return;
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    quality: 0.7,
  });

  if (!result.canceled) {
    setImage(result.assets[0].uri);
  }
};

  return (
    <View style={styles.container}>
      {/* ===== HERO GRADIENT ===== */}
      <LinearGradient
        colors={Gradients.ai}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.hero}
      >
        {/* formes décoratives (contenues, ne débordent pas sur la carte) */}
        <View style={styles.heroBlobLarge} />
        <View style={styles.heroBlobSmall} />

        <SafeAreaView edges={["top"]}>
          <View style={styles.heroTopRow}>
            <TouchableOpacity
              onPress={() => router.back()}
              activeOpacity={0.75}
              style={styles.heroIconButton}
            >
              <Ionicons name="arrow-back" size={20} color={Colors.white} />
            </TouchableOpacity>

            <View style={styles.logoBadge}>
              <Image source={LOGO} style={styles.logoImage} />
            </View>
          </View>

          <View style={styles.heroTextBlock}>
            <View style={styles.heroIconCircle}>
              <Ionicons name="create" size={22} color={Colors.white} />
            </View>
            <Text style={styles.heroTitle}>Modifier le post</Text>
            <Text style={styles.heroSubtitle}>
              SuperTounsi Blog · Post #{id}
            </Text>
          </View>
        </SafeAreaView>
      </LinearGradient>

      {/* ===== CARTE FLOTTANTE ===== */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.sheetContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.sheet}>
            <View style={styles.sheetHandle} />

            {/* CHAMP TITRE */}
            <View style={styles.field}>
              <View style={styles.labelRow}>
                <Ionicons
                  name="text-outline"
                  size={14}
                  color={Colors.brandBlue}
                />
                <Text style={styles.label}>Titre</Text>
              </View>
              <View style={styles.inputWrapper}>
                <TextInput
                  value={titre}
                  onChangeText={setTitre}
                  placeholder="Donnez un titre accrocheur..."
                  placeholderTextColor={Colors.textMuted}
                  style={styles.input}
                />
              </View>
            </View>

            {/* CHAMP CONTENU */}
            <View style={styles.field}>
              <View style={styles.labelRow}>
                <Ionicons
                  name="chatbox-ellipses-outline"
                  size={14}
                  color={Colors.brandPurple}
                />
                <Text style={styles.label}>Contenu</Text>
              </View>
              <View style={[styles.inputWrapper, styles.textAreaWrapper]}>
                <TextInput
                  value={contenu}
                  onChangeText={setContenu}
                  placeholder="Exprimez-vous... #hashtag"
                  placeholderTextColor={Colors.textMuted}
                  style={[styles.input, styles.textArea]}
                  multiline
                  textAlignVertical="top"
                />
              </View>
            </View>

            {/* IMAGE DU POST (UI créative statique) */}
            <View style={styles.field}>
              <View style={styles.labelRow}>
                <Ionicons
                  name="image-outline"
                  size={14}
                  color={Colors.gradientAccentEnd}
                />
                <Text style={styles.label}>Photo</Text>
              </View>

              <TouchableOpacity
                 style={styles.imagePicker}
                onPress={pickImage}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={Gradients.primary}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.imagePickerIconCircle}
                >
                  <Ionicons name="camera" size={20} color={Colors.white} />
                </LinearGradient>

                <View style={{ flex: 1 }}>
                  <Text style={styles.imagePickerTitle}>
                    Changer l'image
                  </Text>
                  <Text style={styles.imagePickerSubtitle}>
                    JPG, PNG · 5 Mo max
                  </Text>
                </View>

                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color={Colors.textMuted}
                />
              </TouchableOpacity>
            </View>

            {/* ACTIONS */}
            <TouchableOpacity
              activeOpacity={0.88}
              onPress={handleSave}
              style={styles.saveButtonWrapper}
            >
              <LinearGradient
                colors={Gradients.primary}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.saveButton}
              >
                <Ionicons name="checkmark-circle" size={19} color={Colors.white} />
                <Text style={styles.saveButtonText}>Enregistrer les modifications</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => router.back()}
              style={styles.cancelButton}
            >
              <Text style={styles.cancelButtonText}>Annuler</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  /* ===== HERO ===== */
  hero: {
    paddingBottom: 26,
    borderBottomLeftRadius: Radius.xl,
    borderBottomRightRadius: Radius.xl,
    overflow: "hidden",
  },

  heroBlobLarge: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "rgba(255,255,255,0.07)",
    top: -60,
    right: -50,
  },

  heroBlobSmall: {
    position: "absolute",
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "rgba(255,255,255,0.05)",
    bottom: 10,
    left: -20,
  },

  heroTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Layout.screenPadding,
    paddingTop: Spacing.sm,
  },

  heroIconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.16)",
  },

  logoBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: "hidden",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.5)",
  },

  logoImage: {
    width: "100%",
    height: "100%",
  },

  heroTextBlock: {
    paddingHorizontal: Layout.screenPadding,
    marginTop: Spacing.xxl,
    marginBottom: Spacing.xs,
  },

  heroIconCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.18)",
    marginBottom: Spacing.md,
  },

  heroTitle: {
    ...Typography.h1,
    color: Colors.white,
  },

  heroSubtitle: {
    ...Typography.caption,
    color: "rgba(255,255,255,0.8)",
    marginTop: 4,
  },

  /* ===== SHEET / CARTE FLOTTANTE ===== */
  sheetContent: {
    paddingBottom: Spacing.xxl,
  },

  sheet: {
    marginTop: -16,
    marginHorizontal: Spacing.md,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    borderBottomLeftRadius: Radius.lg,
    borderBottomRightRadius: Radius.lg,
    padding: Layout.screenPadding,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 14,
    elevation: 8,
  },

  sheetHandle: {
    alignSelf: "center",
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.cardBorder,
    marginTop: Spacing.xs,
    marginBottom: Spacing.xl,
  },

  field: {
    marginBottom: Spacing.lg,
  },

  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: Spacing.sm,
  },

  label: {
    ...Typography.captionMedium,
    color: Colors.textSecondary,
  },

  inputWrapper: {
    backgroundColor: Colors.cardAlt,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
  },

  textAreaWrapper: {
    paddingVertical: Spacing.sm,
  },

  input: {
    ...Typography.body,
    color: Colors.textPrimary,
    paddingVertical: 14,
  },

  textArea: {
    minHeight: 120,
    paddingVertical: 0,
  },

  imagePicker: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.cardAlt,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    borderRadius: Radius.md,
    padding: Spacing.md,
    gap: Spacing.md,
  },

  imagePickerIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
  },

  imagePickerTitle: {
    ...Typography.bodyMedium,
    color: Colors.textPrimary,
  },

  imagePickerSubtitle: {
    ...Typography.caption,
    color: Colors.textMuted,
    marginTop: 2,
  },

  saveButtonWrapper: {
    marginTop: Spacing.sm,
    borderRadius: Radius.md,
    overflow: "hidden",
    shadowColor: Colors.brandBlue,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },

  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    paddingVertical: 16,
    borderRadius: Radius.md,
  },

  saveButtonText: {
    ...Typography.button,
    color: Colors.white,
  },

  cancelButton: {
    alignItems: "center",
    paddingVertical: 14,
    marginTop: Spacing.xs,
  },

  cancelButtonText: {
    ...Typography.bodyMedium,
    color: Colors.textMuted,
  },
});