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

export interface ChatUser {
  name: string;
  avatar: string;
  online: boolean;
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: "me" | "them";
  time: string;
}

export interface Conversation {
  id: string;
  user: ChatUser;
  unread: number;
  messages: ChatMessage[];
}