import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

import BlogPostCard from "../../../components/BlogPostCard";

import { Colors, Gradients } from "../../../constants/home/Colors";
import {
  Layout,
  Radius,
  Spacing,
} from "../../../constants/home/Layout";
import { Typography } from "../../../constants/home/Typography";

import { getUser } from "../../../utils/storage";
import { getProfileImageUrl } from "../../../services/postService";
import { getPostsByAuthor } from "../../../services/postService";

const LOGO = require("../../../assets/images/logoSuperTounsi.jpg");

interface CurrentUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role?: string;
  userType?: string;
  profileImage?: string | null;
}

interface Post {
  id: number;
  titre: string;
  contenu: string;
  datePublication: string;
  image?: string | null;
  author: {
    id: number;
    firstName: string;
    lastName: string;
    profileImage?: string | null;
    userType?: string;
  };
}

export default function MyPostsScreen() {
  const [currentUser, setCurrentUser] =
    useState<CurrentUser | null>(null);

  const [profileImage, setProfileImage] =
    useState<any>(null);

  const [posts, setPosts] =
    useState<Post[]>([]);

  const [loading, setLoading] =
    useState(true);

  /**
   * Chargement de l'utilisateur connecté
   */
  useEffect(() => {
    const loadUser = async () => {
      try {
        const user = await getUser();

        console.log("CURRENT USER :", user);

        if (!user) {
          console.error(
            "Aucun utilisateur connecté"
          );
          return;
        }

        setCurrentUser(user);

        /**
         * Photo de profil
         */
        if (user.profileImage) {
          const image =
            await getProfileImageUrl(
              user.profileImage
            );

          console.log(
            "PROFILE IMAGE :",
            image
          );

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
   * Chargement des posts de l'utilisateur
   */
  useEffect(() => {
    const loadMyPosts = async () => {
      /**
       * On attend d'avoir currentUser
       */
      if (!currentUser?.id) {
        return;
      }

      try {
        setLoading(true);

        console.log(
          "Récupération des posts de l'auteur :",
          currentUser.id
        );

        const data =
          await getPostsByAuthor(
            currentUser.id
          );

        console.log(
          "MES POSTS API :",
          data
        );

        setPosts(
          Array.isArray(data)
            ? data
            : []
        );
      } catch (error: any) {
        console.error(
          "Erreur récupération mes posts :",
          error?.response?.data ||
            error
        );

        setPosts([]);
      } finally {
        setLoading(false);
      }
    };

    loadMyPosts();
  }, [currentUser]);

  /**
   * Statistiques
   *
   * Pour l'instant, les likes/commentaires
   * sont affichés à 0 car ton endpoint
   * ne montre pas ces informations dans
   * l'exemple retourné.
   */
  const totalLikes = 0;
  const totalComments = 0;

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
          Mes Posts
        </Text>

        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        contentContainerStyle={
          styles.content
        }
        showsVerticalScrollIndicator={false}
      >
        {/* PROFILE CARD */}
        <LinearGradient
          colors={Gradients.primary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.profileCard}
        >
          {/* LOGO */}
          <Image
            source={LOGO}
            style={styles.logo}
          />

          {/* PHOTO UTILISATEUR */}
          <Image
            source={
              profileImage || {
                uri: "https://i.pravatar.cc/150?img=68",
              }
            }
            style={styles.avatar}
          />

          {/* NOM */}
          <Text style={styles.name}>
            {currentUser
              ? `${currentUser.firstName} ${currentUser.lastName}`
              : "Vous"}
          </Text>

          {/* EMAIL */}
          <Text style={styles.email}>
            {currentUser?.email || ""}
          </Text>

          {/* ROLE */}
          <Text style={styles.handle}>
            {currentUser?.role ||
              currentUser?.userType ||
              "Membre"}
          </Text>

          {/* STATISTIQUES */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {posts.length}
              </Text>

              <Text style={styles.statLabel}>
                Posts
              </Text>
            </View>

            <View
              style={styles.statDivider}
            />

            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {totalLikes}
              </Text>

              <Text style={styles.statLabel}>
                J'aime
              </Text>
            </View>

            <View
              style={styles.statDivider}
            />

            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {totalComments}
              </Text>

              <Text style={styles.statLabel}>
                Commentaires
              </Text>
            </View>
          </View>
        </LinearGradient>

        {/* INFORMATIONS PERSONNELLES */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>
            Informations personnelles
          </Text>

          {/* PRENOM */}
          <View style={styles.infoRow}>
            <Ionicons
              name="person-outline"
              size={20}
              color={Colors.brandBlue}
            />

            <View
              style={styles.infoContent}
            >
              <Text
                style={styles.infoLabel}
              >
                Prénom
              </Text>

              <Text
                style={styles.infoValue}
              >
                {currentUser?.firstName ||
                  "Non renseigné"}
              </Text>
            </View>
          </View>

          {/* NOM */}
          <View style={styles.infoRow}>
            <Ionicons
              name="person-outline"
              size={20}
              color={Colors.brandBlue}
            />

            <View
              style={styles.infoContent}
            >
              <Text
                style={styles.infoLabel}
              >
                Nom
              </Text>

              <Text
                style={styles.infoValue}
              >
                {currentUser?.lastName ||
                  "Non renseigné"}
              </Text>
            </View>
          </View>

          {/* EMAIL */}
          <View style={styles.infoRow}>
            <Ionicons
              name="mail-outline"
              size={20}
              color={Colors.brandBlue}
            />

            <View
              style={styles.infoContent}
            >
              <Text
                style={styles.infoLabel}
              >
                Email
              </Text>

              <Text
                style={styles.infoValue}
              >
                {currentUser?.email ||
                  "Non renseigné"}
              </Text>
            </View>
          </View>

          {/* ROLE */}
          <View style={styles.infoRow}>
            <Ionicons
              name="shield-checkmark-outline"
              size={20}
              color={Colors.brandBlue}
            />

            <View
              style={styles.infoContent}
            >
              <Text
                style={styles.infoLabel}
              >
                Rôle
              </Text>

              <Text
                style={styles.infoValue}
              >
                {currentUser?.role ||
                  currentUser?.userType ||
                  "Non renseigné"}
              </Text>
            </View>
          </View>
        </View>

        {/* TITRE MES PUBLICATIONS */}
        <View
          style={styles.sectionHeaderRow}
        >
          <Ionicons
            name="albums"
            size={16}
            color={Colors.brandBlue}
          />

          <Text
            style={styles.sectionTitle}
          >
            Mes publications
          </Text>
        </View>

        {/* LOADING */}
        {loading && (
          <View
            style={styles.loadingContainer}
          >
            <ActivityIndicator
              size="large"
              color={Colors.brandBlue}
            />

            <Text
              style={styles.loadingText}
            >
              Chargement de vos publications...
            </Text>
          </View>
        )}

        {/* EMPTY */}
        {!loading &&
          posts.length === 0 && (
            <View
              style={styles.emptyState}
            >
              <Ionicons
                name="document-text-outline"
                size={40}
                color={Colors.textMuted}
              />

              <Text
                style={styles.emptyText}
              >
                Vous n'avez encore publié
                aucun post.
              </Text>
            </View>
          )}

        {/* POSTS */}
        {!loading &&
          posts.length > 0 && (
            <View>
              {posts.map((post) => (
            <BlogPostCard
            key={post.id}
            post={post}
            currentUser={currentUser}
          />
              ))}
            </View>
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
    justifyContent:
      "space-between",
    paddingHorizontal:
      Layout.screenPadding,
    paddingBottom: Spacing.md,
  },

  iconBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent:
      "center",
  },

  title: {
    ...Typography.h2,
    color: Colors.textPrimary,
  },

  content: {
    paddingHorizontal:
      Layout.screenPadding,
    paddingBottom: Spacing.xl,
  },

  profileCard: {
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    alignItems: "center",
    marginBottom: Spacing.xl,
  },

  logo: {
    width: 36,
    height: 36,
    borderRadius: Radius.sm,
    position: "absolute",
    top: Spacing.md,
    left: Spacing.md,
    borderWidth: 1,
    borderColor:
      "rgba(255,255,255,0.4)",
  },

  avatar: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 2,
    borderColor: Colors.white,
    marginBottom: Spacing.sm,
  },

  name: {
    ...Typography.h2,
    color: Colors.white,
  },

  email: {
    ...Typography.caption,
    color: "rgba(255,255,255,0.9)",
    marginTop: 4,
  },

  handle: {
    ...Typography.caption,
    color:
      "rgba(255,255,255,0.8)",
    marginTop: 2,
    marginBottom:
      Spacing.lg,
  },

  statsRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  statItem: {
    alignItems: "center",
    paddingHorizontal:
      Spacing.lg,
  },

  statValue: {
    ...Typography.h3,
    color: Colors.white,
  },

  statLabel: {
    ...Typography.caption,
    color:
      "rgba(255,255,255,0.8)",
    marginTop: 2,
  },

  statDivider: {
    width: 1,
    height: 28,
    backgroundColor:
      "rgba(255,255,255,0.3)",
  },

  infoCard: {
    backgroundColor:
      Colors.card,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    marginBottom:
      Spacing.xl,
    borderWidth: 1,
    borderColor:
      Colors.cardBorder,
  },

  infoTitle: {
    ...Typography.h3,
    color: Colors.textPrimary,
    marginBottom:
      Spacing.md,
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical:
      Spacing.sm,
    gap: Spacing.md,
  },

  infoContent: {
    flex: 1,
  },

  infoLabel: {
    ...Typography.caption,
    color: Colors.textMuted,
  },

  infoValue: {
    ...Typography.body,
    color: Colors.textPrimary,
    marginTop: 2,
  },

  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom:
      Spacing.md,
  },

  sectionTitle: {
    ...Typography.h3,
    color: Colors.textPrimary,
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

  emptyState: {
    alignItems: "center",
    paddingVertical:
      Spacing.xxl,
    gap: Spacing.sm,
  },

  emptyText: {
    ...Typography.body,
    color: Colors.textMuted,
    textAlign: "center",
  },
});