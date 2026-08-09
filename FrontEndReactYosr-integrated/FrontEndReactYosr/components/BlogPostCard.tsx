import React, { useEffect, useState } from "react";
import { getPostImageUrl,  togglePostLike } from "../services/postService";
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ImageSourcePropType, ImageURISource
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

import { Colors } from "../constants/home/Colors";
import { Radius, Spacing } from "../constants/home/Layout";
import { Typography } from "../constants/home/Typography";

import { getProfileImageUrl } from "../services/postService";

interface PostAuthor {
  id: number;
  firstName: string;
  lastName: string;
  profileImage?: string | null;
  userType?: string;
}

interface ApiPost {
  id: number;
  titre: string;
  contenu: string;
  datePublication: string;
  image?: string | null;
  author: PostAuthor;
  likeCount?: number;
  likedByCurrentUser?: boolean;
}

interface BlogPostCardProps {
  post: ApiPost;
  currentUser: any;
}

function formatDate(dateString: string) {
  if (!dateString) {
    return "";
  }

  try {
    const date = new Date(dateString);

    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

/**
 * Affichage du contenu avec hashtags.
 */
function renderContent(text: string) {
  if (!text) {
    return null;
  }

  return text
    .split(/(\s+)/)
    .map((part, index) => {
      if (part.startsWith("#")) {
        return (
          <Text
            key={index}
            style={styles.hashtag}
          >
            {part}
          </Text>
        );
      }

      return (
        <Text key={index}>
          {part}
        </Text>
      );
    });
}

export default function BlogPostCard({
  post,
  currentUser,
}: BlogPostCardProps) {

const [liked, setLiked] = useState(
  post.likedByCurrentUser ?? false
);

const [likeCount, setLikeCount] = useState(
  post.likeCount ?? 0
);

const [likeLoading, setLikeLoading] = useState(false);

  const [authorImage, setAuthorImage] =
    useState<any>(null);
const [postImage, setPostImage] =
  useState<ImageURISource | null>(null);

  /**
   * Chargement de la photo de profil
   * de l'auteur.
   */
  useEffect(() => {
    const loadAuthorImage = async () => {
      try {
        if (!post.author?.profileImage) {
          return;
        }

        const image = await getProfileImageUrl(
          post.author.profileImage
        );

        setAuthorImage(image);
      } catch (error) {
        console.error(
          "Erreur image auteur :",
          error
        );
      }
    };

    loadAuthorImage();
  }, [post.author?.profileImage]);

 useEffect(() => {
  const loadPostImage = async () => {
    try {
      if (!post.image) {
        setPostImage(null);
        return;
      }

      const imageSource = await getPostImageUrl(post.image);

      console.log("IMAGE POST :", imageSource);

      setPostImage(imageSource);
    } catch (error) {
      console.error("Erreur image post :", error);
      setPostImage(null);
    }
  };

  loadPostImage();
}, [post.image]);



const toggleLike = async () => {
  if (likeLoading) return;

  if (!currentUser?.id) {
    console.error("Utilisateur connecté introuvable");
    return;
  }

  try {
    setLikeLoading(true);

    const response = await togglePostLike(
      post.id,
      currentUser.id
    );

    console.log("LIKE RESPONSE :", response);

    // Le backend nous dit si CE currentUser
    // possède toujours le like
    setLiked(response.likedByCurrentUser);
    setLikeCount(response.likeCount);

  } catch (error: any) {
    console.error(
      "Erreur LIKE :",
      error?.response?.data || error
    );
  } finally {
    setLikeLoading(false);
  }
};

  const authorName =
    `${post.author?.firstName ?? ""} ${
      post.author?.lastName ?? ""
    }`.trim() || "Utilisateur";

  const authorRole =
    post.author?.userType === "ADMIN"
      ? "Administrateur"
      : "Membre";

  const formattedDate = formatDate(
    post.datePublication
  );

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.9}
      onPress={() =>
        router.push(`/blog/${post.id}`)
      }
    >

      {/* HEADER DU POST */}
      <View style={styles.header}>

        <Image
          source={
            authorImage || {
              uri: "https://i.pravatar.cc/150?img=68",
            }
          }
          style={styles.avatar}
        />

        <View style={styles.authorInfo}>

          {/* NOM */}
          <View style={styles.nameRow}>

            <Text style={styles.name}>
              {authorName}
            </Text>

            {post.author?.userType ===
              "ADMIN" && (
              <Ionicons
                name="checkmark-circle"
                size={14}
                color={Colors.brandBlue}
                style={{
                  marginLeft: 4,
                }}
              />
            )}

          </View>

          {/* ROLE + DATE */}
          <Text style={styles.role}>
            {authorRole}
            {formattedDate
              ? ` · ${formattedDate}`
              : ""}
          </Text>

        </View>

      </View>


      {/* CONTENU */}
      <Text style={styles.content}>
        {renderContent(post.contenu)}
      </Text>

  
 {postImage ? (
  <Image
    source={postImage}
    style={styles.image}
    resizeMode="cover"
    onError={(error) => {
      console.error(
        "ERREUR IMAGE POST :",
        error.nativeEvent
      );
    }}
  />
) : null}
      {/* FOOTER */}
      <View style={styles.footer}>

        {/* LIKE */}
       <TouchableOpacity
  style={styles.actionBtn}
  onPress={toggleLike}
  activeOpacity={0.7}
  disabled={likeLoading}
>
  <Ionicons
    name={liked ? "heart" : "heart-outline"}
    size={18}
    color={
      liked
        ? Colors.danger
        : Colors.textMuted
    }
  />

  <Text style={styles.actionText}>
    {likeCount}
  </Text>
</TouchableOpacity>

        {/* COMMENTAIRES */}
        <TouchableOpacity
          style={styles.actionBtn}
          activeOpacity={0.7}
          onPress={() =>
            router.push(`/blog/${post.id}`)
          }
        >
          <Ionicons
            name="chatbubble-outline"
            size={17}
            color={Colors.textMuted}
          />

          <Text style={styles.actionText}>
            Commenter
          </Text>
        </TouchableOpacity>

        {/* PARTAGE */}
        <TouchableOpacity
          style={styles.actionBtn}
          activeOpacity={0.7}
        >
          <Ionicons
            name="share-social-outline"
            size={18}
            color={Colors.textMuted}
          />

          <Text style={styles.actionText}>
            Partager
          </Text>
        </TouchableOpacity>

        {/* BOOKMARK */}
        <TouchableOpacity
          activeOpacity={0.7}
        >
          <Ionicons
            name="bookmark-outline"
            size={18}
            color={Colors.textMuted}
          />
        </TouchableOpacity>

      </View>

    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.md,
  },

  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    marginRight: Spacing.sm,
  },

  authorInfo: {
    flex: 1,
  },

  nameRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  name: {
    ...Typography.bodyMedium,
    color: Colors.textPrimary,
    fontWeight: "700",
  },

  role: {
    ...Typography.caption,
    color: Colors.textMuted,
    marginTop: 2,
  },

  title: {
    ...Typography.bodyMedium,
    color: Colors.textPrimary,
    fontWeight: "700",
    marginBottom: 5,
  },

  content: {
    ...Typography.body,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: Spacing.sm,
  },

  hashtag: {
    color: Colors.brandBlue,
    fontWeight: "600",
  },

  image: {
    width: "100%",
    height: 180,
    borderRadius: Radius.md,
    marginBottom: Spacing.sm,
  },

  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.cardBorder,
  },

  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  actionText: {
    ...Typography.caption,
    color: Colors.textMuted,
  },
});