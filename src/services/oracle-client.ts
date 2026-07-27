// ==========================================================
// ORACLE DATABASE CLIENT FOR SUPERTOUNSI
// ==========================================================
// This is a REST-based Oracle client using ORDS (Oracle REST Data Services)
// or a custom Node.js backend API.
//
// To use: Replace the BASE_URL with your Oracle backend API endpoint.
// The backend service should connect to Oracle using node-oracledb or
// Oracle REST Data Services (ORDS).
// ==========================================================

const BASE_URL = process.env.EXPO_PUBLIC_API_URL!; // Replace with your Oracle backend URL

interface ApiOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: Record<string, any>;
  headers?: Record<string, string>;
}

async function request<T>(
  endpoint: string,
  options: ApiOptions = {},
): Promise<T> {
  const { method = "GET", body, headers = {} } = options;

  const config: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  };

  if (body && method !== "GET") {
    config.body = JSON.stringify(body);
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, config);

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Oracle API Error [${response.status}]: ${errorBody}`);
  }

  const data = await response.json();
  return data as T;
}

export const oracleDb = {
  // ==========================================================
  // PROFILES
  // ==========================================================
  profiles: {
    getById: (id: string) => request<Record<string, any>>(`/profiles/${id}`),

    create: (profile: Record<string, any>) =>
      request<Record<string, any>>("/profiles", {
        method: "POST",
        body: profile,
      }),

    upsert: (profile: Record<string, any>) =>
      request<Record<string, any>>("/profiles/upsert", {
        method: "POST",
        body: profile,
      }),
  },

  // ==========================================================
  // FOOD DELIVERY
  // ==========================================================
  food: {
    getRestaurants: () => request<any[]>("/food/restaurants"),

    getRestaurantById: (id: string) =>
      request<Record<string, any>>(`/food/restaurants/${id}`),

    getMenuItems: (restaurantId: string) =>
      request<any[]>(`/food/restaurants/${restaurantId}/menu-items`),

    getMenuCategories: (restaurantId: string) =>
      request<any[]>(`/food/restaurants/${restaurantId}/menu-categories`),

    getCuisineCategories: () => request<any[]>("/food/cuisine-categories"),

    createOrder: (order: Record<string, any>) =>
      request<Record<string, any>>("/food/orders", {
        method: "POST",
        body: order,
      }),

    getOrders: (userId: string) =>
      request<any[]>(`/food/orders?userId=${userId}`),

    getOrderById: (id: string) =>
      request<Record<string, any>>(`/food/orders/${id}`),
  },

  // ==========================================================
  // DIGITAL WALLET
  // ==========================================================
  wallet: {
    getCards: (userId: string) =>
      request<any[]>(`/wallet/cards?userId=${userId}`),

    createCard: (card: Record<string, any>) =>
      request<Record<string, any>>("/wallet/cards", {
        method: "POST",
        body: card,
      }),

    updateCardBalance: (cardId: string, balance: number) =>
      request<Record<string, any>>(`/wallet/cards/${cardId}`, {
        method: "PATCH",
        body: { balance },
      }),

    deleteCard: (cardId: string) =>
      request<void>(`/wallet/cards/${cardId}`, { method: "DELETE" }),

    getTransactions: (userId: string) =>
      request<any[]>(`/wallet/transactions?userId=${userId}`),

    createTransaction: (txn: Record<string, any>) =>
      request<Record<string, any>>("/wallet/transactions", {
        method: "POST",
        body: txn,
      }),

    getDocuments: (userId: string) =>
      request<any[]>(`/wallet/documents?userId=${userId}`),

    createDocument: (doc: Record<string, any>) =>
      request<Record<string, any>>("/wallet/documents", {
        method: "POST",
        body: doc,
      }),
  },

  // ==========================================================
  // SMART SAVING
  // ==========================================================
  savings: {
    getGoals: (userId: string) =>
      request<any[]>(`/savings/goals?userId=${userId}`),

    createGoal: (goal: Record<string, any>) =>
      request<Record<string, any>>("/savings/goals", {
        method: "POST",
        body: goal,
      }),

    updateGoalAmount: (goalId: string, currentAmount: number) =>
      request<Record<string, any>>(`/savings/goals/${goalId}`, {
        method: "PATCH",
        body: { current_amount: currentAmount },
      }),

    deleteGoal: (goalId: string) =>
      request<void>(`/savings/goals/${goalId}`, { method: "DELETE" }),
  },

  // ==========================================================
  // MARKETPLACE (Subscriptions)
  // ==========================================================
  marketplace: {
    getItems: () => request<any[]>("/marketplace/items"),

    getSubscriptions: (userId: string) =>
      request<any[]>(`/marketplace/subscriptions?userId=${userId}`),

    subscribe: (userId: string, itemId: string, months: number = 1) =>
      request<Record<string, any>>("/marketplace/subscriptions", {
        method: "POST",
        body: { user_id: userId, item_id: itemId, months },
      }),
  },

  // ==========================================================
  // P2P MARKETPLACE
  // ==========================================================
  p2p: {
    getProducts: () => request<any[]>("/p2p/products"),

    createProduct: (product: Record<string, any>) =>
      request<Record<string, any>>("/p2p/products", {
        method: "POST",
        body: product,
      }),

    getFavorites: (userId: string) =>
      request<any[]>(`/p2p/favorites?userId=${userId}`),

    addFavorite: (userId: string, productId: string) =>
      request<Record<string, any>>("/p2p/favorites", {
        method: "POST",
        body: { user_id: userId, product_id: productId },
      }),

    removeFavorite: (userId: string, productId: string) =>
      request<void>("/p2p/favorites", {
        method: "DELETE",
        body: { user_id: userId, product_id: productId },
      }),
  },
};
