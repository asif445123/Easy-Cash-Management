// Static fake data used only in Demo Mode. No writes ever reach the database
// from this mode — the API layer never even needs to be called here.

export const demoSummary = {
  balance: 184250,
  income: 320000,
  expense: 135750,
  savingsRate: 0.42,
};

export const demoTransactions = [
  { id: "d1", title: "Site Payment - Al Habib Plaza", type: "income", amount: 150000, date: "2026-07-20" },
  { id: "d2", title: "Cement & Bricks - Al Rehman Suppliers", type: "expense", amount: 42000, date: "2026-07-19" },
  { id: "d3", title: "Labour Wages - Week 29", type: "expense", amount: 38500, date: "2026-07-18" },
  { id: "d4", title: "Advance Received - New Client", type: "income", amount: 100000, date: "2026-07-15" },
  { id: "d5", title: "Steel Purchase", type: "expense", amount: 55250, date: "2026-07-12" },
  { id: "d6", title: "Consulting Fee", type: "income", amount: 70000, date: "2026-07-10" },
];

export const demoChart = [
  { month: "Feb", income: 210000, expense: 120000 },
  { month: "Mar", income: 250000, expense: 140000 },
  { month: "Apr", income: 190000, expense: 110000 },
  { month: "May", income: 280000, expense: 160000 },
  { month: "Jun", income: 300000, expense: 150000 },
  { month: "Jul", income: 320000, expense: 135750 },
];
