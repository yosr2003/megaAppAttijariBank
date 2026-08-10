import React, {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  Image,
  ImageSourcePropType,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import {
  SafeAreaView,
} from "react-native-safe-area-context";

import {
  router,
  useLocalSearchParams,
} from "expo-router";

import {
  Ionicons,
} from "@expo/vector-icons";

import MessageBubble
  from "../../../components/MessageBubble";

import ChatInput
  from "../../../components/ChatInput";

import {
  getConversationById,
} from "../../../services/conversationService";

import {
  getAllUsers,
  User,
} from "../../../services/userService";

import {
  getUser,
} from "../../../utils/storage";

import {
  getProfileImageUrl,
} from "../../../services/postService";

import {
  ChatMessage,
} from "../../../types/content";

import {
  Colors,
} from "../../../constants/home/Colors";

import {
  Layout,
  Spacing,
} from "../../../constants/home/Layout";

import {
  Typography,
} from "../../../constants/home/Typography";

import {
  getConversationMessages,
  markConversationAsRead,
  sendMessage,
} from "../../../services/messageService";

interface ConversationData {
  id: number;
  user1Id?: number;
  user2Id?: number;
}

export default function ChatScreen() {

  const {
    id,
    userName,
    userId,
  } =
    useLocalSearchParams<{
      id: string;
      userName?: string;
      userId?: string;
    }>();

  const scrollRef =
    useRef<ScrollView | null>(
      null
    );

  const [
    conversation,
    setConversation,
  ] =
    useState<ConversationData | null>(
      null
    );

  const [
    otherUser,
    setOtherUser,
  ] =
    useState<User | null>(
      null
    );

const [otherUserImage, setOtherUserImage] =
  useState<ImageSourcePropType | null>(null);

  const [
    messages,
    setMessages,
  ] =
    useState<ChatMessage[]>(
      []
    );

  const [
    currentUserId,
    setCurrentUserId,
  ] =
    useState<number | null>(
      null
    );

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    sending,
    setSending,
  ] =
    useState(false);

  /*
   * ================================
   * CHARGEMENT
   * ================================
   */

  useEffect(() => {

    loadConversation();

  }, [id]);

  const loadConversation =
    async () => {

      if (!id) {
        return;
      }

      try {

        setLoading(true);

        const loggedUser =
          await getUser();

        if (!loggedUser?.id) {
          throw new Error(
            "Utilisateur connecté introuvable"
          );
        }

        const currentId =
          Number(
            loggedUser.id
          );

        setCurrentUserId(
          currentId
        );

        /*
         * Conversation.
         */
        const data =
          await getConversationById(
            Number(id)
          );

        setConversation(
          data
        );

        /*
         * Messages.
         */
        const conversationMessages =
          await getConversationMessages(
            Number(id),
            currentId
          );

        setMessages(
          conversationMessages
        );

        /*
         * Marquer comme lu.
         */
        await markConversationAsRead(
          Number(id),
          currentId
        );

        /*
         * Déterminer l'autre utilisateur.
         */
        let otherUserId:
          number | null =
          userId
            ? Number(userId)
            : null;

        if (
          !otherUserId
        ) {

          if (
            Number(data.user1Id)
            ===
            currentId
          ) {

            otherUserId =
              Number(
                data.user2Id
              );

          } else {

            otherUserId =
              Number(
                data.user1Id
              );

          }

        }

        /*
         * Récupérer utilisateur.
         */
        const users =
          await getAllUsers();

        const foundUser =
          users.find(
            (user) =>
              Number(user.id)
              ===
              Number(otherUserId)
          );

        if (
          foundUser
        ) {

          setOtherUser(
            foundUser
          );

          if (
            foundUser.profileImage
          ) {

            try {

             const image = await getProfileImageUrl(
            foundUser.profileImage
          );

          setOtherUserImage(image);

            } catch (
              error
            ) {

              console.error(
                "Erreur avatar :",
                error
              );

            }

          }

        }

      } catch (
        error: any
      ) {

        console.error(
          "Erreur conversation :",
          error?.response?.data ||
          error
        );

      } finally {

        setLoading(false);

      }

    };

  /*
   * ================================
   * ENVOYER
   * ================================
   */

  const handleSend =
    async (
      text: string
    ) => {

      if (
        !conversation ||
        !currentUserId ||
        sending
      ) {

        return;

      }

      try {

        setSending(true);

        const newMessage =
          await sendMessage(
            Number(
              conversation.id
            ),

            Number(
              currentUserId
            ),

            text,

            null
          );

        /*
         * Ajouter immédiatement
         * le nouveau message.
         */
        setMessages(
          (prev) => [
            ...prev,
            newMessage,
          ]
        );

        /*
         * Scroll.
         */
        setTimeout(() => {

          scrollRef.current?.scrollToEnd({
            animated: true,
          });

        }, 100);

      } catch (
        error: any
      ) {

        console.error(
          "Erreur envoi message :",
          error?.response?.data ||
          error
        );

      } finally {

        setSending(false);

      }

    };

  /*
   * ================================
   * LOADING
   * ================================
   */

  if (loading) {

    return (

      <SafeAreaView
        style={
          styles.safeArea
        }
      >

        <View
          style={
            styles.loadingContainer
          }
        >

          <Text
            style={
              styles.loadingText
            }
          >
            Chargement...
          </Text>

        </View>

      </SafeAreaView>

    );

  }

  /*
   * ================================
   * PAS DE CONVERSATION
   * ================================
   */

  if (!conversation) {

    return (

      <SafeAreaView
        style={
          styles.safeArea
        }
      >

        <Text
          style={
            styles.notFound
          }
        >
          Conversation introuvable.
        </Text>

      </SafeAreaView>

    );

  }

  /*
   * Nom à afficher.
   */
  const displayName =
    userName ||
    (
      otherUser
        ? `${otherUser.firstName} ${otherUser.lastName}`
        : "Utilisateur"
    );

  return (

    <SafeAreaView
      style={
        styles.safeArea
      }
      edges={[
        "top",
      ]}
    >

      {/* HEADER */}

      <View
        style={
          styles.header
        }
      >

        <TouchableOpacity
          onPress={() =>
            router.back()
          }
          style={
            styles.backButton
          }
        >

          <Ionicons
            name="chevron-back"
            size={24}
            color={
              Colors.textPrimary
            }
          />

        </TouchableOpacity>


        <Image
  source={
    otherUserImage || {
      uri: "https://i.pravatar.cc/150?img=68",
    }
  }
  style={styles.avatar}
/>
       
        <View
          style={
            styles.headerInfo
          }
        >

          <Text
            style={
              styles.name
            }
            numberOfLines={
              1
            }
          >
            {displayName}
          </Text>

        </View>

      </View>


      {/* CHAT */}

      <KeyboardAvoidingView
        style={{
          flex: 1,
        }}
        behavior={
          Platform.OS === "ios"
            ? "padding"
            : undefined
        }
        keyboardVerticalOffset={
          90
        }
      >

        <ScrollView
          ref={
            scrollRef
          }
          contentContainerStyle={
            styles.messagesList
          }
          showsVerticalScrollIndicator={
            false
          }
          onContentSizeChange={() => {

            scrollRef.current?.scrollToEnd({
              animated: false,
            });

          }}
        >

          {messages.map(
            (
              message
            ) => (

              <MessageBubble
                key={
                  message.id
                }
                message={
                  message
                }
                currentUserId={
                  currentUserId!
                }
              />

            )
          )}

        </ScrollView>


        <ChatInput
          onSend={
            handleSend
          }
        />

      </KeyboardAvoidingView>

    </SafeAreaView>
  );
}

const styles =
  StyleSheet.create({

    safeArea: {
      flex: 1,

      backgroundColor:
        Colors.background,
    },

    header: {
      flexDirection:
        "row",

      alignItems:
        "center",

      paddingHorizontal:
        Layout.screenPadding,

      paddingBottom:
        Spacing.sm,

      gap:
        Spacing.sm,

      borderBottomWidth:
        1,

      borderBottomColor:
        Colors.cardBorder,
    },

    backButton: {
      width: 36,
      height: 36,

      alignItems:
        "center",

      justifyContent:
        "center",
    },

    avatar: {
      width: 42,
      height: 42,

      borderRadius: 21,

      backgroundColor:
        Colors.card,
    },

    headerInfo: {
      flex: 1,
    },

    name: {
      ...Typography.bodyMedium,

      color:
        Colors.textPrimary,

      fontWeight:
        "700",
    },

    messagesList: {
      paddingHorizontal:
        Layout.screenPadding,

      paddingVertical:
        Spacing.md,

      flexGrow: 1,
    },

    loadingContainer: {
      flex: 1,

      alignItems:
        "center",

      justifyContent:
        "center",
    },

    loadingText: {
      ...Typography.body,

      color:
        Colors.textMuted,
    },

    notFound: {
      ...Typography.body,

      color:
        Colors.textSecondary,

      padding:
        Spacing.xl,
    },

  });

