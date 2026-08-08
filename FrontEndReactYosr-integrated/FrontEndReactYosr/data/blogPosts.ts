import { BlogPost } from "../types/content";

export const blogPosts: BlogPost[] = [
  {
    id: "1",
    author: {
      name: "Sana Belhassen",
      handle: "@sana.invest",
      role: "Financial Analyst",
      avatar: "https://i.pravatar.cc/150?img=32",
      verified: true,
    },
    time: "2m ago",
    content:
      "Just hit my 6-month savings goal on SuperTounsi 🎉 Automated transfers + cashback rewards made it effortless. The budget insights feature really changed how I think about money. Who else is crushing their savings goals this quarter?",
    hashtags: ["#SavingMoney", "#SuperTounsi", "#FinanceFreedom"],
    image: "https://picsum.photos/seed/supertounsi-chart1/800/450",
    likes: 284,
    commentsCount: 71,
    shares: 12,
    comments: [
      {
        id: "c1",
        author: { name: "Nour Hamdi", role: "Startup Founder", avatar: "https://i.pravatar.cc/150?img=12" },
        text: "This is so inspiring! What's your secret? 👀",
        time: "1h",
      },
      {
        id: "c2",
        author: { name: "Karim Tabaibi", role: "Backend Developer", avatar: "https://i.pravatar.cc/150?img=15" },
        text: "Agreed! SuperTounsi changed my financial habits completely.",
        time: "40m",
      },
    ],
  },
  {
    id: "2",
    author: {
      name: "Karim Tabaibi",
      handle: "@karim.dev",
      role: "Backend Developer",
      avatar: "https://i.pravatar.cc/150?img=15",
      verified: true,
    },
    time: "5h",
    content:
      "The new SuperTounsi Business account is a game-changer for SMEs in Tunisia. Invoice payments, team wallets, expense management — all in one app. Finally a Tunisian fintech that matches global standards. 🚀",
    hashtags: ["#Fintech", "#Tunisia", "#Business", "#Entrepreneur"],
    image: "https://picsum.photos/seed/supertounsi-chart2/800/450",
    likes: 198,
    commentsCount: 34,
    shares: 21,
    comments: [
      {
        id: "c1",
        author: { name: "Yasmine B.", role: "CFO", avatar: "https://i.pravatar.cc/150?img=45" },
        text: "We switched last month, best decision for our team's cash flow.",
        time: "3h",
      },
    ],
  },
  {
    id: "3",
    author: {
      name: "SuperTounsi",
      handle: "@supertounsi",
      role: "Official Account",
      avatar: "https://i.pravatar.cc/150?img=68",
      verified: true,
    },
    time: "1d",
    content: "Which SuperTounsi feature do you use most? 📊",
    hashtags: ["#Poll", "#SuperTounsi"],
    poll: {
      question: "Which SuperTounsi feature do you use most?",
      options: [
        { label: "Instant Transfers", percent: 42 },
        { label: "Virtual Card", percent: 27 },
        { label: "Budget Insights", percent: 18 },
        { label: "Cashback Rewards", percent: 13 },
      ],
      totalVotes: 1284,
    },
    likes: 156,
    commentsCount: 47,
    shares: 9,
    comments: [],
  },
  {
    id: "4",
    author: {
      name: "Lisa Mansour",
      handle: "@lisa.crypto",
      role: "Crypto Analyst",
      avatar: "https://i.pravatar.cc/150?img=47",
    },
    time: "1d",
    content:
      "My 3 rules for smart investing in 2026 📈\n1. Diversify — never put all eggs in one basket\n2. Dollar-cost average into positions 💰\n3. Keep 6 months emergency fund liquid 🔒\n\nTunisia's fintech scene is exploding. Exciting times!",
    hashtags: ["#SmartInvest", "#Crypto", "#Budgeting"],
    image: "https://picsum.photos/seed/supertounsi-phone/800/450",
    likes: 342,
    commentsCount: 128,
    shares: 45,
    comments: [
      {
        id: "c1",
        author: { name: "Ahmed", role: "Trader", avatar: "https://i.pravatar.cc/150?img=5" },
        text: "Rule #3 saved me during the last dip. Solid advice 🙌",
        time: "20h",
      },
    ],
  },
  {
    id: "5",
    author: {
      name: "Nour Hamdi",
      handle: "@nour.wealth",
      role: "Startup Founder",
      avatar: "https://i.pravatar.cc/150?img=12",
    },
    time: "2d",
    content:
      "Grateful for the SuperTounsi community 🙏 Two years ago I couldn't get a business account as a freelancer. Today my whole team gets paid through the app. Small steps, big impact.",
    hashtags: ["#Community", "#Freelance", "#Growth"],
    likes: 421,
    commentsCount: 63,
    shares: 18,
    comments: [],
  },
];