import { api } from "./api";
import { getToken } from "../utils/storage";

export interface Conversation {
  id: number;
  user1Id?: number;
  user2Id?: number;
}

export interface CreateConversationRequest {
  user1Id: number;
  user2Id: number;
}

/**
 * Créer une conversation privée
 *
 * Si elle existe déjà côté backend,
 * le backend doit la retourner.
 */
export const createPrivateConversation = async (
  user1Id: number,
  user2Id: number
): Promise<Conversation> => {
  const token = await getToken();

  const response = await api.post(
    "/conversations/private",
    {
      user1Id,
      user2Id,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  return response.data;
};

/**
 * Récupérer les conversations d'un utilisateur.
 */
export const getUserConversations = async (
  userId: number
) => {
  const token = await getToken();

  const response = await api.get(
    `/conversations/user/${userId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};

/**
 * Récupérer une conversation par son ID.
 */
export const getConversationById = async (
  conversationId: number
) => {
  const token = await getToken();

  const response = await api.get(
    `/conversations/${conversationId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};

