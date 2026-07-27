import Ionicons from "@expo/vector-icons/Ionicons";
import { useIsFocused } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
    Alert,
    Image,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { PrimaryButton, StarField } from "@/src/components/ui";
import { useDb } from "@/src/hooks/use-db";
import { useFormValidation } from "@/src/hooks/use-form-validation";
import { dbService, WalletDocument } from "@/src/services/db-service";
import { V } from "@/src/utils/form-validation";
import { DocumentCard } from "../components";

// Document categories with icons
const DOC_TYPES = [
  { label: "ID Card", icon: "card" },
  { label: "Passport", icon: "newspaper" },
  { label: "Driver License", icon: "car" },
  { label: "Insurance", icon: "medkit" },
  { label: "Other", icon: "document-text" },
];

const STATUS_OPTIONS: Array<{
  label: string;
  value: "Verified" | "Pending" | "Rejected";
}> = [
  { label: "Verified", value: "Verified" },
  { label: "Pending", value: "Pending" },
  { label: "Rejected", value: "Rejected" },
];

export function DocumentsScreen() {
  const router = useRouter();
  const isFocused = useIsFocused();
  const { errors, validate, clearError, clearAll } = useFormValidation();
  const { userId, isReady } = useDb();
  const [documents, setDocuments] = useState<WalletDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);

  // Form state
  const [docTitle, setDocTitle] = useState("");
  const [docSubtitle, setDocSubtitle] = useState("");
  const [selectedType, setSelectedType] = useState(DOC_TYPES[0]);
  const [selectedStatus, setSelectedStatus] = useState<
    "Verified" | "Pending" | "Rejected"
  >("Pending");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const fetchDocuments = async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const userDocs = await dbService.getDocuments(userId);
      setDocuments(userDocs);
    } catch (e) {
      console.error("Error loading documents:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isReady && userId && isFocused) {
      fetchDocuments();
    }
  }, [isReady, userId, isFocused]);

  const handlePickImage = async (useCamera: boolean) => {
    try {
      let result;
      if (useCamera) {
        const cameraPerm = await ImagePicker.requestCameraPermissionsAsync();
        if (!cameraPerm.granted) {
          Alert.alert("Permission", "Camera access required!");
          return;
        }
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          quality: 0.8,
        });
      } else {
        const galleryPerm =
          await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!galleryPerm.granted) {
          Alert.alert("Permission", "Gallery access required!");
          return;
        }
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          quality: 0.8,
        });
      }

      if (!result.canceled && result.assets && result.assets[0].uri) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (e) {
      console.error("Image pick error:", e);
      Alert.alert("Error", "Image selection failed!");
    }
  };

  const handleAddDocument = async () => {
    if (!userId) return;

    const isValid = validate({
      docTitle: { value: docTitle, rules: [V.documentTitle] },
      docSubtitle: { value: docSubtitle, rules: [V.documentSubtitle(selectedType.label)] },
    });
    if (!isValid) return;

    try {
      await dbService.createDocument({
        user_id: userId,
        title: docTitle.trim(),
        subtitle: docSubtitle.trim() || null,
        status: selectedStatus,
        icon: selectedType.icon,
        image_url: selectedImage || null,
      });

      setIsAddModalVisible(false);
      setDocTitle("");
      setDocSubtitle("");
      setSelectedType(DOC_TYPES[0]);
      setSelectedStatus("Pending");
      setSelectedImage(null);
      clearAll();

      await fetchDocuments();
      Alert.alert("Success", "Document added!");
    } catch (e) {
      console.error("Error adding doc:", e);
      Alert.alert("Error", "Could not add document!");
    }
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="document-text-outline" size={64} color="#7891B260" />
      <Text style={styles.emptyTitle}>No Documents Yet</Text>
      <Text style={styles.emptySubtitle}>
        Add your first document to get started
      </Text>
    </View>
  );

  const renderSkeleton = () => (
    <View style={styles.skeletonContainer}>
      {[1, 2, 3].map((i) => (
        <View key={i} style={styles.skeletonCard} />
      ))}
    </View>
  );

  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      <StatusBar style="light" />
      <StarField />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Pressable onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#F7FAFF" />
          </Pressable>
          <Text style={styles.title}>Documents</Text>
          <View style={{ width: 24 }} />
        </View>
        <Text style={styles.subtitle}>
          Private records, instantly available when you need them.
        </Text>

        {loading ? (
          renderSkeleton()
        ) : documents.length > 0 ? (
          <View style={styles.list}>
            {documents.map((doc, index) => (
              <DocumentCard
                key={doc.id || index}
                icon={doc.icon as any}
                status={doc.status}
                subtitle={doc.subtitle || ""}
                title={doc.title}
                imageUrl={doc.image_url || undefined}
              />
            ))}
          </View>
        ) : (
          renderEmptyState()
        )}

        <View style={styles.addButtonContainer}>
          <PrimaryButton
            label="Add a Document"
            onPress={() => setIsAddModalVisible(true)}
          />
        </View>
      </ScrollView>

      {/* Add Document Modal */}
      <Modal
        visible={isAddModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsAddModalVisible(false)}
      >
        <View style={styles.slideModalOverlay}>
          <View style={styles.slideModalContent}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>Add New Document</Text>
              <Pressable onPress={() => setIsAddModalVisible(false)}>
                <Ionicons name="close-outline" size={24} color="#F7FAFF" />
              </Pressable>
            </View>
            <ScrollView
              contentContainerStyle={styles.formContainer}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Document Title</Text>
                <TextInput
                  style={[styles.textInput, errors.docTitle && styles.textInputError]}
                  placeholder="e.g., National ID"
                  placeholderTextColor="#7891B280"
                  value={docTitle}
                  onChangeText={(text) => {
                    setDocTitle(text);
                    clearError('docTitle');
                  }}
                  maxLength={80}
                />
                {errors.docTitle ? <Text style={styles.fieldError}>{errors.docTitle}</Text> : null}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Document Type</Text>
                <View style={styles.badgeSelectorRow}>
                  {DOC_TYPES.map((type) => {
                    const isActive = selectedType.label === type.label;
                    return (
                      <Pressable
                        key={type.label}
                        style={[
                          styles.badgeSelectorItem,
                          isActive && styles.badgeSelectorItemActive,
                        ]}
                        onPress={() => {
                          setSelectedType(type);
                          clearError('docSubtitle');
                        }}
                      >
                        <Text
                          style={[
                            styles.badgeSelectorText,
                            isActive && styles.badgeSelectorTextActive,
                          ]}
                        >
                          {type.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Status</Text>
                <View style={styles.badgeSelectorRow}>
                  {STATUS_OPTIONS.map((status) => {
                    const isActive = selectedStatus === status.value;
                    return (
                      <Pressable
                        key={status.value}
                        style={[
                          styles.badgeSelectorItem,
                          isActive && styles.badgeSelectorItemActive,
                        ]}
                        onPress={() => setSelectedStatus(status.value)}
                      >
                        <Text
                          style={[
                            styles.badgeSelectorText,
                            isActive && styles.badgeSelectorTextActive,
                          ]}
                        >
                          {status.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  {['ID Card', 'Passport', 'Driver License'].includes(selectedType.label)
                    ? 'Reference / Number'
                    : 'Description (Optional)'}
                </Text>
                <TextInput
                  style={[styles.textInput, { minHeight: 60 }, errors.docSubtitle && styles.textInputError]}
                  placeholder="Add a description..."
                  placeholderTextColor="#7891B280"
                  value={docSubtitle}
                  onChangeText={(text) => {
                    setDocSubtitle(text);
                    clearError('docSubtitle');
                  }}
                  multiline
                  maxLength={120}
                />
                {errors.docSubtitle ? <Text style={styles.fieldError}>{errors.docSubtitle}</Text> : null}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Document Image (Optional)</Text>
                <View style={styles.imagesPickerRow}>
                  <Pressable
                    style={styles.imagePickOption}
                    onPress={() => handlePickImage(true)}
                  >
                    <Ionicons name="camera-outline" size={20} color="#2F80ED" />
                    <Text style={styles.imagePickOptionText}>Camera</Text>
                  </Pressable>
                  <Pressable
                    style={styles.imagePickOption}
                    onPress={() => handlePickImage(false)}
                  >
                    <Ionicons name="images-outline" size={20} color="#2F80ED" />
                    <Text style={styles.imagePickOptionText}>Gallery</Text>
                  </Pressable>
                </View>
                {selectedImage && (
                  <View style={styles.imagePreviewContainer}>
                    <Image
                      source={{ uri: selectedImage }}
                      style={styles.imagePreview}
                    />
                    <Pressable
                      style={styles.removeImageBtn}
                      onPress={() => setSelectedImage(null)}
                    >
                      <Ionicons name="close" size={16} color="#F7FAFF" />
                    </Pressable>
                  </View>
                )}
              </View>

              <View style={styles.rowButtons}>
                <Pressable
                  style={styles.buttonCancel}
                  onPress={() => setIsAddModalVisible(false)}
                >
                  <Text style={styles.buttonCancelText}>Cancel</Text>
                </Pressable>
                <Pressable
                  style={styles.buttonSubmit}
                  onPress={handleAddDocument}
                >
                  <Text style={styles.buttonSubmitText}>Add Document</Text>
                </Pressable>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#030C16",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
    gap: 24,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#F7FAFF",
  },
  subtitle: {
    fontSize: 14,
    color: "#7891B2",
  },
  skeletonContainer: {
    gap: 16,
  },
  skeletonCard: {
    height: 76,
    borderRadius: 16,
    backgroundColor: "#091E3660",
    borderWidth: 1,
    borderColor: "#1B5B9F20",
  },
  list: {
    gap: 12,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#F7FAFF",
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#7891B2",
    textAlign: "center",
  },
  addButtonContainer: {
    marginTop: 8,
  },

  // Modal styles
  slideModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(3, 12, 22, 0.85)",
    justifyContent: "flex-end",
  },
  slideModalContent: {
    backgroundColor: "#0B2342",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    borderWidth: 1.2,
    borderColor: "#2F80ED40",
    maxHeight: "92%",
    padding: 24,
    gap: 16,
  },
  modalHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#1B5B9F2A",
    paddingBottom: 14,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#F7FAFF",
  },
  formContainer: {
    gap: 14,
    paddingBottom: 24,
  },
  inputGroup: {
    gap: 6,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#7891B2",
  },
  textInput: {
    backgroundColor: "#091E36",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#1B5B9F50",
    color: "#F7FAFF",
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
  },
  textInputError: {
    borderColor: "#FF5353",
  },
  fieldError: {
    color: "#FF5353",
    fontSize: 11,
    marginTop: 2,
  },
  badgeSelectorRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  badgeSelectorItem: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: "#091E36",
    borderWidth: 1,
    borderColor: "#1B5B9F40",
  },
  badgeSelectorItemActive: {
    backgroundColor: "#2F80ED22",
    borderColor: "#2F80ED",
  },
  badgeSelectorText: {
    fontSize: 12,
    color: "#7891B2",
    fontWeight: "600",
  },
  badgeSelectorTextActive: {
    color: "#2F80ED",
    fontWeight: "700",
  },
  imagesPickerRow: {
    flexDirection: "row",
    gap: 12,
  },
  imagePickOption: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#2F80ED15",
    borderColor: "#2F80ED40",
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  imagePickOptionText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#2F80ED",
  },
  imagePreviewContainer: {
    position: "relative",
    marginTop: 12,
  },
  imagePreview: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    backgroundColor: "#071A31",
  },
  removeImageBtn: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#FF5353",
    justifyContent: "center",
    alignItems: "center",
  },
  rowButtons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 10,
    paddingBottom: 10,
  },
  buttonCancel: {
    flex: 1,
    borderColor: "#1B5B9F60",
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonCancelText: {
    color: "#7891B2",
    fontWeight: "600",
  },
  buttonSubmit: {
    flex: 1,
    backgroundColor: "#2F80ED",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonSubmitText: {
    color: "#F7FAFF",
    fontWeight: "700",
  },
});
