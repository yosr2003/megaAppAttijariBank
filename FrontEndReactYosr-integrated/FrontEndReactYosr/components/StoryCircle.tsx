import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Story } from "../data/stories";
import { Colors, Gradients } from "../constants/home/Colors";
import { Typography } from "../constants/home/Typography";

interface StoryCircleProps {
  story: Story;
  onPress?: () => void;
}

export default function StoryCircle({ story, onPress }: StoryCircleProps) {
  return (
    <TouchableOpacity style={styles.container} activeOpacity={0.8} onPress={onPress}>
      <LinearGradient colors={Gradients.primary} style={styles.ring}>
        <Image source={{ uri: story.avatar }} style={styles.avatar} />
      </LinearGradient>
      {story.isYou && (
        <View style={styles.addBadge}>
          <Ionicons name="add" size={12} color={Colors.white} />
        </View>
      )}
      <Text style={styles.name} numberOfLines={1}>
        {story.name}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { width: 64, alignItems: "center" },
  ring: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    padding: 2.5,
  },
  avatar: { width: "100%", height: "100%", borderRadius: 27, borderWidth: 2, borderColor: Colors.background },
  addBadge: {
    position: "absolute",
    top: 42,
    right: 2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Colors.brandBlue,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: Colors.background,
  },
  name: { ...Typography.caption, color: Colors.textSecondary, marginTop: 6, fontSize: 11 },
});