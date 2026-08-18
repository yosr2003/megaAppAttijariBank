import React, { useEffect, useState } from "react";

import {
  ActivityIndicator,
  Image,
  ImageURISource,
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
import { deleteComment, getProfileImageUrl, updateComment } from "../../../services/postService";

import {
  getPostById,
  getPostImageUrl,
    togglePostLike,
     addComment
} from "../../../services/postService";

import { BlogComment } from "../../../types/content";

import { Colors } from "../../../constants/home/Colors";
import {
  Layout,
  Radius,
  Spacing,
} from "../../../constants/home/Layout";
import { Typography } from "../../../constants/home/Typography";
import CommentOptionsMenu from "@/components/CommentOptionsMenu";
import EditCommentModal from "@/components/EditCommentModal";

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

const [postImage, setPostImage] =
  useState<ImageURISource | null>(null);

const [authorAvatar, setAuthorAvatar] =
  useState<ImageURISource | null>(null);

const [currentUserAvatar, setCurrentUserAvatar] =
  useState<ImageURISource | null>(null);
  /* ============================================================
     COMMENTS
     Maintenant récupérés depuis le backend
  ============================================================ */

  const [comments, setComments] =
    useState<BlogComment[]>([]);

  const [draft, setDraft] = useState("");

  const [editCommentVisible, setEditCommentVisible] = useState(false);

const [editingComment, setEditingComment] =
  useState<BlogComment | null>(null);

const [updatingComment, setUpdatingComment] =
  useState(false);

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


    // ============================================================
// TRADUCTION DU COMMENTAIRE
// ============================================================

const [translationCommentId, setTranslationCommentId] =
  useState<string | null>(null);

const [targetLanguage, setTargetLanguage] =
  useState("en");

const [translatedComment, setTranslatedComment] =
  useState("");

const [translationLoading, setTranslationLoading] =
  useState(false);

const [translationError, setTranslationError] =
  useState("");


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
    if (data.author?.profileImage) {
  try {
    const imageResult = await getProfileImageUrl(
      data.author.profileImage
    );

    console.log("POST AUTHOR AVATAR :", imageResult);

    // ✅ sécurité anti-null
    if (imageResult && imageResult.uri) {
      setAuthorAvatar(imageResult);
    } else {
      setAuthorAvatar(null);
    }

  } catch (error) {
    console.error(
      "Erreur chargement avatar auteur du post :",
      error
    );

    setAuthorAvatar(null);
  }
} else {
  setAuthorAvatar(null);
}
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



const apiComments: BlogComment[] = await Promise.all(
  (data.comments ?? []).map(async (comment) => {
let avatar: ImageURISource = {
  uri: "https://i.pravatar.cc/150?img=68",
};

if (comment.authorProfileImage) {
  try {
    const imageResult = await getProfileImageUrl(
      comment.authorProfileImage
    );

    // ✅ vérification anti-null
    if (imageResult && imageResult.uri) {
      avatar = imageResult as ImageURISource;
    }

  } catch (error) {
    console.error(
      "Erreur chargement avatar commentaire :",
      error
    );
  }
}

    return {
      id: comment.id.toString(),

      author: {
        name: `${comment.authorFirstName} ${comment.authorLastName}`,

        role: comment.authorRole ?? "Membre",

        // IMPORTANT :
        // on garde uri + headers
        avatar,
      },

      text: comment.contenu,

      time: formatCommentDate(
        comment.dateCommentaire
      ),
    };
  })
);

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

const [sendingComment, setSendingComment] =
  useState(false);

const handleSend = async () => {

  const contenu = draft.trim();

  if (!contenu) {
    return;
  }

  if (!post?.id) {
    console.error(
      "Impossible d'ajouter le commentaire : post manquant"
    );
    return;
  }

  if (!currentUser?.id) {
    console.error(
      "Impossible d'ajouter le commentaire : utilisateur non connecté"
    );
    return;
  }

  if (sendingComment) {
    return;
  }

  try {

    setSendingComment(true);

    const response = await addComment(
      post.id,
      contenu,
      currentUser.id
    );

    console.log(
      "COMMENT CREATED :",
      response
    );

    // =========================================
    // CHARGER L'IMAGE DE L'AUTEUR
    // =========================================

let commentAvatar: ImageURISource = {
  uri: "https://i.pravatar.cc/150?img=68",
};

if (response.authorProfileImage) {
  try {
    const image = await getProfileImageUrl(
      response.authorProfileImage
    );

    if (image) {
      commentAvatar = image;
    }
  } catch (error) {
    console.error(
      "Erreur chargement avatar nouveau commentaire :",
      error
    );
  }
}

const newComment: BlogComment = {
  id: response.id.toString(),

  author: {
    name: `${response.authorFirstName} ${response.authorLastName}`,

    role:
      response.authorRole ??
      currentUser.role ??
      currentUser.userType ??
      "Membre",

    avatar: commentAvatar,
  },

  text: response.contenu,

  time: formatCommentDate(
    response.dateCommentaire
  ),
};


    // =========================================
    // AJOUTER À LA LISTE
    // =========================================

    setComments((prev) => [
      ...prev,
      newComment,
    ]);

    setDraft("");

  } catch (error: any) {

    console.error(
      "Erreur ajout commentaire :",
      error
    );

    console.error(
      "DETAIL ERROR :",
      error?.response?.data
    );

  } finally {

    setSendingComment(false);
  }
};


const handleEditComment = (comment: BlogComment) => {
  setEditingComment(comment);
  setEditCommentVisible(true);
};
const handleUpdateComment = async (
  text: string
) => {

  if (!editingComment || !currentUser?.id) {
    return;
  }

  try {

    setUpdatingComment(true);

    const response = await updateComment(
      Number(editingComment.id),
      text,
      currentUser.id
    );

    console.log(
      "COMMENT UPDATED RESPONSE :",
      response
    );

    setComments((prev) =>
      prev.map((comment) =>
        comment.id === editingComment.id
          ? {
              ...comment,
              text: response.contenu,
              time: formatCommentDate(
                response.dateCommentaire
              ),
            }
          : comment
      )
    );

    setEditCommentVisible(false);
    setEditingComment(null);

  } catch (error: any) {

    console.error(
      "Erreur modification commentaire :",
      error
    );

    console.error(
      "DETAIL ERROR :",
      error?.response?.data
    );

  } finally {

    setUpdatingComment(false);
  }
};

const handleDeleteComment = async (
  commentId: string
) => {

  if (!currentUser?.id) {
    console.error(
      "Utilisateur non connecté"
    );
    return;
  }

  try {

    console.log(
      "SUPPRESSION COMMENTAIRE :",
      commentId
    );

    await deleteComment(
      Number(commentId),
      currentUser.id
    );

    // Supprimer immédiatement de l'interface
    setComments((prev) =>
      prev.filter(
        (comment) =>
          comment.id !== commentId
      )
    );

    console.log(
      "COMMENTAIRE SUPPRIMÉ"
    );

  } catch (error: any) {

    console.error(
      "Erreur suppression commentaire :",
      error
    );

    console.error(
      "DETAIL ERROR :",
      error?.response?.data
    );
  }
};


// ============================================================
// TRADUIRE UN COMMENTAIRE
// ============================================================

const translateComment = async (
  comment: BlogComment
) => {
  if (!comment.text?.trim()) {
    return;
  }

  try {
    setTranslationLoading(true);
    setTranslationError("");
    setTranslatedComment("");

    const encodedText = encodeURIComponent(
      comment.text.trim()
    );

    const url =
      `https://lingva.ml/api/v1/auto/${targetLanguage}/${encodedText}`;

    console.log("========== LINGVA COMMENT ==========");
    console.log("COMMENT ID :", comment.id);
    console.log("LANGUE :", targetLanguage);
    console.log("URL :", url);

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(
        `Erreur HTTP : ${response.status}`
      );
    }

    const data = await response.json();

    console.log(
      "LINGVA COMMENT RESPONSE :",
      data
    );

    if (data.error) {
      throw new Error(data.error);
    }

    setTranslatedComment(
      data.translation || ""
    );

  } catch (error: any) {

    console.error(
      "Erreur traduction commentaire :",
      error
    );

    setTranslationError(
      "Impossible de traduire ce commentaire."
    );

    setTranslatedComment("");

  } finally {
    setTranslationLoading(false);
  }
};

const handleTranslateComment = (
  commentId: string
) => {
  setTranslationCommentId(commentId);
  setTranslatedComment("");
  setTranslationError("");
  setTargetLanguage("en");
};
const closeCommentTranslation = () => {
  setTranslationCommentId(null);
  setTranslatedComment("");
  setTranslationError("");
  setTranslationLoading(false);
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
    source={
      comment.author.avatar || {
        uri: "https://i.pravatar.cc/150?img=68",
      }
    }
    style={styles.commentAvatar}
  />

  <View style={styles.commentBubble}>

    <View style={styles.commentHeader}>

      <View style={styles.commentAuthorInfo}>
        <Text style={styles.commentName}>
          {comment.author.name}
        </Text>

        <Text style={styles.commentTime}>
          · {comment.time}
        </Text>
      </View>

<CommentOptionsMenu
  commentId={comment.id}

  onEdit={(commentId) => {
    const comment = comments.find(
      (c) => c.id === String(commentId)
    );

    if (comment) {
      handleEditComment(comment);
    }
  }}

  onDelete={(commentId) => {
    handleDeleteComment(String(commentId));
  }}

onTranslate={(commentId) => {
  handleTranslateComment(
    String(commentId)
  );
}}
/>

    </View>

    <Text style={styles.commentText}>
      {comment.text}
    </Text>

    {/* ==================================================
    TRADUCTION DU COMMENTAIRE
================================================== */}

{translationCommentId === comment.id && (
  <View style={styles.translationBox}>

    {/* HEADER */}

    <View style={styles.translationHeader}>

      <View style={styles.translationTitleRow}>

        <Ionicons
          name="language-outline"
          size={16}
          color={Colors.brandBlue}
        />

        <Text style={styles.translationTitle}>
          Traduire
        </Text>

      </View>

      {/* FERMER */}

      <TouchableOpacity
        onPress={closeCommentTranslation}
      >
        <Ionicons
          name="close"
          size={17}
          color={Colors.textMuted}
        />
      </TouchableOpacity>

    </View>


    {/* LANGUES */}

    <View style={styles.languageRow}>

      {/* EN */}

      <TouchableOpacity
        style={[
          styles.languageButton,
          targetLanguage === "en" &&
            styles.languageButtonActive,
        ]}
        onPress={() => {
          setTargetLanguage("en");
          setTranslatedComment("");
          setTranslationError("");
        }}
      >

        <Text
          style={[
            styles.languageText,
            targetLanguage === "en" &&
              styles.languageTextActive,
          ]}
        >
          🇬🇧 EN
        </Text>

      </TouchableOpacity>


      {/* FR */}

      <TouchableOpacity
        style={[
          styles.languageButton,
          targetLanguage === "fr" &&
            styles.languageButtonActive,
        ]}
        onPress={() => {
          setTargetLanguage("fr");
          setTranslatedComment("");
          setTranslationError("");
        }}
      >

        <Text
          style={[
            styles.languageText,
            targetLanguage === "fr" &&
              styles.languageTextActive,
          ]}
        >
          🇫🇷 FR
        </Text>

      </TouchableOpacity>


      {/* AR */}

      <TouchableOpacity
        style={[
          styles.languageButton,
          targetLanguage === "ar" &&
            styles.languageButtonActive,
        ]}
        onPress={() => {
          setTargetLanguage("ar");
          setTranslatedComment("");
          setTranslationError("");
        }}
      >

        <Text
          style={[
            styles.languageText,
            targetLanguage === "ar" &&
              styles.languageTextActive,
          ]}
        >
          🇹🇳 AR
        </Text>

      </TouchableOpacity>


      {/* ES */}

      <TouchableOpacity
        style={[
          styles.languageButton,
          targetLanguage === "es" &&
            styles.languageButtonActive,
        ]}
        onPress={() => {
          setTargetLanguage("es");
          setTranslatedComment("");
          setTranslationError("");
        }}
      >

        <Text
          style={[
            styles.languageText,
            targetLanguage === "es" &&
              styles.languageTextActive,
          ]}
        >
          🇪🇸 ES
        </Text>

      </TouchableOpacity>

    </View>


    {/* BOUTON TRADUIRE */}

    <TouchableOpacity
      style={styles.translateButton}
      onPress={() =>
        translateComment(comment)
      }
      disabled={translationLoading}
      activeOpacity={0.8}
    >

      {translationLoading ? (

        <ActivityIndicator
          size="small"
          color={Colors.white}
        />

      ) : (

        <Ionicons
          name="language-outline"
          size={16}
          color={Colors.white}
        />

      )}

      <Text style={styles.translateButtonText}>
        {translationLoading
          ? "Traduction..."
          : "Traduire"}
      </Text>

    </TouchableOpacity>


    {/* ERREUR */}

    {translationError ? (
      <Text style={styles.translationError}>
        {translationError}
      </Text>
    ) : null}


    {/* RÉSULTAT */}

    {translatedComment ? (

      <View style={styles.translationResult}>

        <Text
          style={styles.translationResultLabel}
        >
          Traduction
        </Text>

        <Text
          style={styles.translationResultText}
        >
          {translatedComment}
        </Text>

      </View>

    ) : null}

  </View>
)}

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
  style={[
    styles.sendBtn,
    sendingComment && { opacity: 0.5 },
  ]}
  onPress={handleSend}
  activeOpacity={0.8}
  disabled={sendingComment}
>
  {sendingComment ? (
    <ActivityIndicator
      size="small"
      color={Colors.white}
    />
  ) : (
    <Ionicons
      name="send"
      size={17}
      color={Colors.white}
    />
  )}
</TouchableOpacity>

        </View>

      </KeyboardAvoidingView>

      {/* ============================================================
          MODAL MODIFICATION COMMENTAIRE
      ============================================================ */}

      <EditCommentModal
        visible={editCommentVisible}
        initialText={editingComment?.text ?? ""}
        loading={updatingComment}
        onCancel={() => {
          if (!updatingComment) {
            setEditCommentVisible(false);
            setEditingComment(null);
          }
        }}
        onSave={handleUpdateComment}
      />

    </SafeAreaView>
  );
}

/* ============================================================
   FORMAT DATE COMMENTAIRE
============================================================ */

function formatCommentDate(dateString: string): string {
  if (!dateString) {
    return "";
  }

  const date = new Date(dateString);

  if (isNaN(date.getTime())) {
    return "";
  }

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();

  // Protection si la date est dans le futur
  if (diffMs < 0) {
    return "À l'instant";
  }

  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  // Quelques secondes
  if (diffSeconds < 60) {
    return "À l'instant";
  }

  // Minutes
  if (diffMinutes < 60) {
    return `${diffMinutes} min`;
  }

  // Heures
  if (diffHours < 24) {
    return `${diffHours} h`;
  }

  // Jours
  if (diffDays < 7) {
    return `${diffDays} j`;
  }

  // Au-delà d'une semaine :
  // exemple : "12 août"
  return date.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
  });
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
  paddingVertical: 8,
  paddingHorizontal: 10,
  borderWidth: 1,
  borderColor: Colors.cardBorder,
},

commentName: {
  ...Typography.captionMedium,
  color: Colors.textPrimary,
  fontWeight: "700",
},

commentTime: {
  fontSize: 11,
  color: Colors.textMuted,
  marginLeft: 5,
},

commentText: {
  ...Typography.body,
  color: Colors.textSecondary,
  marginTop: 3,
  lineHeight: 19,
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
  commentHeader: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
},

commentAuthorInfo: {
  flexDirection: "row",
  alignItems: "center",
  flex: 1,
},
translationBox: {
  backgroundColor: Colors.cardAlt,
  borderWidth: 1,
  borderColor: Colors.cardBorder,
  borderRadius: Radius.md,
  padding: Spacing.sm,
  marginTop: Spacing.sm,
},

translationHeader: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: Spacing.sm,
},

translationTitleRow: {
  flexDirection: "row",
  alignItems: "center",
  gap: 6,
},

translationTitle: {
  ...Typography.caption,
  color: Colors.textPrimary,
  fontWeight: "700",
},

languageRow: {
  flexDirection: "row",
  gap: 6,
  marginBottom: Spacing.sm,
  flexWrap: "wrap",
},

languageButton: {
  paddingHorizontal: 9,
  paddingVertical: 6,
  borderRadius: Radius.pill,
  backgroundColor: Colors.card,
  borderWidth: 1,
  borderColor: Colors.cardBorder,
},

languageButtonActive: {
  backgroundColor: Colors.brandBlue,
  borderColor: Colors.brandBlue,
},

languageText: {
  ...Typography.caption,
  color: Colors.textMuted,
  fontWeight: "600",
},

languageTextActive: {
  color: Colors.white,
},

translateButton: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  gap: 6,
  backgroundColor: Colors.brandBlue,
  borderRadius: Radius.md,
  paddingVertical: 9,
},

translateButtonText: {
  ...Typography.caption,
  color: Colors.white,
  fontWeight: "700",
},

translationResult: {
  marginTop: Spacing.sm,
  paddingTop: Spacing.sm,
  borderTopWidth: 1,
  borderTopColor: Colors.cardBorder,
},

translationResultLabel: {
  ...Typography.caption,
  color: Colors.brandBlue,
  fontWeight: "700",
  marginBottom: 4,
},

translationResultText: {
  ...Typography.body,
  color: Colors.textSecondary,
  lineHeight: 20,
},

translationError: {
  ...Typography.caption,
  color: Colors.danger,
  marginTop: Spacing.sm,
},
});