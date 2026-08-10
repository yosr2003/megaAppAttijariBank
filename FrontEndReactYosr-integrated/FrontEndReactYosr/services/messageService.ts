import { api } from "./api";
import { getToken } from "../utils/storage";

/**
 * Récupérer tous les messages d'une conversation.
 */
export const getConversationMessages = async (
  conversationId: number,
  userId: number
) => {
  const token = await getToken();

  const response = await api.get(
    `/messages/conversation/${conversationId}`,
    {
      params: {
        userId,
      },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};

/**
 * Envoyer un message dans une conversation.
 */
export const sendMessage = async (
  conversationId: number,
  senderId: number,
  contenu: string,
  image?: string | null
) => {
  const token = await getToken();

  const response = await api.post(
    "/messages",
    {
      conversationId,
      senderId,
      contenu,
      image: image ?? null,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};

/**
 * Marquer tous les messages reçus
 * d'une conversation comme lus.
 */
export const markConversationAsRead = async (
  conversationId: number,
  userId: number
) => {
  const token = await getToken();

  await api.put(
    `/messages/conversation/${conversationId}/read`,
    null,
    {
      params: {
        userId,
      },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

/**
 * Marquer un seul message comme lu.
 */
export const markMessageAsRead = async (
  messageId: number,
  userId: number
) => {
  const token = await getToken();

  await api.put(
    `/messages/${messageId}/read`,
    null,
    {
      params: {
        userId,
      },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

/**
 * Supprimer un message.
 */
export const deleteMessage = async (
  messageId: number,
  userId: number
) => {
  const token = await getToken();

  await api.delete(
    `/messages/${messageId}`,
    {
      params: {
        userId,
      },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

/**
 * Compter tous les messages non lus
 * de l'utilisateur connecté.
 */
export const countUnreadMessages = async (
  userId: number
) => {
  const token = await getToken();

  const response = await api.get(
    `/messages/unread/${userId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};