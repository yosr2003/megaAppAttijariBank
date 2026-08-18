import React, { useRef, useState } from "react";
import {
  Alert,
  Modal,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

import { Colors } from "../constants/home/Colors";
import { Radius, Spacing } from "../constants/home/Layout";

interface PostOptionsMenuProps {
  postId: number | string;
  onDelete?: (postId: number | string) => void;
  onTranslate?: () => void;
}

/**
 * Menu "3 points" (style Instagram/Facebook) affiché en haut à droite
 * d'un post. Ouvre un petit dropdown flottant avec 2 icônes :
 * supprimer (avec confirmation) et modifier (navigation statique).
 *
 * Composant 100% isolé : ne dépend d'aucune logique existante,
 * s'utilise simplement en le plaçant dans le header d'un post.
 */
export default function PostOptionsMenu({
  postId,
  onDelete,
  onTranslate,
}: PostOptionsMenuProps) {
  const [visible, setVisible] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, right: 0 });
  const triggerRef = useRef<View>(null);

  const openMenu = () => {
    triggerRef.current?.measureInWindow((x, y, width, height) => {
      setMenuPos({
        top: y + height + 4,
        right: 16,
      });
      setVisible(true);
    });
  };

  const closeMenu = () => setVisible(false);

  const handleDelete = () => {
    closeMenu();
    Alert.alert(
      "Supprimer le post",
      "Êtes-vous sûr de vouloir supprimer ce post ?",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: () => {
            onDelete?.(postId);
          },
        },
      ]
    );
  };

  const handleUpdate = () => {
    closeMenu();
    router.push(`/blog/update-post/${postId}`);
  };

  return (
    <>
      <TouchableOpacity
        ref={triggerRef}
        onPress={openMenu}
        activeOpacity={0.7}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        style={styles.dotsButton}
      >
        <Ionicons
          name="ellipsis-vertical"
          size={18}
          color={Colors.textMuted}
        />
      </TouchableOpacity>

      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={closeMenu}
      >
        <Pressable style={styles.backdrop} onPress={closeMenu}>
          <View
            style={[
              styles.dropdown,
              { top: menuPos.top, right: menuPos.right },
            ]}
          >
          {/* MODIFIER */}
<TouchableOpacity
  style={styles.menuItem}
  activeOpacity={0.7}
  onPress={handleUpdate}
>
  <Ionicons
    name="pencil-outline"
    size={18}
    color={Colors.textPrimary}
  />
</TouchableOpacity>

<View style={styles.separator} />

{/* TRADUIRE */}
<TouchableOpacity
  style={styles.menuItem}
  activeOpacity={0.7}
  onPress={() => {
    closeMenu();
    onTranslate?.();
  }}
>
  <Ionicons
    name="language-outline"
    size={18}
    color={Colors.brandBlue}
  />
</TouchableOpacity>

<View style={styles.separator} />

{/* SUPPRIMER */}
<TouchableOpacity
  style={styles.menuItem}
  activeOpacity={0.7}
  onPress={handleDelete}
>
  <Ionicons
    name="trash-outline"
    size={18}
    color={Colors.danger}
  />
</TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  dotsButton: {
    padding: 4,
    marginLeft: Spacing.xs,
  },

  backdrop: {
    flex: 1,
  },

  dropdown: {
    position: "absolute",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.cardAlt,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    borderRadius: Radius.md,
    paddingVertical: 6,
    paddingHorizontal: 6,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },

  menuItem: {
    paddingVertical: 6,
    paddingHorizontal: 10,
  },

  separator: {
    width: 1,
    height: 18,
    backgroundColor: Colors.cardBorder,
  },
});