import Ionicons from "@expo/vector-icons/Ionicons";
import { useIsFocused } from "@react-navigation/native";
import * as Haptics from "expo-haptics";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Animated,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Card, StarField } from "@/src/components/ui";
import { useDb } from "@/src/hooks/use-db";
import {
    dbService,
    MarketplaceItem,
    MarketplaceSubscription,
    WalletCard,
} from "@/src/services/db-service";
import { useTheme } from "@/src/hooks/use-theme";
import { useFormValidation } from "@/src/hooks/use-form-validation";
import { format, V } from "@/src/utils/form-validation";
import { FaceIdModal } from "@/src/features/food-delivery/components/FaceIdModal";

export function MarketplaceHomeScreen({
  embedded = false,
}: {
  embedded?: boolean;
}) {
  const isFocused = useIsFocused();
  const { userId, isReady } = useDb();
  const theme = useTheme();
  const { errors, validate, clearError, clearAll } = useFormValidation();

  const [items, setItems] = useState<MarketplaceItem[]>([]);
  const [subscriptions, setSubscriptions] = useState<MarketplaceSubscription[]>(
    [],
  );
  const [cards, setCards] = useState<WalletCard[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals Visibility
  const [isPublishModalVisible, setIsPublishModalVisible] = useState(false);
  const [isCheckoutModalVisible, setIsCheckoutModalVisible] = useState(false);
  const [isFaceIdVisible, setIsFaceIdVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MarketplaceItem | null>(
    null,
  );

  // Publish Form State
  const [appTitle, setAppTitle] = useState("");
  const [appDesc, setAppDesc] = useState("");
  const [appPriceText, setAppPriceText] = useState("");
  const [appPriceAmount, setAppPriceAmount] = useState("");
  const [appIcon, setAppIcon] = useState("apps-outline");

  // Checkout Form State
  const [selectedCardId, setSelectedCardId] = useState<string>("");
  const [subDuration, setSubDuration] = useState<number>(1); // months

  // AI Tool Simulators State
  const [isToolModalVisible, setIsToolModalVisible] = useState(false);
  const [activeToolItem, setActiveToolItem] = useState<MarketplaceItem | null>(null);

  // Chrifa AI (Funny Coach)
  const [chrifaIncome, setChrifaIncome] = useState("1500");
  const [chrifaExpense, setChrifaExpense] = useState("1000");
  const [chrifaWastes, setChrifaWastes] = useState<string[]>([]);
  const [isVoiceRecording, setIsVoiceRecording] = useState(false);
  const voiceWaveAnim = useRef(new Animated.Value(1)).current;
  const [voiceTextResult, setVoiceTextResult] = useState<string | null>(null);

  // Tax Helper
  const [taxRevenue, setTaxRevenue] = useState("25000");
  const [taxRegime, setTaxRegime] = useState<"Forfaitaire" | "Reel">("Forfaitaire");
  const [taxChildren, setTaxChildren] = useState<number>(0);

  const startVoiceRecording = () => {
    setVoiceTextResult(null);
    setIsVoiceRecording(true);
    Animated.loop(
      Animated.sequence([
        Animated.timing(voiceWaveAnim, { toValue: 1.6, duration: 550, useNativeDriver: true }),
        Animated.timing(voiceWaveAnim, { toValue: 1.0, duration: 550, useNativeDriver: true }),
      ])
    ).start();

    setTimeout(async () => {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setIsVoiceRecording(false);

      const mocks = [
        {
          transcript: "Salaire mte3i 2400 DT, w nosrof karib 1800 DT kol chhar. W na9ad dima ndor fel taxis Bolt.",
          income: "2400",
          expense: "1800",
          wastes: ["taxis"]
        },
        {
          transcript: "Ena ndakhel 3500 DT. Ama kol youm nakol mlaoui dehors w nchri kafteji w café direct...",
          income: "3500",
          expense: "2200",
          wastes: ["kafteji", "coffee"]
        }
      ];

      const chosen = mocks[Math.floor(Math.random() * mocks.length)];
      setChrifaIncome(chosen.income);
      setChrifaExpense(chosen.expense);
      setChrifaWastes(chosen.wastes);
      setVoiceTextResult(`Entendu : "${chosen.transcript}"`);
    }, 2800);
  };

  const toggleWaste = (waste: string) => {
    if (chrifaWastes.includes(waste)) {
      setChrifaWastes(chrifaWastes.filter(w => w !== waste));
    } else {
      setChrifaWastes([...chrifaWastes, waste]);
    }
  };

  const getChrifaRoast = () => {
    const income = Number(chrifaIncome) || 0;
    const expense = Number(chrifaExpense) || 0;
    
    if (income === 0) return {
      roast: "Revenu non renseigné. Veuillez saisir un salaire mensuel valide pour démarrer l'analyse de votre budget.",
      tips: ["Saisissez vos revenus nets mensuels."]
    };
    
    const ratio = expense / income;
    let roast = "";
    let tips = [];
    
    if (ratio <= 0.3) {
      roast = "Excellent contrôle budgétaire! Votre taux d'épargne est supérieur à 70%. C'est idéal pour préparer des projets d'avenir ou faire face aux imprévus. 📈";
      tips.push("Comme on dit chez nous: 'Mesta7fed yel9a fi el-khsara'. Continuez ainsi!");
    } else if (ratio <= 0.75) {
      roast = "Votre budget est globalement équilibré. Cependant, optimiser vos petites dépenses quotidiennes (cafés réguliers, petits repas à emporter) pourrait libérer de l'épargne supplémentaire. ☕";
      tips.push("Astuce locale: Préparer sa propre nourriture (comme un bon plat maison) réduit le budget alimentation de 25% par rapport aux fast-foods.");
    } else if (ratio <= 1.0) {
      roast = "Attention, vous approchez de la limite de votre budget. Vos dépenses mensuelles consomment la quasi-totalité de vos revenus, limitant votre sécurité financière. ⚠️";
      tips.push("Réduisez l'utilisation des transports privés à la demande (ex: Taxis Bolt) qui pèsent lourd sur le budget transport tunisois.");
      tips.push("Consultez la section 'Smart Saving' pour automatiser une épargne dès le début du mois.");
    } else {
      roast = "Alerte Déficit! Vos dépenses dépassent vos revenus mensuels. Cette situation présente des risques importants d'endettement si elle n'est pas corrigée. 🛑";
      tips.push("Réduisez immédiatement les dépenses de confort non essentielles.");
      tips.push("Identifiez vos prélèvements automatiques et abonnements inutiles.");
      tips.push("Évitez le recours aux découverts bancaires.");
    }

    if (chrifaWastes.includes("taxis")) {
      tips.push("🚗 Transport: L'utilisation excessive des applications de taxi privé peut facilement vous coûter plus de 150 DT par mois. Privilégiez le covoiturage ou les transports communs lorsque possible.");
    }
    if (chrifaWastes.includes("kafteji")) {
      tips.push("🌯 Restauration: Les repas pris à l'extérieur quotidiennement représentent une fuite budgétaire majeure. Préparez des paniers repas.");
    }
    if (chrifaWastes.includes("coffee")) {
      tips.push("☕ Cafés récurrents: Acheter plusieurs boissons/cafés par jour représente un coût mensuel caché important.");
    }
    if (chrifaWastes.includes("fripe")) {
      tips.push("Shopping fripe compulsif: Bien que économique au coup par coup, accumuler des achats non nécessaires nuit à votre épargne active.");
    }

    return { roast, tips };
  };

  const calculateTunisianTax = () => {
    const revenue = Number(taxRevenue) || 0;
    let estimation = 0;
    let css = 0;
    let details = "";
    
    if (taxRegime === "Forfaitaire") {
      estimation = Math.max(revenue * 0.01, 150);
      css = Math.max(revenue * 0.005, 50);
      details = "Sous le régime forfaitaire tunisien, l'impôt est estimé à 1% du chiffre d'affaires annuel avec un minimum forfaitaire.";
    } else {
      const taxable = Math.max(revenue - 5000 - (taxChildren * 500), 0);
      if (taxable <= 5000) {
        estimation = 0;
      } else if (taxable <= 20000) {
        estimation = (taxable - 5000) * 0.26;
      } else if (taxable <= 30000) {
        estimation = 15000 * 0.26 + (taxable - 20000) * 0.28;
      } else {
        estimation = 15000 * 0.26 + 10000 * 0.28 + (taxable - 30000) * 0.32;
      }
      css = taxable * 0.0075;
      details = "Calculé avec le barème progressif de l'impôt sur le revenu des personnes physiques (IRPP) avec déduction pour enfants.";
    }
    
    return {
      tax: estimation,
      css,
      total: estimation + css,
      details
    };
  };

  const handleLaunchTool = (item: MarketplaceItem) => {
    setActiveToolItem(item);
    setIsToolModalVisible(true);
  };

  const loadMarketplaceData = async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const [catalogItems, userSubs, userCards] = await Promise.all([
        dbService.getMarketplaceItems(),
        dbService.getSubscriptions(userId),
        dbService.getCards(userId),
      ]);
      
      const mapped = catalogItems.map((item) => {
        if (item.title === 'Smart Commerce AI') {
          return {
            ...item,
            title: 'Mestahfed AI - Coach Budget',
            description: 'Un assistant budgétaire intelligent qui analyse vos dépenses mensuelles et vous donne des conseils malins basés sur le coût de la vie en Tunisie.',
            icon: 'trending-up-outline',
          };
        }
        return item;
      });

      setItems(mapped);
      setSubscriptions(userSubs);
      setCards(userCards);

      // Pre-select first card if available
      if (userCards.length > 0) {
        setSelectedCardId(userCards[0].id || "");
      }
    } catch (e) {
      console.error("Error loading marketplace data:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isReady && userId && isFocused) {
      loadMarketplaceData();
    }
  }, [isReady, userId, isFocused]);

  // Check if user has active subscription to this item
  const isSubscribed = (itemId: string) => {
    return subscriptions.some((sub) => sub.item_id === itemId);
  };

  // Publish App (Create CRUD)
  const handlePublishApp = async () => {
    const isValid = validate({
      appTitle: { value: appTitle, rules: [V.marketplaceTitle] },
      appDesc: { value: appDesc, rules: [V.marketplaceDescription] },
      appPriceText: { value: appPriceText, rules: [V.priceLabel] },
      appPriceAmount: { value: appPriceAmount, rules: [V.tndAmount({ min: 0.001, max: 99_999 })] },
    });
    if (!isValid) return;

    try {
      setLoading(true);

      const data = await dbService.createMarketplaceItem({
        title: appTitle.trim(),
        description: appDesc.trim(),
        price_text: appPriceText.trim(),
        price_amount: parseFloat(appPriceAmount),
        icon: appIcon,
      });

      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(
        "Succès",
        `Votre application "${data.title}" a été publiée avec succès !`,
      );

      // Reset
      setAppTitle("");
      setAppDesc("");
      setAppPriceText("");
      setAppPriceAmount("");
      setAppIcon("apps-outline");
      clearAll();
      setIsPublishModalVisible(false);
      loadMarketplaceData();
    } catch (e) {
      console.error("Failed to publish app:", e);
      Alert.alert("Erreur", "Impossible de publier l'application.");
    } finally {
      setLoading(false);
    }
  };

  // Open Checkout for Subscription
  const handlePressSubscribe = (item: MarketplaceItem) => {
    if (isSubscribed(item.id)) {
      Alert.alert("Info", `Vous êtes déjà abonné à "${item.title}".`);
      return;
    }
    setSelectedItem(item);
    setIsCheckoutModalVisible(true);
  };

  // Confirm Subscription (CRUD: Create Subscription, Update Card Balance, Create Transaction)
  const handleConfirmSubscription = () => {
    if (!userId || !selectedItem) return;

    const isValid = validate({
      selectedCardId: {
        value: selectedCardId,
        rules: [V.required('Moyen de paiement')],
      },
    });
    if (!isValid) return;

    const selectedCard = cards.find((c) => c.id === selectedCardId);
    if (!selectedCard) return;

    const totalCost = Number(selectedItem.price_amount) * subDuration;

    if (Number(selectedCard.balance) < totalCost) {
      Alert.alert(
        "Solde insuffisant",
        `Le solde de la carte sélectionnée (${Number(selectedCard.balance).toFixed(3)} TND) est inférieur au coût total de ${totalCost.toFixed(3)} TND.`,
      );
      return;
    }

    setIsFaceIdVisible(true);
  };

  const handlePerformSubscription = async () => {
    if (!userId || !selectedItem) return;
    setIsFaceIdVisible(false);

    const selectedCard = cards.find((c) => c.id === selectedCardId);
    if (!selectedCard) return;

    const totalCost = Number(selectedItem.price_amount) * subDuration;

    try {
      setLoading(true);

      // 1. Create the subscription (Create)
      await dbService.subscribeToItem(userId, selectedItem.id, subDuration);

      // 2. Deduct the cost from selected card (Update)
      const newBalance = Number(selectedCard.balance) - totalCost;
      await dbService.updateCardBalance(selectedCardId, newBalance);

      // 3. Log a debit transaction (Create)
      await dbService.createTransaction({
        user_id: userId,
        card_id: selectedCardId,
        title: `Abo. ${selectedItem.title}`,
        category: "Marketplace",
        amount: -totalCost,
        currency: "TND",
        icon: selectedItem.icon || "apps-outline",
      });

      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(
        "Abonnement Actif",
        `Vous êtes maintenant abonné à "${selectedItem.title}" pour ${subDuration} mois ! Le montant de ${totalCost.toFixed(3)} TND a été débité de votre carte.`,
      );

      // Reset
      setIsCheckoutModalVisible(false);
      setSelectedItem(null);
      setSubDuration(1);
      loadMarketplaceData(); // Reload
    } catch (e: any) {
      console.error("Subscription purchase failed:", e);
      const errMsg = e.response?.data?.message || e.message || String(e);
      Alert.alert("Erreur", `L'achat de l'abonnement a échoué: ${errMsg}`);
    } finally {
      setLoading(false);
    }
  };

  const content = (
    <>
      {!embedded && (
        <View style={styles.header}>
          <View>
            <Text style={[styles.headerLabel, { color: theme.colors.textSecondary }]}>
              AI MARKETPLACE
            </Text>
            <Text style={[styles.headerTitle, { color: theme.colors.textPrimary }]}>
              Services & Apps
            </Text>
          </View>

          <Pressable
            style={[
              styles.publishBtn,
              {
                backgroundColor: theme.colors.primary,
                borderColor: theme.colors.primary + "40",
              },
            ]}
            onPress={() => setIsPublishModalVisible(true)}
          >
            <Ionicons
              name="cloud-upload-outline"
              size={18}
              color={theme.colors.primaryOn}
            />
            <Text style={[styles.publishBtnText, { color: theme.colors.primaryOn }]}>
              Publier
            </Text>
          </Pressable>
        </View>
      )}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.sectionDesc, { color: theme.colors.textSecondary }]}>
          Explorez des applications intelligentes et des modules conçus pour
          doper vos commerces ou automatiser vos tâches.
        </Text>

        {loading && items.length === 0 ? (
          <ActivityIndicator
            size="large"
            color={theme.colors.primary}
            style={{ marginTop: 40 }}
          />
        ) : items.length > 0 ? (
          <View style={styles.itemsGrid}>
            {items.map((item) => {
              const active = isSubscribed(item.id);
              return (
                <Card
                  elevated
                  key={item.id}
                  style={[
                    styles.itemCard,
                    {
                      backgroundColor: 'rgba(47, 128, 237, 0.08)',
                      borderColor: 'rgba(47, 128, 237, 0.25)',
                      borderWidth: 1.2,
                      shadowColor: '#2F80ED',
                      shadowOpacity: 0.2,
                      shadowRadius: 12,
                      shadowOffset: { width: 0, height: 6 },
                      elevation: 6,
                    },
                  ]}
                >
                  <View style={styles.cardTop}>
                    <View
                      style={[
                        styles.iconShell,
                        { backgroundColor: theme.colors.primary + "15" },
                      ]}
                    >
                      <Ionicons
                        name={(item.icon || "apps-outline") as any}
                        size={26}
                        color={theme.colors.primary}
                      />
                    </View>

                    {active && (
                      <View
                        style={[
                          styles.activeBadge,
                          {
                            backgroundColor: theme.colors.success + "20",
                            borderColor: theme.colors.success + "40",
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.activeBadgeText,
                            { color: theme.colors.success },
                          ]}
                        >
                          ACTIF
                        </Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.cardInfo}>
                    <Text
                      style={[styles.itemTitle, { color: theme.colors.textPrimary }]}
                    >
                      {item.title}
                    </Text>
                    <Text
                      style={[styles.itemDesc, { color: theme.colors.textSecondary }]}
                    >
                      {item.description}
                    </Text>
                    <Text style={[styles.itemPrice, { color: "#ECC863" }]}>
                      {item.price_text}
                    </Text>
                  </View>

                  <Pressable
                    style={[
                      styles.subscribeBtn,
                      active && styles.subscribeBtnActive,
                      {
                        backgroundColor: theme.colors.surfaceSubtle,
                        borderColor: theme.colors.border,
                      },
                      active && {
                        backgroundColor: '#2F80ED20',
                        borderColor: '#2F80ED',
                      },
                    ]}
                    onPress={() => active ? handleLaunchTool(item) : handlePressSubscribe(item)}
                  >
                    <Text
                      style={[
                        styles.subscribeBtnText,
                        active && styles.subscribeBtnTextActive,
                        { color: theme.colors.primary },
                        active && { color: '#2F80ED' },
                      ]}
                    >
                      {active ? "Lancer l'outil ⚡" : "S'abonner"}
                    </Text>
                  </Pressable>
                </Card>
              );
            })}
          </View>
        ) : (
          <View
            style={[
              styles.placeholderContainer,
              {
                backgroundColor: theme.colors.surface + "33",
                borderColor: theme.colors.border + "1A",
              },
            ]}
          >
            <Ionicons
              name="apps-outline"
              size={40}
              color={theme.colors.textSecondary + "60"}
            />
            <Text
              style={[styles.placeholderText, { color: theme.colors.textSecondary }]}
            >
              Aucun service publié dans le catalogue.
            </Text>
          </View>
        )}
      </ScrollView>

      {/* ==========================================================
          MODALS & FORM INTERFACES
         ========================================================== */}

      {/* 1. PUBLISH APP FORM MODAL */}
      <Modal
        visible={isPublishModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsPublishModalVisible(false)}
      >
        <View
          style={[
            styles.modalOverlay,
            {
              backgroundColor:
                theme.mode === "dark"
                  ? "rgba(3, 12, 22, 0.85)"
                  : "rgba(248, 249, 250, 0.85)",
            },
          ]}
        >
          <View
            style={[
              styles.modalContent,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.primary + "4D",
              },
            ]}
          >
            <Text style={[styles.modalTitle, { color: theme.colors.textPrimary }]}>
              Publier un Service
            </Text>

            <ScrollView
              style={{ maxHeight: 350 }}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.formGap}>
                {/* Title */}
                <View style={styles.inputGroup}>
                  <Text
                    style={[styles.inputLabel, { color: theme.colors.textSecondary }]}
                  >
                    Titre de l'application
                  </Text>
                  <TextInput
                    style={[
                      styles.textInput,
                      {
                        backgroundColor: theme.colors.surfaceSubtle,
                        borderColor: errors.appTitle ? theme.colors.danger : theme.colors.border + "50",
                        color: theme.colors.textPrimary,
                      },
                    ]}
                    placeholder="ex: Smart Commerce AI"
                    placeholderTextColor={theme.colors.textSecondary + "80"}
                    value={appTitle}
                    onChangeText={(text) => {
                      setAppTitle(text);
                      clearError('appTitle');
                    }}
                    maxLength={80}
                  />
                  {errors.appTitle ? (
                    <Text style={[styles.fieldError, { color: theme.colors.danger }]}>{errors.appTitle}</Text>
                  ) : null}
                </View>

                {/* Description */}
                <View style={styles.inputGroup}>
                  <Text
                    style={[styles.inputLabel, { color: theme.colors.textSecondary }]}
                  >
                    Description détaillée
                  </Text>
                  <TextInput
                    style={[
                      styles.textInput,
                      {
                        minHeight: 60,
                        backgroundColor: theme.colors.surfaceSubtle,
                        borderColor: errors.appDesc ? theme.colors.danger : theme.colors.border + "50",
                        color: theme.colors.textPrimary,
                      },
                    ]}
                    placeholder="Décrivez en quelques mots ce que fait votre application..."
                    placeholderTextColor={theme.colors.textSecondary + "80"}
                    multiline
                    value={appDesc}
                    onChangeText={(text) => {
                      setAppDesc(text);
                      clearError('appDesc');
                    }}
                    maxLength={500}
                  />
                  {errors.appDesc ? (
                    <Text style={[styles.fieldError, { color: theme.colors.danger }]}>{errors.appDesc}</Text>
                  ) : null}
                </View>

                {/* Price text & Price numeric */}
                <View style={styles.formRow}>
                  <View style={[styles.inputGroup, { flex: 1.5 }]}>
                    <Text
                      style={[
                        styles.inputLabel,
                        { color: theme.colors.textSecondary },
                      ]}
                    >
                      Affichage du Tarif
                    </Text>
                    <TextInput
                      style={[
                        styles.textInput,
                        {
                          backgroundColor: theme.colors.surfaceSubtle,
                          borderColor: errors.appPriceText ? theme.colors.danger : theme.colors.border + "50",
                          color: theme.colors.textPrimary,
                        },
                      ]}
                      placeholder="ex: Dès 29 TND / mois"
                      placeholderTextColor={theme.colors.textSecondary + "80"}
                      value={appPriceText}
                      onChangeText={(text) => {
                        setAppPriceText(text);
                        clearError('appPriceText');
                      }}
                    />
                    {errors.appPriceText ? (
                      <Text style={[styles.fieldError, { color: theme.colors.danger }]}>{errors.appPriceText}</Text>
                    ) : null}
                  </View>

                  <View style={[styles.inputGroup, { flex: 1 }]}>
                    <Text
                      style={[
                        styles.inputLabel,
                        { color: theme.colors.textSecondary },
                      ]}
                    >
                      Coût Mensuel (TND)
                    </Text>
                    <TextInput
                      style={[
                        styles.textInput,
                        {
                          backgroundColor: theme.colors.surfaceSubtle,
                          borderColor: errors.appPriceAmount ? theme.colors.danger : theme.colors.border + "50",
                          color: theme.colors.textPrimary,
                        },
                      ]}
                      placeholder="29.000"
                      placeholderTextColor={theme.colors.textSecondary + "80"}
                      value={appPriceAmount}
                      onChangeText={(text) => {
                        setAppPriceAmount(format.tndAmount(text));
                        clearError('appPriceAmount');
                      }}
                      keyboardType="decimal-pad"
                    />
                    {errors.appPriceAmount ? (
                      <Text style={[styles.fieldError, { color: theme.colors.danger }]}>{errors.appPriceAmount}</Text>
                    ) : null}
                  </View>
                </View>

                {/* Icon Selection */}
                <View style={styles.inputGroup}>
                  <Text
                    style={[styles.inputLabel, { color: theme.colors.textSecondary }]}
                  >
                    Sélectionnez une Icône
                  </Text>
                  <View style={styles.badgeSelectorRow}>
                    {(
                      [
                        { name: "apps-outline", label: "App" },
                        { name: "calculator-outline", label: "Outil" },
                        { name: "rocket-outline", label: "Boost" },
                        { name: "shield-checkmark-outline", label: "Sécurité" },
                        { name: "trending-up-outline", label: "Analyse" },
                      ] as const
                    ).map((iconObj) => {
                      const isActive = appIcon === iconObj.name;
                      return (
                        <Pressable
                          key={iconObj.name}
                          style={[
                            styles.badgeSelectorItem,
                            isActive && styles.badgeSelectorItemActive,
                            {
                              backgroundColor: theme.colors.surfaceSubtle,
                              borderColor: theme.colors.border + "40",
                            },
                            isActive && {
                              backgroundColor: theme.colors.primary + "22",
                              borderColor: theme.colors.primary,
                            },
                          ]}
                          onPress={() => setAppIcon(iconObj.name)}
                        >
                          <Text
                            style={[
                              styles.badgeSelectorText,
                              isActive && styles.badgeSelectorTextActive,
                              { color: theme.colors.textSecondary },
                              isActive && { color: theme.colors.primary },
                            ]}
                          >
                            {iconObj.label}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              </View>
            </ScrollView>

            <View style={styles.rowButtons}>
              <Pressable
                style={[
                  styles.buttonCancel,
                  { borderColor: theme.colors.border + "60" },
                ]}
                onPress={() => setIsPublishModalVisible(false)}
              >
                <Text
                  style={[
                    styles.buttonCancelText,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  Annuler
                </Text>
              </Pressable>
              <Pressable
                style={[
                  styles.buttonSubmit,
                  { backgroundColor: theme.colors.primary },
                ]}
                onPress={handlePublishApp}
              >
                <Text
                  style={[styles.buttonSubmitText, { color: theme.colors.primaryOn }]}
                >
                  Publier
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* 2. SUBSCRIPTION CHECKOUT FORM MODAL */}
      <Modal
        visible={isCheckoutModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsCheckoutModalVisible(false)}
      >
        <View
          style={[
            styles.modalOverlay,
            {
              backgroundColor:
                theme.mode === "dark"
                  ? "rgba(3, 12, 22, 0.85)"
                  : "rgba(248, 249, 250, 0.85)",
            },
          ]}
        >
          <View
            style={[
              styles.modalContent,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.primary + "4D",
              },
            ]}
          >
            {selectedItem && (
              <View style={{ gap: 14 }}>
                <Text
                  style={[styles.modalTitle, { color: theme.colors.textPrimary }]}
                >
                  Souscrire à l'Abonnement
                </Text>

                <View
                  style={[
                    styles.checkoutSummaryCard,
                    {
                      backgroundColor: theme.colors.surfaceSubtle,
                      borderColor: theme.colors.border + "30",
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.checkoutAppTitle,
                      { color: theme.colors.textPrimary },
                    ]}
                  >
                    {selectedItem.title}
                  </Text>
                  <Text
                    style={[
                      styles.checkoutAppDesc,
                      { color: theme.colors.textSecondary },
                    ]}
                  >
                    {selectedItem.description}
                  </Text>
                  <Text style={[styles.checkoutAppCost, { color: "#ECC863" }]}>
                    Coût : {Number(selectedItem.price_amount).toFixed(3)} TND /
                    mois
                  </Text>
                </View>

                {/* Duration selector */}
                <View style={styles.inputGroup}>
                  <Text
                    style={[styles.inputLabel, { color: theme.colors.textSecondary }]}
                  >
                    Durée de l'abonnement
                  </Text>
                  <View style={styles.badgeSelectorRow}>
                    {(
                      [
                        { value: 1, label: "1 Mois" },
                        { value: 6, label: "6 Mois" },
                        { value: 12, label: "12 Mois" },
                      ] as const
                    ).map((dur) => {
                      const isActive = subDuration === dur.value;
                      return (
                        <Pressable
                          key={dur.value}
                          style={[
                            styles.badgeSelectorItem,
                            isActive && styles.badgeSelectorItemActive,
                            {
                              backgroundColor: theme.colors.surfaceSubtle,
                              borderColor: theme.colors.border + "40",
                            },
                            isActive && {
                              backgroundColor: theme.colors.primary + "22",
                              borderColor: theme.colors.primary,
                            },
                          ]}
                          onPress={() => setSubDuration(dur.value)}
                        >
                          <Text
                            style={[
                              styles.badgeSelectorText,
                              isActive && styles.badgeSelectorTextActive,
                              { color: theme.colors.textSecondary },
                              isActive && { color: theme.colors.primary },
                            ]}
                          >
                            {dur.label}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>

                {/* Card Payment Selector */}
                <View style={styles.inputGroup}>
                  <Text
                    style={[styles.inputLabel, { color: theme.colors.textSecondary }]}
                  >
                    Sélectionnez la carte à débiter
                  </Text>
                  {cards.length > 0 ? (
                    <View style={styles.badgeSelectorRow}>
                      {cards.map((card) => {
                        const isActive = selectedCardId === card.id;
                        return (
                          <Pressable
                            key={card.id}
                            style={[
                              styles.cardPaymentItem,
                              isActive && styles.cardPaymentItemActive,
                              {
                                backgroundColor: theme.colors.surfaceSubtle,
                                borderColor: theme.colors.border + "40",
                              },
                              isActive && {
                                backgroundColor: theme.colors.primary + "22",
                                borderColor: theme.colors.primary,
                              },
                            ]}
                            onPress={() => {
                              setSelectedCardId(card.id || "");
                              clearError('selectedCardId');
                            }}
                          >
                            <Text
                              style={[
                                styles.cardPaymentText,
                                isActive && styles.cardPaymentTextActive,
                                { color: theme.colors.textSecondary },
                                isActive && { color: theme.colors.textPrimary },
                              ]}
                            >
                              {card.card_type} (••••{" "}
                              {card.card_number.slice(-4)})
                            </Text>
                            <Text
                              style={[
                                styles.cardPaymentBalance,
                                { color: theme.colors.success },
                              ]}
                            >
                              {Number(card.balance).toFixed(3)} TND
                            </Text>
                          </Pressable>
                        );
                      })}
                    </View>
                  ) : (
                    <Text
                      style={[styles.noCardsText, { color: theme.colors.danger }]}
                    >
                      Aucune carte de paiement disponible. Ajoutez-en une dans
                      le portefeuille.
                    </Text>
                  )}
                  {errors.selectedCardId ? (
                    <Text style={[styles.fieldError, { color: theme.colors.danger }]}>
                      {errors.selectedCardId}
                    </Text>
                  ) : null}
                </View>

                {/* Cost Total */}
                <View
                  style={[
                    styles.totalRow,
                    { borderTopColor: theme.colors.border + "30" },
                  ]}
                >
                  <Text
                    style={[styles.totalLabel, { color: theme.colors.textPrimary }]}
                  >
                    Coût Total :
                  </Text>
                  <Text style={[styles.totalValue, { color: theme.colors.success }]}>
                    {(Number(selectedItem.price_amount) * subDuration).toFixed(
                      3,
                    )}{" "}
                    TND
                  </Text>
                </View>

                <View style={styles.rowButtons}>
                  <Pressable
                    style={[
                      styles.buttonCancel,
                      { borderColor: theme.colors.border + "60" },
                    ]}
                    onPress={() => {
                      setIsCheckoutModalVisible(false);
                      setSelectedItem(null);
                    }}
                  >
                    <Text
                      style={[
                        styles.buttonCancelText,
                        { color: theme.colors.textSecondary },
                      ]}
                    >
                      Annuler
                    </Text>
                  </Pressable>
                  <Pressable
                    style={[
                      styles.buttonSubmit,
                      cards.length === 0 && {
                        backgroundColor: theme.colors.textSecondary + "40",
                      },
                      { backgroundColor: theme.colors.primary },
                    ]}
                    disabled={cards.length === 0}
                    onPress={handleConfirmSubscription}
                  >
                    <Text
                      style={[
                        styles.buttonSubmitText,
                        { color: theme.colors.primaryOn },
                      ]}
                    >
                      Payer & S'abonner
                    </Text>
                  </Pressable>
                </View>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* FaceIdModal for AI Subscription */}
      <FaceIdModal
        visible={isFaceIdVisible}
        onCancel={() => setIsFaceIdVisible(false)}
        onSuccess={handlePerformSubscription}
        amountText={`${selectedItem ? (Number(selectedItem.price_amount) * subDuration).toFixed(3) : '0.000'} TND`}
        restaurantName={selectedItem ? selectedItem.title : ''}
        paymentMethodText={
          cards.find((c) => c.id === selectedCardId)
            ? `${cards.find((c) => c.id === selectedCardId)?.card_type} •••• ${cards.find((c) => c.id === selectedCardId)?.card_number.slice(-4)}`
            : 'SuperTounsi Wallet'
        }
      />

      {/* VOICE RECORDING OVERLAY MODAL */}
      <Modal visible={isVoiceRecording} transparent animationType="fade">
        <View style={[styles.modalOverlay, { backgroundColor: 'rgba(3, 12, 22, 0.92)' }]}>
          <View style={{ alignItems: 'center', gap: 20 }}>
            <Animated.View style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: 'rgba(47, 128, 237, 0.15)',
              justifyContent: 'center',
              alignItems: 'center',
              transform: [{ scale: voiceWaveAnim }]
            }}>
              <View style={{ width: 50, height: 50, borderRadius: 25, backgroundColor: '#2F80ED', justifyContent: 'center', alignItems: 'center' }}>
                <Ionicons name="mic" size={24} color="#F7FAFF" />
              </View>
            </Animated.View>
            <Text style={{ color: '#F7FAFF', fontSize: 16, fontWeight: '700' }}>Mestahfed AI à l'écoute...</Text>
            <Text style={{ color: '#7891B2', fontSize: 13 }}>Parlez en Derja (ex: "Salaire mte3i 2400...")</Text>
          </View>
        </View>
      </Modal>

      {/* 3. INTERACTIVE AI TOOL SIMULATOR MODAL */}
      <Modal
        visible={isToolModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsToolModalVisible(false)}
      >
        <View style={[styles.modalOverlay, { backgroundColor: 'rgba(3, 12, 22, 0.85)' }]}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.surface, borderColor: '#2F80ED40', width: '92%', maxHeight: '85%' }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: theme.colors.border + '30', paddingBottom: 12, marginBottom: 16 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Ionicons name={activeToolItem?.icon === 'chatbubbles-outline' ? 'chatbubble-ellipses' : 'calculator'} size={22} color="#2F80ED" />
                <Text style={[styles.modalTitle, { color: theme.colors.textPrimary }]}>
                  {activeToolItem?.title}
                </Text>
              </View>
              <Pressable onPress={() => setIsToolModalVisible(false)}>
                <Ionicons name="close-outline" size={24} color={theme.colors.textPrimary} />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {activeToolItem?.title.includes('Mestahfed') ? (
                // --- MESTAHFED AI TOOL VIEW ---
                <View style={{ gap: 16 }}>
                  {/* Voice assistant shortcut */}
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: theme.mode === 'dark' ? 'rgba(47, 128, 237, 0.08)' : 'rgba(47, 128, 237, 0.04)', borderColor: '#2F80ED33', borderWidth: 1, borderRadius: 14, padding: 12, marginBottom: 4 }}>
                    <Text style={{ fontSize: 12, color: theme.colors.textSecondary, flex: 1, marginRight: 8, fontStyle: voiceTextResult ? 'italic' : 'normal' }}>
                      {voiceTextResult || "Parlez en Derja pour remplir votre budget automatiquement !"}
                    </Text>
                    <Pressable
                      onPress={startVoiceRecording}
                      style={{
                        backgroundColor: '#2F80ED',
                        borderRadius: 10,
                        paddingHorizontal: 12,
                        paddingVertical: 8,
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 6
                      }}
                    >
                      <Ionicons name="mic-outline" size={16} color="#F7FAFF" />
                      <Text style={{ color: '#F7FAFF', fontSize: 12, fontWeight: '700' }}>Dicter</Text>
                    </Pressable>
                  </View>

                  <Text style={{ color: theme.colors.textSecondary, fontSize: 13, lineHeight: 18 }}>
                    Entrez votre budget mensuel et laissez Mestahfed AI analyser l'équilibre de votre trésorerie avec des recommandations locales.
                  </Text>

                  {/* Input Income */}
                  <View style={{ gap: 6 }}>
                    <Text style={{ fontSize: 12, fontWeight: '600', color: theme.colors.textSecondary }}>Mon Salaire / Revenu (TND)</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.surfaceSubtle, borderRadius: 12, borderWidth: 1, borderColor: theme.colors.border + '50', paddingHorizontal: 12, height: 44 }}>
                      <Ionicons name="cash-outline" size={18} color="#7891B2" style={{ marginRight: 8 }} />
                      <TextInput
                        style={{ flex: 1, color: theme.colors.textPrimary, fontSize: 14 }}
                        value={chrifaIncome}
                        onChangeText={setChrifaIncome}
                        keyboardType="numeric"
                        placeholder="ex: 1500"
                        placeholderTextColor="#7891B280"
                      />
                    </View>
                  </View>

                  {/* Input Expenses */}
                  <View style={{ gap: 6 }}>
                    <Text style={{ fontSize: 12, fontWeight: '600', color: theme.colors.textSecondary }}>Mes Dépenses estimées (TND)</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.surfaceSubtle, borderRadius: 12, borderWidth: 1, borderColor: theme.colors.border + '50', paddingHorizontal: 12, height: 44 }}>
                      <Ionicons name="wallet-outline" size={18} color="#7891B2" style={{ marginRight: 8 }} />
                      <TextInput
                        style={{ flex: 1, color: theme.colors.textPrimary, fontSize: 14 }}
                        value={chrifaExpense}
                        onChangeText={setChrifaExpense}
                        keyboardType="numeric"
                        placeholder="ex: 1000"
                        placeholderTextColor="#7891B280"
                      />
                    </View>
                  </View>

                  {/* Top Wasteful Habits Selectors */}
                  <View style={{ gap: 6 }}>
                    <Text style={{ fontSize: 12, fontWeight: '600', color: theme.colors.textSecondary }}>Mes "Fdhaya7" (Dépenses futiles) :</Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                      {[
                        { key: 'taxis', label: 'Taxis Bolt 🚗' },
                        { key: 'kafteji', label: 'Kafteji/Mlaoui dehors 🌯' },
                        { key: 'coffee', label: 'Café Direct ☕' },
                        { key: 'fripe', label: 'Shopping Fripe 👕' }
                      ].map((w) => {
                        const isSelected = chrifaWastes.includes(w.key);
                        return (
                          <Pressable
                            key={w.key}
                            onPress={() => toggleWaste(w.key)}
                            style={{
                              paddingHorizontal: 10,
                              paddingVertical: 6,
                              borderRadius: 8,
                              borderWidth: 1,
                              backgroundColor: isSelected ? 'rgba(235, 87, 87, 0.15)' : theme.colors.surfaceSubtle,
                              borderColor: isSelected ? '#EB5757' : theme.colors.border + '40'
                            }}
                          >
                            <Text style={{ fontSize: 11, fontWeight: '600', color: isSelected ? '#EB5757' : theme.colors.textSecondary }}>
                              {w.label}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </View>
                  </View>

                  {/* MESTAHFED CHATBUBBLE ANALYSIS BOX */}
                  <View style={{ backgroundColor: 'rgba(47, 128, 237, 0.08)', borderColor: '#2F80ED50', borderWidth: 1.2, borderRadius: 16, padding: 16, marginTop: 8 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: '#2F80ED', alignItems: 'center', justifyContent: 'center' }}>
                        <Ionicons name="analytics-outline" size={16} color="#F7FAFF" />
                      </View>
                      <Text style={{ fontWeight: '700', fontSize: 13, color: '#2F80ED' }}>Mestahfed AI Budget Coach</Text>
                    </View>
                    
                    <Text style={{ color: theme.colors.textPrimary, fontSize: 14, lineHeight: 20, marginBottom: 12 }}>
                      {getChrifaRoast().roast}
                    </Text>

                    {getChrifaRoast().tips.length > 0 && (
                      <View style={{ borderTopWidth: 1, borderTopColor: '#2F80ED20', paddingTop: 10 }}>
                        <Text style={{ fontWeight: '600', fontSize: 11, color: '#2F80ED', marginBottom: 6 }}>Conseils d'optimisation Mestahfed :</Text>
                        {getChrifaRoast().tips.map((tip, idx) => (
                          <Text key={idx} style={{ color: theme.colors.textSecondary, fontSize: 12, marginBottom: 4 }}>
                            • {tip}
                          </Text>
                        ))}
                      </View>
                    )}
                  </View>
                </View>
              ) : (
                // --- TUNISIAN TAX HELPER VIEW ---
                <View style={{ gap: 16 }}>
                  <Text style={{ color: theme.colors.textSecondary, fontSize: 13, lineHeight: 18 }}>
                    Simulez votre impôt annuel selon les règles fiscales en vigueur en Tunisie.
                  </Text>

                  {/* Revenue Input */}
                  <View style={{ gap: 6 }}>
                    <Text style={{ fontSize: 12, fontWeight: '600', color: theme.colors.textSecondary }}>Chiffre d'Affaires / Revenu Annuel (TND)</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.surfaceSubtle, borderRadius: 12, borderWidth: 1, borderColor: theme.colors.border + '50', paddingHorizontal: 12, height: 44 }}>
                      <Ionicons name="stats-chart-outline" size={18} color="#7891B2" style={{ marginRight: 8 }} />
                      <TextInput
                        style={{ flex: 1, color: theme.colors.textPrimary, fontSize: 14 }}
                        value={taxRevenue}
                        onChangeText={setTaxRevenue}
                        keyboardType="numeric"
                        placeholder="ex: 25000"
                        placeholderTextColor="#7891B280"
                      />
                    </View>
                  </View>

                  {/* Regime Type Selection */}
                  <View style={{ gap: 6 }}>
                    <Text style={{ fontSize: 12, fontWeight: '600', color: theme.colors.textSecondary }}>Régime Fiscal</Text>
                    <View style={{ flexDirection: 'row', gap: 10 }}>
                      {[
                        { value: 'Forfaitaire', label: 'Régime Forfaitaire' },
                        { value: 'Reel', label: 'Régime Réel' }
                      ].map((reg) => {
                        const isActive = taxRegime === reg.value;
                        return (
                          <Pressable
                            key={reg.value}
                            onPress={() => setTaxRegime(reg.value as any)}
                            style={{
                              flex: 1,
                              paddingVertical: 10,
                              alignItems: 'center',
                              borderRadius: 10,
                              borderWidth: 1,
                              backgroundColor: isActive ? 'rgba(47, 128, 237, 0.15)' : theme.colors.surfaceSubtle,
                              borderColor: isActive ? '#2F80ED' : theme.colors.border + '40'
                            }}
                          >
                            <Text style={{ fontSize: 12, fontWeight: '700', color: isActive ? '#2F80ED' : theme.colors.textSecondary }}>
                              {reg.label}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </View>
                  </View>

                  {/* Stepper Children */}
                  {taxRegime === 'Reel' && (
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: theme.colors.surfaceSubtle, padding: 12, borderRadius: 12 }}>
                      <View>
                        <Text style={{ fontWeight: '600', fontSize: 12, color: theme.colors.textPrimary }}>Nombre d'enfants à charge</Text>
                        <Text style={{ fontSize: 10, color: theme.colors.textSecondary }}>Défiscalisation de 500 TND par enfant</Text>
                      </View>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                        <Pressable onPress={() => setTaxChildren(Math.max(0, taxChildren - 1))} style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: theme.colors.border + '40', alignItems: 'center', justifyContent: 'center' }}>
                          <Text style={{ fontWeight: '700', color: theme.colors.textPrimary }}>-</Text>
                        </Pressable>
                        <Text style={{ fontWeight: '700', fontSize: 14, color: theme.colors.textPrimary }}>{taxChildren}</Text>
                        <Pressable onPress={() => setTaxChildren(Math.min(4, taxChildren + 1))} style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: theme.colors.border + '40', alignItems: 'center', justifyContent: 'center' }}>
                          <Text style={{ fontWeight: '700', color: theme.colors.textPrimary }}>+</Text>
                        </Pressable>
                      </View>
                    </View>
                  )}

                  {/* CALCULATOR RESULTS CARD */}
                  <View style={{ backgroundColor: 'rgba(39, 174, 96, 0.08)', borderColor: '#27AE6050', borderWidth: 1.2, borderRadius: 16, padding: 16, marginTop: 8, gap: 10 }}>
                    <Text style={{ fontWeight: '700', fontSize: 13, color: '#27AE60' }}>Estimation des Impôts</Text>
                    
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                      <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>Impôt sur le Revenu :</Text>
                      <Text style={{ fontWeight: '700', fontSize: 13, color: theme.colors.textPrimary }}>{calculateTunisianTax().tax.toFixed(3)} TND</Text>
                    </View>

                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                      <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>Cotisation Sociale (CSS) :</Text>
                      <Text style={{ fontWeight: '700', fontSize: 13, color: theme.colors.textPrimary }}>{calculateTunisianTax().css.toFixed(3)} TND</Text>
                    </View>

                    <View style={{ height: 1, backgroundColor: '#27AE6020' }} />

                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                      <Text style={{ fontWeight: '700', color: theme.colors.textPrimary, fontSize: 13 }}>Total Dû à l'État :</Text>
                      <Text style={{ fontWeight: '800', fontSize: 15, color: '#27AE60' }}>{calculateTunisianTax().total.toFixed(3)} TND</Text>
                    </View>

                    <Text style={{ color: theme.colors.textSecondary, fontSize: 11, lineHeight: 15, fontStyle: 'italic', marginTop: 4 }}>
                      {calculateTunisianTax().details}
                    </Text>
                  </View>
                </View>
              )}
            </ScrollView>

            <Pressable
              style={[styles.buttonSubmit, { backgroundColor: '#2F80ED', width: '100%', marginTop: 20 }]}
              onPress={() => setIsToolModalVisible(false)}
            >
              <Text style={[styles.buttonSubmitText, { color: '#F7FAFF' }]}>
                Fermer l'outil
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );

  if (embedded) {
    return content;
  }

  return (
    <SafeAreaView
      edges={["top"]}
      style={[styles.safeArea, { backgroundColor: theme.colors.background }]}
    >
      <StatusBar style={theme.mode === "dark" ? "light" : "dark"} />
      {theme.mode === "dark" && <StarField />}

      {/* Ambient header glow */}
      <View
        style={[
          styles.ambientGlow,
          { backgroundColor: theme.colors.primary, shadowColor: theme.colors.primary },
        ]}
      />

      {content}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  ambientGlow: {
    position: "absolute",
    top: -50,
    left: -20,
    width: 200,
    height: 200,
    borderRadius: 100,
    opacity: 0.15,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 50,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 10,
  },
  headerLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "800",
  },
  publishBtn: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 8,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  publishBtnText: {
    fontSize: 13,
    fontWeight: "700",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 40,
    gap: 20,
  },
  sectionDesc: {
    fontSize: 14,
    lineHeight: 20,
  },
  itemsGrid: {
    gap: 16,
  },
  itemCard: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 20,
    gap: 14,
  },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  iconShell: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  activeBadge: {
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  activeBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  cardInfo: {
    gap: 6,
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  itemDesc: {
    fontSize: 13,
    lineHeight: 18,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: "600",
    marginTop: 4,
  },
  subscribeBtn: {
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  subscribeBtnActive: {},
  subscribeBtnText: {
    fontWeight: "700",
    fontSize: 14,
  },
  subscribeBtnTextActive: {},
  placeholderContainer: {
    padding: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    marginTop: 20,
  },
  placeholderText: {
    fontSize: 13,
    textAlign: "center",
  },

  // Modal forms styles (consistent with wallet modals)
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    borderRadius: 24,
    borderWidth: 1.2,
    padding: 24,
    width: "100%",
    maxWidth: 380,
    gap: 16,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 4,
  },
  formGap: {
    gap: 14,
  },
  inputGroup: {
    gap: 6,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: "600",
  },
  textInput: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
  },
  fieldError: {
    fontSize: 11,
    marginTop: 2,
  },
  formRow: {
    flexDirection: "row",
    gap: 12,
  },
  badgeSelectorRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 2,
  },
  badgeSelectorItem: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  badgeSelectorItemActive: {},
  badgeSelectorText: {
    fontSize: 12,
    fontWeight: "600",
  },
  badgeSelectorTextActive: {
    fontWeight: "700",
  },
  rowButtons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  buttonCancel: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonCancelText: {
    fontWeight: "600",
  },
  buttonSubmit: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonSubmitText: {
    fontWeight: "700",
  },

  // Checkout specific styles
  checkoutSummaryCard: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 16,
    gap: 4,
  },
  checkoutAppTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  checkoutAppDesc: {
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 6,
  },
  checkoutAppCost: {
    fontSize: 13,
    fontWeight: "600",
  },
  cardPaymentItem: {
    width: "100%",
    borderRadius: 12,
    padding: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardPaymentItemActive: {},
  cardPaymentText: {
    fontSize: 12,
    fontWeight: "600",
  },
  cardPaymentTextActive: {
    fontWeight: "700",
  },
  cardPaymentBalance: {
    fontSize: 12,
    fontWeight: "600",
  },
  noCardsText: {
    fontSize: 12,
    lineHeight: 16,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    paddingTop: 12,
    marginTop: 4,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: "600",
  },
  totalValue: {
    fontSize: 18,
    fontWeight: "800",
  },
});
