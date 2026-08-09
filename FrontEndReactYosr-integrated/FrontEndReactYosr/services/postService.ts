
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
export const getPostById = async (id: string | number) => {
  const token = await getToken();

  const response = await api.get(`/posts/${id}`, {
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
