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


export default function MessagesScreen() {

  const [
    users,
    setUsers,
  ] = useState<User[]>([]);

  const [
    currentUser,
    setCurrentUser,
  ] = useState<any>(null);

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    creatingConversation,
    setCreatingConversation,
  ] = useState<number | null>(null);

  const [
    userImages,
    setUserImages,
  ] = useState<Record<number, any>>({});


  /**
   * Charger l'utilisateur connecté
   * et tous les utilisateurs.
   */
  useEffect(() => {
    loadUsers();
  }, []);


  const loadUsers = async () => {

    try {

      setLoading(true);

      /**
       * Utilisateur connecté.
       */
      const loggedUser =
        await getUser();

      console.log(
        "UTILISATEUR CONNECTÉ :",
        loggedUser
      );

      setCurrentUser(
        loggedUser
      );


      /**
       * Tous les utilisateurs.
       */
      const allUsers =
        await getAllUsers();

      console.log(
        "TOUS LES UTILISATEURS :",
        allUsers
      );


      /**
       * Ne pas afficher
       * l'utilisateur connecté.
       */
      const otherUsers =
        allUsers.filter(
          (user) =>
            Number(user.id) !==
            Number(loggedUser?.id)
        );


      setUsers(
        otherUsers
      );


      /**
       * Charger les images.
       */
      const images:
        Record<number, any> = {};


      for (
        const user
        of otherUsers
      ) {

        if (
          user.profileImage
        ) {

          try {

            const image =
              await getProfileImageUrl(
                user.profileImage
              );

            if (image) {

              images[user.id] =
                image;

            }

          } catch (
            error
          ) {

            console.error(
              `Erreur image utilisateur ${user.id}:`,
              error
            );

          }
        }
      }


      setUserImages(
        images
      );


    } catch (
      error: any
    ) {

      console.error(
        "Erreur chargement utilisateurs :",
        error?.response?.data ||
          error
      );

    } finally {

      setLoading(false);

    }
  };


  /**
   * Recherche utilisateur.
   */
  const filteredUsers =
    useMemo(() => {

      const query =
        search
          .trim()
          .toLowerCase();


      if (!query) {
        return users;
      }


      return users.filter(
        (user) => {

          const fullName =
            `${user.firstName} ${user.lastName}`
              .toLowerCase();

          const email =
            user.email
              ?.toLowerCase() ||
            "";


          return (
            fullName.includes(
              query
            ) ||
            email.includes(
              query
            )
          );

        }
      );

    }, [
      users,
      search,
    ]);


  /**
   * Cliquer sur un utilisateur.
   *
   * Exemple :
   *
   * Ahmed Ben Ali
   *      ↓
   * conversation 15
   *      ↓
   * /messages/15
   *
   * On passe aussi :
   * userName
   * userId
   */
  const handleUserPress =
    async (
      user: User
    ) => {

      if (
        !currentUser?.id
      ) {

        console.error(
          "Utilisateur connecté introuvable."
        );

        return;
      }


      if (
        creatingConversation !==
        null
      ) {

        return;

      }


      try {

        setCreatingConversation(
          user.id
        );


        console.log(
          "Création/récupération conversation :",
          {
            user1Id:
              currentUser.id,

            user2Id:
              user.id,
          }
        );


        /**
         * Créer ou récupérer
         * la conversation privée.
         */
        const conversation =
          await createPrivateConversation(
            Number(
              currentUser.id
            ),

            Number(
              user.id
            )
          );


        console.log(
          "CONVERSATION RETOURNÉE :",
          conversation
        );


        if (
          !conversation?.id
        ) {

          throw new Error(
            "Le backend n'a pas retourné l'ID de la conversation."
          );

        }


        /**
         * IMPORTANT
         *
         * On passe :
         *
         * id        = ID conversation
         * userName  = nom de l'utilisateur
         * userId    = ID de l'utilisateur
         */
          router.push({
          pathname: "/messages/[id]",
          params: {
            id: String(conversation.id),
            userName: `${user.firstName} ${user.lastName}`,
            userId: String(user.id),
          },
        });

      } catch (
        error: any
      ) {

        console.error(
          "Erreur création conversation :",
          error?.response?.data ||
            error
        );

      } finally {

        setCreatingConversation(
          null
        );

      }
    };


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


        <Text
          style={
            styles.title
          }
        >
          Messages
        </Text>


        <View
          style={
            styles.iconBtn
          }
        />

      </View>


      {/* SEARCH */}

      <View
        style={
          styles.searchBar
        }
      >

        <Ionicons
          name="search"
          size={16}
          color={
            Colors.textMuted
          }
        />


        <TextInput
          style={
            styles.searchInput
          }

          placeholder="Rechercher un utilisateur..."

          placeholderTextColor={
            Colors.textMuted
          }

          value={
            search
          }

          onChangeText={
            setSearch
          }
        />

      </View>


      {/* LISTE */}

      <ScrollView
        contentContainerStyle={
          styles.list
        }

        showsVerticalScrollIndicator={
          false
        }
      >

        {loading ? (

          <View
            style={
              styles.loadingContainer
            }
          >

            <ActivityIndicator
              size="large"
              color={
                Colors.brandBlue
              }
            />

            <Text
              style={
                styles.loadingText
              }
            >
              Chargement des utilisateurs...
            </Text>

          </View>

        ) : (

          <>

            {filteredUsers.map(
              (user) => {

                const image =
                  userImages[
                    user.id
                  ];


                const isCreating =
                  creatingConversation ===
                  user.id;


                return (

                  <TouchableOpacity
                    key={
                      user.id
                    }

                    style={
                      styles.userRow
                    }

                    activeOpacity={
                      0.8
                    }

                    onPress={() =>
                      handleUserPress(
                        user
                      )
                    }

                    disabled={
                      creatingConversation !==
                      null
                    }
                  >

                    {/* AVATAR */}

                    <View
                      style={
                        styles.avatarContainer
                      }
                    >

                      <Image
                        source={
                          image || {
                            uri:
                              "https://i.pravatar.cc/150?img=68",
                          }
                        }

                        style={
                          styles.avatar
                        }
                      />

                    </View>


                    {/* INFORMATIONS */}

                    <View
                      style={
                        styles.userInfo
                      }
                    >

                      <Text
                        style={
                          styles.userName
                        }

                        numberOfLines={
                          1
                        }
                      >

                        {user.firstName}{" "}
                        {user.lastName}

                      </Text>


                      <Text
                        style={
                          styles.userEmail
                        }

                        numberOfLines={
                          1
                        }
                      >

                        {user.email}

                      </Text>

                    </View>


                    {/* LOADING / CHEVRON */}

                    {isCreating ? (

                      <ActivityIndicator
                        size="small"
                        color={
                          Colors.brandBlue
                        }
                      />

                    ) : (

                      <Ionicons
                        name="chevron-forward"
                        size={20}
                        color={
                          Colors.textMuted
                        }
                      />

                    )}

                  </TouchableOpacity>

                );

              }
            )}


            {filteredUsers.length ===
              0 && (

              <Text
                style={
                  styles.empty
                }
              >
                Aucun utilisateur trouvé.
              </Text>

            )}

          </>

        )}

      </ScrollView>

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

      justifyContent:
        "space-between",

      paddingHorizontal:
        Layout.screenPadding,

      paddingBottom:
        Spacing.md,
    },

    iconBtn: {
      width: 36,
      height: 36,

      alignItems:
        "center",

      justifyContent:
        "center",
    },

    title: {
      ...Typography.h2,

      color:
        Colors.textPrimary,
    },

    searchBar: {
      flexDirection:
        "row",

      alignItems:
        "center",

      gap: 8,

      marginHorizontal:
        Layout.screenPadding,

      marginBottom:
        Spacing.sm,

      backgroundColor:
        Colors.card,

      borderRadius:
        Radius.pill,

      borderWidth: 1,

      borderColor:
        Colors.cardBorder,

      paddingHorizontal:
        Spacing.md,

      height: 42,
    },

    searchInput: {
      flex: 1,

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

    userRow: {
      flexDirection:
        "row",

      alignItems:
        "center",

      paddingVertical:
        Spacing.md,

      borderBottomWidth:
        1,

      borderBottomColor:
        Colors.cardBorder,

      gap:
        Spacing.sm,
    },

    avatarContainer: {
      width: 52,
      height: 52,
    },

    avatar: {
      width: 52,
      height: 52,

      borderRadius: 26,

      backgroundColor:
        Colors.card,
    },

    userInfo: {
      flex: 1,
    },

    userName: {
      ...Typography.bodyMedium,

      color:
        Colors.textPrimary,

      fontWeight:
        "700",

      marginBottom: 3,
    },

    userEmail: {
      ...Typography.caption,

      color:
        Colors.textMuted,
    },

    loadingContainer: {
      alignItems:
        "center",

      justifyContent:
        "center",

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
      ...Typography.body,

      color:
        Colors.textMuted,

      textAlign:
        "center",

      marginTop:
        Spacing.xl,
    },

  });

