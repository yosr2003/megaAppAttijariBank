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
    avatar: any;
  };
  text: string;
  time: string;
}

export interface BlogPoll {
  question: string;
  options: { label: string; percent: number }[];
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

/* =========================
   CHAT
========================= */

export interface ChatMessage {
  id: number | string;

  conversationId?: number;

  senderId: number;

  senderFirstName?: string;

  senderLastName?: string;

  senderProfileImage?: string;

  contenu?: string | null;

  image?: string | null;

  sentAt?: string | null;

  isRead?: boolean;
}

/* =========================
   CONVERSATION
========================= */

export interface Conversation {
  id: number;

  user1Id?: number;

  user2Id?: number;
}

export interface ConversationPreview {
  conversationId: number;

  otherUserId: number;

  otherUserFirstName: string;

  otherUserLastName: string;

  otherUserProfileImage?: string | null;

  lastMessage?: string | null;

  lastMessageSenderId?: number | null;

  lastMessageDate?: string | null;

  unreadCount: number;
}

