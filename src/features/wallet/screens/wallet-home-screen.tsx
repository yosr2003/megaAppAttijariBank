import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Pressable, ScrollView, Alert, ActivityIndicator, Modal, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as Haptics from 'expo-haptics';
import { useIsFocused } from '@react-navigation/native';

import { StarField, TransactionRow } from '@/src/components/ui';
import { DocumentCard } from '../components/document-card';
import { useDb } from '@/src/hooks/use-db';
import { useFormValidation } from '@/src/hooks/use-form-validation';
import { dbService, WalletCard, WalletTransaction, WalletDocument } from '@/src/services/db-service';
import { useTheme } from '@/src/hooks/use-theme';
import { format, V } from '@/src/utils/form-validation';
import { WalletReceiptModal, ReceiptDetails } from '../components/WalletReceiptModal';

export function WalletHomeScreen() {
  const router = useRouter();
  const isFocused = useIsFocused();
  const { userId, isReady } = useDb();
  const theme = useTheme();
  const { errors, validate, clearError, clearAll } = useFormValidation();

  const [activeTab, setActiveTab] = useState<'Identité' | 'Cartes' | 'Transactions'>('Cartes');
  const [payMethod, setPayMethod] = useState<'Pay' | 'GPay'>('Pay');

  const [cards, setCards] = useState<WalletCard[]>([]);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [documents, setDocuments] = useState<WalletDocument[]>([]);
  const [selectedTx, setSelectedTx] = useState<WalletTransaction | null>(null);
  const [loading, setLoading] = useState(true);

  // Modal Visibility States
  const [isSelectTypeModalVisible, setIsSelectTypeModalVisible] = useState(false);
  const [isCardModalVisible, setIsCardModalVisible] = useState(false);
  const [isDocModalVisible, setIsDocModalVisible] = useState(false);

  // Card Form State
  const [cardNumber, setCardNumber] = useState('');
  const [cardholderName, setCardholderName] = useState('Nour Ben Salah');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardType, setCardType] = useState<'Platinum' | 'Gold' | 'Virtual'>('Virtual');
  const [cardBalance, setCardBalance] = useState('');

  // Document Form State
  const [docTitle, setDocTitle] = useState('');
  const [docSubtitle, setDocSubtitle] = useState('');
  const [docType, setDocType] = useState<'CIN' | 'Passport' | 'Permis' | 'Facture' | 'Assurance' | 'Contrat' | 'Autre'>('CIN');
  const [docStatus, setDocStatus] = useState<'Verified' | 'Pending'>('Pending');

  // Fetch all locally stored wallet data
  const loadWalletData = async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const [userCards, userTransactions, userDocs] = await Promise.all([
        dbService.getCards(userId),
        dbService.getTransactions(userId),
        dbService.getDocuments(userId)
      ]);
      setCards(userCards);
      setTransactions(userTransactions);
      setDocuments(userDocs);
    } catch (e) {
      console.error("Error loading wallet database data:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isReady && userId && isFocused) {
      loadWalletData();
    }
  }, [isReady, userId, isFocused]);

  // Sum up all card balances
  const totalBalance = cards.reduce((sum, card) => sum + Number(card.balance), 0);
  const activeCardsCount = cards.filter(c => c.status === 'active').length;

  // Handle "+" trigger
  const handlePressPlus = () => {
    setIsSelectTypeModalVisible(true);
  };

  // Save a newly created card locally
  const handleSubmitCard = async () => {
    if (!userId) return;

    const isValid = validate({
      cardNumber: { value: cardNumber, rules: [V.cardNumber] },
      cardholderName: { value: cardholderName, rules: [V.cardholderName] },
      cardExpiry: { value: cardExpiry, rules: [V.cardExpiry] },
      cardBalance: { value: cardBalance, rules: [V.tndAmount({ min: 0, allowZero: true, max: 999_999_999 })] },
    });
    if (!isValid) return;

    try {
      setLoading(true);

      const newCard = await dbService.createCard({
        user_id: userId,
        card_number: cardNumber.replace(/\s/g, ''),
        cardholder_name: cardholderName.trim(),
        expiry_date: cardExpiry,
        card_type: cardType,
        status: 'active',
        balance: parseFloat(cardBalance),
      });

      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(
        "Carte Ajoutée",
        `Votre carte ${newCard.card_type} (•••• ${newCard.card_number.slice(-4)}) a été enregistrée avec succès !`
      );
      
      // Reset Form & Modals
      setCardNumber('');
      setCardExpiry('');
      setCardBalance('');
      setCardType('Virtual');
      clearAll();
      setIsCardModalVisible(false);
      loadWalletData();
    } catch (e) {
      console.error("Failed to add card:", e);
      Alert.alert("Erreur", "Impossible de créer la carte.");
    } finally {
      setLoading(false);
    }
  };

  // Helper to map category selection to vector icon
  const getIconForDocType = (type: string) => {
    switch (type) {
      case 'CIN': return 'card-outline';
      case 'Passport': return 'airplane-outline';
      case 'Permis': return 'car-outline';
      case 'Facture': return 'receipt-outline';
      case 'Assurance': return 'shield-checkmark-outline';
      case 'Contrat': return 'briefcase-outline';
      default: return 'document-text-outline';
    }
  };

  // Save a newly created document locally
  const handleSubmitDocument = async () => {
    if (!userId) return;

    const isValid = validate({
      docTitle: { value: docTitle, rules: [V.documentTitle] },
      docSubtitle: { value: docSubtitle, rules: [V.documentSubtitle(docType)] },
    });
    if (!isValid) return;

    try {
      setLoading(true);

      const newDoc = await dbService.createDocument({
        user_id: userId,
        title: docTitle.trim(),
        subtitle: docSubtitle.trim() || null,
        status: docStatus,
        icon: getIconForDocType(docType)
      });

      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(
        "Document Enregistré",
        `Le document "${newDoc.title}" a été ajouté à votre portefeuille !`
      );

      // Reset Form & Modals
      setDocTitle('');
      setDocSubtitle('');
      setDocType('CIN');
      setDocStatus('Pending');
      clearAll();
      setIsDocModalVisible(false);
      loadWalletData();
    } catch (e) {
      console.error("Failed to add document:", e);
      Alert.alert("Erreur", "Impossible de sauvegarder le document.");
    } finally {
      setLoading(false);
    }
  };

  // Delete Card (Delete CRUD)
  const handleLongPressCard = (card: WalletCard) => {
    if (!card.id) return;
    Alert.alert(
      "Supprimer la carte",
      `Voulez-vous vraiment supprimer la carte ${card.card_type} (${card.card_number.slice(-4)}) ?`,
      [
        { text: "Annuler", style: "cancel" },
        { 
          text: "Supprimer", 
          style: "destructive", 
          onPress: async () => {
            try {
              setLoading(true);
              await dbService.deleteCard(card.id!);
              await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
              loadWalletData();
            } catch (e) {
              console.error("Failed to delete card:", e);
              Alert.alert("Erreur", "Impossible de supprimer la carte.");
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  // Contactless Pay Trigger (Update Card Balance & Create Transaction CRUD)
  const triggerNFCScan = async () => {
    if (cards.length === 0) {
      Alert.alert("Paiement Rapide", "Aucune carte disponible pour payer.");
      return;
    }
    
    const activeCard = cards[0]; // Use primary card
    if (activeCard.balance < 15.000) {
      Alert.alert("Solde insuffisant", "Le solde de votre carte principale est insuffisant.");
      return;
    }

    try {
      setLoading(true);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      const purchaseAmount = 15.000;
      
      // 1. Create debit transaction (Create)
      await dbService.createTransaction({
        user_id: userId!,
        card_id: activeCard.id,
        title: 'Café Sidi Bou',
        category: 'Food & drink',
        amount: -purchaseAmount,
        currency: 'TND',
        icon: 'cafe-outline'
      });

      // 2. Update card balance (Update)
      const newBalance = Number(activeCard.balance) - purchaseAmount;
      await dbService.updateCardBalance(activeCard.id!, newBalance);

      Alert.alert(
        "Paiement Effectué",
        `Achat de ${purchaseAmount.toFixed(3)} TND au Café Sidi Bou réglé avec succès avec votre carte principale !`
      );
      
      // Reload states
      loadWalletData();
    } catch (e) {
      console.error("NFC payment failed:", e);
      Alert.alert("Erreur", "Paiement échoué.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView edges={['top']} style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      <StatusBar style={theme.mode === 'dark' ? 'light' : 'dark'} />
      <StarField />
      
      {/* Soft top-right ambient glow */}
      <View style={[styles.ambientGlow, { backgroundColor: theme.colors.primary }]} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header Block */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.headerLabel, { color: theme.colors.textSecondary }]}>DIGITAL WALLET</Text>
            <Text style={[styles.headerTitle, { color: theme.colors.textPrimary }]}>Mon Portefeuille</Text>
          </View>
          
          <View style={styles.headerActions}>
            {/* Plus Button */}
            <Pressable style={[styles.actionButton, { backgroundColor: theme.colors.surfaceSubtle + '80', borderColor: theme.colors.border + '40' }]} onPress={handlePressPlus}>
              <Ionicons name="add" size={22} color={theme.colors.textPrimary} />
            </Pressable>
            
            {/* Options Button */}
            <Pressable style={[styles.actionButton, { backgroundColor: theme.colors.surfaceSubtle + '80', borderColor: theme.colors.border + '40' }]} onPress={() => Alert.alert("Options", "Options de configuration du portefeuille.")}>
              <Ionicons name="ellipsis-horizontal" size={20} color={theme.colors.textPrimary} />
            </Pressable>
          </View>
        </View>

        {/* Balance Status Pill */}
        <View style={styles.pillContainer}>
          <View style={[styles.statusPill, { backgroundColor: theme.colors.surface + 'B2', borderColor: theme.colors.primary + '2A' }]}>
            {loading && cards.length === 0 ? (
              <ActivityIndicator size="small" color={theme.colors.success} style={{ marginRight: 6 }} />
            ) : (
              <Ionicons name="wallet-outline" size={16} color={theme.colors.success} />
            )}
            <Text style={[styles.statusText, { color: theme.colors.textPrimary }]}>
              <Text style={styles.statusBold}>
                {loading && cards.length === 0 ? '...' : totalBalance.toLocaleString('fr-FR', { minimumFractionDigits: 3, maximumFractionDigits: 3 })}
              </Text> TND
            </Text>
            <View style={[styles.pillDivider, { backgroundColor: theme.colors.border + '60' }]} />
            <Text style={[styles.statusSub, { color: theme.colors.success }]}>
              {activeCardsCount} {activeCardsCount > 1 ? 'cartes actives' : 'carte active'}
            </Text>
          </View>
        </View>

        {/* Overlapping Cards Stack & Pay Overlay */}
        <View style={styles.cardSection}>
          <View style={styles.cardStackContainer}>
            {/* Card 2 (Background card, tilted left) */}
            <View style={[styles.stackCard, styles.cardBackLeft, { borderColor: theme.colors.primary + '1A', backgroundColor: theme.colors.surfaceSubtle }]}>
              <View style={styles.stackCardHeader}>
                <Ionicons name="wifi" size={14} color={theme.colors.textPrimary} style={styles.wifiRotate} />
              </View>
              <View style={styles.stackCardChip}>
                <View style={[styles.miniChip, { borderColor: theme.colors.primary + '80' }]} />
              </View>
              <Text style={[styles.stackCardNumber, { color: theme.colors.textSecondary + '80' }]}>•••• •••• •••• 5678</Text>
            </View>

            {/* Card 1 (Background card, tilted right) */}
            <View style={[styles.stackCard, styles.cardBackRight, { borderColor: theme.colors.primary + '1A', backgroundColor: theme.colors.surface }]}>
              <View style={styles.stackCardHeader}>
                <Ionicons name="wifi" size={14} color={theme.colors.textPrimary} style={styles.wifiRotate} />
              </View>
              <View style={styles.stackCardChip}>
                <View style={[styles.miniChip, { borderColor: theme.colors.primary + '80' }]} />
              </View>
              <Text style={[styles.stackCardNumber, { color: theme.colors.textSecondary + '80' }]}>•••• •••• •••• 4444</Text>
            </View>

            {/* Floating PAIEMENT RAPIDE Overlay Panel */}
            <View style={[styles.quickPayOverlay, { backgroundColor: theme.colors.surface + 'E6', borderColor: theme.colors.primary + '4D' }]}>
              <View style={styles.overlayHeader}>
                <Text style={[styles.overlayLabel, { color: theme.colors.textSecondary }]}>PAIEMENT RAPIDE</Text>
                
                {/* Pay Switcher Toggle */}
                <View style={[styles.toggleContainer, { backgroundColor: theme.colors.background + '99', borderColor: theme.colors.border + '33' }]}>
                  <Pressable 
                    onPress={() => setPayMethod('Pay')}
                    style={[styles.toggleBtn, payMethod === 'Pay' && styles.toggleBtnActive, payMethod === 'Pay' && { backgroundColor: theme.colors.textPrimary }]}
                  >
                    <Text style={[styles.toggleBtnText, payMethod === 'Pay' && styles.toggleBtnTextActive, { color: payMethod === 'Pay' ? theme.colors.background : theme.colors.textSecondary }]}>
                      Pay
                    </Text>
                  </Pressable>
                  <Pressable 
                    onPress={() => setPayMethod('GPay')}
                    style={[styles.toggleBtn, payMethod === 'GPay' && styles.toggleBtnActive, payMethod === 'GPay' && { backgroundColor: theme.colors.textPrimary }]}
                  >
                    <Text style={[styles.toggleBtnText, payMethod === 'GPay' && styles.toggleBtnTextActive, { color: payMethod === 'GPay' ? theme.colors.background : theme.colors.textSecondary }]}>
                      G Pay
                    </Text>
                  </Pressable>
                </View>
              </View>

              <View style={styles.overlayBody}>
                {/* Contactless Wave Circle Icon */}
                <Pressable onPress={triggerNFCScan} style={[styles.contactlessCircle, { backgroundColor: theme.colors.primary + '1A', borderColor: theme.colors.primary + '40' }]}>
                  <View style={[styles.contactlessIconWrapper, { backgroundColor: theme.colors.primary }]}>
                    <Ionicons name="wifi" size={24} color={theme.colors.primaryOn} style={styles.contactlessWaves} />
                  </View>
                </Pressable>
                
                <Pressable onPress={triggerNFCScan} style={styles.overlayTextSection}>
                  <Text style={[styles.overlayTitle, { color: theme.colors.textPrimary }]}>Approcher pour payer</Text>
                  <Text style={[styles.overlaySubtitle, { color: theme.colors.textSecondary }]}>
                    {cards.length > 0 ? `Virtual ${cards[0].card_type} •••• ${cards[0].card_number.slice(-4)}` : 'Aucune carte active'}
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        </View>

        {/* Segmented Tab Navigation */}
        <View style={styles.tabBarContainer}>
          <View style={[styles.segmentedControl, { backgroundColor: theme.colors.surface + '80', borderColor: theme.colors.border + '30' }]}>
            {(['Identité', 'Cartes', 'Transactions'] as const).map((tab) => {
              const isActive = activeTab === tab;
              return (
                <Pressable
                  key={tab}
                  onPress={() => setActiveTab(tab)}
                  style={[styles.segmentButton, isActive && styles.segmentButtonActive, isActive && { backgroundColor: theme.colors.primary }]}
                >
                  <Text style={[styles.segmentText, isActive && styles.segmentTextActive, { color: isActive ? theme.colors.primaryOn : theme.colors.textSecondary }]}>
                    {tab}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Active Tab Content - Cards List */}
        {activeTab === 'Cartes' && (
          <View style={styles.cardsListContainer}>
            {loading && cards.length === 0 ? (
              <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginVertical: 20 }} />
            ) : cards.length > 0 ? (
              cards.map((card) => (
                <Pressable 
                  key={card.id} 
                  style={[styles.cardRow, { backgroundColor: theme.colors.surface + '60', borderColor: theme.colors.border + '2A' }]} 
                  onPress={() => router.push('/wallet/cards')}
                  onLongPress={() => handleLongPressCard(card)}
                  delayLongPress={600}
                >
                  {/* Left Card Thumbnail */}
                  <View style={[
                    styles.cardThumbnail,
                    { 
                      borderColor: theme.colors.primary + '33', 
                      backgroundColor: theme.colors.surfaceElevated,
                    },
                    card.card_type === 'Gold' && { borderColor: '#ECC86399' }
                  ]}>
                    <View style={StyleSheet.absoluteFill} pointerEvents="none">
                      <View style={[styles.thumbGridH, { top: '33%', backgroundColor: theme.colors.primary }]} />
                      <View style={[styles.thumbGridH, { top: '66%', backgroundColor: theme.colors.primary }]} />
                      <View style={[styles.thumbGridV, { left: '33%', backgroundColor: theme.colors.primary }]} />
                      <View style={[styles.thumbGridV, { left: '66%', backgroundColor: theme.colors.primary }]} />
                    </View>
                    <View style={styles.thumbMcCircles}>
                      <View style={[
                        styles.thumbCircle, 
                        { left: 0 },
                        card.card_type === 'Gold' ? { backgroundColor: '#F79E1B' } : { backgroundColor: '#EB001B' }
                      ]} />
                      <View style={[
                        styles.thumbCircle, 
                        { right: 0 },
                        card.card_type === 'Gold' ? { backgroundColor: '#ECC863' } : { backgroundColor: '#F79E1B' }
                      ]} />
                    </View>
                  </View>

                  {/* Card Info */}
                  <View style={styles.cardRowDetails}>
                    <Text style={[styles.cardRowTitle, { color: theme.colors.textPrimary }]}>
                      {card.card_type === 'Platinum' ? 'SuperTounsi Platinum' : `SuperTounsi ${card.card_type}`}
                    </Text>
                    <Text style={[styles.cardRowSubtitle, { color: theme.colors.textSecondary }]}>
                      {card.card_number} · {card.expiry_date}
                    </Text>
                  </View>

                  {/* Right Arrow */}
                  <Ionicons name="chevron-forward-outline" size={16} color={theme.colors.textSecondary} />
                </Pressable>
              ))
            ) : (
              <View style={[styles.placeholderContainer, { backgroundColor: theme.colors.surface + '33', borderColor: theme.colors.border + '1A' }]}>
                <Text style={[styles.placeholderText, { color: theme.colors.textSecondary }]}>Aucune carte disponible. Appuyez sur (+) pour en créer une.</Text>
              </View>
            )}
          </View>
        )}

        {activeTab === 'Identité' && (
          <View style={styles.cardsListContainer}>
            {loading && documents.length === 0 ? (
              <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginVertical: 20 }} />
            ) : documents.length > 0 ? (
              documents.map((doc, idx) => (
                <Pressable key={idx} onPress={() => router.push('/wallet/documents')}>
                  <DocumentCard 
                    title={doc.title}
                    subtitle={doc.subtitle || ''}
                    status={doc.status}
                    icon={doc.icon as any}
                  />
                </Pressable>
              ))
            ) : (
              <View style={[styles.placeholderContainer, { backgroundColor: theme.colors.surface + '33', borderColor: theme.colors.border + '1A' }]}>
                <Text style={[styles.placeholderText, { color: theme.colors.textSecondary }]}>Aucune pièce d'identité disponible.</Text>
              </View>
            )}
          </View>
        )}

        {activeTab === 'Transactions' && (
          <View style={styles.cardsListContainer}>
            {loading && transactions.length === 0 ? (
              <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginVertical: 20 }} />
            ) : transactions.length > 0 ? (
              transactions.map((tx, idx) => (
                <Pressable
                  key={idx}
                  style={[styles.cardRow, { backgroundColor: theme.colors.surface + '60', borderColor: theme.colors.border + '2A' }]}
                  onPress={() => {
                    if (tx.receipt_data) {
                      setSelectedTx(tx);
                    } else {
                      router.push('/wallet/transactions');
                    }
                  }}
                >
                  <TransactionRow 
                    title={tx.title}
                    subtitle={tx.category}
                    amount={`${tx.amount > 0 ? '+' : ''}${tx.amount.toFixed(3)} ${tx.currency}`}
                    icon={tx.icon as any}
                    style={{ flex: 1 }}
                  />
                  <Ionicons
                    name={tx.receipt_data ? 'receipt-outline' : 'chevron-forward-outline'}
                    size={16}
                    color={tx.receipt_data ? '#FFC244' : theme.colors.textSecondary}
                    style={{ marginLeft: 8 }}
                  />
                </Pressable>
              ))
            ) : (
              <View style={[styles.placeholderContainer, { backgroundColor: theme.colors.surface + '33', borderColor: theme.colors.border + '1A' }]}>
                <Text style={[styles.placeholderText, { color: theme.colors.textSecondary }]}>Aucune transaction enregistrée.</Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* ==========================================================
          MODALS & FORM INTERFACES
         ========================================================== */}

      {/* 1. SELECT TYPE MODAL */}
      <Modal visible={isSelectTypeModalVisible} transparent animationType="fade" onRequestClose={() => setIsSelectTypeModalVisible(false)}>
        <Pressable style={[styles.modalOverlay, { backgroundColor: theme.mode === 'dark' ? 'rgba(3, 12, 22, 0.85)' : 'rgba(248, 249, 250, 0.85)' }]} onPress={() => setIsSelectTypeModalVisible(false)}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.surface, borderColor: theme.colors.primary + '4D' }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.textPrimary }]}>Ajouter au Portefeuille</Text>
            <Text style={[styles.modalDesc, { color: theme.colors.textSecondary }]}>Choisissez le type d'élément que vous souhaitez stocker de manière sécurisée.</Text>
            
            <View style={styles.selectTypeRow}>
              {/* Add Card Option */}
              <Pressable 
                style={[styles.typeSelectorBtn, { backgroundColor: theme.colors.surface + '99', borderColor: theme.colors.border + '30' }]}
                onPress={() => {
                  setIsSelectTypeModalVisible(false);
                  setIsCardModalVisible(true);
                }}
              >
                <View style={[styles.typeIconShell, { backgroundColor: theme.colors.primary + '15' }]}>
                  <Ionicons name="card" size={24} color={theme.colors.primary} />
                </View>
                <Text style={[styles.typeSelectorText, { color: theme.colors.textPrimary }]}>Carte de Paiement</Text>
              </Pressable>

              {/* Add Document Option */}
              <Pressable 
                style={[styles.typeSelectorBtn, { backgroundColor: theme.colors.surface + '99', borderColor: theme.colors.border + '30' }]}
                onPress={() => {
                  setIsSelectTypeModalVisible(false);
                  setIsDocModalVisible(true);
                }}
              >
                <View style={[styles.typeIconShell, { backgroundColor: theme.colors.success + '15' }]}>
                  <Ionicons name="document-text" size={24} color={theme.colors.success} />
                </View>
                <Text style={[styles.typeSelectorText, { color: theme.colors.textPrimary }]}>Document / ID</Text>
              </Pressable>
            </View>

            <Pressable style={[styles.buttonCancel, { borderColor: theme.colors.border + '60' }]} onPress={() => setIsSelectTypeModalVisible(false)}>
              <Text style={[styles.buttonCancelText, { color: theme.colors.textSecondary }]}>Fermer</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>

      {/* 2. CARD CREATION FORM MODAL */}
      <Modal visible={isCardModalVisible} transparent animationType="fade" onRequestClose={() => setIsCardModalVisible(false)}>
        <View style={[styles.modalOverlay, { backgroundColor: theme.mode === 'dark' ? 'rgba(3, 12, 22, 0.85)' : 'rgba(248, 249, 250, 0.85)' }]}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.surface, borderColor: theme.colors.primary + '4D' }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.textPrimary }]}>Nouvelle Carte</Text>
            
            <ScrollView style={{ maxHeight: 350 }} showsVerticalScrollIndicator={false}>
              <View style={styles.formGap}>
                {/* Card Number */}
                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: theme.colors.textSecondary }]}>Numéro de Carte</Text>
                  <TextInput
                    style={[styles.textInput, { backgroundColor: theme.colors.surfaceSubtle, borderColor: errors.cardNumber ? theme.colors.danger : theme.colors.border + '50', color: theme.colors.textPrimary }]}
                    placeholder="5412 8888 7777 3891"
                    placeholderTextColor={theme.colors.textSecondary + '80'}
                    value={cardNumber}
                    onChangeText={(text) => {
                      setCardNumber(format.cardNumber(text));
                      clearError('cardNumber');
                    }}
                    keyboardType="numeric"
                    maxLength={22}
                  />
                  {errors.cardNumber ? <Text style={[styles.fieldError, { color: theme.colors.danger }]}>{errors.cardNumber}</Text> : null}
                </View>

                {/* Cardholder Name */}
                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: theme.colors.textSecondary }]}>Titulaire de la Carte</Text>
                  <TextInput
                    style={[styles.textInput, { backgroundColor: theme.colors.surfaceSubtle, borderColor: errors.cardholderName ? theme.colors.danger : theme.colors.border + '50', color: theme.colors.textPrimary }]}
                    placeholder="Nour Ben Salah"
                    placeholderTextColor={theme.colors.textSecondary + '80'}
                    value={cardholderName}
                    onChangeText={(text) => {
                      setCardholderName(text);
                      clearError('cardholderName');
                    }}
                    autoCapitalize="words"
                  />
                  {errors.cardholderName ? <Text style={[styles.fieldError, { color: theme.colors.danger }]}>{errors.cardholderName}</Text> : null}
                </View>

                {/* Expiry & Initial Balance */}
                <View style={styles.formRow}>
                  <View style={[styles.inputGroup, { flex: 1 }]}>
                    <Text style={[styles.inputLabel, { color: theme.colors.textSecondary }]}>Expiration</Text>
                    <TextInput
                      style={[styles.textInput, { backgroundColor: theme.colors.surfaceSubtle, borderColor: errors.cardExpiry ? theme.colors.danger : theme.colors.border + '50', color: theme.colors.textPrimary }]}
                      placeholder="09/28"
                      placeholderTextColor={theme.colors.textSecondary + '80'}
                      value={cardExpiry}
                      onChangeText={(text) => {
                        setCardExpiry(format.cardExpiry(text));
                        clearError('cardExpiry');
                      }}
                      keyboardType="numeric"
                      maxLength={5}
                    />
                    {errors.cardExpiry ? <Text style={[styles.fieldError, { color: theme.colors.danger }]}>{errors.cardExpiry}</Text> : null}
                  </View>
                  
                  <View style={[styles.inputGroup, { flex: 1.5 }]}>
                    <Text style={[styles.inputLabel, { color: theme.colors.textSecondary }]}>Solde Initial (TND)</Text>
                    <TextInput
                      style={[styles.textInput, { backgroundColor: theme.colors.surfaceSubtle, borderColor: errors.cardBalance ? theme.colors.danger : theme.colors.border + '50', color: theme.colors.textPrimary }]}
                      placeholder="12540.000"
                      placeholderTextColor={theme.colors.textSecondary + '80'}
                      value={cardBalance}
                      onChangeText={(text) => {
                        setCardBalance(format.tndAmount(text));
                        clearError('cardBalance');
                      }}
                      keyboardType="decimal-pad"
                    />
                    {errors.cardBalance ? <Text style={[styles.fieldError, { color: theme.colors.danger }]}>{errors.cardBalance}</Text> : null}
                  </View>
                </View>

                {/* Card Type Selector */}
                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: theme.colors.textSecondary }]}>Type de Carte</Text>
                  <View style={styles.badgeSelectorRow}>
                    {(['Platinum', 'Gold', 'Virtual'] as const).map((type) => {
                      const isActive = cardType === type;
                      return (
                        <Pressable 
                          key={type} 
                          style={[styles.badgeSelectorItem, { backgroundColor: theme.colors.surfaceSubtle, borderColor: theme.colors.border + '40' }, isActive && styles.badgeSelectorItemActive, isActive && { backgroundColor: theme.colors.primary + '22', borderColor: theme.colors.primary }]}
                          onPress={() => setCardType(type)}
                        >
                          <Text style={[styles.badgeSelectorText, isActive && styles.badgeSelectorTextActive, { color: isActive ? theme.colors.primary : theme.colors.textSecondary }]}>
                            {type}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              </View>
            </ScrollView>

            <View style={styles.rowButtons}>
              <Pressable style={[styles.buttonCancel, { borderColor: theme.colors.border + '60' }]} onPress={() => setIsCardModalVisible(false)}>
                <Text style={[styles.buttonCancelText, { color: theme.colors.textSecondary }]}>Annuler</Text>
              </Pressable>
              <Pressable style={[styles.buttonSubmit, { backgroundColor: theme.colors.primary }]} onPress={handleSubmitCard}>
                <Text style={[styles.buttonSubmitText, { color: theme.colors.primaryOn }]}>Enregistrer</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* 3. DOCUMENT/IDENTITY CREATION FORM MODAL */}
      <Modal visible={isDocModalVisible} transparent animationType="fade" onRequestClose={() => setIsDocModalVisible(false)}>
        <View style={[styles.modalOverlay, { backgroundColor: theme.mode === 'dark' ? 'rgba(3, 12, 22, 0.85)' : 'rgba(248, 249, 250, 0.85)' }]}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.surface, borderColor: theme.colors.primary + '4D' }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.textPrimary }]}>Nouveau Document</Text>
            
            <ScrollView style={{ maxHeight: 350 }} showsVerticalScrollIndicator={false}>
              <View style={styles.formGap}>
                {/* Doc Title */}
                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: theme.colors.textSecondary }]}>Nom du Document / Titre</Text>
                  <TextInput
                    style={[styles.textInput, { backgroundColor: theme.colors.surfaceSubtle, borderColor: errors.docTitle ? theme.colors.danger : theme.colors.border + '50', color: theme.colors.textPrimary }]}
                    placeholder="e.g. Carte d'Identité Nationale (CIN)"
                    placeholderTextColor={theme.colors.textSecondary + '80'}
                    value={docTitle}
                    onChangeText={(text) => {
                      setDocTitle(text);
                      clearError('docTitle');
                    }}
                    maxLength={80}
                  />
                  {errors.docTitle ? <Text style={[styles.fieldError, { color: theme.colors.danger }]}>{errors.docTitle}</Text> : null}
                </View>

                {/* Doc Subtitle / Ref */}
                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: theme.colors.textSecondary }]}>Numéro de Réf / Date d'expiration</Text>
                  <TextInput
                    style={[styles.textInput, { backgroundColor: theme.colors.surfaceSubtle, borderColor: errors.docSubtitle ? theme.colors.danger : theme.colors.border + '50', color: theme.colors.textPrimary }]}
                    placeholder="e.g. N° 08842135 · Expire 12/2032"
                    placeholderTextColor={theme.colors.textSecondary + '80'}
                    value={docSubtitle}
                    onChangeText={(text) => {
                      setDocSubtitle(text);
                      clearError('docSubtitle');
                    }}
                    maxLength={120}
                  />
                  {errors.docSubtitle ? <Text style={[styles.fieldError, { color: theme.colors.danger }]}>{errors.docSubtitle}</Text> : null}
                </View>

                {/* Category Picker */}
                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: theme.colors.textSecondary }]}>Catégorie de Document</Text>
                  <View style={styles.badgeSelectorRow}>
                    {(['CIN', 'Passport', 'Permis', 'Facture', 'Assurance', 'Contrat', 'Autre'] as const).map((type) => {
                      const isActive = docType === type;
                      return (
                        <Pressable 
                          key={type} 
                          style={[styles.badgeSelectorItem, { backgroundColor: theme.colors.surfaceSubtle, borderColor: theme.colors.border + '40', marginBottom: 6 }, isActive && styles.badgeSelectorItemActive, isActive && { backgroundColor: theme.colors.primary + '22', borderColor: theme.colors.primary }]}
                          onPress={() => {
                            setDocType(type);
                            clearError('docSubtitle');
                          }}
                        >
                          <Text style={[styles.badgeSelectorText, isActive && styles.badgeSelectorTextActive, { color: isActive ? theme.colors.primary : theme.colors.textSecondary }]}>
                            {type}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>

                {/* Document Status (Simulated verification workflow) */}
                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: theme.colors.textSecondary }]}>Statut initial</Text>
                  <View style={styles.badgeSelectorRow}>
                    {(['Verified', 'Pending'] as const).map((status) => {
                      const isActive = docStatus === status;
                      return (
                        <Pressable 
                          key={status} 
                          style={[styles.badgeSelectorItem, { backgroundColor: theme.colors.surfaceSubtle, borderColor: theme.colors.border + '40' }, isActive && styles.badgeSelectorItemActive, isActive && { backgroundColor: theme.colors.primary + '22', borderColor: theme.colors.primary }]}
                          onPress={() => setDocStatus(status)}
                        >
                          <Text style={[styles.badgeSelectorText, isActive && styles.badgeSelectorTextActive, { color: isActive ? theme.colors.primary : theme.colors.textSecondary }]}>
                            {status === 'Verified' ? 'Vérifié (Approuvé)' : 'En attente (Pending)'}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              </View>
            </ScrollView>

            <View style={styles.rowButtons}>
              <Pressable style={[styles.buttonCancel, { borderColor: theme.colors.border + '60' }]} onPress={() => setIsDocModalVisible(false)}>
                <Text style={[styles.buttonCancelText, { color: theme.colors.textSecondary }]}>Annuler</Text>
              </Pressable>
              <Pressable style={[styles.buttonSubmit, { backgroundColor: theme.colors.primary }]} onPress={handleSubmitDocument}>
                <Text style={[styles.buttonSubmitText, { color: theme.colors.primaryOn }]}>Enregistrer</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>

      {/* Digital Receipt Modal */}
      {selectedTx && (
        <WalletReceiptModal
          visible={!!selectedTx}
          transactionTitle={selectedTx.title}
          transactionAmount={`${selectedTx.amount.toFixed(3)} TND`}
          transactionDate={selectedTx.transaction_date}
          receiptData={selectedTx.receipt_data ? JSON.parse(selectedTx.receipt_data) as ReceiptDetails : null}
          onClose={() => setSelectedTx(null)}
        />
      )}
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  ambientGlow: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 250,
    height: 250,
    borderRadius: 125,
    opacity: 0.12,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 60,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
    gap: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pillContainer: {
    alignItems: 'flex-start',
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 13,
    marginLeft: 6,
  },
  statusBold: {
    fontWeight: '700',
  },
  pillDivider: {
    width: 1,
    height: 12,
    marginHorizontal: 8,
  },
  statusSub: {
    fontSize: 12,
    fontWeight: '600',
  },
  cardSection: {
    height: 250,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10,
  },
  cardStackContainer: {
    width: '100%',
    height: '100%',
    position: 'relative',
    alignItems: 'center',
  },
  stackCard: {
    width: '90%',
    height: 180,
    borderRadius: 20,
    padding: 16,
    position: 'absolute',
    borderWidth: 1,
    justifyContent: 'space-between',
  },
  cardBackLeft: {
    top: 0,
    transform: [{ rotate: '-5deg' }],
    opacity: 0.35,
    shadowColor: '#000',
    shadowOffset: { width: -2, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  cardBackRight: {
    top: 10,
    transform: [{ rotate: '3deg' }],
    opacity: 0.55,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  stackCardHeader: {
    alignItems: 'flex-end',
  },
  wifiRotate: {
    transform: [{ rotate: '90deg' }],
    opacity: 0.5,
  },
  stackCardChip: {
    width: 24,
    height: 18,
    backgroundColor: '#ECC86380',
    borderRadius: 4,
  },
  miniChip: {
    width: '100%',
    height: '100%',
    borderWidth: 0.5,
  },
  stackCardNumber: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1.5,
  },
  quickPayOverlay: {
    width: '100%',
    height: 170,
    borderRadius: 24,
    borderWidth: 1.2,
    padding: 20,
    justifyContent: 'space-between',
    position: 'absolute',
    bottom: 10,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  overlayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  overlayLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  toggleContainer: {
    flexDirection: 'row',
    borderRadius: 14,
    padding: 3,
    borderWidth: 1,
  },
  toggleBtn: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 11,
  },
  toggleBtnActive: {
  },
  toggleBtnText: {
    fontSize: 11,
    fontWeight: '600',
  },
  toggleBtnTextActive: {
  },
  overlayBody: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 8,
  },
  contactlessCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  contactlessIconWrapper: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactlessWaves: {
    transform: [{ rotate: '90deg' }],
  },
  overlayTextSection: {
    justifyContent: 'center',
  },
  overlayTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  overlaySubtitle: {
    fontSize: 13,
    fontWeight: '500',
  },
  tabBarContainer: {
    alignItems: 'center',
    marginTop: 10,
  },
  segmentedControl: {
    flexDirection: 'row',
    borderRadius: 24,
    borderWidth: 1,
    padding: 3,
    width: '100%',
    justifyContent: 'space-between',
  },
  segmentButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 20,
  },
  segmentButtonActive: {
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  segmentText: {
    fontSize: 14,
    fontWeight: '600',
  },
  segmentTextActive: {
  },
  cardsListContainer: {
    gap: 12,
    marginTop: 8,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
  cardThumbnail: {
    width: 48,
    height: 32,
    borderRadius: 6,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
    marginRight: 16,
  },
  thumbGridH: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 0.5,
    opacity: 0.1,
  },
  thumbGridV: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 0.5,
    opacity: 0.1,
  },
  thumbMcCircles: {
    flexDirection: 'row',
    width: 16,
    height: 10,
    position: 'relative',
    alignItems: 'center',
  },
  thumbCircle: {
    width: 10,
    height: 10,
    borderRadius: 5,
    position: 'absolute',
    opacity: 0.85,
  },
  cardRowDetails: {
    flex: 1,
  },
  cardRowTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  cardRowSubtitle: {
    fontSize: 12,
    marginTop: 3,
  },
  placeholderContainer: {
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: 'dashed',
    marginTop: 8,
  },
  placeholderText: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },

  // Modal Overlays Styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    borderRadius: 24,
    borderWidth: 1.2,
    padding: 24,
    width: '100%',
    maxWidth: 380,
    gap: 16,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 4,
  },
  modalDesc: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 10,
  },
  selectTypeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginVertical: 10,
  },
  typeSelectorBtn: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    gap: 10,
  },
  typeIconShell: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
  },
  typeSelectorText: {
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  formGap: {
    gap: 14,
  },
  inputGroup: {
    gap: 6,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
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
    flexDirection: 'row',
    gap: 12,
  },
  badgeSelectorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 2,
  },
  badgeSelectorItem: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  badgeSelectorItemActive: {
  },
  badgeSelectorText: {
    fontSize: 12,
    fontWeight: '600',
  },
  badgeSelectorTextActive: {
    fontWeight: '700',
  },
  rowButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  buttonCancel: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonCancelText: {
    fontWeight: '600',
    fontSize: 14,
  },
  buttonSubmit: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  buttonSubmitText: {
    fontWeight: '700',
    fontSize: 14,
  },
});
