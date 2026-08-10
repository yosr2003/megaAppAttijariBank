import React, { useCallback, useState } from "react";
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

import HomeModuleCard from "../../components/HomeModuleCard";
import BottomNavigation from "../../components/BottomNavigation";
import { homeModules } from "../../data/homeModules";
import { Colors, Gradients } from "../../constants/home/Colors";
import { Typography } from "../../constants/home/Typography";
import { Layout, Radius, Spacing } from "../../constants/home/Layout";
import { countUnreadConversations } from "@/services/messageService";
import { getUser } from "@/utils/storage";

const LOGO = require("../../assets/images/logoSuperTounsi.jpg");

export default function SuperTounsiHomeScreen() {

const [unreadMessages, setUnreadMessages] =
  useState(0);

useFocusEffect(
  useCallback(() => {

    const loadUnreadConversations = async () => {

      try {

        const user = await getUser();

        if (!user?.id) {
          return;
        }

        const count =
          await countUnreadConversations(
            Number(user.id)
          );

        setUnreadMessages(count);

      } catch (error) {

        console.error(
          "Erreur récupération conversations non lues :",
          error
        );

        setUnreadMessages(0);
      }

    };

    loadUnreadConversations();

  }, [])
);


  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Image source={LOGO} style={styles.logo} />
            <View>
              <Text style={styles.brand}>SuperTounsi</Text>
              <Text style={styles.tagline}>Votre super app au quotidien</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.messagesButton}
            activeOpacity={0.8}
            onPress={() => router.push("/messages")}
          >
            <Ionicons name="chatbubbles" size={20} color={Colors.textPrimary} />
            {unreadMessages > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{unreadMessages}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <LinearGradient
          colors={Gradients.primary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.welcomeCard}
        >
          <Text style={styles.welcomeTitle}>Bienvenue sur SuperTounsi 👋</Text>
          <Text style={styles.welcomeSubtitle}>
            Tout ce dont vous avez besoin, au même endroit.
          </Text>
        </LinearGradient>

        <View style={styles.sectionHeaderRow}>
          <Ionicons name="apps" size={16} color={Colors.brandBlue} />
          <Text style={styles.sectionTitle}>Nos services</Text>
        </View>

        <View style={styles.grid}>
          {homeModules.map((module) => (
            <HomeModuleCard
              key={module.id}
              module={module}
              onPress={() => router.push(module.route as any)}
            />
          ))}
        </View>
      </ScrollView>

      <BottomNavigation
        active="home"
        onChange={(tab) => {
          if (tab === "home") return;
          if (tab === "events") router.push("/events");
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  scroll: { flex: 1 },
  content: {
    paddingHorizontal: Layout.screenPadding,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xl,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.lg,
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  logo: {
    width: 42,
    height: 42,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Colors.brandPurple,
  },
  brand: { ...Typography.h3, color: Colors.textPrimary },
  tagline: { ...Typography.caption, color: Colors.textSecondary, marginTop: 2 },
  messagesButton: {
    width: 42,
    height: 42,
    borderRadius: Radius.pill,
    backgroundColor: Colors.card,
    alignItems: "center",
    justifyContent: "center",
  },
  badge: {
    position: "absolute",
    top: -2,
    right: -2,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#FF3B30",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
    borderWidth: 2,
    borderColor: Colors.background,
  },
  badgeText: { color: Colors.white, fontSize: 10, fontWeight: "700" },
  welcomeCard: {
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    marginBottom: Spacing.xl,
  },
  welcomeTitle: { ...Typography.h2, color: Colors.white, marginBottom: 6 },
  welcomeSubtitle: { ...Typography.body, color: "rgba(255,255,255,0.9)" },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: Spacing.md,
  },
  sectionTitle: { ...Typography.h3, color: Colors.textPrimary },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
});