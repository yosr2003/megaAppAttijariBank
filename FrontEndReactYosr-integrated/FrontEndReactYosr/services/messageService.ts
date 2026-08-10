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
   ENVOYER MESSAGE
   TEXTE + IMAGE
========================= */

export const sendMessage = async (
  conversationId: number,
  senderId: number,
  contenu: string,
  image?: string | null
) => {
  const token = await getToken();

  const formData = new FormData();

  formData.append(
    "conversationId",
    String(conversationId)
  );

  formData.append(
    "senderId",
    String(senderId)
  );

  if (contenu && contenu.trim()) {
    formData.append(
      "contenu",
      contenu.trim()
    );
  }

  if (image) {
    formData.append(
      "image",
      {
        uri: image,
        name: `message-${Date.now()}.jpg`,
        type: "image/jpeg",
      } as any
    );
  }

  const response = await api.post(
    "/messages",
    formData,
    {
      headers: {
        Authorization: `Bearer ${token}`,

        // IMPORTANT :
        // on écrase le application/json
        // uniquement pour cette requête
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
};

/* =========================
   MARQUER CONVERSATION LUE
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
   MARQUER MESSAGE LU
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

