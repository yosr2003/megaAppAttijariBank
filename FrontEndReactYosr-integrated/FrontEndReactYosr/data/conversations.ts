import { Conversation } from "../types/content";

export const conversations: Conversation[] = [
  {
    id: "1",
    user: { name: "Ahmed", avatar: "https://i.pravatar.cc/150?img=5", online: true },
    unread: 2,
    messages: [
      { id: "m1", text: "Salut, ça va ?", sender: "them", time: "21:30" },
      { id: "m2", text: "Salut 👋 ça va et toi ?", sender: "me", time: "21:31" },
      { id: "m3", text: "Nickel ! Tu es dispo pour l'event ce soir ?", sender: "them", time: "21:42" },
    ],
  },
  {
    id: "2",
    user: { name: "Mariem", avatar: "https://i.pravatar.cc/150?img=9", online: false },
    unread: 0,
    messages: [
      { id: "m1", text: "On se retrouve demain devant le stade ?", sender: "them", time: "20:15" },
      { id: "m2", text: "Parfait, à demain 👍", sender: "me", time: "20:20" },
    ],
  },
  {
    id: "3",
    user: { name: "Yassine", avatar: "https://i.pravatar.cc/150?img=14", online: true },
    unread: 5,
    messages: [
      { id: "m1", text: "T'as vu le nouveau Blog Service ?", sender: "them", time: "18:02" },
      { id: "m2", text: "Pas encore, ça donne quoi ?", sender: "me", time: "18:05" },
      { id: "m3", text: "Trop stylé, tu devrais checker 🔥", sender: "them", time: "18:06" },
    ],
  },
  {
    id: "4",
    user: { name: "Sana Belhassen", avatar: "https://i.pravatar.cc/150?img=32", online: false },
    unread: 0,
    messages: [{ id: "m1", text: "Merci pour le lien de l'event 🙌", sender: "them", time: "Hier" }],
  },
];