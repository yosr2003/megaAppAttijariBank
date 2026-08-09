import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
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

import { getUser } from "../../../utils/storage";
import { getProfileImageUrl } from "../../../services/authService";

import {
  getPostById,
  getPostImageUrl,
    togglePostLike
} from "../../../services/postService";

import { BlogComment } from "../../../types/content";

import { Colors } from "../../../constants/home/Colors";
import {
  Layout,
  Radius,
  Spacing,
} from "../../../constants/home/Layout";
import { Typography } from "../../../constants/home/Typography";

/* ============================================================
   TYPES
============================================================ */

interface CurrentUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role?: string;
  userType?: string;
  profileImage?: string | null;
}

interface CommentResponse {
  id: number;
  contenu: string;
  dateCommentaire: string;
  authorId: number;
  authorFirstName: string;
  authorLastName: string;
  authorProfileImage?: string | null;
  authorRole?: string | null;
}

interface PostAuthor {
  id: number;
  firstName: string;
  lastName: string;
  profileImage?: string | null;
  role?: string | null;
  userType?: string | null;
}

interface PostDetailsResponse {
  id: number;
  titre: string;
  contenu: string;
  image?: string | null;
  datePublication: string;

  author: {
    id: number;
    firstName: string;
    lastName: string;
    profileImage?: string | null;
    role?: string;
    userType?: string;
  };

  likeCount: number;

  // IMPORTANT
  likedByCurrentUser: boolean;

  commentCount: number;
  comments: any[];
}

/* ============================================================
   COMPONENT
============================================================ */

export default function BlogPostScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const [post, setPost] =
    useState<PostDetailsResponse | null>(null);

  const [loading, setLoading] = useState(true);

  /* ============================================================
     IMAGE DU POST
  ============================================================ */

  const [postImage, setPostImage] = useState<any>(null);
const [authorAvatar, setAuthorAvatar] = useState<any>(null);
  /* ============================================================
     COMMENTS
     Maintenant récupérés depuis le backend
  ============================================================ */

  const [comments, setComments] =
    useState<BlogComment[]>([]);

  const [draft, setDraft] = useState("");

  /* ============================================================
     LIKES
     Le nombre initial vient du backend.
     Le toggle reste local pour le moment.
  ============================================================ */

  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  /* ============================================================
     UTILISATEUR CONNECTÉ
  ============================================================ */

  const [currentUser, setCurrentUser] =
    useState<CurrentUser | null>(null);

  const [currentUserAvatar, setCurrentUserAvatar] =
    useState<any>(null);

  /* ============================================================
     CHARGER LE POST + DETAILS
  ============================================================ */

 useEffect(() => {
  const loadPost = async () => {
    if (!id) {
      console.error("ID du post manquant");
      setLoading(false);
      return;
    }

    if (!currentUser?.id) {
      console.log(
        "En attente de l'utilisateur connecté..."
      );
      return;
    }

    try {
      setLoading(true);

      console.log(
        "Récupération des détails du post ID :",
        id
      );

      console.log(
        "CURRENT USER ID :",
        currentUser.id
      );

      const data: PostDetailsResponse =
        await getPostById(
          id,
          currentUser.id
        );

      console.log(
        "POST DETAILS API :",
        data
      );

      console.log(
        "MON LIKE :",
        data.likedByCurrentUser
      );

      setPost(data);
      if (data.image) {
        const image = await getPostImageUrl(data.image);

        console.log("DETAIL POST IMAGE :", image);

        setPostImage(image);
      } else {
        setPostImage(null);
      }
      /* ======================================================
         LIKES
      ====================================================== */

      setLikeCount(data.likeCount ?? 0);
      setLiked(
        data.likedByCurrentUser ?? false
      );

      /* ======================================================
         COMMENTS
      ====================================================== */

      const apiComments: BlogComment[] =
        (data.comments ?? []).map((comment) => ({
          id: comment.id.toString(),

          author: {
            name:
              `${comment.authorFirstName} ${comment.authorLastName}`,

            role:
              comment.authorRole ?? "Membre",

            avatar:
              comment.authorProfileImage
                ? comment.authorProfileImage
                : "https://i.pravatar.cc/150?img=68",
          },

          text: comment.contenu,

          time: formatCommentDate(
            comment.dateCommentaire
          ),
        }));

      setComments(apiComments);

    } catch (error) {
      console.error(
        "Erreur récupération détails du post :",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  loadPost();
}, [id, currentUser]);

  /* ============================================================
     CHARGER UTILISATEUR CONNECTÉ
  ============================================================ */

  useEffect(() => {
    const loadUser = async () => {
      try {
        const user = await getUser();

        console.log(
          "CURRENT USER IN POST :",
          user
        );

        setCurrentUser(user);

        if (user?.profileImage) {
          const image =
            await getProfileImageUrl(
              user.profileImage
            );

          console.log(
            "CURRENT USER AVATAR :",
            image
          );

          setCurrentUserAvatar(image);
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

  /* ============================================================
     ENVOYER UN COMMENTAIRE
     
     ATTENTION :
     Pour le moment ce commentaire est seulement ajouté
     localement. Il ne sera pas enregistré en BD tant qu'on
     n'aura pas créé POST /comments.
  ============================================================ */

  const handleSend = () => {
    if (!draft.trim()) {
      return;
    }

    setComments((prev) => [
      ...prev,
      {
        id: `local-${Date.now()}`,

        author: {
          name: currentUser
            ? `${currentUser.firstName} ${currentUser.lastName}`
            : "Vous",

          role:
            currentUser?.role ??
            currentUser?.userType ??
            "Membre",

          avatar:
            currentUserAvatar?.uri ??
            "https://i.pravatar.cc/150?img=68",
        },

        text: draft.trim(),

        time: "à l'instant",
      },
    ]);

    setDraft("");
  };

  /* ============================================================
     LIKE
     
     Pour le moment :
     - nombre initial = backend
     - clic = modification locale
     - aucune modification BD
  ============================================================ */

const toggleLike = async () => {
  if (!post || !currentUser?.id) {
    console.error(
      "Impossible de liker : utilisateur ou post manquant"
    );
    return;
  }

  try {
    console.log(
      "TOGGLE LIKE - POST :",
      post.id
    );

    console.log(
      "TOGGLE LIKE - USER :",
      currentUser.id
    );

    const response =
      await togglePostLike(
        post.id,
        currentUser.id
      );

    console.log(
      "LIKE RESPONSE :",
      response
    );

    /*
     * Le backend est la source de vérité.
     * On récupère directement son résultat.
     */
    setLikeCount(
      response.likeCount ?? 0
    );

    setLiked(
      response.likedByCurrentUser ?? false
    );

  } catch (error) {
    console.error(
      "Erreur toggle like :",
      error
    );
  }
};

  /* ============================================================
     LOADING
  ============================================================ */

  if (loading) {
    return (
      <SafeAreaView
        style={styles.safeArea}
        edges={["top"]}
      >
        <View style={styles.centerContainer}>
          <ActivityIndicator
            size="large"
            color={Colors.brandBlue}
          />

          <Text style={styles.loadingText}>
            Chargement du post...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  /* ============================================================
     POST INTROUVABLE
  ============================================================ */

  if (!post) {
    return (
      <SafeAreaView
        style={styles.safeArea}
        edges={["top"]}
      >
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.iconBtn}
          >
            <Ionicons
              name="arrow-back"
              size={22}
              color={Colors.textPrimary}
            />
          </TouchableOpacity>

          <Text style={styles.title}>
            Article
          </Text>

          <View style={{ width: 36 }} />
        </View>

        <View style={styles.centerContainer}>
          <Ionicons
            name="document-text-outline"
            size={45}
            color={Colors.textMuted}
          />

          <Text style={styles.notFound}>
            Article introuvable.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  /* ============================================================
     RENDER
  ============================================================ */

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
            size={22}
            color={Colors.textPrimary}
          />
        </TouchableOpacity>

        <Text style={styles.title}>
          Article
        </Text>

        <View style={{ width: 36 }} />

      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={
          Platform.OS === "ios"
            ? "padding"
            : undefined
        }
        keyboardVerticalOffset={90}
      >

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >

          {/* ==================================================
              AUTHOR
          ================================================== */}

          <View style={styles.authorRow}>

        <Image
          source={
            authorAvatar || {
              uri: "https://i.pravatar.cc/150?img=68",
            }
          }
          style={styles.avatar}
        />

            <View>

              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >

                <Text style={styles.name}>
                  {post.author?.firstName}{" "}
                  {post.author?.lastName}
                </Text>

                <Ionicons
                  name="checkmark-circle"
                  size={14}
                  color={Colors.brandBlue}
                  style={{ marginLeft: 4 }}
                />

              </View>

              <Text style={styles.role}>

                {post.author?.role ??
                  post.author?.userType ??
                  "Membre"}

                {" · "}

                {post.datePublication
                  ? new Date(
                      post.datePublication
                    ).toLocaleDateString(
                      "fr-FR"
                    )
                  : ""}

              </Text>

            </View>

          </View>

          {/* ==================================================
              TITRE
          ================================================== */}

          <Text style={styles.postTitle}>
            {post.titre}
          </Text>

          {/* ==================================================
              CONTENU
          ================================================== */}

          <Text style={styles.postContent}>
            {post.contenu}
          </Text>

          {/* ==================================================
              IMAGE DU POST
          ================================================== */}

          {postImage && (
            <Image
              source={postImage}
              style={styles.image}
              resizeMode="cover"
            />
          )}

          {/* ==================================================
              STATS
          ================================================== */}

          <View style={styles.statsRow}>

            {/* LIKE */}

            <TouchableOpacity
              style={styles.statBtn}
              onPress={toggleLike}
            >
              <Ionicons
                name={
                  liked
                    ? "heart"
                    : "heart-outline"
                }
                size={19}
                color={
                  liked
                    ? Colors.danger
                    : Colors.textMuted
                }
              />

              <Text style={styles.statText}>
                {likeCount} j'aime
              </Text>
            </TouchableOpacity>

            {/* COMMENTS */}

            <View style={styles.statBtn}>

              <Ionicons
                name="chatbubble-outline"
                size={17}
                color={Colors.textMuted}
              />

              <Text style={styles.statText}>
                {comments.length} commentaires
              </Text>

            </View>

            {/* SHARES */}

            <View style={styles.statBtn}>

              <Ionicons
                name="share-social-outline"
                size={18}
                color={Colors.textMuted}
              />

              <Text style={styles.statText}>
                12
              </Text>

            </View>

          </View>

          {/* ==================================================
              COMMENTS
          ================================================== */}

          <Text style={styles.commentsTitle}>
            Commentaires
          </Text>

          {comments.map((comment) => (

            <View
              key={comment.id}
              style={styles.commentRow}
            >

              <Image
                source={{
                  uri:
                    comment.author.avatar ||
                    "https://i.pravatar.cc/150?img=68",
                }}
                style={styles.commentAvatar}
              />

              <View style={styles.commentBubble}>

                <Text style={styles.commentName}>
                  {comment.author.name}
                </Text>

                <Text style={styles.commentText}>
                  {comment.text}
                </Text>

                <Text style={styles.commentTime}>
                  {comment.time}
                </Text>

              </View>

            </View>

          ))}

          {comments.length === 0 && (
            <Text style={styles.noComments}>
              Soyez le premier à commenter.
            </Text>
          )}

        </ScrollView>

        {/* ====================================================
            INPUT COMMENTAIRE
        ==================================================== */}

        <View style={styles.inputBar}>

          <TextInput
            style={styles.input}
            placeholder="Ajouter un commentaire..."
            placeholderTextColor={
              Colors.textMuted
            }
            value={draft}
            onChangeText={setDraft}
          />

          <TouchableOpacity
            style={styles.sendBtn}
            onPress={handleSend}
            activeOpacity={0.8}
          >
            <Ionicons
              name="send"
              size={17}
              color={Colors.white}
            />
          </TouchableOpacity>

        </View>

      </KeyboardAvoidingView>

    </SafeAreaView>
  );
}

/* ============================================================
   FORMAT DATE COMMENTAIRE
============================================================ */

function formatCommentDate(
  dateString: string
): string {

  if (!dateString) {
    return "";
  }

  const date = new Date(dateString);

  if (isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleDateString(
    "fr-FR",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }
  );
}

/* ============================================================
   STYLES
============================================================ */

const styles = StyleSheet.create({

  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  loadingText: {
    ...Typography.caption,
    color: Colors.textMuted,
    marginTop: Spacing.sm,
  },

  notFound: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginTop: Spacing.md,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Layout.screenPadding,
    paddingBottom: Spacing.md,
  },

  iconBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },

  title: {
    ...Typography.h3,
    color: Colors.textPrimary,
  },

  content: {
    paddingHorizontal: Layout.screenPadding,
    paddingBottom: Spacing.xxl,
  },

  authorRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.md,
  },

  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    marginRight: Spacing.sm,
  },

  name: {
    ...Typography.bodyMedium,
    color: Colors.textPrimary,
    fontWeight: "700",
  },

  role: {
    ...Typography.caption,
    color: Colors.textMuted,
    marginTop: 1,
  },

  postTitle: {
    ...Typography.h2,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },

  postContent: {
    ...Typography.body,
    color: Colors.textSecondary,
    lineHeight: 21,
    marginBottom: Spacing.md,
  },

  image: {
    width: "100%",
    height: 200,
    borderRadius: Radius.md,
    marginBottom: Spacing.md,
  },

  statsRow: {
    flexDirection: "row",
    gap: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.cardBorder,
    marginBottom: Spacing.lg,
  },

  statBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  statText: {
    ...Typography.caption,
    color: Colors.textMuted,
  },

  commentsTitle: {
    ...Typography.h3,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },

  commentRow: {
    flexDirection: "row",
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },

  commentAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
  },

  commentBubble: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    padding: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },

  commentName: {
    ...Typography.captionMedium,
    color: Colors.textPrimary,
  },

  commentText: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginTop: 2,
  },

  commentTime: {
    ...Typography.caption,
    color: Colors.textMuted,
    marginTop: 4,
  },

  noComments: {
    ...Typography.caption,
    color: Colors.textMuted,
    textAlign: "center",
    marginTop: Spacing.md,
  },

  inputBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    paddingHorizontal: Layout.screenPadding,
    paddingVertical: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.cardBorder,
    backgroundColor: Colors.backgroundAlt,
  },

  input: {
    flex: 1,
    height: 42,
    borderRadius: Radius.pill,
    backgroundColor: Colors.card,
    paddingHorizontal: Spacing.md,
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