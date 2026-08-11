import React, { useState } from 'react';
import { StyleSheet, Text, View, Pressable, ScrollView, Modal, Image, Dimensions } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/src/hooks/use-theme';
import { useFavoritesStore } from '@/src/store/favorites-store';
import { useFoodCartStore, CartRestaurant } from '@/src/store/food-cart-store';
import { P2PProduct } from '@/src/services/db-service';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface FavoritesModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectProduct?: (product: P2PProduct) => void;
}

export function FavoritesModal({ visible, onClose, onSelectProduct }: FavoritesModalProps) {
  const theme = useTheme();
  const { p2pFavorites, foodFavorites, toggleP2PFavorite, toggleFoodFavorite } = useFavoritesStore();
  const { addItem } = useFoodCartStore();
  const [activeTab, setActiveTab] = useState<'marketplace' | 'food'>('marketplace');

  const handleAddToCart = async (item: any) => {
    // Build a mock restaurant structure if not provided
    const mockRestaurant: CartRestaurant = {
      id: item.restaurantId || 'rest-1',
      name: item.restaurantName || 'Restaurant Tounsi',
      deliveryFee: item.deliveryFee ?? 2.500,
      minOrder: item.minOrder ?? 10.000,
    };

    addItem(mockRestaurant, {
      menuItemId: item.id,
      name: item.name,
      price: item.price,
      quantity: 1,
      imageUrl: item.image,
      extras: []
    });

    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    alert(`"${item.name}" a été ajouté au panier ! 🛒`);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: theme.colors.surface, borderColor: theme.colors.primary + '33' }]}>
          
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: theme.colors.border + '30' }]}>
            <View style={styles.titleRow}>
              <Ionicons name="heart" size={24} color="#FF5353" />
              <Text style={[styles.title, { color: theme.colors.textPrimary }]}>Mes Favoris</Text>
            </View>
            <Pressable onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close-outline" size={24} color={theme.colors.textPrimary} />
            </Pressable>
          </View>

          {/* Segment Tabs */}
          <View style={[styles.tabsRow, { backgroundColor: theme.colors.surfaceSubtle }]}>
            <Pressable 
              style={[styles.tabBtn, activeTab === 'marketplace' && { backgroundColor: theme.colors.primary }]}
              onPress={() => setActiveTab('marketplace')}
            >
              <Text style={[styles.tabText, { color: activeTab === 'marketplace' ? theme.colors.primaryOn : theme.colors.textSecondary }]}>
                Marketplace ({p2pFavorites.length})
              </Text>
            </Pressable>
            
            <Pressable 
              style={[styles.tabBtn, activeTab === 'food' && { backgroundColor: theme.colors.primary }]}
              onPress={() => setActiveTab('food')}
            >
              <Text style={[styles.tabText, { color: activeTab === 'food' ? theme.colors.primaryOn : theme.colors.textSecondary }]}>
                Menu Resto ({foodFavorites.length})
              </Text>
            </Pressable>
          </View>

          {/* List Content */}
          <ScrollView contentContainerStyle={styles.scrollList} showsVerticalScrollIndicator={false}>
            {activeTab === 'marketplace' ? (
              p2pFavorites.length > 0 ? (
                p2pFavorites.map((product) => (
                  <View key={product.id} style={[styles.favoriteCard, { backgroundColor: theme.colors.surfaceSubtle, borderColor: theme.colors.border + '20' }]}>
                    <Pressable 
                      style={styles.cardPressArea}
                      onPress={() => {
                        if (onSelectProduct) {
                          onSelectProduct(product);
                        }
                      }}
                    >
                      <Image 
                        source={{ uri: product.images[0] || 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?q=80&w=300' }} 
                        style={styles.cardImage} 
                      />
                      <View style={styles.cardInfo}>
                        <Text style={[styles.cardTitle, { color: theme.colors.textPrimary }]} numberOfLines={1}>{product.title}</Text>
                        <Text style={styles.cardPrice}>{Number(product.price).toFixed(3)} TND</Text>
                        <Text style={[styles.cardLoc, { color: theme.colors.textSecondary }]} numberOfLines={1}>
                          <Ionicons name="location-outline" size={12} /> {product.location.split('|')[0]}
                        </Text>
                      </View>
                    </Pressable>
                    <Pressable 
                      style={styles.removeBtn} 
                      onPress={() => toggleP2PFavorite(product)}
                    >
                      <Ionicons name="trash-outline" size={18} color="#FF5353" />
                    </Pressable>
                  </View>
                ))
              ) : (
                <View style={styles.emptyContainer}>
                  <Ionicons name="basket-outline" size={48} color={theme.colors.textSecondary + '60'} />
                  <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>Aucun produit favori pour le moment.</Text>
                </View>
              )
            ) : (
              foodFavorites.length > 0 ? (
                foodFavorites.map((item) => (
                  <View key={item.id} style={[styles.favoriteCard, { backgroundColor: theme.colors.surfaceSubtle, borderColor: theme.colors.border + '20' }]}>
                    <View style={styles.cardPressArea}>
                      {Boolean(item.image) && (
                        <Image source={{ uri: item.image }} style={styles.cardImage} />
                      )}
                      <View style={styles.cardInfo}>
                        <Text style={[styles.cardTitle, { color: theme.colors.textPrimary }]} numberOfLines={1}>{item.name}</Text>
                        <Text style={styles.cardPrice}>{Number(item.price).toFixed(3)} TND</Text>
                        {Boolean(item.description) && (
                          <Text style={[styles.cardDesc, { color: theme.colors.textSecondary }]} numberOfLines={1}>{item.description}</Text>
                        )}
                        
                        {/* Add to Cart Directly */}
                        <Pressable 
                          style={[styles.miniCartBtn, { backgroundColor: '#FFC244' }]}
                          onPress={() => handleAddToCart(item)}
                        >
                          <Ionicons name="cart" size={14} color="#000" />
                          <Text style={styles.miniCartText}>Ajouter</Text>
                        </Pressable>
                      </View>
                    </View>
                    <Pressable 
                      style={styles.removeBtn} 
                      onPress={() => toggleFoodFavorite(item)}
                    >
                      <Ionicons name="trash-outline" size={18} color="#FF5353" />
                    </Pressable>
                  </View>
                ))
              ) : (
                <View style={styles.emptyContainer}>
                  <Ionicons name="fast-food-outline" size={48} color={theme.colors.textSecondary + '60'} />
                  <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>Aucun repas favori pour le moment.</Text>
                </View>
              )
            )}
          </ScrollView>

        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(3, 12, 22, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    borderWidth: 1.5,
    maxHeight: '85%',
    minHeight: '60%',
    padding: 20,
    gap: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    paddingBottom: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
  },
  closeBtn: {
    padding: 4,
  },
  tabsRow: {
    flexDirection: 'row',
    borderRadius: 14,
    padding: 3,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 11,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '700',
  },
  scrollList: {
    paddingBottom: 30,
    gap: 12,
  },
  favoriteCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  cardPressArea: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  cardImage: {
    width: 60,
    height: 60,
    borderRadius: 10,
    backgroundColor: '#09203F20',
  },
  cardInfo: {
    flex: 1,
    gap: 3,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  cardPrice: {
    fontSize: 13,
    fontWeight: '800',
    color: '#ECC863',
  },
  cardLoc: {
    fontSize: 11,
  },
  cardDesc: {
    fontSize: 11,
  },
  removeBtn: {
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniCartBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
    gap: 4,
    marginTop: 4,
  },
  miniCartText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#000',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  emptyText: {
    fontSize: 13,
    textAlign: 'center',
  },
});
