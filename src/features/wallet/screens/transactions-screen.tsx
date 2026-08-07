import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useIsFocused } from '@react-navigation/native';
import dayjs from 'dayjs';

import { StarField } from '@/src/components/ui';
import { useDb } from '@/src/hooks/use-db';
import { useTheme } from '@/src/hooks/use-theme';
import { dbService, WalletTransaction } from '@/src/services/db-service';

type FilterType = 'all' | 'income' | 'expense';

export function TransactionsScreen() {
  const router = useRouter();
  const isFocused = useIsFocused();
  const { userId, isReady } = useDb();
  const theme = useTheme();
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('all');

  const fetchTransactions = async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const userTx = await dbService.getTransactions(userId);
      setTransactions(userTx);
    } catch (e) {
      console.error("Error loading transactions:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isReady && userId && isFocused) {
      fetchTransactions();
    }
  }, [isReady, userId, isFocused]);

  const filteredTransactions = transactions.filter(tx => {
    if (filter === 'all') return true;
    if (filter === 'income') return tx.amount > 0;
    return tx.amount < 0;
  });

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="receipt-outline" size={64} color="#7891B260" />
      <Text style={[styles.emptyTitle, { color: theme.colors.textPrimary }]}>No Transactions Yet</Text>
      <Text style={[styles.emptySubtitle, { color: theme.colors.textSecondary }]}>Your transaction history will appear here</Text>
    </View>
  );

  const renderSkeleton = () => (
    <View style={styles.skeletonContainer}>
      {[1, 2, 3, 4, 5].map((i) => (
        <View key={i} style={styles.skeletonCard} />
      ))}
    </View>
  );

  return (
    <SafeAreaView edges={['top']} style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      <StatusBar style="light" />
      <StarField />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.textPrimary} />
          </Pressable>
          <Text style={[styles.title, { color: theme.colors.textPrimary }]}>Transactions</Text>
          <View style={{ width: 24 }} />
        </View>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>A clear view of every movement.</Text>

        {/* Filters */}
        <View style={styles.filterContainer}>
          {(['all', 'income', 'expense'] as FilterType[]).map((f) => (
            <Pressable
              key={f}
              style={[styles.filterButton, { backgroundColor: theme.colors.surfaceSubtle, borderColor: theme.colors.border + '20' }, filter === f && { backgroundColor: theme.colors.primary + '22', borderColor: theme.colors.primary }]}
              onPress={() => setFilter(f)}
            >
              <Text style={[styles.filterText, { color: theme.colors.textSecondary }, filter === f && { color: theme.colors.primary }]}>
                {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
              </Text>
            </Pressable>
          ))}
        </View>
        
        {loading ? (
          renderSkeleton()
        ) : filteredTransactions.length > 0 ? (
          <View style={styles.list}>
            {filteredTransactions.map((tx) => (
              <View key={tx.id} style={[styles.transactionItem, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border + '33' }]}>
                <View style={[
                  styles.transactionIconContainer,
                  { backgroundColor: tx.amount < 0 ? '#FF535320' : '#12C97920' }
                ]}>
                  <Ionicons 
                    name={tx.icon as any || 'swap-horizontal-outline'} 
                    size={20} 
                    color={tx.amount < 0 ? '#FF5353' : '#12C979'} 
                  />
                </View>
                <View style={styles.transactionDetails}>
                  <Text style={[styles.transactionTitle, { color: theme.colors.textPrimary }]}>{tx.title}</Text>
                  <Text style={[styles.transactionSubtitle, { color: theme.colors.textSecondary }]}>
                    {tx.category} • {dayjs(tx.transaction_date).format('DD MMM YYYY')}
                  </Text>
                </View>
                <Text style={[
                  styles.transactionAmount,
                  { color: tx.amount < 0 ? '#FF5353' : '#12C979' }
                ]}>
                  {tx.amount < 0 ? '-' : '+'} {Math.abs(tx.amount).toLocaleString('fr-FR', { minimumFractionDigits: 3 })} {tx.currency}
                </Text>
              </View>
            ))}
          </View>
        ) : (
          renderEmptyState()
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#030C16',
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
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#F7FAFF',
  },
  subtitle: {
    fontSize: 14,
    color: '#7891B2',
  },
  filterContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#091E3660',
    borderWidth: 1,
    borderColor: '#1B5B9F20',
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: '#2F80ED20',
    borderColor: '#2F80ED',
  },
  filterText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#7891B2',
  },
  filterTextActive: {
    color: '#F7FAFF',
  },
  skeletonContainer: {
    gap: 12,
  },
  skeletonCard: {
    height: 60,
    borderRadius: 12,
    backgroundColor: '#091E3660',
    borderWidth: 1,
    borderColor: '#1B5B9F20',
  },
  list: {
    gap: 8,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#091E3660',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1B5B9F20',
  },
  transactionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F7FAFF',
    marginBottom: 2,
  },
  transactionSubtitle: {
    fontSize: 12,
    color: '#7891B2',
  },
  transactionAmount: {
    fontSize: 14,
    fontWeight: '700',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#F7FAFF',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#7891B2',
    textAlign: 'center',
  },
});
