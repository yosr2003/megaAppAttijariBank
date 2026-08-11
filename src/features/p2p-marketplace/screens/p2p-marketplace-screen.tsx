import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Pressable, ScrollView, ActivityIndicator, Alert, Modal, TextInput, FlatList, Image, KeyboardAvoidingView, Keyboard, Platform, TouchableWithoutFeedback } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { useIsFocused } from '@react-navigation/native';

import { StarField, Card } from '@/src/components/ui';
import { useDb } from '@/src/hooks/use-db';
import { useTheme } from '@/src/hooks/use-theme';
import { FavoritesModal } from '@/src/components/ui/FavoritesModal';
import { useFavoritesStore } from '@/src/store/favorites-store';
import { useFormValidation } from '@/src/hooks/use-form-validation';
import { dbService, P2PProduct, P2PFavorite, WalletCard } from '@/src/services/db-service';
import { format, V } from '@/src/utils/form-validation';
import { AddressPickerModal } from '@/src/features/food-delivery/components/AddressPickerModal';
import { FaceIdModal } from '@/src/features/food-delivery/components/FaceIdModal';
import { SavedAddress } from '@/src/features/food-delivery/types';

const CATEGORIES = ['Tous', 'Électronique', 'Véhicules', 'Habillement', 'Maison', 'Loisirs', 'Autre'];
const LOCATIONS = ['Tunis, La Marsa', 'Sousse, Kantaoui', 'Sfax, Ville', 'Djerba, Midoun', 'Nabeul, Hammamet', 'Bizerte, Corniche', 'Monastir, Skanes'];


export function P2PMarketplaceScreen() {
  const isFocused = useIsFocused();
  const theme = useTheme();
  const [isFavoritesVisible, setIsFavoritesVisible] = useState(false);
  const { toggleP2PFavorite, isP2PFavorited } = useFavoritesStore();
  const { userId, isReady } = useDb();
  const { errors, validate, clearError, clearAll } = useFormValidation();

  const [products, setProducts] = useState<P2PProduct[]>([]);
  const [favorites, setFavorites] = useState<P2PFavorite[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filtering States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tous');
  const [selectedLocation, setSelectedLocation] = useState('Toute la Tunisie');
  const [sortOption, setSortOption] = useState<'date' | 'priceAsc' | 'priceDesc'>('date');
  const [filterCondition, setFilterCondition] = useState<'All' | 'New' | 'Used'>('All');

  // Modals Visibility
  const [isSellModalVisible, setIsSellModalVisible] = useState(false);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
  const [isChatModalVisible, setIsChatModalVisible] = useState(false);
  const [isMapVisible, setIsMapVisible] = useState(false);
  const [isFaceIdVisible, setIsFaceIdVisible] = useState(false);

  // Selected Product Detail
  const [selectedProduct, setSelectedProduct] = useState<P2PProduct | null>(null);
  const [productToBuy, setProductToBuy] = useState<P2PProduct | null>(null);

  // Mock Chat State
  const [chatMessage, setChatMessage] = useState('');
  const [chatProduct, setChatProduct] = useState<P2PProduct | null>(null);
  const [negotiatedPrice, setNegotiatedPrice] = useState<number | null>(null);
  const [chatHistory, setChatHistory] = useState<{ 
    sender: 'user' | 'seller'; 
    text: string; 
    time: string;
    type?: 'text' | 'offer';
    offerPrice?: number;
    offerStatus?: 'pending' | 'accepted' | 'declined';
  }[]>([]);

  // Sell Form State
  const [sellTitle, setSellTitle] = useState('');
  const [sellDesc, setSellDesc] = useState('');
  const [sellCategory, setSellCategory] = useState('Électronique');
  const [sellPrice, setSellPrice] = useState('');
  const [sellCondition, setSellCondition] = useState<'New' | 'Used'>('Used');
  const [sellLocation, setSellLocation] = useState('Tunis, La Marsa');
  const [sellContact, setSellContact] = useState('+216 ');
  const [sellImages, setSellImages] = useState<string[]>([]);
  const [userCards, setUserCards] = useState<WalletCard[]>([]);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [aiBargainActive, setAiBargainActive] = useState(false);
  const [aiBargainBudget, setAiBargainBudget] = useState('');
  const [isBargaining, setIsBargaining] = useState(false);

  // Load Marketplace Products & Favorites
  const loadProducts = async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const [list, favs, cards] = await Promise.all([
        dbService.getP2PProducts(),
        dbService.getP2PFavorites(userId),
        dbService.getCards(userId)
      ]);
      setProducts(list);
      setFavorites(favs);
      setUserCards(cards);
    } catch (e) {
      console.error("Error loading products:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isReady && userId && isFocused) {
      loadProducts();
    }
  }, [isReady, userId, isFocused]);

  // Check if product is favorited
  const isFavorited = (productId: string) => {
    return favorites.some(f => f.product_id === productId);
  };

  // Toggle Favorite in database
  const toggleFavorite = async (product: P2PProduct) => {
    if (!userId || !product.id) return;
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
      if (isFavorited(product.id)) {
        await dbService.removeP2PFavorite(userId, product.id);
        setFavorites(prev => prev.filter(f => f.product_id !== product.id));
      } else {
        const newFav = await dbService.addP2PFavorite(userId, product.id);
        setFavorites(prev => [...prev, newFav]);
      }
    } catch (e) {
      console.error("Error toggling favorite:", e);
    }
  };

  // Handle Photo Taking & Library Picks
  const handlePickImage = async (useCamera: boolean) => {
    try {
      let result;
      if (useCamera) {
        const cameraPerm = await ImagePicker.requestCameraPermissionsAsync();
        if (!cameraPerm.granted) {
          Alert.alert("Permission", "Accès caméra requis.");
          return;
        }
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          quality: 0.8,
        });
      } else {
        const libraryPerm = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!libraryPerm.granted) {
          Alert.alert("Permission", "Accès galerie requis.");
          return;
        }
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          quality: 0.8,
        });
      }

      if (!result.canceled && result.assets && result.assets[0].uri) {
        setSellImages(prev => [...prev, result.assets[0].uri]);
      }
    } catch (e) {
      console.error("Image pick error:", e);
      Alert.alert("Erreur", "Sélection d'image échouée.");
    }
  };

  // Remove image preview
  const handleRemoveImage = (index: number) => {
    setSellImages(prev => prev.filter((_, i) => i !== index));
  };

  // Publish Listing
  const handlePublishListing = async () => {
    if (!userId) return;

    const isValid = validate({
      sellTitle: { value: sellTitle, rules: [V.listingTitle] },
      sellPrice: { value: sellPrice, rules: [V.tndAmount({ min: 0.001, max: 999_999 })] },
      sellContact: { value: sellContact, rules: [V.tunisianPhone] },
      sellDesc: { value: sellDesc, rules: [V.listingDescription] },
    });
    if (!isValid) return;

    try {
      setLoading(true);
      
      const finalImages = sellImages.length > 0 ? sellImages : ['https://images.unsplash.com/photo-1531403009284-440f080d1e12?q=80&w=500'];

      await dbService.createP2PProduct({
        user_id: userId,
        title: sellTitle.trim(),
        description: sellDesc.trim(),
        category: sellCategory,
        price: parseFloat(sellPrice),
        condition: sellCondition,
        location: sellLocation,
        contact_info: sellContact.trim(),
        images: finalImages
      });

      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("Félicitations", `Votre annonce "${sellTitle}" a été publiée sur le Marketplace !`);

      // Reset Form & Modals
      setSellTitle('');
      setSellDesc('');
      setSellPrice('');
      setSellImages([]);
      setSellContact('+216 ');
      clearAll();
      setIsSellModalVisible(false);
      loadProducts();
    } catch (e) {
      console.error("Publishing product failed:", e);
      Alert.alert("Erreur", "Impossible de publier l'annonce.");
    } finally {
      setLoading(false);
    }
  };

  // Helper to parse location and lat/lng
  const parseLocation = (locStr: string) => {
    const parts = (locStr || '').split('|');
    const address = parts[0] || 'Tunis, Tunisie';
    const lat = parts[1] ? parseFloat(parts[1]) : 36.8008;
    const lng = parts[2] ? parseFloat(parts[2]) : 10.18;
    const hasCoordinates = parts.length >= 3;
    return { address, lat, lng, hasCoordinates };
  };

  // P2P purchase workflow
  const handleInitiateP2PBuy = async (product: P2PProduct) => {
    const walletBalance = userCards.reduce((acc, c) => acc + (c.balance || 0), 0);
    const finalPrice = negotiatedPrice !== null ? negotiatedPrice : product.price;
    
    // Auto-credit helper for smooth testing
    if (walletBalance < finalPrice) {
      const activeCard = userCards[0];
      if (activeCard && activeCard.id) {
        try {
          const addedAmt = finalPrice + 500;
          await dbService.updateCardBalance(activeCard.id, Number(activeCard.balance) + addedAmt);
          Alert.alert(
            "Solde Auto-Crédité 💳",
            `Pour faciliter vos tests, nous avons automatiquement crédité ${addedAmt.toFixed(3)} TND sur votre carte Gold !`
          );
          // Reload cards and continue
          const cards = await dbService.getCards(userId);
          setUserCards(cards);
        } catch (e) {
          console.error("Auto credit failed:", e);
        }
      } else {
        Alert.alert("Erreur", "Veuillez d'abord ajouter une carte bancaire dans votre portefeuille.");
        return;
      }
    }
    
    setProductToBuy(product);
    setIsFaceIdVisible(true);
  };

  const handleP2PBuySuccess = async () => {
    if (!productToBuy || !userId) return;
    setIsFaceIdVisible(false);
    const finalPrice = negotiatedPrice !== null ? negotiatedPrice : productToBuy.price;
    try {
      setLoading(true);
      const activeCard = userCards[0];
      if (activeCard && activeCard.id) {
        const newBal = Math.max(0, activeCard.balance - finalPrice);
        await dbService.updateCardBalance(activeCard.id, newBal);
      }
      
      // Log transaction with escrow status
      await dbService.createTransaction({
        user_id: userId,
        card_id: activeCard?.id || null,
        title: `Escrow: ${productToBuy.title}`,
        category: "Marketplace",
        amount: -finalPrice,
        currency: "TND",
        icon: "lock-closed-outline"
      });

      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(
        "Achat Séquestre Actif 🔒",
        `Félicitations! Le paiement de ${finalPrice.toFixed(3)} TND a été sécurisé en escrow. Veuillez scanner le code QR du vendeur lors de la remise physique pour débloquer les fonds.`
      );
      
      setIsDetailModalVisible(false);
      setProductToBuy(null);
      setNegotiatedPrice(null);
      loadProducts();
    } catch (e) {
      console.error("Escrow purchase failed:", e);
      Alert.alert("Erreur", "L'achat a échoué.");
    } finally {
      setLoading(false);
    }
  };

  // Open Chat with Seller
  
  const handleDeleteProduct = (productId: string) => {
    Alert.alert(
      "Supprimer l'annonce",
      "Êtes-vous sûr de vouloir supprimer définitivement cette annonce ?",
      [
        { text: "Annuler", style: "cancel" },
        { 
          text: "Supprimer", 
          style: "destructive", 
          onPress: async () => {
            try {
              setLoading(true);
              await dbService.deleteP2PProduct(productId);
              await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
              setIsDetailModalVisible(false);
              loadProducts();
            } catch (err) {
              console.error("Delete product failed:", err);
              Alert.alert("Erreur", "Impossible de supprimer l'annonce.");
            } finally {
              setLoading(false);
            }
          } 
        }
      ]
    );
  };

  const openChatWithSeller = (product: P2PProduct) => {
    setChatProduct(product);
    setNegotiatedPrice(null);
    setIsDetailModalVisible(false);
    setChatHistory([
      { sender: 'seller', text: `Bonjour ! Oui, le produit "${product.title}" est toujours disponible. Vous souhaitez le voir ?`, time: '11:00', type: 'text' }
    ]);
    setIsChatModalVisible(true);
  };

    const runAIBargaining = () => {
    const budget = parseFloat(aiBargainBudget);
    if (isNaN(budget) || budget <= 0 || !chatProduct) {
      Alert.alert("Erreur", "Veuillez entrer un budget max de négociation valide.");
      return;
    }
    
    if (budget >= chatProduct.price) {
      Alert.alert("Info", "Votre budget est supérieur ou égal au prix affiché. Vous pouvez acheter directement !");
      return;
    }

    setIsBargaining(true);
    setChatHistory([
      { sender: 'seller', text: `Bonjour ! Oui, le produit "${chatProduct.title}" est toujours disponible. Vous souhaitez le voir ?`, time: '11:00', type: 'text' }
    ]);

    const ratio = budget / chatProduct.price;

    // SCENARIO 1: Lowballer (< 50%) -> Rejection in Tunisian
    if (ratio < 0.5) {
      setTimeout(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        setChatHistory(prev => [...prev, {
          sender: 'user',
          text: `🤖 (IA) Salam khouya, n7eb nechri el ${chatProduct.title}. Te9bel fih ${budget.toFixed(3)} TND cash taw?`,
          time: '11:15',
          type: 'text'
        }]);
      }, 1200);

      setTimeout(() => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        setChatHistory(prev => [...prev, {
          sender: 'seller',
          text: `Laa khouya y3aychek! ${budget.toFixed(3)} TND chwaya barcha 3lih, d'origine w ndhif barcha raw. Zid chwaya soum khalli netfehmou!`,
          time: '11:16',
          type: 'text'
        }]);
        setIsBargaining(false);
      }, 2800);
      return;
    }

    // SCENARIO 2: Instant Accept (> 85%) -> Immediate accept in Tunisian
    if (ratio >= 0.85) {
      setTimeout(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        setChatHistory(prev => [...prev, {
          sender: 'user',
          text: `🤖 (IA) Salam khouya, n7eb nechri el ${chatProduct.title}. Te9bel fih ${budget.toFixed(3)} TND cash taw?`,
          time: '11:15',
          type: 'text'
        }]);
      }, 1200);

      setTimeout(() => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setNegotiatedPrice(budget);
        setChatHistory(prev => [...prev, {
          sender: 'seller',
          text: `Mar7ba khouya. Soum yse3edni, behi yalah mabrouk 3lik b ${budget.toFixed(3)} TND! A3mel paiement secure taw net9ablu.`,
          time: '11:16',
          type: 'text'
        }]);
        setIsBargaining(false);
      }, 2800);
      return;
    }

    // SCENARIO 3: Counter-Offer Haggling (50% - 85%) -> 4-step bargaining conversation
    // Step 1: User IA initiates offer
    setTimeout(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setChatHistory(prev => [...prev, {
        sender: 'user',
        text: `🤖 (IA) Salam khouya, n7eb nechri el ${chatProduct.title}. Te9bel fih ${budget.toFixed(3)} TND cash taw?`,
        time: '11:15',
        type: 'text'
      }]);
    }, 1200);

    // Step 2: Seller declines and makes a counter-offer
    setTimeout(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const counterPrice = (chatProduct.price * 0.92).toFixed(3);
      setChatHistory(prev => [...prev, {
        sender: 'seller',
        text: `Mar7ba khouya. Eyy d'origine w ndhif barcha, khsara fih. Chrayek na3mellek soum b ${counterPrice} TND?`,
        time: '11:16',
        type: 'text'
      }]);
    }, 2800);

    // Step 3: User IA insists on budget
    setTimeout(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setChatHistory(prev => [...prev, {
        sender: 'user',
        text: `🤖 (IA) Wallah hadha a5er budget andi khouya, w ena serieux n7eb nekhthou taw. 9oul behi w khallina net9ablu.`,
        time: '11:17',
        type: 'text'
      }]);
    }, 4500);

    // Step 4: Seller accepts!
    setTimeout(() => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setNegotiatedPrice(budget);
      setChatHistory(prev => [...prev, {
        sender: 'seller',
        text: `Behi yse3dek, mabrouk 3lik khouya! N5alihoulek b ${budget.toFixed(3)} TND. A3mel paiement secure taw net9ablu.`,
        time: '11:18',
        type: 'text'
      }]);
      setIsBargaining(false);
    }, 6200);
  };

  const handleSendChatMessage = () => {
    if (!chatMessage.trim()) return;
    
    const newMsg = { sender: 'user' as const, text: chatMessage, time: '11:15', type: 'text' as const };
    setChatHistory(prev => [...prev, newMsg]);
    setChatMessage('');

    // Mock seller auto-response after 1.5 seconds
    setTimeout(() => {
      setChatHistory(prev => [...prev, {
        sender: 'seller',
        text: "D'accord, je suis libre cet après-midi à la Marsa si vous êtes disponible pour faire l'échange.",
        time: '11:16',
        type: 'text' as const
      }]);
    }, 1500);
  };

  const handleMakeOffer = (priceStr: string) => {
    const price = parseFloat(priceStr);
    if (isNaN(price) || price <= 0 || !chatProduct) {
      Alert.alert("Erreur", "Veuillez entrer une offre valide.");
      return;
    }

    const offerMsg = {
      sender: 'user' as const,
      text: `Offre de prix envoyée : ${price.toFixed(3)} TND`,
      time: '11:15',
      type: 'offer' as const,
      offerPrice: price,
      offerStatus: 'pending' as const,
    };
    setChatHistory((prev) => [...prev, offerMsg]);

    setTimeout(() => {
      const minPrice = chatProduct.price * 0.80; // Accepts down to 80%
      const accepted = price >= minPrice;

      if (accepted) {
        setNegotiatedPrice(price);
        setChatHistory((prev) =>
          prev.map((msg) =>
            msg.type === 'offer' && msg.offerPrice === price ? { ...msg, offerStatus: 'accepted' } : msg
          )
        );
        setChatHistory((prev) => [
          ...prev,
          {
            sender: 'seller' as const,
            text: `D'accord, j'accepte votre offre pour ${price.toFixed(3)} TND. Vous pouvez procéder à l'achat sécurisé !`,
            time: '11:16',
            type: 'text' as const,
          },
        ]);
      } else {
        setChatHistory((prev) =>
          prev.map((msg) =>
            msg.type === 'offer' && msg.offerPrice === price ? { ...msg, offerStatus: 'declined' } : msg
          )
        );
        setChatHistory((prev) => [
          ...prev,
          {
            sender: 'seller' as const,
            text: `Désolé, c'est trop bas pour cet article. Mon prix final est de ${(chatProduct.price * 0.9).toFixed(3)} TND.`,
            time: '11:16',
            type: 'text' as const,
          },
        ]);
      }
    }, 1800);
  };

  // Apply search query, category, location, and sorting filters
  const filteredProducts = products
    .filter(product => {
      const matchesSearch = (product.title || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                            (product.description || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'Tous' || product.category === selectedCategory;
      const matchesLocation = selectedLocation === 'Toute la Tunisie' || (product.location || '').includes(selectedLocation.split(',')[0]);
      const matchesCondition = filterCondition === 'All' || product.condition === filterCondition;
      
      return matchesSearch && matchesCategory && matchesLocation && matchesCondition;
    })
    .sort((a, b) => {
      if (sortOption === 'priceAsc') return Number(a.price) - Number(b.price);
      if (sortOption === 'priceDesc') return Number(b.price) - Number(a.price);
      return new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime(); // Default: Date descending
    });

  return (
    <SafeAreaView edges={['top']} style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      <StatusBar style="light" />
      <StarField />
      
      <View style={styles.ambientGlow} />

      {/* Main Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerLabel}>ACHATS & VENTES</Text>
          <Text style={styles.headerTitle}>Marketplace</Text>
        </View>

        <View style={styles.headerActions}>
          <Pressable 
            style={[styles.actionBtn, { marginRight: 8, backgroundColor: 'rgba(255, 83, 83, 0.15)', borderColor: 'rgba(255, 83, 83, 0.3)' }]} 
            onPress={() => setIsFavoritesVisible(true)}
          >
            <Ionicons name="heart" size={16} color="#FF5353" />
            <Text style={[styles.actionBtnText, { color: '#FF5353' }]}>Favoris</Text>
          </Pressable>

          <Pressable style={styles.actionBtn} onPress={() => setIsSellModalVisible(true)}>
            <Ionicons name="add-circle-outline" size={20} color="#F7FAFF" />
            <Text style={styles.actionBtnText}>Vendre</Text>
          </Pressable>
        </View>
      </View>

      {/* Search and Filters Bar */}
      <View style={[styles.searchBarContainer, { backgroundColor: theme.colors.surfaceSubtle, borderColor: theme.colors.border + '30' }]}>
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={18} color="#7891B2" />
          <TextInput
            style={[styles.searchInput, { color: theme.colors.textPrimary }]}
            placeholder="Rechercher un article..."
            placeholderTextColor="#7891B280"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <Pressable onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={16} color="#7891B2" />
            </Pressable>
          ) : null}
        </View>

        <Pressable style={[styles.filterTrigger, { backgroundColor: theme.colors.surfaceSubtle, borderColor: theme.colors.border + '20' }]} onPress={() => setIsFilterModalVisible(true)}>
          <Ionicons name="options-outline" size={20} color="#2F80ED" />
        </Pressable>
      </View>

      {/* Category badgeline */}
      <View style={{ maxHeight: 50 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <Pressable 
                key={cat} 
                style={[styles.catBadge, { backgroundColor: theme.colors.surfaceSubtle, borderColor: theme.colors.border + '20' }, isActive && { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary }]}
                onPress={() => setSelectedCategory(cat)}
              >
                <Text style={[styles.catText, { color: theme.colors.textSecondary }, isActive && { color: theme.colors.primaryOn }]}>{cat}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* Products Feed */}
      {loading && products.length === 0 ? (
        <ActivityIndicator size="large" color="#2F80ED" style={{ marginTop: 40 }} />
      ) : filteredProducts.length > 0 ? (
        <FlatList
          data={filteredProducts}
          keyExtractor={(item) => item.id!}
          numColumns={2}
          contentContainerStyle={styles.feedScroll}
          columnWrapperStyle={styles.feedRow}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={[styles.productCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border + '33', position: 'relative', overflow: 'hidden' }]}>
              <Pressable
                onPress={() => {
                  setSelectedProduct(item);
                  setIsDetailModalVisible(true);
                }}
                style={({ pressed }) => [
                  pressed && { opacity: 0.85 }
                ]}
              >
                {/* Product Image */}
                <View style={styles.productImgContainer}>
                  <Image 
                    source={{ uri: item.images[0] || 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?q=80&w=300' }} 
                    style={styles.productImg}
                  />
                  
                  {/* Condition Badge */}
                  <View style={[
                    styles.condBadge, 
                    item.condition === 'New' ? { backgroundColor: '#12C979E6' } : { backgroundColor: '#FF8A00E6' }
                  ]}>
                    <Text style={styles.condText}>{item.condition === 'New' ? 'Neuf' : 'Occasion'}</Text>
                  </View>
                </View>

                {/* Product Info */}
                <View style={styles.productMeta}>
                  <Text style={[styles.productPrice, { color: theme.colors.accent || '#ECC863' }]}>{Number(item.price).toFixed(3)} TND</Text>
                  <Text style={[styles.productTitle, { color: theme.colors.textPrimary }]} numberOfLines={1}>{item.title}</Text>
                  <View style={styles.locContainer}>
                    <Ionicons name="location-outline" size={12} color="#7891B2" />
                    <Text style={[styles.productLoc, { color: theme.colors.textSecondary }]} numberOfLines={1}>{item.location.split(',')[0]}</Text>
                  </View>
                </View>
              </Pressable>

              {/* Favorite Toggle button */}
              <Pressable style={styles.favBtn} onPress={() => toggleP2PFavorite(item)}>
                <Ionicons 
                  name={isP2PFavorited(item.id!) ? "heart" : "heart-outline"} 
                  size={16} 
                  color={isP2PFavorited(item.id!) ? "#FF5353" : "#F7FAFF"} 
                />
              </Pressable>
            </View>
          )}
        />
      ) : (
        <View style={styles.placeholderContainer}>
          <Ionicons name="basket-outline" size={48} color="#7891B260" />
          <Text style={styles.placeholderText}>Aucun produit ne correspond à vos filtres.</Text>
        </View>
      )}

      {/* ==========================================================
          MODALS & DETAILS DRAWERS
         ========================================================== */}

      {/* 1. SELL PRODUCT FORM MODAL */}
      <Modal visible={isSellModalVisible} transparent animationType="slide" onRequestClose={() => setIsSellModalVisible(false)}>
        <View style={styles.slideModalOverlay}>
          <View style={[styles.slideModalContent, { backgroundColor: theme.colors.surface, borderColor: theme.colors.primary + '30' }]}>
            <View style={styles.modalHeaderRow}>
              <Text style={[styles.modalTitle, { color: theme.colors.textPrimary }]}>Créer une Annonce</Text>
              <Pressable onPress={() => setIsSellModalVisible(false)}>
                <Ionicons name="close-outline" size={24} color="#F7FAFF" />
              </Pressable>
            </View>

            <ScrollView contentContainerStyle={styles.formContainer} showsVerticalScrollIndicator={false}>
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: theme.colors.textSecondary }]}>Titre de l'article</Text>
                <View style={[
                  styles.inputContainer,
                  focusedField === 'sellTitle' && styles.inputContainerFocused,
                  errors.sellTitle && styles.inputContainerError
                ]}>
                  <Ionicons name="pricetag-outline" size={20} color={focusedField === 'sellTitle' ? '#2F80ED' : '#7891B280'} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.textInputWithIcon, { color: theme.colors.textPrimary }]}
                    placeholder="ex: Table en bois massif, Samsung S23..."
                    placeholderTextColor="#7891B280"
                    value={sellTitle}
                    onChangeText={(text) => {
                      setSellTitle(text);
                      clearError('sellTitle');
                    }}
                    onFocus={() => setFocusedField('sellTitle')}
                    onBlur={() => setFocusedField(null)}
                    maxLength={100}
                  />
                </View>
                {errors.sellTitle ? <Text style={styles.fieldError}>{errors.sellTitle}</Text> : null}
              </View>

              {/* Price & Condition */}
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>Prix (TND)</Text>
                  <View style={[
                    styles.inputContainer,
                    focusedField === 'sellPrice' && styles.inputContainerFocused,
                    errors.sellPrice && styles.inputContainerError
                  ]}>
                    <Ionicons name="cash-outline" size={20} color={focusedField === 'sellPrice' ? '#2F80ED' : '#7891B280'} style={styles.inputIcon} />
                    <TextInput
                      style={styles.textInputWithIcon}
                      placeholder="0.000"
                      placeholderTextColor="#7891B280"
                      value={sellPrice}
                      onChangeText={(text) => {
                        setSellPrice(format.tndAmount(text));
                        clearError('sellPrice');
                      }}
                      onFocus={() => setFocusedField('sellPrice')}
                      onBlur={() => setFocusedField(null)}
                      keyboardType="decimal-pad"
                    />
                  </View>
                  {errors.sellPrice ? <Text style={styles.fieldError}>{errors.sellPrice}</Text> : null}
                </View>

                <View style={[styles.inputGroup, { flex: 1.2 }]}>
                  <Text style={styles.inputLabel}>État de l'article</Text>
                  <View style={styles.badgeSelectorRow}>
                    {(['New', 'Used'] as const).map((cond) => {
                      const isActive = sellCondition === cond;
                      return (
                        <Pressable 
                          key={cond} 
                          style={[styles.badgeSelectorItem, isActive && styles.badgeSelectorItemActive, { flex: 1, alignItems: 'center' }]}
                          onPress={() => setSellCondition(cond)}
                        >
                          <Text style={[styles.badgeSelectorText, isActive && styles.badgeSelectorTextActive]}>
                            {cond === 'New' ? 'Neuf' : 'Occasion'}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              </View>

              {/* Category selector */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Catégorie</Text>
                <View style={styles.badgeSelectorRow}>
                  {CATEGORIES.slice(1).map((cat) => {
                    const isActive = sellCategory === cat;
                    return (
                      <Pressable 
                        key={cat} 
                        style={[styles.badgeSelectorItem, isActive && styles.badgeSelectorItemActive, { marginBottom: 6 }]}
                        onPress={() => setSellCategory(cat)}
                      >
                        <Text style={[styles.badgeSelectorText, isActive && styles.badgeSelectorTextActive]}>
                          {cat}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Description de l'article</Text>
                <View style={[
                  styles.inputContainer,
                  { minHeight: 48 },
                  focusedField === 'sellDesc' && styles.inputContainerFocused,
                  errors.sellDesc && styles.inputContainerError
                ]}>
                  <Ionicons name="create-outline" size={20} color={focusedField === 'sellDesc' ? '#2F80ED' : '#7891B280'} style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInputWithIcon}
                    placeholder="Décrivez l'état de l'article, ses caractéristiques..."
                    placeholderTextColor="#7891B280"
                    value={sellDesc}
                    onChangeText={(text) => {
                      setSellDesc(text);
                      clearError('sellDesc');
                    }}
                    onFocus={() => setFocusedField('sellDesc')}
                    onBlur={() => setFocusedField(null)}
                    maxLength={1000}
                  />
                </View>
                {errors.sellDesc ? <Text style={styles.fieldError}>{errors.sellDesc}</Text> : null}
              </View>

              {/* Location & Contact */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Emplacement de l'échange</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <View style={{ flex: 1, backgroundColor: '#091E36', borderRadius: 12, borderWidth: 1, borderColor: '#1B5B9F50', paddingHorizontal: 14, paddingVertical: 12, justifyContent: 'center' }}>
                    <Text style={{ color: '#F7FAFF', fontSize: 13 }} numberOfLines={1}>
                      {sellLocation.split('|')[0]}
                    </Text>
                  </View>
                  <Pressable 
                    style={{ backgroundColor: '#2F80ED20', borderColor: '#2F80ED', borderWidth: 1.2, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', gap: 6 }}
                    onPress={() => setIsMapVisible(true)}
                  >
                    <Ionicons name="map-outline" size={16} color="#2F80ED" />
                    <Text style={{ color: '#2F80ED', fontSize: 13, fontWeight: '700' }}>Carte 🗺️</Text>
                  </Pressable>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Numéro de Contact</Text>
                <View style={[
                  styles.inputContainer,
                  focusedField === 'sellContact' && styles.inputContainerFocused,
                  errors.sellContact && styles.inputContainerError
                ]}>
                  <Ionicons name="call-outline" size={20} color={focusedField === 'sellContact' ? '#2F80ED' : '#7891B280'} style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInputWithIcon}
                    placeholder="+216 22 123 456"
                    placeholderTextColor="#7891B280"
                    value={sellContact}
                    onChangeText={(text) => {
                      setSellContact(format.tunisianPhone(text));
                      clearError('sellContact');
                    }}
                    onFocus={() => setFocusedField('sellContact')}
                    onBlur={() => setFocusedField(null)}
                    keyboardType="phone-pad"
                  />
                </View>
                {errors.sellContact ? <Text style={styles.fieldError}>{errors.sellContact}</Text> : null}
              </View>

              {/* Multiple Images Selector with Previews */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Photos du produit ({sellImages.length})</Text>
                <View style={styles.imagesPickerRow}>
                  {/* Camera trigger */}
                  <Pressable style={styles.imagePickOption} onPress={() => handlePickImage(true)}>
                    <Ionicons name="camera-outline" size={20} color="#2F80ED" />
                    <Text style={styles.imagePickOptionText}>Caméra</Text>
                  </Pressable>

                  {/* Gallery trigger */}
                  <Pressable style={styles.imagePickOption} onPress={() => handlePickImage(false)}>
                    <Ionicons name="images-outline" size={20} color="#2F80ED" />
                    <Text style={styles.imagePickOptionText}>Galerie</Text>
                  </Pressable>
                </View>

                {/* Images Previews list */}
                {sellImages.length > 0 && (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.previewsScroll}>
                    {sellImages.map((uri, index) => (
                      <View key={index} style={styles.previewContainer}>
                        <Image source={{ uri }} style={styles.previewImg} />
                        <Pressable style={styles.removePreviewBtn} onPress={() => handleRemoveImage(index)}>
                          <Ionicons name="close" size={14} color="#F7FAFF" />
                        </Pressable>
                      </View>
                    ))}
                  </ScrollView>
                )}
              </View>

              <View style={styles.rowButtons}>
                <Pressable style={styles.buttonCancel} onPress={() => setIsSellModalVisible(false)}>
                  <Text style={styles.buttonCancelText}>Fermer</Text>
                </Pressable>
                <Pressable style={styles.buttonSubmit} onPress={handlePublishListing}>
                  <Text style={styles.buttonSubmitText}>Publier l'Annonce</Text>
                </Pressable>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* 2. PRODUCT DETAILS MODAL */}
      <Modal visible={isDetailModalVisible} transparent animationType="slide" onRequestClose={() => setIsDetailModalVisible(false)}>
        <View style={styles.slideModalOverlay}>
          {selectedProduct && (
            <View style={styles.slideModalContent}>
              <View style={styles.modalHeaderRow}>
                <Text style={styles.modalTitle} numberOfLines={1}>{selectedProduct.title}</Text>
                <Pressable onPress={() => setIsDetailModalVisible(false)}>
                  <Ionicons name="close-outline" size={24} color="#F7FAFF" />
                </Pressable>
              </View>

              <ScrollView contentContainerStyle={styles.detailScroll} showsVerticalScrollIndicator={false}>
                {/* Images Swiper Area */}
                <View style={styles.detailCarousel}>
                  <Image 
                    source={{ uri: selectedProduct.images[0] || 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?q=80&w=500' }} 
                    style={styles.carouselImg}
                  />
                  <View style={styles.carouselPills}>
                    <View style={styles.carouselPillActive} />
                  </View>
                </View>

                {/* Price, Condition, Favorites */}
                <View style={styles.priceRow}>
                  <Text style={styles.detailPrice}>{Number(selectedProduct.price).toFixed(3)} TND</Text>
                  
                  <View style={styles.detailActionsRow}>
                    <Pressable style={styles.detailActionBtn} onPress={() => toggleP2PFavorite(selectedProduct)}>
                      <Ionicons 
                        name={isP2PFavorited(selectedProduct.id!) ? "heart" : "heart-outline"} 
                        size={20} 
                        color={isP2PFavorited(selectedProduct.id!) ? "#FF5353" : "#F7FAFF"} 
                      />
                    </Pressable>

                    {selectedProduct.user_id === userId && (
                      <Pressable 
                        style={[styles.detailActionBtn, { backgroundColor: 'rgba(255, 83, 83, 0.15)', marginLeft: 8 }]} 
                        onPress={() => handleDeleteProduct(selectedProduct.id!)}
                      >
                        <Ionicons 
                          name="trash-outline" 
                          size={20} 
                          color="#FF5353" 
                        />
                      </Pressable>
                    )}
                  </View>
                </View>

                {/* Details Sheet */}
                <Card style={styles.detailSpecsCard}>
                  <View style={styles.specRow}>
                    <Text style={styles.specLabel}>État</Text>
                    <Text style={styles.specVal}>{selectedProduct.condition === 'New' ? 'Neuf' : 'Occasion'}</Text>
                  </View>
                  <View style={styles.specDivider} />
                  <View style={styles.specRow}>
                    <Text style={styles.specLabel}>Catégorie</Text>
                    <Text style={styles.specVal}>{selectedProduct.category}</Text>
                  </View>
                  <View style={styles.specDivider} />
                  <View style={styles.specRow}>
                    <Text style={styles.specLabel}>Emplacement</Text>
                    <Text style={styles.specVal}>{parseLocation(selectedProduct.location).address}</Text>
                  </View>
                </Card>

                {/* Mini OSM Map Display */}
                {parseLocation(selectedProduct.location).hasCoordinates && (
                  <View style={{ borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: '#1B5B9F40', height: 130, position: 'relative', marginTop: 4 }}>
                    <Image 
                      source={{ uri: `https://tile.openstreetmap.org/15/${Math.floor(((parseLocation(selectedProduct.location).lng + 180) / 360) * Math.pow(2, 15))}/${Math.floor(((1 - Math.log(Math.tan((parseLocation(selectedProduct.location).lat * Math.PI) / 180) + 1 / Math.cos((parseLocation(selectedProduct.location).lat * Math.PI) / 180)) / Math.PI) / 2) * Math.pow(2, 15))}.png` }}
                      style={{ width: '100%', height: '100%', opacity: 0.85 }}
                      resizeMode="cover"
                    />
                    <View style={{ ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(9, 30, 54, 0.25)' }} />
                    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center' }}>
                      <Ionicons name="location-sharp" size={32} color="#FFC244" />
                      <View style={{ width: 8, height: 3, borderRadius: 4, backgroundColor: 'rgba(0,0,0,0.4)', marginTop: -2 }} />
                    </View>
                    <View style={{ position: 'absolute', bottom: 8, right: 8, backgroundColor: 'rgba(9, 30, 54, 0.85)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, borderWidth: 1, borderColor: '#FFC24430' }}>
                      <Text style={{ color: '#FFC244', fontSize: 10, fontWeight: '700' }}>OSM Live Map</Text>
                    </View>
                  </View>
                )}

                {/* Description */}
                <View style={styles.descSection}>
                  <Text style={[styles.descSectionTitle, { color: theme.colors.textPrimary }]}>Description</Text>
                  <Text style={[styles.descText, { color: theme.colors.textSecondary }]}>{selectedProduct.description || "Aucune description fournie."}</Text>
                </View>

                {/* Seller Section */}
                <View style={styles.sellerSection}>
                  <Text style={styles.descSectionTitle}>Informations Vendeur</Text>
                  <View style={styles.sellerRow}>
                    <View style={styles.sellerAvatar}>
                      <Ionicons name="person-circle-outline" size={40} color="#7891B2" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.sellerName, { color: theme.colors.textPrimary }]}>Nour Ben Salah (Profil Vérifié)</Text>
                      <Text style={[styles.sellerLoc, { color: theme.colors.textSecondary }]}>Contact : {selectedProduct.contact_info}</Text>
                    </View>
                  </View>
                </View>

                {/* Actions Buttons */}
                <View style={styles.rowButtons}>
                  <Pressable 
                    style={[styles.buttonSubmit, { backgroundColor: '#FFC244', marginRight: 6 }]}
                    onPress={() => handleInitiateP2PBuy(selectedProduct)}
                  >
                    <Ionicons name="lock-closed" size={18} color="#000" style={{ marginRight: 6 }} />
                    <Text style={[styles.buttonSubmitText, { color: '#000', fontWeight: '800' }]}>Acheter (Escrow)</Text>
                  </Pressable>
                  
                  <Pressable 
                    style={[styles.buttonSubmit, { backgroundColor: '#12C979' }]}
                    onPress={() => openChatWithSeller(selectedProduct)}
                  >
                    <Ionicons name="chatbubbles-outline" size={18} color="#F7FAFF" style={{ marginRight: 6 }} />
                    <Text style={styles.buttonSubmitText}>Négocier</Text>
                  </Pressable>
                </View>
              </ScrollView>
            </View>
          )}
        </View>
      </Modal>

      {/* 3. FILTER & SEARCH DRAWER MODAL */}
      <Modal visible={isFilterModalVisible} transparent animationType="fade" onRequestClose={() => setIsFilterModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Filtrer les annonces</Text>

            {/* Location selection */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Gouvernorat / Emplacement</Text>
              <View style={styles.badgeSelectorRow}>
                {['Toute la Tunisie', 'Tunis', 'Sousse', 'Sfax', 'Djerba'].map((loc) => {
                  const isActive = selectedLocation === loc;
                  return (
                    <Pressable 
                      key={loc} 
                      style={[styles.badgeSelectorItem, isActive && styles.badgeSelectorItemActive]}
                      onPress={() => setSelectedLocation(loc)}
                    >
                      <Text style={[styles.badgeSelectorText, isActive && styles.badgeSelectorTextActive]}>{loc}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Condition selector */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>État de l'article</Text>
              <View style={styles.badgeSelectorRow}>
                {([
                  { value: 'All', label: 'Tous' },
                  { value: 'New', label: 'Neuf' },
                  { value: 'Used', label: 'Occasion' }
                ] as const).map((cond) => {
                  const isActive = filterCondition === cond.value;
                  return (
                    <Pressable 
                      key={cond.value} 
                      style={[styles.badgeSelectorItem, isActive && styles.badgeSelectorItemActive]}
                      onPress={() => setFilterCondition(cond.value)}
                    >
                      <Text style={[styles.badgeSelectorText, isActive && styles.badgeSelectorTextActive]}>{cond.label}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Sort order selection */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Trier par</Text>
              <View style={styles.badgeSelectorRow}>
                {([
                  { value: 'date', label: 'Plus récents' },
                  { value: 'priceAsc', label: 'Prix croissant' },
                  { value: 'priceDesc', label: 'Prix décroissant' }
                ] as const).map((sort) => {
                  const isActive = sortOption === sort.value;
                  return (
                    <Pressable 
                      key={sort.value} 
                      style={[styles.badgeSelectorItem, isActive && styles.badgeSelectorItemActive]}
                      onPress={() => setSortOption(sort.value)}
                    >
                      <Text style={[styles.badgeSelectorText, isActive && styles.badgeSelectorTextActive]}>{sort.label}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <View style={styles.rowButtons}>
              <Pressable style={styles.buttonSubmit} onPress={() => setIsFilterModalVisible(false)}>
                <Text style={styles.buttonSubmitText}>Appliquer</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* 4. CHAT WITH SELLER OVERLAY MODAL */}
      <Modal visible={isChatModalVisible} transparent animationType="slide" onRequestClose={() => setIsChatModalVisible(false)}>
        <SafeAreaView edges={['top']} style={styles.slideModalOverlay}>
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.slideModalContent}
          >
            <View style={styles.modalHeaderRow}>
              <View style={styles.chatTitleRow}>
                <Ionicons name="chatbubble-ellipses-outline" size={22} color="#2F80ED" />
                <Text style={styles.modalTitle}>Messagerie Marketplace</Text>
              </View>
              <Pressable onPress={() => setIsChatModalVisible(false)}>
                <Ionicons name="close-outline" size={24} color="#F7FAFF" />
              </Pressable>
            </View>

            {/* AI Bargaining Agent Banner & Controls */}
            <View style={{ backgroundColor: 'rgba(59, 130, 246, 0.08)', borderColor: '#3B82F630', borderWidth: 1, borderRadius: 16, padding: 14, marginHorizontal: 20, marginVertical: 10, gap: 10 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Ionicons name="sparkles" size={16} color="#FFC244" />
                  <Text style={{ fontSize: 13, fontWeight: '800', color: theme.colors.textPrimary }}>🤖 Négociateur IA Tunisien</Text>
                </View>
                <Pressable onPress={() => {
                  setAiBargainActive(!aiBargainActive);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }} style={{ backgroundColor: aiBargainActive ? '#22C55E' : '#334155', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 }}>
                  <Text style={{ fontSize: 10, fontWeight: '800', color: '#FFF' }}>{aiBargainActive ? "ACTIF ✓" : "ACTIVER"}</Text>
                </Pressable>
              </View>
              {aiBargainActive && (
                <View style={{ gap: 8 }}>
                  <Text style={{ fontSize: 11, color: '#B7C3D0' }}>
                    Saisissez votre budget maximum. Notre IA négociera automatiquement avec le vendeur en dialecte tunisien !
                  </Text>
                  <View style={{ flexDirection: 'row', gap: 10 }}>
                    <View style={{ flex: 1, backgroundColor: '#00000040', borderRadius: 12, paddingHorizontal: 12, height: 40, justifyContent: 'center' }}>
                      <TextInput
                        placeholder="Mon budget max (TND)"
                        placeholderTextColor="#7891B280"
                        style={{ color: '#F8FAFC', fontSize: 12 }}
                        keyboardType="decimal-pad"
                        value={aiBargainBudget}
                        onChangeText={setAiBargainBudget}
                        editable={!isBargaining}
                      />
                    </View>
                    <Pressable
                      onPress={runAIBargaining}
                      disabled={isBargaining}
                      style={{
                        backgroundColor: '#FFC244',
                        paddingHorizontal: 14,
                        borderRadius: 12,
                        alignItems: 'center',
                        justifyContent: 'center',
                        opacity: isBargaining ? 0.6 : 1
                      }}
                    >
                      <Text style={{ color: '#000', fontSize: 11, fontWeight: '800' }}>
                        {isBargaining ? "IA en négociation..." : "Négocier ⚡"}
                      </Text>
                    </Pressable>
                  </View>
                </View>
              )}
            </View>

            {/* Chat List */}
            <ScrollView contentContainerStyle={styles.chatScroll} showsVerticalScrollIndicator={false}>
              {chatHistory.map((msg, index) => {
                const isSeller = msg.sender === 'seller';
                const isOffer = msg.type === 'offer';
                return (
                  <View 
                    key={index} 
                    style={[styles.chatBubbleContainer, isSeller ? styles.bubbleLeft : styles.bubbleRight]}
                  >
                    {isOffer ? (
                      <View style={{
                        backgroundColor: 'rgba(9, 30, 54, 0.65)',
                        borderColor: msg.offerStatus === 'accepted' ? '#27AE60' : msg.offerStatus === 'declined' ? '#FF5353' : '#1B5B9F50',
                        borderWidth: 1.2,
                        borderRadius: 16,
                        padding: 12,
                        width: 230,
                        gap: 6
                      }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                          <Ionicons name="pricetag-outline" size={16} color="#ECC863" />
                          <Text style={{ fontSize: 13, fontWeight: '700', color: '#ECC863' }}>Offre de prix</Text>
                        </View>
                        <Text style={{ color: '#F7FAFF', fontSize: 16, fontWeight: '800' }}>
                          {msg.offerPrice?.toFixed(3)} TND
                        </Text>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 2 }}>
                          <Text style={{ fontSize: 11, color: '#7891B2' }}>Statut :</Text>
                          <Text style={{ 
                            fontSize: 11, 
                            fontWeight: '800', 
                            color: msg.offerStatus === 'accepted' ? '#27AE60' : msg.offerStatus === 'declined' ? '#FF5353' : '#7891B2' 
                          }}>
                            {msg.offerStatus === 'accepted' ? 'ACCEPTÉ ✓' : msg.offerStatus === 'declined' ? 'REFUSÉ ✗' : 'EN ATTENTE...'}
                          </Text>
                        </View>
                        {msg.offerStatus === 'accepted' && (
                          <Pressable 
                            style={{ 
                              backgroundColor: '#2F80ED', 
                              borderRadius: 10, 
                              paddingVertical: 8, 
                              alignItems: 'center', 
                              marginTop: 6 
                            }}
                            onPress={() => {
                              setIsChatModalVisible(false);
                              if (chatProduct) handleInitiateP2PBuy(chatProduct);
                            }}
                          >
                            <Text style={{ color: '#F7FAFF', fontSize: 12, fontWeight: '800' }}>Acheter à ce prix 💳</Text>
                          </Pressable>
                        )}
                      </View>
                    ) : (
                      <View style={[styles.chatBubble, isSeller ? styles.chatBubbleSeller : styles.chatBubbleUser]}>
                        <Text style={styles.chatBubbleText}>{msg.text}</Text>
                      </View>
                    )}
                    <Text style={styles.chatBubbleTime}>{msg.time}</Text>
                  </View>
                );
              })}
            </ScrollView>

            {/* Input Bar */}
            <View style={[styles.chatInputRow, { gap: 8 }]}>
              <Pressable 
                style={{ 
                  backgroundColor: 'rgba(236, 200, 99, 0.15)', 
                  borderColor: '#ECC863', 
                  borderWidth: 1, 
                  borderRadius: 14, 
                  width: 44, 
                  height: 44, 
                  justifyContent: 'center', 
                  alignItems: 'center' 
                }}
                onPress={() => {
                  if (!chatProduct) return;
                  const price10 = (chatProduct.price * 0.9).toFixed(3);
                  const price15 = (chatProduct.price * 0.85).toFixed(3);
                  const price25 = (chatProduct.price * 0.75).toFixed(3);
                  Alert.alert(
                    "Négocier le prix",
                    "Choisissez une proposition de prix rapide :",
                    [
                      { text: `${price10} TND (-10%)`, onPress: () => handleMakeOffer(price10) },
                      { text: `${price15} TND (-15%)`, onPress: () => handleMakeOffer(price15) },
                      { text: `${price25} TND (-25%)`, onPress: () => handleMakeOffer(price25) },
                      { text: "Annuler", style: "cancel" }
                    ]
                  );
                }}
              >
                <Ionicons name="pricetag" size={20} color="#ECC863" />
              </Pressable>

              <TextInput
                style={styles.chatInput}
                placeholder="Votre message..."
                placeholderTextColor="#7891B280"
                value={chatMessage}
                onChangeText={setChatMessage}
              />
              <Pressable style={styles.chatSendBtn} onPress={handleSendChatMessage}>
                <Ionicons name="send" size={16} color="#F7FAFF" />
              </Pressable>
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>

      {/* AddressPickerModal */}
      <AddressPickerModal
        visible={isMapVisible}
        onClose={() => setIsMapVisible(false)}
        onSaveAddress={(savedAddress) => {
          setSellLocation(`${savedAddress.address}|${savedAddress.latitude}|${savedAddress.longitude}`);
          setIsMapVisible(false);
        }}
      />

      {/* FavoritesModal */}
      <FavoritesModal 
        visible={isFavoritesVisible} 
        onClose={() => setIsFavoritesVisible(false)}
        onSelectProduct={(prod) => {
          setSelectedProduct(prod);
          setIsFavoritesVisible(false);
          setIsDetailModalVisible(true);
        }}
      />

      {/* FaceIdModal */}
      <FaceIdModal
        visible={isFaceIdVisible}
        onCancel={() => {
          setIsFaceIdVisible(false);
          setProductToBuy(null);
        }}
        onSuccess={handleP2PBuySuccess}
        amountText={`${productToBuy ? Number(productToBuy.price).toFixed(3) : '0.000'} TND`}
        restaurantName={productToBuy ? productToBuy.title : ''}
        paymentMethodText="SuperTounsi Wallet"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#030C16',
  },
  ambientGlow: {
    position: 'absolute',
    top: -50,
    right: -20,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: '#2F80ED',
    opacity: 0.12,
    shadowColor: '#2F80ED',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 50,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 10,
  },
  headerLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#7891B2',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#F7FAFF',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2F80ED',
    borderColor: '#6EA8FF40',
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 6,
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#F7FAFF',
  },
  searchBarContainer: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 20,
    marginVertical: 10,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#091E3680',
    borderColor: '#1B5B9F30',
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 46,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    color: '#F7FAFF',
    fontSize: 14,
  },
  filterTrigger: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: '#091E3680',
    borderColor: '#1B5B9F30',
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryScroll: {
    paddingHorizontal: 20,
    gap: 8,
    paddingBottom: 8,
  },
  catBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#091E36',
    borderWidth: 1,
    borderColor: '#1B5B9F30',
  },
  catBadgeActive: {
    backgroundColor: '#2F80ED',
    borderColor: '#2F80ED',
  },
  catText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#7891B2',
  },
  catTextActive: {
    color: '#F7FAFF',
  },
  feedScroll: {
    paddingHorizontal: 16,
    paddingBottom: 80,
  },
  feedRow: {
    justifyContent: 'space-between',
  },
  productCard: {
    width: '48%',
    backgroundColor: '#091E3660',
    borderColor: '#1B5B9F20',
    borderWidth: 1,
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
  },
  productImgContainer: {
    height: 120,
    backgroundColor: '#0A203E',
    position: 'relative',
  },
  productImg: {
    width: '100%',
    height: '100%',
  },
  condBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  condText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#F7FAFF',
  },
  favBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(3, 12, 22, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  productMeta: {
    padding: 12,
    gap: 4,
  },
  productPrice: {
    fontSize: 15,
    fontWeight: '800',
    color: '#ECC863',
  },
  productTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#F7FAFF',
  },
  locContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  productLoc: {
    fontSize: 11,
    color: '#7891B2',
  },
  placeholderContainer: {
    padding: 40,
    backgroundColor: '#091E3633',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1B5B9F1A',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginTop: 40,
    marginHorizontal: 20,
  },
  placeholderText: {
    color: '#7891B2',
    fontSize: 13,
    textAlign: 'center',
  },

  // Slide Overlay Modals
  slideModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(3, 12, 22, 0.85)',
    justifyContent: 'flex-end',
  },
  slideModalContent: {
    backgroundColor: '#0B2342',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    borderWidth: 1.2,
    borderColor: '#2F80ED40',
    maxHeight: '92%',
    padding: 24,
    gap: 16,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#1B5B9F2A',
    paddingBottom: 14,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#F7FAFF',
  },
  formContainer: {
    gap: 14,
    paddingBottom: 24,
  },
  inputGroup: {
    gap: 6,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#7891B2',
  },
  textInput: {
    backgroundColor: '#091E36',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1B5B9F50',
    color: '#F7FAFF',
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
  },
  textInputFocused: {
    borderColor: '#2F80ED',
  },
  textInputError: {
    borderColor: '#FF5353',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#091E36',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1B5B9F50',
    paddingHorizontal: 14,
    height: 48,
  },
  inputContainerFocused: {
    borderColor: '#2F80ED',
  },
  inputContainerError: {
    borderColor: '#FF5353',
  },
  inputIcon: {
    marginRight: 10,
  },
  textInputWithIcon: {
    flex: 1,
    color: '#F7FAFF',
    fontSize: 14,
    height: '100%',
  },
  fieldError: {
    color: '#FF5353',
    fontSize: 11,
    marginTop: 2,
  },
  formRow: {
    flexDirection: 'row',
    gap: 12,
  },
  badgeSelectorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  badgeSelectorItem: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#091E36',
    borderWidth: 1,
    borderColor: '#1B5B9F40',
  },
  badgeSelectorItemActive: {
    backgroundColor: '#2F80ED22',
    borderColor: '#2F80ED',
  },
  badgeSelectorText: {
    fontSize: 12,
    color: '#7891B2',
    fontWeight: '600',
  },
  badgeSelectorTextActive: {
    color: '#2F80ED',
    fontWeight: '700',
  },
  imagesPickerRow: {
    flexDirection: 'row',
    gap: 12,
  },
  imagePickOption: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#2F80ED15',
    borderColor: '#2F80ED40',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  imagePickOptionText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2F80ED',
  },
  previewsScroll: {
    flexDirection: 'row',
    marginTop: 8,
  },
  previewContainer: {
    width: 68,
    height: 68,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
    marginRight: 10,
    backgroundColor: '#071A31',
    borderWidth: 1,
    borderColor: '#1B5B9F40',
  },
  previewImg: {
    width: '100%',
    height: '100%',
  },
  removePreviewBtn: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#FF5353',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rowButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
    paddingBottom: 10,
  },
  buttonCancel: {
    flex: 1,
    borderColor: '#1B5B9F60',
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonCancelText: {
    color: '#7891B2',
    fontWeight: '600',
  },
  buttonSubmit: {
    flex: 1,
    backgroundColor: '#2F80ED',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  buttonSubmitText: {
    color: '#F7FAFF',
    fontWeight: '700',
  },

  // Detail Modal Specific
  detailScroll: {
    gap: 16,
    paddingBottom: 40,
  },
  detailCarousel: {
    height: 200,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#091E3660',
  },
  carouselImg: {
    width: '100%',
    height: '100%',
  },
  carouselPills: {
    position: 'absolute',
    bottom: 12,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  carouselPillActive: {
    width: 16,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#2F80ED',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailPrice: {
    fontSize: 24,
    fontWeight: '800',
    color: '#ECC863',
  },
  detailActionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  detailActionBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#091E3699',
    borderColor: '#1B5B9F40',
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailSpecsCard: {
    backgroundColor: '#091E3660',
    borderColor: '#1B5B9F20',
    borderWidth: 1,
    padding: 16,
    gap: 10,
  },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  specLabel: {
    fontSize: 13,
    color: '#7891B2',
    fontWeight: '500',
  },
  specVal: {
    fontSize: 13,
    color: '#F7FAFF',
    fontWeight: '700',
  },
  specDivider: {
    height: 0.5,
    backgroundColor: '#1B5B9F2A',
  },
  descSection: {
    gap: 6,
  },
  descSectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#F7FAFF',
  },
  descText: {
    fontSize: 13,
    color: '#7891B2',
    lineHeight: 18,
  },
  sellerSection: {
    gap: 8,
  },
  sellerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#091E3640',
    padding: 12,
    borderRadius: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: '#1B5B9F10',
  },
  sellerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sellerName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#F7FAFF',
  },
  sellerLoc: {
    fontSize: 11,
    color: '#7891B2',
    marginTop: 2,
  },

  // Filters Modal specific
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(3, 12, 22, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#0B2342',
    borderRadius: 24,
    borderWidth: 1.2,
    borderColor: '#2F80ED4D',
    padding: 24,
    width: '100%',
    maxWidth: 380,
    gap: 16,
  },

  // Messagerie / Chat elements
  chatTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  chatScroll: {
    gap: 12,
    paddingVertical: 10,
  },
  chatBubbleContainer: {
    maxWidth: '80%',
    marginBottom: 4,
  },
  bubbleLeft: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
  },
  bubbleRight: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  chatBubble: {
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  chatBubbleSeller: {
    backgroundColor: '#091E36',
    borderWidth: 1,
    borderColor: '#1B5B9F30',
  },
  chatBubbleUser: {
    backgroundColor: '#2F80ED',
  },
  chatBubbleText: {
    color: '#F7FAFF',
    fontSize: 14,
    lineHeight: 18,
  },
  chatBubbleTime: {
    fontSize: 10,
    color: '#7891B280',
    marginTop: 2,
  },
  chatInputRow: {
    flexDirection: 'row',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#1B5B9F2A',
    paddingTop: 12,
  },
  chatInput: {
    flex: 1,
    backgroundColor: '#091E36',
    borderColor: '#1B5B9F50',
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: '#F7FAFF',
    height: 44,
  },
  chatSendBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#2F80ED',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
