export interface Story {
  id: string;
  name: string;
  avatar: string;
  isYou?: boolean;
}

export const stories: Story[] = [
  { id: "you", name: "Vous", avatar: "https://i.pravatar.cc/150?img=68", isYou: true },
  { id: "1", name: "Sana B.", avatar: "https://i.pravatar.cc/150?img=32" },
  { id: "2", name: "Karim T.", avatar: "https://i.pravatar.cc/150?img=15" },
  { id: "3", name: "Lina M.", avatar: "https://i.pravatar.cc/150?img=47" },
  { id: "4", name: "Nour H.", avatar: "https://i.pravatar.cc/150?img=12" },
  { id: "5", name: "Rami K.", avatar: "https://i.pravatar.cc/150?img=33" },
];