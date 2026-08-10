import React, {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  Image,
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
} from "@/services/messageService";


interface ConversationData {
  id: number;
  user1Id?: number;
  user2Id?: number;
}


export default function ChatScreen() {

  /**
   * Récupérer les paramètres
   * de l'URL.
   *
   * Exemple :
   *
   * /messages/15
   *
   * userName = Ahmed Ben Ali
   *
   * userId = 8
   */
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
    useRef<ScrollView>(
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


  const [
    otherUserImage,
    setOtherUserImage,
  ] =
    useState<any>(null);


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


  /**
   * Charger la conversation.
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

        setLoading(
          true
        );


        /**
         * Utilisateur connecté.
         */
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


        /**
         * Récupérer la conversation
         * depuis le backend.
         */
        const data =
          await getConversationById(
            Number(id)
          );


        console.log(
          "CONVERSATION :",
          data
        );


        setConversation(
          data
        );


        /**
         * Récupérer les messages
         * de cette conversation.
         */
        const conversationMessages =
          await getConversationMessages(
            Number(id),
            currentId
          );


        console.log(
          "MESSAGES DE LA CONVERSATION :",
          conversationMessages
        );


        setMessages(
          conversationMessages
        );


        /**
         * Marquer les messages
         * comme lus.
         */
        await markConversationAsRead(
          Number(id),
          currentId
        );


        /**
         * --------------------------------
         * TROUVER L'AUTRE UTILISATEUR
         * --------------------------------
         *
         * On utilise d'abord userId
         * reçu depuis MessagesScreen.
         */
        let otherUserId:
          number | null =
          userId
            ? Number(userId)
            : null;


        /**
         * Si userId n'a pas été transmis,
         * on utilise la conversation.
         */
        if (
          !otherUserId
        ) {

          if (
            Number(data.user1Id) ===
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


        console.log(
          "AUTRE UTILISATEUR ID :",
          otherUserId
        );


        /**
         * Récupérer tous les utilisateurs
         * pour trouver celui avec qui
         * on discute.
         */
        const users =
          await getAllUsers();


        const foundUser =
          users.find(
            (user) =>
              Number(user.id) ===
              Number(otherUserId)
          );


        if (foundUser) {

          console.log(
            "AUTRE UTILISATEUR :",
            foundUser
          );


          setOtherUser(
            foundUser
          );


          /**
           * Récupérer son image.
           */
          if (
            foundUser.profileImage
          ) {

            try {

              const image =
                await getProfileImageUrl(
                  foundUser.profileImage
                );


              setOtherUserImage(
                image
              );


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
          "Erreur récupération conversation :",
          error?.response?.data ||
            error
        );


      } finally {

        setLoading(
          false
        );

      }

    };


  /**
   * Envoyer un message.
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

        setSending(
          true
        );


        /**
         * Envoyer au backend.
         */
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


        console.log(
          "MESSAGE ENVOYÉ :",
          newMessage
        );


        /**
         * Ajouter le message
         * dans la liste.
         */
        setMessages(
          (prev) => [
            ...prev,
            newMessage,
          ]
        );


        /**
         * Descendre automatiquement.
         */
        setTimeout(() => {

          scrollRef.current?.scrollToEnd(
            {
              animated:
                true,
            }
          );

        }, 50);


      } catch (
        error: any
      ) {

        console.error(
          "Erreur envoi message :",
          error?.response?.data ||
            error
        );


      } finally {

        setSending(
          false
        );

      }

    };


  /**
   * Écran de chargement.
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


  /**
   * Conversation inexistante.
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


  return (

    <SafeAreaView
      style={
        styles.safeArea
      }

      edges={[
        "top",
      ]}
    >

      {/* ========================= */}
      {/* HEADER                     */}
      {/* ========================= */}

      <View
        style={
          styles.header
        }
      >

        {/* RETOUR */}

        <TouchableOpacity
          onPress={() =>
            router.back()
          }

          style={
            styles.iconBtn
          }
        >

          <Ionicons
            name="chevron-back"
            size={22}
            color={
              Colors.textPrimary
            }
          />

        </TouchableOpacity>


        {/* PHOTO */}

        <Image
          source={
            otherUserImage || {
              uri:
                "https://i.pravatar.cc/150?img=68",
            }
          }

          style={
            styles.avatar
          }
        />


        {/* NOM */}

        <View
          style={{
            flex: 1,
          }}
        >

          <Text
            style={
              styles.name
            }
          >

            {userName ||
              (
                otherUser
                  ? `${otherUser.firstName} ${otherUser.lastName}`
                  : "Utilisateur"
              )}

          </Text>


          <Text
            style={
              styles.status
            }
          >

            {
              otherUser?.email ||
              ""
            }

          </Text>

        </View>

      </View>


      {/* ========================= */}
      {/* CHAT                       */}
      {/* ========================= */}

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

          onContentSizeChange={() =>
            scrollRef.current?.scrollToEnd(
              {
                animated:
                  false,
              }
            )
          }
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


        {/* CHAMP D'ENVOI */}

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

      marginTop:
        Spacing.sm,
    },


    notFound: {
      ...Typography.body,

      color:
        Colors.textSecondary,

      padding:
        Spacing.xl,
    },


    header: {
      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        Spacing.sm,

      paddingHorizontal:
        Layout.screenPadding,

      paddingBottom:
        Spacing.md,
    },


    iconBtn: {
      width: 30,
      height: 30,

      alignItems:
        "center",

      justifyContent:
        "center",
    },


    avatar: {
      width: 38,
      height: 38,

      borderRadius: 19,
    },


    name: {
      ...Typography.bodyMedium,

      color:
        Colors.textPrimary,

      fontWeight:
        "700",
    },


    status: {
      ...Typography.caption,

      color:
        Colors.textMuted,
    },


    messagesList: {
      paddingHorizontal:
        Layout.screenPadding,

      paddingVertical:
        Spacing.md,
    },

  });

