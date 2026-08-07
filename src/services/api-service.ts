import axios from 'axios';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { 
  WalletCard, WalletTransaction, WalletDocument, SavingsGoal, 
  MarketplaceItem, MarketplaceSubscription, P2PProduct, P2PFavorite, 
  DbOrder, DbOrderItem, DbPayment 
} from './db-service';

// If physical device, this should point to PC IP
const API_URL = Constants.expoConfig?.extra?.EXPO_PUBLIC_API_URL || process.env.EXPO_PUBLIC_API_URL || 'http://172.20.10.4:8082/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

export const apiService = {
  // CARDS
  async getCards(userId: string): Promise<WalletCard[]> {
    const response = await api.get(`/wallet/cards/${userId}`);
    return response.data;
  },
  async createCard(card: Omit<WalletCard, 'id' | 'created_at'>): Promise<WalletCard> {
    const response = await api.post('/wallet/cards', card);
    return response.data;
  },
  async updateCardBalance(cardId: string, balance: number): Promise<void> {
    await api.put(`/wallet/cards/${cardId}/balance`, balance, { headers: { 'Content-Type': 'application/json' } });
  },
  async deleteCard(cardId: string): Promise<void> {
    await api.delete(`/wallet/cards/${cardId}`);
  },

  // TRANSACTIONS
  async getTransactions(userId: string): Promise<WalletTransaction[]> {
    const response = await api.get(`/wallet/transactions/${userId}`);
    return response.data;
  },
  async createTransaction(transaction: Omit<WalletTransaction, 'id' | 'transaction_date'>): Promise<WalletTransaction> {
    const response = await api.post('/wallet/transactions', transaction);
    return response.data;
  },

  // DOCUMENTS
  async getDocuments(userId: string): Promise<WalletDocument[]> {
    const response = await api.get(`/wallet/documents/${userId}`);
    return response.data;
  },
  async createDocument(document: Omit<WalletDocument, 'id' | 'created_at'>): Promise<WalletDocument> {
    const response = await api.post('/wallet/documents', document);
    return response.data;
  },

  // SAVINGS
  async getSavingsGoals(userId: string): Promise<SavingsGoal[]> {
    const response = await api.get(`/savings/${userId}`);
    return response.data;
  },
  async getSavingsGoal(goalId: string): Promise<SavingsGoal | null> {
    try {
      const response = await api.get(`/savings/goal/${goalId}`);
      return response.data;
    } catch {
      return null;
    }
  },
  async createSavingsGoal(goal: Omit<SavingsGoal, 'id' | 'created_at'>): Promise<SavingsGoal> {
    const response = await api.post('/savings', goal);
    return response.data;
  },
  async depositToSavingsGoal(goalId: string, currentAmount: number, depositAmount: number): Promise<void> {
    await api.put(`/savings/${goalId}/deposit`, { amount: depositAmount });
  },
  async deleteSavingsGoal(goalId: string): Promise<void> {
    await api.delete(`/savings/${goalId}`);
  },

  // MARKETPLACE
  async getMarketplaceItems(): Promise<MarketplaceItem[]> {
    const response = await api.get('/marketplace/items');
    return response.data;
  },
  async createMarketplaceItem(item: Omit<MarketplaceItem, 'id' | 'created_at'>): Promise<MarketplaceItem> {
    const response = await api.post('/marketplace/items', item);
    return response.data;
  },
  async getSubscriptions(userId: string): Promise<MarketplaceSubscription[]> {
    const response = await api.get(`/marketplace/subscriptions/${userId}`);
    return response.data;
  },
  async subscribeToItem(userId: string, itemId: string, months = 1): Promise<MarketplaceSubscription> {
    const response = await api.post('/marketplace/subscriptions', { user_id: userId, item_id: itemId, months });
    return response.data;
  },

  // P2P
  async getP2PProducts(): Promise<P2PProduct[]> {
    const response = await api.get('/p2p/products');
    return response.data;
  },
  async createP2PProduct(product: Omit<P2PProduct, 'id' | 'created_at'>): Promise<P2PProduct> {
    const response = await api.post('/p2p/products', product);
    return response.data;
  },
  async deleteP2PProduct(productId: string): Promise<void> {
    await api.delete(`/p2p/products/${productId}`);
  },
  async getP2PFavorites(userId: string): Promise<P2PFavorite[]> {
    const response = await api.get(`/p2p/favorites/${userId}`);
    return response.data;
  },
  async addP2PFavorite(userId: string, productId: string): Promise<P2PFavorite> {
    const response = await api.post('/p2p/favorites', { user_id: userId, product_id: productId });
    return response.data;
  },
  async removeP2PFavorite(userId: string, productId: string): Promise<void> {
    await api.delete(`/p2p/favorites/${userId}/${productId}`);
  },

  // ORDERS
  async createOrderWithPayment(
    order: Omit<DbOrder, 'id' | 'created_at'>, 
    items: { name: string; quantity: number; price: number }[], 
    payment: { card_id?: string; payment_method: 'WALLET' | 'CARD' | 'CASH'; amount: number }
  ) {
    const response = await api.post('/orders/checkout', { order, items, payment });
    return response.data;
  },
  async getLatestOrder(userId: string): Promise<DbOrder | null> {
    try {
      const response = await api.get(`/orders/latest/${userId}`);
      return response.data;
    } catch {
      return null;
    }
  },
  async getAllOrders(userId: string): Promise<(DbOrder & { items: DbOrderItem[] })[]> {
    const response = await api.get(`/orders/user/${userId}`);
    return response.data;
  },
};
