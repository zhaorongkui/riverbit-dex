interface NavItem {
  label: string;
  to: string;
}

export default function useHeader() {
  const navItems: NavItem[] = [
    // { label: "Trading", to: "/trading" },
    { label: "🔥AI Arena", to: "/ai-arena" },
    { label: "Leaderboard", to: "/leaderboard" },
    // { label: "RiverPool", to: "/riverpool" },
    // { label: "Docs", to: "/docs" },
    // { label: "FAQ", to: "/faq" },
    // { label: "Earn", to: "/earn" },
    // { label: "Assets", to: "/assets" },
  ];

  const moreItems: NavItem[] = [
    // { label: "API", to: "/api" },
    // { label: "Documentation", to: "/docs" },
    // { label: "Announcement", to: "/announcement" },
  ];
  return { navItems, moreItems };
}
