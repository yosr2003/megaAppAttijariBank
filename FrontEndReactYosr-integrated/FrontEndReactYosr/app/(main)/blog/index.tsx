import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";

import BlogPostCard from "../../../components/BlogPostCard";
import StoryCircle from "../../../components/StoryCircle";
import SuggestedPanel from "../../../components/SuggestedPanel";
import { stories } from "../../../data/stories";

import { Colors } from "../../../constants/home/Colors";
import { Layout, Radius, Spacing } from "../../../constants/home/Layout";
import { Typography } from "../../../constants/home/Typography";

import { getUser } from "../../../utils/storage";
import { getProfileImageUrl } from "../../../services/postService";
import { getAllPosts, createPost ,getPostById} from "../../../services/postService";

const TRENDING = [
  "#SuperTounsi",
  "#Fintech",
  "#SavingMoney",
  "#Tunisia",
  "#Crypto",
  "#Business",
];

export default function BlogScreen() {
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [suggestedOpen, setSuggestedOpen] = useState(false);

  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [profileImage, setProfileImage] = useState<any>(null);

  // ===== ÉTATS DU COMPOSER =====
  const [content, setContent] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [posting, setPosting] = useState(false);

  /**
   * Chargement de l'utilisateur connecté
   */
  useEffect(() => {
    const loadUser = async () => {
      try {
        const user = await getUser();

        console.log("CURRENT USER :", user);

        setCurrentUser(user);

        if (user?.profileImage) {
          const image = await getProfileImageUrl(user.profileImage);

          console.log("PROFILE IMAGE :", image);

          setProfileImage(image);
        }
      } catch (error) {
        console.error(
          "Erreur récupération utilisateur :",
          error
        );
      }
    };

    loadUser();
  }, []);

  /**
   * Chargement des posts depuis Spring Boot
   */
 const loadPosts = async () => {
  try {
    setLoading(true);

    if (!currentUser?.id) {
      return;
    }

    const data = await getAllPosts();

    if (!Array.isArray(data)) {
      setPosts([]);
      return;
    }

    const postsWithDetails = await Promise.all(
      data
        .filter((post) => post != null)
        .map(async (post) => {
          try {
            const details = await getPostById(
              post.id,
              currentUser.id
            );

            console.log(
              `POST ${post.id}:`,
              "likes =",
              details.likeCount,
              "likedByCurrentUser =",
              details.likedByCurrentUser
            );

            return {
              ...post,
              ...details,
            };
          } catch (error) {
            console.error(
              `Erreur récupération détails du post ${post.id}:`,
              error
            );

            return {
              ...post,
              likeCount: 0,
              likedByCurrentUser: false,
            };
          }
        })
    );

    setPosts(postsWithDetails);

  } catch (error: any) {
    console.error(
      "Erreur récupération des posts:",
      error?.response?.data || error
    );

    setPosts([]);

  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  if (!currentUser?.id) {
    return;
  }

  loadPosts();
}, [currentUser]);

  /**
   * ===== LOGIQUE DU COMPOSER =====
   */
  const isValidContent = (text: string) => {
    const trimmed = text.trim();
    if (trimmed.length === 0) return false;

    // ne doit pas commencer par un caractère spécial
    if (/^[^a-zA-Z0-9À-ÿ]/.test(trimmed)) return false;

    // au moins 2 caractères alphanumériques
    const alnumCount = (trimmed.match(/[a-zA-Z0-9À-ÿ]/g) || []).length;
    return alnumCount >= 2;
  };

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        "Permission requise",
        "Autorisez l'accès à vos photos pour ajouter une image."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImage(result.assets[0].uri);
    }
  };


const handlePost = async () => {
  if (!isValidContent(content) || posting) return;

  if (!currentUser?.id) {
    Alert.alert("Erreur", "Utilisateur non connecté.");
    return;
  }

  try {
    setPosting(true);

    console.log("========== PUBLICATION ==========");
    console.log("CONTENU :", content.trim());
    console.log("AUTHOR ID :", currentUser.id);
    console.log("IMAGE SÉLECTIONNÉE :", image);

    await createPost(
      content.trim(),
      currentUser.id,
      image || undefined
    );

    setContent("");
    setImage(null);

    await loadPosts();

    Alert.alert("", "Publication publiée avec succès");
  } catch (error: any) {
    console.error(
      "Erreur publication :",
      error?.response?.data || error
    );

    Alert.alert(
      "Erreur",
      "La publication a échoué. Réessayez."
    );
  } finally {
    setPosting(false);
  }
};


  /**
   * Pour l'instant les hashtags sont visuels.
   * Le backend ne renvoie pas encore de hashtags.
   */
  const filtered = posts;

  const canPost = isValidContent(content) && !posting;

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={["top"]}
    >
      {/* HEADER */}
      <View style={styles.header}>

        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.iconBtn}
          activeOpacity={0.8}
        >
          <Ionicons
            name="arrow-back"
            size={18}
            color={Colors.textPrimary}
          />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.title}>
            Community
          </Text>

          <Text
            style={styles.subtitle}
            numberOfLines={1}
          >
            Partagez votre parcours financier
          </Text>
        </View>

        <View style={styles.headerActions}>

          {/* Messages */}
          <TouchableOpacity
            style={styles.iconBtn}
            activeOpacity={0.8}
            onPress={() => router.push("/messages")}
          >
            <Ionicons
              name="chatbubbles"
              size={17}
              color={Colors.textPrimary}
            />
          </TouchableOpacity>

          {/* Notifications */}
          <TouchableOpacity
            style={styles.iconBtn}
            activeOpacity={0.8}
          >
            <Ionicons
              name="notifications"
              size={17}
              color={Colors.textPrimary}
            />

            <View style={styles.dot} />
          </TouchableOpacity>

          {/* Mes posts */}
          <TouchableOpacity
            style={styles.iconBtn}
            activeOpacity={0.8}
            onPress={() => router.push("/blog/my-posts")}
          >
            <Ionicons
              name="albums"
              size={17}
              color={Colors.textPrimary}
            />
          </TouchableOpacity>

          {/* Suggestions */}
          <TouchableOpacity
            style={[
              styles.iconBtn,
              suggestedOpen && styles.iconBtnActive,
            ]}
            activeOpacity={0.8}
            onPress={() =>
              setSuggestedOpen((value) => !value)
            }
          >
            <Ionicons
              name="people"
              size={17}
              color={
                suggestedOpen
                  ? Colors.white
                  : Colors.textPrimary
              }
            />
          </TouchableOpacity>

        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >

        {/* STORIES */}
        <ScrollView
          horizontal
          style={styles.storiesScroll}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.storiesRow}
        >
          {stories.map((story) => (
            <StoryCircle
              key={story.id}
              story={story}
            />
          ))}
        </ScrollView>

        {/* COMPOSER — style chat moderne, icônes toujours à droite dans l'input */}
        <View style={styles.composerCard}>
          <Image
            source={
              profileImage || {
                uri: "https://i.pravatar.cc/150?img=68",
              }
            }
            style={styles.composerAvatar}
          />

          <TextInput
            placeholder="Quoi de neuf ?"
            placeholderTextColor={Colors.textMuted}
            value={content}
            onChangeText={setContent}
            multiline
            style={styles.composerInput}
          />

          <View style={styles.composerActionsInline}>
            <TouchableOpacity
              onPress={pickImage}
              style={styles.composerIconBtn}
              activeOpacity={0.75}
            >
              <Ionicons
                name="images"
                size={16}
                color={image ? Colors.brandPurple : Colors.textMuted}
              />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handlePost}
              disabled={!canPost}
              style={[
                styles.composerSendBtn,
                !canPost && styles.composerSendBtnDisabled,
              ]}
              activeOpacity={0.8}
            >
              {posting ? (
                <ActivityIndicator size="small" color={Colors.white} />
              ) : (
                <Ionicons
                  name="send"
                  size={14}
                  color={canPost ? Colors.white : Colors.textMuted}
                />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Badge discret quand une image est attachée — pas de preview encombrante */}
        {image && (
          <View style={styles.imageBadge}>
            <Ionicons name="image" size={13} color={Colors.brandBlue} />
            <Text style={styles.imageBadgeText}>Image ajoutée</Text>
            <TouchableOpacity
              onPress={() => setImage(null)}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            >
              <Ionicons name="close-circle" size={15} color={Colors.brandBlue} />
            </TouchableOpacity>
          </View>
        )}

        {/* TRENDING */}
        <ScrollView
          horizontal
          style={styles.tagsScroll}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tagsRow}
        >
          {TRENDING.map((tag) => {
            const active = tag === activeTag;

            return (
              <TouchableOpacity
                key={tag}
                style={[
                  styles.tagChip,
                  active && styles.tagChipActive,
                ]}
                activeOpacity={0.8}
                onPress={() =>
                  setActiveTag(
                    active ? null : tag
                  )
                }
              >
                <Text
                  style={[
                    styles.tagText,
                    active && styles.tagTextActive,
                  ]}
                >
                  {tag}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* LOADING */}
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator
              size="large"
              color={Colors.brandBlue}
            />

            <Text style={styles.loadingText}>
              Chargement des publications...
            </Text>
          </View>
        )}

        {/* EMPTY */}
        {!loading && filtered.length === 0 && (
          <View style={styles.emptyContainer}>
            <Ionicons
              name="newspaper-outline"
              size={42}
              color={Colors.textMuted}
            />

            <Text style={styles.emptyText}>
              Aucun post pour le moment.
            </Text>
          </View>
        )}

        {/* POSTS */}
        {!loading && filtered.length > 0 && (
          <View style={styles.feed}>
            {filtered.map((post) => (
             <BlogPostCard
            key={post.id}
            post={post}
            currentUser={currentUser}
          />
            ))}
          </View>
        )}

      </ScrollView>

      <SuggestedPanel
        visible={suggestedOpen}
        onClose={() =>
          setSuggestedOpen(false)
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Layout.screenPadding,
    paddingBottom: Spacing.md,
    gap: Spacing.xs,
  },

  iconBtn: {
    width: 34,
    height: 34,
    borderRadius: Radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.card,
  },

  iconBtnActive: {
    backgroundColor: Colors.brandBlue,
  },

  headerCenter: {
    flex: 1,
    marginHorizontal: 6,
  },

  title: {
    ...Typography.h3,
    color: Colors.textPrimary,
  },

  subtitle: {
    ...Typography.caption,
    color: Colors.textMuted,
    marginTop: 1,
  },

  headerActions: {
    flexDirection: "row",
    gap: 6,
  },

  dot: {
    position: "absolute",
    top: 5,
    right: 6,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: Colors.danger,
    borderWidth: 1.5,
    borderColor: Colors.background,
  },

  content: {
    paddingBottom: Spacing.xl,
  },

  storiesScroll: {
    flexGrow: 0,
    flexShrink: 0,
    height: 92,
    marginBottom: Spacing.md,
  },

  storiesRow: {
    paddingHorizontal: Layout.screenPadding,
    gap: 14,
    alignItems: "flex-start",
  },

  // ===== COMPOSER — nouveau design =====
  composerCard: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginHorizontal: Layout.screenPadding,
    marginBottom: Spacing.sm,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    gap: Spacing.sm,
  },

  composerAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginBottom: 4,
  },

  composerInput: {
    flex: 1,
    ...Typography.body,
    color: Colors.textPrimary,
    maxHeight: 90,
    paddingVertical: 6,
  },

  composerActionsInline: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 2,
  },

  composerIconBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.cardAlt,
  },

  composerSendBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.brandBlue,
  },

  composerSendBtnDisabled: {
    backgroundColor: Colors.cardAlt,
  },

  imageBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: `${Colors.brandBlue}22`,
    borderRadius: Radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginHorizontal: Layout.screenPadding,
    marginBottom: Spacing.md,
    gap: 6,
  },

  imageBadgeText: {
    ...Typography.caption,
    color: Colors.brandBlue,
    fontWeight: "600",
  },

  tagsScroll: {
    flexGrow: 0,
    flexShrink: 0,
    height: 44,
    marginBottom: Spacing.md,
  },

  tagsRow: {
    paddingHorizontal: Layout.screenPadding,
    gap: 8,
    alignItems: "center",
  },

  tagChip: {
    height: 36,
    paddingHorizontal: 14,
    justifyContent: "center",
    borderRadius: Radius.pill,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },

  tagChipActive: {
    backgroundColor: Colors.brandBlue,
    borderColor: Colors.brandBlue,
  },

  tagText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontWeight: "600",
  },

  tagTextActive: {
    color: Colors.white,
  },

  feed: {
    paddingHorizontal: Layout.screenPadding,
  },

  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },

  loadingText: {
    ...Typography.caption,
    color: Colors.textMuted,
    marginTop: Spacing.sm,
  },

  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 50,
  },

  emptyText: {
    ...Typography.body,
    color: Colors.textMuted,
    marginTop: Spacing.sm,
  },
});