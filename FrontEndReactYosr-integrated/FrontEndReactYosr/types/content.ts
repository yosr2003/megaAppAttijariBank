import { ImageURISource } from "react-native";

export interface BlogAuthor {
  name: string;
  handle?: string;
  role: string;
  avatar: string;
  verified?: boolean;
}

export interface BlogComment {
  id: string;

  author: {
    name: string;
    role: string;
    avatar: ImageURISource;
  };

  text: string;
  time: string;
}

export interface BlogPoll {
  question: string;
  options: {
    label: string;
    percent: number;
  }[];
  totalVotes: number;
}

export interface BlogPost {
  id: string;
  author: BlogAuthor;
  time: string;
  content: string;
  hashtags: string[];
  image?: string;
  poll?: BlogPoll;
  likes: number;
  commentsCount: number;
  shares: number;
  comments: BlogComment[];
}

/**
 * Utilisateur utilisé dans les conversations.
 */
export interface ChatUser {
  name: string;
  avatar: string;
  online: boolean;
}

/**
 * Message reçu depuis le backend Spring Boot.
 *
 * Correspond à ChatMessageResponse.java
 */
export interface ChatMessage {
  id: number;

  conversationId: number;

  senderId: number;

  senderFirstName: string;

  senderLastName: string;

  senderProfileImage?: string | null;

  contenu?: string | null;

  image?: string | null;

  sentAt: string;

  isRead: boolean;
}

export interface Conversation {
  id: string;
  user: ChatUser;
  unread: number;
  messages: ChatMessage[];
}