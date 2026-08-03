import React, { useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';

interface RoleCardProps {
  title: string;
  description: string;
  iconName: string;
  iconType: 'feather' | 'material';
  selected: boolean;
  onPress: () => void;
}

export default function RoleCard({
  title,
  description,
  iconName,
  iconType,
  selected,
  onPress,
}: RoleCardProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 4,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, styles.container]}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
        style={[
          styles.card,
          selected && styles.cardSelected,
        ]}
      >
        <View style={styles.content}>
          {/* Icon Container */}
          <View style={[styles.iconContainer, selected && styles.iconContainerSelected]}>
            {iconType === 'feather' ? (
              <Feather
                name={iconName as any}
                size={22}
                color={selected ? '#ffffff' : '#2c87e8'}
              />
            ) : (
              <MaterialCommunityIcons
                name={iconName as any}
                size={22}
                color={selected ? '#ffffff' : '#2c87e8'}
              />
            )}
          </View>

          {/* Text Content */}
          <View style={styles.textContainer}>
            <Text style={[styles.title, selected && styles.titleSelected]}>
              {title}
            </Text>
            <Text style={styles.description}>
              {description}
            </Text>
          </View>

          {/* Right Arrow */}
          <View style={styles.arrowContainer}>
            <Feather
              name="chevron-right"
              size={18}
              color={selected ? '#2c87e8' : '#6d80a1'}
            />
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 14,
  },
  card: {
    backgroundColor: Colors.cardBg,
    borderWidth: 1.5,
    borderColor: Colors.cardBorder,
    borderRadius: 20,
    padding: 16,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
  },
  cardSelected: {
    borderColor: '#2c87e8',
    backgroundColor: 'rgba(44, 135, 232, 0.05)',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(44, 135, 232, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  iconContainerSelected: {
    backgroundColor: '#2c87e8',
  },
  textContainer: {
    flex: 1,
    paddingRight: 8,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  titleSelected: {
    color: '#ffffff',
  },
  description: {
    fontSize: 12,
    color: '#6d80a1',
    lineHeight: 16,
  },
  arrowContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
