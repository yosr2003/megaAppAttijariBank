
import { api } from "./api";
import { getToken } from "../utils/storage";
import { ImageURISource } from "react-native";
/**
 * Récupérer tous les posts
 */
export const getAllPosts = async () => {
  const token = await getToken();

  const response = await api.get("/posts", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

/**
 * Récupérer un post par son ID
 */

export const getPostById = async (
  id: string | number,
  userId: number
) => {
  const token = await getToken();

  const response = await api.get(`/posts/${id}`, {
    params: {
      userId,
    },
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

/**
 * Récupérer l'URL de l'image d'un post
 */
export const getPostImageUrl = async (
  filename: string
): Promise<ImageURISource> => {
  if (!filename) {
    throw new Error("Nom de fichier image manquant");
  }

  const token = await getToken();

  return {
    uri: api.getUri({
      url: `/posts/image/${filename}`,
    }),
    headers: token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : undefined,
  };
};
/**
 * Récupérer les posts d'un auteur
 */
export const getPostsByAuthor = async (
  authorId: string | number
) => {
  const token = await getToken();

  const response = await api.get(
    `/posts/author/${authorId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};


export const createPost = async (
  content: string,
  authorId: number,
  image?: string | null
) => {
  const token = await getToken();

  const formData = new FormData();

  formData.append("contenu", content);
  formData.append("authorId", String(authorId));

  // Ajouter l'image uniquement si une image a été sélectionnée
  if (image) {
    const filename = image.split("/").pop() || "post.jpg";

    const extension =
      filename.split(".").pop()?.toLowerCase() || "jpg";

    let mimeType = "image/jpeg";

    if (extension === "png") {
      mimeType = "image/png";
    } else if (extension === "webp") {
      mimeType = "image/webp";
    } else if (extension === "heic") {
      mimeType = "image/heic";
    }

    formData.append("image", {
      uri: image,
      name: filename,
      type: mimeType,
    } as any);
  }

  console.log("========== CREATE POST ==========");
  console.log("CONTENT :", content);
  console.log("AUTHOR ID :", authorId);
  console.log("IMAGE URI :", image);

  const response = await api.post(
    "/posts",
    formData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    }
  );

  console.log("POST CREATED :", response.data);

  return response.data;
};

export const togglePostLike = async (
  postId: number,
  userId: number
) => {
  const token = await getToken();

  const response = await api.post(
    `/posts/${postId}/like`,
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

  return response.data;
};
export const addComment = async (
  postId: number,
  contenu: string,
  userId: number
) => {
  const token = await getToken();

  const response = await api.post(
    `/comments/post/${postId}`,
    {
      contenu,
      userId,
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

export const getProfileImageUrl = async (
  filename: string | null | undefined
) => {
  if (!filename) {
    return null;
  }

  const token = await getToken();

  return {
    uri: api.getUri({
      url: `/auth/profile-image/${filename}`,
    }),
 headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

export const updatePost = async (
  postId: number,
  contenu: string,
  image?: string | null
) => {
  const token = await getToken();

  const formData = new FormData();

  formData.append("contenu", contenu);

  // 🔥 Ajouter image seulement si elle existe
  if (image) {
    const filename = image.split("/").pop() || "post.jpg";

    const extension =
      filename.split(".").pop()?.toLowerCase() || "jpg";

    let mimeType = "image/jpeg";

    if (extension === "png") mimeType = "image/png";
    else if (extension === "webp") mimeType = "image/webp";
    else if (extension === "heic") mimeType = "image/heic";

    formData.append("image", {
      uri: image,
      name: filename,
      type: mimeType,
    } as any);
  }

  console.log("========== UPDATE POST ==========");
  console.log("POST ID :", postId);
  console.log("CONTENU :", contenu);
  console.log("IMAGE :", image);

  const response = await api.put(
    `/posts/${postId}`,
    formData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
};

export const deletePost = async (postId: number) => {
  const token = await getToken();

  const response = await api.delete(`/posts/${postId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

/**
 * Modifier un commentaire
 */
export const updateComment = async (
  commentId: number | string,
  contenu: string,
  userId: number
) => {
  const token = await getToken();

  if (!contenu.trim()) {
    throw new Error(
      "Le commentaire ne peut pas être vide"
    );
  }

  console.log("========== UPDATE COMMENT ==========");
  console.log("COMMENT ID :", commentId);
  console.log("CONTENU :", contenu);
  console.log("USER ID :", userId);

  const response = await api.put(
    `/comments/${commentId}`,
    {
      contenu: contenu.trim(),
      userId,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  console.log(
    "COMMENT UPDATED :",
    response.data
  );

  return response.data;
};


/**
 * Supprimer un commentaire
 */
export const deleteComment = async (
  commentId: number | string,
  userId: number
) => {
  const token = await getToken();

  console.log("========== DELETE COMMENT ==========");
  console.log("COMMENT ID :", commentId);
  console.log("USER ID :", userId);

  const response = await api.delete(
    `/comments/${commentId}`,
    {
      params: {
        userId,
      },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  console.log(
    "COMMENT DELETED :",
    commentId
  );

  return response.data;
};