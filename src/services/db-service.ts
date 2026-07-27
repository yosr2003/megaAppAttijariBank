import AsyncStorage from '@react-native-async-storage/async-storage';

export interface WalletCard { id?: string; user_id: string; card_number: string; cardholder_name: string; expiry_date: string; card_type: 'Platinum' | 'Gold' | 'Virtual'; status: 'active' | 'inactive'; balance: number; created_at?: string; }
export interface WalletTransaction { id?: string; user_id: string; card_id?: string | null; title: string; category: string; amount: number; currency: string; icon?: string; transaction_date?: string; }
export interface WalletDocument { id?: string; user_id: string; title: string; subtitle?: string | null; status: 'Verified' | 'Pending' | 'Rejected'; icon?: string; image_url?: string | null; created_at?: string; }
export interface SavingsGoal { id?: string; user_id: string; title: string; goal_amount: number; current_amount: number; created_at?: string; }
export interface MarketplaceItem { id: string; title: string; description?: string; price_text: string; price_amount: number; icon?: string; created_at?: string; }
export interface MarketplaceSubscription { id?: string; user_id: string; item_id: string; status: 'Active' | 'Cancelled' | 'Expired'; start_date?: string; end_date?: string | null; marketplace_items?: MarketplaceItem; }
export interface P2PProduct { id?: string; user_id: string; title: string; description?: string | null; category: string; price: number; condition: 'New' | 'Used'; location: string; contact_info: string; images: string[]; created_at?: string; }
export interface P2PFavorite { id?: string; user_id: string; product_id: string; created_at?: string; p2p_products?: P2PProduct; }

interface LocalDatabase {
  cards: WalletCard[];
  transactions: WalletTransaction[];
  documents: WalletDocument[];
  savingsGoals: SavingsGoal[];
  marketplaceItems: MarketplaceItem[];
  subscriptions: MarketplaceSubscription[];
  p2pProducts: P2PProduct[];
  p2pFavorites: P2PFavorite[];
}

const STORAGE_KEY = '@supertounsii/local-database';
const emptyDatabase = (): LocalDatabase => ({ cards: [], transactions: [], documents: [], savingsGoals: [], marketplaceItems: [], subscriptions: [], p2pProducts: [], p2pFavorites: [] });
const id = () => `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
const now = () => new Date().toISOString();

async function readDatabase(): Promise<LocalDatabase> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return emptyDatabase();
  return { ...emptyDatabase(), ...JSON.parse(raw) };
}

async function updateDatabase<T>(update: (database: LocalDatabase) => T): Promise<T> {
  const database = await readDatabase();
  const result = update(database);
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(database));
  return result;
}

export const dbService = {
  async getCards(userId: string) { return (await readDatabase()).cards.filter((card) => card.user_id === userId).sort((a, b) => (b.created_at ?? '').localeCompare(a.created_at ?? '')); },
  async createCard(card: Omit<WalletCard, 'id' | 'created_at'>) { return updateDatabase((db) => { const created = { ...card, id: id(), created_at: now() }; db.cards.unshift(created); return created; }); },
  async updateCardBalance(cardId: string, balance: number) { await updateDatabase((db) => { const card = db.cards.find((item) => item.id === cardId); if (!card) throw new Error('Card not found'); card.balance = balance; }); },
  async deleteCard(cardId: string) { await updateDatabase((db) => { db.cards = db.cards.filter((card) => card.id !== cardId); }); },
  async getTransactions(userId: string) { return (await readDatabase()).transactions.filter((transaction) => transaction.user_id === userId).sort((a, b) => (b.transaction_date ?? '').localeCompare(a.transaction_date ?? '')); },
  async createTransaction(transaction: Omit<WalletTransaction, 'id' | 'transaction_date'>) { return updateDatabase((db) => { const created = { ...transaction, id: id(), transaction_date: now() }; db.transactions.unshift(created); return created; }); },
  async getDocuments(userId: string) { return (await readDatabase()).documents.filter((document) => document.user_id === userId).sort((a, b) => (b.created_at ?? '').localeCompare(a.created_at ?? '')); },
  async createDocument(document: Omit<WalletDocument, 'id' | 'created_at'>) { return updateDatabase((db) => { const created = { ...document, id: id(), created_at: now() }; db.documents.unshift(created); return created; }); },
  async getSavingsGoals(userId: string) { return (await readDatabase()).savingsGoals.filter((goal) => goal.user_id === userId).sort((a, b) => (b.created_at ?? '').localeCompare(a.created_at ?? '')); },
  async getSavingsGoal(goalId: string) { return (await readDatabase()).savingsGoals.find((goal) => goal.id === goalId) ?? null; },
  async createSavingsGoal(goal: Omit<SavingsGoal, 'id' | 'created_at'>) { return updateDatabase((db) => { const created = { ...goal, id: id(), created_at: now() }; db.savingsGoals.unshift(created); return created; }); },
  async depositToSavingsGoal(goalId: string, currentAmount: number, depositAmount: number) { await updateDatabase((db) => { const goal = db.savingsGoals.find((item) => item.id === goalId); if (!goal) throw new Error('Savings goal not found'); goal.current_amount = Number(currentAmount) + Number(depositAmount); }); },
  async deleteSavingsGoal(goalId: string) { await updateDatabase((db) => { db.savingsGoals = db.savingsGoals.filter((goal) => goal.id !== goalId); }); },
  async getMarketplaceItems() { return (await readDatabase()).marketplaceItems.sort((a, b) => (b.created_at ?? '').localeCompare(a.created_at ?? '')); },
  async createMarketplaceItem(item: Omit<MarketplaceItem, 'id' | 'created_at'>) { return updateDatabase((db) => { const created = { ...item, id: id(), created_at: now() }; db.marketplaceItems.unshift(created); return created; }); },
  async getSubscriptions(userId: string) { const db = await readDatabase(); return db.subscriptions.filter((subscription) => subscription.user_id === userId && subscription.status === 'Active').map((subscription) => ({ ...subscription, marketplace_items: db.marketplaceItems.find((item) => item.id === subscription.item_id) })); },
  async subscribeToItem(userId: string, itemId: string, months = 1) { return updateDatabase((db) => { const start = new Date(); const end = new Date(start); end.setMonth(end.getMonth() + months); const created: MarketplaceSubscription = { id: id(), user_id: userId, item_id: itemId, status: 'Active', start_date: start.toISOString(), end_date: end.toISOString() }; db.subscriptions.unshift(created); return created; }); },
  async getP2PProducts() { return (await readDatabase()).p2pProducts.sort((a, b) => (b.created_at ?? '').localeCompare(a.created_at ?? '')); },
  async createP2PProduct(product: Omit<P2PProduct, 'id' | 'created_at'>) { return updateDatabase((db) => { const created = { ...product, id: id(), created_at: now() }; db.p2pProducts.unshift(created); return created; }); },
  async getP2PFavorites(userId: string) { const db = await readDatabase(); return db.p2pFavorites.filter((favorite) => favorite.user_id === userId).map((favorite) => ({ ...favorite, p2p_products: db.p2pProducts.find((product) => product.id === favorite.product_id) })); },
  async addP2PFavorite(userId: string, productId: string) { return updateDatabase((db) => { const created: P2PFavorite = { id: id(), user_id: userId, product_id: productId, created_at: now() }; db.p2pFavorites.unshift(created); return created; }); },
  async removeP2PFavorite(userId: string, productId: string) { await updateDatabase((db) => { db.p2pFavorites = db.p2pFavorites.filter((favorite) => favorite.user_id !== userId || favorite.product_id !== productId); }); },
};
