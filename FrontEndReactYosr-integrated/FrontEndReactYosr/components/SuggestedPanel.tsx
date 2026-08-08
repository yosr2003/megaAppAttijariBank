import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SuggestedUser, suggestedUsers } from "../data/suggestedUsers";
import { Colors } from "../constants/home/Colors";
import { Radius, Spacing } from "../constants/home/Layout";
import { Typography } from "../constants/home/Typography";

interface SuggestedPanelProps {
  visible: boolean;
  onClose: () => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const PANEL_WIDTH = Math.min(SCREEN_WIDTH * 0.82, 340);

export default function SuggestedPanel({ visible, onClose }: SuggestedPanelProps) {
  const translateX = useRef(new Animated.Value(PANEL_WIDTH)).current;
  const [users, setUsers] = useState<SuggestedUser[]>(suggestedUsers);
  const [rendered, setRendered] = useState(visible);

  useEffect(() => {
    if (visible) setRendered(true);
    Animated.timing(translateX, {
      toValue: visible ? 0 : PANEL_WIDTH,
      duration: 260,
      useNativeDriver: true,
    }).start(() => {
      if (!visible) setRendered(false);
    });
  }, [visible]);

  const toggleFollow = (id: string) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, following: !u.following } : u)));
  };

  if (!rendered) return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View style={[styles.backdrop, { opacity: visible ? 1 : 0 }]} />
      </TouchableWithoutFeedback>

      <Animated.View style={[styles.panel, { width: PANEL_WIDTH, transform: [{ translateX }] }]}>
        <View style={styles.panelHeader}>
          <Text style={styles.panelTitle}>Suggestions</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Ionicons name="close" size={20} color={Colors.textPrimary} />
          </TouchableOpacity>
        </View>

        {users.map((user) => (
          <View key={user.id} style={styles.userRow}>
            <Image source={{ uri: user.avatar }} style={styles.avatar} />
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{user.name}</Text>
              <Text style={styles.userRole}>{user.role}</Text>
              <Text style={styles.mutual}>{user.mutual} amis en commun</Text>
            </View>
            <TouchableOpacity
              style={[styles.followBtn, user.following && styles.followingBtn]}
              onPress={() => toggleFollow(user.id)}
            >
              <Text style={[styles.followText, user.following && styles.followingText]}>
                {user.following ? "Suivi" : "Suivre"}
              </Text>
            </TouchableOpacity>
          </View>
        ))}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.55)" },
  panel: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.backgroundAlt,
    borderLeftWidth: 1,
    borderLeftColor: Colors.cardBorder,
    paddingTop: 60,
    paddingHorizontal: Spacing.lg,
  },
  panelHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.lg,
  },
  panelTitle: { ...Typography.h3, color: Colors.textPrimary },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: Radius.pill,
    backgroundColor: Colors.card,
    alignItems: "center",
    justifyContent: "center",
  },
  userRow: { flexDirection: "row", alignItems: "center", marginBottom: Spacing.lg, gap: Spacing.sm },
  avatar: { width: 44, height: 44, borderRadius: 22 },
  userInfo: { flex: 1 },
  userName: { ...Typography.bodyMedium, color: Colors.textPrimary, fontWeight: "700" },
  userRole: { ...Typography.caption, color: Colors.textSecondary, marginTop: 1 },
  mutual: { ...Typography.caption, color: Colors.textMuted, marginTop: 1, fontSize: 10 },
  followBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: Radius.pill,
    backgroundColor: Colors.brandBlue,
  },
  followingBtn: { backgroundColor: Colors.cardAlt, borderWidth: 1, borderColor: Colors.cardBorder },
  followText: { ...Typography.captionMedium, color: Colors.white },
  followingText: { color: Colors.textSecondary },
});