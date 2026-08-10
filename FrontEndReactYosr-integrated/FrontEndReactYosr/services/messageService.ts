
import { api } from "./api";
import { getToken } from "../utils/storage";

/* =========================
   RÉCUPÉRER LES MESSAGES
========================= */

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

/* =========================
   ENVOYER UN MESSAGE
========================= */

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

/* =========================
   MARQUER UNE CONVERSATION
   COMME LUE
========================= */

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

/* =========================
   MARQUER UN MESSAGE
   COMME LU
========================= */

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

/* =========================
   SUPPRIMER
========================= */

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

/* =========================
   NON LUS
========================= */

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

