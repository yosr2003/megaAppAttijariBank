export interface SuggestedUser {
  id: string;
  name: string;
  role: string;
  avatar: string;
  mutual: number;
  following?: boolean;
}

export const suggestedUsers: SuggestedUser[] = [
  { id: "1", name: "Nour Hamdi", role: "Wealth Manager", avatar: "https://i.pravatar.cc/150?img=12", mutual: 12 },
  { id: "2", name: "Rami Khalil", role: "DeFi Developer", avatar: "https://i.pravatar.cc/150?img=33", mutual: 7 },
  {
    id: "3",
    name: "Yasmine B.",
    role: "CFO at TechTN",
    avatar: "https://i.pravatar.cc/150?img=45",
    mutual: 21,
    following: true,
  },
  { id: "4", name: "Mehdi Trabelsi", role: "Investment Analyst", avatar: "https://i.pravatar.cc/150?img=53", mutual: 4 },
];