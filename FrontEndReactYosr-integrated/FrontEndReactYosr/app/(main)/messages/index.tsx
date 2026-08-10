import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import {
  SafeAreaView,
} from "react-native-safe-area-context";

import {
  router,
} from "expo-router";

import {
  Ionicons,
} from "@expo/vector-icons";

import {
  Colors,
} from "../../../constants/home/Colors";

import {
  Layout,
  Radius,
  Spacing,
} from "../../../constants/home/Layout";

import {
  Typography,
} from "../../../constants/home/Typography";

import {
  getUser,
} from "../../../utils/storage";

import {
  getAllUsers,
  User,
} from "../../../services/userService";

import {
  createPrivateConversation,
} from "../../../services/conversationService";

import {
  getProfileImageUrl,
} from "../../../services/postService";

import {
  getConversationMessages,
} from "../../../services/messageService";

import {
  ChatMessage,
} from "../../../types/content";

interface ConversationPreview {
  conversationId: number;

  // L'utilisateur avec qui on discute
  user: User;

  // Photo de CET utilisateur
  image: {
    uri: string;
    headers?: Record<string, string>;
  } | null;

  // Dernier message
  lastMessage: ChatMessage | null;
}

export default function MessagesScreen() {

  const [conversations, setConversations] =
    useState<ConversationPreview[]>([]);

  const [search, setSearch] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [openingUserId, setOpeningUserId] =
    useState<number | null>(null);

  const [currentUser, setCurrentUser] =
    useState<any>(null);

  useEffect(() => {
    loadConversations();
  }, []);

  /**
   * ========================================
   * CHARGER LES CONVERSATIONS PRIVÉES
   * ========================================
   */
  const loadConversations = async () => {

    try {

      setLoading(true);

      /**
       * Utilisateur connecté
       */
      const loggedUser = await getUser();

      if (!loggedUser?.id) {
        throw new Error(
          "Utilisateur connecté introuvable"
        );
      }

      setCurrentUser(loggedUser);

      /**
       * Tous les utilisateurs
       */
      const allUsers = await getAllUsers();

      /**
       * On enlève l'utilisateur connecté.
       */
      const otherUsers = allUsers.filter(
        (user) =>
          Number(user.id) !==
          Number(loggedUser.id)
      );

      const previews: ConversationPreview[] = [];

      /**
       * Pour chaque utilisateur :
       *
       * utilisateur A = moi
       * utilisateur B = autre utilisateur
       *
       * On récupère leur conversation privée.
       */
      for (const user of otherUsers) {

        try {

          const conversation =
            await createPrivateConversation(
              Number(loggedUser.id),
              Number(user.id)
            );

          if (!conversation?.id) {
            continue;
          }

          /**
           * Messages de cette conversation
           */
          const messages: ChatMessage[] =
            await getConversationMessages(
              Number(conversation.id),
              Number(loggedUser.id)
            );

          /**
           * Dernier message
           */
          const lastMessage =
            messages.length > 0
              ? messages[messages.length - 1]
              : null;

          /**
           * ====================================
           * PHOTO DE L'AUTRE UTILISATEUR
           * ====================================
           *
           * IMPORTANT :
           *
           * Cette image appartient à `user`,
           * c'est-à-dire à la personne avec
           * qui on discute.
           */
          let image:
            ConversationPreview["image"] = null;

          if (user.profileImage) {

            try {

              const profileImage =
                await getProfileImageUrl(
                  user.profileImage
                );

              if (profileImage) {
                image = profileImage;
              }

            } catch (imageError) {

              console.log(
                `Impossible de charger la photo de ${user.firstName}`,
                imageError
              );

            }
          }

          /**
           * Ajouter la conversation
           */
          previews.push({
            conversationId:
              Number(conversation.id),

            user,

            image,

            lastMessage,
          });

        } catch (conversationError) {

          console.log(
            `Impossible de charger la conversation avec ${user.firstName}`,
            conversationError
          );

        }
      }

      /**
       * ====================================
       * TRI
       * ====================================
       *
       * Les conversations ayant un message
       * apparaissent en premier.
       *
       * Puis :
       * plus récent → plus ancien
       */
      previews.sort((a, b) => {

        if (
          !a.lastMessage &&
          !b.lastMessage
        ) {
          return 0;
        }

        if (!a.lastMessage) {
          return 1;
        }

        if (!b.lastMessage) {
          return -1;
        }

        return (
          new Date(
            b.lastMessage.sentAt || 0
          ).getTime()
          -
          new Date(
            a.lastMessage.sentAt || 0
          ).getTime()
        );
      });

      setConversations(previews);

    } catch (error: any) {

      console.error(
        "Erreur chargement conversations :",
        error?.response?.data ||
        error
      );

    } finally {

      setLoading(false);

    }
  };

  /**
   * ========================================
   * TEMPS STYLE MESSENGER
   * ========================================
   */
  const formatConversationTime = (
    date?: string | null
  ) => {

    if (!date) {
      return "";
    }

    const messageDate = new Date(date);
    const now = new Date();

    const diff =
      now.getTime() -
      messageDate.getTime();

    const minute = 60 * 1000;
    const hour = 60 * minute;
    const day = 24 * hour;

    if (diff < minute) {
      return "à l'instant";
    }

    if (diff < hour) {

      const minutes =
        Math.floor(diff / minute);

      return `il y a ${minutes} min`;
    }

    if (diff < day) {

      const hours =
        Math.floor(diff / hour);

      return `il y a ${hours} h`;
    }

    const yesterday = new Date();

    yesterday.setDate(
      yesterday.getDate() - 1
    );

    if (
      messageDate.toDateString() ===
      yesterday.toDateString()
    ) {
      return "hier";
    }

    return messageDate.toLocaleDateString(
      "fr-FR",
      {
        day: "2-digit",
        month: "2-digit",
      }
    );
  };

  /**
   * ========================================
   * TEXTE DU DERNIER MESSAGE
   * ========================================
   */
  const getLastMessageText = (
    preview: ConversationPreview
  ) => {

    if (!preview.lastMessage) {
      return "Aucun message";
    }

    const message =
      preview.lastMessage;

    const isMe =
      Number(message.senderId) ===
      Number(currentUser?.id);

    /**
     * Message texte
     */
    if (message.contenu) {

      return isMe
        ? `Vous : ${message.contenu}`
        : `${preview.user.firstName} : ${message.contenu}`;
    }

    /**
     * Message image
     */
    if (message.image) {

      return isMe
        ? "Vous : 📷 Photo"
        : `${preview.user.firstName} : 📷 Photo`;
    }

    return "Message";
  };

  /**
   * ========================================
   * RECHERCHE
   * ========================================
   */
  const filteredConversations =
    useMemo(() => {

      const query =
        search.trim().toLowerCase();

      if (!query) {
        return conversations;
      }

      return conversations.filter(
        (conversation) => {

          const fullName =
            `${conversation.user.firstName} ${conversation.user.lastName}`
              .toLowerCase();

          const lastMessage =
            conversation.lastMessage?.contenu
              ?.toLowerCase() || "";

          return (
            fullName.includes(query) ||
            lastMessage.includes(query)
          );
        }
      );

    }, [
      conversations,
      search,
    ]);

  /**
   * ========================================
   * OUVRIR UNE CONVERSATION
   * ========================================
   */
  const openConversation = (
    conversation: ConversationPreview
  ) => {

    if (openingUserId !== null) {
      return;
    }

    setOpeningUserId(
      conversation.user.id
    );

    router.push({
      pathname: "/messages/[id]",

      params: {

        /**
         * ID de la conversation
         */
        id: String(
          conversation.conversationId
        ),

        /**
         * Nom de la personne
         */
        userName:
          `${conversation.user.firstName} ${conversation.user.lastName}`,

        /**
         * ID de la personne
         */
        userId:
          String(
            conversation.user.id
          ),
      },
    });

    setTimeout(() => {
      setOpeningUserId(null);
    }, 300);
  };

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={["top"]}
    >

      {/* HEADER */}

      <View style={styles.header}>

        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >

          <Ionicons
            name="chevron-back"
            size={24}
            color={Colors.textPrimary}
          />

        </TouchableOpacity>

        <Text style={styles.title}>
          Messages
        </Text>

        <View style={styles.headerSpacer} />

      </View>

      {/* RECHERCHE */}

      <View style={styles.searchContainer}>

        <Ionicons
          name="search"
          size={18}
          color={Colors.textMuted}
        />

        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher"
          placeholderTextColor={
            Colors.textMuted
          }
          value={search}
          onChangeText={setSearch}
        />

      </View>

      {/* LISTE */}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
      >

        {loading ? (

          <View style={styles.loading}>

            <ActivityIndicator
              size="large"
              color={Colors.brandBlue}
            />

            <Text style={styles.loadingText}>
              Chargement des conversations...
            </Text>

          </View>

        ) : filteredConversations.length === 0 ? (

          <View style={styles.empty}>

            <Ionicons
              name="chatbubbles-outline"
              size={50}
              color={Colors.textMuted}
            />

            <Text style={styles.emptyTitle}>
              Aucune conversation
            </Text>

            <Text style={styles.emptyText}>
              Commencez une nouvelle discussion.
            </Text>

          </View>

        ) : (

          filteredConversations.map(
            (conversation) => {

              const user =
                conversation.user;

              const lastMessage =
                conversation.lastMessage;

              const isOpening =
                openingUserId ===
                user.id;

              return (

                <TouchableOpacity
                  key={
                    conversation.conversationId
                  }
                  style={
                    styles.conversationRow
                  }
                  activeOpacity={0.7}
                  onPress={() =>
                    openConversation(
                      conversation
                    )
                  }
                  disabled={
                    openingUserId !== null
                  }
                >

                  {/* ===================== */}
                  {/* PHOTO DE L'UTILISATEUR */}
                  {/* ===================== */}

                  <Image
                    source={
                      conversation.image
                        ? conversation.image
                        : {
                            uri:
                              "https://i.pravatar.cc/150?img=68",
                          }
                    }
                    style={styles.avatar}
                  />

                  {/* CONTENU */}

                  <View
                    style={
                      styles.conversationContent
                    }
                  >

                    <View
                      style={styles.nameLine}
                    >

                      <Text
                        style={styles.userName}
                        numberOfLines={1}
                      >
                        {user.firstName}{" "}
                        {user.lastName}
                      </Text>

                      <Text
                        style={styles.date}
                      >
                        {
                          formatConversationTime(
                            lastMessage?.sentAt
                          )
                        }
                      </Text>

                    </View>

                    <Text
                      style={styles.lastMessage}
                      numberOfLines={1}
                    >
                      {
                        getLastMessageText(
                          conversation
                        )
                      }
                    </Text>

                  </View>

                  {isOpening && (
                    <ActivityIndicator
                      size="small"
                      color={
                        Colors.brandBlue
                      }
                    />
                  )}

                </TouchableOpacity>

              );
            }
          )

        )}

      </ScrollView>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({

  safeArea: {
    flex: 1,
    backgroundColor:
      Colors.background,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal:
      Layout.screenPadding,
    paddingBottom:
      Spacing.sm,
  },

  backButton: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
  },

  headerSpacer: {
    width: 38,
  },

  title: {
    flex: 1,
    textAlign: "center",
    ...Typography.h2,
    color: Colors.textPrimary,
  },

  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal:
      Layout.screenPadding,
    marginBottom:
      Spacing.sm,
    height: 42,
    paddingHorizontal:
      Spacing.md,
    backgroundColor:
      Colors.card,
    borderRadius:
      Radius.pill,
    borderWidth: 1,
    borderColor:
      Colors.cardBorder,
  },

  searchInput: {
    flex: 1,
    marginLeft:
      Spacing.sm,
    color:
      Colors.textPrimary,
    ...Typography.body,
  },

  list: {
    paddingHorizontal:
      Layout.screenPadding,
    paddingBottom:
      Spacing.xl,
  },

  conversationRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    gap: Spacing.sm,
  },

  /**
   * PHOTO DE L'AUTRE UTILISATEUR
   */
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor:
      Colors.card,
  },

  conversationContent: {
    flex: 1,
    minWidth: 0,
  },

  nameLine: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 3,
  },

  userName: {
    flex: 1,
    ...Typography.bodyMedium,
    color:
      Colors.textPrimary,
    fontWeight: "700",
    marginRight:
      Spacing.sm,
  },

  date: {
    ...Typography.caption,
    color:
      Colors.textMuted,
  },

  lastMessage: {
    ...Typography.body,
    color:
      Colors.textMuted,
  },

  loading: {
    alignItems: "center",
    paddingTop:
      Spacing.xl,
  },

  loadingText: {
    ...Typography.body,
    color:
      Colors.textMuted,
    marginTop:
      Spacing.sm,
  },

  empty: {
    alignItems: "center",
    paddingTop: 80,
  },

  emptyTitle: {
    ...Typography.h3,
    color:
      Colors.textPrimary,
    marginTop:
      Spacing.md,
  },

  emptyText: {
    ...Typography.body,
    color:
      Colors.textMuted,
    marginTop:
      Spacing.xs,
  },
});