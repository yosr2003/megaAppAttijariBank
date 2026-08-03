import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../constants/home/Colors";
import { Typography } from "../constants/home/Typography";
import { Radius } from "../constants/home/Layout";

const LOGO = require("../assets/images/logoSuperTounsi.jpg");

interface HeaderProps {
  userName?: string;
  notificationCount?: number;
  onPressNotifications?: () => void;
  onPressAvatar?: () => void;
}

export default function Header({
  userName = "Ahmed",
  notificationCount = 3,
  onPressNotifications,
  onPressAvatar,
}: HeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.left}>
        <TouchableOpacity onPress={onPressAvatar} activeOpacity={0.8}>
          <Image source={LOGO} style={styles.avatar} />
        </TouchableOpacity>
        <View>
          <Text style={styles.greeting}>Good evening, {userName} 👋</Text>
          <Text style={styles.title}>Discover Events</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.bell}
        activeOpacity={0.8}
        onPress={onPressNotifications}
      >
        <Ionicons name="notifications" size={20} color={Colors.textPrimary} />
        {notificationCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{notificationCount}</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  left: { flexDirection: "row", alignItems: "center", gap: 10 },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1.5,
    borderColor: Colors.brandPurple,
  },
  greeting: { ...Typography.caption, color: Colors.textSecondary },
  title: { ...Typography.h2, color: Colors.textPrimary, marginTop: 2 },
  bell: {
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
    backgroundColor: Colors.brandPurple,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
    borderWidth: 2,
    borderColor: Colors.background,
  },
  badgeText: { color: Colors.white, fontSize: 10, fontWeight: "700" },
});
