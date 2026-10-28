export const DEFAULT_TRANSACTIONS = [
  {
    id: 1,
    title: "Client Retainer Payout",
    type: "income",
    amount: 65000,
    category: "Income",
    date: "2026-09-01",
    note: "Monthly product design & engineering contract"
  },
  {
    id: 2,
    title: "Organic Supermarket",
    type: "expense",
    amount: 3450,
    category: "Food & Dining",
    date: "2026-09-03",
    note: "Weekly groceries and pantry restocking"
  },
  {
    id: 3,
    title: "Airport Cab Drop",
    type: "expense",
    amount: 680,
    category: "Transport",
    date: "2026-09-05",
    note: "Business conference travel"
  },
  {
    id: 4,
    title: "High-Speed Fiber & Cloud",
    type: "expense",
    amount: 2199,
    category: "Bills & Utilities",
    date: "2026-09-08",
    note: "Workstation network subscription"
  },
  {
    id: 5,
    title: "Apple 4K Display Arm",
    type: "expense",
    amount: 7800,
    category: "Shopping",
    date: "2026-09-09",
    note: "Ergonomic desk gear setup"
  },
  {
    id: 6,
    title: "Freelance UI Project",
    type: "income",
    amount: 24000,
    category: "Income",
    date: "2026-09-11",
    note: "Fintech mobile app prototype milestone"
  },
  {
    id: 7,
    title: "Artisan Bistro Dinner",
    type: "expense",
    amount: 1850,
    category: "Food & Dining",
    date: "2026-09-12",
    note: "Celebration with engineering team"
  },
  {
    id: 8,
    title: "Streaming & Media Pack",
    type: "expense",
    amount: 999,
    category: "Entertainment",
    date: "2026-09-13",
    note: "Monthly creative tools & media bundle"
  },
  {
    id: 9,
    title: "Metro Smart Transit",
    type: "expense",
    amount: 850,
    category: "Transport",
    date: "2026-09-14",
    note: "Monthly contactless card refill"
  },
  {
    id: 10,
    title: "Swiggy Gourmet Feast",
    type: "expense",
    amount: 640,
    category: "Food & Dining",
    date: "2026-09-15",
    note: "Overnight sprint meal"
  }
];

export const DEFAULT_BUDGETS = {
  "Food & Dining": 9000,
  "Transport": 5000,
  "Shopping": 10000,
  "Bills & Utilities": 8000,
  "Entertainment": 5000,
  "Other": 4000
};

export function normalizeCategory(cat) {
  if (!cat) return "Other";
  const lower = cat.toLowerCase();
  if (lower.includes("food") || lower.includes("dining")) return "Food & Dining";
  if (lower.includes("transport") || lower.includes("travel")) return "Transport";
  if (lower.includes("bill") || lower.includes("utilities")) return "Bills & Utilities";
  if (lower.includes("shop")) return "Shopping";
  if (lower.includes("entertain")) return "Entertainment";
  if (lower.includes("income") || lower.includes("salary")) return "Income";
  return cat;
}

export function getCategoryIcon(cat) {
  const norm = normalizeCategory(cat);
  switch (norm) {
    case "Food & Dining": return "🍴";
    case "Transport": return "🚗";
    case "Bills & Utilities": return "⚡";
    case "Shopping": return "🛍️";
    case "Entertainment": return "🎬";
    case "Income": return "💰";
    default: return "📦";
  }
}
