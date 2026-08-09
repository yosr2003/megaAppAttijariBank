import { BlogPost } from "../types/content";

const ME_AVATAR = "https://i.pravatar.cc/150?img=68";

export const myPosts: BlogPost[] = [
  {
    id: "mine-1",
    author: {
      name: "Vous",
      handle: "@moi.supertounsi",
      role: "Membre SuperTounsi",
      avatar: ME_AVATAR,
    },
    time: "3h",
    content:
      "Première semaine avec le Virtual Card SuperTounsi 💳 Payer en ligne n'a jamais été aussi simple, et le cashback tombe direct sur le solde. Recommandé à 100% !",
    hashtags: ["#SuperTounsi", "#VirtualCard", "#Cashback"],
    image: "https://picsum.photos/seed/supertounsi-mypost1/800/450",
    likes: 47,
    commentsCount: 9,
    shares: 2,
    comments: [],
  },
  {
    id: "mine-2",
    author: {
      name: "Vous",
      handle: "@moi.supertounsi",
      role: "Membre SuperTounsi",
      avatar: ME_AVATAR,
    },
    time: "2j",
    content:
      "Petit conseil : activez les alertes de budget dans l'app, ça m'a évité un découvert ce mois-ci 😅 Merci SuperTounsi !",
    hashtags: ["#Budgeting", "#SuperTounsi"],
    likes: 23,
    commentsCount: 4,
    shares: 1,
    comments: [],
  },
  {
    id: "mine-3",
    author: {
      name: "Vous",
      handle: "@moi.supertounsi",
      role: "Membre SuperTounsi",
      avatar: ME_AVATAR,
    },
    time: "5j",
    content: "Fier d'avoir atteint mon objectif d'épargne du mois ! Merci au tracker automatique 📊",
    hashtags: ["#Epargne", "#Goals"],
    image: "https://picsum.photos/seed/supertounsi-mypost3/800/450",
    likes: 68,
    commentsCount: 11,
    shares: 3,
    comments: [],
  },
];