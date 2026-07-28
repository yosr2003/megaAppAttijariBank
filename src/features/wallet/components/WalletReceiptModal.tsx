import React from 'react';
import { Modal, StyleSheet, Text, View, Pressable, ScrollView, Alert } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as Haptics from 'expo-haptics';

export interface ReceiptDetails {
  orderId?: string;
  restaurantName?: string;
  deliveryAddress?: string;
  deliveryTime?: string;
  items?: { name: string; quantity: number; price: number }[];
  subtotal?: number;
  deliveryFee?: number;
  discount?: number;
  total?: number;
  paymentMethod?: string;
  cardUsedTitle?: string;
}

interface WalletReceiptModalProps {
  visible: boolean;
  receiptData?: ReceiptDetails | null;
  transactionTitle: string;
  transactionAmount: string;
  transactionDate?: string;
  onClose: () => void;
}

export function WalletReceiptModal({
  visible,
  receiptData,
  transactionTitle,
  transactionAmount,
  transactionDate,
  onClose,
}: WalletReceiptModalProps) {
  if (!visible) return null;

  const handleDownloadShare = async () => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert(
      "Reçu Téléchargé 📄",
      `Le reçu numérique de ${transactionTitle} a été enregistré dans vos documents sécurisés !`
    );
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.logoBadge}>
                <Ionicons name="receipt" size={24} color="#000000" />
              </View>
              <View>
                <Text style={styles.receiptTitle}>REÇU NUMÉRIQUE</Text>
                <Text style={styles.restaurantName}>{receiptData?.restaurantName || transactionTitle}</Text>
              </View>
            </View>

            <Pressable style={styles.closeBtn} onPress={onClose}>
              <Ionicons name="close" size={22} color="#8E8E93" />
            </Pressable>
          </View>

          <ScrollView style={{ maxHeight: 420 }} showsVerticalScrollIndicator={false}>
            {/* Amount Banner */}
            <View style={styles.amountBox}>
              <Text style={styles.amountLabel}>Montant Payé</Text>
              <Text style={styles.amountValue}>
                {receiptData?.total ? `${receiptData.total.toFixed(3)} TND` : transactionAmount}
              </Text>
              <Text style={styles.dateText}>
                {transactionDate ? new Date(transactionDate).toLocaleString('fr-FR') : 'Aujourd\'hui'}
              </Text>
            </View>

            {/* Itemized Food List */}
            {receiptData?.items && receiptData.items.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Articles Commandés</Text>
                {receiptData.items.map((item, idx) => (
                  <View key={idx} style={styles.itemRow}>
                    <Text style={styles.itemName}>
                      {item.quantity}x {item.name}
                    </Text>
                    <Text style={styles.itemPrice}>{(item.price * item.quantity).toFixed(3)} TND</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Breakdown */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Détails de la Facture</Text>
              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>Sous-total</Text>
                <Text style={styles.breakdownValue}>
                  {(receiptData?.subtotal || 0).toFixed(3)} TND
                </Text>
              </View>
              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>Frais de livraison</Text>
                <Text style={styles.breakdownValue}>
                  {(receiptData?.deliveryFee || 0).toFixed(3)} TND
                </Text>
              </View>
              {Boolean(receiptData?.discount && receiptData.discount > 0) && (
                <View style={styles.breakdownRow}>
                  <Text style={[styles.breakdownLabel, { color: '#00A082' }]}>Réduction Promo</Text>
                  <Text style={[styles.breakdownValue, { color: '#00A082' }]}>
                    -{(receiptData?.discount || 0).toFixed(3)} TND
                  </Text>
                </View>
              )}
              <View style={styles.divider} />
              <View style={styles.breakdownRow}>
                <Text style={styles.totalLabel}>Mode de paiement</Text>
                <Text style={styles.totalValue}>
                  {receiptData?.cardUsedTitle || receiptData?.paymentMethod || 'Portefeuille'}
                </Text>
              </View>
              {receiptData?.deliveryAddress && (
                <View style={styles.breakdownRow}>
                  <Text style={styles.breakdownLabel}>Adresse</Text>
                  <Text style={styles.breakdownValue}>{receiptData.deliveryAddress}</Text>
                </View>
              )}
            </View>
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.actions}>
            <Pressable style={styles.downloadBtn} onPress={handleDownloadShare}>
              <Ionicons name="download-outline" size={20} color="#000000" />
              <Text style={styles.downloadText}>Télécharger / Partager</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  card: {
    backgroundColor: '#1C1C1E',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFC244',
    justifyContent: 'center',
    alignItems: 'center',
  },
  receiptTitle: {
    color: '#8E8E93',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
  restaurantName: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#2C2C2E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  amountBox: {
    backgroundColor: '#2C2C2E',
    borderRadius: 18,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  amountLabel: {
    color: '#8E8E93',
    fontSize: 13,
    fontWeight: '600',
  },
  amountValue: {
    color: '#FFC244',
    fontSize: 32,
    fontWeight: '800',
    marginVertical: 4,
  },
  dateText: {
    color: '#8E8E93',
    fontSize: 13,
  },
  section: {
    backgroundColor: '#2C2C2E',
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    gap: 10,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemName: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  itemPrice: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  breakdownLabel: {
    color: '#8E8E93',
    fontSize: 13,
  },
  breakdownValue: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#3A3A3C',
    marginVertical: 6,
  },
  totalLabel: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  totalValue: {
    color: '#FFC244',
    fontSize: 15,
    fontWeight: '800',
  },
  actions: {
    marginTop: 10,
  },
  downloadBtn: {
    backgroundColor: '#FFC244',
    paddingVertical: 16,
    borderRadius: 24,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  downloadText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '800',
  },
});
