import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { Screen, GlassCard, SectionTitle } from '@/src/components/ui';
import { useTheme } from '@/src/hooks/use-theme';
import { dbService, DbOrder, DbOrderItem, MarketplaceSubscription } from '@/src/services/db-service';
import { TEST_USER_ID } from '@/src/hooks/use-db';

interface CombinedOrder {
  id: string;
  type: 'FOOD' | 'MARKETPLACE';
  title: string;
  subtitle: string;
  date: string;
  amount: number;
  statusText: string;
  statusColor: string;
  itemsText?: string;
  rawOrder?: DbOrder;
}

export function OrderHistoryScreen() {
  const router = useRouter();
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState<'ALL' | 'FOOD' | 'MARKETPLACE'>('ALL');
  const [loading, setLoading] = useState(true);
  const [combinedOrders, setCombinedOrders] = useState<CombinedOrder[]>([]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const [foodOrders, subscriptions] = await Promise.all([
        dbService.getAllOrders(TEST_USER_ID),
        dbService.getSubscriptions(TEST_USER_ID),
      ]);

      const formattedFood: CombinedOrder[] = foodOrders.map((o) => {
        const itemNames = o.items.map((i) => `${i.quantity}x ${i.name}`).join(', ');
        return {
          id: o.id,
          type: 'FOOD',
          title: o.restaurant_name,
          subtitle: o.delivery_address,
          date: o.created_at ? new Date(o.created_at).toLocaleString('fr-FR') : 'Récemment',
          amount: o.total,
          statusText: o.status === 'DELIVERED' ? 'Livré' : 'En cours 🚴',
          statusColor: o.status === 'DELIVERED' ? '#00A082' : '#FFC244',
          itemsText: itemNames || 'Commande repas',
          rawOrder: o,
        };
      });

      const formattedMarketplace: CombinedOrder[] = subscriptions.map((s) => ({
        id: s.id || Math.random().toString(),
        type: 'MARKETPLACE',
        title: s.marketplace_items?.title || 'Abonnement Services',
        subtitle: `Inclus dans votre pack SuperTounsi`,
        date: s.start_date ? new Date(s.start_date).toLocaleDateString('fr-FR') : 'Actif',
        amount: s.marketplace_items?.price_amount || 0,
        statusText: 'Actif',
        statusColor: '#00A082',
        itemsText: s.marketplace_items?.description || 'Service digital',
      }));

      // Combine and sort by date descending
      const all = [...formattedFood, ...formattedMarketplace].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );

      setCombinedOrders(all);
    } catch (e) {
      console.error('Failed to load order history:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const filteredOrders = combinedOrders.filter((item) => {
    if (activeTab === 'FOOD') return item.type === 'FOOD';
    if (activeTab === 'MARKETPLACE') return item.type === 'MARKETPLACE';
    return true;
  });

  return (
    <Screen style={{ paddingHorizontal: 0 }}>
      <SafeAreaView edges={['top']} style={{ flex: 1 }}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
          <Pressable
            style={[styles.backButton, { backgroundColor: theme.colors.surfaceElevated }]}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={theme.colors.textPrimary} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: theme.colors.textPrimary }]}>
            Historique des Commandes
          </Text>
          <View style={{ width: 44 }} />
        </View>

        {/* Filter Tabs */}
        <View style={styles.tabsContainer}>
          {[
            { id: 'ALL', label: 'Tous' },
            { id: 'FOOD', label: '🍔 Food' },
            { id: 'MARKETPLACE', label: '🛍️ Marketplace' },
          ].map((tab) => {
            const isSelected = activeTab === tab.id;
            return (
              <Pressable
                key={tab.id}
                style={[
                  styles.tabBtn,
                  {
                    backgroundColor: isSelected ? '#FFC244' : theme.colors.surface,
                    borderColor: isSelected ? '#FFC244' : theme.colors.border,
                  },
                ]}
                onPress={() => setActiveTab(tab.id as any)}
              >
                <Text style={[styles.tabText, { color: isSelected ? '#000000' : theme.colors.textSecondary }]}>
                  {tab.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {loading && (
            <View style={{ padding: 40, alignItems: 'center' }}>
              <ActivityIndicator size="large" color="#FFC244" />
              <Text style={{ marginTop: 10, color: theme.colors.textSecondary }}>Chargement de l'historique...</Text>
            </View>
          )}

          {!loading && filteredOrders.length === 0 && (
            <GlassCard style={{ padding: 30, alignItems: 'center', marginHorizontal: 20 }}>
              <Ionicons name="receipt-outline" size={48} color={theme.colors.textSecondary} style={{ marginBottom: 12 }} />
              <Text style={{ color: theme.colors.textPrimary, fontSize: 18, fontWeight: '800', marginBottom: 6 }}>
                Aucune commande enregistrée
              </Text>
              <Text style={{ color: theme.colors.textSecondary, textAlign: 'center', fontSize: 13, marginBottom: 18 }}>
                Passez votre première commande de nourriture ou explorez nos services Marketplace.
              </Text>
              <Pressable style={styles.actionBtn} onPress={() => router.push('/food-delivery' as any)}>
                <Text style={styles.actionBtnText}>Commander maintenant 🍔</Text>
              </Pressable>
            </GlassCard>
          )}

          {!loading &&
            filteredOrders.map((order) => (
              <View key={order.id} style={{ paddingHorizontal: 20, marginBottom: 14 }}>
                <GlassCard style={{ padding: 16 }}>
                  {/* Top Row: Type Icon + Title + Status */}
                  <View style={styles.cardHeader}>
                    <View style={styles.titleRow}>
                      <View style={[styles.badgeIcon, { backgroundColor: order.type === 'FOOD' ? '#FFC24420' : '#00A08220' }]}>
                        <Ionicons
                          name={order.type === 'FOOD' ? 'fast-food' : 'cart'}
                          size={20}
                          color={order.type === 'FOOD' ? '#FFC244' : '#00A082'}
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.orderTitle, { color: theme.colors.textPrimary }]}>
                          {order.title}
                        </Text>
                        <Text style={[styles.orderDate, { color: theme.colors.textSecondary }]}>
                          {order.date}
                        </Text>
                      </View>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: order.statusColor + '20' }]}>
                      <Text style={[styles.statusText, { color: order.statusColor }]}>
                        {order.statusText}
                      </Text>
                    </View>
                  </View>

                  {/* Items Description */}
                  {Boolean(order.itemsText) && (
                    <Text style={[styles.itemsText, { color: theme.colors.textSecondary }]} numberOfLines={2}>
                      {order.itemsText}
                    </Text>
                  )}

                  <View style={styles.divider} />

                  {/* Bottom Row: Amount + Action */}
                  <View style={styles.cardFooter}>
                    <Text style={[styles.amountText, { color: theme.colors.textPrimary }]}>
                      {order.amount.toFixed(3)} TND
                    </Text>

                    {order.type === 'FOOD' && (
                      <Pressable
                        style={styles.trackBtn}
                        onPress={() => router.push('/food-delivery/order-tracking' as any)}
                      >
                        <Ionicons name="location-sharp" size={16} color="#000000" />
                        <Text style={styles.trackBtnText}>Suivre en direct</Text>
                      </Pressable>
                    )}
                  </View>
                </GlassCard>
              </View>
            ))}
        </ScrollView>
      </SafeAreaView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 10,
    marginVertical: 14,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '700',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  badgeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  orderTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  orderDate: {
    fontSize: 12,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '800',
  },
  itemsText: {
    fontSize: 13,
    marginVertical: 6,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginVertical: 10,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  amountText: {
    fontSize: 18,
    fontWeight: '800',
  },
  trackBtn: {
    backgroundColor: '#FFC244',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  trackBtnText: {
    color: '#000000',
    fontSize: 13,
    fontWeight: '800',
  },
  actionBtn: {
    backgroundColor: '#FFC244',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 20,
  },
  actionBtnText: {
    color: '#000000',
    fontSize: 15,
    fontWeight: '800',
  },
});
